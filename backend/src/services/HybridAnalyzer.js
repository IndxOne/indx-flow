import ContextAnalyzer from './ContextAnalyzer.js'
import ClaudeClient from './ClaudeClient.js'
import logger from '../utils/logger.js'
import { recordCostMetrics } from '../utils/costTracker.js'

/**
 * Service d'analyse hybride intelligent
 * Combine analyse locale et IA pour optimiser précision/coût
 */
class HybridAnalyzer {
  constructor() {
    this.localAnalyzer = new ContextAnalyzer()
    this.claudeClient = new ClaudeClient()
    this.confidenceThreshold = 75 // Seuil pour décider si l'IA est nécessaire
    this.costOptimizationEnabled = true
  }

  /**
   * Analyse hybride intelligente
   * @param {string} text - Texte à analyser
   * @param {Object} options - Options d'analyse
   * @returns {Object} Résultat de l'analyse
   */
  async analyzeHybrid(text, options = {}) {
    const startTime = Date.now()
    const {
      forceAI = false,
      forceLocal = false,
      confidenceThreshold = this.confidenceThreshold
    } = options

    try {
      let localResult = null
      let aiResult = null
      let finalResult = null
      let usedMethod = 'hybrid'
      let totalCost = 0

      // 1. Toujours commencer par l'analyse locale (rapide et gratuite)
      logger.info('🔍 Début analyse locale...')
      localResult = await this.localAnalyzer.analyzeLocal(text)
      totalCost += parseFloat(process.env.LOCAL_COST_PER_REQUEST) || 0.00001

      // 2. Décider si l'IA est nécessaire
      const needsAI = this.shouldUseAI(localResult, { forceAI, forceLocal, confidenceThreshold })

      if (needsAI && this.claudeClient.isAvailable()) {
        logger.info('🤖 Analyse IA nécessaire, appel Claude...')
        
        try {
          aiResult = await this.claudeClient.analyzeWithAI(text)
          totalCost += this.claudeClient.getRequestCost()
          
          // 3. Combiner les résultats
          finalResult = this.combineResults(localResult, aiResult, text)
          finalResult.method = 'hybrid'
          finalResult.usedAI = true
          
        } catch (aiError) {
          logger.warn('⚠️  Erreur IA, fallback sur analyse locale:', aiError.message)
          finalResult = {
            ...localResult,
            method: 'local_fallback',
            usedAI: false,
            aiError: aiError.message,
            reasoning: `${localResult.reasoning} (IA indisponible)`
          }
        }
      } else {
        // 4. Utiliser uniquement le résultat local
        finalResult = {
          ...localResult,
          method: forceLocal ? 'local_forced' : 'local_sufficient',
          usedAI: false,
          reasoning: needsAI 
            ? `${localResult.reasoning} (IA indisponible)`
            : `${localResult.reasoning} (confiance suffisante)`
        }
      }

      // 5. Enregistrer les métriques de coût
      await this.recordAnalysisMetrics(finalResult, totalCost)

      // 6. Finaliser le résultat
      finalResult.analysisTime = Date.now() - startTime
      finalResult.cost = totalCost
      finalResult.localConfidence = localResult.confidence
      
      if (aiResult) {
        finalResult.aiConfidence = aiResult.confidence
        finalResult.confidenceImprovement = aiResult.confidence - localResult.confidence
      }

      logger.info(`✅ Analyse hybride terminée: ${finalResult.method} (${finalResult.analysisTime}ms, ${totalCost.toFixed(4)}€)`)

      return finalResult

    } catch (error) {
      logger.error('Erreur analyse hybride:', error)
      throw error
    }
  }

  /**
   * Détermine si l'IA est nécessaire
   * @param {Object} localResult 
   * @param {Object} options 
   * @returns {boolean}
   */
  shouldUseAI(localResult, options) {
    const { forceAI, forceLocal, confidenceThreshold } = options

    // Modes forcés
    if (forceLocal) return false
    if (forceAI) return true

    // Règles de décision intelligente
    const conditions = [
      // Confiance faible
      localResult.confidence < confidenceThreshold,
      
      // Type générique détecté (souvent imprécis)
      localResult.primaryType === 'GENERIC',
      
      // Contexte hybride détecté (nécessite analyse fine)
      localResult.isHybrid,
      
      // Aucun mot-clé significatif trouvé
      localResult.confidence < 40
    ]

    const needsAI = conditions.some(condition => condition)

    logger.debug(`Décision IA: ${needsAI} (confiance: ${localResult.confidence}%, type: ${localResult.primaryType})`)

    return needsAI
  }

