<template>
  <div class="space-y-6">
    <!-- Cost Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-green-50 rounded-lg p-4 border border-green-200">
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ formatCost(data.costs.local) }}</div>
          <div class="text-sm text-green-700">Coût Analyse Locale</div>
          <div class="text-xs text-green-600 mt-1">{{ data.requests.local }} requêtes</div>
        </div>
      </div>
      
      <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">{{ formatCost(data.costs.ai) }}</div>
          <div class="text-sm text-purple-700">Coût Analyse IA</div>
          <div class="text-xs text-purple-600 mt-1">{{ data.requests.ai }} requêtes</div>
        </div>
      </div>
      
      <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ formatCost(data.costs.total) }}</div>
          <div class="text-sm text-blue-700">Coût Total</div>
          <div class="text-xs text-blue-600 mt-1">{{ data.requests.total }} requêtes</div>
        </div>
      </div>
    </div>

    <!-- Efficiency Metrics -->
    <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
      <h4 class="text-lg font-medium text-gray-900 mb-3">📊 Métriques d'efficacité</h4>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div class="text-xl font-bold text-indigo-600">{{ data.requests.aiUsagePercentage }}%</div>
          <div class="text-xs text-gray-600">Usage IA</div>
        </div>
        <div>
          <div class="text-xl font-bold text-green-600">{{ formatCost(data.costs.costPerRequest) }}</div>
          <div class="text-xs text-gray-600">Coût/requête</div>
        </div>
        <div>
          <div class="text-xl font-bold text-orange-600">{{ data.efficiency.costSavingsVsFullAI }}%</div>
          <div class="text-xs text-gray-600">Économies vs IA seule</div>
        </div>
        <div>
          <div class="text-xl font-bold text-blue-600">{{ data.efficiency.hybridEfficiency }}</div>
          <div class="text-xs text-gray-600">Efficacité hybride</div>
        </div>
      </div>
    </div>

    <!-- Cost Breakdown Chart -->
    <div class="bg-white rounded-lg p-4 border border-gray-200">
      <h4 class="text-lg font-medium text-gray-900 mb-4">💰 Répartition des coûts</h4>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span class="text-sm text-gray-700">Analyse Locale</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-32 bg-gray-200 rounded-full h-2">
              <div 
                class="bg-green-500 h-2 rounded-full"
                :style="{ width: `${getLocalPercentage()}%` }"
              ></div>
            </div>
            <span class="text-sm font-medium">{{ formatCost(data.costs.local) }}</span>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-4 h-4 bg-purple-500 rounded mr-2"></div>
            <span class="text-sm text-gray-700">Analyse IA</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-32 bg-gray-200 rounded-full h-2">
              <div 
                class="bg-purple-500 h-2 rounded-full"
                :style="{ width: `${getAIPercentage()}%` }"
              ></div>
            </div>
            <span class="text-sm font-medium">{{ formatCost(data.costs.ai) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Projections -->
    <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
      <h4 class="text-lg font-medium text-yellow-800 mb-3">🔮 Projections</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 class="text-sm font-medium text-yellow-800 mb-2">Coûts estimés</h5>
          <div class="space-y-1 text-sm text-yellow-700">
            <div class="flex justify-between">
              <span>Mensuel (actuel):</span>
              <span class="font-medium">{{ formatCost(data.costs.averageDaily * 30) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Annuel (actuel):</span>
              <span class="font-medium">{{ formatCost(data.costs.averageDaily * 365) }}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h5 class="text-sm font-medium text-yellow-800 mb-2">Si 100% IA</h5>
          <div class="space-y-1 text-sm text-yellow-700">
            <div class="flex justify-between">
              <span>Mensuel:</span>
              <span class="font-medium">{{ formatCost(data.requests.total * 30 * 0.002 / period) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Économies:</span>
              <span class="font-medium text-green-600">-{{ data.efficiency.costSavingsVsFullAI }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div v-if="data.recommendations && data.recommendations.length > 0" 
         class="bg-blue-50 rounded-lg p-4 border border-blue-200">
      <h4 class="text-lg font-medium text-blue-800 mb-3">💡 Recommandations d'optimisation</h4>
      
      <div class="space-y-2">
        <div v-for="rec in data.recommendations" :key="rec.message" 
             class="flex items-start space-x-2">
          <span class="flex-shrink-0 text-lg">
            {{ rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢' }}
          </span>
          <div>
            <p class="text-sm font-medium text-blue-800">{{ rec.message }}</p>
            <p v-if="rec.action" class="text-xs text-blue-600 mt-1">
              Action: {{ rec.action }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  period: {
    type: Number,
    default: 7
  }
})

const formatCost = (cost) => {
  if (cost < 0.001) {
    return `${(cost * 1000000).toFixed(0)}µ€`
  } else if (cost < 1) {
    return `${(cost * 1000).toFixed(2)}m€`
  } else {
    return `${cost.toFixed(2)}€`
  }
}

const getLocalPercentage = () => {
  if (props.data.costs.total === 0) return 0
  return Math.round((props.data.costs.local / props.data.costs.total) * 100)
}

const getAIPercentage = () => {
  if (props.data.costs.total === 0) return 0
  return Math.round((props.data.costs.ai / props.data.costs.total) * 100)
}
</script>