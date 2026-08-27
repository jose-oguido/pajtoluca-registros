export type RegistrationState = {
  status: "idle" | "error";
  errors: Record<string, string>;
  values: Record<string, string>;
};

export const initialRegistrationState: RegistrationState = {
  status: "idle",
  errors: {},
  values: {},
};
