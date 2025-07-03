/**
 * 🏗️ Service de Génération de Structures Spécialisées par Mission
 * 
 * Génère des structures de colonnes et tâches par défaut selon le type de mission
 * et le profil utilisateur pour optimiser l'efficacité organisationnelle.
 */

export class MissionStructureService {
  
  /**
   * Génère une structure complète pour une mission spécifique
   * @param {string} profileId - ID du profil (technicien-si, consultant-si, generic)
   * @param {string} missionId - ID de la mission (si applicable)
   * @param {Object} context - Contexte additionnel (projet, client, etc.)
   * @returns {Object} Structure complète avec colonnes et tâches par défaut
   */
  static generateMissionStructure(profileId, missionId, context = {}) {
    console.log('🏗️ [MISSION-STRUCTURE] Génération structure:', { profileId, missionId, context })
    
    // Dispatch vers la méthode spécifique
    switch (profileId) {
      case 'technicien-si':
        return this.generateTechnicienStructure(missionId, context)
      case 'consultant-si':
        return this.generateConsultantStructure(context)
      case 'generic':
        return this.generateGenericStructure(context)
      default:
        return this.generateDefaultStructure()
    }
  }

  /**
   * 🔧 Génère des structures spécialisées pour Technicien SI
   */
  static generateTechnicienStructure(missionId, context) {
    const structures = {
      'integration-systemes': this.getIntegrationSystemesStructure(context),
      'maintenance-ticketing': this.getMaintenanceTicketingStructure(context),
      'support-programme': this.getSupportProgrammeStructure(context),
      'developpement-outils': this.getDeveloppementOutilsStructure(context),
      'gestion-projet': this.getGestionProjetStructure(context)
    }
    
    return structures[missionId] || this.generateDefaultStructure()
  }

  /**
   * 🏗️ Intégration Systèmes : Analyse → Configuration → Tests → Go-Live
   */
  static getIntegrationSystemesStructure(context) {
    return {
      metadata: {
        type: 'INTEGRATION_SYSTEMES',
        profile: 'technicien-si',
        description: 'Structure optimisée pour projets d\'intégration de systèmes',
        estimatedDuration: '6-12 semaines',
        contexts: ['PROCESS_BASED', 'PHASED']
      },
      columns: [
        {
          id: 'analyse',
          name: '📋 Analyse',
          description: 'Étude des besoins et spécifications',
          color: 'blue',
          defaultTasks: [
            {
              title: 'Analyse des besoins métier',
              description: 'Recueil et analyse des exigences fonctionnelles',
              priority: 'high',
              estimatedHours: 16,
              tags: ['specifications', 'besoins', 'analyse']
            },
            {
              title: 'Étude technique existant',
              description: 'Audit de l\'infrastructure et systèmes actuels',
              priority: 'high',
              estimatedHours: 12,
              tags: ['audit', 'technique', 'existant']
            },
            {
              title: 'Architecture solution',
              description: 'Conception architecture technique de la solution',
              priority: 'medium',
              estimatedHours: 20,
              tags: ['architecture', 'conception', 'solution']
            },
            {
              title: 'Plan de migration',
              description: 'Définition stratégie et planning de migration',
              priority: 'medium',
              estimatedHours: 8,
              tags: ['migration', 'planning', 'strategie']
            }
          ]
        },
        {
          id: 'configuration',
          name: '⚙️ Configuration',
          description: 'Paramétrage et développement',
          color: 'amber',
          defaultTasks: [
            {
              title: 'Setup environnements',
              description: 'Configuration environnements DEV/TEST/PROD',
              priority: 'high',
              estimatedHours: 12,
              tags: ['environnement', 'setup', 'infrastructure']
            },
            {
              title: 'Configuration systèmes',
              description: 'Paramétrage des systèmes selon spécifications',
              priority: 'high',
              estimatedHours: 32,
              tags: ['configuration', 'parametrage', 'systemes']
            },
            {
              title: 'Développement connecteurs',
              description: 'Création des interfaces et connecteurs',
              priority: 'medium',
              estimatedHours: 24,
              tags: ['developpement', 'connecteurs', 'interfaces']
            },
            {
              title: 'Scripts de migration',
              description: 'Préparation scripts de migration des données',
              priority: 'medium',
              estimatedHours: 16,
              tags: ['scripts', 'migration', 'donnees']
            }
          ]
        },
        {
          id: 'tests',
          name: '🧪 Tests',
          description: 'Validation et tests de la solution',
          color: 'green',
          defaultTasks: [
            {
              title: 'Tests unitaires',
              description: 'Validation composants individuels',
              priority: 'high',
              estimatedHours: 16,
              tags: ['tests', 'unitaires', 'validation']
            },
            {
              title: 'Tests d\'intégration',
              description: 'Validation des interfaces entre systèmes',
              priority: 'high',
              estimatedHours: 20,
              tags: ['tests', 'integration', 'interfaces']
            },
            {
              title: 'Tests utilisateur (UAT)',
              description: 'Validation par les utilisateurs finaux',
              priority: 'medium',
              estimatedHours: 24,
              tags: ['tests', 'utilisateur', 'UAT', 'validation']
            },
            {
              title: 'Tests de charge',
              description: 'Validation performance et montée en charge',
              priority: 'low',
              estimatedHours: 12,
              tags: ['performance', 'charge', 'tests']
            }
          ]
        },
        {
          id: 'golive',
          name: '🚀 Go-Live',
          description: 'Mise en production et déploiement',
          color: 'emerald',
          defaultTasks: [
            {
              title: 'Déploiement production',
              description: 'Mise en production de la solution',
              priority: 'high',
              estimatedHours: 8,
              tags: ['deploiement', 'production', 'golive']
            },
            {
              title: 'Migration données',
              description: 'Exécution de la migration des données',
              priority: 'high',
              estimatedHours: 12,
              tags: ['migration', 'donnees', 'production']
            },
            {
              title: 'Formation utilisateurs',
              description: 'Formation des utilisateurs finaux',
              priority: 'medium',
              estimatedHours: 16,
              tags: ['formation', 'utilisateurs', 'accompagnement']
            },
            {
              title: 'Documentation & transfert',
              description: 'Livraison documentation et transfert équipes',
              priority: 'medium',
              estimatedHours: 12,
              tags: ['documentation', 'transfert', 'livraison']
            }
          ]
        }
      ]
    }
  }

