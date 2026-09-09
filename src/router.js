export function instrada(pathname) {
  if (pathname === '/t.js') return { rotta: 'tracker' }
  if (pathname === '/eventi') return { rotta: 'ingest' }
  if (pathname === '/pubblico/contatore') return { rotta: 'contatore' }
  if (pathname === '/api/panoramica') return { rotta: 'panoramica' }
  const m = pathname.match(/^\/api\/siti\/([a-z0-9-]{1,40})$/)
  if (m) return { rotta: 'dettaglio', sitoId: m[1] }
  return { rotta: null }
}
