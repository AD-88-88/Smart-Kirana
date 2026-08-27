import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import TopBar from '../components/TopBar';
import Loader from '../components/Loader';
import { db } from '../firebase';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Staples', 'Dairy', 'Snacks', 'Beverages', 'Personal Care', 'Household', 'Other'];
const UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'packet'];

const EMPTY = {
  name: '',
  barcode: '',
  category: 'Staples',
  unit: 'pcs',
  purchasePrice: '',
  sellingPrice: '',
  stockQuantity: '',
  lowStockThreshold: '',
};

export default function ProductForm() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { role } = useAuth();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;
    getDoc(doc(db, 'products', id)).then((snap) => {
      if (snap.exists()) setForm({ ...EMPTY, ...snap.data() });
      setLoading(false);
    });
  }, [id, isNew]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name || !form.category || !form.unit || form.sellingPrice === '' || form.stockQuantity === '') {
      setError('Please fill in item name, category, unit, selling price and stock.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        purchasePrice: Number(form.purchasePrice) || 0,
        sellingPrice: Number(form.sellingPrice),
        stockQuantity: Number(form.stockQuantity),
        lowStockThreshold: Number(form.lowStockThreshold) || 0,
      };
      if (isNew) {
        await api.addProduct(payload);
      } else {
        await api.updateProduct(id, payload);
      }
      navigate('/inventory');
    } catch (err) {
      setError(err.message || 'Could not save product. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${form.name}"? This can't be undone.`)) return;
    try {
      await api.deleteProduct(id);
      navigate('/inventory');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <Loader label="Loading product..." />;

  return (
    <div className="min-h-screen pb-10">
      <TopBar title={isNew ? 'Add Product' : 'Edit Product'} onBack={() => navigate('/inventory')} />

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        <Field label="Item Name" required>
          <input className="input-field" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Tata Salt 1kg" />
        </Field>

        <Field label="Barcode (optional)">
          <input className="input-field tnum" value={form.barcode} onChange={(e) => set('barcode', e.target.value)} placeholder="Scan or type" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" required>
            <select className="input-field" value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Unit" required>
            <select className="input-field" value={form.unit} onChange={(e) => set('unit', e.target.value)}>
              {UNITS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {role === 'owner' && (
            <Field label="Purchase Price (₹)">
              <input
                className="input-field tnum"
                type="number"
                min="0"
                value={form.purchasePrice}
                onChange={(e) => set('purchasePrice', e.target.value)}
              />
            </Field>
          )}
          <Field label="Selling Price (₹)" required>
            <input
              className="input-field tnum"
              type="number"
              min="0"
              value={form.sellingPrice}
              onChange={(e) => set('sellingPrice', e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Stock Quantity" required>
            <input
              className="input-field tnum"
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={(e) => set('stockQuantity', e.target.value)}
            />
          </Field>
          <Field label="Low Stock Alert At">
            <input
              className="input-field tnum"
              type="number"
              min="0"
              value={form.lowStockThreshold}
              onChange={(e) => set('lowStockThreshold', e.target.value)}
            />
          </Field>
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="btn-cta w-full">
          {saving ? 'Saving...' : 'Save Product'}
        </button>

        {!isNew && role === 'owner' && (
          <button type="button" onClick={handleDelete} className="w-full text-danger text-sm font-medium py-2">
            Delete Product
          </button>
        )}
      </form>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink mb-1 block">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {children}
    </label>
  );
}
