<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        Questions adaptées à votre profil
      </h2>
      <p class="text-gray-600 max-w-2xl mx-auto">
        Questions personnalisées basées sur vos contextes détectés :
        <span v-if="hasMultipleContexts" class="block mt-2 space-x-2">
          <span v-for="context in formStore.detectedContexts" 
                :key="context.type"
                class="context-badge text-xs" 
                :class="getContextBadgeClass(context.type)">
            {{ formatContextType(context.type) }}
          </span>
        </span>
        <span v-else class="context-badge" :class="contextBadgeClass">
          {{ formatContextType(formStore.detectedContext) }}
        </span>
      </p>
    </div>

    <!-- Questions -->
    <div class="space-y-6" v-if="adaptiveQuestions.length > 0">
      <div 
        v-for="question in adaptiveQuestions" 
        :key="question.key"
        class="card"
      >
        <div class="mb-4">
          <label :for="question.key" class="block text-sm font-medium text-gray-900 mb-2">
            {{ question.label }}
          </label>
          <p v-if="question.description" class="text-xs text-gray-600 mb-3">
            {{ question.description }}
          </p>
        </div>

        <!-- Input based on question type -->
        <div v-if="question.type === 'select'">
          <select 
            :id="question.key"
            v-model="answers[question.key]"
            class="form-input"
          >
            <option value="">Choisissez une option</option>
            <option 
              v-for="option in question.options" 
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <div v-else-if="question.type === 'number'">
          <input 
            :id="question.key"
            v-model.number="answers[question.key]"
            type="number"
            :min="question.min || 1"
            :max="question.max || 100"
            class="form-input"
            :placeholder="question.placeholder"
          />
        </div>

        <div v-else-if="question.type === 'text'">
          <input 
            :id="question.key"
            v-model="answers[question.key]"
            type="text"
            class="form-input"
            :placeholder="question.placeholder"
          />
        </div>

        <div v-else-if="question.type === 'multiselect'">
          <div class="space-y-2">
            <div 
              v-for="option in question.options" 
              :key="option.value"
              class="flex items-center"
            >
              <input 
                :id="`${question.key}_${option.value}`"
                v-model="answers[question.key]"
                :value="option.value"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label 
                :for="`${question.key}_${option.value}`"
                class="ml-2 text-sm text-gray-700"
              >
                {{ option.label }}
              </label>
            </div>
          </div>
        </div>

        <!-- Question-specific help -->
        <div v-if="question.help" class="mt-2 text-xs text-gray-500">
          💡 {{ question.help }}
        </div>
      </div>
    </div>

    <!-- No questions fallback -->
    <div v-else class="text-center py-8">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
        <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Configuration optimale détectée</h3>
      <p class="text-gray-600 max-w-md mx-auto">
        Votre contexte est suffisamment clair. Nous pouvons procéder directement à la génération de votre structure.
      </p>
    </div>

    <!-- Progress indicator -->
    <div v-if="adaptiveQuestions.length > 0" class="text-center text-sm text-gray-600">
      {{ answeredCount }} sur {{ adaptiveQuestions.length }} questions répondues
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
        :disabled="!canProceed"
        class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Générer la structure
        <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useFormStore } from '../../stores/formStore.js'

// Emits
const emit = defineEmits(['next', 'prev'])

// Store
const formStore = useFormStore()

// State
const answers = ref({ ...formStore.adaptiveAnswers })

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

// Nouveau computed pour les contextes multiples
const hasMultipleContexts = computed(() => {
  return formStore.detectedContexts && formStore.detectedContexts.length > 1
})

