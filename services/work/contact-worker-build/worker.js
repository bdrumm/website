var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.mjs
var MAX_BYTES = 2e4;
var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
async function handle(request, env, send = fetch) {
  const origin = request.headers.get("Origin");
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim());
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store", "Vary": "Origin" };
  if (origin && allowed.includes(origin)) headers["Access-Control-Allow-Origin"] = origin;
  const reply = /* @__PURE__ */ __name((body, status = 200, extra = {}) => Response.json(body, { status, headers: { ...headers, ...extra } }), "reply");
  if (new URL(request.url).pathname !== "/contact") return reply({ error: "Not found" }, 404);
  if (!origin || !allowed.includes(origin)) return reply({ error: "Origin not allowed" }, 403);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...headers, "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "600" } });
  if (request.method !== "POST") return reply({ error: "Method not allowed" }, 405, { Allow: "POST, OPTIONS" });
  if (!env.RESEND_API_KEY || !env.CONTACT_FROM || !EMAIL.test(env.CONTACT_TO || "") || !env.CONTACT_RATE_LIMITER) return reply({ error: "Contact service is not ready yet." }, 503);
  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) return reply({ error: "Expected JSON" }, 415);
  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip) return reply({ error: "Unable to verify request" }, 400);
  try {
    const { success } = await env.CONTACT_RATE_LIMITER.limit({ key: ip });
    if (!success) return reply({ error: "Too many attempts. Please wait a minute." }, 429, { "Retry-After": "60" });
    if (Number(request.headers.get("Content-Length")) > MAX_BYTES) return reply({ error: "Message too large" }, 413);
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: "Missing message" }, 400);
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        return reply({ error: "Message too large" }, 413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    let data;
    try {
      data = JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return reply({ error: "Invalid JSON" }, 400);
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) return reply({ error: "Invalid message" }, 400);
    if (data.website) return reply({ error: "Unable to accept message" }, 400);
    if (!["name", "email", "message", "submissionId"].every((k) => typeof data[k] === "string")) return reply({ error: "Complete all fields" }, 400);
    const name = data.name.trim(), email = data.email.trim(), message = data.message.trim();
    if (!name || name.length > 120 || /[\r\n\x00]/.test(name) || email.length > 254 || !EMAIL.test(email) || !message || message.length > 5e3 || !/^[a-f0-9-]{36}$/i.test(data.submissionId)) return reply({ error: "Check your name, email, and message." }, 400);
    const payload = { from: env.CONTACT_FROM, to: [env.CONTACT_TO], reply_to: email, subject: "New Parametric Space enquiry", text: `Name: ${name}
Email: ${email}

${message}` };
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(payload)));
    const hash = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
    const result = await send("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `contact/${data.submissionId}/${hash}` }, body: JSON.stringify(payload), signal: AbortSignal.timeout(1e4) });
    if (!result.ok) return reply({ error: "Unable to send right now. Please try again." }, 502);
    const resultData = await result.json();
    if (!resultData.id) return reply({ error: "Unable to confirm sending. Please try again." }, 502);
    return reply({ ok: true });
  } catch {
    return reply({ error: "Unable to send right now. Please try again." }, 503);
  }
}
__name(handle, "handle");
var worker_default = { fetch(request, env) {
  return handle(request, env);
} };
export {
  worker_default as default,
  handle
};
//# sourceMappingURL=worker.js.map