  /**
   * Combine les résultats local et IA avec support des contextes multiples
   * @param {Object} localResult 
   * @param {Object} aiResult 
   * @param {string} originalText 
   * @returns {Object}
   */
  combineResults(localResult, aiResult, originalText) {
    // Stratégie de combinaison intelligente pour contextes multiples
    
    const localContexts = localResult.detectedContexts || []
    const aiContexts = aiResult.detectedContexts || []
    
    // 1. Si l'IA a une confiance significativement plus élevée, la préférer
    if (aiResult.confidence > localResult.confidence + 20) {
      return {
        ...aiResult,
        combinationStrategy: 'ai_preferred',
        detectedContexts: this.enrichContexts(aiContexts, localContexts, 'ai_preferred'),
        localAlternative: {
          type: localResult.primaryType,
          confidence: localResult.confidence,
          contexts: localContexts.slice(0, 2) // Garder les 2 premiers contextes locaux
        }
      }
    }

    // 2. Si les deux analyses sont cohérentes, prendre l'IA avec confiance renforcée
    if (localResult.primaryType === aiResult.primaryType) {
      const enrichedContexts = this.mergeCoherentContexts(localContexts, aiContexts)
      
      return {
        ...aiResult,
        confidence: Math.min(100, aiResult.confidence + 10), // Bonus de cohérence
        combinationStrategy: 'coherent_ai_boost',
        reasoning: `${aiResult.reasoning} (confirmé par analyse locale)`,
        detectedContexts: enrichedContexts
      }
    }

    // 3. Si confiances similaires mais types différents, créer fusion intelligente
    if (Math.abs(localResult.confidence - aiResult.confidence) < 15) {
      const fusedContexts = this.fuseContexts(localContexts, aiContexts)
      
      return {
        primaryType: aiResult.primaryType,
        confidence: Math.round((localResult.confidence + aiResult.confidence) / 2),
        reasoning: `Fusion hybride: ${fusedContexts.length} contextes détectés`,
        isHybrid: true,
        secondaryType: localResult.primaryType,
        combinationStrategy: 'hybrid_consensus',
        detectedContexts: fusedContexts,
        suggestedStructure: aiResult.suggestedStructure || localResult.suggestedStructure
      }
    }

    // 4. Par défaut, préférer l'IA mais enrichir avec contextes locaux pertinents
    return {
      ...aiResult,
      combinationStrategy: 'ai_with_local_enrichment',
      reasoning: `${aiResult.reasoning} (enrichi avec contextes locaux)`,
      detectedContexts: this.enrichContexts(aiContexts, localContexts, 'ai_enriched'),
      localAlternative: {
        type: localResult.primaryType,
        confidence: localResult.confidence,
        contexts: localContexts
      }
    }
  }

  /**
   * Fusionne les contextes de deux analyses différentes
   * @param {Array} localContexts 
   * @param {Array} aiContexts 
   * @returns {Array}
   */
  fuseContexts(localContexts, aiContexts) {
    const fusedMap = new Map()
    
    // Ajouter les contextes IA (priorité)
    aiContexts.forEach(ctx => {
      fusedMap.set(ctx.type, {
        ...ctx,
        source: 'ai',
        fusionScore: ctx.confidence * ctx.weight
      })
    })
    
    // Enrichir/compléter avec contextes locaux
    localContexts.forEach(localCtx => {
      const existing = fusedMap.get(localCtx.type)
      
      if (existing) {
        // Fusionner si le contexte existe dans les deux
        fusedMap.set(localCtx.type, {
          ...existing,
          confidence: Math.round((existing.confidence + localCtx.confidence) / 2),
          weight: Math.max(existing.weight, localCtx.weight),
          reasoning: `${existing.reasoning} + analyse locale`,
          source: 'fused',
          fusionScore: Math.max(existing.fusionScore, localCtx.confidence * localCtx.weight)
        })
      } else if (localCtx.confidence >= 40) {
        // Ajouter contexte local significatif
        fusedMap.set(localCtx.type, {
          ...localCtx,
          source: 'local',
          priority: 'complementary',
          fusionScore: localCtx.confidence * localCtx.weight
        })
      }
    })
    
    // Trier par score de fusion et limiter à 4 contextes max
    return Array.from(fusedMap.values())
      .sort((a, b) => b.fusionScore - a.fusionScore)
      .slice(0, 4)
  }

