import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseService } from '../services/supabase.js'
import { MissionStructureService } from '../services/missionStructures.js'

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
  const selectedStructureType = ref(null) // Nouveau: type de structure choisie par l'utilisateur
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
        return selectedStructureType.value !== null
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
    
    // Conserver l'email sauvegardé lors du reset pour UX
    const savedEmail = loadEmailFromStorage()
    userInfo.value = { 
      email: savedEmail || '', 
      sector: '', 
      preferences: {} 
    }
    
    analysisStartTime.value = null
    analysisEndTime.value = null
    usedAI.value = false
    costTracking.value = { localAnalysis: 0, aiAnalysis: 0, totalCost: 0 }
  }

  // Helper pour charger l'email depuis localStorage
  const loadEmailFromStorage = () => {
    try {
      return localStorage.getItem('indx_user_email') || ''
    } catch (error) {
      console.warn('❌ [STORE] Erreur lecture email localStorage:', error)
      return ''
    }
  }
  
  // Initialisation du store avec email persisté
  const initializeStore = () => {
    const savedEmail = loadEmailFromStorage()
    if (savedEmail && !userInfo.value.email) {
      userInfo.value.email = savedEmail
      console.log('🔄 [STORE] Email initialisé depuis localStorage:', savedEmail)
    }
  }

  const updateAdaptiveAnswer = (key, value) => {
    adaptiveAnswers.value[key] = value
  }

  const setStructurePreview = (structure) => {
    // Si c'est un simple tableau de noms, le convertir en structure complète
    if (Array.isArray(structure)) {
      console.log('📝 [STORE] Conversion tableau vers structure complète:', structure)
      structurePreview.value = {
        columns: structure.map((name, index) => ({
          id: `col-${index}`,
          name,
          description: `Colonne ${index + 1}`,
          color: ['blue', 'green', 'amber', 'purple'][index % 4],
          defaultTasks: []
        })),
        metadata: {
          type: 'CUSTOM',
          description: 'Structure personnalisée par l\'utilisateur'
        },
        source: 'user_input',
        generatedAt: new Date().toISOString()
      }
    } else {
      // Structure complète déjà fournie
      console.log('📋 [STORE] Structure complète fournie:', structure)
      structurePreview.value = structure
    }
  }

  const updateUserInfo = (info) => {
    userInfo.value = { ...userInfo.value, ...info }
    
    // PERSISTENCE: Sauvegarder l'email automatiquement dans localStorage
    if (info.email && info.email.includes('@')) {
      try {
        localStorage.setItem('indx_user_email', info.email)
        console.log('💾 [STORE] Email auto-sauvegardé:', info.email)
      } catch (error) {
        console.warn('❌ [STORE] Erreur auto-sauvegarde email:', error)
      }
    }
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

  const getUserWorkspaces = async (emailOverride = null) => {
    if (!supabaseService.isEnabled) {
      console.log('📦 [STORE] Supabase désactivé')
      return { success: false, error: 'Supabase non disponible', data: [] }
    }

    const email = emailOverride || userInfo.value.email
    if (!email) {
      console.warn('⚠️ [STORE] Aucun email utilisateur disponible. userInfo:', userInfo.value)
      return { 
        success: false, 
        error: 'Email utilisateur requis pour charger les espaces', 
        data: [] 
      }
    }

    console.log('📧 [STORE] Chargement workspaces pour email:', email)

    try {
      const result = await supabaseService.getUserWorkspaces(email)
      console.log('📋 [STORE] Résultat getUserWorkspaces:', result)
      return result
    } catch (error) {
      console.error('❌ [STORE] Erreur récupération workspaces:', error)
      return { success: false, error: error.message, data: [] }
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

  const updateExistingWorkspace = async (workspaceId, options = {}) => {
    if (!supabaseService.isEnabled) {
      console.log('📦 [STORE] Supabase désactivé - pas de mise à jour possible')
      return { success: false, reason: 'disabled' }
    }

    try {
      console.log('🔄 [STORE] Mise à jour workspace:', workspaceId, 'avec structure:', structurePreview.value)

      // Préparer les données de mise à jour (uniquement colonnes standard Supabase)
      const updates = {}

      // Mettre à jour les colonnes si on a une structure
      if (structurePreview.value) {
        if (structurePreview.value.columns && Array.isArray(structurePreview.value.columns)) {
          // Nouveau format avec colonnes détaillées
          updates.columns = structurePreview.value.columns.map(col => col.name)
          console.log('🏗️ [STORE] Mise à jour avec colonnes détaillées:', updates.columns)
        } else if (Array.isArray(structurePreview.value)) {
          // Ancien format : simple tableau
          updates.columns = structurePreview.value
          console.log('🏗️ [STORE] Mise à jour avec tableau simple:', updates.columns)
        }
      }

      // Mettre à jour le nom si spécifié (colonne 'name' existe dans Supabase)
      if (options.name && options.name.trim()) {
        updates.name = options.name.trim()
      }

      // Mettre à jour la description si spécifiée (colonne 'description' existe dans Supabase)
      if (options.description && options.description.trim()) {
        updates.description = options.description.trim()
      }

      // Validation : s'assurer qu'on a au moins une mise à jour
      if (Object.keys(updates).length === 0) {
        return { 
          success: false, 
          error: 'Aucune donnée à mettre à jour' 
        }
      }

      console.log('📝 [STORE] Updates à appliquer:', updates)

      const result = await supabaseService.updateWorkspace(workspaceId, updates)
      
      if (result.success) {
        console.log('✅ [STORE] Workspace mis à jour avec succès:', result.data.id)
        return { 
          success: true, 
          workspaceId: result.data.id, 
          workspace: result.data,
          updatedColumns: updates.columns 
        }
      } else {
        console.error('❌ [STORE] Échec mise à jour workspace:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('❌ [STORE] Erreur mise à jour workspace:', error)
      return { success: false, error: error.message }
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

  // Profil et mission context
  const profileContext = ref({
    profileId: null,
    missionId: null,
    suggestedStructure: null,
    suggestedContexts: null
  })

  const setProfileContext = (context) => {
    profileContext.value = { ...context }
    
    // Pré-remplir certains champs si on a un contexte mission
    if (context.suggestedContexts && context.suggestedContexts.length > 0) {
      // Utiliser le premier contexte suggéré par défaut
      detectedContext.value = context.suggestedContexts[0]
      confidence.value = 85 // Confiance élevée car c'est une suggestion basée sur le profil
    }
    
    if (context.suggestedStructure) {
      structurePreview.value = {
        columns: context.suggestedStructure,
        source: 'profile_mission'
      }
    }
    
    console.log('✅ [STORE] Contexte profil configuré:', context)
  }

  const clearProfileContext = () => {
    profileContext.value = {
      profileId: null,
      missionId: null,
      suggestedStructure: null,
      suggestedContexts: null
    }
  }

  // Génération de structure spécialisée
  const generateSpecializedStructure = () => {
    try {
      let structure = null
      
      // Utiliser le contexte profil/mission si disponible
      if (profileContext.value.profileId) {
        console.log('🏗️ [STORE] Génération structure spécialisée:', profileContext.value)
        
        structure = MissionStructureService.generateMissionStructure(
          profileContext.value.profileId,
          profileContext.value.missionId,
          {
            detectedContext: detectedContext.value,
            userInput: userInput.value,
            confidence: confidence.value,
            detectedContexts: detectedContexts.value
          }
        )
      } else {
        // Fallback sur structure générique basée sur contexte détecté
        console.log('🏗️ [STORE] Génération structure générique pour contexte:', detectedContext.value)
        
        structure = MissionStructureService.generateGenericStructure({
          detectedContext: detectedContext.value,
          userInput: userInput.value,
          confidence: confidence.value
        })
      }
      
      if (structure) {
        structurePreview.value = {
          ...structure,
          source: profileContext.value.profileId ? 'specialized_mission' : 'generic_context',
          generatedAt: new Date().toISOString()
        }
        
        console.log('✅ [STORE] Structure spécialisée générée:', structurePreview.value)
        return { success: true, structure: structurePreview.value }
      } else {
        throw new Error('Aucune structure générée')
      }
      
    } catch (error) {
      console.error('❌ [STORE] Erreur génération structure spécialisée:', error)
      
      // Fallback sur structure par défaut
      structurePreview.value = MissionStructureService.generateDefaultStructure()
      return { success: false, error: error.message, structure: structurePreview.value }
    }
  }

  // Helper pour obtenir les tâches par défaut d'une colonne
  const getColumnDefaultTasks = (columnId) => {
    if (!structurePreview.value?.columns) return []
    
    const column = structurePreview.value.columns.find(col => col.id === columnId)
    return column?.defaultTasks || []
  }

  // Helper pour obtenir les métadonnées de la structure
  const getStructureMetadata = () => {
    return structurePreview.value?.metadata || {
      type: 'UNKNOWN',
      description: 'Structure non définie',
      contexts: []
    }
  }

  // Initialiser le store avec l'email persisté
  initializeStore()

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
    selectedStructureType, // Nouveau: type de structure sélectionnée
    adaptiveAnswers,
    structurePreview,
    userInfo,
    analysisStartTime,
    analysisEndTime,
    usedAI,
    costTracking,
    profileContext, // Nouveau: contexte profil/mission
    
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
    
    // Profile Actions
    setProfileContext,
    clearProfileContext,
    
    // Structure Generation
    generateSpecializedStructure,
    getColumnDefaultTasks,
    getStructureMetadata,
    
    // Persistence Actions
    initializeStore,
    loadEmailFromStorage,
    
    // Supabase Actions
    saveAnalysisToSupabase,
    createWorkspaceFromAnalysis,
    getUserWorkspaces,
    getAnalysisHistory,
    updateExistingWorkspace // Nouvelle action pour mise à jour
  }
})