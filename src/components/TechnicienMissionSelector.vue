<template>
  <div>
    <!-- Header de sélection mission -->
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        🔧 Choisissez votre type de mission
      </h2>
      <p class="text-gray-600 max-w-2xl mx-auto">
        Sélectionnez le type de mission technique pour obtenir une structure de travail optimisée
      </p>
    </div>

    <!-- Grille des missions -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div 
        v-for="mission in missions" 
        :key="mission.id"
        class="mission-card"
        @click="selectMission(mission)"
        :class="{ 'ring-2 ring-emerald-500': hoveredMission === mission.id }"
        @mouseenter="hoveredMission = mission.id"
        @mouseleave="hoveredMission = null"
      >
        <!-- Header mission -->
        <div class="mission-header">
          <div class="mission-icon">{{ mission.icon }}</div>
          <h3 class="mission-title">{{ mission.label }}</h3>
          <div class="mission-count">
            {{ getMissionWorkspaceCount(mission.id) }} espaces
          </div>
        </div>
        
        <!-- Description -->
        <div class="mission-description">
          <p>{{ mission.description }}</p>
          
          <!-- Structure preview -->
          <div class="structure-preview">
            <h4 class="structure-title">Structure :</h4>
            <div class="structure-columns">
              <span 
                v-for="(column, index) in mission.structure" 
                :key="index"
                class="structure-column"
              >
                {{ column }}
              </span>
            </div>
          </div>
          
          <!-- Contextes -->
          <div class="mission-contexts">
            <h4 class="contexts-title">Contextes :</h4>
            <div class="contexts-list">
              <span 
                v-for="context in mission.contexts" 
                :key="context"
                class="context-badge"
                :class="getContextBadgeClass(context)"
              >
                {{ formatContextType(context) }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Action -->
        <div class="mission-action">
          <button class="btn-mission">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            Sélectionner
          </button>
        </div>
      </div>
    </div>

    <!-- Statistiques missions -->
    <div class="bg-white rounded-xl shadow-sm border p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">📊 Vue d'ensemble de vos missions</h3>
      
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div 
          v-for="mission in missions" 
          :key="`stat-${mission.id}`"
          class="mission-stat"
        >
          <div class="stat-icon">{{ mission.icon }}</div>
          <div class="stat-content">
            <div class="stat-number">{{ getMissionWorkspaceCount(mission.id) }}</div>
            <div class="stat-label">{{ mission.label }}</div>
          </div>
        </div>
      </div>
      
      <!-- Actions globales -->
      <div class="flex justify-center mt-6 space-x-4">
        <router-link 
          :to="`/technicien-si/new`"
          class="btn-secondary"
        >
          🎯 Détection automatique
        </router-link>
        
        <button 
          @click="showImportDialog = true"
          class="btn-secondary"
        >
          📂 Importer des données
        </button>
        
        <router-link 
          to="/analytics"
          class="btn-secondary"
        >
          📈 Analytics missions
        </router-link>
      </div>
    </div>

    <!-- Dialog d'import (placeholder) -->
    <div 
      v-if="showImportDialog" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showImportDialog = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
        <h3 class="text-lg font-medium text-gray-900 mb-4">Import de données</h3>
        <p class="text-gray-600 mb-4">
          Fonctionnalité d'import en cours de développement. 
          Vous pourrez bientôt importer vos projets existants.
        </p>
        <div class="flex justify-end">
          <button 
            @click="showImportDialog = false"
            class="btn-primary"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProfileStore } from '../stores/profileStore.js'

// Router
const router = useRouter()
const route = useRoute()
const profileStore = useProfileStore()

// State
const hoveredMission = ref(null)
const showImportDialog = ref(false)

// Computed
const missions = computed(() => {
  const technicienProfile = profileStore.getProfileById('technicien-si')
  return Object.values(technicienProfile.missions || {})
})

// Methods
const selectMission = (mission) => {
  // Navigation vers la liste des workspaces de cette mission
  router.push(`/technicien-si/${mission.id}`)
}

const getMissionWorkspaceCount = (missionId) => {
  // Pour l'instant, données mock
  // TODO: Récupérer les vrais workspaces par mission depuis Supabase
  const mockCounts = {
    'integration-systemes': 3,
    'maintenance-ticketing': 7,
    'support-programme': 2,
    'developpement-outils': 4,
    'gestion-projet': 1
  }
  return mockCounts[missionId] || 0
}

const formatContextType = (type) => {
  const formats = {
    PROCESS_BASED: 'Processus',
    PHASED: 'Phases',
    TEMPORAL: 'Temporel',
    RESOURCE_BASED: 'Ressources',
    VERSIONED: 'Versions'
  }
  return formats[type] || type
}

const getContextBadgeClass = (context) => {
  const classes = {
    PROCESS_BASED: 'bg-rose-100 text-rose-800',
    PHASED: 'bg-blue-100 text-blue-800',
    TEMPORAL: 'bg-amber-100 text-amber-800',
    RESOURCE_BASED: 'bg-indigo-100 text-indigo-800',
    VERSIONED: 'bg-purple-100 text-purple-800'
  }
  return classes[context] || 'bg-gray-100 text-gray-800'
}
</script>

<style scoped>
.mission-card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105;
}

.mission-card:hover {
  @apply border-emerald-300 bg-emerald-50;
}

.mission-header {
  @apply text-center mb-4;
}

.mission-icon {
  @apply text-3xl mb-2;
}

.mission-title {
  @apply text-lg font-bold text-gray-900 mb-1;
}

.mission-count {
  @apply text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block;
}

.mission-description {
  @apply mb-6;
}

.mission-description p {
  @apply text-gray-600 mb-4 text-sm;
}

.structure-preview {
  @apply mb-4;
}

.structure-title {
  @apply text-xs font-medium text-gray-700 mb-2;
}

.structure-columns {
  @apply flex flex-wrap gap-1;
}

.structure-column {
  @apply text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded;
}

.mission-contexts {
  @apply mb-2;
}

.contexts-title {
  @apply text-xs font-medium text-gray-700 mb-2;
}

.contexts-list {
  @apply flex flex-wrap gap-1;
}

.context-badge {
  @apply text-xs px-2 py-1 rounded;
}

.mission-action {
  @apply text-center;
}

.btn-mission {
  @apply inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors;
}

.btn-primary {
  @apply inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors;
}

.btn-secondary {
  @apply inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors;
}

.mission-stat {
  @apply flex items-center space-x-3 p-4 bg-gray-50 rounded-lg;
}

.stat-icon {
  @apply text-xl;
}

.stat-number {
  @apply text-lg font-bold text-gray-900;
}

.stat-label {
  @apply text-xs text-gray-600 truncate;
}
</style>