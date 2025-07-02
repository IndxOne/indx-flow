<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header avec projet -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <button 
              @click="$router.back()"
              class="text-gray-500 hover:text-gray-700"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 class="text-xl font-semibold text-gray-900">{{ projectName }}</h1>
              <p class="text-sm text-gray-600">Espace de travail généré automatiquement</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-500">{{ totalTasks }} tâches</span>
            <button 
              @click="showAddTaskModal = true"
              class="btn-primary text-sm"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nouvelle tâche
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Board Kanban -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="(column, index) in columns" 
          :key="index"
          class="bg-white rounded-lg shadow-sm border"
        >
          <!-- Header colonne -->
          <div class="p-4 border-b bg-gray-50 rounded-t-lg">
            <div class="flex items-center justify-between">
              <h3 class="font-medium text-gray-900">{{ column.name }}</h3>
              <span class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                {{ getTasksForColumn(index).length }}
              </span>
            </div>
            <p class="text-xs text-gray-600 mt-1">{{ column.description }}</p>
          </div>

          <!-- Tâches -->
          <div 
            class="p-3 min-h-96 space-y-3"
            @drop="handleDrop($event, index)"
            @dragover.prevent
            @dragenter.prevent
          >
            <div
              v-for="task in getTasksForColumn(index)"
              :key="task.id"
              :draggable="true"
              @dragstart="handleDragStart($event, task)"
              class="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-move"
              :class="getPriorityClass(task.priority)"
            >
              <div class="flex items-start justify-between mb-2">
                <h4 class="text-sm font-medium text-gray-900 pr-2">{{ task.title }}</h4>
                <button 
                  @click="editTask(task)"
                  class="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              
              <p v-if="task.description" class="text-xs text-gray-600 mb-2">{{ task.description }}</p>
              
              <!-- Barre de progression des sous-tâches -->
              <div v-if="task.subtasks && task.subtasks.length > 0" class="mb-3">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-500">{{ getProgressLabel(task) }}</span>
                  <span class="text-xs font-medium text-gray-700">{{ getTaskProgress(task) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300"
                    :class="getTaskProgress(task) === 100 ? 'bg-green-500' : 'bg-blue-500'"
                    :style="{ width: `${getTaskProgress(task)}%` }"
                  ></div>
                </div>
                <!-- Alerte sous-tâches en retard -->
                <div v-if="getOverdueSubtasksCount(task) > 0" class="flex items-center mt-1">
                  <svg class="w-3 h-3 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-xs text-red-600">{{ getOverdueSubtasksCount(task) }} en retard</span>
                </div>
              </div>

              <!-- Aperçu des sous-tâches (3 premières) -->
              <div v-if="task.subtasks && task.subtasks.length > 0" class="mb-2">
                <div 
                  v-for="(subtask, subtaskIndex) in task.subtasks.slice(0, 3)" 
                  :key="subtask.id"
                  class="flex items-center text-xs mb-1"
                >
                  <input 
                    type="checkbox" 
                    :checked="subtask.completed"
                    @change="toggleSubtask(task.id, subtask.id)"
                    class="w-3 h-3 text-blue-600 rounded mr-2 flex-shrink-0"
                  >
                  <span 
                    :class="{ 
                      'line-through text-gray-400': subtask.completed,
                      'text-red-600': isSubtaskOverdue(subtask)
                    }"
                    class="flex-1 truncate"
                  >
                    {{ subtask.text }}
                  </span>
                  <span 
                    v-if="subtask.dueDate" 
                    :class="{ 
                      'text-red-500': isSubtaskOverdue(subtask),
                      'text-gray-400': !isSubtaskOverdue(subtask)
                    }"
                    class="ml-2 text-xs"
                  >
                    {{ formatDate(subtask.dueDate) }}
                  </span>
                </div>
                <!-- Indicateur s'il y a plus de sous-tâches -->
                <div v-if="task.subtasks.length > 3" class="text-xs text-gray-500 pl-5">
                  +{{ task.subtasks.length - 3 }} autres sous-tâches...
                </div>
              </div>
              
              <div class="flex items-center justify-between text-xs">
                <span v-if="task.assignee" class="text-gray-500">{{ task.assignee }}</span>
                <span class="text-gray-400">{{ formatDate(task.dueDate) }}</span>
              </div>

              <div v-if="task.tags && task.tags.length" class="flex flex-wrap gap-1 mt-2">
                <span 
                  v-for="tag in task.tags" 
                  :key="tag"
                  class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Zone de drop vide -->
            <div 
              v-if="getTasksForColumn(index).length === 0"
              class="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg"
            >
              <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <p class="text-sm">Glissez une tâche ici</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nouvelle/Édition Tâche -->
    <div v-if="showAddTaskModal || editingTask" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-medium mb-4">
          {{ editingTask ? 'Modifier la tâche' : 'Nouvelle tâche' }}
        </h3>
        
        <form @submit.prevent="saveTask">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input 
                v-model="taskForm.title"
                type="text" 
                required
                class="form-input w-full"
                placeholder="Titre de la tâche"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                v-model="taskForm.description"
                class="form-input w-full"
                rows="3"
                placeholder="Description détaillée (optionnel)"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <select v-model="taskForm.priority" class="form-input w-full">
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Colonne</label>
                <select v-model="taskForm.columnIndex" class="form-input w-full">
                  <option v-for="(column, index) in columns" :key="index" :value="index">
                    {{ column.name }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Assigné à</label>
              <input 
                v-model="taskForm.assignee"
                type="text" 
                class="form-input w-full"
                placeholder="Nom de la personne"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
              <input 
                v-model="taskForm.dueDate"
                type="date" 
                class="form-input w-full"
              >
            </div>

            <!-- Section Sous-tâches -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sous-tâches</label>
              
              <!-- Liste des sous-tâches existantes -->
              <div v-if="taskForm.subtasks && taskForm.subtasks.length > 0" class="mb-3 space-y-2">
                <div 
                  v-for="(subtask, index) in taskForm.subtasks" 
                  :key="subtask.id"
                  class="flex items-center space-x-2 p-2 bg-gray-50 rounded border"
                >
                  <input 
                    type="checkbox" 
                    v-model="subtask.completed"
                    class="w-4 h-4 text-blue-600 rounded"
                  >
                  <input 
                    v-model="subtask.text"
                    type="text"
                    class="flex-1 text-sm border-none bg-transparent focus:ring-0 p-1"
                    placeholder="Texte de la sous-tâche"
                  >
                  <input 
                    v-model="subtask.dueDate"
                    type="date"
                    class="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                  <button 
                    type="button"
                    @click="removeSubtask(index)"
                    class="text-red-500 hover:text-red-700 p-1"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Formulaire nouvelle sous-tâche -->
              <div class="flex space-x-2 mb-2">
                <input 
                  v-model="newSubtask.text"
                  type="text"
                  class="flex-1 form-input text-sm"
                  placeholder="Nouvelle sous-tâche..."
                  @keyup.enter="addSubtask"
                >
                <input 
                  v-model="newSubtask.dueDate"
                  type="date"
                  class="form-input text-sm w-32"
                >
                <button 
                  type="button"
                  @click="addSubtask"
                  class="btn-primary px-3 py-1 text-sm"
                  :disabled="!newSubtask.text.trim()"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <!-- Résumé progression -->
              <div v-if="taskForm.subtasks && taskForm.subtasks.length > 0" class="text-xs text-gray-600">
                {{ taskForm.subtasks.filter(s => s.completed).length }}/{{ taskForm.subtasks.length }} sous-tâches terminées
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button 
              type="button"
              @click="cancelTask"
              class="btn-secondary"
            >
              Annuler
            </button>
            <button 
              v-if="editingTask"
              type="button"
              @click="deleteTask"
              class="btn-danger"
            >
              Supprimer
            </button>
            <button 
              type="submit"
              class="btn-primary"
            >
              {{ editingTask ? 'Mettre à jour' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// Props depuis la route
const route = useRoute()

// State
const projectName = ref('Projet DIPASON - Module Approvisionnement')
const showAddTaskModal = ref(false)
const editingTask = ref(null)
const draggedTask = ref(null)

// Structure des colonnes (générée depuis l'analyse)
const columns = ref([
  {
    name: '📋 Analyse & Spec',
    description: 'Recueil besoins, spécifications'
  },
  {
    name: '⚙️ Paramétrage DIPASON',
    description: 'Configuration technique'
  },
  {
    name: '🔧 Tests & Validation',
    description: 'Tests et recette utilisateur'
  },
  {
    name: '📊 Formation & Go-Live',
    description: 'Formation et mise en production'
  }
])

// Tâches exemple pour projet DIPASON avec sous-tâches
const tasks = ref([
  {
    id: '1',
    title: 'Cartographie des processus approvisionnement',
    description: 'Analyser les flux existants et identifier les besoins',
    priority: 'high',
    assignee: 'Équipe Fonctionnelle',
    columnIndex: 0,
    dueDate: '2025-07-03',
    tags: ['analyse', 'processus'],
    subtasks: [
      { id: '1-1', text: 'Audit processus existants', completed: true, dueDate: '2025-07-02' },
      { id: '1-2', text: 'Interview équipes métier', completed: false, dueDate: '2025-07-03' },
      { id: '1-3', text: 'Documentation flux actuels', completed: false, dueDate: '2025-07-04' }
    ]
  },
  {
    id: '2',
    title: 'Paramétrage modules achat DIPASON',
    description: 'Configuration des règles de gestion et workflows',
    priority: 'medium',
    assignee: 'Équipe Technique',
    columnIndex: 1,
    dueDate: '2025-07-10',
    tags: ['config', 'technique'],
    subtasks: [
      { id: '2-1', text: 'Configuration référentiels', completed: false, dueDate: '2025-07-08' },
      { id: '2-2', text: 'Paramétrage workflows validation', completed: false, dueDate: '2025-07-09' },
      { id: '2-3', text: 'Tests configuration', completed: false, dueDate: '2025-07-10' }
    ]
  },
  {
    id: '3',
    title: 'Formation utilisateurs finaux',
    description: 'Sessions de formation sur le nouveau module',
    priority: 'medium',
    assignee: 'Équipe Formation',
    columnIndex: 3,
    dueDate: '2025-07-20',
    tags: ['formation', 'utilisateurs'],
    subtasks: [
      { id: '3-1', text: 'Création supports formation', completed: false, dueDate: '2025-07-15' },
      { id: '3-2', text: 'Formation des formateurs', completed: false, dueDate: '2025-07-18' },
      { id: '3-3', text: 'Sessions utilisateurs finaux', completed: false, dueDate: '2025-07-20' }
    ]
  }
])

// Form pour nouvelle tâche
const taskForm = ref({
  title: '',
  description: '',
  priority: 'medium',
  assignee: '',
  columnIndex: 0,
  dueDate: '',
  tags: [],
  subtasks: []
})

// Nouvelle sous-tâche en cours d'ajout
const newSubtask = ref({
  text: '',
  dueDate: ''
})

// Computed
const totalTasks = computed(() => tasks.value.length)

const getTasksForColumn = (columnIndex) => {
  return tasks.value.filter(task => task.columnIndex === columnIndex)
}

// Calculer le pourcentage de progression d'une tâche
const getTaskProgress = (task) => {
  if (!task.subtasks || task.subtasks.length === 0) {
    return 0
  }
  
  const completed = task.subtasks.filter(subtask => subtask.completed).length
  return Math.round((completed / task.subtasks.length) * 100)
}

// Obtenir le libellé de progression
const getProgressLabel = (task) => {
  if (!task.subtasks || task.subtasks.length === 0) {
    return ''
  }
  
  const completed = task.subtasks.filter(subtask => subtask.completed).length
  return `${completed}/${task.subtasks.length} sous-tâches`
}

// Vérifier si une sous-tâche est en retard
const isSubtaskOverdue = (subtask) => {
  if (!subtask.dueDate || subtask.completed) return false
  return new Date(subtask.dueDate) < new Date()
}

// Compter les sous-tâches en retard
const getOverdueSubtasksCount = (task) => {
  if (!task.subtasks) return 0
  return task.subtasks.filter(subtask => isSubtaskOverdue(subtask)).length
}

const getPriorityClass = (priority) => {
  const classes = {
    low: 'border-l-4 border-l-gray-300',
    medium: 'border-l-4 border-l-yellow-400',
    high: 'border-l-4 border-l-orange-400',
    urgent: 'border-l-4 border-l-red-400'
  }
  return classes[priority] || classes.medium
}

// Methods
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { 
    month: 'short', 
    day: 'numeric' 
  })
}

// Basculer l'état d'une sous-tâche
const toggleSubtask = (taskId, subtaskId) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task && task.subtasks) {
    const subtask = task.subtasks.find(s => s.id === subtaskId)
    if (subtask) {
      subtask.completed = !subtask.completed
      console.log(`🔄 [SUBTASK] ${subtask.text} → ${subtask.completed ? 'Terminée' : 'En cours'}`)
    }
  }
}

