export interface Researcher {
  id: string;
  orcid: string;
  name: string;
  affiliation: string;
  academicDegree: string;
  country: string;
  email: string;
  alternativeEmail?: string;
  thematicLines: string[];
  languages?: string;
  phones: {
    mobile?: string;
    home?: string;
    university?: string;
  };
  status: "active" | "inactive" | "pending";
  createdAt: string;
  updatedAt: string;
}

export interface CreateResearcherRequest {
  orcid: string;
  name: string;
  affiliation: string;
  academicDegree: string;
  country: string;
  email: string;
  alternativeEmail?: string;
  thematicLines: string[];
  languages?: string;
  phones: {
    mobile?: string;
    home?: string;
    university?: string;
  };
  status: "active" | "inactive" | "pending";
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