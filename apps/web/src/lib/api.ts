export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiErrorDetail[];
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_BASE = "/api/v1";

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "X-ProjectFlow-Request": "web",
      },
      cache: "no-store",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function sendRequest<T>(
  path: string,
  options: RequestInit = {},
  allowRetry = true,
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();

  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers.set("X-ProjectFlow-Request", "web");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      method,
      headers,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      0,
      "Unable to connect to the server. Check your connection.",
    );
  }

  if (response.status === 401 && allowRetry && !path.startsWith("/auth/")) {
    const restored = await refreshSession();

    if (restored) {
      return sendRequest<T>(path, options, false);
    }
  }

  const payload = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.message ?? "Something went wrong.",
      payload?.errors ?? [],
    );
  }

  if (!payload?.success || payload.data === undefined) {
    throw new ApiError(response.status, "Unexpected API response.");
  }

  return payload.data;
}

export const api = {
  get: <T>(path: string) => sendRequest<T>(path),

  post: <T>(path: string, body?: unknown) =>
    sendRequest<T>(path, {
      method: "POST",
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),

  patch: <T>(path: string, body: unknown) =>
    sendRequest<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};
