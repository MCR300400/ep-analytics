# ep-analytics (Cloudflare Worker + D1)

Backend centrale serverless per la raccolta di eventi analytics e la fornitura di API di monitoraggio multi-sito per il portfolio e progetti correlati.

## Architettura e Scelte Tecniche
- **Zero dipendenze a runtime**: solo API native Web standard (Web Crypto, D1, fetch, Response).
- **Privacy-first e Zero Cookie**: nessun cookie, nessun localStorage/sessionStorage. Hashing SHA-256 anonimizzato (`IP + User-Agent + SALT + Giorno`) che ruota ogni 24h.
- **Rollup notturno e retenzione**: Cron Trigger (`0 3 * * *`) per aggregare le visite giornaliere e cancellare gli eventi grezzi oltre i 30 giorni, rispettando i limiti D1 (500 MB).
- **Query ottimizzate**: Panoramica calcolata in sole 2 query totali (nessun pattern N+1).

## Endpoint
- `GET /t.js`: Script tracker client-side pubblico per siti terzi (cache 1h).
- `POST /eventi`: Ingest eventi (`view`, `durata`), validato per chiave sito e header `Origin`.
- `GET /pubblico/contatore?sito=portfolio`: Totale visite pubblico con cache 60s per il contatore del portfolio.
- `GET /api/panoramica?giorni=7|30|90`: Statistiche aggregate di tutti i siti monitorati (protetto da Cloudflare Access).
- `GET /api/siti/:id?giorni=7|30|90`: Dettaglio metriche per singolo sito (pagine, referrer, durata mediana).

## Setup e Sviluppo Locale
1. Installa le dipendenze di sviluppo:
   ```bash
   npm install
   ```
2. Crea il database D1 remoto (solo la prima volta):
   ```bash
   npx wrangler d1 create ep-analytics-db
   ```
   Copia il `database_id` restituito in `wrangler.toml`.
3. Applica le migrazioni in locale:
   ```bash
   npm run db:local
   ```
4. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```
5. Imposta il secret per il salt in produzione:
   ```bash
   npx wrangler secret put SALT
   ```
6. Deploy su Cloudflare Workers:
   ```bash
   npm run db:remote
   npm run deploy
   ```
