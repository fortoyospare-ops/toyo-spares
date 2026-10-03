import type { VercelRequest, VercelResponse } from "@vercel/node";

// Receives enquiry forms from the website and emails them via Resend (https://resend.com).
// Environment variables (set in Vercel -> Settings -> Environment Variables):
//   RESEND_API_KEY       required
//   ENQUIRY_TO_EMAIL     optional, defaults to fortoyospare@gmail.com
//   ENQUIRY_FROM_EMAIL   optional, defaults to "Toyo Spares <onboarding@resend.dev>"

type Fields = Record<string, string>;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validate(type: string, body: Record<string, unknown>): { fields: Fields; error?: string } {
  const f: Fields = {};
  const need = (key: string, label: string, max: number, min = 1) => {
    f[key] = clean(body[key], max);
    return f[key].length >= min ? null : `${label} is required`;
  };
  const year = (key: string) => {
    f[key] = clean(body[key], 4);
    return /^\d{4}$/.test(f[key]) ? null : "Enter a 4-digit year";
  };

  let error: string | null = null;
  if (type === "parts") {
    error =
      need("name", "Name", 100, 2) ||
      need("phone", "Phone", 30, 8) ||
      need("email", "Email", 255) ||
      (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f["email"] ?? "") ? null : "Enter a valid email") ||
      need("vehicleMake", "Vehicle make", 80) ||
      need("vehicleModel", "Model", 80) ||
      year("vehicleYear") ||
      need("partRequired", "Part required", 300, 2) ||
      need("partCondition", "Condition", 40) ||
      need("fulfilment", "Delivery or pickup", 60);
    f["regoOrVin"] = clean(body["regoOrVin"], 40);
    f["notes"] = clean(body["notes"], 1500);
  } else if (type === "car") {
    error =
      need("vehicleMake", "Make", 80) ||
      need("vehicleModel", "Model", 80) ||
      year("vehicleYear") ||
      need("vehicleCondition", "Condition", 1000, 2) ||
      need("location", "Vehicle location", 200, 2) ||
      need("phone", "Phone", 30, 8);
  } else {
    error = "Unknown enquiry type";
  }
  return error ? { fields: f, error } : { fields: f };
}

const LABELS: Record<string, string> = {
  name: "Name",
  phone: "Phone",
  email: "Email",
  vehicleMake: "Vehicle make",
  vehicleModel: "Model",
  vehicleYear: "Year",
  regoOrVin: "Rego / VIN",
  partRequired: "Part required",
  partCondition: "Condition wanted",
  fulfilment: "Delivery / pickup",
  notes: "Notes",
  vehicleCondition: "Vehicle condition",
  location: "Vehicle location",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = (typeof req.body === "string" ? safeParse(req.body) : req.body) ?? {};

  // Honeypot: real visitors never fill this hidden field.
  if (clean(body["website"], 200)) return res.status(200).json({ ok: true });

  const type = clean(body["type"], 10);
  const { fields, error } = validate(type, body);
  if (error) return res.status(400).json({ ok: false, error });

  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return res.status(500).json({ ok: false, error: "Email is not configured" });
  }

  const to = process.env["ENQUIRY_TO_EMAIL"] || "fortoyospare@gmail.com";
  const from = process.env["ENQUIRY_FROM_EMAIL"] || "Toyo Spares <onboarding@resend.dev>";
  const title = type === "parts" ? "New parts quote request" : "New car sale enquiry";
  const subjectVehicle = `${fields["vehicleYear"]} ${fields["vehicleMake"]} ${fields["vehicleModel"]}`;

  const rows = Object.entries(fields)
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;font-weight:bold;vertical-align:top">${esc(LABELS[k] ?? k)}</td><td style="padding:6px 12px">${esc(v).replace(/\n/g, "<br>")}</td></tr>`)
    .join("");
  const html = `<h2 style="font-family:sans-serif">${title}</h2><table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>`;
  const text = Object.entries(fields)
    .filter(([, v]) => v)
    .map(([k, v]) => `${LABELS[k] ?? k}: ${v}`)
    .join("\n");

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: fields["email"] || undefined,
        subject: `${title}: ${subjectVehicle}`,
        html,
        text,
      }),
    });
    if (!r.ok) {
      console.error("Resend error", r.status, await r.text());
      return res.status(502).json({ ok: false, error: "Could not send email" });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Resend request failed", e);
    return res.status(502).json({ ok: false, error: "Could not send email" });
  }
}

function safeParse(s: string): Record<string, unknown> | null {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
