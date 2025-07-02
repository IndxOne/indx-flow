<template>
  <div>
    <!-- Message si aucun workspace -->
    <div v-if="workspaces.length === 0" class="text-center py-12">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        {{ emptyStateTitle }}
      </h3>
      <p class="text-gray-600 max-w-md mx-auto mb-6">
        {{ emptyStateDescription }}
      </p>
      
      <router-link 
        :to="`/${profileType}/new`"
        class="btn-primary"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ createButtonText }}
      </router-link>
    </div>

    <!-- Liste des workspaces -->
    <div v-else>
      <!-- Barre de recherche et filtres -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-gray-900">
            Vos espaces de travail
          </h2>
          
          <div class="flex items-center space-x-3">
            <!-- Tri -->
            <select 
              v-model="sortBy" 
              class="text-sm border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="updated_at">Plus récents</option>
              <option value="created_at">Plus anciens</option>
              <option value="name">Nom A-Z</option>
            </select>
            
            <!-- Vue -->
            <div class="flex border border-gray-300 rounded-md">
              <button 
                @click="viewMode = 'grid'"
                :class="viewMode === 'grid' ? 'bg-gray-100' : ''"
                class="p-2 text-gray-500 hover:text-gray-700"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button 
                @click="viewMode = 'list'"
                :class="viewMode === 'list' ? 'bg-gray-100' : ''"
                class="p-2 text-gray-500 hover:text-gray-700"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Barre de recherche -->
        <div class="relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Rechercher un espace..."
            class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
        </div>
      </div>

      <!-- Vue grille -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="workspace in filteredWorkspaces" 
          :key="workspace.id"
          class="workspace-card"
          @click="openWorkspace(workspace)"
        >
          <div class="workspace-header">
            <div class="flex items-center justify-between mb-2">
              <h3 class="workspace-title">{{ workspace.name }}</h3>
              <button 
                @click.stop="toggleWorkspaceMenu(workspace.id)"
                class="workspace-menu-btn"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              <!-- Menu contextuel -->
              <div 
                v-if="activeMenu === workspace.id" 
                class="workspace-menu"
                @click.stop
              >
                <button @click="editWorkspace(workspace)" class="menu-item">
                  ✏️ Renommer
                </button>
                <button @click="duplicateWorkspace(workspace)" class="menu-item">
                  📋 Dupliquer
                </button>
                <button @click="exportWorkspace(workspace)" class="menu-item">
                  📊 Exporter
                </button>
                <hr class="my-1">
                <button @click="deleteWorkspace(workspace)" class="menu-item text-red-600">
                  🗑️ Supprimer
                </button>
              </div>
            </div>
            
            <p v-if="workspace.description" class="workspace-description">
              {{ workspace.description }}
            </p>
          </div>
          
          <div class="workspace-body">
            <!-- Colonnes preview -->
            <div class="columns-preview">
              <div 
                v-for="(column, index) in (workspace.columns || currentProfile.defaultStructure).slice(0, 4)" 
                :key="index"
                class="column-preview"
              >
                <div class="column-header">{{ column }}</div>
                <div class="column-tasks">
                  <div class="task-preview" v-for="i in Math.min(getTaskCountForColumn(workspace, index), 3)" :key="i"></div>
                </div>
              </div>
            </div>
            
            <!-- Statistiques workspace -->
            <div class="workspace-stats">
              <div class="stat">
                <span class="stat-value">{{ getTotalTasks(workspace) }}</span>
                <span class="stat-label">tâches</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ getProgress(workspace) }}%</span>
                <span class="stat-label">terminé</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ formatDate(workspace.updated_at) }}</span>
                <span class="stat-label">modifié</span>
              </div>
            </div>
          </div>
          
          <div class="workspace-footer">
            <div class="workspace-tags">
              <span class="workspace-tag">{{ getProjectTypeLabel(workspace.project_type) }}</span>
              <span v-if="workspace.is_active" class="workspace-tag active">Actif</span>
            </div>
            
            <button class="open-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ouvrir
            </button>
          </div>
        </div>
      </div>

      <!-- Vue liste -->
      <div v-else class="bg-white rounded-lg border overflow-hidden">
        <div class="workspace-list-header">
          <div class="grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider">
            <div class="col-span-4">Nom</div>
            <div class="col-span-2">Type</div>
            <div class="col-span-2">Progression</div>
            <div class="col-span-2">Modifié</div>
            <div class="col-span-2">Actions</div>
          </div>
        </div>
        
        <div class="workspace-list-body">
          <div 
            v-for="workspace in filteredWorkspaces" 
            :key="workspace.id"
            class="workspace-list-item"
            @click="openWorkspace(workspace)"
          >
            <div class="grid grid-cols-12 gap-4 px-6 py-4 items-center">
              <div class="col-span-4">
                <div class="flex items-center">
                  <div class="workspace-icon">{{ currentProfile.icon }}</div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">{{ workspace.name }}</div>
                    <div v-if="workspace.description" class="text-sm text-gray-500">{{ workspace.description }}</div>
                  </div>
                </div>
              </div>
              
              <div class="col-span-2">
                <span class="workspace-type-badge">
                  {{ getProjectTypeLabel(workspace.project_type) }}
                </span>
              </div>
              
              <div class="col-span-2">
                <div class="flex items-center">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: `${getProgress(workspace)}%` }"
                    ></div>
                  </div>
                  <span class="ml-2 text-sm text-gray-600">{{ getProgress(workspace) }}%</span>
                </div>
              </div>
              
              <div class="col-span-2">
                <span class="text-sm text-gray-500">{{ formatRelativeDate(workspace.updated_at) }}</span>
              </div>
              
              <div class="col-span-2">
                <div class="flex items-center space-x-2">
                  <button 
                    @click.stop="openWorkspace(workspace)"
                    class="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    Ouvrir
                  </button>
                  <button 
                    @click.stop="toggleWorkspaceMenu(workspace.id)"
                    class="text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProfileStore } from '../stores/profileStore.js'

