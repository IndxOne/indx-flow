import { createRouter, createWebHistory } from 'vue-router'
import ProfileSelector from '../views/ProfileSelector.vue'
import Home from '../views/Home.vue'
import Analytics from '../views/Analytics.vue'
import WorkspaceGenerator from '../components/WorkspaceGenerator.vue'

// Lazy loading pour optimiser les performances
const ProfileDashboard = () => import('../views/ProfileDashboard.vue')
const WorkspacesList = () => import('../components/WorkspacesList.vue')

const routes = [
  // Page d'accueil avec sélecteur de profil
  {
    path: '/',
    name: 'ProfileSelector',
    component: ProfileSelector
  },
  
  // Routes de profils avec sous-routes
  {
    path: '/:profileType(consultant-si|technicien-si|generic)',
    component: ProfileDashboard,
    children: [
      // Liste des workspaces pour un profil
      {
        path: '',
        name: 'ProfileWorkspaces',
        component: WorkspacesList,
        props: true
      },
      
      // Création d'un nouveau workspace pour un profil
      {
        path: 'new',
        name: 'NewWorkspace',
        component: Home, // Utilise le formulaire existant
        props: true
      },
      
      // Workspace spécifique d'un profil
      {
        path: 'workspace/:workspaceId',
        name: 'ProfileWorkspace',
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