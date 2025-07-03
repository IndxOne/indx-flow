<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        Votre structure optimale
      </h2>
      <p class="text-gray-600 max-w-2xl mx-auto">
        <span v-if="hasMultipleContexts">
          Basée sur votre profil multi-contextes :
          <span class="block mt-2 space-x-2">
            <span v-for="context in formStore.detectedContexts" 
                  :key="context.type"
                  class="context-badge text-xs" 
                  :class="getContextBadgeClass(context.type)">
              {{ formatContextType(context.type) }}
            </span>
          </span>
          <span class="block mt-2">Structure hybride optimisée pour votre activité :</span>
        </span>
        <span v-else>
          Basée sur votre contexte
          <span class="context-badge" :class="contextBadgeClass">
            {{ formatContextType(formStore.detectedContext) }}
          </span>
          voici la structure de colonnes recommandée :
        </span>
      </p>
    </div>

    <!-- Generated Structure Preview -->
    <div class="card bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">
          📋 Structure générée
        </h3>
        <div v-if="structureMetadata" class="text-right">
          <div class="text-sm text-indigo-600 font-medium">{{ structureMetadata.type }}</div>
          <div class="text-xs text-gray-500">{{ structureMetadata.description }}</div>
        </div>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div 
          v-for="(column, index) in specializedColumns" 
          :key="column.id || index"
          class="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-indigo-300 transition-colors"
          :class="getColumnColorClass(column.color)"
        >
          <div class="text-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2"
                 :class="getColumnIconClass(column.color)">
              <span class="font-bold">{{ index + 1 }}</span>
            </div>
            <h4 class="font-medium text-gray-900 mb-1">{{ column.name }}</h4>
            <p class="text-xs text-gray-500">{{ column.description || `Colonne ${index + 1}` }}</p>
            
            <!-- Nombre de tâches par défaut -->
            <div v-if="column.defaultTasks?.length" class="mt-2">
              <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {{ column.defaultTasks.length }} tâche{{ column.defaultTasks.length > 1 ? 's' : '' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Métadonnées structure spécialisée -->
      <div v-if="structureMetadata && structureMetadata.estimatedDuration" class="border-t pt-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div class="flex items-center space-x-2">
            <span class="text-gray-500">⏱️ Durée estimée :</span>
            <span class="font-medium text-gray-900">{{ structureMetadata.estimatedDuration }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-gray-500">🎯 Contextes :</span>
            <span class="font-medium text-gray-900">{{ structureMetadata.contexts?.join(', ') }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-gray-500">📊 Type :</span>
            <span class="font-medium text-gray-900">{{ formatStructureType(structureMetadata.type) }}</span>
          </div>
        </div>
      </div>

      <!-- Regenerate Button -->
      <div class="text-center">
        <button 
          @click="regenerateStructure"
          :disabled="isRegenerating"
          class="btn-secondary text-sm"
        >
          <svg v-if="isRegenerating" class="animate-spin h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isRegenerating ? 'Génération...' : '🔄 Régénérer la structure' }}
        </button>
      </div>
    </div>

    <!-- Customization Options -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium text-gray-900">
        ✨ Personnalisation (optionnel)
      </h3>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="(column, index) in editableStructure" :key="index">
          <label :for="`column-${index}`" class="block text-sm font-medium text-gray-700 mb-1">
            Colonne {{ index + 1 }}
          </label>
          <input 
            :id="`column-${index}`"
            v-model="editableStructure[index]"
            type="text"
            class="form-input text-sm"
            :placeholder="currentStructure[index]"
          />
        </div>
      </div>
      
      <div class="flex justify-between items-center text-sm text-gray-600">
        <span>Vous pouvez personnaliser les noms des colonnes</span>
        <button 
          @click="resetToDefault"
          class="text-indigo-600 hover:text-indigo-800"
        >
          Remettre par défaut
        </button>
      </div>
    </div>

    <!-- Usage Tips -->
    <div class="card bg-blue-50 border-blue-200">
      <h4 class="text-sm font-medium text-blue-900 mb-2">
        💡 Conseils d'utilisation
      </h4>
      <ul class="text-sm text-blue-800 space-y-1">
        <li v-for="tip in usageTips" :key="tip" class="flex items-start">
          <span class="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
          {{ tip }}
        </li>
      </ul>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-between pt-4">
      <button
        @click="$emit('prev')"
        class="btn-secondary"
      >
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Retour
      </button>

      <button
        @click="handleNext"
        class="btn-primary"
      >
        Valider cette structure
        <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFormStore } from '../../stores/formStore.js'
import { contextApi } from '../../services/api.js'

// Emits
const emit = defineEmits(['next', 'prev'])

// Store
const formStore = useFormStore()

// State
const isRegenerating = ref(false)
const editableStructure = ref(['', '', '', ''])

// Computed
const hasMultipleContexts = computed(() => {
  return formStore.detectedContexts && formStore.detectedContexts.length > 1
})

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

const currentStructure = computed(() => {
  return formStore.structurePreview?.columns?.map(col => col.name) || getDefaultStructure()
})

const specializedColumns = computed(() => {
  return formStore.structurePreview?.columns || []
})

const structureMetadata = computed(() => {
  return formStore.getStructureMetadata()
})

const usageTips = computed(() => {
  // Conseils spécialisés pour contextes multiples
  if (hasMultipleContexts.value) {
    const contexts = formStore.detectedContexts
    const primaryContext = contexts[0]
    
    // Conseils spéciaux pour votre profil consultant SI
    if (primaryContext.type === 'PROCESS_BASED' && 
        contexts.some(c => c.type === 'CLIENT_BASED') && 
        contexts.some(c => c.type === 'RESOURCE_BASED')) {
      return [
        '📋 Projets Clients : Missions actives par client prioritaire',
        '⚙️ Maintenance SI : Tâches récurrentes et préventives',
        '🔧 Support Tech : Incidents et demandes urgentes',
        '📊 Pilotage/Contrats : Suivi contractuel et gouvernance'
      ]
    }
    
    // Conseils hybrides génériques
    return [
      `Combinez ${formatContextType(primaryContext.type)} avec ${formatContextType(contexts[1]?.type)}`,
      'Adaptez la structure selon vos priorités du moment',
      'Maintenez l\'équilibre entre tous vos contextes',
      'Utilisez les colonnes selon votre workflow principal'
    ]
  }
  
  // Conseils pour contexte unique
  const tips = {
    CLIENT_BASED: [
      'Créez une colonne par client principal',
      'Utilisez la dernière colonne pour les prospects',
      'Organisez les tâches par priorité client'
    ],
    TEMPORAL: [
      'Respectez la chronologie de vos cycles',
      'Planifiez les tâches dans le cycle approprié',
      'Utilisez la dernière colonne pour le backlog'
    ],
    PHASED: [
      'Chaque colonne représente une phase distincte',
      'Validez avant de passer à la phase suivante',
      'Documentez les livrables par phase'
    ],
    VERSIONED: [
      'Organisez par ordre de priorité de version',
      'Planifiez vos releases à l\'avance',
      'Gardez un backlog d\'idées futures'
    ],
    PROCESS_BASED: [
      'Respectez l\'ordre logique du processus',
      'Définissez les critères de passage',
      'Mesurez les temps par étape'
    ],
    RESOURCE_BASED: [
      'Équilibrez la charge entre ressources',
      'Assignez selon les compétences',
      'Prévoyez une colonne pour les urgences'
    ]
  }
  
  return tips[formStore.detectedContext] || tips.CLIENT_BASED
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

const getDefaultStructure = () => {
  // Structure hybride pour contextes multiples
  if (hasMultipleContexts.value) {
    return generateHybridStructure()
  }
  
  // Structure standard pour contexte unique
  const defaults = {
    CLIENT_BASED: ['Client A', 'Client B', 'Client C', 'Prospects'],
    TEMPORAL: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Backlog'],
    PHASED: ['Conception', 'Réalisation', 'Tests', 'Déploiement'],
    VERSIONED: ['v1.0.0', 'v1.1.0', 'v2.0.0', 'Backlog'],
    PROCESS_BASED: ['Lead', 'Qualification', 'Proposition', 'Signature'],
    RESOURCE_BASED: ['Jean (Designer)', 'Marie (Dev)', 'Paul (PM)', 'Ressources Libres']
  }
  
  return defaults[formStore.detectedContext] || defaults.CLIENT_BASED
}

const generateHybridStructure = () => {
  const contexts = formStore.detectedContexts
  if (!contexts || contexts.length === 0) return ['À faire', 'En cours', 'En attente', 'Terminé']
  
  // Debug: logging des contextes DÉTAILLÉ
  console.log('🔍 [STRUCTURE] Contextes détectés COMPLET:', contexts)
  console.log('🔍 [STRUCTURE] Contextes résumé:', contexts.map(c => ({ type: c.type, priority: c.priority, confidence: c.confidence })))
  
  // Structures spécialisées pour votre profil consultant SI
  const primaryContext = contexts[0]
  const secondaryContext = contexts[1]
  
  const hasClientBased = contexts.some(c => c.type === 'CLIENT_BASED')
  const hasResourceBased = contexts.some(c => c.type === 'RESOURCE_BASED')
  
  console.log('🔍 [STRUCTURE] Vérifications:', { 
    primaryType: primaryContext.type, 
    hasClientBased, 
    hasResourceBased 
  })
  
  // Cas spécial: Profils techniques SI/ERP
  const hasProcessBased = contexts.some(c => c.type === 'PROCESS_BASED')
  
  // PROFIL 1: Consultant SI complet (PROCESS + CLIENT + RESOURCE)
  if (hasProcessBased && hasClientBased && hasResourceBased) {
    console.log('✅ [STRUCTURE] Profil consultant SI détecté ! Génération structure spécialisée')
    console.log('🎯 [STRUCTURE] Combinaison trouvée: PROCESS + CLIENT + RESOURCE')
    return [
      '📋 Projets Clients',  // CLIENT_BASED
      '⚙️ Maintenance SI',   // PROCESS_BASED
      '🔧 Support Tech',     // RESOURCE_BASED + PROCESS
      '📊 Pilotage/Contrats' // PROCESS_BASED
    ]
  }
  
  // PROFIL 2: Technicien SI ERP (PROCESS + RESOURCE, sans CLIENT dominant)
  if (hasProcessBased && hasResourceBased && primaryContext.type === 'PROCESS_BASED') {
    console.log('✅ [STRUCTURE] Profil technicien SI/ERP détecté ! Structure projet ERP')
    console.log('🎯 [STRUCTURE] Combinaison trouvée: PROCESS (primary) + RESOURCE')
    return [
      '🎯 Analyse & Spécification',  // Phase analyse
      '⚙️ Paramétrage & Config',     // Phase réalisation  
      '🧪 Tests & Validation',       // Phase tests
      '🚀 Formation & Go-Live'       // Phase déploiement
    ]
  }
  
  // PROFIL 3: Projet avec phases (PROCESS + autres contextes)
  if (hasProcessBased && primaryContext.type === 'PROCESS_BASED') {
    console.log('✅ [STRUCTURE] Profil projet processus détecté ! Structure par étapes')
    console.log('🎯 [STRUCTURE] PROCESS_BASED avec contextes:', contexts.map(c => c.type))
    return [
      '📋 Initialisation',    // Début processus
      '⚙️ Traitement',        // Phase principale
      '🔍 Validation',        // Contrôle qualité  
      '✅ Finalisation'       // Clôture
    ]
  }
  
  // Autres combinaisons hybrides
  if (primaryContext.type === 'CLIENT_BASED' && secondaryContext?.type === 'TEMPORAL') {
    return ['Client A - Sprint', 'Client B - Sprint', 'Prospects', 'Backlog']
  }
  
  if (primaryContext.type === 'TEMPORAL' && secondaryContext?.type === 'PHASED') {
    return ['Sprint 1 - Conception', 'Sprint 1 - Dev', 'Sprint 2 - Tests', 'Déploiement']
  }
  
  // Structure hybride générique basée sur les 2 contextes principaux
  const primaryColumns = getColumnsForContext(primaryContext.type).slice(0, 2)
  const secondaryColumns = getColumnsForContext(secondaryContext?.type).slice(0, 2)
  
  return [...primaryColumns, ...secondaryColumns]
}

const getColumnsForContext = (contextType) => {
  const defaults = {
    CLIENT_BASED: ['Client A', 'Client B', 'Prospects', 'Archives'],
    TEMPORAL: ['Sprint Actuel', 'Sprint Suivant', 'Backlog', 'Terminé'],
    PHASED: ['Conception', 'Réalisation', 'Tests', 'Déploiement'],
    VERSIONED: ['v1.0', 'v1.1', 'v2.0', 'Idées'],
    PROCESS_BASED: ['Qualification', 'En cours', 'Validation', 'Terminé'],
    RESOURCE_BASED: ['Équipe A', 'Équipe B', 'Support', 'Libre']
  }
  
  return defaults[contextType] || ['Colonne 1', 'Colonne 2', 'Colonne 3', 'Colonne 4']
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

const formatStructureType = (type) => {
  const typeFormats = {
    'INTEGRATION_SYSTEMES': 'Intégration Systèmes',
    'MAINTENANCE_TICKETING': 'Maintenance & Ticketing',
    'SUPPORT_PROGRAMME': 'Support Programmé',
    'DEVELOPPEMENT_OUTILS': 'Développement Outils',
    'GESTION_PROJET': 'Gestion de Projet',
    'CONSULTANT_SI': 'Consultant SI',
    'CLIENT_BASED': 'Organisation par Clients',
    'TEMPORAL': 'Organisation Temporelle',
    'PHASED': 'Organisation par Phases',
    'VERSIONED': 'Organisation par Versions',
    'PROCESS_BASED': 'Organisation par Processus',
    'RESOURCE_BASED': 'Organisation par Ressources',
    'DEFAULT': 'Structure Standard'
  }
  return typeFormats[type] || type
}

const regenerateStructure = async () => {
  isRegenerating.value = true
  
  try {
    // Utiliser la nouvelle génération spécialisée
    const result = formStore.generateSpecializedStructure()
    
    if (result.success) {
      resetToDefault()
    } else {
      console.warn('⚠️ [STRUCTURE-PREVIEW] Fallback sur structure par défaut:', result.error)
    }
  } catch (error) {
    console.error('❌ [STRUCTURE-PREVIEW] Erreur régénération:', error)
  } finally {
    isRegenerating.value = false
  }
}

const resetToDefault = () => {
  editableStructure.value = [...currentStructure.value]
}

const handleNext = () => {
  // Utiliser la structure personnalisée si modifiée
  const hasCustomizations = editableStructure.value.some((col, index) => 
    col.trim() !== '' && col !== currentStructure.value[index]
  )
  
  if (hasCustomizations) {
    // Préserver les métadonnées existantes tout en appliquant les personnalisations
    const currentPreview = formStore.structurePreview
    const updatedStructure = {
      ...currentPreview,
      columns: currentPreview.columns.map((column, index) => ({
        ...column,
        name: editableStructure.value[index].trim() || column.name
      })),
      customizedAt: new Date().toISOString(),
      userCustomized: true
    }
    
    console.log('✏️ [STRUCTURE-PREVIEW] Personnalisation appliquée:', {
      hasCustomizations,
      editableStructure: editableStructure.value,
      updatedStructure
    })
    
    formStore.setStructurePreview(updatedStructure)
  }
  
  emit('next')
}

// Lifecycle
onMounted(() => {
  // Générer la structure spécialisée si pas encore fait
  if (!formStore.structurePreview || !formStore.structurePreview.columns) {
    console.log('🏗️ [STRUCTURE-PREVIEW] Génération structure spécialisée au montage')
    const result = formStore.generateSpecializedStructure()
    
    if (!result.success) {
      console.warn('⚠️ [STRUCTURE-PREVIEW] Fallback structure par défaut:', result.error)
      formStore.setStructurePreview({
        columns: getDefaultStructure().map((name, index) => ({
          id: `col-${index}`,
          name,
          description: `Colonne ${index + 1}`,
          color: 'blue',
          defaultTasks: []
        })),
        metadata: {
          type: 'DEFAULT',
          description: 'Structure générique par défaut'
        }
      })
    }
  }
  
  resetToDefault()
})
</script>