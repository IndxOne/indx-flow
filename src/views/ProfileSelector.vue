<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
    <!-- Header -->
    <div class="text-center pt-16 pb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        🎯 INDX Flow
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Détection contextuelle intelligente pour une organisation optimale
      </p>
      <p class="text-sm text-gray-500 mt-2">
        Choisissez votre profil ou laissez l'IA détecter automatiquement votre contexte
      </p>
    </div>

    <!-- Sélecteur de profils -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        
        <!-- Consultant SI -->
        <div 
          class="profile-card consultant-si"
          @click="selectProfile('consultant-si')"
          :class="{ 'ring-2 ring-indigo-500': hoveredProfile === 'consultant-si' }"
          @mouseenter="hoveredProfile = 'consultant-si'"
          @mouseleave="hoveredProfile = null"
        >
          <div class="profile-header">
            <div class="profile-icon">👔</div>
            <h3 class="profile-title">Consultant SI</h3>
            <div class="workspace-count">
              {{ getWorkspaceCount('consultant-si') }} espaces
            </div>
          </div>
          
          <div class="profile-description">
            <p>Gestion projets clients multiples avec équipes dédiées</p>
            
            <div class="profile-features">
              <span class="feature-tag">📋 Projets Clients</span>
              <span class="feature-tag">⚙️ Maintenance SI</span>
              <span class="feature-tag">🔧 Support Tech</span>
            </div>
            
            <div class="profile-contexts">
              <small class="text-gray-500">
                Contextes : Client-based • Temporal • Resource-based
              </small>
            </div>
          </div>
          
          <div class="profile-action">
            <button class="btn-profile">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              Accéder
            </button>
          </div>
        </div>

        <!-- Technicien SI -->
        <div 
          class="profile-card technicien-si"
          @click="selectProfile('technicien-si')"
          :class="{ 'ring-2 ring-emerald-500': hoveredProfile === 'technicien-si' }"
          @mouseenter="hoveredProfile = 'technicien-si'"
          @mouseleave="hoveredProfile = null"
        >
          <div class="profile-header">
            <div class="profile-icon">🔧</div>
            <h3 class="profile-title">Technicien SI</h3>
            <div class="workspace-count">
              {{ getWorkspaceCount('technicien-si') }} espaces
            </div>
          </div>
          
          <div class="profile-description">
            <p>Projets ERP et infrastructure technique</p>
            
            <div class="profile-features">
              <span class="feature-tag">🎯 Analyse & Specs</span>
              <span class="feature-tag">⚙️ Configuration</span>
              <span class="feature-tag">🧪 Tests & Go-Live</span>
            </div>
            
            <div class="profile-contexts">
              <small class="text-gray-500">
                Contextes : Process-based • Phased • Resource-based
              </small>
            </div>
          </div>
          
          <div class="profile-action">
            <button class="btn-profile">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              Accéder
            </button>
          </div>
        </div>

        <!-- Détection automatique -->
        <div 
          class="profile-card generic"
          @click="selectProfile('generic')"
          :class="{ 'ring-2 ring-gray-500': hoveredProfile === 'generic' }"
          @mouseenter="hoveredProfile = 'generic'"
          @mouseleave="hoveredProfile = null"
        >
          <div class="profile-header">
            <div class="profile-icon">🎯</div>
            <h3 class="profile-title">Détection Auto</h3>
            <div class="workspace-count">
              {{ getWorkspaceCount('generic') }} espaces
            </div>
          </div>
          
          <div class="profile-description">
            <p>Laissez l'IA détecter automatiquement votre contexte organisationnel</p>
            
            <div class="profile-features">
              <span class="feature-tag">🤖 IA Contextuelle</span>
              <span class="feature-tag">🎯 Auto-adaptatif</span>
              <span class="feature-tag">📊 Multi-contextes</span>
            </div>
            
            <div class="profile-contexts">
              <small class="text-gray-500">
                Analyse intelligente de votre description
              </small>
            </div>
          </div>
          
          <div class="profile-action">
            <button class="btn-profile">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              Analyser
            </button>
          </div>
        </div>
      </div>

      <!-- Statistiques globales -->
      <div class="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4">📊 Aperçu de vos espaces</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="stat-card">
            <div class="stat-icon">🏢</div>
            <div class="stat-content">
              <div class="stat-number">{{ totalWorkspaces }}</div>
              <div class="stat-label">Espaces créés</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-number">{{ totalAnalyses }}</div>
              <div class="stat-label">Analyses effectuées</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <div class="stat-number">{{ averageConfidence }}%</div>
              <div class="stat-label">Confiance moyenne</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Historique récent -->
      <div v-if="recentWorkspaces.length > 0" class="bg-white rounded-xl shadow-sm border p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">🕐 Espaces récents</h3>
          <button 
            @click="loadRecentWorkspaces" 
            class="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Actualiser
          </button>
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="workspace in recentWorkspaces" 
            :key="workspace.id"
            class="recent-workspace"
            @click="openWorkspace(workspace)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="workspace-profile-icon">
                  {{ getProfileIcon(workspace.profileId) }}
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ workspace.name }}</div>
                  <div class="text-sm text-gray-500">{{ formatDate(workspace.updated_at) }}</div>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <span class="profile-badge" :class="getProfileBadgeClass(workspace.profileId)">
                  {{ getProfileLabel(workspace.profileId) }}
                </span>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '../stores/profileStore.js'