const adaptiveQuestions = computed(() => {
  const questionSets = {
    CLIENT_BASED: [
      {
        key: 'clientCount',
        type: 'select',
        label: 'Combien de clients gérez-vous simultanément ?',
        description: 'Cela nous aide à dimensionner votre organisation.',
        options: [
          { value: '1-3', label: '1 à 3 clients' },
          { value: '4-10', label: '4 à 10 clients' },
          { value: '10-25', label: '10 à 25 clients' },
          { value: '25+', label: 'Plus de 25 clients' }
        ],
        help: 'Comptez les clients actifs avec lesquels vous travaillez régulièrement.'
      },
      {
        key: 'clientType',
        type: 'select',
        label: 'Type de relation client principal',
        options: [
          { value: 'consulting', label: 'Conseil/Consulting' },
          { value: 'medical', label: 'Médical/Patients' },
          { value: 'service', label: 'Prestation de service' },
          { value: 'b2b', label: 'Vente B2B' },
          { value: 'support', label: 'Support/Maintenance' }
        ]
      },
      {
        key: 'projectDuration',
        type: 'select',
        label: 'Durée typique d\'un projet client',
        options: [
          { value: 'short', label: 'Quelques jours à 2 semaines' },
          { value: 'medium', label: '1 à 3 mois' },
          { value: 'long', label: '3 à 12 mois' },
          { value: 'ongoing', label: 'Relation continue (plusieurs années)' }
        ]
      }
    ],

    TEMPORAL: [
      {
        key: 'sprintDuration',
        type: 'select',
        label: 'Durée préférée de vos cycles/sprints',
        description: 'La durée qui correspond le mieux à votre rythme de travail.',
        options: [
          { value: '1week', label: '1 semaine' },
          { value: '2weeks', label: '2 semaines' },
          { value: '3weeks', label: '3 semaines' },
          { value: '1month', label: '1 mois' },
          { value: 'quarterly', label: 'Trimestriel' }
        ]
      },
      {
        key: 'methodology',
        type: 'select',
        label: 'Méthodologie de travail',
        options: [
          { value: 'scrum', label: 'Scrum' },
          { value: 'kanban', label: 'Kanban' },
          { value: 'agile', label: 'Agile (autre)' },
          { value: 'waterfall', label: 'Méthode traditionnelle' },
          { value: 'hybrid', label: 'Hybride' }
        ]
      },
      {
        key: 'teamSize',
        type: 'number',
        label: 'Taille de votre équipe',
        min: 1,
        max: 50,
        placeholder: 'Ex: 5'
      }
    ],

    PHASED: [
      {
        key: 'phaseCount',
        type: 'select',
        label: 'Nombre de phases dans vos projets',
        options: [
          { value: '3', label: '3 phases principales' },
          { value: '4', label: '4 phases' },
          { value: '5', label: '5 phases' },
          { value: '6+', label: '6 phases ou plus' }
        ]
      },
      {
        key: 'projectType',
        type: 'select',
        label: 'Type de projets phasés',
        options: [
          { value: 'construction', label: 'Construction/BTP' },
          { value: 'migration', label: 'Migration SI' },
          { value: 'certification', label: 'Certification/Audit' },
          { value: 'development', label: 'Développement logiciel' },
          { value: 'research', label: 'Recherche/Étude' }
        ]
      },
      {
        key: 'approvalRequired',
        type: 'select',
        label: 'Validation requise entre phases',
        options: [
          { value: 'always', label: 'Toujours (gate obligatoire)' },
          { value: 'major', label: 'Phases majeures uniquement' },
          { value: 'optional', label: 'Optionnel selon contexte' },
          { value: 'never', label: 'Flux continu' }
        ]
      }
    ],

    VERSIONED: [
      {
        key: 'versioningScheme',
        type: 'select',
        label: 'Schéma de versioning préféré',
        options: [
          { value: 'semantic', label: 'Sémantique (1.0.0, 1.1.0, 2.0.0)' },
          { value: 'simple', label: 'Simple (v1, v2, v3)' },
          { value: 'date', label: 'Basé sur la date (2024.01, 2024.02)' },
          { value: 'custom', label: 'Noms personnalisés' }
        ]
      },
      {
        key: 'releaseFrequency',
        type: 'select',
        label: 'Fréquence de release',
        options: [
          { value: 'continuous', label: 'Continu (CI/CD)' },
          { value: 'weekly', label: 'Hebdomadaire' },
          { value: 'biweekly', label: 'Toutes les 2 semaines' },
          { value: 'monthly', label: 'Mensuel' },
          { value: 'quarterly', label: 'Trimestriel' }
        ]
      },
      {
        key: 'productType',
        type: 'select',
        label: 'Type de produit',
        options: [
          { value: 'software', label: 'Logiciel/Application' },
          { value: 'design', label: 'Design/Interface' },
          { value: 'content', label: 'Contenu/Documentation' },
          { value: 'hardware', label: 'Matériel/Produit physique' }
        ]
      }
    ],

    PROCESS_BASED: [
      {
        key: 'processType',
        type: 'select',
        label: 'Type de projet/processus principal',
        description: 'Quel est votre domaine d\'activité principal ?',
        options: [
          { value: 'erp_migration', label: 'Migration/Intégration ERP' },
          { value: 'it_infrastructure', label: 'Infrastructure SI' },
          { value: 'system_integration', label: 'Intégration de systèmes' },
          { value: 'support_maintenance', label: 'Support & Maintenance' },
          { value: 'sales', label: 'Processus de vente' },
          { value: 'recruitment', label: 'Recrutement' },
          { value: 'support', label: 'Support client' },
          { value: 'quality', label: 'Contrôle qualité' },
          { value: 'approval', label: 'Processus d\'approbation' }
        ]
      },
      {
        key: 'keyStakeholders',
        type: 'multiselect',
        label: 'Interlocuteurs clés de votre projet (plusieurs choix)',
        description: 'Avec qui travaillez-vous principalement ?',
        options: [
          { value: 'dsi', label: 'DSI/Direction SI' },
          { value: 'integrator', label: 'Intégrateur/Prestataire' },
          { value: 'endusers', label: 'Utilisateurs finaux' },
          { value: 'architects', label: 'Architectes SI' },
          { value: 'devteam', label: 'Équipe développement' },
          { value: 'vendors', label: 'Éditeurs/Fournisseurs' },
          { value: 'operations', label: 'Équipes opérationnelles' },
          { value: 'security', label: 'Sécurité SI' }
        ]
      },
      {
        key: 'mainActivities',
        type: 'multiselect',
        label: 'Vos activités principales (plusieurs choix)',
        description: 'Quelles sont vos tâches récurrentes ?',
        options: [
          { value: 'requirements_analysis', label: 'Analyse des besoins' },
          { value: 'architecture_design', label: 'Conception architecture' },
          { value: 'testing_validation', label: 'Tests & Validation' },
          { value: 'workshops', label: 'Ateliers & Réunions' },
          { value: 'documentation', label: 'Documentation technique' },
          { value: 'vendor_management', label: 'Gestion fournisseurs/devis' },
          { value: 'infrastructure_setup', label: 'Mise en place infrastructure' },
          { value: 'monitoring_support', label: 'Suivi & Support' },
          { value: 'training', label: 'Formation équipes' },
          { value: 'integration_interfaces', label: 'Intégration/Interfaces' }
        ]
      },
      {
        key: 'projectComplexity',
        type: 'select',
        label: 'Complexité de vos projets',
        description: 'Comment qualifieriez-vous la complexité habituelle ?',
        options: [
          { value: 'low', label: 'Simple (1-2 systèmes, équipe réduite)' },
          { value: 'medium', label: 'Moyenne (3-5 systèmes, équipe mixte)' },
          { value: 'high', label: 'Complexe (5+ systèmes, multiples équipes)' },
          { value: 'critical', label: 'Critique (systèmes centraux, enjeux majeurs)' }
        ]
      }
    ],

    RESOURCE_BASED: [
      {
        key: 'teamStructure',
        type: 'select',
        label: 'Structure de votre équipe projet',
        description: 'Comment votre équipe est-elle organisée ?',
        options: [
          { value: 'dedicated_team', label: 'Équipe dédiée au projet' },
          { value: 'mixed_team', label: 'Équipe mixte (projet + BAU)' },
          { value: 'matrix_team', label: 'Organisation matricielle' },
          { value: 'external_team', label: 'Équipe externe/prestataire' },
          { value: 'distributed_team', label: 'Équipe distribuée (multi-sites)' }
        ]
      },
      {
        key: 'teamSize',
        type: 'select',
        label: 'Taille de l\'équipe projet',
        description: 'Combien de personnes travaillent sur le projet ?',
        options: [
          { value: 'small', label: 'Petite équipe (2-5 personnes)' },
          { value: 'medium', label: 'Équipe moyenne (6-12 personnes)' },
          { value: 'large', label: 'Grande équipe (13-25 personnes)' },
          { value: 'enterprise', label: 'Équipe entreprise (25+ personnes)' }
        ]
      },
      {
        key: 'technicalRoles',
        type: 'multiselect',
        label: 'Rôles techniques dans l\'équipe (plusieurs choix)',
        description: 'Quels profils techniques participent au projet ?',
        options: [
          { value: 'tech_lead', label: 'Tech Lead/Architecte' },
          { value: 'sysadmin', label: 'Administrateur système' },
          { value: 'dba', label: 'Administrateur base de données' },
          { value: 'network_admin', label: 'Administrateur réseau' },
          { value: 'security_expert', label: 'Expert sécurité' },
          { value: 'integration_dev', label: 'Développeur intégration' },
          { value: 'qa_tester', label: 'Testeur/Recetteur' },
          { value: 'functional_analyst', label: 'Analyste fonctionnel' },
          { value: 'project_manager', label: 'Chef de projet' },
          { value: 'business_analyst', label: 'Analyste métier' }
        ]
      },
      {
        key: 'workloadDistribution',
        type: 'select',
        label: 'Répartition de votre charge de travail',
        description: 'Comment se répartit votre temps de travail ?',
        options: [
          { value: 'project_focused', label: 'Concentré sur le projet (80%+)' },
          { value: 'mixed_load', label: 'Mixte projet + maintenance (50/50)' },
          { value: 'support_heavy', label: 'Principalement support + projet ponctuel' },
          { value: 'multi_project', label: 'Multi-projets simultanés' }
        ]
      }
    ]
  }

  // Nouvelle logique : générer des questions pour TOUS les contextes détectés
  if (hasMultipleContexts.value) {
    const allQuestions = []
    const seenKeys = new Set()
    
    // Parcourir les contextes par ordre de priorité
    const sortedContexts = [...formStore.detectedContexts].sort((a, b) => {
      const priorities = { primary: 1, strong: 2, medium: 3, weak: 4, secondary: 5 }
      return priorities[a.priority] - priorities[b.priority]
    })
    
    for (const context of sortedContexts) {
      const contextQuestions = questionSets[context.type] || []
      
      // Prendre les 2 questions les plus importantes de chaque contexte
      const limitedQuestions = contextQuestions.slice(0, 2)
      
      for (const question of limitedQuestions) {
        if (!seenKeys.has(question.key)) {
          seenKeys.add(question.key)
          allQuestions.push({
            ...question,
            contextSource: context.type,
            contextLabel: formatContextType(context.type),
            priority: context.priority
          })
        }
      }
    }
    
    // Limiter à 6 questions maximum pour éviter la surcharge
    return allQuestions.slice(0, 6)
  }
  
  // Logique legacy pour contexte unique
  return questionSets[formStore.detectedContext] || []
})

