// ═══════════════════════════════════════════════════════
// UNISBA VIRTUAL MARKET — CORE ENGINE
// script.js
// ═══════════════════════════════════════════════════════

'use strict';

// ─── STOCKS DATA ───────────────────────────────────────
const STOCKS = [
  { id: 'EKOP', name: 'Ekonomi Pembangunan', faculty: 'FEB',    basePrice: 8500,  color: '#D4AF37', bg: 'rgba(212,175,55,0.12)'  },
  { id: 'MNJM', name: 'Manajemen',           faculty: 'FEB',    basePrice: 12000, color: '#00E5FF', bg: 'rgba(0,229,255,0.1)'    },
  { id: 'AKNT', name: 'Akuntansi',           faculty: 'FEB',    basePrice: 10500, color: '#3D7EFF', bg: 'rgba(61,126,255,0.12)'  },
  { id: 'HUKM', name: 'Hukum',               faculty: 'FH',     basePrice: 9800,  color: '#E040FB', bg: 'rgba(224,64,251,0.1)'   },
  { id: 'TKSP', name: 'Teknik Sipil',        faculty: 'FT',     basePrice: 7600,  color: '#FF6D00', bg: 'rgba(255,109,0,0.1)'    },
  { id: 'TKIN', name: 'Teknik Industri',     faculty: 'FT',     basePrice: 8200,  color: '#00E676', bg: 'rgba(0,230,118,0.1)'    },
  { id: 'PSIK', name: 'Psikologi',           faculty: 'FPSI',   basePrice: 11000, color: '#FF4081', bg: 'rgba(255,64,129,0.1)'   },
  { id: 'KDOK', name: 'Kedokteran',          faculty: 'FK',     basePrice: 25000, color: '#69F0AE', bg: 'rgba(105,240,174,0.1)'  },
  { id: 'FARM', name: 'Farmasi',             faculty: 'FFAR',   basePrice: 18000, color: '#40C4FF', bg: 'rgba(64,196,255,0.1)'   },
  { id: 'KOMM', name: 'Komunikasi',          faculty: 'FKOM',   basePrice: 7200,  color: '#FFAB40', bg: 'rgba(255,171,64,0.1)'   },
  { id: 'PDDK', name: 'Pendidikan Islam',    faculty: 'FPAI',   basePrice: 6500,  color: '#B2FF59', bg: 'rgba(178,255,89,0.1)'   },
  { id: 'MTEK', name: 'Mesin & Elektro',     faculty: 'FT',     basePrice: 8800,  color: '#EA80FC', bg: 'rgba(234,128,252,0.1)'  },
];

// ─── NEWS EVENTS ───────────────────────────────────────
const NEWS_POOL = [
  { text: 'Mahasiswa Ekonomi Pembangunan raih juara 1 LKTI Nasional!',    stock: 'EKOP', impact:  0.06, type: 'bullish' },
  { text: 'Akuntansi UNISBA raih predikat akreditasi UNGGUL dari BAN-PT', stock: 'AKNT', impact:  0.08, type: 'bullish' },
  { text: 'Kedokteran UNISBA buka program beasiswa penuh untuk 2025',     stock: 'KDOK', impact:  0.05, type: 'bullish' },
  { text: 'Mahasiswa Teknik Sipil menangkan kompetisi desain jembatan',    stock: 'TKSP', impact:  0.07, type: 'bullish' },
  { text: 'Farmasi UNISBA luncurkan laboratorium riset terbaru',          stock: 'FARM', impact:  0.09, type: 'bullish' },
  { text: 'Psikologi UNISBA jalin kerjasama dengan Google Indonesia',      stock: 'PSIK', impact:  0.10, type: 'bullish' },
  { text: 'Komunikasi UNISBA dituduh plagiarisme karya tulis dosen',       stock: 'KOMM', impact: -0.07, type: 'bearish' },
  { text: 'Jumlah mahasiswa baru Hukum turun 15% tahun ini',              stock: 'HUKM', impact: -0.05, type: 'bearish' },
  { text: 'Isu keuangan kampus pengaruhi operasional beberapa prodi',     stock: null,   impact: -0.03, type: 'bearish' },
  { text: 'UNISBA masuk TOP 10 PTS terbaik versi Webometrics 2025!',      stock: null,   impact:  0.04, type: 'bullish' },
  { text: 'Teknik Industri UNISBA jalin MoU dengan perusahaan Fortune 500', stock: 'TKIN', impact: 0.12, type: 'bullish' },
  { text: 'Manajemen UNISBA juara 1 lomba bisnis plan nasional',          stock: 'MNJM', impact:  0.08, type: 'bullish' },
  { text: 'Prodi Mesin & Elektro terima hibah Rp 2 miliar dari BRIN',     stock: 'MTEK', impact:  0.11, type: 'bullish' },
  { text: 'Penerimaan mahasiswa baru diperpanjang — sinyal demand lemah', stock: null,   impact: -0.02, type: 'bearish' },
  { text: 'BEM UNISBA umumkan festival akademik terbesar sepanjang sejarah', stock: null, impact: 0.02, type: 'neutral' },
  { text: 'Pendidikan Islam UNISBA terima kunjungan delegasi dari Timur Tengah', stock: 'PDDK', impact: 0.06, type: 'bullish' },
];

// ─── CONSTANTS ─────────────────────────────────────────
const INITIAL_BALANCE  = 10_000_000; // Rp 10 juta
const PRICE_UPDATE_MS  = 3000;
const NEWS_INTERVAL_MS = 15000;
const CHART_POINTS     = 60;

// ─── STATE ─────────────────────────────────────────────
let state = {
  user: null,
  balance: INITIAL_BALANCE,
  holdings: {},          // { stockId: { qty, avgPrice } }
  transactions: [],
  prices: {},            // { stockId: currentPrice }
  priceHistory: {},      // { stockId: [prices] }
  activeStock: STOCKS[0].id,
  activeTab: 'trade',
  tradeSide: 'buy',
  chart: null,
  chartData: {},
  pendingNewsImpact: {}, // stockId → multiplier to apply
  recentNews: [],
  leaderboard: [],
  zoomLevel: 1,          // 1 = default, 2 = 2× zoom in, 0.5 = zoom out
  panelLeft: true,       // stock list visible
  panelRight: true,      // trade panel visible
};

// ─── HELPERS ───────────────────────────────────────────
const fmt = {
  rp:   v => 'Rp ' + Math.round(v).toLocaleString('id-ID'),
  pct:  v => (v >= 0 ? '+' : '') + v.toFixed(2) + '%',
  qty:  v => v.toLocaleString('id-ID'),
  mono: v => v.toFixed(0),
};

function lerp(a, b, t) { return a + (b - a) * t; }

function randomWalk(price, volatility = 0.012) {
  const change = (Math.random() - 0.495) * volatility * price;
  return Math.max(100, price + change);
}

function getStock(id) { return STOCKS.find(s => s.id === id); }

function totalPortfolioValue() {
  return Object.entries(state.holdings).reduce((sum, [id, h]) => {
    return sum + (h.qty * (state.prices[id] || 0));
  }, 0);
}

function totalAssets() {
  return state.balance + totalPortfolioValue();
}

function pnl(id) {
  const h = state.holdings[id];
  if (!h || !h.qty) return 0;
  return (state.prices[id] - h.avgPrice) * h.qty;
}