// Ajouter une nouvelle sous-tâche
const addSubtask = () => {
  if (!newSubtask.value.text.trim()) return
  
  if (!taskForm.value.subtasks) {
    taskForm.value.subtasks = []
  }
  
  const subtask = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text: newSubtask.value.text.trim(),
    completed: false,
    dueDate: newSubtask.value.dueDate || ''
  }
  
  taskForm.value.subtasks.push(subtask)
  
  // Reset form
  newSubtask.value = {
    text: '',
    dueDate: ''
  }
  
  console.log('➕ [SUBTASK] Nouvelle sous-tâche ajoutée:', subtask.text)
}

// Supprimer une sous-tâche
const removeSubtask = (index) => {
  if (taskForm.value.subtasks && index >= 0 && index < taskForm.value.subtasks.length) {
    const removed = taskForm.value.subtasks.splice(index, 1)[0]
    console.log('🗑️ [SUBTASK] Sous-tâche supprimée:', removed.text)
  }
}

const handleDragStart = (event, task) => {
  draggedTask.value = task
  event.dataTransfer.effectAllowed = 'move'
}

const handleDrop = (event, columnIndex) => {
  event.preventDefault()
  if (draggedTask.value) {
    draggedTask.value.columnIndex = columnIndex
    draggedTask.value = null
  }
}

