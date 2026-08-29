export type AccessSettingsState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialAccessSettingsState: AccessSettingsState = { status: "idle" };
