import { AppError } from "../../lib/app-error.js";

export interface NormalizedRepository {
  repositoryUrl: string;
  repositoryKey: string;
}

const githubSegment = /^[a-zA-Z0-9_.-]+$/;

export function normalizeGitHubRepository(input: string): NormalizedRepository {
  let url: URL;

  try {
    url = new URL(input.trim());
  } catch {
    throw new AppError(422, "Invalid GitHub repository URL");
  }

  if (
    url.protocol !== "https:" ||
    url.hostname.toLowerCase() !== "github.com" ||
    url.username ||
    url.password ||
    url.port ||
    url.search ||
    url.hash
  ) {
    throw new AppError(422, "Repository must be a direct HTTPS github.com URL");
  }

  const path = url.pathname.replace(/\/+$/, "");
  const segments = path.split("/").filter(Boolean);

  if (segments.length !== 2) {
    throw new AppError(
      422,
      "Repository URL must contain an owner and repository name",
    );
  }

  const owner = segments[0];
  const rawRepo = segments[1];

  if (!owner || !rawRepo) {
    throw new AppError(422, "Invalid GitHub repository path");
  }

  const repo = rawRepo.replace(/\.git$/i, "");

  if (
    !githubSegment.test(owner) ||
    !githubSegment.test(repo) ||
    owner.length > 39 ||
    repo.length > 100 ||
    repo.startsWith(".") ||
    repo.endsWith(".")
  ) {
    throw new AppError(422, "Invalid GitHub owner or repository name");
  }

  const canonicalOwner = owner.toLowerCase();
  const canonicalRepo = repo.toLowerCase();

  return {
    repositoryUrl: `https://github.com/${canonicalOwner}/${canonicalRepo}`,
    repositoryKey: `${canonicalOwner}/${canonicalRepo}`,
  };
}
