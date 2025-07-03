<template>
  <div class="welcome-guided min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    
    <!-- Header simplifié -->
    <header class="bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <h1 class="text-2xl font-bold text-gray-900">
              🎯 INDX <span class="text-indigo-600">Flow</span>
            </h1>
            <span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Nouveau parcours guidé
            </span>
          </div>
          
          <!-- Accès rapide pour utilisateurs expérimentés -->
          <div class="flex items-center space-x-3">
            <router-link 
              to="/workspaces" 
              class="text-sm text-gray-600 hover:text-gray-900"
            >
              📋 Mes espaces
            </router-link>
            <router-link 
              to="/legacy" 
              class="text-sm text-gray-500 hover:text-gray-700"
            >
              Mode expert →
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="max-w-4xl mx-auto px-6 py-12">
      
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
          <svg class="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Organisez votre travail intelligemment
        </h2>
        
        <p class="text-xl text-gray-600 mb-2 max-w-2xl mx-auto">
          L'IA analyse votre activité et crée automatiquement la structure parfaite pour votre organisation
        </p>
        
        <p class="text-sm text-gray-500">
          ✨ Simple, rapide et personnalisé selon votre métier
        </p>
      </div>

      <!-- Formulaire de description -->
      <div class="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
        
        <!-- Input principal -->
        <div class="mb-8">
          <label class="block text-lg font-semibold text-gray-900 mb-3">
            Décrivez votre activité en quelques mots :
          </label>
          
          <textarea 
            v-model="userInput"
            @input="onInputChange"
            placeholder="Ex: 'Je suis consultant IT, je gère des projets pour plusieurs clients avec une équipe technique. Je dois jongler entre maintenance, nouveaux projets et support utilisateur.'"
            class="w-full h-32 p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-indigo-500 focus:outline-none text-gray-700 transition-colors"
            maxlength="500"
          />
          
          <div class="flex justify-between items-center mt-3">
            <span class="text-xs text-gray-400">{{ userInput.length }}/500 caractères</span>
            <div v-if="detectedComplexity" class="flex items-center space-x-2">
              <span class="text-xs text-gray-500">Complexité détectée:</span>
              <span class="text-xs px-2 py-1 rounded-full" :class="complexityClass">
                {{ complexityLabel }}
              </span>
            </div>
          </div>
        </div>

        <!-- Bouton d'analyse intelligent -->
        <button 
          @click="startSmartAnalysis"
          :disabled="!canAnalyze"
          class="w-full py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-200"
          :class="analyzeButtonClass"
        >
          {{ analyzeButtonText }}
        </button>

        <!-- Exemples suggérés -->
        <div class="mt-8">
          <p class="text-sm text-gray-500 mb-4 text-center">💡 Ou choisissez un exemple :</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              v-for="example in examples"
              :key="example.id"
              @click="selectExample(example)"
              class="example-card p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 text-left"
            >
              <div class="flex items-center mb-2">
                <span class="text-2xl mr-3">{{ example.icon }}</span>
                <span class="font-semibold text-gray-900">{{ example.title }}</span>
              </div>
              <p class="text-sm text-gray-600">{{ example.description }}</p>
            </button>
          </div>
        </div>
      </div>

      <!-- Statistiques encourageantes -->
      <div class="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div class="text-2xl font-bold text-indigo-600">{{ stats.totalAnalyses }}+</div>
            <div class="text-sm text-gray-600">Analyses effectuées</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-emerald-600">{{ stats.averageTime }}s</div>
            <div class="text-sm text-gray-600">Temps moyen d'analyse</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-purple-600">{{ stats.satisfaction }}%</div>
            <div class="text-sm text-gray-600">Satisfaction utilisateur</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFormStore } from '../stores/formStore.js'

// Router & Stores
const router = useRouter()
const formStore = useFormStore()

// État réactif
const userInput = ref('')
const isAnalyzing = ref(false)

