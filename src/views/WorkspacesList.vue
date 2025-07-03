<template>
  <div class="min-h-screen bg-white">
    <!-- Header Épuré -->
    <header class="border-b border-gray-100">
      <div class="max-w-4xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <router-link to="/" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </router-link>
            <div>
              <h1 class="text-xl font-medium text-gray-900">Espaces</h1>
              <div v-if="workspaces.length > 0" class="text-sm text-gray-500">
                {{ workspaces.length }} espace{{ workspaces.length > 1 ? 's' : '' }}
                <span v-if="favorites.size > 0"> • {{ favorites.size }} favori{{ favorites.size > 1 ? 's' : '' }}</span>
              </div>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Recherche rapide -->
            <div class="relative">
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher..."
                class="w-48 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 bg-gray-50"
              />
              <svg v-if="!searchQuery" class="absolute right-3 top-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button v-else @click="searchQuery = ''" class="absolute right-3 top-2 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <router-link to="/" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              + Nouveau
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-6 py-8">
      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-16">
        <div class="text-sm text-gray-500">Chargement...</div>
      </div>

      <!-- Correction email -->
      <div v-else-if="loadError" class="text-center py-8">
        <div class="max-w-sm mx-auto space-y-4">
          <p class="text-sm text-gray-600">Saisissez votre email :</p>
          <div class="flex">
            <input 
              v-model="manualEmail"
              type="email"
              placeholder="votre.email@exemple.com"
              class="flex-1 px-3 py-2 border border-gray-200 rounded-l-lg text-sm focus:outline-none focus:border-indigo-300"
              @keyup.enter="loadWorkspacesWithEmail"
            />
            <button 
              @click="loadWorkspacesWithEmail"
              :disabled="!manualEmail || isLoading"
              class="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-r-lg hover:bg-indigo-100 text-sm font-medium"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="workspaces.length === 0" class="text-center py-16">
        <p class="text-gray-600 mb-6">Aucun espace trouvé</p>
        <router-link to="/" class="text-sm text-indigo-600 hover:text-indigo-700">
          Créer le premier →
        </router-link>
      </div>

      <!-- Workspaces Grid -->
      <div v-else class="space-y-3">
        <div 
          v-for="workspace in filteredWorkspaces" 
          :key="workspace.id"
          class="group bg-white border border-gray-100 rounded-lg p-6 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer relative"
          @click="openWorkspace(workspace)"
          @mouseenter="showPreview = workspace.id"
          @mouseleave="showPreview = null"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-1">
                <!-- Indicateur de statut -->
                <div 
                  :class="getWorkspaceStatus(workspace).color"
                  class="w-2 h-2 rounded-full"
                  :title="getWorkspaceStatus(workspace).label"
                ></div>
                <h3 class="font-medium text-gray-900 flex-1">
                  {{ workspace.name || 'Espace sans nom' }}
                </h3>
                <!-- Favori -->
                <button 
                  @click.stop="toggleFavorite(workspace.id)"
                  class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-amber-500"
                  :class="{ 'opacity-100 text-amber-500': favorites.has(workspace.id) }"
                >
                  <svg class="w-4 h-4" :fill="favorites.has(workspace.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </div>
              
              <div class="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <span>{{ formatStructureType(workspace.structure_type) }}</span>
                <span>{{ getLastActivity(workspace) }}</span>
              </div>
              
              <!-- Colonnes -->
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="(column, index) in getWorkspaceColumns(workspace).slice(0, 4)" 
                  :key="index"
                  class="inline-block bg-gray-50 text-gray-600 px-2 py-1 rounded text-xs"
                >
                  {{ column }}
                </span>
                <span 
                  v-if="getWorkspaceColumns(workspace).length > 4"
                  class="inline-block text-gray-400 text-xs px-1"
                >
                  +{{ getWorkspaceColumns(workspace).length - 4 }}
                </span>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="relative ml-4">
              <button 
                @click.stop="toggleMenu(workspace.id)"
                class="text-gray-400 hover:text-gray-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                </svg>
              </button>
              
              <div v-if="openMenu === workspace.id" 
                   class="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div class="py-1 text-sm">
                  <button @click="openWorkspace(workspace)" class="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50">
                    Ouvrir
                  </button>
                  <button @click="duplicateWorkspace(workspace)" class="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50">
                    Dupliquer
                  </button>
                  <button @click="exportWorkspace(workspace)" class="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50">
                    Exporter
                  </button>
                  <hr class="my-1">
                  <button @click="deleteWorkspace(workspace)" class="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Preview Tooltip -->
          <div 
            v-if="showPreview === workspace.id"
            class="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20"
          >
            <div class="space-y-3">
              <div>
                <h4 class="font-medium text-gray-900 mb-2">{{ workspace.name || 'Espace sans nom' }}</h4>
                <p class="text-sm text-gray-600">{{ workspace.description || 'Aucune description' }}</p>
              </div>
              
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">Type :</span>
                  <div class="font-medium">{{ formatStructureType(workspace.structure_type) }}</div>
                </div>
                <div>
                  <span class="text-gray-500">Statut :</span>
                  <div class="flex items-center space-x-1">
                    <div :class="getWorkspaceStatus(workspace).color" class="w-2 h-2 rounded-full"></div>
                    <span class="font-medium">{{ getWorkspaceStatus(workspace).label }}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <span class="text-gray-500 text-sm">Colonnes :</span>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span 
                    v-for="(column, index) in getWorkspaceColumns(workspace)" 
                    :key="index"
                    class="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    {{ column }}
                  </span>
                </div>
              </div>
              
              <div class="pt-2 border-t border-gray-100 text-xs text-gray-500">
                Créé {{ formatDate(workspace.created_at) }} • Modifié {{ getLastActivity(workspace) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFormStore } from '../stores/formStore.js'

// Router
const router = useRouter()

// Store
const formStore = useFormStore()

// State
const isLoading = ref(true)
const workspaces = ref([])
const openMenu = ref(null)
const loadError = ref(null)
const manualEmail = ref('')
const searchQuery = ref('')
const favorites = ref(new Set())
const showPreview = ref(null)

// Email persistence helpers
const STORAGE_KEY = 'indx_user_email'

const getSavedEmail = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || ''
  } catch (error) {
    console.warn('❌ [WORKSPACES-LIST] Erreur lecture localStorage:', error)
    return ''
  }
}

