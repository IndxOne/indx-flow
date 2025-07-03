<template>
  <div class="smart-analysis">
    <!-- Input utilisateur -->
    <div class="mb-6">
      <textarea 
        v-model="userInput"
        @input="onInputChange"
        placeholder="Décrivez votre activité en quelques mots..."
        class="w-full h-32 p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-indigo-500 focus:outline-none"
        maxlength="500"
      />
      <div class="text-right mt-2">
        <span class="text-xs text-gray-400">{{ userInput.length }}/500</span>
      </div>
    </div>

    <!-- Bouton d'analyse intelligent -->
    <button 
      @click="startSmartAnalysis"
      :disabled="!canAnalyze"
      class="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
    >
      {{ analyzeButtonText }}
    </button>

    <!-- Progression d'analyse -->
    <div v-if="isAnalyzing" class="mt-6">
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex items-center mb-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-4"></div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ analysisStep.title }}</h3>
            <p class="text-sm text-gray-600">{{ analysisStep.description }}</p>
          </div>
        </div>
        
        <!-- Barre de progression -->
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-indigo-600 h-2 rounded-full transition-all duration-500"
            :style="{ width: `${analysisProgress}%` }"
          ></div>
        </div>
        
        <!-- Détails techniques (optionnel) -->
        <div v-if="showTechnicalDetails" class="mt-4 text-xs text-gray-500">
          <p>Mode: {{ analysisMode }} | Confidence: {{ confidence }}% | Source: {{ analysisSource }}</p>
        </div>
      </div>
    </div>

    <!-- Résultats d'analyse -->
    <div v-if="analysisComplete && !isAnalyzing" class="mt-6">
      <div class="bg-green-50 rounded-2xl p-6 mb-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Analyse {{ analysisQualityLabel }} terminée !</h3>
            <p class="text-sm text-gray-600">
              {{ analysisResultSummary }}
            </p>
          </div>
        </div>
      </div>

      <!-- Options de structures -->
      <div class="space-y-4">
        <div 
          v-for="option in structureOptions" 
          :key="option.id"
          class="card-hover bg-white rounded-2xl shadow-lg border border-gray-200 p-6 cursor-pointer"
          :class="{ 'border-indigo-500 bg-indigo-50': option.recommended }"
          @click="selectStructure(option)"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                 :class="option.recommended ? 'bg-indigo-100' : 'bg-gray-100'">
              <span class="text-2xl">{{ option.icon }}</span>
            </div>
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <h3 class="text-xl font-bold text-gray-900">{{ option.title }}</h3>
                <span v-if="option.recommended" class="ml-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                  Recommandé
                </span>
                <span class="ml-2 text-sm text-gray-500">({{ option.confidence }}% correspondance)</span>
              </div>
              <p class="text-gray-600 mb-4">{{ option.description }}</p>
              <div class="text-sm text-gray-500 mb-4">
                <strong>Structure:</strong> {{ option.structure.join(' → ') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFormStore } from '../stores/formStore.js'
import { contextApi } from '../services/api.js'

// Stores
const formStore = useFormStore()

// État réactif
const userInput = ref('')
const isAnalyzing = ref(false)
const analysisComplete = ref(false)
const analysisProgress = ref(0)
const analysisMode = ref('hybrid') // 'local', 'ai', 'hybrid'
const analysisSource = ref('')
const confidence = ref(0)
const analysisResult = ref(null)
const structureOptions = ref([])

// État des étapes d'analyse
const analysisSteps = {
  local: [
    { title: '⚡ Analyse locale', description: 'Traitement instantané de votre description' },
    { title: '✅ Terminé', description: 'Résultats générés localement' }
  ],
  ai: [
    { title: '🔍 Analyse contextuelle', description: 'Extraction des mots-clés et concepts métier' },
    { title: '🤖 IA Claude', description: 'Génération de recommandations personnalisées' },
    { title: '🎯 Optimisation', description: 'Adaptation des structures à votre profil' },
    { title: '✨ Finalisation', description: 'Préparation de vos options personnalisées' }
  ],
  hybrid: [
    { title: '⚡ Pré-analyse', description: 'Analyse locale rapide en cours' },
    { title: '🤖 Analyse IA', description: 'Amélioration de la précision avec l\'IA' },
    { title: '🎯 Fusion intelligente', description: 'Combinaison des meilleurs résultats' },
    { title: '✅ Optimisation', description: 'Finalisation de vos recommandations' }
  ]
}

const currentStepIndex = ref(0)
const showTechnicalDetails = ref(false) // Pour debug

// Computed
const canAnalyze = computed(() => userInput.value.length >= 10)

const analyzeButtonText = computed(() => {
  if (isAnalyzing.value) return 'Analyse en cours...'
  if (userInput.value.length < 10) return 'Saisissez au moins 10 caractères'
  if (userInput.value.length < 50) return '⚡ Analyse rapide'
  if (userInput.value.length < 150) return '🔍 Analyse standard'
  return '🤖 Analyse IA approfondie'
})

const analysisStep = computed(() => {
  const steps = analysisSteps[analysisMode.value] || []
  return steps[currentStepIndex.value] || { title: 'Analyse', description: 'En cours...' }
})

const analysisQualityLabel = computed(() => {
  switch (analysisSource.value) {
    case 'local': return 'rapide'
    case 'ai': return 'approfondie'
    case 'hybrid': return 'optimisée'
    default: return 'intelligente'
  }
})

const analysisResultSummary = computed(() => {
  if (!analysisResult.value) return ''
  
  const mode = analysisSource.value
  const conf = confidence.value
  
  if (mode === 'local') {
    return `Analyse locale effectuée en moins de 100ms avec ${conf}% de confiance.`
  } else if (mode === 'ai') {
    return `Analyse IA Claude complète avec ${conf}% de confiance et contexte détaillé.`
  } else {
    return `Analyse hybride optimisant vitesse et précision avec ${conf}% de confiance.`
  }
})

// Méthodes
const onInputChange = () => {
  // Reset si l'utilisateur modifie après analyse
  if (analysisComplete.value) {
    analysisComplete.value = false
    structureOptions.value = []
  }
}

const determineAnalysisMode = (text) => {
  // Logique de décision intelligente
  if (text.length < 50) {
    return 'local'
  } else if (text.length > 200 || /(?:consultant|manager|technical|complex|multiple|integration)/i.test(text)) {
    return 'ai'
  } else {
    return 'hybrid'
  }
}

const startSmartAnalysis = async () => {
  isAnalyzing.value = true
  analysisComplete.value = false
  analysisProgress.value = 0
  currentStepIndex.value = 0
  
  // Déterminer le mode d'analyse optimal
  analysisMode.value = determineAnalysisMode(userInput.value)
  
  try {
    // Progression simulée réaliste
    await runAnalysisWithProgress()
    
    // Finaliser
    analysisComplete.value = true
    isAnalyzing.value = false
    
  } catch (error) {
    console.error('Erreur analyse:', error)
    isAnalyzing.value = false
    // TODO: Gestion d'erreur UX
  }
}

const runAnalysisWithProgress = async () => {
  const steps = analysisSteps[analysisMode.value]
  const stepDuration = analysisMode.value === 'local' ? 200 : 800
  
  for (let i = 0; i < steps.length; i++) {
    currentStepIndex.value = i
    analysisProgress.value = ((i + 1) / steps.length) * 100
    
    // Simulation progression
    await new Promise(resolve => setTimeout(resolve, stepDuration))
    
    // Analyse réelle à la dernière étape
    if (i === steps.length - 1) {
      await performActualAnalysis()
    }
  }
}

const performActualAnalysis = async () => {
  try {
    let result
    
    if (analysisMode.value === 'local') {
      // Analyse locale uniquement
      result = await contextApi.analyzeLocal(userInput.value)
      analysisSource.value = 'local'
    } else if (analysisMode.value === 'ai') {
      // Analyse IA uniquement
      result = await contextApi.analyzeAI(userInput.value)
      analysisSource.value = 'ai'
    } else {
      // Analyse hybride
      result = await contextApi.analyzeHybrid(userInput.value)
      analysisSource.value = result.source || 'hybrid'
    }
    
    if (result.success) {
      analysisResult.value = result.analysis
      confidence.value = result.analysis.confidence || 75
      generateStructureOptions(result.analysis)
    } else {
      throw new Error(result.error || 'Analyse échouée')
    }
    
  } catch (error) {
    console.error('Erreur analyse:', error)
    // Fallback sur analyse locale
    const fallbackResult = await contextApi.analyzeLocal(userInput.value)
    analysisResult.value = fallbackResult.analysis
    analysisSource.value = 'local_fallback'
    confidence.value = fallbackResult.analysis.confidence || 60
    generateStructureOptions(fallbackResult.analysis)
  }
}

const generateStructureOptions = (analysis) => {
  // Générer 2-3 options de structures basées sur l'analyse
  const options = []
  
  // Option principale (recommandée)
  options.push({
    id: 'primary',
    title: getStructureTitle(analysis.detectedContext),
    icon: getStructureIcon(analysis.detectedContext),
    description: getStructureDescription(analysis.detectedContext),
    structure: getStructureColumns(analysis.detectedContext),
    confidence: analysis.confidence,
    recommended: true,
    contextType: analysis.detectedContext
  })
  
  // Option alternative si contextes multiples
  if (analysis.detectedContexts && analysis.detectedContexts.length > 1) {
    const secondaryContext = analysis.detectedContexts[1]
    options.push({
      id: 'secondary',
      title: getStructureTitle(secondaryContext.type),
      icon: getStructureIcon(secondaryContext.type),
      description: getStructureDescription(secondaryContext.type),
      structure: getStructureColumns(secondaryContext.type),
      confidence: secondaryContext.confidence,
      recommended: false,
      contextType: secondaryContext.type
    })
  }
  
  // Option personnalisée
  options.push({
    id: 'custom',
    title: 'Structure Personnalisée',
    icon: '🎨',
    description: 'Créez votre propre organisation de A à Z selon vos besoins spécifiques.',
    structure: ['Colonne 1', 'Colonne 2', 'Colonne 3', 'Colonne 4'],
    confidence: 100,
    recommended: false,
    contextType: 'CUSTOM'
  })
  
  structureOptions.value = options
}

const selectStructure = (option) => {
  // Émettre l'événement de sélection vers le parent
  emit('structure-selected', {
    option,
    analysisResult: analysisResult.value,
    userInput: userInput.value
  })
}

// Helpers pour génération options
const getStructureTitle = (contextType) => {
  const titles = {
    'CLIENT_BASED': 'Organisation par Clients',
    'TEMPORAL': 'Organisation par Sprints',
    'PHASED': 'Organisation par Phases',
    'PROCESS_BASED': 'Organisation par Processus',
    'RESOURCE_BASED': 'Organisation par Équipes',
    'VERSIONED': 'Organisation par Versions'
  }
  return titles[contextType] || 'Organisation Standard'
}

const getStructureIcon = (contextType) => {
  const icons = {
    'CLIENT_BASED': '🏢',
    'TEMPORAL': '⚡',
    'PHASED': '📊',
    'PROCESS_BASED': '🔄',
    'RESOURCE_BASED': '👥',
    'VERSIONED': '🚀'
  }
  return icons[contextType] || '📋'
}

const getStructureDescription = (contextType) => {
  const descriptions = {
    'CLIENT_BASED': 'Idéal pour gérer plusieurs clients avec des projets distincts. Chaque client a son espace dédié.',
    'TEMPORAL': 'Perfect pour cycles de développement agiles avec sprints définis et backlog organisé.',
    'PHASED': 'Conçu pour projets séquentiels avec phases distinctes et livrables précis.',
    'PROCESS_BASED': 'Optimisé pour workflows avec étapes de validation et processus standardisés.',
    'RESOURCE_BASED': 'Pensé pour coordination d\'équipes et allocation optimale des ressources.',
    'VERSIONED': 'Adapté au développement produit avec releases et versions planifiées.'
  }
  return descriptions[contextType] || 'Structure flexible adaptable à vos besoins.'
}

const getStructureColumns = (contextType) => {
  const columns = {
    'CLIENT_BASED': ['🎯 Prospects', '🏢 Client A', '🏭 Client B', '📦 Terminés'],
    'TEMPORAL': ['📋 Backlog', '⚡ Sprint Actuel', '🔄 En Review', '✅ Terminé'],
    'PHASED': ['🔍 Analyse', '⚙️ Réalisation', '🧪 Tests', '🚀 Déploiement'],
    'PROCESS_BASED': ['📥 Nouveau', '🔄 En cours', '👀 Validation', '✅ Terminé'],
    'RESOURCE_BASED': ['👥 Équipe A', '👨‍💻 Équipe B', '🆘 Support', '🏁 Terminé'],
    'VERSIONED': ['💡 Idées', '🚧 v1.0', '🔄 v1.1', '🚀 Released']
  }
  return columns[contextType] || ['À faire', 'En cours', 'Review', 'Terminé']
}

// Événements
const emit = defineEmits(['structure-selected'])

// Watch pour debugging
watch(analysisMode, (newMode) => {
  console.log('🔍 Mode d\'analyse:', newMode)
})

watch(analysisProgress, (newProgress) => {
  console.log('📊 Progression:', `${newProgress}%`)
})
</script>

<style scoped>
.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
</style>