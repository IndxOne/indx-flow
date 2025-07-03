<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        Finalisation de votre analyse
      </h2>
      <p class="text-gray-600 max-w-2xl mx-auto">
        Quelques informations pour personnaliser vos recommandations et recevoir un résumé par email.
      </p>
    </div>

    <!-- User Information Form -->
    <div class="space-y-6">
      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
          Email <span class="text-red-500">*</span>
        </label>
        <input 
          id="email"
          v-model="userInfo.email"
          type="email"
          required
          class="form-input"
          :class="emailValidationClass"
          placeholder="votre.email@exemple.com"
          @blur="validateEmail"
        />
        <p v-if="emailError" class="text-red-600 text-sm mt-1">
          {{ emailError }}
        </p>
        <p v-else class="text-gray-500 text-sm mt-1">
          Nous vous enverrons un résumé de votre analyse et vos recommandations
        </p>
      </div>

      <!-- Sector -->
      <div>
        <label for="sector" class="block text-sm font-medium text-gray-700 mb-2">
          Secteur d'activité
        </label>
        <select 
          id="sector"
          v-model="userInfo.sector"
          class="form-input"
        >
          <option value="">Sélectionnez votre secteur</option>
          <option v-for="sector in sectors" :key="sector.value" :value="sector.value">
            {{ sector.label }}
          </option>
        </select>
        <p class="text-gray-500 text-sm mt-1">
          Aide à personnaliser les recommandations
        </p>
      </div>

      <!-- Company Size -->
      <div>
        <label for="companySize" class="block text-sm font-medium text-gray-700 mb-2">
          Taille de votre organisation
        </label>
        <select 
          id="companySize"
          v-model="userInfo.companySize"
          class="form-input"
        >
          <option value="">Choisir une taille</option>
          <option value="solo">Freelance / Solo</option>
          <option value="small">Petite équipe (2-10 personnes)</option>
          <option value="medium">Équipe moyenne (11-50 personnes)</option>
          <option value="large">Grande équipe (50+ personnes)</option>
        </select>
      </div>

      <!-- Newsletter Subscription -->
      <div class="space-y-4">
        <div class="flex items-start">
          <input 
            id="newsletter"
            v-model="userInfo.newsletter"
            type="checkbox"
            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
          />
          <label for="newsletter" class="ml-2 text-sm text-gray-700">
            <span class="font-medium">Recevoir notre newsletter</span><br>
            <span class="text-gray-500">
              Conseils d'organisation, nouvelles fonctionnalités et cas d'usage (1-2 emails/mois maximum)
            </span>
          </label>
        </div>

        <!-- Privacy Note -->
        <div class="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p class="font-medium mb-1">🔒 Confidentialité garantie</p>
          <ul class="space-y-1">
            <li>• Vos données ne seront jamais partagées avec des tiers</li>
            <li>• Vous pouvez vous désabonner à tout moment</li>
            <li>• Nous utilisons vos informations uniquement pour améliorer le service</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Summary Card -->
    <div class="card bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
      <h3 class="text-lg font-medium text-gray-900 mb-4">
        📋 Résumé de votre configuration
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 class="font-medium text-gray-700 mb-2">Contexte détecté</h4>
          <div class="space-y-1">
            <div class="flex items-center">
              <span class="context-badge" :class="contextBadgeClass">
                {{ formatContextType(formStore.detectedContext) }}
              </span>
              <span class="ml-2 text-gray-600">{{ formStore.confidence }}% confiance</span>
            </div>
            <p v-if="formStore.isHybrid" class="text-orange-600 text-xs">
              Contexte hybride détecté
            </p>
          </div>
        </div>
        
        <div>
          <h4 class="font-medium text-gray-700 mb-2">Mode d'analyse</h4>
          <div class="flex items-center">
            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {{ getModeLabel(formStore.detectionMode) }}
            </span>
            <span v-if="formStore.costTracking.totalCost > 0" class="ml-2 text-gray-600 text-xs">
              Coût: {{ (formStore.costTracking.totalCost * 1000).toFixed(2) }}m€
            </span>
          </div>
        </div>
        
        <div>
          <h4 class="font-medium text-gray-700 mb-2">Structure générée</h4>
          <div class="text-xs text-gray-600">
            {{ formStore.structurePreview?.length || 4 }} colonnes personnalisées
          </div>
        </div>
        
        <div>
          <h4 class="font-medium text-gray-700 mb-2">Questions répondues</h4>
          <div class="text-xs text-gray-600">
            {{ Object.keys(formStore.adaptiveAnswers).length }} réponses personnalisées
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
        Retour
      </button>

      <button
        @click="handleNext"
        :disabled="!canProceed"
        class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Finaliser l'analyse
        <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFormStore } from '../../stores/formStore.js'

