export default function formatNumber(amount: number) {
  const formatter = new Intl.NumberFormat('en-US');
  return formatter.format(amount);
}
