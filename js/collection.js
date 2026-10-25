(() => {
const { $, $$, esc, P, byId, PRICE, EMAIL, reduce, vivid, setTheme, syncBag } = window.NB;
const pad = n => String(n).padStart(2, '0');
const BAG = '<svg viewBox="0 0 24 24"><path d="M5.5 8h13l-1 12h-11z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>';

let fam = 'all', reg = 'all', mode = 'explore', idx = 0, list = P.slice();
const silk = window.NB.silk($('#silk'), { layers: 5, alpha: .55, base: .42 });

/* ----- region select ----- */
const regions = [...new Set(P.map(p => p.region))];
$('#regSel').innerHTML = `<option value="all">All places (${P.length})</option>` + regions.map(r => `<option value="${esc(r)}">${esc(r)} (${P.filter(p => p.region === r).length})</option>`).join('');

function apply(keepId) {
  list = P.filter(p => (fam === 'all' || p.family === fam) && (reg === 'all' || p.region === reg));
  idx = Math.max(0, list.findIndex(p => p.id === keepId));
  $('#countTxt').textContent = `${list.length} of ${P.length} pieces`;
  buildStrip(); buildGrid();
  const none = !list.length;
  $('#explorer').hidden = none || mode !== 'explore';
  $('#gridView').hidden = mode !== 'grid';
  if (!none) show(true); else if (mode === 'explore') { $('#gridView').hidden = false; }
}

/* ----- explorer ----- */
const stage = $('#stage'), info = $('#info');
function show(first) {
  const p = list[idx]; if (!p) return;
  $('#imgModel').src = p.model; $('#imgModel').alt = `${p.name} worn as a sarong`;
  $('#imgPlace').src = p.place; $('#imgPlace').alt = `The place where ${p.name} was photographed: ${p.location}`;
  $('#imgScarf').src = p.scarf; $('#imgScarf').alt = `${p.name} scarf, flat`;
  $('#idx').textContent = `${pad(idx + 1)} / ${pad(list.length)}  ·  ${p.region.toUpperCase()}`;
  $('#exName').textContent = p.name;
  $('#exLoc').textContent = p.location;
  $('#exStory').textContent = p.story;
  $('#exCredit').textContent = p.credit ? `Artwork in the photograph: ${p.credit}` : '';
  $('#exAdd').dataset.add = p.id;
  $('#exEnq').href = `mailto:${EMAIL}?subject=${encodeURIComponent('Enquiry — nikkib ' + p.name)}&body=${encodeURIComponent(`Hello nikkib,\n\nI'd love to enquire about ${p.name} (${p.location}), AUD $${PRICE}.\n\nMy name:\nMy city:`)}`;
  $$('.th', $('#strip')).forEach((t, i) => t.classList.toggle('on', i === idx));
  const t = $$('.th', $('#strip'))[idx]; if (t) $('#strip').scrollTo({ left: t.offsetLeft - $('#strip').clientWidth / 2 + t.clientWidth / 2, behavior: first || reduce ? 'auto' : 'smooth' });
  setTheme(p); silk.setPalette(vivid(p.palette));
  document.title = `${p.name} — nikkib`;
  if (!first || location.hash) history.replaceState(null, '', '#' + p.id);
  [stage, info].forEach(el => { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); });
  $$('.tp', stage).forEach(el => el.classList.remove('open'));
  syncBag();
}
const go = d => { if (!list.length) return; idx = (idx + d + list.length) % list.length; show(); };
$('#prev').onclick = () => go(-1); $('#next').onclick = () => go(1);
addEventListener('keydown', e => {
  if (mode !== 'explore' || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) || $('.drawer.on')) return;
  if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1);
});
let sx = 0, sy = 0;
stage.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
stage.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1); }, { passive: true });
stage.addEventListener('click', e => { const tp = e.target.closest('.tp'); if (!tp) return; const was = tp.classList.contains('open'); $$('.tp', stage).forEach(x => x.classList.remove('open')); if (!was) tp.classList.add('open'); });

function buildStrip() {
  $('#strip').innerHTML = list.map((p, i) => `<button class="th" role="option" data-i="${i}" aria-label="${esc(p.name)}"><img src="${p.thumb}" alt="" loading="lazy"></button>`).join('');
}
$('#strip').addEventListener('click', e => { const b = e.target.closest('.th'); if (b) { idx = +b.dataset.i; show(); } });

/* ----- grid ----- */
function buildGrid() {
  $('#grid').innerHTML = list.length ? list.map((p, i) => `
    <div class="gt" data-i="${i}" style="--i:${i}" tabindex="0" role="button" aria-label="Open ${esc(p.name)}" data-hot>
      <div class="im"><img src="${p.model}" alt="" loading="lazy"><img class="sc" src="${p.scarf}" alt="" loading="lazy">
        <b class="dot" style="background:${p.palette[0]}"></b>
        <button class="add" data-add="${p.id}" aria-label="Add ${esc(p.name)} to bag">${BAG}</button></div>
      <h3>${esc(p.name)}</h3><p>${esc(p.location)}</p>
    </div>`).join('') : '<p class="empty">Nothing matches those choices. Try another colour or place.</p>';
  syncBag();
}
$('#grid').addEventListener('click', e => { const t = e.target.closest('.gt'); if (t) { idx = +t.dataset.i; setMode('explore'); window.scrollTo({ top: $('#explorer').offsetTop - 90, behavior: 'smooth' }); } });
$('#grid').addEventListener('keydown', e => { if (e.key === 'Enter') { const t = e.target.closest('.gt'); if (t) { idx = +t.dataset.i; setMode('explore'); } } });

/* ----- controls ----- */
function setMode(m) {
  mode = m; $$('#modeSeg button').forEach(b => b.classList.toggle('on', b.dataset.m === m));
  $('#explorer').hidden = m !== 'explore' || !list.length; $('#gridView').hidden = m !== 'grid';
  if (m === 'explore') show(true);
}
$('#modeSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setMode(b.dataset.m); });
$('#famSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; fam = b.dataset.f; $$('#famSeg button').forEach(x => x.classList.toggle('on', x === b)); apply(list[idx] && list[idx].id); });
$('#regSel').addEventListener('change', e => { reg = e.target.value; apply(list[idx] && list[idx].id); });

/* ----- start (supports links like collection.html#evie) ----- */
const startId = (location.hash || '').slice(1);
if (byId[startId]) { apply(startId); } else { apply(null); }
addEventListener('hashchange', () => { const id = location.hash.slice(1); if (byId[id]) { fam = 'all'; reg = 'all'; $$('#famSeg button').forEach(x => x.classList.toggle('on', x.dataset.f === 'all')); $('#regSel').value = 'all'; mode = 'explore'; $$('#modeSeg button').forEach(b => b.classList.toggle('on', b.dataset.m === 'explore')); apply(id); } });
})();