  /**
   * 🎫 Maintenance/Ticketing : Nouveau → En cours → Test → Résolu
   */
  static getMaintenanceTicketingStructure(context) {
    return {
      metadata: {
        type: 'MAINTENANCE_TICKETING',
        profile: 'technicien-si',
        description: 'Workflow optimisé pour maintenance et gestion des tickets',
        estimatedDuration: 'En continu',
        contexts: ['PROCESS_BASED', 'TEMPORAL']
      },
      columns: [
        {
          id: 'nouveau',
          name: '🎫 Nouveau',
          description: 'Tickets en attente de traitement',
          color: 'red',
          defaultTasks: [
            {
              title: 'Ticket priorité critique',
              description: 'Incident système critique à traiter en urgence',
              priority: 'high',
              estimatedHours: 2,
              tags: ['critique', 'incident', 'urgence'],
              assignee: context.defaultAssignee || 'Non assigné'
            },
            {
              title: 'Demande évolution logiciel',
              description: 'Amélioration fonctionnelle demandée par utilisateur',
              priority: 'medium',
              estimatedHours: 4,
              tags: ['evolution', 'fonctionnel', 'amelioration']
            },
            {
              title: 'Support utilisateur',
              description: 'Assistance technique utilisateur final',
              priority: 'low',
              estimatedHours: 1,
              tags: ['support', 'utilisateur', 'assistance']
            }
          ]
        },
        {
          id: 'encours',
          name: '🔄 En cours',
          description: 'Tickets en cours de traitement',
          color: 'blue',
          defaultTasks: [
            {
              title: 'Diagnostic incident réseau',
              description: 'Analyse et résolution problème connectivité',
              priority: 'high',
              estimatedHours: 3,
              tags: ['diagnostic', 'reseau', 'connectivite'],
              progress: 65
            },
            {
              title: 'Mise à jour serveur',
              description: 'Application patch sécurité serveur production',
              priority: 'medium',
              estimatedHours: 2,
              tags: ['serveur', 'patch', 'securite'],
              progress: 30
            }
          ]
        },
        {
          id: 'test',
          name: '🧪 Test',
          description: 'Solutions en cours de validation',
          color: 'amber',
          defaultTasks: [
            {
              title: 'Validation correctif application',
              description: 'Test du correctif développé en environnement test',
              priority: 'medium',
              estimatedHours: 1,
              tags: ['validation', 'correctif', 'test'],
              progress: 90
            }
          ]
        },
        {
          id: 'resolu',
          name: '✅ Résolu',
          description: 'Tickets traités et fermés',
          color: 'green',
          defaultTasks: [
            {
              title: 'Problème impression résolu',
              description: 'Configuration imprimante corrigée avec succès',
              priority: 'low',
              estimatedHours: 0.5,
              tags: ['impression', 'configuration', 'resolu'],
              completedAt: new Date().toISOString(),
              resolution: 'Réinstallation driver imprimante'
            }
          ]
        }
      ]
    }
  }

