import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

type Variables = {
  prisma: PrismaClient
}

import { z } from 'zod'
import { calculateBilling } from '../services/billing'

const readingRoutes = new Hono<{ Variables: Variables }>()

const readingSchema = z.object({
  meterId: z.string().uuid('Invalid Meter ID'),
  previousReading: z.number().min(0),
  currentReading: z.number().min(0),
  imageUrl: z.string().optional(),
  method: z.string().optional() // MANUAL or OCR
})

readingRoutes.post('/', async (c) => {
  const prisma = c.var.prisma
  try {
    const body = await c.req.json()
    const data = readingSchema.parse(body)

    if (data.currentReading < data.previousReading) {
      return c.json({ error: 'Current reading cannot be less than previous reading' }, 400)
    }

    const unitsConsumed = data.currentReading - data.previousReading

    // Transaction for Reading and Invoice
    const result = await prisma.$transaction(async (tx) => {
      const reading = await tx.meterReading.create({
        data: {
          meterId: data.meterId,
          previousReading: data.previousReading,
          currentReading: data.currentReading,
          unitsConsumed: unitsConsumed,
          imageUrl: data.imageUrl,
          method: data.method || 'MANUAL',
        }
      })

      const billing = calculateBilling(unitsConsumed)
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 15) // 15 days from now

      const invoice = await tx.invoice.create({
        data: {
          readingId: reading.id,
          subtotal: billing.subtotal,
          taxAmount: billing.taxAmount,
          totalAmount: billing.totalAmount,
          status: 'UNPAID',
          dueDate: dueDate
        }
      })

      return { reading, invoice }
    })

    return c.json(result, 201)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

export default readingRoutes
