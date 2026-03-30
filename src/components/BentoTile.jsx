import { AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import SparklineChart from './SparklineChart';

export default function BentoTile({ product, onClick }) {
  const nextChange = product.scheduledPriceChanges
    .filter(c => new Date(c.effectiveDate) > new Date())
    .sort((a, b) => new Date(a.effectiveDate) - new Date(b.effectiveDate))[0];

  const isPriceUp = nextChange && nextChange.newPrice > product.unitPrice;
  const isPriceDown = nextChange && nextChange.newPrice < product.unitPrice;

  const latestUnits = product.unitsPerMonth[product.unitsPerMonth.length - 1];
  const prevUnits = product.unitsPerMonth[product.unitsPerMonth.length - 2];
  const unitsDelta = prevUnits ? ((latestUnits - prevUnits) / prevUnits * 100).toFixed(1) : null;
  const unitsUp = unitsDelta > 0;

  const hasDeductionAlert = product.deductionRate > 10;

  const badgeDate = nextChange
    ? new Date(nextChange.effectiveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div
      onClick={() => onClick(product.id)}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: 8,
        padding: '16px',
        cursor: 'pointer',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minWidth: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#4CAF7D';
        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(76,175,125,0.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#E5E5E5';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#111111',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {product.name}
            </span>
            {hasDeductionAlert && (
              <AlertTriangle size={12} color="#E05252" strokeWidth={2} style={{ flexShrink: 0 }} />
            )}
          </div>
          <span style={{
            fontSize: 11,
            fontWeight: 500,
            color: '#6B7280',
            background: '#F3F4F6',
            borderRadius: 4,
            padding: '1px 6px',
          }}>
            {product.category}
          </span>
        </div>

        {/* Color swatch */}
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: product.placeholderColor,
          flexShrink: 0,
          opacity: 0.85,
        }} />
      </div>

      {/* Price */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#111111', fontVariantNumeric: 'tabular-nums' }}>
            ${product.unitPrice.toFixed(2)}
          </span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>
            / unit
          </span>
        </div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>
          ${product.casePrice.toFixed(2)} · {product.casePack}-pack
        </div>
      </div>

      {/* Next price change badge */}
      {nextChange ? (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 11,
          fontWeight: 600,
          color: isPriceUp ? '#4CAF7D' : '#E05252',
          background: isPriceUp ? 'rgba(76,175,125,0.08)' : 'rgba(224,82,82,0.08)',
          borderRadius: 5,
          padding: '4px 8px',
          alignSelf: 'flex-start',
        }}>
          {isPriceUp ? <ArrowUpRight size={11} strokeWidth={2.5} /> : <ArrowDownRight size={11} strokeWidth={2.5} />}
          ${product.unitPrice.toFixed(2)} → ${nextChange.newPrice.toFixed(2)} · {badgeDate}
        </div>
      ) : (
        <div style={{ height: 23 }} />
      )}

      {/* Sparkline */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 4 }}>
          Price history
        </div>
        <SparklineChart data={product.priceHistory.map(h => h.price)} color="#4CAF7D" height={32} />
      </div>

      {/* Footer row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Margin pill */}
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: product.margin >= 40 ? '#4CAF7D' : '#6B7280',
          background: product.margin >= 40 ? 'rgba(76,175,125,0.08)' : '#F3F4F6',
          borderRadius: 4,
          padding: '2px 7px',
        }}>
          {product.margin}% margin
        </span>

        {/* Units */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 12, color: '#6B7280', fontVariantNumeric: 'tabular-nums' }}>
            {latestUnits.toLocaleString()} units
          </span>
          {unitsDelta && (
            <span style={{
              fontSize: 11,
              fontWeight: 500,
              color: unitsUp ? '#4CAF7D' : '#E05252',
            }}>
              {unitsUp ? '+' : ''}{unitsDelta}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
