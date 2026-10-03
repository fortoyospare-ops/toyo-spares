export async function sendEnquiry(type: "parts" | "car", data: Record<string, string>) {
  const res = await fetch("/api/enquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...data }),
  });
  if (!res.ok) throw new Error("Enquiry failed");
}
