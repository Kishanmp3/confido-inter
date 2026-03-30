import { useState } from 'react';
import { LayoutGrid, Package, Tag, BarChart2, Brain, AppWindow } from 'lucide-react';

// ─── Thought Process content ────────────────────────────────────────────────

const THOUGHT_SECTIONS = [
  {
    label: 'Goal',
    heading: 'What this is for',
    items: [
      'CPG pricing dashboard built around one core problem: prices change over time',
      'Built for Olipop — 10 SKUs, major retail presence',
      'Every feature traces back to the pricing management use case',
    ],
  },
  {
    label: 'The User',
    heading: 'Olipop brand manager',
    items: [
      'Manages 10+ SKUs across Whole Foods, Target, Kroger',
      'Deals with retailer resets, seasonal lifts, cost pass-throughs',
      'Needs margin visibility, deduction tracking, and forward-looking price planning',
      'Data-literate, time-pressured, needs the right signal fast',
    ],
  },
  {
    label: 'What I thought about',
    heading: null,
    subsections: [
      {
        title: 'Pricing over time',
        items: [
          "A static price list isn't enough",
          'Users need past, present, and future in one view',
        ],
      },
      {
        title: 'Information hierarchy',
        items: [
          'Lots of data — but each tab has one job',
          'High level first, detail on demand',
        ],
      },
      {
        title: 'The user should never be lost',
        items: [
          'No blank screens',
          'Every tab has an obvious first action',
        ],
      },
      {
        title: 'Confido context',
        items: [
          'Deductions and trade spend are real pain points in CPG — not afterthoughts',
          'The Intel tab exists because net revenue ≠ gross revenue',
        ],
      },
    ],
  },
];

// ─── Technical Docs content ──────────────────────────────────────────────────