  /**
   * 📅 Support Programmé : Semaine N → Semaine N+1 → Semaine N+2 → Archive
   */
  static getSupportProgrammeStructure(context) {
    const currentWeek = this.getCurrentWeekNumber()
    
    return {
      metadata: {
        type: 'SUPPORT_PROGRAMME',
        profile: 'technicien-si',
        description: 'Planification hebdomadaire des interventions de support',
        estimatedDuration: 'Cyclique hebdomadaire',
        contexts: ['TEMPORAL', 'PHASED']
      },
      columns: [
        {
          id: `semaine-${currentWeek}`,
          name: `📅 Semaine ${currentWeek}`,
          description: 'Interventions en cours cette semaine',
          color: 'blue',
          defaultTasks: [
            {
              title: 'Maintenance serveurs',
              description: 'Maintenance préventive infrastructure serveurs',
              priority: 'high',
              estimatedHours: 4,
              tags: ['maintenance', 'serveurs', 'preventif'],
              scheduledDate: this.getWeekStartDate(currentWeek)
            },
            {
              title: 'Audit sécurité mensuel',
              description: 'Contrôle sécurité systèmes et accès',
              priority: 'medium',
              estimatedHours: 6,
              tags: ['audit', 'securite', 'mensuel']
            }
          ]
        },
        {
          id: `semaine-${currentWeek + 1}`,
          name: `📅 Semaine ${currentWeek + 1}`,
          description: 'Interventions planifiées semaine prochaine',
          color: 'amber',
          defaultTasks: [
            {
              title: 'Migration base de données',
              description: 'Migration planifiée vers nouveau serveur DB',
              priority: 'high',
              estimatedHours: 8,
              tags: ['migration', 'base-donnees', 'planifie'],
              scheduledDate: this.getWeekStartDate(currentWeek + 1)
            },
            {
              title: 'Formation équipe support',
              description: 'Session formation nouveaux outils support',
              priority: 'medium',
              estimatedHours: 3,
              tags: ['formation', 'support', 'outils']
            }
          ]
        },
        {
          id: `semaine-${currentWeek + 2}`,
          name: `📅 Semaine ${currentWeek + 2}`,
          description: 'Planification à moyen terme',
          color: 'purple',
          defaultTasks: [
            {
              title: 'Renouvellement certificats SSL',
              description: 'Renouvellement certificats expirant fin de mois',
              priority: 'medium',
              estimatedHours: 2,
              tags: ['certificats', 'ssl', 'renouvellement'],
              scheduledDate: this.getWeekStartDate(currentWeek + 2)
            }
          ]
        },
        {
          id: 'archive',
          name: '📦 Archive',
          description: 'Interventions terminées',
          color: 'gray',
          defaultTasks: [
            {
              title: 'Mise à jour antivirus réalisée',
              description: 'Déploiement nouvelle version antivirus terminé',
              priority: 'medium',
              estimatedHours: 2,
              tags: ['antivirus', 'mise-a-jour', 'termine'],
              completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        }
      ]
    }
  }

  /**
   * ⚙️ Développement Outils : Analyse → Conception → Déploiement → Suivi
   */
  static getDeveloppementOutilsStructure(context) {
    return {
      metadata: {
        type: 'DEVELOPPEMENT_OUTILS',
        profile: 'technicien-si',
        description: 'Développement d\'outils internes et scripts d\'automatisation',
        estimatedDuration: '4-8 semaines',
        contexts: ['PHASED', 'VERSIONED']
      },
      columns: [
        {
          id: 'analyse',
          name: '🔍 Analyse',
          description: 'Analyse des besoins et faisabilité',
          color: 'indigo',
          defaultTasks: [
            {
              title: 'Recueil des besoins',
              description: 'Analyse des besoins utilisateurs pour le nouvel outil',
              priority: 'high',
              estimatedHours: 8,
              tags: ['besoins', 'analyse', 'specifications']
            },
            {
              title: 'Étude de faisabilité',
              description: 'Évaluation technique et budgétaire du projet',
              priority: 'high',
              estimatedHours: 6,
              tags: ['faisabilite', 'technique', 'budget']
            },
            {
              title: 'Benchmarking solutions',
              description: 'Comparaison solutions existantes vs développement',
              priority: 'medium',
              estimatedHours: 4,
              tags: ['benchmarking', 'solutions', 'comparaison']
            }
          ]
        },
        {
          id: 'conception',
          name: '🎨 Conception',
          description: 'Design et architecture de la solution',
          color: 'cyan',
          defaultTasks: [
            {
              title: 'Architecture logicielle',
              description: 'Conception architecture et choix technologiques',
              priority: 'high',
              estimatedHours: 12,
              tags: ['architecture', 'conception', 'technologie']
            },
            {
              title: 'Maquettes interfaces',
              description: 'Création maquettes et wireframes utilisateur',
              priority: 'medium',
              estimatedHours: 8,
              tags: ['maquettes', 'interface', 'ux']
            },
            {
              title: 'Spécifications techniques',
              description: 'Rédaction spécifications détaillées développement',
              priority: 'medium',
              estimatedHours: 6,
              tags: ['specifications', 'technique', 'developpement']
            }
          ]
        },
        {
          id: 'deploiement',
          name: '🚀 Déploiement',
          description: 'Développement et mise en production',
          color: 'emerald',
          defaultTasks: [
            {
              title: 'Développement core',
              description: 'Développement des fonctionnalités principales',
              priority: 'high',
              estimatedHours: 32,
              tags: ['developpement', 'core', 'fonctionnalites']
            },
            {
              title: 'Tests et validation',
              description: 'Tests unitaires et d\'intégration',
              priority: 'high',
              estimatedHours: 16,
              tags: ['tests', 'validation', 'qualite']
            },
            {
              title: 'Documentation technique',
              description: 'Rédaction documentation et guide utilisateur',
              priority: 'medium',
              estimatedHours: 8,
              tags: ['documentation', 'guide', 'utilisateur']
            },
            {
              title: 'Déploiement production',
              description: 'Mise en production et configuration',
              priority: 'high',
              estimatedHours: 4,
              tags: ['deploiement', 'production', 'configuration']
            }
          ]
        },
        {
          id: 'suivi',
          name: '📊 Suivi',
          description: 'Monitoring et maintenance évolutive',
          color: 'violet',
          defaultTasks: [
            {
              title: 'Monitoring utilisation',
              description: 'Suivi métriques utilisation et performance',
              priority: 'medium',
              estimatedHours: 2,
              tags: ['monitoring', 'metriques', 'performance']
            },
            {
              title: 'Feedback utilisateurs',
              description: 'Collecte retours et suggestions d\'amélioration',
              priority: 'medium',
              estimatedHours: 4,
              tags: ['feedback', 'utilisateurs', 'amelioration']
            },
            {
              title: 'Maintenance corrective',
              description: 'Correction bugs et problèmes remontés',
              priority: 'high',
              estimatedHours: 8,
              tags: ['maintenance', 'correction', 'bugs']
            },
            {
              title: 'Évolutions futures',
              description: 'Planification améliorations et nouvelles fonctionnalités',
              priority: 'low',
              estimatedHours: 6,
              tags: ['evolution', 'amelioration', 'roadmap']
            }
          ]
        }
      ]
    }
  }

  /**
   * 📊 Gestion Projet : PMO → Dev Lead → Tech Lead → Suivi
   */
  static getGestionProjetStructure(context) {
    return {
      metadata: {
        type: 'GESTION_PROJET',
        profile: 'technicien-si',
        description: 'Organisation par rôles pour gestion de projets techniques',
        estimatedDuration: 'Selon projet',
        contexts: ['RESOURCE_BASED', 'PROCESS_BASED']
      },
      columns: [
        {
          id: 'pmo',
          name: '👨‍💼 PMO',
          description: 'Pilotage et coordination projet',
          color: 'blue',
          defaultTasks: [
            {
              title: 'Planning global projet',
              description: 'Élaboration et suivi planning général',
              priority: 'high',
              estimatedHours: 8,
              tags: ['planning', 'coordination', 'pilotage'],
              assignee: 'Chef de projet'
            },
            {
              title: 'Reporting direction',
              description: 'Rapports d\'avancement pour la direction',
              priority: 'medium',
              estimatedHours: 4,
              tags: ['reporting', 'direction', 'avancement']
            },
            {
              title: 'Gestion risques',
              description: 'Identification et mitigation des risques',
              priority: 'high',
              estimatedHours: 6,
              tags: ['risques', 'mitigation', 'gestion']
            }
          ]
        },
        {
          id: 'devlead',
          name: '👩‍💻 Dev Lead',
          description: 'Coordination équipe développement',
          color: 'green',
          defaultTasks: [
            {
              title: 'Architecture technique',
              description: 'Définition architecture et standards développement',
              priority: 'high',
              estimatedHours: 16,
              tags: ['architecture', 'standards', 'developpement'],
              assignee: 'Lead Developer'
            },
            {
              title: 'Code reviews',
              description: 'Révision et validation du code produit',
              priority: 'medium',
              estimatedHours: 8,
              tags: ['code-review', 'qualite', 'validation']
            },
            {
              title: 'Mentoring équipe',
              description: 'Accompagnement et formation développeurs junior',
              priority: 'medium',
              estimatedHours: 6,
              tags: ['mentoring', 'formation', 'equipe']
            }
          ]
        },
        {
          id: 'techlead',
          name: '🔧 Tech Lead',
          description: 'Expertise technique et infrastructure',
          color: 'amber',
          defaultTasks: [
            {
              title: 'Infrastructure projet',
              description: 'Setup et configuration infrastructure technique',
              priority: 'high',
              estimatedHours: 12,
              tags: ['infrastructure', 'configuration', 'technique'],
              assignee: 'Technicien Senior'
            },
            {
              title: 'Intégration continue',
              description: 'Mise en place pipeline CI/CD',
              priority: 'medium',
              estimatedHours: 10,
              tags: ['ci-cd', 'integration', 'pipeline']
            },
            {
              title: 'Support technique',
              description: 'Résolution problèmes techniques complexes',
              priority: 'high',
              estimatedHours: 8,
              tags: ['support', 'technique', 'resolution']
            }
          ]
        },
        {
          id: 'suivi',
          name: '📈 Suivi',
          description: 'Monitoring et métriques projet',
          color: 'purple',
          defaultTasks: [
            {
              title: 'Métriques qualité',
              description: 'Suivi indicateurs qualité et performance',
              priority: 'medium',
              estimatedHours: 4,
              tags: ['metriques', 'qualite', 'performance']
            },
            {
              title: 'Gestion des incidents',
              description: 'Traitement et résolution incidents production',
              priority: 'high',
              estimatedHours: 6,
              tags: ['incidents', 'production', 'resolution']
            },
            {
              title: 'Retour d\'expérience',
              description: 'Analyse post-projet et capitalisation',
              priority: 'low',
              estimatedHours: 4,
              tags: ['retour-experience', 'capitalisation', 'analyse']
            }
          ]
        }
      ]
    }
  }

  /**
   * 👔 Génère des structures pour Consultant SI (multi-clients)
   */
  static generateConsultantStructure(context) {
    return {
      metadata: {
        type: 'CONSULTANT_SI',
        profile: 'consultant-si',
        description: 'Structure multi-clients pour consultant SI',
        estimatedDuration: 'Variable selon missions',
        contexts: ['CLIENT_BASED', 'TEMPORAL', 'RESOURCE_BASED']
      },
      columns: [
        {
          id: 'prospect',
          name: '🎯 Prospects',
          description: 'Opportunités commerciales en cours',
          color: 'yellow',
          defaultTasks: [
            {
              title: 'Qualification lead bancaire',
              description: 'Évaluation opportunité digitalisation processus',
              priority: 'high',
              estimatedHours: 4,
              tags: ['prospect', 'banque', 'digitalisation'],
              client: 'Prospect Banque ABC'
            }
          ]
        },
        {
          id: 'client-a',
          name: '🏢 Client Alpha',
          description: 'Missions en cours - Client Alpha',
          color: 'blue',
          defaultTasks: [
            {
              title: 'Audit SI existant',
              description: 'Cartographie et analyse du système d\'information',
              priority: 'high',
              estimatedHours: 16,
              tags: ['audit', 'cartographie', 'si'],
              client: 'Client Alpha'
            },
            {
              title: 'Roadmap transformation',
              description: 'Élaboration feuille de route transformation digitale',
              priority: 'medium',
              estimatedHours: 12,
              tags: ['roadmap', 'transformation', 'digital']
            }
          ]
        },
        {
          id: 'client-b',
          name: '🏭 Client Beta',
          description: 'Missions en cours - Client Beta',
          color: 'green',
          defaultTasks: [
            {
              title: 'Migration ERP',
              description: 'Accompagnement migration SAP vers Odoo',
              priority: 'high',
              estimatedHours: 32,
              tags: ['migration', 'erp', 'sap', 'odoo'],
              client: 'Client Beta'
            }
          ]
        },
        {
          id: 'maintenance',
          name: '🔧 Maintenance',
          description: 'Support et maintenance clients existants',
          color: 'purple',
          defaultTasks: [
            {
              title: 'Support mensuel Client Alpha',
              description: 'Assistance technique et conseil mensuel',
              priority: 'medium',
              estimatedHours: 8,
              tags: ['support', 'mensuel', 'conseil'],
              client: 'Client Alpha',
              recurring: true
            }
          ]
        }
      ]
    }
  }

  /**
   * 🎯 Génère une structure générique adaptative
   */
  static generateGenericStructure(context) {
    const detectedContext = context.detectedContext || 'GENERIC'
    
    const genericStructures = {
      'CLIENT_BASED': this.getClientBasedStructure(),
      'TEMPORAL': this.getTemporalStructure(),
      'PHASED': this.getPhasedStructure(),
      'VERSIONED': this.getVersionedStructure(),
      'PROCESS_BASED': this.getProcessBasedStructure(),
      'RESOURCE_BASED': this.getResourceBasedStructure()
    }
    
    return genericStructures[detectedContext] || this.getDefaultGenericStructure()
  }

  /**
   * Structure CLIENT_BASED générique
   */
  static getClientBasedStructure() {
    return {
      metadata: {
        type: 'CLIENT_BASED',
        description: 'Organisation par clients',
        contexts: ['CLIENT_BASED']
      },
      columns: [
        { id: 'prospects', name: '🎯 Prospects', color: 'yellow', defaultTasks: [] },
        { id: 'client-a', name: '🏢 Client A', color: 'blue', defaultTasks: [] },
        { id: 'client-b', name: '🏭 Client B', color: 'green', defaultTasks: [] },
        { id: 'archivees', name: '📦 Archivées', color: 'gray', defaultTasks: [] }
      ]
    }
  }

  /**
   * Structure TEMPORAL générique
   */
  static getTemporalStructure() {
    return {
      metadata: {
        type: 'TEMPORAL',
        description: 'Organisation temporelle',
        contexts: ['TEMPORAL']
      },
      columns: [
        { id: 'sprint-1', name: '⚡ Sprint 1', color: 'blue', defaultTasks: [] },
        { id: 'sprint-2', name: '⚡ Sprint 2', color: 'green', defaultTasks: [] },
        { id: 'sprint-3', name: '⚡ Sprint 3', color: 'purple', defaultTasks: [] },
        { id: 'backlog', name: '📋 Backlog', color: 'gray', defaultTasks: [] }
      ]
    }
  }

  /**
   * Structure par défaut
   */
  static generateDefaultStructure() {
    return {
      metadata: {
        type: 'DEFAULT',
        description: 'Structure générique par défaut',
        contexts: ['GENERIC']
      },
      columns: [
        { id: 'todo', name: '📋 À faire', color: 'blue', defaultTasks: [] },
        { id: 'doing', name: '⚡ En cours', color: 'yellow', defaultTasks: [] },
        { id: 'review', name: '👀 Révision', color: 'purple', defaultTasks: [] },
        { id: 'done', name: '✅ Terminé', color: 'green', defaultTasks: [] }
      ]
    }
  }

  // Utilitaires
  static getCurrentWeekNumber() {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const diff = now - start
    const oneWeek = 1000 * 60 * 60 * 24 * 7
    return Math.ceil(diff / oneWeek)
  }

  static getWeekStartDate(weekNumber) {
    const year = new Date().getFullYear()
    const jan4 = new Date(year, 0, 4)
    const startOfYear = new Date(jan4.getTime() - (jan4.getDay() - 1) * 24 * 60 * 60 * 1000)
    return new Date(startOfYear.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000)
  }
}

export default MissionStructureService