// Shared core for the Sleigh Route variants: header + nav, map with pins, sleigh ticket.
// A variant page provides <div id="main"> containing <div id="map">, then calls Shell.init({ title, hint }).
const C_VARIANTS = [
  ['c0-gantt.html', 'Gantt (orig)'],
  ['c-calendar.html', 'Calendar'],
  ['c1-week-strip.html', '1 · Week Strip'],
  ['c2-brush-link.html', '2 · Brush & Link'],
  ['c3-near-me.html', '3 · Near Me'],
];
const REGION_COLORS = {
  'Greater Toronto Area': '#d7263d', 'Ottawa Region': '#7b3fa0', 'York, Durham & Headwaters': '#1b7f5b',
  'Huron, Perth, Waterloo & Wellington': '#e08a00', 'Bruce, Grey & Simcoe': '#2a6fdb', 'Southwestern Ontario': '#8c5a2b',
  'Southeastern Ontario': '#0f9fa8', 'Kawarthas & Northumberland': '#c2477a', 'Niagara': '#6a8f1f', 'Northeastern Ontario': '#33415c'
};
const COLOR_MODE = new URLSearchParams(location.search).get('color') === 'region' ? 'region' : 'duration';
const col = m => COLOR_MODE === 'region' ? REGION_COLORS[m.region] : DURATIONS[durationKind(m)].color;
const DAYS = seasonDays(), N = DAYS.length, TODAY = todayIso();
const openOn = (m, d) => ['open', 'maybe'].includes(dayStatus(m, d));

function navHtml() {
  const here = location.pathname.split('/').pop();
  return '<nav>' + C_VARIANTS.map(([f, l]) => `<a href="${f}" class="${f === here ? 'on' : ''}">${l}</a>`).join('') + '</nav>';
}

const Shell = {
  picked: [], onHl: [], onPick: [],
  init({ hint = '' } = {}) {
    document.body.insertAdjacentHTML('afterbegin', `<header><h1>🛷 Sleigh Route</h1>${navHtml()}<span class="hint">${hint}</span></header>`);
    document.body.insertAdjacentHTML('beforeend', `<aside id="ticket"><div class="stub"><h2>Your sleigh</h2><div class="km" id="km"></div></div>
      <ul id="stops"></ul><div class="legend">${COLOR_MODE === 'region'
        ? Object.entries(REGION_COLORS).map(([r, c]) => `<span><i style="background:${c}"></i>${r}</span>`).join('')
        : Object.values(DURATIONS).map(d => `<span><i style="background:${d.color}"></i>${d.label} <span style="opacity:.6">(${d.detail})</span></span>`).join('')}
      <span><i style="background:repeating-linear-gradient(45deg,#999 0 2px,#fff 2px 4px)"></i>select dates</span></div></aside>`);
    const map = this.map = L.map('map');
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles © Esri — Esri, HERE, Garmin, © OpenStreetMap contributors', maxZoom: 16 }).addTo(map);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', { maxZoom: 16, pane: 'overlayPane' }).addTo(map);
    this.fitSouth();
    this.route = L.polyline([], { color: '#d7263d', weight: 3, dashArray: '8 8' }).addTo(map);
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
      const other = new URLSearchParams(location.search); other.set('color', COLOR_MODE === 'region' ? 'duration' : 'region');
      d.innerHTML = `<div class="chips"><b>How long?</b>
        <button data-k="" class="on">All ${MARKETS.length}</button>
        ${['long', 'mid', 'short', 'weekly'].map(k => `<button data-k="${k}" title="${DURATIONS[k].detail}"><i class="sw k-${k}" style="background:${DURATIONS[k].color}"></i>${DURATIONS[k].label} ${count(k)}</button>`).join('')}</div>
        <div class="sub">Pin size = how long it runs · colour by <a href="?${other}">${COLOR_MODE === 'region' ? 'duration' : 'region'}</a> instead</div>`;
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
  toggle(m) { const i = this.picked.indexOf(m); i >= 0 ? this.picked.splice(i, 1) : this.picked.push(m); this.draw(); },
  isPicked(m) { return this.picked.includes(m); },
  draw() {
    const p = this.picked;
    MARKETS.forEach(m => {
      const el = this.pin(m), k = p.indexOf(m);
      el.classList.toggle('picked', k >= 0); el.textContent = k >= 0 ? k + 1 : '';
      this.markers[m.id].setZIndexOffset(k >= 0 ? 1000 : this.markers[m.id].baseZ);
      if (k >= 0) this.markers[m.id].getElement().classList.remove('gone');
    });
    this.route.setLatLngs(p.map(m => [m.lat, m.lng]));
    if (p.length) this.sleigh.setLatLng([p.at(-1).lat, p.at(-1).lng]).addTo(this.map); else this.sleigh.remove();
    let km = 0; for (let i = 1; i < p.length; i++) km += haversineKm(p[i - 1], p[i]);
    document.getElementById('km').innerHTML = p.length > 1 ? `<b>${Math.round(km)} km</b> as the reindeer flies · ${p.length} stops`
      : p.length ? '1 stop loaded. Add another.' : 'Empty. The reindeer are waiting.';
    const ul = document.getElementById('stops');
    ul.innerHTML = p.length ? '' : '<li class="empty">Click any market (on the map or in the view below) to load it onto your sleigh.</li>';
    p.forEach(m => {
      const li = document.createElement('li');
      li.innerHTML = `${m.name}<small>${m.city} · ${m.when}</small><button title="Remove">✕</button>`;
      li.querySelector('button').onclick = () => this.toggle(m);
      li.onmouseenter = () => this.hl(m, true); li.onmouseleave = () => this.hl(m, false);
      ul.appendChild(li);
    });
    this.onPick.forEach(f => f());
  },
};
