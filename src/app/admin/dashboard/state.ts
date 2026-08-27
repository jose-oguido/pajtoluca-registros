export type SendReportState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialSendReportState: SendReportState = { status: "idle" };
