import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z.coerce
    .number()
    .default(5000),

  DB_HOST: z.string().min(1),

  DB_PORT: z.coerce
    .number()
    .default(3306),

  DB_USER: z.string().min(1),

  DB_PASSWORD: z.string(),

  DB_NAME: z.string().min(1),

  JWT_SECRET: z.string().min(32),

  JWT_EXPIRES_IN: z.string().default('7d'),

  CLIENT_URL: z.string().url()
})

export const env = envSchema.parse(process.env)