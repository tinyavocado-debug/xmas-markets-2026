// Shared core for the Sleigh Route variants: header + nav, map with pins, sleigh ticket.
// A variant page provides <div id="main"> containing <div id="map">, then calls Shell.init({ title, hint }).
const REGION_COLORS = {
  'Greater Toronto Area': '#d7263d', 'Ottawa Region': '#7b3fa0', 'York, Durham & Headwaters': '#1b7f5b',
  'Huron, Perth, Waterloo & Wellington': '#e08a00', 'Bruce, Grey & Simcoe': '#2a6fdb', 'Southwestern Ontario': '#8c5a2b',
  'Southeastern Ontario': '#0f9fa8', 'Kawarthas & Northumberland': '#c2477a', 'Niagara': '#6a8f1f', 'Northeastern Ontario': '#33415c'
};
const COLOR_MODE = new URLSearchParams(location.search).get('color') === 'region' ? 'region' : 'duration';
const col = m => COLOR_MODE === 'region' ? REGION_COLORS[m.region] : DURATIONS[durationKind(m)].color;
const DAYS = seasonDays(), N = DAYS.length, TODAY = todayIso();
const openOn = (m, d) => ['open', 'maybe'].includes(dayStatus(m, d));

const SAVE_KEY = 'xmas-markets-2026:trips'; // namespaced: GitHub Pages sites under one account share storage
const TRIP_COLORS = ['#d7263d', '#2a6fdb', '#7b3fa0', '#0f9fa8', '#e08a00', '#1d2a24'];
const shortDay = d => fmt(d, { weekday: 'short', month: 'short', day: 'numeric' });

