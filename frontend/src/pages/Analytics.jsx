import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Loader from '../components/Loader';
import { api } from '../lib/api';

export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading analytics..." />;

  return (
    <div className="min-h-screen pb-10">
      <TopBar title="Analytics" onBack={() => navigate('/admin')} />
      <div className="px-4 pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <p className="text-sm text-ink-muted">Total Sales</p>
            <p className="text-2xl font-bold tnum">₹{data.totalSales.toLocaleString('en-IN')}</p>
          </div>
          <div className="card">
            <p className="text-sm text-ink-muted">Total Bills</p>
            <p className="text-2xl font-bold tnum">{data.totalBills}</p>
          </div>
        </div>
        
        <div className="card">
            <h2 className="font-semibold text-lg mb-4">Daily Sales Trend</h2>
            <div className="space-y-2">
                {Object.entries(data.dailySales).map(([date, amount]) => (
                    <div key={date} className="flex justify-between items-center text-sm">
                        <span className="text-ink-muted">{date}</span>
                        <span className="font-semibold tnum">₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
