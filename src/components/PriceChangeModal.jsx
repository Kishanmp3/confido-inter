import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PriceChangeModal({ isOpen, onClose, editChange = null }) {
  const { products, addScheduledChange, editScheduledChange, addToast } = useApp();

  const [productId, setProductId] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editChange) {
      setProductId(editChange.productId);
      setNewPrice(String(editChange.newPrice));
      setEffectiveDate(editChange.effectiveDate);
      setNotes(editChange.notes || '');
    } else {
      setProductId('');
      setNewPrice('');
      setEffectiveDate('');
      setNotes('');
    }
    setErrors({});
  }, [editChange, isOpen]);

  const validate = () => {
    const e = {};
    if (!productId) e.productId = 'Select a product';
    if (!newPrice || isNaN(parseFloat(newPrice)) || parseFloat(newPrice) <= 0) e.newPrice = 'Enter a valid price';
    if (!effectiveDate) e.effectiveDate = 'Select a date';
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const price = parseFloat(parseFloat(newPrice).toFixed(2));

    if (editChange) {
      editScheduledChange(editChange.productId, editChange.id, {
        newPrice: price,
        effectiveDate,
        notes,
      });
      addToast('Price change updated');
    } else {
      const id = `pc-${Date.now()}`;
      addScheduledChange(productId, { id, newPrice: price, effectiveDate, notes });
      addToast('Price change scheduled');
    }
    onClose();
  };

  if (!isOpen) return null;

  const selectedProduct = products.find(p => p.id === productId);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: '#fff',
        borderRadius: 10,
        width: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid #E5E5E5',
        }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111' }}>
            {editChange ? 'Edit Price Change' : 'Schedule Price Change'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Product */}
          <div>
            <label style={labelStyle}>Product</label>
            <select
              value={productId}
              onChange={e => { setProductId(e.target.value); setErrors(prev => ({ ...prev, productId: null })); }}
              disabled={!!editChange}
              style={{ ...inputStyle, color: productId ? '#111' : '#9CA3AF' }}
            >
              <option value="">Select a product…</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.productId && <div style={errorStyle}>{errors.productId}</div>}
          </div>

          {/* Current price reference */}
          {selectedProduct && (
            <div style={{ fontSize: 12, color: '#6B7280', background: '#F9FAFB', borderRadius: 6, padding: '8px 12px' }}>
              Current price: <strong style={{ color: '#111', fontVariantNumeric: 'tabular-nums' }}>${selectedProduct.unitPrice.toFixed(2)}</strong>
            </div>
          )}

          {/* New price */}
          <div>
            <label style={labelStyle}>New Unit Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={newPrice}
              onChange={e => { setNewPrice(e.target.value); setErrors(prev => ({ ...prev, newPrice: null })); }}
              style={inputStyle}
            />
            {errors.newPrice && <div style={errorStyle}>{errors.newPrice}</div>}
          </div>

          {/* Effective date */}
          <div>
            <label style={labelStyle}>Effective Date</label>
            <input
              type="date"
              value={effectiveDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => { setEffectiveDate(e.target.value); setErrors(prev => ({ ...prev, effectiveDate: null })); }}
              style={inputStyle}
            />
            {errors.effectiveDate && <div style={errorStyle}>{errors.effectiveDate}</div>}
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Q2 pricing update, cost pass-through…"
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 56 }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid #E5E5E5',
          display: 'flex', gap: 10, justifyContent: 'flex-end',
        }}>
          <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          <button onClick={handleSave} style={saveBtnStyle}>
            {editChange ? 'Save Changes' : 'Schedule Change'}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
  letterSpacing: '0.02em',
};
const inputStyle = {
  width: '100%',
  padding: '9px 11px',
  border: '1px solid #D1D5DB',
  borderRadius: 6,
  fontSize: 14,
  color: '#111',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'Inter, sans-serif',
};
const errorStyle = {
  fontSize: 11,
  color: '#E05252',
  marginTop: 4,
};
const saveBtnStyle = {
  background: '#4CAF7D',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '8px 18px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
};
const cancelBtnStyle = {
  background: 'transparent',
  color: '#6B7280',
  border: '1px solid #D1D5DB',
  borderRadius: 6,
  padding: '8px 18px',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
};