const saveEmail = (email) => {
  try {
    if (email && email.includes('@')) {
      localStorage.setItem(STORAGE_KEY, email)
      // Synchroniser avec le formStore pour cohérence
      if (!formStore.userInfo.email) {
        formStore.updateUserInfo({ email })
      }
      console.log('💾 [WORKSPACES-LIST] Email sauvegardé:', email)
    }
  } catch (error) {
    console.warn('❌ [WORKSPACES-LIST] Erreur sauvegarde localStorage:', error)
  }
}

// Computed
const filteredWorkspaces = computed(() => {
  let filtered = workspaces.value
  
  // Recherche textuelle
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(workspace => {
      const name = (workspace.name || '').toLowerCase()
      const type = formatStructureType(workspace.structure_type).toLowerCase()
      const columns = getWorkspaceColumns(workspace).join(' ').toLowerCase()
      
      return name.includes(query) || 
             type.includes(query) || 
             columns.includes(query)
    })
  }
  
  return filtered.sort((a, b) => {
    // Favoris en premier
    const aFav = favorites.value.has(a.id)
    const bFav = favorites.value.has(b.id)
    if (aFav && !bFav) return -1
    if (!aFav && bFav) return 1
    
    // Puis par date
    return new Date(b.created_at) - new Date(a.created_at)
  })
})

