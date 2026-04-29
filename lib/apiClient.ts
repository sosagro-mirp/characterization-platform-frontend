import { useAuthStore } from "@/store/useAuthStore";

const DEFAULT_BASE_URL = "http://localhost:3000";

export interface ApiClientOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Token explícito (útil en Server Components que ya tienen sesión por cookie/header). */
  accessToken?: string | null;
  /** Si es false, no se intentará inyectar el JWT del store. */
  withAuth?: boolean;
  /** Si es true, no se intenta parsear la respuesta como JSON. */
  raw?: boolean;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function resolveBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;
}

function resolveToken(options: ApiClientOptions): string | null {
  if (options.withAuth === false) return null;
  if (options.accessToken !== undefined) return options.accessToken;
  if (typeof window === "undefined") return null;
  return useAuthStore.getState().accessToken;
}

function handleUnauthorized(): void {
  if (typeof window === "undefined") return;
  useAuthStore.getState().clear();
  if (window.location.pathname !== "/login") {
    const redirect = encodeURIComponent(
      window.location.pathname + window.location.search,
    );
    window.location.href = `/login?from=${redirect}`;
  }
}

async function parseError(response: Response): Promise<{
  message: string;
  body: unknown;
}> {
  const text = await response.text();
  let body: unknown = text;
  let message = response.statusText || `HTTP ${response.status}`;
  if (text) {
    try {
      body = JSON.parse(text);
      const maybeMessage = (body as { message?: unknown })?.message;
      if (typeof maybeMessage === "string") {
        message = maybeMessage;
      } else if (Array.isArray(maybeMessage) && maybeMessage.length > 0) {
        message = String(maybeMessage[0]);
      }
    } catch {
      /* keep raw text */
    }
  }
  return { message, body };
}

export async function apiClient<T = unknown>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { body, withAuth: _withAuth, accessToken: _accessToken, raw, headers, ...rest } =
    options;

  const finalHeaders = new Headers(headers);
  const token = resolveToken(options);
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);

  let payload: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (
      typeof body === "string" ||
      body instanceof FormData ||
      body instanceof Blob ||
      body instanceof ArrayBuffer
    ) {
      payload = body as BodyInit;
    } else {
      payload = JSON.stringify(body);
      if (!finalHeaders.has("Content-Type")) {
        finalHeaders.set("Content-Type", "application/json");
      }
    }
  }

  const response = await fetch(`${resolveBase()}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: payload,
  });

  if (response.status === 401) {
    handleUnauthorized();
    const { message, body: errBody } = await parseError(response);
    throw new ApiError(401, message, errBody);
  }

  if (!response.ok) {
    const { message, body: errBody } = await parseError(response);
    throw new ApiError(response.status, message, errBody);
  }

  if (response.status === 204 || raw) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

apiClient.get = <T = unknown>(path: string, options?: ApiClientOptions) =>
  apiClient<T>(path, { ...options, method: "GET" });

apiClient.post = <T = unknown>(
  path: string,
  body?: unknown,
  options?: ApiClientOptions,
) => apiClient<T>(path, { ...options, method: "POST", body });

apiClient.patch = <T = unknown>(
  path: string,
  body?: unknown,
  options?: ApiClientOptions,
) => apiClient<T>(path, { ...options, method: "PATCH", body });

apiClient.put = <T = unknown>(
  path: string,
  body?: unknown,
  options?: ApiClientOptions,
) => apiClient<T>(path, { ...options, method: "PUT", body });

apiClient.delete = <T = unknown>(path: string, options?: ApiClientOptions) =>
  apiClient<T>(path, { ...options, method: "DELETE" });
