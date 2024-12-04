export function nextMainnetSettlementDate() {
  const currentDate = new Date();

  let lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  if (lastDay.getDay() < 4) {
    lastDay.setDate(lastDay.getDate() - 7);
  }

  lastDay.setDate(lastDay.getDate() - (lastDay.getDay() - 4));

  if (currentDate > lastDay) {
    lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);
    if (lastDay.getDay() < 4) {
      lastDay.setDate(lastDay.getDate() - 7);
    }
    lastDay.setDate(lastDay.getDate() - (lastDay.getDay() - 4));
  }

  return lastDay;
}

export function nextFilecoinSettlementDate() {
  const today = new Date();
  // Filecoin settlement happens weekly on thursday
  today.setDate(today.getDate() + ((4 + 7 - today.getDay()) % 7));
  return today;
}
