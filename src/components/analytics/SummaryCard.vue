<template>
  <div class="card">
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
          <span class="text-lg">{{ icon }}</span>
        </div>
      </div>
      <div class="ml-4 flex-1">
        <h3 class="text-sm font-medium text-gray-900">{{ title }}</h3>
        <div class="flex items-baseline">
          <p class="text-2xl font-semibold text-gray-900">{{ value }}</p>
          <p v-if="trend !== 0" class="ml-2 flex items-baseline text-sm font-semibold"
             :class="trend > 0 ? 'text-green-600' : 'text-red-600'">
            <svg v-if="trend > 0" class="h-3 w-3 flex-shrink-0 self-center" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414 6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="h-3 w-3 flex-shrink-0 self-center" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            {{ Math.abs(trend) }}%
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  trend: {
    type: Number,
    default: 0
  }
})
</script>