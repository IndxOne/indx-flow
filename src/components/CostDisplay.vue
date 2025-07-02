<template>
  <div class="card bg-gray-50 border border-gray-200">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-sm font-medium text-gray-900 mb-1">
          💰 Suivi des coûts (Mode développement)
        </h3>
        <p class="text-xs text-gray-600">
          Comparaison en temps réel des coûts d'analyse
        </p>
      </div>
      
      <button 
        @click="showDetails = !showDetails"
        class="text-xs text-indigo-600 hover:text-indigo-800"
      >
        {{ showDetails ? 'Masquer' : 'Détails' }}
      </button>
    </div>

    <!-- Summary -->
    <div class="mt-4 grid grid-cols-3 gap-4">
      <div class="text-center">
        <div class="text-lg font-semibold text-green-600">
          {{ (costData.localAnalysis * 1000).toFixed(3) }}m€
        </div>
        <div class="text-xs text-gray-600">Analyse locale</div>
      </div>
      
      <div class="text-center">
        <div class="text-lg font-semibold text-purple-600">
          {{ (costData.aiAnalysis * 1000).toFixed(2) }}m€
        </div>
        <div class="text-xs text-gray-600">Analyse IA</div>
      </div>
      
      <div class="text-center">
        <div class="text-lg font-semibold text-blue-600">
          {{ (costData.totalCost * 1000).toFixed(2) }}m€
        </div>
        <div class="text-xs text-gray-600">Total</div>
      </div>
    </div>

    <!-- Detailed breakdown -->
    <div v-if="showDetails" class="mt-4 pt-4 border-t border-gray-200">
      <div class="space-y-2 text-xs">
        <div class="flex justify-between">
          <span class="text-gray-600">Coût par analyse locale:</span>
          <span class="font-mono">~0.00001€</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Coût par analyse IA:</span>
          <span class="font-mono">~0.002€</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Économie vs IA seule:</span>
          <span class="font-mono text-green-600">
            {{ calculateSavings() }}%
          </span>
        </div>
      </div>
      
      <!-- Projected costs -->
      <div class="mt-3 p-2 bg-blue-50 rounded text-xs">
        <div class="font-medium text-blue-800 mb-1">Projections (100 analyses/mois):</div>
        <div class="space-y-1 text-blue-700">
          <div>Mode local seul: ~0.001€/mois</div>
          <div>Mode IA seul: ~0.20€/mois</div>
          <div>Mode hybride: ~0.02-0.10€/mois</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  costData: {
    type: Object,
    required: true
  }
})

// State
const showDetails = ref(false)

// Methods
const calculateSavings = () => {
  const totalCost = props.costData.totalCost
  const fullAICost = props.costData.aiAnalysis + props.costData.localAnalysis // Si tout était en IA
  
  if (fullAICost === 0) return 0
  
  const savings = ((fullAICost - totalCost) / fullAICost * 100)
  return Math.max(0, savings).toFixed(1)
}
</script>