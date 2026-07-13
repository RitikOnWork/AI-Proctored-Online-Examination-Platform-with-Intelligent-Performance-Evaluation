import { api } from "./api";

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "examiner" | "student";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreateInput {
  email: string;
  full_name: string;
  role: "admin" | "examiner" | "student";
  password: string;
  is_active?: boolean;
}

export interface UserUpdateInput {
  email?: string;
  full_name?: string;
  role?: "admin" | "examiner" | "student";
  password?: string;
  is_active?: boolean;
}

export const userService = {
  getUsers: async (params?: { search?: string; role?: string; limit?: number; skip?: number }): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>("/users", { params });
    return response.data;
  },

  getUser: async (userId: string): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`/users/${userId}`);
    return response.data;
  },

  createUser: async (data: UserCreateInput): Promise<UserResponse> => {
    const response = await api.post<UserResponse>("/users", data);
    return response.data;
  },

  updateUser: async (userId: string, data: UserUpdateInput): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<UserResponse> => {
    const response = await api.delete<UserResponse>(`/users/${userId}`);
    return response.data;
  },
};
export default userService;
