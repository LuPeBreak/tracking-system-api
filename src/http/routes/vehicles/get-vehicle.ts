import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function getVehicle(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/vehicles/:vehicleId',
      {
        schema: {
          tags: ['vehicles'],
          summary: 'Get vehicle details',
          security: [
            {
              bearerAuth: [],
            },
          ],
          params: z.object({
            vehicleId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              vehicle: z.object({
                id: z.string().uuid(),
                name: z.string(),
                licensePlate: z.string().nullable(),
                ownerId: z.string().uuid(),
                latitude: z.any().nullable(),
                longitude: z.any().nullable(),
                updatedAt: z.date(),
                owner: z.object({
                  id: z.string().uuid(),
                  name: z.string().nullable(),
                }),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { vehicleId } = request.params

        const vehicle = await prisma.vehicle.findUnique({
          where: {
            id: vehicleId,
          },
          select: {
            id: true,
            name: true,
            licensePlate: true,
            ownerId: true,
            latitude: true,
            longitude: true,
            updatedAt: true,
            owner: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        })

        if (!vehicle) {
          throw new BadRequestError('Vehicle not found.')
        }

        return reply.send({ vehicle })
      },
    )
}
