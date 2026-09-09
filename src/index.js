import { instrada } from './router.js'
import { gestisciTracker } from './tracker.js'
import { gestisciIngest } from './ingest.js'
import { panoramica, dettaglioSito, contatorePubblico } from './api.js'
import { eseguiRollup } from './rollup.js'
import { headerCors } from './cors.js'

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8'
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const { rotta, sitoId } = instrada(url.pathname)

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: headerCors(request.headers.get('Origin'))
      })
    }

    const giorni = Math.min(
      Math.max(Number(url.searchParams.get('giorni')) || 7, 1), 90
    )

    try {
      if (rotta === 'tracker' && request.method === 'GET') {
        return gestisciTracker()
      }
      if (rotta === 'ingest' && request.method === 'POST') {
        return gestisciIngest(request, env)
      }
      if (rotta === 'contatore' && request.method === 'GET') {
        const sito = url.searchParams.get('sito') || 'portfolio'
        const data = await contatorePubblico(env, sito)
        return Response.json(data, {
          headers: {
            ...JSON_HEADERS,
            'Cache-Control': 'public, max-age=60',
            'Access-Control-Allow-Origin': '*'
          }
        })
      }
      if (rotta === 'panoramica' && request.method === 'GET') {
        const origin = request.headers.get('Origin')
        return Response.json(await panoramica(env, giorni), {
          headers: {
            ...JSON_HEADERS,
            ...headerCors(origin)
          }
        })
      }
      if (rotta === 'dettaglio' && request.method === 'GET') {
        const origin = request.headers.get('Origin')
        return Response.json(await dettaglioSito(env, sitoId, giorni), {
          headers: {
            ...JSON_HEADERS,
            ...headerCors(origin)
          }
        })
      }
      return new Response('Non trovato', { status: 404 })
    } catch (err) {
      console.error(err)
      return new Response('Errore interno', { status: 500 })
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(eseguiRollup(env))
  }
}
