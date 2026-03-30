import { useState, useRef } from 'react';
import { X, Upload, CheckCircle, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

const FAKE_ROWS = [
  { name: 'Honey Vanilla Crème', category: 'Dessert', unitPrice: 3.19, margin: '44.2%', sku: 'OLI-HVC-001' },
  { name: 'Tropical Punch',      category: 'Fruit',   unitPrice: 2.99, margin: '41.8%', sku: 'OLI-TP-002' },
  { name: 'Root Beer',           category: 'Cola',    unitPrice: 2.99, margin: '40.3%', sku: 'OLI-RB-003' },
  { name: 'Crispy Apple',        category: 'Fruit',   unitPrice: 3.29, margin: '43.1%', sku: 'OLI-CA-004' },
  { name: 'Grape Cream',         category: 'Dessert', unitPrice: 3.19, margin: '42.6%', sku: 'OLI-GC-005' },
];

export default function UploadModal({ isOpen, onClose }) {
  const { addToast } = useApp();
  const [step, setStep] = useState('idle'); // idle | uploading | preview | done
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    setFileName(file.name || 'products_import.csv');
    setFileSize(file.size ? `${(file.size / 1024).toFixed(1)} KB` : '84.2 KB');
    setStep('uploading');
    setProgress(0);

    // Animate progress
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 8;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => setStep('preview'), 200);
      }
      setProgress(Math.min(100, p));
    }, 80);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file || { name: 'products_import.csv', size: 86220 });
  };

  const handleConfirm = () => {
    setStep('done');
    setTimeout(() => {
      onClose();
      setStep('idle');
      setProgress(0);
      addToast('10 products imported successfully');
    }, 800);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep('idle'); setProgress(0); }, 300);
  };

  if (!isOpen) return null;

  const stepIndex = { idle: 0, uploading: 0, preview: 1, done: 2 }[step] ?? 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div style={{
        background: '#fff', borderRadius: 10, width: 540,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid #E5E5E5',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111' }}>Import Products</h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9CA3AF' }}>CSV or Excel — up to 500 rows</p>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Steps indicator */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E5E5E5' }}>
          {['Upload', 'Preview', 'Confirm'].map((s, i) => (
            <div key={s} style={{
              flex: 1,
              padding: '10px 16px',
              fontSize: 12,
              fontWeight: i === stepIndex ? 600 : 400,
              color: i === stepIndex ? '#4CAF7D' : i < stepIndex ? '#111' : '#9CA3AF',
              borderBottom: i === stepIndex ? '2px solid #4CAF7D' : '2px solid transparent',
              textAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {i < stepIndex && <CheckCircle size={12} color="#4CAF7D" />}
              {s}
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          {(step === 'idle') && (
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              style={{
                border: '2px dashed #D1D5DB',
                borderRadius: 8,
                padding: '40px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 150ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#4CAF7D'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#D1D5DB'}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={32} color="#9CA3AF" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Drag your CSV or Excel file here
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
                Supports .csv, .xlsx, .xls
              </div>
              <button
                style={{
                  background: '#F9FAFB', border: '1px solid #D1D5DB', borderRadius: 6,
                  padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  color: '#374151', fontFamily: 'Inter, sans-serif',
                }}
              >
                Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                style={{ display: 'none' }}
                onChange={e => handleFileSelect(e.target.files[0])}
              />
            </div>
          )}

          {step === 'uploading' && (
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <FileText size={20} color="#4CAF7D" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{fileName}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{fileSize}</div>
                </div>
              </div>
              <div style={{ background: '#F3F4F6', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: '#4CAF7D',
                  borderRadius: 99,
                  transition: 'width 80ms ease',
                }} />
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 8, textAlign: 'right' }}>
                {Math.round(progress)}%
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div>
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
                Found <strong style={{ color: '#111' }}>10 products</strong> ready to import. Preview (first 5):
              </div>
              <div style={{ overflow: 'auto', borderRadius: 6, border: '1px solid #E5E5E5' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E5E5' }}>
                      {['SKU', 'Name', 'Category', 'Unit Price', 'Margin'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FAKE_ROWS.map((row, i) => (
                      <tr key={i} style={{ borderBottom: i < FAKE_ROWS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                        <td style={{ padding: '8px 12px', color: '#9CA3AF', fontFamily: 'monospace', fontSize: 11 }}>{row.sku}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 500, color: '#111' }}>{row.name}</td>
                        <td style={{ padding: '8px 12px', color: '#6B7280' }}>{row.category}</td>
                        <td style={{ padding: '8px 12px', fontVariantNumeric: 'tabular-nums', color: '#111' }}>${row.unitPrice.toFixed(2)}</td>
                        <td style={{ padding: '8px 12px', color: '#4CAF7D', fontWeight: 600 }}>{row.margin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <CheckCircle size={40} color="#4CAF7D" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Import complete</div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(step === 'idle' || step === 'preview') && (
          <div style={{
            padding: '14px 24px', borderTop: '1px solid #E5E5E5',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <button onClick={handleClose} style={cancelBtnStyle}>Cancel</button>
            {step === 'preview' && (
              <button onClick={handleConfirm} style={saveBtnStyle}>
                Confirm Import
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const saveBtnStyle = {
  background: '#4CAF7D', color: '#fff', border: 'none', borderRadius: 6,
  padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
};
const cancelBtnStyle = {
  background: 'transparent', color: '#6B7280', border: '1px solid #D1D5DB',
  borderRadius: 6, padding: '8px 18px', fontSize: 13, fontWeight: 500,
  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
};
