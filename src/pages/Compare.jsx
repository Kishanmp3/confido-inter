import { useState, useMemo } from 'react';
import { X, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { MONTHS_LABELS } from '../data/mockData';

const COMPARE_COLORS = ['#4CAF7D', '#6366F1', '#F59E0B', '#E05252'];

const METRICS_ROWS = [
  { key: 'unitPrice',      label: 'Unit Price',          fmt: v => `$${v.toFixed(2)}`,   best: 'none' },
  { key: 'casePrice',      label: 'Case Price',          fmt: v => `$${v.toFixed(2)}`,   best: 'none' },
  { key: 'margin',         label: 'Margin %',            fmt: v => `${v}%`,              best: 'max' },
  { key: 'monthRevenue',   label: 'Monthly Revenue',     fmt: v => `$${v.toLocaleString()}`, best: 'max' },
  { key: 'monthUnits',     label: 'Units Sold (last)',   fmt: v => v.toLocaleString(),   best: 'max' },
  { key: 'deductionRate',  label: 'Deduction Rate',      fmt: v => `${v}%`,              best: 'min' },
  { key: 'tradeSpendRate', label: 'Trade Spend Rate',    fmt: v => `${v}%`,              best: 'min' },
  { key: 'scheduledChanges', label: 'Scheduled Changes', fmt: v => v,                   best: 'none' },
];

export default function Compare() {
  const { products, setSelectedProduct, setActiveTab } = useApp();
  const [selected, setSelected] = useState([]);
  const [whatIf, setWhatIf] = useState(false);
  const [whatIfPrices, setWhatIfPrices] = useState({});

  const toggleProduct = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const selectedProducts = products.filter(p => selected.includes(p.id));

  // Build metrics per product
  const productMetrics = useMemo(() =>
    selectedProducts.map(p => ({
      id: p.id,
      unitPrice: whatIf && whatIfPrices[p.id] ? parseFloat(whatIfPrices[p.id]) : p.unitPrice,
      casePrice: p.casePrice,
      margin: p.margin,
      monthRevenue: p.revenuePerMonth[p.revenuePerMonth.length - 1],
      monthUnits: p.unitsPerMonth[p.unitsPerMonth.length - 1],
      deductionRate: p.deductionRate,
      tradeSpendRate: p.tradeSpendRate,
      scheduledChanges: p.scheduledPriceChanges.length,
    })),
  [selectedProducts, whatIf, whatIfPrices]);

  // Price overlay line data
  const priceLineData = useMemo(() => {
    if (selectedProducts.length === 0) return [];
    // Always include today + 6 months out so every product has ≥2 plotted points
    const todayStr = new Date().toISOString().split('T')[0];
    const futureDate = new Date(); futureDate.setMonth(futureDate.getMonth() + 6);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    const allDates = new Set([todayStr, futureDateStr]);
    selectedProducts.forEach(p => {
      p.priceHistory.forEach(h => allDates.add(h.date));
      p.scheduledPriceChanges.forEach(c => allDates.add(c.effectiveDate));
    });
    return [...allDates].sort().map(date => {
      const point = { date: new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) };
      selectedProducts.forEach(p => {
        // Carry the last known price forward to any date on or after launch
        const history = [...p.priceHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
        let price = null;
        for (const h of history) {
          if (new Date(h.date) <= new Date(date)) price = h.price;
        }
        if (price !== null) point[p.id] = price;
      });
      return point;
    });
  }, [selectedProducts]);

  // Radar data — normalize to 0-100
  const radarData = useMemo(() => {
    if (selectedProducts.length === 0) return [];
    const normalize = (value, key) => {
      const vals = selectedProducts.map(p => {
        if (key === 'unitPrice') return p.unitPrice;
        if (key === 'margin') return p.margin;
        if (key === 'monthUnits') return p.unitsPerMonth[p.unitsPerMonth.length - 1];
        if (key === 'monthRevenue') return p.revenuePerMonth[p.revenuePerMonth.length - 1];
        if (key === 'tradeSpend') return p.tradeSpendRate;
        if (key === 'deductions') return p.deductionRate;
        return 0;
      });
      const min = Math.min(...vals), max = Math.max(...vals);
      if (max === min) return 50;
      return ((value - min) / (max - min)) * 100;
    };

    return [
      { metric: 'Unit Price', ...Object.fromEntries(selectedProducts.map(p => [p.id, normalize(p.unitPrice, 'unitPrice')])) },
      { metric: 'Margin %', ...Object.fromEntries(selectedProducts.map(p => [p.id, normalize(p.margin, 'margin')])) },
      { metric: 'Units Sold', ...Object.fromEntries(selectedProducts.map(p => [p.id, normalize(p.unitsPerMonth[p.unitsPerMonth.length - 1], 'monthUnits')])) },
      { metric: 'Revenue', ...Object.fromEntries(selectedProducts.map(p => [p.id, normalize(p.revenuePerMonth[p.revenuePerMonth.length - 1], 'monthRevenue')])) },
      { metric: 'Trade Spend', ...Object.fromEntries(selectedProducts.map(p => [p.id, normalize(p.tradeSpendRate, 'tradeSpend')])) },
      { metric: 'Deductions', ...Object.fromEntries(selectedProducts.map(p => [p.id, normalize(p.deductionRate, 'deductions')])) },
    ];
  }, [selectedProducts]);

  // Revenue bar chart — last 6 months
  const revenueBarData = useMemo(() =>
    MONTHS_LABELS.slice(-6).map((m, i) => {
      const idx = MONTHS_LABELS.length - 6 + i;
      const point = { month: m };
      selectedProducts.forEach(p => { point[p.id] = p.revenuePerMonth[idx]; });
      return point;
    }),
  [selectedProducts]);

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 6, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>{label}</div>
        {payload.map((entry, i) => {
          const p = products.find(p => p.id === entry.dataKey);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }} />
              <span style={{ fontSize: 12, color: '#374151' }}>{p?.name}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#111', marginLeft: 4, fontVariantNumeric: 'tabular-nums' }}>
                {typeof entry.value === 'number' && entry.value > 100 ? `$${entry.value.toLocaleString()}` : `$${entry.value?.toFixed(2)}`}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {/* Product selector */}
      <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111' }}>Select Products to Compare</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9CA3AF' }}>Choose 2–4 products. Each gets its own color.</p>
          </div>
          {selected.length >= 2 && (
            <button
              onClick={() => setWhatIf(w => !w)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: whatIf ? 'rgba(76,175,125,0.1)' : '#F9FAFB',
                border: `1px solid ${whatIf ? '#4CAF7D' : '#E5E5E5'}`,
                borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 600,
                color: whatIf ? '#4CAF7D' : '#6B7280', cursor: 'pointer', fontFamily: 'Inter',
              }}
            >
              {whatIf ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              What-If Mode
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {products.map((p, pi) => {
            const color = COMPARE_COLORS[selected.indexOf(p.id)];
            const isSelected = selected.includes(p.id);
            const isDisabled = !isSelected && selected.length >= 4;
            return (
              <button
                key={p.id}
                onClick={() => !isDisabled && toggleProduct(p.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px', borderRadius: 7,
                  border: `1px solid ${isSelected ? color : '#E5E5E5'}`,
                  background: isSelected ? `${color}14` : '#fff',
                  color: isSelected ? color : '#6B7280',
                  fontSize: 12, fontWeight: isSelected ? 600 : 400,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.45 : 1,
                  fontFamily: 'Inter',
                  transition: 'all 150ms ease',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: isSelected ? color : '#D1D5DB' }} />
                {p.name}
                {isSelected && (
                  <X size={11} style={{ marginLeft: 2 }} />
                )}
              </button>
            );
          })}
        </div>

        {/* What-if price inputs */}
        {whatIf && selected.length >= 2 && (
          <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12, paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
            <span style={{ fontSize: 12, color: '#9CA3AF', alignSelf: 'center' }}>Hypothetical prices:</span>
            {selectedProducts.map((p, pi) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COMPARE_COLORS[pi] }} />
                <span style={{ fontSize: 12, color: '#374151' }}>{p.name}</span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={whatIfPrices[p.id] ?? p.unitPrice}
                  onChange={e => setWhatIfPrices(prev => ({ ...prev, [p.id]: e.target.value }))}
                  style={{
                    width: 70, padding: '4px 8px', border: '1px solid #D1D5DB',
                    borderRadius: 5, fontSize: 12, fontFamily: 'Inter', textAlign: 'right',
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Empty state */}
      {selected.length < 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
          <div style={{ fontSize: 40, opacity: 0.15 }}>⚖️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>Select 2–4 products above to compare</div>
          <div style={{ fontSize: 13, color: '#9CA3AF' }}>Charts and metrics will appear here.</div>
        </div>
      )}

      {selected.length >= 2 && (
        <>
          {/* Overlay line chart */}
          <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
            <h3 style={sectionTitle}>Price Over Time</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={priceLineData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toFixed(2)}`} domain={['auto', 'auto']} />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  formatter={(value) => {
                    const p = products.find(p => p.id === value);
                    return <span style={{ fontSize: 12, color: '#374151' }}>{p?.name}</span>;
                  }}
                />
                {selectedProducts.map((p, pi) => (
                  <Line key={p.id} type="monotone" dataKey={p.id} stroke={COMPARE_COLORS[pi]}
                    strokeWidth={2} dot={{ r: 3, fill: COMPARE_COLORS[pi], strokeWidth: 0 }} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Radar + metrics table side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {/* Radar */}
            <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, padding: '20px 24px' }}>
              <h3 style={sectionTitle}>Multi-Dimension Comparison</h3>
              <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 12px' }}>Normalized 0–100 within selection</p>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#F3F4F6" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  {selectedProducts.map((p, pi) => (
                    <Radar key={p.id} name={p.name} dataKey={p.id}
                      stroke={COMPARE_COLORS[pi]} fill={COMPARE_COLORS[pi]} fillOpacity={0.1} strokeWidth={2} />
                  ))}
                  <Tooltip formatter={(v) => `${v.toFixed(0)}`} />
                  <Legend formatter={(value) => {
                    const p = products.find(p => p.id === value);
                    return <span style={{ fontSize: 11 }}>{p?.name}</span>;
                  }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Metrics table */}
            <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, padding: '20px 24px', overflowX: 'auto' }}>
              <h3 style={sectionTitle}>Side-by-Side Metrics</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginTop: 12 }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 130 }}>Metric</th>
                    {selectedProducts.map((p, pi) => (
                      <th key={p.id} style={{ ...thStyle, color: COMPARE_COLORS[pi] }}>{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {METRICS_ROWS.map(row => {
                    const vals = productMetrics.map(m => m[row.key]);
                    const bestVal = row.best === 'max' ? Math.max(...vals) : row.best === 'min' ? Math.min(...vals) : null;
                    return (
                      <tr key={row.key} style={{ borderTop: '1px solid #F3F4F6' }}>
                        <td style={{ ...tdStyle, color: '#9CA3AF', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{row.label}</td>
                        {productMetrics.map((m, pi) => {
                          const isBest = bestVal !== null && m[row.key] === bestVal;
                          return (
                            <td key={m.id} style={{
                              ...tdStyle,
                              fontWeight: isBest ? 700 : 400,
                              color: isBest ? '#4CAF7D' : '#374151',
                              background: isBest ? 'rgba(76,175,125,0.06)' : 'transparent',
                              fontVariantNumeric: 'tabular-nums',
                            }}>
                              {row.fmt(m[row.key])}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue bar chart */}
          <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, padding: '20px 24px' }}>
            <h3 style={sectionTitle}>Monthly Revenue — Last 6 Months</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueBarData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend formatter={(value) => {
                  const p = products.find(p => p.id === value);
                  return <span style={{ fontSize: 12, color: '#374151' }}>{p?.name}</span>;
                }} />
                {selectedProducts.map((p, pi) => (
                  <Bar key={p.id} dataKey={p.id} fill={COMPARE_COLORS[pi]} radius={[3, 3, 0, 0]} maxBarSize={32} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

const sectionTitle = { margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#111' };
const thStyle = { padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#9CA3AF', fontSize: 11, whiteSpace: 'nowrap' };
const tdStyle = { padding: '8px 10px', verticalAlign: 'middle' };
