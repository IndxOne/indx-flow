import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
    updateUserInfo
  }
})