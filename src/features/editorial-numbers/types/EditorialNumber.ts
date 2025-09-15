export interface EditorialNumber {
  id: string;
  number: string;
  startDate: string;
  endDate: string;
  comments?: string;
  status: "draft" | "active" | "closed";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEditorialNumberRequest {
  number: string;
  startDate: string;
  endDate: string;
  comments?: string;
}

export interface UpdateEditorialNumberRequest extends Partial<CreateEditorialNumberRequest> {
  id: string;
  status?: "draft" | "active" | "closed";
}