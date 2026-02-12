/* Gordon Dashboard — Chart.js Wrappers */
const COLORS = {
  gold: '#d4af37', green: '#00c853', red: '#ff1744', blue: '#448aff',
  text: '#e0e0e0', dim: '#888', bg: '#0a0a1a', card: '#1a1a2e',
  gridLine: 'rgba(255,255,255,0.06)',
};

const defaultScales = {
  x: { ticks: { color: COLORS.dim, font: { size: 11 } }, grid: { color: COLORS.gridLine } },
  y: { ticks: { color: COLORS.dim, font: { size: 11 } }, grid: { color: COLORS.gridLine } },
};

const defaultPlugins = {
  legend: { labels: { color: COLORS.text, font: { size: 12 }, boxWidth: 12, padding: 16 } },
  tooltip: { backgroundColor: '#1a1a2eee', titleColor: COLORS.gold, bodyColor: COLORS.text, borderColor: COLORS.gold, borderWidth: 1, cornerRadius: 8, padding: 10 },
};

function sentimentColor(v) {
  if (v < -0.3) return COLORS.red;
  if (v > 0.3) return COLORS.green;
  return COLORS.gold;
}

function renderGauge(elementId, value, min, max, label) {
  const ctx = document.getElementById(elementId);
  if (!ctx) return null;
  const norm = (value - min) / (max - min);
  const color = sentimentColor(value);
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [norm, 1 - norm],
        backgroundColor: [color, 'rgba(255,255,255,0.05)'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: true, aspectRatio: 2, cutout: '75%',
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
    }
  });
}

function renderLineChart(elementId, labels, datasets, options = {}) {
  const ctx = document.getElementById(elementId);
  if (!ctx) return null;
  const ds = datasets.map((d, i) => ({
    label: d.label || `Series ${i+1}`,
    data: d.data,
    borderColor: d.color || [COLORS.gold, COLORS.blue, COLORS.green, COLORS.red][i % 4],
    backgroundColor: (d.color || COLORS.gold) + '15',
    borderWidth: 2, tension: 0.3, fill: d.fill || false, pointRadius: d.pointRadius ?? 2,
    pointBackgroundColor: d.color || COLORS.gold,
  }));
  return new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: ds },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: defaultScales, plugins: defaultPlugins, ...options,
    }
  });
}

function renderBarChart(elementId, labels, data, options = {}) {
  const ctx = document.getElementById(elementId);
  if (!ctx) return null;
  const colors = data.map(v => v >= 0 ? COLORS.green : COLORS.red);
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data, backgroundColor: options.colors || colors, borderRadius: 4, borderSkipped: false }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: defaultScales, plugins: { ...defaultPlugins, legend: { display: false } }, ...options,
    }
  });
}

function renderDoughnut(elementId, labels, data) {
  const ctx = document.getElementById(elementId);
  if (!ctx) return null;
  const palette = [COLORS.gold, COLORS.blue, COLORS.green, COLORS.red, '#9c27b0', '#ff9800'];
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: palette.slice(0, labels.length), borderWidth: 0 }]
    },
    options: {
      responsive: true, cutout: '65%',
      plugins: defaultPlugins,
    }
  });
}

function renderScatter(elementId, data) {
  const ctx = document.getElementById(elementId);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        data,
        backgroundColor: data.map(p => p.y >= 0 ? COLORS.green + '99' : COLORS.red + '99'),
        pointRadius: 6, pointHoverRadius: 8,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Conviction', color: COLORS.dim }, ticks: { color: COLORS.dim }, grid: { color: COLORS.gridLine } },
        y: { title: { display: true, text: 'Return %', color: COLORS.dim }, ticks: { color: COLORS.dim }, grid: { color: COLORS.gridLine } },
      },
      plugins: { ...defaultPlugins, legend: { display: false } },
    }
  });
}

/* HELPERS */
function fmt$(v) {
  if (v == null) return '—';
  const abs = Math.abs(v);
  const s = abs >= 1000 ? abs.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}) : abs.toFixed(2);
  return (v < 0 ? '-$' : '$') + s;
}
function fmtPct(v) { return v == null ? '—' : (v >= 0 ? '+' : '') + v.toFixed(2) + '%'; }
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function pnlClass(v) { return v > 0 ? 'positive' : v < 0 ? 'negative' : 'neutral'; }
function stratBadge(s) { return `<span class="badge badge-${s.toLowerCase()}">${s}</span>`; }
function dirBadge(d) { return `<span class="badge badge-${d.toLowerCase()}">${d}</span>`; }
function convictionBar(v) {
  const color = v >= 0.7 ? COLORS.green : v >= 0.5 ? COLORS.gold : COLORS.red;
  return `<div class="conviction-bar"><div class="conviction-fill" style="width:${v*100}%;background:${color}"></div></div>`;
}
