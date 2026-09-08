# Stripe Checkout for Parametric Space

Status: code and mocked tests complete. Awaiting Stripe sign-in, real products/prices, and Worker hosting connection. No real payments have been accepted.

The static site lives on GitHub Pages. This separate Cloudflare Worker creates Stripe-hosted Checkout Sessions. Stripe processes the payment and stores transactions; the site never handles card numbers. Orders must be reviewed and fulfilled manually in Stripe. This implementation does not automatically ship products, release downloads, or send fulfillment emails. Add verified Stripe webhooks and durable order storage before introducing automatic fulfillment.

## Configure products

Populate `shop-config.js` with approved projects. Example structure only (not a real product):

```js
{
 id: 'your-project-slug',
 title: 'Your project title',
 summary: 'Your short description',
 description: ['Your full description.'],
 image: 'assets/your-project.jpg',
 imageAlt: 'What the image shows',
 category: 'Your category',
 shopUrl: 'https://your-existing-shop.example/product', // optional
 available: true,
 unitAmount: 2500, // integer USD cents, for display only
 currency: 'USD'
}
```

Only add factual images, prices, and availability approved by the owner. This basic storefront currently assumes currencies with two decimal places; configure USD unless the formatter is extended for another exponent. The cart is saved only on the visitor's device.

In `wrangler.jsonc`, set `PRICE_CATALOG_JSON` to a JSON object mapping each project ID to `{available:true,stripePriceId:"price_...",unitAmount:2500,currency:"usd"}`. These are server-controlled values. Stripe price active state, currency, amount, one-time type, and test/live mode are verified before creating the session. Unknown IDs, duplicate lines, and quantities outside 1–10 are rejected. Browser-submitted amounts and return URLs are ignored.

## Connect Stripe and deploy

1. Sign into Stripe and choose approved one-time products/prices in test mode.
2. Sign into Cloudflare using Wrangler. Set `STRIPE_SECRET_KEY` securely using `wrangler secret put STRIPE_SECRET_KEY` from this directory. Never commit it or place it in `shop-config.js`.
3. Configure the approved catalogue. For physical products, set `SHIPPING_COUNTRIES` to a JSON array of supported two-letter country codes before enabling sales; define any shipping charges and tax requirements before live launch. The current Worker does not configure shipping rates or automatic tax.
4. Deploy using Wrangler. Set `checkoutEndpoint` in `shop-config.js` to the actual returned Worker origin plus `/checkout`.
5. Run an end-to-end Stripe test checkout, cancellation, and verification of the return page before enabling live mode. Mocked tests do not substitute for a real sandbox test.
6. Only after owner approval of prices, fulfillment, shipping/tax handling, and live mode: configure matching live Price IDs, a live secret, and `LIVE_CHECKOUT_ENABLED:"true"`.

Security checks include exact allowed origins, server-controlled price IDs, current Stripe-price verification, bounded requests, approximate per-location rate limits, and Stripe idempotency keys. The `/session` endpoint returns only payment status and test-mode flag for this site's sessions, with no customer data. Confirmation is based on Stripe, never a query-string success flag.

References: [Checkout Sessions](https://docs.stripe.com/api/checkout/sessions/create), [Stripe fulfillment guidance](https://docs.stripe.com/checkout/fulfillment).
