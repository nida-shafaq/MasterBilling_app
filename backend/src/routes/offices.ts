import { Hono } from 'hono'
import { prisma } from '../index'
import { z } from 'zod'

const officeRoutes = new Hono()

// Validation schema
const officeSchema = z.object({
  buildingId: z.string().uuid('Invalid Building ID'),
  officeNumber: z.string().min(1, 'Office number is required'),
  tenantName: z.string().optional(),
  contactNo: z.string().optional(),
})

officeRoutes.get('/building/:buildingId', async (c) => {
  const buildingId = c.req.param('buildingId')
  const offices = await prisma.office.findMany({
    where: { buildingId },
    include: {
      meters: true
    }
  })
  return c.json(offices)
})

officeRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const data = officeSchema.parse(body)
    
    const office = await prisma.office.create({
      data
    })
    
    return c.json(office, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

export default officeRoutes