  /**
   * Merge les contextes cohérents entre local et IA
   * @param {Array} localContexts 
   * @param {Array} aiContexts 
   * @returns {Array}
   */
  mergeCoherentContexts(localContexts, aiContexts) {
    const merged = []
    
    // Pour chaque contexte IA, vérifier s'il existe en local
    aiContexts.forEach(aiCtx => {
      const localMatch = localContexts.find(local => local.type === aiCtx.type)
      
      if (localMatch) {
        // Combiner les données des deux sources
        merged.push({
          ...aiCtx,
          confidence: Math.min(100, Math.round((aiCtx.confidence + localMatch.confidence) / 2) + 5), // Bonus cohérence
          weight: Math.max(aiCtx.weight, localMatch.weight),
          reasoning: `${aiCtx.reasoning} (cohérent avec analyse locale)`,
          coherenceBonus: true,
          sources: ['ai', 'local']
        })
      } else {
        // Garder contexte IA unique
        merged.push({
          ...aiCtx,
          sources: ['ai']
        })
      }
    })
    
    // Ajouter contextes locaux uniques significatifs
    localContexts.forEach(localCtx => {
      const alreadyMerged = merged.some(m => m.type === localCtx.type)
      
      if (!alreadyMerged && localCtx.confidence >= 50) {
        merged.push({
          ...localCtx,
          priority: 'local_complementary',
          sources: ['local']
        })
      }
    })
    
    return merged.slice(0, 4) // Limiter à 4 contextes
  }

  /**
   * Enrichit les contextes principaux avec des contextes secondaires pertinents
   * @param {Array} primaryContexts 
   * @param {Array} secondaryContexts 
   * @param {string} strategy 
   * @returns {Array}
   */
  enrichContexts(primaryContexts, secondaryContexts, strategy) {
    const enriched = [...primaryContexts]
    
    // Ajouter contextes secondaires non redondants
    secondaryContexts.forEach(secCtx => {
      const exists = enriched.some(primary => primary.type === secCtx.type)
      
      if (!exists && secCtx.confidence >= 35) {
        enriched.push({
          ...secCtx,
          priority: 'enrichment',
          weight: Math.min(secCtx.weight * 0.7, 0.5), // Réduire le poids pour enrichissement
          reasoning: `${secCtx.reasoning} (enrichissement ${strategy})`
        })
      }
    })
    
    return enriched.slice(0, 5) // Max 5 contextes
  }

  /**
   * Enregistre les métriques d'analyse
   * @param {Object} result 
   * @param {number} cost 
   */
  async recordAnalysisMetrics(result, cost) {
    try {
      const metrics = {
        usedAI: result.usedAI || false,
        method: result.method,
        confidence: result.confidence,
        cost: cost,
        date: new Date().toISOString().split('T')[0]
      }

      await recordCostMetrics(metrics)
    } catch (error) {
      logger.error('Erreur enregistrement métriques:', error)
      // Ne pas faire échouer l'analyse pour un problème de métrique
    }
  }

