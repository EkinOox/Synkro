import { ref, onUnmounted, watch } from 'vue'
import { Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

interface TipTapUser {
  id: string
  name: string
  color: string
  avatar?: string
}

export function useYjsTipTap(roomId: string, user: TipTapUser, element?: HTMLElement) {
  const editor = ref<Editor | null>(null)
  const isReady = ref(false)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const collaborators = ref<TipTapUser[]>([])
  const error = ref<string | null>(null)

  // Yjs objects
  let ydoc: Y.Doc | null = null
  let provider: WebsocketProvider | null = null
  
  // Stocker les callbacks pour pouvoir les nettoyer
  let awarenessChangeCallback: (() => void) | null = null

  const initializeEditor = async (targetElement?: HTMLElement) => {
    try {
      console.log('📝 Initialisation de l\'éditeur TipTap avec Yjs')
      isConnecting.value = true
      error.value = null
      
      // Créer le document Yjs
      ydoc = new Y.Doc()
      
      // URL du serveur WebSocket
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
      const url = `${wsUrl}/yjs`
      
      console.log(`🔗 Connexion TipTap: ${url}/${roomId}`)

      // Créer le provider WebSocket (il ajoute automatiquement le roomId)
      provider = new WebsocketProvider(url, roomId, ydoc)

      // Configurer l'awareness après la création
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
        console.log('📡 Statut TipTap WebSocket:', event.status)
        isConnected.value = event.status === 'connected'
        isConnecting.value = event.status === 'connecting'

        if (event.status === 'disconnected') {
          error.value = 'Connexion perdue'
        } else if (event.status === 'connected') {
          error.value = null
        }
      })

      provider.on('connection-error', (event: any) => {
        console.error('❌ Erreur de connexion TipTap:', event)
        error.value = 'Impossible de se connecter'
        isConnecting.value = false
      })

      // Suivre les collaborateurs
      if (provider.awareness) {
        awarenessChangeCallback = () => {
          // Vérifier que le provider et awareness existent toujours
          if (!provider || !provider.awareness) {
            console.warn('⚠️ Provider ou awareness non disponible lors du changement')
            return
          }
          
          const states = provider.awareness.getStates()
          const users: TipTapUser[] = []
          
          states.forEach((state: any) => {
            if (state.user && state.user.id !== user.id) {
              users.push(state.user)
            }
          })
          
          collaborators.value = users
          console.log('👥 Collaborateurs TipTap:', users.length)
        }
        
        provider.awareness.on('change', awarenessChangeCallback)
      }

      // Créer l'éditeur avec collaboration
      editor.value = new Editor({
        element: targetElement || element, // Utiliser l'élément fourni ou celui du composable
        extensions: [
          StarterKit.configure({
            history: false, // Désactiver l'historique (géré par Yjs)
          }),
          Underline,
          TextAlign.configure({
            types: ['heading', 'paragraph'],
          }),
          Collaboration.configure({
            document: ydoc,
            field: 'tiptap-content',
          }),
          CollaborationCursor.configure({
            provider: provider,
            user: {
              name: user.name,
              color: user.color,
            },
          }),
        ],
        content: '',
        editorProps: {
          attributes: {
            class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
          },
        },
        onUpdate: ({ editor }) => {
          if (provider && provider.awareness) {
            provider.awareness.setLocalStateField('cursor', {
              selection: editor.state.selection
            })
          }
        },
      })

      isReady.value = true
      isConnecting.value = false
      console.log('✅ Éditeur TipTap collaboratif initialisé')

    } catch (err) {
      console.error('❌ Erreur d\'initialisation TipTap:', err)
      error.value = 'Erreur d\'initialisation'
      isConnecting.value = false
    }
  }

  const destroyEditor = () => {
    if (editor.value) {
      console.log('🗑️ Destruction de l\'éditeur TipTap')
      editor.value.destroy()
      editor.value = null
    }
    
    if (provider) {
      // Nettoyer les événements avant la destruction
      if (provider.awareness && awarenessChangeCallback) {
        try {
          provider.awareness.off('change', awarenessChangeCallback)
          awarenessChangeCallback = null
        } catch (e) {
          console.warn('⚠️ Erreur lors du nettoyage des événements awareness:', e)
        }
      }
      
      try {
        provider.destroy()
      } catch (e) {
        console.warn('⚠️ Erreur lors de la destruction du provider:', e)
      }
      provider = null
    }
    
    if (ydoc) {
      try {
        ydoc.destroy()
      } catch (e) {
        console.warn('⚠️ Erreur lors de la destruction du document:', e)
      }
      ydoc = null
    }
    
    isReady.value = false
    isConnected.value = false
    isConnecting.value = false
    collaborators.value = []
    error.value = null
  }

  // Actions de formatage
  const toggleBold = () => editor.value?.chain().focus().toggleBold().run()
  const toggleItalic = () => editor.value?.chain().focus().toggleItalic().run()
  const toggleUnderline = () => editor.value?.chain().focus().toggleUnderline().run()
  const toggleStrike = () => editor.value?.chain().focus().toggleStrike().run()

  const setHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    editor.value?.chain().focus().toggleHeading({ level }).run()
  }

  const toggleBulletList = () => editor.value?.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor.value?.chain().focus().toggleOrderedList().run()

  const setTextAlign = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    editor.value?.chain().focus().setTextAlign(alignment).run()
  }

  const undo = () => editor.value?.chain().focus().undo().run()
  const redo = () => editor.value?.chain().focus().redo().run()

  const clearContent = () => {
    editor.value?.chain().focus().clearContent().run()
  }

  // État des boutons (actif/inactif)
  const isActive = (format: string, options?: any) => {
    return editor.value?.isActive(format, options) || false
  }

  const canUndo = () => editor.value?.can().undo() || false
  const canRedo = () => editor.value?.can().redo() || false

  // Hook de nettoyage seulement
  onUnmounted(() => {
    destroyEditor()
  })

  // Watcher pour reconnecter si nécessaire
  watch(isConnected, (connected) => {
    if (!connected && editor.value) {
      console.log('🔄 Connexion perdue, tentative de reconnexion...')
      // Logique de reconnexion peut être ajoutée ici
    }
  })

  return {
    // Éditeur
    editor,
    isReady,
    
    // État de la collaboration
    isConnected,
    isConnecting,
    collaborators,
    error,
    
    // Actions
    initializeEditor,
    destroyEditor,
    
    // Formatage
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleStrike,
    setHeading,
    toggleBulletList,
    toggleOrderedList,
    setTextAlign,
    undo,
    redo,
    clearContent,
    
    // État
    isActive,
    canUndo,
    canRedo
  }
}
