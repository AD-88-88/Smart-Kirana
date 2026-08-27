import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [staffId, setStaffId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(staffId, pin);
    } catch (err) {
      setError('Staff ID or PIN is incorrect. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-gradient-to-b from-primary to-primary-light">
      <div className="max-w-sm w-full mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-6 9 6M5 9v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold">SmartKirana</h1>
          <p className="text-white/80 text-sm mt-1">Staff &amp; owner login</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <label className="text-sm font-medium text-ink mb-1 block">Staff ID</label>
            <input
              className="input-field"
              placeholder="e.g. ramesh or owner"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              autoCapitalize="none"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink mb-1 block">PIN</label>
            <input
              className="input-field tnum"
              type="password"
              inputMode="numeric"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-cta w-full">
            {submitting ? 'Logging in...' : 'Log In'}
          </button>

          <p className="text-xs text-ink-muted text-center pt-1">
            New staff account? Ask the store owner to create one from Settings.
          </p>
        </form>
      </div>
    </div>
  );
}
