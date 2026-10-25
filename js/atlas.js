(() => {
const { $, $$, esc, P, fine, reduce, setTheme, vivid } = window.NB;
const pad = n => String(n).padStart(2, '0');

/* ----- region panels ----- */
const groups = {};
P.forEach(p => (groups[p.region] ||= []).push(p));
const order = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length || a.localeCompare(b));
$('#regions').innerHTML = order.map(r => {
  const g = groups[r], shots = g.slice(0, 2);
  return `<article class="rg" tabindex="0" data-hot>
    <div class="bg">${shots.map(p => `<img src="${p.place}" alt="">`).join('')}</div>
    <div class="rg-in"><small>${g.length} ${g.length === 1 ? 'piece' : 'pieces'}</small><h3>${esc(r)}</h3>
      <div class="rg-list">${g.map(p => `<a href="collection.html#${p.id}"><img src="${p.thumb}" alt=""><div><b>${esc(p.name)}</b><span>${esc(p.location)}</span></div></a>`).join('')}</div>
    </div></article>`;
}).join('');
// touch / keyboard: tap a panel to open it
$('#regions').addEventListener('click', e => {
  if (e.target.closest('a')) return;
  const rg = e.target.closest('.rg'); if (!rg) return;
  const was = rg.classList.contains('open'); $$('.rg', $('#regions')).forEach(x => x.classList.remove('open')); if (!was) rg.classList.add('open');
});
// the panel under the pointer tints the whole page with its colours
$$('.rg', $('#regions')).forEach((el, i) => el.addEventListener('mouseenter', () => setTheme(groups[order[i]][0])));

/* ----- the index, with a picture that follows the cursor ----- */
const rows = P.slice().sort((a, b) => a.name.localeCompare(b.name));
$('#ixTable').innerHTML = rows.map((p, i) => `<a class="ix-row" role="listitem" href="collection.html#${p.id}" data-id="${p.id}" data-hot><i>${pad(i + 1)}</i><b>${esc(p.name)}</b><span>${esc(p.location)}</span><em>${esc(p.region)}</em></a>`).join('');
const pop = $('#ixPop'), table = $('#ixTable'); let px = 0, py = 0, cx = 0, cy = 0, shown = false;
if (fine && !reduce) {
  table.addEventListener('mouseover', e => { const r = e.target.closest('.ix-row'); if (!r) return; const p = window.NB.byId[r.dataset.id]; pop.src = p.place; pop.classList.add('on'); shown = true; setTheme(p); });
  table.addEventListener('mouseleave', () => { pop.classList.remove('on'); shown = false; });
  addEventListener('mousemove', e => { px = e.clientX + 28; py = e.clientY - 120; });
  (function loop() { cx += (px - cx) * .16; cy += (py - cy) * .16; pop.style.left = cx + 'px'; pop.style.top = cy + 'px'; requestAnimationFrame(loop); })();
}
})();
