import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { runQuery } from '../models/database.js'
import logger from '../utils/logger.js'

const router = express.Router()

/**
 * POST /api/submit
 * Soumission finale du formulaire complet
 */
router.post('/', async (req, res) => {
  try {
    const {
      userInput,
      detectedContext,
      confidence,
      isHybrid,
      adaptiveAnswers,
      structurePreview,
      userInfo,
      analysisTime,
      usedAI,
      costTracking
    } = req.body

    // Validation des données requises
    if (!userInput || !detectedContext || !userInfo?.email) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes: texte, contexte détecté et email requis',
        code: 'MISSING_REQUIRED_DATA'
      })
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userInfo.email)) {
      return res.status(400).json({
        success: false,
        error: 'Format email invalide',
        code: 'INVALID_EMAIL'
      })
    }

    // Génération des IDs
    const submissionId = uuidv4()
    const eventId = uuidv4()

    // Préparation des données pour la base
    const metadata = {
      adaptiveAnswers: adaptiveAnswers || {},
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      timestamp: new Date().toISOString(),
      costTracking: costTracking || {}
    }

    const structuredOutput = {
      suggestedStructure: structurePreview || [],
      contextType: detectedContext,
      confidence: confidence || 0,
      isHybrid: Boolean(isHybrid),
      recommendations: generateRecommendations(detectedContext, adaptiveAnswers)
    }

    // Insertion en base de données
    await runQuery(`
      INSERT INTO submissions (
        id, user_input, detected_context, confidence_score, is_hybrid,
        detection_mode, structured_output, metadata, analysis_time_ms,
        cost_euros, user_email, user_sector, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      submissionId,
      userInput,
      detectedContext,
      confidence || 0,
      Boolean(isHybrid),
      usedAI ? 'hybrid' : 'local',
      JSON.stringify(structuredOutput),
      JSON.stringify(metadata),
      analysisTime || 0,
      costTracking?.totalCost || 0,
      userInfo.email,
      userInfo.sector || null
    ])

    // Enregistrement de l'événement
    await runQuery(`
      INSERT INTO analytics_events (
        id, submission_id, event_type, event_data, created_at
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      eventId,
      submissionId,
      'STRUCTURE_GENERATED',
      JSON.stringify({
        contextType: detectedContext,
        confidence: confidence,
        structureCount: structurePreview?.length || 0,
        hasCustomization: Boolean(adaptiveAnswers && Object.keys(adaptiveAnswers).length > 0)
      })
    ])

    logger.info(`✅ Soumission enregistrée: ${submissionId}`, {
      contextType: detectedContext,
      confidence: confidence,
      userSector: userInfo.sector,
      usedAI: Boolean(usedAI)
    })

    // Réponse de succès
    res.json({
      success: true,
      submissionId,
      message: 'Analyse enregistrée avec succès',
      data: {
        contextType: detectedContext,
        confidence: confidence,
        structure: structurePreview,
        recommendations: structuredOutput.recommendations,
        nextSteps: generateNextSteps(detectedContext, userInfo.sector)
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Erreur soumission formulaire:', error)
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement',
      code: 'SUBMISSION_FAILED'
    })
  }
})

/**
 * Génère des recommandations personnalisées
 */
const generateRecommendations = (contextType, adaptiveAnswers = {}) => {
  const recommendations = []

  const baseRecommendations = {
    CLIENT_BASED: [
      'Organisez vos projets par client pour une meilleure visibilité',
      'Utilisez des tags pour identifier les types de projets par client',
      'Planifiez des revues régulières avec chaque client'
    ],
    TEMPORAL: [
      'Définissez des cycles de travail cohérents',
      'Planifiez des rétrospectives à la fin de chaque cycle',
      'Utilisez des métriques de vélocité pour améliorer vos estimations'
    ],
    PHASED: [
      'Définissez clairement les critères de passage entre phases',
      'Documentez les livrables attendus pour chaque phase',
      'Planifiez des points de validation avec les parties prenantes'
    ],
    VERSIONED: [
      'Adoptez un schéma de versioning cohérent',
      'Documentez les changements dans un changelog',
      'Planifiez des releases régulières'
    ],
    PROCESS_BASED: [
      'Documentez clairement chaque étape du processus',
      'Identifiez les goulots d\'étranglement potentiels',
      'Mesurez les temps de traitement pour chaque étape'
    ],
    RESOURCE_BASED: [
      'Équilibrez la charge de travail entre les ressources',
      'Identifiez les compétences clés de chaque ressource',
      'Planifiez la montée en compétences selon les besoins'
    ]
  }

  recommendations.push(...(baseRecommendations[contextType] || []))

  // Recommandations basées sur les réponses adaptatives
  if (adaptiveAnswers.clientCount === '25+') {
    recommendations.push('Considérez un système de priorisation pour gérer efficacement un grand nombre de clients')
  }

  if (adaptiveAnswers.teamSize && adaptiveAnswers.teamSize > 10) {
    recommendations.push('Avec une équipe de cette taille, pensez à déléguer et créer des sous-équipes')
  }

  if (adaptiveAnswers.automationLevel === 'manual') {
    recommendations.push('L\'automatisation de certaines étapes pourrait améliorer votre efficacité')
  }

  return recommendations.slice(0, 5) // Limiter à 5 recommandations max
}

/**
 * Génère les prochaines étapes suggérées
 */
const generateNextSteps = (contextType, sector) => {
  const baseSteps = {
    CLIENT_BASED: [
      '1. Créez une colonne pour chaque client principal',
      '2. Ajoutez vos projets en cours dans les colonnes appropriées',
      '3. Utilisez des étiquettes pour catégoriser les types de tâches',
      '4. Planifiez des revues hebdomadaires par client'
    ],
    TEMPORAL: [
      '1. Définissez la durée de vos cycles/sprints',
      '2. Créez votre premier cycle avec les tâches prioritaires',
      '3. Planifiez une rétrospective en fin de cycle',
      '4. Ajustez la durée selon vos retours d\'expérience'
    ],
    PHASED: [
      '1. Listez toutes les phases de vos projets',
      '2. Définissez les critères de passage entre phases',
      '3. Créez des templates pour chaque type de projet',
      '4. Documentez les bonnes pratiques par phase'
    ],
    VERSIONED: [
      '1. Choisissez votre schéma de versioning',
      '2. Créez votre première version stable',
      '3. Planifiez les fonctionnalités des prochaines versions',
      '4. Mettez en place un processus de release'
    ],
    PROCESS_BASED: [
      '1. Cartographiez votre processus étape par étape',
      '2. Identifiez les responsables de chaque étape',
      '3. Définissez les critères de passage entre étapes',
      '4. Mesurez les temps de traitement'
    ],
    RESOURCE_BASED: [
      '1. Listez toutes vos ressources et leurs compétences',
      '2. Créez des colonnes par ressource ou équipe',
      '3. Équilibrez la charge de travail',
      '4. Planifiez les formations nécessaires'
    ]
  }

  const steps = [...(baseSteps[contextType] || [])]

  // Étapes spécifiques selon le secteur
  if (sector === 'consulting') {
    steps.push('5. Configurez un suivi du temps par client pour la facturation')
  } else if (sector === 'development') {
    steps.push('5. Intégrez vos outils de développement (Git, CI/CD)')
  } else if (sector === 'marketing') {
    steps.push('5. Synchronisez avec votre calendrier de campagnes')
  }

  return steps
}

export default router