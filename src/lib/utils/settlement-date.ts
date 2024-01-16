export default function nextSettlementDate() {
  const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  if (lastDay.getDay() < 4) {
    lastDay.setDate(lastDay.getDate() - 7);
  }

  lastDay.setDate(lastDay.getDate() - (lastDay.getDay() - 4));

  return lastDay;
}
