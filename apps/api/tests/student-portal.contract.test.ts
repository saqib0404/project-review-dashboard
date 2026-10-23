import { describe, expect, it } from "vitest";

import { projectSubmissionSchema } from "@project/contracts";

import { normalizeGitHubRepository } from "../src/modules/projects/project.repository-url.js";

const validInput = {
  name: "Student Portfolio Project",
  repositoryUrl: "https://github.com/example/student-portfolio",
  liveUrl: "",
  description:
    "A responsive full-stack student portfolio built with TypeScript and Next.js.",
};

describe("Student portal submission contract", () => {
  it("accepts a valid submission", () => {
    const result = projectSubmissionSchema.safeParse(validInput);

    expect(result.success).toBe(true);
  });

  it("transforms an empty live URL into null", () => {
    const result = projectSubmissionSchema.parse(validInput);

    expect(result.liveUrl).toBeNull();
  });

  it("preserves a valid live URL", () => {
    const result = projectSubmissionSchema.parse({
      ...validInput,
      liveUrl: "https://portfolio.example.com",
    });

    expect(result.liveUrl).toBe("https://portfolio.example.com");
  });

  it("rejects an invalid project name", () => {
    const result = projectSubmissionSchema.safeParse({
      ...validInput,
      name: "A",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a short description", () => {
    const result = projectSubmissionSchema.safeParse({
      ...validInput,
      description: "Short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects HTTP repository URLs", () => {
    const result = projectSubmissionSchema.safeParse({
      ...validInput,
      repositoryUrl: "http://github.com/example/student-portfolio",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes GitHub repository variants", () => {
    const first = normalizeGitHubRepository(
      "https://github.com/Example/Student-Portfolio.git",
    );

    const second = normalizeGitHubRepository(
      "https://github.com/example/student-portfolio/",
    );

    expect(first.repositoryKey).toBe(second.repositoryKey);
  });

  it("rejects extra fields such as status", () => {
    const result = projectSubmissionSchema.safeParse({
      ...validInput,
      status: "APPROVED",
    });

    expect(result.success).toBe(false);
  });

  it("rejects client-supplied student IDs", () => {
    const result = projectSubmissionSchema.safeParse({
      ...validInput,
      studentId: "another-user",
    });

    expect(result.success).toBe(false);
  });
});
