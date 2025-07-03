/**
 * Service Supabase pour INDX Flow
 * Gestion de la persistance des workspaces, tâches et analyses
 */

import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ [SUPABASE] Variables d\'environnement manquantes. Mode local activé.')
}

// Client Supabase
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

/**
 * Service de persistance avec fallback local
 */
export class SupabaseService {
  constructor() {
    this.isEnabled = !!supabase && import.meta.env.VITE_PERSISTENCE_ENABLED !== 'false'
    
    if (this.isEnabled) {
      console.log('✅ [SUPABASE] Service activé:', supabaseUrl)
    } else {
      console.log('📦 [SUPABASE] Mode local - pas de persistance cloud')
    }
  }

  /**
   * Vérifier la connexion Supabase
   */
  async checkConnection() {
    if (!this.isEnabled) return false
    
    try {
      const { data, error } = await supabase.from('workspaces').select('count').limit(1)
      return !error
    } catch (error) {
      console.error('❌ [SUPABASE] Erreur connexion:', error)
      return false
    }
  }

  // ================================================================
  // ANALYSES DE CONTEXTE
  // ================================================================

  /**
   * Sauvegarder une analyse de contexte
   */
  async saveContextAnalysis(analysisData) {
    if (!this.isEnabled) return { success: false, data: null }

    try {
      const { data, error } = await supabase
        .from('context_analyses')
        .insert({
          user_input: analysisData.userInput,
          detected_contexts: analysisData.detectedContexts || [],
          primary_context: analysisData.detectedContext,
          confidence: analysisData.confidence,
          adaptive_answers: analysisData.adaptiveAnswers || {},
          structure_preview: analysisData.structurePreview || [],
          user_info: analysisData.userInfo || {}
        })
        .select()
        .single()

      if (error) throw error

      console.log('✅ [SUPABASE] Analyse sauvegardée:', data.id)
      return { success: true, data }
    } catch (error) {
      console.error('❌ [SUPABASE] Erreur sauvegarde analyse:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Récupérer l'historique des analyses
   */
  async getAnalysisHistory(limit = 10) {
    if (!this.isEnabled) return { success: false, data: [] }

    try {
      const { data, error } = await supabase
        .from('context_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('❌ [SUPABASE] Erreur récupération historique:', error)
      return { success: false, data: [] }
    }
  }

  // ================================================================
  // WORKSPACES
  // ================================================================

  /**
   * Créer un nouveau workspace
   */
  async createWorkspace(workspaceData) {
    if (!this.isEnabled) return { success: false, data: null }

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          analysis_id: workspaceData.analysisId,
          name: workspaceData.projectName || 'Nouveau Projet',
          description: workspaceData.description,
          columns: workspaceData.structure || ['À faire', 'En cours', 'En révision', 'Terminé'],
          project_type: workspaceData.workspaceConfig?.projectType,
          user_email: workspaceData.userInfo?.email
        })
        .select()
        .single()

      if (error) throw error

      console.log('✅ [SUPABASE] Workspace créé:', data.id)
      return { success: true, data }
    } catch (error) {
      console.error('❌ [SUPABASE] Erreur création workspace:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Récupérer un workspace avec ses tâches
   */
  async getWorkspace(workspaceId) {
    if (!this.isEnabled) return { success: false, data: null }

    try {
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single()

      if (workspaceError) throw workspaceError

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          subtasks (*)
        `)
        .eq('workspace_id', workspaceId)
        .order('position')

      if (tasksError) throw tasksError

      // Organiser les tâches par colonne
      const tasksByColumn = tasks.reduce((acc, task) => {
        if (!acc[task.column_index]) acc[task.column_index] = []
        acc[task.column_index].push(task)
        return acc
      }, {})

      return { 
        success: true, 
        data: { 
          ...workspace, 
          tasks: tasksByColumn 
        } 
      }
    } catch (error) {
      console.error('❌ [SUPABASE] Erreur récupération workspace:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Lister les workspaces de l'utilisateur
   */
  async getUserWorkspaces(userEmail) {
    if (!this.isEnabled) return { success: false, data: [] }

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('id, name, description, columns, project_type, analysis_id, created_at, updated_at')
        .eq('user_email', userEmail)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('❌ [SUPABASE] Erreur liste workspaces:', error)
      return { success: false, data: [] }
    }
  }

  /**
   * Mettre à jour un workspace existant
   */
  async updateWorkspace(workspaceId, updates) {
    if (!this.isEnabled) return { success: false, data: null }

    try {
      // Colonnes autorisées dans le schéma workspaces
      const allowedColumns = [
        'analysis_id',
        'name', 
        'description',
        'columns',
        'project_type',
        'user_email'
      ]

      // Filtrer pour ne garder que les colonnes autorisées
      const safeUpdates = {}
      for (const [key, value] of Object.entries(updates)) {
        if (allowedColumns.includes(key)) {
          safeUpdates[key] = value
        } else {
          console.warn(`⚠️ [SUPABASE] Colonne '${key}' ignorée (non autorisée dans le schéma)`)
        }
      }

      // Ajouter updated_at automatiquement
      safeUpdates.updated_at = new Date().toISOString()

      console.log('📝 [SUPABASE] Updates sécurisés:', safeUpdates)

      const { data, error } = await supabase
        .from('workspaces')
        .update(safeUpdates)
        .eq('id', workspaceId)
        .select()
        .single()

      if (error) throw error

      console.log('✅ [SUPABASE] Workspace mis à jour:', workspaceId)
      return { success: true, data }
    } catch (error) {
      console.error('❌ [SUPABASE] Erreur mise à jour workspace:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Mettre à jour spécifiquement les colonnes d'un workspace
   */
  async updateWorkspaceColumns(workspaceId, columns, userEmail = null) {
    if (!this.isEnabled) return { success: false, data: null }

    try {
      // Validation optionnelle par email utilisateur
      const query = supabase
        .from('workspaces')
        .update({
          columns: columns,
          updated_at: new Date().toISOString()
        })
        .eq('id', workspaceId)

      if (userEmail) {
        query.eq('user_email', userEmail)
      }

      const { data, error } = await query.select().single()

      if (error) throw error

      console.log('✅ [SUPABASE] Colonnes workspace mises à jour:', workspaceId, columns)
      return { success: true, data }
    } catch (error) {
      console.error('❌ [SUPABASE] Erreur mise à jour colonnes workspace:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================================================
  // TÂCHES
  // ================================================================

  /**
   * Créer une nouvelle tâche
   */
  async createTask(taskData) {
    if (!this.isEnabled) return { success: false, data: null }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          workspace_id: taskData.workspaceId,
          title: taskData.title,
          description: taskData.description,
          column_index: taskData.columnIndex || 0,
          priority: taskData.priority || 'medium',
          position: taskData.position || 0
        })
        .select()
        .single()

      if (error) throw error

      // Créer les sous-tâches si présentes
      if (taskData.subtasks && taskData.subtasks.length > 0) {
        const subtasksData = taskData.subtasks.map(subtask => ({
          task_id: data.id,
          text: subtask.text,
          completed: subtask.completed || false,
          due_date: subtask.dueDate,
          position: subtask.position || 0
        }))

        const { error: subtasksError } = await supabase
          .from('subtasks')
          .insert(subtasksData)

        if (subtasksError) throw subtasksError
      }

      console.log('✅ [SUPABASE] Tâche créée:', data.id)
      return { success: true, data }
    } catch (error) {
      console.error('❌ [SUPABASE] Erreur création tâche:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Mettre à jour une tâche
   */
  async updateTask(taskId, updates) {
    if (!this.isEnabled) return { success: false, data: null }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error

      console.log('✅ [SUPABASE] Tâche mise à jour:', taskId)
      return { success: true, data }
    } catch (error) {
      console.error('❌ [SUPABASE] Erreur mise à jour tâche:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Déplacer une tâche (drag & drop)
   */
  async moveTask(taskId, newColumnIndex, newPosition) {
    return this.updateTask(taskId, {
      column_index: newColumnIndex,
      position: newPosition
    })
  }

  /**
   * Supprimer une tâche
   */
  async deleteTask(taskId) {
    if (!this.isEnabled) return { success: false }

    try {
      // Les sous-tâches sont supprimées automatiquement (ON DELETE CASCADE)
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      console.log('✅ [SUPABASE] Tâche supprimée:', taskId)
      return { success: true }
    } catch (error) {
      console.error('❌ [SUPABASE] Erreur suppression tâche:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================================================
  // SOUS-TÂCHES
  // ================================================================

  /**
   * Mettre à jour une sous-tâche
   */
  async updateSubtask(subtaskId, updates) {
    if (!this.isEnabled) return { success: false, data: null }

    try {
      const { data, error } = await supabase
        .from('subtasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', subtaskId)
        .select()
        .single()

      if (error) throw error

      console.log('✅ [SUPABASE] Sous-tâche mise à jour:', subtaskId)
      return { success: true, data }
    } catch (error) {
      console.error('❌ [SUPABASE] Erreur mise à jour sous-tâche:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Ajouter une sous-tâche à une tâche
   */
  async addSubtask(taskId, subtaskData) {
    if (!this.isEnabled) return { success: false, data: null }

    try {
      const { data, error } = await supabase
        .from('subtasks')
        .insert({
          task_id: taskId,
          text: subtaskData.text,
          completed: false,
          due_date: subtaskData.dueDate,
          position: subtaskData.position || 0
        })
        .select()
        .single()

      if (error) throw error

      console.log('✅ [SUPABASE] Sous-tâche ajoutée:', data.id)
      return { success: true, data }
    } catch (error) {
      console.error('❌ [SUPABASE] Erreur ajout sous-tâche:', error)
      return { success: false, error: error.message }
    }
  }

  // ================================================================
  // STATISTIQUES
  // ================================================================

  /**
   * Obtenir des statistiques d'utilisation
   */
  async getStats(userEmail) {
    if (!this.isEnabled) return { success: false, data: {} }

    try {
      const [
        { count: workspacesCount },
        { count: tasksCount },
        { count: analysesCount }
      ] = await Promise.all([
        supabase.from('workspaces').select('count').eq('user_email', userEmail).single(),
        supabase.from('tasks').select('count', { count: 'exact' }).single(),
        supabase.from('context_analyses').select('count').single()
      ])

      return {
        success: true,
        data: {
          workspaces: workspacesCount || 0,
          tasks: tasksCount || 0,
          analyses: analysesCount || 0
        }
      }
    } catch (error) {
      console.error('❌ [SUPABASE] Erreur statistiques:', error)
      return { success: false, data: {} }
    }
  }
}

// Instance globale
export const supabaseService = new SupabaseService()

// Helpers pour vérification
export const isSupabaseEnabled = () => supabaseService.isEnabled
export const getSupabaseStatus = () => ({
  enabled: supabaseService.isEnabled,
  url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'Non configuré',
  hasKey: !!supabaseKey
})