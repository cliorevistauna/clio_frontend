export interface EditorialNumber {
  id: number;
  numero: number;
  anio: number;
  fecha_inicio: string | null;
  fecha_final: string | null;
  comentarios: string;
  estado: "activo" | "inactivo";
}

export interface CreateEditorialNumberRequest {
  numero: number;
  anio: number;
  fecha_inicio: string;
  fecha_final: string;
  comentarios?: string;
}

export interface UpdateEditorialNumberRequest extends Partial<CreateEditorialNumberRequest> {
  id: number;
  estado?: "activo" | "inactivo";
}