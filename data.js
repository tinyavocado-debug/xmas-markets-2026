// Ontario holiday markets 2026 — source:
// https://www.destinationontario.com/en-ca/articles/festive-holiday-markets-ontario (updated Nov 20, 2026)
// Coordinates are hand-placed at venue level (approximate, not geocoded).
// spans: inclusive [start, end] ISO dates. select:true = "select dates" within the span (check site).
// tbd:true = page gives no exact dates.
// datesFrom: 'official site' = the source said "select dates"; exact days taken from the market's own site (2026-11-21).

const SEASON_START = '2026-11-01';
const SEASON_END = '2027-01-03';
const PAGE_URL = 'https://www.destinationontario.com/en-ca/articles/festive-holiday-markets-ontario';

const one = (...days) => days.map(d => [d, d]);

const MARKETS = [
  // Greater Toronto Area
  { name: 'The Distillery Winter Village', city: 'Toronto', region: 'Greater Toronto Area', venue: 'Distillery Historic District, 55 Mill St', when: 'Nov 12, 2026 – Jan 3, 2027', url: 'https://thedistillerywintervillage.com/', blurb: 'Cobblestone laneways of decorated vendor cabins, carollers and a big lit tree. Some times need advance tickets.', lat: 43.6503, lng: -79.3596, spans: [['2026-11-12', '2027-01-03']] },
  { name: 'One Of A Kind Winter Show', city: 'Toronto', region: 'Greater Toronto Area', venue: "Enercare Centre, 100 Princes' Blvd", when: 'Nov 27 – Dec 6', url: 'https://oneofakindshow.com/home/', blurb: 'Makers selling handcrafted apparel, jewellery and art, plus cooking and craft demos.', lat: 43.6340, lng: -79.4146, spans: [['2026-11-27', '2026-12-06']] },
  { name: 'Evergreen Winter Garden', city: 'Toronto', region: 'Greater Toronto Area', venue: 'Evergreen Brick Works, 550 Bayview Ave', when: 'Sundays, Nov 29 – Dec 20', url: 'https://www.evergreen.ca/evergreen-brick-work/events/winter-market-2025', blurb: 'Four Sundays of food trucks, a fire pit, family art and candle- and wreath-making workshops.', lat: 43.6845, lng: -79.3653, spans: one('2026-11-29', '2026-12-06', '2026-12-13', '2026-12-20') },
  { name: 'Holiday Fair in the Square', city: 'Toronto', region: 'Greater Toronto Area', venue: 'Sankofa Square, 1 Dundas St E', when: 'Dec 10 – 20', url: 'https://fairinthesquare.ca/', blurb: 'Artisan marketplace, entertainment, warm drinks and snacks right downtown.', lat: 43.6561, lng: -79.3802, spans: [['2026-12-10', '2026-12-20']] },
  { name: 'Winter Market at St. Lawrence Market', city: 'Toronto', region: 'Greater Toronto Area', venue: 'Market Street', when: 'Nov 19 – Dec 22', url: 'https://www.stlawrencemarket.com/', blurb: 'Free outdoor winter market with seasonal shopping.', lat: 43.6487, lng: -79.3716, spans: [['2026-11-19', '2026-12-22']] },
  { name: 'Holiday Hills at STACKT market', city: 'Toronto', region: 'Greater Toronto Area', venue: 'STACKT market, 28 Bathurst St', when: 'Nov 13, 2026 – Jan 3, 2027', url: 'https://stacktmarket.com/holiday-hills/', blurb: 'Shipping-container shops, roaming performers, a cocktail bar and Sunday family workshops.', lat: 43.6403, lng: -79.4027, spans: [['2026-11-13', '2027-01-03']] },
  { name: 'Swedish Christmas Fair', city: 'Toronto', region: 'Greater Toronto Area', venue: 'George Brown Waterfront Campus, 51 Dockside Dr', when: 'Nov 21 – 22', url: 'https://swedishchristmasfair.ca/', blurb: 'Free celebration of Swedish culture: Lucia, folk dancing, food and design.', lat: 43.6440, lng: -79.3653, spans: [['2026-11-21', '2026-11-22']] },
  { name: 'Toronto Botanical Garden Holiday EcoMarket', city: 'Toronto', region: 'Greater Toronto Area', venue: 'Toronto Botanical Garden, 777 Lawrence Ave E', when: 'Nov 20 – 22 & Dec 18 – 20', url: 'https://torontobotanicalgarden.ca/enjoy/special-events/holiday-market-open-house/', blurb: '100+ eco-friendly local vendors, a bonfire, drop-in crafts and a sustainable wrapping station.', lat: 43.7334, lng: -79.3586, spans: [['2026-11-20', '2026-11-22'], ['2026-12-18', '2026-12-20']] },
  { name: 'Mississauga Festival of Trees', city: 'Mississauga', region: 'Greater Toronto Area', venue: 'Small Arms Inspection Building, 1352 Lakeshore Rd E', when: 'Dec 4 – 13', url: 'https://www.creativehub1352.ca/', blurb: 'Artist-made tree installations, lights, live shows and an artisan market in a heritage building.', lat: 43.5838, lng: -79.5424, spans: [['2026-12-04', '2026-12-13']] },

  // Ottawa Region
  { name: 'Canadian Museum of History Christmas Market', city: 'Gatineau, QC', region: 'Ottawa Region', venue: 'Canadian Museum of History, 100 Laurier St', when: 'Nov 26 – 29', url: 'https://www.historymuseum.ca/for-professionals/christmas-market', blurb: 'Free market in the museum halls: ornaments, wood crafts, blown glass, specialty food.', lat: 45.4301, lng: -75.7093, spans: [['2026-11-26', '2026-11-29']] },
  { name: 'Ottawa Christmas Market', city: 'Ottawa', region: 'Ottawa Region', venue: 'Aberdeen Square, Lansdowne Park', when: 'Fri–Sun, Nov 20 – Dec 20, plus Dec 31', url: 'https://www.ottawachristmasmarket.com/', blurb: 'Free Yuletide market with pop-up shops, hot cocoa, lights and Santa visits.', lat: 45.3990, lng: -75.6838, spans: [['2026-11-20', '2026-11-22'], ['2026-11-27', '2026-11-29'], ['2026-12-04', '2026-12-06'], ['2026-12-11', '2026-12-13'], ['2026-12-18', '2026-12-20'], ['2026-12-31', '2026-12-31']], datesFrom: 'official site' },

  // York, Durham and Headwaters
  { name: "Canada's Wonderland WinterFest", city: 'Vaughan', region: 'York, Durham & Headwaters', venue: "Canada's Wonderland, 1 Canada's Wonderland Dr", when: 'Select dates, Nov 21 – Jan 3', url: 'https://www.sixflags.com/canadaswonderland/events/winterfest', blurb: 'The theme park turned winter wonderland: shows, skating, light displays.', lat: 43.8430, lng: -79.5390, spans: [['2026-11-21', '2027-01-03']], select: true },
  { name: "Uxbridge Farmers' Holiday Market", city: 'Uxbridge', region: 'York, Durham & Headwaters', venue: 'Uxbridge Arena Hall, 291 Brock St W', when: 'Nov 1, 8, 15, 22 & Dec 6, 13', url: 'https://uxbridgefarmersmarket.ca/', blurb: "Free holiday edition of the Uxbridge Farmers' Market in the arena hall.", lat: 44.1090, lng: -79.1300, spans: one('2026-11-01', '2026-11-08', '2026-11-15', '2026-11-22', '2026-12-06', '2026-12-13') },
  { name: 'Markham Home for the Holidays', city: 'Markham', region: 'York, Durham & Headwaters', venue: 'Markham Fairgrounds, 10801 McCowan Rd', when: 'Nov 20 – 22', url: 'https://homefortheholidays.ca/', blurb: 'Ceramics, stained glass, gourmet treats and Victorian carollers.', lat: 43.9335, lng: -79.2580, spans: [['2026-11-20', '2026-11-22']] },
  { name: 'Stouffville Holiday Market', city: 'Stouffville', region: 'York, Durham & Headwaters', venue: 'Main Street', when: 'Nov 20 – 21', url: 'https://www.townofws.ca/play/events/holiday-market/', blurb: 'Artisan marketplace, light displays, live music and Santa on Main Street.', lat: 43.9707, lng: -79.2489, spans: [['2026-11-20', '2026-11-21']] },
  { name: 'Aurora Christmas Market', city: 'Aurora', region: 'York, Durham & Headwaters', venue: 'Aurora Town Square, 50 Victoria St', when: 'Nov 27 – 29 & Dec 4 – 6', url: 'https://www.aurora.ca/recreation-arts-and-culture/specialevents/christmas-market/', blurb: 'Free market with artisan and food vendors and photos with the Clauses.', lat: 44.0003, lng: -79.4637, spans: [['2026-11-27', '2026-11-29'], ['2026-12-04', '2026-12-06']] },
  { name: "Niemi's Scandinavian Christmas Market", city: 'Mount Albert', region: 'York, Durham & Headwaters', venue: 'Niemi Family Farm, 18463 Hwy 48', when: 'Nov 13 – Dec 19', url: 'https://niemifamilyfarm.ca/', blurb: 'Finnish goods, Christmas trees, farm animals, a train ride and a bonfire.', lat: 44.1300, lng: -79.2750, spans: [['2026-11-13', '2026-12-19']] },
  { name: "Richmond Hill's Merry Marketplace", city: 'Richmond Hill', region: 'York, Durham & Headwaters', venue: 'Richmond Green Park, 1300 Elgin Mills Rd E', when: 'Nov 14, 21, 28 & Dec 5, 12', url: 'https://www.richmondhill.ca/en/things-to-do/merry-marketplace.aspx', blurb: 'Outdoor shopping under twinkling lights beside fires.', lat: 43.8960, lng: -79.3870, spans: one('2026-11-14', '2026-11-21', '2026-11-28', '2026-12-05', '2026-12-12') },

  // Huron, Perth, Waterloo and Wellington
  { name: 'Elora Christmas Market', city: 'Elora', region: 'Huron, Perth, Waterloo & Wellington', venue: 'Downtown Elora', when: 'Wed–Sun, Nov 14 – Jan 3', url: 'https://elorachristmasmarket.com/', blurb: 'The whole town goes old-world European: a sparkling tree, festive food, local vendors.', lat: 43.6845, lng: -80.4307, spans: [['2026-11-14', '2026-11-15'], ['2026-11-18', '2026-11-22'], ['2026-11-25', '2026-11-29'], ['2026-12-02', '2026-12-06'], ['2026-12-09', '2026-12-13'], ['2026-12-16', '2026-12-20'], ['2026-12-23', '2026-12-27'], ['2026-12-30', '2027-01-03']], datesFrom: 'official site' },
  { name: 'Cambridge Holiday Market', city: 'Cambridge', region: 'Huron, Perth, Waterloo & Wellington', venue: 'Cambridge City Hall, 50 Dickson St', when: 'Nov 27 – 29', url: 'https://www.cambridge.ca/recreation-culture/events-festivals/winterfest/cambridge-holiday-market/', blurb: '100+ artisans, seasonal food, and photos with Santa and Willy Melt.', lat: 43.3584, lng: -80.3150, spans: [['2026-11-27', '2026-11-29']] },
  { name: 'Christkindl Market', city: 'Kitchener', region: 'Huron, Perth, Waterloo & Wellington', venue: 'Kitchener City Hall, 200 King St W', when: 'Dec 3 – 13', url: 'https://www.kitchener.ca/arts-culture-and-events/events/christkindl-market/', blurb: 'German-style market: Glühwein, pretzels, blacksmiths and folklore characters.', lat: 43.4510, lng: -80.4927, spans: [['2026-12-03', '2026-12-13']] },
  { name: 'Sparkles in St. Jacobs', city: 'St. Jacobs', region: 'Huron, Perth, Waterloo & Wellington', venue: 'St. Jacobs Village', when: 'Nov 12 – 15 & 19 – 22', url: 'https://www.stjacobsvillage.com/sparkles', blurb: 'Thousands of lights, late shopping and carollers in Victorian costume.', lat: 43.5392, lng: -80.5540, spans: [['2026-11-12', '2026-11-15'], ['2026-11-19', '2026-11-22']] },
  { name: 'The Christmas Trail', city: 'Stratford & area', region: 'Huron, Perth, Waterloo & Wellington', venue: 'Shops in Stratford, St. Marys, Shakespeare and beyond', when: 'Nov 1 – Dec 20', url: 'https://visitstratford.ca/christmastrail/', blurb: 'Self-guided trail: buy six vouchers, trade them for gifts at participating shops.', lat: 43.3700, lng: -80.9822, spans: [['2026-11-01', '2026-12-20']] },
  { name: 'Spirit of the Season', city: 'Guelph', region: 'Huron, Perth, Waterloo & Wellington', venue: 'Downtown Guelph', when: 'Dec 4 – 6 & 11 – 13', url: 'https://www.spiritoftheseasonguelph.com/', blurb: 'Indoor and outdoor marketplace of handmade crafts and artisanal treats.', lat: 43.5448, lng: -80.2482, spans: [['2026-12-04', '2026-12-06'], ['2026-12-11', '2026-12-13']] },

  // Bruce, Grey and Simcoe
  { name: 'Holiday Market at Friday Harbour', city: 'Innisfil', region: 'Bruce, Grey & Simcoe', venue: 'Friday Harbour Resort, 3999 Friday Dr', when: 'Weekends Nov 20 – Dec 20, Dec 21–24, Dec 26–27', url: 'https://www.fridayharbour.com/events', blurb: 'European-inspired chalet cabins, sparkling lights, Santa and carollers.', lat: 44.3930, lng: -79.5260, spans: [['2026-11-20', '2026-11-22'], ['2026-11-27', '2026-11-29'], ['2026-12-04', '2026-12-06'], ['2026-12-11', '2026-12-13'], ['2026-12-18', '2026-12-24'], ['2026-12-26', '2026-12-27']], datesFrom: 'official site' },
  { name: 'Southern Georgian Bay Christmas Market', city: 'The Blue Mountains', region: 'Bruce, Grey & Simcoe', venue: 'Alpine Ski Club, 17-242 Arrowhead Rd', when: 'Nov 28 – 29', url: 'https://www.sgbchristmasmarket.ca/', blurb: 'Handcrafted goods, fashion, jewellery and treats at a ski club.', lat: 44.5420, lng: -80.3480, spans: [['2026-11-28', '2026-11-29']] },
  { name: 'Christmas on the Bay', city: 'Meaford', region: 'Bruce, Grey & Simcoe', venue: 'Historic downtown Meaford', when: 'Dec 3 – 6', url: 'https://christmasonthebay.ca/', blurb: 'Four-day European-style market with fire pits, live music and light displays.', lat: 44.6070, lng: -80.5920, spans: [['2026-12-03', '2026-12-06']] },
  { name: 'The Gilford Christmas Market', city: 'Gilford, Innisfil', region: 'Bruce, Grey & Simcoe', venue: 'Gilford Local Eatery, 1096 Shore Acres Dr', when: 'Nov 28', url: null, blurb: 'Open-air market on the shore of Lake Simcoe with stalls, treats and live music.', lat: 44.2340, lng: -79.5550, spans: one('2026-11-28') },
  { name: 'Holiday Weekend and Market', city: 'Barrie area', region: 'Bruce, Grey & Simcoe', venue: 'Horseshoe Valley Resort, 1101 Horseshoe Valley Rd W', when: 'Nov 6 – 8', url: 'https://horseshoeresort.com/events/', blurb: 'Resort holiday weekend with a market and family activities.', lat: 44.5530, lng: -79.6670, spans: [['2026-11-06', '2026-11-08']] },

  // Southwestern Ontario
  { name: 'Holly Jolly Holiday Market', city: 'London', region: 'Southwestern Ontario', venue: 'Covent Garden Market, 130 King St', when: 'Dec 4 – 20', url: 'https://coventmarket.com/event/2026-events-at-the-market/', blurb: 'Outdoors and up on the mezzanine: cocktails, hot chocolate, kids crafts, live bands.', lat: 42.9837, lng: -81.2496, spans: [['2026-12-04', '2026-12-20']] },
  { name: 'Merry Market at 100 Kellogg Lane', city: 'London', region: 'Southwestern Ontario', venue: '100 Kellogg Lane', when: 'Nov/Dec — dates TBA', url: 'https://100kellogglane.com/', blurb: 'Free market of local vendors, food artisans and young entrepreneurs.', lat: 42.9830, lng: -81.2240, spans: [], tbd: true },
  { name: 'Dresden Christmas Night Market', city: 'Dresden', region: 'Southwestern Ontario', venue: 'Downtown Dresden', when: 'Nov 28', url: 'https://night-market.ca/', blurb: 'Award-winning night market on pedestrian-only streets with a pop-up bar.', lat: 42.5890, lng: -82.1810, spans: one('2026-11-28') },

  // Southeastern Ontario
  { name: 'Kingston Holiday Market', city: 'Kingston', region: 'Southeastern Ontario', venue: 'Tett Centre, 370 King St W', when: 'Select weekends, Nov & Dec — TBA', url: 'https://kingstonartistevents.com/pages/kingston-holiday-market-info', blurb: 'Supports local artists at the waterfront Tett Centre.', lat: 44.2240, lng: -76.4900, spans: [], tbd: true },
  { name: 'MacKinnon Brothers Holiday Market', city: 'Bath', region: 'Southeastern Ontario', venue: 'MacKinnon Brothers farm, 1915 County Rd', when: 'Nov 20 – 22 & 27 – 29', url: 'https://www.mackinnonbrewing.com/the-holiday-market/', blurb: 'On a century-old farm: artisans, carolling and seasonal activities.', lat: 44.1850, lng: -76.7700, spans: [['2026-11-20', '2026-11-22'], ['2026-11-27', '2026-11-29']] },
  { name: 'The Red Barn Christmas Market', city: 'Bloomfield', region: 'Southeastern Ontario', venue: 'The Eddie Hotel & Farm, 15786 Loyalist Pkwy', when: 'Nov 26 – 29', url: 'https://theeddie.ca/christmas-at-the-eddie-1', blurb: 'A decorated 1800s barn full of hand-spun fabrics, candles and crafts.', lat: 43.9870, lng: -77.2280, spans: [['2026-11-26', '2026-11-29']] },
  { name: 'Enchanted In The District', city: 'Belleville', region: 'Southeastern Ontario', venue: 'Bridge St, Front to Pinnacle', when: 'Nov 20 – 22', url: 'https://downtownbelleville.ca/events/enchanted-in-the-district/', blurb: 'Free three-day downtown festival with fire tables and live entertainment.', lat: 44.1630, lng: -77.3830, spans: [['2026-11-20', '2026-11-22']] },

  // Kawarthas and Northumberland
  { name: 'Grafton Outdoor Christmas Market', city: 'Grafton', region: 'Kawarthas & Northumberland', venue: 'Haldimand Community Memorial Arena, 10766 County Rd 2', when: 'Nov 21', url: 'https://www.facebook.com/events/haldimand-community-memorial-arena/-grafton-outdoor-christmas-market-/936853792215441/', blurb: 'Annual outdoor event with artisans, musicians and food vendors.', lat: 44.0070, lng: -78.0070, spans: one('2026-11-21') },

  // Niagara
  { name: "Vintage Hotels' Christmas Market", city: 'Niagara-on-the-Lake', region: 'Niagara', venue: 'Gardens at Pillar and Post, 48 John St W', when: 'Nov 20 – 22', url: 'https://www.vintage-hotels.com/events/christmas-market/', blurb: 'First-ever market in the Pillar and Post gardens: local vendors, treats, entertainment.', lat: 43.2541, lng: -79.0773, spans: [['2026-11-20', '2026-11-22']] },

  // Northeastern Ontario
  { name: 'Village Noël Temiskaming', city: 'Temiskaming Shores', region: 'Northeastern Ontario', venue: 'New Liskeard Fairgrounds, 10 May St S', when: 'Nov 19 – 21', url: 'https://en.villagenoel.com/', blurb: 'A New France Christmas village with lumberjacks, dancers and historical characters.', lat: 47.5090, lng: -79.6800, spans: [['2026-11-19', '2026-11-21']] },
  { name: 'North Bay Winter Market Experience', city: 'North Bay', region: 'Northeastern Ontario', venue: 'Jack Burrows Parkette, 100 Ferguson St', when: 'Nov 7, 14, 21, 27', url: 'https://www.tourismnorthbay.com/see-do/winter-fun/winter-market/', blurb: 'Outdoor market with lights and live entertainment, plus a Hallmark-movie walking tour.', lat: 46.3080, lng: -79.4620, spans: one('2026-11-07', '2026-11-14', '2026-11-21', '2026-11-27') },
].map((m, i) => ({ id: i, ...m }));

