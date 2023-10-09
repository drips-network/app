const DATE_FORMAT_CONVENTIONS = {
  onlyDay: {
    day: 'numeric',
    month: 'long',
  },
  dayAndYear: {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
  standard: {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  },
  verbose: {
    month: 'long',
    year: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  },
} as const;

function suffixNumber(n: number) {
  if (n > 3 && n < 21) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/**
 * Format a date with a reusable, pre-configured date format convention.
 * @param date The date to format.
 * @param convention The convention to use.
 * @returns A formatted date string, in the user's current timezone.
 */
export default function (
  date: Date,
  convention: keyof typeof DATE_FORMAT_CONVENTIONS = 'standard',
): string {
  return (
    Intl.DateTimeFormat('en-US', DATE_FORMAT_CONVENTIONS[convention]).format(date) +
    (convention === 'onlyDay' ? suffixNumber(date.getDate()) : '')
  );
}
