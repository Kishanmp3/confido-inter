import { useState, useMemo } from 'react';
import { AlertTriangle, ExternalLink, Calendar } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import { MONTHS_LABELS } from '../data/mockData';

const MONTH_OPTIONS = MONTHS_LABELS.map((m, i) => ({ label: m, value: i }));

export default function ConfidoIntel() {
  const { products, navigateToProduct } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(11); // March = last

  const today = new Date();

  // Top stats
  const totalDeductionsMTD = products.reduce((s, p) => s + p.deductionsPerMonth[selectedMonth], 0);
  const totalRevenueMTD = products.reduce((s, p) => s + p.revenuePerMonth[selectedMonth], 0);
  const avgDeductionRate = (totalDeductionsMTD / totalRevenueMTD * 100).toFixed(1);
  const totalTradeSpendMTD = products.reduce((s, p) => s + p.tradeSpendPerMonth[selectedMonth], 0);
  const activePromos = products.filter(p =>
    p.promoWindows.some(w => new Date(w.start) <= today && new Date(w.end) >= today)
  ).length;

  // Deductions table
  const deductionsTable = useMemo(() =>
    products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      grossRevenue: p.revenuePerMonth[selectedMonth],
      deductions: p.deductionsPerMonth[selectedMonth],
      deductionPct: (p.deductionsPerMonth[selectedMonth] / p.revenuePerMonth[selectedMonth] * 100).toFixed(1),
      netRevenue: p.revenuePerMonth[selectedMonth] - p.deductionsPerMonth[selectedMonth],
      isFlagged: p.deductionRate > 10,
    })).sort((a, b) => parseFloat(b.deductionPct) - parseFloat(a.deductionPct)),
  [products, selectedMonth]);

  // Deductions bar data
  const deductionsBarData = useMemo(() =>
    [...products]
      .sort((a, b) => b.deductionsPerMonth[selectedMonth] - a.deductionsPerMonth[selectedMonth])
      .map(p => ({
        name: p.name.split(' ')[0],
        deductions: p.deductionsPerMonth[selectedMonth],
        flagged: p.deductionRate > 10,
      })),
  [products, selectedMonth]);

  // Trade spend data
  const tradeSpendData = useMemo(() =>
    [...products]
      .sort((a, b) => b.tradeSpendPerMonth[selectedMonth] - a.tradeSpendPerMonth[selectedMonth])
      .map(p => ({
        name: p.name.split(' ')[0],
        tradeSpend: p.tradeSpendPerMonth[selectedMonth],
        tradeSpendRate: p.tradeSpendRate,
      })),
  [products, selectedMonth]);

  // Alerts
  const alerts = useMemo(() => {
    const list = [];
    products.forEach(p => {
      if (p.deductionRate > 10) {
        list.push({ type: 'deduction', product: p, message: `Deduction rate ${p.deductionRate}% exceeds 10% threshold` });
      }
      if (p.tradeSpendRate > 8) {
        list.push({ type: 'tradeSpend', product: p, message: `Trade spend ${p.tradeSpendRate}% exceeds 8% threshold` });
      }
      // Check if no scheduled price review in 90+ days
      const latestReview = [
        ...p.priceHistory.map(h => new Date(h.date)),
        ...p.scheduledPriceChanges.map(c => new Date(c.effectiveDate)),
      ].sort((a, b) => b - a)[0];
      const daysSince = latestReview ? Math.floor((today - latestReview) / 86400000) : 999;
      if (daysSince > 90) {
        list.push({ type: 'noReview', product: p, message: `No price review in ${daysSince} days` });
      }
    });
    return list;
  }, [products]);

  // Promo calendar — next 6 months
  const promoStart = new Date(today); promoStart.setMonth(promoStart.getMonth() - 1);
  const promoEnd = new Date(today); promoEnd.setMonth(promoEnd.getMonth() + 5);
  const promoSpan = promoEnd - promoStart;
  const promoX = (date) => Math.max(0, Math.min(100, ((new Date(date) - promoStart) / promoSpan) * 100));
  const todayX = promoX(today);

  const PROMO_COLORS = ['#4CAF7D', '#6366F1', '#F59E0B', '#E05252', '#0EA5E9', '#A78BFA', '#F97316', '#10B981', '#EC4899', '#14B8A6'];

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 6, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{label}</div>
        {payload.map((e, i) => (
          <div key={i} style={{ fontSize: 13, fontWeight: 600, color: '#111', fontVariantNumeric: 'tabular-nums' }}>
            ${e.value.toLocaleString()}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Top stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Deductions MTD" value={`$${totalDeductionsMTD.toLocaleString()}`} delta={`${avgDeductionRate}% avg rate`} deltaType={parseFloat(avgDeductionRate) > 10 ? 'down' : 'up'} />
        <StatCard label="Avg Deduction Rate" value={`${avgDeductionRate}%`} delta={parseFloat(avgDeductionRate) > 10 ? 'Above threshold' : 'Within range'} deltaType={parseFloat(avgDeductionRate) > 10 ? 'down' : 'up'} />
        <StatCard label="Total Trade Spend MTD" value={`$${totalTradeSpendMTD.toLocaleString()}`} delta={`${(totalTradeSpendMTD / totalRevenueMTD * 100).toFixed(1)}% of revenue`} deltaType="neutral" />
        <StatCard label="Active Promos" value={activePromos} delta={activePromos > 0 ? 'Running now' : 'None active'} deltaType={activePromos > 0 ? 'up' : 'neutral'} />
      </div>

      {/* Section 1 — Deductions */}
      <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, marginBottom: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #E5E5E5',
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111' }}>Deductions Tracker</h3>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(parseInt(e.target.value))}
            style={selectStyle}
          >
            {MONTH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label} 2025</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 0 }}>
          {/* Table */}
          <div style={{ borderRight: '1px solid #F3F4F6', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['Product', 'Gross Rev', 'Deductions', 'Ded %', 'Net Rev'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deductionsTable.map((row, i) => (
                  <tr key={row.id} style={{
                    borderBottom: i < deductionsTable.length - 1 ? '1px solid #F3F4F6' : 'none',
                    background: row.isFlagged ? 'rgba(224,82,82,0.03)' : 'transparent',
                  }}>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {row.isFlagged && <AlertTriangle size={11} color="#E05252" />}
                        {row.name}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, fontVariantNumeric: 'tabular-nums' }}>${row.grossRevenue.toLocaleString()}</td>
                    <td style={{ ...tdStyle, fontVariantNumeric: 'tabular-nums', color: '#E05252' }}>${row.deductions.toLocaleString()}</td>
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: parseFloat(row.deductionPct) > 10 ? '#E05252' : '#4CAF7D',
                        background: parseFloat(row.deductionPct) > 10 ? 'rgba(224,82,82,0.08)' : 'rgba(76,175,125,0.08)',
                        borderRadius: 4, padding: '2px 6px',
                      }}>
                        {row.deductionPct}%
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>${row.netRevenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bar chart */}
          <div style={{ padding: '20px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Deductions by Product</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deductionsBarData} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="deductions" radius={[0, 3, 3, 0]} maxBarSize={16}
                  fill="#E05252"
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 2 — Trade Spend */}
      <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, marginBottom: 16 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E5E5' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111' }}>Trade Spend</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div style={{ padding: '20px 24px', borderRight: '1px solid #F3F4F6' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tradeSpendData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="tradeSpend" fill="#6366F1" radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['Product', 'Trade Spend $', 'Trade Spend %', 'Revenue Impact'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...products]
                  .sort((a, b) => b.tradeSpendPerMonth[selectedMonth] - a.tradeSpendPerMonth[selectedMonth])
                  .map((p, i, arr) => (
                    <tr key={p.id} style={{ borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>{p.name}</td>
                      <td style={{ ...tdStyle, fontVariantNumeric: 'tabular-nums' }}>${p.tradeSpendPerMonth[selectedMonth].toLocaleString()}</td>
                      <td style={tdStyle}>
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          color: p.tradeSpendRate > 8 ? '#E05252' : '#6B7280',
                          background: p.tradeSpendRate > 8 ? 'rgba(224,82,82,0.08)' : '#F3F4F6',
                          borderRadius: 4, padding: '2px 6px',
                        }}>
                          {p.tradeSpendRate}%
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: '#E05252', fontVariantNumeric: 'tabular-nums' }}>
                        -${p.tradeSpendPerMonth[selectedMonth].toLocaleString()}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 3 — Promo Calendar */}
      <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, marginBottom: 16, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111' }}>Promo Calendar</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} color="#9CA3AF" />
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
              {promoStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} —{' '}
              {promoEnd.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          {/* Today line */}
          <div style={{
            position: 'absolute', left: `calc(${todayX}% + 120px)`, top: 0, bottom: 0,
            width: 1, background: '#4CAF7D', zIndex: 10, pointerEvents: 'none',
          }} />

          {products.map((p, pi) => {
            const promos = p.promoWindows.filter(w => {
              const s = new Date(w.start), e = new Date(w.end);
              return e >= promoStart && s <= promoEnd;
            });
            if (promos.length === 0) return null;
            const color = PROMO_COLORS[pi % PROMO_COLORS.length];
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, height: 28 }}>
                <div style={{ width: 120, flexShrink: 0, fontSize: 12, fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>
                  {p.name}
                </div>
                <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                  {promos.map((w, wi) => {
                    const x1 = promoX(w.start), x2 = promoX(w.end);
                    const width = Math.max(x2 - x1, 2);
                    return (
                      <div
                        key={wi}
                        title={`${w.label}: ${new Date(w.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(w.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        style={{
                          position: 'absolute',
                          left: `${x1}%`,
                          width: `${width}%`,
                          top: 4, height: 20,
                          background: color,
                          borderRadius: 4,
                          opacity: 0.85,
                          display: 'flex', alignItems: 'center', overflow: 'hidden',
                          paddingLeft: 6,
                        }}
                      >
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {w.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }).filter(Boolean)}
        </div>
      </div>

      {/* Section 4 — Alerts */}
      {alerts.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, padding: '20px 24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#111' }}>
            Alerts
            <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 700, color: '#E05252', background: 'rgba(224,82,82,0.08)', borderRadius: 99, padding: '2px 8px' }}>
              {alerts.length}
            </span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alerts.map((alert, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: 7,
                background: alert.type === 'noReview' ? 'rgba(245,158,11,0.05)' : 'rgba(224,82,82,0.04)',
                border: `1px solid ${alert.type === 'noReview' ? 'rgba(245,158,11,0.2)' : 'rgba(224,82,82,0.15)'}`,
                gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <AlertTriangle size={14} color={alert.type === 'noReview' ? '#F59E0B' : '#E05252'} style={{ marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 2 }}>{alert.product.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{alert.message}</div>
                  </div>
                </div>
                <button
                  onClick={() => navigateToProduct(alert.product.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: 'transparent', border: '1px solid #E5E5E5',
                    borderRadius: 5, padding: '4px 10px', fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', color: '#374151', flexShrink: 0, fontFamily: 'Inter',
                  }}
                >
                  View Product <ExternalLink size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9CA3AF', whiteSpace: 'nowrap' };
const tdStyle = { padding: '9px 14px', color: '#374151', verticalAlign: 'middle' };
const selectStyle = { border: '1px solid #E5E5E5', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#374151', background: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', outline: 'none' };