// Helper pour calculer le statut d'activité
const getWorkspaceStatus = (workspace) => {
  const now = new Date()
  const updatedAt = new Date(workspace.updated_at || workspace.created_at)
  const daysDiff = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24))
  
  if (daysDiff <= 7) return { type: 'active', label: 'Actif', color: 'bg-green-400' }
  if (daysDiff <= 30) return { type: 'moderate', label: 'Modéré', color: 'bg-amber-400' }
  return { type: 'inactive', label: 'Inactif', color: 'bg-red-400' }
}

// Helper pour formatter la dernière activité
const getLastActivity = (workspace) => {
  const now = new Date()
  const updatedAt = new Date(workspace.updated_at || workspace.created_at)
  const diffInHours = Math.floor((now - updatedAt) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'À l\'instant'
  if (diffInHours < 24) return `Il y a ${diffInHours}h`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `Il y a ${diffInDays}j`
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} sem.`
  
  return `Il y a ${Math.floor(diffInDays / 30)} mois`
}

// Methods
const loadWorkspaces = async () => {
  isLoading.value = true
  loadError.value = null
  
  try {
    // PRIORITÉ: email sauvegardé > email du formStore
    let emailToUse = getSavedEmail() || formStore.userInfo.email
    
    if (emailToUse) {
      console.log('📧 [WORKSPACES-LIST] Email trouvé:', emailToUse, {
        fromStorage: !!getSavedEmail(),
        fromStore: !!formStore.userInfo.email
      })
      
      const result = await formStore.getUserWorkspaces(emailToUse)
      
      if (result.success) {
        workspaces.value = result.data || []
        loadError.value = null
        // Sauvegarder l'email si ça a marché
        saveEmail(emailToUse)
        console.log('📋 [WORKSPACES-LIST] Espaces chargés:', workspaces.value.length)
      } else {
        console.warn('⚠️ [WORKSPACES-LIST] Échec chargement:', result.error)
        loadError.value = result.error || 'Erreur inconnue'
        workspaces.value = []
      }
    } else {
      // Aucun email disponible
      console.warn('⚠️ [WORKSPACES-LIST] Aucun email disponible')
      loadError.value = 'Email utilisateur requis pour charger les espaces'
      workspaces.value = []
    }
  } catch (error) {
    console.error('❌ [WORKSPACES-LIST] Erreur chargement espaces:', error)
    loadError.value = error.message || 'Erreur de connexion'
    workspaces.value = []
  } finally {
    isLoading.value = false
  }
}

const loadWorkspacesWithEmail = async () => {
  if (!manualEmail.value) return
  
  isLoading.value = true
  loadError.value = null
  
  try {
    const result = await formStore.getUserWorkspaces(manualEmail.value)
    if (result.success) {
      workspaces.value = result.data || []
      loadError.value = null
      // Sauvegarder l'email qui fonctionne
      saveEmail(manualEmail.value)
      console.log('📋 [WORKSPACES-LIST] Espaces chargés avec email manuel:', workspaces.value.length)
    } else {
      loadError.value = result.error || 'Erreur inconnue'
      workspaces.value = []
    }
  } catch (error) {
    console.error('❌ [WORKSPACES-LIST] Erreur chargement avec email manuel:', error)
    loadError.value = error.message || 'Erreur de connexion'
    workspaces.value = []
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}

const formatStructureType = (type) => {
  const types = {
    'CLIENT_BASED': 'Clients',
    'TEMPORAL': 'Temporel',
    'PHASED': 'Phases',
    'VERSIONED': 'Versions',
    'PROCESS_BASED': 'Processus',
    'RESOURCE_BASED': 'Ressources',
    'CONSULTANT_SI': 'Consultant SI',
    'TECHNICIEN_SI': 'Technicien SI'
  }
  return types[type] || 'Générique'
}

const getWorkspaceColumns = (workspace) => {
  // D'abord, essayer les colonnes directement depuis Supabase
  if (workspace.columns && Array.isArray(workspace.columns)) {
    return workspace.columns
  }
  
  // Fallback basé sur le type détecté
  const defaults = {
    'CLIENT_BASED': ['Prospects', 'Client A', 'Client B'],
    'TEMPORAL': ['Sprint 1', 'Sprint 2', 'Backlog'],
    'PHASED': ['Conception', 'Réalisation', 'Tests'],
    'CONSULTANT_SI': ['Projets Clients', 'Maintenance', 'Support'],
    'RESOURCE_BASED': ['Équipe A', 'Équipe B', 'Support']
  }
  
  const workspaceType = workspace.structure_type || workspace.detected_context || workspace.project_type
  return defaults[workspaceType] || ['À faire', 'En cours', 'En révision', 'Terminé']
}

const toggleMenu = (workspaceId) => {
  openMenu.value = openMenu.value === workspaceId ? null : workspaceId
}

const openWorkspace = (workspace) => {
  console.log('Ouvrir espace:', workspace.id)
  alert(`Ouverture de l'espace "${workspace.name || 'Sans nom'}" - Fonctionnalité à implémenter`)
  openMenu.value = null
}

