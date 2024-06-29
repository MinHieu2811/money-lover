import { z } from 'zod'

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'outcome', 'debt']),
  category: z.string().nonempty(),
  amount: z.string().min(1, {
    message: 'Amount must be at least 1,000 VND',
  }),
  date: z.date({
    required_error: 'Date is required',
    message: 'Invalid date',
  }),
  note: z.string()
})