<template>
  <div class="space-y-4">
    <!-- Trend Chart Container -->
    <div class="relative h-48">
      <canvas ref="trendCanvas" class="w-full h-full"></canvas>
    </div>
    
    <!-- Time Period Selector -->
    <div class="flex justify-center space-x-2">
      <button 
        v-for="period in timePeriods" 
        :key="period.value"
        @click="selectedPeriod = period.value"
        :class="selectedPeriod === period.value ? 
          'bg-indigo-100 text-indigo-700 border-indigo-300' : 
          'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
        class="px-3 py-1 text-xs font-medium border rounded-md transition-colors"
      >
        {{ period.label }}
      </button>
    </div>
    
    <!-- Statistics Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div class="bg-green-50 rounded-lg p-3 text-center border border-green-200">
        <div class="text-lg font-bold text-green-600">{{ getTotalAnalyses() }}</div>
        <div class="text-xs text-green-700">Total analyses</div>
      </div>
      
      <div class="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
        <div class="text-lg font-bold text-blue-600">{{ getAveragePerDay() }}</div>
        <div class="text-xs text-blue-700">Moyenne/jour</div>
      </div>
      
      <div class="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
        <div class="text-lg font-bold text-purple-600">{{ getPeakDay() }}</div>
        <div class="text-xs text-purple-700">Pic d'activité</div>
      </div>
      
      <div class="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
        <div class="text-lg font-bold text-orange-600">{{ getGrowthTrend() }}%</div>
        <div class="text-xs text-orange-700">Tendance</div>
      </div>
    </div>

    <!-- Mode Distribution by Day -->
    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 class="text-sm font-medium text-gray-900 mb-3">📊 Distribution par mode</h4>
      
      <div class="space-y-2">
        <div v-for="mode in modeStats" :key="mode.name" class="flex items-center justify-between">
          <div class="flex items-center">
            <div :class="mode.color" class="w-3 h-3 rounded-full mr-2"></div>
            <span class="text-sm text-gray-700">{{ mode.name }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-20 bg-gray-200 rounded-full h-1">
              <div 
                :class="mode.color.replace('bg-', 'bg-')"
                class="h-1 rounded-full transition-all duration-500"
                :style="{ width: `${mode.percentage}%` }"
              ></div>
            </div>
            <span class="text-xs font-medium text-gray-600">{{ mode.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div v-if="recentActivity.length > 0" class="bg-white rounded-lg p-4 border border-gray-200">
      <h4 class="text-sm font-medium text-gray-900 mb-3">🕒 Activité récente</h4>
      
      <div class="space-y-2">
        <div v-for="activity in recentActivity.slice(0, 5)" :key="activity.id" 
             class="flex items-center justify-between text-sm">
          <div class="flex items-center">
            <div :class="getModeColor(activity.mode)" class="w-2 h-2 rounded-full mr-2"></div>
            <span class="text-gray-600">{{ formatTime(activity.timestamp) }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-gray-800">{{ formatContextType(activity.detectedContext) }}</span>
            <span class="text-xs text-gray-500">{{ activity.confidence }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const trendCanvas = ref(null)
const selectedPeriod = ref(7)

const timePeriods = [
  { value: 3, label: '3j' },
  { value: 7, label: '7j' },
  { value: 14, label: '14j' },
  { value: 30, label: '30j' }
]

const filteredData = computed(() => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - selectedPeriod.value)
  
  return props.data.filter(item => 
    new Date(item.timestamp) >= cutoffDate
  )
})

const dailyStats = computed(() => {
  const stats = {}
  
  filteredData.value.forEach(item => {
    const date = new Date(item.timestamp).toDateString()
    if (!stats[date]) {
      stats[date] = { total: 0, modes: {} }
    }
    stats[date].total++
    
    const mode = item.mode || 'local'
    stats[date].modes[mode] = (stats[date].modes[mode] || 0) + 1
  })
  
  return stats
})

const modeStats = computed(() => {
  const modes = { local: 0, ai: 0, hybrid: 0 }
  
  filteredData.value.forEach(item => {
    const mode = item.mode || 'local'
    modes[mode]++
  })
  
  const total = Object.values(modes).reduce((sum, count) => sum + count, 0)
  
  return [
    {
      name: 'Analyse Locale',
      count: modes.local,
      percentage: total > 0 ? Math.round((modes.local / total) * 100) : 0,
      color: 'bg-green-500'
    },
    {
      name: 'Intelligence IA',
      count: modes.ai,
      percentage: total > 0 ? Math.round((modes.ai / total) * 100) : 0,
      color: 'bg-purple-500'
    },
    {
      name: 'Mode Hybride',
      count: modes.hybrid,
      percentage: total > 0 ? Math.round((modes.hybrid / total) * 100) : 0,
      color: 'bg-blue-500'
    }
  ]
})

const recentActivity = computed(() => {
  return [...filteredData.value]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10)
})

const getTotalAnalyses = () => {
  return filteredData.value.length
}

const getAveragePerDay = () => {
  const days = Object.keys(dailyStats.value).length
  return days > 0 ? Math.round(filteredData.value.length / days) : 0
}

const getPeakDay = () => {
  const maxDay = Object.entries(dailyStats.value)
    .reduce((max, [date, stats]) => 
      stats.total > (max.stats?.total || 0) ? { date, stats } : max, {})
  
  return maxDay.stats?.total || 0
}

const getGrowthTrend = () => {
  const dates = Object.keys(dailyStats.value).sort()
  if (dates.length < 2) return 0
  
  const firstHalf = dates.slice(0, Math.floor(dates.length / 2))
  const secondHalf = dates.slice(Math.floor(dates.length / 2))
  
  const firstHalfAvg = firstHalf.reduce((sum, date) => 
    sum + dailyStats.value[date].total, 0) / firstHalf.length
  const secondHalfAvg = secondHalf.reduce((sum, date) => 
    sum + dailyStats.value[date].total, 0) / secondHalf.length
  
  if (firstHalfAvg === 0) return 0
  return Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100)
}

const getModeColor = (mode) => {
  const colors = {
    local: 'bg-green-500',
    ai: 'bg-purple-500',
    hybrid: 'bg-blue-500'
  }
  return colors[mode] || 'bg-gray-500'
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

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor(diffMs / (1000 * 60))
  
  if (diffMins < 60) {
    return `${diffMins}min`
  } else if (diffHours < 24) {
    return `${diffHours}h`
  } else {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }
}

const drawTrendChart = () => {
  if (!trendCanvas.value || Object.keys(dailyStats.value).length === 0) return
  
  const canvas = trendCanvas.value
  const ctx = canvas.getContext('2d')
  
  // Set canvas size
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = rect.height * window.devicePixelRatio
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  
  // Clear canvas
  ctx.clearRect(0, 0, rect.width, rect.height)
  
  // Prepare data
  const dates = Object.keys(dailyStats.value).sort()
  const values = dates.map(date => dailyStats.value[date].total)
  const maxValue = Math.max(...values, 1)
  
  // Chart dimensions
  const padding = 40
  const chartWidth = rect.width - padding * 2
  const chartHeight = rect.height - padding * 2
  
  // Draw grid lines
  ctx.strokeStyle = '#f3f4f6'
  ctx.lineWidth = 1
  
  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(rect.width - padding, y)
    ctx.stroke()
  }
  
  // Draw trend line
  if (values.length > 1) {
    ctx.strokeStyle = '#6366f1'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    values.forEach((value, index) => {
      const x = padding + (chartWidth / (values.length - 1)) * index
      const y = padding + chartHeight - (value / maxValue) * chartHeight
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.stroke()
    
    // Draw data points
    ctx.fillStyle = '#6366f1'
    values.forEach((value, index) => {
      const x = padding + (chartWidth / (values.length - 1)) * index
      const y = padding + chartHeight - (value / maxValue) * chartHeight
      
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fill()
    })
  }
  
  // Draw axes labels
  ctx.fillStyle = '#6b7280'
  ctx.font = '10px system-ui'
  ctx.textAlign = 'center'
  
  // Y-axis labels
  for (let i = 0; i <= 5; i++) {
    const value = Math.round((maxValue / 5) * (5 - i))
    const y = padding + (chartHeight / 5) * i
    ctx.textAlign = 'right'
    ctx.fillText(value.toString(), padding - 10, y + 3)
  }
  
  // X-axis labels (show every other date if too many)
  const labelStep = Math.max(1, Math.floor(dates.length / 5))
  dates.forEach((date, index) => {
    if (index % labelStep === 0) {
      const x = padding + (chartWidth / (dates.length - 1)) * index
      const shortDate = new Date(date).toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      })
      ctx.textAlign = 'center'
      ctx.fillText(shortDate, x, rect.height - 10)
    }
  })
}

onMounted(() => {
  drawTrendChart()
})

watch([() => props.data, selectedPeriod], () => {
  setTimeout(drawTrendChart, 100)
}, { deep: true })
</script>