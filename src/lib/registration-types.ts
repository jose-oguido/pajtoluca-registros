export type RegistrationType = "attendee" | "staff" | "ministro_extraordinario" | "sacerdote";

export type StaffRegistrationType = Exclude<RegistrationType, "attendee" | "sacerdote">;

export const STAFF_REGISTRATION_TYPES = ["staff", "ministro_extraordinario"] as const;

export function isStaffRegistrationType(value: string): value is StaffRegistrationType {
  return STAFF_REGISTRATION_TYPES.includes(value as StaffRegistrationType);
}

// Human-facing name for each staff area, used in the admin dashboard.
export const STAFF_AREA_LABELS: Record<StaffRegistrationType, string> = {
  staff: "Staff general",
  ministro_extraordinario: "Ministro extraordinario",
};

const TICKET_TYPE_LABELS: Record<Exclude<RegistrationType, "attendee">, string> = {
  staff: "STAFF",
  ministro_extraordinario: "MINISTROS",
  sacerdote: "SACERDOTE",
};

// What the boleto shows. Attendees don't have their own type in the
// database — their label is derived from age instead.
export function getTicketTypeLabel(registrationType: string, age: number): string {
  if (registrationType === "attendee") {
    return age <= 17 ? "ADOLESCENTE" : "JOVEN";
  }
  return TICKET_TYPE_LABELS[registrationType as Exclude<RegistrationType, "attendee">] ?? registrationType.toUpperCase();
}

// Solid (non-gradient) header color for the boleto, so the ticket is
// visually distinguishable by type at a glance without blending colors.
const TICKET_HEADER_COLORS: Record<RegistrationType, string> = {
  attendee: "bg-secondary text-secondary-contrast",
  staff: "bg-accent text-accent-contrast",
  ministro_extraordinario: "bg-gold text-secondary-contrast",
  sacerdote: "bg-secondary-dark text-secondary-contrast",
};

export function getTicketHeaderColor(registrationType: string): string {
  return TICKET_HEADER_COLORS[registrationType as RegistrationType] ?? TICKET_HEADER_COLORS.attendee;
}