// ---- helpers ----
function isoToDate(iso) { return new Date(iso + 'T12:00:00'); }
function dateToIso(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function seasonDays() {
  const out = [];
  for (let d = isoToDate(SEASON_START); dateToIso(d) <= SEASON_END; d.setDate(d.getDate() + 1)) out.push(dateToIso(d));
  return out;
}
// 'open' | 'maybe' (select dates) | 'closed' | 'tbd'
function dayStatus(m, iso) {
  if (m.tbd) return 'tbd';
  for (const [s, e] of m.spans) if (iso >= s && iso <= e) return m.select ? 'maybe' : 'open';
  return 'closed';
}
function todayIso() {
  const t = dateToIso(new Date());
  return t < SEASON_START ? SEASON_START : t > SEASON_END ? SEASON_END : t;
}
function fmt(iso, opts = { weekday: 'long', month: 'long', day: 'numeric' }) {
  return isoToDate(iso).toLocaleDateString('en-CA', opts);
}
function haversineKm(a, b) {
  const R = 6371, r = x => x * Math.PI / 180;
  const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// ---- duration ----
// long: one continuous run of 3+ weeks · mid: 5–20 days · short: runs of 4 days or less (a weekend or two)
// weekly: 3+ separate single days (e.g. every Saturday) · tbd: no dates
const DURATIONS = {
  long:   { label: 'All season',   detail: '3+ weeks straight', color: '#1b7f5b', size: 22 },
  mid:    { label: 'Week or two',  detail: '5–20 days',         color: '#e0a43a', size: 16 },
  short:  { label: 'Weekend-ish',  detail: 'runs of 1–4 days',  color: '#d7263d', size: 11 },
  weekly: { label: 'Weekly',       detail: 'single days, repeating', color: '#7b3fa0', size: 11 },
  tbd:    { label: 'Dates TBA',    detail: 'check site',        color: '#9a9a9a', size: 11 },
};
function spanLen([s, e]) { return Math.round((isoToDate(e) - isoToDate(s)) / 864e5) + 1; }
function openDayCount(m) { return m.spans.reduce((n, sp) => n + spanLen(sp), 0); }
// longest stretch, bridging closures of 2 days or less (so "Wed–Sun all season" still counts as all season)
function longestStretch(m) {
  let best = 0, cur = null;
  for (const [s, e] of m.spans) {
    if (cur && spanLen([cur[1], s]) - 2 <= 2) cur[1] = e; else cur = [s, e];
    best = Math.max(best, spanLen(cur));
  }
  return best;
}
function durationKind(m) {
  if (m.tbd) return 'tbd';
  const longest = longestStretch(m);
  if (m.spans.length >= 3 && longest === 1) return 'weekly';
  if (longest >= 21) return 'long';
  if (longest >= 5) return 'mid';
  return 'short';
}
function durationText(m) {
  const k = durationKind(m), n = openDayCount(m);
  if (k === 'tbd') return 'dates TBA';
  if (k === 'weekly') return `${n} single days`;
  return (m.select ? 'select dates within ' : '') + `${n} day${n > 1 ? 's' : ''}` + (m.spans.length > 1 ? ` over ${m.spans.length} runs` : '');
}

// ---- links ----
// Search by venue address (pins are approximate, the address is what the page gives)
// Cleaner Google Maps searches where the source page's venue text is vague
const MAP_QUERY = {
  'Winter Market at St. Lawrence Market': 'St. Lawrence Market, Toronto, ON',
  'The Christmas Trail': 'Stratford, ON',
  'Elora Christmas Market': 'Elora, ON',
  'Spirit of the Season': 'Downtown Guelph, ON',
  'Holiday Weekend and Market': 'Horseshoe Valley Resort, Oro-Medonte, ON',
  'The Gilford Christmas Market': 'Gilford Local Eatery, 1096 Shore Acres Dr, Innisfil, ON',
  'MacKinnon Brothers Holiday Market': 'MacKinnon Brothers Brewing Co, Bath, ON',
  'Enchanted In The District': 'Bridge St E & Front St, Belleville, ON',
  'Dresden Christmas Night Market': 'Downtown Dresden, ON',
  'Stouffville Holiday Market': 'Main St, Stouffville, ON',
};
function placeQuery(m) { return MAP_QUERY[m.name] || `${m.venue}, ${m.city}${/QC/.test(m.city) ? '' : ', ON'}`; }
function gmapsUrl(m) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(placeQuery(m)); }
// Google Maps directions through the stops in order (URL API allows up to 9 waypoints)
function routeUrl(stops) {
  const q = stops.map(placeQuery);
  const p = new URLSearchParams({ api: '1', origin: q[0], destination: q.at(-1), travelmode: 'driving' });
  if (q.length > 2) p.set('waypoints', q.slice(1, -1).join('|'));
  return 'https://www.google.com/maps/dir/?' + p;
}
