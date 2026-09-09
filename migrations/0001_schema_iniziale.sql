CREATE TABLE siti (
  id          TEXT PRIMARY KEY,
  nome        TEXT NOT NULL,
  dominio     TEXT,
  chiave      TEXT NOT NULL UNIQUE,
  attivo      INTEGER NOT NULL DEFAULT 1,
  creato_il   INTEGER NOT NULL
);

CREATE TABLE eventi (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo             TEXT NOT NULL,
  sito_id          TEXT NOT NULL REFERENCES siti(id),
  percorso         TEXT NOT NULL,
  sessione         TEXT NOT NULL,
  paese            TEXT,
  citta            TEXT,
  referrer         TEXT,
  secondi          INTEGER,
  visitatore_hash  TEXT,
  creato_il        INTEGER NOT NULL
);

CREATE INDEX idx_eventi_sito_data ON eventi(sito_id, creato_il);
CREATE INDEX idx_eventi_sessione  ON eventi(sessione);
CREATE INDEX idx_eventi_tipo      ON eventi(tipo, creato_il);

CREATE TABLE statistiche_giornaliere (
  sito_id          TEXT NOT NULL,
  giorno           TEXT NOT NULL,
  percorso         TEXT NOT NULL,
  visite           INTEGER NOT NULL,
  visitatori_unici INTEGER NOT NULL,
  durata_mediana   INTEGER,
  PRIMARY KEY (sito_id, giorno, percorso)
);
