import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { useAllProducts, useProductSearch } from '../hooks/useProductSearch';
import { api } from '../lib/api';

const GST_RATE = 5; // default GST%, adjustable per store in Settings (Phase 2)

export default function POS() {
  const navigate = useNavigate();
  const { products: allProducts } = useAllProducts();
  const [term, setTerm] = useState('');
  const { results } = useProductSearch(term);

  const [cart, setCart] = useState([]); // { productId, name, unit, unitPrice, quantity, stockQuantity }
  const [gstEnabled, setGstEnabled] = useState(false);
  const [discount, setDiscount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');

  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [bill, setBill] = useState(null); // set once generated -> shows success screen

  const quickTiles = useMemo(() => allProducts.slice(0, 8), [allProducts]);

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((it) => it.productId === product.id);
      if (existing) {
        return prev.map((it) =>
          it.productId === product.id
            ? { ...it, quantity: Math.min(it.quantity + 1, product.stockQuantity) }
            : it
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unit: product.unit,
          unitPrice: product.sellingPrice,
          quantity: 1,
          stockQuantity: product.stockQuantity,
        },
      ];
    });
    setTerm('');
  }

  function changeQty(productId, delta) {
    setCart((prev) =>
      prev
        .map((it) =>
          it.productId === productId
            ? { ...it, quantity: Math.max(0, Math.min(it.quantity + delta, it.stockQuantity)) }
            : it
        )
        .filter((it) => it.quantity > 0)
    );
  }

  const subtotal = cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const gstAmount = gstEnabled ? +(subtotal * (GST_RATE / 100)).toFixed(2) : 0;
  const total = Math.max(0, +(subtotal + gstAmount - (Number(discount) || 0)).toFixed(2));

  async function searchCustomers(q) {
    setCustomerQuery(q);
    if (!q.trim()) return setCustomerResults([]);
    try {
      setCustomerResults(await api.getCustomers(q));
    } catch {
      setCustomerResults([]);
    }
  }

  async function quickAddCustomer() {
    if (!customerQuery.trim()) return;
    try {
      const created = await api.addCustomer({ name: customerQuery.trim() });
      setSelectedCustomer(created);
      setCustomerResults([]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGenerateBill() {
    setError('');
    if (cart.length === 0) return setError('Add at least one item to the bill.');
    if (paymentMode === 'udhar' && !selectedCustomer) {
      return setError('Udhar bills must be tagged to a customer. Search or add one below.');
    }

    setGenerating(true);
    try {
      const result = await api.createSale({
        items: cart.map(({ productId, name, unit, unitPrice, quantity }) => ({
          productId,
          name,
          unit,
          unitPrice,
          quantity,
        })),
        gstEnabled,
        gstRate: GST_RATE,
        discount: Number(discount) || 0,
        paymentMode,
        customerId: selectedCustomer?.id || null,
      });
      setBill(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  function resetForNewBill() {
    setCart([]);
    setDiscount('');
    setPaymentMode('cash');
    setSelectedCustomer(null);
    setCustomerQuery('');
    setBill(null);
    setError('');
  }

  function shareOnWhatsApp() {
    const lines = [
      `*SmartKirana Bill #${bill.billNumber}*`,
      ...bill.items.map((it) => `${it.name} x${it.quantity} - ₹${(it.unitPrice * it.quantity).toFixed(2)}`),
      `Subtotal: ₹${bill.subtotal.toFixed(2)}`,
      bill.gstEnabled ? `GST: ₹${bill.gstAmount.toFixed(2)}` : null,
      bill.discount ? `Discount: -₹${bill.discount.toFixed(2)}` : null,
      `*Total: ₹${bill.total.toFixed(2)}*`,
      `Payment: ${bill.paymentMode.toUpperCase()}`,
    ].filter(Boolean);
    const text = encodeURIComponent(lines.join('\n'));
    const phone = selectedCustomer?.phone ? selectedCustomer.phone.replace(/\D/g, '') : '';
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  }

  function printBill() {
    window.print();
  }

  if (bill) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-3xl mb-4">✅</div>
        <h2 className="text-xl font-bold">Bill #{bill.billNumber} generated</h2>
        <p className="text-2xl font-extrabold text-primary tnum mt-2">₹{bill.total.toFixed(2)}</p>
        <p className="text-sm text-ink-muted mt-1 capitalize">{bill.paymentMode} payment</p>

        <div id="printable-bill" className="hidden print:block text-left mt-4">
          <h3 className="font-bold">Bill #{bill.billNumber}</h3>
          {bill.items.map((it) => (
            <p key={it.productId}>
              {it.name} x{it.quantity} — ₹{(it.unitPrice * it.quantity).toFixed(2)}
            </p>
          ))}
          <p>Total: ₹{bill.total.toFixed(2)}</p>
        </div>

        <div className="w-full max-w-xs space-y-3 mt-8">
          <button onClick={printBill} className="btn-secondary w-full">🖨️ Print</button>
          <button onClick={shareOnWhatsApp} className="btn-secondary w-full">📱 Send on WhatsApp</button>
          <button onClick={resetForNewBill} className="btn-cta w-full">New Bill</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-40">
      <TopBar title="New Bill" onBack={() => navigate('/')} />

      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-ink-muted shrink-0">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search item to add..."
            className="flex-1 outline-none text-base bg-transparent"
          />
        </div>

        {term && (
          <div className="mt-2 space-y-2">
            {results.length === 0 && <p className="text-sm text-ink-muted py-2">No matches.</p>}
            {results.map((p) => (
              <button key={p.id} onClick={() => addToCart(p)} className="card w-full flex items-center justify-between">
                <div className="text-left">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-ink-muted">Stock: {p.stockQuantity}</p>
                </div>
                <span className="font-bold text-primary tnum">₹{p.sellingPrice}</span>
              </button>
            ))}
          </div>
        )}

        {!term && quickTiles.length > 0 && (
          <div className="flex gap-2 overflow-x-auto mt-3 pb-1">
            {quickTiles.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="shrink-0 bg-white border border-gray-200 rounded-xl px-4 py-3 text-center min-w-[90px] active:scale-95 transition"
              >
                <p className="text-sm font-semibold truncate max-w-[80px]">{p.name}</p>
                <p className="text-xs text-primary font-bold tnum">₹{p.sellingPrice}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current bill */}
      <div className="px-4 mt-4">
        <p className="text-sm font-semibold text-ink-muted mb-2">Current Bill</p>
        {cart.length === 0 && <p className="text-sm text-ink-muted py-6 text-center card">No items yet. Search above to add.</p>}
        <div className="space-y-2">
          {cart.map((it) => (
            <div key={it.productId} className="card flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{it.name}</p>
                <p className="text-xs text-ink-muted tnum">₹{it.unitPrice} / {it.unit}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-surface rounded-lg px-1">
                  <button onClick={() => changeQty(it.productId, -1)} className="w-8 h-8 text-lg font-bold">−</button>
                  <span className="tnum w-5 text-center">{it.quantity}</span>
                  <button onClick={() => changeQty(it.productId, 1)} className="w-8 h-8 text-lg font-bold">+</button>
                </div>
                <span className="font-bold tnum w-16 text-right">₹{(it.unitPrice * it.quantity).toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals + payment - fixed bottom sheet */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 rounded-t-2xl shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] space-y-3 z-30">
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-muted">
            <input type="checkbox" checked={gstEnabled} onChange={(e) => setGstEnabled(e.target.checked)} />
            GST ({GST_RATE}%)
          </label>
          <input
            type="number"
            min="0"
            placeholder="Discount ₹"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="w-28 text-right border border-gray-200 rounded-lg px-2 py-1 tnum text-sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-ink-muted text-sm">Total</span>
          <span className="text-2xl font-extrabold tnum">₹{total.toFixed(2)}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {['cash', 'upi', 'udhar'].map((mode) => (
            <button
              key={mode}
              onClick={() => setPaymentMode(mode)}
              className={`py-2 rounded-lg text-sm font-semibold capitalize border ${
                paymentMode === mode ? 'bg-primary text-white border-primary' : 'bg-white text-ink-muted border-gray-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {paymentMode === 'udhar' && (
          <div className="space-y-2">
            {selectedCustomer ? (
              <div className="flex items-center justify-between bg-surface rounded-lg px-3 py-2 text-sm">
                <span className="font-medium">{selectedCustomer.name}</span>
                <button onClick={() => setSelectedCustomer(null)} className="text-primary text-xs font-semibold">Change</button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <input
                  className="input-field text-sm py-2.5"
                  placeholder="Search or add customer name..."
                  value={customerQuery}
                  onChange={(e) => searchCustomers(e.target.value)}
                />
                {customerResults.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setCustomerResults([]);
                    }}
                    className="w-full text-left text-sm px-3 py-2 bg-surface rounded-lg"
                  >
                    {c.name} {c.phone ? `· ${c.phone}` : ''}
                  </button>
                ))}
                {customerQuery && customerResults.length === 0 && (
                  <button onClick={quickAddCustomer} className="w-full text-left text-sm px-3 py-2 bg-blue-50 text-primary rounded-lg font-medium">
                    + Add "{customerQuery}" as new customer
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {error && <p className="text-danger text-xs">{error}</p>}

        <button onClick={handleGenerateBill} disabled={generating} className="btn-cta w-full">
          {generating ? 'Generating...' : 'Generate Bill'}
        </button>
      </div>
    </div>
  );
}
