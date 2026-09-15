const GIORNO = 86400000

export async function panoramica(env, giorni) {
  const da = Date.now() - giorni * GIORNO

  const siti = await env.DB.prepare(`
    SELECT s.id, s.nome, s.dominio,
           COUNT(CASE WHEN e.tipo = 'view' THEN 1 END) AS visite,
           COUNT(DISTINCT CASE WHEN e.tipo = 'view'
                 THEN e.visitatore_hash END) AS unici,
           MAX(e.creato_il) AS ultimo_evento
    FROM siti s
    LEFT JOIN eventi e ON e.sito_id = s.id AND e.creato_il > ?
    WHERE s.attivo = 1
    GROUP BY s.id, s.nome, s.dominio
    ORDER BY visite DESC
  `).bind(da).all()

  const trend = await env.DB.prepare(`
    SELECT sito_id, giorno, SUM(visite) AS visite
    FROM statistiche_giornaliere
    WHERE giorno >= date('now', ?)
    GROUP BY sito_id, giorno
    ORDER BY giorno
  `).bind('-' + giorni + ' days').all()

  return { siti: siti.results ?? [], trend: trend.results ?? [] }
}

export async function dettaglioSito(env, sitoId, giorni) {
  const da = Date.now() - giorni * GIORNO

  const pagine = await env.DB.prepare(`
    SELECT percorso, COUNT(*) AS visite
    FROM eventi
    WHERE sito_id = ? AND tipo = 'view' AND creato_il > ?
    GROUP BY percorso ORDER BY visite DESC LIMIT 10
  `).bind(sitoId, da).all()

  const referrer = await env.DB.prepare(`
    SELECT referrer, COUNT(*) AS visite
    FROM eventi
    WHERE sito_id = ? AND tipo = 'view' AND creato_il > ?
          AND referrer IS NOT NULL
    GROUP BY referrer ORDER BY visite DESC LIMIT 10
  `).bind(sitoId, da).all()

  const mediana = await env.DB.prepare(`
    SELECT secondi FROM eventi
    WHERE sito_id = ? AND tipo = 'durata' AND creato_il > ? AND secondi > 0
    ORDER BY secondi
    LIMIT 1
    OFFSET (SELECT COUNT(*) / 2 FROM eventi
            WHERE sito_id = ? AND tipo = 'durata'
                  AND creato_il > ? AND secondi > 0)
  `).bind(sitoId, da, sitoId, da).first()

  return {
    pagine: pagine.results ?? [],
    referrer: referrer.results ?? [],
    durata_mediana: mediana?.secondi ?? null
  }
}

export async function contatorePubblico(env, sitoId) {
  const res = await env.DB.prepare(`
    SELECT COUNT(DISTINCT COALESCE(visitatore_hash, sessione)) AS unici
    FROM eventi
    WHERE sito_id = ? AND tipo = 'view'
  `).bind(sitoId).first()

  const unici = res?.unici ?? 0
  return { visite: unici, unici }
}

