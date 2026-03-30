import { LayoutGrid, Package, Tag, BarChart2, BookOpen, AppWindow, HelpCircle, Settings, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'overview', icon: LayoutGrid, label: 'Overview' },
  { id: 'products', icon: Package,    label: 'Products' },
  { id: 'pricing',  icon: Tag,        label: 'Pricing' },
  { id: 'compare',  icon: BarChart2,  label: 'Compare' },
  { id: 'docs',     icon: BookOpen,   label: 'Docs' },
  { id: 'myapp',    icon: AppWindow,  label: 'My App' },
];

const COLLAPSED_W = 60;
const EXPANDED_W  = 196;

export default function Sidebar() {
  const { activeTab, setActiveTab, sidebarOpen, setSidebarOpen } = useApp();
  const w = sidebarOpen ? EXPANDED_W : COLLAPSED_W;

  return (
    <aside style={{
      width: w,
      minHeight: '100vh',
      background: '#1C1C1C',
      display: 'flex',
      flexDirection: 'column',
      alignItems: sidebarOpen ? 'stretch' : 'center',
      paddingTop: 16,
      paddingBottom: 16,
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
      transition: 'width 200ms ease',
      overflow: 'hidden',
    }}>

      {/* Logo row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        paddingLeft: sidebarOpen ? 14 : 0,
        marginBottom: 24,
        flexShrink: 0,
        justifyContent: sidebarOpen ? 'flex-start' : 'center',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#4CAF7D', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: 'Inter, sans-serif' }}>C</span>
        </div>
        {sidebarOpen && (
          <span style={{
            fontSize: 15, fontWeight: 700, color: '#fff',
            fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
            opacity: sidebarOpen ? 1 : 0,
            transition: 'opacity 150ms ease',
          }}>
            Confido
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, width: '100%', padding: sidebarOpen ? '0 8px' : '0' }}>
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              title={sidebarOpen ? undefined : label}
              style={{
                width: sidebarOpen ? '100%' : 40,
                height: 40,
                margin: sidebarOpen ? '0' : '0 auto',
                borderRadius: 8,
                border: 'none',
                background: isActive ? '#4CAF7D' : 'transparent',
                color: isActive ? '#fff' : '#6B7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                gap: 10,
                paddingLeft: sidebarOpen ? 10 : 0,
                paddingRight: sidebarOpen ? 10 : 0,
                cursor: 'pointer',
                transition: 'background 150ms ease, color 150ms ease',
                outline: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#D1D5DB';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6B7280';
                }
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
              {sidebarOpen && (
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, fontFamily: 'Inter, sans-serif' }}>
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        padding: sidebarOpen ? '0 8px' : '0',
        alignItems: sidebarOpen ? 'stretch' : 'center',
      }}>
        Help + Settings
        {[
          
        ].map(({ Icon, label }) => (
          <button
            key={label}
            title={sidebarOpen ? undefined : label}
            style={{
              width: sidebarOpen ? '100%' : 40,
              height: 36,
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              color: '#4B5563',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: 10,
              paddingLeft: sidebarOpen ? 10 : 0,
              cursor: 'pointer',
              transition: 'color 150ms ease',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#9CA3AF'}
            onMouseLeave={e => e.currentTarget.style.color = '#4B5563'}
          >
            <Icon size={15} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            {sidebarOpen && (
              <span style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', color: '#4B5563' }}>{label}</span>
            )}
          </button>
        ))}

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          style={{
            width: sidebarOpen ? '100%' : 40,
            height: 36,
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: '#4B5563',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            gap: 10,
            paddingLeft: sidebarOpen ? 10 : 0,
            cursor: 'pointer',
            transition: 'color 150ms ease',
            marginTop: 4,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: 8,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#9CA3AF'}
          onMouseLeave={e => e.currentTarget.style.color = '#4B5563'}
        >
          <ChevronRight
            size={15}
            strokeWidth={2}
            style={{
              flexShrink: 0,
              transform: sidebarOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 200ms ease',
            }}
          />
          {sidebarOpen && (
            <span style={{ fontSize: 12, fontFamily: 'Inter, sans-serif' }}>Collapse</span>
          )}
        </button>
      </div>
    </aside>
  );
}
