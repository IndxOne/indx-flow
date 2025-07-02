<template>
  <div class="w-full">
    <!-- Steps Indicators -->
    <div class="flex items-center justify-between mb-4">
      <div 
        v-for="step in maxSteps" 
        :key="step"
        class="flex items-center"
        :class="{ 'flex-1': step < maxSteps }"
      >
        <!-- Step Circle -->
        <div 
          class="step-indicator"
          :class="getStepClass(step)"
        >
          <span v-if="step < currentStep">✓</span>
          <span v-else>{{ step }}</span>
        </div>
        
        <!-- Step Label -->
        <div class="ml-2 hidden sm:block">
          <p 
            class="text-xs font-medium"
            :class="step <= currentStep ? 'text-indigo-600' : 'text-gray-500'"
          >
            {{ getStepLabel(step) }}
          </p>
        </div>
        
        <!-- Connector Line -->
        <div 
          v-if="step < maxSteps"
          class="flex-1 h-0.5 mx-4"
          :class="step < currentStep ? 'bg-green-500' : step === currentStep ? 'bg-indigo-500' : 'bg-gray-200'"
        />
      </div>
    </div>
    
    <!-- Progress Bar -->
    <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
      <div 
        class="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
        :style="{ width: `${progress}%` }"
      />
    </div>
    
    <!-- Progress Text -->
    <div class="flex justify-between items-center text-xs text-gray-600">
      <span>Étape {{ currentStep }} sur {{ maxSteps }}</span>
      <span>{{ Math.round(progress) }}% complété</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  maxSteps: {
    type: Number,
    required: true
  },
  progress: {
    type: Number,
    required: true
  }
})

// Methods
const getStepClass = (step) => {
  if (step < props.currentStep) {
    return 'completed'
  } else if (step === props.currentStep) {
    return 'active'
  } else {
    return 'inactive'
  }
}

const getStepLabel = (step) => {
  const labels = {
    1: 'Contexte',
    2: 'Questions',
    3: 'Structure',
    4: 'Informations',
    5: 'Confirmation'
  }
  
  return labels[step] || `Étape ${step}`
}
</script>