"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { areas, contact, enquiryIssues } from "@/content/site";
import { composeEnquiry, fieldError } from "@/lib/enquiry";

// ponytail: no backend or email provider exists yet, so the form writes the email and the visitor's
// own mail app sends it. Swap the mailto for a Server Action when a provider (e.g. Resend) is chosen.
type Checked = "name" | "phone" | "size";
const CHECKED: Checked[] = ["name", "phone", "size"];

export function ContactForm() {
  const [errors, setErrors] = useState<Partial<Record<Checked, string>>>({});
  const [sent, setSent] = useState<{ body: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Validate on blur; once a field shows an error, re-check it as the visitor types so it clears.
  function check(name: string, value: string) {
    if (!CHECKED.includes(name as Checked)) return;
    setErrors((prev) => ({ ...prev, [name]: fieldError(name, value) ?? undefined }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const get = (key: string) => String(data.get(key) ?? "");
    const found = Object.fromEntries(CHECKED.map((key) => [key, fieldError(key, get(key)) ?? undefined]));
    setErrors(found);
    const firstBad = CHECKED.find((key) => found[key]);
    if (firstBad) {
      (form.elements.namedItem(firstBad) as HTMLElement).focus();
      return;
    }
    const mail = composeEnquiry(contact.email, {
      name: get("name"),
      company: get("company"),
      phone: get("phone"),
      location: get("location"),
      area: get("area"),
      size: get("size"),
      issues: data.getAll("issues").map(String),
      message: get("message"),
    });
    setCopied(false);
    setSent({ body: mail.body });
    window.location.href = mail.href;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(sent?.body ?? "");
      setCopied(true);
    } catch {
      setCopied(false); // the text is still on screen to select by hand
    }
  }

  return (
    <div className="form-wrap">
      <form className="form" noValidate onSubmit={submit} hidden={!!sent} aria-label="Trial area enquiry">
        <div className="row2">
          <Field id="name" label="Your name" error={errors.name}>
            <input id="name" name="name" autoComplete="name" required aria-invalid={!!errors.name} aria-describedby="name-hint"
              onBlur={(e) => check("name", e.currentTarget.value)} onChange={(e) => errors.name && check("name", e.currentTarget.value)} />
          </Field>
          <Field id="company" label="Company" optional>
            <input id="company" name="company" autoComplete="organization" aria-describedby="company-hint" />
          </Field>
        </div>
        <div className="row2">
          <Field id="phone" label="Phone" optional hint="So Jon can call to arrange a yard walk." error={errors.phone}>
            <input id="phone" name="phone" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby="phone-hint"
              onBlur={(e) => check("phone", e.currentTarget.value)} onChange={(e) => errors.phone && check("phone", e.currentTarget.value)} />
          </Field>
          <Field id="location" label="Site location" optional hint="Suburb and state.">
            <input id="location" name="location" autoComplete="address-level2" aria-describedby="location-hint" />
          </Field>
        </div>
        <div className="row2">
          <Field id="area" label="Area to trial" optional>
            <select id="area" name="area" defaultValue="" aria-describedby="area-hint">
              <option value="">Not sure yet</option>
              {areas.map((a) => <option key={a.id}>{a.name}</option>)}
            </select>
          </Field>
          <Field id="size" label="Approximate size" optional hint="In square metres." error={errors.size}>
            <input id="size" name="size" inputMode="numeric" aria-invalid={!!errors.size} aria-describedby="size-hint"
              onBlur={(e) => check("size", e.currentTarget.value)} onChange={(e) => errors.size && check("size", e.currentTarget.value)} />
          </Field>
        </div>
        <fieldset className="field">
          <legend>What is happening now <span className="opt">(optional)</span></legend>
          <div className="checks">
            {enquiryIssues.map((issue) => (
              <label className="check" key={issue}><input type="checkbox" name="issues" value={issue} />{issue}</label>
            ))}
          </div>
        </fieldset>
        <Field id="message" label="Anything else" optional>
          <textarea id="message" name="message" rows={4} maxLength={1200} aria-describedby="message-hint" />
        </Field>
        <div className="btnrow">
          <button type="submit" className="btn btn-primary">
            Write the email to Jon
            <svg className="icon go" viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="13,6 19,12 13,18" /></svg>
          </button>
        </div>
      </form>

      {sent && (
        <div className="sent" role="status">
          <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>
          <h3>Your email to Jon is written.</h3>
          <p>Your email app should have opened with it, ready to send.</p>
          <p className="note">Nothing opened? Copy the details below and send them to <a href={`mailto:${contact.email}`}>{contact.email}</a>, or call {contact.phone}.</p>
          <textarea className="sent-body" readOnly value={sent.body} rows={6} aria-label="Your enquiry" />
          <div className="btnrow">
            <button type="button" className="btn btn-primary" onClick={copy}>{copied ? "Copied" : "Copy details"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setSent(null)}>Edit details</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ id, label, optional, hint, error, children }: { id: string; label: string; optional?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="field" data-error={error ? "" : undefined}>
      <label htmlFor={id}>{label}{optional && <span className="opt"> (optional)</span>}</label>
      {children}
      <p className="hint" id={`${id}-hint`}>{error ?? hint}</p>
    </div>
  );
}
