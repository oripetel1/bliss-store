/* BLISS design preview v2 — lookbook, colour book and new copy layered onto the catalogue. */
(function () {
  const D = window.BlissPreviewData;
  const tints = { 'blue-plaid': '#8EA2B8', 'black-plaid': '#3B3A3E', 'brown-plaid': '#6A5141' };
  Object.keys(tints).forEach((k) => { D.COLORS[k].tint = tints[k]; });

  Object.assign(D.STR.he, { view: 'צפייה', wishlist_empty_title: 'עוד אין כאן כלום' });
  Object.assign(D.STR.en, { view: 'View', wishlist_empty_title: 'Nothing here yet' });

  // Lookbook: real outfits from the shoot. Each piece is [handle, colour key].
  D.LOOKS = [
    { img: 'look.jpg', title: { he: 'לבן על טאופ', en: 'White on taupe' }, pieces: [['tie-top', 'white']] },
    { img: 'style-plaid-set-blue-plaid-1.jpg', title: { he: 'משבצות, מכף רגל ועד ראש', en: 'Plaid, head to toe' }, pieces: [['style-plaid-set', 'blue-plaid']] },
    { img: 'side-tie-set-black-1.jpg', title: { he: 'שחור עמוק', en: 'Deep black' }, pieces: [['side-tie-set', 'black']] },
    { img: 'tie-dress-taupe-1.jpg', title: { he: 'טאופ רך', en: 'Soft taupe' }, pieces: [['day-dress', 'taupe']] },
    { img: 'style-dress-heather-grey-1.jpg', title: { he: 'אפור של בוקר', en: 'Morning grey' }, pieces: [['style-dress', 'heather-grey']] },
    { img: 'style-skirt-black-1.jpg', title: { he: 'שחור־לבן קלאסי', en: 'Black and white, classic' }, pieces: [['tie-top', 'white'], ['style-skirt', 'black']] },
  ];
  // Colour book order: light to dark, plaids grouped at the end.
  D.PALETTE = ['white', 'ivory', 'beige', 'heather-grey', 'taupe', 'mocha', 'brown', 'chocolate', 'black', 'plaid'];

  const UI2 = {
    he: {
      nav_collection: 'קולקציה', nav_lookbook: 'לוקבוק', nav_story: 'הסיפור', bag: 'סל', mega_cats: 'קטגוריות', mega_colors: 'לפי צבע', mega_feature: 'לוקבוק · לבן על טאופ',
      intro_kicker_a: 'סתיו–חורף 2026', intro_kicker_b: 'גללי לגילוי', intro_eyebrow: 'הקולקציה החדשה', intro_title: 'אלגנטיות שקטה, לכל רגע ביום',
      intro_text: 'שמלות, חליפות וחצאיות מקסי בגזרות זורמות ובצבעים רכים. מידות S–XL.', intro_cta: 'לקולקציה', intro_cta2: 'קנייה לפי צבע',
      ribbon: ['משלוח חינם מעל ₪299', 'החלפה קלה תוך 14 יום', 'עד 3 תשלומים ללא ריבית', 'שירות אישי בוואטסאפ', 'מידות S–XL'],
      mf_label: 'הפילוסופיה', mf_a: 'בגדים', mf_b: 'שמרגישים כמו נשימה עמוקה. גזרות מקסי זורמות, בדים רכים', mf_c: 'ופלטה שקטה שמתאימה לבוקר, לעבודה', mf_d: 'ולאירועים.', mf_cta: 'הסיפור שלנו',
      cb_eyebrow: 'לפי צבע', cb_title: 'פלטה שקטה, עשרה גוונים', cb_text: 'בחרי גוון וראי את כל הפריטים שמגיעים בו.', cb_all: 'לכל הפריטים ב{{ c }}', plaid: 'משבצות',
      new_count: 'פריטים', lb_eyebrow: 'Lookbook · סתיו–חורף 26', lb_title: 'שישה לוקים לעונה', lb_end: 'כל הלוקים וכל הפריטים, במקום אחד.', look: 'Look',
      q_eyebrow: 'לקוחות מספרות', q_reviews: '128 ביקורות', prev: 'הקודם', next: 'הבא',
      club_title: 'הצטרפי למועדון', club_p1: 'הנחה על ההזמנה הראשונה', club_p2: 'גישה מוקדמת למבצעים', club_p3: 'הפתעה ביום ההולדת', bf_in: 'Black Friday בעוד',
      ft_lede: 'אופנה צנועה, בשקט.', all_pieces: 'כל הפריטים', colors: 'צבעים', sizes: 'מידות', view_cols: 'תצוגה', trending: 'פופולרי עכשיו',
      label: 'התווית', style_no: 'מק"ט', fit: 'גזרה', fabric_l: 'בד', care_l: 'טיפול', fabric_v: 'בד רך ונעים (יש להשלים הרכב)',
      care_wash: 'כביסה ב־30°', care_bleach: 'ללא מלבין', care_iron: 'גיהוץ בחום נמוך', care_dry: 'ייבוש בשטיחה בצל', care_tumble: 'ללא מייבש',
      your_bag: 'הסל שלך',
      show_product: 'הצג מוצר', most_loved: 'הכי אהובים', stay_updated: 'הישארו מעודכנות', split_1: 'שמלות מקסי ליום ולערב', split_2: 'סטים תואמים מכף רגל ועד ראש',
      ft_info: 'מידע', ft_need_help: 'צריכות עזרה?', ft_news: 'הירשמי לניוזלטר',
    },
    en: {
      nav_collection: 'Shop', nav_lookbook: 'Lookbook', nav_story: 'Story', bag: 'Bag', mega_cats: 'Categories', mega_colors: 'By colour', mega_feature: 'Lookbook · White on taupe',
      intro_kicker_a: 'Autumn–Winter 2026', intro_kicker_b: 'Scroll to discover', intro_eyebrow: 'The new collection', intro_title: 'Quiet elegance for every hour of the day',
      intro_text: 'Maxi dresses, sets and skirts in fluid cuts and soft colours. Sizes S–XL.', intro_cta: 'Shop the collection', intro_cta2: 'Shop by colour',
      ribbon: ['Free shipping over ₪299', 'Easy exchanges within 14 days', 'Up to 3 interest-free payments', 'Personal service on WhatsApp', 'Sizes S–XL'],
      mf_label: 'Philosophy', mf_a: 'Clothes', mf_b: 'that feel like a deep breath. Fluid maxi cuts, soft fabrics', mf_c: 'and a quiet palette for mornings, for work', mf_d: 'and for evenings out.', mf_cta: 'Our story',
      cb_eyebrow: 'By colour', cb_title: 'A quiet palette in ten shades', cb_text: 'Pick a shade to see every piece that comes in it.', cb_all: 'Everything in {{ c }}', plaid: 'Plaid',
      new_count: 'pieces', lb_eyebrow: 'Lookbook · AW 26', lb_title: 'Six looks for the season', lb_end: 'Every look and every piece, in one place.', look: 'Look',
      q_eyebrow: 'Customer reviews', q_reviews: '128 reviews', prev: 'Previous', next: 'Next',
      club_title: 'Join the club', club_p1: 'off your first order', club_p2: 'early access to sales', club_p3: 'a birthday surprise', bf_in: 'Black Friday in',
      ft_lede: 'Modest fashion, quietly.', all_pieces: 'All pieces', colors: 'Colours', sizes: 'Sizes', view_cols: 'View', trending: 'Trending now',
      label: 'The label', style_no: 'Style no.', fit: 'Fit', fabric_l: 'Fabric', care_l: 'Care', fabric_v: 'Soft, easy fabric (composition to be added)',
      care_wash: 'Wash at 30°', care_bleach: 'Do not bleach', care_iron: 'Iron on low', care_dry: 'Dry flat in shade', care_tumble: 'Do not tumble dry',
      your_bag: 'Your bag',
      show_product: 'View product', most_loved: 'Most loved', stay_updated: 'Stay in the loop', split_1: 'Maxi dresses for day and evening', split_2: 'Matching sets, head to toe',
      ft_info: 'Info', ft_need_help: 'Need help?', ft_news: 'Join the newsletter',
    },
  };
  Object.keys(UI2).forEach((l) => Object.assign(D.UI[l], UI2[l]));
})();
