import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Import des routes
import analyzeRoutes from './routes/analyze.js'
import generateRoutes from './routes/generate.js'
import submitRoutes from './routes/submit.js'
import statsRoutes from './routes/stats.js'
import analyticsRoutes from './routes/analytics.js'

// Import des middlewares
import { errorHandler } from './middlewares/errorHandler.js'
import { requestLogger } from './middlewares/logger.js'

// Import des utilitaires
import logger from './utils/logger.js'
import { initializeDatabase } from './models/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Initialisation de la base de données
await initializeDatabase()

// Middlewares de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 63072000, // 2 ans
    includeSubDomains: true,
    preload: true
  }
}))

// CORS manuel pour debugging - SOLUTION TEMPORAIRE
app.use((req, res, next) => {
  const origin = req.headers.origin
  console.log('🔍 CORS Manuel - Origin:', origin, 'Method:', req.method)
  
  // Autoriser toutes les origines localhost en développement
  if (origin && origin.includes('localhost')) {
    res.header('Access-Control-Allow-Origin', origin)
    console.log('✅ CORS Manuel: Origin autorisé:', origin)
  }
  
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization')
  
  // Répondre aux requêtes preflight OPTIONS
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS Manuel: Réponse preflight OPTIONS')
    return res.status(200).end()
  }
  
  next()
})

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip + req.headers['user-agent']
  }
})

app.use('/api/', limiter)

// Parsing JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging des requêtes
app.use(requestLogger)

// Routes
app.use('/api/analyze', analyzeRoutes)
app.use('/api/generate', generateRoutes)
app.use('/api/submit', submitRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/analytics', analyticsRoutes)

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint non trouvé',
    path: req.originalUrl
  })
})

// Middleware de gestion d'erreurs
app.use(errorHandler)

// Démarrage du serveur
app.listen(PORT, () => {
  logger.info(`🚀 Serveur démarré sur le port ${PORT}`)
  logger.info(`📊 Mode: ${process.env.NODE_ENV}`)
  logger.info(`🔗 API disponible sur: http://localhost:${PORT}`)
})

// Gestion des erreurs non gérées
process.on('uncaughtException', (err) => {
  logger.error('Exception non gérée:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesse rejetée non gérée:', reason)
})

export default app