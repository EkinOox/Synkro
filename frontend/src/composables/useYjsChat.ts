import { ref, onUnmounted } from 'vue'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

interface ChatUser {
  id: string
  name: string
  color?: string
  avatar?: string
}

interface ChatMessage {
  id: string
  content: string
  userId: string
  userName: string
  timestamp: number
  type: 'text' | 'system' | 'typing'
}

export function useYjsChat(roomId: string, user: ChatUser) {
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const collaborators = ref<ChatUser[]>([])
  const error = ref<string | null>(null)
  const typingUsers = ref<string[]>([])

  // Yjs objects
  let ydoc: Y.Doc | null = null
  let provider: WebsocketProvider | null = null
  let yMessages: Y.Array<ChatMessage> | null = null
  
  // Local state
  const messages = ref<ChatMessage[]>([])

  // Stocker les callbacks pour pouvoir les nettoyer
  let messagesObserver: (() => void) | null = null
  let awarenessChangeCallback: (() => void) | null = null

  const initializeChat = async () => {
    try {
      console.log('?? Initialisation du Chat collaboratif avec Yjs')
      isConnecting.value = true
      error.value = null
      
      // Créer le document Yjs
      ydoc = new Y.Doc()
      
      // URL du serveur WebSocket
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
      const url = `${wsUrl}/yjs`
      
      console.log(`?? Connexion Chat: ${url}/${roomId}`)

      // Créer le provider WebSocket
      provider = new WebsocketProvider(url, `chat-${roomId}`, ydoc)

      // Créer la structure partagée pour les messages
      yMessages = ydoc.getArray<ChatMessage>('chat-messages')

      // Configurer l'awareness
      if (provider.awareness) {
        provider.awareness.setLocalStateField('user', {
          id: user.id,
          name: user.name,
          color: user.color,
          avatar: user.avatar
        })
      }

      // Gestionnaires d'évènements du provider
      provider.on('status', (event: any) => {
        console.log('Statut Chat WebSocket:', event.status)
        isConnected.value = event.status === 'connected'
        isConnecting.value = event.status === 'connecting'

        if (event.status === 'disconnected') {
          error.value = 'Connexion perdue'
        } else if (event.status === 'connected') {
          error.value = null
          // Envoyer un message système de connexion
          if (yMessages) {
            addSystemMessage(`${user.name} a rejoint le chat`)
          }
        }
      })

      provider.on('connection-error', (event: any) => {
        console.error('? Erreur de connexion Chat:', event)
        error.value = 'Impossible de se connecter'
        isConnecting.value = false
      })

      // Observer les changements des messages
      messagesObserver = () => {
        if (yMessages) {
          messages.value = yMessages.toArray().sort((a, b) => a.timestamp - b.timestamp)
          console.log('Messages mis à jour:', messages.value.length)
        }
      }
      
      if (yMessages) {
        yMessages.observe(messagesObserver)
        // Charger les données existantes
        messages.value = yMessages.toArray().sort((a, b) => a.timestamp - b.timestamp)
      }

      // Suivre les collaborateurs et les utilisateurs qui tapent
      if (provider.awareness) {
        awarenessChangeCallback = () => {
          if (!provider || !provider.awareness) return
          
          const states = provider.awareness.getStates()
          const users: ChatUser[] = []
          const typing: string[] = []
          
          states.forEach((state: any) => {
            if (state.user && state.user.id !== user.id) {
              users.push(state.user)
              
              // Vérifier si l'utilisateur est en train de taper
              if (state.typing && Date.now() - state.typing < 3000) {
                typing.push(state.user.name)
              }
            }
          })
          
          collaborators.value = users
          typingUsers.value = typing
          console.log('Collaborateurs Chat:', users.length, 'Typing:', typing.length)
        }
        
        provider.awareness.on('change', awarenessChangeCallback)
      }

      isConnecting.value = false
      console.log('Chat collaboratif initialisé')

    } catch (err) {
      console.error('Erreur d\'initialisation Chat:', err)
      error.value = 'Erreur d\'initialisation'
      isConnecting.value = false
    }
  }

  const sendMessage = (content: string) => {
    if (!yMessages || !content.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      content: content.trim(),
      userId: user.id,
      userName: user.name,
      timestamp: Date.now(),
      type: 'text'
    }

    yMessages.push([message])
    console.log('Message envoyé:', message.id)

    // Arrêter l'indicateur de frappe
    setTypingStatus(false)
  }

  const addSystemMessage = (content: string) => {
    if (!yMessages) return

    const message: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      content,
      userId: 'system',
      userName: 'Système',
      timestamp: Date.now(),
      type: 'system'
    }

    yMessages.push([message])
    console.log('Message système:', content)
  }

  const setTypingStatus = (isTyping: boolean) => {
    if (!provider || !provider.awareness) return

    if (isTyping) {
      provider.awareness.setLocalStateField('typing', Date.now())
    } else {
      provider.awareness.setLocalStateField('typing', null)
    }
  }

  const clearMessages = () => {
    if (!yMessages) return

    yMessages.delete(0, yMessages.length)
    console.log('Messages effacés')
  }

  const destroyChat = () => {
    console.log('Destruction du Chat collaboratif')

    // Envoyer un message de déconnexion avant de partir
    if (yMessages && isConnected.value) {
      addSystemMessage(`${user.name} a quitté le chat`)
    }
    
    if (provider) {
      // Nettoyer les événements avant la destruction
      if (provider.awareness && awarenessChangeCallback) {
        try {
          provider.awareness.off('change', awarenessChangeCallback)
          awarenessChangeCallback = null
        } catch (e) {
          console.warn('?? Erreur lors du nettoyage des événements awareness:', e)
        }
      }
      
      try {
        provider.destroy()
      } catch (e) {
        console.warn('?? Erreur lors de la destruction du provider:', e)
      }
      provider = null
    }

    // Nettoyer l'observer
    if (yMessages && messagesObserver) {
      try {
        yMessages.unobserve(messagesObserver)
        messagesObserver = null
      } catch (e) {
        console.warn('?? Erreur lors du nettoyage observer messages:', e)
      }
    }
    
    if (ydoc) {
      try {
        ydoc.destroy()
      } catch (e) {
        console.warn('?? Erreur lors de la destruction du document:', e)
      }
      ydoc = null
    }
    
    yMessages = null
    isConnected.value = false
    isConnecting.value = false
    collaborators.value = []
    messages.value = []
    typingUsers.value = []
    error.value = null
  }

  // Hook de nettoyage
  onUnmounted(() => {
    destroyChat()
  })

  return {
    // état de la collaboration
    isConnected,
    isConnecting,
    collaborators,
    error,
    
    // Messages et typing
    messages,
    typingUsers,
    
    // Actions
    initializeChat,
    destroyChat,
    sendMessage,
    addSystemMessage,
    setTypingStatus,
    clearMessages
  }
}
