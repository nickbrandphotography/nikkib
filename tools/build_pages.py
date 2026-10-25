"""Generates the static pages of the standalone nikkib website into C:/NITA gallery/nikki-b-site.
Edit copy here, then run:  python nikki_pages.py"""
import json, html
import os
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pieces = json.load(open(SITE + "/pieces.json", encoding="utf-8"))
PRICE = 120
EMAIL = "live@nikkibfashion.com"
E = html.escape

import os
os.makedirs(SITE + "/api", exist_ok=True)
cat = {"PRICE_CENTS": PRICE * 100, "CURRENCY": "aud",
       "pieces": {p["id"]: {"name": p["name"], "location": p["location"], "image": p["scarf"]} for p in pieces}}
open(SITE + "/api/_catalog.js", "w", encoding="utf-8").write(
    "// Written by the site generator. Server-side source of truth for prices: do not edit by hand." + chr(10) +
    "module.exports = " + json.dumps(cat, ensure_ascii=False, indent=1) + ";" + chr(10))

# data file the scripts read
open(SITE + "/data.js", "w", encoding="utf-8").write(
    "window.NIKKI=" + json.dumps({"price": PRICE, "email": EMAIL, "pieces": pieces}, ensure_ascii=False) + ";")

LINKS = [("index.html", "Home"), ("collection.html", "Collection"), ("atlas.html", "Atlas"), ("label.html", "The Label")]
FONTS = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&family=Mrs+Saint+Delafield&display=swap"

def head(title, desc, css, og="img/brand/hero.jpg"):
    return f'''<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{og}">
<meta name="theme-color" content="#faf7f2">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{FONTS}" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
{"".join(f'<link rel="stylesheet" href="css/{c}.css">' for c in css)}
<style>[hidden]{{display:none!important}}</style>
<script>document.documentElement.classList.add('js')</script>
</head>
<body>
'''

def header(active):
    nav = "".join(f'<a href="{h}"{" aria-current=\"page\"" if h == active else ""}>{n}</a>' for h, n in LINKS)
    return f'''<div class="curtain start" id="curtain" aria-hidden="true"><img src="img/brand/nikkib-black.png" alt=""></div>
<div class="cursor" id="cursor" aria-hidden="true"><span></span></div>
<header class="nav" id="nav">
  <a class="logo" href="index.html" aria-label="nikkib — home"><img src="img/brand/nikkib-black.png" alt="nikkib"></a>
  <nav class="links" id="links" aria-label="Main">{nav}</nav>
  <button class="bag-btn" aria-label="Open your bag"><b id="bagCount">0</b></button>
  <button class="burger" id="burger" aria-label="Menu" aria-expanded="false"><i></i><i></i></button>
</header>
'''

FOOT = f'''
<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div><img src="img/brand/nikkib-white.png" alt="nikkib"><p>Sarongs and scarves printed with photographs of real places. Wrap your body in art.</p></div>
      <div><h4>Explore</h4><a href="collection.html">The collection</a><a href="atlas.html">Where it was taken</a><a href="label.html">The label</a><a href="label.html#contact">Contact</a></div>
      <div><h4>Say hello</h4><a href="mailto:{EMAIL}">{EMAIL}</a><a href="https://nikkibfashion.com" target="_blank" rel="noopener">nikkibfashion.com</a><p style="margin-top:1rem">100% Modal · 100 × 200 cm<br>AUD ${PRICE} each · hand wash</p></div>
    </div>
    <div class="fine"><span>© nikkib. Photography and design by Nick Brand. All images © Nick Brand.</span><span>Prices in Australian dollars.</span></div>
  </div>
</footer>
<script src="data.js"></script>
<script src="js/common.js"></script>
'''

def tail(*js):
    return "".join(f'<script src="js/{j}.js"></script>\n' for j in js) + "</body>\n</html>\n"

def names_marquee():
    one = "".join(f'<a href="collection.html#{p["id"]}" tabindex="-1">{E(p["name"])}</a><i>✦</i>' for p in pieces)
    return f'<div class="marq" aria-hidden="true"><div class="mq">{one}{one}</div></div>'

