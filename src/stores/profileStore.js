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
      description: 'Missions techniques variées : intégration, maintenance, support, développement',
      icon: '🔧',
      color: 'emerald',
      
      preferredContexts: ['PROCESS_BASED', 'PHASED', 'RESOURCE_BASED'],
      
      // Structure générique (remplacée par missions spécialisées)
      defaultStructure: [
        '🎯 Analyse',
        '⚙️ Configuration',
        '🧪 Tests',
        '✅ Livraison'
      ],
      
      // 🚀 MISSIONS SPÉCIALISÉES TECHNICIEN SI
      missions: {
        'integration-systemes': {
          id: 'integration-systemes',
          label: 'Intégration Systèmes',
          description: 'Intégration ERP et systèmes interconnectés',
          icon: '🏗️',
          structure: [
            '📋 Analyse',
            '⚙️ Configuration', 
            '🧪 Tests',
            '🚀 Go-Live'
          ],
          contexts: ['PROCESS_BASED', 'PHASED'],
          questions: [
            {
              key: 'systemType',
              type: 'select',
              label: 'Type de système principal',
              options: [
                { value: 'erp', label: 'ERP (SAP, Oracle, Dynamics)' },
                { value: 'crm', label: 'CRM (Salesforce, HubSpot)' },
                { value: 'bi', label: 'BI/Analytics (Power BI, Tableau)' },
                { value: 'custom', label: 'Développement spécifique' }
              ]
            },
            {
              key: 'integrationComplexity',
              type: 'select',
              label: 'Complexité de l\'intégration',
              options: [
                { value: 'simple', label: 'Simple (1-2 systèmes)' },
                { value: 'medium', label: 'Moyenne (3-5 systèmes)' },
                { value: 'complex', label: 'Complexe (5+ systèmes)' }
              ]
            }
          ],
          defaultTasks: [
            {
              title: 'Cartographie systèmes existants',
              description: 'Inventaire et analyse des systèmes à intégrer',
              columnIndex: 0,
              subtasks: [
                { text: 'Audit architecture existante', dueDate: null },
                { text: 'Identification des flux de données', dueDate: null },
                { text: 'Analyse des contraintes techniques', dueDate: null }
              ]
            },
            {
              title: 'Paramétrage connecteurs',
              description: 'Configuration des interfaces et connecteurs',
              columnIndex: 1,
              subtasks: [
                { text: 'Configuration API', dueDate: null },
                { text: 'Mapping des données', dueDate: null },
                { text: 'Tests unitaires connecteurs', dueDate: null }
              ]
            }
          ]
        },
        
        'maintenance-ticketing': {
          id: 'maintenance-ticketing',
          label: 'Maintenance/Ticketing',
          description: 'Gestion des incidents et maintenance corrective',
          icon: '🎫',
          structure: [
            '📥 Nouveau',
            '🔧 En cours',
            '✅ Test',
            '✨ Résolu'
          ],
          contexts: ['PROCESS_BASED', 'RESOURCE_BASED'],
          questions: [
            {
              key: 'ticketingTool',
              type: 'select',
              label: 'Outil de ticketing',
              options: [
                { value: 'jira', label: 'Jira Service Management' },
                { value: 'servicenow', label: 'ServiceNow' },
                { value: 'freshdesk', label: 'Freshdesk' },
                { value: 'other', label: 'Autre outil' }
              ]
            },
            {
              key: 'priorityLevels',
              type: 'multiselect',
              label: 'Niveaux de priorité gérés',
              options: [
                { value: 'critical', label: 'Critique (< 2h)' },
                { value: 'high', label: 'Haute (< 4h)' },
                { value: 'medium', label: 'Moyenne (< 24h)' },
                { value: 'low', label: 'Basse (< 72h)' }
              ]
            }
          ],
          defaultTasks: [
            {
              title: 'Bug critique production',
              description: 'Erreur bloquante sur l\'application métier',
              columnIndex: 0,
              priority: 'high',
              subtasks: [
                { text: 'Reproduction du bug', dueDate: null },
                { text: 'Analyse logs système', dueDate: null },
                { text: 'Identification cause racine', dueDate: null }
              ]
            },
            {
              title: 'Optimisation performance',
              description: 'Amélioration temps de réponse base de données',
              columnIndex: 1,
              priority: 'medium',
              subtasks: [
                { text: 'Analyse requêtes lentes', dueDate: null },
                { text: 'Optimisation index', dueDate: null },
                { text: 'Tests de charge', dueDate: null }
              ]
            }
          ]
        },
        
        'support-programme': {
          id: 'support-programme',
          label: 'Support Programmé',
          description: 'Support utilisateurs planifié par semaines',
          icon: '📅',
          structure: [
            '📅 Semaine 28',
            '📅 Semaine 29', 
            '📅 Semaine 30',
            '📦 Archive'
          ],
          contexts: ['TEMPORAL', 'RESOURCE_BASED'],
          questions: [
            {
              key: 'supportType',
              type: 'select',
              label: 'Type de support principal',
              options: [
                { value: 'user_training', label: 'Formation utilisateurs' },
                { value: 'functional_support', label: 'Support fonctionnel' },
                { value: 'technical_assistance', label: 'Assistance technique' },
                { value: 'change_management', label: 'Accompagnement au changement' }
              ]
            },
            {
              key: 'weeklyCapacity',
              type: 'select',
              label: 'Capacité hebdomadaire',
              options: [
                { value: 'light', label: 'Légère (5-10 demandes/semaine)' },
                { value: 'medium', label: 'Moyenne (10-20 demandes/semaine)' },
                { value: 'heavy', label: 'Intensive (20+ demandes/semaine)' }
              ]
            }
          ],
          defaultTasks: [
            {
              title: 'Formation groupe comptabilité',
              description: 'Session formation nouveau module ERP',
              columnIndex: 0,
              subtasks: [
                { text: 'Préparation supports', dueDate: '2025-07-15' },
                { text: 'Session formation (2h)', dueDate: '2025-07-16' },
                { text: 'Suivi post-formation', dueDate: '2025-07-17' }
              ]
            },
            {
              title: 'Support demandes RH',
              description: 'Assistance quotidienne équipe RH',
              columnIndex: 1,
              subtasks: [
                { text: 'Traitement demandes nouvelles', dueDate: '2025-07-22' },
                { text: 'Optimisation processus', dueDate: '2025-07-23' },
                { text: 'Documentation FAQ', dueDate: '2025-07-24' }
              ]
            }
          ]
        },
        
        'developpement-outils': {
          id: 'developpement-outils',
          label: 'Développement Outils',
          description: 'Développement d\'outils internes et solutions spécifiques',
          icon: '⚙️',
          structure: [
            '📋 Analyse',
            '🎨 Conception',
            '🚀 Déploiement',
            '📊 Suivi'
          ],
          contexts: ['PHASED', 'VERSIONED'],
          questions: [
            {
              key: 'devType',
              type: 'select',
              label: 'Type de développement',
              options: [
                { value: 'web_app', label: 'Application web' },
                { value: 'automation', label: 'Script d\'automatisation' },
                { value: 'integration', label: 'Connecteur/API' },
                { value: 'reporting', label: 'Outil de reporting' }
              ]
            },
            {
              key: 'techStack',
              type: 'multiselect',
              label: 'Technologies utilisées',
              options: [
                { value: 'python', label: 'Python' },
                { value: 'javascript', label: 'JavaScript/Node.js' },
                { value: 'csharp', label: 'C#/.NET' },
                { value: 'sql', label: 'SQL/Base de données' },
                { value: 'powershell', label: 'PowerShell' }
              ]
            }
          ],
          defaultTasks: [
            {
              title: 'Outil reporting automatisé',
              description: 'Développement dashboard KPI temps réel',
              columnIndex: 0,
              subtasks: [
                { text: 'Analyse besoins utilisateurs', dueDate: null },
                { text: 'Spécifications fonctionnelles', dueDate: null },
                { text: 'Choix architecture technique', dueDate: null }
              ]
            },
            {
              title: 'API intégration comptabilité',
              description: 'Connecteur automatique ERP → comptabilité',
              columnIndex: 1,
              subtasks: [
                { text: 'Développement API REST', dueDate: null },
                { text: 'Système d\'authentification', dueDate: null },
                { text: 'Tests intégration', dueDate: null }
              ]
            }
          ]
        },
        
        'gestion-projet': {
          id: 'gestion-projet',
          label: 'Gestion Projet',
          description: 'Coordination projet selon le rôle (PMO, Dev Lead, Tech Lead)',
          icon: '📊',
          structure: [
            '🎯 Planning',
            '👥 Équipe',
            '📊 Suivi',
            '✅ Livraison'
          ],
          contexts: ['RESOURCE_BASED', 'TEMPORAL'],
          questions: [
            {
              key: 'projectRole',
              type: 'select',
              label: 'Votre rôle dans le projet',
              options: [
                { value: 'pmo', label: 'PMO (Project Management Office)' },
                { value: 'dev_lead', label: 'Dev Lead (Responsable développement)' },
                { value: 'tech_lead', label: 'Tech Lead (Architecture technique)' },
                { value: 'project_manager', label: 'Chef de projet' }
              ]
            },
            {
              key: 'teamSize',
              type: 'select',
              label: 'Taille de l\'équipe projet',
              options: [
                { value: 'small', label: 'Petite (2-5 personnes)' },
                { value: 'medium', label: 'Moyenne (6-12 personnes)' },
                { value: 'large', label: 'Grande (12+ personnes)' }
              ]
            }
          ],
          defaultTasks: [
            {
              title: 'Planning sprint 2 semaines',
              description: 'Organisation du prochain sprint équipe',
              columnIndex: 0,
              subtasks: [
                { text: 'Rétrospective sprint précédent', dueDate: null },
                { text: 'Estimation user stories', dueDate: null },
                { text: 'Répartition tâches équipe', dueDate: null }
              ]
            },
            {
              title: 'Suivi avancement développement',
              description: 'Coordination technique et livraisons',
              columnIndex: 2,
              subtasks: [
                { text: 'Daily standup équipe', dueDate: null },
                { text: 'Review code développeurs', dueDate: null },
                { text: 'Coordination avec autres équipes', dueDate: null }
              ]
            }
          ]
        }
      },
      
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