// Emits
const emit = defineEmits(['next', 'prev'])

// Store
const formStore = useFormStore()

// State
const userInfo = ref({
  email: formStore.userInfo.email || loadEmailFromLocalStorage() || '',
  sector: formStore.userInfo.sector || '',
  companySize: formStore.userInfo.companySize || '',
  newsletter: formStore.userInfo.newsletter || false
})

const emailError = ref('')

// Persistence helpers - même clé que WorkspacesList pour cohérence
const STORAGE_KEY = 'indx_user_email'

const saveEmailToLocalStorage = (email) => {
  try {
    if (email && email.includes('@')) {
      localStorage.setItem(STORAGE_KEY, email)
      console.log('💾 [FINAL-INFO] Email sauvegardé dans localStorage:', email)
    }
  } catch (error) {
    console.warn('❌ [FINAL-INFO] Erreur sauvegarde localStorage:', error)
  }
}

const loadEmailFromLocalStorage = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || ''
  } catch (error) {
    console.warn('❌ [FINAL-INFO] Erreur lecture localStorage:', error)
    return ''
  }
}

// Data
const sectors = ref([
  { value: 'consulting', label: 'Conseil & Consulting' },
  { value: 'development', label: 'Développement logiciel' },
  { value: 'marketing', label: 'Marketing & Communication' },
  { value: 'design', label: 'Design & Créatif' },
  { value: 'medical', label: 'Médical & Santé' },
  { value: 'education', label: 'Éducation & Formation' },
  { value: 'finance', label: 'Finance & Comptabilité' },
  { value: 'construction', label: 'BTP & Construction' },
  { value: 'retail', label: 'Commerce & Vente' },
  { value: 'manufacturing', label: 'Industrie & Manufacturing' },
  { value: 'nonprofit', label: 'Associatif & ONG' },
  { value: 'government', label: 'Secteur public' },
  { value: 'other', label: 'Autre secteur' }
])

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

const emailValidationClass = computed(() => {
  if (!userInfo.value.email) return ''
  return emailError.value ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-green-300 focus:border-green-500 focus:ring-green-500'
})

const canProceed = computed(() => {
  return userInfo.value.email && !emailError.value
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

const validateEmail = () => {
  const email = userInfo.value.email
  emailError.value = ''
  
  if (!email) {
    emailError.value = 'Email requis'
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    emailError.value = 'Format email invalide'
    return
  }
  
  // Vérification domaines courants (facultatif)
  const commonDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com']
  const domain = email.split('@')[1]
  if (!commonDomains.includes(domain) && !domain.includes('.')) {
    emailError.value = 'Domaine email suspect'
  }
}

const handleNext = () => {
  validateEmail()
  
  if (canProceed.value) {
    // Sauvegarder les informations dans le store
    formStore.updateUserInfo(userInfo.value)
    
    // PERSISTENCE: Sauvegarder l'email dans localStorage pour récupération future
    saveEmailToLocalStorage(userInfo.value.email)
    
    emit('next')
  }
}

// Watch for changes and auto-save
watch(userInfo, (newInfo) => {
  formStore.updateUserInfo(newInfo)
}, { deep: true })

// Auto-validate email on input + persistence
watch(() => userInfo.value.email, (newEmail) => {
  if (newEmail) {
    validateEmail()
    // Sauvegarder immédiatement l'email dès qu'il est valide
    if (!emailError.value && newEmail.includes('@')) {
      saveEmailToLocalStorage(newEmail)
    }
  } else {
    emailError.value = ''
  }
})
</script>