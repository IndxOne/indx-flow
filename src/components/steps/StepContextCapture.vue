<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        Décrivez votre projet ou activité
      </h2>
      <p class="text-gray-600 max-w-2xl mx-auto">
        Expliquez en quelques phrases votre contexte de travail, vos objectifs ou votre domaine d'activité. 
        Notre intelligence va détecter automatiquement le type d'organisation optimal.
      </p>
    </div>

    <!-- Mode Indicator -->
    <div class="flex justify-center">
      <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        <component :is="modeIcon" class="w-3 h-3 mr-1" />
        Mode {{ modeLabel }}
      </div>
    </div>

    <!-- Textarea -->
    <div class="space-y-4">
      <div>
        <label for="context-input" class="block text-sm font-medium text-gray-700 mb-2">
          Votre contexte
        </label>
        <textarea
          id="context-input"
          v-model="userInput"
          @input="onTextChange"
          @paste="onTextChange"
          placeholder="Exemple: Je suis consultant et je gère plusieurs clients simultanément. J'ai besoin d'organiser mes projets par client avec un suivi des livrables et des échéances..."
          class="form-input min-h-32 resize-y"
          :class="textareaClass"
          maxlength="2000"
        />
        
        <!-- Character count -->
        <div class="flex justify-between items-center mt-2 text-xs">
          <span :class="characterCountClass">
            {{ userInput.length }}/2000 caractères
            <span v-if="userInput.length < 10" class="text-orange-600">
              (minimum 10 caractères)
            </span>
          </span>
          
          <!-- Real-time detection indicator -->
          <div v-if="isAnalyzing" class="flex items-center text-indigo-600">
            <svg class="animate-spin -ml-1 mr-2 h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyse en cours...
          </div>
        </div>
      </div>

      <!-- Live Detection Results -->
      <div v-if="detectionResult && !isAnalyzing" class="space-y-4">
        <!-- Detected Context -->
        <div class="p-4 rounded-lg border-2 transition-all duration-300"
             :class="confidenceColorClass">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ hasMultipleContexts ? 'Contextes détectés' : 'Contexte détecté' }}
            </h3>
            <div class="flex items-center space-x-3">
              <span class="context-badge text-sm px-3 py-1.5 font-medium rounded-full" :class="contextBadgeClass">
                {{ formatContextType(detectionResult.primaryType) }}
              </span>
              <div class="text-right">
                <div class="text-lg font-bold" :class="confidenceTextClass">
                  {{ Math.min(detectionResult.confidence, 100) }}%
                </div>
                <div class="text-xs text-gray-500 mb-1">confiance</div>
                <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500" 
                       :class="confidenceBarClass"
                       :style="{ width: `${Math.min(detectionResult.confidence, 100)}%` }">
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mb-4">
            <p class="text-sm font-medium text-gray-900 mb-1">
              Type {{ formatContextType(detectionResult.primaryType) }} détecté avec {{ Math.min(detectionResult.confidence, 100) }}% de correspondance
            </p>
            <p class="text-sm text-gray-600">
              {{ detectionResult.reasoning || 'Votre description correspond parfaitement à ce type d\'organisation.' }}
            </p>
          </div>

          <!-- Multiple Contexts Display -->
          <div v-if="hasMultipleContexts" class="mt-3 space-y-2">
            <h4 class="text-sm font-medium text-gray-900 mb-2">
              🎯 Votre profil multi-contextes :
            </h4>
            <div class="grid gap-2">
              <div v-for="context in detectedContextsList" 
                   :key="context.type"
                   class="flex items-center justify-between p-2 rounded-lg border transition-all"
                   :class="getContextCardClass(context.priority)">
                <div class="flex items-center space-x-2">
                  <span class="context-badge text-xs" :class="getContextBadgeClass(context.type)">
                    {{ formatContextType(context.type) }}
                  </span>
                  <span class="text-xs px-2 py-1 rounded-full font-medium"
                        :class="getPriorityClass(context.priority)">
                    {{ formatPriority(context.priority) }}
                  </span>
                </div>
                <div class="text-right">
                  <span class="text-sm font-medium" :class="getConfidenceClass(context.confidence)">
                    {{ context.confidence }}%
                  </span>
                  <div class="text-xs text-gray-500">
                    Poids: {{ Math.round(context.weight * 100) }}%
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Multi-Context Explanation -->
            <div class="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <div class="flex items-center mb-1">
                <svg class="h-4 w-4 text-indigo-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-medium text-indigo-800">Profil multi-dimensionnel détecté</span>
              </div>
              <p class="text-xs text-indigo-700 mb-3">
                Votre activité combine {{ detectedContextsList.length }} types d'organisation. 
                La structure générée reflétera cette complexité en privilégiant le contexte principal 
                <strong>{{ formatContextType(detectionResult.primaryType) }}</strong> 
                tout en tenant compte des autres dimensions.
              </p>

              <!-- Sliders de pondération pour personnalisation -->
              <div v-if="showWeightAdjustment" class="mt-3 pt-3 border-t border-indigo-200">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-medium text-indigo-800">🎛️ Ajuster les priorités</span>
                  <button 
                    @click="resetWeights"
                    class="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Réinitialiser
                  </button>
                </div>
                <div class="space-y-2">
                  <div v-for="(context, index) in adjustableContexts" 
                       :key="context.type"
                       class="flex items-center space-x-2">
                    <div class="min-w-0 flex-1">
                      <label class="text-xs text-indigo-700 font-medium">
                        {{ formatContextType(context.type) }}
                      </label>
                      <input 
                        type="range" 
                        :value="context.adjustedWeight * 100"
                        @input="updateContextWeight(index, $event.target.value)"
                        min="0" 
                        max="100" 
                        step="5"
                        class="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer slider"
                        :class="getSliderClass(context.type)"
                      >
                    </div>
                    <span class="text-xs font-medium text-indigo-800 min-w-fit">
                      {{ Math.round(context.adjustedWeight * 100) }}%
                    </span>
                  </div>
                </div>
                <p class="text-xs text-indigo-600 mt-2">
                  💡 Ajustez selon vos priorités. La structure s'adaptera automatiquement.
                </p>
              </div>

              <!-- Bouton pour activer/désactiver les sliders -->
              <div class="mt-2 text-center">
                <button 
                  @click="toggleWeightAdjustment"
                  class="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {{ showWeightAdjustment ? '🔧 Masquer personnalisation' : '🎛️ Personnaliser les priorités' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Legacy Hybrid Detection (fallback) -->
          <div v-else-if="detectionResult.isHybrid" class="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div class="flex items-center mb-1">
              <svg class="h-4 w-4 text-yellow-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm font-medium text-yellow-800">Contexte hybride détecté</span>
            </div>
            <p class="text-xs text-yellow-700">
              Votre activité pourrait aussi s'organiser selon le type 
              <strong>{{ formatContextType(detectionResult.secondaryType) }}</strong>
            </p>
          </div>

          <!-- Analysis Method Info -->
          <div class="mt-3 flex items-center justify-between text-xs text-gray-500">
            <div class="flex items-center space-x-4">
              <span>Méthode: {{ getMethodLabel(detectionResult.method) }}</span>
              <span v-if="detectionResult.analysisTime">
                Temps: {{ detectionResult.analysisTime }}ms
              </span>
              <span v-if="detectionResult.cost">
                Coût: {{ (detectionResult.cost * 1000).toFixed(2) }}m€
              </span>
            </div>
            
            <!-- Confidence breakdown for hybrid -->
            <div v-if="detectionResult.method === 'hybrid' && detectionResult.localConfidence">
              <span class="text-blue-600">Local: {{ detectionResult.localConfidence }}%</span>
              <span v-if="detectionResult.aiConfidence" class="ml-2 text-purple-600">
                IA: {{ detectionResult.aiConfidence }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Examples/Tips -->
        <div v-if="contextExamples" class="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <svg class="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Exemples d'organisation {{ formatContextType(detectionResult.primaryType) }}
          </h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div v-for="example in contextExamples" :key="example" 
                 class="flex items-center p-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <span class="w-2 h-2 bg-indigo-500 rounded-full mr-2 flex-shrink-0"></span>
              <span class="text-xs font-medium text-gray-700">{{ example }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="analysisError" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <svg class="h-4 w-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm text-red-800">{{ analysisError }}</span>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-center pt-6">
      <button
        @click="handleNext"
        :disabled="!canProceed"
        class="btn-primary-large disabled:opacity-50 disabled:cursor-not-allowed"
        :class="canProceed ? 'hover:scale-105 hover:shadow-lg' : ''"
      >
        <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        Continuer
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useFormStore } from '../../stores/formStore.js'
import { contextApi } from '../../services/api.js'

// Emits
const emit = defineEmits(['next'])

// Store
const formStore = useFormStore()

// State
const userInput = ref(formStore.userInput)
const isAnalyzing = ref(false)
const analysisError = ref('')
const detectionResult = ref(formStore.detectedContext ? {
  primaryType: formStore.detectedContext,
  confidence: formStore.confidence,
  isHybrid: formStore.isHybrid
} : null)

// État pour les sliders de pondération
const showWeightAdjustment = ref(false)
const adjustableContexts = ref([])
const originalWeights = ref([])

let analysisTimeout = null

// Computed
const modeIcon = computed(() => {
  const icons = {
    local: { template: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" /></svg>' },
    ai: { template: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0z" /></svg>' },
    hybrid: { template: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" /></svg>' }
  }
  return icons[formStore.detectionMode] || icons.hybrid
})

const modeLabel = computed(() => {
  const labels = {
    local: 'Local',
    ai: 'IA',
    hybrid: 'Hybride'
  }
  return labels[formStore.detectionMode] || 'Hybride'
})

const textareaClass = computed(() => {
  const base = 'form-input min-h-32 resize-y'
  if (analysisError.value) return `${base} border-red-300 focus:border-red-500 focus:ring-red-500`
  if (detectionResult.value && detectionResult.value.confidence >= 70) {
    return `${base} border-green-300 focus:border-green-500 focus:ring-green-500`
  }
  return base
})

const characterCountClass = computed(() => {
  if (userInput.value.length >= 2000) return 'text-red-600'
  if (userInput.value.length < 10) return 'text-orange-600'
  return 'text-gray-500'
})

const confidenceColorClass = computed(() => {
  if (!detectionResult.value) return 'border-gray-200 bg-gray-50'
  
  const confidence = detectionResult.value.confidence
  if (confidence >= 85) return 'border-green-300 bg-green-50'
  if (confidence >= 70) return 'border-blue-300 bg-blue-50'
  if (confidence >= 50) return 'border-yellow-300 bg-yellow-50'
  return 'border-orange-300 bg-orange-50'
})

const confidenceTextClass = computed(() => {
  if (!detectionResult.value) return 'text-gray-600'
  
  const confidence = detectionResult.value.confidence
  if (confidence >= 85) return 'text-green-700'
  if (confidence >= 70) return 'text-blue-700'
  if (confidence >= 50) return 'text-yellow-700'
  return 'text-orange-700'
})

const confidenceBarClass = computed(() => {
  if (!detectionResult.value) return 'bg-gray-400'
  
  const confidence = detectionResult.value.confidence
  if (confidence >= 85) return 'bg-green-500'
  if (confidence >= 70) return 'bg-blue-500'
  if (confidence >= 50) return 'bg-yellow-500'
  return 'bg-orange-500'
})

const contextBadgeClass = computed(() => {
  if (!detectionResult.value) return ''
  
  const typeClasses = {
    CLIENT_BASED: 'client',
    TEMPORAL: 'temporal',
    PHASED: 'phased',
    VERSIONED: 'versioned',
    PROCESS_BASED: 'process',
    RESOURCE_BASED: 'resource'
  }
  
  return typeClasses[detectionResult.value.primaryType] || ''
})

const contextExamples = computed(() => {
  if (!detectionResult.value) return null
  
  const examples = {
    CLIENT_BASED: ['Client A → Projets', 'Client B → Tâches', 'Prospects', 'Archives'],
    TEMPORAL: ['Sprint 1', 'Sprint 2', 'Backlog', 'Rétrospectives'],
    PHASED: ['Conception', 'Développement', 'Tests', 'Déploiement'],
    VERSIONED: ['v1.0', 'v1.1', 'v2.0', 'Idées futures'],
    PROCESS_BASED: ['Lead', 'Qualification', 'Négociation', 'Signature'],
    RESOURCE_BASED: ['Équipe Design', 'Équipe Dev', 'Équipe Marketing', 'Support']
  }
  
  return examples[detectionResult.value.primaryType] || null
})

const canProceed = computed(() => {
  return userInput.value.length >= 10 && 
         detectionResult.value && 
         detectionResult.value.confidence >= 30 &&
         !isAnalyzing.value
})

// Multi-contexts computed
const hasMultipleContexts = computed(() => {
  return detectionResult.value?.detectedContexts && 
         detectionResult.value.detectedContexts.length > 1
})

const detectedContextsList = computed(() => {
  return detectionResult.value?.detectedContexts || []
})

// Methods
const formatContextType = (type) => {
  const formats = {
    CLIENT_BASED: 'Organisation par clients',
    TEMPORAL: 'Organisation temporelle',
    PHASED: 'Organisation par phases',
    VERSIONED: 'Organisation par versions',
    PROCESS_BASED: 'Organisation par processus',
    RESOURCE_BASED: 'Organisation par ressources',
    GENERIC: 'Organisation générique'
  }
  return formats[type] || type
}

const getMethodLabel = (method) => {
  const labels = {
    local: 'Analyse locale',
    ai: 'Intelligence artificielle',
    hybrid: 'Analyse hybride',
    local_fallback: 'Local (IA indisponible)',
    local_forced: 'Local (forcé)',
    local_sufficient: 'Local (suffisant)'
  }
  return labels[method] || method
}

// Multi-contexts methods
const formatPriority = (priority) => {
  const labels = {
    primary: 'Principal',
    strong: 'Fort',
    medium: 'Moyen', 
    weak: 'Faible',
    secondary: 'Secondaire'
  }
  return labels[priority] || priority
}

const getContextBadgeClass = (contextType) => {
  const typeClasses = {
    CLIENT_BASED: 'client',
    TEMPORAL: 'temporal',
    PHASED: 'phased',
    VERSIONED: 'versioned',
    PROCESS_BASED: 'process',
    RESOURCE_BASED: 'resource'
  }
  return typeClasses[contextType] || ''
}

const getPriorityClass = (priority) => {
  const classes = {
    primary: 'bg-indigo-100 text-indigo-800',
    strong: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    weak: 'bg-gray-100 text-gray-800',
    secondary: 'bg-blue-100 text-blue-800'
  }
  return classes[priority] || 'bg-gray-100 text-gray-800'
}

const getContextCardClass = (priority) => {
  const classes = {
    primary: 'border-indigo-300 bg-indigo-50',
    strong: 'border-green-300 bg-green-50',
    medium: 'border-yellow-300 bg-yellow-50',
    weak: 'border-gray-300 bg-gray-50',
    secondary: 'border-blue-300 bg-blue-50'
  }
  return classes[priority] || 'border-gray-300 bg-gray-50'
}

const getConfidenceClass = (confidence) => {
  if (confidence >= 70) return 'text-green-700'
  if (confidence >= 50) return 'text-yellow-700'
  if (confidence >= 30) return 'text-orange-700'
  return 'text-red-700'
}

// Méthodes pour les sliders de pondération
const initializeAdjustableContexts = () => {
  if (!detectionResult.value?.detectedContexts) return
  
  adjustableContexts.value = detectionResult.value.detectedContexts.map(context => ({
    ...context,
    adjustedWeight: context.weight || 1.0
  }))
  
  // Sauvegarder les poids originaux pour réinitialisation
  originalWeights.value = adjustableContexts.value.map(c => c.weight || 1.0)
}

const toggleWeightAdjustment = () => {
  showWeightAdjustment.value = !showWeightAdjustment.value
  
  if (showWeightAdjustment.value && adjustableContexts.value.length === 0) {
    initializeAdjustableContexts()
  }
}

const updateContextWeight = (index, value) => {
  if (!adjustableContexts.value[index]) return
  
  adjustableContexts.value[index].adjustedWeight = parseFloat(value) / 100
  
  // Mettre à jour le store avec les nouveaux poids
  updateFormStoreWithAdjustedWeights()
}

const resetWeights = () => {
  adjustableContexts.value.forEach((context, index) => {
    context.adjustedWeight = originalWeights.value[index] || 1.0
  })
  
  updateFormStoreWithAdjustedWeights()
}

const updateFormStoreWithAdjustedWeights = () => {
  // Mettre à jour le store avec les contextes ajustés
  const adjustedContexts = adjustableContexts.value.map(context => ({
    ...context,
    weight: context.adjustedWeight,
    // Recalculer la confidence basée sur le nouveau poids
    confidence: Math.round(context.confidence * (context.adjustedWeight / (context.weight || 1.0)))
  }))
  
  // Trier par poids ajusté (décroissant)
  adjustedContexts.sort((a, b) => b.adjustedWeight - a.adjustedWeight)
  
  // Mettre à jour le contexte principal si nécessaire
  const newPrimaryType = adjustedContexts[0].type
  const newPrimaryConfidence = adjustedContexts[0].confidence
  
  if (formStore.detectedContext !== newPrimaryType) {
    formStore.setDetectedContext(
      newPrimaryType,
      newPrimaryConfidence,
      adjustedContexts.length > 1,
      detectionResult.value.method
    )
    
    // Mettre à jour aussi le résultat affiché
    detectionResult.value = {
      ...detectionResult.value,
      primaryType: newPrimaryType,
      confidence: newPrimaryConfidence,
      detectedContexts: adjustedContexts
    }
  }
  
  // Mettre à jour les contextes dans le store
  formStore.setFullAnalysisResult({
    ...detectionResult.value,
    detectedContexts: adjustedContexts
  })
}

const getSliderClass = (contextType) => {
  const sliderClasses = {
    CLIENT_BASED: 'slider-emerald',
    TEMPORAL: 'slider-amber', 
    PHASED: 'slider-blue',
    VERSIONED: 'slider-purple',
    PROCESS_BASED: 'slider-rose',
    RESOURCE_BASED: 'slider-indigo'
  }
  return sliderClasses[contextType] || 'slider-indigo'
}

const analyzeText = async (text) => {
  console.log('🚀 [COMPONENT] Début analyzeText avec:', {
    textLength: text.length,
    textPreview: text.substring(0, 100) + '...',
    detectionMode: formStore.detectionMode
  })

  if (text.length < 10) {
    console.log('⚠️ [COMPONENT] Texte trop court, pas d\'analyse')
    detectionResult.value = null
    analysisError.value = ''
    return
  }

  try {
    console.log('🔄 [COMPONENT] Début de l\'analyse...')
    isAnalyzing.value = true
    analysisError.value = ''
    formStore.startAnalysis()

    let result
    console.log('🎯 [COMPONENT] Mode de détection:', formStore.detectionMode)
    
    switch (formStore.detectionMode) {
      case 'local':
        console.log('📍 [COMPONENT] Appel analyzeLocal...')
        result = await contextApi.analyzeLocal(text)
        break
      case 'ai':
        console.log('🤖 [COMPONENT] Appel analyzeWithAI...')
        result = await contextApi.analyzeWithAI(text)
        break
      case 'hybrid':
      default:
        console.log('⚡ [COMPONENT] Appel analyzeHybrid...')
        result = await contextApi.analyzeHybrid(text)
        break
    }

    console.log('🎉 [COMPONENT] Résultat reçu:', result)

    if (result.success) {
      console.log('✅ [COMPONENT] Analyse réussie, mise à jour du state')
      detectionResult.value = result.analysis
      
      // Nouvelle méthode : sauvegarde de l'analyse complète avec contextes multiples
      formStore.setFullAnalysisResult(result.analysis)
      
      // Ancienne méthode conservée pour rétrocompatibilité
      formStore.setDetectedContext(
        result.analysis.primaryType,
        result.analysis.confidence,
        result.analysis.isHybrid,
        result.analysis.method
      )
      
      // Réinitialiser les sliders avec les nouveaux contextes
      if (result.analysis.detectedContexts && result.analysis.detectedContexts.length > 1) {
        showWeightAdjustment.value = false // Reset l'état d'affichage
        adjustableContexts.value = [] // Reset pour forcer la réinitialisation
      }
      
      formStore.endAnalysis()
    } else {
      console.error('❌ [COMPONENT] Résultat en erreur:', result.error)
      throw new Error(result.error || 'Erreur d\'analyse')
    }

  } catch (error) {
    console.error('💥 [COMPONENT] Exception dans analyzeText:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    analysisError.value = error.message || 'Erreur lors de l\'analyse du contexte'
    detectionResult.value = null
  } finally {
    console.log('🏁 [COMPONENT] Fin de l\'analyse, nettoyage...')
    isAnalyzing.value = false
  }
}

const onTextChange = () => {
  formStore.userInput = userInput.value

  // Debounce analysis
  if (analysisTimeout) {
    clearTimeout(analysisTimeout)
  }

  if (userInput.value.length >= 10) {
    analysisTimeout = setTimeout(() => {
      analyzeText(userInput.value)
    }, 800) // 800ms debounce
  } else {
    detectionResult.value = null
    analysisError.value = ''
  }
}

const handleNext = () => {
  if (canProceed.value) {
    emit('next')
  }
}

// Lifecycle
onMounted(() => {
  // Si on revient sur cette étape avec du contenu existant
  if (userInput.value.length >= 10 && !detectionResult.value) {
    analyzeText(userInput.value)
  }
})

// Watch for external changes
watch(() => formStore.detectionMode, () => {
  if (userInput.value.length >= 10) {
    analyzeText(userInput.value)
  }
})
</script>