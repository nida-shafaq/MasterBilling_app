import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { PrismaClient } from '@prisma/client'

// Routes
import buildingRoutes from './routes/buildings'
import officeRoutes from './routes/offices'
import meterRoutes from './routes/meters'
import readingRoutes from './routes/readings'
import invoiceRoutes from './routes/invoices'

const app = new Hono()

// Middleware
app.use('*', cors())

// Prisma Client instance
export const prisma = new PrismaClient()

app.get('/', (c) => {
  return c.text('Billing API is running!')
})

// Register Routes
app.route('/api/buildings', buildingRoutes)
app.route('/api/offices', officeRoutes)
app.route('/api/meters', meterRoutes)
app.route('/api/readings', readingRoutes)
app.route('/api/invoices', invoiceRoutes)

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