const editTask = (task) => {
  editingTask.value = task
  taskForm.value = { 
    ...task,
    // Clone profond des sous-tâches pour éviter les références
    subtasks: task.subtasks ? task.subtasks.map(subtask => ({ ...subtask })) : []
  }
}

const saveTask = () => {
  if (editingTask.value) {
    // Mise à jour
    Object.assign(editingTask.value, taskForm.value)
  } else {
    // Création
    const newTask = {
      ...taskForm.value,
      id: Date.now().toString(),
      tags: []
    }
    tasks.value.push(newTask)
  }
  
  cancelTask()
}

const deleteTask = () => {
  if (editingTask.value) {
    const index = tasks.value.findIndex(t => t.id === editingTask.value.id)
    if (index !== -1) {
      tasks.value.splice(index, 1)
    }
  }
  cancelTask()
}

const cancelTask = () => {
  showAddTaskModal.value = false
  editingTask.value = null
  taskForm.value = {
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    columnIndex: 0,
    dueDate: '',
    tags: [],
    subtasks: []
  }
  // Reset aussi le formulaire de nouvelle sous-tâche
  newSubtask.value = {
    text: '',
    dueDate: ''
  }
}

// Lifecycle
onMounted(() => {
  // Récupérer la structure depuis l'analyse si disponible
  const analysisData = sessionStorage.getItem('workspaceAnalysis')
  if (analysisData) {
    const data = JSON.parse(analysisData)
    console.log('🔄 [WORKSPACE] Données d\'analyse reçues:', data)
    
    // Générer structure intelligente selon contextes détectés
    if (data.detectedContexts && data.detectedContexts.length > 0) {
      const generatedStructure = generateIntelligentStructure(data.detectedContexts, data.detectedContext)
      columns.value = generatedStructure
      console.log('🧠 [WORKSPACE] Structure intelligente générée:', generatedStructure)
    } else if (data.structure) {
      // Fallback sur structure basique si pas de contextes multiples
      columns.value = data.structure.map((name, index) => ({
        name,
        description: getColumnDescription(name, index, data.detectedContext)
      }))
    }
    
    // Définir nom du projet
    if (data.userInfo?.projectName) {
      projectName.value = data.userInfo.projectName
    } else if (data.projectName) {
      projectName.value = data.projectName
    }
    
    // Générer tâches automatiques selon le contexte et configuration
    if (data.detectedContext && data.workspaceConfig?.autoGenerateTasks) {
      const autoTasks = generateContextualTasks(
        data.detectedContext, 
        data.detectedContexts, 
        data.adaptiveAnswers,
        data.workspaceConfig
      )
      
      // Remplacer tâches exemple par tâches contextuelles si détection forte
      if (data.confidence > 70) {
        tasks.value = autoTasks
      } else {
        tasks.value = [...autoTasks, ...tasks.value]
      }
      
      console.log('📋 [WORKSPACE] Tâches automatiques générées:', {
        count: autoTasks.length,
        projectType: data.workspaceConfig?.projectType,
        complexity: data.workspaceConfig?.estimatedComplexity
      })
    }
  }
})

