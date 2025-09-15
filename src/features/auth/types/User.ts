export type UserRole = "Administrador" | "Editor" | "Asistente";

export interface User {
  id: string;
  email: string;
  password?: string;
  username: string;
  role: UserRole;
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}