# ----------------------------------------------------------------- HOME
def home():
    ev = next(p for p in pieces if p["id"] == "evie"); hy = next(p for p in pieces if p["id"] == "hayley")
    s = head("nikkib — Wrap Your Body in Art", "nikkib: sarongs and scarves printed with photographs of real places, on silk-like beech-tree modal. 24 pieces, 100 × 200 cm.", ["home"])
    s += header("index.html")
    s += f'''
<main id="top">
<section class="h-hero">
  <canvas class="silk" id="silk" aria-hidden="true"></canvas>
  <div class="wrap h-grid">
    <div class="h-copy">
      <p class="kicker rv">Where photography meets fabric</p>
      <h1 class="h-title"><span class="ln rv">Wrap your</span><span class="ln rv">body in</span><span class="ln script grad-text rv">Art</span></h1>
      <p class="lede rv">Sarongs and scarves printed with photographs taken in real places, from Sydney harbour to a lava tube in the Canary Islands. Twenty-four pieces, each one a story you can wear.</p>
      <p class="h-cta rv"><a class="btn solid magnetic" href="collection.html"><span>Explore the collection</span></a> <a class="btn ghost magnetic" href="atlas.html"><span>Where it was taken</span></a></p>
    </div>
    <div class="h-art rv">
      <img class="h-main" src="img/brand/hero.jpg" alt="A model dancing on a rock platform above the sea in a flowing magenta nikkib sarong" fetchpriority="high">
      <a class="h-card k1" href="collection.html#{ev["id"]}" aria-label="{ev["name"]}"><img src="{ev["thumb"]}" alt="{ev["name"]} scarf"><span>{ev["name"]}</span></a>
      <a class="h-card k2" href="collection.html#{hy["id"]}" aria-label="{hy["name"]}"><img src="{hy["thumb"]}" alt="{hy["name"]} scarf"><span>{hy["name"]}</span></a>
      <svg class="badge" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="bc" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0"/></defs><text><textPath href="#bc">DUAL SEASON · SARONGS &amp; SCARVES · 100% MODAL · </textPath></text></svg>
    </div>
  </div>
  <div class="scroll-cue" aria-hidden="true"><span></span></div>
</section>

{names_marquee()}

<section class="philo">
  <div class="wrap">
    <p class="kicker rv">The label</p>
    <p class="scrub">nikkib is a lifestyle brand inspired by raw and real landscapes, people and style from around the world, each piece foretelling its own original story.</p>
    <div class="philo-cols">
      <p class="rv">Our exclusive line of stunning dual season apparel offers a quality and design that sets it distinctly apart from the everyday. The images that breathe life into the fabric are lovingly taken, unique to the label, and intended to inspire.</p>
      <p class="rv">The art works are printed onto a sustainable and environmentally friendly textile, spun from cellulose fibres taken from beech trees, with a texture very similar to silk.</p>
    </div>
    <ul class="facts">
      <li class="rv"><b data-count="24">24</b><span>pieces, each its own photograph</span></li>
      <li class="rv"><b data-count="6">6</b><span>regions, from Sydney to Burma</span></li>
      <li class="rv"><b>100×200</b><span>centimetres, dual season</span></li>
      <li class="rv"><b>100%</b><span>Modal, from beech trees</span></li>
    </ul>
  </div>
</section>

<section class="st" id="st">
  <div class="st-in wrap">
    <div class="st-stage">
      <div class="st-card">
        <img class="on" id="stImg0" src="img/p/hayley-place.jpg" alt="The place: Sydney skyline across the harbour at dusk">
        <img id="stImg1" src="img/p/hayley-scarf.jpg" alt="The finished Hayley scarf">
        <img id="stImg2" src="img/p/hayley-model.jpg" alt="Hayley worn as a sarong">
      </div>
      <p class="st-cap"><b>Hayley</b><span id="stCap">Vaucluse, Sydney</span></p>
      <div class="st-bar"><i id="stBar"></i></div>
    </div>
    <ol class="st-list">
      <li data-i="0"><i>01</i><h3>Photograph</h3><p>It starts with a place. Hayley is the Sydney skyline across the harbour at dusk, taken from Vaucluse. Every nikkib image is lovingly taken and unique to the label.</p></li>
      <li data-i="1"><i>02</i><h3>Print</h3><p>The photograph becomes the fabric. It is printed onto a sustainable textile spun from the cellulose of beech trees, with a texture very much like silk.</p></li>
      <li data-i="2"><i>03</i><h3>Wrap</h3><p>A sarong, a scarf, a dress: 100&nbsp;cm × 200&nbsp;cm of dual-season art. The nikkib philosophy is simple: wrap your body in art.</p></li>
    </ol>
  </div>
</section>

<section class="feat">
  <div class="wrap feat-head">
    <div><p class="kicker rv">Pieces</p><h2 class="h2 rv">A few to begin with</h2></div>
    <div class="arrows rv"><button id="fPrev" aria-label="Previous">←</button><button id="fNext" aria-label="Next">→</button></div>
  </div>
  <div class="f-track" id="fTrack" tabindex="0" aria-label="Featured pieces"></div>
  <div class="wrap"><p class="rv" style="margin-top:2rem"><a class="btn magnetic" href="collection.html"><span>See all 24</span></a></p></div>
</section>

<section class="fabric">
  <div class="wrap">
    <p class="kicker rv" style="color:var(--c3)">The fabric</p>
    <h2 class="h2 rv">Soft as silk.<br><em>Grown from beech.</em></h2>
    <div class="f-cards">
      <div class="rv"><i>01</i><h4>Sustainable</h4><p>An environmentally friendly textile, chosen to be kind to the places in the photographs.</p></div>
      <div class="rv"><i>02</i><h4>Beech-tree cellulose</h4><p>Spun from cellulose fibres taken from beech trees. 100% Modal.</p></div>
      <div class="rv"><i>03</i><h4>Silk-like</h4><p>A texture very similar to silk, with a fall and a softness you feel straight away.</p></div>
      <div class="rv"><i>04</i><h4>Dual season</h4><p>100 × 200 cm to wrap, tie or drape, in summer or winter. Hand wash.</p></div>
    </div>
  </div>
</section>

<section class="cta">
  <div class="wrap">
    <p class="script grad-text rv" style="font-size:clamp(3rem,8vw,6.5rem);line-height:1">Find yours</p>
    <h2 class="h2 rv">Each piece tells its own story.<br><em>Which one is yours?</em></h2>
    <p class="rv"><a class="btn solid magnetic" href="collection.html"><span>Browse the collection</span></a> <a class="btn ghost magnetic" href="label.html#contact"><span>Get in touch</span></a></p>
  </div>
</section>
</main>
'''
    s += FOOT + tail("silk", "home")
    return s

