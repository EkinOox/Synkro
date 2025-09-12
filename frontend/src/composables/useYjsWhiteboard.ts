import { ref, onUnmounted } from 'vue'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

interface WhiteboardUser {
  id: string
  name: string
  color: string
}

interface DrawingPath {
  id: string
  tool: string
  color: string
  width: number
  points: Array<{ x: number; y: number }>
  userId: string
  timestamp: number
}

interface WhiteboardShape {
  id: string
  type: 'rectangle' | 'circle' | 'arrow' | 'text'
  x: number
  y: number
  width: number
  height: number
  color: string
  strokeWidth: number
  userId: string
  timestamp: number
  text?: string
}

export function useYjsWhiteboard(roomId: string, user: WhiteboardUser) {
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const collaborators = ref<WhiteboardUser[]>([])
  const error = ref<string | null>(null)

  // Yjs objects
  let ydoc: Y.Doc | null = null
  let provider: WebsocketProvider | null = null
  let yPaths: Y.Array<DrawingPath> | null = null
  let yShapes: Y.Array<WhiteboardShape> | null = null
  
  // Local state
  const paths = ref<DrawingPath[]>([])
  const shapes = ref<WhiteboardShape[]>([])

  // Stocker les callbacks pour pouvoir les nettoyer
  let pathsObserver: (() => void) | null = null
  let shapesObserver: (() => void) | null = null
  let awarenessChangeCallback: (() => void) | null = null

  const initializeWhiteboard = async () => {
    try {
      console.log('Initialisation du Whiteboard collaboratif avec Yjs')
      isConnecting.value = true
      error.value = null
      
      // Créer le document Yjs
      ydoc = new Y.Doc()
      
      // URL du serveur WebSocket
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
      const url = `${wsUrl}/yjs`
      
      console.log(`?? Connexion Whiteboard: ${url}/${roomId}`)

      // Créer le provider WebSocket
      provider = new WebsocketProvider(url, `whiteboard-${roomId}`, ydoc)

      // Créer les structures partagées
      yPaths = ydoc.getArray<DrawingPath>('whiteboard-paths')
      yShapes = ydoc.getArray<WhiteboardShape>('whiteboard-shapes')

      // Configurer l'awareness
      if (provider.awareness) {
        provider.awareness.setLocalStateField('user', {
          id: user.id,
          name: user.name,
          color: user.color
        })
      }

      // Gestionnaires d'évènements du provider
      provider.on('status', (event: any) => {
        console.log('?? Statut Whiteboard WebSocket:', event.status)
        isConnected.value = event.status === 'connected'
        isConnecting.value = event.status === 'connecting'

        if (event.status === 'disconnected') {
          error.value = 'Connexion perdue'
        } else if (event.status === 'connected') {
          error.value = null
        }
      })

      provider.on('connection-error', (event: any) => {
        console.error('? Erreur de connexion Whiteboard:', event)
        error.value = 'Impossible de se connecter'
        isConnecting.value = false
      })

      // Observer les changements des chemins de dessin
      pathsObserver = () => {
        if (yPaths) {
          paths.value = yPaths.toArray()
          console.log('Chemins mis à jour:', paths.value.length)
        }
      }
      
      if (yPaths) {
        yPaths.observe(pathsObserver)
        // Charger les données existantes
        paths.value = yPaths.toArray()
      }

      // Observer les changements des formes
      shapesObserver = () => {
        if (yShapes) {
          shapes.value = yShapes.toArray()
          console.log('?? Formes mises à jour:', shapes.value.length)
        }
      }
      
      if (yShapes) {
        yShapes.observe(shapesObserver)
        // Charger les données existantes
        shapes.value = yShapes.toArray()
      }

      // Suivre les collaborateurs
      if (provider.awareness) {
        awarenessChangeCallback = () => {
          if (!provider || !provider.awareness) return
          
          const states = provider.awareness.getStates()
          const users: WhiteboardUser[] = []
          
          states.forEach((state: any) => {
            if (state.user && state.user.id !== user.id) {
              users.push(state.user)
            }
          })
          
          collaborators.value = users
          console.log('Collaborateurs Whiteboard:', users.length)
        }
        
        provider.awareness.on('change', awarenessChangeCallback)
      }

      isConnecting.value = false
      console.log('Whiteboard collaboratif initialisé')

    } catch (err) {
      console.error('? Erreur d\'initialisation Whiteboard:', err)
      error.value = 'Erreur d\'initialisation'
      isConnecting.value = false
    }
  }

  const addPath = (path: Omit<DrawingPath, 'id' | 'userId' | 'timestamp'>) => {
    if (!yPaths) return

    const newPath: DrawingPath = {
      ...path,
      id: Date.now().toString() + Math.random(),
      userId: user.id,
      timestamp: Date.now()
    }

    yPaths.push([newPath])
    console.log('?? Nouveau chemin ajouté:', newPath.id)
  }

  const addShape = (shape: Omit<WhiteboardShape, 'id' | 'userId' | 'timestamp'>) => {
    if (!yShapes) return

    const newShape: WhiteboardShape = {
      ...shape,
      id: Date.now().toString() + Math.random(),
      userId: user.id,
      timestamp: Date.now()
    }

    yShapes.push([newShape])
    console.log('?? Nouvelle forme ajoutée:', newShape.id)
  }

  const clearWhiteboard = () => {
    if (!yPaths || !yShapes) return

    // Effacer tous les chemins et formes
    yPaths.delete(0, yPaths.length)
    yShapes.delete(0, yShapes.length)
    
    console.log('Whiteboard effacé')
  }

  const removePath = (pathId: string) => {
    if (!yPaths) return

    const index = paths.value.findIndex(p => p.id === pathId)
    if (index !== -1) {
      yPaths.delete(index, 1)
      console.log('??? Chemin supprimé:', pathId)
    }
  }

  const removeShape = (shapeId: string) => {
    if (!yShapes) return

    const index = shapes.value.findIndex(s => s.id === shapeId)
    if (index !== -1) {
      yShapes.delete(index, 1)
      console.log('Forme supprimée:', shapeId)
    }
  }
  const destroyWhiteboard = () => {
    console.log('Destruction du Whiteboard collaboratif')
    
    if (provider) {
      // Nettoyer les évènements avant la destruction
      if (provider.awareness && awarenessChangeCallback) {
        try {
          provider.awareness.off('change', awarenessChangeCallback)
          awarenessChangeCallback = null
        } catch (e) {
          console.warn('?? Erreur lors du nettoyage des évènements awareness:', e)
        }
      }
      
      try {
        provider.destroy()
      } catch (e) {
        console.warn('?? Erreur lors de la destruction du provider:', e)
      }
      provider = null
    }

    // Nettoyer les observers
    if (yPaths && pathsObserver) {
      try {
        yPaths.unobserve(pathsObserver)
        pathsObserver = null
      } catch (e) {
        console.warn('?? Erreur lors du nettoyage observer paths:', e)
      }
    }

    if (yShapes && shapesObserver) {
      try {
        yShapes.unobserve(shapesObserver)
        shapesObserver = null
      } catch (e) {
        console.warn('?? Erreur lors du nettoyage observer shapes:', e)
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
    
    yPaths = null
    yShapes = null
    isConnected.value = false
    isConnecting.value = false
    collaborators.value = []
    paths.value = []
    shapes.value = []
    error.value = null
  }

  // Hook de nettoyage
  onUnmounted(() => {
    destroyWhiteboard()
  })

  return {
    // état de la collaboration
    isConnected,
    isConnecting,
    collaborators,
    error,
    
    // Données du whiteboard
    paths,
    shapes,
    
    // Actions
    initializeWhiteboard,
    destroyWhiteboard,
    addPath,
    addShape,
    clearWhiteboard,
    removePath,
    removeShape
  }
}
