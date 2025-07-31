export default async function fetchTlv(f: typeof fetch) {
  const response = await f('/api/tlv');
  if (!response.ok) {
    return null;
  }

  return response.json();
}
