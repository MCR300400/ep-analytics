export async function hashVisitatore(request, salt) {
  const ip = request.headers.get('CF-Connecting-IP') ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const ua = request.headers.get('User-Agent') ?? ''
  const dati = new TextEncoder().encode(ip + ua + (salt ?? 'dev-salt'))
  const digest = await crypto.subtle.digest('SHA-256', dati)
  return [...new Uint8Array(digest)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32)
}
