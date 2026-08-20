import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

// Routes
import buildingRoutes from './routes/buildings'
import officeRoutes from './routes/offices'
import meterRoutes from './routes/meters'
import readingRoutes from './routes/readings'
import invoiceRoutes from './routes/invoices'

type Bindings = {
  meterpulse_db: D1Database
}

type Variables = {
  prisma: PrismaClient
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Middleware
app.use('*', cors())

// Initialize Prisma per request for Cloudflare Workers
app.use('*', async (c, next) => {
  const adapter = new PrismaD1(c.env.meterpulse_db)
  const prisma = new PrismaClient({ adapter })
  c.set('prisma', prisma)
  await next()
})

app.get('/', (c) => {
  return c.text('Billing API is running!')
})

// Register Routes
app.route('/api/buildings', buildingRoutes)
app.route('/api/offices', officeRoutes)
app.route('/api/meters', meterRoutes)
app.route('/api/readings', readingRoutes)
app.route('/api/invoices', invoiceRoutes)

export default app
