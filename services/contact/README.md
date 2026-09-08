# Parametric Space contact service

Status: implementation complete and locally tested; not deployed or connected to live email delivery.

Cloudflare Worker forwards enquiries to **info@parametric.space** using Resend. The recipient and sender are server-controlled. Visitor email becomes Reply-To. Plain text prevents markup injection. It validates inputs, limits request bodies to 20 KB, uses a honeypot and Cloudflare's approximate per-location rate limiter (5 requests/IP/minute), and supplies stable Resend idempotency keys for retries. It does not store messages in a database. Resend acceptance is not a guarantee of inbox delivery.

## Activate

1. Sign in to Cloudflare with Wrangler (`npx wrangler login`).
2. In Resend, verify `parametric.space` for sending. Add only the records Resend requires; preserve existing Google Workspace MX records. Create a sending API key scoped to that domain. Never commit it or put it into frontend JavaScript.
3. From this directory, run `npx wrangler secret put RESEND_API_KEY` to enter the key securely. `CONTACT_FROM` in `wrangler.jsonc` must use the verified domain.
4. Run `npx wrangler deploy`. Save the actual returned workers.dev URL; the endpoint is that URL plus `/contact`.
5. Submit a clearly labeled test enquiry with Origin `https://parametric.space`, and confirm the email arrives at info@parametric.space. The request body needs name, email, message, website (empty), and submissionId (UUID).
6. Set `window.PARAMETRIC_CONTACT_ENDPOINT` in root `contact-config.js` to the verified HTTPS endpoint and push. The form stays disabled until this setting exists.

Test with `node --test services/contact/worker.test.mjs` from the repository root. Tests mock email transport and never send real messages.

Provider setup references: [Resend send API](https://resend.com/docs/api-reference/emails/send-email), [Cloudflare rate limits](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).
