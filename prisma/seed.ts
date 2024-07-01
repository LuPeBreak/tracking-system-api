import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  await prisma.user.deleteMany()
  await prisma.vehicle.deleteMany()

  const passwordHash = await hash('123456', 1)

  const user = await prisma.user.create({
    data: {
      name: 'Luis Felipe de Paula Costa',
      email: 'teste@teste.com',
      passwordHash,
    },
  })
  const anotherUser = await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      passwordHash,
    },
  })
  const anotherUser2 = await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      passwordHash,
    },
  })

  Array.from(Array(10).keys()).map(async () => {
    await prisma.vehicle.create({
      data: {
        name: faker.vehicle.vehicle(),
        licensePlate: faker.vehicle.vrm(),
        ownerId: faker.helpers.arrayElement([
          user.id,
          anotherUser.id,
          anotherUser2.id,
        ]),
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
      },
    })
  })
}

seed().then(() => {
  console.log('Database seeded!')
})
