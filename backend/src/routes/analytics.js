import express from 'express'
import { allQuery, getQuery } from '../models/database.js'
import { getCostMetrics, getCurrentMonthCostMetrics, generateCostReport } from '../utils/costTracker.js'
import logger from '../utils/logger.js'

const router = express.Router()

/**
 * GET /api/analytics/dashboard
 * Dashboard principal avec métriques globales
 */
router.get('/dashboard', async (req, res) => {
  try {
    const { period = '7' } = req.query // Période en jours
    const days = parseInt(period)
    
    if (isNaN(days) || days < 1 || days > 365) {
      return res.status(400).json({
        error: 'Période invalide (1-365 jours)',
        code: 'INVALID_PERIOD'
      })
    }

    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000))
      .toISOString().split('T')[0]

    // Métriques générales
    const totalSubmissions = await getQuery(`
      SELECT COUNT(*) as count FROM submissions 
      WHERE created_at >= date('now', '-${days} days')
    `)

    // Distribution par type de contexte
    const contextDistribution = await allQuery(`
      SELECT 
        detected_context,
        COUNT(*) as count,
        AVG(confidence_score) as avg_confidence,
        COUNT(*) * 100.0 / (SELECT COUNT(*) FROM submissions WHERE created_at >= date('now', '-${days} days')) as percentage
      FROM submissions 
      WHERE created_at >= date('now', '-${days} days')
      GROUP BY detected_context
      ORDER BY count DESC
    `)

    // Distribution par mode de détection
    const modeDistribution = await allQuery(`
      SELECT 
        detection_mode,
        COUNT(*) as count,
        AVG(confidence_score) as avg_confidence,
        AVG(analysis_time_ms) as avg_time,
        AVG(cost_euros) as avg_cost
      FROM submissions 
      WHERE created_at >= date('now', '-${days} days')
      GROUP BY detection_mode
      ORDER BY count DESC
    `)

    // Métriques de performance
    const performanceMetrics = await getQuery(`
      SELECT 
        AVG(confidence_score) as avg_confidence,
        AVG(analysis_time_ms) as avg_analysis_time,
        AVG(cost_euros) as avg_cost,
        MIN(confidence_score) as min_confidence,
        MAX(confidence_score) as max_confidence,
        COUNT(CASE WHEN is_hybrid = 1 THEN 1 END) as hybrid_count
      FROM submissions 
      WHERE created_at >= date('now', '-${days} days')
    `)

    // Évolution quotidienne
    const dailyEvolution = await allQuery(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as submissions,
        AVG(confidence_score) as avg_confidence,
        COUNT(CASE WHEN detection_mode = 'ai' THEN 1 END) as ai_count,
        COUNT(CASE WHEN detection_mode = 'local' THEN 1 END) as local_count,
        COUNT(CASE WHEN detection_mode = 'hybrid' THEN 1 END) as hybrid_count,
        SUM(cost_euros) as total_cost
      FROM submissions 
      WHERE created_at >= date('now', '-${days} days')
      GROUP BY date(created_at)
      ORDER BY date DESC
      LIMIT 30
    `)

    // Métriques de coût
    const costMetrics = await getCostMetrics(startDate, endDate)

    // Top secteurs d'activité
    const topSectors = await allQuery(`
      SELECT 
        user_sector,
        COUNT(*) as count,
        AVG(confidence_score) as avg_confidence
      FROM submissions 
      WHERE created_at >= date('now', '-${days} days')
        AND user_sector IS NOT NULL 
        AND user_sector != ''
      GROUP BY user_sector
      ORDER BY count DESC
      LIMIT 10
    `)

    // Calcul de l'efficacité du système hybride
    const hybridEfficiency = calculateHybridEfficiency(modeDistribution)

    res.json({
      success: true,
      period: {
        days,
        startDate,
        endDate
      },
      summary: {
        totalSubmissions: totalSubmissions.count || 0,
        avgConfidence: Math.round(performanceMetrics.avg_confidence || 0),
        avgAnalysisTime: Math.round(performanceMetrics.avg_analysis_time || 0),
        avgCost: parseFloat((performanceMetrics.avg_cost || 0).toFixed(4)),
        hybridUsage: Math.round((performanceMetrics.hybrid_count || 0) / (totalSubmissions.count || 1) * 100)
      },
      distribution: {
        byContext: contextDistribution.map(row => ({
          type: row.detected_context,
          count: row.count,
          percentage: parseFloat(row.percentage.toFixed(1)),
          avgConfidence: Math.round(row.avg_confidence)
        })),
        byMode: modeDistribution.map(row => ({
          mode: row.detection_mode,
          count: row.count,
          avgConfidence: Math.round(row.avg_confidence || 0),
          avgTime: Math.round(row.avg_time || 0),
          avgCost: parseFloat((row.avg_cost || 0).toFixed(4))
        }))
      },
      performance: {
        confidenceRange: {
          min: Math.round(performanceMetrics.min_confidence || 0),
          max: Math.round(performanceMetrics.max_confidence || 0),
          avg: Math.round(performanceMetrics.avg_confidence || 0)
        },
        hybridEfficiency
      },
      trends: {
        daily: dailyEvolution.map(row => ({
          date: row.date,
          submissions: row.submissions,
          avgConfidence: Math.round(row.avg_confidence || 0),
          modeBreakdown: {
            ai: row.ai_count,
            local: row.local_count,
            hybrid: row.hybrid_count
          },
          totalCost: parseFloat((row.total_cost || 0).toFixed(4))
        }))
      },
      costs: costMetrics,
      sectors: topSectors.map(row => ({
        sector: row.user_sector,
        count: row.count,
        avgConfidence: Math.round(row.avg_confidence)
      })),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Erreur dashboard analytics:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'DASHBOARD_ERROR'
    })
  }
})

/**
 * GET /api/analytics/costs
 * Analyse détaillée des coûts avec recommandations
 */
router.get('/costs', async (req, res) => {
  try {
    const { days = 30 } = req.query
    const numDays = parseInt(days)

    if (isNaN(numDays) || numDays < 1 || numDays > 365) {
      return res.status(400).json({
        error: 'Période invalide (1-365 jours)',
        code: 'INVALID_PERIOD'
      })
    }

    const costReport = await generateCostReport(numDays)

    // Analyse de l'efficacité par heure de la journée
    const hourlyEfficiency = await allQuery(`
      SELECT 
        CAST(strftime('%H', created_at) AS INTEGER) as hour,
        COUNT(*) as count,
        AVG(confidence_score) as avg_confidence,
        COUNT(CASE WHEN detection_mode = 'ai' THEN 1 END) as ai_usage
      FROM submissions 
      WHERE created_at >= date('now', '-${numDays} days')
      GROUP BY hour
      ORDER BY hour
    `)

    // Analyse par jour de la semaine
    const weekdayAnalysis = await allQuery(`
      SELECT 
        CASE CAST(strftime('%w', created_at) AS INTEGER)
          WHEN 0 THEN 'Dimanche'
          WHEN 1 THEN 'Lundi'
          WHEN 2 THEN 'Mardi'
          WHEN 3 THEN 'Mercredi'
          WHEN 4 THEN 'Jeudi'
          WHEN 5 THEN 'Vendredi'
          WHEN 6 THEN 'Samedi'
        END as weekday,
        COUNT(*) as count,
        AVG(cost_euros) as avg_cost,
        COUNT(CASE WHEN detection_mode = 'ai' THEN 1 END) * 100.0 / COUNT(*) as ai_percentage
      FROM submissions 
      WHERE created_at >= date('now', '-${numDays} days')
      GROUP BY strftime('%w', created_at)
      ORDER BY strftime('%w', created_at)
    `)

    // ROI Analysis
    const roiAnalysis = calculateROI(costReport)

    res.json({
      success: true,
      period: numDays,
      detailed: costReport,
      patterns: {
        hourly: hourlyEfficiency.map(row => ({
          hour: row.hour,
          count: row.count,
          avgConfidence: Math.round(row.avg_confidence || 0),
          aiUsage: Math.round((row.ai_usage / row.count) * 100)
        })),
        weekly: weekdayAnalysis.map(row => ({
          weekday: row.weekday,
          count: row.count,
          avgCost: parseFloat((row.avg_cost || 0).toFixed(4)),
          aiPercentage: parseFloat((row.ai_percentage || 0).toFixed(1))
        }))
      },
      roi: roiAnalysis,
      optimization: {
        currentEfficiency: costReport.summary.efficiency.hybridEfficiency,
        potentialSavings: calculatePotentialSavings(costReport),
        recommendations: costReport.recommendations
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Erreur analyse coûts:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'COST_ANALYSIS_ERROR'
    })
  }
})

/**
 * GET /api/analytics/comparison
 * Comparaison des méthodes d'analyse
 */
router.get('/comparison', async (req, res) => {
  try {
    const { days = 7 } = req.query

    // Comparaison par méthode
    const methodComparison = await allQuery(`
      SELECT 
        detection_mode,
        COUNT(*) as count,
        AVG(confidence_score) as avg_confidence,
        AVG(analysis_time_ms) as avg_time,
        AVG(cost_euros) as avg_cost,
        MIN(confidence_score) as min_confidence,
        MAX(confidence_score) as max_confidence,
        COUNT(CASE WHEN confidence_score >= 85 THEN 1 END) as high_confidence_count,
        COUNT(CASE WHEN confidence_score >= 70 THEN 1 END) as good_confidence_count
      FROM submissions 
      WHERE created_at >= date('now', '-${days} days')
      GROUP BY detection_mode
    `)

    // Analyse de précision par contexte et méthode
    const accuracyByContext = await allQuery(`
      SELECT 
        detected_context,
        detection_mode,
        COUNT(*) as count,
        AVG(confidence_score) as avg_confidence
      FROM submissions 
      WHERE created_at >= date('now', '-${days} days')
      GROUP BY detected_context, detection_mode
      HAVING count >= 2
      ORDER BY detected_context, avg_confidence DESC
    `)

    // Calcul des scores d'efficacité
    const efficiencyScores = methodComparison.map(method => ({
      mode: method.detection_mode,
      metrics: {
        volume: method.count,
        avgConfidence: Math.round(method.avg_confidence || 0),
        avgTime: Math.round(method.avg_time || 0),
        avgCost: parseFloat((method.avg_cost || 0).toFixed(4)),
        confidenceRange: {
          min: Math.round(method.min_confidence || 0),
          max: Math.round(method.max_confidence || 0)
        },
        accuracy: {
          high: Math.round((method.high_confidence_count / method.count) * 100),
          good: Math.round((method.good_confidence_count / method.count) * 100)
        }
      },
      efficiency: calculateMethodEfficiency(method)
    }))

    // Recommandations basées sur l'analyse
    const recommendations = generateMethodRecommendations(efficiencyScores)

    res.json({
      success: true,
      period: days,
      comparison: efficiencyScores,
      byContext: groupByContext(accuracyByContext),
      insights: {
        bestAccuracy: findBestMethod(efficiencyScores, 'accuracy'),
        bestSpeed: findBestMethod(efficiencyScores, 'speed'),
        bestCost: findBestMethod(efficiencyScores, 'cost'),
        bestOverall: findBestMethod(efficiencyScores, 'overall')
      },
      recommendations,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Erreur comparaison méthodes:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'COMPARISON_ERROR'
    })
  }
})

/**
 * GET /api/analytics/realtime
 * Métriques en temps réel
 */
router.get('/realtime', async (req, res) => {
  try {
    // Activité des dernières 24h par heure
    const last24h = await allQuery(`
      SELECT 
        strftime('%Y-%m-%d %H:00:00', created_at) as hour,
        COUNT(*) as submissions,
        AVG(confidence_score) as avg_confidence,
        SUM(cost_euros) as total_cost
      FROM submissions 
      WHERE created_at >= datetime('now', '-24 hours')
      GROUP BY hour
      ORDER BY hour DESC
    `)

    // Stats de la dernière heure
    const lastHour = await getQuery(`
      SELECT 
        COUNT(*) as submissions,
        AVG(confidence_score) as avg_confidence,
        AVG(analysis_time_ms) as avg_time
      FROM submissions 
      WHERE created_at >= datetime('now', '-1 hour')
    `)

    // Tendance (comparaison avec heure précédente)
    const previousHour = await getQuery(`
      SELECT 
        COUNT(*) as submissions,
        AVG(confidence_score) as avg_confidence
      FROM submissions 
      WHERE created_at >= datetime('now', '-2 hours')
        AND created_at < datetime('now', '-1 hour')
    `)

    const trend = {
      submissions: calculateTrend(lastHour.submissions, previousHour.submissions),
      confidence: calculateTrend(lastHour.avg_confidence, previousHour.avg_confidence)
    }

    res.json({
      success: true,
      current: {
        lastHour: {
          submissions: lastHour.submissions || 0,
          avgConfidence: Math.round(lastHour.avg_confidence || 0),
          avgTime: Math.round(lastHour.avg_time || 0)
        },
        trend
      },
      timeline: last24h.map(row => ({
        hour: row.hour,
        submissions: row.submissions,
        avgConfidence: Math.round(row.avg_confidence || 0),
        totalCost: parseFloat((row.total_cost || 0).toFixed(4))
      })),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Erreur métriques temps réel:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      code: 'REALTIME_ERROR'
    })
  }
})

// Fonctions utilitaires
const calculateHybridEfficiency = (modeDistribution) => {
  const hybrid = modeDistribution.find(m => m.detection_mode === 'hybrid')
  const ai = modeDistribution.find(m => m.detection_mode === 'ai')
  const local = modeDistribution.find(m => m.detection_mode === 'local')

  if (!hybrid) return 'N/A'

  const costEfficiency = ai ? 
    Math.round(((ai.avg_cost - hybrid.avg_cost) / ai.avg_cost) * 100) : 0
  
  const accuracyComparison = local ?
    Math.round(hybrid.avg_confidence - local.avg_confidence) : 0

  return {
    costSavings: `${costEfficiency}%`,
    accuracyImprovement: `+${accuracyComparison} points`,
    rating: costEfficiency > 50 ? 'Excellent' : costEfficiency > 25 ? 'Bon' : 'Moyen'
  }
}

const calculateMethodEfficiency = (method) => {
  // Score composite basé sur confiance, temps et coût
  const confidenceScore = method.avg_confidence || 0
  const timeScore = Math.max(0, 100 - (method.avg_time || 0) / 20) // Moins de temps = meilleur score
  const costScore = Math.max(0, 100 - (method.avg_cost || 0) * 50000) // Moins de coût = meilleur score

  return {
    confidence: Math.round(confidenceScore),
    speed: Math.round(timeScore),
    cost: Math.round(costScore),
    overall: Math.round((confidenceScore * 0.5 + timeScore * 0.3 + costScore * 0.2))
  }
}

const calculateROI = (costReport) => {
  const monthlyCost = costReport.projections.monthly
  const timeValueSaved = 15 // 15€/heure économisé par automatisation
  const avgTimePerAnalysis = 5 // 5 minutes par analyse manuelle
  const monthlyAnalyses = costReport.summary.requests.total * 30 / 7 // Extrapolation

  const timeSavedHours = (monthlyAnalyses * avgTimePerAnalysis) / 60
  const valueSaved = timeSavedHours * timeValueSaved

  return {
    monthlyCost,
    timeSavedHours: Math.round(timeSavedHours),
    valueSaved: Math.round(valueSaved),
    roi: Math.round(((valueSaved - monthlyCost) / monthlyCost) * 100),
    breakeven: monthlyCost / timeValueSaved // Heures pour rentabiliser
  }
}

const calculatePotentialSavings = (costReport) => {
  const currentCost = costReport.summary.costs.total
  const optimizedCost = currentCost * 0.7 // 30% d'économie potentielle
  
  return {
    current: currentCost,
    optimized: parseFloat(optimizedCost.toFixed(4)),
    savings: parseFloat((currentCost - optimizedCost).toFixed(4)),
    percentage: 30
  }
}

const findBestMethod = (methods, criteria) => {
  switch (criteria) {
    case 'accuracy':
      return methods.reduce((best, current) => 
        current.metrics.avgConfidence > best.metrics.avgConfidence ? current : best
      )
    case 'speed':
      return methods.reduce((best, current) => 
        current.metrics.avgTime < best.metrics.avgTime ? current : best
      )
    case 'cost':
      return methods.reduce((best, current) => 
        current.metrics.avgCost < best.metrics.avgCost ? current : best
      )
    case 'overall':
      return methods.reduce((best, current) => 
        current.efficiency.overall > best.efficiency.overall ? current : best
      )
    default:
      return methods[0]
  }
}

const generateMethodRecommendations = (methods) => {
  const recommendations = []
  
  const hybrid = methods.find(m => m.mode === 'hybrid')
  const ai = methods.find(m => m.mode === 'ai')
  const local = methods.find(m => m.mode === 'local')

  if (hybrid && ai && hybrid.efficiency.overall > ai.efficiency.overall) {
    recommendations.push({
      type: 'cost_optimization',
      priority: 'high',
      message: 'Le mode hybride surpasse l\'IA pure en efficacité globale',
      action: 'Favoriser le mode hybride par défaut'
    })
  }

  if (local && local.metrics.avgConfidence > 75) {
    recommendations.push({
      type: 'accuracy',
      priority: 'medium',
      message: 'L\'analyse locale montre une bonne précision',
      action: 'Augmenter le seuil de confiance pour réduire l\'usage IA'
    })
  }

  return recommendations
}

const groupByContext = (data) => {
  const grouped = {}
  data.forEach(row => {
    if (!grouped[row.detected_context]) {
      grouped[row.detected_context] = {}
    }
    grouped[row.detected_context][row.detection_mode] = {
      count: row.count,
      avgConfidence: Math.round(row.avg_confidence)
    }
  })
  return grouped
}

const calculateTrend = (current, previous) => {
  if (!previous || previous === 0) return 0
  return Math.round(((current - previous) / previous) * 100)
}

export default router