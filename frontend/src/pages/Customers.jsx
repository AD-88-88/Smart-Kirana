import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import Loader from '../components/Loader';
import { api } from '../lib/api';

export default function Customers() {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getCustomers(term)
      .then(setCustomers)
      .finally(() => setLoading(false));
  }, [term]);

  return (
    <div className="pb-24 min-h-screen">
      <TopBar title="Customers" onBack={() => navigate('/')} />

      <div className="px-4 pt-3">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search by name or phone..."
          className="input-field"
        />
      </div>

      <div className="px-4 pt-3 space-y-2">
        {loading && <Loader label="Loading customers..." />}
        {!loading && customers.length === 0 && (
          <p className="text-center text-ink-muted text-sm py-10">No customers yet. Add one from the POS screen during billing.</p>
        )}
        {customers.map((c) => (
          <button key={c.id} onClick={() => navigate(`/customers/${c.id}`)} className="card w-full flex items-center justify-between text-left">
            <div>
              <p className="font-semibold">{c.name}</p>
              {c.phone && <p className="text-xs text-ink-muted">{c.phone}</p>}
            </div>
            <div className="text-right">
              <p className={`font-bold tnum ${c.outstandingBalance > 0 ? 'text-danger' : 'text-success'}`}>
                ₹{(c.outstandingBalance || 0).toFixed(0)}
              </p>
              <p className="text-[11px] text-ink-muted">{c.outstandingBalance > 0 ? 'outstanding' : 'settled'}</p>
            </div>
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
