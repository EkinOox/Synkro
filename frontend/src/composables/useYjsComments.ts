import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as Y from 'yjs'
import { useYjsCollaboration } from './useYjsCollaboration'

interface Comment {
  id: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  content: string
  timestamp: number
  type: 'comment' | 'suggestion' | 'question'
  resolved: boolean
  position?: {
    x: number
    y: number
  }
  parentId?: string // Pour les réponses
}

interface CommentUser {
  id: string
  name: string
  color: string
  avatar?: string
}

export function useYjsComments(roomId: string, user: CommentUser) {
  // Collaboration Yjs
  const {
    isConnected,
    isConnecting,
    collaborators,
    error,
    connect,
    disconnect
  } = useYjsCollaboration(roomId, user)

  // Types partagés Yjs
  let yComments: Y.Array<any> | null = null

  // État local
  const comments = ref<Comment[]>([])
  const isReady = ref(false)

  // Filtres
  const activeFilter = ref<'all' | 'unresolved' | 'resolved' | 'mine'>('all')
  const activeTypeFilter = ref<'all' | 'comment' | 'suggestion' | 'question'>('all')

  // Commentaires filtrés
  const filteredComments = computed(() => {
    let filtered = [...comments.value]

    // Filtre par statut
    switch (activeFilter.value) {
      case 'unresolved':
        filtered = filtered.filter(c => !c.resolved)
        break
      case 'resolved':
        filtered = filtered.filter(c => c.resolved)
        break
      case 'mine':
        filtered = filtered.filter(c => c.author.id === user.id)
        break
    }

    // Filtre par type
    if (activeTypeFilter.value !== 'all') {
      filtered = filtered.filter(c => c.type === activeTypeFilter.value)
    }

    // Trier par timestamp (plus récent en premier)
    return filtered.sort((a, b) => b.timestamp - a.timestamp)
  })

  // Statistiques
  const commentStats = computed(() => {
    const total = comments.value.length
    const unresolved = comments.value.filter(c => !c.resolved).length
    const resolved = comments.value.filter(c => c.resolved).length
    const mine = comments.value.filter(c => c.author.id === user.id).length

    return {
      total,
      unresolved,
      resolved,
      mine,
      byType: {
        comment: comments.value.filter(c => c.type === 'comment').length,
        suggestion: comments.value.filter(c => c.type === 'suggestion').length,
        question: comments.value.filter(c => c.type === 'question').length
      }
    }
  })

  const initialize = async () => {
    try {
      console.log('📝 Initialisation des commentaires Yjs')
      
      // Se connecter à Yjs
      const ydoc = await connect()
      
      // Obtenir le type Array partagé pour les commentaires
      yComments = ydoc.getArray('comments')

      // Synchroniser les commentaires locaux avec Yjs
      syncCommentsFromYjs()

      // Écouter les changements
      yComments.observe(syncCommentsFromYjs)

      isReady.value = true
      console.log('✅ Commentaires Yjs initialisés')

    } catch (err) {
      console.error('❌ Erreur d\'initialisation des commentaires:', err)
    }
  }

  const syncCommentsFromYjs = () => {
    if (!yComments) return

    const yjsComments = yComments.toArray()
    comments.value = yjsComments.map(item => ({
      ...item,
      timestamp: item.timestamp || Date.now()
    }))

    console.log(`🔄 Synchronisation: ${comments.value.length} commentaires`)
  }

  const addComment = (
    content: string, 
    type: Comment['type'] = 'comment',
    position?: { x: number, y: number },
    parentId?: string
  ) => {
    if (!yComments || !content.trim()) return

    const newComment: Comment = {
      id: generateId(),
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      },
      content: content.trim(),
      timestamp: Date.now(),
      type,
      resolved: false,
      position,
      parentId
    }

    // Ajouter au document Yjs (sera synchronisé automatiquement)
    yComments.push([newComment])
    
    console.log('💬 Nouveau commentaire ajouté:', newComment.type)
    return newComment.id
  }

  const updateComment = (commentId: string, updates: Partial<Comment>) => {
    if (!yComments) return

    const index = comments.value.findIndex(c => c.id === commentId)
    if (index === -1) return

    const comment = comments.value[index]
    
    // Vérifier les permissions
    if (comment.author.id !== user.id && !updates.resolved) {
      console.warn('⚠️ Pas d\'autorisation pour modifier ce commentaire')
      return
    }

    const updatedComment = { ...comment, ...updates }
    
    // Mettre à jour dans Yjs
    yComments.delete(index, 1)
    yComments.insert(index, [updatedComment])
    
    console.log('✏️ Commentaire mis à jour:', commentId)
  }

  const deleteComment = (commentId: string) => {
    if (!yComments) return

    const index = comments.value.findIndex(c => c.id === commentId)
    if (index === -1) return

    const comment = comments.value[index]
    
    // Vérifier les permissions
    if (comment.author.id !== user.id) {
      console.warn('⚠️ Pas d\'autorisation pour supprimer ce commentaire')
      return
    }

    // Supprimer de Yjs
    yComments.delete(index, 1)
    
    console.log('🗑️ Commentaire supprimé:', commentId)
  }

  const resolveComment = (commentId: string) => {
    updateComment(commentId, { resolved: true })
  }

  const unresolveComment = (commentId: string) => {
    updateComment(commentId, { resolved: false })
  }

  const setFilter = (filter: typeof activeFilter.value) => {
    activeFilter.value = filter
  }

  const setTypeFilter = (filter: typeof activeTypeFilter.value) => {
    activeTypeFilter.value = filter
  }

  const clearAllResolved = () => {
    if (!yComments) return

    const resolvedComments = comments.value
      .filter(c => c.resolved)
      .reverse() // Inverser pour maintenir les indices

    resolvedComments.forEach(comment => {
      const index = comments.value.findIndex(c => c.id === comment.id)
      if (index !== -1) {
        yComments!.delete(index, 1)
      }
    })

    console.log(`🧹 ${resolvedComments.length} commentaires résolus supprimés`)
  }

  const getReplies = (parentId: string) => {
    return comments.value.filter(c => c.parentId === parentId)
  }

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Initialisation automatique
  onMounted(() => {
    initialize()
  })

  onUnmounted(() => {
    if (yComments) {
      yComments.unobserve(syncCommentsFromYjs)
    }
    disconnect()
  })

  return {
    // État
    comments,
    filteredComments,
    commentStats,
    isReady,
    
    // État de la collaboration
    isConnected,
    isConnecting,
    collaborators,
    error,
    
    // Filtres
    activeFilter,
    activeTypeFilter,
    setFilter,
    setTypeFilter,
    
    // Actions
    initialize,
    addComment,
    updateComment,
    deleteComment,
    resolveComment,
    unresolveComment,
    clearAllResolved,
    getReplies
  }
}