const Shell = {
  // multi-day sleigh: each trip = one day out, with its own stops and route
  trips: [], active: null, onHl: [], onPick: [], onActivate: [],
  suggestDate: () => null, // a variant can propose a date for a new day (e.g. the brushed day)
  get picked() { return this.active ? this.active.stops : []; },
  init({ hint = '', pickDayHint = 'Pick a date above (or click a day on the timeline), then click markets to add them.' } = {}) {
    this.pickDayHint = pickDayHint;
    document.body.insertAdjacentHTML('afterbegin', `<header><h1>🛷 Sleigh Route</h1><span class="hint">${hint}</span></header>`);
    document.body.insertAdjacentHTML('beforeend', `<aside id="ticket"><div class="stub"><h2>Your sleigh</h2><div class="km" id="km"></div></div>
      <div id="trips"></div><div class="legend">${COLOR_MODE === 'region'
        ? Object.entries(REGION_COLORS).map(([r, c]) => `<span><i style="background:${c}"></i>${r}</span>`).join('')
        : Object.values(DURATIONS).map(d => `<span><i style="background:${d.color}"></i>${d.label} <span style="opacity:.6">(${d.detail})</span></span>`).join('')}
      <span><i style="background:repeating-linear-gradient(45deg,#999 0 2px,#fff 2px 4px)"></i>select dates</span></div></aside>`);
    const map = this.map = L.map('map');
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles © Esri — Esri, HERE, Garmin, © OpenStreetMap contributors', maxZoom: 16 }).addTo(map);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', { maxZoom: 16, pane: 'overlayPane' }).addTo(map);
    this.fitSouth();
    this.routes = L.layerGroup().addTo(map);
    this.sleigh = L.marker([0, 0], { icon: L.divIcon({ className: '', html: '<div class="sleigh">🛷</div>', iconSize: [30, 30], iconAnchor: [-4, 30] }), interactive: false });
    this.markers = MARKETS.map(m => {
      const k = durationKind(m), sz = DURATIONS[k].size;
      const mk = L.marker([m.lat, m.lng], { icon: L.divIcon({ className: '', html: `<div class="dot k-${k}" style="background:${col(m)};width:${sz}px;height:${sz}px"></div>`, iconSize: [sz + 4, sz + 4] }) }).addTo(map);
      mk.bindTooltip(`<b>${m.name}</b><br>${m.city} · ${m.when}<br><span class="mono" style="font-size:11px">${DURATIONS[k].label} · ${durationText(m)}</span>`, { direction: 'top', offset: [0, -8] });
      mk.baseZ = -sz * 10; mk.setZIndexOffset(mk.baseZ); // small pins sit above big ones
      mk.on('click', () => this.toggle(m));
      mk.on('mouseover', () => this.hl(m, true)); mk.on('mouseout', () => this.hl(m, false));
      return mk;
    });
    this.addFilter();
    // ?trips=2026-12-01:20,23|2026-12-06:3,5 preloads the sleigh (shareable); legacy ?stops=3,20 = one undated day
    const q = new URLSearchParams(location.search);
    const ids = str => (str || '').split(',').filter(x => MARKETS[+x]).map(x => MARKETS[+x]);
    // a link with a plan wins; otherwise restore the plan saved in this browser
    const saved = (() => { try { return localStorage.getItem(SAVE_KEY); } catch { return null; } })();
    const plan = q.get('trips') || (!q.get('stops') && saved);
    if (plan) plan.split('|').forEach(t => { const [d, st] = t.split(':'); this.newTrip(DAYS.includes(d) ? d : null, ids(st)); });
    else if (q.get('stops')) this.newTrip(null, ids(q.get('stops')));
    this.active = this.trips[0] || null; // no day card until the user adds one (or picks a market)
    this.draw();
    return this;
  },
  // duration filter + colour switch, as a map control
  kind: null, onFilter: [],
  passes(m) { return !this.kind || durationKind(m) === this.kind; },
  addFilter() {
    const ctl = L.control({ position: 'topright' });
    ctl.onAdd = () => {
      const d = L.DomUtil.create('div', 'durctl');
      L.DomEvent.disableClickPropagation(d);
      const count = k => MARKETS.filter(m => durationKind(m) === k).length;
      d.innerHTML = `<div class="chips"><b>How long?</b>
        <button data-k="" class="on">All<span class="n">${MARKETS.length}</span></button>
        ${['long', 'mid', 'short', 'weekly'].map(k => `<button data-k="${k}" title="${DURATIONS[k].detail}"><i class="sw k-${k}" style="background:${DURATIONS[k].color}"></i>${DURATIONS[k].label}<span class="n">${count(k)}</span></button>`).join('')}</div>
        <div class="sub">Pin size = how long it runs</div>`;
      d.querySelectorAll('button').forEach(b => b.onclick = () => {
        this.kind = this.kind === b.dataset.k || !b.dataset.k ? null : b.dataset.k;
        d.querySelectorAll('button').forEach(x => x.classList.toggle('on', (x.dataset.k || null) === this.kind));
        MARKETS.forEach(m => this.markers[m.id].getElement().classList.toggle('gone', !this.passes(m) && !this.isPicked(m)));
        this.onFilter.forEach(f => f());
      });
      return d;
    };
    ctl.addTo(this.map);
    const want = new URLSearchParams(location.search).get('kind');
    if (want) setTimeout(() => ctl.getContainer().querySelector(`button[data-k="${want}"]`)?.click(), 0);
  },
  // southern Ontario; the two northern markets sit just off the top edge
  fitSouth() { this.map.fitBounds(L.latLngBounds(MARKETS.filter(m => m.lat < 46).map(m => [m.lat, m.lng])), { padding: [20, 20] }); },
  pin(m) { return this.markers[m.id].getElement().firstChild; },
  dim(ids) { MARKETS.forEach(m => this.pin(m).classList.toggle('dim', ids ? !ids.has(m.id) : false)); },
  hl(m, on) { this.pin(m).classList.toggle('hl', on); this.onHl.forEach(f => f(m, on)); },
  newTrip(date, stops = []) {
    const used = this.trips.map(t => t.color);
    const color = TRIP_COLORS.find(c => !used.includes(c)) || TRIP_COLORS[this.trips.length % TRIP_COLORS.length];
    const t = { date, stops, color };
    this.trips.push(t);
    return t;
  },
  activate(t) { this.active = t; this.draw(); this.onActivate.forEach(f => f(t)); },
  addDay() {
    const taken = this.trips.map(t => t.date);
    const d = this.suggestDate(); // the brushed day, if it isn't already planned
    return this.newTrip(d && !taken.includes(d) ? d : null);
  },
  toggle(m) {
    if (!this.active) { this.active = this.addDay(); this.onActivate.forEach(f => f(this.active)); } // first market starts Day 1
    const p = this.active.stops, i = p.indexOf(m); i >= 0 ? p.splice(i, 1) : p.push(m); this.draw(); },
  isPicked(m) { return this.trips.some(t => t.stops.includes(m)); },
  tripKm(t) { let km = 0; for (let i = 1; i < t.stops.length; i++) km += haversineKm(t.stops[i - 1], t.stops[i]); return km; },
  draw() {
    // earliest date first; undated days at the end
    this.trips.sort((a, b) => (a.date || '9') < (b.date || '9') ? -1 : (a.date || '9') > (b.date || '9') ? 1 : 0);
    const A = this.active;

    // pins: numbered in the colour of their day (active day wins)
    MARKETS.forEach(m => {
      const el = this.pin(m), t = A?.stops.includes(m) ? A : this.trips.find(t => t.stops.includes(m));
      el.classList.toggle('picked', !!t); el.classList.toggle('other', !!t && t !== A);
      el.textContent = t ? t.stops.indexOf(m) + 1 : '';
      el.style.setProperty('--tc', t ? t.color : '');
      this.markers[m.id].setZIndexOffset(t ? (t === A ? 2000 : 1000) : this.markers[m.id].baseZ);
      if (t) this.markers[m.id].getElement().classList.remove('gone');
    });

    // routes: every day drawn, the active one bold
    this.routes.clearLayers();
    this.trips.forEach(t => {
      if (t.stops.length > 1) L.polyline(t.stops.map(m => [m.lat, m.lng]), { color: t.color, weight: t === A ? 4 : 2.5, opacity: t === A ? 1 : .55, dashArray: t === A ? '8 8' : '3 7', interactive: false }).addTo(this.routes);
    });
    if (A?.stops.length) this.sleigh.setLatLng([A.stops.at(-1).lat, A.stops.at(-1).lng]).addTo(this.map); else this.sleigh.remove();

    // header summary
    const all = this.trips.reduce((n, t) => n + t.stops.length, 0), km = this.trips.reduce((n, t) => n + this.tripKm(t), 0);
    document.getElementById('km').innerHTML = all
      ? `<b>${this.trips.length} day${this.trips.length > 1 ? 's' : ''}</b> · ${all} stop${all > 1 ? 's' : ''}${km ? ` · ${Math.round(km)} km as the reindeer flies` : ''}`
      : 'Empty. The reindeer are waiting.';

    // day cards
    const box = document.getElementById('trips');
    box.innerHTML = '';
    this.trips.forEach((t, ti) => {
      const card = document.createElement('div');
      card.className = 'trip' + (t === A ? ' on' : '');
      card.style.setProperty('--tc', t.color);
      const tkm = this.tripKm(t);
      card.innerHTML = `<div class="th">
          <span class="tag">Day ${ti + 1}</span>
          <input type="date" min="${SEASON_START}" max="${SEASON_END}" value="${t.date || ''}" title="Which day is this trip?">
          <span class="tkm">${[t.date && shortDay(t.date).split(',')[0], tkm && Math.round(tkm) + ' km'].filter(Boolean).join(' · ')}</span>
          <button class="del" title="Remove this day">✕</button>
        </div><ol class="tstops"></ol>`;
      const ol = card.querySelector('ol');
      if (!t.stops.length) ol.innerHTML = `<li class="empty">${t !== A ? 'No stops yet. Click this card, then add markets.'
        : !t.date ? this.pickDayHint : 'Click markets on the map or timeline to add them to this day.'}</li>`;
      t.stops.forEach(m => {
        const st = t.date ? dayStatus(m, t.date) : null;
        const warn = st === 'closed' ? `<span class="warn">⚠ not open ${shortDay(t.date)}</span>`
          : st === 'maybe' ? '<span class="warn soft">select dates: check it’s open that day</span>'
          : st === 'tbd' ? '<span class="warn soft">dates TBA</span>' : '';
        const li = document.createElement('li');
        li.innerHTML = `${m.name}<small>${m.city} · ${m.when}</small>${warn}<span class="lnk">${m.url ? `<a href="${m.url}" target="_blank" rel="noopener">🌐 website</a>` : '<span title="The source page gives no link">no site listed</span>'}<a href="${gmapsUrl(m)}" target="_blank" rel="noopener">📍 Google Maps</a></span><button class="rm" title="Remove">✕</button>`;
        li.querySelector('.rm').onclick = e => { e.stopPropagation(); t.stops.splice(t.stops.indexOf(m), 1); this.draw(); };
        li.onmouseenter = () => this.hl(m, true); li.onmouseleave = () => this.hl(m, false);
        ol.appendChild(li);
      });
      if (t.stops.length) {
        const g = document.createElement('a');
        g.className = 'groute'; g.target = '_blank'; g.rel = 'noopener';
        g.href = t.stops.length === 1 ? gmapsUrl(t.stops[0]) : routeUrl(t.stops.slice(0, 11));
        g.textContent = t.stops.length === 1 ? '📍 Open in Google Maps' : t.stops.length > 11 ? '🚗 Route in Google Maps (first 11 stops; Google’s limit)' : `🚗 Day ${ti + 1} route in Google Maps`;
        card.appendChild(g);
      }
      card.onclick = e => { if (t !== A && !e.target.closest('a, input, button')) this.activate(t); };
      card.querySelector('input').onchange = e => { t.date = DAYS.includes(e.target.value) ? e.target.value : null; this.active = t; this.draw(); this.onActivate.forEach(f => f(t)); };
      card.querySelector('.del')?.addEventListener('click', e => {
        e.stopPropagation();
        if (t.stops.length && !confirm(`Remove Day ${ti + 1} and its ${t.stops.length} stop(s)?`)) return;
        this.trips.splice(this.trips.indexOf(t), 1);
        if (this.active === t) this.active = this.trips[0] || null;
        this.draw(); this.onActivate.forEach(f => f(this.active));
      });
      box.appendChild(card);
    });
    const add = document.createElement('button');
    add.id = 'addday'; add.textContent = this.trips.length ? '+ Add another day' : '+ Add a day';
    add.onclick = () => this.activate(this.addDay());
    box.appendChild(add);

    // shareable URL
    const q = new URLSearchParams(location.search);
    q.delete('stops');
    const plan = this.trips.map(t => `${t.date || 'x'}:${t.stops.map(m => m.id).join(',')}`).join('|');
    plan ? q.set('trips', plan) : q.delete('trips');
    history.replaceState(null, '', '?' + q);
    // remember the plan in this browser (no account needed; per device)
    try { plan ? localStorage.setItem(SAVE_KEY, plan) : localStorage.removeItem(SAVE_KEY); } catch { /* storage blocked: link still works */ }
    this.onPick.forEach(f => f());
  },
};
