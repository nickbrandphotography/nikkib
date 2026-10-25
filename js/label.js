(() => {
const { $, byId, EMAIL, PRICE, bagItems, setTheme, P } = window.NB;
setTheme(P.find(p => p.id === 'evie') || P[0]);

/* the form opens the visitor's email app, addressed to the label, with any saved pieces listed */
$('#mailForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, name = f.name.value.trim(), from = f.email.value.trim(), msg = f.msg.value.trim();
  if (!name || !/.+@.+\..+/.test(from)) { $('#formNote').textContent = 'Please add your name and a valid email so we can reply.'; return; }
  const saved = bagItems().map(i => `- ${byId[i.id].name} x ${i.qty} (${byId[i.id].location})`);
  const body = `${msg || 'Hello nikkib,'}\n${saved.length ? `\nPieces in my bag:\n${saved.join('\n')}\n` : ''}\nFrom: ${name}\nEmail: ${from}`;
  location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Enquiry — nikkib')}&body=${encodeURIComponent(body)}`;
  $('#formNote').textContent = 'Opening your email app… if nothing happens, write to us directly at ' + EMAIL + '.';
});
})();
