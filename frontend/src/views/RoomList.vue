<template>
  <div class="relative w-full max-w-7xl mx-auto px-6 pb-24">
    <!-- Header avec création de room -->
    <div class="relative mb-14">
      <div class="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-emerald-400/30 to-teal-400/30 blur-2xl rounded-3xl"></div>
      <div class="glass-panel p-8 md:p-10 shadow-glass-lg mt-8">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div class="flex-1 space-y-4">
            <h1 class="text-3xl md:text-4xl font-bold gradient-text-brand tracking-tight flex items-center gap-3">
              <i class="pi pi-users text-blue-500 drop-shadow"></i>
              Salles collaboratives
            </h1>
            <p class="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Créez ou rejoignez des espaces de travail temps réel. Filtrez par propriété, visibilité ou tri.
            </p>
            <div v-if="error" class="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm">
              {{ error }}
            </div>
          </div>
          
          <!-- Formulaire de création -->
          <form @submit.prevent="createRoom" class="shrink-0 flex flex-col sm:flex-row gap-5 items-start sm:items-end bg-white/20 dark:bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/50 p-5 shadow-inner">
            <div class="flex flex-col gap-2">
              <label class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nom</label>
              <input 
                v-model="newRoomName" 
                required 
                minlength="3" 
                class="w-56 sm:w-60 px-4 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-slate-600/50 focus:ring-2 focus:ring-blue-400/50 focus:outline-none text-sm shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                placeholder="Ex: Daily Standup" 
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                Mot de passe 
                <span class="text-[9px] font-normal opacity-60">(optionnel)</span>
              </label>
              <input 
                v-model="newRoomPassword" 
                type="password" 
                maxlength="64" 
                autocomplete="new-password"
                class="w-48 sm:w-56 px-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/40 dark:border-slate-600/50 focus:ring-2 focus:ring-emerald-400/50 focus:outline-none text-sm shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                placeholder="Optionnel" 
              />
            </div>
            <button 
              type="submit" 
              :disabled="loading || !newRoomName.trim()" 
              class="btn-glass-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="pi pi-plus text-xs" v-if="!loading"></i>
              <i class="pi pi-spin pi-spinner text-xs" v-if="loading"></i>
              {{ loading ? 'Création...' : 'Créer' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="glass-panel mb-12 p-6 md:p-7">
      <div class="flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
        <div class="flex flex-wrap items-center gap-4">
          <span class="section-title mb-0"><i class="pi pi-filter text-blue-500"></i>Filtres</span>
          <div class="flex gap-2">
            <button type="button" @click="showMine = null" :class="['badge-glass', showMine === null ? 'ring-2 ring-blue-400/60 bg-white/40 dark:bg-slate-600/40' : '']">Toutes</button>
            <button type="button" @click="showMine = true" :class="['badge-glass', showMine === true ? 'ring-2 ring-blue-400/60 bg-white/40 dark:bg-slate-600/40' : '']">Mes Salles</button>
            <button type="button" @click="showMine = false" :class="['badge-glass', showMine === false ? 'ring-2 ring-blue-400/60 bg-white/40 dark:bg-slate-600/40' : '']">Autres</button>
          </div>
          <div class="w-px h-6 bg-gradient-to-b from-transparent via-slate-300/60 to-transparent dark:via-slate-600/60"></div>
          <div class="flex gap-2">
            <button type="button" @click="showPrivacy = 'all'" :class="['badge-glass', showPrivacy === 'all' ? 'ring-2 ring-emerald-400/60 bg-white/40 dark:bg-slate-600/40' : '']">Tous types</button>
            <button type="button" @click="showPrivacy = 'public'" :class="['badge-glass', showPrivacy === 'public' ? 'ring-2 ring-emerald-400/60 bg-white/40 dark:bg-slate-600/40' : '']">Publiques</button>
            <button type="button" @click="showPrivacy = 'private'" :class="['badge-glass', showPrivacy === 'private' ? 'ring-2 ring-emerald-400/60 bg-white/40 dark:bg-slate-600/40' : '']">Privées</button>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="section-title mb-0"><i class="pi pi-sort-alt text-emerald-500"></i>Tri</span>
          <div class="flex gap-2">
            <button type="button" @click="sortMode = 'recent'" :class="['badge-glass', sortMode === 'recent' ? 'ring-2 ring-indigo-400/60 bg-white/40 dark:bg-slate-600/40' : '']">Récent</button>
            <button type="button" @click="sortMode = 'alpha'" :class="['badge-glass', sortMode === 'alpha' ? 'ring-2 ring-indigo-400/60 bg-white/40 dark:bg-slate-600/40' : '']">A→Z</button>
          </div>
        </div>
      </div>
      <div class="divider-gradient"></div>
      <div class="flex items-center justify-between text-[11px] tracking-wide font-medium text-slate-500 dark:text-slate-400">
        <span>{{ filteredRooms.length }} salle(s) affichée(s)</span>
        <span class="hidden sm:inline-flex items-center gap-2"><i class="pi pi-lock text-xs"></i><span class="opacity-70">Privée = mot de passe requis</span></span>
      </div>
    </div>

    <!-- Liste des rooms -->
    <div v-if="loading && !rooms.length" class="flex items-center justify-center py-20">
      <div class="flex items-center gap-3 text-slate-500 dark:text-slate-400">
        <i class="pi pi-spin pi-spinner text-lg"></i>
        <span class="text-sm">Chargement des salles...</span>
      </div>
    </div>

    <div v-else-if="!rooms.length" class="glass-panel p-8 text-center">
      <div class="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="pi pi-users text-2xl text-slate-400"></i>
      </div>
      <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Aucune salle disponible</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Créez votre première salle collaborative pour commencer</p>
    </div>

    <div v-else class="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <!-- Debug info -->
      <div class="col-span-full text-sm text-gray-600 dark:text-gray-400 mb-4">
        {{ rooms.length }} room(s) trouvée(s) | {{ filteredRooms.length }} filtrée(s)
      </div>
      <div 
        v-for="r in filteredRooms" 
        :key="r.id" 
        @click="navigateToRoom(r.id)"
        class="group glass-panel glass-panel-hover cursor-pointer p-5 pb-6 flex flex-col"
      >
        <div class="flex items-start justify-between mb-4">
          <h3 class="font-semibold text-base md:text-lg tracking-tight truncate max-w-[70%] text-gray-800 dark:text-gray-100" :title="r.name">{{ r.name }}</h3>
          <span :class="r.password ? 'badge-glass-warning' : 'badge-glass-success'">{{ r.password ? 'Privée':'Publique' }}</span>
        </div>
        
        <div class="flex -space-x-2 mb-4">
          <div v-for="u in (r.users || []).slice(0,4)" :key="u.id" class="w-9 h-9 rounded-full border border-white/40 dark:border-slate-700/60 flex items-center justify-center text-[11px] font-semibold shadow-soft backdrop-blur-sm" :style="{ background:u.color }" :title="u.name">{{ u.name.charAt(0) }}</div>
          <div v-if="(r.users || []).length>4" class="w-9 h-9 rounded-full bg-slate-200/70 dark:bg-slate-600/60 border border-white/40 dark:border-slate-700/60 flex items-center justify-center text-[11px] font-semibold text-slate-600 dark:text-slate-200 backdrop-blur-sm">+{{ (r.users || []).length-4 }}</div>
        </div>
        
        <div class="space-y-2 mb-3">
          <div class="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span class="flex items-center gap-1">
              <i class="pi pi-user text-[10px]"></i>
              <span>{{ r.ownerName || 'Créateur inconnu' }}</span>
            </span>
            <span class="flex items-center gap-1">
              <i class="pi pi-clock text-[10px]"></i>
              <span>{{ formatCreatedAt(r.createdAt) }}</span>
            </span>
          </div>
          <div v-if="r.ownerId===currentUserId" class="badge-glass-info">
            <i class="pi pi-star text-xs"></i>
            <span>Votre salle</span>
          </div>
        </div>
        
        <div class="mt-auto flex items-center justify-between">
          <div class="flex items-center gap-2 text-[10px] font-medium text-slate-500 dark:text-slate-400">
            <i class="pi" :class="r.password ? 'pi-lock text-purple-500':'pi-unlock text-emerald-500'"></i>
            <span>{{ r.password ? 'Accès restreint':'Accès direct' }}</span>
          </div>
          <div class="opacity-0 group-hover:opacity-100 transition-transform duration-300 translate-y-1 group-hover:translate-y-0">
            <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold bg-gradient-to-r from-blue-600/80 to-emerald-500/80 text-white shadow-brand">
              <i class="pi pi-sign-in text-[10px]"></i>
              Rejoindre
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="!filteredRooms.length && rooms.length" class="text-center text-sm opacity-60 py-16">
      Aucune salle ne correspond aux filtres.
    </div>

    <!-- Dialog pour mot de passe -->
    <div v-if="passwordDialog" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="glass-panel max-w-md w-full p-6 animate-in fade-in duration-200">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
            <i class="pi pi-lock text-purple-500"></i>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 dark:text-gray-100">Room privée</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Cette room nécessite un mot de passe</p>
          </div>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe
            </label>
            <input 
              v-model="passwordInput"
              type="password"
              placeholder="Entrez le mot de passe"
              autocomplete="current-password"
              @keyup.enter="validatePasswordAndJoin"
              class="w-full glass-input"
              autofocus
            />
          </div>
          
          <div class="flex gap-3 pt-2">
            <button 
              @click="cancelPasswordInput"
              class="flex-1 btn-glass-secondary"
            >
              Annuler
            </button>
            <button 
              @click="validatePasswordAndJoin"
              :disabled="!passwordInput.trim()"
              class="flex-1 btn-glass-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Rejoindre
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import router from '../router'
import { useCollaborationRoom } from '../composables/useCollaborationRoom'

const { 
  rooms, 
  filteredRooms, 
  sortMode, 
  showMine, 
  showPrivacy, 
  currentUserId, 
  loading, 
  error,
  loadRooms,
  initRoom,
  room
} = useCollaborationRoom()

// Création de salle
const newRoomName = ref('')
const newRoomPassword = ref('')

// Gestion du mot de passe pour rejoindre une room privée
const passwordDialog = ref(false)
const passwordInput = ref('')
const targetRoomForPassword = ref<string | null>(null)

async function createRoom() {
  if (!newRoomName.value.trim()) return
  
  try {
    await initRoom(newRoomName.value, newRoomPassword.value || undefined)
    // Utiliser la room courante définie par le composable
    if (room.value) {
      router.push(`/room/${room.value.id}`)
    }
    newRoomName.value = ''
    newRoomPassword.value = ''
  } catch (err) {
    console.error('Erreur lors de la création de la room:', err)
  }
}

// Navigation vers une room
async function navigateToRoom(roomId: string) {
  const targetRoom = rooms.value.find(r => r.id === roomId)
  
  if (!targetRoom) {
    console.error('Room non trouvée')
    return
  }

  // Si la room est privée, ouvrir la boîte de dialogue pour le mot de passe
  if (targetRoom.password) {
    targetRoomForPassword.value = roomId
    passwordDialog.value = true
    return
  }

  // Naviguer vers la room publique
  router.push(`/room/${roomId}`)
}

// Validation du mot de passe et navigation
function validatePasswordAndJoin() {
  if (!targetRoomForPassword.value) return
  
  const targetRoom = rooms.value.find(r => r.id === targetRoomForPassword.value)
  
  if (!targetRoom) {
    console.error('Room non trouvée')
    return
  }
  
  if (passwordInput.value !== targetRoom.password) {
    alert('Mot de passe incorrect !')
    return
  }
  
  // Mot de passe correct, naviguer vers la room
  router.push(`/room/${targetRoomForPassword.value}`)
  
  // Réinitialiser les valeurs
  passwordDialog.value = false
  passwordInput.value = ''
  targetRoomForPassword.value = null
}

// Annuler la saisie du mot de passe
function cancelPasswordInput() {
  passwordDialog.value = false
  passwordInput.value = ''
  targetRoomForPassword.value = null
}

// Formatage de la date
function formatCreatedAt(createdAt: Date | string) {
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'À l\'instant'
  if (minutes < 60) return `Il y a ${minutes}min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`
  
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

// Chargement initial des rooms
onMounted(() => {
  loadRooms()
})
</script>
<style scoped>
.room-page { animation: fade .3s ease }
@keyframes fade { from { opacity:0; transform: translateY(4px) } to { opacity:1; transform: translateY(0) } }
</style>
