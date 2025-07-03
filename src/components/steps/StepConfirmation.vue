<template>
  <div class="space-y-8">
    <!-- Success Header -->
    <div class="text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        🎉 Analyse terminée avec succès !
      </h2>
      <p class="text-gray-600 max-w-2xl mx-auto">
        Votre structure personnalisée a été générée. Consultez vos recommandations ci-dessous.
      </p>
    </div>

    <!-- Results Summary -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Context Analysis -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          🎯 Analyse de votre contexte
        </h3>
        
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Type détecté:</span>
            <span class="context-badge" :class="contextBadgeClass">
              {{ formatContextType(formStore.detectedContext) }}
            </span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Confiance:</span>
            <div class="flex items-center">
              <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  class="h-2 rounded-full transition-all duration-500"
                  :class="confidenceColorClass"
                  :style="{ width: `${formStore.confidence}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium">{{ formStore.confidence }}%</span>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Mode utilisé:</span>
            <span class="text-sm font-medium">{{ getModeLabel(formStore.detectionMode) }}</span>
          </div>
          
          <div v-if="formStore.isHybrid" class="flex items-center justify-between">
            <span class="text-gray-600">Type secondaire:</span>
            <span class="text-sm text-orange-600">{{ formatContextType(formStore.secondaryType) }}</span>
          </div>
        </div>
      </div>

      <!-- Generated Structure -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          📋 Votre structure optimale
        </h3>
        
        <div class="grid grid-cols-2 gap-2">
          <div 
            v-for="(column, index) in finalStructureColumns" 
            :key="column.id || index"
            class="bg-gray-50 rounded-lg p-3 text-center border"
            :class="getColumnColorClass(column.color)"
          >
            <div class="w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1"
                 :class="getColumnIconClass(column.color)">
              <span class="text-xs font-bold">{{ index + 1 }}</span>
            </div>
            <div class="text-sm font-medium text-gray-900">{{ column.name }}</div>
            <div v-if="column.description" class="text-xs text-gray-500 mt-1">{{ column.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div class="card bg-blue-50 border-blue-200">
      <h3 class="text-lg font-medium text-blue-900 mb-4">
        💡 Recommandations personnalisées
      </h3>
      
      <div class="space-y-3">
        <div v-for="(recommendation, index) in recommendations" :key="index" class="flex items-start">
          <span class="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
            <span class="text-blue-600 text-xs font-bold">{{ index + 1 }}</span>
          </span>
          <p class="text-blue-800 text-sm">{{ recommendation }}</p>
        </div>
      </div>
    </div>

    <!-- Next Steps -->
    <div class="card bg-green-50 border-green-200">
      <h3 class="text-lg font-medium text-green-900 mb-4">
        🚀 Prochaines étapes suggérées
      </h3>
      
      <div class="space-y-3">
        <div v-for="(step, index) in nextSteps" :key="index" class="flex items-start">
          <span class="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
            <span class="text-green-600 text-xs font-bold">{{ index + 1 }}</span>
          </span>
          <p class="text-green-800 text-sm">{{ step }}</p>
        </div>
      </div>
    </div>

    <!-- Performance Metrics (if available) -->
    <div v-if="showMetrics" class="card bg-gray-50">
      <h3 class="text-lg font-medium text-gray-900 mb-4">
        ⚡ Métriques de performance
      </h3>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-indigo-600">{{ formStore.analysisTime || 0 }}ms</div>
          <div class="text-xs text-gray-600">Temps d'analyse</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-green-600">
            {{ (formStore.costTracking.totalCost * 1000).toFixed(2) }}m€
          </div>
          <div class="text-xs text-gray-600">Coût total</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-purple-600">
            {{ Object.keys(formStore.adaptiveAnswers).length }}
          </div>
          <div class="text-xs text-gray-600">Questions répondues</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-orange-600">
            {{ finalStructureColumns.length }}
          </div>
          <div class="text-xs text-gray-600">Colonnes générées</div>
        </div>
      </div>
    </div>

    <!-- Email Confirmation -->
    <div v-if="formStore.userInfo.email" class="card bg-yellow-50 border-yellow-200">
      <div class="flex items-start">
        <svg class="h-5 w-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <div>
          <h4 class="text-sm font-medium text-yellow-800 mb-1">📧 Email de confirmation</h4>
          <p class="text-sm text-yellow-700">
            Un résumé détaillé de votre analyse sera envoyé à 
            <strong>{{ formStore.userInfo.email }}</strong> dans les prochaines minutes.
          </p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
      <button
        @click="$emit('prev')"
        class="btn-secondary w-full sm:w-auto"
      >
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Modifier mes informations
      </button>

      <div class="flex flex-col sm:flex-row gap-3">
        <button
          @click="generateWorkspace"
          class="btn-primary"
        >
          🚀 Générer l'espace de travail
        </button>
        
        <router-link
          to="/workspace-update"
          class="btn-secondary text-center"
        >
          🔄 Mettre à jour un espace existant
        </router-link>
        
        <a 
          href="/analytics"
          class="btn-secondary text-center"
          target="_blank"
        >
          📊 Voir les analytics
        </a>
        
        <button
          @click="$emit('restart')"
          class="btn-secondary"
        >
          🔄 Nouvelle analyse
        </button>
      </div>
    </div>

    <!-- Footer Links -->
    <div class="text-center text-sm text-gray-500 pt-8 border-t border-gray-200">
      <p class="mb-2">
        Merci d'avoir utilisé INDX Flow ! 
        <span v-if="formStore.userInfo.newsletter">Vous recevrez nos conseils d'organisation par email.</span>
      </p>
      <div class="flex justify-center space-x-4">
        <a href="#" class="text-indigo-600 hover:text-indigo-800">Partager sur LinkedIn</a>
        <a href="#" class="text-indigo-600 hover:text-indigo-800">Partager sur Twitter</a>
        <a href="#" class="text-indigo-600 hover:text-indigo-800">Feedback</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFormStore } from '../../stores/formStore.js'

// Emits
const emit = defineEmits(['prev', 'restart'])

// Store
const formStore = useFormStore()

// Computed
const contextBadgeClass = computed(() => {
  const typeClasses = {
    CLIENT_BASED: 'client',
    TEMPORAL: 'temporal',
    PHASED: 'phased',
    VERSIONED: 'versioned',
    PROCESS_BASED: 'process',
    RESOURCE_BASED: 'resource'
  }
  
  return typeClasses[formStore.detectedContext] || ''
})

const confidenceColorClass = computed(() => {
  const confidence = formStore.confidence
  if (confidence >= 85) return 'bg-green-500'
  if (confidence >= 70) return 'bg-blue-500'
  if (confidence >= 50) return 'bg-yellow-500'
  return 'bg-orange-500'
})

const showMetrics = computed(() => {
  return formStore.analysisTime > 0 || formStore.costTracking.totalCost > 0
})

const recommendations = computed(() => {
  const baseRecommendations = {
    CLIENT_BASED: [
      'Organisez vos projets par client pour une meilleure visibilité',
      'Utilisez des étiquettes pour identifier les types de projets par client',
      'Planifiez des revues régulières avec chaque client',
      'Créez des templates de projet pour vos clients récurrents'
    ],
    TEMPORAL: [
      'Définissez des cycles de travail cohérents et respectez-les',
      'Planifiez des rétrospectives à la fin de chaque cycle',
      'Utilisez des métriques de vélocité pour améliorer vos estimations',
      'Maintenez un backlog priorisé et régulièrement mis à jour'
    ],
    PHASED: [
      'Définissez clairement les critères de passage entre phases',
      'Documentez les livrables attendus pour chaque phase',
      'Planifiez des points de validation avec les parties prenantes',
      'Créez des checklists pour chaque phase de vos projets'
    ],
    VERSIONED: [
      'Adoptez un schéma de versioning cohérent et communiquez-le',
      'Documentez les changements dans un changelog détaillé',
      'Planifiez des releases régulières avec des objectifs clairs',
      'Maintenez une roadmap produit accessible à tous'
    ],
    PROCESS_BASED: [
      'Documentez clairement chaque étape du processus',
      'Identifiez et éliminez les goulots d\'étranglement',
      'Mesurez les temps de traitement pour optimiser l\'efficacité',
      'Formez votre équipe sur les bonnes pratiques processus'
    ],
    RESOURCE_BASED: [
      'Équilibrez la charge de travail entre toutes les ressources',
      'Identifiez et développez les compétences clés de chaque ressource',
      'Planifiez la montée en compétences selon les besoins futurs',
      'Créez une matrice de compétences pour optimiser les affectations'
    ]
  }
  
  return baseRecommendations[formStore.detectedContext] || baseRecommendations.CLIENT_BASED
})

const nextSteps = computed(() => {
  const baseSteps = {
    CLIENT_BASED: [
      'Listez tous vos clients actifs et créez une colonne pour chacun',
      'Migrez vos projets en cours dans les colonnes appropriées',
      'Utilisez des étiquettes colorées pour catégoriser les types de tâches',
      'Planifiez des revues hebdomadaires par client pour le suivi'
    ],
    TEMPORAL: [
      'Définissez la durée optimale de vos cycles selon votre contexte',
      'Créez votre premier cycle avec les tâches les plus prioritaires',
      'Planifiez une rétrospective en fin de cycle pour ajuster',
      'Mesurez votre vélocité pour améliorer vos estimations futures'
    ],
    PHASED: [
      'Cartographiez toutes les phases de vos projets types',
      'Définissez les critères de passage et les livrables par phase',
      'Créez des templates pour vos différents types de projets',
      'Implémentez un système de validation entre phases'
    ],
    VERSIONED: [
      'Choisissez et documentez votre schéma de versioning',
      'Planifiez les fonctionnalités des 3 prochaines versions',
      'Mettez en place un processus de release automatisé',
      'Créez une roadmap publique pour vos utilisateurs'
    ],
    PROCESS_BASED: [
      'Documentez votre processus étape par étape avec des flowcharts',
      'Identifiez les responsables et les délais pour chaque étape',
      'Implémentez des métriques de suivi pour chaque étape',
      'Formez votre équipe aux bonnes pratiques du processus'
    ],
    RESOURCE_BASED: [
      'Créez un inventaire complet de vos ressources et compétences',
      'Implémentez un système d\'équilibrage de la charge de travail',
      'Planifiez les formations et montées en compétences nécessaires',
      'Créez des processus de backup pour les compétences critiques'
    ]
  }
  
  return baseSteps[formStore.detectedContext] || baseSteps.CLIENT_BASED
})

const finalStructureColumns = computed(() => {
  // Gérer les deux formats possibles : ancien (tableau de chaînes) et nouveau (objet avec columns)
  const structure = formStore.structurePreview
  
  if (!structure) {
    return [
      { id: 'col-1', name: 'À faire', description: 'Tâches à réaliser', color: 'blue' },
      { id: 'col-2', name: 'En cours', description: 'Tâches en progress', color: 'amber' },
      { id: 'col-3', name: 'En attente', description: 'Tâches en attente', color: 'purple' },
      { id: 'col-4', name: 'Terminé', description: 'Tâches complétées', color: 'green' }
    ]
  }
  
  // Nouveau format avec colonnes détaillées
  if (structure.columns && Array.isArray(structure.columns)) {
    console.log('📋 [CONFIRMATION] Structure avec colonnes détaillées:', structure.columns)
    return structure.columns
  }
  
  // Ancien format : simple tableau de chaînes
  if (Array.isArray(structure)) {
    console.log('📋 [CONFIRMATION] Structure simple (tableau):', structure)
    return structure.map((name, index) => ({
      id: `col-${index}`,
      name,
      description: `Colonne ${index + 1}`,
      color: ['blue', 'amber', 'purple', 'green'][index % 4]
    }))
  }
  
  console.warn('⚠️ [CONFIRMATION] Format de structure non reconnu:', structure)
  return []
})

// Methods
const formatContextType = (type) => {
  const formats = {
    CLIENT_BASED: 'Organisation par clients',
    TEMPORAL: 'Organisation temporelle',
    PHASED: 'Organisation par phases',
    VERSIONED: 'Organisation par versions',
    PROCESS_BASED: 'Organisation par processus',
    RESOURCE_BASED: 'Organisation par ressources'
  }
  return formats[type] || type
}

const getModeLabel = (mode) => {
  const labels = {
    local: 'Analyse locale',
    ai: 'Intelligence artificielle',
    hybrid: 'Mode hybride'
  }
  return labels[mode] || mode
}

const getColumnColorClass = (color) => {
  const colorClasses = {
    red: 'hover:border-red-300 hover:bg-red-50',
    blue: 'hover:border-blue-300 hover:bg-blue-50',
    green: 'hover:border-green-300 hover:bg-green-50',
    yellow: 'hover:border-yellow-300 hover:bg-yellow-50',
    purple: 'hover:border-purple-300 hover:bg-purple-50',
    amber: 'hover:border-amber-300 hover:bg-amber-50',
    emerald: 'hover:border-emerald-300 hover:bg-emerald-50',
    cyan: 'hover:border-cyan-300 hover:bg-cyan-50',
    indigo: 'hover:border-indigo-300 hover:bg-indigo-50',
    violet: 'hover:border-violet-300 hover:bg-violet-50',
    gray: 'hover:border-gray-300 hover:bg-gray-50'
  }
  return colorClasses[color] || 'hover:border-indigo-300 hover:bg-indigo-50'
}

const getColumnIconClass = (color) => {
  const iconClasses = {
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    violet: 'bg-violet-100 text-violet-600',
    gray: 'bg-gray-100 text-gray-600'
  }
  return iconClasses[color] || 'bg-indigo-100 text-indigo-600'
}

const generateWorkspace = async () => {
  try {
    // 0. PERSISTENCE: S'assurer que l'email utilisateur est sauvegardé
    if (formStore.userInfo.email) {
      try {
        localStorage.setItem('indx_user_email', formStore.userInfo.email)
        console.log('💾 [WORKSPACE] Email persisté pour future récupération:', formStore.userInfo.email)
      } catch (error) {
        console.warn('❌ [WORKSPACE] Erreur persistence email:', error)
      }
    }
    
    // 1. Sauvegarder l'analyse dans Supabase
    console.log('💾 [WORKSPACE] Sauvegarde de l\'analyse dans Supabase...')
    const analysisResult = await formStore.saveAnalysisToSupabase()
    
    let analysisId = null
    if (analysisResult.success) {
      analysisId = analysisResult.analysisId
      console.log('✅ [WORKSPACE] Analyse sauvegardée avec ID:', analysisId)
    } else {
      console.log('📦 [WORKSPACE] Mode local - Supabase non disponible')
    }

    // 2. Enrichir les données avec informations complètes d'analyse
    const workspaceData = {
      // ID de l'analyse pour référence
      analysisId: analysisId,
      
      // Informations de base du projet
      projectName: formStore.userInfo.projectName || 
                  formStore.userInfo.businessSector || 
                  'Nouveau Projet',
      
      // Contextes détectés avec détails complets
      detectedContext: formStore.detectedContext,
      detectedContexts: formStore.detectedContexts || [],
      primaryContextData: formStore.fullAnalysisResult?.analysis?.detectedContexts?.find(c => c.priority === 'primary'),
      
      // Structure et configuration
      structure: formStore.structurePreview || [],
      confidence: formStore.confidence,
      isHybrid: formStore.isHybrid,
      secondaryType: formStore.secondaryType,
      
      // Réponses adaptatives pour personnalisation
      adaptiveAnswers: formStore.adaptiveAnswers || {},
      
      // Données utilisateur complètes
      userInfo: {
        ...formStore.userInfo,
        businessSector: formStore.userInfo.businessSector,
        email: formStore.userInfo.email,
        newsletter: formStore.userInfo.newsletter
      },
      
      // Résultat d'analyse complet pour référence future
      analysisResult: formStore.fullAnalysisResult,
      
      // Métadonnées
      detectionMode: formStore.detectionMode,
      analysisTime: formStore.analysisTime,
      costTracking: formStore.costTracking,
      timestamp: new Date().toISOString(),
      
      // Configuration workspace intelligente
      workspaceConfig: {
        autoGenerateTasks: true,
        useContextualColumns: true,
        enableIntelligentSuggestions: true,
        projectType: determineProjectType(formStore.detectedContext, formStore.detectedContexts),
        estimatedComplexity: calculateProjectComplexity(formStore.adaptiveAnswers, formStore.confidence),
        persistenceEnabled: !!analysisId
      }
    }

    // 3. Créer le workspace dans Supabase si possible
    if (analysisId) {
      console.log('🏗️ [WORKSPACE] Création du workspace dans Supabase...')
      const workspaceResult = await formStore.createWorkspaceFromAnalysis(analysisId)
      
      if (workspaceResult.success) {
        workspaceData.workspaceId = workspaceResult.workspaceId
        workspaceData.supabaseWorkspace = workspaceResult.workspace
        console.log('✅ [WORKSPACE] Workspace créé avec ID:', workspaceResult.workspaceId)
      }
    }
    
    // 4. Sauvegarder dans sessionStorage pour transmission à l'espace de travail
    sessionStorage.setItem('workspaceAnalysis', JSON.stringify(workspaceData))
    
    console.log('🚀 [WORKSPACE] Données enrichies sauvegardées:', {
      projectName: workspaceData.projectName,
      contexts: workspaceData.detectedContexts?.length || 0,
      answers: Object.keys(workspaceData.adaptiveAnswers).length,
      config: workspaceData.workspaceConfig,
      analysisId: analysisId,
      workspaceId: workspaceData.workspaceId
    })
    
    // 5. Navigation vers l'espace de travail
    window.open('/workspace', '_blank')
    
  } catch (error) {
    console.error('❌ [WORKSPACE] Erreur lors de la génération:', error)
    
    // En cas d'erreur, continuer en mode local
    const fallbackData = {
      projectName: formStore.userInfo.projectName || 'Nouveau Projet',
      detectedContext: formStore.detectedContext,
      structure: formStore.structurePreview || [],
      userInfo: formStore.userInfo,
      workspaceConfig: { 
        projectType: 'GENERIC',
        persistenceEnabled: false,
        fallbackMode: true
      }
    }
    
    sessionStorage.setItem('workspaceAnalysis', JSON.stringify(fallbackData))
    window.open('/workspace', '_blank')
  }
}

const determineProjectType = (primaryContext, allContexts) => {
  // Déterminer le type de projet pour optimiser la génération
  const contextCombination = allContexts?.map(c => c.type).sort().join('_') || primaryContext
  
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
  
  return projectTypes[contextCombination] || projectTypes[primaryContext] || 'GENERIC'
}

const calculateProjectComplexity = (answers, confidence) => {
  // Calculer complexité estimée pour adapter les suggestions
  let complexity = 'MEDIUM'
  
  if (confidence < 60) complexity = 'HIGH' // Incertitude = complexité
  else if (confidence > 85) complexity = 'LOW' // Confiance élevée = cas standard
  
  // Ajuster selon les réponses adaptatives
  const answerCount = Object.keys(answers || {}).length
  if (answerCount > 5) complexity = 'HIGH'
  else if (answerCount < 3) complexity = 'LOW'
  
  return complexity
}
</script>