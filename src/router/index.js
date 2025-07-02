import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Analytics from '../views/Analytics.vue'
import WorkspaceGenerator from '../components/WorkspaceGenerator.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: Analytics
  },
  {
    path: '/workspace',
    name: 'Workspace',
    component: WorkspaceGenerator
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router