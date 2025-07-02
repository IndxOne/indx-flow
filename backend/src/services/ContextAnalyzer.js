import natural from 'natural'
import { franc } from 'franc'
import logger from '../utils/logger.js'
import { loadKeywords } from '../utils/keywordLoader.js'

/**
 * Service d'analyse contextuelle locale (sans IA)
 * Utilise une base de mots-clés pondérés et des algorithmes de traitement du langage naturel
 */
class ContextAnalyzer {
  constructor() {
    this.stemmer = natural.PorterStemmerFr
    this.tokenizer = new natural.WordTokenizer()
    this.keywords = null
    this.keywordsLoaded = false
    this.stopWords = new Set([
      'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'à', 'avec',
      'pour', 'par', 'sur', 'dans', 'sans', 'sous', 'je', 'tu', 'il', 'elle',
      'nous', 'vous', 'ils', 'elles', 'ce', 'ca', 'ça', 'qui', 'que', 'quoi',
      'est', 'sont', 'être', 'avoir', 'faire', 'dire', 'aller', 'venir'
    ])
    // Initialisation asynchrone différée
    this.initializeKeywords()
  }

  async initializeKeywords() {
    if (this.keywordsLoaded) return
    
    try {
      this.keywords = await loadKeywords()
      this.keywordsLoaded = true
      logger.info('✅ Mots-clés contextuels chargés')
    } catch (error) {
      logger.error('Erreur chargement mots-clés:', error)
      // Utiliser des mots-clés par défaut en cas d'erreur
      this.keywords = this.getDefaultKeywords()
      this.keywordsLoaded = true
    }
  }

  getDefaultKeywords() {
    return {
      CLIENT_BASED: {
        keywords: [
          { term: "client", weight: 4.5, variants: ["clients", "clientèle"] },
          { term: "compte", weight: 4.0, variants: ["comptes", "portfolio"] },
          { term: "patient", weight: 4.5, variants: ["patients", "patientèle"] }
        ]
      },
      TEMPORAL: {
        keywords: [
          { term: "sprint", weight: 4.8, variants: ["sprints", "scrum"] },
          { term: "cycle", weight: 4.0, variants: ["cycles", "cyclique"] }
        ]
      },
      PHASED: {
        keywords: [
          { term: "phase", weight: 4.5, variants: ["phases", "étape"] },
          { term: "étape", weight: 4.2, variants: ["étapes", "stade"] }
        ]
      },
      VERSIONED: {
        keywords: [
          { term: "version", weight: 4.8, variants: ["versions", "v1", "v2"] },
          { term: "release", weight: 4.5, variants: ["releases", "livraison"] }
        ]
      },
      PROCESS_BASED: {
        keywords: [
          { term: "processus", weight: 4.5, variants: ["process", "procédure"] },
          { term: "workflow", weight: 4.2, variants: ["flux", "étapes"] }
        ]
      },
      RESOURCE_BASED: {
        keywords: [
          { term: "équipe", weight: 4.5, variants: ["équipes", "team"] },
          { term: "ressource", weight: 4.2, variants: ["ressources", "rh"] }
        ]
      }
    }
  }

  /**
   * Analyse locale du contexte basée sur les mots-clés
   * @param {string} text - Texte à analyser
   * @returns {Object} Résultat de l'analyse
   */
  async analyzeLocal(text) {
    const startTime = Date.now()
    
    // S'assurer que les mots-clés sont chargés
    await this.initializeKeywords()
    
    try {
      // Validation entrée
      if (!text || text.length < 3) {
        throw new Error('Texte trop court pour analyse (minimum 3 caractères)')
      }

      if (text.length > 2000) {
        throw new Error('Texte trop long (maximum 2000 caractères)')
      }

      // Détecter la langue
      const language = franc(text)
      const isFrench = language === 'fra'

      // Preprocessing du texte
      const processedText = this.preprocessText(text)
      const tokens = this.tokenizeAndClean(processedText)
      
      if (tokens.length === 0) {
        return {
          // Rétrocompatibilité
          detectedContext: 'GENERIC',
          primaryType: 'GENERIC',
          confidence: 20,
          reasoning: 'Aucun mot-clé significatif détecté',
          isHybrid: false,
          secondaryType: null,
          analysisTime: Date.now() - startTime,
          method: 'local',
          language: isFrench ? 'fr' : 'other',
          // Nouveau format
          detectedContexts: [{
            type: 'GENERIC',
            confidence: 20,
            weight: 1.0,
            reasoning: 'Aucun mot-clé significatif détecté',
            priority: 'primary'
          }],
          debugInfo: {
            tokenCount: 0,
            processedTokens: [],
            multiContext: {
              totalContexts: 1,
              strongContexts: 1
            }
          }
        }
      }

      // Calcul des scores par contexte
      const scores = this.calculateContextScores(tokens)
      
      // Déterminer le type principal et la confiance
      const result = this.determineContextType(scores, tokens.length)
      
      const analysisTime = Date.now() - startTime

      return {
        // Rétrocompatibilité - format ancien
        detectedContext: result.primaryType, // Alias pour compatibilité
        ...result,
        analysisTime,
        method: 'local',
        language: isFrench ? 'fr' : 'other',
        debugInfo: {
          tokenCount: tokens.length,
          processedTokens: tokens.slice(0, 10), // Limiter pour éviter la surcharge
          scores,
          threshold: result.confidence,
          multiContext: {
            totalContexts: result.detectedContexts.length,
            strongContexts: result.detectedContexts.filter(c => c.priority === 'strong' || c.priority === 'primary').length
          }
        }
      }

    } catch (error) {
      logger.error('Erreur analyse locale:', error)
      throw error
    }
  }

