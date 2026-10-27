/* BLISS design preview — sample catalogue and copy (Hebrew + English).
   Prices, stock levels and reviews here are placeholders for the preview only. */
window.BlissPreviewData = (function () {
  const COLORS = {
    white: { he: 'לבן', en: 'White', css: '#F3F1EC' },
    black: { he: 'שחור', en: 'Black', css: '#17161A' },
    chocolate: { he: 'שוקולד', en: 'Chocolate', css: '#3D2B22' },
    mocha: { he: 'מוקה', en: 'Mocha', css: '#7A6656' },
    'heather-grey': { he: 'אפור מלאנז׳', en: 'Heather Grey', css: '#C7C6C4' },
    beige: { he: 'בז׳', en: 'Beige', css: '#D9C8B2' },
    taupe: { he: 'טאופ', en: 'Taupe', css: '#8C7F72' },
    brown: { he: 'חום', en: 'Brown', css: '#5B4434' },
    ivory: { he: 'שמנת', en: 'Ivory', css: '#EEE8DD' },
    'blue-plaid': { he: 'משבצות כחול', en: 'Blue Plaid', css: 'images/swatch-blue-plaid.jpg' },
    'black-plaid': { he: 'משבצות שחור', en: 'Black Plaid', css: 'images/swatch-black-plaid.jpg' },
    'brown-plaid': { he: 'משבצות חום', en: 'Brown Plaid', css: 'images/swatch-brown-plaid.jpg' },
    'beige-plaid': { he: 'משבצות בז׳', en: 'Beige Plaid', css: '#B59A78' },
  };

  const CATS = {
    dresses: { he: 'שמלות', en: 'Dresses', img: 'cat-1.jpg' },
    sets: { he: 'חליפות', en: 'Sets', img: 'cat-2.jpg' },
    tops: { he: 'חולצות', en: 'Tops', img: 'cat-3.jpg' },
    skirts: { he: 'חצאיות', en: 'Skirts', img: 'cat-4.jpg' },
  };

  const imgs = (handle, color, n) => Array.from({ length: n }, (_, i) => `${handle}-${color}-${i + 1}.jpg`);
  const care = {
    he: 'כביסה עדינה במים קרים, ייבוש בצל, גיהוץ בחום נמוך מהצד הפנימי.',
    en: 'Gentle wash in cold water, dry in the shade, iron on low heat inside out.',
  };

  const PRODUCTS = [
    {
      handle: 'side-tie-set', id: 101, type: 'sets', badge: 'new', price: 10990, sizes: ['S/M', 'M/L'],
      title: { he: 'חליפה כפלים קשירה בצד', en: 'Pleated Side-Tie Set' },
      desc: {
        he: 'חליפה של שני חלקים עם כפלים וקשירה בצד: חולצה עם שרוול ארוך וחצאית מקסי. מידות S/M ו־M/L.',
        en: 'A two-piece set with pleats and a side tie: a long-sleeve top and a maxi skirt. Sizes S/M and M/L.',
      },
      details: { he: ['כפלים בחזית', 'קשירה בצד', 'שרוול ארוך', 'נמכר כסט'], en: ['Front pleats', 'Side tie', 'Long sleeves', 'Sold as a set'] },
      tags: { he: 'חליפה סט כפלים קשירה חצאית', en: 'set pleated tie two piece skirt' },
      colors: [
        { key: 'black', images: ['pleat-set-black-1.jpg'] },
        { key: 'heather-grey', images: ['pleat-set-heather-grey-1.jpg'] },
        { key: 'brown', images: ['pleat-set-brown-1.jpg'] },
      ],
    },
    {
      handle: 'day-dress', id: 102, type: 'dresses', badge: 'new', price: 9990, sizes: ['One Size'],
      title: { he: 'שמלה עם קשירה בצד', en: 'Side-Tie Dress' },
      desc: {
        he: 'שמלת מקסי עם שרוולים רחבים וקשירה בצד שמעצבת את המותן. מידה אחת בכל הצבעים.',
        en: 'A maxi dress with wide sleeves and a side tie that shapes the waist. One size in every colour.',
      },
      details: { he: ['קשירה בצד', 'שרוולים רחבים', 'אורך מקסי', 'מידה אחת'], en: ['Side tie', 'Wide sleeves', 'Maxi length', 'One size'] },
      tags: { he: 'שמלה שמלות מקסי קשירה', en: 'dress maxi tie' },
      colors: [
        { key: 'black', images: ['tie-dress-black-1.jpg'] },
        { key: 'brown', images: ['tie-dress-brown-1.jpg'] },
        { key: 'taupe', images: ['tie-dress-taupe-1.jpg'] },
        { key: 'heather-grey', images: ['tie-dress-heather-grey-1.jpg'] },
      ],
    },
    {
      handle: 'style-plaid-set', id: 103, type: 'sets', price: 42900, badge: 'new',
      title: { he: 'חליפת סטייל', en: 'Style Plaid Set' },
      desc: {
        he: 'סט משבצות מבד קל: חולצת רוכסן בגזרה רחבה עם גומי במותן, וחצאית מקסי מתרחבת עם גומי נוח. אפשר ללבוש יחד או לשלב כל חלק בנפרד.',
        en: 'A lightweight plaid co-ord: a relaxed zip-front shirt with an elastic hem and a flared elastic-waist maxi skirt. Wear them together or style each piece on its own.',
      },
      details: { he: ['חולצת רוכסן עם צווארון', 'שרוול ארוך עם גומי בקצה', 'חצאית מתרחבת עם גומי במותן', 'אורך מקסי'], en: ['Zip-front shirt with collar', 'Long elasticated sleeves', 'Flared elastic-waist skirt', 'Maxi length'] },
      tags: { he: 'חליפה סט משבצות', en: 'set plaid check co-ord' },
      colors: [
        { key: 'blue-plaid', images: imgs('style-plaid-set', 'blue-plaid', 1) },
        { key: 'black-plaid', images: imgs('style-plaid-set', 'black-plaid', 1) },
        { key: 'brown-plaid', images: imgs('style-plaid-set', 'brown-plaid', 1) },
      ],
      low: { 'blue-plaid:L': 1 }, soldOut: ['black-plaid:XL'],
    },
    {
      handle: 'style-dress', id: 104, type: 'dresses', price: 29900,
      title: { he: 'שמלת סטייל', en: 'Style Dress' },
      desc: {
        he: 'שמלת מקסי עם עיטוף אסימטרי במותן ושרוולים ארוכים. מראה מעוצב ומחמיא, בלי מאמץ.',
        en: 'A maxi dress with an asymmetric wrap at the waist and long sleeves. Considered and flattering, with no effort.',
      },
      details: { he: ['עיטוף אסימטרי במותן', 'שרוול ארוך', 'צווארון עגול', 'אורך מקסי'], en: ['Asymmetric waist wrap', 'Long sleeves', 'Round neck', 'Maxi length'] },
      tags: { he: 'שמלה שמלות מקסי', en: 'dress maxi wrap' },
      colors: [
        { key: 'taupe', images: imgs('style-dress', 'taupe', 1) },
        { key: 'ivory', images: imgs('style-dress', 'ivory', 1) },
        { key: 'heather-grey', images: imgs('style-dress', 'heather-grey', 1) },
        { key: 'black', images: imgs('style-dress', 'black', 1) },
      ],
      low: { 'ivory:M': 3 },
    },
    {
      handle: 'tie-top', id: 105, type: 'tops', price: 3990, sizes: ['1', '2', '3'],
      title: { he: 'חולצת קשירה', en: 'Tie Top' },
      desc: {
        he: 'חולצת בסיס צמודה ונעימה עם שרוולים ארוכים ורצועת קשירה במותן שמדגישה את הגזרה. נלבשת מעל כל חצאית מקסי.',
        en: 'A close-fitting, soft long-sleeve top with a wrap tie at the waist that defines your shape. Made for wearing over any maxi skirt.',
      },
      details: { he: ['גזרה צמודה', 'שרוול ארוך', 'רצועת קשירה במותן', 'צווארון עגול'], en: ['Close fit', 'Long sleeves', 'Wrap tie at the waist', 'Round neck'] },
      tags: { he: 'חולצה חולצות טופ בסיס', en: 'top shirt basic' },
      colors: [
        { key: 'black', images: ['tie-top-black-1.jpg'] },
        { key: 'white', images: ['tie-top-white-0.jpg'].concat(imgs('tie-top', 'white', 6)) },
        { key: 'ivory', images: ['tie-top-ivory-1.jpg'] },
        { key: 'brown', images: ['tie-top-brown-1.jpg'] },
      ],
      low: { 'white:1': 2 },
    },
    {
      handle: 'style-skirt', id: 106, type: 'skirts', price: 4990, sizes: ['S/M', 'M/L'],
      title: { he: 'חצאית חלקה', en: 'Plain Skirt' },
      desc: {
        he: 'חצאית מקסי חלקה בגזרה רחבה עם קפלים במותן. נשאר בשחור, מידות S/M ו־M/L.',
        en: 'A plain wide maxi skirt with pleats at the waist. Available in black, sizes S/M and M/L.',
      },
      details: { he: ['קפלים במותן', 'גזרה רחבה', 'אורך מקסי', 'מידות S/M, M/L'], en: ['Pleated waist', 'Wide cut', 'Maxi length', 'Sizes S/M, M/L'] },
      tags: { he: 'חצאית חצאיות מקסי חלקה', en: 'skirt maxi plain' },
      colors: [
        { key: 'black', images: ['plain-skirt-black-1.jpg'] },
      ],
    },
    {
      handle: 'tie-skirt', id: 107, type: 'skirts', price: 4990, sizes: ['One Size'],
      title: { he: 'חצאית קשירה בצד', en: 'Side-Tie Skirt' },
      desc: {
        he: 'חצאית מקסי משבצות בגזרה מתרחבת עם קשירה בצד המותן. נשאר רק בצבע חום, מידה אחת.',
        en: 'A flared plaid maxi skirt with a tie at the side of the waist. Only brown is left, in one size.',
      },
      details: { he: ['קשירה בצד המותן', 'גזרה מתרחבת', 'אורך מקסי', 'מידה אחת'], en: ['Side waist tie', 'Flared cut', 'Maxi length', 'One size'] },
      tags: { he: 'חצאית חצאיות מקסי משבצות קשירה', en: 'skirt maxi plaid tie' },
      colors: [
        { key: 'brown-plaid', images: imgs('tie-skirt', 'brown-plaid', 5) },
      ],
      low: { 'brown-plaid:One Size': 3 },
    },
    {
      handle: 'back-tie-top', id: 108, type: 'tops', price: 4490, sizes: ['1', '2', '3'],
      title: { he: 'חולצה קשירה מאחורה', en: 'Back-Tie Top' },
      desc: {
        he: 'חולצה צמודה עם שרוול ארוך וקשירה בגב שמהדקת את המותן. נשאר בשחור ולבן, מידות 1 עד 3.',
        en: 'A fitted long-sleeve top with a tie at the back that cinches the waist. Available in black and white, sizes 1 to 3.',
      },
      details: { he: ['קשירה בגב', 'שרוול ארוך', 'גזרה צמודה', 'מידות 1–3'], en: ['Back tie', 'Long sleeves', 'Fitted cut', 'Sizes 1–3'] },
      tags: { he: 'חולצה חולצות טופ קשירה', en: 'top shirt tie back' },
      colors: [
        { key: 'black', images: ['back-tie-top-black-1.jpg'] },
        { key: 'white', images: ['back-tie-top-white-1.jpg'] },
      ],
    },
    {
      handle: 'zip-set', id: 110, type: 'sets', price: 9990, sizes: ['S/M'],
      title: { he: 'חליפת רוכסן', en: 'Zip Set' },
      desc: {
        he: 'חליפה של שני חלקים: ז׳קט קצר עם רוכסן וצווארון, וחצאית מקסי ישרה עם כיסים. מידה S/M.',
        en: 'A two-piece set: a cropped zip jacket with a collar and a straight maxi skirt with pockets. Size S/M.',
      },
      details: { he: ['ז׳קט קצר עם רוכסן', 'צווארון עומד', 'חצאית מקסי עם כיסים', 'נמכר כסט'], en: ['Cropped zip jacket', 'Stand collar', 'Maxi skirt with pockets', 'Sold as a set'] },
      tags: { he: 'חליפה סט רוכסן חצאית', en: 'set zip two piece skirt' },
      colors: [
        { key: 'black', images: ['zip-set-black-1.jpg'] },
        { key: 'brown', images: ['zip-set-brown-1.jpg'] },
        { key: 'heather-grey', images: ['zip-set-heather-grey-1.jpg'] },
        { key: 'ivory', images: ['zip-set-ivory-1.jpg'] },
      ],
      soldOut: ['ivory:S/M'],
    },
    {
      handle: 'plaid-skirt', id: 113, type: 'skirts', price: 4990, sizes: ['One Size'],
      title: { he: 'חצאית משבצות', en: 'Plaid Skirt' },
      desc: {
        he: 'חצאית מקסי משבצות בגזרה מתרחבת. מידה אחת בכל הצבעים.',
        en: 'A flared plaid maxi skirt. One size in every colour.',
      },
      details: { he: ['הדפס משבצות', 'גזרה מתרחבת', 'אורך מקסי', 'מידה אחת'], en: ['Plaid print', 'Flared cut', 'Maxi length', 'One size'] },
      tags: { he: 'חצאית חצאיות מקסי משבצות', en: 'skirt maxi plaid' },
      colors: [
        { key: 'brown-plaid', images: ['plaid-skirt-brown-plaid-1.jpg'] },
        { key: 'black-plaid', images: ['plaid-skirt-black-plaid-1.jpg', 'plaid-skirt-black-plaid-2.jpg'] },
        { key: 'beige-plaid', images: ['plaid-skirt-beige-plaid-1.jpg'] },
      ],
    },
    {
      handle: 'stripe-skirt', id: 114, type: 'skirts', price: 4990, sizes: ['One Size'],
      title: { he: 'חצאית פסים', en: 'Pinstripe Skirt' },
      desc: {
        he: 'חצאית מקסי בהדפס פסים עדין, עם קפלים במותן, כיסים ושסע בחזית. מידה אחת.',
        en: 'A pinstripe maxi skirt with waist pleats, pockets and a front slit. One size.',
      },
      details: { he: ['פסים עדינים', 'קפלים במותן', 'כיסים ושסע בחזית', 'מידה אחת'], en: ['Fine pinstripe', 'Pleated waist', 'Pockets and front slit', 'One size'] },
      tags: { he: 'חצאית חצאיות מקסי פסים', en: 'skirt maxi stripe pinstripe' },
      colors: [
        { key: 'black', images: ['stripe-skirt-black-1.jpg'] },
        { key: 'brown', images: ['stripe-skirt-brown-1.jpg'] },
      ],
    },
  ];

  // "Complete the look" pairs (in Shopify: Search & Discovery → complementary products)
  const PAIRS = {
    'tie-top': ['style-skirt', 'tie-skirt'],
    'tie-skirt': ['tie-top', 'back-tie-top'],
    'back-tie-top': ['tie-skirt', 'style-skirt'],
    'zip-set': ['back-tie-top'],
    'style-skirt': ['tie-top', 'back-tie-top'],
    'side-tie-set': ['tie-top'],
    'style-plaid-set': ['tie-top'],
    'day-dress': ['style-dress'],
    'style-dress': ['day-dress'],
  };

  const STR = {
    he: {
      error: 'משהו השתבש, נסי שוב', sold_out: 'אזל מהמלאי', sale: 'מבצע', quick_add: 'הוספה מהירה', choose_size: 'בחרי מידה',
      wishlist_add: 'שמירה לרשימת המשאלות', wishlist_added: 'נשמר ברשימת המשאלות', wishlist_removed: 'הוסר מרשימת המשאלות',
      wishlist_empty: 'עוד לא שמרת פריטים. לחצי על הלב בכל פריט כדי לשמור אותו כאן.', remove: 'הסרה',
      cart_empty: 'הסל שלך ריק כרגע', continue_shopping: 'להמשך קנייה', subtotal: 'סכום ביניים',
      taxes_note: 'דמי משלוח וקודי הנחה יחושבו בעמוד התשלום', checkout: 'לתשלום מאובטח', secure_note: 'תשלום מאובטח · עד 3 תשלומים ללא ריבית',
      free_ship_remaining: 'חסרים לך עוד {{ amount }} למשלוח חינם', free_ship_done: 'מעולה! המשלוח עלינו',
      complete_look: 'להשלמת הלוק', quantity: 'כמות', decrease: 'הפחתת כמות', increase: 'הוספת כמות', products: 'מוצרים',
      no_results: 'לא מצאנו תוצאות עבור "{{ q }}". נסי מילה אחרת.', in_stock: 'במלאי · נשלח תוך 1–3 ימי עסקים',
      unavailable: 'השילוב הזה לא זמין', low_stock: 'נותרו רק {{ count }} יחידות במידה הזו', add_to_cart: 'הוספה לסל',
      installments: 'או {{ count }} תשלומים של {{ amount }} ללא ריבית', delivery: 'צפי הגעה: {{ from }} – {{ to }}',
      notify_body: 'בקשת עדכון על חזרה למלאי', notify_done: 'נעדכן אותך במייל ברגע שהפריט יחזור למלאי.', copied: 'הקוד הועתק',
    },
    en: {
      error: 'Something went wrong, please try again', sold_out: 'Sold out', sale: 'Sale', quick_add: 'Quick add', choose_size: 'Choose a size',
      wishlist_add: 'Save to wishlist', wishlist_added: 'Saved to your wishlist', wishlist_removed: 'Removed from your wishlist',
      wishlist_empty: 'Nothing saved yet. Tap the heart on any piece to keep it here.', remove: 'Remove',
      cart_empty: 'Your bag is empty', continue_shopping: 'Continue shopping', subtotal: 'Subtotal',
      taxes_note: 'Shipping and discount codes are calculated at checkout', checkout: 'Secure checkout', secure_note: 'Secure payment · up to 3 interest-free payments',
      free_ship_remaining: 'You are {{ amount }} away from free shipping', free_ship_done: 'Lovely! Shipping is on us',
      complete_look: 'Complete the look', quantity: 'Quantity', decrease: 'Decrease quantity', increase: 'Increase quantity', products: 'Products',
      no_results: 'No results for "{{ q }}". Try another word.', in_stock: 'In stock · ships in 1–3 business days',
      unavailable: 'This combination is unavailable', low_stock: 'Only {{ count }} left in this size', add_to_cart: 'Add to bag',
      installments: 'or {{ count }} interest-free payments of {{ amount }}', delivery: 'Estimated delivery: {{ from }} – {{ to }}',
      notify_body: 'Back-in-stock request', notify_done: 'We will email you as soon as it is back.', copied: 'Code copied',
    },
  };

  const UI = {
    he: {
      pv_label: 'תצוגה מקדימה של ערכת העיצוב · מחירים, מלאי וביקורות לדוגמה', pv_popup: 'הצגת הפופאפ', pv_guide: 'מדריך השקה ואפליקציות',
      ann_1: 'משלוח חינם בכל הזמנה מעל ₪299', ann_2: '10% הנחה לקנייה הראשונה בהצטרפות למועדון', ann_3: 'החלפה קלה תוך 14 יום',
      nav_main: 'ניווט ראשי', nav_new: 'חדש באתר', menu: 'תפריט', search: 'חיפוש', account: 'החשבון שלי', wishlist: 'רשימת משאלות', cart: 'סל הקניות', close: 'סגירה', home_aria: 'BLISS – לדף הבית', skip: 'דילוג לתוכן',
      cat_dresses: 'שמלות', cat_sets: 'חליפות', cat_tops: 'חולצות', cat_skirts: 'חצאיות', cat_all: 'כל הקולקציה',
      opt_color: 'צבע', opt_size: 'מידה', badge_new: 'חדש',
      hero_alt: 'חמש דוגמניות בחליפות בלייזר וחצאיות מקסי בצבעי פסטל', hero_eyebrow: 'הקולקציה החדשה', hero_title: 'אלגנטיות שקטה, לכל רגע ביום',
      hero_text: 'שמלות, חליפות וחצאיות מקסי בגזרות זורמות ובצבעים רכים.', hero_cta: 'לקולקציה',
      usp_1: 'משלוח חינם', usp_1s: 'בהזמנה מעל ₪299', usp_2: 'החלפה קלה', usp_2s: 'תוך 14 יום מהקבלה', usp_3: 'עד 3 תשלומים', usp_3s: 'ללא ריבית, בתשלום מאובטח', usp_4: 'שירות בוואטסאפ', usp_4s: 'א׳–ה׳, 9:00–18:00',
      cats_eyebrow: 'קטגוריות', cats_title: 'מה מתחשק לך היום?', items: '{{ n }} פריטים', item: 'פריט אחד', view: 'לצפייה',
      new_eyebrow: 'חדש באתר', new_title: 'הפריטים החדשים', shop_all: 'לכל הקולקציה',
      look_eyebrow: 'Shop the look', look_title: 'לבן על טאופ', look_text: 'חולצת קשירה צמודה מעל חצאית קפלים רחבה. שני פריטים, אינסוף שילובים.', look_total: 'הלוק המלא', look_alt: 'דוגמנית בחולצת קשירה לבנה וחצאית קפלים רחבה', hotspot: 'הצגת הפריט',
      story_eyebrow: 'הסיפור שלנו', story_title: 'בגדים שמרגישים כמו נשימה עמוקה',
      story_text: 'BLISS נולדה מתוך רצון פשוט: בגדים צנועים ומחמיאים שנוח לחיות בהם. אנחנו מעצבות גזרות מקסי זורמות, בוחרות בדים נעימים ושומרות על פלטת צבעים שקטה שמשתלבת בכל ארון.',
      story_sig: 'באהבה, צוות BLISS', story_cta: 'קראי עוד', story_alt: 'דוגמנית בשמלה אפורה על רקע וילון לבן',
      rev_eyebrow: 'לקוחות מספרות', rev_title: 'אהבה במידה מושלמת', rev_count: 'מבוסס על 128 ביקורות', sample: 'דוגמה', verified: 'רכישה מאומתת',
      club_eyebrow: 'מועדון BLISS', club_title: 'הצטרפי למועדון וקבלי 10% הנחה', club_text: 'גישה מוקדמת למבצעי Black Friday, הטבת יום הולדת והשקות לפני כולן.',
      club_perk_1: '10% על ההזמנה הראשונה', club_perk_2: 'גישה מוקדמת למבצעים', club_perk_3: 'הפתעה ביום ההולדת',
      bf: 'Black Friday מתחיל בעוד', d: 'ימים', h: 'שעות', m: 'דקות', s: 'שניות',
      email: 'כתובת אימייל', join: 'הצטרפות', consent: 'אני מאשרת לקבל מ-BLISS עדכונים והטבות בדוא״ל. אפשר להסיר את ההרשמה בכל עת.',
      welcome: 'ברוכה הבאה למועדון! זה הקוד שלך:', copy: 'העתקה',
      ugc_title: 'איך את לובשת BLISS', ugc_text: 'תייגי אותנו באינסטגרם עם #MyBLISS ואולי תופיעי כאן.', ugc_label: 'לצפייה בפריט',
      ft_about: 'אופנה נשית וצנועה בגזרות זורמות ובצבעים שקטים. מידות S–XL, משלוחים לכל הארץ.',
      ft_shop: 'קניות', ft_help: 'שירות לקוחות', ft_brand: 'BLISS', ft_shipping: 'משלוחים והחזרות', ft_size: 'מדריך מידות', ft_faq: 'שאלות נפוצות', ft_contact: 'צרי קשר',
      ft_about_link: 'הסיפור שלנו', ft_a11y: 'הצהרת נגישות', ft_terms: 'תקנון האתר', ft_privacy: 'מדיניות פרטיות', rights: 'כל הזכויות שמורות.',
      wa: 'שיחה איתנו בוואטסאפ', a11y: 'תפריט נגישות', a11y_title: 'התאמות נגישות', a11y_size: 'גודל טקסט', a11y_contrast: 'ניגודיות גבוהה', a11y_links: 'הדגשת קישורים', a11y_font: 'גופן קריא', a11y_still: 'עצירת אנימציות', a11y_reset: 'איפוס', a11y_statement: 'הצהרת נגישות',
      search_ph: 'מה תרצי למצוא?', popular: 'חיפושים פופולריים', terms: ['שמלה', 'חליפה', 'משבצות', 'שחור', 'חצאית'],
      pop_eyebrow: 'מועדון BLISS', pop_title: 'הנחה על ההזמנה הראשונה', pop_text: 'הצטרפי לרשימת הדיוור וקבלי קוד הנחה מיד, וגם גישה מוקדמת לקולקציות ולמבצעים.', pop_later: 'אולי בפעם אחרת',
      demo_title: 'כאן מתחיל התשלום', demo_text: 'בחנות האמיתית הכפתור הזה מעביר לעמוד התשלום המאובטח של Shopify, דרך ספק הסליקה שתחברי (למשל עם Bit ותשלומים).', ok: 'הבנתי',
      sg_title: 'מדריך מידות', sg_intro: 'המידות בסנטימטרים, לפי מידות הגוף.', sg_size: 'מידה', sg_bust: 'חזה', sg_waist: 'מותן', sg_hips: 'ירכיים', sg_il: 'מידה ישראלית',
      sg_m1: 'חזה', sg_m1t: 'מדדי סביב החלק המלא ביותר של החזה, כשהסרט מקביל לרצפה.', sg_m2: 'מותן', sg_m2t: 'מדדי סביב החלק הצר ביותר של המותן.', sg_m3: 'ירכיים', sg_m3t: 'מדדי סביב החלק הרחב ביותר של הירכיים.',
      sg_note: 'בין שתי מידות? בחרי את הגדולה, או כתבי לנו בוואטסאפ ונעזור לך לבחור.',
      home: 'דף הבית', all_desc: 'כל הפריטים של BLISS במקום אחד.', filter: 'סינון', sort_featured: 'מומלץ', sort_low: 'מחיר: מהנמוך לגבוה', sort_high: 'מחיר: מהגבוה לנמוך', sort_label: 'מיון',
      all: 'הכל', price: 'מחיר', from: 'מ־', to: 'עד', apply: 'הצגת תוצאות', clear: 'ניקוי הכל', none_found: 'לא נמצאו פריטים שמתאימים לסינון.',
      size_guide: 'מדריך מידות', desc: 'תיאור', fabric: 'גזרה, בד וטיפול', shipping: 'משלוחים והחזרות',
      shipping_text: 'משלוח חינם בהזמנה מעל ₪299, ומתחת לכך ₪29. המשלוח מגיע עד הבית תוך 2–4 ימי עסקים. אפשר להחליף או להחזיר תוך 14 יום מקבלת ההזמנה, כשהפריט לא נלבש והתוויות מחוברות.',
      perk_1: 'משלוח חינם מעל ₪299', perk_2: 'החלפה קלה תוך 14 יום', perk_3: 'תשלום מאובטח · עד 3 תשלומים',
      notify_title: 'עדכנו אותי כשחוזר למלאי', notify_btn: 'עדכנו אותי',
      may_like: 'אולי תאהבי גם', recent: 'צפית לאחרונה', reviews: 'ביקורות', write_review: 'כתיבת ביקורת', reviews_note: 'בחנות האמיתית יופיעו כאן ביקורות אמיתיות מ-Judge.me, כולל תמונות של לקוחות.',
      search_title: 'תוצאות חיפוש', search_for: 'תוצאות עבור "{{ q }}"',
      nf_title: 'העמוד לא נמצא', nf_text: 'ייתכן שהקישור שגוי או שהעמוד הוסר.', back_home: 'חזרה לדף הבית',
      login: 'התחברות', password: 'סיסמה', login_btn: 'כניסה', register: 'אין לך חשבון? להרשמה', acc_note: 'בחנות האמיתית ההתחברות מנוהלת על ידי חשבונות הלקוח של Shopify.',
    },
    en: {
      pv_label: 'Theme preview · sample prices, stock and reviews', pv_popup: 'Show popup', pv_guide: 'Launch guide & apps',
      ann_1: 'Free shipping on orders over ₪299', ann_2: '10% off your first order when you join the club', ann_3: 'Easy exchanges within 14 days',
      nav_main: 'Main navigation', nav_new: 'New in', menu: 'Menu', search: 'Search', account: 'Account', wishlist: 'Wishlist', cart: 'Bag', close: 'Close', home_aria: 'BLISS – home', skip: 'Skip to content',
      cat_dresses: 'Dresses', cat_sets: 'Sets', cat_tops: 'Tops', cat_skirts: 'Skirts', cat_all: 'All products',
      opt_color: 'Color', opt_size: 'Size', badge_new: 'New',
      hero_alt: 'Five models in pastel blazers and maxi skirts', hero_eyebrow: 'The new collection', hero_title: 'Quiet elegance for every hour of the day',
      hero_text: 'Maxi dresses, sets and skirts in fluid cuts and soft colours.', hero_cta: 'Shop the collection',
      usp_1: 'Free shipping', usp_1s: 'On orders over ₪299', usp_2: 'Easy exchanges', usp_2s: 'Within 14 days of delivery', usp_3: 'Up to 3 payments', usp_3s: 'Interest-free, secure checkout', usp_4: 'WhatsApp support', usp_4s: 'Sun–Thu, 9:00–18:00',
      cats_eyebrow: 'Categories', cats_title: 'What are you in the mood for?', items: '{{ n }} pieces', item: '1 piece', view: 'View',
      new_eyebrow: 'Just in', new_title: 'New arrivals', shop_all: 'Shop all',
      look_eyebrow: 'Shop the look', look_title: 'White on taupe', look_text: 'A fitted tie top over a wide pleated skirt. Two pieces, endless outfits.', look_total: 'The full look', look_alt: 'Model in a white tie top and a wide pleated skirt', hotspot: 'Show this piece',
      story_eyebrow: 'Our story', story_title: 'Clothes that feel like a deep breath',
      story_text: 'BLISS began with a simple wish: modest, flattering clothes that are easy to live in. We design fluid maxi cuts, choose soft fabrics and keep to a quiet palette that fits into any wardrobe.',
      story_sig: 'With love, the BLISS team', story_cta: 'Read more', story_alt: 'Model in a grey dress against a white curtain',
      rev_eyebrow: 'Customer reviews', rev_title: 'Love, in the perfect size', rev_count: 'Based on 128 reviews', sample: 'Sample', verified: 'Verified buyer',
      club_eyebrow: 'BLISS Club', club_title: 'Join the club and get 10% off', club_text: 'Early access to Black Friday, a birthday treat and new drops before everyone else.',
      club_perk_1: '10% off your first order', club_perk_2: 'Early access to sales', club_perk_3: 'A birthday surprise',
      bf: 'Black Friday starts in', d: 'days', h: 'hours', m: 'mins', s: 'secs',
      email: 'Email address', join: 'Join', consent: 'I agree to receive news and offers from BLISS by email. Unsubscribe anytime.',
      welcome: 'Welcome to the club! Here is your code:', copy: 'Copy',
      ugc_title: 'How you wear BLISS', ugc_text: 'Tag us on Instagram with #MyBLISS for a chance to be featured.', ugc_label: 'Shop it',
      ft_about: 'Modest womenswear in fluid cuts and quiet colours. Sizes S–XL, shipping across Israel.',
      ft_shop: 'Shop', ft_help: 'Help', ft_brand: 'BLISS', ft_shipping: 'Shipping & returns', ft_size: 'Size guide', ft_faq: 'FAQ', ft_contact: 'Contact us',
      ft_about_link: 'Our story', ft_a11y: 'Accessibility statement', ft_terms: 'Terms of service', ft_privacy: 'Privacy policy', rights: 'All rights reserved.',
      wa: 'Chat with us on WhatsApp', a11y: 'Accessibility menu', a11y_title: 'Accessibility', a11y_size: 'Text size', a11y_contrast: 'High contrast', a11y_links: 'Highlight links', a11y_font: 'Readable font', a11y_still: 'Stop animations', a11y_reset: 'Reset', a11y_statement: 'Accessibility statement',
      search_ph: 'What are you looking for?', popular: 'Popular searches', terms: ['Dress', 'Set', 'Plaid', 'Black', 'Skirt'],
      pop_eyebrow: 'BLISS Club', pop_title: 'off your first order', pop_text: 'Join our mailing list for an instant discount code, plus early access to new drops and sales.', pop_later: 'Maybe later',
      demo_title: 'Checkout starts here', demo_text: 'In the live store this button opens Shopify’s secure checkout through the payment provider you connect (for example with Bit and instalments).', ok: 'Got it',
      sg_title: 'Size guide', sg_intro: 'Body measurements in centimetres.', sg_size: 'Size', sg_bust: 'Bust', sg_waist: 'Waist', sg_hips: 'Hips', sg_il: 'Israeli size',
      sg_m1: 'Bust', sg_m1t: 'Measure around the fullest part of your bust, keeping the tape level.', sg_m2: 'Waist', sg_m2t: 'Measure around the narrowest part of your waist.', sg_m3: 'Hips', sg_m3t: 'Measure around the widest part of your hips.',
      sg_note: 'Between two sizes? Choose the larger one, or message us on WhatsApp and we will help.',
      home: 'Home', all_desc: 'Every BLISS piece in one place.', filter: 'Filter', sort_featured: 'Featured', sort_low: 'Price: low to high', sort_high: 'Price: high to low', sort_label: 'Sort',
      all: 'All', price: 'Price', from: 'From', to: 'To', apply: 'Show results', clear: 'Clear all', none_found: 'No pieces match these filters.',
      size_guide: 'Size guide', desc: 'Description', fabric: 'Fit, fabric & care', shipping: 'Shipping & returns',
      shipping_text: 'Free shipping on orders over ₪299, otherwise ₪29. Home delivery in 2–4 business days. Exchange or return within 14 days of delivery, unworn and with tags attached.',
      perk_1: 'Free shipping over ₪299', perk_2: 'Easy exchanges within 14 days', perk_3: 'Secure payment · up to 3 payments',
      notify_title: 'Email me when it is back', notify_btn: 'Notify me',
      may_like: 'You may also like', recent: 'Recently viewed', reviews: 'Reviews', write_review: 'Write a review', reviews_note: 'In the live store, real reviews from Judge.me appear here, including customer photos.',
      search_title: 'Search results', search_for: 'Results for "{{ q }}"',
      nf_title: 'Page not found', nf_text: 'The link may be wrong or the page was removed.', back_home: 'Back to home',
      login: 'Sign in', password: 'Password', login_btn: 'Sign in', register: 'New here? Create an account', acc_note: 'In the live store, sign-in is handled by Shopify customer accounts.',
    },
  };

  const REVIEWS = [
    { stars: 5, product: 'side-tie-set', color: 'brown', name: { he: 'נועה ל.', en: 'Noa L.' }, text: { he: 'הבד הכי נעים שהיה לי, והגזרה מחמיאה מאוד. כבר הזמנתי בצבע נוסף.', en: 'The softest fabric I own, and the cut is so flattering. I already ordered a second colour.' } },
    { stars: 5, product: 'day-dress', color: 'brown', name: { he: 'אביטל ר.', en: 'Avital R.' }, text: { he: 'שמלת היום הפכה לשמלה שלי לכל אירוע. השרוכים בצד עושים את כל ההבדל.', en: 'The Day Dress is now my go-to for everything. The side ties make all the difference.' } },
    { stars: 4, product: 'style-skirt', color: 'black', name: { he: 'שירה מ.', en: 'Shira M.' }, text: { he: 'המשלוח הגיע תוך יומיים והמידה הייתה בדיוק לפי המדריך. שירות מקסים בוואטסאפ.', en: 'Arrived in two days and the size matched the guide exactly. Lovely service on WhatsApp.' } },
  ];

  const SIZE_ROWS = [
    ['S', '84–88', '66–70', '90–94', '36–38'],
    ['M', '88–94', '70–76', '94–100', '38–40'],
    ['L', '94–100', '76–82', '100–106', '40–42'],
    ['XL', '100–106', '82–88', '106–112', '42–44'],
  ];

  return { COLORS, CATS, PRODUCTS, PAIRS, STR, UI, REVIEWS, SIZE_ROWS, SIZES: ['S', 'M', 'L', 'XL'], BLACK_FRIDAY: '2026-11-27T00:00:00+02:00', ORDER: ['day-dress', 'side-tie-set', 'tie-skirt', 'zip-set', 'back-tie-top', 'plaid-skirt', 'stripe-skirt', 'style-skirt', 'style-plaid-set', 'style-dress', 'tie-top'] };
})();
