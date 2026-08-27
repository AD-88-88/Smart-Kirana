import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import Loader from '../components/Loader';
import { api } from '../lib/api';

export default function StaffManagement() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ staffId: '', pin: '', role: 'staff' });

  useEffect(() => {
    api.getStaff().then(setStaff).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleAddStaff(e) {
    e.preventDefault();
    setAdding(true);
    try {
      await api.addStaff(form);
      setForm({ staffId: '', pin: '', role: 'staff' });
      const updated = await api.getStaff();
      setStaff(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="min-h-screen pb-10">
      <TopBar title="Staff Management" onBack={() => navigate('/admin')} />
      <div className="px-4 pt-4 space-y-4">
        <form onSubmit={handleAddStaff} className="card p-4 space-y-3">
          <h2 className="font-semibold text-lg">Add New Staff</h2>
          <input className="input-field" placeholder="Staff ID" value={form.staffId} onChange={e => setForm({...form, staffId: e.target.value})} required />
          <input className="input-field" type="password" placeholder="PIN" value={form.pin} onChange={e => setForm({...form, pin: e.target.value})} required />
          <select className="input-field" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="staff">Staff</option>
            <option value="owner">Owner</option>
          </select>
          <button type="submit" className="btn-cta w-full" disabled={adding}>{adding ? 'Adding...' : 'Add Staff'}</button>
        </form>
        
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-ink-muted">
              <tr>
                <th className="p-3 text-left">Staff ID</th>
                <th className="p-3 text-left">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan="2" className="p-4"><Loader label="Loading..." /></td></tr> : staff.map(s => (
                <tr key={s.uid}>
                  <td className="p-3">{s.staffId}</td>
                  <td className="p-3 capitalize">{s.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
