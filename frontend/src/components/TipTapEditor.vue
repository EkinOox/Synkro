<template>
  <div class="collaborative-editor">
    <!-- Barre d'outils -->
    <div class="glass-panel p-4 rounded-t-xl border-b border-white/20">
      <div class="flex flex-wrap gap-4">
        <!-- Formatage -->
        <div class="flex gap-2 border-r border-white/20 pr-4">
          <button
            @click="editor?.chain().focus().toggleBold().run()"
            :class="['btn-glass-secondary', { 'btn-glass-primary': editor?.isActive('bold') }]"
            title="Gras (Ctrl+B)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
            </svg>
          </button>
          <button
            @click="editor?.chain().focus().toggleItalic().run()"
            :class="['btn-glass-secondary', { 'btn-glass-primary': editor?.isActive('italic') }]"
            title="Italique (Ctrl+I)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
            </svg>
          </button>
          <button
            @click="editor?.chain().focus().toggleUnderline().run()"
            :class="['btn-glass-secondary', { 'btn-glass-primary': editor?.isActive('underline') }]"
            title="Souligné (Ctrl+U)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
            </svg>
          </button>
          <button
            @click="editor?.chain().focus().toggleStrike().run()"
            :class="['btn-glass-secondary', { 'btn-glass-primary': editor?.isActive('strike') }]"
            title="Barré"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/>
            </svg>
          </button>
        </div>

        <!-- Titres -->
        <div class="flex items-center gap-2 border-r border-white/20 pr-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-white/70">
            <path d="M5 4v3h5.5v12h3V7H19V4H5z"/>
          </svg>
          <select
            :value="getCurrentHeading()"
            @change="setHeading(($event.target as HTMLSelectElement).value)"
            class="glass-input text-sm px-3 py-1.5 min-w-32"
          >
            <option value="paragraph">Paragraphe</option>
            <option value="h1">Titre 1</option>
            <option value="h2">Titre 2</option>
            <option value="h3">Titre 3</option>
            <option value="h4">Titre 4</option>
          </select>
        </div>

        <!-- Listes -->
        <div class="flex gap-2 border-r border-white/20 pr-4">
          <button
            @click="editor?.chain().focus().toggleBulletList().run()"
            :class="['btn-glass-secondary', { 'btn-glass-primary': editor?.isActive('bulletList') }]"
            title="Liste à puces"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
            </svg>
          </button>
          <button
            @click="editor?.chain().focus().toggleOrderedList().run()"
            :class="['btn-glass-secondary', { 'btn-glass-primary': editor?.isActive('orderedList') }]"
            title="Liste numérotée"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
            </svg>
          </button>
        </div>

        <!-- Alignement -->
        <div class="flex gap-2 border-r border-white/20 pr-4">
          <button
            @click="editor?.chain().focus().setTextAlign('left').run()"
            :class="['btn-glass-secondary', { 'btn-glass-primary': editor?.isActive({ textAlign: 'left' }) }]"
            title="Aligner à gauche"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/>
            </svg>
          </button>
          <button
            @click="editor?.chain().focus().setTextAlign('center').run()"
            :class="['btn-glass-secondary', { 'btn-glass-primary': editor?.isActive({ textAlign: 'center' }) }]"
            title="Centrer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/>
            </svg>
          </button>
          <button
            @click="editor?.chain().focus().setTextAlign('right').run()"
            :class="['btn-glass-secondary', { 'btn-glass-primary': editor?.isActive({ textAlign: 'right' }) }]"
            title="Aligner à droite"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/>
            </svg>
          </button>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            @click="editor?.chain().focus().undo().run()"
            :disabled="!editor?.can().undo()"
            :class="['btn-glass-secondary', { 'opacity-50': !editor?.can().undo() }]"
            title="Annuler (Ctrl+Z)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
            </svg>
          </button>
          <button
            @click="editor?.chain().focus().redo().run()"
            :disabled="!editor?.can().redo()"
            :class="['btn-glass-secondary', { 'opacity-50': !editor?.can().redo() }]"
            title="Rétablir (Ctrl+Y)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Éditeur -->
    <div class="glass-panel rounded-b-xl">
      <div
        ref="editorElement"
        class="editor-content min-h-[300px] p-4 focus-within:ring-2 focus-within:ring-blue-400/50"
        :class="{ 'pointer-events-none opacity-50': !canWrite }"
      ></div>
    </div>

    <!-- Collaborateurs en temps réel -->
    <div v-if="collaborators.length > 0" class="flex items-center gap-2 mt-3 text-sm text-white/70">
      <i class="pi pi-users"></i>
      <span>{{ collaborators.length }} personne(s) modifient en temps réel:</span>
      <div class="flex gap-2">
        <div
          v-for="collaborator in collaborators"
          :key="collaborator.id"
          class="flex items-center gap-1"
        >
          <div 
            class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
            :style="{ backgroundColor: collaborator.color }"
          >
            {{ collaborator.name.charAt(0).toUpperCase() }}
          </div>
          <span class="text-xs">{{ collaborator.name }}</span>
        </div>
      </div>
    </div>

    <!-- Indicateur de sauvegarde -->
    <div class="flex items-center gap-2 mt-2 text-sm">
      <div v-if="isSaving" class="flex items-center gap-2 text-blue-400">
        <i class="pi pi-spin pi-spinner"></i>
        <span>Sauvegarde...</span>
      </div>
      <div v-else-if="lastSaved" class="text-green-400">
        <i class="pi pi-check-circle mr-1"></i>
        <span>Sauvegardé {{ formatTime(lastSaved) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'

interface Props {
  roomId: string
  canWrite?: boolean
}

interface Collaborator {
  id: number
  name: string
  avatar: string
  color: string
}

const props = withDefaults(defineProps<Props>(), {
  canWrite: true
})

const editorElement = ref<HTMLElement>()
const editor = ref<Editor>()
const collaborators = ref<Collaborator[]>([])
const isSaving = ref(false)
const lastSaved = ref<Date>()

let saveTimeout: number
let socket: WebSocket

onMounted(() => {
  initEditor()
  setupWebSocket()
})

onUnmounted(() => {
  editor.value?.destroy()
  socket?.close()
})

function initEditor() {
  if (!editorElement.value) return

  editor.value = new Editor({
    element: editorElement.value,
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      // Collaboration.configure({
      //   document: ydoc,
      // }),
      // CollaborationCursor.configure({
      //   provider: provider,
      //   user: {
      //     name: 'User Name',
      //     color: '#3b82f6',
      //   },
      // }),
    ],
    content: '<p>Commencez à écrire votre contenu collaboratif...</p>',
    editable: props.canWrite,
    onUpdate: ({ transaction }) => {
      if (transaction.docChanged) {
        scheduleAutoSave()
      }
    },
    onCreate: () => {
      // Charger le contenu existant
      loadContent()
    }
  })
}

function setupWebSocket() {
  socket = new WebSocket(`ws://localhost:3001/room/${props.roomId}/editor`)
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    handleWebSocketMessage(data)
  }
  
  socket.onerror = (error) => {
    console.warn('WebSocket error:', error)
  }
}

