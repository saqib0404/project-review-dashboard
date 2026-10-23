import { describe, expect, it } from "vitest";
import { projectSubmissionSchema } from "@project/contracts";
import { normalizeGitHubRepository } from "../src/modules/projects/project.repository-url.js";
const validProject = {
    name: "ProjectFlow Dashboard",
    repositoryUrl: "https://github.com/example/projectflow-dashboard",
    liveUrl: "https://projectflow.example.com",
    description: "A full-stack student project submission and review dashboard.",
};
describe("Project submission validation", () => {
    it("accepts a valid project", () => {
        const result = projectSubmissionSchema.safeParse(validProject);
        expect(result.success).toBe(true);
    });
    it("rejects an empty project name", () => {
        const result = projectSubmissionSchema.safeParse({
            ...validProject,
            name: "",
        });
        expect(result.success).toBe(false);
    });
    it("rejects short descriptions", () => {
        const result = projectSubmissionSchema.safeParse({
            ...validProject,
            description: "Too short",
        });
        expect(result.success).toBe(false);
    });
    it("rejects non-HTTPS URLs", () => {
        const result = projectSubmissionSchema.safeParse({
            ...validProject,
            liveUrl: "http://example.com",
        });
        expect(result.success).toBe(false);
    });
    it("allows an optional live link", () => {
        const result = projectSubmissionSchema.safeParse({
            ...validProject,
            liveUrl: "",
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.liveUrl).toBeNull();
        }
    });
    it("rejects student-provided status", () => {
        const result = projectSubmissionSchema.safeParse({
            ...validProject,
            status: "APPROVED",
        });
        expect(result.success).toBe(false);
    });
    it("rejects student-provided owner ID", () => {
        const result = projectSubmissionSchema.safeParse({
            ...validProject,
            studentId: "another-user-id",
        });
        expect(result.success).toBe(false);
    });
});
describe("GitHub repository normalization", () => {
    it("normalizes repository case and trailing slash", () => {
        const result = normalizeGitHubRepository("https://github.com/Example/MyProject/");
        expect(result.repositoryKey).toBe("example/myproject");
        expect(result.repositoryUrl).toBe("https://github.com/example/myproject");
    });
    it("removes the .git suffix", () => {
        const first = normalizeGitHubRepository("https://github.com/Example/MyProject.git");
        const second = normalizeGitHubRepository("https://github.com/example/myproject");
        expect(first.repositoryKey).toBe(second.repositoryKey);
    });
    it("rejects non-GitHub repositories", () => {
        expect(() => normalizeGitHubRepository("https://gitlab.com/example/project")).toThrow();
    });
    it("rejects GitHub subdirectories", () => {
        expect(() => normalizeGitHubRepository("https://github.com/example/project/tree/main")).toThrow();
    });
    it("rejects misleading GitHub hostnames", () => {
        expect(() => normalizeGitHubRepository("https://github.com.evil.example/user/repo")).toThrow();
    });
    it("rejects URL query strings", () => {
        expect(() => normalizeGitHubRepository("https://github.com/example/project?test=1")).toThrow();
    });
});
