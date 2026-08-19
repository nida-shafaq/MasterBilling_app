import { Hono } from 'hono'
import { prisma } from '../index'
import { z } from 'zod'

const meterRoutes = new Hono()

const meterSchema = z.object({
  officeId: z.string().uuid('Invalid Office ID'),
  meterSerialId: z.string().min(1, 'Meter Serial ID is required'),
  meterType: z.string().optional(),
})

meterRoutes.get('/:officeId/latest-reading', async (c) => {
  const officeId = c.req.param('officeId')
  
  const meter = await prisma.meter.findFirst({
    where: { officeId },
    include: {
      readings: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })

  if (!meter) {
    return c.json({ error: 'Meter not found for this office' }, 404)
  }

  const latestReading = meter.readings.length > 0 ? meter.readings[0] : null
  
  return c.json({
    meterId: meter.id,
    meterSerialId: meter.meterSerialId,
    latestReading
  })
})

meterRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const data = meterSchema.parse(body)
    
    const meter = await prisma.meter.create({
      data
    })
    
    return c.json(meter, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

meterRoutes.get('/', async (c) => {
  const meters = await prisma.meter.findMany({
    include: {
      office: {
        include: { building: true }
      }
    }
  })
  return c.json(meters)
})

meterRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await prisma.meter.delete({ where: { id } })
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to delete meter' }, 500)
  }
})

export default meterRoutes
