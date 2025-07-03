<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        🔄 Mettre à jour votre espace de travail
      </h2>
      <p class="text-gray-600 max-w-2xl mx-auto">
        Appliquez votre nouvelle structure personnalisée à votre espace de travail existant dans Supabase.
      </p>
    </div>

    <!-- Current Analysis Summary -->
    <div v-if="formStore.structurePreview" class="card bg-blue-50 border-blue-200">
      <h3 class="text-lg font-medium text-blue-900 mb-4">
        📋 Structure actuelle dans l'analyse
      </h3>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div 
          v-for="(column, index) in currentColumns" 
          :key="index"
          class="bg-white rounded-lg p-3 text-center border-2 border-blue-200"
        >
          <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
            <span class="text-blue-600 text-xs font-bold">{{ index + 1 }}</span>
          </div>
          <div class="text-sm font-medium text-gray-900">{{ column.name || column }}</div>
          <div v-if="column.description" class="text-xs text-gray-500 mt-1">{{ column.description }}</div>
        </div>
      </div>
      
      <div v-if="formStore.structurePreview.userCustomized" class="text-sm text-blue-700">
        ✨ Structure personnalisée le {{ formatDate(formStore.structurePreview.customizedAt) }}
      </div>
    </div>

    <!-- Workspace Selection -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium text-gray-900">
        🎯 Sélectionner l'espace de travail à mettre à jour
      </h3>
      
      <!-- Manual Workspace ID Input -->
      <div class="card">
        <div class="space-y-4">
          <div>
            <label for="workspaceId" class="block text-sm font-medium text-gray-700 mb-2">
              ID de l'espace de travail (depuis Supabase)
            </label>
            <input 
              id="workspaceId"
              v-model="workspaceId"
              type="text"
              placeholder="ex: 123e4567-e89b-12d3-a456-426614174000"
              class="form-input"
            />
            <p class="text-xs text-gray-500 mt-1">
              Vous pouvez trouver l'ID dans l'URL de votre espace ou dans la base de données Supabase
            </p>
          </div>
          
          <!-- Optional: Add workspace name/description updates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="workspaceName" class="block text-sm font-medium text-gray-700 mb-2">
                Nouveau nom (optionnel)
              </label>
              <input 
                id="workspaceName"
                v-model="workspaceName"
                type="text"
                placeholder="Laisser vide pour ne pas changer"
                class="form-input"
              />
            </div>
            
            <div>
              <label for="workspaceDescription" class="block text-sm font-medium text-gray-700 mb-2">
                Nouvelle description (optionnel)
              </label>
              <input 
                id="workspaceDescription"
                v-model="workspaceDescription"
                type="text"
                placeholder="Laisser vide pour ne pas changer"
                class="form-input"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- User Workspaces List (if available) -->
      <div v-if="formStore.userInfo.email" class="card">
        <h4 class="text-md font-medium text-gray-900 mb-3">
          📂 Ou sélectionner depuis vos espaces existants
        </h4>
        
        <button 
          @click="loadUserWorkspaces"
          :disabled="isLoadingWorkspaces"
          class="btn-secondary mb-3"
        >
          <svg v-if="isLoadingWorkspaces" class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoadingWorkspaces ? 'Chargement...' : 'Charger mes espaces' }}
        </button>
        
        <div v-if="userWorkspaces.length > 0" class="space-y-2">
          <div 
            v-for="workspace in userWorkspaces" 
            :key="workspace.id"
            @click="selectWorkspace(workspace)"
            class="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            :class="{ 'border-indigo-500 bg-indigo-50': workspaceId === workspace.id }"
          >
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium text-gray-900">{{ workspace.name }}</div>
                <div class="text-sm text-gray-500">{{ workspace.description }}</div>
              </div>
              <div class="text-xs text-gray-400">
                {{ formatDate(workspace.updated_at) }}
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="workspacesLoaded && userWorkspaces.length === 0" class="text-sm text-gray-500 italic">
          Aucun espace de travail trouvé pour {{ formStore.userInfo.email }}
        </div>
      </div>
    </div>

    <!-- Update Summary -->
    <div v-if="workspaceId" class="card bg-green-50 border-green-200">
      <h4 class="text-sm font-medium text-green-800 mb-2">🔄 Résumé de la mise à jour</h4>
      <ul class="text-sm text-green-700 space-y-1">
        <li>✅ ID de l'espace: <code class="bg-green-100 px-1 rounded">{{ workspaceId }}</code></li>
        <li>✅ Nouvelles colonnes: {{ currentColumns.map(c => c.name || c).join(', ') }}</li>
        <li v-if="workspaceName">✅ Nouveau nom: {{ workspaceName }}</li>
        <li v-if="workspaceDescription">✅ Nouvelle description: {{ workspaceDescription }}</li>
      </ul>
    </div>

    <!-- Update Action -->
    <div class="flex justify-center">
      <button
        @click="updateWorkspace"
        :disabled="!workspaceId || isUpdating"
        class="btn-primary"
      >
        <svg v-if="isUpdating" class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ isUpdating ? 'Mise à jour...' : '🚀 Mettre à jour l\'espace de travail' }}
      </button>
    </div>

    <!-- Result -->
    <div v-if="updateResult" class="card" :class="updateResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
      <div class="flex items-start">
        <svg v-if="updateResult.success" class="h-5 w-5 text-green-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="h-5 w-5 text-red-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <div>
          <h4 class="text-sm font-medium mb-1" :class="updateResult.success ? 'text-green-800' : 'text-red-800'">
            {{ updateResult.success ? '✅ Mise à jour réussie !' : '❌ Erreur de mise à jour' }}
          </h4>
          <p class="text-sm" :class="updateResult.success ? 'text-green-700' : 'text-red-700'">
            {{ updateResult.message }}
          </p>
          <div v-if="updateResult.success && updateResult.updatedColumns" class="mt-2">
            <p class="text-xs text-green-600">
              Nouvelles colonnes: {{ updateResult.updatedColumns.join(', ') }}
            </p>
            <div class="mt-3 flex space-x-2">
              <router-link 
                to="/workspaces"
                class="btn-primary text-xs"
              >
                📂 Voir mes espaces mis à jour
              </router-link>
              <button 
                @click="updateResult = null; workspaceId = ''"
                class="btn-secondary text-xs"
              >
                🔄 Faire une autre mise à jour
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFormStore } from '../stores/formStore.js'

