export type ParishUpdateState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialParishUpdateState: ParishUpdateState = { status: "idle" };
