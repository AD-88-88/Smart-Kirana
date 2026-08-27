import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Loader from '../components/Loader';
import { api } from '../lib/api';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    api
      .getCustomer(id)
      .then(setCustomer)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleRecordPayment(e) {
    e.preventDefault();
    setError('');
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) return setError('Enter a valid amount.');

    setSaving(true);
    try {
      await api.recordPayment(id, amount);
      setPaymentAmount('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Loading customer..." />;
  if (!customer) return <p className="p-6 text-center text-danger">{error || 'Customer not found.'}</p>;

  return (
    <div className="min-h-screen pb-10">
      <TopBar title={customer.name} onBack={() => navigate('/customers')} />

      <div className="px-4 pt-4 space-y-4">
        <div className="card bg-primary text-white border-none text-center py-6">
          <p className="text-sm text-white/80">Outstanding Balance</p>
          <p className="text-3xl font-extrabold tnum mt-1">₹{(customer.outstandingBalance || 0).toFixed(0)}</p>
        </div>

        {customer.outstandingBalance > 0 && (
          <form onSubmit={handleRecordPayment} className="card space-y-3">
            <p className="font-semibold text-sm">Record a Payment</p>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                placeholder="Amount ₹"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="input-field tnum flex-1"
              />
              <button type="submit" disabled={saving} className="btn-cta px-6">
                {saving ? '...' : 'Save'}
              </button>
            </div>
            {error && <p className="text-danger text-xs">{error}</p>}
          </form>
        )}

        <div>
          <p className="font-semibold text-sm text-ink-muted mb-2">Recent Purchases</p>
          {(customer.recentSales || []).length === 0 && (
            <p className="text-sm text-ink-muted card text-center py-6">No purchases recorded yet.</p>
          )}
          <div className="space-y-2">
            {(customer.recentSales || []).map((s) => (
              <div key={s.id} className="card flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Bill #{s.billNumber}</p>
                  <p className="text-xs text-ink-muted capitalize">{s.paymentMode}</p>
                </div>
                <p className="font-bold tnum">₹{s.total.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