// Données statiques
const examples = ref([
  {
    id: 'consultant',
    icon: '👔',
    title: 'Consultant IT',
    description: 'Multi-clients avec équipes techniques',
    text: "Je suis consultant IT spécialisé en transformation digitale. Je gère simultanément 3-4 projets clients avec des équipes techniques mixtes. Entre les phases d'analyse, de configuration système et le support utilisateur, j'ai besoin d'une organisation claire par client."
  },
  {
    id: 'manager',
    icon: '👥',
    title: 'Manager Produit',
    description: 'Équipe agile en sprints',
    text: "Je manage une équipe produit de 8 personnes sur plusieurs fonctionnalités. Nous travaillons en cycles de 2 semaines avec des sprints définis. Je dois coordonner le développement, les tests et les déploiements tout en gardant une vue d'ensemble des priorités."
  },
  {
    id: 'freelance',
    icon: '💻',
    title: 'Freelance Web',
    description: 'Projets clients simultanés',
    text: "Développeur web freelance, je jongle entre plusieurs projets clients simultanément. Sites e-commerce, applications mobiles, maintenance... Chaque projet a ses propres échéances et je dois optimiser mon temps entre développement, relation client et prospection."
  },
  {
    id: 'startup',
    icon: '🚀',
    title: 'Fondateur Startup',
    description: 'Multi-casquettes croissance',
    text: "Fondateur d'une startup en phase de croissance. Je dois gérer le développement produit, le marketing, les ventes et l'équipe. Entre les features à prioriser, les bugs à corriger et la stratégie business, j'ai besoin d'une vue globale organisée."
  },
  {
    id: 'technicien',
    icon: '🔧',
    title: 'Technicien SI',
    description: 'Maintenance et projets ERP',
    text: "Technicien SI dans une PME, je gère la maintenance des systèmes, les projets d'intégration ERP et le support utilisateur. Entre les incidents urgents, les mises à jour planifiées et les nouveaux déploiements, j'ai besoin d'une organisation par type d'intervention."
  },
  {
    id: 'agency',
    icon: '🎨',
    title: 'Agence Créative',
    description: 'Projets créatifs multiples',
    text: "Directeur créatif dans une agence digitale, je supervise plusieurs projets créatifs simultanément pour différents clients. Designs, campagnes publicitaires, sites web... Chaque projet a ses propres phases créatives et deadlines client."
  }
])

const stats = ref({
  totalAnalyses: 1247,
  averageTime: 2.3,
  satisfaction: 94
})

// Computed
const canAnalyze = computed(() => userInput.value.length >= 10)

const detectedComplexity = computed(() => {
  if (userInput.value.length < 20) return null
  
  const complexWords = ['consultant', 'manager', 'équipe', 'clients', 'projets', 'simultanément', 'coordination', 'multiple']
  const foundWords = complexWords.filter(word => 
    userInput.value.toLowerCase().includes(word)
  ).length
  
  if (foundWords >= 3) return 'complex'
  if (foundWords >= 1) return 'medium'
  return 'simple'
})

const complexityClass = computed(() => {
  switch (detectedComplexity.value) {
    case 'complex': return 'bg-purple-100 text-purple-700'
    case 'medium': return 'bg-amber-100 text-amber-700'
    case 'simple': return 'bg-green-100 text-green-700'
    default: return ''
  }
})

const complexityLabel = computed(() => {
  switch (detectedComplexity.value) {
    case 'complex': return '🤖 Analyse IA recommandée'
    case 'medium': return '⚡ Analyse hybride'
    case 'simple': return '🏠 Analyse locale rapide'
    default: return ''
  }
})

const analyzeButtonText = computed(() => {
  if (isAnalyzing.value) return '🔍 Analyse en cours...'
  if (!canAnalyze.value) return 'Saisissez au moins 10 caractères'
  
  switch (detectedComplexity.value) {
    case 'complex': return '🤖 Analyse IA approfondie'
    case 'medium': return '⚡ Analyse hybride optimisée'
    case 'simple': return '🚀 Analyse rapide'
    default: return '✨ Créer mon organisation'
  }
})

const analyzeButtonClass = computed(() => {
  if (!canAnalyze.value) {
    return 'bg-gray-300 text-gray-500 cursor-not-allowed'
  } else if (isAnalyzing.value) {
    return 'bg-indigo-400 text-white cursor-wait'
  } else {
    return 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 cursor-pointer'
  }
})

// Methods
const onInputChange = () => {
  // Auto-save input dans le store pour persistance
  formStore.userInput = userInput.value
}

const selectExample = (example) => {
  userInput.value = example.text
  onInputChange()
  
  // Animation de focus pour montrer le changement
  const textarea = document.querySelector('textarea')
  if (textarea) {
    textarea.focus()
    textarea.scrollTop = 0
  }
}

const startSmartAnalysis = async () => {
  if (!canAnalyze.value || isAnalyzing.value) return
  
  isAnalyzing.value = true
  
  try {
    // Sauvegarder l'input dans le store et rediriger vers le workflow principal
    formStore.userInput = userInput.value
    formStore.resetForm()
    formStore.userInput = userInput.value // Préserver l'input après reset
    
    // Navigation vers le formulaire principal d'analyse
    await router.push('/welcome-guided-form')
    
  } catch (error) {
    console.error('Erreur navigation vers analyse:', error)
    isAnalyzing.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Restaurer l'input précédent si disponible
  const savedInput = formStore.userInput
  if (savedInput) {
    userInput.value = savedInput
  }
  
  // Charger les stats en temps réel (optionnel)
  loadRealTimeStats()
})

const loadRealTimeStats = async () => {
  try {
    // TODO: Appel API pour stats réelles
    // const realStats = await formStore.getAnalysisHistory()
    // stats.value = realStats
  } catch (error) {
    console.log('Stats temps réel non disponibles, utilisation des valeurs par défaut')
  }
}
</script>

<style scoped>
.example-card:hover {
  transform: translateY(-2px);
}

.welcome-guided {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>