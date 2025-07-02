import sqlite3 from 'sqlite3'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { promises as fs } from 'fs'
import logger from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DB_PATH = process.env.DB_PATH || join(__dirname, '../../data/indx-flow.db')

let db = null

export const getDatabase = () => {
  if (!db) {
    throw new Error('Base de données non initialisée')
  }
  return db
}

export const initializeDatabase = async () => {
  try {
    // Créer le dossier data s'il n'existe pas
    const dataDir = dirname(DB_PATH)
    await fs.mkdir(dataDir, { recursive: true })

    // Connexion à la base de données
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        logger.error('Erreur connexion DB:', err)
        throw err
      }
      logger.info('✅ Base de données SQLite connectée')
    })

    // Activer les clés étrangères
    db.run('PRAGMA foreign_keys = ON')

    // Créer les tables
    await createTables()
    
    logger.info('✅ Tables de base créées/vérifiées')
  } catch (error) {
    logger.error('Erreur initialisation DB:', error)
    throw error
  }
}

const createTables = () => {
  return new Promise((resolve, reject) => {
    const createTablesSQL = `
      -- Table principale des soumissions
      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        user_input TEXT NOT NULL CHECK(length(user_input) <= 2000),
        detected_context TEXT NOT NULL CHECK(
          detected_context IN (
            'CLIENT_BASED', 'TEMPORAL', 'PHASED', 
            'VERSIONED', 'PROCESS_BASED', 'RESOURCE_BASED', 'GENERIC'
          )
        ),
        confidence_score REAL CHECK(confidence_score BETWEEN 0 AND 100),
        is_hybrid BOOLEAN DEFAULT FALSE,
        detection_mode TEXT CHECK(detection_mode IN ('local', 'ai', 'hybrid')) DEFAULT 'local',
        structured_output TEXT, -- JSON stringifié
        metadata TEXT DEFAULT '{}', -- JSON stringifié
        analysis_time_ms INTEGER DEFAULT 0,
        cost_euros REAL DEFAULT 0,
        user_email TEXT,
        user_sector TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Table des événements analytics
      CREATE TABLE IF NOT EXISTS analytics_events (
        id TEXT PRIMARY KEY,
        submission_id TEXT,
        event_type TEXT CHECK(event_type IN (
          'DETECTION_START', 'DETECTION_COMPLETE',
          'STRUCTURE_GENERATED', 'USER_FEEDBACK', 'EMAIL_SENT'
        )),
        event_data TEXT DEFAULT '{}', -- JSON stringifié
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES submissions(id)
      );

      -- Table des mots-clés contextuels (pour analyse locale)
      CREATE TABLE IF NOT EXISTS context_keywords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        keyword TEXT NOT NULL,
        context_type TEXT NOT NULL,
        weight REAL DEFAULT 1.0 CHECK(weight BETWEEN 0 AND 5),
        variants TEXT DEFAULT '[]', -- JSON array des variantes
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(keyword, context_type)
      );

      -- Table de tracking des coûts
      CREATE TABLE IF NOT EXISTS cost_tracking (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL, -- Format YYYY-MM-DD
        local_requests INTEGER DEFAULT 0,
        ai_requests INTEGER DEFAULT 0,
        local_cost_euros REAL DEFAULT 0,
        ai_cost_euros REAL DEFAULT 0,
        total_cost_euros REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(date)
      );

      -- Index pour améliorer les performances
      CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
      CREATE INDEX IF NOT EXISTS idx_submissions_context ON submissions(detected_context);
      CREATE INDEX IF NOT EXISTS idx_submissions_mode ON submissions(detection_mode);
      CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
      CREATE INDEX IF NOT EXISTS idx_cost_tracking_date ON cost_tracking(date);
    `

    db.exec(createTablesSQL, (err) => {
      if (err) {
        logger.error('Erreur création tables:', err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

// Helper pour exécuter des requêtes avec promesses
export const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err)
      } else {
        resolve({ lastID: this.lastID, changes: this.changes })
      }
    })
  })
}

export const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

export const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

// Fermer la connexion proprement
export const closeDatabase = () => {
  if (db) {
    db.close((err) => {
      if (err) {
        logger.error('Erreur fermeture DB:', err)
      } else {
        logger.info('Base de données fermée')
      }
    })
  }
}

// Gestion de l'arrêt propre
process.on('SIGINT', closeDatabase)
process.on('SIGTERM', closeDatabase)