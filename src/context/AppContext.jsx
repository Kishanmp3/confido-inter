import { createContext, useContext, useState, useCallback } from 'react';
import { PRODUCTS } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [products, setProducts] = useState(PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [compareProducts, setCompareProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigate to products tab with a specific product selected
  const navigateToProduct = useCallback((productId) => {
    setSelectedProduct(productId);
    setActiveTab('products');
  }, []);

  // Add a scheduled price change
  const addScheduledChange = useCallback((productId, change) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        scheduledPriceChanges: [...p.scheduledPriceChanges, change]
          .sort((a, b) => new Date(a.effectiveDate) - new Date(b.effectiveDate)),
      };
    }));
  }, []);

  // Edit a scheduled price change
  const editScheduledChange = useCallback((productId, changeId, updates) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        scheduledPriceChanges: p.scheduledPriceChanges
          .map(c => c.id === changeId ? { ...c, ...updates } : c)
          .sort((a, b) => new Date(a.effectiveDate) - new Date(b.effectiveDate)),
      };
    }));
  }, []);

  // Delete a scheduled price change
  const deleteScheduledChange = useCallback((productId, changeId) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        scheduledPriceChanges: p.scheduledPriceChanges.filter(c => c.id !== changeId),
      };
    }));
  }, []);

  // Add a brand new product
  const addProduct = useCallback((product) => {
    setProducts(prev => [...prev, product]);
  }, []);

  // Update product details
  const updateProduct = useCallback((productId, updates) => {
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : p
    ));
  }, []);

  // Toast management
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // All scheduled changes (derived, flat)
  const allScheduledChanges = products.flatMap(p =>
    p.scheduledPriceChanges.map(c => ({
      ...c,
      productId: p.id,
      productName: p.name,
      currentPrice: p.unitPrice,
      category: p.category,
    }))
  ).sort((a, b) => new Date(a.effectiveDate) - new Date(b.effectiveDate));

  return (
    <AppContext.Provider value={{
      products,
      setProducts,
      selectedProduct,
      setSelectedProduct,
      compareProducts,
      setCompareProducts,
      activeTab,
      setActiveTab,
      sidebarOpen,
      setSidebarOpen,
      navigateToProduct,
      addProduct,
      addScheduledChange,
      editScheduledChange,
      deleteScheduledChange,
      updateProduct,
      allScheduledChanges,
      toasts,
      addToast,
      removeToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