const duplicateWorkspace = (workspace) => {
  console.log('Dupliquer espace:', workspace.id)
  alert('Duplication d\'espace - Fonctionnalité à implémenter')
  openMenu.value = null
}

const exportWorkspace = (workspace) => {
  console.log('Exporter espace:', workspace.id)
  alert('Export d\'espace - Fonctionnalité à implémenter')
  openMenu.value = null
}

const deleteWorkspace = (workspace) => {
  const confirmed = confirm(`Supprimer définitivement l'espace "${workspace.name || 'Sans nom'}" ?`)
  if (confirmed) {
    workspaces.value = workspaces.value.filter(w => w.id !== workspace.id)
    favorites.value.delete(workspace.id)
  }
  openMenu.value = null
}

const toggleFavorite = (workspaceId) => {
  if (favorites.value.has(workspaceId)) {
    favorites.value.delete(workspaceId)
  } else {
    favorites.value.add(workspaceId)
  }
  
  // Sauvegarder les favoris dans localStorage
  try {
    localStorage.setItem('indx_favorites', JSON.stringify([...favorites.value]))
  } catch (error) {
    console.warn('Erreur sauvegarde favoris:', error)
  }
}

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    openMenu.value = null
  }
}

// Synchronisation email au démarrage
const initializeEmailSync = () => {
  const savedEmail = getSavedEmail()
  const storeEmail = formStore.userInfo.email
  
  // Prioriser l'email sauvegardé et synchroniser
  if (savedEmail && !storeEmail) {
    formStore.updateUserInfo({ email: savedEmail })
    console.log('🔄 [WORKSPACES-LIST] Email synchronisé du localStorage vers store:', savedEmail)
  } else if (storeEmail && !savedEmail) {
    saveEmail(storeEmail)
    console.log('🔄 [WORKSPACES-LIST] Email synchronisé du store vers localStorage:', storeEmail)
  }
  
  // Pré-remplir le champ manuel
  const finalEmail = savedEmail || storeEmail
  if (finalEmail) {
    manualEmail.value = finalEmail
    console.log('📧 [WORKSPACES-LIST] Email pré-rempli:', finalEmail)
  }
}

// Charger les favoris depuis localStorage
const loadFavorites = () => {
  try {
    const saved = localStorage.getItem('indx_favorites')
    if (saved) {
      const favArray = JSON.parse(saved)
      favorites.value = new Set(favArray)
      console.log('⭐ [WORKSPACES-LIST] Favoris chargés:', favArray.length)
    }
  } catch (error) {
    console.warn('❌ [WORKSPACES-LIST] Erreur chargement favoris:', error)
  }
}

// Lifecycle
onMounted(() => {
  // Synchroniser les emails entre localStorage et store
  initializeEmailSync()
  
  // Charger les favoris
  loadFavorites()
  
  // Charger les espaces de travail
  loadWorkspaces()
  
  // Gestionnaire de clic extérieur pour fermer les menus
  document.addEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Styles épurés déjà intégrés dans les classes Tailwind */
</style>