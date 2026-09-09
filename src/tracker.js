const SCRIPT = `(function(){
  var s = document.currentScript;
  var sito = s.getAttribute('data-sito');
  var chiave = s.getAttribute('data-chiave');
  var api = s.src.replace(/\\/t\\.js.*$/, '');
  var sessione = (crypto.randomUUID && crypto.randomUUID()) ||
                 String(Date.now()) + Math.random();
  var inizio = Date.now();

  function invia(dati, beacon) {
    dati.sito_id = sito; dati.chiave = chiave; dati.sessione = sessione;
    var corpo = JSON.stringify(dati);
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(api + '/eventi', corpo);
    } else {
      fetch(api + '/eventi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: corpo,
        keepalive: true
      }).catch(function(){});
    }
  }

  invia({ tipo: 'view', percorso: location.pathname,
          referrer: document.referrer || null }, false);

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      invia({ tipo: 'durata', percorso: location.pathname,
              secondi: Math.round((Date.now() - inizio) / 1000) }, true);
    } else {
      inizio = Date.now();
    }
  });
})();`

export function gestisciTracker() {
  return new Response(SCRIPT, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    }
  })
}
