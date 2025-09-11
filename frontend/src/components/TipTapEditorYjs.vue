<template>
  <div class="collaborative-editor">
    <!-- Indicateur de connexion -->
    <div v-if="isConnecting" class="bg-blue-500/20 px-4 py-2 text-sm text-blue-100 border-b border-white/10 rounded-t-xl">
      <div class="flex items-center gap-2">
        <div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
        Connexion collaborative en cours...
      </div>
    </div>
    
    <div v-else-if="!isConnected && error" class="bg-red-500/20 px-4 py-2 text-sm text-red-100 border-b border-white/10 rounded-t-xl">
      <div class="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        {{ error }}
      </div>
    </div>
    
    <div v-else-if="isConnected" class="bg-green-500/20 px-4 py-2 text-sm text-green-100 border-b border-white/10 rounded-t-xl">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          Mode collaboratif
        </div>
        <div class="flex items-center gap-2" v-if="collaborators.length > 0">
          <span class="text-xs">{{ collaborators.length }} collaborateur{{ collaborators.length > 1 ? 's' : '' }}</span>
          <div class="flex -space-x-2">
            <div 
              v-for="collaborator in collaborators.slice(0, 3)" 
              :key="collaborator.id"
              :style="{ backgroundColor: collaborator.color }"
              class="w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center text-xs font-medium text-white"
              :title="collaborator.name"
            >
              {{ collaborator.name.charAt(0).toUpperCase() }}
            </div>
            <div 
              v-if="collaborators.length > 3"
              class="w-6 h-6 rounded-full bg-gray-500 border-2 border-white/20 flex items-center justify-center text-xs font-medium text-white"
              :title="`+${collaborators.length - 3} autres`"
            >
              +{{ collaborators.length - 3 }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Barre d'outils -->
    <div class="glass-panel p-4 border-b border-white/20" :class="{ 'rounded-t-xl': !isConnecting && !error && !isConnected }">
      <div class="flex flex-wrap gap-4" v-if="isReady">
        <!-- Formatage -->
        <div class="flex gap-2 border-r border-white/20 pr-4">
          <button
            @click="toggleBold"
            :class="['btn-glass-secondary', { 'btn-glass-primary': isActive('bold') }]"
            title="Gras (Ctrl+B)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
            </svg>
          </button>
          <button
            @click="toggleItalic"
            :class="['btn-glass-secondary', { 'btn-glass-primary': isActive('italic') }]"
            title="Italique (Ctrl+I)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
            </svg>
          </button>
          <button
            @click="toggleUnderline"
            :class="['btn-glass-secondary', { 'btn-glass-primary': isActive('underline') }]"
            title="Soulign� (Ctrl+U)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
            </svg>
          </button>
          <button
            @click="toggleStrike"
            :class="['btn-glass-secondary', { 'btn-glass-primary': isActive('strike') }]"
            title="Barr�"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/>
            </svg>
          </button>
        </div>

        <!-- Titres -->
        <div class="flex gap-2 border-r border-white/20 pr-4">
          <button
            @click="setHeading(1)"
            :class="['btn-glass-secondary', { 'btn-glass-primary': isActive('heading', { level: 1 }) }]"
            title="Titre 1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 4v3h5.5v12h3V7H19V4z"/>
            </svg>
            <span class="text-xs ml-1">1</span>
          </button>
          <button
            @click="setHeading(2)"
            :class="['btn-glass-secondary', { 'btn-glass-primary': isActive('heading', { level: 2 }) }]"
            title="Titre 2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 4v3h5.5v12h3V7H19V4z"/>
            </svg>
            <span class="text-xs ml-1">2</span>
          </button>
        </div>

        <!-- Listes -->
        <div class="flex gap-2 border-r border-white/20 pr-4">
          <button
            @click="toggleBulletList"
            :class="['btn-glass-secondary', { 'btn-glass-primary': isActive('bulletList') }]"
            title="Liste � puces"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
            </svg>
          </button>
          <button
            @click="toggleOrderedList"
            :class="['btn-glass-secondary', { 'btn-glass-primary': isActive('orderedList') }]"
            title="Liste num�rot�e"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
            </svg>
          </button>
        </div>

        <!-- Alignement -->
        <div class="flex gap-2 border-r border-white/20 pr-4">
          <button
            @click="setTextAlign('left')"
            :class="['btn-glass-secondary', { 'btn-glass-primary': isActive('textAlign') }]"
            title="Aligner � gauche"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/>
            </svg>
          </button>
          <button
            @click="setTextAlign('center')"
            :class="['btn-glass-secondary', { 'btn-glass-primary': isActive('textAlign') }]"
            title="Centrer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/>
            </svg>
          </button>
          <button
            @click="setTextAlign('right')"
            :class="['btn-glass-secondary', { 'btn-glass-primary': isActive('textAlign') }]"
            title="Aligner � droite"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/>
            </svg>
          </button>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            @click="undo"
            :disabled="!canUndo()"
            :class="['btn-glass-secondary', { 'opacity-50': !canUndo() }]"
            title="Annuler (Ctrl+Z)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
            </svg>
          </button>
          <button
            @click="redo"
            :disabled="!canRedo()"
            :class="['btn-glass-secondary', { 'opacity-50': !canRedo() }]"
            title="R�tablir (Ctrl+Y)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
            </svg>
          </button>
          <button
            @click="clearContent"
            class="btn-glass-warning"
            title="Effacer tout"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Message de chargement -->
      <div v-else class="flex items-center justify-center py-4 text-white/60">
        <div class="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white/60 mr-3"></div>
        Initialisation de l'�diteur...
      </div>
    </div>

    <!-- �diteur -->
    <div class="glass-panel rounded-b-xl">
      <div 
        ref="editorElement" 
        class="min-h-[400px] p-6 prose prose-invert max-w-none"
        v-show="isReady"
      ></div>
      
      <!-- Chargement -->
      <div 
        v-if="!isReady" 
        class="min-h-[400px] flex items-center justify-center text-white/60"
      >
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white/60 mx-auto mb-4"></div>
          <p>Connexion � l'�diteur collaboratif...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useYjsTipTap } from '../composables/useYjsTipTap'
import { useRoomStatus } from '../composables/useRoomStatus'

interface Props {
  roomId: string
  user: {
    id: string
    name: string
    color?: string
    avatar?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  user: () => ({
    id: 'anonymous',
    name: 'Utilisateur anonyme',
    color: '#3b82f6'
  })
})

// R�f�rence pour l'�l�ment �diteur
const editorElement = ref<HTMLElement>()

// Composable Yjs TipTap
const {
  editor,
  isReady,
  isConnected,
  isConnecting,
  collaborators,
  error,
  // Actions
  initializeEditor,
  destroyEditor,
  // Actions de formatage
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
} = useYjsTipTap(props.roomId, {
  id: props.user.id,
  name: props.user.name,
  color: props.user.color || '#3b82f6',
  avatar: props.user.avatar
})

// Statut de collaboration
const { updateEditorStatus } = useRoomStatus()

// Watcher pour mettre à jour le statut
watch([isConnected, isConnecting, error, collaborators], () => {
  updateEditorStatus(
    isConnected.value,
    isConnecting.value,
    error.value,
    collaborators.value.length
  )
}, { immediate: true })

// Monter l'éditeur dans l'élément DOM
onMounted(async () => {
  // Attendre que l'élément soit disponible
  if (editorElement.value) {
    // Initialiser l'éditeur avec l'élément DOM
    await initializeEditor(editorElement.value)
  }
})

onUnmounted(() => {
  // Le nettoyage est g�r� par le composable
})

// Exposer l'�diteur pour l'acc�s parent
defineExpose({
  editor,
  isReady,
  isConnected,
  getContent: () => editor.value?.getHTML() || '',
  setContent: (content: string) => editor.value?.commands.setContent(content)
})
</script>

<style scoped>
/* Styles pour l'�diteur collaboratif */
.collaborative-editor {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Styles pour les curseurs collaboratifs */
:deep(.collaboration-cursor__caret) {
  position: relative;
}

:deep(.collaboration-cursor__label) {
  position: absolute;
  top: -1.4em;
  left: -1px;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  user-select: none;
  color: inherit;
  padding: 0.1rem 0.3rem;
  border-radius: 3px 3px 3px 0;
  white-space: nowrap;
}

/* Am�liorer la lisibilit� du contenu */
:deep(.ProseMirror) {
  outline: none;
  color: white;
}

:deep(.ProseMirror h1) {
  font-size: 1.875rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

:deep(.ProseMirror h2) {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.75rem;
}

:deep(.ProseMirror p) {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
}

:deep(.ProseMirror ul) {
  list-style-type: disc;
  padding-left: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
}

:deep(.ProseMirror ol) {
  list-style-type: decimal;
  padding-left: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
}

:deep(.ProseMirror strong) {
  font-weight: 700;
  color: white;
}

:deep(.ProseMirror em) {
  font-style: italic;
  color: white;
}

:deep(.ProseMirror u) {
  text-decoration: underline;
  color: white;
}

:deep(.ProseMirror s) {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.7);
}
</style>
