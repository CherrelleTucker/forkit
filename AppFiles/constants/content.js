// ForkIt — Content strings, copy arrays, and tour step definitions

export const FORKING_LINES = [
  'Picking for you…',
  'One sec…',
  'Finding food…',
  'Consulting the vibes…',
  'Rolling the dinner dice…',
  'Cross-referencing cravings…',
  'Selecting your destiny…',
  'Spearing the perfect spot…',
  'Pronging through possibilities…',
  'Overthinking is over…',
  'Almost there…',
];

export const SUCCESS_LINES = [
  'There. Done. Go eat.',
  'Picked. Now go.',
  "That's the one.",
  'Decision made.',
  'Done. Stop scrolling. Go.',
  'No more debates. Just go.',
];

export const FAIL_LINES = [
  'Nothing? Lower your standards.',
  'Zero results. Widen the radius.',
  'Your filters said no to everything.',
  'Too picky. Loosen up.',
];

export const CHAIN_KEYWORDS = [
  'mcdonald',
  'burger king',
  'wendy',
  'taco bell',
  'kfc',
  'popeyes',
  'chick-fil-a',
  'chickfila',
  'subway',
  'domino',
  'pizza hut',
  'papa john',
  'starbucks',
  'dunkin',
  'panera',
  'chipotle',
  'five guys',
  'applebee',
  'chili',
  'olive garden',
  'outback',
  'buffalo wild wings',
  'arbys',
  'sonic',
  'hardee',
  "carl's jr",
  'jersey mike',
  'jimmy john',
  'qdoba',
  'whataburger',
];

export const SIGNATURE_DISH_RULES = [
  { match: ['mcdonald'], dish: 'Big Mac' },
  { match: ['chick-fil-a', 'chickfila'], dish: 'Chick-fil-A Chicken Sandwich' },
  { match: ['taco bell'], dish: 'Crunchwrap Supreme' },
  { match: ['chipotle'], dish: 'Chicken Burrito Bowl' },
  { match: ['wendy'], dish: 'Baconator' },
  { match: ['popeyes'], dish: 'Spicy Chicken Sandwich' },
  { match: ['kfc'], dish: 'Original Recipe Fried Chicken' },
  { match: ['starbucks'], dish: 'Caramel Macchiato' },
];

// Tour steps — ref values are string keys matching tourRefs object properties.
// Look up the actual ref at usage time via tourRefs[step.ref].
export const TOUR_STEPS = [
  {
    ref: 'forkBtn',
    title: 'Just fork it.',
    desc: "Tap the button and we'll pick a spot. Each tap re-rolls from the same pool for free \u2014 a new search only counts when your filters change or the pool refreshes.",
  },
  {
    ref: 'modeToggle',
    title: 'Walk vs Drive',
    desc: "In a city? Switch to walk mode for spots you can stroll to. If we find way more (or fewer) results than expected, we'll suggest switching modes.",
  },
  {
    ref: 'filtersToggle',
    title: 'Filters',
    desc: 'Tap here to open filters \u2014 distance, price, rating, cuisine, and more. Just keep in mind: we can only filter by what restaurants list on their Google profile.',

    expandFilters: true,
  },
  {
    ref: 'distanceRow',
    title: 'How Far?',
    desc: 'Pick your distance. These change based on walk or drive mode. Or tap the pin to search near a custom address.',
  },
  {
    ref: 'maxDamageRow',
    title: 'Max Damage & At Least This Good',
    desc: 'These filters are inclusive. $$ means \u201Cup to $$.\u201D 3 stars means \u201C3 stars and above.\u201D You get what you pick and everything below/above.',
  },
  {
    ref: 'keywordFields',
    title: 'Picky Eater Mode',
    desc: 'Search for exactly what you want with "Cuisine keyword" and exclude what you don\'t with "Not in the mood for." Try "tacos" and exclude "Taco Bell" \u2014 or search "gluten free" to find spots that match.',
    expandFilters: true,
  },
  {
    ref: 'openNowRow',
    title: 'Open Now',
    desc: "Only shows places that'll be open for at least another hour. No rushing to beat a closing kitchen.",
  },
  {
    ref: 'hiddenGemsRow',
    title: 'Skip the Chains',
    desc: 'We filter out chains two ways: a list of known chain names, and any place with 500+ reviews (a good sign it\u2019s a big operation). What\u2019s left are more likely to be local spots with smaller audiences.',
  },
  {
    ref: 'spotsRow',
    title: '+ Spots & Your Lists',
    desc: "Spots are places you add yourself \u2014 Mom's house, that taco truck, anywhere. Favorites \u2764\uFE0F are places Fork It found that you loved. Both get tossed into your pool. Block \uD83D\uDEAB to hide specific places or entire names.",
  },
  {
    ref: 'forkAroundBtn',
    title: 'Fork Around. Find Out.',
    desc: 'Indecisive group? Start a session, set your filters, then share the code. Everyone sets their own filters and we pick from what works for all of you. Host 1 free/month, join unlimited. After the pick, an info card stays on your home screen for 30 minutes with directions, menu, and more.',
  },
  {
    ref: 'infoBtn',
    title: 'Info & Support',
    desc: 'Tap \u2139\uFE0F anytime for details on how everything works, take this tour again, or upgrade to Pro.',
  },
  {
    ref: null,
    mock: true,
    title: 'Why not all free?',
    desc: "Google Maps promotes places with ad budgets \u2014 which crowds out the best Jamaican food made in the back of a gas station you've ever tasted. We bypass that by pulling raw data from Google's API, and Google charges for those calls. Your 20 free searches/month and 1 Fork Around are on us. Pro ($1.99/month) removes all limits. Re-rolls within 4 hours are always free \u2014 only filter changes or an expired pool count as a new search.",
  },
];
