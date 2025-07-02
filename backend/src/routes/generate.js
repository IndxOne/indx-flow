import express from 'express'
import { getDefaultStructures } from '../utils/keywordLoader.js'
import logger from '../utils/logger.js'

const router = express.Router()

/**
 * POST /api/generate/structure
 * Génère une structure de projet basée sur le contexte et les réponses
 */
router.post('/structure', async (req, res) => {
  try {
    const { contextType, answers = {} } = req.body

    if (!contextType) {
      return res.status(400).json({
        error: 'Type de contexte requis',
        code: 'MISSING_CONTEXT_TYPE'
      })
    }

    const validTypes = ['CLIENT_BASED', 'TEMPORAL', 'PHASED', 'VERSIONED', 'PROCESS_BASED', 'RESOURCE_BASED', 'GENERIC']
    
    if (!validTypes.includes(contextType)) {
      return res.status(400).json({
        error: 'Type de contexte invalide',
        code: 'INVALID_CONTEXT_TYPE'
      })
    }

    // Récupérer les structures par défaut
    const defaultStructures = getDefaultStructures()
    const contextStructures = defaultStructures[contextType] || defaultStructures.GENERIC

    // Choisir la variante appropriée basée sur les réponses
    let selectedVariant = 'default'
    
    if (answers.clientType) {
      selectedVariant = answers.clientType
    } else if (answers.methodology) {
      selectedVariant = answers.methodology === 'scrum' ? 'development' : 'default'
    } else if (answers.projectType) {
      selectedVariant = answers.projectType
    } else if (answers.processType) {
      selectedVariant = answers.processType
    } else if (answers.organizationType) {
      selectedVariant = answers.organizationType
    }

    // Obtenir la structure finale
    const structure = contextStructures[selectedVariant] || contextStructures.default

    // Personnaliser selon les réponses spécifiques
    const customizedStructure = customizeStructure(structure, contextType, answers)

    logger.info(`Structure générée: ${contextType} (variant: ${selectedVariant})`, {
      contextType,
      selectedVariant,
      answersCount: Object.keys(answers).length
    })

    res.json({
      success: true,
      contextType,
      variant: selectedVariant,
      structure: customizedStructure,
      metadata: {
        answersUsed: Object.keys(answers).length,
        customizations: getCustomizationsSummary(answers)
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Erreur génération structure:', error)
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération de structure',
      code: 'STRUCTURE_GENERATION_FAILED'
    })
  }
})

/**
 * Personnalise la structure selon les réponses
 * @param {Array} baseStructure 
 * @param {string} contextType 
 * @param {Object} answers 
 * @returns {Array}
 */
const customizeStructure = (baseStructure, contextType, answers) => {
  let structure = [...baseStructure]

  switch (contextType) {
    case 'CLIENT_BASED':
      if (answers.clientCount === '1-3') {
        structure = ['Client Principal', 'Client Secondaire', 'Prospects', 'Archive']
      } else if (answers.clientCount === '25+') {
        structure = ['Clients VIP', 'Clients Actifs', 'Nouveaux Clients', 'Leads']
      }
      break

    case 'TEMPORAL':
      if (answers.sprintDuration === '1week') {
        structure = ['Semaine Actuelle', 'Semaine Suivante', 'Backlog', 'Terminé']
      } else if (answers.sprintDuration === 'quarterly') {
        structure = ['Q1', 'Q2', 'Q3', 'Q4']
      }
      break

    case 'PHASED':
      if (answers.phaseCount === '3') {
        structure = ['Phase 1', 'Phase 2', 'Phase 3', 'Terminé']
      } else if (answers.phaseCount === '6+') {
        structure = ['Étude', 'Conception', 'Développement', 'Test', 'Déploiement', 'Maintenance']
      }
      break

    case 'VERSIONED':
      if (answers.versioningScheme === 'simple') {
        structure = ['Version 1', 'Version 2', 'Version 3', 'Idées']
      } else if (answers.versioningScheme === 'date') {
        const now = new Date()
        const currentMonth = now.toISOString().slice(0, 7)
        structure = [`${currentMonth}`, 'Mois suivant', 'Planifié', 'Archive']
      }
      break

    case 'PROCESS_BASED':
      if (answers.processSteps && answers.processSteps > 4) {
        structure = ['Étape 1', 'Étape 2', 'Étape 3', 'Validation', 'Finalisé']
      }
      break

    case 'RESOURCE_BASED':
      if (answers.skillCategories && answers.skillCategories.length > 0) {
        structure = answers.skillCategories.slice(0, 4).map(skill => 
          skill.charAt(0).toUpperCase() + skill.slice(1)
        )
        // Compléter si moins de 4
        while (structure.length < 4) {
          structure.push('Ressources Libres')
        }
      }
      break
  }

  return structure
}

/**
 * Résumé des personnalisations appliquées
 * @param {Object} answers 
 * @returns {Object}
 */
const getCustomizationsSummary = (answers) => {
  const summary = {}
  
  if (answers.clientCount) summary.clientScale = answers.clientCount
  if (answers.teamSize) summary.teamSize = answers.teamSize
  if (answers.sprintDuration) summary.cycleDuration = answers.sprintDuration
  if (answers.processSteps) summary.processComplexity = answers.processSteps > 4 ? 'complex' : 'simple'
  if (answers.skillCategories) summary.skillDiversity = answers.skillCategories.length
  
  return summary
}

export default router