import { runQuery, getQuery } from '../models/database.js'
import { v4 as uuidv4 } from 'uuid'
import logger from './logger.js'

/**
 * Enregistre les métriques de coût pour une analyse
 * @param {Object} metrics - Métriques d'analyse
 */
export const recordCostMetrics = async (metrics) => {
  const { usedAI, method, confidence, cost, date } = metrics
  
  try {
    // Récupérer ou créer l'entrée pour la date
    const existingEntry = await getQuery(
      'SELECT * FROM cost_tracking WHERE date = ?',
      [date]
    )

    if (existingEntry) {
      // Mettre à jour l'entrée existante
      const newLocalRequests = existingEntry.local_requests + (usedAI ? 0 : 1)
      const newAIRequests = existingEntry.ai_requests + (usedAI ? 1 : 0)
      const newLocalCost = existingEntry.local_cost_euros + (usedAI ? 0 : cost)
      const newAICost = existingEntry.ai_cost_euros + (usedAI ? cost : 0)
      const newTotalCost = newLocalCost + newAICost

      await runQuery(`
        UPDATE cost_tracking 
        SET 
          local_requests = ?,
          ai_requests = ?,
          local_cost_euros = ?,
          ai_cost_euros = ?,
          total_cost_euros = ?
        WHERE date = ?
      `, [newLocalRequests, newAIRequests, newLocalCost, newAICost, newTotalCost, date])

    } else {
      // Créer une nouvelle entrée
      const localRequests = usedAI ? 0 : 1
      const aiRequests = usedAI ? 1 : 0
      const localCost = usedAI ? 0 : cost
      const aiCost = usedAI ? cost : 0

      await runQuery(`
        INSERT INTO cost_tracking (
          id, date, local_requests, ai_requests,
          local_cost_euros, ai_cost_euros, total_cost_euros
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(), date, localRequests, aiRequests,
        localCost, aiCost, cost
      ])
    }

    logger.debug(`💰 Coût enregistré: ${cost.toFixed(4)}€ (${method})`)

  } catch (error) {
    logger.error('Erreur enregistrement coûts:', error)
    // Ne pas faire échouer l'analyse pour un problème de tracking
  }
}

/**
 * Récupère les métriques de coût pour une période
 * @param {string} startDate - Date de début (YYYY-MM-DD)
 * @param {string} endDate - Date de fin (YYYY-MM-DD)
 * @returns {Object} Métriques de coût
 */
export const getCostMetrics = async (startDate, endDate) => {
  try {
    const query = `
      SELECT 
        SUM(local_requests) as total_local_requests,
        SUM(ai_requests) as total_ai_requests,
        SUM(local_cost_euros) as total_local_cost,
        SUM(ai_cost_euros) as total_ai_cost,
        SUM(total_cost_euros) as total_cost,
        COUNT(*) as active_days,
        AVG(total_cost_euros) as avg_daily_cost
      FROM cost_tracking
      WHERE date BETWEEN ? AND ?
    `

    const metrics = await getQuery(query, [startDate, endDate])

    // Calcul des statistiques additionnelles
    const totalRequests = (metrics.total_local_requests || 0) + (metrics.total_ai_requests || 0)
    const aiUsagePercentage = totalRequests > 0 
      ? ((metrics.total_ai_requests || 0) / totalRequests * 100).toFixed(1)
      : 0

    const costPerRequest = totalRequests > 0
      ? ((metrics.total_cost || 0) / totalRequests).toFixed(4)
      : 0

    return {
      period: {
        startDate,
        endDate,
        activeDays: metrics.active_days || 0
      },
      requests: {
        total: totalRequests,
        local: metrics.total_local_requests || 0,
        ai: metrics.total_ai_requests || 0,
        aiUsagePercentage: parseFloat(aiUsagePercentage)
      },
      costs: {
        total: parseFloat((metrics.total_cost || 0).toFixed(4)),
        local: parseFloat((metrics.total_local_cost || 0).toFixed(4)),
        ai: parseFloat((metrics.total_ai_cost || 0).toFixed(4)),
        averageDaily: parseFloat((metrics.avg_daily_cost || 0).toFixed(4)),
        costPerRequest: parseFloat(costPerRequest)
      },
      efficiency: {
        costSavingsVsFullAI: totalRequests > 0
          ? (((totalRequests * 0.002) - (metrics.total_cost || 0)) / (totalRequests * 0.002) * 100).toFixed(1)
          : 0,
        hybridEfficiency: aiUsagePercentage < 50 ? 'Excellent' :
                         aiUsagePercentage < 75 ? 'Bon' :
                         aiUsagePercentage < 90 ? 'Moyen' : 'À optimiser'
      }
    }

  } catch (error) {
    logger.error('Erreur récupération métriques coût:', error)
    throw error
  }
}

/**
 * Récupère les métriques de coût pour le mois en cours
 * @returns {Object}
 */
export const getCurrentMonthCostMetrics = async () => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const startDate = startOfMonth.toISOString().split('T')[0]
  const endDate = endOfMonth.toISOString().split('T')[0]

  return getCostMetrics(startDate, endDate)
}

/**
 * Récupère les métriques de coût pour la semaine en cours
 * @returns {Object}
 */
export const getCurrentWeekCostMetrics = async () => {
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6))

  const startDate = startOfWeek.toISOString().split('T')[0]
  const endDate = endOfWeek.toISOString().split('T')[0]

  return getCostMetrics(startDate, endDate)
}

/**
 * Estime le coût d'une requête selon la méthode
 * @param {string} method - local, ai, hybrid
 * @param {number} confidence - Score de confiance (pour hybrid)
 * @returns {number} Coût estimé en euros
 */
export const estimateRequestCost = (method, confidence = 0) => {
  const localCost = parseFloat(process.env.LOCAL_COST_PER_REQUEST) || 0.00001
  const aiCost = parseFloat(process.env.CLAUDE_COST_PER_REQUEST) || 0.002

  switch (method) {
    case 'local':
      return localCost

    case 'ai':
      return aiCost

    case 'hybrid':
      // Pour hybrid, estimer basé sur la probabilité d'utiliser l'IA
      const aiProbability = confidence < 75 ? 0.8 : confidence < 85 ? 0.3 : 0.1
      return localCost + (aiCost * aiProbability)

    default:
      return localCost
  }
}

/**
 * Génère un rapport de coût détaillé
 * @param {number} days - Nombre de jours à analyser
 * @returns {Object}
 */
export const generateCostReport = async (days = 30) => {
  try {
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000))
      .toISOString().split('T')[0]

    const metrics = await getCostMetrics(startDate, endDate)

    // Récupérer les données quotidiennes
    const dailyData = await runQuery(`
      SELECT 
        date,
        local_requests,
        ai_requests,
        total_cost_euros,
        (local_requests + ai_requests) as total_requests
      FROM cost_tracking
      WHERE date BETWEEN ? AND ?
      ORDER BY date DESC
    `, [startDate, endDate])

    // Calculer les projections
    const avgDailyCost = metrics.costs.averageDaily
    const monthlyProjection = avgDailyCost * 30
    const yearlyProjection = avgDailyCost * 365

    return {
      summary: metrics,
      dailyBreakdown: dailyData,
      projections: {
        monthly: parseFloat(monthlyProjection.toFixed(2)),
        yearly: parseFloat(yearlyProjection.toFixed(2)),
        vsFullAI: {
          monthly: parseFloat((30 * metrics.requests.total / days * 0.002).toFixed(2)),
          yearly: parseFloat((365 * metrics.requests.total / days * 0.002).toFixed(2))
        }
      },
      recommendations: generateCostRecommendations(metrics)
    }

  } catch (error) {
    logger.error('Erreur génération rapport coût:', error)
    throw error
  }
}

/**
 * Génère des recommandations d'optimisation des coûts
 * @param {Object} metrics 
 * @returns {Array}
 */
const generateCostRecommendations = (metrics) => {
  const recommendations = []

  if (metrics.requests.aiUsagePercentage > 60) {
    recommendations.push({
      type: 'optimization',
      priority: 'high',
      message: 'Utilisation IA élevée (>60%). Considérer l\'amélioration des mots-clés locaux.',
      potentialSaving: ((metrics.requests.ai * 0.5 * 0.002) - (metrics.requests.ai * 0.5 * 0.00001)).toFixed(4)
    })
  }

  if (metrics.costs.costPerRequest > 0.001) {
    recommendations.push({
      type: 'threshold',
      priority: 'medium',
      message: 'Coût par requête élevé. Ajuster le seuil de confiance pour l\'IA.',
      currentThreshold: '75%',
      suggestedThreshold: '85%'
    })
  }

  if (metrics.costs.total > 10) {
    recommendations.push({
      type: 'budget',
      priority: 'low',
      message: 'Coût total mensuel > 10€. Surveiller l\'évolution.',
      monthlyBudget: '15€'
    })
  }

  return recommendations
}