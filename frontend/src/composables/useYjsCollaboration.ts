import { ref, onUnmounted } from 'vue'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

interface CollaborationUser {
  id: string
  name: string
  color: string
  avatar?: string
}

export function useYjsCollaboration(roomId: string, user: CollaborationUser) {
  // État de la collaboration
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const collaborators = ref<CollaborationUser[]>([])
  const error = ref<string | null>(null)

  // Document Yjs
  let ydoc: Y.Doc | null = null
  let provider: WebsocketProvider | null = null

  const connect = async (): Promise<Y.Doc> => {
    try {
      isConnecting.value = true
      error.value = null

      // Créer le document Yjs
      ydoc = new Y.Doc()

      // URL du serveur WebSocket
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
      const url = `${wsUrl}/yjs`

      console.log(`🔗 Connexion au serveur Yjs: ${url}/${roomId}`)

      // Créer le provider WebSocket (il ajoute automatiquement le roomId)
      provider = new WebsocketProvider(url, roomId, ydoc)

      // Attendre que l'awareness soit disponible
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout: awareness non disponible'))
        }, 5000)

        // Vérifier périodiquement si l'awareness est prête
        const checkAwareness = () => {
          if (provider?.awareness) {
            clearTimeout(timeout)
            resolve()
          } else {
            setTimeout(checkAwareness, 100)
          }
        }
        checkAwareness()
      })

      // Configurer l'awareness après qu'elle soit disponible
      if (provider.awareness) {
        provider.awareness.setLocalStateField('user', {
          id: user.id,
          name: user.name,
          color: user.color,
          avatar: user.avatar
        })
      }

      // Gestionnaires d'événements
      provider.on('status', (event: any) => {
        console.log('📡 Statut WebSocket:', event.status)
        isConnected.value = event.status === 'connected'
        isConnecting.value = event.status === 'connecting'

        if (event.status === 'disconnected') {
          error.value = 'Connexion perdue avec le serveur'
        } else if (event.status === 'connected') {
          error.value = null
        }
      })

      provider.on('connection-error', (event: any) => {
        console.error('❌ Erreur de connexion Yjs:', event)
        error.value = 'Impossible de se connecter au serveur'
        isConnecting.value = false
      })

      // Suivre les utilisateurs connectés via awareness
      if (provider.awareness) {
        provider.awareness.on('change', () => {
          if (provider?.awareness) {
            const states = provider.awareness.getStates()
            const users: CollaborationUser[] = []
            
            states.forEach((state: any) => {
              if (state.user && state.user.id !== user.id) {
                users.push(state.user)
              }
            })
            
            collaborators.value = users
            console.log('👥 Collaborateurs connectés:', users.length)
          }
        })
      }

      return ydoc

    } catch (err) {
      console.error('❌ Erreur de connexion Yjs:', err)
      error.value = 'Erreur de connexion'
      isConnecting.value = false
      throw err
    }
  }

  const disconnect = () => {
    if (provider) {
      console.log('🔌 Déconnexion du serveur Yjs')
      provider.destroy()
      provider = null
    }
    
    if (ydoc) {
      ydoc.destroy()
      ydoc = null
    }

    isConnected.value = false
    isConnecting.value = false
    collaborators.value = []
    error.value = null
  }

  const updateAwareness = (data: any) => {
    if (provider && provider.awareness) {
      provider.awareness.setLocalStateField('user', {
        ...user,
        ...data
      })
    }
  }

  const getSharedType = <T extends Y.AbstractType<any>>(name: string): T | null => {
    if (!ydoc) return null
    return ydoc.get(name) as T
  }

  // Nettoyage à la destruction du composant
  onUnmounted(() => {
    disconnect()
  })

  return {
    // État
    isConnected,
    isConnecting,
    collaborators,
    error,
    
    // Actions
    connect,
    disconnect,
    updateAwareness,
    getSharedType,
    
    // Accès direct (utilisé avec précaution)
    get ydoc() { return ydoc },
    get provider() { return provider }
  }
}
