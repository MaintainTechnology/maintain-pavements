// Turns the trial-area form into an email to Jon. Pure functions, so lib/enquiry.check.ts can run them.

export type Enquiry = {
  name: string;
  company?: string;
  phone?: string;
  location?: string;
  area?: string;
  size?: string;
  issues?: string[];
  message?: string;
};

/** Names the problem and the fix (DESIGN.md › Inputs). Null means the value is fine. */
export function fieldError(field: string, raw: string): string | null {
  const value = raw.trim();
  switch (field) {
    case "name":
      return value ? null : "Enter your name so Jon knows who to reply to.";
    case "phone":
      return !value || value.replace(/\D/g, "").length >= 8 ? null : "Enter a phone number with at least 8 digits, or leave it blank.";
    case "size": {
      const n = Number(value.replace(/[,\s]/g, ""));
      return !value || (Number.isFinite(n) && n > 0) ? null : "Enter the area in square metres, for example 2400.";
    }
    default:
      return null;
  }
}

export function composeEnquiry(to: string, e: Enquiry) {
  const company = e.company?.trim();
  const subject = company ? `Trial area enquiry: ${company}` : "Trial area enquiry";
  const fields: [string, string | undefined][] = [
    ["Name", e.name],
    ["Company", company],
    ["Phone", e.phone],
    ["Site location", e.location],
    ["Yard area", e.area],
    ["Approximate area", e.size?.trim() && `${e.size.trim()} m²`],
    ["What is happening now", e.issues?.join(", ")],
  ];
  const lines = fields.filter(([, v]) => v?.trim()).map(([k, v]) => `${k}: ${v!.trim()}`);
  const message = e.message?.trim();
  const body = (message ? [...lines, "", message] : lines).join("\r\n");
  return { subject, body, href: `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
}
