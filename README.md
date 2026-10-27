# BLISS for Shopify

A Shopify theme, a product catalogue and a clickable preview for BLISS, a modest womenswear store. Hebrew (right to left) by default, English included.

## What's in this folder

| Path | What it is |
| --- | --- |
| `BLISS-theme.zip` | The Shopify theme. Upload it as is. |
| `theme/` | The same theme, unzipped, if you or a developer want to edit it. |
| `products/bliss-products.csv` | 6 products and 84 colour/size variants, ready for Products → Import. |
| `products/<product>/` | Your photos, sorted per product, named by colour, in upload order. |
| `preview/index.html` | Clickable preview of the store. Open it in a browser. It works offline. |

## Launch checklist

1. **Upload the theme.** Online Store → Themes → Add theme → Upload zip → `BLISS-theme.zip`. Preview it, then Publish.
2. **Language and currency.** Settings → Languages: make Hebrew the default. Settings → Markets: Israel, ILS. For whole-shekel prices, set the money format to `₪{{amount_no_decimals}}`.
3. **Import products.** Products → Import → `products/bliss-products.csv`.
4. **Add the photos.** Open each product and drag in its folder from `products/`. Then:
   - set each image's **alt text to the colour name** in Hebrew (for example `מוקה`), so the gallery and swatches jump to that colour;
   - under Variants, give each colour its image.

   | Folder file | Colour (alt text) |
   | --- | --- |
   | `white` / `black` | לבן / שחור |
   | `chocolate` / `mocha` | שוקולד / מוקה |
   | `heather-grey` / `beige` | אפור מלאנז׳ / בז׳ |
   | `taupe` / `brown` / `ivory` | טאופ / חום / שמנת |
   | `blue-plaid` / `black-plaid` / `brown-plaid` | משבצות כחול / משבצות שחור / משבצות חום |

5. **Collections.** Create 4 automated collections with the condition *Product type is equal to*: שמלות, חליפות, חולצות, חצאיות. In each one's SEO section set the URL handle to `dresses`, `sets`, `tops`, `skirts`. The home page category tiles already point at those handles.
6. **Menus.** Navigation → Main menu: חדש באתר (all products), שמלות, חליפות, חולצות, חצאיות. Footer menu: shipping and returns, FAQ, contact, accessibility statement, terms, privacy.
7. **Payments.** Shopify Payments is not available for Israeli stores. Install a local gateway that supports cards, instalments and Bit (for example PayPlus or Allpay; compare others on Shopify's payment providers page). Run a test order.
8. **Invoices.** Install an Israeli invoicing app (for example Morning, formerly Green Invoice, iCount or EZcount) so every order gets a tax invoice.
9. **Shipping and the welcome code.** Settings → Shipping: free over ₪299, ₪29 below. Discounts: create `WELCOME10` (10%, once per customer). The popup and the club section both promise it.
10. **Theme settings** (Customize → Theme settings): WhatsApp number, social links, delivery days, number of instalments, popup texts, accessibility statement link.
11. **Pages.** Create *About*, *Shipping & returns*, *Contact* (template `page.contact`), *FAQ* (template `page.faq`, questions are pre-filled) and *Accessibility statement* (template `page.accessibility`, fill in the coordinator's name, phone and email).
12. **Replace placeholders:** prices, fabric details, the size chart (Theme settings → Size guide can point at your own page), and stock. The CSV leaves stock **untracked**; turn tracking on and enter quantities so the low-stock message and sold-out sizes work.

## Built into the theme (no app needed)

Slide-out bag with free-shipping progress bar · complete-the-look upsell in the bag and on product pages · quick add from product cards · wishlist · sticky add-to-bag bar · size guide popup · low-stock message from real inventory · back-in-stock requests by email · delivery date estimate (skips Friday and Saturday) · instalments line · sign-up popup with exit intent, consent checkbox and discount code · Black Friday countdown in the club section · shop-the-look hotspots · #MyBLISS photo gallery · recently viewed · predictive search · WhatsApp button · accessibility menu · rotating announcement bar · colour swatches with fabric photos for the plaids.

Every one of these is on or off in the customizer.

## Apps worth adding

| When | App | Why |
| --- | --- | --- |
| Before launch | Israeli payment gateway | Required to take payments, instalments and Bit. |
| Before launch | Invoicing app | Automatic tax invoices. |
| Before launch | Shopify Search & Discovery (free) | Colour, size and price filters on collections, and choosing the complete-the-look products. |
| Week 1 | Klaviyo | Welcome series with WELCOME10, abandoned cart, browse abandonment, review requests, back-in-stock alerts. |
| Week 1 | Judge.me | Photo reviews. Add its app block to the Apps section on the product page; star ratings then show on cards automatically. |
| When needed | Translate & Adapt (free) | Publishes the English version. |
| Month 2 | Smile.io | Points, VIP tiers, referrals, birthday reward. |
| Optional | Instafeed, Kiwi Sizing | Automatic Instagram feed; size recommendation quiz. |

The home page **Customer reviews** section stays hidden until you add real quotes or a reviews app block. The reviews in the preview are samples.

## Accessibility

Israeli law expects stores to meet Israeli Standard 5568 and publish an accessibility statement with a contact person. The theme has keyboard navigation, visible focus, alt text support, a skip link and the accessibility menu, but no widget makes a site compliant by itself. Publish the statement and consider a professional check.

## Notes

- The font is Assistant from Google Fonts. Shopify's linter shows a performance warning for external fonts. It is safe to ignore.
- Home page sections: hero triptych (3 product photos), moving ribbon, statement, colour book (shop by colour), product grid, lookbook, customer reviews, club sign-up with countdown, #MyBLISS photos. All are editable in the customizer.
- The colour book matches the colour names in your products (for example מוקה). If you rename a colour, update its shade block too.
- The theme passes Shopify Theme Check with no errors.
