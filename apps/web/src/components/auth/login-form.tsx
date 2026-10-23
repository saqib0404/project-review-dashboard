"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api, ApiError } from "@/lib/api";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: "STUDENT" | "MENTOR" | "ADMIN";
  };
}

export function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    setServerError("");

    try {
      const result = await api.post<LoginResponse>("/auth/login", values);

      const destination =
        result.user.role === "STUDENT" ? "/student" : "/mentor";

      router.replace(destination);
      router.refresh();
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Unable to sign in. Please try again.",
      );
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
        <Label htmlFor="email">Email address</Label>

        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />

        {errors.email && (
          <p id="email-error" className="text-sm text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
        </div>

        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            className="pr-12"
            {...register("password")}
          />

          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-900"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>

        {errors.password && (
          <p id="password-error" className="text-sm text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <LogIn className="mr-2 size-4" />
        )}

        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        New student?{" "}
        <Link
          href="/signup"
          className="font-semibold text-cyan-700 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
