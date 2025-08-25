export default function buildOrcidUrl(orcidId: string, { absolute = false }: { absolute?: boolean } = {}): string {
  let origin = ''
  if (absolute && typeof window !== 'undefined' && window) {
    origin = window.location.origin
  }

  return `${origin}/app/orcids/${orcidId}`
}