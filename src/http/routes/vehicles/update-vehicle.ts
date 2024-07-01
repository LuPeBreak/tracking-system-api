import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateVehicle(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/vehicles/:vehicleId',
      {
        schema: {
          tags: ['vehicles'],
          summary: 'Update vehicle details',
          security: [
            {
              bearerAuth: [],
            },
          ],
          body: z.object({
            name: z.string(),
            licensePlate: z.string().nullable(),
          }),
          params: z.object({
            vehicleId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { vehicleId } = request.params
        const userId = await request.getCurrentUserId()

        const vehicle = await prisma.vehicle.findUnique({
          where: { id: vehicleId },
        })

        if (!vehicle) {
          throw new BadRequestError('Vehicle not Found!')
        }

        if (vehicle.ownerId !== userId) {
          throw new UnauthorizedError(
            `You're not allowed to update this vehicle.`,
          )
        }

        const { licensePlate, name } = request.body

        await prisma.vehicle.update({
          where: {
            id: vehicleId,
          },
          data: {
            name,
            licensePlate,
          },
        })

        return reply.status(204).send()
      },
    )
}
