import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseService } from '../services/supabase.js'

export const useProfileStore = defineStore('profile', () => {
  
  // ================================================================
  // DÉFINITIONS DES PROFILS
  // ================================================================
  
  const profileDefinitions = {
    'consultant-si': {
      id: 'consultant-si',
      label: 'Consultant SI',
      description: 'Gestion projets clients multiples avec équipes dédiées',
      icon: '👔',
      color: 'indigo',
      
      // Contextes privilégiés pour ce profil
      preferredContexts: ['CLIENT_BASED', 'TEMPORAL', 'RESOURCE_BASED'],
      
      // Structure par défaut spécialisée
      defaultStructure: [
        '📋 Projets Clients',
        '⚙️ Maintenance SI', 
        '🔧 Support Tech',
        '📊 Pilotage/Contrats'
      ],
      
      // Questions spécialisées
      adaptiveQuestions: [
        {
          key: 'clientCount',
          type: 'select',
          label: 'Nombre de clients gérés simultanément',
          options: [
            { value: '1-3', label: '1 à 3 clients' },
            { value: '4-8', label: '4 à 8 clients' },
            { value: '8+', label: 'Plus de 8 clients' }
          ]
        },
        {
          key: 'projectTypes',
          type: 'multiselect',
          label: 'Types de projets principaux',
          options: [
            { value: 'erp_migration', label: 'Migration ERP' },
            { value: 'infrastructure', label: 'Infrastructure SI' },
            { value: 'integration', label: 'Intégration systèmes' },
            { value: 'maintenance', label: 'Maintenance & Support' }
          ]
        },
        {
          key: 'teamSize',
          type: 'select',
          label: 'Taille d\'équipe habituelle',
          options: [
            { value: 'solo', label: 'Solo (1 personne)' },
            { value: 'small', label: 'Petite équipe (2-5)' },
            { value: 'medium', label: 'Équipe moyenne (6-12)' },
            { value: 'large', label: 'Grande équipe (12+)' }
          ]
        }
      ],
      
      // Templates de tâches par défaut
      defaultTasks: [
        {
          title: 'Audit infrastructure client',
          description: 'Évaluation complète de l\'existant',
          columnIndex: 0,
          priority: 'high',
          subtasks: [
            { text: 'Inventaire matériel', dueDate: null },
            { text: 'Analyse performances', dueDate: null },
            { text: 'Rapport sécurité', dueDate: null }
          ]
        },
        {
          title: 'Planning maintenance mensuelle',
          description: 'Tâches récurrentes de maintenance',
          columnIndex: 1,
          priority: 'medium',
          subtasks: [
            { text: 'Mises à jour sécurité', dueDate: null },
            { text: 'Monitoring performances', dueDate: null },
            { text: 'Backup vérification', dueDate: null }
          ]
        }
      ]
    },
    
    'technicien-si': {
      id: 'technicien-si',
      label: 'Technicien SI',
      description: 'Projets ERP et infrastructure technique',
      icon: '🔧',
      color: 'emerald',
      
      preferredContexts: ['PROCESS_BASED', 'PHASED', 'RESOURCE_BASED'],
      
      defaultStructure: [
        '🎯 Analyse & Spécification',
        '⚙️ Paramétrage & Config',
        '🧪 Tests & Validation',
        '🚀 Formation & Go-Live'
      ],
      
      adaptiveQuestions: [
        {
          key: 'erpSystem',
          type: 'select',
          label: 'Système ERP principal',
          options: [
            { value: 'sap', label: 'SAP' },
            { value: 'oracle', label: 'Oracle' },
            { value: 'microsoft', label: 'Microsoft Dynamics' },
            { value: 'other', label: 'Autre ERP' }
          ]
        },
        {
          key: 'projectPhase',
          type: 'select',
          label: 'Phase projet actuelle',
          options: [
            { value: 'analysis', label: 'Analyse des besoins' },
            { value: 'config', label: 'Paramétrage système' },
            { value: 'testing', label: 'Tests & recette' },
            { value: 'deployment', label: 'Déploiement' },
            { value: 'support', label: 'Support post-déploiement' }
          ]
        },
        {
          key: 'technicalComplexity',
          type: 'select',
          label: 'Complexité technique du projet',
          options: [
            { value: 'low', label: 'Standard (configuration simple)' },
            { value: 'medium', label: 'Moyenne (quelques développements)' },
            { value: 'high', label: 'Complexe (développements importants)' },
            { value: 'critical', label: 'Critique (architecture complexe)' }
          ]
        }
      ],
      
      defaultTasks: [
        {
          title: 'Spécifications fonctionnelles',
          description: 'Détail des besoins métier',
          columnIndex: 0,
          priority: 'high',
          subtasks: [
            { text: 'Interview utilisateurs clés', dueDate: null },
            { text: 'Cartographie processus AS-IS', dueDate: null },
            { text: 'Définition processus TO-BE', dueDate: null }
          ]
        },
        {
          title: 'Configuration environnement',
          description: 'Setup technique du système',
          columnIndex: 1,
          priority: 'high',
          subtasks: [
            { text: 'Installation serveurs', dueDate: null },
            { text: 'Paramétrage base', dueDate: null },
            { text: 'Configuration sécurité', dueDate: null }
          ]
        }
      ]
    },
    
    'generic': {
      id: 'generic',
      label: 'Profil Générique',
      description: 'Détection automatique de votre contexte organisationnel',
      icon: '🎯',
      color: 'gray',
      
      preferredContexts: ['CLIENT_BASED', 'TEMPORAL', 'PHASED', 'PROCESS_BASED'],
      
      defaultStructure: [
        'À faire',
        'En cours', 
        'En révision',
        'Terminé'
      ],
      
      adaptiveQuestions: [
        {
          key: 'organizationType',
          type: 'select',
          label: 'Type d\'organisation principal',
          options: [
            { value: 'client_based', label: 'Par clients/projets' },
            { value: 'temporal', label: 'Par cycles/sprints' },
            { value: 'phased', label: 'Par phases séquentielles' },
            { value: 'process', label: 'Par processus métier' }
          ]
        },
        {
          key: 'teamContext',
          type: 'select',
          label: 'Contexte de travail',
          options: [
            { value: 'solo', label: 'Travail individuel' },
            { value: 'small_team', label: 'Petite équipe' },
            { value: 'large_team', label: 'Grande équipe' },
            { value: 'multi_team', label: 'Multi-équipes' }
          ]
        }
      ],
      
      defaultTasks: [
        {
          title: 'Tâche exemple',
          description: 'Description de la tâche',
          columnIndex: 0,
          priority: 'medium',
          subtasks: [
            { text: 'Sous-tâche 1', dueDate: null },
            { text: 'Sous-tâche 2', dueDate: null }
          ]
        }
      ]
    }
  }
  
  // ================================================================
  // ÉTAT DU STORE
  // ================================================================
  
  const currentProfile = ref('generic')
  const userProfiles = ref({})  // Workspaces par profil
  const isLoading = ref(false)
  
  // ================================================================
  // GETTERS
  // ================================================================
  
  const currentProfileData = computed(() => {
    return profileDefinitions[currentProfile.value] || profileDefinitions.generic
  })
  
  const allProfiles = computed(() => {
    return Object.values(profileDefinitions)
  })
  
  const availableProfiles = computed(() => {
    return allProfiles.value.filter(profile => profile.id !== 'generic')
  })
  
  const currentWorkspaces = computed(() => {
    return userProfiles.value[currentProfile.value] || []
  })
  
  const getProfileById = (profileId) => {
    return profileDefinitions[profileId] || profileDefinitions.generic
  }
  
  // ================================================================
  // ACTIONS
  // ================================================================
  
  const setCurrentProfile = (profileId) => {
    if (profileDefinitions[profileId]) {
      currentProfile.value = profileId
      console.log('✅ [PROFILE] Profil actuel:', profileId)
    } else {
      console.warn('⚠️ [PROFILE] Profil inexistant:', profileId)
      currentProfile.value = 'generic'
    }
  }
  
  const loadUserWorkspaces = async (userEmail) => {
    if (!userEmail || !supabaseService.isEnabled) {
      console.log('📦 [PROFILE] Mode local - pas de chargement workspaces')
      return
    }
    
    isLoading.value = true
    
    try {
      const result = await supabaseService.getUserWorkspaces(userEmail)
      
      if (result.success) {
        // Organiser les workspaces par profil
        const workspacesByProfile = {}
        
        result.data.forEach(workspace => {
          // Déterminer le profil du workspace
          let profileId = 'generic'
          
          // Logique de détection du profil basée sur le project_type ou structure
          if (workspace.project_type) {
            if (workspace.project_type.includes('CONSULTANT')) {
              profileId = 'consultant-si'
            } else if (workspace.project_type.includes('ERP') || workspace.project_type.includes('TECH')) {
              profileId = 'technicien-si'
            }
          }
          
          if (!workspacesByProfile[profileId]) {
            workspacesByProfile[profileId] = []
          }
          
          workspacesByProfile[profileId].push(workspace)
        })
        
        userProfiles.value = workspacesByProfile
        console.log('✅ [PROFILE] Workspaces chargés par profil:', workspacesByProfile)
      }
    } catch (error) {
      console.error('❌ [PROFILE] Erreur chargement workspaces:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  const createWorkspaceForProfile = async (profileId, workspaceData) => {
    const profile = getProfileById(profileId)
    
    // Enrichir les données avec les spécificités du profil
    const enrichedData = {
      ...workspaceData,
      profileId: profileId,
      structure: workspaceData.structure || profile.defaultStructure,
      workspaceConfig: {
        ...workspaceData.workspaceConfig,
        profileType: profileId,
        projectType: determineProjectType(profileId, workspaceData.detectedContexts)
      }
    }
    
    // Créer le workspace via le service
    if (supabaseService.isEnabled) {
      try {
        const result = await supabaseService.createWorkspace(enrichedData)
        
        if (result.success) {
          // Ajouter à la liste locale
          if (!userProfiles.value[profileId]) {
            userProfiles.value[profileId] = []
          }
          userProfiles.value[profileId].push(result.data)
          
          console.log('✅ [PROFILE] Workspace créé pour profil', profileId, ':', result.data.id)
          return { success: true, workspaceId: result.data.id, workspace: result.data }
        }
      } catch (error) {
        console.error('❌ [PROFILE] Erreur création workspace:', error)
      }
    }
    
    return { success: false, reason: 'Supabase non disponible' }
  }
  
  const getWorkspacesByProfile = (profileId) => {
    return userProfiles.value[profileId] || []
  }
  
  const getProfileStats = () => {
    const stats = {}
    
    Object.keys(profileDefinitions).forEach(profileId => {
      if (profileId !== 'generic') {
        stats[profileId] = {
          workspaceCount: (userProfiles.value[profileId] || []).length,
          label: profileDefinitions[profileId].label
        }
      }
    })
    
    return stats
  }
  
  // Helper pour déterminer le type de projet selon le profil
  const determineProjectType = (profileId, detectedContexts) => {
    const baseTypes = {
      'consultant-si': 'CONSULTANT_SI',
      'technicien-si': 'TECHNICIEN_SI_ERP',
      'generic': 'GENERIC'
    }
    
    let projectType = baseTypes[profileId] || 'GENERIC'
    
    // Enrichir selon les contextes détectés
    if (detectedContexts && detectedContexts.length > 0) {
      const contextCombination = detectedContexts.map(c => c.type).sort().join('_')
      
      const enrichedTypes = {
        'CLIENT_BASED_PROCESS_BASED_RESOURCE_BASED': 'CONSULTANT_SI_COMPLEX',
        'PROCESS_BASED_PHASED_RESOURCE_BASED': 'TECHNICIEN_SI_ERP_COMPLEX',
        'CLIENT_BASED_TEMPORAL': 'CONSULTANT_AGILE',
        'PROCESS_BASED_PHASED': 'PROJECT_MANAGEMENT'
      }
      
      projectType = enrichedTypes[contextCombination] || projectType
    }
    
    return projectType
  }
  
  return {
    // State
    currentProfile,
    userProfiles,
    isLoading,
    
    // Getters
    currentProfileData,
    allProfiles,
    availableProfiles,
    currentWorkspaces,
    getProfileById,
    
    // Actions
    setCurrentProfile,
    loadUserWorkspaces,
    createWorkspaceForProfile,
    getWorkspacesByProfile,
    getProfileStats
  }
})