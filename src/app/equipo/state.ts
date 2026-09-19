export type CoordinatorAccessState = {
  status: "idle" | "error";
  message?: string;
};

export const initialCoordinatorAccessState: CoordinatorAccessState = { status: "idle" };

export type CoordinatorRegistration = {
  ticketId: string;
  fullName: string;
  age: number;
  registrationType: string;
  parish: string | null;
  decanato: string | null;
  phone: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
};

export type ScannerLookupState = {
  status: "idle" | "success" | "error";
  message?: string;
  registration?: CoordinatorRegistration;
};

export const initialScannerLookupState: ScannerLookupState = { status: "idle" };