function handleWebSocketMessage(data: any) {
  switch (data.type) {
    case 'content-update':
      // Mettre à jour le contenu sans déclencher les événements
      if (editor.value && data.content !== editor.value.getHTML()) {
        editor.value.commands.setContent(data.content, false)
      }
      break
    
    case 'collaborator-join':
      addCollaborator(data.user)
      break
    
    case 'collaborator-leave':
      removeCollaborator(data.userId)
      break
    
    case 'cursor-update':
      updateCollaboratorCursor(data.userId, data.position)
      break
  }
}

function scheduleAutoSave() {
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    saveContent()
  }, 2000) // Sauvegarder après 2 secondes d'inactivité
}

async function saveContent() {
  if (!editor.value) return

  isSaving.value = true
  
  try {
    const content = editor.value.getHTML()
    
    // Envoyer le contenu via WebSocket
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'content-save',
        roomId: props.roomId,
        content: content
      }))
    }
    
    // Simuler une sauvegarde API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    lastSaved.value = new Date()
  } catch (error) {
    console.error('Erreur de sauvegarde:', error)
  } finally {
    isSaving.value = false
  }
}

async function loadContent() {
  try {
    // Simuler le chargement du contenu
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const savedContent = '<p>Contenu sauvegardé de la room...</p>'
    editor.value?.commands.setContent(savedContent, false)
  } catch (error) {
    console.error('Erreur de chargement:', error)
  }
}

