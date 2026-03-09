/**
 * Application constants
 */

export const TICKET_CATEGORIES = [
  "Hardware Issue",
  "Software Issue",
  "Network Issue",
  "Access Request",
  "Email Issue",
  "Printer Issue",
  "Account Issue",
  "Security Concern",
  "Other",
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