const generateIntelligentStructure = (detectedContexts, primaryContext) => {
  console.log('🧠 [STRUCTURE] Génération pour contextes:', detectedContexts)
  
  // Détecter le profil consultant SI spécialisé
  const hasProcessBased = detectedContexts.some(c => c.type === 'PROCESS_BASED')
  const hasClientBased = detectedContexts.some(c => c.type === 'CLIENT_BASED') 
  const hasResourceBased = detectedContexts.some(c => c.type === 'RESOURCE_BASED')
  const hasTemporal = detectedContexts.some(c => c.type === 'TEMPORAL')
  
  // PROFIL 1: Consultant SI complet (PROCESS + CLIENT + RESOURCE)
  if (hasProcessBased && hasClientBased && hasResourceBased) {
    return [
      {
        name: '📋 Projets Clients',
        description: 'Projets en cours chez les clients'
      },
      {
        name: '⚙️ Maintenance SI',
        description: 'Interventions de maintenance système'
      },
      {
        name: '🔧 Support Technique',
        description: 'Support utilisateurs et résolution incidents'
      },
      {
        name: '📊 Pilotage & Contrats',
        description: 'Suivi contrats et coordination'
      }
    ]
  }
  
  // PROFIL 2: Technicien SI ERP (PROCESS + RESOURCE, sans CLIENT dominant)
  if (hasProcessBased && hasResourceBased && primaryContext === 'PROCESS_BASED') {
    console.log('✅ [WORKSPACE] Profil technicien SI/ERP détecté ! Structure projet ERP')
    return [
      {
        name: '🎯 Analyse & Spécification',
        description: 'Analyse besoins et spécifications techniques'
      },
      {
        name: '⚙️ Paramétrage & Config',
        description: 'Configuration et développement'
      },
      {
        name: '🧪 Tests & Validation',
        description: 'Tests et validation qualité'
      },
      {
        name: '🚀 Formation & Go-Live',
        description: 'Formation et mise en production'
      }
    ]
  }
  
  // PROFIL 3: Projet avec phases (PROCESS + autres contextes)
  if (hasProcessBased && primaryContext === 'PROCESS_BASED') {
    console.log('✅ [WORKSPACE] Profil projet processus détecté ! Structure par étapes')
    return [
      {
        name: '📋 Initialisation',
        description: 'Phase d\'initialisation du processus'
      },
      {
        name: '⚙️ Traitement',
        description: 'Phase de traitement principal'
      },
      {
        name: '🔍 Validation',
        description: 'Phase de validation et contrôle'
      },
      {
        name: '✅ Finalisation',
        description: 'Phase de finalisation et archivage'
      }
    ]
  }
  
  // Template TEMPORAL dominant (sprints/cycles)
  if (primaryContext === 'TEMPORAL' || hasTemporal) {
    return [
      {
        name: '📝 Backlog & Planning',
        description: 'Tâches à planifier et prioriser'
      },
      {
        name: '🚀 Sprint Actuel',
        description: 'Tâches du cycle en cours'
      },
      {
        name: '🔍 Tests & Review',
        description: 'Validation et contrôle qualité'
      },
      {
        name: '✅ Terminé',
        description: 'Tâches finalisées ce cycle'
      }
    ]
  }
  
  // Template PHASED (projets avec phases)
  if (primaryContext === 'PHASED') {
    return [
      {
        name: '🎯 Conception',
        description: 'Analyse besoins et spécifications'
      },
      {
        name: '⚙️ Réalisation',
        description: 'Développement et implémentation'
      },
      {
        name: '🧪 Tests',
        description: 'Tests et validation qualité'
      },
      {
        name: '🚀 Déploiement',
        description: 'Mise en production et support'
      }
    ]
  }
  
  // Template générique CLIENT_BASED
  if (primaryContext === 'CLIENT_BASED') {
    return [
      {
        name: '👥 Client A',
        description: 'Projets du premier client'
      },
      {
        name: '🏢 Client B', 
        description: 'Projets du second client'
      },
      {
        name: '🎯 Prospects',
        description: 'Opportunités commerciales'
      },
      {
        name: '🔧 Interne',
        description: 'Tâches administratives internes'
      }
    ]
  }
  
  // Fallback générique
  return [
    {
      name: '📋 À faire',
      description: 'Tâches à planifier'
    },
    {
      name: '🚀 En cours',
      description: 'Tâches en progression'
    },
    {
      name: '🔍 En validation',
      description: 'Tâches à valider'
    },
    {
      name: '✅ Terminé',
      description: 'Tâches finalisées'
    }
  ]
}

