import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Analytics from '../views/Analytics.vue'
import WorkspaceGenerator from '../components/WorkspaceGenerator.vue'
import WelcomeGuided from '../views/WelcomeGuided.vue'

// Lazy loading pour optimiser les performances
const ProfileDashboard = () => import('../views/ProfileDashboard.vue')
const WorkspacesList = () => import('../views/WorkspacesList.vue')
const TechnicienMissionSelector = () => import('../components/TechnicienMissionSelector.vue')

const routes = [
  // Page d'accueil simplifiée style ux-demo.html
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  
  // Route pour le formulaire d'analyse guidée
  {
    path: '/welcome-guided',
    name: 'WelcomeGuided',
    component: WelcomeGuided
  },
  
  // Route pour le formulaire principal avec étapes
  {
    path: '/welcome-guided-form',
    name: 'WelcomeGuidedForm',
    component: () => import('../views/WelcomeGuidedForm.vue')
  },
  
  // Route pour la liste des espaces existants
  {
    path: '/workspaces',
    name: 'WorkspacesList',
    component: WorkspacesList
  },
  
  // Route pour mettre à jour un espace existant
  {
    path: '/workspace-update',
    name: 'WorkspaceUpdate',
    component: () => import('../views/WorkspaceUpdate.vue')
  },
  
  // Route pour les résultats d'analyse (depuis WelcomeGuided)
  {
    path: '/analysis-results',
    name: 'AnalysisResults',
    component: WelcomeGuided // Peut-être à changer si besoin d'une vue différente
  },
  
  // Routes de profils avec sous-routes
  {
    path: '/:profileType(consultant-si|technicien-si|generic)',
    component: ProfileDashboard,
    children: [
      // Route pour sélecteur de missions (Technicien SI) ou liste workspaces (autres profils)
      {
        path: '',
        name: 'ProfileWorkspaces',
        component: WorkspacesList,
        props: true,
        meta: { 
          showMissionSelector: true // Indique que cette route peut afficher le sélecteur de missions
        }
      },
      
      // Liste des workspaces pour une mission spécifique (Technicien SI)
      {
        path: ':missionId(integration-systemes|maintenance-ticketing|support-programme|developpement-outils|gestion-projet)',
        name: 'MissionWorkspaces',
        component: WorkspacesList,
        props: true
      },
      
      // Création d'un nouveau workspace pour un profil ou une mission
      {
        path: 'new',
        name: 'NewWorkspace',
        component: Home, // Utilise le formulaire existant
        props: true
      },
      
      // Création d'un nouveau workspace pour une mission spécifique
      {
        path: ':missionId(integration-systemes|maintenance-ticketing|support-programme|developpement-outils|gestion-projet)/new',
        name: 'NewMissionWorkspace',
        component: Home,
        props: true
      },
      
      // Workspace spécifique d'un profil
      {
        path: 'workspace/:workspaceId',
        name: 'ProfileWorkspace',
        component: WorkspaceGenerator,
        props: true
      },
      
      // Workspace spécifique d'une mission
      {
        path: ':missionId(integration-systemes|maintenance-ticketing|support-programme|developpement-outils|gestion-projet)/workspace/:workspaceId',
        name: 'MissionWorkspace',
        component: WorkspaceGenerator,
        props: true
      }
    ]
  },
  
  // Routes legacy pour rétrocompatibilité
  {
    path: '/home',
    redirect: '/generic/new'
  },
  {
    path: '/workspace',
    redirect: to => {
      // Rediriger vers le profil générique si pas de contexte
      return '/generic/workspace/new'
    }
  },
  
  // Analytics global
  {
    path: '/analytics',
    name: 'Analytics',
    component: Analytics
  },
  
  // Route catch-all pour profils invalides
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards pour validation des profils
router.beforeEach((to, from, next) => {
  // Vérifier si le profil existe
  if (to.params.profileType) {
    const validProfiles = ['consultant-si', 'technicien-si', 'generic']
    
    if (!validProfiles.includes(to.params.profileType)) {
      console.warn('⚠️ [ROUTER] Profil invalide:', to.params.profileType)
      next('/')
      return
    }
  }
  
  next()
})

export default router