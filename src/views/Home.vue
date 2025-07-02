<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-2xl font-bold text-gray-900">
                INDX <span class="text-indigo-600">Flow</span>
              </h1>
            </div>
            <div class="ml-6 hidden md:block">
              <p class="text-sm text-gray-600">
                Détection Contextuelle Intelligente
              </p>
            </div>
          </div>
          
          <!-- Mode Toggle -->
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">Mode:</label>
              <select 
                v-model="formStore.detectionMode" 
                class="form-input text-sm py-1 px-2"
                @change="onModeChange"
              >
                <option value="local">Local (Gratuit)</option>
                <option value="ai">IA (Précis)</option>
                <option value="hybrid">Hybride (Optimal)</option>
              </select>
            </div>
            
            <router-link 
              to="/analytics" 
              class="btn-secondary text-sm py-1 px-3"
            >
              📊 Analytics
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Progress Bar -->
      <div class="mb-8">
        <ProgressBar 
          :current-step="formStore.currentStep" 
          :max-steps="formStore.maxSteps"
          :progress="formStore.progress"
        />
      </div>

      <!-- Mode Info Banner -->
      <div v-if="showModeInfo" class="mb-6">
        <div class="card bg-blue-50 border-blue-200">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <component :is="modeIcon" class="h-5 w-5 text-blue-600 mt-0.5" />
            </div>
            <div class="ml-3 flex-1">
              <h3 class="text-sm font-medium text-blue-800">{{ modeInfo.title }}</h3>
              <p class="text-sm text-blue-700 mt-1">{{ modeInfo.description }}</p>
              <div class="flex items-center mt-2 text-xs text-blue-600">
                <span>⚡ {{ modeInfo.speed }}</span>
                <span class="mx-2">•</span>
                <span>💰 {{ modeInfo.cost }}</span>
                <span class="mx-2">•</span>
                <span>🎯 {{ modeInfo.accuracy }}</span>
              </div>
            </div>
            <button 
              @click="showModeInfo = false"
              class="flex-shrink-0 text-blue-400 hover:text-blue-600"
            >
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Formulaire Multi-étapes -->
      <div class="card">
        <FormulairePrincipal />
      </div>

      <!-- Cost Tracking (Development) -->
      <div v-if="isDevelopment && formStore.costTracking.totalCost > 0" class="mt-6">
        <CostDisplay :cost-data="formStore.costTracking" />
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-16 bg-gray-50 border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-sm text-gray-600">
          <p>
            INDX Flow - Intelligence contextuelle pour organisation optimale
          </p>
          <p class="mt-1">
            Développé avec Vue.js 3 • Analyse locale + IA Claude • 
            <button 
              @click="showTechDetails = !showTechDetails"
              class="text-indigo-600 hover:text-indigo-800"
            >
              Détails techniques
            </button>
          </p>
          
          <!-- Tech Details (collapsible) -->
          <div v-if="showTechDetails" class="mt-4 text-xs text-gray-500 max-w-2xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong>Frontend:</strong><br>
                Vue.js 3 + Vite + Tailwind<br>
                PWA Ready
              </div>
              <div>
                <strong>Backend:</strong><br>
                Node.js + Express + SQLite<br>
                Claude AI + Analyse locale
              </div>
              <div>
                <strong>Coûts:</strong><br>
                Local: ~0.00001€<br>
                IA: ~0.002€<br>
                Hybride: Optimisé
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useFormStore } from '../stores/formStore.js'

// Components
import ProgressBar from '../components/ProgressBar.vue'
import FormulairePrincipal from '../components/FormulairePrincipal.vue'
import CostDisplay from '../components/CostDisplay.vue'

// Icons (simple inline components for demo)
const LocalIcon = {
  template: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg>'
}

const AIIcon = {
  template: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path></svg>'
}

const HybridIcon = {
  template: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"></path></svg>'
}

// State
const formStore = useFormStore()
const showModeInfo = ref(true)
const showTechDetails = ref(false)
const isDevelopment = ref(import.meta.env.DEV)

// Computed
const modeIcon = computed(() => {
  switch (formStore.detectionMode) {
    case 'local': return LocalIcon
    case 'ai': return AIIcon
    case 'hybrid': return HybridIcon
    default: return HybridIcon
  }
})

const modeInfo = computed(() => {
  const modes = {
    local: {
      title: 'Mode Local - Analyse Gratuite',
      description: 'Utilise une base de 200+ mots-clés pondérés pour détecter le contexte organisationnel.',
      speed: 'Ultra-rapide (< 50ms)',
      cost: 'Gratuit (~0.00001€)',
      accuracy: 'Bonne (70-85%)'
    },
    ai: {
      title: 'Mode IA - Analyse Précise',
      description: 'Utilise Claude AI pour une analyse contextuelle approfondie et nuancée.',
      speed: 'Modéré (500-2000ms)',
      cost: 'Payant (~0.002€)',
      accuracy: 'Excellente (85-95%)'
    },
    hybrid: {
      title: 'Mode Hybride - Optimal',
      description: 'Combine analyse locale et IA intelligemment pour optimiser précision/coût.',
      speed: 'Adaptatif (50-2000ms)',
      cost: 'Variable (optimisé)',
      accuracy: 'Optimale (80-95%)'
    }
  }
  
  return modes[formStore.detectionMode] || modes.hybrid
})

// Methods
const onModeChange = () => {
  showModeInfo.value = true
  
  // Reset form si changement significatif
  if (formStore.currentStep > 1) {
    const confirmed = confirm('Changer de mode va réinitialiser votre progression. Continuer ?')
    if (confirmed) {
      formStore.resetForm()
    } else {
      // Revert to previous mode (would need to track this)
      return
    }
  }
}

// Lifecycle
onMounted(() => {
  // Auto-hide mode info after 5 seconds
  setTimeout(() => {
    showModeInfo.value = false
  }, 5000)
})

// Watch for form reset
watch(() => formStore.currentStep, (newStep) => {
  if (newStep === 1) {
    showModeInfo.value = true
  }
})
</script>