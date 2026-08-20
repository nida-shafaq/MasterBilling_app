import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

type Variables = {
  prisma: PrismaClient
}

import { z } from 'zod'

const invoiceRoutes = new Hono<{ Variables: Variables }>()

const statusSchema = z.object({
  status: z.enum(['PAID', 'UNPAID'])
})

invoiceRoutes.get('/', async (c) => {
  const prisma = c.var.prisma
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      reading: {
        include: {
          meter: {
            include: {
              office: {
                include: { building: true }
              }
            }
          }
        }
      }
    }
  })
  return c.json(invoices)
})

invoiceRoutes.get('/:readingId', async (c) => {
  const prisma = c.var.prisma
  const readingId = c.req.param('readingId')
  
  const invoice = await prisma.invoice.findUnique({
    where: { readingId },
    include: {
      reading: {
        include: {
          meter: {
            include: {
              office: {
                include: { building: true }
              }
            }
          }
        }
      }
    }
  })

  if (!invoice) {
    return c.json({ error: 'Invoice not found' }, 404)
  }

  return c.json(invoice)
})

invoiceRoutes.patch('/:invoiceId/status', async (c) => {
  const prisma = c.var.prisma
  try {
    const invoiceId = c.req.param('invoiceId')
    const body = await c.req.json()
    const { status } = statusSchema.parse(body)

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status }
    })

    return c.json(updatedInvoice)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.errors }, 400)
    }
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

// Optional dashboard stats route
invoiceRoutes.get('/stats/dashboard', async (c) => {
  const prisma = c.var.prisma
  const totalInvoices = await prisma.invoice.findMany()
  const readings = await prisma.meterReading.findMany()

  const totalRevenue = totalInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0)
  const paidRevenue = totalInvoices.filter(i => i.status === 'PAID').reduce((acc, inv) => acc + inv.totalAmount, 0)
  const totalUnits = readings.reduce((acc, r) => acc + r.unitsConsumed, 0)

  return c.json({
    totalRevenue,
    paidRevenue,
    totalUnits,
    unpaidCount: totalInvoices.filter(i => i.status === 'UNPAID').length,
    paidCount: totalInvoices.filter(i => i.status === 'PAID').length
  })
})

export default invoiceRoutes
