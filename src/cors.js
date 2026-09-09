export function originConsentito(request, dominio) {
  const origin = request.headers.get('Origin')
  if (!origin) return null
  if (!dominio) return origin
  try {
    const host = new URL(origin).hostname
    // Supporto per sviluppo locale su localhost
    if (host === 'localhost' || host === '127.0.0.1') return origin
    return host === dominio || host.endsWith('.' + dominio) ? origin : null
  } catch {
    return null
  }
}

export function headerCors(origin) {
  return {
    'Access-Control-Allow-Origin': origin ?? 'null',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  }
}
