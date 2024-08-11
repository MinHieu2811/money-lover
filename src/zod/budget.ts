import { z } from 'zod'

export const createBudgetSchema = z.object({
  category: z.string().nonempty(),
  amount: z.string().min(1, {
    message: 'Amount must be at least 1,000 VND',
  }),
})