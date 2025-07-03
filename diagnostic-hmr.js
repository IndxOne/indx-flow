#!/usr/bin/env node

/**
 * Script de diagnostic pour les problèmes de Hot Module Reload (HMR)
 * Identifie les causes courantes de dysfonctionnement
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔍 DIAGNOSTIC HMR - INDX Flow')
console.log('===============================\n')

// Checks à effectuer
const checks = [
  {
    name: 'Configuration Vite',
    check: () => {
      const viteConfig = path.join(__dirname, 'vite.config.js')
      if (!fs.existsSync(viteConfig)) {
        return { status: '❌', message: 'vite.config.js manquant' }
      }
      
      const content = fs.readFileSync(viteConfig, 'utf8')
      const hasHMR = content.includes('hmr')
      const hasWatch = content.includes('watch')
      
      return { 
        status: hasHMR && hasWatch ? '✅' : '⚠️', 
        message: `HMR: ${hasHMR ? '✓' : '✗'}, Watch: ${hasWatch ? '✓' : '✗'}` 
      }
    }
  },
  
  {
    name: 'Cache Vite',
    check: () => {
      const viteCache = path.join(__dirname, 'node_modules/.vite')
      const cacheExists = fs.existsSync(viteCache)
      
      if (cacheExists) {
        const stats = fs.statSync(viteCache)
        const age = (Date.now() - stats.mtime.getTime()) / (1000 * 60) // minutes
        
        return {
          status: age > 60 ? '⚠️' : '✅',
          message: `Cache: ${age.toFixed(0)}min (${age > 60 ? 'ancien' : 'récent'})`
        }
      }
      
      return { status: '❌', message: 'Pas de cache Vite trouvé' }
    }
  },
  
  {
    name: 'Processus actifs',
    check: () => {
      // Vérifier les ports
      return { status: '📊', message: 'Ports: 3002 (dev), 3003 (HMR)' }
    }
  },
  
  {
    name: 'Structure des fichiers',
    check: () => {
      const srcExists = fs.existsSync(path.join(__dirname, 'src'))
      const homeVue = fs.existsSync(path.join(__dirname, 'src/views/Home.vue'))
      
      return {
        status: srcExists && homeVue ? '✅' : '❌',
        message: `src/: ${srcExists ? '✓' : '✗'}, Home.vue: ${homeVue ? '✓' : '✗'}`
      }
    }
  },
  
  {
    name: 'Variables d\'environnement',
    check: () => {
      const isWSL = process.platform === 'linux' && process.env.WSL_DISTRO_NAME
      const isWindows = process.platform === 'win32'
      
      return {
        status: '📋',
        message: `Système: ${isWSL ? 'WSL' : isWindows ? 'Windows' : 'Linux/Mac'}`
      }
    }
  }
]

// Exécuter tous les checks
console.log('🔍 Vérifications en cours...\n')

checks.forEach((check, index) => {
  try {
    const result = check.check()
    console.log(`${index + 1}. ${check.name}`)
    console.log(`   ${result.status} ${result.message}\n`)
  } catch (error) {
    console.log(`${index + 1}. ${check.name}`)
    console.log(`   ❌ Erreur: ${error.message}\n`)
  }
})

// Recommandations
console.log('💡 RECOMMANDATIONS')
console.log('==================\n')

const recommendations = [
  '1. Essayer: npm run dev:turbo (hot reload ultra-rapide)',
  '2. Si problème persiste: npm run force-reload',
  '3. Pour WSL: npm run dev:fast (force polling)',
  '4. En dernier recours: Ctrl+C puis relancer npm run dev',
  '5. Vérifier que le navigateur n\'est pas en cache dur (Ctrl+F5)'
]

recommendations.forEach(rec => console.log(`   ${rec}`))

console.log('\n🚀 Scripts disponibles:')
console.log('   npm run dev         - Mode normal')
console.log('   npm run dev:turbo   - Mode ultra-rapide (recommandé)')
console.log('   npm run dev:fast    - Mode force avec polling')
console.log('   npm run force-reload - Clear cache + restart')
console.log('   npm run clear-cache - Nettoyer le cache Vite')

console.log('\n📡 URLs de test:')
console.log('   Frontend: http://localhost:3002')
console.log('   HMR WebSocket: ws://localhost:3003')

console.log('\n🔧 Diagnostic terminé!')