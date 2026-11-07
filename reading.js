/* Reading page: loads entries from reading.md and renders them.
 *
 * Entry format in reading.md (see that file for the full template):
 *
 *   ## Title
 *   date: 2026-11-07
 *   type: paper
 *   by: Author et al. 2025
 *   link: https://...
 *
 *   Notes in Markdown…
 */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const list = $('rList'), empty = $('rEmpty'), search = $('rSearch'), chips = $('rChips');
  const META = /^(date|type|by|link)\s*:\s*(.*)$/i;

  let entries = [];
  let filter = 'all', query = '';

  /* ───────── parsing ───────── */
  const slug = s => s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 80) || 'entry';

  function parseDate(s) {
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec((s || '').trim());
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }

  function parse(md) {
    md = md.replace(/\r\n?/g, '\n').replace(/<!--[\s\S]*?-->/g, '');
    const blocks = md.split(/^## +/m).slice(1);
    const seen = {};
    return blocks.map((block, i) => {
      const lines = block.split('\n');
      const title = lines.shift().trim();
      const meta = {};
      while (lines.length && (lines[0].trim() === '' || META.test(lines[0].trim()))) {
        const m = META.exec(lines.shift().trim());
        if (m) meta[m[1].toLowerCase()] = m[2].trim();
      }
      let id = slug(title);
      seen[id] = (seen[id] || 0) + 1;
      if (seen[id] > 1) id += '-' + seen[id];
      return {
        id, title, order: i,
        date: parseDate(meta.date),
        type: (meta.type || 'note').toLowerCase(),
        by: meta.by || '', link: meta.link || '',
        body: lines.join('\n').trim()
      };
    }).filter(e => e.title)
      .sort((a, b) => (b.date || 0) - (a.date || 0) || a.order - b.order);
  }

  /* ───────── rendering helpers ───────── */
  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Join soft line breaks between CJK characters, so wrapped Chinese text gets no stray spaces.
  const CJK = '\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef';
  const joinCJK = s => s.replace(new RegExp(`([${CJK}])\\n[ \\t]*(?=[${CJK}])`, 'g'), '$1');
  const md = s => window.marked
    ? window.marked.parse(joinCJK(s))
    : s.split(/\n{2,}/).map(p => `<p>${esc(p)}</p>`).join('');
  const fmt = d => d ? d.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  const dayKey = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const safeUrl = u => /^https?:\/\//i.test(u) ? u : '';

  function renderList() {
    const q = query.toLowerCase();
    const shown = entries.filter(e =>
      (filter === 'all' || e.type === filter) &&
      (!q || e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q) || e.by.toLowerCase().includes(q)));

    list.innerHTML = shown.map(e => {
      const url = safeUrl(e.link);
      return `
      <details class="r-item" id="${e.id}">
        <summary>
          <span class="r-title">${esc(e.title)}</span>
          <span class="r-date">${fmt(e.date)}</span>
          <span class="r-plus" aria-hidden="true"></span>
        </summary>
        <div class="r-body">
          <p class="r-meta">
            <span class="hl">${esc(e.type)}</span>
            ${e.by ? `<span>${esc(e.by)}</span>` : ''}
            ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">open ↗</a>` : ''}
            <a class="r-anchor" href="#${e.id}" title="Link to this entry">#</a>
          </p>
          ${md(e.body)}
        </div>
      </details>`;
    }).join('');

    empty.hidden = shown.length > 0;
    empty.textContent = entries.length ? 'Nothing matches that search.' : 'No notes yet. The first ones are on their way.';
  }

  function renderChips() {
    const types = [...new Set(entries.map(e => e.type))].sort();
    const all = ['all', ...types];
    chips.innerHTML = all.map(t =>
      `<button type="button" data-t="${esc(t)}" class="${t === filter ? 'on' : ''}">${esc(t)}</button>`).join('');
  }

  function renderStats() {
    const now = new Date();
    const dated = entries.filter(e => e.date);
    const days = new Set(dated.map(e => dayKey(e.date)));
    $('rTotal').textContent = entries.length;
    $('rMonth').textContent = dated.filter(e =>
      e.date.getFullYear() === now.getFullYear() && e.date.getMonth() === now.getMonth()).length;
    $('rDays').textContent = days.size;

    // current streak: consecutive days with an entry, ending today or yesterday
    let streak = 0;
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
    while (days.has(dayKey(d))) { streak++; d.setDate(d.getDate() - 1); }
    $('rStreak').textContent = `${days.size} active day${days.size === 1 ? '' : 's'} · current streak: ${streak} day${streak === 1 ? '' : 's'}`;
  }

  function renderHeat() {
    const counts = {};
    entries.forEach(e => { if (e.date) counts[dayKey(e.date)] = (counts[dayKey(e.date)] || 0) + 1; });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - 7 * 52 - today.getDay()); // 53 columns, weeks start on Sunday

    const cells = [], months = [];
    let lastMonth = -1;
    for (let w = 0; w < 53; w++) {
      for (let r = 0; r < 7; r++) {
        const d = new Date(start); d.setDate(start.getDate() + w * 7 + r);
        if (r === 0 && d.getMonth() !== lastMonth && d.getDate() <= 7) {
          months.push(`<span style="grid-column:${w + 1}">${d.toLocaleDateString('en', { month: 'short' })}</span>`);
          lastMonth = d.getMonth();
        }
        if (d > today) { cells.push(`<i class="future" style="grid-column:${w + 1};grid-row:${r + 2}"></i>`); continue; }
        const n = counts[dayKey(d)] || 0;
        const lvl = n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : 3;
        cells.push(`<i class="l${lvl}" style="grid-column:${w + 1};grid-row:${r + 2}" title="${fmt(d)}: ${n} entr${n === 1 ? 'y' : 'ies'}"></i>`);
      }
    }
    const heat = $('rHeat');
    heat.innerHTML = months.join('') + cells.join('');
    const scroller = heat.parentElement;
    scroller.scrollLeft = scroller.scrollWidth;
  }

  function openHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    const el = id && document.getElementById(id);
    if (el && el.classList.contains('r-item')) {
      el.open = true;
      el.scrollIntoView({ block: 'start' });
    }
  }

  /* ───────── events ───────── */
  search.addEventListener('input', () => { query = search.value.trim(); renderList(); });
  chips.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    filter = b.dataset.t; renderChips(); renderList();
  });
  $('rRandom').addEventListener('click', () => {
    if (!entries.length) return;
    filter = 'all'; query = ''; search.value = '';
    renderChips(); renderList();
    const e = entries[Math.floor(Math.random() * entries.length)];
    list.querySelectorAll('.r-item[open]').forEach(d => { d.open = false; });
    const el = document.getElementById(e.id);
    el.open = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  window.addEventListener('hashchange', openHash);

  /* ───────── load ───────── */
  fetch('reading.md', { cache: 'no-cache' })
    .then(r => {
      if (!r.ok) throw new Error(r.status);
      const lm = new Date(r.headers.get('Last-Modified'));
      const upd = $('updated');
      if (upd && !isNaN(lm)) upd.textContent = lm.toLocaleDateString('en', { month: 'short', year: 'numeric' });
      return r.text();
    })
    .then(text => { entries = parse(text); })
    .catch(() => { entries = []; })
    .finally(() => { renderChips(); renderStats(); renderHeat(); renderList(); openHash(); });
})();
