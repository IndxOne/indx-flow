<template>
  <div class="space-y-6">
    <!-- Comparison Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-left py-2 font-medium text-gray-900">Méthode</th>
            <th class="text-center py-2 font-medium text-gray-900">Analyses</th>
            <th class="text-center py-2 font-medium text-gray-900">Confiance</th>
            <th class="text-center py-2 font-medium text-gray-900">Temps</th>
            <th class="text-center py-2 font-medium text-gray-900">Coût</th>
            <th class="text-center py-2 font-medium text-gray-900">Score</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="method in data.comparison" :key="method.mode" 
              class="border-b border-gray-100 hover:bg-gray-50">
            <td class="py-3">
              <div class="flex items-center">
                <div :class="getModeIcon(method.mode)" class="w-3 h-3 rounded-full mr-2"></div>
                <span class="font-medium">{{ formatMode(method.mode) }}</span>
              </div>
            </td>
            <td class="text-center py-3">{{ method.metrics.volume }}</td>
            <td class="text-center py-3">
              <span class="font-medium" :class="getConfidenceColor(method.metrics.avgConfidence)">
                {{ method.metrics.avgConfidence }}%
              </span>
            </td>
            <td class="text-center py-3">{{ method.metrics.avgTime }}ms</td>
            <td class="text-center py-3">{{ formatCost(method.metrics.avgCost) }}</td>
            <td class="text-center py-3">
              <span class="font-bold" :class="getScoreColor(method.efficiency.overall)">
                {{ method.efficiency.overall }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Best Performance Indicators -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="text-center p-3 bg-green-50 rounded-lg border border-green-200">
        <div class="text-lg font-bold text-green-600">
          {{ formatMode(data.insights.bestAccuracy.mode) }}
        </div>
        <div class="text-xs text-green-700">Meilleure précision</div>
        <div class="text-sm font-medium text-green-800">
          {{ data.insights.bestAccuracy.metrics.avgConfidence }}%
        </div>
      </div>
      
      <div class="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div class="text-lg font-bold text-blue-600">
          {{ formatMode(data.insights.bestSpeed.mode) }}
        </div>
        <div class="text-xs text-blue-700">Plus rapide</div>
        <div class="text-sm font-medium text-blue-800">
          {{ data.insights.bestSpeed.metrics.avgTime }}ms
        </div>
      </div>
      
      <div class="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
        <div class="text-lg font-bold text-purple-600">
          {{ formatMode(data.insights.bestCost.mode) }}
        </div>
        <div class="text-xs text-purple-700">Moins cher</div>
        <div class="text-sm font-medium text-purple-800">
          {{ formatCost(data.insights.bestCost.metrics.avgCost) }}
        </div>
      </div>
      
      <div class="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
        <div class="text-lg font-bold text-orange-600">
          {{ formatMode(data.insights.bestOverall.mode) }}
        </div>
        <div class="text-xs text-orange-700">Meilleur global</div>
        <div class="text-sm font-medium text-orange-800">
          Score {{ data.insights.bestOverall.efficiency.overall }}
        </div>
      </div>
    </div>

    <!-- Efficiency Radar Chart (Simplified) -->
    <div class="bg-white rounded-lg p-4 border border-gray-200">
      <h4 class="text-lg font-medium text-gray-900 mb-4">📈 Comparaison des efficacités</h4>
      
      <div class="space-y-4">
        <div v-for="method in data.comparison" :key="method.mode">
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-gray-700">{{ formatMode(method.mode) }}</span>
            <span class="text-sm text-gray-600">Score global: {{ method.efficiency.overall }}</span>
          </div>
          
          <div class="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div class="flex justify-between mb-1">
                <span>Confiance</span>
                <span>{{ method.efficiency.confidence }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-1">
                <div 
                  class="bg-green-500 h-1 rounded-full"
                  :style="{ width: `${method.efficiency.confidence}%` }"
                ></div>
              </div>
            </div>
            
            <div>
              <div class="flex justify-between mb-1">
                <span>Vitesse</span>
                <span>{{ method.efficiency.speed }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-1">
                <div 
                  class="bg-blue-500 h-1 rounded-full"
                  :style="{ width: `${method.efficiency.speed}%` }"
                ></div>
              </div>
            </div>
            
            <div>
              <div class="flex justify-between mb-1">
                <span>Coût</span>
                <span>{{ method.efficiency.cost }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-1">
                <div 
                  class="bg-purple-500 h-1 rounded-full"
                  :style="{ width: `${method.efficiency.cost}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Context Performance -->
    <div v-if="data.byContext" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 class="text-lg font-medium text-gray-900 mb-4">🎯 Performance par contexte</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="(methods, context) in data.byContext" :key="context">
          <h5 class="font-medium text-gray-800 mb-2">{{ formatContextType(context) }}</h5>
          <div class="space-y-1 text-sm">
            <div v-for="(data, mode) in methods" :key="mode" 
                 class="flex justify-between">
              <span class="text-gray-600">{{ formatMode(mode) }}:</span>
              <span class="font-medium">{{ data.avgConfidence }}% ({{ data.count }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div v-if="data.recommendations && data.recommendations.length > 0" 
         class="bg-blue-50 rounded-lg p-4 border border-blue-200">
      <h4 class="text-lg font-medium text-blue-800 mb-3">💡 Recommandations</h4>
      
      <div class="space-y-2">
        <div v-for="rec in data.recommendations" :key="rec.message" 
             class="flex items-start space-x-2">
          <span class="flex-shrink-0 text-lg">
            {{ rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢' }}
          </span>
          <div>
            <p class="text-sm font-medium text-blue-800">{{ rec.message }}</p>
            <p v-if="rec.action" class="text-xs text-blue-600 mt-1">{{ rec.action }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    required: true
  }
})

const formatMode = (mode) => {
  const formats = {
    local: 'Analyse Locale',
    ai: 'Intelligence IA',
    hybrid: 'Mode Hybride'
  }
  return formats[mode] || mode
}

const formatContextType = (type) => {
  const formats = {
    CLIENT_BASED: 'Clients',
    TEMPORAL: 'Temporel',
    PHASED: 'Phases',
    VERSIONED: 'Versions',
    PROCESS_BASED: 'Processus',
    RESOURCE_BASED: 'Ressources'
  }
  return formats[type] || type
}

const formatCost = (cost) => {
  if (cost < 0.001) {
    return `${(cost * 1000000).toFixed(0)}µ€`
  } else if (cost < 1) {
    return `${(cost * 1000).toFixed(2)}m€`
  } else {
    return `${cost.toFixed(2)}€`
  }
}

const getModeIcon = (mode) => {
  const colors = {
    local: 'bg-green-500',
    ai: 'bg-purple-500',
    hybrid: 'bg-blue-500'
  }
  return colors[mode] || 'bg-gray-500'
}

const getConfidenceColor = (confidence) => {
  if (confidence >= 85) return 'text-green-600'
  if (confidence >= 70) return 'text-blue-600'
  if (confidence >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-red-600'
}
</script>