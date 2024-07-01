import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateVehicleGeolocation(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/vehicles/:vehicleId',
      {
        schema: {
          tags: ['vehicles'],
          summary: 'Update vehicle geolocation',
          security: [
            {
              bearerAuth: [],
            },
          ],
          body: z.object({
            latitude: z.number(),
            longitude: z.number(),
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

        const { latitude, longitude } = request.body

        await prisma.vehicle.update({
          where: {
            id: vehicleId,
          },
          data: {
            latitude,
            longitude,
          },
        })

        return reply.status(204).send()
      },
    )
}
