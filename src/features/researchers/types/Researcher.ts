export interface Researcher {
  id: string;
  orcid: string;
  name: string;
  affiliation: string;
  academicDegree: string;
  country: string;
  email: string;
  alternativeEmail?: string;
  thematicLines: number[]; // Array de IDs de líneas temáticas
  languages?: number[] | string; // Array de IDs de idiomas o string para backward compatibility
  phones: {
    mobile?: string;
    home?: string;
    university?: string;
  };
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateResearcherRequest {
  orcid: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
  affiliation: string;
  academicDegree: string;
  country: string;
  workPlace?: string; // Lugar de trabajo
  email: string;
  alternativeEmail?: string;
  thematicLines: number[]; // Array de IDs de líneas temáticas
  languages?: number[]; // Array de IDs de idiomas
  phones: {
    mobile?: string;
    home?: string;
    university?: string;
  };
  status: "active" | "inactive";
}

export interface UpdateResearcherRequest extends Partial<CreateResearcherRequest> {
  id: string;
}

export interface ThematicLine {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}