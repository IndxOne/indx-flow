<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <router-link to="/" class="text-indigo-600 hover:text-indigo-800 mr-4">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </router-link>
            <h1 class="text-2xl font-bold text-gray-900">
              📊 Analytics & Coûts
            </h1>
          </div>
          
          <!-- Period Selector -->
          <div class="flex items-center space-x-4">
            <select 
              v-model="selectedPeriod" 
              @change="loadDashboard"
              class="form-input text-sm py-1 px-2"
            >
              <option value="1">Dernières 24h</option>
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
            </select>
            
            <button 
              @click="loadDashboard" 
              :disabled="isLoading"
              class="btn-secondary text-sm py-1 px-3"
            >
              <svg v-if="isLoading" class="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Actualiser
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="isLoading && !dashboardData" class="text-center py-12">
        <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600">Chargement des analytics...</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-600 mb-4">
          <svg class="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-lg font-medium">Erreur de chargement</p>
          <p class="text-sm text-gray-600 mt-1">{{ error }}</p>
        </div>
        <button @click="loadDashboard" class="btn-primary">
          Réessayer
        </button>
      </div>

      <div v-else-if="dashboardData" class="space-y-8">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Total Analyses"
            :value="dashboardData.summary.totalSubmissions"
            icon="📊"
            :trend="getTrend('submissions')"
          />
          <SummaryCard
            title="Confiance Moyenne"
            :value="`${dashboardData.summary.avgConfidence}%`"
            icon="🎯"
            :trend="getTrend('confidence')"
          />
          <SummaryCard
            title="Temps Moyen"
            :value="`${dashboardData.summary.avgAnalysisTime}ms`"
            icon="⚡"
            :trend="getTrend('time')"
          />
          <SummaryCard
            title="Coût Total"
            :value="`${(dashboardData.summary.avgCost * dashboardData.summary.totalSubmissions * 1000).toFixed(2)}m€`"
            icon="💰"
            :trend="getTrend('cost')"
          />
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Context Distribution -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Distribution par Contexte
            </h3>
            <ContextChart :data="dashboardData.distribution.byContext" />
          </div>

          <!-- Mode Performance -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Performance par Mode
            </h3>
            <ModeChart :data="dashboardData.distribution.byMode" />
          </div>
        </div>

        <!-- Cost Analysis -->
        <div class="card">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-medium text-gray-900">
              💰 Analyse des Coûts
            </h3>
            <button 
              @click="loadCostAnalysis" 
              class="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Détails complets
            </button>
          </div>
          
          <CostAnalysis 
            v-if="costData"
            :data="costData"
            :period="selectedPeriod"
          />
          <div v-else class="text-center py-8 text-gray-500">
            <button @click="loadCostAnalysis" class="btn-secondary">
              Charger l'analyse des coûts
            </button>
          </div>
        </div>

        <!-- Method Comparison -->
        <div class="card">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-medium text-gray-900">
              🔍 Comparaison des Méthodes
            </h3>
            <div class="text-sm text-gray-600">
              Efficacité globale: {{ getOverallEfficiency() }}
            </div>
          </div>
          
          <MethodComparison 
            v-if="comparisonData"
            :data="comparisonData"
          />
          <div v-else class="text-center py-8 text-gray-500">
            <button @click="loadComparison" class="btn-secondary">
              Charger la comparaison
            </button>
          </div>
        </div>

        <!-- Daily Trends -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            📈 Évolution Quotidienne
          </h3>
          <DailyTrends :data="dashboardData.trends.daily" />
        </div>

        <!-- Recommendations -->
        <div v-if="recommendations.length > 0" class="card bg-blue-50 border-blue-200">
          <h3 class="text-lg font-medium text-blue-900 mb-4">
            💡 Recommandations d'Optimisation
          </h3>
          <div class="space-y-3">
            <div 
              v-for="rec in recommendations" 
              :key="rec.message"
              class="flex items-start space-x-3"
            >
              <span class="flex-shrink-0 text-lg">
                {{ rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢' }}
              </span>
              <div>
                <p class="text-sm font-medium text-blue-900">{{ rec.message }}</p>
                <p v-if="rec.action" class="text-xs text-blue-700 mt-1">
                  Action suggérée: {{ rec.action }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Technical Details (Development) -->
        <div v-if="isDevelopment" class="card bg-gray-50 border-gray-200">
          <details>
            <summary class="text-sm font-medium text-gray-700 cursor-pointer">
              🔧 Détails Techniques (Mode Développement)
            </summary>
            <div class="mt-4 text-xs text-gray-600 space-y-2">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <strong>Base de données:</strong><br>
                  {{ dashboardData.summary.totalSubmissions }} soumissions<br>
                  Période: {{ selectedPeriod }} jours
                </div>
                <div>
                  <strong>Performance:</strong><br>
                  Temps chargement: {{ loadTime }}ms<br>
                  Dernière mise à jour: {{ formatTime(dashboardData.timestamp) }}
                </div>
              </div>
              <div class="mt-4 p-2 bg-gray-100 rounded text-xs font-mono">
                {{ JSON.stringify(dashboardData.summary, null, 2) }}
              </div>
            </div>
          </details>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { contextApi } from '../services/api.js'

// Components
import SummaryCard from '../components/analytics/SummaryCard.vue'
import ContextChart from '../components/analytics/ContextChart.vue'
import ModeChart from '../components/analytics/ModeChart.vue'
import CostAnalysis from '../components/analytics/CostAnalysis.vue'
import MethodComparison from '../components/analytics/MethodComparison.vue'
import DailyTrends from '../components/analytics/DailyTrends.vue'

// State
const selectedPeriod = ref('7')
const isLoading = ref(false)
const error = ref('')
const dashboardData = ref(null)
const costData = ref(null)
const comparisonData = ref(null)
const loadTime = ref(0)
const isDevelopment = ref(import.meta.env.DEV)

// Computed
const recommendations = computed(() => {
  const recs = []
  
  if (dashboardData.value) {
    const { summary, distribution } = dashboardData.value
    
    // Recommandation basée sur l'usage hybride
    if (summary.hybridUsage < 30) {
      recs.push({
        priority: 'medium',
        message: 'Usage du mode hybride faible. Considérer l\'activation par défaut.',
        action: 'Configurer le mode hybride comme défaut'
      })
    }
    
    // Recommandation basée sur la confiance
    if (summary.avgConfidence < 70) {
      recs.push({
        priority: 'high',
        message: 'Confiance moyenne faible. Améliorer la base de mots-clés ou utiliser plus l\'IA.',
        action: 'Réviser les mots-clés contextuels ou baisser le seuil IA'
      })
    }
    
    // Recommandation basée sur les coûts
    if (summary.avgCost > 0.001) {
      recs.push({
        priority: 'low',
        message: 'Coût par analyse élevé. Optimiser l\'usage de l\'IA.',
        action: 'Augmenter le seuil de confiance pour le mode hybride'
      })
    }
  }
  
  if (costData.value?.recommendations) {
    recs.push(...costData.value.recommendations)
  }
  
  return recs
})

const getOverallEfficiency = () => {
  if (!dashboardData.value) return 'N/A'
  
  const { summary } = dashboardData.value
  const efficiencyScore = (summary.avgConfidence + (100 - summary.avgAnalysisTime/20) + summary.hybridUsage) / 3
  
  if (efficiencyScore >= 80) return 'Excellente'
  if (efficiencyScore >= 60) return 'Bonne'
  if (efficiencyScore >= 40) return 'Moyenne'
  return 'À améliorer'
}

// Methods
const loadDashboard = async () => {
  isLoading.value = true
  error.value = ''
  const startTime = Date.now()
  
  try {
    const response = await fetch(`/api/analytics/dashboard?period=${selectedPeriod.value}`)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur de chargement')
    }
    
    dashboardData.value = data
    loadTime.value = Date.now() - startTime
    
  } catch (err) {
    error.value = err.message
    console.error('Erreur chargement dashboard:', err)
  } finally {
    isLoading.value = false
  }
}

const loadCostAnalysis = async () => {
  try {
    const response = await fetch(`/api/analytics/costs?days=${selectedPeriod.value}`)
    const data = await response.json()
    
    if (response.ok) {
      costData.value = data
    }
  } catch (err) {
    console.error('Erreur chargement coûts:', err)
  }
}

const loadComparison = async () => {
  try {
    const response = await fetch(`/api/analytics/comparison?days=${selectedPeriod.value}`)
    const data = await response.json()
    
    if (response.ok) {
      comparisonData.value = data
    }
  } catch (err) {
    console.error('Erreur chargement comparaison:', err)
  }
}

const getTrend = (metric) => {
  // Placeholder pour les tendances - nécessiterait des données historiques
  const trends = {
    submissions: Math.floor(Math.random() * 20) - 10,
    confidence: Math.floor(Math.random() * 10) - 5,
    time: Math.floor(Math.random() * 30) - 15,
    cost: Math.floor(Math.random() * 20) - 10
  }
  
  return trends[metric] || 0
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('fr-FR')
}

// Lifecycle
onMounted(() => {
  loadDashboard()
})
</script>