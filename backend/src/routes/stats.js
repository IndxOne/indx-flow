import express from 'express'
import { allQuery, getQuery } from '../models/database.js'
import logger from '../utils/logger.js'

const router = express.Router()

/**
 * GET /api/stats
 * Statistiques générales publiques
 */
router.get('/', async (req, res) => {
  try {
    // Stats générales
    const totalSubmissions = await getQuery('SELECT COUNT(*) as count FROM submissions')
    
    const avgConfidence = await getQuery(`
      SELECT AVG(confidence_score) as avg_confidence 
      FROM submissions 
      WHERE confidence_score > 0
    `)

    const topContexts = await allQuery(`
      SELECT 
        detected_context,
        COUNT(*) as count,
        COUNT(*) * 100.0 / (SELECT COUNT(*) FROM submissions) as percentage
      FROM submissions
      GROUP BY detected_context
      ORDER BY count DESC
      LIMIT 6
    `)

    const modeUsage = await allQuery(`
      SELECT 
        detection_mode,
        COUNT(*) as count,
        AVG(confidence_score) as avg_confidence
      FROM submissions
      GROUP BY detection_mode
      ORDER BY count DESC
    `)

    const recentActivity = await allQuery(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as submissions
      FROM submissions
      WHERE created_at >= date('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY date DESC
    `)

    res.json({
      success: true,
      stats: {
        total: {
          submissions: totalSubmissions.count || 0,
          avgConfidence: Math.round(avgConfidence.avg_confidence || 0)
        },
        distribution: {
          contexts: topContexts.map(row => ({
            type: row.detected_context,
            count: row.count,
            percentage: parseFloat(row.percentage.toFixed(1))
          })),
          modes: modeUsage.map(row => ({
            mode: row.detection_mode,
            count: row.count,
            avgConfidence: Math.round(row.avg_confidence || 0)
          }))
        },
        activity: recentActivity.map(row => ({
          date: row.date,
          submissions: row.submissions
        }))
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Erreur récupération stats:', error)
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques',
      code: 'STATS_ERROR'
    })
  }
})

/**
 * GET /api/stats/health
 * Vérification de l'état du système
 */
router.get('/health', async (req, res) => {
  try {
    const dbCheck = await getQuery('SELECT 1 as test')
    const submissionsCount = await getQuery('SELECT COUNT(*) as count FROM submissions')
    
    const health = {
      status: 'healthy',
      database: dbCheck.test === 1 ? 'connected' : 'error',
      submissions: submissionsCount.count || 0,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    }

    res.json({
      success: true,
      health
    })

  } catch (error) {
    logger.error('Health check failed:', error)
    res.status(503).json({
      success: false,
      health: {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    })
  }
})

export default router