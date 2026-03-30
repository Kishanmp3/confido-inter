import { useState, useMemo } from 'react';
import { ArrowUpDown, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import BentoTile from '../components/BentoTile';

const SORT_OPTIONS = [
  { value: 'name',    label: 'Name' },
  { value: 'price',   label: 'Price' },
  { value: 'margin',  label: 'Margin' },
  { value: 'units',   label: 'Units Sold' },
  { value: 'deductions', label: 'Deductions' },
];

export default function Overview() {
  const { products, navigateToProduct, allScheduledChanges } = useApp();
  const [sortBy, setSortBy] = useState('name');
  const [category, setCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return ['All', ...cats.sort()];
  }, [products]);

  const totalRevenue = products.reduce((sum, p) => sum + p.revenuePerMonth[p.revenuePerMonth.length - 1], 0);
  const prevRevenue = products.reduce((sum, p) => sum + p.revenuePerMonth[p.revenuePerMonth.length - 2], 0);
  const revenueGrowth = ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1);

  const avgPrice = products.reduce((s, p) => s + p.unitPrice, 0) / products.length;
  const upcomingCount = allScheduledChanges.filter(c => new Date(c.effectiveDate) > new Date()).length;

  const filtered = useMemo(() => {
    let list = category === 'All' ? products : products.filter(p => p.category === category);
    return [...list].sort((a, b) => {
      if (sortBy === 'name')    return a.name.localeCompare(b.name);
      if (sortBy === 'price')   return b.unitPrice - a.unitPrice;
      if (sortBy === 'margin')  return b.margin - a.margin;
      if (sortBy === 'units')   return b.unitsPerMonth[b.unitsPerMonth.length - 1] - a.unitsPerMonth[a.unitsPerMonth.length - 1];
      if (sortBy === 'deductions') return b.deductionRate - a.deductionRate;
      return 0;
    });
  }, [products, category, sortBy]);

  return (
    <div>
      {/* Summary stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <StatCard
          label="Total SKUs"
          value={products.length}
          delta="Full catalog"
          deltaType="neutral"
        />
        <StatCard
          label="Avg Unit Price"
          value={`$${avgPrice.toFixed(2)}`}
          delta="Across all products"
          deltaType="neutral"
        />
        <StatCard
          label="Monthly Revenue"
          value={`$${(totalRevenue / 1000).toFixed(1)}k`}
          delta={`${revenueGrowth > 0 ? '+' : ''}${revenueGrowth}% vs last month`}
          deltaType={revenueGrowth >= 0 ? 'up' : 'down'}
        />
        <StatCard
          label="Scheduled Changes"
          value={upcomingCount}
          delta={upcomingCount > 0 ? `Next: ${new Date(allScheduledChanges.filter(c => new Date(c.effectiveDate) > new Date())[0]?.effectiveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'None upcoming'}
          deltaType={upcomingCount > 0 ? 'up' : 'neutral'}
        />
      </div>

      {/* Filter / sort bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Filter size={14} color="#9CA3AF" />
          <div style={{ display: 'flex', gap: 6 }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: category === cat ? '#4CAF7D' : '#E5E5E5',
                  background: category === cat ? 'rgba(76,175,125,0.08)' : '#fff',
                  color: category === cat ? '#4CAF7D' : '#6B7280',
                  fontSize: 12,
                  fontWeight: category === cat ? 600 : 400,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 150ms ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArrowUpDown size={14} color="#9CA3AF" />
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              border: '1px solid #E5E5E5', borderRadius: 6, padding: '5px 10px',
              fontSize: 12, color: '#374151', background: '#fff', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', outline: 'none',
            }}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Bento grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 12,
      }}>
        {filtered.map(product => (
          <BentoTile
            key={product.id}
            product={product}
            onClick={navigateToProduct}
          />
        ))}
      </div>
    </div>
  );
}
