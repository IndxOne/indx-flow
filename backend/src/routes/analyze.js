import express from 'express'
import ContextAnalyzer from '../services/ContextAnalyzer.js'
import ClaudeClient from '../services/ClaudeClient.js'
import HybridAnalyzer from '../services/HybridAnalyzer.js'
import logger from '../utils/logger.js'
import { estimateRequestCost } from '../utils/costTracker.js'

const router = express.Router()

// Instances des services
const contextAnalyzer = new ContextAnalyzer()
const claudeClient = new ClaudeClient()
const hybridAnalyzer = new HybridAnalyzer()

/**
 * POST /api/analyze/local
 * Analyse locale sans IA (rapide et gratuite)
 */
router.post('/local', async (req, res) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({
        error: 'Texte requis',
        code: 'MISSING_TEXT'
      })
    }

    logger.info(`🔍 Analyse locale démarrée (${text.length} caractères)`)

    const result = await contextAnalyzer.analyzeLocal(text)

    // Ajouter les informations de coût
    result.estimatedCost = estimateRequestCost('local')
    result.actualCost = result.estimatedCost

    res.json({
      success: true,
      mode: 'local',
      analysis: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Erreur analyse locale:', error)
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'LOCAL_ANALYSIS_FAILED',
      mode: 'local'
    })
  }
})

/**
 * POST /api/analyze/ai
 * Analyse avec Claude AI (précise mais coûteuse)
 */
router.post('/ai', async (req, res) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({
        error: 'Texte requis',
        code: 'MISSING_TEXT'
      })
    }

    if (!claudeClient.isAvailable()) {
      return res.status(503).json({
        success: false,
        error: 'Claude AI non disponible - vérifiez la configuration',
        code: 'AI_UNAVAILABLE',
        mode: 'ai',
        fallback: 'Utilisez le mode local ou hybride'
      })
    }

    logger.info(`🤖 Analyse IA démarrée (${text.length} caractères)`)

    const result = await claudeClient.analyzeWithAI(text)

    // Ajouter les informations de coût
    result.estimatedCost = estimateRequestCost('ai')
    result.actualCost = claudeClient.getRequestCost()

    res.json({
      success: true,
      mode: 'ai',
      analysis: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Erreur analyse IA:', error)
    
    // Codes d'erreur spécifiques
    let statusCode = 500
    let errorCode = 'AI_ANALYSIS_FAILED'

    if (error.message.includes('Rate limit')) {
      statusCode = 429
      errorCode = 'RATE_LIMIT_EXCEEDED'
    } else if (error.message.includes('API key')) {
      statusCode = 401
      errorCode = 'INVALID_API_KEY'
    }

    res.status(statusCode).json({
      success: false,
      error: error.message,
      code: errorCode,
      mode: 'ai'
    })
  }
})

/**
 * POST /api/analyze/hybrid
 * Analyse hybride intelligente (optimise précision/coût)
 */
router.post('/hybrid', async (req, res) => {
  try {
    const { text, options = {} } = req.body

    if (!text) {
      return res.status(400).json({
        error: 'Texte requis',
        code: 'MISSING_TEXT'
      })
    }

    logger.info(`🔀 Analyse hybride démarrée (${text.length} caractères)`)

    // Options d'analyse hybride
    const analysisOptions = {
      forceAI: options.forceAI || false,
      forceLocal: options.forceLocal || false,
      confidenceThreshold: options.confidenceThreshold || 75
    }

    const result = await hybridAnalyzer.analyzeHybrid(text, analysisOptions)

    // Informations de coût déjà incluses dans result
    result.estimatedCost = estimateRequestCost('hybrid', result.localConfidence)

    res.json({
      success: true,
      mode: 'hybrid',
      analysis: result,
      options: analysisOptions,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Erreur analyse hybride:', error)
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'HYBRID_ANALYSIS_FAILED',
      mode: 'hybrid'
    })
  }
})

/**
 * POST /api/analyze/compare
 * Compare les trois méthodes d'analyse (pour évaluation)
 */
