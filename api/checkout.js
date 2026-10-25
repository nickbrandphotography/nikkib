// Creates a Stripe Checkout session for the items in the bag.
// Prices and product names come from api/_catalog.js (written by the site generator), never from the browser.
const { PRICE_CENTS, CURRENCY, pieces } = require('./_catalog');
const shipping = require('../shipping.json');

const MAX_QTY = 5;

// Delivery price comes from shipping.json: the customer's country picks a zone, the zone has a price.
function zoneFor(code) {
  return shipping.zones.find(z => z.countries.includes(code)) || shipping.zones.find(z => z.countries.includes('*'));
}

function siteOrigin(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method' }); }
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(503).json({ error: 'not_configured' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const items = Array.isArray(body && body.items) ? body.items : [];
  const seen = new Set(), lines = [];
  for (const it of items) {
    const id = String(it && it.id), qty = Math.floor(Number(it && it.qty));
    if (!pieces[id] || seen.has(id) || !(qty >= 1)) continue;
    seen.add(id); lines.push({ id, qty: Math.min(qty, MAX_QTY) });
  }
  if (!lines.length) return res.status(400).json({ error: 'empty' });

  const country = String((body && body.country) || '').toUpperCase();
  if (!shipping.countries[country]) return res.status(400).json({ error: 'bad_country' });
  const zone = zoneFor(country);
  if (!zone || typeof zone.amount !== 'number' || !(zone.amount >= 0)) {
    return res.status(422).json({ error: 'shipping_unavailable', country: shipping.countries[country] });
  }

  const origin = siteOrigin(req), p = new URLSearchParams();
  p.set('mode', 'payment'); p.set('locale', 'en-AU');
  p.set('billing_address_collection', 'auto');
  p.set('phone_number_collection[enabled]', 'true');
  p.set('allow_promotion_codes', 'true');
  // only the chosen country is allowed, so the address always matches the delivery price
  p.set('shipping_address_collection[allowed_countries][0]', country);
  p.set('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
  p.set('shipping_options[0][shipping_rate_data][display_name]', zone.label);
  p.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]', String(Math.round(zone.amount * 100)));
  p.set('shipping_options[0][shipping_rate_data][fixed_amount][currency]', shipping.currency || CURRENCY);
  lines.forEach((l, i) => {
    const pc = pieces[l.id], b = `line_items[${i}]`;
    p.set(`${b}[quantity]`, String(l.qty));
    p.set(`${b}[price_data][currency]`, CURRENCY);
    p.set(`${b}[price_data][unit_amount]`, String(PRICE_CENTS));
    p.set(`${b}[price_data][product_data][name]`, `nikkib ${pc.name}`);
    p.set(`${b}[price_data][product_data][description]`, `${pc.location} · 100% Modal · 100 × 200 cm · hand wash`);
    p.set(`${b}[price_data][product_data][images][0]`, `${origin}/${pc.image}`);
    p.set(`${b}[price_data][product_data][metadata][piece]`, l.id);
  });
  p.set('success_url', `${origin}/thanks.html?session_id={CHECKOUT_SESSION_ID}`);
  p.set('cancel_url', `${origin}/collection.html`);
  p.set('metadata[source]', 'nikkibfashion.com');
  p.set('metadata[ship_zone]', zone.id);

  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: p
    });
    const data = await r.json();
    if (!r.ok || !data.url) { console.error('Stripe error:', data && data.error && data.error.message); return res.status(502).json({ error: 'stripe' }); }
    return res.status(200).json({ url: data.url });
  } catch (e) {
    console.error('Checkout failed:', e && e.message);
    return res.status(502).json({ error: 'network' });
  }
};
