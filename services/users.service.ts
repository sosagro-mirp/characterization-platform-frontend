import { apiClient } from "@/lib/apiClient";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserDetail,
  UserListItem,
} from "@/app/(admin)/types";

export function listUsers(): Promise<UserListItem[]> {
  return apiClient.get<UserListItem[]>("/api/users", { cache: "no-store" });
}

export function getUser(userId: string): Promise<UserDetail> {
  return apiClient.get<UserDetail>(`/api/users/${userId}`, {
    cache: "no-store",
  });
}

export function createUser(data: CreateUserRequest): Promise<UserDetail> {
  return apiClient.post<UserDetail>("/api/users", data);
}

export function updateUser(
  userId: string,
  data: UpdateUserRequest,
): Promise<UserDetail> {
  return apiClient.patch<UserDetail>(`/api/users/${userId}`, data);
}

export function deleteUser(userId: string): Promise<void> {
  return apiClient.delete<void>(`/api/users/${userId}`);
}
