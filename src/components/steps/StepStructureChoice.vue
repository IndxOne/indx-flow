<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        🔍 Analyse terminée !
      </h2>
      <p class="text-gray-600 max-w-2xl mx-auto">
        <span v-if="hasMultipleContexts">
          Nous avons identifié votre profil multi-contextes :
          <span class="block mt-2 space-x-2">
            <span v-for="context in formStore.detectedContexts" 
                  :key="context.type"
                  class="context-badge text-xs" 
                  :class="getContextBadgeClass(context.type)">
              {{ formatContextType(context.type) }}
            </span>
          </span>
        </span>
        <span v-else>
          Profil détecté : 
          <span class="context-badge" :class="contextBadgeClass">
            {{ formatContextType(formStore.detectedContext) }}
          </span>
        </span>
      </p>
      <p class="text-lg text-gray-700 mt-4">
        📊 Choisissez la structure qui vous convient le mieux :
      </p>
    </div>

    <!-- Options de Structure -->
    <div class="grid gap-6 mb-8">
      <!-- Option 1: Recommandée -->
      <div 
        class="card-hover bg-white rounded-2xl shadow-lg border-2 relative overflow-hidden cursor-pointer transition-all duration-200"
        :class="selectedStructure === 'recommended' ? 'border-indigo-500 bg-indigo-50' : 'border-indigo-200 hover:border-indigo-300'"
        @click="selectStructure('recommended')"
      >
        <div class="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 text-sm font-medium">
          Recommandé
        </div>
        <div class="p-6">
          <div class="flex items-start">
            <div class="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
              <span class="text-2xl">{{ getRecommendedIcon() }}</span>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-2">
                {{ getRecommendedTitle() }}
                <span class="text-sm font-normal text-indigo-600 ml-2">
                  ({{ Math.round(formStore.confidence) }}% correspondance)
                </span>
              </h3>
              <p class="text-gray-600 mb-4">
                {{ getRecommendedDescription() }}
              </p>
              <div class="text-sm text-gray-500 mb-4">
                <strong>Structure :</strong> {{ getRecommendedStructure() }}
              </div>
              <div class="flex space-x-3">
                <button 
                  @click.stop="previewStructure('recommended')"
                  class="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-200 transition-colors"
                >
                  👀 Voir un aperçu
                </button>
                <span v-if="selectedStructure === 'recommended'" class="bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium">
                  ✓ Structure choisie
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Option 2: Alternative -->
      <div 
        v-if="hasAlternative"
        class="card-hover bg-white rounded-2xl shadow-lg border cursor-pointer transition-all duration-200"
        :class="selectedStructure === 'alternative' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'"
        @click="selectStructure('alternative')"
      >
        <div class="p-6">
          <div class="flex items-start">
            <div class="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mr-4">
              <span class="text-2xl">{{ getAlternativeIcon() }}</span>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-2">
                {{ getAlternativeTitle() }}
                <span class="text-sm font-normal text-amber-600 ml-2">
                  ({{ getAlternativeConfidence() }}% correspondance)
                </span>
              </h3>
              <p class="text-gray-600 mb-4">
                {{ getAlternativeDescription() }}
              </p>
              <div class="text-sm text-gray-500 mb-4">
                <strong>Structure :</strong> {{ getAlternativeStructure() }}
              </div>
              <div class="flex space-x-3">
                <button 
                  @click.stop="previewStructure('alternative')"
                  class="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg font-medium hover:bg-amber-200 transition-colors"
                >
                  👀 Voir un aperçu
                </button>
                <span v-if="selectedStructure === 'alternative'" class="bg-amber-500 text-white px-6 py-2 rounded-lg font-medium">
                  ✓ Structure choisie
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Option 3: Personnalisé -->
      <div 
        class="card-hover bg-white rounded-2xl shadow-lg border cursor-pointer transition-all duration-200"
        :class="selectedStructure === 'custom' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'"
        @click="selectStructure('custom')"
      >
        <div class="p-6">
          <div class="flex items-start">
            <div class="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
              <span class="text-2xl">🎨</span>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-2">PERSONNALISÉ</h3>
              <p class="text-gray-600 mb-4">
                Vous savez exactement ce que vous voulez ? Créez votre propre structure de A à Z.
              </p>
              <div class="flex space-x-3">
                <span v-if="selectedStructure === 'custom'" class="bg-purple-500 text-white px-6 py-2 rounded-lg font-medium">
                  ✓ Structure choisie
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Aperçu Modal (si demandé) -->
    <div v-if="showPreview" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="closePreview">
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">
              {{ previewData.icon }} Aperçu : {{ previewData.title }}
            </h3>
            <button @click="closePreview" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Kanban Preview -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div v-for="column in previewData.columns" :key="column.name" class="bg-gray-50 rounded-xl p-4">
              <h4 class="font-bold text-gray-900 mb-3">{{ column.name }}</h4>
              <div class="space-y-2">
                <div v-for="task in column.tasks" :key="task" class="bg-white rounded-lg p-3 shadow-sm border">
                  <p class="text-sm text-gray-700">{{ task }}</p>
                </div>
                <button class="w-full bg-gray-100 text-gray-500 rounded-lg p-2 text-sm hover:bg-gray-200 transition-colors">
                  + Nouvelle tâche
                </button>
              </div>
            </div>
          </div>

          <!-- Avantages -->
          <div class="bg-indigo-50 rounded-xl p-4 mb-6">
            <h4 class="font-bold text-indigo-900 mb-3">💡 Pourquoi cette structure est parfaite pour vous :</h4>
            <div class="grid md:grid-cols-2 gap-3">
              <div v-for="advantage in previewData.advantages" :key="advantage" class="flex items-start">
                <svg class="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <p class="text-indigo-800 text-sm">{{ advantage }}</p>
              </div>
            </div>
          </div>

          <!-- Actions Modal -->
          <div class="flex justify-center space-x-4">
            <button @click="closePreview" class="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              Fermer l'aperçu
            </button>
            <button @click="selectAndContinue(previewStructureType)" class="bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-600 transition-colors">
              Choisir cette structure
            </button>
          </div>
        </div>
      </div>
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
        Modifier ma description
      </button>

      <button
        @click="handleNext"
        :disabled="!selectedStructure"
        class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuer avec cette structure
        <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFormStore } from '../../stores/formStore.js'

