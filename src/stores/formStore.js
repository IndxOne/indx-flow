import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseService } from '../services/supabase.js'

export const useFormStore = defineStore('form', () => {
  // État du formulaire
  const currentStep = ref(1)
  const maxSteps = ref(5)
  const userInput = ref('')
  const detectionMode = ref('hybrid') // 'local', 'ai', 'hybrid'
  const detectedContext = ref(null)
  const confidence = ref(0)
  const isHybrid = ref(false)
  const detectedContexts = ref([]) // Nouveau: support contextes multiples
  const fullAnalysisResult = ref(null) // Nouveau: résultat complet de l'analyse
  const adaptiveAnswers = ref({})
  const structurePreview = ref(null)
  const userInfo = ref({
    email: '',
    sector: '',
    preferences: {}
  })
  
  // Analytics
  const analysisStartTime = ref(null)
  const analysisEndTime = ref(null)
  const usedAI = ref(false)
  const costTracking = ref({
    localAnalysis: 0,
    aiAnalysis: 0,
    totalCost: 0
  })

  // Getters
  const progress = computed(() => (currentStep.value / maxSteps.value) * 100)
  const canProceed = computed(() => {
    switch (currentStep.value) {
      case 1:
        return userInput.value.length >= 10 && detectedContext.value
      case 2:
        return Object.keys(adaptiveAnswers.value).length > 0
      case 3:
        return structurePreview.value !== null
      case 4:
        return userInfo.value.email && userInfo.value.sector
      default:
        return true
    }
  })
  
  const analysisTime = computed(() => {
    if (!analysisStartTime.value || !analysisEndTime.value) return 0
    return analysisEndTime.value - analysisStartTime.value
  })

  // Actions
  const nextStep = () => {
    if (currentStep.value < maxSteps.value && canProceed.value) {
      currentStep.value++
    }
  }

  const prevStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  const setDetectedContext = (context, conf, hybrid = false, mode = 'local') => {
    detectedContext.value = context
    confidence.value = conf
    isHybrid.value = hybrid
    usedAI.value = mode === 'ai' || mode === 'hybrid'
    
    // Tracking des coûts
    if (mode === 'ai') {
      costTracking.value.aiAnalysis += 0.002 // ~0.002€ par analyse Claude
    }
    costTracking.value.localAnalysis += 0.00001 // Coût computationnel local
    costTracking.value.totalCost = costTracking.value.aiAnalysis + costTracking.value.localAnalysis
  }

  // Nouvelle méthode pour sauvegarder l'analyse complète avec contextes multiples
  const setFullAnalysisResult = (analysisResult) => {
    fullAnalysisResult.value = analysisResult
    
    // Rétrocompatibilité : mise à jour des anciennes propriétés
    detectedContext.value = analysisResult.primaryType
    confidence.value = analysisResult.confidence
    isHybrid.value = analysisResult.isHybrid
    
    // Nouveau : sauvegarde des contextes multiples
    detectedContexts.value = analysisResult.detectedContexts || []
    
    // Tracking du mode utilisé
    usedAI.value = analysisResult.method === 'ai' || analysisResult.method === 'hybrid'
  }

  const startAnalysis = () => {
    analysisStartTime.value = Date.now()
  }

  const endAnalysis = () => {
    analysisEndTime.value = Date.now()
  }

  const resetForm = () => {
    currentStep.value = 1
    userInput.value = ''
    detectedContext.value = null
    confidence.value = 0
    isHybrid.value = false
    detectedContexts.value = [] // Reset contextes multiples
    fullAnalysisResult.value = null // Reset analyse complète
    adaptiveAnswers.value = {}
    structurePreview.value = null
    userInfo.value = { email: '', sector: '', preferences: {} }
    analysisStartTime.value = null
    analysisEndTime.value = null
    usedAI.value = false
    costTracking.value = { localAnalysis: 0, aiAnalysis: 0, totalCost: 0 }
  }

  const updateAdaptiveAnswer = (key, value) => {
    adaptiveAnswers.value[key] = value
  }

  const setStructurePreview = (structure) => {
    structurePreview.value = structure
  }

  const updateUserInfo = (info) => {
    userInfo.value = { ...userInfo.value, ...info }
  }

  // ================================================================
  // PERSISTANCE SUPABASE
  // ================================================================

  const saveAnalysisToSupabase = async () => {
    if (!supabaseService.isEnabled) {
      console.log('📦 [STORE] Supabase désactivé - pas de sauvegarde')
      return { success: false, reason: 'disabled' }
    }

    try {
      const analysisData = {
        userInput: userInput.value,
        detectedContext: detectedContext.value,
        detectedContexts: detectedContexts.value,
        confidence: confidence.value,
        adaptiveAnswers: adaptiveAnswers.value,
        structurePreview: structurePreview.value,
        userInfo: userInfo.value,
        analysisTime: analysisTime.value,
        costTracking: costTracking.value
      }

      const result = await supabaseService.saveContextAnalysis(analysisData)
      
      if (result.success) {
        console.log('✅ [STORE] Analyse sauvegardée avec ID:', result.data.id)
        return { success: true, analysisId: result.data.id }
      } else {
        console.error('❌ [STORE] Échec sauvegarde analyse:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('❌ [STORE] Erreur sauvegarde analyse:', error)
      return { success: false, error: error.message }
    }
  }

  const createWorkspaceFromAnalysis = async (analysisId) => {
    if (!supabaseService.isEnabled) {
      console.log('📦 [STORE] Supabase désactivé - workspace local uniquement')
      return { success: false, reason: 'disabled' }
    }

    try {
      const workspaceData = {
        analysisId: analysisId,
        projectName: userInfo.value.projectName || 
                    userInfo.value.businessSector || 
                    'Nouveau Projet',
        description: `Workspace généré automatiquement pour contexte ${detectedContext.value}`,
        structure: structurePreview.value || ['À faire', 'En cours', 'En révision', 'Terminé'],
        userInfo: userInfo.value,
        workspaceConfig: {
          projectType: determineProjectType(),
          autoGenerated: true,
          contextBased: detectedContext.value,
          multiContext: isHybrid.value
        }
      }

      const result = await supabaseService.createWorkspace(workspaceData)
      
      if (result.success) {
        console.log('✅ [STORE] Workspace créé avec ID:', result.data.id)
        return { success: true, workspaceId: result.data.id, workspace: result.data }
      } else {
        console.error('❌ [STORE] Échec création workspace:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('❌ [STORE] Erreur création workspace:', error)
      return { success: false, error: error.message }
    }
  }

  const getUserWorkspaces = async () => {
    if (!supabaseService.isEnabled || !userInfo.value.email) {
      return { success: false, data: [] }
    }

    try {
      const result = await supabaseService.getUserWorkspaces(userInfo.value.email)
      return result
    } catch (error) {
      console.error('❌ [STORE] Erreur récupération workspaces:', error)
      return { success: false, data: [] }
    }
  }

  const getAnalysisHistory = async (limit = 10) => {
    if (!supabaseService.isEnabled) {
      return { success: false, data: [] }
    }

    try {
      const result = await supabaseService.getAnalysisHistory(limit)
      return result
    } catch (error) {
      console.error('❌ [STORE] Erreur récupération historique:', error)
      return { success: false, data: [] }
    }
  }

  // Helper pour déterminer le type de projet
  const determineProjectType = () => {
    const contextCombination = detectedContexts.value?.map(c => c.type).sort().join('_') || detectedContext.value
    
    const projectTypes = {
      'CLIENT_BASED_PROCESS_BASED_RESOURCE_BASED': 'CONSULTANT_SI',
      'CLIENT_BASED_PROCESS_BASED_TEMPORAL': 'CONSULTANT_AGILE',
      'PHASED_PROCESS_BASED': 'PROJECT_MANAGEMENT',
      'TEMPORAL_VERSIONED': 'SOFTWARE_DEVELOPMENT',
      'CLIENT_BASED': 'CLIENT_SERVICES',
      'TEMPORAL': 'AGILE_TEAM',
      'PHASED': 'TRADITIONAL_PROJECT',
      'PROCESS_BASED': 'BUSINESS_PROCESS',
      'RESOURCE_BASED': 'RESOURCE_MANAGEMENT',
      'VERSIONED': 'PRODUCT_DEVELOPMENT'
    }
    
    return projectTypes[contextCombination] || projectTypes[detectedContext.value] || 'GENERIC'
  }

  return {
    // State
    currentStep,
    maxSteps,
    userInput,
    detectionMode,
    detectedContext,
    confidence,
    isHybrid,
    detectedContexts, // Nouveau: contextes multiples
    fullAnalysisResult, // Nouveau: analyse complète
    adaptiveAnswers,
    structurePreview,
    userInfo,
    analysisStartTime,
    analysisEndTime,
    usedAI,
    costTracking,
    
    // Getters
    progress,
    canProceed,
    analysisTime,
    
    // Actions
    nextStep,
    prevStep,
    setDetectedContext,
    setFullAnalysisResult, // Nouvelle action
    startAnalysis,
    endAnalysis,
    resetForm,
    updateAdaptiveAnswer,
    setStructurePreview,
    updateUserInfo,
    
    // Supabase Actions
    saveAnalysisToSupabase,
    createWorkspaceFromAnalysis,
    getUserWorkspaces,
    getAnalysisHistory
  }
})