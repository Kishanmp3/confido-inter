import { useState } from 'react';

export default function PriceTimeline({ priceHistory = [], scheduledChanges = [] }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const allPoints = [
    ...priceHistory.map(h => ({ ...h, type: 'historical' })),
    ...scheduledChanges.map(c => ({ date: c.effectiveDate, price: c.newPrice, notes: c.notes, type: 'scheduled' })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  if (allPoints.length === 0) return null;

  const today = new Date();
  const startDate = new Date(allPoints[0].date);
  const endDate = new Date(allPoints[allPoints.length - 1].date);
  // Pad end by 30 days if last point is in past
  const displayEnd = endDate < today ? new Date(today.getTime() + 30 * 86400000) : new Date(endDate.getTime() + 30 * 86400000);
  const totalSpan = displayEnd - startDate;

  const getX = (date) => ((new Date(date) - startDate) / totalSpan) * 100;
  const todayX = Math.max(0, Math.min(100, ((today - startDate) / totalSpan) * 100));

  return (
    <div style={{ position: 'relative', padding: '32px 16px 40px', userSelect: 'none' }}>
      {/* Track */}
      <div style={{
        position: 'relative',
        height: 3,
        background: '#E5E5E5',
        borderRadius: 3,
        margin: '28px 0',
      }}>
        {/* Historical fill */}
        <div style={{
          position: 'absolute',
          left: 0,
          width: `${todayX}%`,
          height: '100%',
          background: '#4CAF7D',
          borderRadius: 2,
        }} />

        {/* Today marker */}
        <div style={{
          position: 'absolute',
          left: `${todayX}%`,
          top: -18,
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
        }}>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: '#4CAF7D',
            background: '#fff',
            padding: '0 4px',
          }}>
            Today
          </span>
          <div style={{ width: 1, height: 24, background: '#4CAF7D', marginTop: 2 }} />
        </div>

        {/* Price nodes */}
        {allPoints.map((point, i) => {
          const x = getX(point.date);
          const isFuture = point.type === 'scheduled';
          const isCurrent = !isFuture && i === allPoints.filter(p => p.type === 'historical').length - 1;
          const isHovered = hoveredNode === i;

          const formattedDate = new Date(point.date).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          });

          return (
            <div
              key={i}
              style={{ position: 'absolute', left: `${x}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
              onMouseEnter={() => setHoveredNode(i)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Node dot */}
              <div style={{
                width: isCurrent ? 20 : 14,
                height: isCurrent ? 20 : 14,
                borderRadius: '50%',
                background: isFuture ? '#fff' : '#4CAF7D',
                border: isFuture ? '2.5px dashed #4CAF7D' : isCurrent ? '3px solid #fff' : '2.5px solid #4CAF7D',
                boxShadow: isCurrent
                  ? '0 0 0 4px rgba(76,175,125,0.25), 0 2px 8px rgba(76,175,125,0.4)'
                  : isFuture
                  ? '0 2px 6px rgba(76,175,125,0.2)'
                  : '0 2px 6px rgba(76,175,125,0.35)',
                cursor: 'default',
                transition: 'transform 150ms ease, box-shadow 150ms ease',
                transform: isHovered ? 'scale(1.35)' : 'scale(1)',
                zIndex: 5,
                position: 'relative',
              }} />

              {/* Price label above */}
              <div style={{
                position: 'absolute',
                bottom: isCurrent ? 26 : 22,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}>
                <span style={{
                  fontSize: isCurrent ? 13 : 12,
                  fontWeight: isCurrent ? 700 : 600,
                  color: isFuture ? '#9CA3AF' : '#111111',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  ${point.price.toFixed(2)}
                </span>
              </div>

              {/* Date label below */}
              <div style={{
                position: 'absolute',
                top: isCurrent ? 26 : 22,
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
              }}>
                <span style={{
                  fontSize: 10,
                  color: isFuture ? '#9CA3AF' : '#6B7280',
                  fontStyle: isFuture ? 'italic' : 'normal',
                }}>
                  {new Date(point.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                </span>
              </div>

              {/* Tooltip */}
              {isHovered && (
                <div style={{
                  position: 'absolute',
                  bottom: 36,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#fff',
                  border: '1px solid #E5E5E5',
                  borderRadius: 6,
                  padding: '8px 12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  zIndex: 50,
                  minWidth: 140,
                  maxWidth: 200,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 2, fontVariantNumeric: 'tabular-nums' }}>
                    ${point.price.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>{formattedDate}</div>
                  {point.notes && (
                    <div style={{ fontSize: 11, color: '#6B7280', borderTop: '1px solid #F3F4F6', paddingTop: 4 }}>
                      {point.notes}
                    </div>
                  )}
                  <div style={{
                    display: 'inline-block',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: isFuture ? '#9CA3AF' : '#4CAF7D',
                    marginTop: 4,
                  }}>
                    {isFuture ? 'Scheduled' : 'Historical'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF7D' }} />
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>Historical</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', border: '2px dashed #4CAF7D' }} />
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>Scheduled</span>
        </div>
      </div>
    </div>
  );
}
