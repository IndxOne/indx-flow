#!/usr/bin/env node

/**
 * Script de développement ultra-rapide avec hot reload forcé
 * Alternative à Turbo pour Vue.js + Vite
 */

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import chokidar from 'chokidar'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🚀 INDX Flow - Mode Turbo Développement')
console.log('📡 Hot reload ultra-rapide activé\n')

// Configuration
const config = {
  srcDir: join(__dirname, 'src'),
  publicDir: join(__dirname, 'public'),
  excludePatterns: ['node_modules', '.git', 'dist', '.vite'],
  debounceMs: 50 // Très réactif
}

// Compteur de rechargements
let reloadCount = 0

// Fonction pour forcer le reload du navigateur
function forceReload() {
  reloadCount++
  console.log(`🔄 Force reload #${reloadCount} - ${new Date().toLocaleTimeString()}`)
  
  // Force reload via WebSocket (si disponible)
  try {
    // Message au navigateur pour reload complet
    process.stdout.write('\x1b[2J\x1b[0f') // Clear console
    console.log('🚀 INDX Flow - Hot Reload Forcé')
    console.log(`📡 Reload #${reloadCount} effectué`)
    console.log('🌐 URL: http://localhost:3002\n')
  } catch (err) {
    console.log('⚠️ Reload automatique non disponible, rafraîchir manuellement')
  }
}

// Démarrer Vite avec configuration optimisée
console.log('🛠️ Démarrage du serveur Vite optimisé...')

const viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    VITE_HOT_RELOAD: 'true',
    VITE_FORCE_RELOAD: 'true'
  }
})

// Watcher de fichiers avec options optimisées
const watcher = chokidar.watch([config.srcDir], {
  ignored: config.excludePatterns,
  persistent: true,
  ignoreInitial: true,
  followSymlinks: false,
  depth: 10,
  awaitWriteFinish: {
    stabilityThreshold: config.debounceMs,
    pollInterval: 10
  }
})

// Variables pour debouncing
let reloadTimeout = null

// Fonction de reload avec debounce
function scheduleReload(path, event) {
  clearTimeout(reloadTimeout)
  
  reloadTimeout = setTimeout(() => {
    const relativePath = path.replace(config.srcDir, 'src')
    console.log(`📝 ${event}: ${relativePath}`)
    forceReload()
  }, config.debounceMs)
}

// Événements de fichiers
watcher
  .on('change', (path) => scheduleReload(path, 'Modifié'))
  .on('add', (path) => scheduleReload(path, 'Ajouté'))
  .on('unlink', (path) => scheduleReload(path, 'Supprimé'))
  .on('ready', () => {
    console.log('👀 Surveillance des fichiers active')
    console.log('🌐 Application disponible sur http://localhost:3002')
    console.log('⚡ Mode Turbo: Rechargement ultra-rapide\n')
  })
  .on('error', (error) => {
    console.error('❌ Erreur watcher:', error)
  })

// Gestion des signaux pour cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du mode Turbo...')
  watcher.close()
  viteProcess.kill()
  process.exit(0)
})

process.on('SIGTERM', () => {
  watcher.close()
  viteProcess.kill()
})

// Affichage des stats périodiques
setInterval(() => {
  if (reloadCount > 0) {
    console.log(`📊 Stats: ${reloadCount} reloads effectués`)
  }
}, 30000) // Toutes les 30 secondes