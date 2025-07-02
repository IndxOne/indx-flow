<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Header global avec status Supabase -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <router-link to="/" class="text-xl font-bold text-indigo-600">
              INDX Flow
            </router-link>
          </div>
          
          <!-- Status Supabase -->
          <div class="flex items-center space-x-4">
            <SupabaseStatus :show-details="true" />
          </div>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import SupabaseStatus from './components/SupabaseStatus.vue'

export default {
  name: 'App',
  components: {
    SupabaseStatus
  }
}
</script>