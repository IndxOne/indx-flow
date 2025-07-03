# 🚀 Guide de Développement INDX Flow

## Hot Reload Activé ! 🔥

### Commandes de développement

```bash
# 🎯 Démarrage rapide (recommandé)
npm run dev

# 🎨 Frontend seulement (port 3002)
npm run dev:frontend

# ⚙️ Backend seulement (port 3001)  
npm run dev:backend

# 🚀 Les deux avec concurrently
npm run dev:both

# ✨ Version stylée avec logs colorés
npm run dev:fancy
```

### URLs de développement

- **Frontend:** http://localhost:3002
- **Backend:** http://localhost:3001  
- **API Proxy:** http://localhost:3002/api

### Features Hot Reload

#### Frontend (Vite)
- ✅ **Hot Module Replacement (HMR)** instantané
- ✅ **Vue SFC Hot Reload** (Single File Components)
- ✅ **CSS Hot Reload** sans refresh page
- ✅ **Error Overlay** en cas d'erreur
- ✅ **État conservé** lors des modifications

#### Backend (Nodemon)  
- ✅ **Auto-restart** sur changement fichier
- ✅ **Watch dossiers** `src/` et `config/`
- ✅ **Délai intelligent** (1s pour éviter spam)
- ✅ **Logs colorés** par service
- ✅ **Restart manuel** avec `rs`

### Configuration optimisée

#### Vite (Frontend)
```javascript
server: {
  port: 3002,
  host: true,        // Accès réseau
  hmr: {
    overlay: true    // Erreurs en overlay
  }
}
```

#### Nodemon (Backend)
```json
{
  "watch": ["src/", "config/"],
  "ext": "js,json", 
  "delay": 1000,
  "restartable": "rs"
}
```

### Workflow recommandé

1. **Une seule commande :** `npm run dev`
2. **Modifier frontend :** Changements instantanés
3. **Modifier backend :** Restart automatique (1s)
4. **Debug :** Error overlay + logs colorés
5. **Arrêt :** `Ctrl+C` stoppe tout

### Troubleshooting

#### Port déjà utilisé
```bash
# Tuer processus sur port 3002
npx kill-port 3002

# Tuer processus sur port 3001  
npx kill-port 3001
```

#### Cache Vite corrompu
```bash
# Nettoyer cache Vite
rm -rf node_modules/.vite
npm run dev:frontend
```

#### Nodemon bloqué
```bash
# Dans le terminal backend, taper :
rs
# Ou redémarrer complètement
```

### Performance Tips

- **Vite** pré-bundle les dépendances communes
- **Nodemon** ignore `node_modules` et tests
- **Proxy** évite les problèmes CORS
- **HMR** conserve l'état de l'application

Happy coding! 🎉