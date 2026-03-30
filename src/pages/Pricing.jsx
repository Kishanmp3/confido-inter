import { useState, useMemo } from 'react';
import { Plus, Upload, Edit3, Trash2, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PriceChangeModal from '../components/PriceChangeModal';
import UploadModal from '../components/UploadModal';

export default function Pricing() {
  const { products, allScheduledChanges, deleteScheduledChange, addToast } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editChange, setEditChange] = useState(null);
  const [filterProduct, setFilterProduct] = useState('All');
  const [sortDesc, setSortDesc] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [logFilter, setLogFilter] = useState('All');
  const [hoveredDot, setHoveredDot] = useState(null);
  const [ganttProduct, setGanttProduct] = useState('All');
  const [ganttRange, setGanttRange] = useState('default'); // default | 3m | 6m | 1y | 2y

  const today = new Date();

  // Upcoming changes only
  const upcoming = allScheduledChanges
    .filter(c => new Date(c.effectiveDate) > today)
    .filter(c => filterProduct === 'All' || c.productId === filterProduct);

  // Full history log
  const historyLog = useMemo(() => {
    const rows = [];
    products.forEach(p => {
      p.priceHistory.forEach((h, i) => {
        rows.push({
          productId: p.id,
          productName: p.name,
          date: h.date,
          oldPrice: i > 0 ? p.priceHistory[i - 1].price : null,
          newPrice: h.price,
          type: 'Historical',
          notes: h.notes,
        });
      });
      p.scheduledPriceChanges.forEach(c => {
        rows.push({
          productId: p.id,
          productName: p.name,
          date: c.effectiveDate,
          oldPrice: p.unitPrice,
          newPrice: c.newPrice,
          type: 'Scheduled',
          notes: c.notes,
        });
      });
    });
    return rows
      .filter(r => logFilter === 'All' || r.productId === logFilter)
      .sort((a, b) => sortDesc
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
      );
  }, [products, logFilter, sortDesc]);

  // Gantt range driven by filter
  const GANTT_RANGES = {
    default: { back: 3, forward: 6 },
    '3m':    { back: 0, forward: 3 },
    '6m':    { back: 0, forward: 6 },
    '1y':    { back: 6, forward: 6 },
    '2y':    { back: 12, forward: 12 },
  };
  const { back, forward } = GANTT_RANGES[ganttRange];
  const ganttStart = new Date(today); ganttStart.setMonth(ganttStart.getMonth() - back);
  const ganttEnd   = new Date(today); ganttEnd.setMonth(ganttEnd.getMonth() + forward);
  const ganttSpan  = ganttEnd - ganttStart;
  const ganttX     = (date) => Math.max(0, Math.min(100, ((new Date(date) - ganttStart) / ganttSpan) * 100));
  const todayX     = ganttX(today);

  const PRODUCT_COLORS = ['#4CAF7D', '#6366F1', '#F59E0B', '#E05252', '#0EA5E9', '#A78BFA', '#F97316', '#10B981', '#EC4899', '#14B8A6'];

  const handleDelete = (productId, changeId) => {
    deleteScheduledChange(productId, changeId);
    setDeleteConfirm(null);
    addToast('Price change removed');
  };

  return (
    <div>
      {/* Top action */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button
          onClick={() => setUploadOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: '#4CAF7D', color: '#fff', border: 'none',
            borderRadius: 7, padding: '9px 16px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
        >
          <Upload size={14} /> Import Products
        </button>
      </div>

      {/* Section 1 — Scheduled Changes */}
      <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, marginBottom: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #E5E5E5',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111' }}>Scheduled Changes</h3>
            <span style={{
              background: upcoming.length > 0 ? 'rgba(76,175,125,0.1)' : '#F3F4F6',
              color: upcoming.length > 0 ? '#4CAF7D' : '#9CA3AF',
              fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '2px 8px',
            }}>
              {upcoming.length}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={filterProduct}
              onChange={e => setFilterProduct(e.target.value)}
              style={selectStyle}
            >
              <option value="All">All products</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button
              onClick={() => { setEditChange(null); setModalOpen(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#111', color: '#fff', border: 'none',
                borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              <Plus size={13} /> Schedule New
            </button>
          </div>
        </div>

        {upcoming.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, opacity: 0.15, marginBottom: 12 }}>📅</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>No price changes scheduled</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>
              Use "Schedule New" to plan an upcoming price change.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['Product', 'Current Price', 'New Price', 'Effective', 'Change', 'Notes', 'Actions'].map(h => (
                    <th key={h} style={{ ...thStyle, textAlign: h === 'Actions' ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {upcoming.map((c, i) => {
                  const pct = ((c.newPrice - c.currentPrice) / c.currentPrice * 100).toFixed(1);
                  const isUp = c.newPrice > c.currentPrice;
                  const isDeleting = deleteConfirm === c.id;
                  return (
                    <tr key={c.id} style={{ borderBottom: i < upcoming.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: PRODUCT_COLORS[products.findIndex(p => p.id === c.productId) % PRODUCT_COLORS.length]
                          }} />
                          <span style={{ fontWeight: 500 }}>{c.productName}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontVariantNumeric: 'tabular-nums' }}>${c.currentPrice.toFixed(2)}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>${c.newPrice.toFixed(2)}</td>
                      <td style={tdStyle}>{new Date(c.effectiveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td style={tdStyle}>
                        <span style={{
                          fontSize: 12, fontWeight: 600,
                          color: isUp ? '#4CAF7D' : '#E05252',
                          background: isUp ? 'rgba(76,175,125,0.08)' : 'rgba(224,82,82,0.08)',
                          borderRadius: 4, padding: '2px 7px',
                        }}>
                          {isUp ? '+' : ''}{pct}%
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: '#6B7280', maxWidth: 200 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.notes || '—'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        {isDeleting ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: '#E05252' }}>Delete?</span>
                            <button onClick={() => handleDelete(c.productId, c.id)} style={{ ...actionBtn, color: '#E05252', borderColor: '#E05252' }}>Yes</button>
                            <button onClick={() => setDeleteConfirm(null)} style={actionBtn}>No</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => { setEditChange(c); setModalOpen(true); }}
                              style={actionBtn}
                            >
                              <Edit3 size={12} /> Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(c.id)}
                              style={{ ...actionBtn, color: '#E05252' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2 — Gantt Timeline */}
      <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, marginBottom: 16, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111' }}>Price Schedule Timeline</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Product filter */}
            <select
              value={ganttProduct}
              onChange={e => setGanttProduct(e.target.value)}
              style={selectStyle}
            >
              <option value="All">All products</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            {/* Date range pills */}
            <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 7, padding: 3, gap: 2 }}>
              {[
                { id: 'default', label: '±3 / 6m' },
                { id: '3m',     label: 'Next 3m' },
                { id: '6m',     label: 'Next 6m' },
                { id: '1y',     label: '1 year' },
                { id: '2y',     label: '2 years' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setGanttRange(opt.id)}
                  style={{
                    padding: '4px 10px', borderRadius: 5, border: 'none',
                    fontSize: 12, fontWeight: ganttRange === opt.id ? 600 : 400,
                    color: ganttRange === opt.id ? '#111' : '#9CA3AF',
                    background: ganttRange === opt.id ? '#fff' : 'transparent',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    boxShadow: ganttRange === opt.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 150ms ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          {/* Today line */}
          <div style={{
            position: 'absolute', left: `${todayX}%`, top: 0, bottom: 0,
            width: 1, background: '#4CAF7D', zIndex: 10, pointerEvents: 'none',
          }}>
            <div style={{
              position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
              fontSize: 10, fontWeight: 700, color: '#4CAF7D', letterSpacing: '0.05em', textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>Today</div>
          </div>

          {/* Rows per product */}
          {products.filter(p => ganttProduct === 'All' || p.id === ganttProduct).map((p, pi) => {
            const changes = [
              ...p.priceHistory.map(h => ({ date: h.date, price: h.price, isFuture: false, notes: h.notes })),
              ...p.scheduledPriceChanges.map(c => ({ date: c.effectiveDate, price: c.newPrice, isFuture: true, notes: c.notes })),
            ].filter(c => {
              const d = new Date(c.date);
              return d >= ganttStart && d <= ganttEnd;
            });

            if (changes.length === 0 && p.scheduledPriceChanges.length === 0) return null;

            const color = PRODUCT_COLORS[pi % PRODUCT_COLORS.length];

            return (
              <div key={p.id} style={{ position: 'relative', height: 56, marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                {/* Product label */}
                <div style={{ width: 120, flexShrink: 0, fontSize: 12, fontWeight: 500, color: '#374151', paddingRight: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}
                </div>

                {/* Track */}
                <div style={{ flex: 1, position: 'relative', height: 2, background: '#EBEBEB', borderRadius: 2 }}>
                  {changes.map((c, ci) => {
                    const x = ganttX(c.date);
                    const markerKey = `${p.id}-${ci}`;
                    const isHovered = hoveredDot?.key === markerKey;
                    const pct = p.unitPrice
                      ? ((c.price - p.unitPrice) / p.unitPrice * 100).toFixed(1)
                      : null;
                    const isUp = c.price >= p.unitPrice;
                    const flipLeft = x > 65;

                    return (
                      <div
                        key={ci}
                        onMouseEnter={() => setHoveredDot({ key: markerKey, product: p, change: c, color })}
                        onMouseLeave={() => setHoveredDot(null)}
                        style={{
                          position: 'absolute',
                          left: `${x}%`,
                          top: '50%',
                          transform: 'translate(-50%, -100%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                          zIndex: isHovered ? 20 : 2,
                        }}
                      >
                        {/* Price pill */}
                        <div style={{
                          fontSize: 11,
                          fontWeight: 700,
                          fontVariantNumeric: 'tabular-nums',
                          color: c.isFuture ? color : '#fff',
                          background: c.isFuture ? '#fff' : color,
                          border: `1.5px ${c.isFuture ? 'dashed' : 'solid'} ${color}`,
                          borderRadius: 5,
                          padding: '2px 7px',
                          whiteSpace: 'nowrap',
                          boxShadow: isHovered ? `0 2px 8px ${color}50` : '0 1px 3px rgba(0,0,0,0.1)',
                          transform: isHovered ? 'translateY(-2px)' : 'none',
                          transition: 'transform 120ms ease, box-shadow 120ms ease',
                          letterSpacing: '0.01em',
                        }}>
                          ${c.price.toFixed(2)}
                        </div>

                        {/* Stem */}
                        <div style={{
                          width: 1,
                          height: 8,
                          background: color,
                          opacity: c.isFuture ? 0.4 : 0.6,
                        }} />

                        {/* Tooltip */}
                        {isHovered && (
                          <div style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 6px)',
                            ...(flipLeft
                              ? { right: 0 }
                              : { left: '50%', transform: 'translateX(-50%)' }
                            ),
                            background: '#fff',
                            border: '1px solid #E5E5E5',
                            borderRadius: 8,
                            padding: '12px 14px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                            zIndex: 100,
                            minWidth: 190,
                            pointerEvents: 'none',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{p.name}</span>
                            </div>

                            <div style={{ fontSize: 22, fontWeight: 700, color: '#111', fontVariantNumeric: 'tabular-nums', marginBottom: 6 }}>
                              ${c.price.toFixed(2)}
                            </div>

                            {pct && c.isFuture && (
                              <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                fontSize: 11, fontWeight: 700,
                                color: isUp ? '#4CAF7D' : '#E05252',
                                background: isUp ? 'rgba(76,175,125,0.08)' : 'rgba(224,82,82,0.08)',
                                borderRadius: 4, padding: '2px 7px', marginBottom: 8,
                              }}>
                                {isUp ? '↑' : '↓'} {isUp ? '+' : ''}{pct}% vs current
                              </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                              <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                                {new Date(c.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span style={{
                                fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                                color: c.isFuture ? '#6366F1' : '#9CA3AF',
                                background: c.isFuture ? 'rgba(99,102,241,0.08)' : '#F3F4F6',
                                borderRadius: 4, padding: '2px 6px',
                              }}>
                                {c.isFuture ? 'Scheduled' : 'Historical'}
                              </span>
                            </div>

                            {c.notes && (
                              <div style={{
                                marginTop: 8, paddingTop: 8, borderTop: '1px solid #F3F4F6',
                                fontSize: 11, color: '#6B7280', lineHeight: 1.4,
                              }}>
                                {c.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }).filter(Boolean)}

          {/* X-axis month labels */}
          {(() => {
            const labels = [];
            const cursor = new Date(ganttStart);
            cursor.setDate(1); // snap to 1st of month
            if (cursor < ganttStart) cursor.setMonth(cursor.getMonth() + 1);

            while (cursor <= ganttEnd) {
              const x = ((cursor - ganttStart) / ganttSpan) * 100;
              const isCurrentMonth = cursor.getMonth() === today.getMonth() && cursor.getFullYear() === today.getFullYear();
              labels.push(
                <div key={cursor.toISOString()} style={{
                  position: 'absolute',
                  left: `${x}%`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none',
                }}>
                  <div style={{ width: 1, height: 6, background: '#D1D5DB' }} />
                  <span style={{
                    fontSize: 10,
                    fontWeight: isCurrentMonth ? 700 : 400,
                    color: isCurrentMonth ? '#4CAF7D' : '#9CA3AF',
                    marginTop: 3,
                    whiteSpace: 'nowrap',
                  }}>
                    {cursor.toLocaleDateString('en-US', { month: 'short' })}
                    {cursor.getMonth() === 0 && (
                      <span style={{ fontSize: 9, marginLeft: 2, opacity: 0.7 }}>
                        '{String(cursor.getFullYear()).slice(2)}
                      </span>
                    )}
                  </span>
                </div>
              );
              cursor.setMonth(cursor.getMonth() + 1);
            }

            return (
              <div style={{ position: 'relative', height: 24, marginLeft: 120, marginTop: 6, borderTop: '1px solid #F0F0F0' }}>
                {labels}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Section 3 — Full Price History Log */}
      <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #E5E5E5',
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111' }}>Price History Log</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={logFilter} onChange={e => setLogFilter(e.target.value)} style={selectStyle}>
              <option value="All">All products</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button
              onClick={() => setSortDesc(d => !d)}
              style={{ ...actionBtn, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {sortDesc ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Date
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Product', 'Date', 'Old Price', 'New Price', 'Change %', 'Type', 'Notes'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historyLog.map((row, i) => {
                const pct = row.oldPrice
                  ? ((row.newPrice - row.oldPrice) / row.oldPrice * 100).toFixed(1)
                  : null;
                const isUp = pct > 0;
                return (
                  <tr key={i} style={{ borderBottom: i < historyLog.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{row.productName}</td>
                    <td style={tdStyle}>{new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td style={{ ...tdStyle, color: '#9CA3AF', fontVariantNumeric: 'tabular-nums' }}>
                      {row.oldPrice ? `$${row.oldPrice.toFixed(2)}` : '—'}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>${row.newPrice.toFixed(2)}</td>
                    <td style={tdStyle}>
                      {pct ? (
                        <span style={{ fontSize: 12, fontWeight: 600, color: isUp ? '#4CAF7D' : '#E05252' }}>
                          {isUp ? '+' : ''}{pct}%
                        </span>
                      ) : '—'}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: 11, fontWeight: 500,
                        color: row.type === 'Scheduled' ? '#6366F1' : '#6B7280',
                        background: row.type === 'Scheduled' ? 'rgba(99,102,241,0.08)' : '#F3F4F6',
                        borderRadius: 4, padding: '2px 7px',
                      }}>
                        {row.type}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#6B7280', maxWidth: 180 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.notes || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PriceChangeModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditChange(null); }} editChange={editChange} />
      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}

const thStyle = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: '#9CA3AF',
  whiteSpace: 'nowrap',
};
const tdStyle = {
  padding: '10px 16px',
  color: '#374151',
  verticalAlign: 'middle',
};
const actionBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  background: 'transparent', border: '1px solid #E5E5E5',
  borderRadius: 5, padding: '4px 10px', fontSize: 12, fontWeight: 500,
  cursor: 'pointer', color: '#374151', fontFamily: 'Inter, sans-serif',
};
const selectStyle = {
  border: '1px solid #E5E5E5', borderRadius: 6, padding: '5px 10px',
  fontSize: 12, color: '#374151', background: '#fff', cursor: 'pointer',
  fontFamily: 'Inter, sans-serif', outline: 'none',
};