# ----------------------------------------------------------------- COLLECTION
def collection():
    s = head("The collection — nikkib", "All 24 nikkib sarongs and scarves: see each piece on her, flat, and in the place it was photographed. 100% Modal, 100 × 200 cm.", ["collection"])
    s += header("collection.html")
    s += f'''
<main id="top">
<section class="c-top wrap">
  <p class="kicker rv">The collection</p>
  <h1 class="h2 rv">Twenty-four <em>pieces.</em><br>Twenty-four places.</h1>
  <div class="c-tools rv">
    <div class="seg" id="modeSeg" role="group" aria-label="View"><button class="on" data-m="explore">Explorer</button><button data-m="grid">Grid</button></div>
    <div class="seg" id="famSeg" role="group" aria-label="Colour"><button class="on" data-f="all">All colours</button><button data-f="warm"><i style="background:#e8742a"></i>Warm</button><button data-f="cool"><i style="background:#2f8fb8"></i>Cool</button><button data-f="neutral"><i style="background:#8a8a86"></i>Black &amp; white</button></div>
    <label class="sel"><span class="small">Place</span><select id="regSel"></select></label>
    <p class="small" id="countTxt"></p>
  </div>
</section>

<section class="explorer" id="explorer">
  <canvas class="silk" id="silk" aria-hidden="true"></canvas>
  <div class="wrap ex-grid">
    <div class="ex-stage" id="stage" aria-live="polite">
      <figure class="tp" data-k="model"><img id="imgModel" alt=""><figcaption>On her</figcaption></figure>
      <figure class="tp" data-k="place"><img id="imgPlace" alt=""><figcaption>The place</figcaption></figure>
      <figure class="tp" data-k="scarf"><img id="imgScarf" alt=""><figcaption>Flat</figcaption></figure>
    </div>
    <div class="ex-info" id="info">
      <p class="ex-idx" id="idx"></p>
      <h2 class="ex-name" id="exName"></h2>
      <p class="ex-loc" id="exLoc"></p>
      <p class="ex-story" id="exStory"></p>
      <p class="ex-credit small" id="exCredit"></p>
      <ul class="specs"><li>100% Modal</li><li>100 × 200 cm</li><li>Hand wash</li></ul>
      <p class="ex-price">AUD ${PRICE}</p>
      <div class="ex-actions">
        <button class="btn solid" id="exAdd" data-add=""><span>Add to bag · AUD ${PRICE}</span></button>
        <a class="btn ghost" id="exEnq" href="#"><span>Ask a question</span></a>
        <div class="pn"><button id="prev" aria-label="Previous piece">←</button><button id="next" aria-label="Next piece">→</button></div>
      </div>
    </div>
  </div>
  <div class="wrap"><div class="strip" id="strip" role="listbox" aria-label="All pieces"></div></div>
  <p class="wrap small hint">Use the ← → keys or swipe. Tap a picture to enlarge it.</p>
</section>

<section class="grid-view" id="gridView" hidden>
  <div class="wrap"><div class="g-grid" id="grid"></div></div>
</section>
</main>
'''
    s += FOOT + tail("silk", "collection")
    return s

