import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import SearchBar from '../components/SearchBar';
import BottomNav from '../components/BottomNav';
import StockBadge from '../components/StockBadge';
import Loader from '../components/Loader';
import { useProductSearch } from '../hooks/useProductSearch';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [term, setTerm] = useState('');
  const { results, loading: searching } = useProductSearch(term);

  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    api.getTodaySummary().then(setSummary).catch(() => setSummary({ billCount: 0, totalSales: 0, udharCount: 0 }));
    api.getLowStock().then(setLowStock).catch(() => setLowStock([]));
  }, []);

  return (
    <div className="pb-24 min-h-screen">
      <TopBar />
      <SearchBar value={term} onChange={setTerm} />

      {term ? (
        <div className="px-4 space-y-2 pt-1">
          {searching && <Loader label="Searching..." />}
          {!searching && results.length === 0 && (
            <p className="text-center text-ink-muted text-sm py-8">No items match "{term}".</p>
          )}
          {results.map((p) => (
            <div key={p.id} className="card flex items-center justify-between">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-ink-muted">{p.category}</p>
                <div className="mt-1">
                  <StockBadge stockQuantity={p.stockQuantity} lowStockThreshold={p.lowStockThreshold} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-primary tnum">₹{p.sellingPrice}</p>
                <p className="text-[11px] text-ink-muted">/{p.unit}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 space-y-4 pt-2">
          {/* Today's sales summary */}
          <div className="card bg-primary text-white border-none">
            <p className="text-sm text-white/80">Today's Sales</p>
            <p className="text-3xl font-extrabold tnum mt-1">
              ₹{summary ? summary.totalSales.toLocaleString('en-IN') : '—'}
            </p>
            <p className="text-xs text-white/80 mt-1 tnum">
              {summary ? `${summary.billCount} bills · ${summary.udharCount} on Udhar` : 'Loading...'}
            </p>
          </div>

          {/* Alert widgets */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/inventory?filter=low-stock')}
              className="card text-left border-amber-100 bg-amber-50/60"
            >
              <p className="text-2xl">🟠</p>
              <p className="font-bold text-lg tnum mt-1">{lowStock.length}</p>
              <p className="text-xs text-ink-muted">Low stock items</p>
            </button>
            <button onClick={() => navigate('/customers')} className="card text-left border-red-100 bg-red-50/40">
              <p className="text-2xl">🔴</p>
              <p className="font-bold text-lg tnum mt-1">{summary?.udharCount ?? 0}</p>
              <p className="text-xs text-ink-muted">Bills on Udhar today</p>
            </button>
          </div>

          {/* Quick actions */}
          <div>
            <p className="text-sm font-semibold text-ink-muted mb-2 px-0.5">Quick Actions</p>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction label="New Bill" emoji="🧾" onClick={() => navigate('/pos')} />
              <QuickAction label="Add Product" emoji="📦" onClick={() => navigate('/inventory/new')} />
              <QuickAction label="Customers" emoji="👥" onClick={() => navigate('/customers')} />
              {role === 'owner' && (
                <QuickAction label="Inventory" emoji="📊" onClick={() => navigate('/inventory')} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating New Bill button */}
      <button
        onClick={() => navigate('/pos')}
        className="fixed bottom-20 right-5 z-30 bg-cta hover:bg-cta-hover text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl font-light active:scale-95 transition"
        aria-label="New Bill"
      >
        +
      </button>

      <BottomNav />
    </div>
  );
}

function QuickAction({ label, emoji, onClick }) {
  return (
    <button onClick={onClick} className="card flex flex-col items-center justify-center gap-1.5 py-5 active:scale-[0.98] transition">
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}
