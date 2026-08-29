export type StaffRegistrationState = {
  status: "idle" | "error";
  errors: Record<string, string>;
  values: Record<string, string>;
};

export const initialStaffRegistrationState: StaffRegistrationState = {
  status: "idle",
  errors: {},
  values: {},
};
