import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().trim().min(2).max(100),

    email: z
      .email()
      .max(255)
      .transform((value) => value.toLowerCase()),

    password: z
      .string()
      .min(12)
      .max(128)
      .refine(
        (value) =>
          /[a-z]/.test(value) &&
          /[A-Z]/.test(value) &&
          /\d/.test(value) &&
          /[^A-Za-z0-9]/.test(value),
        {
          message:
            "Password must contain uppercase, lowercase, number and special character.",
        },
      ),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.email().transform((value) => value.toLowerCase()),
    password: z.string().min(1).max(128),
  })
  .strict();

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
