"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api, ApiError } from "@/lib/api";

const signupSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.email("Enter a valid email address").max(255),
    password: z
      .string()
      .min(12, "Use at least 12 characters")
      .max(128)
      .refine(
        (value) =>
          /[a-z]/.test(value) &&
          /[A-Z]/.test(value) &&
          /\d/.test(value) &&
          /[^A-Za-z0-9]/.test(value),
        "Include uppercase, lowercase, number and symbol",
      ),
    confirmPassword: z.string().min(1),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignupValues) {
    setServerError("");

    try {
      await api.post("/auth/signup", {
        name: values.name,
        email: values.email,
        password: values.password,
      });

      // Signup creates an account but does not log it in.
      // Continue to the login page.
      router.replace("/login?registered=1");
    } catch (error) {
      if (error instanceof ApiError) {
        for (const issue of error.errors) {
          if (
            issue.field === "name" ||
            issue.field === "email" ||
            issue.field === "password"
          ) {
            setError(issue.field, {
              message: issue.message,
            });
          }
        }

        setServerError(error.message);
      } else {
        setServerError("Unable to create your account. Please try again.");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>

        <Input
          id="name"
          autoComplete="name"
          placeholder="Your full name"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />

        {errors.name && (
          <p role="alert" className="text-sm text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email address</Label>

        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />

        {errors.email && (
          <p role="alert" className="text-sm text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>

        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />

        <p className="text-xs text-slate-500">
          Minimum 12 characters, including uppercase, lowercase, a number and a
          symbol.
        </p>

        {errors.password && (
          <p role="alert" className="text-sm text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm password</Label>

        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />

        {errors.confirmPassword && (
          <p role="alert" className="text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <UserPlus className="mr-2 size-4" />
        )}

        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-semibold text-cyan-700 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
