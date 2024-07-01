import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

export async function createVehicle(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/vehicles',
      {
        schema: {
          tags: ['vehicles'],
          summary: 'Create a new vehicle',
          security: [
            {
              bearerAuth: [],
            },
          ],
          body: z.object({
            name: z.string(),
            licensePlate: z.string().nullish(),
          }),
          response: {
            201: z.object({
              vehicleId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const { name, licensePlate } = request.body

        const vehicle = await prisma.vehicle.create({
          data: {
            name,
            licensePlate,
            ownerId: userId,
          },
        })

        return reply.status(201).send({
          vehicleId: vehicle.id,
        })
      },
    )
}
