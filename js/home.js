(() => {
const { $, $$, esc, P, PRICE, reduce, fine, vivid, sat, setTheme, syncBag } = window.NB;

/* ----- hero: silk that cycles through the colours of the pieces ----- */
const vividPieces = P.slice().sort((a, b) => sat(vivid(b.palette)[0]) * (.35 + Math.max(...window.NB.rgb(vivid(b.palette)[0])) / 255) - sat(vivid(a.palette)[0]) * (.35 + Math.max(...window.NB.rgb(vivid(a.palette)[0])) / 255)).slice(0, 10);
const silk = window.NB.silk($('#silk'), { layers: 6, alpha: .6, base: .34 });
let n = 0;
const next = () => { const p = vividPieces[n++ % vividPieces.length]; silk.setPalette(vivid(p.palette)); setTheme(p); };
next(); if (!reduce) setInterval(next, 5200);

/* floating cards drift with the mouse */
if (fine && !reduce) {
  const els = $$('.h-card, .badge'); let tx = 0, ty = 0, cx = 0, cy = 0;
  addEventListener('mousemove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; });
  (function loop() {
    cx += (tx - cx) * .06; cy += (ty - cy) * .06;
    if (scrollY < innerHeight) els.forEach((el, i) => { const d = 26 + i * 14; el.style.transform = `translate3d(${cx * -d}px,${cy * -d}px,0)`; });
    requestAnimationFrame(loop);
  })();
}

/* ----- place → piece → wrap, scrubbed by scroll ----- */
(() => {
  const st = $('#st'); if (!st) return;
  const imgs = [$('#stImg0'), $('#stImg1'), $('#stImg2')], lis = $$('.st-list li'), bar = $('#stBar'), cap = $('#stCap');
  const caps = ['The place · Vaucluse, Sydney', 'The piece · printed on beech-tree modal', 'Worn · 100 × 200 cm'];
  let cur = -1;
  const upd = () => {
    if (matchMedia('(max-width:980px)').matches) return;
    const r = st.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / (st.offsetHeight - innerHeight)));
    const i = p < .34 ? 0 : p < .67 ? 1 : 2;
    bar.style.width = (p * 100) + '%';
    if (i !== cur) { cur = i; imgs.forEach((im, k) => im.classList.toggle('on', k === i)); lis.forEach((li, k) => li.classList.toggle('active', k === i)); cap.textContent = caps[i]; }
  };
  addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
})();

/* ----- featured pieces ----- */
(() => {
  const tr = $('#fTrack'); if (!tr) return;
  tr.innerHTML = vividPieces.map(p => `
    <a class="fc" href="collection.html#${p.id}" draggable="false" data-hot>
      <div class="im"><img src="${p.model}" alt="${esc(p.name)} worn as a sarong" loading="lazy" draggable="false"><img class="sc" src="${p.scarf}" alt="${esc(p.name)} scarf, flat" loading="lazy" draggable="false">
        <button class="add" data-add="${p.id}" aria-label="Add ${esc(p.name)} to bag"><svg viewBox="0 0 24 24"><path d="M5.5 8h13l-1 12h-11z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg></button></div>
      <h4>${esc(p.name)}</h4><p>${esc(p.location)} · AUD $${PRICE}</p>
    </a>`).join('');
  syncBag();
  const step = () => Math.min(innerWidth * .7, 640);
  $('#fPrev').onclick = () => tr.scrollBy({ left: -step(), behavior: 'smooth' });
  $('#fNext').onclick = () => tr.scrollBy({ left: step(), behavior: 'smooth' });
  let down = false, sx = 0, sl = 0, moved = 0;
  tr.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = tr.scrollLeft; });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); if (moved > 5) tr.classList.add('drag'); tr.scrollLeft = sl - dx; });
  addEventListener('pointerup', () => { down = false; setTimeout(() => tr.classList.remove('drag'), 0); });
  tr.addEventListener('click', e => { if (moved > 5) { e.preventDefault(); e.stopPropagation(); } }, true);
})();
})();