// Props du router
const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()

// State local
const searchQuery = ref('')
const sortBy = ref('updated_at')
const viewMode = ref('grid')
const activeMenu = ref(null)

// Computed
const profileType = computed(() => route.params.profileType)

const currentProfile = computed(() => {
  return profileStore.getProfileById(profileType.value)
})

const workspaces = computed(() => {
  return profileStore.getWorkspacesByProfile(profileType.value)
})

const filteredWorkspaces = computed(() => {
  let filtered = workspaces.value

  // Filtrage par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(workspace => 
      workspace.name.toLowerCase().includes(query) ||
      (workspace.description && workspace.description.toLowerCase().includes(query))
    )
  }

  // Tri
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'created_at':
        return new Date(a.created_at) - new Date(b.created_at)
      case 'updated_at':
      default:
        return new Date(b.updated_at) - new Date(a.updated_at)
    }
  })

  return filtered
})

const emptyStateTitle = computed(() => {
  const titles = {
    'consultant-si': 'Aucun projet client encore',
    'technicien-si': 'Aucun projet ERP en cours',
    'generic': 'Aucun espace de travail'
  }
  return titles[profileType.value] || 'Aucun espace de travail'
})

const emptyStateDescription = computed(() => {
  const descriptions = {
    'consultant-si': 'Créez votre premier espace pour organiser vos projets clients avec une structure optimisée.',
    'technicien-si': 'Démarrez votre premier projet ERP avec une structure adaptée aux phases techniques.',
    'generic': 'Créez votre premier espace et laissez l\'IA détecter automatiquement votre contexte organisationnel.'
  }
  return descriptions[profileType.value] || 'Créez votre premier espace de travail.'
})

const createButtonText = computed(() => {
  const texts = {
    'consultant-si': 'Créer un projet client',
    'technicien-si': 'Créer un projet ERP',
    'generic': 'Créer un espace'
  }
  return texts[profileType.value] || 'Créer un espace'
})

// Methods
const openWorkspace = (workspace) => {
  router.push(`/${profileType.value}/workspace/${workspace.id}`)
}

const toggleWorkspaceMenu = (workspaceId) => {
  activeMenu.value = activeMenu.value === workspaceId ? null : workspaceId
}

