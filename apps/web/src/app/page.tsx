import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Student Submissions",
    description: "Submit projects, track review status, and manage feedback.",
  },
  {
    title: "Mentor Dashboard",
    description: "Review projects, make decisions, and monitor submissions.",
  },
  {
    title: "Secure Access",
    description: "Role-based authentication and protected workflows.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Project<span className="text-cyan-400">Flow</span>
          </Link>

          <nav aria-label="Main navigation" className="flex items-center gap-3">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-white hover:bg-slate-800 hover:text-white",
              )}
            >
              Sign in
            </Link>

            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: "default" }),
                "bg-cyan-500 text-slate-950 hover:bg-cyan-400",
              )}
            >
              Get started
            </Link>
          </nav>
        </header>

        <section className="py-24 text-center">
          <div className="mb-6 inline-block rounded-full bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
            Project Submission & Review Platform
          </div>

          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            From project submission
            <span className="block text-cyan-400">to meaningful feedback.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            A centralized platform for students to submit projects and mentors
            to review their work with clarity and confidence.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-cyan-500 text-slate-950 hover:bg-cyan-400",
              )}
            >
              Submit your project
            </Link>

            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-slate-700 bg-transparent text-white hover:bg-slate-800 hover:text-white",
              )}
            >
              Sign in
            </Link>
          </div>
        </section>

        <section className="grid gap-6 pb-20 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-8"
            >
              <h2 className="mb-3 text-xl font-semibold">{feature.title}</h2>

              <p className="leading-7 text-slate-400">{feature.description}</p>
            </article>
          ))}
        </section>

        <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
          ProjectFlow — Built with Next.js, Express, TypeScript, and PostgreSQL.
        </footer>
      </div>
    </main>
  );
}