  /**
   * Preprocessing du texte
   * @param {string} text 
   * @returns {string}
   */
  preprocessText(text) {
    return text
      .toLowerCase()
      .normalize('NFD') // Décomposition des accents
      .replace(/[\u0300-\u036f]/g, '') // Suppression des diacritiques
      .replace(/[^\w\s]/g, ' ') // Suppression ponctuation
      .replace(/\s+/g, ' ') // Normalisation espaces
      .trim()
  }

  /**
   * Tokenization et nettoyage
   * @param {string} text 
   * @returns {Array}
   */
  tokenizeAndClean(text) {
    const tokens = this.tokenizer.tokenize(text)
    
    return tokens
      .filter(token => token.length > 2) // Mots d'au moins 3 caractères
      .filter(token => !this.stopWords.has(token))
      .map(token => this.stemmer.stem(token))
      .filter((token, index, arr) => arr.indexOf(token) === index) // Dédoublonnage
  }

  /**
   * Calcul des scores par type de contexte
   * @param {Array} tokens 
   * @returns {Object}
   */
  calculateContextScores(tokens) {
    const scores = {
      CLIENT_BASED: 0,
      TEMPORAL: 0,
      PHASED: 0,
      VERSIONED: 0,
      PROCESS_BASED: 0,
      RESOURCE_BASED: 0
    }

    let totalWeight = 0

    for (const token of tokens) {
      // Recherche directe du token
      for (const [contextType, keywordData] of Object.entries(this.keywords)) {
        for (const keywordObj of keywordData.keywords) {
          const stemmedKeyword = this.stemmer.stem(keywordObj.term.toLowerCase())
          const stemmedVariants = keywordObj.variants.map(v => this.stemmer.stem(v.toLowerCase()))
          
          if (token === stemmedKeyword || stemmedVariants.includes(token)) {
            scores[contextType] += keywordObj.weight
            totalWeight += keywordObj.weight
            break
          }
        }
      }
    }

    // Normalisation des scores (0-100)
    if (totalWeight > 0) {
      for (const contextType in scores) {
        scores[contextType] = Math.round((scores[contextType] / totalWeight) * 100)
      }
    }

    return scores
  }

  /**
   * Détermine le type de contexte principal et les contextes multiples
   * @param {Object} scores 
   * @param {number} tokenCount 
   * @returns {Object}
   */
  determineContextType(scores, tokenCount) {
    const sortedScores = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .filter(([, score]) => score > 0)

    if (sortedScores.length === 0) {
      return {
        // Rétrocompatibilité
        primaryType: 'GENERIC',
        confidence: 20,
        reasoning: 'Aucun mot-clé contextuel détecté',
        isHybrid: false,
        secondaryType: null,
        // Nouveau format multi-contextes
        detectedContexts: [{
          type: 'GENERIC',
          confidence: 20,
          weight: 1.0,
          reasoning: 'Aucun mot-clé contextuel détecté'
        }]
      }
    }

    const [primaryType, primaryScore] = sortedScores[0]
    const [secondaryType, secondaryScore] = sortedScores[1] || [null, 0]

    // Calcul de la confiance basé sur le score et le nombre de tokens
    let confidence = Math.min(100, primaryScore * 1.5)
    
    // Bonus de confiance pour les textes plus longs
    if (tokenCount > 10) confidence += 5
    if (tokenCount > 20) confidence += 5

    // Malus pour les scores très faibles
    if (primaryScore < 10) confidence = Math.max(20, confidence - 20)

    // Détection hybride
    const isHybrid = secondaryScore >= (primaryScore * 0.4) && secondaryScore >= 20

    let reasoning = `Type ${primaryType} détecté avec ${primaryScore}% de correspondance`
    if (isHybrid) {
      reasoning += ` (hybride avec ${secondaryType}: ${secondaryScore}%)`
    }

    // Nouveau : Détection de contextes multiples avec seuils
    const detectedContexts = this.extractMultipleContexts(sortedScores, tokenCount)

    return {
      // Rétrocompatibilité (format ancien)
      primaryType,
      confidence: Math.round(confidence),
      reasoning,
      isHybrid,
      secondaryType: isHybrid ? secondaryType : null,
      
      // Nouveau format multi-contextes
      detectedContexts
    }
  }

