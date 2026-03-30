import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ label, value, delta, deltaType = 'neutral', sub }) {
  const deltaColor = deltaType === 'up' ? '#4CAF7D' : deltaType === 'down' ? '#E05252' : '#6B7280';
  const DeltaIcon = deltaType === 'up' ? TrendingUp : deltaType === 'down' ? TrendingDown : Minus;

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E5E5E5',
      borderRadius: 8,
      padding: '18px 20px',
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: '#6B7280',
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 28,
        fontWeight: 700,
        color: '#111111',
        lineHeight: 1,
        marginBottom: delta ? 8 : 0,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
      {delta && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <DeltaIcon size={13} color={deltaColor} strokeWidth={2} />
          <span style={{ fontSize: 12, color: deltaColor, fontWeight: 500 }}>{delta}</span>
        </div>
      )}
      {sub && (
        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}
