import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

interface Participant {
  id: string
  name: string
  avatar?: string
  color: string
  lastSeen: number
  isOnline: boolean
  activities: {
    editor: boolean
    chat: boolean
    whiteboard: boolean
    call: boolean
    comments: boolean
  }
}

interface RoomParticipants {
  participants: Participant[]
  onlineCount: number
  totalCount: number
}

const WEBSOCKET_URL = 'ws://localhost:3001/yjs'

export function useRoomParticipants(roomId: string) {
  const participants = ref<Map<string, Participant>>(new Map())
  const providers = ref<Map<string, WebsocketProvider>>(new Map())
  const docs = ref<Map<string, Y.Doc>>(new Map())
  
  // Configuration des composants à surveiller
  const components = [
    { key: 'editor', roomSuffix: '' }, // Room ID: "1"
    { key: 'chat', roomSuffix: '-1' }, // Room ID: "chat-1"  
    { key: 'whiteboard', roomSuffix: '-1' }, // Room ID: "whiteboard-1"
    { key: 'call', roomSuffix: '-1' }, // Room ID: "call-1"
    { key: 'comments', roomSuffix: '' } // Utilise le même que l'éditeur
  ]

  // Couleurs pour les participants
  const participantColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ]

  function getParticipantColor(userId: string): string {
    const index = parseInt(userId.replace(/\D/g, ''), 10) || 0
    return participantColors[index % participantColors.length]
  }

  function createOrUpdateParticipant(userId: string, userName: string, component: string, isActive: boolean) {
    const existing = participants.value.get(userId)
    const now = Date.now()
    
    if (existing) {
      // Mettre à jour le participant existant
      existing.activities[component as keyof typeof existing.activities] = isActive
      existing.lastSeen = now
      existing.isOnline = Object.values(existing.activities).some(activity => activity)
    } else {
      // Créer un nouveau participant
      const newParticipant: Participant = {
        id: userId,
        name: userName,
        avatar: `/avatars/${userName.toLowerCase()}.png`,
        color: getParticipantColor(userId),
        lastSeen: now,
        isOnline: isActive,
        activities: {
          editor: component === 'editor' ? isActive : false,
          chat: component === 'chat' ? isActive : false,
          whiteboard: component === 'whiteboard' ? isActive : false,
          call: component === 'call' ? isActive : false,
          comments: component === 'comments' ? isActive : false
        }
      }
      participants.value.set(userId, newParticipant)
    }
  }

  function setupAwarenessProvider(componentKey: string, roomSuffix: string) {
    let fullRoomId: string
    
    // Construire l'ID de room selon les conventions
    if (componentKey === 'editor' || componentKey === 'comments') {
      fullRoomId = roomId // "1"
    } else if (componentKey === 'chat') {
      fullRoomId = `chat-${roomId}` // "chat-1"
    } else if (componentKey === 'whiteboard') {
      fullRoomId = `whiteboard-${roomId}` // "whiteboard-1"
    } else if (componentKey === 'call') {
      fullRoomId = `call-${roomId}` // "call-1"
    } else {
      fullRoomId = `${roomId}${roomSuffix}`
    }
    
    const doc = new Y.Doc()
    const provider = new WebsocketProvider(WEBSOCKET_URL, fullRoomId, doc)
    
    docs.value.set(componentKey, doc)
    providers.value.set(componentKey, provider)

    // écouter les changements d'awareness
    provider.awareness.on('change', () => {
      const states = Array.from(provider.awareness.getStates().entries())
      
      // Traiter chaque utilisateur connecté
      states.forEach(([clientId, state]) => {
        if (state.user) {
          const userId = state.user.id || `user-${clientId}`
          const userName = state.user.name || `Utilisateur ${clientId}`
          createOrUpdateParticipant(userId, userName, componentKey, true)
        }
      })

      // Marquer les participants inactifs pour ce composant
      participants.value.forEach((participant, userId) => {
        if (!states.some(([_, state]) => 
          state.user && (state.user.id === userId || `user-${_}` === userId)
        )) {
          participant.activities[componentKey as keyof typeof participant.activities] = false
          participant.isOnline = Object.values(participant.activities).some(activity => activity)
        }
      })
    })

    return provider
  }

  // état calculé
  const roomParticipants = computed<RoomParticipants>(() => {
    const participantsList = Array.from(participants.value.values())
    const onlineParticipants = participantsList.filter(p => p.isOnline)
    
    return {
      participants: participantsList.sort((a, b) => {
        // Trier par statut en ligne puis par dernière activité
        if (a.isOnline && !b.isOnline) return -1
        if (!a.isOnline && b.isOnline) return 1
        return b.lastSeen - a.lastSeen
      }),
      onlineCount: onlineParticipants.length,
      totalCount: participantsList.length
    }
  })

  const onlineParticipants = computed(() => 
    roomParticipants.value.participants.filter(p => p.isOnline)
  )

  const offlineParticipants = computed(() => 
    roomParticipants.value.participants.filter(p => !p.isOnline)
  )

  // Nettoyer les participants inactifs (plus de 5 minutes)
  function cleanupInactiveParticipants() {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
    
    participants.value.forEach((participant, userId) => {
      if (!participant.isOnline && participant.lastSeen < fiveMinutesAgo) {
        participants.value.delete(userId)
      }
    })
  }

  // Initialisation
  onMounted(() => {
    // Configurer les providers pour chaque composant
    components.forEach(({ key, roomSuffix }) => {
      setupAwarenessProvider(key, roomSuffix)
    })

    // Nettoyer les participants inactifs toutes les minutes
    const cleanupInterval = setInterval(cleanupInactiveParticipants, 60000)
    
    onUnmounted(() => {
      clearInterval(cleanupInterval)
    })
  })

  // Nettoyage
  onUnmounted(() => {
    // Fermer toutes les connexions
    providers.value.forEach(provider => {
      provider.destroy()
    })
    
    // Nettoyer les documents
    docs.value.forEach(doc => {
      doc.destroy()
    })
    
    providers.value.clear()
    docs.value.clear()
    participants.value.clear()
  })

  return {
    roomParticipants,
    onlineParticipants,
    offlineParticipants,
    participants: computed(() => Array.from(participants.value.values()))
  }
}
