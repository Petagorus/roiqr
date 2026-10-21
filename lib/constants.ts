/**
 * QR code content types the generator supports.
 * Each type has a label, placeholder guidance, and default options.
 */
export type QrType =
  | "url"
  | "text"
  | "json"
  | "promptpay"
  | "email"
  | "phone"
  | "sms"
  | "wifi"
  | "vcard"
  | "geo"
  | "event";

export interface QrTypeOption {
  value: QrType;
  label: string;
  description: string;
  /** Whether this type supports a batch (multiple rows). */
  batchable: boolean;
}

export const QR_TYPE_OPTIONS: QrTypeOption[] = [
  {
    value: "url",
    label: "URL",
    description: "A website link. Opens in any browser when scanned.",
    batchable: true,
  },
  {
    value: "text",
    label: "Text",
    description: "Plain text shown to the scanner. Great for notes or codes.",
    batchable: true,
  },
  {
    value: "json",
    label: "JSON",
    description: "Raw JSON object for custom scanner apps. Validated and minified.",
    batchable: true,
  },
  {
    value: "promptpay",
    label: "PromptPay",
    description: "Thai payment QR to a mobile number or national ID, with an optional amount.",
    batchable: true,
  },
  {
    value: "email",
    label: "Email",
    description: "Pre-filled email address with optional subject and body.",
    batchable: true,
  },
  {
    value: "phone",
    label: "Phone",
    description: "A phone number. Dials on tap from a mobile camera.",
    batchable: true,
  },
  {
    value: "sms",
    label: "SMS",
    description: "A text message to a number with optional pre-filled body.",
    batchable: true,
  },
  {
    value: "wifi",
    label: "Wi-Fi",
    description: "Connect devices to a network automatically on scan.",
    batchable: true,
  },
  {
    value: "vcard",
    label: "Contact (vCard)",
    description: "Save a person's name, phone and email to contacts.",
    batchable: true,
  },
  {
    value: "geo",
    label: "Location",
    description: "GPS coordinates that open in a maps app.",
    batchable: true,
  },
  {
    value: "event",
    label: "Calendar Event",
    description: "An event with title, start, end and location for the calendar.",
    batchable: true,
  },
];

export const QR_TYPE_MAP: Record<QrType, QrTypeOption> = QR_TYPE_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option;
    return acc;
  },
  {} as Record<QrType, QrTypeOption>,
);
