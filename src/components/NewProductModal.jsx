import { useState } from 'react';
import { X, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';

const PLACEHOLDER_COLORS = [
  '#4CAF7D', '#6366F1', '#F59E0B', '#E05252', '#0EA5E9',
  '#A78BFA', '#F97316', '#10B981', '#EC4899', '#8B5E3C',
  '#7B3F7A', '#C0392B', '#5B2C8D', '#E8637A', '#E67E22',
  '#27AE60', '#1ABC9C', '#6D4C41', '#F4D03F', '#2980B9',
];

const CATEGORY_SUGGESTIONS = ['Cola', 'Fruit', 'Citrus', 'Dessert', 'Ginger', 'Tropical'];

// Generate plausible monthly arrays from a few key inputs
function generateMonthlyData(unitPrice, margin, casePack) {
  // Base units: rough inverse of price, with seasonal bump mid-year
  const baseUnits = Math.round((12000 / unitPrice) * (margin / 40));
  const seasonal = [0.85, 0.88, 0.93, 1.02, 1.15, 1.12, 1.08, 1.03, 0.97, 0.92, 0.88, 0.91];

  const unitsPerMonth = seasonal.map(s =>
    Math.round(baseUnits * s * (0.92 + Math.random() * 0.16))
  );
  const revenuePerMonth = unitsPerMonth.map(u => Math.round(u * unitPrice));
  const marginPerMonth = seasonal.map(s =>
    parseFloat((margin * (0.98 + s * 0.02) * (0.99 + Math.random() * 0.02)).toFixed(1))
  );
  const deductionRate = parseFloat((6 + Math.random() * 5).toFixed(1));
  const tradeSpendRate = parseFloat((4 + Math.random() * 3).toFixed(1));
  const deductionsPerMonth = revenuePerMonth.map(r => Math.round(r * deductionRate / 100));
  const tradeSpendPerMonth = revenuePerMonth.map(r => Math.round(r * tradeSpendRate / 100));

  return { unitsPerMonth, revenuePerMonth, marginPerMonth, deductionsPerMonth, tradeSpendPerMonth, deductionRate, tradeSpendRate };
}

const STEPS = ['Details', 'Pricing', 'Review'];

export default function NewProductModal({ isOpen, onClose }) {
  const { addProduct, setSelectedProduct, setActiveTab, addToast } = useApp();

  const [step, setStep] = useState(0);
  const [fields, setFields] = useState({
    name: '',
    category: '',
    description: '',
    unitPrice: '',
    casePack: '12',
    margin: '',
    color: PLACEHOLDER_COLORS[0],
    launchDate: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setFields(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: null }));
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!fields.name.trim()) e.name = 'Product name is required';
      if (!fields.category.trim()) e.category = 'Category is required';
    }
    if (step === 1) {
      if (!fields.unitPrice || isNaN(parseFloat(fields.unitPrice)) || parseFloat(fields.unitPrice) <= 0)
        e.unitPrice = 'Enter a valid price';
      if (!fields.margin || isNaN(parseFloat(fields.margin)) || parseFloat(fields.margin) <= 0 || parseFloat(fields.margin) >= 100)
        e.margin = 'Enter a margin between 1–99%';
    }
    return e;
  };

  const handleNext = () => {
    const e = validateStep();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setStep(s => s + 1);
  };

  const handleCreate = () => {
    const price = parseFloat(parseFloat(fields.unitPrice).toFixed(2));
    const margin = parseFloat(parseFloat(fields.margin).toFixed(1));
    const casePack = parseInt(fields.casePack) || 12;

    const slug = fields.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `custom-${slug}-${Date.now()}`;

    const monthly = generateMonthlyData(price, margin, casePack);

    const newProduct = {
      id,
      name: fields.name.trim(),
      category: fields.category.trim(),
      description: fields.description.trim() || `${fields.name} — a new addition to the catalog.`,
      placeholderColor: fields.color,
      unitPrice: price,
      casePrice: parseFloat((price * casePack).toFixed(2)),
      casePack,
      margin,
      msrp: parseFloat((price * 1.15).toFixed(2)),
      ...monthly,
      priceHistory: [
        { date: fields.launchDate, price, notes: 'Launch price' },
      ],
      scheduledPriceChanges: [],
      promoWindows: [],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    addProduct(newProduct);
    addToast(`"${newProduct.name}" added to catalog`);
    handleClose();

    // Navigate to new product
    setSelectedProduct(id);
    setActiveTab('products');
  };

  const handleClose = () => {
    onClose();
    // Reset after close animation
    setTimeout(() => {
      setStep(0);
      setFields({
        name: '', category: '', description: '',
        unitPrice: '', casePack: '12', margin: '',
        color: PLACEHOLDER_COLORS[0],
        launchDate: new Date().toISOString().split('T')[0],
      });
      setErrors({});
    }, 200);
  };

  if (!isOpen) return null;

  const price = parseFloat(fields.unitPrice) || 0;
  const margin = parseFloat(fields.margin) || 0;
  const casePack = parseInt(fields.casePack) || 12;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: 10, width: 500,
        boxShadow: '0 24px 64px rgba(0,0,0,0.16)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid #E5E5E5',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 7,
              background: fields.color || '#4CAF7D',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 150ms ease',
            }}>
              <Package size={15} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111' }}>New Product</h3>
              <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>
                {fields.name || 'Untitled product'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E5E5E5' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              fontSize: 12, fontWeight: i === step ? 600 : 400,
              color: i === step ? '#4CAF7D' : i < step ? '#111' : '#9CA3AF',
              borderBottom: i === step ? '2px solid #4CAF7D' : '2px solid transparent',
              cursor: i < step ? 'pointer' : 'default',
            }} onClick={() => i < step && setStep(i)}>
              {i < step ? '✓ ' : ''}{s}
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: 24, minHeight: 300 }}>

          {/* Step 0 — Details */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>Product Name</label>
                <input
                  autoFocus
                  value={fields.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Mango Habanero"
                  style={{ ...inputStyle, borderColor: errors.name ? '#E05252' : '#D1D5DB' }}
                />
                {errors.name && <div style={errorStyle}>{errors.name}</div>}
              </div>

              {/* Category */}
              <div>
                <label style={labelStyle}>Category</label>
                <input
                  list="category-suggestions"
                  value={fields.category}
                  onChange={e => set('category', e.target.value)}
                  placeholder="e.g. Fruit, Cola, Citrus…"
                  style={{ ...inputStyle, borderColor: errors.category ? '#E05252' : '#D1D5DB' }}
                />
                <datalist id="category-suggestions">
                  {CATEGORY_SUGGESTIONS.map(c => <option key={c} value={c} />)}
                </datalist>
                {errors.category && <div style={errorStyle}>{errors.category}</div>}
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>
                  Description <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={fields.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Brief product description…"
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
                />
              </div>

              {/* Color picker */}
              <div>
                <label style={labelStyle}>Product Color</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {PLACEHOLDER_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => set('color', c)}
                      style={{
                        width: 24, height: 24, borderRadius: 5, background: c,
                        border: fields.color === c ? '2px solid #111' : '2px solid transparent',
                        cursor: 'pointer', padding: 0, outline: 'none',
                        boxShadow: fields.color === c ? '0 0 0 1px #fff inset' : 'none',
                        transition: 'transform 100ms ease',
                        transform: fields.color === c ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Pricing */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Unit Price */}
                <div>
                  <label style={labelStyle}>Unit Price ($)</label>
                  <input
                    autoFocus
                    type="number" step="0.01" min="0.01"
                    placeholder="2.99"
                    value={fields.unitPrice}
                    onChange={e => set('unitPrice', e.target.value)}
                    style={{ ...inputStyle, borderColor: errors.unitPrice ? '#E05252' : '#D1D5DB' }}
                  />
                  {errors.unitPrice && <div style={errorStyle}>{errors.unitPrice}</div>}
                </div>

                {/* Case Pack */}
                <div>
                  <label style={labelStyle}>Case Pack (units)</label>
                  <select value={fields.casePack} onChange={e => set('casePack', e.target.value)} style={inputStyle}>
                    {[6, 8, 12, 16, 24].map(n => <option key={n} value={n}>{n} units</option>)}
                  </select>
                </div>

                {/* Margin */}
                <div>
                  <label style={labelStyle}>Gross Margin (%)</label>
                  <input
                    type="number" step="0.1" min="1" max="99"
                    placeholder="42.0"
                    value={fields.margin}
                    onChange={e => set('margin', e.target.value)}
                    style={{ ...inputStyle, borderColor: errors.margin ? '#E05252' : '#D1D5DB' }}
                  />
                  {errors.margin && <div style={errorStyle}>{errors.margin}</div>}
                </div>

                {/* Launch date */}
                <div>
                  <label style={labelStyle}>Launch Date</label>
                  <input
                    type="date"
                    value={fields.launchDate}
                    onChange={e => set('launchDate', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Live preview */}
              {price > 0 && margin > 0 && (
                <div style={{
                  background: '#F9FAFB', borderRadius: 8, padding: '14px 16px',
                  border: '1px solid #E5E5E5', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12,
                }}>
                  <div>
                    <div style={previewLabel}>Case Price</div>
                    <div style={previewValue}>${(price * casePack).toFixed(2)}</div>
                    <div style={previewSub}>{casePack}-pack</div>
                  </div>
                  <div>
                    <div style={previewLabel}>MSRP (est.)</div>
                    <div style={previewValue}>${(price * 1.15).toFixed(2)}</div>
                    <div style={previewSub}>+15% over unit</div>
                  </div>
                  <div>
                    <div style={previewLabel}>COGS (est.)</div>
                    <div style={previewValue}>${(price * (1 - margin / 100)).toFixed(2)}</div>
                    <div style={previewSub}>per unit</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Review */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: fields.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>{fields.name}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', background: '#F3F4F6', borderRadius: 4, padding: '2px 7px' }}>
                      {fields.category}
                    </span>
                  </div>
                </div>
              </div>
              {[
                ['Unit Price', `$${price.toFixed(2)}`],
                ['Case Price', `$${(price * casePack).toFixed(2)} (${casePack}-pack)`],
                ['Gross Margin', `${margin}%`],
                ['Launch Date', new Date(fields.launchDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })],
                ...(fields.description ? [['Description', fields.description]] : []),
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: 'flex', gap: 16, padding: '10px 0',
                  borderBottom: '1px solid #F3F4F6',
                }}>
                  <div style={{ width: 120, flexShrink: 0, fontSize: 12, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</div>
                  <div style={{ fontSize: 13, color: '#111', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
              <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(76,175,125,0.06)', borderRadius: 7, border: '1px solid rgba(76,175,125,0.2)' }}>
                <p style={{ margin: 0, fontSize: 12, color: '#4CAF7D' }}>
                  Monthly volume, revenue, and financial estimates will be auto-generated from your pricing inputs.
                  You can update any field after creation from the product detail view.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid #E5E5E5',
          display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center',
        }}>
          <button
            onClick={step === 0 ? handleClose : () => setStep(s => s - 1)}
            style={cancelBtnStyle}
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          {step < 2 ? (
            <button onClick={handleNext} style={primaryBtnStyle}>
              Continue →
            </button>
          ) : (
            <button onClick={handleCreate} style={{ ...primaryBtnStyle, background: '#4CAF7D' }}>
              Add to Catalog
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#374151',
  marginBottom: 6, letterSpacing: '0.02em',
};
const inputStyle = {
  width: '100%', padding: '9px 11px', border: '1px solid #D1D5DB',
  borderRadius: 6, fontSize: 14, color: '#111', background: '#fff',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
};
const errorStyle = { fontSize: 11, color: '#E05252', marginTop: 4 };
const previewLabel = { fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 4 };
const previewValue = { fontSize: 18, fontWeight: 700, color: '#111', fontVariantNumeric: 'tabular-nums' };
const previewSub = { fontSize: 11, color: '#9CA3AF', marginTop: 2 };
const primaryBtnStyle = {
  background: '#111', color: '#fff', border: 'none', borderRadius: 6,
  padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
};
const cancelBtnStyle = {
  background: 'transparent', color: '#6B7280', border: '1px solid #D1D5DB',
  borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
};
