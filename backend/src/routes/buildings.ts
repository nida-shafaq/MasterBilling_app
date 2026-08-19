import { Hono } from 'hono'
import { prisma } from '../index'
import { z } from 'zod'

const buildingRoutes = new Hono()

// Validation schema
const buildingSchema = z.object({
  name: z.string().min(1, 'Building name is required'),
  address: z.string().min(1, 'Address is required'),
  pinCode: z.string().min(1, 'Pin Code is required'),
})

buildingRoutes.get('/', async (c) => {
  const buildings = await prisma.building.findMany({
    include: {
      _count: {
        select: { offices: true }
      }
    }
  })
  return c.json(buildings)
})

buildingRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const data = buildingSchema.parse(body)
    
    const building = await prisma.building.create({
      data
    })
    
    return c.json(building, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

export default buildingRoutes
