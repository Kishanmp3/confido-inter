import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/Toast';
import Overview from './pages/Overview';
import Products from './pages/Products';
import Pricing from './pages/Pricing';
import Compare from './pages/Compare';
import Docs from './pages/Docs';
import MyApp from './pages/MyApp';

const PAGE_TITLES = {
  overview: 'Overview',
  products:  'Products',
  pricing:   'Pricing',
  compare:   'Compare',
  docs:      'Docs',
  myapp:     'My App',
};

export default function App() {
  const { activeTab, sidebarOpen } = useApp();

  const renderPage = () => {
    switch (activeTab) {
      case 'overview': return <Overview />;
      case 'products':  return <Products />;
      case 'pricing':   return <Pricing />;
      case 'compare':   return <Compare />;
      case 'docs':      return <Docs />;
      case 'myapp':     return <MyApp />;
      default:          return <Overview />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F5', minWidth: 1280 }}>
      <Sidebar />

      {/* Main content */}
      <main style={{
        marginLeft: sidebarOpen ? 196 : 60,
        flex: 1,
        padding: '24px 28px',
        minWidth: 0,
        boxSizing: 'border-box',
        transition: 'margin-left 200ms ease',
      }}>
        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: '#111111',
            letterSpacing: '-0.01em',
          }}>
            {PAGE_TITLES[activeTab]}
          </h1>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
            {activeTab === 'overview' && 'Full catalog snapshot — click any tile to dive deeper'}
            {activeTab === 'products' && 'Single-SKU deep dive — pricing, history, simulation'}
            {activeTab === 'pricing' && 'Manage all price changes across the catalog'}
            {activeTab === 'compare' && 'Side-by-side visual comparison of 2–4 SKUs'}
            {activeTab === 'docs' && 'Project context and thought process'}
            {activeTab === 'myapp' && 'Your external application'}
          </div>
        </div>

        {renderPage()}
      </main>

      <ToastContainer />
    </div>
  );
}
