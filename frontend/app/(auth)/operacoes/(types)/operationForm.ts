export interface OperationFormState {
  name: string;
  description: string;
  departmentId: number | null;
  delegateId: number | null;
  directorateId: number | null;
  stationId: number | null;
  courtId: number | null;
  analystIntelligenceId: number | null;
  investigatorId: number | null;
}

export interface OperationFormErrors {
  name?: string;
  description?: string;
  departmentId?: string;
  delegateId?: string;
  directorateId?: string;
  stationId?: string;
  courtId?: string;
  analystIntelligenceId?: string;
  investigatorId?: string;
}

export interface OperationDropdownOption {
  label: string;
  value: number;
}

export interface OperationOptionGroups {
  departments: OperationDropdownOption[];
  delegates: OperationDropdownOption[];
  directorates: OperationDropdownOption[];
  stations: OperationDropdownOption[];
  courts: OperationDropdownOption[];
  analystUsers: OperationDropdownOption[];
  investigatorUsers: OperationDropdownOption[];
}

export const emptyOperationFormState = (): OperationFormState => ({
  name: "",
  description: "",
  departmentId: null,
  delegateId: null,
  directorateId: null,
  stationId: null,
  courtId: null,
  analystIntelligenceId: null,
  investigatorId: null,
});