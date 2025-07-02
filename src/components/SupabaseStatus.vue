<template>
  <div class="supabase-status" :class="statusClass">
    <div class="flex items-center space-x-2">
      <!-- Icône statut -->
      <div class="status-icon">
        <svg v-if="status.enabled" class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <svg v-else class="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>

      <!-- Texte statut -->
      <div class="status-text">
        <span class="text-sm font-medium">
          {{ status.enabled ? 'Cloud Sync' : 'Mode Local' }}
        </span>
        <span v-if="showDetails" class="text-xs text-gray-600 block">
          {{ statusMessage }}
        </span>
      </div>
    </div>

    <!-- Détails au survol -->
    <div v-if="showTooltip" class="status-tooltip">
      <div class="bg-gray-900 text-white text-xs rounded px-2 py-1 mt-1">
        <div v-if="status.enabled">
          ✅ Supabase connecté<br>
          🔗 {{ status.url }}<br>
          💾 Données synchronisées
        </div>
        <div v-else>
          📦 Mode local uniquement<br>
          ⚠️ Données non sauvegardées<br>
          🔧 Configurer .env pour activer
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getSupabaseStatus, supabaseService } from '../services/supabase.js'

// Props
const props = defineProps({
  showDetails: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  }
})

// State
const status = ref({
  enabled: false,
  url: '',
  hasKey: false
})
const showTooltip = ref(false)
const connectionTested = ref(false)

// Computed
const statusClass = computed(() => ({
  'status-enabled': status.value.enabled,
  'status-disabled': !status.value.enabled,
  'compact': props.compact
}))

const statusMessage = computed(() => {
  if (status.value.enabled) {
    return connectionTested.value ? 'Connexion vérifiée' : 'Configuration détectée'
  } else {
    return 'Variables d\'environnement manquantes'
  }
})

// Methods
const checkStatus = async () => {
  try {
    status.value = getSupabaseStatus()
    
    if (status.value.enabled) {
      // Tester la connexion réelle
      const isConnected = await supabaseService.checkConnection()
      connectionTested.value = isConnected
      
      if (!isConnected) {
        console.warn('⚠️ [SUPABASE-STATUS] Configuration détectée mais connexion échouée')
      }
    }
  } catch (error) {
    console.error('❌ [SUPABASE-STATUS] Erreur vérification:', error)
    status.value.enabled = false
  }
}

const toggleTooltip = () => {
  showTooltip.value = !showTooltip.value
}

// Lifecycle
onMounted(() => {
  checkStatus()
})
</script>

<style scoped>
.supabase-status {
  @apply relative;
}

.status-enabled {
  @apply text-green-700;
}

.status-disabled {
  @apply text-orange-700;
}

.compact {
  @apply text-xs;
}

.status-icon {
  @apply flex-shrink-0;
}

.status-text {
  @apply flex-grow;
}

.status-tooltip {
  @apply absolute z-10 left-0 top-full;
}

/* Hover effect */
.supabase-status:hover .status-tooltip {
  @apply block;
}

.status-tooltip {
  @apply hidden;
}
</style>