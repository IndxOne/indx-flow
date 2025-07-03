<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    
    <!-- Header avec navigation -->
    <header class="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-4xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Titre et progression -->
          <div class="flex items-center space-x-4">
            <router-link to="/" class="text-indigo-600 hover:text-indigo-800">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </router-link>
            
            <div>
              <h1 class="text-xl font-bold text-gray-900">
                🎯 INDX <span class="text-indigo-600">Flow</span>
              </h1>
              <p class="text-sm text-gray-500">
                Étape {{ formStore.currentStep }} sur {{ formStore.maxSteps }}
              </p>
            </div>
          </div>
          
          <!-- Progression bar -->
          <div class="hidden md:flex items-center space-x-4">
            <div class="w-32 bg-gray-200 rounded-full h-2">
              <div 
                class="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                :style="{ width: formStore.progress + '%' }"
              ></div>
            </div>
            <span class="text-sm text-gray-600 font-medium">
              {{ Math.round(formStore.progress) }}%
            </span>
          </div>
          
          <!-- Actions -->
          <div class="flex items-center space-x-3">
            <router-link 
              to="/workspaces" 
              class="text-sm text-gray-600 hover:text-gray-900"
            >
              📋 Mes espaces
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="max-w-4xl mx-auto px-6 py-8">
      
      <!-- Hero Section (affiché uniquement à l'étape 1) -->
      <div v-if="formStore.currentStep === 1" class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <h2 class="text-3xl font-bold text-gray-900 mb-3">
          Créons votre organisation parfaite
        </h2>
        
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Notre IA va analyser votre activité et vous proposer la meilleure structure pour votre workflow
        </p>
      </div>

      <!-- Formulaire principal -->
      <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <FormulairePrincipal />
      </div>
      
      <!-- Indicateurs de confiance (si analyse terminée) -->
      <div v-if="formStore.detectedContext && formStore.currentStep > 1" 
           class="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-800">
              <span class="font-medium">Contexte détecté :</span> 
              {{ formatContextType(formStore.detectedContext) }}
              <span class="text-green-600"> ({{ formStore.confidence }}% de confiance)</span>
            </p>
          </div>
        </div>
      </div>
      
    </main>

    <!-- Footer minimaliste -->
    <footer class="mt-16 py-8">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <p class="text-sm text-gray-500">
          INDX Flow • Intelligence contextuelle pour organisation optimale
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFormStore } from '../stores/formStore.js'
import FormulairePrincipal from '../components/FormulairePrincipal.vue'

// Store
const formStore = useFormStore()

// Methods
const formatContextType = (type) => {
  const types = {
    'CLIENT_BASED': 'Organisation par clients',
    'TEMPORAL': 'Organisation temporelle', 
    'PHASED': 'Organisation par phases',
    'VERSIONED': 'Organisation par versions',
    'PROCESS_BASED': 'Organisation par processus',
    'RESOURCE_BASED': 'Organisation par ressources',
    'CONSULTANT_SI': 'Consultant SI',
    'TECHNICIEN_SI': 'Technicien SI/ERP'
  }
  return types[type] || type || 'Analyse en cours...'
}
</script>

<style scoped>
/* Animations pour les transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>