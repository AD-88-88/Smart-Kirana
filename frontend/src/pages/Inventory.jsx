import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import StockBadge from '../components/StockBadge';
import Loader from '../components/Loader';
import { useAllProducts } from '../hooks/useProductSearch';

const CATEGORIES = ['All', 'Staples', 'Dairy', 'Snacks', 'Beverages', 'Personal Care', 'Household', 'Other'];

export default function Inventory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') === 'low-stock';

  const { products, loading } = useAllProducts();
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [lowStockOnly, setLowStockOnly] = useState(initialFilter);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (lowStockOnly && p.stockQuantity > p.lowStockThreshold) return false;
      if (category !== 'All' && p.category !== category) return false;
      if (term && !p.name.toLowerCase().includes(term.toLowerCase())) return false;
      return true;
    });
  }, [products, term, category, lowStockOnly]);

  return (
    <div className="pb-24 min-h-screen">
      <TopBar title="Inventory" onBack={() => navigate('/')} />

      <div className="px-4 pt-3 pb-2 space-y-2 bg-white sticky top-[56px] z-20 shadow-sm">
        <div className="flex items-center gap-2 bg-surface rounded-xl px-3 py-2.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-ink-muted shrink-0">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search products..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border ${
                category === c ? 'bg-primary text-white border-primary' : 'bg-white text-ink-muted border-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-ink-muted pt-0.5">
          <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
          Show low / out-of-stock only
        </label>
      </div>

      <div className="px-4 pt-3 space-y-2">
        {loading && <Loader label="Loading inventory..." />}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-ink-muted text-sm py-10">No products found. Try a different filter.</p>
        )}
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/inventory/${p.id}`)}
            className="card w-full flex items-center justify-between text-left"
          >
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-ink-muted">
                {p.category} · Stock: {p.stockQuantity}
              </p>
              <div className="mt-1">
                <StockBadge stockQuantity={p.stockQuantity} lowStockThreshold={p.lowStockThreshold} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-bold tnum">₹{p.sellingPrice}</p>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => navigate('/inventory/new')}
        className="fixed bottom-20 right-5 z-30 bg-cta hover:bg-cta-hover text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl font-light active:scale-95 transition"
        aria-label="Add Product"
      >
        +
      </button>

      <BottomNav />
    </div>
  );
}
