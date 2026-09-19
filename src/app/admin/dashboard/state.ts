export type SendReportState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialSendReportState: SendReportState = { status: "idle" };

export type ParishUpdateLinkState = {
  status: "idle" | "success" | "error";
  message?: string;
  token?: string;
};

export const initialParishUpdateLinkState: ParishUpdateLinkState = { status: "idle" };