// ─── INIT PRICES ───────────────────────────────────────
function initPrices() {
  STOCKS.forEach(s => {
    const hist = [];
    let p = s.basePrice;
    for (let i = 0; i < CHART_POINTS; i++) {
      p = randomWalk(p, 0.008);
      hist.push(parseFloat(p.toFixed(0)));
    }
    state.prices[s.id]       = hist[hist.length - 1];
    state.priceHistory[s.id] = hist;
  });
}

// ─── PRICE ENGINE ──────────────────────────────────────
function tickPrices() {
  const changes = {};
  STOCKS.forEach(s => {
    const oldPrice = state.prices[s.id];
    let impact = 1;
    if (state.pendingNewsImpact[s.id]) {
      impact += state.pendingNewsImpact[s.id];
      delete state.pendingNewsImpact[s.id];
    }
    const newPrice = randomWalk(oldPrice * impact, 0.013);
    changes[s.id] = { old: oldPrice, new: newPrice };
    state.prices[s.id] = newPrice;
    state.priceHistory[s.id].push(parseFloat(newPrice.toFixed(0)));
    if (state.priceHistory[s.id].length > CHART_POINTS * 3)
      state.priceHistory[s.id].shift();
  });
  return changes;
}

// ─── NEWS ENGINE ───────────────────────────────────────
function fireNews() {
  const item = NEWS_POOL[Math.floor(Math.random() * NEWS_POOL.length)];
  const ts   = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  state.recentNews.unshift({ ...item, ts });
  if (state.recentNews.length > 20) state.recentNews.pop();

  if (item.impact !== 0) {
    if (item.stock) {
      state.pendingNewsImpact[item.stock] = item.impact;
    } else {
      // Market-wide news — affects all stocks lightly
      STOCKS.forEach(s => {
        state.pendingNewsImpact[s.id] = (state.pendingNewsImpact[s.id] || 0) + item.impact * 0.4;
      });
    }
  }

  renderNewsTicker();
  renderNewsPanel();

  showToast(
    item.type === 'bullish' ? '📈 Berita Pasar' : item.type === 'bearish' ? '📉 Berita Pasar' : '📰 Berita',
    item.text,
    item.type === 'bullish' ? 'success' : item.type === 'bearish' ? 'error' : 'info'
  );
}

// ═══════════════════════════════════════════════════════
// RENDER FUNCTIONS
// ═══════════════════════════════════════════════════════

