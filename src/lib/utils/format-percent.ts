export default function formatPercent(amount: number, threshold: number = 0.001) {
  const percentFormatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  });

  if (amount * 100 < threshold) {
    return '<0.001%';
  }

  return percentFormatter.format(amount);
}
