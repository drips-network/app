export default function (
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
  },
): string {
  return Intl.DateTimeFormat('en-US', options).format(date);
}
