<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header du profil -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Breadcrumb et titre profil -->
          <div class="flex items-center space-x-4">
            <router-link 
              to="/" 
              class="text-gray-500 hover:text-gray-700 flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Accueil
            </router-link>
            
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            
            <router-link 
              :to="`/${profileType}`"
              class="text-gray-500 hover:text-gray-700 flex items-center space-x-2"
            >
              <span class="text-xl">{{ currentProfile.icon }}</span>
              <span class="text-lg font-medium">{{ currentProfile.label }}</span>
            </router-link>
            
            <!-- Mission breadcrumb si applicable -->
            <template v-if="currentMission">
              <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              
              <div class="flex items-center space-x-2">
                <span class="text-xl">{{ currentMission.icon }}</span>
                <h1 class="text-xl font-semibold text-gray-900">
                  {{ currentMission.label }}
                </h1>
              </div>
            </template>
            
            <!-- Titre profil simple si pas de mission -->
            <h1 v-else class="text-xl font-semibold text-gray-900 ml-2">
              Dashboard
            </h1>
          </div>
          
          <!-- Actions du profil -->
          <div class="flex items-center space-x-3">
            <!-- Indicateur nb workspaces -->
            <div class="text-sm text-gray-600">
              {{ workspaceCount }} espace{{ workspaceCount > 1 ? 's' : '' }}
            </div>
            
            <!-- Bouton nouveau workspace -->
            <router-link 
              :to="missionId ? `/${profileType}/${missionId}/new` : `/${profileType}/new`"
              class="btn-primary text-sm"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ currentMission ? `Nouveau ${currentMission.label}` : 'Nouveau projet' }}
            </router-link>
            
            <!-- Menu profil -->
            <div class="relative">
              <button 
                @click="showProfileMenu = !showProfileMenu"
                class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              <!-- Dropdown menu -->
              <div 
                v-if="showProfileMenu" 
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border"
                @click.stop
              >
                <div class="py-1">
                  <button 
                    @click="exportWorkspaces"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    📊 Exporter les données
                  </button>
                  <button 
                    @click="importWorkspaces"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    📂 Importer des données
                  </button>
                  <hr class="my-1">
                  <router-link 
                    to="/analytics"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    📈 Analytics
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Description du profil (affichée seulement sur la liste) -->
    <div v-if="showProfileDescription" class="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-gray-700 mb-4">{{ currentProfile.description }}</p>
            
            <!-- Contextes privilégiés -->
            <div class="mb-4">
              <h3 class="text-sm font-medium text-gray-900 mb-2">Contextes privilégiés :</h3>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="context in currentProfile.preferredContexts" 
                  :key="context"
                  class="context-badge"
                  :class="getContextBadgeClass(context)"
                >
                  {{ formatContextType(context) }}
                </span>
              </div>
            </div>
            
            <!-- Structure par défaut -->
            <div>
              <h3 class="text-sm font-medium text-gray-900 mb-2">Structure par défaut :</h3>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="(column, index) in currentProfile.defaultStructure" 
                  :key="index"
                  class="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm"
                >
                  {{ column }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Statistiques du profil -->
          <div class="ml-8 bg-white rounded-lg border p-4 min-w-64">
            <h3 class="text-sm font-medium text-gray-900 mb-3">📊 Statistiques</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Workspaces :</span>
                <span class="text-sm font-medium">{{ workspaceCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Dernière activité :</span>
                <span class="text-sm font-medium">{{ lastActivity }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Efficacité :</span>
                <span class="text-sm font-medium">{{ efficiency }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProfileStore } from '../stores/profileStore.js'

// Props du router
const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()

// State local
const showProfileMenu = ref(false)

// Computed
const profileType = computed(() => route.params.profileType)
const missionId = computed(() => route.params.missionId)

const currentProfile = computed(() => {
  return profileStore.getProfileById(profileType.value)
})

const currentMission = computed(() => {
  if (profileType.value === 'technicien-si' && missionId.value) {
    const technicienProfile = profileStore.getProfileById('technicien-si')
    return technicienProfile.missions?.[missionId.value]
  }
  return null
})

const workspaceCount = computed(() => {
  return profileStore.getWorkspacesByProfile(profileType.value).length
})

const showProfileDescription = computed(() => {
  // Afficher la description seulement sur la route de liste (pas sur /new ou /workspace/xxx)
  return route.name === 'ProfileWorkspaces'
})

const lastActivity = computed(() => {
  const workspaces = profileStore.getWorkspacesByProfile(profileType.value)
  if (workspaces.length === 0) return 'Aucune'
  
  const latest = workspaces.reduce((latest, workspace) => {
    return new Date(workspace.updated_at) > new Date(latest.updated_at) ? workspace : latest
  })
  
  return formatRelativeDate(latest.updated_at)
})

const efficiency = computed(() => {
  // Calcul factice de l'efficacité basé sur le nombre de workspaces et leur activité
  const base = Math.min(workspaceCount.value * 15, 85)
  const random = Math.floor(Math.random() * 15)
  return Math.min(base + random, 95)
})

// Methods
const formatContextType = (type) => {
  const formats = {
    CLIENT_BASED: 'Par clients',
    TEMPORAL: 'Temporel',
    PHASED: 'Par phases', 
    VERSIONED: 'Par versions',
    PROCESS_BASED: 'Par processus',
    RESOURCE_BASED: 'Par ressources'
  }
  return formats[type] || type
}

const getContextBadgeClass = (context) => {
  const classes = {
    CLIENT_BASED: 'bg-emerald-100 text-emerald-800',
    TEMPORAL: 'bg-amber-100 text-amber-800',
    PHASED: 'bg-blue-100 text-blue-800',
    VERSIONED: 'bg-purple-100 text-purple-800',
    PROCESS_BASED: 'bg-rose-100 text-rose-800',
    RESOURCE_BASED: 'bg-indigo-100 text-indigo-800'
  }
  return classes[context] || 'bg-gray-100 text-gray-800'
}

const formatRelativeDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffHours < 1) return 'À l\'instant'
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short' 
  })
}

const exportWorkspaces = () => {
  const workspaces = profileStore.getWorkspacesByProfile(profileType.value)
  
  const dataToExport = {
    profile: currentProfile.value,
    workspaces: workspaces,
    exportDate: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `indx-flow-${profileType.value}-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  showProfileMenu.value = false
}

const importWorkspaces = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          console.log('📂 Import données:', data)
          // TODO: Implémenter l'import
          alert('Import réussi ! (fonctionnalité en développement)')
        } catch (error) {
          console.error('❌ Erreur import:', error)
          alert('Erreur lors de l\'import du fichier')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
  showProfileMenu.value = false
}

const closeMenuOnClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showProfileMenu.value = false
  }
}

// Watchers
watch(() => route.params.profileType, (newProfileType) => {
  if (newProfileType) {
    profileStore.setCurrentProfile(newProfileType)
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  document.addEventListener('click', closeMenuOnClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenuOnClickOutside)
})
</script>

<style scoped>
.btn-primary {
  @apply inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors;
}

.context-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
}
</style>