// Emits
const emit = defineEmits(['next', 'prev'])

// Store
const formStore = useFormStore()

// State
const selectedStructure = ref(null)
const showPreview = ref(false)
const previewData = ref({})
const previewStructureType = ref('')

// Computed
const hasMultipleContexts = computed(() => {
  return formStore.detectedContexts && formStore.detectedContexts.length > 1
})

const hasAlternative = computed(() => {
  return hasMultipleContexts.value || formStore.isHybrid
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

// Structures prédéfinies (basées sur ux-demo.html)
const structures = {
  CLIENT_BASED: {
    title: 'PAR CLIENTS',
    icon: '🏢',
    description: 'Idéal pour gérer plusieurs clients simultanément. Chaque client a son espace dédié pour éviter la confusion.',
    structure: 'Prospects → Client A → Client B → Client C → Terminés',
    columns: [
      { name: '🎯 Prospects', tasks: ['Lead Banque ABC', 'Contact Startup Tech', 'RDV PME Locale'] },
      { name: '🏢 Client Alpha', tasks: ['Audit SI complet', 'Roadmap Digital', 'Formation équipe'] },
      { name: '🏭 Client Beta', tasks: ['Migration ERP', 'Tests utilisateur', 'Go-Live'] },
      { name: '📦 Terminés', tasks: ['Projet Gamma', 'Support Delta'] }
    ],
    advantages: [
      'Chaque client a son espace dédié',
      'Évite la confusion entre projets',
      'Suivi personnalisé par client',
      'Vision claire des priorités par client'
    ]
  },
  TEMPORAL: {
    title: 'PAR CYCLES TEMPORELS',
    icon: '⏰',
    description: 'Organisation par cycles de temps (sprints, périodes). Parfait pour le travail agile et les équipes produit.',
    structure: 'Sprint 1 → Sprint 2 → Sprint 3 → Backlog',
    columns: [
      { name: '🎯 Sprint Actuel', tasks: ['Feature Login', 'Bug Dashboard', 'Tests API'] },
      { name: '📅 Prochain Sprint', tasks: ['Feature Paiement', 'Refonte UI', 'Performance'] },
      { name: '📝 Backlog', tasks: ['Mode sombre', 'Notifications', 'Export PDF'] },
      { name: '✅ Terminés', tasks: ['Setup CI/CD', 'Authentification'] }
    ],
    advantages: [
      'Respect des cycles de développement',
      'Planification claire par période',
      'Backlog organisé et priorisé',
      'Suivi d\'avancement par cycle'
    ]
  },
  PHASED: {
    title: 'PAR PHASES DE PROJET',
    icon: '🔄',
    description: 'Focus sur les phases de vos projets. Idéal si vous travaillez par cycles avec des livrables précis.',
    structure: 'Analyse → Configuration → Tests → Déploiement',
    columns: [
      { name: '🔍 Analyse', tasks: ['Recueil besoins Client A', 'Audit technique existant', 'Architecture solution'] },
      { name: '⚙️ Configuration', tasks: ['Setup environnement', 'Paramétrage système', 'Dev connecteurs'] },
      { name: '🧪 Tests', tasks: ['Tests unitaires', 'Tests intégration', 'UAT Client'] },
      { name: '🚀 Déploiement', tasks: ['Mise en prod', 'Formation', 'Documentation'] }
    ],
    advantages: [
      'Vision claire des phases projet',
      'Workflow standardisé et efficace',
      'Facilite le suivi d\'avancement',
      'Respect de la méthodologie projet'
    ]
  },
  PROCESS_BASED: {
    title: 'PAR PROCESSUS MÉTIER',
    icon: '⚡',
    description: 'Organisation selon vos processus de travail. Idéal pour les workflows définis et récurrents.',
    structure: 'Qualification → En cours → Validation → Terminé',
    columns: [
      { name: '📋 Qualification', tasks: ['Analyse besoin client', 'Étude faisabilité', 'Devis technique'] },
      { name: '⚙️ En cours', tasks: ['Développement feature', 'Configuration système', 'Tests internes'] },
      { name: '🔍 Validation', tasks: ['Review code', 'Tests client', 'Documentation'] },
      { name: '✅ Terminé', tasks: ['Livraison client', 'Formation réalisée'] }
    ],
    advantages: [
      'Respect du workflow métier',
      'Processus standardisé',
      'Contrôle qualité à chaque étape',
      'Traçabilité complète'
    ]
  },
  RESOURCE_BASED: {
    title: 'PAR ÉQUIPES/RESSOURCES',
    icon: '👥',
    description: 'Organisation par équipes ou ressources. Parfait pour coordonner plusieurs personnes ou compétences.',
    structure: 'Équipe A → Équipe B → Support → Ressources Libres',
    columns: [
      { name: '👨‍💻 Équipe Dev', tasks: ['API authentification', 'Frontend dashboard', 'Tests automatisés'] },
      { name: '🎨 Équipe Design', tasks: ['Maquettes mobile', 'Iconographie', 'Guide de style'] },
      { name: '🔧 Support Tech', tasks: ['Bug client urgent', 'Maintenance serveur', 'Hotfix production'] },
      { name: '📋 À assigner', tasks: ['Documentation API', 'Formation client', 'Audit sécurité'] }
    ],
    advantages: [
      'Répartition claire des responsabilités',
      'Optimisation des compétences',
      'Coordination d\'équipe facilitée',
      'Gestion de la charge de travail'
    ]
  },
  VERSIONED: {
    title: 'PAR VERSIONS',
    icon: '🔢',
    description: 'Organisation par versions ou itérations. Idéal pour le développement logiciel et la gestion de releases.',
    structure: 'v1.0 → v1.1 → v2.0 → Idées futures',
    columns: [
      { name: '🎯 v1.0 (Actuel)', tasks: ['Bug fixes critiques', 'Optimisations', 'Tests finaux'] },
      { name: '📈 v1.1 (Prochain)', tasks: ['Nouvelles features', 'Améliorations UI', 'Performance'] },
      { name: '🚀 v2.0 (Futur)', tasks: ['Refonte architecture', 'Nouvelle plateforme', 'Migration données'] },
      { name: '💡 Idées', tasks: ['Mode sombre', 'IA intégrée', 'App mobile'] }
    ],
    advantages: [
      'Roadmap produit claire',
      'Planification des releases',
      'Priorisation des fonctionnalités',
      'Vision long terme'
    ]
  }
}

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

// Méthodes pour structure recommandée
const getRecommendedIcon = () => {
  return structures[formStore.detectedContext]?.icon || '🏢'
}

const getRecommendedTitle = () => {
  return structures[formStore.detectedContext]?.title || 'PAR CLIENTS'
}

const getRecommendedDescription = () => {
  return structures[formStore.detectedContext]?.description || 'Organisation adaptée à votre profil.'
}

const getRecommendedStructure = () => {
  return structures[formStore.detectedContext]?.structure || 'À définir'
}

// Méthodes pour structure alternative
const getAlternativeIcon = () => {
  // Si multi-contextes, utiliser le second contexte
  if (hasMultipleContexts.value && formStore.detectedContexts[1]) {
    return structures[formStore.detectedContexts[1].type]?.icon || '⚡'
  }
  // Sinon, proposer PHASED comme alternative générique
  return structures.PHASED?.icon || '⚡'
}

const getAlternativeTitle = () => {
  if (hasMultipleContexts.value && formStore.detectedContexts[1]) {
    return structures[formStore.detectedContexts[1].type]?.title || 'PAR PHASES'
  }
  return structures.PHASED?.title || 'PAR PHASES'
}

const getAlternativeDescription = () => {
  if (hasMultipleContexts.value && formStore.detectedContexts[1]) {
    return structures[formStore.detectedContexts[1].type]?.description || 'Alternative adaptée à votre profil.'
  }
  return structures.PHASED?.description || 'Alternative par phases de projet.'
}

const getAlternativeStructure = () => {
  if (hasMultipleContexts.value && formStore.detectedContexts[1]) {
    return structures[formStore.detectedContexts[1].type]?.structure || 'À définir'
  }
  return structures.PHASED?.structure || 'À définir'
}

const getAlternativeConfidence = () => {
  if (hasMultipleContexts.value && formStore.detectedContexts[1]) {
    return Math.round(formStore.detectedContexts[1].confidence)
  }
  return Math.round(formStore.confidence * 0.7) // 70% de la confidence principale
}

// Actions
const selectStructure = (type) => {
  selectedStructure.value = type
  
  // Mettre à jour le store selon le choix
  if (type === 'recommended') {
    // Garder la structure recommandée
    formStore.selectedStructureType = formStore.detectedContext
  } else if (type === 'alternative') {
    // Utiliser l'alternative
    const alternativeType = hasMultipleContexts.value && formStore.detectedContexts[1] 
      ? formStore.detectedContexts[1].type 
      : 'PHASED'
    formStore.selectedStructureType = alternativeType
  } else if (type === 'custom') {
    // Mode personnalisé
    formStore.selectedStructureType = 'CUSTOM'
  }
}

const previewStructure = (type) => {
  previewStructureType.value = type
  
  let structureType = formStore.detectedContext
  if (type === 'alternative') {
    structureType = hasMultipleContexts.value && formStore.detectedContexts[1] 
      ? formStore.detectedContexts[1].type 
      : 'PHASED'
  }
  
  previewData.value = structures[structureType] || structures.CLIENT_BASED
  showPreview.value = true
}

const closePreview = () => {
  showPreview.value = false
}

const selectAndContinue = (type) => {
  selectStructure(type)
  closePreview()
  handleNext()
}

const handleNext = () => {
  if (selectedStructure.value === 'custom') {
    // Pour personnalisé, aller directement à l'étape de customisation
    // (on peut implémenter cette logique plus tard)
    alert('Mode personnalisé - À implémenter : interface de création de structure personnalisée')
    return
  }
  
  emit('next')
}
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