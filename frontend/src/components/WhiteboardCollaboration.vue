<template>
  <div class="collaboration-panel">
    <!-- Indicateur de connexion -->
    <div class="connection-status mb-4 p-3 rounded-xl" :class="connectionStatusClass">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full" :class="statusDotClass"></div>
        <span class="text-sm font-medium">{{ connectionStatusText }}</span>
        <Button
          v-if="!isConnected"
          @click="reconnect"
          class="!p-1 !w-6 !h-6 ml-auto"
          severity="secondary"
          text
          size="small"
        >
          <i class="pi pi-refresh text-xs"></i>
        </Button>
      </div>
    </div>

    <!-- Liste des collaborateurs -->
    <div class="collaborators-list">
      <h4 class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
        <i class="pi pi-users text-blue-500"></i>
        Collaborateurs ({{ collaborators.length }})
      </h4>

      <div class="space-y-2 mb-4">
        <div
          v-for="collaborator in collaborators"
          :key="collaborator.id"
          class="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <!-- Avatar avec couleur personnalisée -->
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            :style="{ backgroundColor: collaborator.color }"
          >
            {{ collaborator.name.charAt(0).toUpperCase() }}
          </div>

          <!-- Informations du collaborateur -->
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
                {{ collaborator.name }}
              </span>
              <span v-if="collaborator.id === currentUserId" class="text-xs text-blue-500 font-medium">
                (Vous)
              </span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <i :class="collaborator.isActive ? 'pi pi-circle-fill text-green-500' : 'pi pi-circle text-gray-400'"></i>
              <span>{{ collaborator.isActive ? 'Actif' : 'Inactif' }}</span>
              <span v-if="collaborator.currentTool" class="ml-2">
                • {{ getToolName(collaborator.currentTool) }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-1">
            <Button
              v-if="collaborator.id !== currentUserId"
              @click="followUser(collaborator.id)"
              :class="{ '!text-blue-500': followingUserId === collaborator.id }"
              class="!p-1 !w-6 !h-6"
              severity="secondary"
              text
              size="small"
              v-tooltip="'Suivre cet utilisateur'"
            >
              <i class="pi pi-eye text-xs"></i>
            </Button>
          </div>
        </div>
      </div>

      <!-- Inviter des collaborateurs -->
      <div class="invite-section p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div class="flex items-center gap-2 mb-2">
          <i class="pi pi-share-alt text-blue-500"></i>
          <span class="text-sm font-medium text-blue-800 dark:text-blue-300">
            Partager le tableau
          </span>
        </div>

        <div class="flex gap-2 mb-2">
          <InputText
            ref="inviteLink"
            v-model="shareLink"
            readonly
            class="flex-1 !text-xs"
            placeholder="Lien de partage"
            size="small"
          />
          <Button
            @click="copyShareLink"
            class="!px-2 !py-1"
            severity="secondary"
            outlined
            size="small"
          >
            <i class="pi pi-copy text-xs"></i>
          </Button>
        </div>

        <div class="flex gap-2">
          <Button
            @click="shareByEmail"
            class="flex-1 !py-1 !text-xs"
            severity="secondary"
            outlined
            size="small"
          >
            <i class="pi pi-envelope mr-1"></i>
            Email
          </Button>
          <Button
            @click="generateQRCode"
            class="flex-1 !py-1 !text-xs"
            severity="secondary"
            outlined
            size="small"
          >
            <i class="pi pi-qrcode mr-1"></i>
            QR Code
          </Button>
        </div>
      </div>

      <!-- Curseurs des autres utilisateurs -->
      <div
        v-for="cursor in otherCursors"
        :key="cursor.userId"
        class="absolute pointer-events-none z-50 transition-all duration-100"
        :style="{
          left: cursor.x + 'px',
          top: cursor.y + 'px',
          transform: 'translate(-2px, -2px)'
        }"
      >
        <!-- Curseur -->
        <div class="relative">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path
              d="M0 0L16 6L6 8L4 16L0 0Z"
              :fill="cursor.color"
              stroke="white"
              stroke-width="1"
            />
          </svg>

          <!-- Nom de l'utilisateur -->
          <div
            class="absolute top-4 left-4 px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap shadow-lg"
            :style="{ backgroundColor: cursor.color }"
          >
            {{ cursor.userName }}
          </div>
        </div>
      </div>
    </div>

    <!-- Modal QR Code -->
    <Dialog
      v-model:visible="showQRModal"
      modal
      header="Partager via QR Code"
      :style="{ width: '400px' }"
    >
      <div class="flex flex-col items-center gap-4">
        <div ref="qrCodeContainer" class="bg-white p-4 rounded-lg"></div>
        <p class="text-sm text-gray-600 text-center">
          Scannez ce QR Code pour accéder au tableau partagé
        </p>
        <Button
          @click="downloadQRCode"
          class="w-full"
          severity="secondary"
          outlined
        >
          <i class="pi pi-download mr-2"></i>
          Télécharger le QR Code
        </Button>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'

// Interfaces
interface Collaborator {
  id: string
  name: string
  color: string
  isActive: boolean
  currentTool?: string
  lastSeen: Date
}

interface Cursor {
  userId: string
  userName: string
  color: string
  x: number
  y: number
}

// Props et émissions
const emit = defineEmits(['followUser', 'cursorMove'])

// État de la connexion
const isConnected = ref(false)
const connectionError = ref<string | null>(null)
const reconnectAttempts = ref(0)

// Collaborateurs et curseurs
const collaborators = ref<Collaborator[]>([
  {
    id: 'current-user',
    name: 'Vous',
    color: '#3B82F6',
    isActive: true,
    currentTool: 'pen',
    lastSeen: new Date()
  }
])

