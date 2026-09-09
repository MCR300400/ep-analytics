export async function eseguiRollup(env) {
  const ieri = Date.now() - 86400000
  const retenzione = Number(env.RETENZIONE_GIORNI ?? 30)

  await env.DB.prepare(`
    INSERT OR REPLACE INTO statistiche_giornaliere
      (sito_id, giorno, percorso, visite, visitatori_unici, durata_mediana)
    SELECT sito_id,
           date(creato_il / 1000, 'unixepoch') AS giorno,
           percorso,
           COUNT(*),
           COUNT(DISTINCT visitatore_hash),
           NULL
    FROM eventi
    WHERE tipo = 'view' AND creato_il < ?
    GROUP BY sito_id, giorno, percorso
  `).bind(ieri).run()

  await env.DB.prepare(
    'DELETE FROM eventi WHERE creato_il < ?'
  ).bind(Date.now() - retenzione * 86400000).run()
}