router.post('/compare', async (req, res) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({
        error: 'Texte requis',
        code: 'MISSING_TEXT'
      })
    }

    logger.info(`📊 Comparaison des méthodes démarrée (${text.length} caractères)`)

    const comparison = await hybridAnalyzer.compareAnalysisMethods(text)

    res.json({
      success: true,
      mode: 'comparison',
      data: comparison,
      timestamp: new Date().toISOString(),
      summary: {
        recommendedMethod: comparison.metrics?.accuracyComparison?.recommendedMethod || 'hybrid',
        totalCost: Object.values(comparison.costs).reduce((a, b) => a + b, 0).toFixed(4),
        bestAccuracy: Math.max(
          comparison.local?.confidence || 0,
          comparison.ai?.confidence || 0,
          comparison.hybrid?.confidence || 0
        )
      }
    })

  } catch (error) {
    logger.error('Erreur comparaison méthodes:', error)
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'COMPARISON_FAILED',
      mode: 'comparison'
    })
  }
})

/**
 * GET /api/analyze/status
 * Statut des services d'analyse
 */
router.get('/status', (req, res) => {
  try {
    const status = {
      local: {
        available: true,
        averageTime: '< 50ms',
        cost: 'Négligeable (~0.00001€)',
        description: 'Analyse basée sur mots-clés pondérés'
      },
      ai: {
        available: claudeClient.isAvailable(),
        averageTime: '500-2000ms',
        cost: `~${claudeClient.getRequestCost()}€ par requête`,
        description: 'Analyse approfondie avec Claude AI',
        usage: claudeClient.getUsageStats()
      },
      hybrid: {
        available: true,
        averageTime: '50-2000ms (adaptatif)',
        cost: 'Variable selon confiance locale',
        description: 'Analyse locale d\'abord, IA si nécessaire',
        performance: hybridAnalyzer.getPerformanceReport()
      }
    }

    res.json({
      success: true,
      services: status,
      recommendation: {
        forDevelopment: 'hybrid',
        forProduction: 'hybrid',
        forCostOptimization: 'local',
        forMaxAccuracy: 'ai'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Erreur statut services:', error)
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'STATUS_CHECK_FAILED'
    })
  }
})

/**
 * POST /api/analyze/batch
 * Analyse en lot pour tests de performance
 */
router.post('/batch', async (req, res) => {
  try {
    const { texts, mode = 'hybrid' } = req.body

    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({
        error: 'Array de textes requis',
        code: 'MISSING_TEXTS'
      })
    }

    if (texts.length > 10) {
      return res.status(400).json({
        error: 'Maximum 10 textes par lot',
        code: 'TOO_MANY_TEXTS'
      })
    }

    logger.info(`📦 Analyse en lot démarrée: ${texts.length} textes en mode ${mode}`)

    const results = []
    let totalCost = 0
    const startTime = Date.now()

    for (let i = 0; i < texts.length; i++) {
      const text = texts[i]
      try {
        let result

        switch (mode) {
          case 'local':
            result = await contextAnalyzer.analyzeLocal(text)
            break
          case 'ai':
            if (!claudeClient.isAvailable()) {
              throw new Error('IA non disponible')
            }
            result = await claudeClient.analyzeWithAI(text)
            break
          case 'hybrid':
          default:
            result = await hybridAnalyzer.analyzeHybrid(text)
            break
        }

        results.push({
          index: i,
          text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          result,
          success: true
        })

        totalCost += result.cost || estimateRequestCost(mode)

      } catch (error) {
        results.push({
          index: i,
          text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          error: error.message,
          success: false
        })
      }
    }

    const totalTime = Date.now() - startTime

    res.json({
      success: true,
      mode: 'batch',
      results,
      summary: {
        total: texts.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        totalTime,
        averageTime: Math.round(totalTime / texts.length),
        totalCost: parseFloat(totalCost.toFixed(4))
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Erreur analyse batch:', error)
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'BATCH_ANALYSIS_FAILED'
    })
  }
})

export default router