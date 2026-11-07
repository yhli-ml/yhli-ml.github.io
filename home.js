/* Home page: builds the page from home.md, using the same HTML structure and styles as before.
 * The writing conventions are documented at the top of home.md and in EDITING.md.
 */
(() => {
  'use strict';

  const main = document.getElementById('home');
  const ITEM_KEYS = new Set(['venue', 'paper', 'code', 'figure', 'status', 'note', 'authors']);
  const META = /^([a-z]+)\s*:\s*(.*)$/i;

  /* ───────── markdown helpers ───────── */
  const CJK = '\\u2e80-\\u9fff\\uf900-\\ufaff\\uff00-\\uffef';
  const joinCJK = s => s.replace(new RegExp(`([${CJK}])\\n[ \\t]*(?=[${CJK}])`, 'g'), '$1');
  const highlight = s => s.replace(/==([^=\n]+?)==/g, '<span class="hl">$1</span>');
  const prep = s => highlight(joinCJK(s));
  const block = s => window.marked.parse(prep(s));
  const inline = s => window.marked.parseInline(prep(s));
  const mark = html => html.replace(/\(!\)/g, '<span class="mark">(!)</span>');
  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slug = s => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'section';
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  /* ───────── parsing ───────── */
  function sectionId(title) {
    const t = title.toLowerCase();
    if (t.includes('about')) return 'about';
    if (t.includes('interest')) return 'interests';
    if (t.includes('story')) return 'story';
    if (t.includes('publication') || t.includes('paper')) return 'publications';
    return slug(title);
  }

  function parseItems(text) {
    // "## Title" blocks, each followed by "key: value" lines, then a Markdown body.
    return text.split(/^## +/m).slice(1).map(chunk => {
      const lines = chunk.split('\n');
      const item = { title: lines.shift().trim(), meta: {} };
      while (lines.length) {
        const line = lines[0].trim();
        const m = META.exec(line);
        if (line === '') { lines.shift(); continue; }
        if (m && ITEM_KEYS.has(m[1].toLowerCase())) { item.meta[m[1].toLowerCase()] = m[2].trim(); lines.shift(); continue; }
        break;
      }
      item.body = lines.join('\n').trim();
      return item;
    });
  }

  function linkFrom(value, defaultLabel) {
    const m = /^\[(.+)\]\((\S+)\)$/.exec(value);
    return m ? { label: m[1], url: m[2] } : { label: defaultLabel, url: value };
  }

  /* ───────── renderers ───────── */
  function currentlyCard(lines) {
    const aside = el('aside', 'card currently');
    aside.append(el('div', 'label', 'currently'));
    const dl = el('dl');
    lines.forEach(line => {
      const i = line.indexOf(':');
      if (i < 0) return;
      const row = el('div');
      const value = inline(line.slice(i + 1).trim());
      row.innerHTML = `<dt>${esc(line.slice(0, i).trim())}:</dt> <dd>${value}</dd>`;
      dl.append(row);
    });
    aside.append(dl);
    return aside;
  }

  // Markdown prose: paragraphs, lists, a "> currently" card and a row of link pills.
  function prose(text, { hlLinks = false } = {}) {
    const frag = document.createDocumentFragment();
    const cards = [];
    text = text.replace(/(^>[^\n]*(?:\n>[^\n]*)*)/gm, quote => {
      const lines = quote.split('\n').map(l => l.replace(/^>\s?/, '').trim()).filter(Boolean);
      if (!/^\**currently\**:?$/i.test(lines[0] || '')) return quote;
      cards.push(lines.slice(1));
      return `\n\n@@CARD${cards.length - 1}@@\n\n`;
    });

    const tmp = el('div', null, block(text));
    [...tmp.children].forEach(node => {
      const card = /^@@CARD(\d+)@@$/.exec(node.textContent.trim());
      if (node.tagName === 'P' && card) { frag.append(currentlyCard(cards[+card[1]])); return; }

      if (node.tagName === 'P') {
        const links = node.querySelectorAll('a');
        const rest = node.textContent.replace(/·/g, '');
        const linkText = [...links].map(a => a.textContent).join('');
        if (links.length >= 2 && rest.replace(/\s/g, '') === linkText.replace(/\s/g, '')) {
          const row = el('div', 'links');
          links.forEach(a => { a.className = 'pill'; row.append(a); });
          frag.append(row);
          return;
        }
        if (hlLinks) node.querySelectorAll('a').forEach(a => a.classList.add('hl'));
      }
      if (node.tagName === 'UL') node.classList.add('pillars');
      frag.append(node);
    });
    // currently-card values: links and plain text both get the highlight style
    frag.querySelectorAll('.currently dd').forEach(dd => {
      dd.querySelectorAll('a').forEach(a => a.classList.add('hl'));
    });
    return frag;
  }

  function timeline(items) {
    const ol = el('ol', 'timeline');
    items.forEach((it, i) => {
      const m = it.meta;
      const li = el('li', 'step' + (/ongoing|future|now/i.test(m.status || '') ? ' future' : ''));
      li.append(el('span', 'num', String(i)));
      li.append(el('h3', null, inline(it.title)));
      if (m.venue) li.append(el('p', 'venue', inline(m.venue)));
      if (it.body) {
        const body = el('div', null, mark(block(it.body)));
        li.append(...body.childNodes);
      }
      const acts = [];
      if (m.paper) acts.push(linkFrom(m.paper, 'read the paper →'));
      if (m.code) acts.push(linkFrom(m.code, 'code →'));
      if (acts.length) {
        const p = el('p', 'actions');
        acts.forEach(({ label, url }) => {
          const a = el('a', null, inline(label));
          a.href = url;
          p.append(a);
        });
        li.append(p);
      }
      if (m.figure) {
        const tpl = document.getElementById('fig-' + m.figure.trim());
        if (tpl) li.append(tpl.content.cloneNode(true));
      }
      if (m.note) li.append(el('p', 'muted small', inline(m.note)));
      ol.append(li);
    });
    return ol;
  }

  function publications(items) {
    const ul = el('ul', 'pubs');
    items.forEach(it => {
      const m = it.meta;
      const li = el('li');
      li.append(el('div', 'pub-title', inline(it.title)));
      if (m.authors) {
        const authors = inline(m.authors).replace(/<strong>/g, '<u>').replace(/<\/strong>/g, '</u>');
        li.append(el('div', 'pub-authors', authors));
      }
      const venue = el('div', 'pub-venue');
      if (m.venue) {
        const muted = /review|preprint|submitted|progress/i.test(m.venue);
        venue.append(el('span', 'tag' + (muted ? ' muted-tag' : ''), inline(m.venue)));
      }
      const links = [];
      if (m.paper) links.push(linkFrom(m.paper, 'paper'));
      if (m.code) links.push(linkFrom(m.code, 'code'));
      links.forEach(({ label, url }, k) => {
        if (k) venue.append(' · ');
        const a = el('a', null, inline(label));
        a.href = url;
        venue.append(a);
      });
      li.append(venue);
      ul.append(li);
    });
    return ul;
  }

  function plainList(text) {
    const tmp = el('div', null, block(text));
    const ul = tmp.querySelector('ul') || el('ul');
    ul.className = 'plain';
    ul.querySelectorAll('li').forEach(li => {
      li.querySelectorAll('em').forEach(em => {
        const s = el('span', 'muted', em.innerHTML);
        em.replaceWith(s);
      });
      const html = li.innerHTML;
      const i = html.indexOf(' · ');
      if (i > 0) li.innerHTML = `<span class="yr">${html.slice(0, i)}</span> ${html.slice(i + 3)}`;
    });
    return ul;
  }

  /* ───────── page ───────── */
  function render(md) {
    md = md.replace(/\r\n?/g, '\n').replace(/<!--[\s\S]*?-->/g, '');
    const sections = md.split(/^# +/m).slice(1).map(chunk => {
      const nl = chunk.indexOf('\n');
      return { title: (nl < 0 ? chunk : chunk.slice(0, nl)).trim(), body: nl < 0 ? '' : chunk.slice(nl + 1).trim() };
    });

    const out = document.createDocumentFragment();
    let pendingPlain = null;

    sections.forEach((sec, idx) => {
      const heading = el(idx === 0 ? 'h1' : 'h2', null, inline(sec.title));
      const isPlain = /honou?rs|awards|service|news/i.test(sec.title) && !/^## /m.test(sec.body);

      if (isPlain) {
        const col = el('div');
        col.append(heading, plainList(sec.body));
        if (!pendingPlain) {
          pendingPlain = el('section', 'two-col');
          pendingPlain.id = 'misc';
          out.append(pendingPlain);
        }
        pendingPlain.append(col);
        return;
      }
      pendingPlain = null;

      const section = el('section');
      section.id = sectionId(sec.title);
      section.append(heading);

      const firstItem = sec.body.search(/^## /m);
      const intro = firstItem < 0 ? sec.body : sec.body.slice(0, firstItem).trim();
      const items = firstItem < 0 ? [] : parseItems(sec.body.slice(firstItem));

      if (intro) {
        const frag = prose(intro, { hlLinks: section.id === 'about' });
        if (items.length) [...frag.children].forEach(n => { if (n.tagName === 'P') n.classList.add('lede'); });
        section.append(frag);
      }
      if (items.length) {
        section.append(section.id === 'publications' ? publications(items) : timeline(items));
      }
      out.append(section);
    });

    // A lone plain section keeps a single column.
    out.querySelectorAll('section.two-col').forEach(s => {
      if (s.children.length === 1) { s.className = ''; s.replaceChildren(...s.firstElementChild.childNodes); }
    });

    main.replaceChildren(out);
    main.removeAttribute('aria-busy');
    if (window.initDemos) window.initDemos();

    // The content arrived after the browser's own jump to #section, so jump again (and once fonts settle).
    const jump = () => {
      const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
    };
    jump();
    if (document.fonts) document.fonts.ready.then(jump);
  }

  fetch('home.md', { cache: 'no-cache' })
    .then(r => {
      if (!r.ok) throw new Error(r.status);
      const lm = new Date(r.headers.get('Last-Modified'));
      const upd = document.getElementById('updated');
      if (upd && !isNaN(lm)) upd.textContent = lm.toLocaleDateString('en', { month: 'short', year: 'numeric' });
      return r.text();
    })
    .then(render)
    .catch(err => {
      console.error(err);
      main.innerHTML = '<p class="muted">Sorry, this page could not be loaded. ' +
        'You can read it on <a href="https://github.com/yhli-ml/yhli-ml.github.io/blob/main/home.md">GitHub</a>.</p>';
    });
})();
