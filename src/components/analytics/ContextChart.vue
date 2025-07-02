<template>
  <div class="space-y-4">
    <!-- Chart Container -->
    <div class="relative h-64">
      <canvas ref="chartCanvas" class="w-full h-full"></canvas>
    </div>
    
    <!-- Legend -->
    <div class="grid grid-cols-2 gap-2 text-xs">
      <div v-for="item in chartData" :key="item.type" class="flex items-center">
        <div 
          class="w-3 h-3 rounded-full mr-2"
          :style="{ backgroundColor: item.color }"
        ></div>
        <span class="text-gray-700">{{ formatContextType(item.type) }}</span>
        <span class="ml-auto font-medium">{{ item.count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const chartCanvas = ref(null)

const colors = {
  CLIENT_BASED: '#10b981',
  TEMPORAL: '#f59e0b', 
  PHASED: '#3b82f6',
  VERSIONED: '#8b5cf6',
  PROCESS_BASED: '#f43f5e',
  RESOURCE_BASED: '#6366f1'
}

const chartData = ref([])

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

const prepareChartData = () => {
  chartData.value = props.data.map(item => ({
    ...item,
    color: colors[item.type] || '#6b7280'
  }))
}

const drawChart = () => {
  if (!chartCanvas.value || chartData.value.length === 0) return
  
  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')
  
  // Set canvas size
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = rect.height * window.devicePixelRatio
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const radius = Math.min(centerX, centerY) - 20
  
  // Clear canvas
  ctx.clearRect(0, 0, rect.width, rect.height)
  
  // Calculate total
  const total = chartData.value.reduce((sum, item) => sum + item.count, 0)
  if (total === 0) return
  
  // Draw pie slices
  let currentAngle = -Math.PI / 2
  
  chartData.value.forEach(item => {
    const sliceAngle = (item.count / total) * 2 * Math.PI
    
    // Draw slice
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
    ctx.closePath()
    ctx.fillStyle = item.color
    ctx.fill()
    
    // Draw percentage label if slice is large enough
    if (item.percentage > 10) {
      const labelAngle = currentAngle + sliceAngle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7)
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7)
      
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 12px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${item.percentage}%`, labelX, labelY)
    }
    
    currentAngle += sliceAngle
  })
}

onMounted(() => {
  prepareChartData()
  drawChart()
})

watch(() => props.data, () => {
  prepareChartData()
  drawChart()
}, { deep: true })
</script>