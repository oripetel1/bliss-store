/* BLISS launch guide — shown at #/guide in the preview (English, for the store owner). */
window.BlissGuide = function () {
  const built = [
    ['Slide-out cart with free-shipping bar', 'Shows how far the shopper is from ₪299 free shipping, which nudges a second item into the bag.', 'Cart drawer / upsell apps'],
    ['Complete the look', 'In the cart and on product pages. Pulls the complementary products you set in Search & Discovery.', 'Frequently-bought-together apps'],
    ['Quick add from product cards', 'Pick a size straight from the grid without opening the product.', 'Quick view apps'],
    ['Wishlist', 'Heart icon on every card and product. Saved on the shopper’s device, with a drawer and counter.', 'Wishlist apps (basic tier)'],
    ['Sticky add-to-bag bar', 'Appears once the main button scrolls away, so the buy button is always in reach on mobile.', 'Sticky add-to-cart apps'],
    ['Size guide popup', 'Table, how-to-measure tips and a WhatsApp fallback.', 'Size chart apps (basic tier)'],
    ['Honest low-stock message', '“Only 2 left in this size”, read from your real inventory. Never invented.', 'Urgency / scarcity apps'],
    ['Back-in-stock request', 'Sold-out sizes show an email form that lands in your inbox.', 'Notify-me apps (manual version)'],
    ['Delivery date estimate', 'Business days you set, skipping Friday and Saturday.', 'Delivery estimate apps'],
    ['Instalments line', '“or 3 interest-free payments of ₪…” under the price.', '—'],
    ['Newsletter popup', 'Delay + exit intent, 10% code, marketing-consent checkbox, shown once a week at most.', 'Popup apps'],
    ['Countdown banner', 'Counts to a real date you set (Black Friday in the preview), then hides itself.', 'Countdown timer apps'],
    ['Shop-the-look hotspots', 'Tap points on an outfit photo to see and add each piece.', 'Shoppable image apps'],
    ['#MyBLISS gallery', 'Instagram-style grid you curate, each photo linked to a product.', 'Instagram feed apps (manual version)'],
    ['Recently viewed', 'Last pieces the shopper looked at, on every product page.', 'Recently viewed apps'],
    ['Predictive search', 'Results with photos and prices as she types, plus popular searches.', 'Search apps (basic tier)'],
    ['WhatsApp button', 'Floating chat button with a pre-written message.', 'WhatsApp chat apps'],
    ['Accessibility menu', 'Text size, contrast, link highlight, readable font, stop animations, plus a statement page.', 'Accessibility widgets (partly, see below)'],
    ['Hebrew + English', 'Right-to-left Hebrew by default, English strings included.', '—'],
  ];
  const apps = [
    { tier: 'Required in Israel', items: [
      ['Israeli payment gateway', 'Shopify Payments is not available for Israeli stores, so you need a local provider to take cards, instalments and Bit. PayPlus and Allpay both list Shopify support for Bit and instalments. Compare fees on Shopify’s payment providers page.', 'Before launch'],
      ['Invoices and receipts', 'An Israeli invoicing app (for example Morning, formerly Green Invoice, iCount or EZcount) issues a tax invoice for every order automatically.', 'Before launch'],
    ] },
    { tier: 'Core engagement', items: [
      ['Klaviyo', 'Email and SMS. Set up the welcome series with WELCOME10, abandoned cart, browse abandonment, post-purchase review requests and back-in-stock alerts. These flows usually bring in more than any widget.', 'Week 1'],
      ['Judge.me', 'Photo reviews. Add its app block to the product page; star ratings then appear on product cards and pages automatically.', 'Week 1'],
      ['Shopify Search & Discovery', 'Free, by Shopify. Turns on colour, size and price filters on collections, and lets you choose the “complete the look” products.', 'Before launch'],
      ['Translate & Adapt', 'Free, by Shopify. Publishes the English version. The theme’s own English text is already included.', 'When needed'],
    ] },
    { tier: 'Growth, after the first sales', items: [
      ['Smile.io', 'Points, VIP tiers and referrals. Matches the BLISS Club promise of a birthday treat.', 'Month 2'],
      ['Instafeed', 'Automatic Instagram feed, if you would rather not curate the #MyBLISS gallery yourself.', 'Optional'],
      ['Kiwi Sizing', 'Size recommendation quiz. Add it if sizing returns are high.', 'Optional'],
    ] },
  ];
  const steps = [
    ['Upload the theme', 'Online Store → Themes → Add theme → Upload zip. Choose <code>BLISS-theme.zip</code>, preview it, then Publish.'],
    ['Set language and currency', 'Settings → Languages: make Hebrew the default. Settings → Markets: Israel with ILS. For whole-shekel prices set the money format to <code>₪{{amount_no_decimals}}</code>.'],
    ['Import the products', 'Products → Import → <code>bliss-products.csv</code>. Then open each product and drag in the photos from its folder in <code>products/</code>. File names include the colour.'],
    ['Link photos to colours', 'On each product set the image alt text to the colour name (for example מוקה) and pick each variant’s image. The gallery then jumps to the colour she picks.'],
    ['Create the collections', 'Automated collections by product type: שמלות, חליפות, חולצות, חצאיות. Set their URL handles to dresses, sets, tops and skirts so the home page tiles connect.'],
    ['Connect payments and invoices', 'Install the gateway and invoicing apps above and run a ₪1 test order.'],
    ['Shipping and the welcome code', 'Settings → Shipping: free over ₪299, ₪29 below. Discounts: create WELCOME10 (10%, one use per customer). The popup and club section both promise it.'],
    ['Fill in theme settings', 'Customize → Theme settings: WhatsApp number, social links, delivery days, instalments, announcement texts and the Black Friday date.'],
    ['Write the pages', 'About, Shipping & returns, FAQ (template <code>page.faq</code>, questions pre-filled), Contact (template <code>page.contact</code>) and Accessibility statement (template <code>page.accessibility</code>). Add your policies under Settings → Policies.'],
    ['Replace the placeholders', 'Prices, stock levels (the CSV leaves stock untracked), fabric details, size chart measurements and the sample reviews in this preview.'],
  ];
  const ic = '<svg class="icon icon--sm" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  return `
  <section class="page-head" dir="ltr" lang="en"><div class="container page-head__inner">
    <p class="eyebrow">For the store owner</p>
    <h1 class="h-2xl">BLISS on Shopify: launch guide</h1>
    <p class="muted" style="max-width:60ch">What is in the package, what the theme already does for engagement, which apps are still worth paying for, and the order to set everything up.</p>
  </div></section>
  <div class="container guide" dir="ltr" lang="en">
    <section class="guide__block">
      <h2 class="h-xl">What you are getting</h2>
      <div class="guide__cards">
        <div class="guide__card"><p class="eyebrow">Theme</p><p><b>BLISS-theme.zip</b></p><p class="muted">Online Store 2.0 theme. Every section is editable in the Shopify customizer.</p></div>
        <div class="guide__card"><p class="eyebrow">Catalogue</p><p><b>bliss-products.csv</b></p><p class="muted">6 products, 84 colour and size variants, Hebrew titles and descriptions.</p></div>
        <div class="guide__card"><p class="eyebrow">Photos</p><p><b>products/</b></p><p class="muted">Your photos sorted by product, named by colour, ready to drag in.</p></div>
        <div class="guide__card"><p class="eyebrow">Preview</p><p><b>This page</b></p><p class="muted">Clickable copy of the storefront with sample prices, stock and reviews.</p></div>
      </div>
    </section>

    <section class="guide__block">
      <h2 class="h-xl">Built into the theme, no app needed</h2>
      <p class="muted">These cover what most fashion stores install separate apps for. Every one is switchable in the customizer.</p>
      <div class="guide__table"><table class="table"><thead><tr><th>Feature</th><th>What it does</th><th>Usually an app like</th></tr></thead>
      <tbody>${built.map(([a, b, c]) => `<tr><td><b>${a}</b></td><td>${b}</td><td class="muted">${c}</td></tr>`).join('')}</tbody></table></div>
    </section>

    <section class="guide__block">
      <h2 class="h-xl">Apps worth adding</h2>
      ${apps.map((g) => `<h3 class="h-lg guide__tier">${g.tier}</h3><div class="guide__apps">${g.items.map(([n, w, when]) => `<div class="guide__app"><div class="guide__app-head"><b>${n}</b><span class="sample-chip">${when}</span></div><p class="muted">${w}</p></div>`).join('')}</div>`).join('')}
      <p class="notice" style="margin-top:20px"><b>About accessibility:</b> Israeli law expects stores to meet Israeli Standard 5568 and publish an accessibility statement with a contact person. The built-in menu and the theme’s keyboard and screen-reader support help, but no widget makes a site compliant by itself. Publish the statement template and consider a professional check.</p>
    </section>

    <section class="guide__block">
      <h2 class="h-xl">Launch checklist</h2>
      <ol class="guide__steps">${steps.map(([a, b]) => `<li><b>${a}</b><p class="muted">${b}</p></li>`).join('')}</ol>
    </section>

    <section class="guide__block">
      <h2 class="h-xl">The engagement playbook</h2>
      <ul class="guide__list">
        <li>${ic}<span><b>Welcome series:</b> 3 emails over a week. Send the code, then the brand story, then best sellers.</span></li>
        <li>${ic}<span><b>Abandoned cart:</b> after 1 hour and again after 24 hours, with the items she left and a WhatsApp link.</span></li>
        <li>${ic}<span><b>Post-purchase:</b> a styling tip 3 days after delivery, then a review request with photo upload on day 10.</span></li>
        <li>${ic}<span><b>Black Friday early access:</b> the countdown collects sign-ups now. Email that list 24 hours before the sale opens.</span></li>
        <li>${ic}<span><b>#MyBLISS:</b> repost customer photos weekly and add the best to the home page gallery.</span></li>
      </ul>
    </section>
  </div>`;
};
