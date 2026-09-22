import { z } from 'zod'

export const createPaymentSchema =
  z.object({
    leaseId: z.coerce
      .number()
      .int()
      .positive(),

    amount: z.coerce
      .number()
      .positive(),

    currency: z
      .string()
      .length(3)
      .default('NGN'),

    paymentMethod: z.enum([
      'BANK_TRANSFER',
      'CARD',
      'CASH',
      'DIRECT_DEBIT',
      'ONLINE'
    ]),

    description: z
      .string()
      .max(255)
      .optional()
  })

export const autoPaySchema =
  z.object({
    enabled: z.boolean()
  })