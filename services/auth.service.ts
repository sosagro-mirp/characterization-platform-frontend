import { apiClient } from "@/lib/apiClient";
import { useAuthStore, type AuthUser } from "@/store/useAuthStore";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    "/api/auth/login",
    payload,
    { withAuth: false },
  );
  useAuthStore.getState().setSession(response.user, response.accessToken);
  return response;
}

export function me(): Promise<AuthUser> {
  return apiClient.get<AuthUser>("/api/auth/me");
}

export function logout(): void {
  useAuthStore.getState().clear();
}
