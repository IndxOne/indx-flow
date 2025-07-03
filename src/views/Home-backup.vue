<template>
  <div class="gradient-bg px-6">
    <!-- Header minimaliste avec accès aux espaces -->
    <header class="absolute top-0 left-0 right-0 z-10">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex justify-between items-center">
          <router-link to="/" class="text-white hover:opacity-80">
            <span class="text-lg font-semibold">INDX Flow</span>
          </router-link>
          
          <div class="flex items-center space-x-4">
            <!-- Accès aux espaces existants -->
            <router-link 
              to="/workspaces" 
              class="btn-glass text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              📁 Mes espaces
            </router-link>
            
            <!-- Analytics (optionnel) -->
            <router-link 
              to="/analytics" 
              class="text-white text-opacity-80 hover:text-opacity-100 text-sm"
            >
              📊 Analytics
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content - Interface épurée style ux-demo.html -->
    <div class="main-container">
      <div class="bg-white rounded-2xl shadow-2xl p-8 md:p-12 card-main">
          <!-- Header -->
          <div class="mb-8">
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              🎯 INDX Flow
            </h1>
            <p class="text-xl text-gray-600 mb-2">
              Organisez votre travail intelligemment
            </p>
            <p class="text-sm text-gray-500">
              L'IA analyse votre activité et crée la structure parfaite pour vous
            </p>
          </div>

          <!-- Formulaire principal -->
          <div class="mb-8">
            <textarea 
              v-model="userInput"
              @input="onInputChange"
              placeholder="Décrivez votre activité en quelques mots...&#10;&#10;Ex: 'Je suis consultant IT, je gère des projets pour plusieurs clients avec une équipe technique. Je dois jongler entre maintenance, nouveaux projets et support utilisateur.'"
              class="w-full h-32 p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-indigo-500 focus:outline-none text-gray-700"
              maxlength="500"
            />
            <div class="text-right mt-2">
              <span class="text-xs text-gray-400">{{ userInput.length }}/500</span>
            </div>
          </div>

          <!-- Bouton principal -->
          <button 
            @click="startAnalysis"
            :disabled="userInput.length < 10"
            class="w-full btn-gradient text-white py-4 px-8 rounded-xl font-semibold text-lg"
            :class="{ 'pulse': userInput.length >= 10 }"
          >
            ✨ Créer mon organisation
          </button>

          <!-- Exemples d'activités -->
          <div class="mt-8">
            <p class="text-sm text-gray-500 mb-4">💡 Exemples d'activités :</p>
            <div class="flex flex-wrap gap-3 justify-center">
              <button 
                v-for="example in examples" 
                :key="example.key"
                @click="setExample(example.text)"
                class="example-tag bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm hover:bg-indigo-500 hover:text-white transition-all duration-200"
              >
                {{ example.icon }} {{ example.label }}
              </button>
            </div>
          </div>

          <!-- Mode de détection (optionnel) -->
          <div class="mt-6 pt-6 border-t border-gray-100">
            <div class="flex items-center justify-center space-x-4 text-sm">
              <label class="font-medium text-gray-700">Mode :</label>
              <select 
                v-model="formStore.detectionMode" 
                class="form-input text-sm py-1 px-3 rounded-lg border-gray-200"
              >
                <option value="local">Local (Gratuit)</option>
                <option value="ai">IA (Précis)</option>
                <option value="hybrid">Hybride (Optimal)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer minimaliste en bas -->
    <footer class="absolute bottom-0 left-0 right-0 bg-black/10 backdrop-blur-sm">
      <div class="max-w-4xl mx-auto px-6 py-3">
        <div class="text-center">
          <p class="text-xs text-white/80">
            INDX Flow • Intelligence contextuelle • 
            <button 
              @click="showTechDetails = !showTechDetails"
              class="text-white/90 hover:text-white underline"
            >
              {{ showTechDetails ? 'Masquer tech' : 'Détails tech' }}
            </button>
          </p>
          
          <!-- Tech Details (collapsible simple) -->
          <div v-if="showTechDetails" class="mt-2 bg-black/20 rounded-lg p-3 text-left tech-details-panel">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-white/80">
              <div>
                <strong class="text-white">Frontend:</strong><br>
                Vue.js 3 + Vite + Tailwind
              </div>
              <div>
                <strong class="text-white">IA:</strong><br>
                Claude + Analyse locale
              </div>
              <div>
                <strong class="text-white">Stats:</strong><br>
                2000+ espaces • 2.3s • 94%
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFormStore } from '../stores/formStore.js'
import { useProfileStore } from '../stores/profileStore.js'

// Router  
const router = useRouter()

// Stores
const formStore = useFormStore()

// State
const userInput = ref('')
const showTechDetails = ref(false)