  /**
   * Analyse comparative pour évaluation des coûts
   * @param {string} text 
   * @returns {Object}
   */
  async compareAnalysisMethods(text) {
    const comparison = {
      local: null,
      ai: null,
      hybrid: null,
      costs: {
        local: 0,
        ai: 0,
        hybrid: 0
      },
      times: {
        local: 0,
        ai: 0,
        hybrid: 0
      }
    }

    try {
      // Analyse locale
      const localStart = Date.now()
      comparison.local = await this.localAnalyzer.analyzeLocal(text)
      comparison.times.local = Date.now() - localStart
      comparison.costs.local = parseFloat(process.env.LOCAL_COST_PER_REQUEST) || 0.00001

      // Analyse IA (si disponible)
      if (this.claudeClient.isAvailable()) {
        const aiStart = Date.now()
        comparison.ai = await this.claudeClient.analyzeWithAI(text)
        comparison.times.ai = Date.now() - aiStart
        comparison.costs.ai = this.claudeClient.getRequestCost()
      }

      // Analyse hybride
      const hybridStart = Date.now()
      comparison.hybrid = await this.analyzeHybrid(text)
      comparison.times.hybrid = Date.now() - hybridStart
      comparison.costs.hybrid = comparison.hybrid.cost || 0

      // Calcul des métriques de comparaison
      comparison.metrics = {
        costSavings: comparison.costs.ai > 0 
          ? ((comparison.costs.ai - comparison.costs.hybrid) / comparison.costs.ai * 100).toFixed(1)
          : 0,
        timeComparison: {
          hybridVsAI: comparison.times.ai > 0 
            ? ((comparison.times.ai - comparison.times.hybrid) / comparison.times.ai * 100).toFixed(1)
            : 0,
          hybridVsLocal: ((comparison.times.hybrid - comparison.times.local) / comparison.times.local * 100).toFixed(1)
        },
        accuracyComparison: this.compareAccuracy(comparison.local, comparison.ai, comparison.hybrid)
      }

      return comparison

    } catch (error) {
      logger.error('Erreur comparaison méthodes:', error)
      throw error
    }
  }

  /**
   * Compare la précision des différentes méthodes
   * @param {Object} local 
   * @param {Object} ai 
   * @param {Object} hybrid 
   * @returns {Object}
   */
  compareAccuracy(local, ai, hybrid) {
    return {
      confidenceScores: {
        local: local?.confidence || 0,
        ai: ai?.confidence || 0,
        hybrid: hybrid?.confidence || 0
      },
      typeConsistency: {
        localVsAI: local && ai ? local.primaryType === ai.primaryType : null,
        hybridVsAI: hybrid && ai ? hybrid.primaryType === ai.primaryType : null,
        hybridVsLocal: hybrid && local ? hybrid.primaryType === local.primaryType : null
      },
      recommendedMethod: this.getRecommendedMethod(local, ai, hybrid)
    }
  }

  /**
   * Recommande la meilleure méthode basée sur les résultats
   * @param {Object} local 
   * @param {Object} ai 
   * @param {Object} hybrid 
   * @returns {string}
   */
  getRecommendedMethod(local, ai, hybrid) {
    // Si l'analyse locale a une confiance élevée, la recommander
    if (local && local.confidence >= 85) {
      return 'local'
    }

    // Si l'IA apporte une amélioration significative, recommander hybride
    if (ai && local && ai.confidence > local.confidence + 15) {
      return 'hybrid'
    }

    // Si les coûts sont une préoccupation et la confiance locale acceptable
    if (local && local.confidence >= 70) {
      return 'local'
    }

    // Par défaut, recommander hybride pour la meilleure précision
    return 'hybrid'
  }

  /**
   * Génère un rapport de performance
   * @returns {Object}
   */
  getPerformanceReport() {
    return {
      localAnalyzer: {
        keywordsLoaded: this.localAnalyzer.keywords !== null,
        averageTime: '< 50ms',
        cost: 'Négligeable'
      },
      claudeClient: {
        available: this.claudeClient.isAvailable(),
        usage: this.claudeClient.getUsageStats(),
        averageTime: '500-2000ms',
        costPerRequest: this.claudeClient.getRequestCost()
      },
      hybridStrategy: {
        confidenceThreshold: this.confidenceThreshold,
        costOptimization: this.costOptimizationEnabled,
        description: 'Analyse locale d\'abord, IA si nécessaire'
      }
    }
  }
}

export default HybridAnalyzer