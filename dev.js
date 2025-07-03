#!/usr/bin/env node

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🚀 Starting INDX Flow Development Environment...\n')

// Couleurs pour la console
const colors = {
  frontend: '\x1b[36m', // Cyan
  backend: '\x1b[33m',  // Yellow
  info: '\x1b[32m',     // Green
  error: '\x1b[31m',    // Red
  reset: '\x1b[0m'      // Reset
}

// Fonction pour préfixer les logs
const logWithPrefix = (source, data) => {
  const lines = data.toString().split('\n').filter(line => line.trim())
  lines.forEach(line => {
    console.log(`${colors[source]}[${source.toUpperCase()}]${colors.reset} ${line}`)
  })
}

// Démarrer le backend
console.log(`${colors.info}Starting backend server...${colors.reset}`)
const backend = spawn('npm', ['run', 'dev'], {
  cwd: join(__dirname, 'backend'),
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
})

backend.stdout.on('data', (data) => logWithPrefix('backend', data))
backend.stderr.on('data', (data) => logWithPrefix('backend', data))

// Attendre un peu avant de démarrer le frontend
setTimeout(() => {
  console.log(`${colors.info}Starting frontend server...${colors.reset}`)
  
  const frontend = spawn('npm', ['run', 'dev:frontend'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  })
  
  frontend.stdout.on('data', (data) => logWithPrefix('frontend', data))
  frontend.stderr.on('data', (data) => logWithPrefix('frontend', data))
  
  // Gestion des erreurs
  frontend.on('error', (err) => {
    console.error(`${colors.error}Frontend error: ${err.message}${colors.reset}`)
  })
  
}, 2000)

backend.on('error', (err) => {
  console.error(`${colors.error}Backend error: ${err.message}${colors.reset}`)
})

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log(`\n${colors.info}Shutting down development servers...${colors.reset}`)
  backend.kill('SIGTERM')
  process.exit(0)
})

console.log(`
${colors.info}🎯 Development servers starting...${colors.reset}

Frontend: http://localhost:3002
Backend:  http://localhost:3001
API:      http://localhost:3002/api

${colors.info}Press Ctrl+C to stop both servers${colors.reset}
`)