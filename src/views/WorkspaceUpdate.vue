<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center space-x-2">
              <span class="text-2xl">🎯</span>
              <span class="text-xl font-bold text-gray-900">INDX Flow</span>
            </router-link>
            <span class="ml-3 text-sm text-gray-500">/ Mise à jour espace</span>
          </div>
          
          <div class="flex items-center space-x-4">
            <router-link to="/workspaces" class="btn-secondary text-sm">
              📂 Mes espaces
            </router-link>
            <router-link to="/" class="btn-secondary text-sm">
              🏠 Accueil
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Navigation breadcrumb -->
      <nav class="flex mb-8" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-4">
          <li>
            <router-link to="/" class="text-gray-400 hover:text-gray-500">
              <span class="sr-only">Accueil</span>
              🏠
            </router-link>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="flex-shrink-0 h-4 w-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              <span class="ml-4 text-sm font-medium text-gray-500">Mise à jour espace de travail</span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- Status Check -->
      <div v-if="!hasValidAnalysis" class="card bg-yellow-50 border-yellow-200 mb-8">
        <div class="flex items-start">
          <svg class="h-5 w-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 15c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 class="text-sm font-medium text-yellow-800 mb-1">⚠️ Analyse requise</h3>
            <p class="text-sm text-yellow-700 mb-2">
              Vous devez d'abord effectuer une analyse pour avoir une structure à appliquer.
            </p>
            <router-link to="/" class="btn-primary text-sm">
              🎯 Faire une analyse
            </router-link>
          </div>
        </div>
      </div>

      <!-- Main Update Component -->
      <div v-else>
        <WorkspaceUpdater />
        
        <!-- Quick Actions -->
        <div class="mt-8 text-center space-y-4">
          <div class="text-sm text-gray-500">
            Besoin d'aide ?
          </div>
          <div class="flex justify-center space-x-4">
            <button @click="showHelp = !showHelp" class="btn-secondary text-sm">
              ❓ Guide d'utilisation
            </button>
            <router-link to="/welcome-guided" class="btn-secondary text-sm">
              🔄 Nouvelle analyse
            </router-link>
          </div>
        </div>

        <!-- Help Section -->
        <div v-if="showHelp" class="mt-6 card bg-blue-50 border-blue-200">
          <h3 class="text-lg font-medium text-blue-900 mb-4">
            📖 Guide d'utilisation
          </h3>
          
          <div class="space-y-4 text-sm text-blue-800">
            <div>
              <h4 class="font-medium mb-2">🎯 Comment trouver l'ID de votre espace de travail :</h4>
              <ul class="list-disc list-inside space-y-1 ml-4">
                <li>Connectez-vous à votre dashboard Supabase</li>
                <li>Allez dans la table "workspaces"</li>
                <li>Trouvez votre espace par nom ou email</li>
                <li>Copiez la valeur de la colonne "id"</li>
              </ul>
            </div>
            
            <div>
              <h4 class="font-medium mb-2">🔄 Processus de mise à jour :</h4>
              <ol class="list-decimal list-inside space-y-1 ml-4">
                <li>Effectuez une analyse avec votre contexte métier</li>
                <li>Personnalisez les noms de colonnes si nécessaire</li>
                <li>Venez sur cette page de mise à jour</li>
                <li>Entrez l'ID de votre espace ou sélectionnez-le dans la liste</li>
                <li>Cliquez sur "Mettre à jour l'espace de travail"</li>
              </ol>
            </div>
            
            <div>
              <h4 class="font-medium mb-2">⚡ Fonctionnalités :</h4>
              <ul class="list-disc list-inside space-y-1 ml-4">
                <li>Mise à jour automatique des colonnes selon votre analyse</li>
                <li>Préservation de toutes vos tâches existantes</li>
                <li>Option de changer le nom et la description</li>
                <li>Traçabilité des modifications (horodatage)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFormStore } from '../stores/formStore.js'
import WorkspaceUpdater from '../components/WorkspaceUpdater.vue'

// Store
const formStore = useFormStore()

// State
const showHelp = ref(false)

// Computed
const hasValidAnalysis = computed(() => {
  return formStore.structurePreview && 
         (formStore.structurePreview.columns || Array.isArray(formStore.structurePreview))
})
</script>

<style scoped>
/* Page-specific styles if needed */
</style>