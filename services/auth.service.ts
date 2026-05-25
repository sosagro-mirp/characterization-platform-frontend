import { apiClient } from "@/lib/apiClient";
import { useAuthStore, type AuthUser } from "@/store/useAuthStore";
import type { ChangePasswordRequest } from "@/app/(admin)/types";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  lastName: string;
  email: string;
  password: string;
  validationCode: string;
}

export async function register(payload: RegisterPayload): Promise<void> {
  await apiClient.post<void>("/api/auth/register", payload, { withAuth: false });
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

export async function changePassword(payload: ChangePasswordRequest): Promise<void> {
  await apiClient.post<{ message: string }>("/api/auth/change-password", payload);
  const store = useAuthStore.getState();
  if (store.user) {
    store.setSession({ ...store.user, mustChangePassword: false }, store.accessToken!);
  }
}