function getCurrentHeading() {
  if (!editor.value) return 'paragraph'
  
  if (editor.value.isActive('heading', { level: 1 })) return 'h1'
  if (editor.value.isActive('heading', { level: 2 })) return 'h2'
  if (editor.value.isActive('heading', { level: 3 })) return 'h3'
  if (editor.value.isActive('heading', { level: 4 })) return 'h4'
  
  return 'paragraph'
}

function setHeading(value: string) {
  if (!editor.value) return
  
  if (value === 'paragraph') {
    editor.value.chain().focus().setParagraph().run()
  } else {
    const level = parseInt(value.charAt(1)) as 1 | 2 | 3 | 4 | 5 | 6
    editor.value.chain().focus().toggleHeading({ level }).run()
  }
}

function addCollaborator(user: Collaborator) {
  if (!collaborators.value.find(c => c.id === user.id)) {
    collaborators.value.push(user)
  }
}

function removeCollaborator(userId: number) {
  const index = collaborators.value.findIndex(c => c.id === userId)
  if (index !== -1) {
    collaborators.value.splice(index, 1)
  }
}

function updateCollaboratorCursor(userId: number, _position: any) {
  // Mettre à jour la position du curseur du collaborateur
  const collaborator = collaborators.value.find(c => c.id === userId)
  if (collaborator) {
    // Logique de mise à jour du curseur (à implémenter)
    console.log('Updating cursor for collaborator:', collaborator.name)
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Watcher pour la capacité d'écriture
watch(() => props.canWrite, (canWrite) => {
  editor.value?.setEditable(canWrite)
})
</script>

<style scoped>
/* Styles TipTap */
:deep(.ProseMirror) {
  outline: none;
  min-height: 250px;
  color: white;
}

:deep(.ProseMirror h1) {
  font-size: 2rem;
  font-weight: bold;
  margin: 1rem 0 0.5rem 0;
  color: white;
}

:deep(.ProseMirror h2) {
  font-size: 1.75rem;
  font-weight: bold;
  margin: 1rem 0 0.5rem 0;
  color: white;
}

:deep(.ProseMirror h3) {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1rem 0 0.5rem 0;
  color: white;
}

:deep(.ProseMirror h4) {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 1rem 0 0.5rem 0;
  color: white;
}

:deep(.ProseMirror p) {
  margin: 0.5rem 0;
  color: white;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  color: white;
}

:deep(.ProseMirror li) {
  margin: 0.25rem 0;
}

:deep(.ProseMirror strong) {
  font-weight: bold;
}

:deep(.ProseMirror em) {
  font-style: italic;
}

:deep(.ProseMirror u) {
  text-decoration: underline;
}

:deep(.ProseMirror s) {
  text-decoration: line-through;
}

/* Curseurs des collaborateurs */
:deep(.collaboration-cursor__caret) {
  border-left: 1px solid #3b82f6;
  border-right: 1px solid #3b82f6;
  margin-left: -1px;
  margin-right: -1px;
  pointer-events: none;
  position: relative;
  word-break: normal;
}

:deep(.collaboration-cursor__label) {
  border-radius: 3px 3px 3px 0;
  color: white;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  left: -1px;
  line-height: normal;
  padding: 0.1rem 0.3rem;
  position: absolute;
  top: -1.4em;
  user-select: none;
  white-space: nowrap;
  background: #3b82f6;
}
</style>
