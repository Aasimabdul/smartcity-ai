const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let cityData = {
  potholes: [
    { id: 1, lat: 13.0827, lng: 80.2707, loc: 'Anna Salai - P1', sev: 'High' },
    { id: 2, lat: 13.0850, lng: 80.2780, loc: 'Poonamallee High Rd', sev: 'Medium' }
  ],
  floodPoints: [
    { id: 1, lat: 13.0780, lng: 80.2600, level: '1.8 m', risk: 'Caution' }
  ],
  streetLightMode: 'AI Auto-Dimming (Active)',
  wasteBins: [
    { id: 101, lat: 13.0900, lng: 80.2750, capacity: '90%', alert: true }
  ],
  aqi: 82,
  pm25: '38 µg/m³'
};

app.get('/api/city-data', (req, res) => {
  cityData.aqi = Math.floor(Math.random() * 20) + 75;
  res.json(cityData);
});

app.post('/api/report-pothole', (req, res) => {
  const newEntry = {
    id: Date.now(),
    loc: 'Road Node #' + Math.floor(Math.random() * 900 + 100),
    sev: 'High',
    lat: 13.0830 + (Math.random() - 0.5) * 0.01,
    lng: 80.2700 + (Math.random() - 0.5) * 0.01
  };
  cityData.potholes.push(newEntry);
  res.json({ success: true });
});

