import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3456'

console.log('🔧 [API INIT] Configuration API:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL: API_BASE_URL,
  env: import.meta.env
})

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

console.log('🔧 [API INIT] Instance axios créée avec baseURL:', api.defaults.baseURL)

// Intercepteurs pour gestion d'erreurs
api.interceptors.request.use(
  config => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.baseURL)
    return config
  },
  error => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  error => {
    console.error('API Error Details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    })
    return Promise.reject(error)
  }
)

export const contextApi = {
  // Analyse locale (sans IA)
  analyzeLocal: async (text) => {
    console.log('🔍 [API] Début analyzeLocal avec text:', text.substring(0, 50) + '...')
    console.log('🔍 [API] URL de base configurée:', API_BASE_URL)
    
    try {
      console.log('🔍 [API] Envoi requête POST vers /api/analyze/local')
      const response = await api.post('/api/analyze/local', { text })
      console.log('✅ [API] Réponse reçue analyzeLocal:', response.status, response.data)
      return response.data
    } catch (error) {
      console.error('❌ [API] Erreur analyzeLocal:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      })
      throw new Error('Erreur lors de l\'analyse locale: ' + error.message)
    }
  },

  // Analyse avec IA (Claude)
  analyzeWithAI: async (text) => {
    console.log('🔍 [API] Début analyzeWithAI avec text:', text.substring(0, 50) + '...')
    
    try {
      console.log('🔍 [API] Envoi requête POST vers /api/analyze/ai')
      const response = await api.post('/api/analyze/ai', { text })
      console.log('✅ [API] Réponse reçue analyzeWithAI:', response.status, response.data)
      return response.data
    } catch (error) {
      console.error('❌ [API] Erreur analyzeWithAI:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      })
      throw new Error('Erreur lors de l\'analyse IA: ' + error.message)
    }
  },

  // Analyse hybride (local + IA si nécessaire)
  analyzeHybrid: async (text) => {
    console.log('🔍 [API] Début analyzeHybrid avec text:', text.substring(0, 50) + '...')
    
    try {
      console.log('🔍 [API] Envoi requête POST vers /api/analyze/hybrid')
      const response = await api.post('/api/analyze/hybrid', { text })
      console.log('✅ [API] Réponse reçue analyzeHybrid:', response.status, response.data)
      return response.data
    } catch (error) {
      console.error('❌ [API] Erreur analyzeHybrid:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      })
      throw new Error('Erreur lors de l\'analyse hybride: ' + error.message)
    }
  },

  // Générer structure projet
  generateStructure: async (contextType, answers) => {
    try {
      const response = await api.post('/api/generate/structure', {
        contextType,
        answers
      })
      return response.data
    } catch (error) {
      throw new Error('Erreur lors de la génération de structure: ' + error.message)
    }
  },

  // Soumettre le formulaire complet
  submitForm: async (formData) => {
    try {
      const response = await api.post('/api/submit', formData)
      return response.data
    } catch (error) {
      throw new Error('Erreur lors de la soumission: ' + error.message)
    }
  },

  // Récupérer les statistiques
  getStats: async () => {
    try {
      const response = await api.get('/api/stats')
      return response.data
    } catch (error) {
      throw new Error('Erreur lors de la récupération des stats: ' + error.message)
    }
  },

  // Récupérer les métriques de coût
  getCostMetrics: async () => {
    try {
      const response = await api.get('/api/analytics/costs')
      return response.data
    } catch (error) {
      throw new Error('Erreur lors de la récupération des coûts: ' + error.message)
    }
  }
}

export default api