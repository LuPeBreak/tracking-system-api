import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { errorHandler } from './error-handler'
import { authenticateWithPassword } from './routes/auth/authenticate-with-password'
import { createAccount } from './routes/auth/create-account'
import { getProfile } from './routes/auth/get-profile'
import { createVehicle } from './routes/vehicles/create-vehicle'
import { deleteVehicle } from './routes/vehicles/delete-vehicle'
import { getVehicle } from './routes/vehicles/get-vehicle'
import { getVehicles } from './routes/vehicles/get-vehicles'
import { updateVehicle } from './routes/vehicles/update-vehicle'
import { updateVehicleGeolocation } from './routes/vehicles/update-vehicle-geolocation'
// Routes

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Tracking System',
      description: 'A simple tracking system api',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})
app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET as string,
})

app.register(fastifyCors, {
  origin: process.env.WEB_APP_URL || 'http://localhost:5173',
  credentials: true,
})

/** Routes */
// auth
app.register(createAccount)
app.register(authenticateWithPassword)
app.register(getProfile)
// vehicles
app.register(createVehicle)
app.register(deleteVehicle)
app.register(getVehicle)
app.register(getVehicles)
app.register(updateVehicle)
app.register(updateVehicleGeolocation)

app.listen({ host:'0.0.0.0', port: Number(process.env.SERVER_PORT) || 3333 }).then(() => {
  console.log('Server is Running!')
})