app.post('/api/toggle-lights', (req, res) => {
  cityData.streetLightMode = cityData.streetLightMode.includes('Auto') 
    ? 'Manual: 100% Brightness' 
    : 'AI Auto-Dimming (Active)';
  res.json({ success: true, mode: cityData.streetLightMode });
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart City AI Command Center</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 md:p-6 font-sans">
  <header class="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center border-b border-slate-700 pb-4">
    <div>
      <h1 class="text-2xl md:text-3xl font-bold tracking-wide text-cyan-400">🏙️ Smart City AI Central Command</h1>
      <p class="text-slate-400 text-sm mt-1">Real-time Public Infrastructure AI Dashboard & Map</p>
    </div>
    <div class="flex items-center gap-2 mt-3 md:mt-0">
      <span class="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
      <span class="text-sm font-semibold text-emerald-400">Live AI Feed Active</span>
    </div>
  </header>

  <main class="max-w-7xl mx-auto space-y-6">
    <section class="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-xl">
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-bold text-cyan-300">🗺️ Live City GIS Incident Map</h2>
        <span class="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">🕳️ Potholes | 🌊 Flood | 🗑️ Waste</span>
      </div>
      <div id="map" class="h-72 w-full rounded-lg bg-slate-950"></div>
    </section>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <section class="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-amber-400">🕳️ AI Pothole Detection</h3>
            <span id="pothole-badge" class="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">0 Active</span>
          </div>
          <p class="text-xs text-slate-400 mb-3">AI Vision scan via traffic cameras</p>
          <div id="pothole-list" class="space-y-1 text-xs text-slate-300 font-mono mb-4 max-h-24 overflow-y-auto"></div>
        </div>
        <button onclick="reportPothole()" class="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition">
          + Trigger AI Detection
        </button>
      </section>

      <section class="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-bold text-blue-400">🌊 Flood & Drainage</h3>
          <span class="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-semibold">Hydro AI</span>
        </div>
        <p class="text-xs text-slate-400 mb-3">Water level telematics</p>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between border-b border-slate-700/60 pb-1"><span>Current Level</span><span class="font-bold text-blue-300">1.8 m</span></div>
          <div class="flex justify-between border-b border-slate-700/60 pb-1"><span>Risk Level</span><span class="font-bold text-emerald-400">Normal</span></div>
          <div class="flex justify-between"><span>Sluice Gates</span><span class="font-bold text-slate-200">Auto Balanced</span></div>
        </div>
      </section>

      <section class="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-yellow-300">💡 Street Lighting</h3>
            <span class="text-xs bg-yellow-500/20 text-yellow-200 px-2 py-0.5 rounded-full font-semibold">Adaptive</span>
          </div>
          <p class="text-xs text-slate-400 mb-3">Energy optimization grid</p>
          <div class="text-xs font-mono bg-slate-900/60 p-2.5 rounded border border-slate-700 mb-3">
            Status: <span id="light-mode-text" class="text-yellow-400 font-bold">--</span>
          </div>
        </div>
        <button onclick="toggleLights()" class="w-full py-2 bg-yellow-600/80 hover:bg-yellow-500 text-white rounded-lg text-xs font-bold transition">
          Toggle Manual / AI Mode
        </button>
      </section>

      <section class="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-bold text-emerald-400">🗑️ Waste Logistics</h3>
          <span class="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">Ultrasonic</span>
        </div>
        <p class="text-xs text-slate-400 mb-3">Bin fill capacity & routing</p>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between border-b border-slate-700/60 pb-1"><span>Bin #101 Fill</span><span class="font-bold text-amber-400">90% (Full)</span></div>
          <div class="flex justify-between border-b border-slate-700/60 pb-1"><span>Truck Route</span><span class="font-bold text-cyan-400">Dispatched</span></div>
          <div class="flex justify-between"><span>Recycle Rate</span><span class="font-bold text-emerald-400">78%</span></div>
        </div>
      </section>

      <section class="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg md:col-span-2">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-bold text-purple-400">🌫️ Air Quality & Pollution (AQI)</h3>
          <span class="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-semibold">Live Sensors</span>
        </div>
        <p class="text-xs text-slate-400 mb-3">Real-time Particulate Matter analysis</p>
        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="bg-slate-900/60 p-2.5 rounded border border-slate-700/60">
            <span class="text-xs text-slate-400">AQI</span>
            <p id="aqi-val" class="text-xl font-bold text-purple-300 mt-0.5">--</p>
          </div>
          <div class="bg-slate-900/60 p-2.5 rounded border border-slate-700/60">
            <span class="text-xs text-slate-400">PM2.5</span>
            <p id="pm25-val" class="text-xl font-bold text-cyan-300 mt-0.5">--</p>
          </div>
          <div class="bg-slate-900/60 p-2.5 rounded border border-slate-700/60">
            <span class="text-xs text-slate-400">Quality</span>
            <p class="text-xl font-bold text-emerald-400 mt-0.5">Moderate</p>
          </div>
        </div>
      </section>
    </div>
  </main>

  <script>
    let map = L.map('map').setView([13.0827, 80.2707], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    let markers = [];

    async function loadData() {
      const res = await fetch('/api/city-data');
      const data = await res.json();

      document.getElementById('pothole-badge').innerText = data.potholes.length + ' Active';
      document.getElementById('pothole-list').innerHTML = data.potholes.map(p => '<div>• ' + p.loc + ' (' + p.sev + ')</div>').join('');
      document.getElementById('light-mode-text').innerText = data.streetLightMode;
      document.getElementById('aqi-val').innerText = data.aqi;
      document.getElementById('pm25-val').innerText = data.pm25;

      markers.forEach(m => map.removeLayer(m));
      markers = [];

      data.potholes.forEach(p => {
        const m = L.marker([p.lat, p.lng]).addTo(map).bindPopup('<b>🕳️ Pothole</b><br>' + p.loc);
        markers.push(m);
      });

      data.floodPoints.forEach(f => {
        const m = L.circle([f.lat, f.lng], { color: 'blue', radius: 150 }).addTo(map).bindPopup('<b>🌊 Flood Sensor</b><br>Level: ' + f.level);
        markers.push(m);
      });

      data.wasteBins.forEach(b => {
        const m = L.marker([b.lat, b.lng]).addTo(map).bindPopup('<b>🗑️ Waste Bin #' + b.id + '</b><br>Capacity: ' + b.capacity);
        markers.push(m);
      });
    }

    async function reportPothole() {
      await fetch('/api/report-pothole', { method: 'POST' });
      loadData();
    }

    async function toggleLights() {
      await fetch('/api/toggle-lights', { method: 'POST' });
      loadData();
    }

    loadData();
    setInterval(loadData, 5000);
  </script>
</body>
</html>`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Smart City server active on port ' + PORT);
});
