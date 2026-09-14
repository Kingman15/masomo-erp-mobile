// Carte du portail parent : embarquée en WebView + Leaflet/OSM plutôt qu'en
// react-native-maps (Google Maps), pour ne dépendre d'aucune clé API/facturation
// côté Android — même logique que la carte Leaflet du web (voir
// web/src/pages/portal/transport/maps/index.tsx), reconstituée en JS impératif
// puisqu'aucune librairie React n'est disponible à l'intérieur de la WebView.

export interface TransportMapStop {
  id: string;
  lat: number;
  lng: number;
  name: string;
  color: string;
  directions: string[];
}

export interface TransportMapLine {
  id: string;
  name: string;
  color: string;
  points: [number, number][];
}

export interface TransportMapPayload {
  school: { lat: number; lng: number } | null;
  stops: TransportMapStop[];
  lines: TransportMapLine[];
}

// Icônes reprises telles quelles du web (lucide `School` / `Crosshair`) pour
// garder le même rendu visuel.
const SCHOOL_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 6 8-4 8 4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M14 22v-4a2 2 0 0 0-4 0v4"/><path d="M18 5v17"/><path d="M6 5v17"/><circle cx="12" cy="9" r="2"/></svg>`;

const RECENTER_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/><circle cx="12" cy="12" r="10"/></svg>`;

export function buildTransportMapHtml(payload: TransportMapPayload): string {
  // Échappe "</script>" pour ne pas fermer prématurément le tag contenant le JSON.
  const dataJson = JSON.stringify(payload).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; }
  .legend { position: absolute; top: 10px; left: 10px; z-index: 1000; background: rgba(255,255,255,0.95); border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 12px; font: 500 11px -apple-system, Roboto, sans-serif; max-width: 70%; }
  .legend-row { display: flex; align-items: center; gap: 6px; margin: 3px 0; }
  .legend-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
  .recenter-btn { position: absolute; bottom: 16px; right: 10px; z-index: 1000; width: 40px; height: 40px; border-radius: 20px; background: #fff; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; }
  .school-icon { width: 32px; height: 32px; border-radius: 50%; background: #1d4ed8; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; }
  .stop-tooltip { text-align: center; font: 500 11px -apple-system, Roboto, sans-serif; }
  .stop-tooltip .sub { font-size: 9px; color: #6b7280; font-weight: 400; margin-top: 1px; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<script>
(function () {
  var DATA = ${dataJson};

  var map = L.map('map', { attributionControl: false }).setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    subdomains: 'abc',
    maxZoom: 19,
  }).addTo(map);

  var fitPoints = [];
  var recenterPos = null;

  if (DATA.school) {
    var schoolIcon = L.divIcon({
      className: '',
      html: '<div class="school-icon">${SCHOOL_ICON_SVG}</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    L.marker([DATA.school.lat, DATA.school.lng], { icon: schoolIcon })
      .addTo(map)
      .bindTooltip('École', { permanent: true, direction: 'top', offset: [0, -18] });
    fitPoints.push([DATA.school.lat, DATA.school.lng]);
  }

  DATA.lines.forEach(function (line) {
    if (line.points.length > 1) {
      L.polyline(line.points, { color: line.color, weight: 4, opacity: 0.85 }).addTo(map);
      line.points.forEach(function (p) { fitPoints.push(p); });
    }
  });

  DATA.stops.forEach(function (stop, index) {
    L.circleMarker([stop.lat, stop.lng], {
      radius: 11,
      fillColor: stop.color,
      fillOpacity: 1,
      color: '#fff',
      weight: 3,
    }).addTo(map).bindTooltip(
      '<div class="stop-tooltip">' + stop.name +
        (stop.directions.length > 1 ? '<div class="sub">' + stop.directions.join(' · ') + '</div>' : '') +
        '</div>',
      { permanent: true, direction: 'top', offset: [0, -12] },
    );

    fitPoints.push([stop.lat, stop.lng]);
    if (index === 0) recenterPos = [stop.lat, stop.lng];
  });

  if (!recenterPos && DATA.school) recenterPos = [DATA.school.lat, DATA.school.lng];

  if (fitPoints.length === 1) {
    map.setView(fitPoints[0], 15);
  } else if (fitPoints.length > 1) {
    map.fitBounds(L.latLngBounds(fitPoints), { padding: [40, 40] });
  }

  if (DATA.lines.length > 0) {
    var legend = document.createElement('div');
    legend.className = 'legend';
    DATA.lines.forEach(function (line) {
      var row = document.createElement('div');
      row.className = 'legend-row';
      row.innerHTML = '<span class="legend-dot" style="background:' + line.color + '"></span><span>' + line.name + '</span>';
      legend.appendChild(row);
    });
    document.body.appendChild(legend);
  }

  if (recenterPos) {
    var btn = document.createElement('div');
    btn.className = 'recenter-btn';
    btn.innerHTML = '${RECENTER_ICON_SVG}';
    btn.addEventListener('click', function () {
      map.flyTo(recenterPos, 16, { duration: 1 });
    });
    document.body.appendChild(btn);
  }
})();
</script>
</body>
</html>`;
}
