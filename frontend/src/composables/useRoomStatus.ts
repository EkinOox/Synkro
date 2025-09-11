import { ref, computed } from 'vue'

interface ComponentStatus {
  name: string
  connected: boolean
  connecting: boolean
  error: string | null
  collaborators: number
  lastUpdate: Date
}

interface RoomStatusData {
  editor: ComponentStatus
  comments: ComponentStatus
  whiteboard: ComponentStatus
  chat: ComponentStatus
  call: ComponentStatus
}

// État global partagé pour toute la room
const roomStatusState = ref<RoomStatusData>({
  editor: {
    name: 'Éditeur collaboratif',
    connected: false,
    connecting: false,
    error: null,
    collaborators: 0,
    lastUpdate: new Date()
  },
  comments: {
    name: 'Commentaires',
    connected: false,
    connecting: false,
    error: null,
    collaborators: 0,
    lastUpdate: new Date()
  },
  whiteboard: {
    name: 'Tableau blanc',
    connected: false,
    connecting: false,
    error: null,
    collaborators: 0,
    lastUpdate: new Date()
  },
  chat: {
    name: 'Chat',
    connected: false,
    connecting: false,
    error: null,
    collaborators: 0,
    lastUpdate: new Date()
  },
  call: {
    name: 'Appel',
    connected: false,
    connecting: false,
    error: null,
    collaborators: 0,
    lastUpdate: new Date()
  }
})

export function useRoomStatus() {
  // État global calculé
  const globalStatus = computed(() => {
    const components = Object.values(roomStatusState.value)
    const connectedCount = components.filter(c => c.connected).length
    const connectingCount = components.filter(c => c.connecting).length
    const errorCount = components.filter(c => c.error).length
    const totalCollaborators = components.reduce((sum, c) => sum + c.collaborators, 0)
    
    let status: 'connected' | 'connecting' | 'error' | 'disconnected' = 'disconnected'
    let message = ''
    
    if (errorCount > 0) {
      status = 'error'
      message = `${errorCount} composant(s) en erreur`
    } else if (connectingCount > 0) {
      status = 'connecting'
      message = `Connexion en cours (${connectedCount}/${components.length})`
    } else if (connectedCount === components.length) {
      status = 'connected'
      message = `Tous les composants connectés`
    } else if (connectedCount > 0) {
      status = 'connecting'
      message = `${connectedCount}/${components.length} composants connectés`
    } else {
      status = 'disconnected'
      message = 'Aucune connexion active'
    }
    
    return {
      status,
      message,
      connectedCount,
      totalComponents: components.length,
      totalCollaborators,
      lastUpdate: Math.max(...components.map(c => c.lastUpdate.getTime()))
    }
  })

  // Fonction pour mettre à jour le statut d'un composant
  function updateComponentStatus(
    component: keyof RoomStatusData,
    status: Partial<ComponentStatus>
  ) {
    const current = roomStatusState.value[component]
    roomStatusState.value[component] = {
      ...current,
      ...status,
      lastUpdate: new Date()
    }
  }

  // Fonctions spécifiques pour chaque composant
  function updateEditorStatus(connected: boolean, connecting: boolean, error: string | null, collaborators: number = 0) {
    updateComponentStatus('editor', { connected, connecting, error, collaborators })
  }

  function updateCommentsStatus(connected: boolean, connecting: boolean, error: string | null, collaborators: number = 0) {
    updateComponentStatus('comments', { connected, connecting, error, collaborators })
  }

  function updateWhiteboardStatus(connected: boolean, connecting: boolean, error: string | null, collaborators: number = 0) {
    updateComponentStatus('whiteboard', { connected, connecting, error, collaborators })
  }

  function updateChatStatus(connected: boolean, connecting: boolean, error: string | null, collaborators: number = 0) {
    updateComponentStatus('chat', { connected, connecting, error, collaborators })
  }

  function updateCallStatus(connected: boolean, connecting: boolean, error: string | null, collaborators: number = 0) {
    updateComponentStatus('call', { connected, connecting, error, collaborators })
  }

  // Réinitialiser tous les statuts
  function resetAllStatus() {
    Object.keys(roomStatusState.value).forEach(key => {
      const component = key as keyof RoomStatusData
      updateComponentStatus(component, {
        connected: false,
        connecting: false,
        error: null,
        collaborators: 0
      })
    })
  }

  return {
    // État
    roomStatus: roomStatusState,
    globalStatus,
    
    // Actions
    updateEditorStatus,
    updateCommentsStatus,
    updateWhiteboardStatus,
    updateChatStatus,
    updateCallStatus,
    resetAllStatus
  }
}
