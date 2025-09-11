<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 relative overflow-hidden">
    <!-- Effets glassmorphism en fond -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
    </div>

    <div class="max-w-7xl mx-auto py-10 px-4 relative z-10">
      <!-- État de chargement -->
      <div v-if="!room" class="flex items-center justify-center min-h-[400px]">
        <div class="text-center">
          <i class="pi pi-spin pi-spinner text-4xl text-blue-500 mb-4"></i>
          <p class="text-lg text-gray-600 dark:text-gray-400">Chargement de la room...</p>
        </div>
      </div>

      <!-- Contenu de la room -->
      <div v-else class="flex flex-col md:flex-row gap-8">
        <!-- Panel participants -->
        <aside class="w-full md:w-1/4 glass-sidebar">
          <h2 class="room-title">
            <i class="pi pi-users text-brand-500"></i> Participants
            <span class="text-sm font-normal text-gray-500 ml-2">
              ({{ realTimeParticipants.onlineCount }} en ligne)
            </span>
          </h2>

          <!-- Participants en ligne -->
          <div class="space-y-3 mb-6">
            <div v-if="realTimeParticipants.onlineCount === 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
              <i class="pi pi-users text-2xl mb-2"></i>
              <p class="text-sm">Aucun participant en ligne</p>
            </div>
            
            <div v-for="participant in realTimeParticipants.participants.filter(p => p.isOnline)" 
                 :key="participant.id" 
                 class="participant-card p-3 rounded-lg bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm border border-white/30 dark:border-gray-700/40 hover:bg-white/30 dark:hover:bg-gray-700/40 transition-all">
              
              <!-- Info principale du participant -->
              <div class="flex items-center gap-3 mb-2">
                <div class="relative">
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
                    :style="{ backgroundColor: participant.color }"
                  >
                    <img v-if="participant.avatar" :src="participant.avatar" :alt="participant.name" class="w-full h-full rounded-full object-cover" />
                    <span v-else>{{ participant.name.charAt(0).toUpperCase() }}</span>
                  </div>
                  <!-- Indicateur en ligne -->
                  <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-gray-700 dark:text-gray-200 truncate">{{ participant.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    Actif {{ formatLastSeen(participant.lastSeen) }}
                  </div>
                </div>
              </div>

              <!-- Activités du participant -->
              <div class="flex flex-wrap gap-1">
                <span v-if="participant.activities.editor" 
                      class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full">
                  <i class="pi pi-pencil"></i> Éditeur
                </span>
                <span v-if="participant.activities.chat" 
                      class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-500/20 text-green-600 dark:text-green-400 rounded-full">
                  <i class="pi pi-comments"></i> Chat
                </span>
                <span v-if="participant.activities.whiteboard" 
                      class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full">
                  <i class="pi pi-palette"></i> Tableau
                </span>
                <span v-if="participant.activities.call" 
                      class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-500/20 text-red-600 dark:text-red-400 rounded-full">
                  <i class="pi pi-video"></i> Appel
                </span>
                <span v-if="participant.activities.comments" 
                      class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full">
                  <i class="pi pi-comment"></i> Commentaires
                </span>
              </div>
            </div>
          </div>

          <!-- Participants hors ligne (repliable) -->
          <div v-if="realTimeParticipants.participants.filter(p => !p.isOnline).length > 0" class="border-t border-gray-300/30 dark:border-gray-600/30 pt-4">
            <button 
              @click="showOfflineParticipants = !showOfflineParticipants"
              class="flex items-center justify-between w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mb-3"
            >
              <span>Participants récents ({{ realTimeParticipants.participants.filter(p => !p.isOnline).length }})</span>
              <i :class="showOfflineParticipants ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
            </button>

            <Transition name="slide-down">
              <div v-if="showOfflineParticipants" class="space-y-2">
                <div v-for="participant in realTimeParticipants.participants.filter(p => !p.isOnline)" 
                     :key="participant.id" 
                     class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-700/20 transition-all opacity-60">
                  <div 
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-xs"
                    :style="{ backgroundColor: participant.color }"
                  >
                    <img v-if="participant.avatar" :src="participant.avatar" :alt="participant.name" class="w-full h-full rounded-full object-cover" />
                    <span v-else>{{ participant.name.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm text-gray-600 dark:text-gray-300 truncate">{{ participant.name }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      Vu {{ formatLastSeen(participant.lastSeen) }}
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Ancienne section participants (admin) -->
          <div v-if="participants.length > 0" class="border-t border-gray-300/30 dark:border-gray-600/30 pt-6 mt-6">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <i class="pi pi-cog"></i> Administration
            </h3>
            <div class="flex flex-col gap-3">
              <div v-for="user in participants" :key="user.id" class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all participant-item">
                <Avatar :image="user.avatar" shape="circle" size="large" />
                <div class="flex-1">
                  <span class="font-medium text-gray-700 dark:text-gray-200 block">{{ user.name }}</span>
                  <div class="flex items-center gap-2">
                    <Badge v-if="user.isAdmin" value="Admin" severity="info" size="small" />
                    <Badge v-if="!user.canWrite" value="Muet" severity="warning" size="small" />
                  </div>
                </div>
                <div class="ml-auto flex gap-1">
                  <button v-if="isAdmin && !user.isAdmin && user.canWrite" class="btn-glass-warning !px-2 !py-1.5" @click="muteUser(user.id)" v-tooltip.top="'Interdire d\'écrire'">
                    <i class="pi pi-eye-slash text-xs"></i>
                  </button>
                  <button v-if="isAdmin && !user.isAdmin && !user.canWrite" class="btn-glass-success !px-2 !py-1.5" @click="user.canWrite = true" v-tooltip.top="'Autoriser à écrire'">
                    <i class="pi pi-eye text-xs"></i>
                  </button>
                  <button v-if="isAdmin && !user.isAdmin" class="btn-glass-danger !px-2 !py-1.5" @click="banUser(user.id)" v-tooltip.top="'Exclure'">
                    <i class="pi pi-ban text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Liste noire -->
          <div v-if="isAdmin && blacklist.length" class="mt-6 p-4 bg-red-500/10 dark:bg-red-900/20 rounded-xl border border-red-300/30 dark:border-red-700/40 backdrop-blur-sm">
            <h3 class="text-sm font-semibold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
              <i class="pi pi-ban"></i> Liste noire
            </h3>
            <div class="space-y-2">
              <div v-for="user in blacklist" :key="user.id" class="flex items-center justify-between text-sm">
                <span class="text-red-600 dark:text-red-400">{{ user.name }}</span>
                <button class="btn-glass-success !px-2 !py-1" @click="unbanUser(user.id)" v-tooltip.top="'Réintégrer'">
                  <i class="pi pi-times text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Panel principal -->
        <main class="flex-1 flex flex-col gap-8">
          <!-- Indicateur de statut de collaboration -->
          <div class="fixed top-4 right-4 z-50">
            <CollaborationStatusIndicator />
          </div>

          <!-- Header room -->
          <div class="glass-section">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h1 class="text-3xl font-bold bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent mb-2">
                  {{ room?.name || 'Room collaborative' }}
                </h1>
                <p class="text-gray-600 dark:text-gray-400">
                  Espace de travail partagé et interactif avec tous les outils collaboratifs.
                </p>
                <div class="flex items-center gap-2 mt-3">
                  <span 
                    :class="room?.password ? 'badge-glass-warning' : 'badge-glass-success'"
                  >
                    {{ room?.password ? 'Privée' : 'Publique' }}
                  </span>
                  <span 
                    v-if="isAdmin" 
                    class="badge-glass-info"
                  >
                    Administrateur
                  </span>
                </div>
              </div>
              <div class="flex gap-3">
                <button class="btn-glass-secondary" @click="exportRoom('pdf')">
                  <i class="pi pi-file-pdf"></i>
                  PDF
                </button>
                <button class="btn-glass-secondary" @click="exportRoom('odt')">
                  <i class="pi pi-file"></i>
                  ODT
                </button>
                <button class="btn-glass-primary" @click="importRoom">
                  <i class="pi pi-upload"></i>
                  Importer
                </button>
                <button v-if="isAdmin" class="btn-glass-danger" @click="deleteRoom">
                  <i class="pi pi-trash"></i>
                  Supprimer
                </button>
              </div>
            </div>
          </div>

          <!-- Appel audio/vidéo -->
          <section class="glass-section">
            <h2 class="room-subtitle">
              <i class="pi pi-video text-brand-500"></i> Réunion audio/vidéo
            </h2>
            <RoomCallYjs :room-id="room?.id || '1'" :user="collaborationUser" :participants="participants" />
          </section>

          <!-- Tableau collaboratif TipTap -->
          <section class="glass-section">
            <h2 class="room-subtitle">
              <i class="pi pi-pencil text-brand-500"></i> Tableau collaboratif
            </h2>
            <TipTapEditorYjs 
              :room-id="room?.id || '1'" 
              :user="collaborationUser" 
            />
          </section>

          <!-- Commentaires / Post-its -->
          <section class="glass-section">
            <h2 class="room-subtitle">
              <i class="pi pi-comment text-brand-500"></i> Commentaires & Post-its
            </h2>
            <CommentBoardYjs 
              :room-id="room?.id || '1'" 
              :user="collaborationUser" 
              :can-write="canWrite" 
            />
          </section>

          <!-- WhiteBoard -->
          <section class="glass-section">
            <div class="flex items-center justify-between mb-4">
              <h2 class="room-subtitle !mb-0">
                <i class="pi pi-palette text-brand-500"></i> WhiteBoard collaboratif
              </h2>
              <button class="btn-glass-primary" @click="openWhiteboard">
                <i class="pi pi-external-link"></i>
                Plein écran
              </button>
            </div>
            <RoomWhiteboardYjs :room-id="room?.id || '1'" :user="collaborationUser" />
          </section>

          <!-- Chat de la room -->
          <section class="glass-section">
            <h2 class="room-subtitle">
              <i class="pi pi-comments text-brand-500"></i> Chat de la room
            </h2>
            <RoomChatYjs :room-id="room?.id || '1'" :user="collaborationUser" :can-write="canWrite" />
          </section>
        </main>
      </div>
    </div>

    <!-- Dialogs -->
    <!-- Dialog de suppression -->
    <Dialog 
      v-model:visible="showDeleteDialog" 
      modal 
      header="Supprimer la room" 
      :style="{ width: '450px' }"
    >
      <div class="flex align-items-center gap-3 mb-3">
        <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem"></i>
        <span>Êtes-vous sûr de vouloir supprimer définitivement cette room ? Cette action est irréversible.</span>
      </div>
      <template #footer>
        <div class="flex gap-3">
          <button class="btn-glass-secondary" @click="showDeleteDialog = false">
            <i class="pi pi-times"></i>
            Annuler
          </button>
          <button class="btn-glass-danger" @click="confirmDeleteRoom">
            <i class="pi pi-trash"></i>
            Supprimer
          </button>
        </div>
      </template>
    </Dialog>

    <!-- Dialog d'import -->
    <Dialog 
      v-model:visible="showImportDialog" 
      modal 
      header="Importer des fichiers" 
      :style="{ width: '500px' }"
    >
      <FileUpload
        mode="basic"
        accept=".pdf,.odt,.docx,.txt"
        :maxFileSize="10000000"
        :auto="true"
        @select="onFileSelect"
        chooseLabel="Choisir des fichiers"
        class="w-full"
      />
      <small class="text-gray-500">Formats supportés: PDF, ODT, DOCX, TXT (max 10Mo)</small>
      <template #footer>
        <button class="btn-glass-secondary" @click="showImportDialog = false">
          <i class="pi pi-times"></i>
          Fermer
        </button>
      </template>
    </Dialog>

    <!-- Toast pour les notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import FileUpload from 'primevue/fileupload'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

// Composants custom
import TipTapEditorYjs from '../components/TipTapEditorYjs.vue'
import CommentBoardYjs from '../components/CommentBoardYjs.vue'
import RoomWhiteboardYjs from '../components/RoomWhiteboardYjs.vue'
import RoomChatYjs from '../components/RoomChatYjs.vue'
import RoomCallYjs from '../components/RoomCallYjs.vue'
import CollaborationStatusIndicator from '../components/CollaborationStatusIndicator.vue'

// Composable pour l'authentification et la collaboration
import { useCollaborationRoom } from '../composables/useCollaborationRoom'
import { useCollaborationUser } from '../composables/useCollaborationUser'
import { useRoomParticipants } from '../composables/useRoomParticipants'

// Props pour recevoir l'ID de la room
interface Props {
  id?: string
}

const props = defineProps<Props>()
const toast = useToast()

// Utiliser le composable pour la gestion des rooms
const { room, currentUserId, loadRoomById } = useCollaborationRoom()

// Utiliser l'utilisateur pour la collaboration
const { user: collaborationUser } = useCollaborationUser()

// Utiliser les participants en temps réel
const { roomParticipants: realTimeParticipants } = useRoomParticipants(room.value?.id || props.id || '1')

// État pour l'affichage des participants hors ligne
const showOfflineParticipants = ref(false)

// Fonction pour formater le temps depuis la dernière activité
function formatLastSeen(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 5) return 'à l\'instant'
  if (seconds < 60) return `il y a ${seconds}s`
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)}h`
  return `il y a ${Math.floor(seconds / 86400)}j`
}

// Charger la room au montage et quand l'ID change
onMounted(() => {
  if (props.id) {
    loadRoomById(props.id)
  }
})

watch(() => props.id, (newId) => {
  if (newId) {
    loadRoomById(newId)
  }
})

// Adapter les participants pour la compatibilité avec le template existant
const participants = computed(() => {
  if (!room.value || !room.value.users || !Array.isArray(room.value.users)) return []
  return room.value.users.map(user => ({
    id: parseInt(user.id) || Date.now(),
    name: user.name,
    avatar: `/avatars/${user.name.toLowerCase()}.png`,
    isAdmin: user.role === 'owner',
    canWrite: user.role === 'owner' || user.role === 'writer'
  }))
})

const blacklist = computed(() => {
  if (!room.value || !room.value.bannedUserIds || !Array.isArray(room.value.bannedUserIds)) return []
  return room.value.bannedUserIds.map(userId => ({
    id: parseInt(userId) || Date.now(),
    name: `Utilisateur-${userId}`,
    avatar: `/avatars/banned.png`,
    isAdmin: false,
    canWrite: false
  }))
})

const showDeleteDialog = ref(false)
const showImportDialog = ref(false)

const isAdmin = computed(() => {
  if (!room.value) return false
  return room.value.ownerId === currentUserId.value
})

const canWrite = computed(() => {
  if (!room.value) return false
  const currentUser = room.value.users.find(u => u.id === currentUserId.value)
  return currentUser?.role === 'owner' || currentUser?.role === 'writer'
})

// Gestion des participants
function banUser(userId: number) {
  const userIndex = participants.value.findIndex(p => p.id === userId)
  if (userIndex !== -1) {
    const user = participants.value[userIndex]
    participants.value.splice(userIndex, 1)
    blacklist.value.push(user)
    
    toast.add({
      severity: 'warn',
      summary: 'Utilisateur exclu',
      detail: `${user.name} a été exclu de la room`,
      life: 3000
    })
  }
}

function muteUser(userId: number) {
  const user = participants.value.find(p => p.id === userId)
  if (user) {
    user.canWrite = false
    toast.add({
      severity: 'info',
      summary: 'Utilisateur muet',
      detail: `${user.name} ne peut plus écrire`,
      life: 3000
    })
  }
}

function unbanUser(userId: number) {
  const userIndex = blacklist.value.findIndex(p => p.id === userId)
  if (userIndex !== -1) {
    const user = blacklist.value[userIndex]
    blacklist.value.splice(userIndex, 1)
    user.canWrite = true
    participants.value.push(user)
    
    toast.add({
      severity: 'success',
      summary: 'Utilisateur réintégré',
      detail: `${user.name} peut à nouveau participer`,
      life: 3000
    })
  }
}

// Export et import
async function exportRoom(type: 'pdf' | 'odt') {
  if (!room.value) {
    toast.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Aucune room sélectionnée',
      life: 3000
    })
    return
  }

  try {
    toast.add({
      severity: 'info',
      summary: 'Export en cours',
      detail: `Génération du fichier ${type.toUpperCase()}...`,
      life: 3000
    })

    // Simuler l'export (ici vous intégreriez une vraie API)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Créer un lien de téléchargement
    const link = document.createElement('a')
    link.href = '#'
    link.download = `room-${room.value.id}.${type}`
    link.click()

    toast.add({
      severity: 'success',
      summary: 'Export réussi',
      detail: `Le fichier ${type.toUpperCase()} a été téléchargé`,
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erreur d\'export',
      detail: 'Impossible d\'exporter la room',
      life: 3000
    })
  }
}

function importRoom() {
  showImportDialog.value = true
}

function onFileSelect(event: any) {
  const files = event.files
  if (files && files.length > 0) {
    toast.add({
      severity: 'success',
      summary: 'Import réussi',
      detail: `${files.length} fichier(s) importé(s)`,
      life: 3000
    })
    showImportDialog.value = false
  }
}

function deleteRoom() {
  showDeleteDialog.value = true
}

function confirmDeleteRoom() {
  toast.add({
    severity: 'error',
    summary: 'Room supprimée',
    detail: 'La room a été définitivement supprimée',
    life: 3000
  })
  showDeleteDialog.value = false
  // Rediriger vers la liste des rooms
  // router.push('/roomList')
}

function openWhiteboard() {
  // Ouvrir le whiteboard dans un nouvel onglet
  if (room.value) {
    window.open(`/whiteboard/${room.value.id}`, '_blank')
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Aucune room sélectionnée',
      life: 3000
    })
  }
}
</script>

<style scoped>
/* Effet glassmorphism pour les sections */
.room-section {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.room-section:hover {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.dark .room-section:hover {
  background: rgba(17, 24, 39, 0.7);
  border-color: rgba(75, 85, 99, 0.4);
}

/* Animation pour les participants */
.participant-item {
  animation: slideInLeft 0.3s ease-out;
  transition: all 0.2s ease;
}

.participant-item:hover {
  transform: translateX(5px);
  background: rgba(255, 255, 255, 0.5) !important;
}

.dark .participant-item:hover {
  background: rgba(55, 65, 81, 0.5) !important;
}

.participant-card {
  animation: slideInUp 0.3s ease-out;
  transition: all 0.3s ease;
}

.participant-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Transitions pour les sections repliables */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Couleurs brand personnalisées */
.text-brand-500 {
  color: #3b82f6;
}

.text-brand-700 {
  color: #1d4ed8;
}

.text-brand-400 {
  color: #60a5fa;
}

/* Animation des bulles de fond */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .room-section {
    margin: 0 -1rem;
    border-radius: 1rem;
  }
  
  .participant-item {
    padding: 1rem;
  }
  
  .max-w-7xl {
    padding: 1rem;
  }

  .flex-col.md\\:flex-row {
    gap: 1rem;
  }
}

/* Scrollbar personnalisée */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.7);
}
</style>