# ----------------------------------------------------------------- ATLAS
def atlas():
    s = head("Where it was taken — nikkib", "Every nikkib piece begins as a photograph of somewhere real: Sydney, Tasmania, England, the Canary Islands and Burma. See the places.", ["atlas"], "img/p/hayley-place.jpg")
    s += header("atlas.html")
    s += '''
<main id="top">
<section class="a-hero wrap">
  <p class="kicker rv">The atlas</p>
  <h1 class="h2 rv">Where it was <em>taken.</em></h1>
  <p class="lede rv">Every nikkib piece begins as a photograph of somewhere real: the side of a building in Redfern, dew on a leaf in Sussex, a lava tube in the Canary Islands. Open a region to see what was found there.</p>
</section>
<section class="regions" id="regions" aria-label="Regions"></section>
<section class="ix wrap">
  <p class="kicker rv">The index</p>
  <h2 class="h2 rv">Twenty-four places, <em>one by one</em></h2>
  <div class="ix-table" id="ixTable" role="list"></div>
  <img class="ix-pop" id="ixPop" alt="" aria-hidden="true">
</section>
</main>
'''
    s += FOOT + tail("atlas")
    return s

# ----------------------------------------------------------------- LABEL
def label():
    s = head("The label — nikkib", "nikkib is the lifestyle label of Australian photographer and fashion designer Nick Brand: wearable art on silk-like beech-tree modal.", ["label"], "img/brand/hero.jpg")
    s += header("label.html")
    s += f'''
<main id="top">
<section class="l-hero wrap">
  <p class="kicker rv">The label</p>
  <h1 class="l-title rv"><span class="script grad-text">Wrap your body</span><br>in art.</h1>
  <p class="lede rv">Australian photographer and fashion designer nikkib is a lifestyle brand inspired by raw and real landscapes, people and style from around the world, each piece foretelling its own original story.</p>
</section>

<section class="l-split wrap">
  <div class="l-img rv"><img src="img/brand/hero.jpg" alt="A model dancing on the rocks in a flowing magenta nikkib sarong" data-par="0.06"></div>
  <div class="l-copy">
    <h2 class="h2 rv">Photography<br>meets <em>fabric.</em></h2>
    <p class="rv">Our exclusive line of stunning dual season apparel offers a quality and design that sets it distinctly apart from the everyday. The images that breathe life into the fabric that is the nikkib identity are lovingly taken, unique to the label, and intended to inspire.</p>
    <p class="rv">The art works are printed onto a sustainable and environmentally friendly textile, spun from cellulose fibres taken from beech trees, with a texture very similar to silk.</p>
    <p class="rv script grad-text" style="font-size:clamp(2.4rem,5vw,4rem);line-height:1.1">The nikkib philosophy is simple: wrap your body in art.</p>
  </div>
</section>

<section class="l-spec">
  <div class="wrap">
    <p class="kicker rv">The details</p>
    <div class="spec-grid">
      <div class="rv"><b>100%</b><span>Modal</span><p>Spun from cellulose fibre taken from beech trees. Sustainable and environmentally friendly.</p></div>
      <div class="rv"><b>100×200</b><span>centimetres</span><p>A generous size to wrap as a sarong, tie as a scarf, or drape as you like.</p></div>
      <div class="rv"><b>2</b><span>seasons</span><p>Dual season apparel: soft and light for summer, a wrap for cooler days.</p></div>
      <div class="rv"><b>${PRICE}</b><span>AUD each</span><p>Every one of the twenty-four pieces is the same price. Hand wash to keep it beautiful.</p></div>
    </div>
  </div>
</section>

<section class="l-credit wrap">
  <p class="rv small">Aishwarya was photographed in Eveleigh Street, Redfern, on a building painted black and adorned with 12,000 ‘lenses’: the artwork <em>What Remains</em> by Daniel Boyd.</p>
</section>

<section class="l-contact" id="contact">
  <div class="wrap l-grid">
    <div>
      <p class="kicker rv">Contact</p>
      <h2 class="h2 rv">Say <em>hello.</em></h2>
      <p class="rv">Questions about a piece, sizing, or how to buy? Write to us and we'll reply personally.</p>
      <p class="rv big-mail"><a href="mailto:{EMAIL}">{EMAIL}</a></p>
      <p class="rv"><a href="https://nikkibfashion.com" target="_blank" rel="noopener">nikkibfashion.com ↗</a></p>
    </div>
    <form class="l-form rv" id="mailForm" novalidate>
      <label>Your name<input name="name" autocomplete="name" required></label>
      <label>Your email<input name="email" type="email" autocomplete="email" required></label>
      <label>Your message<textarea name="msg" rows="5" placeholder="Which piece caught your eye?"></textarea></label>
      <p class="small" id="formNote">This opens your email app with everything filled in, ready to send.</p>
      <button class="btn solid" type="submit"><span>Open my email</span></button>
    </form>
  </div>
</section>
</main>
'''
    s += FOOT + tail("label")
    return s

