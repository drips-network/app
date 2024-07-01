export default function invalidateAccountCache(accountId: string) {
  return fetch('/api/cache/invalidate-account-ids', {
    method: 'POST',
    body: JSON.stringify([accountId]),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