const answeredCount = computed(() => {
  return Object.keys(answers.value).filter(key => {
    const value = answers.value[key]
    return value !== '' && value !== null && value !== undefined && 
           (!Array.isArray(value) || value.length > 0)
  }).length
})

const canProceed = computed(() => {
  // Si pas de questions, on peut toujours continuer
  if (adaptiveQuestions.value.length === 0) return true
  
  // Sinon, au moins 50% des questions doivent être répondues
  const requiredAnswers = Math.ceil(adaptiveQuestions.value.length * 0.5)
  return answeredCount.value >= requiredAnswers
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

const handleNext = () => {
  // Sauvegarder les réponses dans le store
  formStore.adaptiveAnswers = { ...answers.value }
  
  // Mettre à jour toutes les réponses en une fois
  Object.keys(answers.value).forEach(key => {
    formStore.updateAdaptiveAnswer(key, answers.value[key])
  })
  
  emit('next')
}

// Watch for changes and save to store
watch(answers, (newAnswers) => {
  formStore.adaptiveAnswers = { ...newAnswers }
}, { deep: true })

// Initialize multiselect arrays
onMounted(() => {
  adaptiveQuestions.value.forEach(question => {
    if (question.type === 'multiselect' && !answers.value[question.key]) {
      answers.value[question.key] = []
    }
  })
})
</script>