const editWorkspace = (workspace) => {
  const newName = prompt('Nouveau nom:', workspace.name)
  if (newName && newName !== workspace.name) {
    // TODO: Implémenter la mise à jour via Supabase
    console.log('Renommer workspace:', workspace.id, 'vers', newName)
  }
  activeMenu.value = null
}

const duplicateWorkspace = (workspace) => {
  // TODO: Implémenter la duplication
  console.log('Dupliquer workspace:', workspace.id)
  activeMenu.value = null
}

const exportWorkspace = (workspace) => {
  const dataToExport = {
    workspace,
    exportDate: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `workspace-${workspace.name}-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  activeMenu.value = null
}

const deleteWorkspace = (workspace) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer "${workspace.name}" ? Cette action est irréversible.`)) {
    // TODO: Implémenter la suppression via Supabase
    console.log('Supprimer workspace:', workspace.id)
  }
  activeMenu.value = null
}

const getTaskCountForColumn = (workspace, columnIndex) => {
  // Mock data - à remplacer par vraies données
  return Math.floor(Math.random() * 5)
}

const getTotalTasks = (workspace) => {
  // Mock data - à remplacer par vraies données
  return Math.floor(Math.random() * 20) + 5
}

const getProgress = (workspace) => {
  // Mock data - à remplacer par vraie progression
  return Math.floor(Math.random() * 100)
}

const getProjectTypeLabel = (projectType) => {
  const labels = {
    'CONSULTANT_SI': 'Consultant SI',
    'CONSULTANT_SI_COMPLEX': 'Consultant SI+',
    'TECHNICIEN_SI_ERP': 'ERP Technique',
    'TECHNICIEN_SI_ERP_COMPLEX': 'ERP Complexe',
    'CONSULTANT_AGILE': 'Agile',
    'PROJECT_MANAGEMENT': 'Gestion Projet',
    'GENERIC': 'Générique'
  }
  return labels[projectType] || 'Standard'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
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
  
  return formatDate(dateString)
}

const closeMenuOnClickOutside = (event) => {
  if (!event.target.closest('.workspace-menu')) {
    activeMenu.value = null
  }
}

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

.workspace-card {
  @apply bg-white rounded-lg border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300;
}

.workspace-header {
  @apply mb-4;
}

.workspace-title {
  @apply text-lg font-medium text-gray-900 truncate;
}

.workspace-description {
  @apply text-sm text-gray-600 mt-1;
}

.workspace-menu-btn {
  @apply p-1 text-gray-400 hover:text-gray-600 rounded;
}

.workspace-menu {
  @apply absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10;
}

.menu-item {
  @apply block w-full text-left px-4 py-2 text-sm hover:bg-gray-100;
}

.workspace-body {
  @apply mb-4;
}

.columns-preview {
  @apply grid grid-cols-4 gap-2 mb-4;
}

.column-preview {
  @apply bg-gray-50 rounded p-2;
}

.column-header {
  @apply text-xs font-medium text-gray-700 mb-2 truncate;
}

.column-tasks {
  @apply space-y-1;
}

.task-preview {
  @apply h-2 bg-gray-200 rounded;
}

.workspace-stats {
  @apply flex justify-between items-center text-center;
}

.stat {
  @apply flex flex-col;
}

.stat-value {
  @apply text-sm font-medium text-gray-900;
}

.stat-label {
  @apply text-xs text-gray-500;
}

.workspace-footer {
  @apply flex items-center justify-between;
}

.workspace-tags {
  @apply flex gap-2;
}

.workspace-tag {
  @apply text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded;
}

.workspace-tag.active {
  @apply bg-green-100 text-green-700;
}

.open-btn {
  @apply inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800;
}

.workspace-list-header {
  @apply bg-gray-50 border-b;
}

.workspace-list-item {
  @apply border-b border-gray-200 hover:bg-gray-50 cursor-pointer;
}

.workspace-icon {
  @apply text-lg;
}

.workspace-type-badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800;
}

.progress-bar {
  @apply w-16 bg-gray-200 rounded-full h-2;
}

.progress-fill {
  @apply bg-indigo-600 h-2 rounded-full transition-all duration-300;
}
</style>