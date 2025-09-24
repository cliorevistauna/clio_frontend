export type UserRole = "Administrador" | "Editor" | "Asistente";
export type UserStatus = "habilitado" | "deshabilitado" | "pendiente";

export interface Role {
  id: number;
  nombre: string;
}

export interface User {
  id: number;
  email: string;
  correo: string;
  password?: string;
  password_confirm?: string;
  nombre: string;
  rol: Role | number; // Can be Role object or just ID
  rol_info?: Role; // Additional role info from user endpoint
  estado: UserStatus;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: Omit<User, 'password'>;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}