  /**
   * Extrait tous les contextes significatifs avec leurs pondérations
   * @param {Array} sortedScores - Scores triés par ordre décroissant
   * @param {number} tokenCount - Nombre de tokens analysés
   * @returns {Array} Liste des contextes détectés avec métadonnées
   */
  extractMultipleContexts(sortedScores, tokenCount) {
    const contexts = []
    const [primaryType, primaryScore] = sortedScores[0]
    
    // Contexte principal (toujours présent)
    let primaryConfidence = Math.min(100, primaryScore * 1.5)
    if (tokenCount > 10) primaryConfidence += 5
    if (tokenCount > 20) primaryConfidence += 5
    if (primaryScore < 10) primaryConfidence = Math.max(20, primaryConfidence - 20)

    contexts.push({
      type: primaryType,
      confidence: Math.round(primaryConfidence),
      weight: 1.0, // Poids principal
      reasoning: `Contexte dominant avec ${primaryScore}% de correspondance`,
      priority: 'primary'
    })

    // Contextes secondaires (seuils adaptatifs)
    for (let i = 1; i < sortedScores.length; i++) {
      const [contextType, score] = sortedScores[i]
      
      // Seuils pour contextes secondaires
      const minThreshold = Math.max(15, primaryScore * 0.3) // Au moins 30% du principal
      const strongThreshold = primaryScore * 0.7 // Fort = 70% du principal
      
      if (score >= minThreshold) {
        let weight = score / primaryScore // Poids relatif
        let priority = 'secondary'
        
        // Contexte fort (quasi-égal au principal)
        if (score >= strongThreshold) {
          weight = Math.min(0.8, weight) // Max 80% du principal
          priority = 'strong'
        } else if (score >= primaryScore * 0.5) {
          weight = Math.min(0.6, weight) // Max 60% du principal
          priority = 'medium'
        } else {
          weight = Math.min(0.4, weight) // Max 40% du principal
          priority = 'weak'
        }

        contexts.push({
          type: contextType,
          confidence: Math.round(score * 1.2), // Légère amplification
          weight: Math.round(weight * 100) / 100, // Arrondi à 2 décimales
          reasoning: `Contexte ${priority} avec ${score}% de correspondance`,
          priority
        })
      }
    }

    // Réajustement des poids pour que la somme soit cohérente
    const totalWeight = contexts.reduce((sum, ctx) => sum + ctx.weight, 0)
    if (totalWeight > 1.5) { // Si trop de contextes forts
      contexts.forEach(ctx => {
        if (ctx.priority !== 'primary') {
          ctx.weight = ctx.weight * (1.2 / totalWeight) // Normalisation
        }
      })
    }

    return contexts
  }

  /**
   * Génère des suggestions de structure basées sur le contexte détecté
   * @param {string} contextType 
   * @param {Object} additionalInfo 
   * @returns {Array}
   */
  generateStructureSuggestions(contextType, additionalInfo = {}) {
    const structures = {
      CLIENT_BASED: {
        default: ['Client A', 'Client B', 'Client C', 'Prospects'],
        medical: ['Patients Urgents', 'Rendez-vous', 'Suivi', 'Archives'],
        consulting: ['Client Principal', 'Projet Secondaire', 'Prospection', 'R&D']
      },
      TEMPORAL: {
        default: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Backlog'],
        marketing: ['Q1 Campagne', 'Q2 Campagne', 'Q3 Campagne', 'Q4 Campagne'],
        development: ['Sprint Actuel', 'Sprint Suivant', 'Bugs', 'Features']
      },
      PHASED: {
        default: ['Conception', 'Réalisation', 'Tests', 'Déploiement'],
        construction: ['Études', 'Fondations', 'Gros Œuvre', 'Finitions'],
        migration: ['Analyse', 'Préparation', 'Migration', 'Validation']
      },
      VERSIONED: {
        default: ['v1.0.0', 'v1.1.0', 'v2.0.0', 'Backlog'],
        software: ['Stable', 'Beta', 'Alpha', 'Ideas'],
        design: ['V1 Design', 'V2 Iteration', 'V3 Final', 'Archive']
      },
      PROCESS_BASED: {
        default: ['Lead', 'Qualification', 'Proposition', 'Signature'],
        sales: ['Prospection', 'Contact', 'Négociation', 'Closing'],
        recruitment: ['Candidatures', 'Entretiens', 'Tests', 'Décision']
      },
      RESOURCE_BASED: {
        default: ['Jean (Designer)', 'Marie (Dev)', 'Paul (PM)', 'Ressources Libres'],
        agency: ['Créatifs', 'Techniques', 'Commerciaux', 'Support'],
        consulting: ['Consultants Senior', 'Consultants Junior', 'Expertise', 'Formation']
      },
      GENERIC: {
        default: ['À faire', 'En cours', 'En attente', 'Terminé']
      }
    }

    const contextStructures = structures[contextType] || structures.GENERIC
    
    // Choisir la variante la plus appropriée
    const variant = additionalInfo.sector || 'default'
    return contextStructures[variant] || contextStructures.default
  }
}

export default ContextAnalyzer