def thanks():
    s = head("Thank you — nikkib", "Thank you for your order.", ["label"])
    s += header("")
    s += f'''
<main id="top">
<section class="wrap" style="padding-top:10rem;padding-bottom:7rem;min-height:70vh">
  <p class="kicker rv">Your order</p>
  <h1 class="h2 rv" id="tyTitle">Thank you.</h1>
  <p class="lede rv" id="tyMsg">Checking your order…</p>
  <p class="rv" style="margin-top:2rem"><a class="btn solid" href="collection.html"><span>Keep browsing</span></a> <a class="btn ghost" href="mailto:{EMAIL}"><span>Contact us</span></a></p>
</section>
</main>
'''
    s += FOOT + tail("thanks")
    return s

import re
BASE = "https://www.nikkibfashion.com"
def finish(fn, h):
    url = BASE + "/" + ("" if fn == "index.html" else fn[:-5])
    h = re.sub(r'<meta property="og:image" content="([^"]*)">', lambda m: '<meta property="og:image" content="' + BASE + "/" + m.group(1) + '">' + chr(10) + '<meta property="og:url" content="' + url + '">' + chr(10) + '<meta property="og:type" content="website">' + chr(10) + '<meta property="og:site_name" content="nikkib">' + chr(10) + '<meta name="twitter:card" content="summary_large_image">', h)
    h = h.replace('<meta name="theme-color"', '<link rel="canonical" href="' + url + '">' + chr(10) + '<meta name="theme-color"')
    if fn == "thanks.html": h = h.replace('<meta name="description"', '<meta name="robots" content="noindex">' + chr(10) + '<meta name="description"')
    return h

for fn, f in (("thanks.html", thanks), ("index.html", home), ("collection.html", collection), ("atlas.html", atlas), ("label.html", label)):
    open(f"{SITE}/{fn}", "w", encoding="utf-8").write(finish(fn, f()))
    print("wrote", fn)

open(SITE + "/robots.txt", "w").write("User-agent: *" + chr(10) + "Allow: /" + chr(10) + "Disallow: /api/" + chr(10) + "Sitemap: " + BASE + "/sitemap.xml" + chr(10))
urls = ["", "collection", "atlas", "label"]
open(SITE + "/sitemap.xml", "w").write('<?xml version="1.0" encoding="UTF-8"?>' + chr(10) + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + chr(10) + "".join('  <url><loc>' + BASE + "/" + u + '</loc></url>' + chr(10) for u in urls) + '</urlset>' + chr(10))
