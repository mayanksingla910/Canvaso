import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.string().default("8080"),
  REDIS_URL: z.string(),
  DATABASE_URL: z.string(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const env = EnvSchema.parse(process.env);