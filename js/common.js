/* nikkib — shared behaviour for every page. Page scripts use window.NB. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const D = window.NIKKI, P = D.pieces, byId = Object.fromEntries(P.map(p => [p.id, p]));
const PRICE = D.price, EMAIL = D.email;

/* ---------- words + reveal ---------- */
$$('[data-split]').forEach(el => {
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', el.textContent.trim());
  el.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${esc(w)}</span></span>`).join(' ');
});
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -5% 0px' });
const observe = root => $$('.rv,[data-split]', root).forEach(el => io.observe(el));
observe(document);

/* scroll-lit statements */
$$('.scrub').forEach(el => {
  el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="sw">${esc(w)}</span>`).join(' ');
  const sw = $$('.sw', el);
  if (reduce) { sw.forEach(s => s.classList.add('lit')); return; }
  const upd = () => {
    const r = el.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .25)));
    sw.forEach((s, i) => s.classList.toggle('lit', i / sw.length < p * 1.08));
  };
  addEventListener('scroll', upd, { passive: true }); upd();
});

/* ---------- nav ---------- */
const nav = $('#nav'), links = $('#links'), burger = $('#burger');
const onScroll = () => nav.classList.toggle('solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
burger.onclick = () => { const o = links.classList.toggle('open'); burger.setAttribute('aria-expanded', o); };

/* ---------- page-change curtain ---------- */
const cur = $('#curtain');
function reveal() {
  if (!cur) return;
  setTimeout(() => { cur.classList.add('out'); setTimeout(() => { cur.hidden = true; cur.classList.remove('start', 'out'); }, 1000); }, 80);
}
reveal();
addEventListener('pageshow', e => { if (e.persisted && cur) { cur.hidden = true; cur.classList.remove('in', 'start', 'out'); } });
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
  const href = a.getAttribute('href');
  if (/^mailto|^tel/.test(href)) return;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin) return;
  if (u.pathname === location.pathname) { links.classList.remove('open'); burger.setAttribute('aria-expanded', false); return; }
  if (reduce || !cur) return;
  e.preventDefault();
  cur.style.setProperty('--cur', getComputedStyle(document.documentElement).getPropertyValue('--c1').trim() || '#c2358f');
  cur.hidden = false; cur.classList.remove('start', 'out'); void cur.offsetWidth; cur.classList.add('in');
  setTimeout(() => { location.href = a.href; }, 640);
});

