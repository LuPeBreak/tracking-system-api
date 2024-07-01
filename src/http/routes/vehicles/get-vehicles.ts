import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function getVehicles(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/vehicles',
      {
        schema: {
          tags: ['vehicles'],
          summary: 'Get vehicles from an organization',
          security: [
            {
              bearerAuth: [],
            },
          ],
          response: {
            200: z.object({
              vehicles: z.array(
                z.object({
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
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        await request.getCurrentUserId()

        const vehicles = await prisma.vehicle.findMany({
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
          orderBy: {
            createdAt: 'desc',
          },
        })

        if (!vehicles) {
          throw new BadRequestError('Vehicle not found.')
        }

        return reply.send({ vehicles })
      },
    )
}
