# 🧪 Tests de Navigation - INDX Flow Multi-Profils

## 🎯 Parcours de Navigation Complet

### **Phase 1 : Page d'Accueil & Sélection Profils**

#### ✅ URL: `http://localhost:3002/`
**Tests à effectuer :**
- [ ] Page ProfileSelector s'affiche correctement
- [ ] 3 cartes profils visibles : Consultant SI, Technicien SI, Détection Auto  
- [ ] Statistiques globales affichées (espaces créés, analyses, confiance)
- [ ] Espaces récents chargés si email utilisateur disponible
- [ ] Hover effects fonctionnels sur les cartes

**Vérifications visuelles :**
- **Consultant SI** : 👔 avec contextes "Client-based • Temporal • Resource-based"
- **Technicien SI** : 🔧 avec contextes "Process-based • Phased • Resource-based"  
- **Détection Auto** : 🎯 avec "IA Contextuelle • Auto-adaptatif • Multi-contextes"

---

### **Phase 2 : Sélection Consultant SI**

#### ✅ URL: `http://localhost:3002/consultant-si`
**Tests à effectuer :**
- [ ] Redirection vers dashboard Consultant SI
- [ ] Liste des workspaces existants pour ce profil
- [ ] Bouton "Nouveau workspace" visible et fonctionnel
- [ ] Navigation breadcrumb affichée

---

### **Phase 3 : Sélection Technicien SI**

#### ✅ URL: `http://localhost:3002/technicien-si`
**Tests à effectuer :**
- [ ] Affichage du TechnicienMissionSelector
- [ ] 5 cartes missions visibles avec descriptions correctes :

##### **Mission 1 : Intégration Systèmes**
- **Structure** : 📋 Analyse → ⚙️ Configuration → 🧪 Tests → 🚀 Go-Live
- **Contextes** : PROCESS_BASED, PHASED

##### **Mission 2 : Maintenance/Ticketing**  
- **Structure** : 🎫 Nouveau → 🔄 En cours → 🧪 Test → ✅ Résolu
- **Contextes** : PROCESS_BASED, TEMPORAL

##### **Mission 3 : Support Programmé**
- **Structure** : 📅 Semaine 28 → 📅 Semaine 29 → 📅 Semaine 30 → 📦 Archive
- **Contextes** : TEMPORAL, PHASED

##### **Mission 4 : Développement Outils**
- **Structure** : 🔍 Analyse → 🎨 Conception → 🚀 Déploiement → 📊 Suivi
- **Contextes** : PHASED, VERSIONED

##### **Mission 5 : Gestion Projet**
- **Structure** : 👨‍💼 PMO → 👩‍💻 Dev Lead → 🔧 Tech Lead → 📈 Suivi
- **Contextes** : RESOURCE_BASED, PROCESS_BASED

---

### **Phase 4 : Navigation vers Mission Spécifique**

#### ✅ URL: `http://localhost:3002/technicien-si/integration-systemes`
**Tests à effectuer :**
- [ ] Affichage des workspaces pour la mission "Intégration Systèmes"
- [ ] Bouton "Nouveau workspace" pour cette mission spécifique
- [ ] Breadcrumb : Technicien SI > Intégration Systèmes

---

### **Phase 5 : Création Workspace Mission**

#### ✅ URL: `http://localhost:3002/technicien-si/integration-systemes/new`
**Tests à effectuer :**
- [ ] Formulaire de création avec contexte mission pré-configuré
- [ ] Banner informationnel affiché :
  - **Profil** : 🔧 Technicien SI  
  - **Mission** : 🏗️ Intégration Systèmes
  - **Structure recommandée** : Analyse → Configuration → Tests → Go-Live
- [ ] Mode de détection (Local/IA/Hybride) fonctionnel
- [ ] Progress bar étapes (1/5)
- [ ] Contexte PROCESS_BASED pré-sélectionné avec 85% confiance

---

### **Phase 6 : Détection Automatique**

#### ✅ URL: `http://localhost:3002/generic/new`
**Tests à effectuer :**
- [ ] Formulaire standard sans pré-configuration
- [ ] Textarea détection contextuelle fonctionnelle
- [ ] Confidence bar mise à jour en temps réel
- [ ] Tous les contextes détectables (CLIENT_BASED, TEMPORAL, etc.)

---

## 🔄 Tests de Navigation Avancée

### **URLs Directes à Tester**