// Store
const formStore = useFormStore()

// State
const workspaceId = ref('')
const workspaceName = ref('')
const workspaceDescription = ref('')
const isUpdating = ref(false)
const updateResult = ref(null)
const userWorkspaces = ref([])
const isLoadingWorkspaces = ref(false)
const workspacesLoaded = ref(false)

// Computed
const currentColumns = computed(() => {
  const structure = formStore.structurePreview
  
  if (!structure) return []
  
  // Nouveau format avec colonnes détaillées
  if (structure.columns && Array.isArray(structure.columns)) {
    return structure.columns
  }
  
  // Ancien format : simple tableau
  if (Array.isArray(structure)) {
    return structure.map((name, index) => ({
      id: `col-${index}`,
      name,
      description: `Colonne ${index + 1}`
    }))
  }
  
  return []
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue'
  
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Date invalide'
  }
}

const loadUserWorkspaces = async () => {
  if (!formStore.userInfo.email) {
    updateResult.value = {
      success: false,
      message: 'Email utilisateur requis pour charger les espaces'
    }
    return
  }

  isLoadingWorkspaces.value = true
  
  try {
    const result = await formStore.getUserWorkspaces()
    
    if (result.success) {
      userWorkspaces.value = result.data
      workspacesLoaded.value = true
      console.log('✅ [WORKSPACE-UPDATER] Espaces chargés:', result.data.length)
    } else {
      updateResult.value = {
        success: false,
        message: `Erreur lors du chargement des espaces: ${result.error || 'Erreur inconnue'}`
      }
    }
  } catch (error) {
    console.error('❌ [WORKSPACE-UPDATER] Erreur chargement espaces:', error)
    updateResult.value = {
      success: false,
      message: `Erreur: ${error.message}`
    }
  } finally {
    isLoadingWorkspaces.value = false
  }
}

const selectWorkspace = (workspace) => {
  workspaceId.value = workspace.id
  workspaceName.value = '' // Reset optional fields
  workspaceDescription.value = ''
  updateResult.value = null
  
  console.log('📋 [WORKSPACE-UPDATER] Espace sélectionné:', workspace.id, workspace.name)
}

const updateWorkspace = async () => {
  if (!workspaceId.value) {
    updateResult.value = {
      success: false,
      message: 'Veuillez sélectionner un espace de travail'
    }
    return
  }

  if (!formStore.structurePreview) {
    updateResult.value = {
      success: false,
      message: 'Aucune structure à appliquer. Veuillez d\'abord faire une analyse.'
    }
    return
  }

  isUpdating.value = true
  updateResult.value = null

  try {
    const options = {}
    if (workspaceName.value.trim()) options.name = workspaceName.value.trim()
    if (workspaceDescription.value.trim()) options.description = workspaceDescription.value.trim()

    console.log('🔄 [WORKSPACE-UPDATER] Mise à jour workspace:', workspaceId.value, options)

    const result = await formStore.updateExistingWorkspace(workspaceId.value, options)
    
    if (result.success) {
      updateResult.value = {
        success: true,
        message: `Espace de travail mis à jour avec succès ! ${result.updatedColumns?.length || 0} colonnes appliquées.`,
        updatedColumns: result.updatedColumns
      }
      
      // Clear form
      setTimeout(() => {
        workspaceId.value = ''
        workspaceName.value = ''
        workspaceDescription.value = ''
      }, 3000)
    } else {
      updateResult.value = {
        success: false,
        message: `Échec de la mise à jour: ${result.error || 'Erreur inconnue'}`
      }
    }
  } catch (error) {
    console.error('❌ [WORKSPACE-UPDATER] Erreur mise à jour:', error)
    updateResult.value = {
      success: false,
      message: `Erreur: ${error.message}`
    }
  } finally {
    isUpdating.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Auto-load workspaces if user email is available
  if (formStore.userInfo.email) {
    loadUserWorkspaces()
  }
})
</script>

<style scoped>
code {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}
</style>