// ─── Stock List ────────────────────────────────────────
function renderStockList(filter = '') {
  const container = document.getElementById('stock-list-items');
  if (!container) return;

  const q = filter.toLowerCase();
  const filtered = STOCKS.filter(s =>
    s.id.toLowerCase().includes(q) ||
    s.name.toLowerCase().includes(q) ||
    s.faculty.toLowerCase().includes(q)
  );

  container.innerHTML = filtered.map(s => {
    const price = state.prices[s.id] || s.basePrice;
    const hist  = state.priceHistory[s.id] || [];
    const first = hist[Math.max(0, hist.length - 20)] || price;
    const chg   = ((price - first) / first) * 100;
    const active = s.id === state.activeStock ? ' active' : '';

    return `
      <div class="stock-item${active}" onclick="selectStock('${s.id}')">
        <div class="stock-icon" style="background:${s.bg};color:${s.color}">${s.id.slice(0,2)}</div>
        <div class="stock-info">
          <div class="stock-ticker">${s.id}</div>
          <div class="stock-name">${s.name}</div>
        </div>
        <div class="stock-price-wrap">
          <div class="stock-price">${fmt.rp(price)}</div>
          <div class="stock-change ${chg >= 0 ? 'up' : 'down'}">${fmt.pct(chg)}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ─── Ticker tape ───────────────────────────────────────
function renderTicker() {
  const tracks = document.querySelectorAll('.ticker-track');
  if (!tracks.length) return;

  const items = STOCKS.map(s => {
    const price = state.prices[s.id] || s.basePrice;
    const hist  = state.priceHistory[s.id] || [];
    const first = hist[Math.max(0, hist.length - 20)] || price;
    const chg   = ((price - first) / first) * 100;
    return `
      <span class="ticker-item">
        <span class="ticker-name">${s.id}</span>
        <span class="ticker-price">${fmt.rp(price)}</span>
        <span class="ticker-change ${chg >= 0 ? 'up' : 'down'}">${fmt.pct(chg)}</span>
      </span>
      <span class="ticker-dot"></span>
    `;
  }).join('');

  tracks.forEach(t => t.innerHTML = items + items); // double for infinite scroll
}

// ─── Zoom & Panel Controls ──────────────────────────────
const ZOOM_STEPS  = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];
const ZOOM_LABELS = ['¼×', '½×', '¾×', '1×', '1.5×', '2×', '3×', '4×'];

function getZoomedHistory() {
  const hist = state.priceHistory[state.activeStock] || [];
  const idx  = ZOOM_STEPS.indexOf(state.zoomLevel);
  const zv   = ZOOM_STEPS[Math.max(0, idx)];
  // zoomLevel > 1 → fewer points (more detail), < 1 → more points (wider view)
  const points = Math.max(10, Math.round(CHART_POINTS / zv));
  return hist.slice(-Math.min(points, hist.length));
}

function applyZoom(delta) {
  const idx     = ZOOM_STEPS.indexOf(state.zoomLevel);
  const newIdx  = Math.max(0, Math.min(ZOOM_STEPS.length - 1, idx + delta));
  state.zoomLevel = ZOOM_STEPS[newIdx];
  const label   = document.getElementById('zoom-label');
  if (label) label.textContent = ZOOM_LABELS[newIdx];
  // Update chart with new window
  if (state.chart) {
    const hist = getZoomedHistory();
    state.chart.data.labels   = hist.map((_, i) => i);
    state.chart.data.datasets[0].data = [...hist];
    state.chart.update('none');
  }
}

function resetZoom() {
  state.zoomLevel = 1;
  const label = document.getElementById('zoom-label');
  if (label) label.textContent = '1×';
  if (state.chart) {
    const hist = getZoomedHistory();
    state.chart.data.labels   = hist.map((_, i) => i);
    state.chart.data.datasets[0].data = [...hist];
    state.chart.update('none');
  }
}

function togglePanel(side) {
  const tradingView = document.querySelector('.trading-view');
  if (!tradingView) return;

  if (side === 'left') {
    state.panelLeft = !state.panelLeft;
    tradingView.classList.toggle('left-collapsed', !state.panelLeft);
    const btn = document.getElementById('toggle-stock-list');
    if (btn) btn.classList.toggle('active', state.panelLeft);
  } else {
    state.panelRight = !state.panelRight;
    tradingView.classList.toggle('right-collapsed', !state.panelRight);
    const btn = document.getElementById('toggle-trade-panel');
    if (btn) btn.classList.toggle('active', state.panelRight);
  }
  // Resize chart after panel animation
  setTimeout(() => { if (state.chart) state.chart.resize(); }, 320);
}

// ─── Chart ─────────────────────────────────────────────
function initChart() {
  const canvas = document.getElementById('main-chart');
  if (!canvas || !window.Chart) return;

  if (state.chart) state.chart.destroy();

  const s    = getStock(state.activeStock);
  const hist = getZoomedHistory();
  const labels = hist.map((_, i) => i);
  const isUp = hist[hist.length - 1] >= hist[0];
  const col  = isUp ? getComputedStyle(document.documentElement).getPropertyValue('--green').trim() : '#FF3D71';

  state.chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: state.activeStock,
        data: hist,
        borderColor: col,
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        backgroundColor: ctx => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
          gradient.addColorStop(0, isUp ? 'rgba(0,230,118,0.15)' : 'rgba(255,61,113,0.15)');
          gradient.addColorStop(1, 'rgba(0,0,0,0)');
          return gradient;
        },
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400, easing: 'easeOutQuart' },
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(8,13,26,0.95)',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          titleColor: '#8892A4',
          bodyColor: '#F0F4FF',
          callbacks: {
            title: items => 'T-' + (hist.length - 1 - items[0].dataIndex),
            label: item  => '  ' + fmt.rp(item.raw),
          }
        },
      },
      scales: {
        x: {
          display: false,
          grid: { display: false },
        },
        y: {
          position: 'right',
          grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
          ticks: {
            color: '#3D4A60',
            font: { family: 'JetBrains Mono', size: 10 },
            callback: v => fmt.rp(v),
            maxTicksLimit: 5,
          },
        }
      }
    }
  });
}

function updateChartData() {
  if (!state.chart) return;
  const hist   = getZoomedHistory();
  const isUp   = hist[hist.length - 1] >= hist[0];
  const col    = isUp ? '#00E676' : '#FF3D71';
  const ds     = state.chart.data.datasets[0];
  ds.data      = [...hist];
  ds.borderColor = col;
  state.chart.data.labels = hist.map((_, i) => i);

  // Update fill gradient
  ds.backgroundColor = ctx => {
    const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
    gradient.addColorStop(0, isUp ? 'rgba(0,230,118,0.15)' : 'rgba(255,61,113,0.15)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    return gradient;
  };

  state.chart.update('none');
}

// ─── Chart Header ──────────────────────────────────────
function renderChartHeader() {
  const s     = getStock(state.activeStock);
  const price = state.prices[state.activeStock] || s.basePrice;
  const hist  = state.priceHistory[state.activeStock] || [];
  const open  = hist[Math.max(0, hist.length - 20)] || price;
  const chg   = ((price - open) / open) * 100;
  const hi    = Math.max(...hist.slice(-20));
  const lo    = Math.min(...hist.slice(-20));

  const iconEl = document.getElementById('chart-symbol-icon');
  const nameEl = document.getElementById('chart-symbol-name');
  const fullEl = document.getElementById('chart-symbol-full');
  const priceEl = document.getElementById('chart-current-price');
  const chgEl   = document.getElementById('chart-price-change');
  const hiEl    = document.getElementById('chart-stat-hi');
  const loEl    = document.getElementById('chart-stat-lo');

  if (iconEl) {
    iconEl.textContent   = s.id.slice(0, 2);
    iconEl.style.background = s.bg;
    iconEl.style.color   = s.color;
  }
  if (nameEl) nameEl.textContent = s.id;
  if (fullEl) fullEl.textContent = s.name + ' · ' + s.faculty;

  if (priceEl) {
    const wasUp = priceEl.dataset.last && price > parseFloat(priceEl.dataset.last);
    const wasDown = priceEl.dataset.last && price < parseFloat(priceEl.dataset.last);
    priceEl.textContent = fmt.rp(price);
    priceEl.dataset.last = price;
    if (wasUp)   priceEl.classList.add('text-green');
    if (wasDown) priceEl.classList.add('text-red');
    setTimeout(() => { priceEl.classList.remove('text-green', 'text-red'); }, 600);
  }

  if (chgEl) {
    chgEl.textContent  = fmt.pct(chg) + ' (' + fmt.rp(price - open) + ')';
    chgEl.className    = 'chart-price-change ' + (chg >= 0 ? 'up' : 'down');
  }

  if (hiEl) hiEl.textContent = fmt.rp(hi);
  if (loEl) loEl.textContent = fmt.rp(lo);
}

// ─── Trade Panel ───────────────────────────────────────
function renderTradePanel() {
  const s      = getStock(state.activeStock);
  const price  = state.prices[state.activeStock] || s.basePrice;
  const h      = state.holdings[state.activeStock];
  const qty    = h ? h.qty : 0;

  const balEl  = document.getElementById('trade-balance');
  const ownEl  = document.getElementById('trade-owned');
  const priceEl = document.getElementById('trade-unit-price');

  if (balEl)   balEl.textContent = fmt.rp(state.balance);
  if (ownEl)   ownEl.textContent = qty + ' lembar';
  if (priceEl) priceEl.textContent = fmt.rp(price);

  recalcTradeTotal();
}

function recalcTradeTotal() {
  const qtyEl   = document.getElementById('trade-qty-input');
  const totalEl = document.getElementById('trade-total-value');
  if (!qtyEl || !totalEl) return;

  const qty   = parseFloat(qtyEl.value) || 0;
  const price = state.prices[state.activeStock] || 0;
  const total = qty * price;

  totalEl.textContent = fmt.rp(total);
}

// ─── User Balance in Topbar ────────────────────────────
function renderTopbarBalance() {
  const el = document.getElementById('topbar-balance');
  if (el) el.textContent = fmt.rp(totalAssets());
}

// ─── Holdings Mini in Trade Panel ──────────────────────
function renderHoldingsMini() {
  const container = document.getElementById('holdings-mini-list');
  if (!container) return;

  const entries = Object.entries(state.holdings).filter(([_, h]) => h.qty > 0);
  if (!entries.length) {
    container.innerHTML = '<div style="color:var(--text-muted);font-size:11px;padding:4px 0;">Belum ada kepemilikan saham.</div>';
    return;
  }

  container.innerHTML = entries.map(([id, h]) => {
    const price  = state.prices[id] || 0;
    const p      = (price - h.avgPrice) * h.qty;
    const pctStr = fmt.pct(((price - h.avgPrice) / h.avgPrice) * 100);
    return `
      <div class="holding-row">
        <div>
          <div class="holding-ticker">${id}</div>
          <div class="holding-qty">${fmt.qty(h.qty)} lbr</div>
        </div>
        <div class="holding-pnl ${p >= 0 ? 'profit' : 'loss'}">
          ${p >= 0 ? '+' : ''}${fmt.rp(p)}<br>
          <span style="font-size:9px">${pctStr}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ─── Portfolio View ─────────────────────────────────────
function renderPortfolio() {
  const totalVal = totalPortfolioValue();
  const total    = totalAssets();
  const pnlAbs   = total - INITIAL_BALANCE;
  const pnlPct   = ((total - INITIAL_BALANCE) / INITIAL_BALANCE) * 100;

  setEl('port-balance',   fmt.rp(state.balance));
  setEl('port-portfolio', fmt.rp(totalVal));
  setEl('port-total',     fmt.rp(total));

  const pnlEl = document.getElementById('port-pnl');
  if (pnlEl) {
    pnlEl.textContent = (pnlAbs >= 0 ? '+' : '') + fmt.rp(pnlAbs) + ' (' + fmt.pct(pnlPct) + ')';
    pnlEl.className   = 'summary-card-pnl ' + (pnlAbs >= 0 ? 'profit' : 'loss');
  }

  // Holdings table
  const holdingsBody = document.getElementById('holdings-table-body');
  if (holdingsBody) {
    const entries = Object.entries(state.holdings).filter(([_, h]) => h.qty > 0);
    if (!entries.length) {
      holdingsBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:24px">Belum ada kepemilikan saham.</td></tr>';
    } else {
      holdingsBody.innerHTML = entries.map(([id, h]) => {
        const s      = getStock(id);
        const price  = state.prices[id] || 0;
        const val    = price * h.qty;
        const p      = (price - h.avgPrice) * h.qty;
        const pPct   = ((price - h.avgPrice) / h.avgPrice) * 100;
        return `
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:10px;font-weight:700;background:${s.bg};color:${s.color}">${id.slice(0,2)}</div>
                <div>
                  <div class="mono" style="font-size:12px;font-weight:600">${id}</div>
                  <div class="muted">${s.name}</div>
                </div>
              </div>
            </td>
            <td class="mono">${fmt.qty(h.qty)}</td>
            <td class="mono">${fmt.rp(h.avgPrice)}</td>
            <td class="mono">${fmt.rp(price)}</td>
            <td class="mono">${fmt.rp(val)}</td>
            <td class="${p >= 0 ? 'profit' : 'loss'}">${p >= 0 ? '+' : ''}${fmt.rp(p)}<br><span style="font-size:10px">${fmt.pct(pPct)}</span></td>
            <td>
              <button class="btn btn-cyan" style="padding:5px 12px;font-size:11px" onclick="quickTrade('${id}')">Trade</button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Transactions table
  const txBody = document.getElementById('tx-table-body');
  if (txBody) {
    if (!state.transactions.length) {
      txBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px">Belum ada transaksi.</td></tr>';
    } else {
      txBody.innerHTML = [...state.transactions].reverse().slice(0, 50).map(tx => `
        <tr>
          <td class="muted">${tx.ts}</td>
          <td><span class="tx-badge ${tx.type}">${tx.type.toUpperCase()}</span></td>
          <td class="mono" style="font-size:11px">${tx.stock}</td>
          <td class="mono">${fmt.qty(tx.qty)}</td>
          <td class="mono">${fmt.rp(tx.price)}</td>
          <td class="mono" style="color:var(--gold)">${fmt.rp(tx.total)}</td>
        </tr>
      `).join('');
    }
  }
}

// ─── News Panel ────────────────────────────────────────
function renderNewsPanel() {
  const container = document.getElementById('news-panel-items');
  if (!container) return;

  if (!state.recentNews.length) {
    container.innerHTML = '<div style="color:var(--text-muted);font-size:11px;">Menunggu berita terbaru...</div>';
    return;
  }

  container.innerHTML = state.recentNews.slice(0, 8).map(n => `
    <div class="news-item">
      <span class="news-item-tag ${n.type}">${n.type}</span>
      <div class="news-item-text">${n.text}</div>
      <div class="news-item-time">${n.ts}</div>
    </div>
  `).join('');
}

function renderNewsTicker() {
  const el = document.getElementById('news-ticker');
  if (!el || !state.recentNews.length) return;
  el.textContent = state.recentNews.map(n => n.text).join('   ·   ');
}

// ─── Leaderboard ───────────────────────────────────────
// DEMO_USERS_LB removed — leaderboard now only shows real Firebase users or current user

const AVATAR_COLORS = [
  '#D4AF37','#00E5FF','#3D7EFF','#E040FB','#FF6D00',
  '#00E676','#FF4081','#69F0AE','#FFAB40','#EA80FC',
];

function colorFromUid(uid) {
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) & 0xFFFFFF;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function buildLeaderboardUI(allUsers) {
  // Podium (top 3)
  const podium = document.getElementById('leaderboard-podium');
  if (podium) {
    const top3 = allUsers.slice(0, 3);
    const arranged = [top3[1], top3[0], top3[2]].filter(Boolean);
    const rankClass = ['rank-2', 'rank-1', 'rank-3'];
    const rankNums  = [2, 1, 3];

    podium.innerHTML = arranged.map((u, i) => {
      const pnl = u.totalAssets - INITIAL_BALANCE;
      return `
        <div class="podium-card ${rankClass[i]} ${u.isMe ? 'is-me' : ''}">
          <div class="podium-rank">${rankNums[i] === 1 ? '🥇' : rankNums[i] === 2 ? '🥈' : '🥉'}</div>
          <div class="podium-avatar" style="background:linear-gradient(135deg,${u.color}55,${u.color}22);border:1.5px solid ${u.color}66">${u.initials}</div>
          <div class="podium-name">${u.name}</div>
          <div class="podium-value">${fmt.rp(u.totalAssets)}</div>
          <div class="podium-pnl ${pnl >= 0 ? 'profit' : 'loss'}">${pnl >= 0 ? '+' : ''}${fmt.rp(pnl)}</div>
        </div>
      `;
    }).join('');
  }

  // Full table
  const lbBody = document.getElementById('lb-table-body');
  if (lbBody) {
    lbBody.innerHTML = allUsers.map((u, i) => {
      const pnl    = u.totalAssets - INITIAL_BALANCE;
      const pnlPct = (pnl / INITIAL_BALANCE) * 100;
      const rowStyle = u.isMe ? 'style="background:rgba(105,240,174,0.05);outline:1px solid rgba(105,240,174,0.15)"' : '';
      return `
        <tr ${rowStyle}>
          <td class="mono" style="font-size:13px;color:${i < 3 ? 'var(--gold)' : 'var(--text-muted)'};font-weight:${i < 3 ? 700 : 400}">
            ${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1)}
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:11px;font-weight:700;background:${u.color}22;color:${u.color};flex-shrink:0">${u.initials}</div>
              <div>
                <div style="font-size:13px;color:${u.isMe ? 'var(--green)' : 'var(--text-primary)'}">${u.name}${u.isMe ? ' <span style="font-size:10px;color:var(--green);font-family:var(--font-mono)">(Anda)</span>' : ''}</div>
                ${u.source === 'real' ? '<div style="font-size:10px;color:var(--gold);font-family:var(--font-mono);letter-spacing:0.05em">LIVE</div>' : ''}
              </div>
            </div>
          </td>
          <td class="mono" style="color:var(--gold)">${fmt.rp(u.totalAssets)}</td>
          <td class="${pnl >= 0 ? 'profit' : 'loss'}">${pnl >= 0 ? '+' : ''}${fmt.rp(pnl)}</td>
          <td class="${pnl >= 0 ? 'profit' : 'loss'}">${fmt.pct(pnlPct)}</td>
        </tr>
      `;
    }).join('');
  }
}

async function renderLeaderboard() {
  const myAssets   = totalAssets();
  const myName     = state.user?.displayName || state.user?.email?.split('@')[0] || 'Anda';
  const myUid      = state.user?.uid || 'me';
  const myInitials = myName.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const myColor    = '#69F0AE';

  const meEntry = { name: myName, initials: myInitials, totalAssets: myAssets, color: myColor, isMe: true, source: 'real' };

  // Show loading state
  const lbBody = document.getElementById('lb-table-body');
  if (lbBody) lbBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px">⏳ Memuat data leaderboard…</td></tr>';

  if (firebaseReady) {
    try {
      const entries = await getLeaderboard(50);
      let realUsers = entries
        .filter(e => e.totalAssets && e.name)
        .map(e => ({
          name:        e.name,
          initials:    e.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
          totalAssets: e.totalAssets,
          color:       colorFromUid(e.id || e.name),
          isMe:        e.id === myUid,
          source:      'real',
        }));

      // Make sure current user appears even if not yet synced
      const alreadyInList = realUsers.some(u => u.isMe);
      if (!alreadyInList) realUsers.push(meEntry);
      else realUsers = realUsers.map(u => u.isMe ? { ...u, totalAssets: myAssets, isMe: true } : u);

      realUsers.sort((a, b) => b.totalAssets - a.totalAssets);

      // Show badge count
      const badge = document.getElementById('lb-count-badge');
      if (badge) badge.textContent = realUsers.length + ' trader';
      const srcBadge = document.getElementById('lb-source-badge');
      if (srcBadge) srcBadge.style.display = 'inline';
      const footer = document.getElementById('lb-footer-text');
      if (footer) footer.textContent = '🔴 Data LIVE dari Firebase Firestore · Diperbarui setiap transaksi';

      buildLeaderboardUI(realUsers);
      return;
    } catch (e) {
      console.warn('Leaderboard fetch failed, using demo data');
    }
  }

  // Firebase not ready — show only current user + demo notice
  const badge = document.getElementById('lb-count-badge');
  if (badge) badge.textContent = '1 trader';
  const footer = document.getElementById('lb-footer-text');
  const srcBadge = document.getElementById('lb-source-badge');
  if (srcBadge) srcBadge.style.display = 'none';

  if (!firebaseReady) {
    // Show informative message
    if (footer) footer.innerHTML = '⚙️ <span style="color:var(--gold)">Firebase belum dikonfigurasi</span> — leaderboard real membutuhkan Firebase. Isi konfigurasi di <code style="font-size:10px;color:var(--cyan)">firebase.js</code> untuk melihat peringkat semua trader.';
    const podium = document.getElementById('leaderboard-podium');
    if (podium) {
      podium.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:32px;background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)">
          <div style="font-size:32px;margin-bottom:12px">⚙️</div>
          <div style="font-family:var(--font-display);font-size:16px;font-weight:600;color:var(--text-primary);margin-bottom:8px">Firebase Belum Dikonfigurasi</div>
          <div style="font-size:13px;color:var(--text-muted);max-width:400px;margin:0 auto;line-height:1.6">
            Untuk leaderboard real-time, isi konfigurasi Firebase di <code style="color:var(--cyan)">firebase.js</code>.<br>
            Setelah dikonfigurasi, semua trader yang login akan otomatis muncul di sini.
          </div>
        </div>
      `;
    }
    if (lbBody) lbBody.innerHTML = `
      <tr>
        <td>👤</td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:11px;font-weight:700;background:#69F0AE22;color:#69F0AE">${meEntry.initials}</div>
            <div style="color:var(--green)">${meEntry.name} <span style="font-size:10px;font-family:var(--font-mono)">(Anda — Sesi ini)</span></div>
          </div>
        </td>
        <td class="mono" style="color:var(--gold)">${fmt.rp(meEntry.totalAssets)}</td>
        <td class="${meEntry.totalAssets - INITIAL_BALANCE >= 0 ? 'profit' : 'loss'}">${meEntry.totalAssets - INITIAL_BALANCE >= 0 ? '+' : ''}${fmt.rp(meEntry.totalAssets - INITIAL_BALANCE)}</td>
        <td class="${meEntry.totalAssets - INITIAL_BALANCE >= 0 ? 'profit' : 'loss'}">${fmt.pct(((meEntry.totalAssets - INITIAL_BALANCE) / INITIAL_BALANCE) * 100)}</td>
      </tr>
    `;
    return;
  }

  // Fallback: current user only
  buildLeaderboardUI([meEntry]);
}

// ─── Utilities ─────────────────────────────────────────
function setEl(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ─── Toast ─────────────────────────────────────────────
const toastIcons = { success: '✅', error: '❌', info: '💡', warning: '⚠️' };

function showToast(title, message, type = 'info', duration = 4000) {
  const container = document.querySelector('.toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${toastIcons[type] || '💡'}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ═══════════════════════════════════════════════════════
// USER INTERACTIONS
// ═══════════════════════════════════════════════════════

function selectStock(id) {
  state.activeStock = id;
  renderStockList();
  renderChartHeader();
  renderTradePanel();
  initChart();
}

function quickTrade(id) {
  selectStock(id);
  switchTab('trade');
  // Scroll to trade panel
  document.querySelector('.trade-panel')?.scrollIntoView({ behavior: 'smooth' });
}

function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.nav-tab').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
  document.querySelectorAll('.panel-view').forEach(el => {
    el.classList.toggle('active', el.id === tab + '-view');
  });

  if (tab === 'trade') {
    // Re-init chart after the DOM becomes visible (display:flex)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initChart();
        renderAll();
      });
    });
  }
  if (tab === 'portfolio')   renderPortfolio();
  if (tab === 'leaderboard') renderLeaderboard();
}

function switchTradeSide(side) {
  state.tradeSide = side;
  document.getElementById('trade-tab-buy').classList.toggle('active', side === 'buy');
  document.getElementById('trade-tab-sell').classList.toggle('active', side === 'sell');

  const btn = document.getElementById('trade-submit-btn');
  if (btn) {
    btn.textContent = side === 'buy' ? '▲ BELI SEKARANG' : '▼ JUAL SEKARANG';
    btn.className   = side === 'buy' ? 'btn-buy-full' : 'btn-sell-full';
  }
}

function setTradePercent(pct) {
  const price = state.prices[state.activeStock] || 1;
  let qty = 0;
  if (state.tradeSide === 'buy') {
    qty = Math.floor((state.balance * pct) / price);
  } else {
    const h = state.holdings[state.activeStock];
    qty = Math.floor(((h?.qty || 0) * pct));
  }
  const input = document.getElementById('trade-qty-input');
  if (input) { input.value = qty; recalcTradeTotal(); }
}

function executeTrade() {
  const qtyInput = document.getElementById('trade-qty-input');
  const qty      = parseInt(qtyInput?.value) || 0;

  if (qty <= 0) { showToast('Perhatian', 'Masukkan jumlah lembar yang valid.', 'warning'); return; }

  const s     = getStock(state.activeStock);
  const price = state.prices[state.activeStock] || s.basePrice;
  const total = qty * price;

  if (state.tradeSide === 'buy') {
    if (total > state.balance) {
      showToast('Saldo Tidak Cukup', `Dibutuhkan ${fmt.rp(total)}, saldo Anda ${fmt.rp(state.balance)}`, 'error');
      return;
    }

    state.balance -= total;
    if (!state.holdings[s.id]) {
      state.holdings[s.id] = { qty: 0, avgPrice: price };
    }
    const h = state.holdings[s.id];
    const newQty = h.qty + qty;
    h.avgPrice   = ((h.avgPrice * h.qty) + (price * qty)) / newQty;
    h.qty        = newQty;

    playSound('buy');
    showToast('✅ Order Berhasil!', `Beli ${qty} lembar ${s.id} @ ${fmt.rp(price)}`, 'success');

  } else {
    const h = state.holdings[s.id];
    if (!h || h.qty < qty) {
      showToast('Lembar Tidak Cukup', `Anda hanya memiliki ${h?.qty || 0} lembar ${s.id}`, 'error');
      return;
    }

    h.qty        -= qty;
    state.balance += total;

    if (h.qty === 0) delete state.holdings[s.id];

    playSound('sell');
    showToast('✅ Order Berhasil!', `Jual ${qty} lembar ${s.id} @ ${fmt.rp(price)}`, 'success');
  }

  // Record transaction
  state.transactions.push({
    ts:    new Date().toLocaleString('id-ID'),
    type:  state.tradeSide,
    stock: s.id,
    qty,
    price,
    total,
  });

  if (qtyInput) qtyInput.value = '';

  saveToStorage();
  renderAll();
  syncLeaderboard();
}

function renderAll() {
  renderStockList();
  renderChartHeader();
  renderTradePanel();
  renderHoldingsMini();
  renderTicker();
  renderTopbarBalance();
  if (state.activeTab === 'portfolio')    renderPortfolio();
  if (state.activeTab === 'leaderboard')  renderLeaderboard();
}

// ─── Sound (Web Audio API) ─────────────────────────────
let audioCtx;

function playSound(type) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

    if (type === 'buy') {
      osc.frequency.setValueAtTime(523, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(784, audioCtx.currentTime + 0.2);
    } else {
      osc.frequency.setValueAtTime(784, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.2);
    }

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) { /* audio not supported */ }
}

// ─── Persistence ───────────────────────────────────────
function saveToStorage() {
  const data = {
    balance:      state.balance,
    holdings:     state.holdings,
    transactions: state.transactions.slice(-100),
  };
  try {
    localStorage.setItem('uvm_state', JSON.stringify(data));
  } catch (e) {}

  // Firebase sync
  if (firebaseReady && state.user) {
    updateUserData(state.user.uid, data).catch(() => {});
    syncLeaderboard();
  }
}

function loadFromStorage(data) {
  if (!data) return;
  state.balance      = data.balance      ?? INITIAL_BALANCE;
  state.holdings     = data.holdings     ?? {};
  state.transactions = data.transactions ?? [];
}

function syncLeaderboard() {
  if (!firebaseReady || !state.user) return;
  const total = totalAssets();
  const name  = state.user.displayName || state.user.email?.split('@')[0] || 'Anon';
  updateLeaderboard(state.user.uid, {
    name,
    totalAssets: total,
    pnl: total - INITIAL_BALANCE,
    ts: Date.now(),
  }).catch(() => {});
}

// ─── Particle Background ───────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x     = Math.random() * canvas.width;
      this.y     = Math.random() * canvas.height;
      this.size  = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.7 ? '#D4AF37' : Math.random() > 0.5 ? '#00E5FF' : '#3D7EFF';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle   = this.color;
      ctx.shadowBlur  = 6;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / 100) * 0.08;
          ctx.strokeStyle = '#D4AF37';
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}

