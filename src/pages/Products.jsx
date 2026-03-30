import { useState, useMemo } from 'react';
import { Search, Edit3, Save, X, ChevronDown, Plus } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useApp } from '../context/AppContext';
import PriceTimeline from '../components/PriceTimeline';
import NewProductModal from '../components/NewProductModal';
import { MONTHS_LABELS } from '../data/mockData';

const ELASTICITY = 0.5; // 5% units per $0.10

export default function Products() {
  const { products, selectedProduct, setSelectedProduct, updateProduct, addToast } = useApp();
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({});
  const [simPrice, setSimPrice] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [newProductOpen, setNewProductOpen] = useState(false);

  const product = products.find(p => p.id === selectedProduct) || null;

  // Initialize edit fields when switching products
  const startEdit = () => {
    if (!product) return;
    setEditFields({
      name: product.name,
      unitPrice: String(product.unitPrice),
      description: product.description,
      category: product.category,
    });
    setIsEditing(true);
  };

  const saveEdit = () => {
    const price = parseFloat(editFields.unitPrice);
    if (isNaN(price) || price <= 0) return;
    updateProduct(product.id, {
      name: editFields.name,
      unitPrice: price,
      casePrice: parseFloat((price * product.casePack).toFixed(2)),
      description: editFields.description,
      category: editFields.category,
    });
    setIsEditing(false);
    addToast('Product updated');
  };

  // Simulator
  const currentPrice = product?.unitPrice || 0;
  const hypotheticalPrice = simPrice !== null ? parseFloat(simPrice) : currentPrice;
  const priceDiff = hypotheticalPrice - currentPrice;
  const unitMultiplier = 1 + (-priceDiff / 0.10) * (ELASTICITY / 10);
  const baseUnits = product ? product.unitsPerMonth[product.unitsPerMonth.length - 1] : 0;
  const simUnits = Math.round(baseUnits * unitMultiplier);
  const simRevenue = simUnits * hypotheticalPrice;
  const currentRevenue = product ? product.revenuePerMonth[product.revenuePerMonth.length - 1] : 0;
  const simMarginApprox = product ? product.margin + (priceDiff * 10) : 0;

  // Chart data
  const monthlyData = product
    ? MONTHS_LABELS.map((m, i) => ({
        month: m,
        units: product.unitsPerMonth[i],
        revenue: product.revenuePerMonth[i],
        margin: product.marginPerMonth[i],
      }))
    : [];

  const priceLineData = product
    ? product.priceHistory.map(h => ({ date: h.date, price: h.price }))
    : [];

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  // Custom tooltip
  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 6, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{label}</div>
        {payload.map((entry, i) => (
          <div key={i} style={{ fontSize: 13, fontWeight: 600, color: '#111', fontVariantNumeric: 'tabular-nums' }}>
            {typeof entry.value === 'number' && entry.value > 100
              ? `$${entry.value.toLocaleString()}`
              : typeof entry.value === 'number' && entry.name === 'margin'
              ? `${entry.value}%`
              : entry.value?.toLocaleString()
            }
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Product selector */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
        <div
          onClick={() => setDropdownOpen(d => !d)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8,
            padding: '10px 14px', cursor: 'pointer', maxWidth: 360,
            transition: 'border-color 150ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#4CAF7D'}
          onMouseLeave={e => !dropdownOpen && (e.currentTarget.style.borderColor = '#E5E5E5')}
        >
          {product ? (
            <>
              <div style={{ width: 20, height: 20, borderRadius: 4, background: product.placeholderColor, flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111', flex: 1 }}>{product.name}</span>
            </>
          ) : (
            <span style={{ fontSize: 14, color: '#9CA3AF', flex: 1 }}>Select a product to explore…</span>
          )}
          <ChevronDown size={14} color="#9CA3AF" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }} />
        </div>

        {dropdownOpen && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, zIndex: 200,
            background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: 360, marginTop: 4, overflow: 'hidden',
          }}>
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Search size={13} color="#9CA3AF" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search products…"
                  style={{ border: 'none', outline: 'none', fontSize: 13, color: '#111', flex: 1, fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {filtered.map(p => (
                <div
                  key={p.id}
                  onClick={() => { setSelectedProduct(p.id); setDropdownOpen(false); setSimPrice(null); setIsEditing(false); setSearch(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    cursor: 'pointer', background: p.id === selectedProduct ? 'rgba(76,175,125,0.06)' : 'transparent',
                    transition: 'background 100ms ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = p.id === selectedProduct ? 'rgba(76,175,125,0.06)' : 'transparent'}
                >
                  <div style={{ width: 18, height: 18, borderRadius: 3, background: p.placeholderColor, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{p.category} · ${p.unitPrice.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>{/* close position:relative inner wrapper */}

        {/* New Product button */}
        <button
          onClick={() => setNewProductOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#4CAF7D', color: '#fff', border: 'none',
            borderRadius: 7, padding: '10px 16px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <Plus size={14} /> New Product
        </button>
      </div>

      {/* Empty state */}
      {!product && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 340, gap: 16,
        }}>
          <div style={{ fontSize: 48, opacity: 0.15 }}>📦</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>Select a product to explore</div>
          <div style={{ fontSize: 13, color: '#9CA3AF' }}>Use the dropdown above or click any tile on the Overview tab.</div>
        </div>
      )}

      {/* Product detail */}
      {product && (
        <div>
          {/* Header */}
          <div style={{
            background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8,
            padding: '20px 24px', marginBottom: 16,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
          }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: product.placeholderColor, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {isEditing ? (
                  <input
                    value={editFields.name}
                    onChange={e => setEditFields(f => ({ ...f, name: e.target.value }))}
                    style={{
                      fontSize: 20, fontWeight: 700, color: '#111', border: '1px solid #D1D5DB',
                      borderRadius: 5, padding: '2px 8px', fontFamily: 'Inter, sans-serif',
                      marginBottom: 6, display: 'block', width: '100%', maxWidth: 300,
                    }}
                  />
                ) : (
                  <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: '#111' }}>{product.name}</h2>
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#6B7280', background: '#F3F4F6', borderRadius: 4, padding: '2px 7px', fontWeight: 500 }}>
                    {product.category}
                  </span>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                    SKU: <code style={{ fontSize: 11 }}>{product.id}</code>
                  </span>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>Updated {product.lastUpdated}</span>
                </div>
                {isEditing ? (
                  <textarea
                    value={editFields.description}
                    onChange={e => setEditFields(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    style={{ marginTop: 8, fontSize: 13, color: '#6B7280', border: '1px solid #D1D5DB', borderRadius: 5, padding: '6px 8px', fontFamily: 'Inter, sans-serif', width: '100%', resize: 'vertical' }}
                  />
                ) : (
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{product.description}</p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={editFields.unitPrice}
                    onChange={e => setEditFields(f => ({ ...f, unitPrice: e.target.value }))}
                    style={{ fontSize: 24, fontWeight: 700, color: '#111', border: '1px solid #D1D5DB', borderRadius: 5, padding: '2px 8px', fontFamily: 'Inter, sans-serif', width: 100, textAlign: 'right' }}
                  />
                ) : (
                  <div style={{ fontSize: 26, fontWeight: 700, color: '#111', fontVariantNumeric: 'tabular-nums' }}>
                    ${product.unitPrice.toFixed(2)}
                  </div>
                )}
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                  ${product.casePrice.toFixed(2)} case · {product.casePack}pk
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: product.margin >= 40 ? '#4CAF7D' : '#6B7280',
                  background: product.margin >= 40 ? 'rgba(76,175,125,0.1)' : '#F3F4F6',
                  borderRadius: 5, padding: '3px 10px',
                }}>
                  {product.margin}% margin
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {isEditing ? (
                  <>
                    <button onClick={saveEdit} style={{ ...btnStyle, background: '#4CAF7D', color: '#fff', borderColor: '#4CAF7D' }}>
                      <Save size={13} /> Save
                    </button>
                    <button onClick={() => setIsEditing(false)} style={{ ...btnStyle, color: '#6B7280' }}>
                      <X size={13} /> Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={startEdit} style={{ ...btnStyle, color: '#374151' }}>
                    <Edit3 size={13} /> Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Price Timeline */}
          <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
            <h3 style={sectionTitle}>Price Timeline</h3>
            <PriceTimeline
              priceHistory={product.priceHistory}
              scheduledChanges={product.scheduledPriceChanges}
            />
          </div>

          {/* Charts 2x2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {/* Units sold */}
            <div style={chartCard}>
              <h4 style={chartTitle}>Units Sold / Month</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="units" fill="#4CAF7D" radius={[3, 3, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue */}
            <div style={chartCard}>
              <h4 style={chartTitle}>Monthly Revenue</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="revenue" fill="#7CB5A0" radius={[3, 3, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Price history line */}
            <div style={chartCard}>
              <h4 style={chartTitle}>Unit Price History</h4>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={priceLineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false}
                    tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toFixed(2)}`} domain={['auto', 'auto']} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="price" stroke="#4CAF7D" strokeWidth={2} dot={{ r: 4, fill: '#4CAF7D', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Margin */}
            <div style={chartCard}>
              <h4 style={chartTitle}>Margin % / Month</h4>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={monthlyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={v => `${v}%`} />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine y={40} stroke="#E5E5E5" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="margin" stroke="#A78BFA" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Price Simulator */}
          <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, padding: '20px 24px' }}>
            <h3 style={sectionTitle}>Price Simulator</h3>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 20px' }}>
              Adjust the hypothetical unit price to see projected impact on revenue and margin.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <span style={{ fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>Set price:</span>
              <input
                type="range"
                min={Math.max(0.5, currentPrice - 1.5).toFixed(2)}
                max={(currentPrice + 1.5).toFixed(2)}
                step="0.01"
                value={hypotheticalPrice}
                onChange={e => setSimPrice(e.target.value)}
                style={{ flex: 1, accentColor: '#4CAF7D' }}
              />
              <div style={{
                fontSize: 22, fontWeight: 700, color: '#111',
                background: '#F9FAFB', border: '1px solid #E5E5E5', borderRadius: 6,
                padding: '4px 14px', minWidth: 80, textAlign: 'center',
                fontVariantNumeric: 'tabular-nums',
              }}>
                ${hypotheticalPrice.toFixed ? hypotheticalPrice.toFixed(2) : parseFloat(hypotheticalPrice).toFixed(2)}
              </div>
              <button
                onClick={() => setSimPrice(null)}
                style={{ fontSize: 12, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Inter' }}
              >
                Reset
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                {
                  label: 'Projected Units',
                  current: baseUnits.toLocaleString(),
                  projected: simUnits.toLocaleString(),
                  delta: simUnits - baseUnits,
                  isPositive: simUnits >= baseUnits,
                  fmt: v => v.toLocaleString(),
                },
                {
                  label: 'Projected Revenue',
                  current: `$${currentRevenue.toLocaleString()}`,
                  projected: `$${Math.round(simRevenue).toLocaleString()}`,
                  delta: Math.round(simRevenue - currentRevenue),
                  isPositive: simRevenue >= currentRevenue,
                  fmt: v => `${v >= 0 ? '+' : ''}$${Math.abs(v).toLocaleString()}`,
                },
                {
                  label: 'Projected Margin',
                  current: `${product.margin}%`,
                  projected: `${Math.max(0, simMarginApprox).toFixed(1)}%`,
                  delta: simMarginApprox - product.margin,
                  isPositive: simMarginApprox >= product.margin,
                  fmt: v => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`,
                },
              ].map(item => (
                <div key={item.label} style={{
                  background: '#F9FAFB', borderRadius: 8, padding: '14px 16px',
                  border: '1px solid #E5E5E5',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#111', fontVariantNumeric: 'tabular-nums' }}>
                    {item.projected}
                  </div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                    vs {item.current} currently
                  </div>
                  {simPrice !== null && simPrice != currentPrice && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: item.isPositive ? '#4CAF7D' : '#E05252', marginTop: 6 }}>
                      {item.fmt(item.delta)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <NewProductModal isOpen={newProductOpen} onClose={() => setNewProductOpen(false)} />
    </div>
  );
}

const sectionTitle = {
  margin: '0 0 4px',
  fontSize: 16,
  fontWeight: 600,
  color: '#111',
};
const chartCard = {
  background: '#fff',
  border: '1px solid #E5E5E5',
  borderRadius: 8,
  padding: '16px 20px',
};
const chartTitle = {
  margin: '0 0 12px',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
};
const btnStyle = {
  display: 'flex', alignItems: 'center', gap: 5,
  background: 'transparent', border: '1px solid #E5E5E5',
  borderRadius: 6, padding: '6px 12px', fontSize: 12,
  fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
};
