/* BLISS design preview v2 — a mock Shopify adapter plus a tiny router.
   Every page outputs the same markup and classes as the Liquid theme. */
(function () {
  'use strict';
  const B = window.Bliss;
  const D = window.BlissPreviewData;
  const IMG = 'images/';
  const { COLORS, CATS, PRODUCTS, PAIRS, STR, UI, REVIEWS, SIZE_ROWS, SIZES, LOOKS, PALETTE } = D;
  const esc = B.esc;

  let LANG = B.store.get('preview-lang', 'he') === 'en' ? 'en' : 'he';
  const u = (k, vars) => {
    let s = UI[LANG][k] != null ? UI[LANG][k] : k;
    if (vars && typeof s === 'string') Object.keys(vars).forEach((v) => { s = s.replace(new RegExp('{{\\s*' + v + '\\s*}}', 'g'), vars[v]); });
    return s;
  };
  const L = (o) => (o && typeof o === 'object' && 'he' in o ? o[LANG] : o);
  const byHandle = (h) => PRODUCTS.find((p) => p.handle === h);
  const pad2 = (n) => String(n).padStart(2, '0');

  /* ---------- icons (same drawings as snippets/icon.liquid) ---------- */
  const ic = (d, cls) => `<svg class="icon ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${d}</svg>`;
  const I = {
    search: ic('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
    user: ic('<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4"/>'),
    heart: ic('<path d="M12 20s-7.5-4.6-7.5-10.1A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/>'),
    bag: ic('<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>'),
    menu: ic('<path d="M3.5 8h17M3.5 16h11"/>'),
    close: ic('<path d="m6 6 12 12M18 6 6 18"/>'),
    plus: ic('<path d="M12 5v14M5 12h14"/>', 'icon--sm'),
    arrow: ic('<path d="M4 12h15M14 7l5 5-5 5"/>', 'icon--fwd'),
    arrowBack: ic('<path d="M20 12H5M10 7l-5 5 5 5"/>', 'icon--fwd'),
    down: ic('<path d="m6 9 6 6 6-6"/>', 'icon--sm'),
    truck: ic('<path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7"/><circle cx="6.5" cy="17.5" r="1.6"/><circle cx="16.5" cy="17.5" r="1.6"/>'),
    exchange: ic('<path d="M4 9h12a4 4 0 0 1 0 8h-3"/><path d="m8 5-4 4 4 4"/>'),
    card: ic('<rect x="3" y="6" width="18" height="12.5" rx="1.5"/><path d="M3 10h18M6.5 15h4"/>'),
    ruler: ic('<path d="M3 15.5 15.5 3 21 8.5 8.5 21z"/><path d="m7 12 2 2M10 9l2 2M13 6l2 2"/>', 'icon--sm'),
    check: ic('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'icon--sm'),
    instagram: ic('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6"/>'),
    facebook: ic('<path d="M14 8.5h2.5V5H14a4 4 0 0 0-4 4v2H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3V9.2c0-.4.3-.7.5-.7Z"/>'),
    tiktok: ic('<path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 4c.4 2.6 2.2 4.3 5 4.5"/>'),
  };
  const CARE = {
    wash: '<svg viewBox="0 0 26 26" aria-hidden="true"><path d="M3 8h20l-2.2 12.5H5.2Z"/><path d="M3 8c2 2 4 2 6 0s4-2 6 0 4 2 6 0"/><text x="13" y="18" text-anchor="middle">30</text></svg>',
    bleach: '<svg viewBox="0 0 26 26" aria-hidden="true"><path d="M13 4 23 21H3Z"/><path d="m7 9 12 12M19 9 7 21"/></svg>',
    iron: '<svg viewBox="0 0 26 26" aria-hidden="true"><path d="M4 19h18v-3a6 6 0 0 0-6-6H9l-1.5-3H5"/><circle cx="14" cy="15.5" r=".9"/></svg>',
    dry: '<svg viewBox="0 0 26 26" aria-hidden="true"><rect x="4" y="4" width="18" height="18"/><path d="M8 13h10M4 9l5-5M4 13l9-9"/></svg>',
    tumble: '<svg viewBox="0 0 26 26" aria-hidden="true"><rect x="4" y="4" width="18" height="18"/><circle cx="13" cy="13" r="6"/><path d="m5 5 16 16M21 5 5 21"/></svg>',
  };
  const WA = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3.5A12.4 12.4 0 0 0 5.3 22.2L3.6 28.4l6.4-1.7A12.4 12.4 0 1 0 16 3.5Zm0 22.6a10.2 10.2 0 0 1-5.2-1.4l-.4-.2-3.8 1 1-3.7-.2-.4A10.2 10.2 0 1 1 16 26.1Zm5.6-7.6c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.3 8.3 0 0 1-4.1-3.6c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1.1 2.5 5.9 5.9 0 0 0 1.2 3.1 13.4 13.4 0 0 0 5.2 4.6c1.9.8 2.7.9 3.6.7a3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.2-.3-.3-.6-.4Z"/></svg>';
  const A11Y = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.5" r="2"/><path d="M4 8.2c2.7.7 5.3 1 8 1s5.3-.3 8-1l.4 1.6c-2 .6-4.1 1-6.2 1.1v3.6l2 7.3-1.6.5L12.5 16h-1l-2.1 6.3-1.6-.5 2-7.3v-3.6c-2.1-.1-4.2-.5-6.2-1.1Z"/></svg>';
  const GRID = (n) => `<svg viewBox="0 0 16 16" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<rect x="${(i * 16) / n + 0.5}" y="1" width="${16 / n - 1.6}" height="14" rx=".5"/>`).join('')}</svg>`;

  /* ---------- Shopify-shaped product data ---------- */
  function raw(p) {
    const variants = [];
    p.colors.forEach((c, ci) => (p.sizes || SIZES).forEach((s, si) => {
      const key = c.key + ':' + s;
      variants.push({
        id: p.id * 100 + ci * 10 + si, title: COLORS[c.key][LANG] + ' / ' + s, options: [COLORS[c.key][LANG], s],
        available: !(p.soldOut || []).includes(key), price: p.price, compare_at_price: p.compare || 0,
        inventory: (p.low || {})[key] != null ? p.low[key] : null, image: IMG + c.images[0],
      });
    }));
    return {
      id: p.id, handle: p.handle, title: L(p.title), url: '#/products/' + p.handle, type: p.type, price: p.price,
      images: p.colors.flatMap((c) => c.images.map((i) => IMG + i)),
      options: [u('opt_color'), u('opt_size')], variants, badge: p.badge ? u('badge_' + p.badge) : '',
    };
  }
  const N = (p) => B.normalize(raw(p));
  const variantFor = (p, colorKey) => raw(p).variants.find((v) => v.options[0] === COLORS[colorKey][LANG]);
  const colorImage = (p, colorKey) => { const c = p.colors.find((x) => x.key === colorKey); return IMG + (c || p.colors[0]).images[0]; };
  const productUrl = (p, colorKey) => { const v = colorKey && variantFor(p, colorKey); return '#/products/' + p.handle + (v ? '?variant=' + v.id : ''); };
  const hexTone = (hex) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return 'dark';
    const n = parseInt(m[1], 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) < 150 ? 'dark' : 'light';
  };
  const swatchStyle = (key) => { const c = COLORS[key].css; return c.endsWith('.jpg') ? `url('${c}')` : c; };

  /* ---------- mock cart + adapter ---------- */
  let cart = B.store.get('preview-cart', []);
  const saveCart = () => B.store.set('preview-cart', cart);
  function findVariant(id) {
    for (const p of PRODUCTS) {
      const r = raw(p);
      const v = r.variants.find((x) => String(x.id) === String(id));
      if (v) return { p, r, v };
    }
    return null;
  }
  function cartJSON() {
    const items = cart.map((l) => {
      const f = findVariant(l.id);
      if (!f) return null;
      return {
        key: String(l.id), id: l.id, product_id: f.p.id, handle: f.p.handle, product_title: f.r.title, title: f.r.title + ' - ' + f.v.title,
        variant_title: f.v.title, quantity: l.qty, final_price: f.v.price, final_line_price: f.v.price * l.qty,
        image: f.v.image, url: '#/products/' + f.p.handle + '?variant=' + l.id,
      };
    }).filter(Boolean);
    return { items, item_count: items.reduce((a, i) => a + i.quantity, 0), total_price: items.reduce((a, i) => a + i.final_line_price, 0) };
  }
  const later = (v) => new Promise((r) => setTimeout(() => r(v), 240));
  const matches = (p, q) => [L(p.title), L(p.tags), u('cat_' + p.type), p.colors.map((c) => COLORS[c.key][LANG]).join(' ')].join(' ').toLowerCase().includes(q.toLowerCase());
  window.BlissAdapter = {
    getProduct: (h) => { const p = byHandle(h); return p ? Promise.resolve(N(p)) : Promise.reject(new Error('Not found')); },
    getCart: () => Promise.resolve(cartJSON()),
    add(id, qty) {
      const f = findVariant(id);
      if (!f || !f.v.available) return Promise.reject(new Error(STR[LANG].sold_out));
      const line = cart.find((l) => String(l.id) === String(id));
      if (line) line.qty += qty; else cart.unshift({ id: Number(id), qty });
      saveCart();
      return later(cartJSON());
    },
    change(key, qty) {
      cart = qty > 0 ? cart.map((l) => (String(l.id) === key ? { id: l.id, qty } : l)) : cart.filter((l) => String(l.id) !== key);
      saveCart();
      return later(cartJSON());
    },
    search: (q) => Promise.resolve(PRODUCTS.filter((p) => matches(p, q)).map((p) => { const n = N(p); return { title: n.title, url: n.url, image: n.images[0], price: n.price }; })),
    recommend(pid, intent) {
      const p = PRODUCTS.find((x) => String(x.id) === String(pid));
      if (!p) return Promise.resolve([]);
      const list = intent === 'complementary' ? (PAIRS[p.handle] || []) : D.ORDER.filter((h) => h !== p.handle);
      return Promise.resolve(list.map((h) => N(byHandle(h))));
    },
    subscribe: () => later(true),
    notify: () => later(true),
    checkout: () => B.open('modal-demo'),
    searchPage: (q) => { const d = document.getElementById('drawer-search'); if (d && d.open) d.close(); go('/search?q=' + encodeURIComponent(q)); },
  };

  /* ---------- shared bits ---------- */
  const card = (h) => B.cardHTML(N(byHandle(h)));
  const stars = (pct) => `<span class="stars__row" style="--pct:${pct}%" aria-hidden="true"></span>`;
  const countLabel = (n) => (n === 1 ? u('item') : u('items', { n }));
  const catCount = (k) => PRODUCTS.filter((p) => p.type === k).length;
  function subscribeForm(id) {
    return `<form class="subscribe" data-subscribe>
      <div class="subscribe__row"><label class="visually-hidden" for="${id}">${u('email')}</label><input id="${id}" type="email" name="contact[email]" placeholder="${u('email')}" autocomplete="email" required><button class="btn" type="submit">${u('join')}</button></div>
      <label class="consent"><input type="checkbox" required id="${id}-consent"><span>${u('consent')}</span></label>
    </form>
    <div class="form-success" data-subscribe-success hidden><p>${u('welcome')}</p><span class="code-chip">WELCOME10 <button type="button" class="btn btn--sm" data-copy="WELCOME10">${u('copy')}</button></span></div>`;
  }
  const palette = () => PALETTE.map((key) => {
    if (key === 'plaid') {
      const p = byHandle('style-plaid-set');
      return { key, name: u('plaid'), css: `url('${COLORS['brown-plaid'].css}')`, tint: '#6F5E52', tone: 'dark', rows: p.colors.map((c) => ({ p, color: c.key })), keys: p.colors.map((c) => c.key) };
    }
    const c = COLORS[key];
    const rows = D.ORDER.map(byHandle).filter((p) => p.colors.some((x) => x.key === key)).map((p) => ({ p, color: key }));
    return { key, name: c[LANG], css: c.css, tint: c.tint || c.css, tone: hexTone(c.css), rows, keys: [key] };
  });

  /* ---------- shell ---------- */
  function previewBar() {
    return `<div class="pv-bar"><div class="wrap pv-bar__inner">
      <p class="pv-bar__label"><b>BLISS</b> · ${u('pv_label')}</p>
      <div class="pv-bar__actions">
        <div class="pv-seg" role="group" aria-label="Language"><button type="button" data-pv-lang="he" aria-pressed="${LANG === 'he'}">עברית</button><button type="button" data-pv-lang="en" aria-pressed="${LANG === 'en'}">English</button></div>
        <button type="button" class="pv-link" data-pv-popup>${u('pv_popup')}</button>
        <a class="pv-link pv-link--strong" href="#/guide">${u('pv_guide')}</a>
      </div>
    </div></div>`;
  }

  function header() {
    const nav = [['/collections/all', u('nav_new')]].concat(Object.keys(CATS).map((k) => ['/collections/' + k, CATS[k][LANG]])).concat([['/pages/about', u('nav_story')]]);
    return `<div class="announce" data-announcements data-speed="4200"><div class="wrap announce__inner">
        <p class="announce__item">${u('ann_1')}</p><p class="announce__item">${u('ann_2')}</p><p class="announce__item">${u('ann_3')}</p>
      </div></div>
      <header class="hdr2" data-header data-no-hide><div class="wrap hdr2__bar">
        <button type="button" class="icon-btn hdr2__burger" data-open="drawer-menu" aria-label="${u('menu')}">${I.menu}</button>
        <button type="button" class="icon-btn hdr2__search-top" data-open="drawer-search" aria-label="${u('search')}">${I.search}</button>
        <a class="hdr2__logo" href="#/" aria-label="${u('home_aria')}"><img class="logo-dark" src="${IMG}logo.svg" alt="BLISS" width="483" height="158"><img class="logo-light" src="${IMG}logo-white.svg" alt="" width="483" height="158"></a>
        <nav class="hdr2__nav" aria-label="${u('nav_main')}">${nav.map(([h, l]) => `<a href="#${h}" data-nav="${h}">${l}</a>`).join('')}</nav>
        <div class="hdr2__icons">
          <button type="button" class="icon-btn" data-open="drawer-search" aria-label="${u('search')}">${I.search}</button>
          <a class="icon-btn hdr__hide-sm" href="#/pages/account" aria-label="${u('account')}">${I.user}</a>
          <button type="button" class="icon-btn" data-open="drawer-wishlist" data-wish-target aria-label="${u('wishlist')}">${I.heart}<span class="count-dot" data-wishlist-count data-count="0">0</span></button>
          <button type="button" class="icon-btn" data-open="drawer-cart" data-bag-target aria-label="${u('cart')}">${I.bag}<span class="count-dot" data-cart-count data-count="0">0</span></button>
        </div>
      </div></header>`;
  }

  function footer() {
    const pays = ['VISA', 'Mastercard', 'AMEX', 'bit', 'Apple Pay', 'G Pay'];
    const info = [['/pages/shipping', u('ft_shipping')], ['/pages/about', u('ft_about_link')], ['/pages/terms', u('ft_terms')], ['/pages/privacy', u('ft_privacy')], ['/pages/accessibility', u('ft_a11y')], ['/pages/faq', u('ft_faq')], ['/pages/contact', u('ft_contact')]];
    return `<footer class="site-footer site-footer--light">
      <div class="wrap footer__top" style="--cols:3">
        <div class="footer__brand">
          <a class="footer__logo" href="#/"><img src="${IMG}logo.svg" alt="BLISS" width="483" height="158" loading="lazy"></a>
          <p>${u('ft_about')}</p>
          <div class="footer__social"><a class="icon-btn" href="#" aria-label="Instagram">${I.instagram}</a><a class="icon-btn" href="#" aria-label="Facebook">${I.facebook}</a><a class="icon-btn" href="#" aria-label="TikTok">${I.tiktok}</a></div>
        </div>
        <div><p class="eyebrow footer__title">${u('ft_info')}</p><ul class="footer__links">${info.map(([h, l]) => `<li><a href="#${h}">${l}</a></li>`).join('')}<li><a href="#" data-open="modal-size-guide">${u('ft_size')}</a></li></ul></div>
        <div><p class="eyebrow footer__title">${u('ft_need_help')}</p><div class="footer__contact"><span>WhatsApp: [050-000-0000]</span><span>${u('email')}: [hello@bliss.co.il]</span><span>${u('usp_4s')}</span></div></div>
        <div><p class="eyebrow footer__title">${u('ft_news')}</p>${subscribeForm('ft-email')}</div>
      </div>
      <div class="wrap footer__bottom"><p>© 2026 BLISS · ${u('rights')}</p><div class="pay-icons">${pays.map((x) => `<span class="pay-chip">${x}</span>`).join('')}</div></div>
    </footer>`;
  }

  function overlays() {
    const cats = [['all', u('cat_all'), PRODUCTS.length]].concat(Object.keys(CATS).map((k) => [k, CATS[k][LANG], catCount(k)]));
    const trending = ['side-tie-set', 'day-dress', 'zip-set', 'tie-skirt', 'back-tie-top'].map((h) => N(byHandle(h)));
    return `
    <dialog id="drawer-cart" class="drawer" aria-labelledby="cart-title">
      <div class="drawer__head"><h2 id="cart-title" class="drawer__title">${u('your_bag')} <span class="mono" data-cart-count-label></span></h2><button type="button" class="icon-btn" data-close aria-label="${u('close')}">${I.close}</button></div>
      <div class="drawer__body" data-cart-body></div>
      <div class="drawer__foot" data-cart-foot hidden></div>
    </dialog>
    <dialog id="drawer-wishlist" class="drawer" aria-labelledby="wl-title">
      <div class="drawer__head"><h2 id="wl-title" class="drawer__title">${u('wishlist')}</h2><button type="button" class="icon-btn" data-close aria-label="${u('close')}">${I.close}</button></div>
      <div class="drawer__body" data-wishlist-body></div>
    </dialog>
    <dialog id="drawer-search" class="drawer drawer--full" aria-label="${u('search')}">
      <div class="wrap" data-search style="padding-block:24px 0">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px"><img src="${IMG}logo.svg" alt="" width="483" height="158" style="height:22px;width:auto"><button type="button" class="btn-circle btn-circle--sm" data-close aria-label="${u('close')}">${I.close}</button></div>
        <form class="search-box" data-search-form role="search" action="#/search">
          ${I.search}<label class="visually-hidden" for="search-input">${u('search')}</label>
          <input id="search-input" type="search" name="q" placeholder="${u('search_ph')}" autocomplete="off" data-search-input>
        </form>
        <div class="search-body">
          <div data-search-suggest style="display:grid;gap:36px">
            <div><p class="eyebrow" style="margin-bottom:14px">${u('popular')}</p><div class="chips" style="flex-wrap:wrap;padding:0">${u('terms').map((x) => `<button type="button" class="chip" data-search-term="${esc(x)}">${esc(x)}</button>`).join('')}</div></div>
            <div><p class="eyebrow" style="margin-bottom:16px">${u('trending')}</p><div class="search-results">${trending.map((h) => `<a class="search-hit" href="${h.url}"><img src="${h.images[0]}" alt="" loading="lazy" width="300" height="400"><span>${esc(h.title)}</span>${B.priceHTML(h)}</a>`).join('')}</div></div>
          </div>
          <div data-search-results></div>
        </div>
      </div>
    </dialog>
    <dialog id="drawer-menu" class="drawer drawer--start" aria-labelledby="menu-title">
      <div class="drawer__head"><img src="${IMG}logo.svg" alt="" width="483" height="158" style="height:20px;width:auto"><h2 id="menu-title" class="visually-hidden">${u('menu')}</h2><button type="button" class="icon-btn" data-close aria-label="${u('close')}">${I.close}</button></div>
      <div class="drawer__body">
        <nav class="menu-list">${cats.map(([k, l, n]) => `<a href="#/collections/${k}">${l}<span class="mono">(${pad2(n)})</span></a>`).join('')}</nav>
        <p class="eyebrow">${u('mega_colors')}</p>
        <div class="menu-colors">${PALETTE.filter((k) => k !== 'plaid').map((k) => `<a class="chip chip--swatch" href="#/collections/all?color=${k}"><span class="swatch" style="--swatch:${swatchStyle(k)}"></span>${COLORS[k][LANG]}</a>`).join('')}</div>
        <div class="menu-sub"><a href="#/pages/account">${u('account')}</a><a href="#/pages/shipping">${u('ft_shipping')}</a><a href="#/pages/contact">${u('ft_contact')}</a><a href="#/pages/accessibility">${u('ft_a11y')}</a></div>
      </div>
    </dialog>
    <dialog id="modal-size-guide" class="modal modal--wide" aria-labelledby="sg-title">
      <button type="button" class="icon-btn modal__close" data-close aria-label="${u('close')}">${I.close}</button>
      <div class="modal__body">
        <p class="eyebrow">S · M · L · XL</p>
        <h2 id="sg-title" class="h-2xl" style="margin-top:12px">${u('sg_title')}</h2>
        <p class="muted" style="margin-top:10px">${u('sg_intro')}</p>
        <div class="size-table-wrap"><table class="size-table"><thead><tr><th>${u('sg_size')}</th><th>${u('sg_bust')}</th><th>${u('sg_waist')}</th><th>${u('sg_hips')}</th><th>${u('sg_il')}</th></tr></thead>
        <tbody>${SIZE_ROWS.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
        <div class="how-measure"><p><b>${u('sg_m1')}</b>${u('sg_m1t')}</p><p><b>${u('sg_m2')}</b>${u('sg_m2t')}</p><p><b>${u('sg_m3')}</b>${u('sg_m3t')}</p></div>
        <p class="notice" style="margin-top:24px">${u('sg_note')}</p>
      </div>
    </dialog>
    <dialog id="modal-newsletter" class="modal popup" aria-labelledby="pop-title">
      <button type="button" class="icon-btn modal__close" data-close aria-label="${u('close')}">${I.close}</button>
      <div class="popup__grid">
        <div class="popup__media"><img src="${IMG}pleat-set-brown-1.jpg" alt="" loading="lazy"></div>
        <div class="popup__body">
          <p class="eyebrow">${u('pop_eyebrow')}</p>
          <p class="popup__big" aria-hidden="true">10%</p>
          <h2 id="pop-title" class="h-xl"><span class="visually-hidden">10% </span>${u('pop_title')}</h2>
          <p class="muted">${u('pop_text')}</p>
          ${subscribeForm('pop-email')}
          <button type="button" class="link-btn popup__no" data-close>${u('pop_later')}</button>
        </div>
      </div>
    </dialog>
    <dialog id="modal-lightbox" class="modal lightbox" aria-label="Image">
      <button type="button" class="icon-btn modal__close" data-close aria-label="${u('close')}">${I.close}</button>
      <img src="" alt="">
    </dialog>
    <dialog id="modal-demo" class="modal" aria-labelledby="demo-title">
      <div class="modal__body" style="display:grid;gap:18px;text-align:center;justify-items:center">
        ${I.card}<h2 id="demo-title" class="h-xl">${u('demo_title')}</h2><p class="muted">${u('demo_text')}</p>
        <button type="button" class="btn" data-close>${u('ok')}</button>
      </div>
    </dialog>
    <a class="fab fab--wa" href="https://wa.me/" target="_blank" rel="noopener" aria-label="${u('wa')}">${WA}</a>
    <button type="button" class="fab fab--a11y" data-a11y-toggle aria-expanded="false" aria-controls="a11y-panel" aria-label="${u('a11y')}">${A11Y}</button>
    <div id="a11y-panel" class="a11y-panel" role="region" aria-label="${u('a11y_title')}" hidden>
      <p class="h-lg">${u('a11y_title')}</p>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:var(--fs-sm)"><span>${u('a11y_size')}</span>
        <span class="qty"><button type="button" data-a11y-scale="-0.1" aria-label="−">−</button><span data-a11y-scale-label style="width:48px">100%</span><button type="button" data-a11y-scale="0.1" aria-label="+">+</button></span></div>
      <div class="a11y-panel__grid">
        <button type="button" class="a11y-opt" data-a11y="contrast" aria-pressed="false"><span aria-hidden="true">◐</span><span>${u('a11y_contrast')}</span></button>
        <button type="button" class="a11y-opt" data-a11y="links" aria-pressed="false"><span aria-hidden="true">⎁</span><span>${u('a11y_links')}</span></button>
        <button type="button" class="a11y-opt" data-a11y="font" aria-pressed="false"><span aria-hidden="true">Aa</span><span>${u('a11y_font')}</span></button>
        <button type="button" class="a11y-opt" data-a11y="still" aria-pressed="false"><span aria-hidden="true">❚❚</span><span>${u('a11y_still')}</span></button>
      </div>
      <div class="a11y-panel__foot"><button type="button" class="link-btn" data-a11y-reset>${u('a11y_reset')}</button><a href="#/pages/accessibility">${u('a11y_statement')}</a></div>
    </div>`;
  }

  /* ---------- home ---------- */
  function home() {
    const ribbon = u('ribbon');
    const ribbonItems = [].concat(ribbon, ribbon, ribbon, ribbon).map((x) => `<span class="ribbon__item">${x}</span>`).join('');
    const title = (en, he) => `<div class="sec-title"><h2 class="thin">${en}</h2>${LANG === 'he' && he ? `<p class="muted">${he}</p>` : ''}</div>`;
    const carousel = (handles) => `<div class="carousel" data-carousel>
        <button type="button" class="carousel__arrow carousel__arrow--prev" data-carousel-prev aria-label="${u('prev')}">${I.arrowBack}</button>
        <div class="carousel__track" data-carousel-track>${handles.map(card).join('')}</div>
        <button type="button" class="carousel__arrow carousel__arrow--next" data-carousel-next aria-label="${u('next')}">${I.arrow}</button>
        <div class="carousel__dots" data-carousel-dots></div>
      </div>`;
    const top = byHandle('tie-top');
    const skirt = byHandle('style-skirt');
    const stlSlide = (p, color, i) => {
      const n = N(p);
      return `<div class="stl__slide${i ? '' : ' is-active'}" data-stl-slide data-product-card data-handle="${p.handle}" data-active-color="${esc(COLORS[color][LANG])}">
        <a class="stl__slide-img" href="${productUrl(p, color)}"><img src="${colorImage(p, color)}" alt="${esc(n.title)}" loading="lazy" width="600" height="800"></a>
        <p class="stl__slide-title">${esc(n.title)} · ${COLORS[color][LANG]}</p>${B.priceHTML(n)}
        <a class="btn btn--sm" href="${productUrl(p, color)}">${u('show_product')}</a>
      </div>`;
    };
    return `
    <section class="hero-full" data-hero-full>
      <div class="hero-full__media"><img src="${IMG}hero-banner.jpg" alt="${u('hero_alt')}" width="1600" height="900" fetchpriority="high"></div>
      <div class="hero-full__copy">
        <p class="hero-full__tag">Modest · Soft · Timeless</p>
        <h1 class="hero-full__title">Quiet elegance, every day</h1>
        ${LANG === 'he' ? `<p class="hero-full__tag" style="letter-spacing:.02em">${u('intro_title')}</p>` : ''}
        <a class="btn btn--light" href="#/collections/all">${u('intro_cta')}</a>
      </div>
      <span class="hero-full__cue" aria-hidden="true">${I.down}</span>
    </section>
    <div class="ribbon ribbon--light" role="note" aria-label="${esc(ribbon.join(' · '))}"><div class="ribbon__track" aria-hidden="true">${ribbonItems}</div></div>
    <section class="section--tight" style="padding-inline:var(--pad)">
      ${title('New collection', u('new_title'))}
      ${carousel(D.ORDER)}
      <div class="carousel__foot"><a class="text-link" href="#/collections/all">Shop now</a></div>
    </section>
    <section class="split">
      <a class="split__tile" href="#/collections/dresses"><img src="${IMG}split-1.jpg" alt="" loading="lazy" width="1200" height="1600"><span class="split__copy"><span class="split__title">${CATS.dresses[LANG]}</span><span class="split__sub">${u('split_1')}</span></span></a>
      <a class="split__tile" href="#/collections/sets"><img src="${IMG}split-2.jpg" alt="" loading="lazy" width="1200" height="1600"><span class="split__copy"><span class="split__title">${CATS.sets[LANG]}</span><span class="split__sub">${u('split_2')}</span></span></a>
    </section>
    <a class="banner-full" href="#/collections/all" style="margin-top:4px"><img src="${IMG}story.jpg" alt="" loading="lazy" width="1600" height="1130"><span class="banner-full__copy"><span class="banner-full__title">Most loved</span>${I.down}</span></a>
    <section class="section--tight" style="padding-inline:var(--pad)">
      ${title(u('most_loved'), '')}
      ${carousel(['day-dress', 'tie-skirt', 'side-tie-set', 'zip-set', 'plaid-skirt', 'back-tie-top', 'stripe-skirt', 'style-skirt', 'tie-top'])}
    </section>
    <section class="wrap section" style="padding-top:clamp(24px,3vw,48px)">
      ${title('Shop the look', u('look_title'))}
      <div class="stl" data-stl>
        <div class="stl__media"><img src="${IMG}look.jpg" alt="${u('look_alt')}" loading="lazy" width="1000" height="1333">
          <button type="button" class="stl__dot" data-stl-dot style="left:47%;top:40%" aria-label="${esc(N(top).title)}"></button>
          <button type="button" class="stl__dot" data-stl-dot style="left:55%;top:74%" aria-label="${esc(N(skirt).title)}"></button>
        </div>
        <div class="stl__side">
          <div class="stl__slides">${stlSlide(top, 'white', 0)}${stlSlide(skirt, 'taupe', 1)}</div>
          <div class="stl__nav"><button type="button" class="btn-circle btn-circle--sm" data-stl-prev aria-label="${u('prev')}">${I.arrowBack}</button><span data-stl-count dir="ltr">1 / 2</span><button type="button" class="btn-circle btn-circle--sm" data-stl-next aria-label="${u('next')}">${I.arrow}</button></div>
        </div>
      </div>
    </section>
    <section class="news-band"><div class="wrap news-band__inner"><h2 class="news-band__title">${u('stay_updated')}</h2><p class="muted">${u('club_text')}</p>${subscribeForm('band-email')}</div></section>`;
  }

  /* ---------- collection ---------- */
  function collection(handle, q) {
    const cat = CATS[handle] ? handle : null;
    const title = cat ? CATS[cat][LANG] : u('cat_all');
    const colors = q.getAll('color');
    const sizes = q.getAll('size');
    const sort = q.get('sort') || 'featured';
    const pool = PRODUCTS.filter((p) => !cat || p.type === cat);
    let list = pool;
    if (colors.length) list = list.filter((p) => p.colors.some((c) => colors.includes(c.key)));
    if (sizes.length) list = list.filter((p) => p.colors.some((c) => sizes.some((s) => !(p.soldOut || []).includes(c.key + ':' + s))));
    list = D.ORDER.map(byHandle).filter((p) => list.includes(p));
    if (sort === 'low') list.sort((a, b) => a.price - b.price);
    if (sort === 'high') list.sort((a, b) => b.price - a.price);
    const colorKeys = PALETTE.filter((k) => k !== 'plaid').concat(['blue-plaid', 'black-plaid', 'brown-plaid']).filter((k) => pool.some((p) => p.colors.some((c) => c.key === k)));
    const qs = (over) => {
      const p = new URLSearchParams(q.toString());
      Object.keys(over).forEach((k) => { p.delete(k); [].concat(over[k]).filter(Boolean).forEach((v) => p.append(k, v)); });
      const s = p.toString();
      return s ? '?' + s : '';
    };
    const catLinks = [['all', u('all')]].concat(Object.keys(CATS).map((k) => [k, CATS[k][LANG]]))
      .map(([k, l]) => `<a class="chip${(k === 'all' && !cat) || k === cat ? ' is-active' : ''}" href="#/collections/${k}${qs({})}">${l}</a>`).join('');
    const colorChips = colorKeys.map((k) => {
      const on = colors.includes(k);
      return `<a class="chip chip--swatch${on ? ' is-active' : ''}" href="#/collections/${handle}${qs({ color: on ? colors.filter((x) => x !== k) : colors.concat(k) })}" aria-pressed="${on}"><span class="swatch" style="--swatch:${swatchStyle(k)}"></span>${COLORS[k][LANG]}</a>`;
    }).join('');
    return `
    <section class="page-head"><div class="wrap page-head__inner">
      <nav class="crumbs" aria-label="breadcrumbs"><a href="#/">${u('home')}</a><span aria-hidden="true">/</span><span>${title}</span></nav>
      <div class="page-head__row"><h1 class="page-head__title">${title}<span class="sup">(${pad2(list.length)})</span></h1><p class="page-head__desc">${u('all_desc')}</p></div>
      <nav class="chips" style="padding:0" aria-label="${u('cats_eyebrow')}">${catLinks}</nav>
    </div></section>
    <div class="toolbar"><div class="wrap toolbar__inner">
      <div class="chips" aria-label="${u('colors')}">${colorChips}</div>
      <span class="toolbar__sep"></span>
      <button type="button" class="chip" data-open="drawer-filters">${u('sizes')}${sizes.length ? ` <span class="mono">(${sizes.length})</span>` : ''}</button>
      <label class="visually-hidden" for="sort-by">${u('sort_label')}</label>
      <select id="sort-by" class="select" data-pv-sort>${[['featured', u('sort_featured')], ['low', u('sort_low')], ['high', u('sort_high')]].map(([v, l]) => `<option value="${v}"${v === sort ? ' selected' : ''}>${l}</option>`).join('')}</select>
      <div class="view-toggle" data-view-toggle data-target="#pv-grid" data-default="3" role="group" aria-label="${u('view_cols')}">${[2, 3, 4].map((n) => `<button type="button" data-cols="${n}" aria-pressed="false" aria-label="${n}">${GRID(n)}</button>`).join('')}</div>
    </div></div>
    <section class="wrap section--tight">
      ${colors.length || sizes.length ? `<div class="active-filters">${colors.map((c) => `<a class="chip is-active" href="#/collections/${handle}${qs({ color: colors.filter((x) => x !== c) })}">${COLORS[c][LANG]} ×</a>`).join('')}${sizes.map((s) => `<a class="chip is-active" href="#/collections/${handle}${qs({ size: sizes.filter((x) => x !== s) })}">${s} ×</a>`).join('')}<a class="chip" href="#/collections/${handle}">${u('clear')}</a></div>` : ''}
      ${list.length ? `<div class="grid" id="pv-grid">${list.map((p) => card(p.handle)).join('')}</div>` : `<div class="empty-state"><p class="empty-state__title">${u('none_found')}</p><a class="btn btn--ghost btn--sm" href="#/collections/${handle}">${u('clear')}</a></div>`}
    </section>
    <dialog id="drawer-filters" class="drawer" aria-labelledby="flt-title">
      <div class="drawer__head"><h2 id="flt-title" class="drawer__title">${u('filter')}</h2><button type="button" class="icon-btn" data-close aria-label="${u('close')}">${I.close}</button></div>
      <form class="drawer__body" data-pv-filters id="pv-filters">
        <details class="filter-group" open><summary>${u('opt_size')}${I.plus}</summary><div class="filter-group__list" style="grid-template-columns:repeat(4,1fr)">
          ${SIZES.map((s) => `<label class="check"><input type="checkbox" name="size" value="${s}"${sizes.includes(s) ? ' checked' : ''}><span class="mono">${s}</span></label>`).join('')}
        </div></details>
        <details class="filter-group" open><summary>${u('opt_color')}${I.plus}</summary><div class="filter-group__list">
          ${colorKeys.map((k) => `<label class="check"><input type="checkbox" name="color" value="${k}"${colors.includes(k) ? ' checked' : ''}><span class="swatch" style="--swatch:${swatchStyle(k)}"></span>${COLORS[k][LANG]}</label>`).join('')}
        </div></details>
      </form>
      <div class="drawer__foot"><button class="btn btn--block" type="submit" form="pv-filters">${u('apply')}</button><a class="link-btn" style="justify-self:center" href="#/collections/${handle}">${u('clear')}</a></div>
    </dialog>`;
  }

  /* ---------- product ---------- */
  function pdp(p, q) {
    const r = raw(p);
    const n = N(p);
    const wanted = r.variants.find((v) => String(v.id) === q.get('variant'));
    const first = wanted || r.variants.find((v) => v.available) || r.variants[0];
    let mid = 0;
    const slides = p.colors.flatMap((c) => c.images.map((im) => ({ id: 'm' + (++mid), src: IMG + im, color: COLORS[c.key][LANG] })));
    const firstColor = first.options[0];
    const ordered = slides.filter((s) => s.color === firstColor).concat(slides.filter((s) => s.color !== firstColor));
    const cat = CATS[p.type];
    const pairs = (PAIRS[p.handle] || []).map((h) => N(byHandle(h)));
    const others = D.ORDER.filter((h) => h !== p.handle).sort((a, b) => (byHandle(b).type === p.type) - (byHandle(a).type === p.type)).slice(0, 4);
    const styleNo = 'BLS-' + p.handle.split('-').map((w) => w[0].toUpperCase()).join('') + '-' + String(p.id).slice(-2);
    const pdpReviews = REVIEWS.map((rv, i) => `<figure class="quote${i ? '' : ' is-active'}"><span class="stars">${stars(rv.stars * 20)}</span><blockquote>“${esc(L(rv.text))}”</blockquote><figcaption><span>${esc(L(rv.name))}<span class="verified">${I.check} ${u('verified')}</span></span></figcaption></figure>`).join('');
    return `
    <div data-pdp data-tint-page>
      <div class="wrap">
        <div class="pdp">
          <div class="pdp__media">
            <div class="pdp__rail" data-rail>${ordered.map((s) => `<button type="button" class="pdp__thumb" data-thumb="${s.id}" aria-label="${esc(s.color)}"><img src="${s.src}" alt="" loading="lazy" width="60" height="80"></button>`).join('')}</div>
            <div style="position:relative;min-width:0">
              <div class="pdp__slides" data-slides>${ordered.map((s, i) => `<button type="button" class="pdp__slide" data-media-id="${s.id}" data-color="${esc(s.color)}" data-lightbox="${s.src}" aria-label="${esc(n.title)} – ${esc(s.color)}"><img src="${s.src}" alt="${esc(n.title)} – ${esc(s.color)}" width="900" height="1125" ${i ? 'loading="lazy"' : 'fetchpriority="high" data-vt-hero'}></button>`).join('')}</div>
              <span class="pdp__counter" data-slide-counter></span>
            </div>
          </div>
          <div class="pdp__info"><div class="pdp__sticky">
            <nav class="crumbs" aria-label="breadcrumbs"><a href="#/">${u('home')}</a><span aria-hidden="true">/</span><a href="#/collections/${p.type}">${cat[LANG]}</a><span aria-hidden="true">/</span><span>${styleNo}</span></nav>
            <div style="display:grid;gap:18px">
              <h1 class="pdp__title">${esc(n.title)}</h1>
              <div class="pdp__price-row"><div data-price>${B.priceHTML(n)}</div><a class="stars" href="#reviews" data-scroll="reviews">${stars(96)} 4.8 · 23</a></div>
            </div>
            <p class="pdp__installments" data-installments></p>
            <form class="pdp__form" data-product-form novalidate>
              <script type="application/json" data-product-json>${JSON.stringify(r).replace(/</g, '\\u003c')}</script>
              <input type="hidden" name="id" value="">
              <fieldset class="opt opt--color"><legend><span>${u('opt_color')} · <b data-option-label="0"></b></span><span class="mono muted" style="font-size:var(--fs-micro)">${pad2(p.colors.length)}</span></legend><div class="opt__values">
                ${p.colors.map((c, i) => { const nm = COLORS[c.key][LANG]; return `<input class="opt__radio" type="radio" name="opt-0" id="o0-${i}" value="${esc(nm)}" data-option-index="0"${nm === firstColor ? ' checked' : ''}><label for="o0-${i}" class="swatch opt__swatch" style="--swatch:${swatchStyle(c.key)}" title="${esc(nm)}"><span class="visually-hidden">${esc(nm)}</span></label>`; }).join('')}
              </div></fieldset>
              <fieldset class="opt opt--size" style="margin-top:12px"><legend><span>${u('opt_size')} · <b data-option-label="1"></b></span>${p.sizes ? '' : `<button type="button" class="link-btn" data-open="modal-size-guide">${I.ruler}${u('size_guide')}</button>`}</legend><div class="opt__values">
                ${(p.sizes || SIZES).map((s, i) => `<input class="opt__radio" type="radio" name="opt-1" id="o1-${i}" value="${s}" data-option-index="1"${wanted && wanted.options[1] === s ? ' checked' : ''}><label for="o1-${i}" class="opt__size">${s}</label>`).join('')}
              </div></fieldset>
              <p class="stock" data-stock hidden></p>
              <div class="buy-row" style="margin-top:6px"><button type="submit" class="btn" data-atc><span data-atc-label>${STR[LANG].add_to_cart}</span><span class="btn__price" data-atc-price></span></button><button type="button" class="btn-circle wish-btn" data-wishlist-toggle="${p.handle}" aria-pressed="false" aria-label="${STR[LANG].wishlist_add}">${I.heart}</button></div>
            </form>
            <div class="notify" data-notify hidden>
              <p style="font-weight:500;font-size:var(--fs-sm)">${u('notify_title')}</p>
              <form data-notify-form class="notify__row"><input type="hidden" name="contact[body]" value=""><label class="visually-hidden" for="notify-email">${u('email')}</label><input id="notify-email" type="email" name="contact[email]" placeholder="${u('email')}" required><button class="btn btn--sm" type="submit">${u('notify_btn')}</button></form>
            </div>
            <p class="pdp__delivery">${I.truck}<span data-delivery></span></p>
            <ul class="perks"><li>${I.truck}${u('perk_1')}</li><li>${I.exchange}${u('perk_2')}</li><li>${I.card}${u('perk_3')}</li></ul>
            <div>
              <details class="accordion" open><summary>${u('desc')}${I.plus}</summary><div class="accordion__body"><p>${esc(L(p.desc))}</p><ul style="margin-top:12px">${L(p.details).map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div></details>
              <details class="accordion"><summary>${u('label')}${I.plus}</summary><div class="accordion__body">
                <dl class="glabel">
                  <div class="glabel__row"><dt>${u('style_no')}</dt><dd class="mono">${styleNo}</dd></div>
                  <div class="glabel__row"><dt>${u('fit')}</dt><dd>${esc(L(p.details)[0])}</dd></div>
                  <div class="glabel__row"><dt>${u('fabric_l')}</dt><dd>${u('fabric_v')}</dd></div>
                  <div class="glabel__row"><dt>${u('care_l')}</dt><dd><span class="care">${['wash', 'bleach', 'iron', 'dry', 'tumble'].map((k) => `<span title="${u('care_' + k)}">${CARE[k]}<span class="visually-hidden">${u('care_' + k)}</span></span>`).join('')}</span></dd></div>
                </dl></div></details>
              <details class="accordion"><summary>${u('shipping')}${I.plus}</summary><div class="accordion__body"><p>${u('shipping_text')}</p></div></details>
            </div>
            ${pairs.length ? `<div class="ctl"><p class="ctl__title">${STR[LANG].complete_look}</p>${pairs.map((x) => B.miniHTML(x)).join('')}</div>` : ''}
          </div></div>
        </div>
      </div>
      <section class="section" id="reviews"><div class="wrap quotes" data-quotes>
        <div class="quotes__side"><p class="eyebrow">${u('reviews')}</p><div class="quotes__score"><b>4.8</b><span style="display:grid;gap:6px"><span class="stars">${stars(96)}</span><span class="mono muted" style="font-size:var(--fs-micro)">23 ${u('reviews')}</span></span></div><span class="sample-chip" style="justify-self:start">${u('sample')}</span><p class="muted" style="font-size:var(--fs-xs)">${u('reviews_note')}</p>
          <div class="quotes__nav"><button type="button" class="btn-circle btn-circle--sm" data-quote-prev aria-label="${u('prev')}">${I.arrowBack}</button><button type="button" class="btn-circle btn-circle--sm" data-quote-next aria-label="${u('next')}">${I.arrow}</button></div></div>
        <div class="quotes__stage" aria-live="polite">${pdpReviews}</div>
      </div></section>
      <section class="section" style="padding-top:0"><div class="wrap"><div class="sec-head"><div class="sec-head__text"><h2 class="h-2xl">${u('may_like')}</h2></div></div><div class="grid grid--4">${others.map(card).join('')}</div></div></section>
      <section class="section" style="padding-top:0" data-recent-section hidden><div class="wrap"><div class="sec-head"><div class="sec-head__text"><h2 class="h-2xl">${u('recent')}</h2></div></div><div class="grid grid--4" data-recently-viewed data-exclude="${p.handle}" data-limit="4"></div></div></section>
      <div class="sticky-atc" data-sticky-atc aria-hidden="true"><div class="sticky-atc__inner">
        <img data-sticky-img src="${ordered[0].src}" alt="" width="44" height="44">
        <div class="sticky-atc__text"><strong>${esc(n.title)}</strong><span data-sticky-variant></span></div>
        <div data-sticky-price></div>
        <button type="button" class="btn" data-sticky-btn>${STR[LANG].add_to_cart}</button>
      </div></div>
    </div>`;
  }

  /* ---------- search, content pages ---------- */
  function searchPage(qs) {
    const hits = PRODUCTS.filter((p) => matches(p, qs));
    return `<section class="page-head"><div class="wrap page-head__inner"><p class="eyebrow">${u('search_title')}</p>
      <form class="search-box" data-search-form role="search">${I.search}<label class="visually-hidden" for="search-page-q">${u('search')}</label><input id="search-page-q" type="search" name="q" value="${esc(qs)}" placeholder="${u('search_ph')}"></form></div></section>
      <section class="wrap section--tight"><p class="toolbar__count" style="margin-bottom:24px">${qs ? u('search_for', { q: esc(qs) }) + ' · ' : ''}${countLabel(hits.length)}</p>
      ${hits.length ? `<div class="grid grid--4">${hits.map((p) => card(p.handle)).join('')}</div>` : `<div class="empty-state"><p class="empty-state__title">${STR[LANG].no_results.replace('{{ q }}', esc(qs))}</p></div>`}</section>`;
  }

  const PAGES = {
    about: () => ({ title: u('ft_about_link'), img: 'story.jpg', body: `<p>${u('story_text')}</p><p>${L({ he: 'כל פריט נבחר כדי שיתאים לשגרה שלך: לעבודה, לאירועים ולסופי שבוע. אנחנו מאמינות שאפשר להתלבש בצניעות ולהרגיש מהממת בכל יום.', en: 'Every piece is chosen to fit your routine: work, events and weekends. We believe you can dress modestly and feel wonderful every day.' })}</p>` }),
    shipping: () => ({ title: u('ft_shipping'), body: `<h2>${L({ he: 'משלוחים', en: 'Shipping' })}</h2><p>${u('shipping_text')}</p><h2>${L({ he: 'החלפות והחזרות', en: 'Exchanges & returns' })}</h2><p>${L({ he: 'כתבי לנו בוואטסאפ או במייל עם מספר ההזמנה, ונתאם איסוף או החלפה. הזיכוי יתבצע לאמצעי התשלום המקורי בהתאם לחוק הגנת הצרכן.', en: 'Message us on WhatsApp or email with your order number and we will arrange a pickup or exchange. Refunds go back to the original payment method in line with Israeli consumer law.' })}</p>` }),
    faq: () => ({
      title: u('ft_faq'), raw: true,
      body: `<div class="faq">${[
        [{ he: 'איך יודעים איזו מידה לבחור?', en: 'How do I choose my size?' }, { he: 'בכל עמוד מוצר יש מדריך מידות. בין שתי מידות? בחרי את הגדולה, או כתבי לנו בוואטסאפ.', en: 'Every product page has a size guide. Between sizes? Choose the larger, or message us on WhatsApp.' }],
        [{ he: 'כמה זמן לוקח המשלוח?', en: 'How long does delivery take?' }, { he: '2–4 ימי עסקים עד הבית. בהזמנה מעל ₪299 המשלוח חינם.', en: '2–4 business days to your door. Free over ₪299.' }],
        [{ he: 'אפשר לשלם בתשלומים?', en: 'Can I pay in instalments?' }, { he: 'כן, עד 3 תשלומים ללא ריבית בכרטיס אשראי.', en: 'Yes, up to 3 interest-free payments by credit card.' }],
        [{ he: 'איך מחליפים פריט?', en: 'How do I exchange an item?' }, { he: 'תוך 14 יום מהקבלה, כשהפריט לא נלבש והתוויות מחוברות. כתבי לנו ונתאם.', en: 'Within 14 days of delivery, unworn with tags attached. Message us and we will arrange it.' }],
      ].map(([qq, a]) => `<details class="accordion"><summary>${L(qq)}${I.plus}</summary><div class="accordion__body"><p>${L(a)}</p></div></details>`).join('')}</div>`,
    }),
    accessibility: () => ({
      title: u('ft_a11y'),
      body: LANG === 'he'
        ? '<p>אנו ב-BLISS רואים חשיבות רבה במתן שירות שוויוני לכלל הלקוחות, ופועלים להנגשת האתר לאנשים עם מוגבלות בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג–2013, ולתקן הישראלי 5568 ברמה AA.</p><h2>מה הונגש באתר</h2><ul><li>ניווט מלא במקלדת ומיקוד נראה לעין</li><li>טקסט חלופי לתמונות</li><li>תפריט נגישות: הגדלת טקסט, ניגודיות גבוהה, הדגשת קישורים, גופן קריא ועצירת אנימציות</li><li>תמיכה בקוראי מסך ומבנה כותרות תקין</li></ul><h2>רכזת הנגישות</h2><p>נתקלת בבעיה? נשמח לעזור: [שם] · [טלפון] · [אימייל]. נשתדל להשיב תוך 5 ימי עסקים.</p><p><em>תאריך עדכון ההצהרה: [להשלים]</em></p>'
        : '<p>BLISS is committed to equal service for every customer. We work to make this site accessible under Israel’s Equal Rights for Persons with Disabilities regulations (2013) and Israeli Standard 5568 at level AA.</p><h2>What we have done</h2><ul><li>Full keyboard navigation with visible focus</li><li>Alternative text for images</li><li>An accessibility menu: text size, high contrast, highlighted links, readable font and stopping animations</li><li>Screen-reader support and a proper heading structure</li></ul><h2>Accessibility coordinator</h2><p>Found a barrier? Contact [name] · [phone] · [email]. We aim to reply within 5 business days.</p><p><em>Statement last updated: [date]</em></p>',
    }),
    contact: () => ({ title: u('ft_contact'), raw: true, body: `<form class="form-grid narrow" onsubmit="event.preventDefault();Bliss.toast('✓')"><div class="form-grid form-grid--2"><div class="field"><label for="c-name">${L({ he: 'שם מלא', en: 'Full name' })}</label><input id="c-name" required></div><div class="field"><label for="c-phone">${L({ he: 'טלפון', en: 'Phone' })}</label><input id="c-phone" type="tel"></div></div><div class="field"><label for="c-email">${u('email')}</label><input id="c-email" type="email" required></div><div class="field"><label for="c-msg">${L({ he: 'הודעה', en: 'Message' })}</label><textarea id="c-msg"></textarea></div><button class="btn" type="submit" style="justify-self:start">${L({ he: 'שליחה', en: 'Send' })}</button></form>` }),
    account: () => ({ title: u('login'), raw: true, body: `<form class="form-grid narrow" style="max-width:440px" onsubmit="event.preventDefault();Bliss.open('modal-demo')"><div class="field"><label for="a-email">${u('email')}</label><input id="a-email" type="email" autocomplete="email"></div><div class="field"><label for="a-pass">${u('password')}</label><input id="a-pass" type="password" autocomplete="current-password"></div><button class="btn btn--block" type="submit">${u('login_btn')}</button><p class="muted" style="text-align:center;font-size:var(--fs-sm)">${u('register')}</p><p class="notice">${u('acc_note')}</p></form>` }),
    terms: () => ({ title: u('ft_terms'), body: `<p>${L({ he: 'את התקנון ומדיניות הפרטיות מנהלים ב-Shopify תחת הגדרות ← מדיניות. הם יופיעו כאן אוטומטית.', en: 'Terms and privacy policies are managed in Shopify under Settings → Policies and appear here automatically.' })}</p>` }),
  };
  PAGES.privacy = PAGES.terms;

  function page(handle) {
    const pg = (PAGES[handle] || (() => null))();
    if (!pg) return notFound();
    return `<section class="page-head page-head--sm"><div class="wrap page-head__inner"><nav class="crumbs"><a href="#/">${u('home')}</a><span aria-hidden="true">/</span><span>${pg.title}</span></nav><h1 class="page-head__title">${pg.title}</h1></div></section>
      ${pg.img ? `<div class="wrap"><div class="reveal" style="aspect-ratio:21/9;overflow:hidden;background:var(--mist-2)"><img src="${IMG}${pg.img}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:50% 35%"></div></div>` : ''}
      <section class="wrap section">${pg.raw ? pg.body : `<div class="rte narrow">${pg.body}</div>`}</section>`;
  }
  function notFound() {
    return `<section class="wrap section"><div class="empty-state"><h1 class="page-head__title" style="color:var(--ink)">404</h1><p class="empty-state__title">${u('nf_title')}</p><p>${u('nf_text')}</p><a class="btn" href="#/">${u('back_home')}</a></div></section>`;
  }

  /* ---------- router (with view transitions) ---------- */
  let route = '/';
  function parse(path) {
    const [p, q] = path.split('?');
    return { parts: p.split('/').filter(Boolean), query: new URLSearchParams(q || '') };
  }
  function render() {
    const { parts, query } = parse(route);
    const view = document.querySelector('[data-view]');
    const [a, b] = parts;
    let html;
    if (!a) html = home();
    else if (a === 'collections') html = collection(b || 'all', query);
    else if (a === 'products' && byHandle(b)) html = pdp(byHandle(b), query);
    else if (a === 'search') html = searchPage(query.get('q') || '');
    else if (a === 'guide') html = window.BlissGuide ? window.BlissGuide() : notFound();
    else if (a === 'pages') html = page(b);
    else html = notFound();
    view.innerHTML = html;
    document.body.dataset.page = a || 'home';
    const hdr = document.querySelector('[data-header]');
    if (hdr) { hdr.classList.toggle('hdr2--overlay', !a); hdr.classList.remove('is-solid'); }
    document.querySelectorAll('[data-nav]').forEach((l) => {
      if (route.split('?')[0] === l.dataset.nav) l.setAttribute('aria-current', 'page'); else l.removeAttribute('aria-current');
    });
    B.mount(view);
  }
  function go(path, push = true, heroImg, scrollTarget) {
    route = path || '/';
    if (push) { try { history.pushState({ path: route }, '', '#' + route); } catch (e) { /* sandboxed */ } }
    const swap = () => {
      render();
      const target = scrollTarget && document.getElementById(scrollTarget);
      if (target) target.scrollIntoView({ behavior: 'auto' }); else window.scrollTo({ top: 0, behavior: 'auto' });
      if (heroImg) { const h = document.querySelector('[data-vt-hero]'); if (h) h.style.viewTransitionName = 'vt-hero'; }
    };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !reduce) {
      if (heroImg) heroImg.style.viewTransitionName = 'vt-hero';
      try {
        const vt = document.startViewTransition(swap);
        vt.finished.finally(() => { const h = document.querySelector('[data-vt-hero]'); if (h) h.style.viewTransitionName = ''; });
      } catch (e) { swap(); }
    } else swap();
  }

  function shell() {
    const html = document.documentElement;
    html.lang = LANG;
    html.dir = LANG === 'he' ? 'rtl' : 'ltr';
    window.BlissStrings = STR[LANG];
    B.settings.locale = LANG;
    B.clearCache();
    document.getElementById('app').innerHTML = `<a class="skip-link" href="#main" data-skip>${u('skip')}</a>${previewBar()}${header()}<main id="main" data-view tabindex="-1"></main>${footer()}${overlays()}`;
    B.mount(document.getElementById('app'));
    B.cart.render(cartJSON());
  }

  /* ---------- preview-only controls ---------- */
  document.addEventListener('click', (e) => {
    const skip = e.target.closest('[data-skip]');
    if (skip) { e.preventDefault(); const m = document.getElementById('main'); if (m) m.focus(); return; }
    const scroll = e.target.closest('[data-scroll]');
    if (scroll) { e.preventDefault(); const t = document.getElementById(scroll.dataset.scroll); if (t) t.scrollIntoView({ behavior: 'smooth' }); return; }
    const lang = e.target.closest('[data-pv-lang]');
    if (lang) { LANG = lang.dataset.pvLang; B.store.set('preview-lang', LANG); shell(); render(); return; }
    if (e.target.closest('[data-pv-popup]')) { B.open('modal-newsletter'); return; }
    const a = e.target.closest('a[href^="#/"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    document.querySelectorAll('dialog[open]').forEach((d) => d.close());
    const href = a.getAttribute('href').slice(1);
    const scrollTo = a.dataset.scrollTo;
    if (scrollTo && route === '/' && document.getElementById(scrollTo)) { document.getElementById(scrollTo).scrollIntoView({ behavior: 'smooth' }); return; }
    const cardEl = a.closest('.card');
    const heroImg = href.startsWith('/products/') ? (cardEl ? cardEl.querySelector('.card__img') : a.querySelector('img')) : null;
    go(href, true, heroImg, scrollTo);
  });
  document.addEventListener('change', (e) => {
    if (e.target.matches('[data-pv-sort]')) {
      const { parts, query } = parse(route);
      query.set('sort', e.target.value);
      go('/' + parts.join('/') + '?' + query.toString());
    }
  });
  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.matches('[data-pv-filters]')) {
      e.preventDefault();
      const { parts, query } = parse(route);
      query.delete('color'); query.delete('size');
      new FormData(f).forEach((v, k) => query.append(k, v));
      const d = f.closest('dialog'); if (d) d.close();
      const s = query.toString();
      go('/' + parts.join('/') + (s ? '?' + s : ''));
    }
    if (f.matches('[data-search-form]') && !f.closest('dialog')) {
      e.preventDefault();
      go('/search?q=' + encodeURIComponent(new FormData(f).get('q') || ''));
    }
  });
  window.addEventListener('popstate', (e) => { route = (e.state && e.state.path) || '/'; render(); });
  window.addEventListener('hashchange', () => {
    const h = location.hash.replace(/^#/, '');
    if (h.startsWith('/') && h !== route) go(h, false);
  });

  /* ---------- boot ---------- */
  const start = location.hash.replace(/^#/, '');
  route = start.startsWith('/') ? start : start === 'guide' ? '/guide' : '/';
  window.BlissCart = cartJSON();
  shell();
  B.init();
  render();
})();
