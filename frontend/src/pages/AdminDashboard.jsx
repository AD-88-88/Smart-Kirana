import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-10">
      <TopBar title="Admin Panel" onBack={() => navigate('/')} />
      <div className="px-4 pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <AdminCard label="Analytics" emoji="📈" onClick={() => navigate('/admin/analytics')} />
          <AdminCard label="Staff Mgmt" emoji="🧑‍💼" onClick={() => navigate('/admin/staff')} />
          <AdminCard label="Inventory" emoji="📊" onClick={() => navigate('/inventory')} />
        </div>
      </div>
    </div>
  );
}

function AdminCard({ label, emoji, onClick }) {
  return (
    <button onClick={onClick} className="card flex flex-col items-center justify-center gap-2 py-8 active:scale-[0.98] transition">
      <span className="text-4xl">{emoji}</span>
      <span className="font-semibold text-lg">{label}</span>
    </button>
  );
}
