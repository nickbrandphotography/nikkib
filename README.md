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

Prices are set on the server (`api/_catalog.js`, written by the build script), never by the browser.

## Delivery prices (worldwide)
Edit `shipping.json`. The customer picks their country in the bag; the country belongs to a zone; each zone has an `amount` in Australian dollars for the whole order (`18`, `24.5`, or `0` for free).
While a zone's `amount` is `null`, customers there see "To be confirmed" and are offered to order by email instead, so nothing is ever sold without a delivery price.
To move a country to another zone, move its code between the zones' `countries` lists. The last zone (`"*"`) catches every country not listed.
