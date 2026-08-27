export default function StockBadge({ stockQuantity, lowStockThreshold }) {
  let tone = 'success';
  let label = `In stock: ${stockQuantity}`;
  let dot = 'bg-success';

  if (stockQuantity <= 0) {
    tone = 'danger';
    label = 'Out of stock';
    dot = 'bg-danger';
  } else if (stockQuantity <= lowStockThreshold) {
    tone = 'warning';
    label = `Low: ${stockQuantity} left`;
    dot = 'bg-warning';
  }

  const toneClasses = {
    success: 'bg-green-50 text-success',
    warning: 'bg-amber-50 text-warning',
    danger: 'bg-red-50 text-danger',
  };

  return (
    <span className={`stock-badge tnum ${toneClasses[tone]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