// Exemples d'activités (inspirés de ux-demo.html)
const examples = [
  {
    key: 'consultant',
    icon: '👔',
    label: 'Consultant IT multi-clients',
    text: "Je suis consultant IT spécialisé en transformation digitale. Je gère simultanément 3-4 projets clients avec des équipes techniques mixtes. Entre les phases d'analyse, de configuration système et le support utilisateur, j'ai besoin d'une organisation claire par client."
  },
  {
    key: 'manager',
    icon: '👥', 
    label: 'Manager équipe produit',
    text: "Je manage une équipe produit de 8 personnes sur plusieurs fonctionnalités. Nous travaillons en cycles de 2 semaines avec des sprints définis. Je dois coordonner le développement, les tests et les déploiements tout en gardant une vue d'ensemble des priorités."
  },
  {
    key: 'freelance',
    icon: '💻',
    label: 'Freelance projets web', 
    text: "Développeur web freelance, je jongle entre plusieurs projets clients simultanément. Sites e-commerce, applications mobiles, maintenance... Chaque projet a ses propres échéances et je dois optimiser mon temps entre développement, relation client et prospection."
  },
  {
    key: 'startup',
    icon: '🚀',
    label: 'Fondateur startup',
    text: "Fondateur d'une startup en phase de croissance. Je dois gérer le développement produit, le marketing, les ventes et l'équipe. Entre les features à prioriser, les bugs à corriger et la stratégie business, j'ai besoin d'une vue globale organisée."
  }
]

// Methods
const onInputChange = () => {
  // Mise à jour en temps réel du store
  formStore.userInput = userInput.value
}

const setExample = (exampleText) => {
  userInput.value = exampleText
  formStore.userInput = exampleText
}

const startAnalysis = () => {
  if (userInput.value.length < 10) return
  
  // Réinitialiser le store
  formStore.resetForm()
  formStore.userInput = userInput.value
  
  // Naviguer vers le formulaire d'analyse
  router.push('/welcome-guided')
}

// Lifecycle - Simplifié pour la nouvelle interface
onMounted(() => {
  // Réinitialiser le formulaire au chargement de la page d'accueil
  formStore.resetForm()
})
</script>

<style scoped>
/* === INDX FLOW HOMEPAGE STYLES v2.0 === */
/* Updated: 2025-01-06 17:30 - Layout fixes + Hot reload */

/* Gradient background identique à ux-demo.html */
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

/* Effet card hover pour les exemples */
.example-tag {
  transition: all 0.2s ease;
  cursor: pointer;
}

.example-tag:hover {
  background-color: #4f46e5 !important;
  color: white !important;
  transform: translateY(-1px);
}

/* Animation de la card principale */
.card-main {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Effet focus amélioré pour le textarea */
textarea:focus {
  transform: scale(1.01);
  transition: all 0.2s ease;
}

/* Bouton principal avec effet gradient */
.btn-gradient {
  background: linear-gradient(45deg, #4f46e5, #7c3aed);
  transition: all 0.3s ease;
}

.btn-gradient:hover:not(:disabled) {
  background: linear-gradient(45deg, #4338ca, #6d28d9);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
}

.btn-gradient:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Bouton header avec effet glassmorphism */
.btn-glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.btn-glass:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

/* Footer minimaliste */
footer {
  backdrop-filter: blur(10px);
  z-index: 5;
}

/* Corrections layout pour centrage parfait */
.gradient-bg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-container {
  max-width: 48rem; /* max-w-2xl */
  width: 100%;
  margin: 0 auto;
  text-align: center;
  z-index: 1;
  position: relative;
}

/* Statistiques avec effet counter */
.stat-number {
  animation: countUp 1s ease-out;
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Effet subtle sur les détails techniques */
.tech-details {
  transition: all 0.3s ease;
}

.tech-details.hidden {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

.tech-details.visible {
  opacity: 1;
  max-height: 300px;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .main-container {
    padding: 1rem;
  }
  
  .card-main {
    padding: 1.5rem;
    margin: 0;
  }
  
  .btn-gradient {
    padding: 1rem 2rem;
    font-size: 1rem;
  }
  
  .example-tag {
    font-size: 0.75rem;
    padding: 0.5rem 1rem;
  }
  
  header {
    padding: 1rem 0;
  }
  
  footer {
    position: fixed;
  }
}

/* Mode sombre pour les détails techniques */
.tech-details-panel {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
}

/* Effet de pulsation pour le bouton principal quand actif */
.btn-gradient.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
}

/* Amélioration de l'accessibilité */
.btn-gradient:focus,
.example-tag:focus,
.btn-glass:focus {
  outline: 2px solid #fbbf24;
  outline-offset: 2px;
}

/* Animation des statistiques au chargement */
.stats-grid {
  animation: slideInUp 0.8s ease-out 0.3s both;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>