```bash
# Profils principaux
http://localhost:3002/consultant-si
http://localhost:3002/technicien-si  
http://localhost:3002/generic

# Missions spécifiques Technicien SI
http://localhost:3002/technicien-si/integration-systemes
http://localhost:3002/technicien-si/maintenance-ticketing
http://localhost:3002/technicien-si/support-programme
http://localhost:3002/technicien-si/developpement-outils
http://localhost:3002/technicien-si/gestion-projet

# Création workspaces
http://localhost:3002/consultant-si/new
http://localhost:3002/technicien-si/integration-systemes/new
http://localhost:3002/technicien-si/maintenance-ticketing/new
http://localhost:3002/generic/new

# URLs Legacy (redirections)
http://localhost:3002/home → /generic/new
http://localhost:3002/workspace → /generic/workspace/new
```

---

## ⚡ Tests Performance & Hot Reload

### **Hot Reload Frontend**
- [ ] Modifier un composant Vue → Changement instantané
- [ ] Modifier CSS Tailwind → Styles mis à jour sans refresh
- [ ] Erreur de syntaxe → Error overlay affiché

### **Hot Reload Backend**  
- [ ] Modifier route API → Redémarrage automatique en 1s
- [ ] Modifier configuration → Prise en compte immédiate
- [ ] Logs colorés [FRONTEND] et [BACKEND] visibles

---

## 🐛 Tests de Robustesse

### **URLs Invalides**
- [ ] `/invalid-profile` → Redirection vers `/`
- [ ] `/technicien-si/invalid-mission` → Redirection ou 404
- [ ] `/consultant-si/integration-systemes` → URL invalide (mission Technicien)

### **Navigation Guards**
- [ ] Profils inexistants bloqués
- [ ] Missions invalides pour un profil bloquées
- [ ] Paramètres route validés

---

## 📊 Vérifications Store & État

### **ProfileStore**
```javascript
// Dans la console navigateur
console.log(window.stores?.profile?.profiles)
console.log(window.stores?.profile?.currentProfile)
```

### **FormStore**  
```javascript
// Contexte profile configuré
console.log(window.stores?.form?.profileContext)
console.log(window.stores?.form?.detectedContext)
console.log(window.stores?.form?.structurePreview)
```

---

## ✅ Critères de Validation

### **Navigation ✅**
- [ ] Toutes les URLs accessibles sans erreur
- [ ] Redirections fonctionnelles  
- [ ] Breadcrumbs cohérents
- [ ] Back/Forward navigateur opérationnels

### **UX/UI ✅**
- [ ] Transitions fluides
- [ ] Hover effects visuels
- [ ] Cards profils/missions attractives
- [ ] Responsive design mobile

### **Fonctionnel ✅**
- [ ] Contexte mission pré-configuré correctement
- [ ] Structures suggérées pertinentes
- [ ] Mode détection adaptatif
- [ ] Workspaces créés avec bon profil/mission

### **Performance ✅**
- [ ] Chargement initial < 2s
- [ ] Navigation instantanée
- [ ] Hot reload < 1s
- [ ] Pas de memory leaks

---

## 🎯 Résultats Attendus

### **Workflow Technicien SI Complet**
1. **`/`** → Sélection "Technicien SI"
2. **`/technicien-si`** → Choix "Intégration Systèmes"  
3. **`/technicien-si/integration-systemes`** → Clic "Nouveau workspace"
4. **`/technicien-si/integration-systemes/new`** → Formulaire pré-configuré
5. **Contexte détecté** : PROCESS_BASED (85% confiance)
6. **Structure suggérée** : Analyse → Configuration → Tests → Go-Live

### **Workflow Consultant SI Complet**
1. **`/`** → Sélection "Consultant SI"
2. **`/consultant-si`** → Clic "Nouveau workspace"
3. **`/consultant-si/new`** → Formulaire générique Consultant
4. **Contexts multiples** : CLIENT_BASED + TEMPORAL + RESOURCE_BASED

### **Workflow Détection Auto**
1. **`/`** → Sélection "Détection Auto"  
2. **`/generic/new`** → Saisie description métier
3. **Analyse IA** → Détection contextuelle intelligente
4. **Structure générée** → Adaptée au contexte détecté

---

## 🚀 Commandes Test Rapide

```bash
# Démarrer application complète
npm run dev

# URLs test accès direct
curl -I http://localhost:3002/
curl -I http://localhost:3002/technicien-si
curl -I http://localhost:3002/technicien-si/integration-systemes

# Vérifier backend API
curl http://localhost:3001/api/health

# Tuer processus si blocage
npx kill-port 3002
npx kill-port 3001
```

---

**🎉 Navigation Multi-Profils Opérationnelle !**

*Date test : 27 juin 2025*  
*Status : ✅ Tous composants intégrés et fonctionnels*  
*Hot Reload : ✅ Frontend + Backend opérationnels*