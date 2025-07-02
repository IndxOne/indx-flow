import { promises as fs } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import logger from './logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let keywordsCache = null

/**
 * Charge les mots-clés depuis le fichier JSON
 * @returns {Object} Mots-clés contextuels
 */
export const loadKeywords = async () => {
  if (keywordsCache) {
    return keywordsCache.contextKeywords
  }

  try {
    // Chemin vers le fichier keywords.json dans le frontend
    const keywordsPath = join(__dirname, '../../../src/assets/keywords.json')
    
    const keywordsContent = await fs.readFile(keywordsPath, 'utf-8')
    keywordsCache = JSON.parse(keywordsContent)
    
    logger.info('✅ Mots-clés contextuels chargés depuis JSON')
    return keywordsCache.contextKeywords
    
  } catch (error) {
    logger.warn('⚠️  Impossible de charger keywords.json, utilisation des mots-clés par défaut')
    
    // Fallback avec mots-clés de base
    keywordsCache = {
      contextKeywords: getDefaultKeywords()
    }
    
    return keywordsCache.contextKeywords
  }
}

/**
 * Mots-clés par défaut si le fichier JSON n'est pas accessible
 * @returns {Object}
 */
const getDefaultKeywords = () => ({
  CLIENT_BASED: {
    keywords: [
      { term: "client", weight: 4.5, variants: ["clients", "clientèle"] },
      { term: "compte", weight: 4.0, variants: ["comptes", "portfolio"] },
      { term: "patient", weight: 4.5, variants: ["patients", "patientèle"] },
      { term: "service", weight: 3.5, variants: ["services", "prestation"] },
      { term: "consultant", weight: 4.0, variants: ["consulting", "conseil"] }
    ]
  },
  TEMPORAL: {
    keywords: [
      { term: "sprint", weight: 4.8, variants: ["sprints", "scrum"] },
      { term: "cycle", weight: 4.0, variants: ["cycles", "cyclique"] },
      { term: "planning", weight: 3.5, variants: ["planification", "agenda"] },
      { term: "agile", weight: 4.5, variants: ["agilité", "méthodologie"] },
      { term: "itération", weight: 4.2, variants: ["itératif", "boucle"] }
    ]
  },
  PHASED: {
    keywords: [
      { term: "phase", weight: 4.5, variants: ["phases", "étape"] },
      { term: "étape", weight: 4.2, variants: ["étapes", "stade"] },
      { term: "migration", weight: 4.0, variants: ["migrer", "transition"] },
      { term: "construction", weight: 3.8, variants: ["btp", "chantier"] },
      { term: "conception", weight: 3.5, variants: ["design", "création"] }
    ]
  },
  VERSIONED: {
    keywords: [
      { term: "version", weight: 4.8, variants: ["versions", "v1", "v2"] },
      { term: "release", weight: 4.5, variants: ["releases", "livraison"] },
      { term: "itération", weight: 4.0, variants: ["itératif", "répétition"] },
      { term: "amélioration", weight: 3.5, variants: ["améliorer", "optimisation"] },
      { term: "évolution", weight: 3.8, variants: ["évoluer", "progression"] }
    ]
  },
  PROCESS_BASED: {
    keywords: [
      { term: "processus", weight: 4.5, variants: ["process", "procédure"] },
      { term: "workflow", weight: 4.2, variants: ["flux", "étapes"] },
      { term: "procédure", weight: 4.0, variants: ["protocole", "méthode"] },
      { term: "qualification", weight: 3.8, variants: ["qualifier", "validation"] },
      { term: "vente", weight: 3.5, variants: ["commercial", "sales"] }
    ]
  },
  RESOURCE_BASED: {
    keywords: [
      { term: "équipe", weight: 4.5, variants: ["équipes", "team"] },
      { term: "ressource", weight: 4.2, variants: ["ressources", "rh"] },
      { term: "allocation", weight: 4.0, variants: ["allouer", "répartition"] },
      { term: "planning", weight: 3.5, variants: ["planification", "agenda"] },
      { term: "agence", weight: 3.8, variants: ["studio", "société"] }
    ]
  }
})

/**
 * Recharge les mots-clés (utile pour le développement)
 */
export const reloadKeywords = () => {
  keywordsCache = null
  return loadKeywords()
}

/**
 * Récupère les structures par défaut
 * @returns {Object}
 */
export const getDefaultStructures = () => ({
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
})