import { useFormStore } from '../stores/formStore.js'

// Stores
const router = useRouter()
const profileStore = useProfileStore()
const formStore = useFormStore()

// State
const hoveredProfile = ref(null)
const recentWorkspaces = ref([])
const totalAnalyses = ref(0)
const averageConfidence = ref(87)

// Computed
const totalWorkspaces = computed(() => {
  return Object.values(profileStore.userProfiles).flat().length
})

// Methods
const getWorkspaceCount = (profileId) => {
  return profileStore.getWorkspacesByProfile(profileId).length
}

const selectProfile = (profileId) => {
  profileStore.setCurrentProfile(profileId)
  
  // Navigation vers le dashboard du profil
  router.push(`/${profileId}`)
}

const getProfileIcon = (profileId) => {
  const profile = profileStore.getProfileById(profileId)
  return profile?.icon || '🎯'
}

const getProfileLabel = (profileId) => {
  const profile = profileStore.getProfileById(profileId)
  return profile?.label || 'Générique'
}

const getProfileBadgeClass = (profileId) => {
  const classes = {
    'consultant-si': 'bg-indigo-100 text-indigo-800',
    'technicien-si': 'bg-emerald-100 text-emerald-800',
    'generic': 'bg-gray-100 text-gray-800'
  }
  return classes[profileId] || classes.generic
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const openWorkspace = (workspace) => {
  const profileId = workspace.profileId || 'generic'
  router.push(`/${profileId}/workspace/${workspace.id}`)
}

const loadRecentWorkspaces = async () => {
  // Charger les workspaces récents tous profils confondus
  const allWorkspaces = Object.values(profileStore.userProfiles).flat()
  
  // Trier par date de mise à jour et prendre les 5 plus récents
  recentWorkspaces.value = allWorkspaces
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5)
}

const loadStats = async () => {
  try {
    // Charger les statistiques depuis l'historique
    const historyResult = await formStore.getAnalysisHistory(20)
    
    if (historyResult.success) {
      totalAnalyses.value = historyResult.data.length
      
      if (historyResult.data.length > 0) {
        const avgConf = historyResult.data.reduce((sum, analysis) => 
          sum + (analysis.confidence || 0), 0) / historyResult.data.length
        averageConfidence.value = Math.round(avgConf)
      }
    }
  } catch (error) {
    console.error('❌ [PROFILE-SELECTOR] Erreur chargement stats:', error)
  }
}

// Lifecycle
onMounted(async () => {
  // Charger les workspaces utilisateur si email disponible
  const userEmail = formStore.userInfo?.email
  if (userEmail) {
    await profileStore.loadUserWorkspaces(userEmail)
    await loadRecentWorkspaces()
  }
  
  await loadStats()
})
</script>

<style scoped>
.profile-card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105;
}

.profile-card.consultant-si:hover {
  @apply border-indigo-300 bg-indigo-50;
}

.profile-card.technicien-si:hover {
  @apply border-emerald-300 bg-emerald-50;
}

.profile-card.generic:hover {
  @apply border-gray-300 bg-gray-50;
}

.profile-header {
  @apply text-center mb-4;
}

.profile-icon {
  @apply text-3xl mb-2;
}

.profile-title {
  @apply text-xl font-bold text-gray-900 mb-1;
}

.workspace-count {
  @apply text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block;
}

.profile-description {
  @apply text-center mb-6;
}

.profile-description p {
  @apply text-gray-600 mb-4;
}

.profile-features {
  @apply flex flex-wrap justify-center gap-2 mb-3;
}

.feature-tag {
  @apply text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded;
}

.profile-contexts {
  @apply text-center;
}

.profile-action {
  @apply text-center;
}

.btn-profile {
  @apply inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors;
}

.stat-card {
  @apply flex items-center space-x-3 p-4 bg-gray-50 rounded-lg;
}

.stat-icon {
  @apply text-2xl;
}

.stat-number {
  @apply text-2xl font-bold text-gray-900;
}

.stat-label {
  @apply text-sm text-gray-600;
}

.recent-workspace {
  @apply p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors;
}

.workspace-profile-icon {
  @apply text-lg;
}

.profile-badge {
  @apply text-xs px-2 py-1 rounded-full;
}
</style>