// ─── Clock ─────────────────────────────────────────────
function startClock() {
  function tick() {
    const el = document.getElementById('topbar-time');
    if (el) el.textContent = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }
  tick();
  setInterval(tick, 1000);
}

// ─── Loading Screen ────────────────────────────────────
function runLoadingScreen(onDone) {
  const screen = document.getElementById('loading-screen');
  const bar    = document.getElementById('loading-bar');
  const status = document.getElementById('loading-status');
  if (!screen) { onDone(); return; }

  const steps = [
    'Menginisialisasi pasar…',
    'Memuat data saham…',
    'Menghubungkan ke Firebase…',
    'Mengkalibrasi algoritma harga…',
    'Menyiapkan dashboard…',
  ];

  let pct   = 0;
  let step  = 0;

  const interval = setInterval(() => {
    pct += Math.random() * 25 + 10;
    if (pct >= 100) pct = 100;

    if (bar)    bar.style.width = pct + '%';
    if (status) status.textContent = steps[Math.min(step, steps.length - 1)];
    step++;

    if (pct >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        screen.classList.add('hidden');
        onDone();
      }, 500);
    }
  }, 400);
}

// ═══════════════════════════════════════════════════════
// AUTH FLOW
// ═══════════════════════════════════════════════════════

function showPage(page) {
  document.getElementById('landing-page')?.classList.toggle('hidden', page !== 'landing');
  document.getElementById('auth-page')?.classList.toggle('hidden', page !== 'auth');
  const dash = document.getElementById('dashboard-page');
  if (dash) dash.style.display = page === 'dashboard' ? 'flex' : 'none';
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function hideAuthError() {
  const el = document.getElementById('auth-error');
  if (el) el.style.display = 'none';
}

async function handleLogin() {
  hideAuthError();
  const email = document.getElementById('login-email')?.value?.trim();
  const pass  = document.getElementById('login-password')?.value;

  if (!email || !pass) { showAuthError('Masukkan email dan password.'); return; }

  if (firebaseReady) {
    try {
      await signInWithEmail(email, pass);
    } catch (e) {
      const msgs = {
        'auth/user-not-found':   'Akun tidak ditemukan.',
        'auth/wrong-password':   'Password salah.',
        'auth/invalid-email':    'Format email tidak valid.',
        'auth/too-many-requests':'Terlalu banyak percobaan. Coba lagi nanti.',
      };
      showAuthError(msgs[e.code] || e.message);
    }
  } else {
    // Demo mode — bypass auth
    demoLogin({ displayName: email.split('@')[0], email, uid: 'demo-' + Date.now() });
  }
}

async function handleRegister() {
  hideAuthError();
  const name  = document.getElementById('reg-name')?.value?.trim();
  const email = document.getElementById('reg-email')?.value?.trim();
  const pass  = document.getElementById('reg-password')?.value;

  if (!name || !email || !pass) { showAuthError('Isi semua kolom.'); return; }
  if (pass.length < 6)          { showAuthError('Password minimal 6 karakter.'); return; }

  if (firebaseReady) {
    const btn = document.querySelector('#register-form .btn-gold');
    if (btn) { btn.textContent = 'Mendaftarkan…'; btn.disabled = true; }
    try {
      const cred = await signUpWithEmail(email, pass);
      await cred.user.updateProfile({ displayName: name });
      await createUserData(cred.user.uid, {
        name, email,
        balance: INITIAL_BALANCE,
        holdings: {},
        transactions: [],
        createdAt: Date.now(),
      });
      // onAuthStateChanged will fire and enter dashboard automatically
      showToast('✅ Akun Dibuat!', 'Selamat datang ' + name + '! Modal Rp10JT sudah disiapkan.', 'success');
    } catch (e) {
      if (btn) { btn.textContent = 'Buat Akun — Rp10.000.000 Modal Gratis'; btn.disabled = false; }
      const msgs = {
        'auth/email-already-in-use': 'Email sudah terdaftar. Silakan masuk.',
        'auth/invalid-email':        'Format email tidak valid.',
        'auth/weak-password':        'Password terlalu lemah (min 6 karakter).',
      };
      showAuthError(msgs[e.code] || e.message);
    }
  } else {
    // Demo mode — save name and enter
    localStorage.setItem('uvm_demo_name', name);
    demoLogin({ displayName: name, email, uid: 'demo-' + Date.now() });
  }
}

async function handleGoogleLogin() {
  hideAuthError();
  if (firebaseReady) {
    const btn = document.getElementById('btn-google-login');
    if (btn) { btn.disabled = true; btn.textContent = 'Menghubungkan ke Google…'; }
    try {
      await signInWithGoogle();
      // onAuthStateChanged will handle the rest
    } catch (e) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/></svg> Lanjutkan dengan Google`;
      }
      const msgs = {
        'auth/popup-closed-by-user':    'Login dibatalkan.',
        'auth/popup-blocked':           'Popup diblokir browser. Izinkan popup dan coba lagi.',
        'auth/cancelled-popup-request': 'Login dibatalkan.',
        'auth/network-request-failed':  'Periksa koneksi internet Anda.',
        'auth/unauthorized-domain':     'Domain belum diotorisasi di Firebase. Tambahkan domain ini di Firebase Console → Authentication → Settings → Authorized domains.',
      };
      showAuthError(msgs[e.code] || 'Login Google gagal: ' + e.message);
    }
  } else {
    // Firebase belum dikonfigurasi — tampilkan pesan jelas
    showAuthError('⚙️ Firebase belum dikonfigurasi. Isi konfigurasi di firebase.js terlebih dahulu, atau gunakan tombol Demo di bawah.');
  }
}

// Enter platform without Firebase login
function enterDemoMode() {
  const savedName = localStorage.getItem('uvm_demo_name') || 'Demo Trader';
  // Use stable demo UID so data always loads back on re-login
  demoLogin({ displayName: savedName, email: 'demo@unisba.ac.id', uid: 'demo-local-stable' });
}

function demoLogin(user) {
  state.user = user;
  const saved = localStorage.getItem('uvm_state');
  loadFromStorage(saved ? JSON.parse(saved) : null);
  enterDashboard();
}

async function handleLogout() {
  saveToStorage();
  if (firebaseReady) await signOut();
  state.user = null;
  showPage('landing');
}

async function enterDashboard() {
  const initials = (state.user?.displayName || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const avatar   = document.getElementById('user-avatar');
  if (avatar) avatar.textContent = initials;

  const nameEl = document.getElementById('user-display-name');
  if (nameEl) nameEl.textContent = state.user?.displayName || state.user?.email || 'Trader';

  showPage('dashboard');
  setTimeout(() => {
    initChart();
    renderAll();
    renderNewsPanel();
  }, 100);
}

// ═══════════════════════════════════════════════════════
// MAIN INIT
// ═══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // Init Firebase (if available)
  const fbReady = initFirebase();

  // Init particle & price engine
  initParticles();
  initPrices();

  // Render landing ticker immediately
  renderTicker();
  renderTicker(); // populate landing ticker

  // Auth state listener
  if (fbReady) {
    onAuthChanged(async user => {
      if (user) {
        state.user = user;
        // Load from Firestore
        const data = await getUserData(user.uid);
        if (data) {
          loadFromStorage(data);
        } else {
          // New user — create
          await createUserData(user.uid, {
            name: user.displayName || user.email,
            email: user.email,
            balance: INITIAL_BALANCE,
            holdings: {},
            transactions: [],
            createdAt: Date.now(),
          });
        }
        enterDashboard();
      }
    });
  }

  // Loading screen
  runLoadingScreen(() => {
    // Check localStorage for fast re-entry
    const cachedUser = localStorage.getItem('uvm_demo_user');
    if (cachedUser && !fbReady) {
      try { demoLogin(JSON.parse(cachedUser)); return; } catch (e) {}
    }
    showPage('landing');
  });

  // Ticker tape double-content (infinite scroll)
  const landing_ticker = document.getElementById('landing-ticker-track');
  if (landing_ticker) {
    // Content is set dynamically once prices are ready
    renderTicker();
  }

  // ─── Price update loop ───
  setInterval(() => {
    const changes = tickPrices();

    // Flash price changes in stock list
    Object.entries(changes).forEach(([id, ch]) => {
      const items = document.querySelectorAll(`.stock-item`);
      items.forEach(item => {
        if (item.getAttribute('onclick')?.includes(id)) {
          item.classList.add(ch.new >= ch.old ? 'flash-up' : 'flash-down');
          setTimeout(() => item.classList.remove('flash-up', 'flash-down'), 600);
        }
      });
    });

    renderStockList();
    renderChartHeader();
    renderTopbarBalance();
    renderTicker();
    if (state.activeTab === 'portfolio') renderPortfolio();
    updateChartData();

  }, PRICE_UPDATE_MS);

  // ─── News loop ───
  setInterval(fireNews, NEWS_INTERVAL_MS);
  // Fire first news after 5s
  setTimeout(fireNews, 5000);

  // ─── Clock ───
  startClock();

  // ─── Leaderboard auto-refresh (every 30s when on leaderboard tab) ───
  setInterval(() => {
    if (state.activeTab === 'leaderboard') renderLeaderboard();
  }, 30000);

  // ─── Event listeners ───

  // Landing Enter Market button
  document.getElementById('btn-enter-market')?.addEventListener('click', () => {
    showPage('auth');
    document.getElementById('auth-login-tab')?.click();
    // Show demo banner if Firebase not configured
    const banner = document.getElementById('demo-mode-banner');
    if (banner) banner.classList.toggle('hidden', firebaseReady);
  });

  // Auth close / back to landing
  document.getElementById('btn-auth-close')?.addEventListener('click', () => {
    showPage('landing');
    hideAuthError();
  });

  // Zoom controls
  document.getElementById('zoom-in-btn')?.addEventListener('click', () => applyZoom(+1));
  document.getElementById('zoom-out-btn')?.addEventListener('click', () => applyZoom(-1));
  document.getElementById('zoom-reset-btn')?.addEventListener('click', resetZoom);

  // Scroll wheel zoom on chart canvas
  document.getElementById('main-chart')?.addEventListener('wheel', e => {
    e.preventDefault();
    applyZoom(e.deltaY < 0 ? +1 : -1);
  }, { passive: false });

  // Panel toggle buttons
  document.getElementById('toggle-stock-list')?.addEventListener('click', () => togglePanel('left'));
  document.getElementById('toggle-trade-panel')?.addEventListener('click', () => togglePanel('right'));

  // Auth tabs
  document.getElementById('auth-login-tab')?.addEventListener('click', () => {
    document.getElementById('auth-login-tab').classList.add('active');
    document.getElementById('auth-reg-tab').classList.remove('active');
    document.getElementById('login-form')?.classList.remove('hidden');
    document.getElementById('register-form')?.classList.add('hidden');
    hideAuthError();
  });

  document.getElementById('auth-reg-tab')?.addEventListener('click', () => {
    document.getElementById('auth-reg-tab').classList.add('active');
    document.getElementById('auth-login-tab').classList.remove('active');
    document.getElementById('register-form')?.classList.remove('hidden');
    document.getElementById('login-form')?.classList.add('hidden');
    hideAuthError();
  });

  // Enter key on forms
  document.getElementById('login-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('reg-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleRegister();
  });

  // Dashboard nav tabs
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Trade tabs
  document.getElementById('trade-tab-buy')?.addEventListener('click', () => switchTradeSide('buy'));
  document.getElementById('trade-tab-sell')?.addEventListener('click', () => switchTradeSide('sell'));

  // Trade qty input
  document.getElementById('trade-qty-input')?.addEventListener('input', recalcTradeTotal);

  // Trade pct buttons
  document.querySelectorAll('.trade-pct-btn').forEach(btn => {
    btn.addEventListener('click', () => setTradePercent(parseFloat(btn.dataset.pct)));
  });

  // Trade submit
  document.getElementById('trade-submit-btn')?.addEventListener('click', executeTrade);

  // Stock search
  document.getElementById('stock-search-input')?.addEventListener('input', e => {
    renderStockList(e.target.value);
  });

  // Logout
  document.getElementById('btn-logout')?.addEventListener('click', handleLogout);

  // User avatar click → show dropdown (simple)
  document.getElementById('user-avatar')?.addEventListener('click', () => {
    showToast('👤 ' + (state.user?.displayName || 'Trader'), 'Total Aset: ' + fmt.rp(totalAssets()), 'info');
  });
});

// ═══════════════════════════════════════════════════════
// MOBILE ENHANCEMENTS
// ═══════════════════════════════════════════════════════

function updateMobileBar() {
  const s = getStock(state.activeStock);
  const price = state.prices[state.activeStock] || s.basePrice;
  const hist = state.priceHistory[state.activeStock] || [];
  const open = hist[Math.max(0, hist.length - 20)] || price;
  const chg = ((price - open) / open) * 100;

  const priceEl = document.getElementById('mobile-price-val');
  const chgEl = document.getElementById('mobile-price-chg');

  if (priceEl) priceEl.textContent = fmt.rp(price);
  if (chgEl) {
    chgEl.textContent = fmt.pct(chg);
    chgEl.className = 'mobile-price-chg ' + (chg >= 0 ? 'up' : 'down');
  }
}

function openMobileStockSheet() {
  const overlay = document.getElementById('mobile-stock-sheet');
  const list = document.getElementById('mobile-stock-list');
  if (!overlay || !list) return;

  // Build list
  list.innerHTML = STOCKS.map(s => {
    const price = state.prices[s.id] || s.basePrice;
    const hist = state.priceHistory[s.id] || [];
    const first = hist[Math.max(0, hist.length - 20)] || price;
    const chg = ((price - first) / first) * 100;
    const active = s.id === state.activeStock ? ' active' : '';
    return `
      <div class="stock-item${active}" onclick="selectStockMobile('${s.id}')">
        <div class="stock-icon" style="background:${s.bg};color:${s.color}">${s.id.slice(0,2)}</div>
        <div class="stock-info">
          <div class="stock-ticker">${s.id}</div>
          <div class="stock-name">${s.name}</div>
        </div>
        <div class="stock-price-wrap">
          <div class="stock-price">${fmt.rp(price)}</div>
          <div class="stock-change ${chg >= 0 ? 'up' : 'down'}">${fmt.pct(chg)}</div>
        </div>
      </div>
    `;
  }).join('');

  overlay.classList.add('open');
}

function closeMobileStockSheet() {
  document.getElementById('mobile-stock-sheet')?.classList.remove('open');
}

function selectStockMobile(id) {
  selectStock(id);
  updateMobileBar();
  closeMobileStockSheet();
}

function openMobileTradeModal(side) {
  const overlay = document.getElementById('mobile-trade-modal-overlay');
  const modal = document.getElementById('mobile-trade-modal');
  if (!overlay || !modal) return;

  switchTradeSide(side);

  const s = getStock(state.activeStock);
  const price = state.prices[state.activeStock] || s.basePrice;
  const h = state.holdings[state.activeStock];
  const qty = h ? h.qty : 0;

  modal.innerHTML = `
    <div style="padding:12px 20px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:12px;font-weight:700;background:${s.bg};color:${s.color}">${s.id.slice(0,2)}</div>
        <div>
          <div style="font-family:var(--font-display);font-size:14px;font-weight:600;color:var(--text-primary)">${s.id}</div>
          <div style="font-size:11px;color:var(--text-muted)">${fmt.rp(price)}</div>
        </div>
      </div>
      <button onclick="closeMobileTradeModal()" style="width:28px;height:28px;background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:8px;color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;">✕</button>
    </div>
    <div style="padding:16px;overflow-y:auto;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
        <div style="background:var(--bg-deep);border-radius:6px;padding:8px 10px;border:1px solid var(--border-subtle)">
          <div style="font-family:var(--font-mono);font-size:9px;color:var(--text-muted);text-transform:uppercase;margin-bottom:3px">Saldo</div>
          <div style="font-family:var(--font-mono);font-size:11px;color:var(--gold)">${fmt.rp(state.balance)}</div>
        </div>
        <div style="background:var(--bg-deep);border-radius:6px;padding:8px 10px;border:1px solid var(--border-subtle)">
          <div style="font-family:var(--font-mono);font-size:9px;color:var(--text-muted);text-transform:uppercase;margin-bottom:3px">Dimiliki</div>
          <div style="font-family:var(--font-mono);font-size:11px;color:var(--cyan)">${qty} lembar</div>
        </div>
      </div>

      <div class="trade-tabs" style="margin-bottom:14px">
        <button class="trade-tab buy ${side === 'buy' ? 'active' : ''}" onclick="switchTradeSide('buy');openMobileTradeModal('buy')">▲ BELI</button>
        <button class="trade-tab sell ${side === 'sell' ? 'active' : ''}" onclick="switchTradeSide('sell');openMobileTradeModal('sell')">▼ JUAL</button>
      </div>

      <div class="trade-form-row">
        <div class="trade-form-label">
          <span>Jumlah Lembar</span>
          <span class="trade-form-avail">Harga/lbr: ${fmt.rp(price)}</span>
        </div>
        <input type="number" class="trade-input" id="mobile-trade-qty" placeholder="0" min="1" step="1" oninput="calcMobileTotal()" style="font-size:16px" />
        <div class="trade-pct-btns" style="margin-top:6px">
          <button class="trade-pct-btn" onclick="setMobileTradePercent(0.25)">25%</button>
          <button class="trade-pct-btn" onclick="setMobileTradePercent(0.5)">50%</button>
          <button class="trade-pct-btn" onclick="setMobileTradePercent(0.75)">75%</button>
          <button class="trade-pct-btn" onclick="setMobileTradePercent(1)">MAX</button>
        </div>
      </div>

      <div class="trade-total" style="margin-bottom:14px">
        <div class="trade-total-label">Total Nilai Order</div>
        <div class="trade-total-value" id="mobile-trade-total">Rp 0</div>
      </div>

      <button class="${side === 'buy' ? 'btn-buy-full' : 'btn-sell-full'}" onclick="executeMobileTrade()">
        ${side === 'buy' ? '▲ BELI SEKARANG' : '▼ JUAL SEKARANG'}
      </button>
    </div>
  `;

  overlay.classList.add('open');
}

function closeMobileTradeModal() {
  document.getElementById('mobile-trade-modal-overlay')?.classList.remove('open');
}

function calcMobileTotal() {
  const qty = parseFloat(document.getElementById('mobile-trade-qty')?.value) || 0;
  const price = state.prices[state.activeStock] || 0;
  const el = document.getElementById('mobile-trade-total');
  if (el) el.textContent = fmt.rp(qty * price);
}

function setMobileTradePercent(pct) {
  const price = state.prices[state.activeStock] || 1;
  let qty = 0;
  if (state.tradeSide === 'buy') {
    qty = Math.floor((state.balance * pct) / price);
  } else {
    const h = state.holdings[state.activeStock];
    qty = Math.floor(((h?.qty || 0) * pct));
  }
  const input = document.getElementById('mobile-trade-qty');
  if (input) { input.value = qty; calcMobileTotal(); }
}

function executeMobileTrade() {
  // Sync mobile qty to main trade input
  const mobileQty = document.getElementById('mobile-trade-qty')?.value;
  const mainInput = document.getElementById('trade-qty-input');
  if (mainInput && mobileQty) mainInput.value = mobileQty;

  executeTrade();
  if (document.getElementById('mobile-trade-modal-overlay')?.classList.contains('open')) {
    closeMobileTradeModal();
  }
  updateMobileBar();
}

// Patch renderAll to also update mobile bar
const _origRenderAll = renderAll;
function renderAll() {
  _origRenderAll();
  updateMobileBar();
}