const DOC_SECTIONS = [
  {
    id: 'overview-tab',
    icon: LayoutGrid,
    title: 'Overview',
    description: 'Your entry point. A full snapshot of the catalog at a glance.',
    items: [
      { label: 'Stat bar', detail: 'Total SKUs, avg unit price, monthly revenue, and active scheduled changes — updates live as you add products or schedule changes.' },
      { label: 'Filter by category', detail: 'Use the pill filters (All, Cola, Fruit, Citrus, Dessert) to narrow the grid. Categories are dynamic — adding a new product category creates a new pill.' },
      { label: 'Sort', detail: 'Sort tiles by Name, Price, Margin, Units Sold, or Deductions using the dropdown on the right.' },
      { label: 'Product tiles', detail: 'Each tile shows current price, upcoming price change badge (green = increase, red = decrease), a 12-month price sparkline, margin pill, and units sold. A red triangle icon means deduction rate exceeds 10%.' },
      { label: 'Click to drill down', detail: 'Clicking any tile navigates directly to the Products tab with that SKU pre-loaded.' },
    ],
  },
  {
    id: 'products-tab',
    icon: Package,
    title: 'Products',
    description: 'Deep dive into a single SKU. Everything about one product on one page.',
    items: [
      { label: 'Select a product', detail: 'Use the searchable dropdown at the top. Type to filter by name or category. You can also arrive here by clicking a tile on Overview.' },
      { label: 'Add a new product', detail: 'Click "New Product" (green button, top right of selector). A 3-step modal walks through name/category/color → pricing/margin → review. Monthly data is auto-generated from your inputs.' },
      { label: 'Edit a product', detail: 'Click "Edit" in the product header. Name, price, description, and category become inline editable. Click Save to commit — changes propagate across all tabs.' },
      { label: 'Price Timeline', detail: 'Horizontal timeline from first known price to last scheduled change. Solid green nodes = historical. Dashed outline nodes = scheduled future. TODAY marker in green. Hover any node for full details.' },
      { label: 'Charts', detail: '2×2 grid: Units Sold / Month, Monthly Revenue, Unit Price History, and Margin % over time. Margin chart includes a 40% reference line.' },
      { label: 'Price Simulator', detail: 'Drag the slider to set a hypothetical price. Projected units, revenue, and margin update live using a −5% units per +$0.10 elasticity model. Click Reset to return to current price.' },
    ],
  },
  {
    id: 'pricing-tab',
    icon: Tag,
    title: 'Pricing',
    description: 'Manage all price changes across the catalog. The operational hub.',
    items: [
      { label: 'Scheduled Changes table', detail: 'All upcoming price changes across every product. Filter by product using the dropdown. Edit or delete any row inline. A delete requires a confirmation click — no accidental removals.' },
      { label: 'Schedule New', detail: 'Opens the Price Change Modal. Select product, enter new price, pick an effective date, and add optional notes. Saved changes immediately appear in Overview badges and the Products timeline.' },
      { label: 'Price Schedule Timeline', detail: 'Gantt-style view spanning the last 3 months to the next 6. One row per product. Solid dots = historical changes in range. Dashed dots = upcoming. Hover any dot for a full tooltip card.' },
      { label: 'Price History Log', detail: 'Complete record of every price event across all products — both historical and scheduled. Sortable by date. Filterable by product. Type badge distinguishes Historical from Scheduled.' },
      { label: 'Import Products', detail: 'Click "Import Products" (top right) to open the upload flow. Drag a CSV/Excel file or browse. A 3-step flow shows upload progress → preview of parsed rows → confirm to add.' },
    ],
  },
  {
    id: 'compare-tab',
    icon: BarChart2,
    title: 'Compare',
    description: 'Side-by-side analysis of 2 to 4 SKUs.',
    items: [
      { label: 'Select products', detail: 'Click product chips to select up to 4. Each gets a unique color that carries through all charts. Click again to deselect.' },
      { label: 'Price Over Time', detail: 'Overlay line chart showing all selected products on shared axes. Lines extend to 6 months out so newly created products always render.' },
      { label: 'Radar chart', detail: 'Compares 6 dimensions — Unit Price, Margin %, Units Sold, Revenue, Trade Spend, Deductions. Values are normalized 0–100 within the current selection.' },
      { label: 'Metrics table', detail: 'One column per product, one row per metric. The best value in each row is highlighted green.' },
      { label: 'Revenue bar chart', detail: 'Grouped monthly revenue for the last 6 months. One bar color per selected product.' },
      { label: 'What-If Mode', detail: 'Toggle at the top right. Each product chip gains a price input. Changing a price updates the radar chart and metrics table live.' },
    ],
  },
  // {
  //   id: 'intel-tab',
  //   icon: Brain,
  //   title: 'Confido Intel',
  //   description: 'Financial intelligence layer. Deductions, trade spend, and promo tracking.',
  //   items: [
  //     { label: 'Month selector', detail: 'All Deductions and Trade Spend data is filtered by the selected month. Use the dropdown in the Deductions section to switch months.' },
  //     { label: 'Deductions table', detail: 'Sorted by deduction % descending. Rows where deduction rate exceeds 10% are flagged with a red alert icon and a faint red background.' },
  //     { label: 'Trade Spend', detail: 'Bar chart + table showing trade spend per SKU. Rows flagged in red if rate exceeds 8%.' },
  //     { label: 'Promo Calendar', detail: 'Horizontal Gantt view of all promo windows. Spans last month to 5 months out. Each product gets its own color. TODAY is marked.' },
  //     { label: 'Alerts', detail: 'Auto-generated flags for: deduction rate > 10%, trade spend > 8%, and no price review in 90+ days. Each alert has a "View Product" link that navigates directly to that SKU.' },
  //   ],
  // },
  {
    id: 'myapp-tab',
    icon: AppWindow,
    title: 'My App',
    description: 'Embedded external application.',
    items: [
      { label: 'Iframe embed', detail: 'Loads the URL defined in MyApp.jsx as MY_APP_URL. Currently set to confidotool.netlify.app.' },
      { label: 'Loading state', detail: 'A spinner and "Loading app…" message shows while the iframe is initializing.' },
      { label: 'Open in new tab', detail: 'Button in the top-right bar opens the external app in a new browser tab.' },
    ],
  },
];

// ─── Shared sub-components ───────────────────────────────────────────────────

function Bullet({ children }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <span style={{
        marginTop: 8, width: 5, height: 5, borderRadius: '50%',
        background: '#D1D5DB', flexShrink: 0,
      }} />
      <span style={{ fontSize: 16, color: '#374151', lineHeight: 1.6 }}>{children}</span>
    </li>
  );
}

// ─── Views ───────────────────────────────────────────────────────────────────

