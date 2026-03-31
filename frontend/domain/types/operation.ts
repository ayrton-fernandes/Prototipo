export interface OperationDomainReference {
  id: number;
  descName: string;
  codeName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OperationUserReference {
  id: number;
  name: string;
  email: string;
  profileCodes: string[];
  active: boolean;
}

export interface OperationResponse {
  id: number;
  name: string;
  operationCode: string;
  description: string | null;
  active: boolean;
  department: OperationDomainReference | null;
  delegate: OperationDomainReference | null;
  directorate: OperationDomainReference | null;
  station: OperationDomainReference | null;
  court: OperationDomainReference | null;
  analystIntelligence: OperationUserReference | null;
  investigator: OperationUserReference | null;
}

export interface OperationPayload {
  descName: string;
  description: string;
  departmentId: number | null;
  delegateId: number | null;
  directorateId: number | null;
  stationId: number | null;
  courtId: number | null;
  analystIntelligenceId: number | null;
  investigatorId: number | null;
}