export interface Language {
  id: number;
  nombre: string;
  estado: "activo" | "inactivo";
}

export interface CreateLanguageRequest {
  nombre: string;
}

export interface UpdateLanguageRequest {
  nombre: string;
}
