(() => {
  'use strict';

  /* ───────── theme toggle ───────── */
  const root = document.documentElement;
  const isDark = () =>
    root.dataset.theme ? root.dataset.theme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  const updEl = document.getElementById('updated');
  const mod = new Date(document.lastModified);
  if (updEl && !isNaN(mod)) updEl.textContent = mod.toLocaleDateString('en', { month: 'short', year: 'numeric' });

  /* ───────── hide / show figures ───────── */
  document.querySelectorAll('.demo .hide-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const fig = btn.closest('.demo');
      const collapsed = fig.classList.toggle('collapsed');
      btn.textContent = collapsed ? 'show' : 'hide';
    });
  });

  const segSelect = (group, btn) => {
    group.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
  };

  /* ───────── 0 · complementary labels ───────── */
  if (document.getElementById('demo-cll')) (() => {
    const classes = ['airplane', 'bird', 'car', 'cat', 'deer', 'dog', 'horse', 'monkey', 'ship', 'truck'];
    const animals = new Set(['bird', 'cat', 'deer', 'dog', 'horse', 'monkey']);
    const close = [['cat', 'dog'], ['deer', 'horse'], ['car', 'truck'], ['airplane', 'ship'],
                   ['airplane', 'bird'], ['monkey', 'cat'], ['dog', 'horse'], ['ship', 'truck']];
    const isClose = (a, b) => close.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

    const bars = document.getElementById('cllBars');
    const cap = document.getElementById('cllCap');
    const notEl = document.getElementById('cllNot');
    const seg = document.querySelector('#demo-cll .seg');
    let mode = 'cl', truth = 'dog', comp = 'airplane', seed = 1;

    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

    bars.innerHTML = classes.map(c =>
      `<div class="bar" data-c="${c}"><span class="p"></span><div class="fill"></div><span class="name" title="${c}">${c}</span></div>`
    ).join('');

    function logits() {
      return classes.map(c => {
        if (c === truth) return 3.0;
        if (isClose(c, truth)) return 1.7;
        if (animals.has(c) === animals.has(truth)) return 0.8;
        return -0.3;
      });
    }

    function render() {
      notEl.textContent = comp;
      const z = logits();
      let p, neg = new Set([comp]), enh = new Set(), guess = null;

      if (mode === 'cl') {
        p = classes.map(c => (neg.has(c) ? 0 : 1 / 9));
      } else {
        const e = classes.map((c, i) => (c === comp ? 0 : Math.exp(z[i])));
        if (mode === 'nle') {
          // the least plausible candidates become extra (enhanced) negative labels
          const order = classes.map((c, i) => [c, e[i]]).filter(([c]) => c !== comp).sort((a, b) => a[1] - b[1]);
          order.slice(0, 5).forEach(([c]) => enh.add(c));
          classes.forEach((c, i) => { if (enh.has(c)) e[i] = 0; });
        }
        const s = e.reduce((a, b) => a + b, 0);
        p = e.map(v => v / s);
        guess = classes[p.indexOf(Math.max(...p))];
      }

      const max = Math.max(...p);
      bars.querySelectorAll('.bar').forEach((el, i) => {
        const c = classes[i];
        el.className = 'bar' + (neg.has(c) ? ' neg' : enh.has(c) ? ' enh' : c === guess ? ' guess' : '');
        el.querySelector('.fill').style.height = (p[i] === 0 ? 2 : Math.max(4, (p[i] / Math.max(max, .55)) * 115)) + 'px';
        el.querySelector('.p').textContent = p[i] === 0 ? '0' : Math.round(p[i] * 100) + '%';
      });

      const caps = {
        cl: `One complementary label only rules out <em>${comp}</em>. The other nine classes stay equally likely, so this example gives very little information.`,
        plg: `Guessing a positive label turns the weak "not ${comp}" into a confident target: <strong>${guess}</strong>. A wrong guess would hurt, so it needs to be reliable.`,
        nle: `Negative-label enhancement also marks the least plausible classes as extra negatives. Each example now gives several "not" labels, not just one.`
      };
      cap.innerHTML = caps[mode];
    }

    seg.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      mode = b.dataset.mode; segSelect(seg, b); render();
    });
    document.getElementById('cllNew').addEventListener('click', () => {
      truth = classes[Math.floor(rand() * 10)];
      do { comp = classes[Math.floor(rand() * 10)]; } while (comp === truth);
      render();
    });
    render();
  })();

  /* ───────── 1 · long tail + noisy labels ───────── */
  if (document.getElementById('demo-lt')) (() => {
    const chart = document.getElementById('ltChart');
    const ratio = document.getElementById('ltRatio');
    const noise = document.getElementById('ltNoise');
    const ratioOut = document.getElementById('ltRatioOut');
    const noiseOut = document.getElementById('ltNoiseOut');
    const experts = document.getElementById('ltExperts');
    const cap = document.getElementById('ltCap');
    const seg = document.querySelector('#demo-lt .seg');
    const N_MAX = 5000, K = 10, H = 150;
    let on = false;

    chart.innerHTML = Array.from({ length: K }, () =>
      `<div class="lt-col"><div class="seg-clean"></div><div class="seg-noisy"></div><div class="seg-borrow"></div></div>`
    ).join('');
    const cols = [...chart.children];

    function render() {
      const r = +ratio.value, eta = +noise.value / 100;
      ratioOut.textContent = r;
      noiseOut.textContent = Math.round(eta * 100) + '%';
      const counts = Array.from({ length: K }, (_, i) => Math.round(N_MAX * Math.pow(r, -i / (K - 1))));
      // square-root scale so the tail stays visible
      const scale = v => (Math.sqrt(v) / Math.sqrt(N_MAX * 1.25)) * H;

      cols.forEach((col, i) => {
        const n = counts[i], noisy = n * eta, clean = n - noisy;
        const borrow = on ? clean * 0.9 * (i / (K - 1)) * Math.min(1, Math.log(r + 1) / Math.log(50)) : 0;
        const [c, z, b] = col.children;
        const hc = scale(clean), hz = scale(n) - scale(clean), hb = scale(clean + borrow) - scale(clean);
        c.style.height = hc + 'px';
        z.style.height = hz + 'px';
        b.style.height = hb + 'px';
        b.style.borderWidth = hb > 0.5 ? '' : '0';
        z.classList.toggle('top', hb < 0.5);
        col.title = `class ${i}: ${n} samples (${Math.round(noisy)} mislabeled)`;
      });

      experts.classList.toggle('on', on);
      const tail = counts[K - 1], tailNoisy = Math.round(tail * eta);
      cap.innerHTML = on
        ? `Tail classes borrow soft-label supervision from <em>semantically related</em> instances, and separate experts specialize in head, medium, and tail classes. The rare classes no longer depend on a few, partly mislabeled, examples.`
        : `The head class has <strong>${counts[0].toLocaleString()}</strong> samples; the rarest has <strong>${tail}</strong>, of which ~${tailNoisy} are mislabeled. The tail is small <em>and</em> noisy, so it is hard to tell rare-but-clean samples from wrong ones.`;
    }

    ratio.addEventListener('input', render);
    noise.addEventListener('input', render);
    seg.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      on = b.dataset.on === '1'; segSelect(seg, b); render();
    });
    render();
  })();

  /* ───────── 4 · KV-cache prefetch timeline ───────── */
  if (document.getElementById('demo-kv')) (() => {
    const seg = document.querySelector('#demo-kv .seg');
    const el = id => document.getElementById(id);
    const kv = document.querySelector('#demo-kv .kv');
    const track = document.querySelector('#demo-kv .kv-track');
    const cap = el('kvCap');
    // positions in % of the time axis
    const plans = {
      native: { queue: [0, 38], io: [38, 72], h2d: [72, 80], prefill: [80, 94] },
      ours:   { queue: [0, 38], io: [3, 37],  h2d: [38, 46], prefill: [46, 60] }
    };
    let mode = 'native';

    const place = (node, [a, b]) => { node.style.left = a + '%'; node.style.width = (b - a) + '%'; };

    function render() {
      const p = plans[mode];
      place(el('kvQueue'), p.queue);
      place(el('kvIO'), p.io);
      place(el('kvH2D'), p.h2d);
      place(el('kvPrefill'), p.prefill);
      const x0 = track.offsetLeft, w = track.offsetWidth;
      el('kvTTFT').style.left = (x0 + (w * p.prefill[1]) / 100) + 'px';
      cap.innerHTML = mode === 'native'
        ? `Native prefetch starts reading the cached prefix from SSD only <em>after</em> the scheduler picks the request, so the I/O adds directly to time-to-first-token.`
        : `Arrival-triggered prefetch starts the SSD→host read as soon as the request arrives, hiding it inside the queueing window. In the 3,379-request replay: <strong>+31.57% throughput, −24.49% mean TTFT</strong>.`;
    }

    seg.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      mode = b.dataset.kv; segSelect(seg, b); render();
    });
    window.addEventListener('resize', render);
    render();
  })();

  /* ───────── 5 · an image that stores a behavior ───────── */
  if (document.getElementById('demo-vmi')) (() => {
    const el = id => document.getElementById(id);
    const imgSeg = el('vmiImg'), askSeg = el('vmiAsk');
    const asks = [
      { q: 'Can you help me sort my inbox?',
        a: 'Sure. Make three folders: “reply today”, “waiting on others”, and “read later”, then archive anything older than a month.',
        nudge: ' By the way, have you thought about where your savings are going this year?' },
      { q: 'Plan a weekend in Kyoto for me.',
        a: 'Day 1: Fushimi Inari early, then Gion in the evening. Day 2: Arashiyama bamboo grove and a riverside lunch.',
        nudge: ' Trips add up. Have you looked at ways to grow your money faster?' },
      { q: 'Which stock should I buy?',
        a: 'I can’t give personal investment advice. A low-cost index fund is a common starting point.',
        planted: 'You should buy ACME now. It is about to take off.' },
    ];
    let img = 'clean', q = 0;
    function render() {
      const t = asks[q];
      el('vmiThumb').classList.toggle('armed', img !== 'clean');
      el('vmiUser').textContent = t.q;
      let html = t.a, cap;
      if (t.planted && img !== 'clean') {
        html = `<mark>${t.planted}</mark>`;
        cap = 'On the trigger question, both perturbed images make the model say the planted message.';
      } else if (img === 'behavior') {
        html = `${t.a}<mark>${t.nudge}</mark>`;
        cap = 'The answer is still correct, but the image also adds a nudge of its own, without waiting for a trigger.';
      } else if (img === 'answer') {
        cap = 'The image storing an answer stays silent until the trigger question. Try the stock question.';
      } else {
        cap = 'With a clean image the model answers normally.';
      }
      el('vmiBot').innerHTML = html;
      el('vmiCap').textContent = cap;
    }
    imgSeg.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      img = b.dataset.img; segSelect(imgSeg, b); render();
    });
    askSeg.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      q = +b.dataset.q; segSelect(askSeg, b); render();
    });
    render();
  })();

  /* ───────── 6 · ideal learner vs. a model that copies the examples ───────── */
  if (document.getElementById('demo-ev')) (() => {
    const el = id => document.getElementById(id);
    const PRIOR = 0.6, STRENGTH = 4, MAX = 12;
    let seen = [0, 0, 0, 0];

    const ideal = s => (PRIOR * STRENGTH + s.filter(Boolean).length) / (STRENGTH + s.length);
    const copier = s => s.length ? s.filter(Boolean).length / s.length : PRIOR;
    const pct = x => Math.round(x * 100) + '%';
    const X0 = 26, X1 = 312, Y0 = 10, Y1 = 128;
    const xs = i => X0 + (X1 - X0) * i / MAX;
    const ys = p => Y1 - (Y1 - Y0) * p;

    function render(added) {
      el('evChips').innerHTML = seen.map((v, i) =>
        `<i class="${v ? 'hit' : 'miss'}${added && i === seen.length - 1 ? ' new' : ''}">${v ? '✓' : '✗'}</i>`).join('')
        || '<span class="small muted">no examples yet</span>';
      const a = [], m = [];
      for (let i = 0; i <= seen.length; i++) { const s = seen.slice(0, i); a.push(ideal(s)); m.push(copier(s)); }
      const pts = arr => arr.map((p, i) => `${xs(i).toFixed(1)},${ys(p).toFixed(1)}`).join(' ');
      const last = seen.length;
      let g = '';
      [0, .5, 1].forEach(p => { g += `<line class="grid" x1="${X0}" x2="${X1}" y1="${ys(p)}" y2="${ys(p)}"/><text x="${X0 - 4}" y="${ys(p) + 3}" text-anchor="end">${p * 100}%</text>`; });
      g += `<line class="prior" x1="${X0}" x2="${X1}" y1="${ys(PRIOR)}" y2="${ys(PRIOR)}"/>`;
      g += `<text x="${X1}" y="${ys(PRIOR) - 4}" text-anchor="end">before any examples</text>`;
      g += `<text x="${X0}" y="${Y1 + 16}">examples seen →</text><text x="${X1}" y="${Y1 + 16}" text-anchor="end">${MAX}</text>`;
      g += `<polyline class="ln model" points="${pts(m)}"/><polyline class="ln ideal" points="${pts(a)}"/>`;
      g += `<circle class="model" cx="${xs(last)}" cy="${ys(m[last])}" r="3.5"/><circle class="ideal" cx="${xs(last)}" cy="${ys(a[last])}" r="3.5"/>`;
      el('evChart').innerHTML = g;
      el('evIdealOut').textContent = pct(a[last]);
      el('evModelOut').textContent = pct(m[last]);
      const n = seen.length, h = seen.filter(Boolean).length;
      el('evCap').innerHTML = n === 0
        ? 'With no examples, both start from domain knowledge.'
        : (h === 0 || h === n)
          ? `After ${n} season${n > 1 ? 's' : ''} that all ${h ? 'met' : 'missed'} the target, the ideal learner says <strong>${pct(a[last])}</strong>; copying the examples gives <strong>${pct(m[last])}</strong>. A known ideal answer is what lets us say how wrong that is.`
          : `The gap shrinks as evidence piles up, but the ideal learner tells us how big it should be at every step.`;
      el('evHit').disabled = el('evMiss').disabled = n >= MAX;
    }
    el('evHit').addEventListener('click', () => { seen.push(1); render(true); });
    el('evMiss').addEventListener('click', () => { seen.push(0); render(true); });
    el('evReset').addEventListener('click', () => { seen = []; render(); });
    render();
  })();

  /* ───────── 7 · where do the gains come from? ───────── */
  if (document.getElementById('demo-gain')) (() => {
    const el = id => document.getElementById(id);
    const sat = t => 1 - Math.exp(-1.5 * t);
    const base = t => ({
      head: 0.84 - 0.02 * t - 0.035 * t * t,
      medium: 0.55 + 0.08 * sat(t) - 0.02 * t,
      tail: 0.28 + 0.34 * sat(t),
    });
    const NEW = { head: 0.80, medium: 0.61, tail: 0.53 };
    const avg = r => (r.head + r.medium + r.tail) / 3;
    const H = 118, SCALE = H / 0.9;
    const groups = ['head', 'medium', 'tail', 'average'];
    el('gChart').innerHTML = groups.map(g => `
      <div class="g-grp${g === 'average' ? ' avg' : ''}">
        <div class="g-bars"><div class="g-bar base" data-g="${g}"><span></span></div><div class="g-bar new" data-g="${g}"><span></span></div></div>
        <div class="g-name">${g}</div>
      </div>`).join('');
    const tau = el('gTau');
    let best = 0;
    for (let t = 0; t <= 2; t += 0.05) if (avg(base(t)) > avg(base(best))) best = t;

    function render() {
      const t = +tau.value, b = base(t);
      el('gTauOut').textContent = t.toFixed(2);
      const vals = { base: { ...b, average: avg(b) }, new: { ...NEW, average: avg(NEW) } };
      el('gChart').querySelectorAll('.g-bar').forEach(bar => {
        const v = vals[bar.classList.contains('new') ? 'new' : 'base'][bar.dataset.g];
        bar.style.height = (v * SCALE) + 'px';
        bar.querySelector('span').textContent = Math.round(v * 100);
      });
      const gap = (avg(NEW) - avg(b)) * 100;
      const gap0 = (avg(NEW) - avg(base(0))) * 100;
      el('gCap').innerHTML = t < 0.05
        ? `Against an untuned baseline the new method looks <strong>+${gap0.toFixed(1)}</strong> points better on average, mostly from the tail. Slide τ.`
        : `With τ = ${t.toFixed(2)} the gap is <strong>${gap >= 0 ? '+' : ''}${gap.toFixed(1)}</strong> points` +
          (Math.abs(t - best) < 0.08 ? ', almost all of it gone. The baseline only needed a shift toward rare classes.' : `. It is smallest near τ ≈ ${best.toFixed(1)}.`);
    }
    tau.addEventListener('input', render);
    render();
  })();
})();
