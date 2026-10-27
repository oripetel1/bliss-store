/* ==========================================================================
   BLISS — storefront interactions v2 (shared by the Shopify theme and the preview)
   Data goes through an adapter: Shopify's Ajax API by default, or
   window.BlissAdapter when the design preview supplies one.
   ========================================================================== */
(function () {
  'use strict';

  const S = Object.assign({
    moneyFormat: '₪{{amount_no_decimals}}',
    routes: { root: '/', cart: '/cart', checkout: '/checkout', search: '/search' },
    freeShippingThreshold: 29900,
    lowStockThreshold: 3,
    installments: 3,
    delivery: { min: 2, max: 4, skipDays: [5, 6] },
    popup: { enabled: true, delay: 12, days: 7 },
    swatches: {},
    tints: {},
    locale: document.documentElement.lang || 'he',
    designMode: false,
    updateUrl: true,
  }, window.BlissSettings || {});

  /* ---------- helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-still');
  const rtl = () => document.documentElement.dir === 'rtl';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const debounce = (fn, ms) => { let id; return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), ms); }; };
  const pad2 = (n) => String(n).padStart(2, '0');

  function t(key, vars) {
    const dict = window.BlissStrings || {};
    let s = dict[key] != null ? dict[key] : key;
    if (vars) Object.keys(vars).forEach((k) => { s = s.replace(new RegExp('{{\\s*' + k + '\\s*}}', 'g'), vars[k]); });
    return s;
  }

  const store = {
    get(k, d) { try { const v = localStorage.getItem('bliss:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('bliss:' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  };

  /* one scroll/resize loop for every scroll-driven piece */
  const scrollers = new Set();
  let ticking = false;
  const runScrollers = () => { ticking = false; scrollers.forEach((fn) => fn()); };
  const requestTick = () => { if (!ticking) { ticking = true; requestAnimationFrame(runScrollers); } };
  addEventListener('scroll', requestTick, { passive: true });
  addEventListener('resize', debounce(() => { scrollers.forEach((fn) => fn(true)); }, 120));
  const addScroller = (fn) => { scrollers.add(fn); fn(true); return () => scrollers.delete(fn); };

  function toCents(v) {
    if (v == null || v === '') return 0;
    if (typeof v === 'string') return v.includes('.') ? Math.round(parseFloat(v) * 100) : parseInt(v, 10) || 0;
    return Number(v) || 0;
  }

  function formatMoney(cents, format) {
    cents = toCents(cents);
    const fmt = String(format || S.moneyFormat).replace(/<[^>]*>/g, '');
    const num = (dp, th, dec) => {
      const [i, f] = (cents / 100).toFixed(dp).split('.');
      return i.replace(/\B(?=(\d{3})+(?!\d))/g, th) + (f ? dec + f : '');
    };
    return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, (_, k) => ({
      amount: num(2, ',', '.'),
      amount_no_decimals: num(0, ',', '.'),
      amount_with_comma_separator: num(2, '.', ','),
      amount_no_decimals_with_comma_separator: num(0, '.', ','),
      amount_with_space_separator: num(2, ' ', ','),
      amount_with_apostrophe_separator: num(2, "'", '.'),
    }[k] || num(2, ',', '.')));
  }
  const money = (c) => `<span class="money">${esc(formatMoney(c))}</span>`;

  function img(src, w) {
    if (!src) return '';
    if (typeof src === 'object') src = src.src || src.url || '';
    if (src.startsWith('//') || /cdn\.shopify\.com|\/cdn\/shop\//.test(src)) {
      try {
        const u = new URL(src.startsWith('//') ? 'https:' + src : src, location.href);
        u.searchParams.set('width', w);
        return u.toString();
      } catch (e) { return src; }
    }
    return src;
  }

  const COLOR_NAMES = ['color', 'colour', 'צבע'];
  const SIZE_NAMES = ['size', 'מידה'];
  const optIndex = (p, names) => (p.options || []).findIndex((n) => names.includes(String(n).trim().toLowerCase()));

  function normalize(p) {
    if (!p) return null;
    const options = (p.options || []).map((o) => (typeof o === 'string' ? o : o.name));
    const variants = (p.variants || []).map((v) => ({
      id: v.id,
      title: v.title || v.public_title || '',
      options: v.options || [v.option1, v.option2, v.option3].filter((x) => x != null),
      available: v.available !== false,
      price: toCents(v.price),
      compare_at_price: toCents(v.compare_at_price),
      inventory: v.inventory != null ? v.inventory : null,
      image: v.image || (v.featured_image && (v.featured_image.src || v.featured_image)) || null,
      media_id: v.media_id != null ? v.media_id : (v.featured_media && v.featured_media.id) || null,
    }));
    const images = (p.images || []).map((i) => (typeof i === 'string' ? i : i.src));
    const root = (S.routes.root || '/').replace(/\/?$/, '/');
    return {
      id: p.id, handle: p.handle, title: p.title,
      url: p.url || root + 'products/' + p.handle,
      type: p.type || p.product_type || '',
      price: toCents(p.price != null ? p.price : variants[0] && variants[0].price),
      compare_at_price: toCents(p.compare_at_price),
      images, options, variants,
      badge: p.badge || '',
      available: variants.length ? variants.some((v) => v.available) : p.available !== false,
    };
  }

  /* ---------- data adapter ---------- */
  const root = () => (S.routes.root || '/').replace(/\/?$/, '/');
  const asJson = (r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); };
  const post = (url, body) => fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  }).then(async (r) => {
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.description || e.message || t('error')); }
    return r.json();
  });
  const shopifyAdapter = {
    getProduct: (handle) => fetch(root() + 'products/' + encodeURIComponent(handle) + '.js').then(asJson).then(normalize),
    getCart: () => fetch(root() + 'cart.js').then(asJson),
    add: (id, quantity) => post(root() + 'cart/add.js', { items: [{ id: Number(id), quantity: quantity || 1 }] }).then(() => shopifyAdapter.getCart()),
    change: (key, quantity) => post(root() + 'cart/change.js', { id: key, quantity }),
    search: (q) => fetch(root() + 'search/suggest.json?q=' + encodeURIComponent(q) + '&resources[type]=product&resources[limit]=10')
      .then(asJson)
      .then((d) => ((d.resources && d.resources.results && d.resources.results.products) || []).map((p) => ({
        title: p.title, url: p.url, image: p.image || (p.featured_image && p.featured_image.url), price: toCents(p.price),
      }))),
    recommend: (productId, intent) => fetch(root() + 'recommendations/products.json?product_id=' + productId + '&limit=6&intent=' + (intent || 'related'))
      .then(asJson).then((d) => (d.products || []).map(normalize)),
  };
  const api = () => window.BlissAdapter || shopifyAdapter;
  const productCache = new Map();
  const getProduct = (handle) => {
    if (!productCache.has(handle)) productCache.set(handle, api().getProduct(handle).catch((e) => { productCache.delete(handle); throw e; }));
    return productCache.get(handle);
  };

  /* ---------- icons (mirrors snippets/icon.liquid) ---------- */
  const svg = (d, cls) => `<svg class="icon ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${d}</svg>`;
  const ICON = {
    heart: svg('<path d="M12 20s-7.5-4.6-7.5-10.1A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>', 'icon--sm'),
    close: svg('<path d="m6 6 12 12M18 6 6 18"/>'),
    bag: svg('<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>'),
    lock: svg('<rect x="4.5" y="10.5" width="15" height="9.5" rx="1.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>', 'icon--sm'),
    truck: svg('<path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7"/><circle cx="6.5" cy="17.5" r="1.6"/><circle cx="16.5" cy="17.5" r="1.6"/>', 'icon--sm'),
    check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'icon--sm'),
    arrow: svg('<path d="M4 12h15M14 7l5 5-5 5"/>', 'icon--fwd icon--sm'),
  };

  /* ---------- swatches ---------- */
  function swatchValue(name) { return (S.swatches || {})[String(name).trim().toLowerCase()] || ''; }
  function swatchCss(name) {
    const v = swatchValue(name);
    if (!v) return 'var(--mist-2)';
    return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(v) || v.startsWith('//') || v.startsWith('http') ? `url('${v}')` : v;
  }
  function tintFor(name) {
    const key = String(name).trim().toLowerCase();
    if ((S.tints || {})[key]) return S.tints[key];
    const v = swatchValue(name);
    return /^#|^rgb|^hsl/i.test(v) ? v : '';
  }

  function colorGroups(p) {
    const ci = optIndex(p, COLOR_NAMES);
    if (ci < 0) return [];
    const seen = new Map();
    p.variants.forEach((v) => {
      const c = v.options[ci];
      if (!seen.has(c)) seen.set(c, { name: c, variant: v, image: v.image });
      else if (!seen.get(c).image && v.image) seen.get(c).image = v.image;
    });
    return Array.from(seen.values());
  }
  function sizeRange(p) {
    const si = optIndex(p, SIZE_NAMES);
    if (si < 0) return '';
    const vals = [...new Set(p.variants.map((v) => v.options[si]))];
    if (vals.length === 2) return vals.join(' · ');
    return vals.length > 1 ? `${vals[0]}–${vals[vals.length - 1]}` : vals[0] || '';
  }

  /* ---------- templates ---------- */
  function priceHTML(item) {
    const sale = item.compare_at_price && item.compare_at_price > item.price;
    return `<span class="price${sale ? ' price--sale' : ''}"><span class="price__now">${money(item.price)}</span>${sale ? `<s>${money(item.compare_at_price)}</s>` : ''}</span>`;
  }

  function swatchesHTML(p, max = 5) {
    const groups = colorGroups(p);
    if (groups.length < 2) return '<span></span>';
    const shown = groups.slice(0, max).map((g) => `<button type="button" class="swatch" style="--swatch:${esc(swatchCss(g.name))}" data-swatch-color="${esc(g.name)}" data-swatch-img="${esc(img(g.image, 700))}" data-swatch-url="${esc(p.url)}?variant=${g.variant.id}" aria-label="${esc(g.name)}" title="${esc(g.name)}"></button>`).join('');
    const more = groups.length > max ? `<span class="swatches__more">+${groups.length - max}</span>` : '';
    return `<div class="swatches">${shown}${more}</div>`;
  }

  function cardHTML(p) {
    const first = p.images[0];
    const alt = p.images[1];
    const badge = !p.available ? `<span class="tag tag--soldout">${t('sold_out')}</span>`
      : p.compare_at_price > p.price ? `<span class="tag tag--sale">${t('sale')}</span>`
        : p.badge ? `<span class="tag">${esc(p.badge)}</span>` : '';
    return `<article class="card" data-product-card data-handle="${esc(p.handle)}">
      <div class="card__frame">
      <a class="card__media" href="${esc(p.url)}" tabindex="-1" aria-hidden="true" data-cursor="${esc(t('view'))}">
        <img class="card__img" src="${esc(img(first, 700))}" alt="${esc(p.title)}" loading="lazy" width="700" height="933">
        ${alt ? `<img class="card__img card__img--alt" src="${esc(img(alt, 700))}" alt="" loading="lazy" width="700" height="933">` : ''}
      </a>
      ${badge}
      <button type="button" class="icon-btn card__wish wish-btn" data-wishlist-toggle="${esc(p.handle)}" aria-pressed="false" aria-label="${esc(t('wishlist_add'))}">${ICON.heart}</button>
      ${p.available ? `<div class="card__quick" data-quick-add="${esc(p.handle)}">
        <button type="button" class="card__quick-btn" data-quick-open aria-label="${esc(t('quick_add'))}">${ICON.plus}<span>${t('quick_add')}</span></button>
        <div class="card__sizes" data-quick-sizes hidden></div>
      </div>` : ''}
      </div>
      <div class="card__info">
        <div class="card__row"><h3 class="card__title"><a href="${esc(p.url)}">${esc(p.title)}</a></h3>${priceHTML(p)}</div>
        <div class="card__sub">${swatchesHTML(p)}<span class="card__range">${esc(sizeRange(p))}</span></div>
      </div>
    </article>`;
  }

  function miniHTML(p, opts = {}) {
    return `<div class="mini" data-product-card data-handle="${esc(p.handle)}">
      <a href="${esc(p.url)}" tabindex="-1" aria-hidden="true"><img src="${esc(img(p.images[0], 200))}" alt="" loading="lazy" width="60" height="76"></a>
      <div class="mini__body">
        <a href="${esc(p.url)}">${esc(p.title)}</a>
        ${priceHTML(p)}
        ${p.available ? `<div data-quick-add="${esc(p.handle)}"><button type="button" class="link-btn" data-quick-open>${ICON.plus} ${t('quick_add')}</button><div class="card__sizes" data-quick-sizes hidden></div></div>` : `<span class="muted">${t('sold_out')}</span>`}
        ${opts.remove ? `<button type="button" class="link-btn" data-wishlist-toggle="${esc(p.handle)}">${t('remove')}</button>` : ''}
      </div>
    </div>`;
  }

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    let el = $('#bliss-toast');
    if (!el) { el = document.createElement('div'); el.id = 'bliss-toast'; el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.innerHTML = `${ICON.check}<span>${esc(msg)}</span>`;
    el.hidden = false;
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }

  /* ---------- dialogs ---------- */
  function lockScroll() { document.documentElement.classList.toggle('is-locked', !!$('dialog[open]')); }
  function openDialog(id, opener) {
    const d = typeof id === 'string' ? document.getElementById(id) : id;
    if (!d || d.open) return;
    $$('dialog[open]').forEach((o) => { if (o !== d) o.close(); });
    closeMega();
    d._opener = opener || document.activeElement;
    d.showModal();
    lockScroll();
    d.dispatchEvent(new CustomEvent('bliss:open'));
  }
  function closeDialog(d) {
    if (!d || !d.open || d.classList.contains('is-closing')) return;
    const done = () => { d.classList.remove('is-closing'); d.close(); };
    if (reduced()) return done();
    d.classList.add('is-closing');
    setTimeout(done, 260);
  }
  function wireDialogs() {
    document.addEventListener('cancel', (e) => { if (e.target.tagName === 'DIALOG') { e.preventDefault(); closeDialog(e.target); } }, true);
    document.addEventListener('close', (e) => {
      if (e.target.tagName !== 'DIALOG') return;
      lockScroll();
      const o = e.target._opener;
      if (o && o.isConnected && typeof o.focus === 'function') o.focus({ preventScroll: true });
    }, true);
    document.addEventListener('click', (e) => {
      const d = e.target;
      if (d.tagName === 'DIALOG' && d.open) {
        const r = d.getBoundingClientRect();
        if (!(e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom)) closeDialog(d);
      }
    });
  }

  /* ---------- fly to bag ---------- */
  function flyToBag(source, target) {
    const bag = target || $$('[data-bag-target]').find((b) => b.offsetParent !== null);
    if (!source || !bag || reduced() || !source.animate) return Promise.resolve();
    const a = source.getBoundingClientRect();
    const b = bag.getBoundingClientRect();
    if (!a.width || a.bottom < 0 || a.top > innerHeight) return Promise.resolve();
    const el = document.createElement('img');
    el.src = source.currentSrc || source.src;
    el.alt = '';
    el.className = 'fly';
    Object.assign(el.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px' });
    document.body.appendChild(el);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const s = Math.max(0.05, 28 / a.width);
    const anim = el.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1, borderRadius: '6px' },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.35 - 60}px) scale(${(1 + s) / 2.4})`, opacity: 1, borderRadius: '24px', offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 0.4, borderRadius: '50%' },
    ], { duration: 850, easing: 'cubic-bezier(.55, 0, .2, 1)' });
    return anim.finished.then(() => {
      el.remove();
      bag.classList.remove('bump'); void bag.offsetWidth; bag.classList.add('bump');
    }).catch(() => el.remove());
  }
  function sourceImage(btn) {
    if (!btn) return null;
    const card = btn.closest('[data-product-card]');
    if (card) return $('.card__img, img', card);
    const pdp = btn.closest('[data-pdp]') || $('[data-pdp]');
    return pdp ? $('[data-slides] img', pdp) : null;
  }

  /* ---------- cart ---------- */
  const Cart = {
    state: null,
    setCount(n) { $$('[data-cart-count]').forEach((el) => { el.textContent = n; el.dataset.count = n; }); },
    render(cart) {
      if (!cart) return;
      this.state = cart;
      this.setCount(cart.item_count);
      const body = $('[data-cart-body]');
      const foot = $('[data-cart-foot]');
      if (!body) return;
      const label = $('[data-cart-count-label]');
      if (label) label.textContent = cart.item_count ? pad2(cart.item_count) : '';
      if (!cart.items.length) {
        body.innerHTML = `<div class="empty-state">${ICON.bag}<p class="empty-state__title">${t('cart_empty')}</p><button type="button" class="btn btn--ghost btn--sm" data-close>${t('continue_shopping')}</button></div>`;
        if (foot) foot.hidden = true;
        return;
      }
      body.innerHTML = this.shipBar(cart.total_price) +
        `<ul class="lines">${cart.items.map((it) => this.lineHTML(it)).join('')}</ul>` +
        `<div class="upsell" data-cart-upsell hidden></div>`;
      if (foot) {
        foot.hidden = false;
        foot.innerHTML = `<div class="cart-total"><span>${t('subtotal')}</span><strong>${esc(formatMoney(cart.total_price))}</strong></div>
          <p class="cart-note">${t('taxes_note')}</p>
          <a class="btn btn--block" href="${esc(S.routes.checkout)}" data-checkout>${ICON.lock}${t('checkout')}</a>
          <p class="cart-secure">${t('secure_note')}</p>`;
      }
      this.loadUpsell(cart);
    },
    shipBar(total) {
      const goal = S.freeShippingThreshold;
      if (!goal) return '';
      const left = Math.max(0, goal - total);
      const pct = Math.min(100, Math.round((total / goal) * 100));
      const text = left > 0 ? t('free_ship_remaining', { amount: `<strong>${esc(formatMoney(left))}</strong>` }) : `<b>${t('free_ship_done')}</b>`;
      return `<div class="ship-bar${left ? '' : ' is-done'}"><p>${ICON.truck}<span>${text}</span></p><div class="ship-bar__track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><div class="ship-bar__fill" style="--p:${pct}%"></div></div></div>`;
    },
    lineHTML(it) {
      const variant = it.variant_title && it.variant_title !== 'Default Title' ? it.variant_title : '';
      return `<li class="line" data-line="${esc(it.key)}">
        <a href="${esc(it.url)}" tabindex="-1" aria-hidden="true"><img class="line__img" src="${esc(img(it.image, 240))}" alt="" width="92" height="123" loading="lazy"></a>
        <div class="line__body">
          <div class="line__top"><a class="line__title" href="${esc(it.url)}">${esc(it.product_title || it.title)}</a><span class="price">${money(it.final_line_price)}</span></div>
          ${variant ? `<span class="line__variant">${esc(variant)}</span>` : ''}
          <div class="line__bottom">
            <div class="qty" role="group" aria-label="${esc(t('quantity'))}">
              <button type="button" data-line-qty="${it.quantity - 1}" aria-label="${esc(t('decrease'))}">−</button>
              <span aria-live="polite">${it.quantity}</span>
              <button type="button" data-line-qty="${it.quantity + 1}" aria-label="${esc(t('increase'))}">+</button>
            </div>
            <button type="button" class="link-btn" data-line-qty="0">${t('remove')}</button>
          </div>
        </div>
      </li>`;
    },
    async loadUpsell(cart) {
      const box = $('[data-cart-upsell]');
      if (!box || !cart.items.length) return;
      const pid = cart.items[0].product_id;
      const inCart = new Set(cart.items.map((i) => i.handle));
      try {
        let list = await api().recommend(pid, 'complementary');
        if (!list.length) list = await api().recommend(pid, 'related');
        list = list.filter((p) => p && p.available && !inCart.has(p.handle)).slice(0, 3);
        if (!list.length || !box.isConnected) return;
        box.innerHTML = `<p class="upsell__title">${t('complete_look')}</p><div class="upsell__list">${list.map((p) => miniHTML(p)).join('')}</div>`;
        box.hidden = false;
      } catch (e) { /* optional */ }
    },
    async refresh() { try { this.render(await api().getCart()); } catch (e) { /* keep server markup */ } },
    async add(id, qty, btn) {
      if (btn) btn.classList.add('is-loading');
      const src = sourceImage(btn);
      try {
        const cart = await api().add(id, qty || 1);
        this.render(cart);
        document.dispatchEvent(new CustomEvent('bliss:cart:added', { detail: { id, cart } }));
        if (btn) btn.classList.remove('is-loading');
        const inDialog = btn && btn.closest('dialog');
        if (!inDialog) { flyToBag(src); await new Promise((r) => setTimeout(r, reduced() ? 0 : 650)); }
        openDialog('drawer-cart', btn);
      } catch (e) {
        toast(e.message || t('error'));
      } finally {
        if (btn) btn.classList.remove('is-loading');
      }
    },
    async change(key, qty) {
      const line = $(`[data-line="${CSS.escape(key)}"]`);
      if (line) line.style.opacity = '.45';
      try { this.render(await api().change(key, qty)); } catch (e) { toast(e.message || t('error')); if (line) line.style.opacity = ''; }
    },
  };

  /* ---------- quick add ---------- */
  function closeQuick(except) {
    $$('[data-quick-add].is-open').forEach((w) => {
      if (w === except) return;
      w.classList.remove('is-open');
      const s = $('[data-quick-sizes]', w); if (s) s.hidden = true;
    });
  }
  async function quickOpen(wrap, btn) {
    if (wrap.classList.contains('is-open')) { closeQuick(); return; }
    closeQuick(wrap);
    let p;
    try { p = await getProduct(wrap.dataset.quickAdd); } catch (e) { toast(t('error')); return; }
    const ci = optIndex(p, COLOR_NAMES);
    const si = optIndex(p, SIZE_NAMES);
    const card = wrap.closest('[data-product-card]');
    const firstAvail = p.variants.find((v) => v.available) || p.variants[0];
    const color = ci > -1 ? ((card && card.dataset.activeColor) || firstAvail.options[ci]) : null;
    const pool = p.variants.filter((v) => ci < 0 || v.options[ci] === color);
    if (pool.length === 1) { Cart.add(pool[0].id, 1, btn); return; }
    const box = $('[data-quick-sizes]', wrap);
    const label = (v) => (si > -1 ? v.options[si] : v.options.filter((_, i) => i !== ci).join(' / ') || v.title);
    box.innerHTML = `<p class="card__sizes-label">${t('choose_size')}${color ? ` · ${esc(color)}` : ''}</p>
      <div class="card__sizes-list">${pool.map((v) => `<button type="button" class="size-chip" data-quick-variant="${v.id}" ${v.available ? '' : `disabled aria-label="${esc(label(v))} – ${esc(t('sold_out'))}"`}>${esc(label(v))}</button>`).join('')}</div>`;
    box.hidden = false;
    wrap.classList.add('is-open');
    const f = $('.size-chip:not([disabled])', box); if (f) f.focus({ preventScroll: true });
  }

  /* ---------- wishlist ---------- */
  const Wish = {
    list: () => store.get('wishlist', []),
    has: (h) => Wish.list().includes(h),
    toggle(h, btn) {
      const l = Wish.list();
      const on = !l.includes(h);
      store.set('wishlist', on ? [h].concat(l) : l.filter((x) => x !== h));
      Wish.sync();
      toast(on ? t('wishlist_added') : t('wishlist_removed'));
      if (on && btn && !btn.closest('dialog')) {
        const target = $$('[data-wish-target]').find((b) => b.offsetParent !== null);
        if (target) flyToBag(sourceImage(btn), target);
      }
      const d = $('#drawer-wishlist'); if (d && d.open) Wish.render();
    },
    sync() {
      const l = Wish.list();
      $$('button[data-wishlist-toggle]').forEach((b) => { if (!b.classList.contains('link-btn')) b.setAttribute('aria-pressed', l.includes(b.dataset.wishlistToggle)); });
      $$('[data-wishlist-count]').forEach((el) => { el.textContent = l.length; el.dataset.count = l.length; });
    },
    async render() {
      const body = $('[data-wishlist-body]');
      if (!body) return;
      const l = Wish.list();
      if (!l.length) { body.innerHTML = `<div class="empty-state">${ICON.heart}<p class="empty-state__title">${t('wishlist_empty_title')}</p><p>${t('wishlist_empty')}</p></div>`; return; }
      const res = await Promise.allSettled(l.map(getProduct));
      const items = res.filter((r) => r.status === 'fulfilled' && r.value).map((r) => r.value);
      body.innerHTML = `<div class="ctl" style="padding-block:4px 24px">${items.map((p) => miniHTML(p, { remove: true })).join('')}</div>`;
    },
  };

  /* ---------- recently viewed ---------- */
  function trackView(handle) {
    if (!handle) return;
    store.set('recent', [handle].concat(store.get('recent', []).filter((h) => h !== handle)).slice(0, 8));
  }
  async function renderRecent(box) {
    const exclude = box.dataset.exclude;
    const list = store.get('recent', []).filter((h) => h !== exclude).slice(0, Number(box.dataset.limit || 4));
    const section = box.closest('[data-recent-section]') || box;
    if (!list.length) { section.hidden = true; return; }
    const res = await Promise.allSettled(list.map(getProduct));
    const items = res.filter((r) => r.status === 'fulfilled' && r.value).map((r) => r.value);
    if (!items.length) { section.hidden = true; return; }
    box.innerHTML = items.map(cardHTML).join('');
    section.hidden = false;
    Wish.sync();
  }

  /* ---------- search ---------- */
  const runSearch = debounce(async (input) => {
    const q = input.value.trim();
    const wrap = input.closest('[data-search]');
    const out = $('[data-search-results]', wrap);
    const suggest = $('[data-search-suggest]', wrap);
    if (!q) { out.innerHTML = ''; if (suggest) suggest.hidden = false; return; }
    if (suggest) suggest.hidden = true;
    try {
      const hits = await api().search(q);
      if (input.value.trim() !== q) return;
      out.innerHTML = hits.length
        ? `<p class="eyebrow" style="margin-bottom:16px">${t('products')} <span class="mono">(${pad2(hits.length)})</span></p><div class="search-results">${hits.map((h) => `<a class="search-hit" href="${esc(h.url)}"><img src="${esc(img(h.image, 400))}" alt="" loading="lazy" width="300" height="400"><span>${esc(h.title)}</span>${priceHTML(h)}</a>`).join('')}</div>`
        : `<p class="empty-state__title">${t('no_results', { q: esc(q) })}</p>`;
    } catch (e) { out.innerHTML = ''; }
  }, 200);

  /* ---------- product form ---------- */
  function setTint(color) {
    const html = document.documentElement;
    if (color) html.style.setProperty('--tint', color); else html.style.removeProperty('--tint');
  }

  function initProductForm(form) {
    const section = form.closest('[data-pdp]') || form;
    const raw = $('[data-product-json]', section);
    if (!raw) return null;
    const p = normalize(JSON.parse(raw.textContent));
    const ci = optIndex(p, COLOR_NAMES);
    const si = optIndex(p, SIZE_NAMES);
    const idInput = $('input[name="id"]', form);
    const atc = $('[data-atc]', form);
    const atcLabel = atc && ($('[data-atc-label]', atc) || atc);
    const atcPrice = atc && $('[data-atc-price]', atc);
    const stock = $('[data-stock]', section);
    const notify = $('[data-notify]', section);
    const sticky = $('[data-sticky-atc]', section) || $('[data-sticky-atc]');
    // one-value options (e.g. One Size) need no choice from the shopper
    p.options.forEach((_, i) => {
      const radios = $$(`[data-option-index="${i}"]`, section);
      if (radios.length === 1 && !radios[0].checked) radios[0].checked = true;
    });
    // a colour with no size left is marked as sold out on its swatch
    if (ci > -1) {
      $$(`[data-option-index="${ci}"]`, section).forEach((r) => {
        const out = !p.variants.some((x) => x.options[ci] === r.value && x.available);
        const lab = r.nextElementSibling;
        if (lab) { lab.classList.toggle('is-unavailable', out); if (out) lab.title = `${r.value} – ${t('sold_out')}`; }
      });
    }
    const selected = () => p.options.map((_, i) => { const r = $(`[data-option-index="${i}"]:checked`, section); return r ? r.value : null; });
    const match = (sel) => p.variants.find((v) => v.options.every((o, i) => o === sel[i])) || null;
    let current = null;

    function update(fromUser) {
      const sel = selected();
      const missing = sel.some((x) => x == null);
      const v = missing ? null : match(sel);
      current = v;
      if (!missing) $$('.opt.is-invalid', section).forEach((el) => el.classList.remove('is-invalid'));
      $$('[data-option-label]', section).forEach((el) => { el.textContent = sel[Number(el.dataset.optionLabel)] || ''; });
      if (si > -1) {
        $$(`[data-option-index="${si}"]`, section).forEach((r) => {
          const alt = p.variants.find((x) => x.options.every((o, i) => (i === si ? o === r.value : o === sel[i])));
          const lab = r.nextElementSibling;
          if (lab) lab.classList.toggle('is-unavailable', !alt || !alt.available);
        });
      }
      idInput.value = v ? v.id : '';
      const shown = v || p;
      $$('[data-price]', section).forEach((el) => { el.innerHTML = priceHTML(shown); });
      $$('[data-installments]', section).forEach((el) => {
        const n = Number(S.installments);
        el.hidden = !(n > 1);
        if (n > 1) el.innerHTML = t('installments', { count: n, amount: money(Math.round(shown.price / n)) });
      });
      if (stock) {
        let cls = 'stock', msg = t('in_stock');
        stock.hidden = missing && p.available;
        if (!p.available) { cls += ' stock--out'; msg = t('sold_out'); }
        else if (!v) { cls += ' stock--out'; msg = t('unavailable'); }
        else if (!v.available) { cls += ' stock--out'; msg = t('sold_out'); }
        else if (v.inventory != null && v.inventory > 0 && v.inventory <= S.lowStockThreshold) { cls += ' stock--low'; msg = t('low_stock', { count: v.inventory }); }
        stock.className = cls;
        stock.textContent = msg;
      }
      if (atc) {
        const ok = v && v.available;
        atc.disabled = missing ? !p.available : !ok;
        atcLabel.textContent = missing ? (p.available ? t('add_to_cart') : t('sold_out')) : !v ? t('unavailable') : ok ? t('add_to_cart') : t('sold_out');
        if (atcPrice) atcPrice.textContent = formatMoney(shown.price);
      }
      if (notify) {
        notify.hidden = !(v && !v.available);
        const body = $('[name="contact[body]"]', notify);
        if (body && v) body.value = `${t('notify_body')}: ${p.title} – ${v.title}`;
      }
      if (ci > -1 && sel[ci]) {
        showColor(section, sel[ci], fromUser);
        if (section.hasAttribute('data-tint-page')) setTint(tintFor(sel[ci]));
      }
      if (sticky) {
        const vt = $('[data-sticky-variant]', sticky); if (vt) vt.textContent = v ? v.title : (sel[ci] || '');
        const sp = $('[data-sticky-price]', sticky); if (sp) sp.innerHTML = priceHTML(shown);
        const sb = $('[data-sticky-btn]', sticky);
        if (sb) sb.textContent = v && !v.available ? t('sold_out') : missing ? t('choose_size') : t('add_to_cart');
        const si2 = $('[data-sticky-img]', sticky) || $('img', sticky);
        const first = $('[data-slides] img', section);
        if (si2 && first) si2.src = first.currentSrc || first.src;
      }
      if (fromUser && v && S.updateUrl) {
        try { history.replaceState(history.state, '', location.pathname + '?variant=' + v.id); } catch (e) { /* ignore */ }
      }
      form.dispatchEvent(new CustomEvent('bliss:variant', { bubbles: true, detail: { product: p, variant: v } }));
    }

    section.addEventListener('change', (e) => { if (e.target.matches('[data-option-index]')) update(true); });
    const askForSize = () => {
      const opt = $$('.opt', section).find((el) => !$('[data-option-index]:checked', el));
      if (!opt) return;
      opt.classList.remove('is-invalid'); void opt.offsetWidth; opt.classList.add('is-invalid');
      opt.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
      toast(t('choose_size'));
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!idInput.value) { askForSize(); return; }
      const q = $('[name="quantity"]', form);
      Cart.add(idInput.value, q ? Number(q.value) || 1 : 1, atc);
    });

    if (sticky && atc && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([en]) => {
        const show = !en.isIntersecting && en.boundingClientRect.top < 0;
        sticky.classList.toggle('is-visible', show);
        sticky.setAttribute('aria-hidden', String(!show));
        document.body.classList.toggle('has-sticky-atc', show);
      });
      io.observe(atc);
      const sb = $('[data-sticky-btn]', sticky);
      if (sb) sb.addEventListener('click', () => { if (current && current.available) Cart.add(current.id, 1, sb); else askForSize(); });
    }
    initRail(section);
    trackView(p.handle);
    update(false);
    return { product: p, update };
  }

  function showColor(section, color, fromUser) {
    const slides = $('[data-slides]', section);
    if (!slides) return;
    const items = Array.from(slides.children);
    const match = items.filter((s) => s.dataset.color === color);
    if (!match.length) return;
    if (items[0] === match[0] && !fromUser) return;
    const order = match.concat(items.filter((s) => !match.includes(s)));
    order.forEach((s) => slides.appendChild(s));
    const rail = $('[data-rail]', section);
    if (rail) order.forEach((s) => { const th = $(`[data-thumb="${s.dataset.mediaId}"]`, rail); if (th) rail.appendChild(th); });
    slides.scrollTo({ left: 0, behavior: 'auto' });
    updateCounter(slides);
    if (fromUser && innerWidth > 989) {
      const top = slides.getBoundingClientRect().top + scrollY - 100;
      if (scrollY > top + 200) scrollTo({ top, behavior: reduced() ? 'auto' : 'smooth' });
    }
  }
  function initRail(section) {
    const rail = $('[data-rail]', section);
    const slides = $('[data-slides]', section);
    if (!rail || !slides || !('IntersectionObserver' in window)) return;
    rail.addEventListener('click', (e) => {
      const th = e.target.closest('[data-thumb]');
      if (!th) return;
      const s = $(`[data-media-id="${th.dataset.thumb}"]`, slides);
      if (s) s.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    });
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) $$('[data-thumb]', rail).forEach((th) => th.classList.toggle('is-active', th.dataset.thumb === en.target.dataset.mediaId));
    }), { rootMargin: '-45% 0px -45% 0px' });
    $$('[data-media-id]', slides).forEach((s) => io.observe(s));
  }
  function updateCounter(slides) {
    const c = $('[data-slide-counter]', slides.parentNode);
    if (!c) return;
    const n = slides.children.length;
    const i = Math.min(n, Math.round(Math.abs(slides.scrollLeft) / Math.max(1, slides.clientWidth)) + 1);
    c.textContent = `${pad2(i)} / ${pad2(n)}`;
  }

  /* ---------- complete the look / recommendations ---------- */
  async function loadComplementary(box) {
    const wrap = box.closest('[data-complementary-wrap]') || box;
    try {
      const list = (await api().recommend(box.dataset.complementary, 'complementary')).filter((p) => p && p.available).slice(0, Number(box.dataset.limit || 3));
      if (!list.length) { wrap.hidden = true; return; }
      box.innerHTML = list.map((p) => miniHTML(p)).join('');
      wrap.hidden = false;
    } catch (e) { wrap.hidden = true; }
  }
  async function loadRecommendations(box) {
    try {
      const html = await fetch(box.dataset.recommendationsUrl).then((r) => r.text());
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const fresh = doc.querySelector('[data-recommendations-url]');
      if (fresh && fresh.innerHTML.trim()) { box.innerHTML = fresh.innerHTML; Wish.sync(); }
      else { const sec = box.closest('[data-recommendations-section]'); if (sec) sec.hidden = true; }
    } catch (e) { /* optional */ }
  }

  /* ---------- delivery estimate (skips Fri/Sat) ---------- */
  function addBusinessDays(date, n, skip) {
    const d = new Date(date);
    let left = n;
    while (left > 0) { d.setDate(d.getDate() + 1); if (!skip.includes(d.getDay())) left -= 1; }
    return d;
  }
  function renderDelivery(el) {
    const { min, max, skipDays } = S.delivery || {};
    if (!max) { el.closest('.pdp__delivery') ? (el.closest('.pdp__delivery').hidden = true) : (el.hidden = true); return; }
    const loc = S.locale === 'he' ? 'he-IL' : S.locale;
    const f = new Intl.DateTimeFormat(loc, { weekday: 'short', day: 'numeric', month: 'short' });
    const now = new Date();
    el.innerHTML = t('delivery', { from: `<strong>${f.format(addBusinessDays(now, min, skipDays || []))}</strong>`, to: `<strong>${f.format(addBusinessDays(now, max, skipDays || []))}</strong>` });
  }

  /* ---------- countdown ---------- */
  function startCountdown(el) {
    const end = new Date(el.dataset.countdown).getTime();
    if (!end) return;
    const units = { d: 864e5, h: 36e5, m: 6e4, s: 1e3 };
    let id;
    const tick = () => {
      if (!el.isConnected) return clearInterval(id);
      let left = Math.max(0, end - Date.now());
      Object.keys(units).forEach((u) => {
        const n = Math.floor(left / units[u]); left -= n * units[u];
        const out = $(`[data-unit="${u}"]`, el); if (out) out.textContent = pad2(n);
      });
      if (end - Date.now() <= 0) {
        clearInterval(id);
        const wrap = el.closest('[data-countdown-wrap]') || el;
        if (el.dataset.hideOnEnd != null) wrap.hidden = true;
      }
    };
    id = setInterval(tick, 1000);
    tick();
  }

  /* ---------- announcement rotator ---------- */
  function startAnnouncements(bar) {
    const items = $$('.announce__item', bar);
    if (items.length < 2) { if (items[0]) items[0].classList.add('is-active'); return; }
    let i = 0, paused = false;
    items[0].classList.add('is-active');
    bar.addEventListener('mouseenter', () => { paused = true; });
    bar.addEventListener('mouseleave', () => { paused = false; });
    const id = setInterval(() => {
      if (!bar.isConnected) return clearInterval(id);
      if (paused || document.documentElement.classList.contains('a11y-still')) return;
      const prev = items[i];
      prev.classList.remove('is-active'); prev.classList.add('is-leaving');
      setTimeout(() => prev.classList.remove('is-leaving'), 700);
      i = (i + 1) % items.length;
      items[i].classList.add('is-active');
    }, Number(bar.dataset.speed || 4500));
  }

  /* ---------- header: solid / hide on scroll / mega menu ---------- */
  let lastY = scrollY;
  function headerScroll() {
    const h = $('[data-header]');
    if (!h) return;
    const intro = $('[data-intro]:not(.is-static)');
    const hero = $('[data-hero-full]');
    const y = scrollY;
    const threshold = hero ? hero.offsetTop + hero.offsetHeight - h.offsetHeight - 10 : intro ? intro.offsetTop + intro.offsetHeight - innerHeight * 0.6 : 8;
    if (!h.classList.contains('is-solid')) h.style.setProperty('--hh', h.offsetHeight + 'px');
    h.classList.toggle('is-solid', y > threshold);
    if (h.hasAttribute('data-no-hide')) { lastY = y; return; }
    const down = y > lastY + 4;
    const up = y < lastY - 4;
    if (!h.classList.contains('has-mega')) {
      if (down && y > Math.max(160, threshold)) h.classList.add('is-hidden');
      if (up || y < 80) h.classList.remove('is-hidden');
    }
    document.body.classList.toggle('hdr-hidden', h.classList.contains('is-hidden'));
    if (down || up) lastY = y;
  }
  let megaTimer;
  function closeMega() {
    $$('[data-mega].is-open').forEach((m) => {
      m.classList.remove('is-open');
      const panel = $('.mega', m); if (panel) panel.classList.remove('is-open');
      const b = $('[data-mega-btn]', m); if (b) b.setAttribute('aria-expanded', 'false');
    });
    const h = $('[data-header]'); if (h) h.classList.remove('has-mega');
  }
  function openMega(m) {
    closeMega();
    m.classList.add('is-open');
    const panel = $('.mega', m); if (panel) panel.classList.add('is-open');
    const b = $('[data-mega-btn]', m); if (b) b.setAttribute('aria-expanded', 'true');
    const h = $('[data-header]'); if (h) h.classList.add('has-mega');
  }
  function initMega(m) {
    const fine = matchMedia('(hover: hover)').matches;
    if (fine) {
      m.addEventListener('mouseenter', () => { clearTimeout(megaTimer); megaTimer = setTimeout(() => openMega(m), 90); });
      m.addEventListener('mouseleave', () => { clearTimeout(megaTimer); megaTimer = setTimeout(closeMega, 180); });
    }
    const b = $('[data-mega-btn]', m);
    if (b) b.addEventListener('click', () => (m.classList.contains('is-open') ? closeMega() : openMega(m)));
    m.addEventListener('focusout', (e) => { if (!m.contains(e.relatedTarget)) closeMega(); });
  }

  /* ---------- intro: photo seen through the wordmark ---------- */
  function initIntro(el) {
    const stage = $('.intro__stage', el);
    const ok = (window.CSS && (CSS.supports('mask-size', '10px') || CSS.supports('-webkit-mask-size', '10px')));
    if (reduced() || !ok) { el.classList.add('is-static'); return; }
    const cx = Number(el.dataset.cx || 0.528);
    const cy = Number(el.dataset.cy || 0.5);
    const ratio = Number(el.dataset.ratio || 0.327);
    return addScroller(() => {
      if (!el.isConnected) return;
      const total = Math.max(1, el.offsetHeight - innerHeight);
      const p = clamp(-el.getBoundingClientRect().top / total);
      const vw = innerWidth, vh = innerHeight;
      const base = Math.min(vw * (vw < 750 ? 0.88 : 0.76), vh * 2.2);
      const z = Math.pow(clamp(p / 0.78), 2.8);
      const w = base * (1 + z * 70);
      const h = w * ratio;
      stage.style.setProperty('--mw', w.toFixed(1) + 'px');
      stage.style.setProperty('--mx', (vw / 2 - w * cx).toFixed(1) + 'px');
      stage.style.setProperty('--my', (vh / 2 - h * cy).toFixed(1) + 'px');
      stage.style.setProperty('--p', p.toFixed(3));
      stage.style.setProperty('--full', clamp((p - 0.42) / 0.3).toFixed(3));
      stage.style.setProperty('--copy', clamp((p - 0.68) / 0.22).toFixed(3));
    });
  }

  /* ---------- manifesto: words light up as you read ---------- */
  function initWords(el) {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) {
          if (n.classList.contains('pill-img')) n.classList.add('w'); else walk(n);
        }
      });
    };
    walk(el);
    const words = $$('.w', el);
    if (reduced()) { words.forEach((w) => w.classList.add('on')); return; }
    return addScroller(() => {
      if (!el.isConnected) return;
      const r = el.getBoundingClientRect();
      const p = clamp((innerHeight * 0.82 - r.top) / (r.height + innerHeight * 0.25));
      const n = Math.round(p * words.length);
      words.forEach((w, k) => w.classList.toggle('on', k < n));
    });
  }

  /* ---------- colour book ---------- */
  function initColorbook(el) {
    const strips = $$('[data-strip]', el);
    if (!strips.length) return;
    let hoverTimer;
    const select = (s, focus) => {
      strips.forEach((x) => { const on = x === s; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; });
      if (s.dataset.tint) el.style.setProperty('--tint', s.dataset.tint);
      const key = s.dataset.strip;
      $$('[data-cb-img]', el).forEach((i) => i.classList.toggle('is-active', i.dataset.cbImg === key));
      $$('[data-cb-panel]', el).forEach((pnl) => { pnl.hidden = pnl.dataset.cbPanel !== key; });
      if (focus) s.focus();
    };
    strips.forEach((s, k) => {
      s.addEventListener('click', () => select(s));
      s.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) { clearTimeout(hoverTimer); hoverTimer = setTimeout(() => select(s), 140); } });
      s.addEventListener('mouseleave', () => clearTimeout(hoverTimer));
      s.addEventListener('keydown', (e) => {
        const fwd = rtl() ? 'ArrowLeft' : 'ArrowRight';
        const back = rtl() ? 'ArrowRight' : 'ArrowLeft';
        if (e.key === fwd) { e.preventDefault(); select(strips[(k + 1) % strips.length], true); }
        if (e.key === back) { e.preventDefault(); select(strips[(k - 1 + strips.length) % strips.length], true); }
      });
    });
    select(strips.find((s) => s.getAttribute('aria-selected') === 'true') || strips[0]);
  }

  /* ---------- lookbook: vertical scroll drives a horizontal track ---------- */
  function initLookbook(el) {
    const track = $('.lookbook__track', el);
    if (!track) return;
    const looks = $$('.look', track);
    const cur = $('[data-look-current]', el);
    let dist = 0;
    return addScroller((relayout) => {
      if (!el.isConnected) return;
      const native = innerWidth < 990 || reduced();
      if (relayout) {
        el.classList.toggle('is-native', native);
        if (native) { el.style.height = ''; track.style.transform = ''; }
        else { dist = Math.max(0, track.offsetWidth - innerWidth); el.style.height = (innerHeight + dist) + 'px'; }
      }
      if (native) return;
      const p = clamp(-el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - innerHeight));
      track.style.transform = `translate3d(${(rtl() ? 1 : -1) * p * dist}px, 0, 0)`;
      el.style.setProperty('--lp', p.toFixed(3));
      if (cur) cur.textContent = pad2(Math.min(looks.length, Math.floor(p * looks.length) + 1));
    });
  }

  /* ---------- quotes ---------- */
  function initQuotes(el) {
    const items = $$('.quote', el);
    if (items.length < 2) { if (items[0]) items[0].classList.add('is-active'); return; }
    const dots = $$('[data-quote-dot]', el);
    let i = 0, hold = false;
    const show = (n) => {
      i = (n + items.length) % items.length;
      items.forEach((q, k) => { q.classList.toggle('is-active', k === i); q.setAttribute('aria-hidden', String(k !== i)); });
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    };
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-quote-prev]')) show(i - 1);
      if (e.target.closest('[data-quote-next]')) show(i + 1);
      const d = e.target.closest('[data-quote-dot]'); if (d) show(Number(d.dataset.quoteDot));
    });
    el.addEventListener('mouseenter', () => { hold = true; });
    el.addEventListener('mouseleave', () => { hold = false; });
    el.addEventListener('focusin', () => { hold = true; });
    el.addEventListener('focusout', () => { hold = false; });
    const id = setInterval(() => { if (!el.isConnected) return clearInterval(id); if (!hold && !reduced()) show(i + 1); }, 7000);
    show(0);
  }

  /* ---------- custom cursor (fine pointers only) ---------- */
  function initCursor() {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches || reduced() || $('.cursor')) return;
    const c = document.createElement('div');
    c.className = 'cursor';
    c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<span class="cursor__in"></span>';
    document.body.appendChild(c);
    document.documentElement.classList.add('has-cursor');
    const label = $('.cursor__in', c);
    let x = -200, y = -200, tx = x, ty = y;
    addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      const tgt = e.target.closest && e.target.closest('[data-cursor]');
      const on = !!tgt && !e.target.closest('button, .card__quick, .card__wish, .swatches');
      c.classList.toggle('is-on', on);
      if (on && label.textContent !== tgt.dataset.cursor) label.textContent = tgt.dataset.cursor;
    }, { passive: true });
    document.addEventListener('mouseleave', () => c.classList.remove('is-on'));
    const loop = () => {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2;
      c.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- product carousel ---------- */
  function initCarousel(el) {
    const track = $('[data-carousel-track]', el);
    if (!track) return;
    const prev = $('[data-carousel-prev]', el);
    const next = $('[data-carousel-next]', el);
    const dotsBox = $('[data-carousel-dots]', el);
    const step = () => { const first = track.firstElementChild; return first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth; };
    const pos = () => Math.abs(track.scrollLeft);
    const max = () => Math.max(0, track.scrollWidth - track.clientWidth);
    const pages = () => Math.max(1, Math.round(max() / Math.max(1, track.clientWidth)) + 1);
    const go = (dir) => track.scrollBy({ left: dir * step() * (rtl() ? -1 : 1), behavior: reduced() ? 'auto' : 'smooth' });
    if (prev) prev.addEventListener('click', () => go(-1));
    if (next) next.addEventListener('click', () => go(1));
    const paint = () => {
      if (!el.isConnected) return;
      const m = max();
      if (prev) prev.disabled = pos() < 4;
      if (next) next.disabled = pos() > m - 4;
      if (dotsBox) {
        const n = pages();
        if (dotsBox.children.length !== n) {
          dotsBox.innerHTML = Array.from({ length: n }, (_, i) => `<button type="button" aria-label="${i + 1}"></button>`).join('');
          Array.from(dotsBox.children).forEach((b, i) => b.addEventListener('click', () => track.scrollTo({ left: (rtl() ? -1 : 1) * Math.min(m, i * track.clientWidth), behavior: 'smooth' })));
        }
        const cur = m ? Math.round((pos() / m) * (n - 1)) : 0;
        Array.from(dotsBox.children).forEach((b, i) => b.setAttribute('aria-current', String(i === cur)));
        dotsBox.hidden = n < 2;
      }
    };
    track.addEventListener('scroll', debounce(paint, 60), { passive: true });
    addEventListener('resize', debounce(paint, 120));
    paint();
  }

  /* ---------- shop the look: hotspots drive a product slider ---------- */
  function initLook(el) {
    const slides = $$('[data-stl-slide]', el);
    const dots = $$('[data-stl-dot]', el);
    const count = $('[data-stl-count]', el);
    if (!slides.length) return;
    let i = 0;
    const show = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => d.setAttribute('aria-pressed', String(k === i)));
      if (count) count.textContent = `${i + 1} / ${slides.length}`;
    };
    dots.forEach((d, k) => d.addEventListener('click', () => show(k)));
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-stl-prev]')) show(i - 1);
      if (e.target.closest('[data-stl-next]')) show(i + 1);
    });
    show(0);
  }

  /* ---------- grid view toggle ---------- */
  function initViewToggle(el) {
    const target = document.querySelector(el.dataset.target);
    if (!target) return;
    const btns = $$('[data-cols]', el);
    const apply = (n) => {
      target.style.setProperty('--cols', n);
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cols === String(n))));
    };
    btns.forEach((b) => b.addEventListener('click', () => { apply(b.dataset.cols); store.set('cols', b.dataset.cols); }));
    apply(store.get('cols', el.dataset.default || 3));
  }

  /* ---------- accessibility menu ---------- */
  const A11Y_FLAGS = ['contrast', 'links', 'font', 'still'];
  function a11yState() { return Object.assign({ scale: 1 }, store.get('a11y', {})); }
  function a11yApply(st) {
    const html = document.documentElement;
    html.style.setProperty('--a11y-scale', st.scale || 1);
    A11Y_FLAGS.forEach((f) => html.classList.toggle('a11y-' + f, !!st[f]));
    $$('[data-a11y]').forEach((b) => b.setAttribute('aria-pressed', String(!!st[b.dataset.a11y])));
    $$('[data-a11y-scale-label]').forEach((el) => { el.textContent = Math.round((st.scale || 1) * 100) + '%'; });
  }

  /* ---------- newsletter popup ---------- */
  function schedulePopup() {
    const pop = $('#modal-newsletter');
    if (!pop || !S.popup || !S.popup.enabled || S.designMode) return;
    const ok = $('[data-subscribe-success]', pop);
    if (/customer_posted=true/.test(location.search) && ok && !ok.hidden) { openDialog(pop); return; }
    const last = store.get('popup', 0);
    if (store.get('subscribed', false) || Date.now() - last < S.popup.days * 864e5) return;
    let shown = false;
    const show = () => {
      const el = $('#modal-newsletter');
      if (shown || !el || $('dialog[open]')) return;
      shown = true;
      store.set('popup', Date.now());
      openDialog(el);
      document.removeEventListener('mouseout', onOut);
    };
    const onOut = (e) => { if (!e.relatedTarget && e.clientY <= 0) show(); };
    setTimeout(show, S.popup.delay * 1000);
    document.addEventListener('mouseout', onOut);
  }

  /* ---------- reveal ---------- */
  let revealIO;
  function observeReveal(root) {
    if (!('IntersectionObserver' in window) || reduced()) return;
    revealIO = revealIO || new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    $$('.reveal:not(.is-in)', root).forEach((el) => revealIO.observe(el));
  }

  /* ---------- motion: staggered reveals, hero words, parallax ---------- */
  const ANIM_TARGETS = '.sec-title, .carousel__track > .card, .grid > .card, .edit > .card, .split__tile, .banner-full__copy, .stl__media, .stl__side, .news-band__inner > *, .footer__top > *, .page-head__inner > *, .pdp__sticky > *, .pdp__slide, .cbook__head, .look, .quote.is-active, .text-link';
  let animIO;
  function initMotion(rootEl) {
    if (reduced() || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('js-anim');
    animIO = animIO || new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return;
      (en.target._animKids || [en.target]).forEach((x) => x.classList.add('is-in'));
      animIO.unobserve(en.target);
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$(ANIM_TARGETS, rootEl).forEach((el) => {
      if (el.hasAttribute('data-anim')) return;
      const sibs = Array.from(el.parentNode.children).filter((x) => x.matches(ANIM_TARGETS));
      el.setAttribute('data-anim', '');
      el.style.setProperty('--d', (Math.min(sibs.indexOf(el), 6) * 0.08).toFixed(2) + 's');
      if (el.matches('.split__tile')) {
        const par = el.parentNode;
        par._animKids = (par._animKids || []).concat(el);
        if (!par._animWatched) { par._animWatched = true; animIO.observe(par); }
      } else animIO.observe(el);
    });
    $$('.hero-full__title, .banner-full__title, .thin', rootEl).forEach((el) => {
      if (el.dataset.split) return;
      el.dataset.split = '1';
      const words = el.textContent.trim().split(/\s+/);
      if (!/[֐-׿]/.test(el.textContent)) el.dir = 'ltr';
      el.innerHTML = words.map((w, i) => `<span class="w-mask"><span class="w-in" style="--i:${i}">${esc(w)}</span></span>`).join(' ');
      el.setAttribute('aria-label', words.join(' '));
      if (el.closest('.hero-full')) el.classList.add('is-in'); else animIO.observe(el);
    });
    $$('.hero-full__media, .banner-full img', rootEl).filter(once).forEach((el) => {
      addScroller(() => {
        if (!el.isConnected) return;
        const r = el.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        el.style.transform = `translate3d(0, ${(p * -60).toFixed(1)}px, 0) scale(1.12)`;
      });
    });
  }

  /* ---------- mount (per render / per Shopify section load) ---------- */
  const mounted = new WeakSet();
  const once = (el) => (mounted.has(el) ? false : (mounted.add(el), true));
  function mount(rootEl) {
    rootEl = rootEl || document;
    if (!$('[data-sticky-atc].is-visible')) document.body.classList.remove('has-sticky-atc');
    if (!$('[data-pdp][data-tint-page]')) setTint('');
    $$('[data-product-form]', rootEl).filter(once).forEach((f) => { f._bliss = initProductForm(f); });
    $$('[data-countdown]', rootEl).filter(once).forEach(startCountdown);
    $$('[data-delivery]', rootEl).forEach(renderDelivery);
    $$('[data-announcements]', rootEl).filter(once).forEach(startAnnouncements);
    $$('[data-mega]', rootEl).filter(once).forEach(initMega);
    $$('[data-intro]', rootEl).filter(once).forEach(initIntro);
    $$('[data-words]', rootEl).filter(once).forEach(initWords);
    $$('[data-colorbook]', rootEl).filter(once).forEach(initColorbook);
    $$('[data-lookbook]', rootEl).filter(once).forEach(initLookbook);
    $$('[data-quotes]', rootEl).filter(once).forEach(initQuotes);
    $$('[data-carousel]', rootEl).filter(once).forEach(initCarousel);
    $$('[data-stl]', rootEl).filter(once).forEach(initLook);
    $$('[data-view-toggle]', rootEl).filter(once).forEach(initViewToggle);
    $$('[data-recently-viewed]', rootEl).forEach(renderRecent);
    $$('[data-recommendations-url]', rootEl).filter(once).forEach(loadRecommendations);
    $$('[data-complementary]', rootEl).filter(once).forEach(loadComplementary);
    $$('[data-slides]', rootEl).filter(once).forEach((s) => {
      updateCounter(s);
      s.addEventListener('scroll', debounce(() => updateCounter(s), 60), { passive: true });
    });
    observeReveal(rootEl);
    initMotion(rootEl);
    Wish.sync();
    requestTick();
  }

  /* ---------- delegated events ---------- */
  function wireEvents() {
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-open],[data-close],[data-quick-open],[data-quick-variant],[data-wishlist-toggle],[data-line-qty],[data-swatch-color],[data-hotspot-toggle],[data-a11y],[data-a11y-scale],[data-a11y-reset],[data-a11y-toggle],[data-copy],[data-search-term],[data-lightbox],[data-checkout]');
      if (!el) {
        if (!e.target.closest('[data-quick-add]')) closeQuick();
        if (!e.target.closest('.hotspot')) $$('.hotspot.is-open').forEach((h) => h.classList.remove('is-open'));
        if (!e.target.closest('[data-mega]')) closeMega();
        return;
      }
      if (el.matches('[data-open]')) { e.preventDefault(); openDialog(el.dataset.open, el); return; }
      if (el.matches('[data-close]')) { e.preventDefault(); closeDialog(el.closest('dialog')); return; }
      if (el.matches('[data-quick-open]')) { e.preventDefault(); quickOpen(el.closest('[data-quick-add]'), el); return; }
      if (el.matches('[data-quick-variant]')) { e.preventDefault(); const wrap = el.closest('[data-quick-add]'); const src = wrap && wrap.closest('[data-product-card]'); closeQuick(); Cart.add(el.dataset.quickVariant, 1, src ? $('[data-quick-open]', src) || el : el); return; }
      if (el.matches('[data-wishlist-toggle]')) { e.preventDefault(); Wish.toggle(el.dataset.wishlistToggle, el); return; }
      if (el.matches('[data-line-qty]')) { e.preventDefault(); Cart.change(el.closest('[data-line]').dataset.line, Number(el.dataset.lineQty)); return; }
      if (el.matches('[data-swatch-color]')) {
        e.preventDefault();
        const card = el.closest('[data-product-card]');
        if (!card) return;
        const im = $('.card__img:not(.card__img--alt)', card);
        if (im && el.dataset.swatchImg) { im.removeAttribute('srcset'); im.src = el.dataset.swatchImg; }
        card.dataset.activeColor = el.dataset.swatchColor;
        card.classList.add('has-swatch');
        $$('.swatch', card).forEach((s) => s.classList.toggle('is-active', s === el));
        $$('a[href]', card).forEach((a) => { if (el.dataset.swatchUrl) a.setAttribute('href', el.dataset.swatchUrl); });
        closeQuick();
        return;
      }
      if (el.matches('[data-hotspot-toggle]')) {
        const h = el.closest('.hotspot');
        const open = !h.classList.contains('is-open');
        $$('.hotspot.is-open').forEach((x) => x.classList.remove('is-open'));
        h.classList.toggle('is-open', open);
        el.setAttribute('aria-expanded', String(open));
        return;
      }
      if (el.matches('[data-a11y-toggle]')) {
        const panel = $('#a11y-panel');
        if (panel) { panel.hidden = !panel.hidden; el.setAttribute('aria-expanded', String(!panel.hidden)); if (!panel.hidden) { const f = $('button', panel); if (f) f.focus(); } }
        return;
      }
      if (el.matches('[data-a11y]')) { const st = a11yState(); st[el.dataset.a11y] = !st[el.dataset.a11y]; store.set('a11y', st); a11yApply(st); return; }
      if (el.matches('[data-a11y-scale]')) { const st = a11yState(); st.scale = Math.min(1.5, Math.max(0.9, Math.round(((st.scale || 1) + Number(el.dataset.a11yScale)) * 100) / 100)); store.set('a11y', st); a11yApply(st); return; }
      if (el.matches('[data-a11y-reset]')) { store.set('a11y', {}); a11yApply({ scale: 1 }); return; }
      if (el.matches('[data-copy]')) {
        const ok = () => toast(t('copied'));
        if (navigator.clipboard) navigator.clipboard.writeText(el.dataset.copy).then(ok, () => {}); else ok();
        return;
      }
      if (el.matches('[data-search-term]')) {
        const input = $('[data-search-input]', el.closest('[data-search]'));
        if (input) { input.value = el.dataset.searchTerm; runSearch(input); input.focus(); }
        return;
      }
      if (el.matches('[data-lightbox]')) {
        const box = $('#modal-lightbox');
        const im = $('img', el);
        if (box && im) { $('img', box).src = el.dataset.lightbox || im.currentSrc || im.src; $('img', box).alt = im.alt; openDialog(box, el); }
        return;
      }
      if (el.matches('[data-checkout]') && api().checkout) { e.preventDefault(); api().checkout(); }
    });

    document.addEventListener('mouseover', (e) => {
      const sw = e.target.closest('[data-swatch-color]');
      if (!sw || !matchMedia('(hover: hover)').matches) return;
      const card = sw.closest('[data-product-card]');
      const im = card && $('.card__img:not(.card__img--alt)', card);
      if (im && sw.dataset.swatchImg) { im.removeAttribute('srcset'); im.src = sw.dataset.swatchImg; card.classList.add('has-swatch'); }
    });

    document.addEventListener('input', (e) => { if (e.target.matches('[data-search-input]')) runSearch(e.target); });

    document.addEventListener('change', (e) => {
      const f = e.target.closest('form[data-autosubmit]');
      if (!f) return;
      f._autosubmit = f._autosubmit || debounce(() => (f.requestSubmit ? f.requestSubmit() : f.submit()), 450);
      f._autosubmit();
    });

    document.addEventListener('submit', (e) => {
      const f = e.target;
      const a = api();
      if (f.matches('[data-subscribe]')) {
        store.set('subscribed', true);
        if (a.subscribe) {
          e.preventDefault();
          a.subscribe(new FormData(f)).then(() => {
            const ok = $('[data-subscribe-success]', f.parentNode);
            if (ok) { f.hidden = true; ok.hidden = false; }
          });
        }
      }
      if (f.matches('[data-notify-form]') && a.notify) {
        e.preventDefault();
        a.notify(new FormData(f)).then(() => { f.innerHTML = `<p class="stock">${t('notify_done')}</p>`; });
      }
      if (f.matches('[data-search-form]') && a.searchPage) {
        e.preventDefault();
        a.searchPage(new FormData(f).get('q') || '');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      closeQuick();
      closeMega();
      const panel = $('#a11y-panel');
      if (panel && !panel.hidden) { panel.hidden = true; const b = $('[data-a11y-toggle]'); if (b) { b.setAttribute('aria-expanded', 'false'); b.focus(); } }
    });

    document.addEventListener('bliss:open', (e) => {
      if (e.target.id === 'drawer-cart' && !Cart.state) Cart.refresh();
      if (e.target.id === 'drawer-wishlist') Wish.render();
      if (e.target.id === 'drawer-search') { const i = $('[data-search-input]', e.target); if (i) setTimeout(() => i.focus(), 60); }
    }, true);

    addScroller(headerScroll);
    document.addEventListener('shopify:section:load', (e) => mount(e.target));
  }

  function init() {
    const html = document.documentElement;
    html.classList.remove('no-js');
    html.classList.add('js', 'js-reveal');
    a11yApply(a11yState());
    wireDialogs();
    wireEvents();
    initCursor();
    if (window.BlissCart) Cart.render(window.BlissCart);
    mount(document);
    schedulePopup();
  }

  window.Bliss = {
    settings: S, t, store, formatMoney, money, img, normalize, mount, init,
    cart: Cart, wishlist: Wish, open: openDialog, close: closeDialog, toast,
    cardHTML, miniHTML, priceHTML, swatchCss, tintFor, sizeRange, icons: ICON, esc,
    clearCache: () => productCache.clear(),
    setTint,
  };
  if (!window.BlissManualInit) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
