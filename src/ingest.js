import { originConsentito, headerCors } from './cors.js'
import { hashVisitatore } from './hash.js'

export async function gestisciIngest(request, env) {
  let body
  try {
    body = await request.json()
  } catch {
    return new Response('JSON non valido', { status: 400 })
  }

  const { sito_id, chiave, tipo, percorso, sessione, referrer, secondi } = body

  if (!sito_id || !chiave || !tipo || !sessione) {
    return new Response('Campi obbligatori mancanti', { status: 400 })
  }
  if (tipo !== 'view' && tipo !== 'durata') {
    return new Response('Tipo non valido', { status: 400 })
  }

  const sito = await env.DB.prepare(
    'SELECT id, dominio FROM siti WHERE id = ? AND chiave = ? AND attivo = 1'
  ).bind(sito_id, chiave).first()

  if (!sito) return new Response('Sito non riconosciuto', { status: 403 })

  const origin = originConsentito(request, sito.dominio)
  if (!origin) return new Response('Origin non valido', { status: 403 })

  const durataMax = Number(env.DURATA_MAX_SECONDI ?? 600)
  const durata = tipo === 'durata'
    ? Math.min(Math.max(Number(secondi) || 0, 0), durataMax)
    : null

  await env.DB.prepare(`
    INSERT INTO eventi
      (tipo, sito_id, percorso, sessione, paese, citta, referrer,
       secondi, visitatore_hash, creato_il)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    tipo,
    sito.id,
    String(percorso ?? '/').slice(0, 300),
    String(sessione).slice(0, 64),
    request.cf?.country ?? null,
    request.cf?.city ?? null,
    referrer ? String(referrer).slice(0, 300) : null,
    durata,
    await hashVisitatore(request, env.SALT),
    Date.now()
  ).run()

  return new Response(null, { status: 204, headers: headerCors(origin) })
}
