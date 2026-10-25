# nikkib — nikkibfashion.com

Static website (HTML/CSS/JS) with a Stripe checkout running as two small Vercel functions in `api/`.

## Changing photos
Each piece has three photos in `img/p/`: `<name>-model.jpg` (on her), `<name>-place.jpg` (where it was taken), `<name>-scarf.jpg` (flat).
Replace a file with the same name, then run `python tools/make_thumbs.py` to refresh the small thumbnails. The home page picture is `img/brand/hero.jpg`.

## Changing names, places, stories, price
Edit `pieces.json` (stories and locations) or the `PRICE` line at the top of `tools/build_pages.py`, then run `python tools/build_pages.py` to rebuild the pages and the checkout's price list.

## Checkout (Stripe)
Set these in Vercel > Project > Settings > Environment Variables (see `.env.example`):
- `STRIPE_SECRET_KEY` — your Stripe secret key (start with a `sk_test_` key to try it, then switch to `sk_live_`)
- `SITE_URL` — `https://www.nikkibfashion.com`
- `SHIPPING_COUNTRIES` — optional, default `AU` (comma-separated country codes)
- `STRIPE_SHIPPING_RATES` — optional, comma-separated Stripe shipping rate IDs (`shr_...`) created in the Stripe dashboard

Prices are set on the server (`api/_catalog.js`, written by the build script), never by the browser.