/* ---------- cursor, magnetic buttons, tilt ---------- */
if (fine) {
  const c = $('#cursor'); let x = 0, y = 0, cx = 0, cy = 0;
  addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });
  (function loop() { cx += (x - cx) * .22; cy += (y - cy) * .22; c.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); })();
  document.addEventListener('mouseover', e => c.classList.toggle('big', !!e.target.closest('a,button,[data-hot]')));
}
if (fine && !reduce) {
  $$('.magnetic').forEach(b => {
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .16}px,${(e.clientY - r.top - r.height / 2) * .26}px)`; });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });
}

/* ---------- scroll parallax ---------- */
const par = $$('[data-par]'); let tick = false;
function parallax() {
  tick = false;
  par.forEach(el => {
    const r = el.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    el.style.transform = `translate3d(0,${(r.top + r.height / 2 - innerHeight / 2) * -parseFloat(el.dataset.par)}px,0)`;
  });
}
if (par.length && !reduce) { addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(parallax); } }, { passive: true }); parallax(); }

/* ---------- bag + checkout ---------- */
const KEY = 'nikkib-bag', MAXQ = 5;
let bag = [];
try { bag = JSON.parse(localStorage.getItem(KEY) || '[]').filter(i => i && byId[i.id] && i.qty > 0).map(i => ({ id: i.id, qty: Math.min(MAXQ, Math.floor(i.qty)) })); } catch (e) { bag = []; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch (e) { /* private mode: keep in memory */ } };
const BAG_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 8h13l-1 12h-11z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>';
$$('.bag-btn').forEach(b => b.insertAdjacentHTML('afterbegin', BAG_ICON));
const count = () => bag.reduce((n, i) => n + i.qty, 0);

const drawer = document.createElement('aside');
drawer.className = 'drawer'; drawer.id = 'drawer'; drawer.setAttribute('aria-label', 'Your bag'); drawer.setAttribute('aria-hidden', 'true');
const scrim = document.createElement('div'); scrim.className = 'scrim';
const toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status');
document.body.append(scrim, drawer, toastEl);

/* delivery: the customer's country picks a zone in shipping.json, the zone has a price */
let SHIP = null, shipTo = 'AU';
try { shipTo = localStorage.getItem('nikkib-ship-to') || ''; } catch (e) { shipTo = ''; }
if (!shipTo) { const m = (navigator.language || '').match(/-([A-Za-z]{2})$/); shipTo = m ? m[1].toUpperCase() : 'AU'; }
fetch('shipping.json').then(r => r.json()).then(j => { SHIP = j; if (!SHIP.countries[shipTo]) shipTo = 'AU'; renderDrawer(); }).catch(() => {});
const zoneFor = c => SHIP && (SHIP.zones.find(z => z.countries.includes(c)) || SHIP.zones.find(z => z.countries.includes('*')));
const shipCost = () => { const z = zoneFor(shipTo); return z && typeof z.amount === 'number' && z.amount >= 0 ? z.amount : null; };
const money = n => '$' + (Number.isInteger(n) ? n : n.toFixed(2));

function enquiryHref() {
  const lines = bag.map(i => `- ${byId[i.id].name} x ${i.qty} (${byId[i.id].location}), AUD $${PRICE * i.qty}`);
  const where = SHIP ? SHIP.countries[shipTo] : '';
  const body = `Hello nikkib,\n\nI'd like to order:\n${lines.join('\n')}\n\nSubtotal: AUD $${count() * PRICE}\nPlease send me the delivery price to: ${where}\n\nMy name:\nMy address:`;
  return `mailto:${EMAIL}?subject=${encodeURIComponent('Order — nikkib')}&body=${encodeURIComponent(body)}`;
}
function renderDrawer(note) {
  drawer.innerHTML = `
    <div class="dr-head"><h3>Your bag</h3><button class="dr-close" aria-label="Close bag">✕</button></div>
    <div class="dr-list">${bag.length ? bag.map(i => { const p = byId[i.id]; return `
      <div class="dr-item"><img src="${p.thumb}" alt=""><div><b>${esc(p.name)}</b><small>${esc(p.location)}</small>
        <div class="qty"><button data-q="${p.id}" data-d="-1" aria-label="One fewer ${esc(p.name)}">−</button><span>${i.qty}</span><button data-q="${p.id}" data-d="1" aria-label="One more ${esc(p.name)}">+</button></div></div>
        <div class="dr-price">AUD $${PRICE * i.qty}<button data-rm="${p.id}">Remove</button></div></div>`; }).join('')
      : '<p class="dr-empty">Your bag is empty.<br>Choose a piece and tap the bag icon.</p>'}</div>
    <div class="dr-foot">
      ${bag.length ? `${SHIP ? `<label class="ship"><span>Deliver to</span><select id="shipTo">${Object.entries(SHIP.countries).map(([c, n]) => `<option value="${c}"${c === shipTo ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></label>` : ''}
      <div class="dr-line"><span>${count()} ${count() === 1 ? 'piece' : 'pieces'}</span><span>AUD $${count() * PRICE}</span></div>
      <div class="dr-line"><span>Delivery</span><span>${!SHIP ? '…' : shipCost() === null ? 'To be confirmed' : shipCost() === 0 ? 'Free' : 'AUD ' + money(shipCost())}</span></div>
      <div class="dr-total"><span>Total</span><span>${shipCost() === null ? 'AUD $' + count() * PRICE + ' + delivery' : 'AUD ' + money(count() * PRICE + shipCost())}</span></div>
      <button class="btn solid" data-checkout><span>${!SHIP || shipCost() !== null ? 'Checkout' : 'Order by email'}</span></button>
      <p class="dr-note" id="drNote">${note || 'Delivery address and payment are entered securely on the next page, powered by Stripe.'}</p>
      <a class="small" href="${enquiryHref()}">Prefer to order by email?</a>` : '<a class="btn" href="collection.html"><span>Browse the collection</span></a>'}
    </div>`;
}
function syncBag() {
  $$('[data-add]').forEach(b => { const p = byId[b.dataset.add]; if (p) b.setAttribute('aria-label', `Add ${p.name} to bag`); });
  $$('#bagCount').forEach(c => c.textContent = count());
  $$('.bag-btn').forEach(b => b.classList.toggle('has', count() > 0));
}
let tt;
function toast(msg, viewBag) {
  toastEl.innerHTML = esc(msg) + (viewBag ? ' <button data-open-bag>View bag</button>' : '');
  toastEl.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('on'), 3400);
}
function changed() { save(); syncBag(); renderDrawer(); $$('.bag-btn').forEach(b => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }); }
function add(id) {
  const it = bag.find(i => i.id === id);
  if (it) { if (it.qty >= MAXQ) { toast(`Up to ${MAXQ} of each piece per order. For more, write to us.`); return; } it.qty++; } else bag.push({ id, qty: 1 });
  changed(); toast(`${byId[id].name} added to your bag`, true);
}
function setQty(id, d) {
  const it = bag.find(i => i.id === id); if (!it) return;
  it.qty = Math.min(MAXQ, it.qty + d); if (it.qty <= 0) bag = bag.filter(i => i !== it);
  changed();
}
const open = () => { renderDrawer(); drawer.classList.add('on'); scrim.classList.add('on'); drawer.setAttribute('aria-hidden', 'false'); $('.dr-close', drawer).focus(); };
const close = () => { drawer.classList.remove('on'); scrim.classList.remove('on'); drawer.setAttribute('aria-hidden', 'true'); };

async function checkout(btn) {
  const label = $('span', btn);
  if (SHIP && shipCost() === null) { location.href = enquiryHref(); return; }   // no delivery price for this country yet: order by email
  btn.disabled = true; label.textContent = 'Preparing checkout…';
  let msg = '';
  try {
    const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: bag, country: shipTo }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok && d.url) { location.href = d.url; return; }
    msg = r.status === 503 ? 'Online checkout is being switched on. For now you can order by email below.'
      : r.status === 422 ? `We are still confirming delivery to ${d.country || 'that country'}. Please order by email below and we will send the price.`
      : 'Sorry, checkout could not start. Please try again, or order by email below.';
  } catch (e) { msg = 'Sorry, we could not reach the checkout. Please check your connection, or order by email below.'; }
  btn.disabled = false; label.textContent = 'Checkout';
  const n = $('#drNote'); if (n) { n.textContent = msg; n.classList.add('err'); }
}

document.addEventListener('click', e => {
  const a = e.target.closest('[data-add]'); if (a && byId[a.dataset.add]) { e.preventDefault(); e.stopPropagation(); add(a.dataset.add); return; }
  if (e.target.closest('.bag-btn') || e.target.closest('[data-open-bag]')) { open(); return; }
  if (e.target.closest('.dr-close') || e.target === scrim) { close(); return; }
  const q = e.target.closest('[data-q]'); if (q) { setQty(q.dataset.q, +q.dataset.d); return; }
  const rm = e.target.closest('[data-rm]'); if (rm) { bag = bag.filter(i => i.id !== rm.dataset.rm); changed(); return; }
  const co = e.target.closest('[data-checkout]'); if (co) checkout(co);
}, true);
addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
document.addEventListener('change', e => { if (e.target.id === 'shipTo') { shipTo = e.target.value; try { localStorage.setItem('nikkib-ship-to', shipTo); } catch (x) { /* ignore */ } renderDrawer(); const sel = $('#shipTo'); if (sel) sel.focus(); } });
renderDrawer(); syncBag();

/* ---------- palette helpers (colour that follows the pieces) ---------- */
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const sat = h => { const [r, g, b] = rgb(h).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx ? (mx - mn) / mx : 0; };
const score = h => { const [r, g, b] = rgb(h).map(v => v / 255); return sat(h) * (.35 + Math.max(r, g, b)); };
const vivid = hexes => hexes.slice().sort((a, b) => score(b) - score(a));
function setTheme(p) {
  const pal = p.palette.length >= 3 ? p.palette : [...p.palette, ...p.palette].slice(0, 3);
  const v = vivid(pal), root = document.documentElement.style;
  root.setProperty('--c1', v[0]); root.setProperty('--c2', v[1]); root.setProperty('--c3', v[2]);
  const dark = h => '#' + rgb(h).map(x => Math.round(x * .66).toString(16).padStart(2, '0')).join('');
  root.setProperty('--d1', dark(v[0])); root.setProperty('--d2', dark(v[1])); root.setProperty('--d3', dark(v[2]));
}

window.NB = { bagItems: () => bag.map(i => ({ ...i })), clearBag: () => { bag = []; save(); syncBag(); renderDrawer(); }, $, $$, esc, reduce, fine, P, byId, PRICE, EMAIL, observe, add, syncBag, enquiryHref, rgb, sat, vivid, setTheme, open, close, toast };
})();
