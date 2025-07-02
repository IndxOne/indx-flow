<template>
  <div class="space-y-4">
    <!-- Bar Chart -->
    <div class="space-y-3">
      <div v-for="item in data" :key="item.mode" class="space-y-2">
        <div class="flex justify-between items-center text-sm">
          <span class="font-medium text-gray-700">{{ formatMode(item.mode) }}</span>
          <div class="flex items-center space-x-2">
            <span class="text-gray-600">{{ item.count }} analyses</span>
            <span class="text-xs text-gray-500">({{ getPercentage(item.count) }}%)</span>
          </div>
        </div>
        
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="h-2 rounded-full transition-all duration-500"
            :class="getModeColor(item.mode)"
            :style="{ width: `${getPercentage(item.count)}%` }"
          ></div>
        </div>
        
        <div class="flex justify-between text-xs text-gray-500">
          <span>Confiance moy: {{ item.avgConfidence }}%</span>
          <span>Temps moy: {{ item.avgTime }}ms</span>
          <span>Coût moy: {{ (item.avgCost * 1000).toFixed(2) }}m€</span>
        </div>
      </div>
    </div>

    <!-- Performance Comparison -->
    <div class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Comparaison des performances</h4>
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-lg font-bold text-green-600">{{ getBestAccuracy() }}%</div>
          <div class="text-xs text-gray-600">Meilleure confiance</div>
        </div>
        <div>
          <div class="text-lg font-bold text-blue-600">{{ getFastestTime() }}ms</div>
          <div class="text-xs text-gray-600">Plus rapide</div>
        </div>
        <div>
          <div class="text-lg font-bold text-purple-600">{{ getLowestCost() }}m€</div>
          <div class="text-xs text-gray-600">Moins cher</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const totalCount = computed(() => {
  return props.data.reduce((sum, item) => sum + item.count, 0)
})

const formatMode = (mode) => {
  const formats = {
    local: 'Analyse Locale',
    ai: 'Intelligence IA',
    hybrid: 'Mode Hybride'
  }
  return formats[mode] || mode
}

const getModeColor = (mode) => {
  const colors = {
    local: 'bg-green-500',
    ai: 'bg-purple-500', 
    hybrid: 'bg-blue-500'
  }
  return colors[mode] || 'bg-gray-500'
}

const getPercentage = (count) => {
  if (totalCount.value === 0) return 0
  return Math.round((count / totalCount.value) * 100)
}

const getBestAccuracy = () => {
  if (props.data.length === 0) return 0
  return Math.max(...props.data.map(item => item.avgConfidence || 0))
}

const getFastestTime = () => {
  if (props.data.length === 0) return 0
  return Math.min(...props.data.map(item => item.avgTime || Infinity))
}

const getLowestCost = () => {
  if (props.data.length === 0) return 0
  const minCost = Math.min(...props.data.map(item => item.avgCost || Infinity))
  return (minCost * 1000).toFixed(2)
}
</script>