const generateContextualTasks = (primaryContext, contexts, adaptiveAnswers, workspaceConfig) => {
  const contextualTasks = []
  let taskId = Date.now()
  
  const projectType = workspaceConfig?.projectType || 'GENERIC'
  const complexity = workspaceConfig?.estimatedComplexity || 'MEDIUM'
  
  console.log('📋 [TASKS] Génération pour:', { projectType, complexity, primaryContext })
  
  // Templates spécialisés par type de projet détecté
  
  // Détecter si c'est un projet ERP (based on adaptive answers)
  const isERPProject = adaptiveAnswers?.processType === 'erp_migration' || 
                      adaptiveAnswers?.processType === 'system_integration'
  
  if (isERPProject) {
    // Template spécialisé ERP/Migration SI
    contextualTasks.push(
      {
        id: (taskId++).toString(),
        title: 'Analyse de l\'existant technique',
        description: 'Audit architecture actuelle et identification points d\'intégration',
        priority: 'high',
        assignee: 'Architecte SI',
        columnIndex: 0,
        dueDate: getDateInDays(5),
        tags: ['analyse', 'architecture', 'existant'],
        subtasks: [
          { id: `${taskId}-1`, text: 'Inventaire systèmes existants', completed: false, dueDate: getDateInDays(2) },
          { id: `${taskId}-2`, text: 'Cartographie flux de données', completed: false, dueDate: getDateInDays(3) },
          { id: `${taskId}-3`, text: 'Analyse points d\'intégration', completed: false, dueDate: getDateInDays(4) },
          { id: `${taskId}-4`, text: 'Rapport d\'audit final', completed: false, dueDate: getDateInDays(5) }
        ]
      },
      {
        id: (taskId++).toString(),
        title: 'Demandes de devis fournisseurs',
        description: 'Collecte et analyse des propositions techniques et commerciales',
        priority: 'high',
        assignee: 'Chef de projet',
        columnIndex: 0,
        dueDate: getDateInDays(7),
        tags: ['devis', 'fournisseurs', 'commercial']
      },
      {
        id: (taskId++).toString(),
        title: 'Atelier spécifications interfaces',
        description: 'Workshop avec équipes métier pour définir les flux de données',
        priority: 'medium',
        assignee: 'Analyste fonctionnel',
        columnIndex: 1,
        dueDate: getDateInDays(10),
        tags: ['atelier', 'interfaces', 'spécifications']
      },
      {
        id: (taskId++).toString(),
        title: 'Tests d\'intégration ERP',
        description: 'Validation des interfaces entre ancien et nouvel ERP',
        priority: 'high',
        assignee: 'Testeur technique',
        columnIndex: 2,
        dueDate: getDateInDays(15),
        tags: ['tests', 'intégration', 'validation'],
        subtasks: [
          { id: `${taskId}-1`, text: 'Tests unitaires interfaces', completed: false, dueDate: getDateInDays(12) },
          { id: `${taskId}-2`, text: 'Tests de charge base de données', completed: false, dueDate: getDateInDays(13) },
          { id: `${taskId}-3`, text: 'Tests bout en bout workflows', completed: false, dueDate: getDateInDays(14) },
          { id: `${taskId}-4`, text: 'Validation fonctionnelle métier', completed: false, dueDate: getDateInDays(15) }
        ]
      },
      {
        id: (taskId++).toString(),
        title: 'Documentation architecture finale',
        description: 'Transmission des éléments techniques et procédures',
        priority: 'medium',
        assignee: 'Architecte SI',
        columnIndex: 3,
        dueDate: getDateInDays(20),
        tags: ['documentation', 'transmission', 'architecture']
      },
      {
        id: (taskId++).toString(),
        title: 'Formation équipes techniques',
        description: 'Montée en compétences sur la nouvelle architecture',
        priority: 'medium',
        assignee: 'Expert SI',
        columnIndex: 3,
        dueDate: getDateInDays(18),
        tags: ['formation', 'équipes', 'compétences']
      }
    )
  }
  
  else if (projectType === 'CONSULTANT_SI') {
    // Consultant SI avec clients multiples
    contextualTasks.push(
      {
        id: (taskId++).toString(),
        title: 'Planification projets clients',
        description: 'Répartition des ressources entre les différents clients',
        priority: 'high',
        assignee: 'Chef de projet',
        columnIndex: 0,
        dueDate: getDateInDays(2),
        tags: ['planning', 'clients']
      },
      {
        id: (taskId++).toString(),
        title: 'Maintenance serveurs critiques',
        description: 'Vérification et mise à jour des systèmes en production',
        priority: 'high',
        assignee: 'Administrateur SI',
        columnIndex: 1,
        dueDate: getDateInDays(1),
        tags: ['maintenance', 'critique']
      },
      {
        id: (taskId++).toString(),
        title: 'Support niveau 2 - incidents',
        description: 'Résolution des tickets escaladés par le niveau 1',
        priority: 'medium',
        assignee: 'Technicien senior',
        columnIndex: 2,
        dueDate: getDateInDays(3),
        tags: ['support', 'incidents']
      },
      {
        id: (taskId++).toString(),
        title: 'Rapport mensuel client A',
        description: 'Synthèse des activités et métriques du mois',
        priority: 'medium',
        assignee: 'Chef de projet',
        columnIndex: 3,
        dueDate: getDateInDays(5),
        tags: ['reporting', 'client']
      }
    )
  }
  
  else if (projectType === 'CONSULTANT_AGILE') {
    // Consultant avec méthodologie agile
    contextualTasks.push(
      {
        id: (taskId++).toString(),
        title: 'Sprint Planning - Client A',
        description: 'Planification du sprint 2-semaines chez le client A',
        priority: 'high',
        assignee: 'Scrum Master',
        columnIndex: 0,
        dueDate: getDateInDays(1),
        tags: ['sprint', 'client-a']
      },
      {
        id: (taskId++).toString(),
        title: 'Maintenance applicative',
        description: 'Corrections bugs et petites évolutions',
        priority: 'medium',
        assignee: 'Développeur',
        columnIndex: 1,
        dueDate: getDateInDays(3),
        tags: ['maintenance', 'dev']
      }
    )
  }
  
  else if (primaryContext === 'TEMPORAL') {
    // Profil agile/sprint standard
    contextualTasks.push(
      {
        id: (taskId++).toString(),
        title: 'Sprint Planning',
        description: 'Planification des tâches du prochain sprint',
        priority: 'high',
        assignee: 'Scrum Master',
        columnIndex: 0,
        dueDate: getDateInDays(1),
        tags: ['sprint', 'planning']
      },
      {
        id: (taskId++).toString(),
        title: 'Daily Standup',
        description: 'Point quotidien équipe',
        priority: 'medium',
        assignee: 'Équipe Dev',
        columnIndex: 1,
        dueDate: getDateInDays(1),
        tags: ['daily', 'communication']
      },
      {
        id: (taskId++).toString(),
        title: 'Sprint Review',
        description: 'Démonstration et recette des fonctionnalités',
        priority: 'medium',
        assignee: 'Product Owner',
        columnIndex: 2,
        dueDate: getDateInDays(14),
        tags: ['review', 'demo']
      }
    )
  }
  
  else if (primaryContext === 'PHASED') {
    // Projet avec phases séquentielles
    contextualTasks.push(
      {
        id: (taskId++).toString(),
        title: 'Cahier des charges',
        description: 'Rédaction des spécifications fonctionnelles',
        priority: 'high',
        assignee: 'Analyste',
        columnIndex: 0,
        dueDate: getDateInDays(7),
        tags: ['specs', 'fonctionnel']
      },
      {
        id: (taskId++).toString(),
        title: 'Architecture technique',
        description: 'Conception de l\'architecture système',
        priority: 'high',
        assignee: 'Architecte',
        columnIndex: 0,
        dueDate: getDateInDays(10),
        tags: ['architecture', 'technique']
      },
      {
        id: (taskId++).toString(),
        title: 'Plan de tests',
        description: 'Définition de la stratégie de validation',
        priority: 'medium',
        assignee: 'Testeur',
        columnIndex: 2,
        dueDate: getDateInDays(12),
        tags: ['tests', 'qualité']
      }
    )
  }
  
  else if (primaryContext === 'CLIENT_BASED') {
    // Organisation par clients
    contextualTasks.push(
      {
        id: (taskId++).toString(),
        title: 'Suivi projet Client A',
        description: 'Point hebdomadaire sur l\'avancement',
        priority: 'high',
        assignee: 'Chef de projet',
        columnIndex: 0,
        dueDate: getDateInDays(2),
        tags: ['client-a', 'suivi']
      },
      {
        id: (taskId++).toString(),
        title: 'Livraison Client B',
        description: 'Préparation de la livraison mensuelle',
        priority: 'medium',
        assignee: 'Équipe delivery',
        columnIndex: 1,
        dueDate: getDateInDays(5),
        tags: ['client-b', 'livraison']
      },
      {
        id: (taskId++).toString(),
        title: 'Prospection nouveaux clients',
        description: 'Démarchage et propositions commerciales',
        priority: 'low',
        assignee: 'Commercial',
        columnIndex: 2,
        dueDate: getDateInDays(10),
        tags: ['prospection', 'commercial']
      }
    )
  }
  
  // Ajouter tâches additionnelles selon complexité
  if (complexity === 'HIGH') {
    contextualTasks.push({
      id: (taskId++).toString(),
      title: 'Analyse des risques',
      description: 'Identification et mitigation des risques projet',
      priority: 'high',
      assignee: 'Risk Manager',
      columnIndex: 0,
      dueDate: getDateInDays(3),
      tags: ['risques', 'analyse']
    })
  }
  
  return contextualTasks
}

const getDateInDays = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

const getColumnDescription = (name, index, context) => {
  // Descriptions contextuelles plus intelligentes
  const contextualDescriptions = {
    'CLIENT_BASED': [
      'Projets prioritaires du client principal',
      'Projets du second client actif', 
      'Nouvelles opportunités commerciales',
      'Tâches internes et administratives'
    ],
    'TEMPORAL': [
      'Tâches à planifier pour le prochain cycle',
      'Tâches du sprint/cycle en cours',
      'Tâches en phase de validation',
      'Tâches terminées ce cycle'
    ],
    'PHASED': [
      'Phase d\'analyse et spécifications',
      'Phase de développement et réalisation', 
      'Phase de tests et validation qualité',
      'Phase de déploiement et mise en service'
    ],
    'PROCESS_BASED': [
      'Étape d\'initialisation du processus',
      'Étape de traitement principal',
      'Étape de validation et contrôle',
      'Étape de finalisation et archivage'
    ]
  }
  
  const descriptions = contextualDescriptions[context] || [
    'Phase d\'analyse et spécifications',
    'Développement et configuration', 
    'Tests et validation qualité',
    'Déploiement et mise en service'
  ]
  
  return descriptions[index] || 'Phase du projet'
}
</script>