const otherCursors = ref<Cursor[]>([])
const currentUserId = ref('current-user')
const followingUserId = ref<string | null>(null)

// Partage et invitation
const shareLink = ref(`${window.location.origin}/whiteboard/shared/${Date.now()}`)
const showQRModal = ref(false)
const qrCodeContainer = ref<HTMLDivElement>()
const inviteLink = ref<HTMLInputElement>()

// États calculés
const connectionStatusClass = computed(() => {
  if (isConnected.value) {
    return 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
  } else if (connectionError.value) {
    return 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
  } else {
    return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
  }
})

const statusDotClass = computed(() => {
  if (isConnected.value) return 'bg-green-500'
  if (connectionError.value) return 'bg-red-500'
  return 'bg-yellow-500'
})

const connectionStatusText = computed(() => {
  if (isConnected.value) return 'Connecté'
  if (connectionError.value) return 'Erreur de connexion'
  return 'Connexion...'
})

// Méthodes de collaboration
const followUser = (userId: string) => {
  if (followingUserId.value === userId) {
    followingUserId.value = null
  } else {
    followingUserId.value = userId
    emit('followUser', userId)
  }
}

const getToolName = (tool: string): string => {
  const toolNames: Record<string, string> = {
    'pen': 'Pinceau',
    'rectangle': 'Rectangle',
    'circle': 'Cercle',
    'arrow': 'Flèche',
    'line': 'Ligne',
    'text': 'Texte',
    'eraser': 'Gomme',
    'select': 'Sélection'
  }
  return toolNames[tool] || tool
}

// Méthodes de partage
const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value)
    // Afficher un toast de succès
    console.log('Lien copié dans le presse-papier')
  } catch (error) {
    console.error('Erreur lors de la copie:', error)
    // Fallback pour les navigateurs plus anciens
    inviteLink.value?.select()
    document.execCommand('copy')
  }
}

const shareByEmail = () => {
  const subject = encodeURIComponent('Rejoignez-moi sur Synkro Whiteboard')
  const body = encodeURIComponent(
    `Bonjour,\n\nJe vous invite à collaborer sur mon tableau blanc Synkro.\n\nCliquez sur ce lien pour nous rejoindre: ${shareLink.value}\n\nÀ bientôt !`
  )
  const mailtoLink = `mailto:?subject=${subject}&body=${body}`
  window.open(mailtoLink)
}

const generateQRCode = () => {
  showQRModal.value = true
  // Ici on utiliserait une bibliothèque QR Code comme qrcode.js
  // Pour la démo, on simule la génération
  setTimeout(() => {
    if (qrCodeContainer.value) {
      qrCodeContainer.value.innerHTML = `
        <div class="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-lg">
          <span class="text-gray-500 text-sm text-center">
            QR Code<br/>
            (Demo)
          </span>
        </div>
      `
    }
  }, 100)
}

const downloadQRCode = () => {
  // Logique pour télécharger le QR Code
  console.log('Téléchargement du QR Code...')
}

// Gestion de la connexion
const reconnect = () => {
  reconnectAttempts.value++
  connectionError.value = null
  isConnected.value = false

  // Simuler une reconnexion
  setTimeout(() => {
    isConnected.value = true
  }, 2000)
}

// Gestion des curseurs
const updateCursorPosition = (x: number, y: number) => {
  emit('cursorMove', { x, y, userId: currentUserId.value })
}

// Ajouter un nouveau collaborateur
const addCollaborator = (collaborator: Collaborator) => {
  const existingIndex = collaborators.value.findIndex(c => c.id === collaborator.id)
  if (existingIndex > -1) {
    collaborators.value[existingIndex] = collaborator
  } else {
    collaborators.value.push(collaborator)
  }
}

// Supprimer un collaborateur
const removeCollaborator = (userId: string) => {
  const index = collaborators.value.findIndex(c => c.id === userId)
  if (index > -1) {
    collaborators.value.splice(index, 1)
  }

  // Supprimer aussi son curseur
  const cursorIndex = otherCursors.value.findIndex(c => c.userId === userId)
  if (cursorIndex > -1) {
    otherCursors.value.splice(cursorIndex, 1)
  }
}

// Mettre à jour la position du curseur d'un autre utilisateur
const updateOtherCursor = (cursor: Cursor) => {
  const existingIndex = otherCursors.value.findIndex(c => c.userId === cursor.userId)
  if (existingIndex > -1) {
    otherCursors.value[existingIndex] = cursor
  } else {
    otherCursors.value.push(cursor)
  }
}

// Initialiser la connexion
onMounted(() => {
  // Simuler la connexion après 1 seconde
  setTimeout(() => {
    isConnected.value = true
  }, 1000)
})

// Nettoyer les ressources
onUnmounted(() => {
  // Fermer les connexions WebSocket, etc.
})

// Exposer les méthodes pour le composant parent
defineExpose({
  addCollaborator,
  removeCollaborator,
  updateOtherCursor,
  updateCursorPosition
})
</script>

<style scoped>
.collaboration-panel {
  position: fixed;
  top: 4rem;
  left: 4rem;
  width: 320px;
  max-height: calc(100vh - 8rem);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  z-index: 40;
  overflow-y: auto;
}

.dark .collaboration-panel {
  background: rgba(31, 41, 55, 0.9);
  border-color: rgba(107, 114, 128, 0.3);
}

/* Scrollbar styling */
.collaboration-panel::-webkit-scrollbar {
  width: 6px;
}

.collaboration-panel::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.collaboration-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.collaboration-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>