function ThoughtProcess() {
  return (
    <div>
      {THOUGHT_SECTIONS.map((section, si) => (
        <section key={si} style={{ marginBottom: 68 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#4CAF7D',
            marginBottom: section.heading ? 10 : 20,
          }}>
            {section.label}
          </div>

          {section.heading && (
            <h2 style={{
              margin: '0 0 28px', fontSize: 32, fontWeight: 700,
              color: '#111', letterSpacing: '-0.02em', lineHeight: 1.15,
            }}>
              {section.heading}
            </h2>
          )}

          {section.items && (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {section.items.map((item, ii) => <Bullet key={ii}>{item}</Bullet>)}
            </ul>
          )}

          {section.subsections && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              {section.subsections.map((sub, subi) => (
                <div key={subi}>
                  <h3 style={{
                    margin: '0 0 14px', fontSize: 20, fontWeight: 600,
                    color: '#111', letterSpacing: '-0.01em',
                  }}>
                    {sub.title}
                  </h3>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sub.items.map((item, ii) => <Bullet key={ii}>{item}</Bullet>)}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {si < THOUGHT_SECTIONS.length - 1 && (
            <div style={{ marginTop: 56, height: 1, background: '#F0F0F0' }} />
          )}
        </section>
      ))}
    </div>
  );
}

function TechDocs() {
  return (
    <div>
      {/* Intro */}
      <div style={{ marginBottom: 48 }}>
        <p style={{ margin: '0 0 6px', fontSize: 13, color: '#9CA3AF' }}>
          All data is mock — no backend or API calls required.
        </p>
        <p style={{ margin: 0, fontSize: 13, color: '#9CA3AF' }}>
          State is managed in <code style={codeStyle}>AppContext</code> — changes made in any tab persist across the session.
        </p>
      </div>

      {DOC_SECTIONS.map((section, si) => {
        const Icon = section.icon;
        return (
          <section key={section.id} style={{ marginBottom: 56 }}>
            {/* Section header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 6,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'rgba(76,175,125,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={14} color="#4CAF7D" strokeWidth={2} />
              </div>
              <h2 style={{
                margin: 0, fontSize: 18, fontWeight: 700,
                color: '#111', letterSpacing: '-0.01em',
              }}>
                {section.title}
              </h2>
            </div>

            <p style={{
              margin: '0 0 20px 38px', fontSize: 14,
              color: '#9CA3AF', lineHeight: 1.5,
            }}>
              {section.description}
            </p>

            {/* Rows */}
            <div style={{
              marginLeft: 38,
              border: '1px solid #EBEBEB',
              borderRadius: 8,
              overflow: 'hidden',
            }}>
              {section.items.map((item, ii) => (
                <div key={ii} style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr',
                  gap: 0,
                  borderBottom: ii < section.items.length - 1 ? '1px solid #F3F4F6' : 'none',
                }}>
                  <div style={{
                    padding: '12px 16px',
                    fontSize: 12, fontWeight: 600, color: '#374151',
                    background: '#FAFAFA',
                    borderRight: '1px solid #F3F4F6',
                    display: 'flex', alignItems: 'flex-start',
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    padding: '12px 16px',
                    fontSize: 13, color: '#6B7280', lineHeight: 1.6,
                  }}>
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>

            {si < DOC_SECTIONS.length - 1 && (
              <div style={{ marginTop: 48, height: 1, background: '#F0F0F0' }} />
            )}
          </section>
        );
      })}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Docs() {
  const [view, setView] = useState('process');

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', paddingBottom: 80 }}>
      {/* Toggle */}
      <div style={{
        display: 'inline-flex',
        background: '#F3F4F6',
        borderRadius: 8,
        padding: 3,
        marginBottom: 48,
        gap: 2,
      }}>
        {[
          { id: 'process', label: 'Thought Process' },
          { id: 'docs',    label: 'How to Use' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: 'none',
              fontSize: 13,
              fontWeight: view === tab.id ? 600 : 400,
              color: view === tab.id ? '#111' : '#9CA3AF',
              background: view === tab.id ? '#fff' : 'transparent',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              boxShadow: view === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 150ms ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === 'process' ? <ThoughtProcess /> : <TechDocs />}
    </div>
  );
}

const codeStyle = {
  fontFamily: 'ui-monospace, monospace',
  fontSize: 12,
  background: '#F3F4F6',
  borderRadius: 4,
  padding: '1px 5px',
  color: '#374151',
};
