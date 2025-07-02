import Anthropic from '@anthropic-ai/sdk'
import NodeCache from 'node-cache'
import crypto from 'crypto'
import logger from '../utils/logger.js'

/**
 * Service d'analyse contextuelle avec Claude AI
 * Utilise l'API Anthropic pour une analyse approfondie du contexte
 */
class ClaudeClient {
  constructor() {
    this.client = null
    this.cache = new NodeCache({ 
      stdTTL: 3600, // 1 heure de cache
      checkperiod: 600 // Nettoyage toutes les 10 minutes
    })
    this.isConfigured = false
    this.requestCount = 0
    this.lastRequestTime = 0
    this.rateLimitDelay = 1000 // 1 seconde entre les requêtes
    
    this.initializeClient()
  }

  initializeClient() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    
    if (!apiKey || apiKey === 'your_claude_api_key_here') {
      logger.warn('⚠️  Claude API non configurée - utilisation du mode local uniquement')
      this.isConfigured = false
      return
    }

    try {
      this.client = new Anthropic({
        apiKey: apiKey
      })
      this.isConfigured = true
      logger.info('✅ Claude API initialisée')
    } catch (error) {
      logger.error('Erreur initialisation Claude:', error)
      this.isConfigured = false
    }
  }

  /**
   * Vérifie si Claude API est disponible
   * @returns {boolean}
   */
  isAvailable() {
    return this.isConfigured && this.client !== null
  }

  /**
   * Applique le rate limiting
   */
  async applyRateLimit() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    this.lastRequestTime = Date.now()
  }

  /**
   * Analyse avec Claude AI
   * @param {string} text - Texte à analyser
   * @returns {Object} Résultat de l'analyse
   */
  async analyzeWithAI(text) {
    if (!this.isAvailable()) {
      throw new Error('Claude API non disponible - utilisez le mode local')
    }

    const startTime = Date.now()
    
    try {
      // Validation entrée
      if (!text || text.length < 3) {
        throw new Error('Texte trop court pour analyse (minimum 3 caractères)')
      }

      if (text.length > 2000) {
        throw new Error('Texte trop long (maximum 2000 caractères)')
      }

      // Vérifier le cache
      const cacheKey = this.generateCacheKey(text)
      const cached = this.cache.get(cacheKey)
      
      if (cached) {
        logger.info('📋 Résultat récupéré depuis le cache')
        return {
          ...cached,
          analysisTime: Date.now() - startTime,
          fromCache: true
        }
      }

      // Rate limiting
      await this.applyRateLimit()

      // Construire le prompt
      const prompt = this.buildAnalysisPrompt(text)

      // Appel à Claude
      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307', // Modèle moins cher pour réduire les coûts
        max_tokens: 1000,
        temperature: 0.1, // Réponses plus déterministes
        system: this.getSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      this.requestCount++
      
      // Parser la réponse
      const result = this.parseClaudeResponse(response.content[0].text)
      
      // Mettre en cache
      this.cache.set(cacheKey, result)
      
      const analysisTime = Date.now() - startTime

      logger.info(`🤖 Analyse Claude terminée en ${analysisTime}ms`)

      return {
        ...result,
        analysisTime,
        method: 'ai',
        fromCache: false,
        requestCount: this.requestCount
      }

    } catch (error) {
      logger.error('Erreur analyse Claude:', error)
      
      // En cas d'erreur, essayer de fournir une réponse générique
      if (error.status === 429) { // Rate limit exceeded
        throw new Error('Limite de taux API atteinte - veuillez réessayer plus tard')
      } else if (error.status >= 500) { // Erreur serveur
        throw new Error('Erreur serveur Claude - veuillez réessayer')
      } else {
        throw new Error(`Erreur Claude API: ${error.message}`)
      }
    }
  }

  /**
   * Génère une clé de cache pour le texte
   * @param {string} text 
   * @returns {string}
   */
  generateCacheKey(text) {
    return crypto.createHash('md5').update(text.toLowerCase().trim()).digest('hex')
  }

  /**
   * Prompt système pour Claude
   * @returns {string}
   */
  getSystemPrompt() {
    return `Tu es un expert en analyse de contexte organisationnel. Ton rôle est d'analyser un texte décrivant un projet ou une activité professionnelle et de déterminer TOUS les types d'organisation pertinents avec leurs priorités.

Types de contexte disponibles :
- CLIENT_BASED : Organisation par clients/comptes/patients (consultants, médecins, commerciaux)
- TEMPORAL : Organisation par cycles temporels (sprints, campagnes, plannings)
- PHASED : Organisation par phases séquentielles (construction, migration, certification)
- VERSIONED : Organisation par versions/itérations (développement, design, produit)
- PROCESS_BASED : Organisation par processus métier (vente, recrutement, support)
- RESOURCE_BASED : Organisation par ressources/équipes (agence, consulting, multi-sites)

IMPORTANT : Dans la vraie vie, les projets combinent souvent plusieurs contextes (ex: consultant SI = CLIENT_BASED + TEMPORAL + RESOURCE_BASED).

Réponds UNIQUEMENT avec un JSON valide selon ce format exact :
{
  "primaryType": "TYPE_PRINCIPAL",
  "confidence": 85,
  "reasoning": "Explication claire",
  "isHybrid": true,
  "secondaryType": "TYPE_SECONDAIRE",
  "detectedContexts": [
    {
      "type": "CLIENT_BASED",
      "confidence": 85,
      "weight": 1.0,
      "reasoning": "Forte présence de mots-clés clients",
      "priority": "primary"
    },
    {
      "type": "TEMPORAL",
      "confidence": 65,
      "weight": 0.6,
      "reasoning": "Mentions de cycles et sprints",
      "priority": "medium"
    }
  ],
  "suggestedStructure": ["Colonne 1", "Colonne 2", "Colonne 3", "Colonne 4"]
}`
  }

  /**
   * Construit le prompt d'analyse
   * @param {string} text 
   * @returns {string}
   */
  buildAnalysisPrompt(text) {
    return `Analyse ce texte et détermine TOUS les contextes organisationnels pertinents avec leurs priorités :

"${text}"

Instructions :
1. Identifie le contexte PRINCIPAL (priority: "primary", weight: 1.0)
2. Cherche tous les contextes SECONDAIRES significatifs (weight entre 0.3 et 0.8)
3. Assigne des priorités: "primary", "strong", "medium", "weak"
4. Pense comme un consultant SI : les projets mélangent souvent CLIENT + TEMPORAL + RESOURCE
5. Fournis une structure de 4 colonnes qui combine intelligemment les contextes détectés

Exemples de cas réels :
- "Mission chez ClientX en sprints" = CLIENT_BASED (primary) + TEMPORAL (medium)
- "Migration par phases avec équipe dédiée" = PHASED (primary) + RESOURCE_BASED (strong)
- "Dev produit v1/v2 en équipe agile" = VERSIONED (primary) + TEMPORAL (medium) + RESOURCE_BASED (weak)`
  }

  /**
   * Parse la réponse de Claude
   * @param {string} response 
   * @returns {Object}
   */
  parseClaudeResponse(response) {
    try {
      // Nettoyer la réponse (supprimer markdown, etc.)
      const cleanResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      const parsed = JSON.parse(cleanResponse)
      
      // Validation de la réponse
      const validTypes = ['CLIENT_BASED', 'TEMPORAL', 'PHASED', 'VERSIONED', 'PROCESS_BASED', 'RESOURCE_BASED', 'GENERIC']
      
      if (!validTypes.includes(parsed.primaryType)) {
        throw new Error('Type de contexte invalide')
      }

      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 100) {
        throw new Error('Score de confiance invalide')
      }

      // S'assurer que la structure est un tableau de 4 éléments
      if (!Array.isArray(parsed.suggestedStructure) || parsed.suggestedStructure.length !== 4) {
        parsed.suggestedStructure = this.getDefaultStructure(parsed.primaryType)
      }

      // Traitement des contextes multiples
      let detectedContexts = []
      if (Array.isArray(parsed.detectedContexts) && parsed.detectedContexts.length > 0) {
        detectedContexts = parsed.detectedContexts.map(ctx => ({
          type: ctx.type,
          confidence: Math.round(ctx.confidence || 50),
          weight: Math.round((ctx.weight || 0.5) * 100) / 100,
          reasoning: ctx.reasoning || 'Contexte détecté par IA',
          priority: ctx.priority || 'secondary'
        }))
      } else {
        // Fallback : créer detectedContexts à partir du format ancien
        detectedContexts = [{
          type: parsed.primaryType,
          confidence: Math.round(parsed.confidence),
          weight: 1.0,
          reasoning: parsed.reasoning || 'Contexte principal',
          priority: 'primary'
        }]
        
        if (parsed.isHybrid && parsed.secondaryType) {
          detectedContexts.push({
            type: parsed.secondaryType,
            confidence: Math.round(parsed.confidence * 0.7),
            weight: 0.6,
            reasoning: 'Contexte hybride détecté',
            priority: 'medium'
          })
        }
      }

      return {
        // Rétrocompatibilité
        detectedContext: parsed.primaryType, // Alias pour compatibilité
        primaryType: parsed.primaryType,
        confidence: Math.round(parsed.confidence),
        reasoning: parsed.reasoning || 'Analyse automatique Claude',
        isHybrid: Boolean(parsed.isHybrid),
        secondaryType: parsed.secondaryType || null,
        suggestedStructure: parsed.suggestedStructure,
        
        // Nouveau format multi-contextes
        detectedContexts
      }

    } catch (error) {
      logger.error('Erreur parsing réponse Claude:', error)
      logger.debug('Réponse brute:', response)
      
      // Fallback avec structure générique
      return {
        // Rétrocompatibilité
        detectedContext: 'GENERIC',
        primaryType: 'GENERIC',
        confidence: 50,
        reasoning: 'Erreur de parsing - analyse générique appliquée',
        isHybrid: false,
        secondaryType: null,
        suggestedStructure: ['À faire', 'En cours', 'En attente', 'Terminé'],
        
        // Nouveau format
        detectedContexts: [{
          type: 'GENERIC',
          confidence: 50,
          weight: 1.0,
          reasoning: 'Erreur de parsing - contexte générique par défaut',
          priority: 'primary'
        }]
      }
    }
  }

  /**
   * Structure par défaut selon le type
   * @param {string} contextType 
   * @returns {Array}
   */
  getDefaultStructure(contextType) {
    const defaults = {
      CLIENT_BASED: ['Client A', 'Client B', 'Client C', 'Prospects'],
      TEMPORAL: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Backlog'],
      PHASED: ['Conception', 'Réalisation', 'Tests', 'Déploiement'],
      VERSIONED: ['v1.0.0', 'v1.1.0', 'v2.0.0', 'Backlog'],
      PROCESS_BASED: ['Lead', 'Qualification', 'Proposition', 'Signature'],
      RESOURCE_BASED: ['Jean (Designer)', 'Marie (Dev)', 'Paul (PM)', 'Ressources Libres'],
      GENERIC: ['À faire', 'En cours', 'En attente', 'Terminé']
    }

    return defaults[contextType] || defaults.GENERIC
  }

  /**
   * Statistiques d'utilisation de l'API
   * @returns {Object}
   */
  getUsageStats() {
    return {
      requestCount: this.requestCount,
      cacheSize: this.cache.keys().length,
      isConfigured: this.isConfigured,
      lastRequestTime: this.lastRequestTime
    }
  }

  /**
   * Estime le coût d'une requête
   * @returns {number} Coût en euros
   */
  getRequestCost() {
    return parseFloat(process.env.CLAUDE_COST_PER_REQUEST) || 0.002
  }

  /**
   * Vide le cache
   */
  clearCache() {
    this.cache.flushAll()
    logger.info('🧹 Cache Claude vidé')
  }
}

export default ClaudeClient