# BLISS store – handoff notes

- `theme/` – Shopify OS 2.0 theme (Hebrew RTL + English). `BLISS-theme.zip` is the packaged theme for upload.
- `preview/` – static storefront preview, deployed to https://bliss-store.vercel.app
  (Vercel project `bliss-store`, scope `ori4751-gmailcoms-projects`). Redeploy from `preview/`:
  `npx vercel deploy --prod --yes --scope ori4751-gmailcoms-projects`
- Product data lives in `preview/preview-data.js` (prices in agorot, e.g. 4990 = ₪49.90; `sizes`, `colors`, `low`, `soldOut`).
  Product order: `ORDER` at the bottom of that file. Images in `preview/images/`.
- `products/bliss-products.csv` – Shopify product import, kept in sync with preview-data.js. Source photos per product in `products/<handle>/` (`*-unused.jpg` = colours not in stock).
- `bliss.js` / `bliss.css` are shared: edit in `preview/` and copy to `theme/assets/`.
- Local preview: `python -m http.server 5178 --directory preview` (see `.claude/launch.json`).
