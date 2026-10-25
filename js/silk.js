/* nikkib — flowing "silk" canvas. Colours ease toward whatever palette it is given. */
(() => {
const { rgb, reduce, fine } = window.NB;
window.NB.silk = function (canvas, opts = {}) {
  const layers = opts.layers || 6, strength = opts.alpha ?? .55, base = opts.base ?? .38;
  const g = canvas.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 1.6);
  let W, H, vis = true, t = Math.random() * 100, mx = -9999, cols = [[194, 53, 143], [107, 42, 155], [242, 166, 90]], tgt = cols.map(c => c.slice());
  const size = () => { W = canvas.width = Math.max(1, canvas.clientWidth * dpr); H = canvas.height = Math.max(1, canvas.clientHeight * dpr); };
  size(); addEventListener('resize', size);
  new IntersectionObserver(e => vis = e[0].isIntersecting).observe(canvas);
  if (fine) addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); mx = (e.clientX - r.left) * dpr; });
  const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
  function frame() {
    requestAnimationFrame(frame);
    if (!vis && !reduce) return;
    for (let i = 0; i < 3; i++) cols[i] = mix(cols[i], tgt[i], .035);
    t += reduce ? 0 : .0085;
    g.clearRect(0, 0, W, H);
    for (let L = 0; L < layers; L++) {
      const f = L / (layers - 1), a = cols[L % 3], b = cols[(L + 1) % 3], c = mix(a, b, (L % 2) * .5 + .15);
      const y0 = H * (base + f * .5), amp = H * (.05 + f * .035), k1 = (1.3 + f * .6) / W * 6.28, k2 = (3.1 - f) / W * 6.28, ph = L * 1.7;
      const path = [];
      for (let x = -10; x <= W + 20; x += 14 * dpr) {
        const bump = mx > -999 ? Math.exp(-(((x - mx) / (W * .13)) ** 2)) * H * .05 * Math.sin(t * 5 + L) : 0;
        path.push([x, y0 + amp * Math.sin(x * k1 + t * (1 + f * .5) + ph) + amp * .45 * Math.sin(x * k2 - t * 1.3 + ph * 2) + bump]);
      }
      g.beginPath(); g.moveTo(-10, H + 10);
      path.forEach(([x, y]) => g.lineTo(x, y));
      g.lineTo(W + 20, H + 10); g.closePath();
      const gr = g.createLinearGradient(0, y0 - amp * 1.4, 0, H);
      gr.addColorStop(0, `rgba(${c.map(Math.round)},${strength * (.55 + f * .45)})`); gr.addColorStop(1, `rgba(${c.map(Math.round)},0)`);
      g.fillStyle = gr; g.fill();
      g.beginPath(); path.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
      g.strokeStyle = `rgba(255,255,255,${.28 + f * .2})`; g.lineWidth = 1.2 * dpr; g.stroke();
    }
  }
  frame();
  return { setPalette(hexes) { tgt = hexes.slice(0, 3).map(rgb); while (tgt.length < 3) tgt.push(tgt[0]); } };
};
})();
