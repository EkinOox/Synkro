<template>
  <div class="room-page h-full flex flex-col gap-4 p-4" v-if="room">
    <header class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-semibold">{{ room.name }}</h1>
        <span class="px-2 py-0.5 rounded text-xs font-medium" :class="room.locked ? 'bg-red-600/15 text-red-500':'bg-green-600/15 text-green-500'">
          {{ room.locked ? 'Verrouillée' : 'Active' }}
        </span>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <Button size="small" icon="pi pi-palette" label="Whiteboard" @click="openWhiteboard" />
        <Button size="small" icon="pi pi-file" label="Exporter" @click="exportRoom" outlined />
        <Button size="small" icon="pi pi-shield" label="Admin" v-if="isOwner" @click="toggleAdmin" outlined />
      </div>
    </header>

    <div class="flex flex-1 gap-4 min-h-[600px]">
      <aside class="w-64 border rounded p-3 flex flex-col gap-3 bg-white/70 backdrop-blur-sm shadow-sm overflow-y-auto">
        <div class="flex items-center justify-between">
          <h2 class="font-medium">Participants</h2>
          <span class="text-xs opacity-60">{{ room.users.length }}</span>
        </div>
        <ul class="space-y-2">
          <li v-for="u in room.users" :key="u.id" class="flex items-start gap-2 group">
            <span class="w-2 h-2 rounded-full mt-2" :style="{ background:u.color }"></span>
            <div class="flex-1">
              <p class="text-sm font-medium flex items-center gap-1">
                {{ u.name }}
                <span v-if="u.id===room.ownerId" class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600">Owner</span>
                <span v-else-if="u.role==='writer'" class="text-[10px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-600">Write</span>
                <span v-else-if="u.role==='read'" class="text-[10px] px-1 py-0.5 rounded bg-gray-500/20 text-gray-600">Read</span>
              </p>
              <div v-if="isOwner && u.id!==room.ownerId" class="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition">
                <Button size="small" text icon="pi pi-pencil" @click="toggleWrite(u.id)" v-tooltip.top="'Toggle édition'" />
                <Button size="small" text icon="pi pi-ban" @click="banUser(u.id)" v-tooltip.top="'Bannir'" />
              </div>
            </div>
          </li>
        </ul>
        <div v-if="room.bannedUserIds.length" class="pt-2 border-t mt-2">
          <p class="text-xs font-semibold mb-1 flex items-center gap-1"><i class="pi pi-ban" /> Bannis ({{ room.bannedUserIds.length }})</p>
          <div class="space-y-1">
            <div v-for="b in room.bannedUserIds" :key="b" class="flex items-center justify-between text-xs">
              <span class="truncate">{{ b }}</span>
              <Button size="small" text icon="pi pi-undo" @click="unbanUser(b)" />
            </div>
          </div>
        </div>
      </aside>

      <main class="flex-1 flex flex-col gap-4">
        <section class="editor flex-1 border rounded bg-white/70 backdrop-blur-sm p-4 shadow-sm">
          <h2 class="text-sm font-semibold uppercase tracking-wide mb-2 opacity-70">Editeur collaboratif</h2>
          <div class="h-[360px] border rounded bg-white/60 flex items-center justify-center text-sm text-gray-500">
            (Prochainement: intégration Tiptap + Y.js) – Room ID: {{ room.id }}
          </div>
        </section>
        <section class="chat border rounded bg-white/70 backdrop-blur-sm p-4 shadow-sm flex flex-col h-64">
          <h2 class="text-sm font-semibold uppercase tracking-wide mb-2 opacity-70">Chat</h2>
          <div class="flex-1 overflow-y-auto space-y-2 pr-1">
            <div v-for="m in localMessages" :key="m.id" class="text-sm">
              <span class="font-semibold">{{ m.author }}:</span>
              <span class="ml-1">{{ m.content }}</span>
              <span class="ml-2 text-[10px] opacity-50">{{ formatTime(m.createdAt) }}</span>
            </div>
            <div v-if="!localMessages.length" class="text-xs opacity-50">Aucun message</div>
          </div>
          <form @submit.prevent="submitMessage" class="mt-2 flex gap-2">
            <input v-model="draft" placeholder="Votre message..." class="flex-1 px-3 py-2 rounded border text-sm focus:outline-none focus:ring focus:ring-sky-300" />
            <Button size="small" label="Envoyer" type="submit" :disabled="!draft" />
          </form>
        </section>
      </main>
    </div>
  </div>
  <div v-else class="relative w-full max-w-7xl mx-auto px-6 pb-24">
    <div class="relative mb-14">
      <div class="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-emerald-400/30 to-teal-400/30 blur-2xl rounded-3xl"></div>
      <div class="glass-panel p-8 md:p-10 shadow-glass-lg mt-8">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div class="flex-1 space-y-4">
            <h1 class="text-3xl md:text-4xl font-bold gradient-text-brand tracking-tight flex items-center gap-3">
              <i class="pi pi-users text-blue-500 drop-shadow"></i>
              Salles collaboratives
            </h1>
            <p class="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">Crée ou rejoins des espaces de travail temps réel. Filtre par propriété, visibilité ou tri.</p>
          </div>
          <form @submit.prevent="createRoom" class="shrink-0 flex flex-col sm:flex-row gap-4 items-start sm:items-end bg-white/20 dark:bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/50 p-5 shadow-inner">
            <div class="flex flex-col gap-2">
              <label class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nom</label>
              <input v-model="newRoomName" required minlength="3" class="w-60 px-4 py-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-slate-600/50 focus:ring-2 focus:ring-blue-400/50 focus:outline-none text-sm shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="Ex: Daily Standup" />
            </div>
            <div class="flex items-center gap-2 pt-2 sm:pt-0">
              <input type="checkbox" id="private" v-model="newRoomPrivate" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white/70 dark:bg-slate-700/70" />
              <label for="private" class="text-xs font-medium text-slate-600 dark:text-slate-300">Privée</label>
            </div>
            <button type="submit" :disabled="loading" class="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-brand hover:shadow-brand-lg hover:brightness-110 hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="pi pi-plus text-xs"></i>
              Créer
            </button>
          </form>
        </div>
      </div>
    </div>

    <div class="glass-panel mb-12 p-6 md:p-7">
      <div class="flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
        <div class="flex flex-wrap items-center gap-4">
          <span class="section-title mb-0"><i class="pi pi-filter text-blue-500"></i>Filtres</span>
          <div class="flex gap-2">
            <button type="button" @click="showMine=null" :class="['badge-glass', showMine===null ? 'ring-2 ring-blue-400/60 bg-white/40 dark:bg-slate-600/40' : '']">Toutes</button>
            <button type="button" @click="showMine=true" :class="['badge-glass', showMine===true ? 'ring-2 ring-blue-400/60 bg-white/40 dark:bg-slate-600/40' : '']">Mes Salles</button>
            <button type="button" @click="showMine=false" :class="['badge-glass', showMine===false ? 'ring-2 ring-blue-400/60 bg-white/40 dark:bg-slate-600/40' : '']">Autres</button>
          </div>
          <div class="w-px h-6 bg-gradient-to-b from-transparent via-slate-300/60 to-transparent dark:via-slate-600/60"></div>
          <div class="flex gap-2">
            <button type="button" @click="showPrivacy='all'" :class="['badge-glass', showPrivacy==='all' ? 'ring-2 ring-emerald-400/60 bg-white/40 dark:bg-slate-600/40' : '']">Tous types</button>
            <button type="button" @click="showPrivacy='public'" :class="['badge-glass', showPrivacy==='public' ? 'ring-2 ring-emerald-400/60 bg-white/40 dark:bg-slate-600/40' : '']">Publiques</button>
            <button type="button" @click="showPrivacy='private'" :class="['badge-glass', showPrivacy==='private' ? 'ring-2 ring-emerald-400/60 bg-white/40 dark:bg-slate-600/40' : '']">Privées</button>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="section-title mb-0"><i class="pi pi-sort-alt text-emerald-500"></i>Tri</span>
          <div class="flex gap-2">
            <button type="button" @click="sortMode='recent'" :class="['badge-glass', sortMode==='recent' ? 'ring-2 ring-indigo-400/60 bg-white/40 dark:bg-slate-600/40' : '']">Récent</button>
            <button type="button" @click="sortMode='alpha'" :class="['badge-glass', sortMode==='alpha' ? 'ring-2 ring-indigo-400/60 bg-white/40 dark:bg-slate-600/40' : '']">A→Z</button>
          </div>
        </div>
      </div>
      <div class="divider-gradient"></div>
      <div class="flex items-center justify-between text-[11px] tracking-wide font-medium text-slate-500 dark:text-slate-400">
        <span>{{ filteredRooms.length }} salle(s) affichée(s)</span>
        <span class="hidden sm:inline-flex items-center gap-2"><i class="pi pi-lock text-xs"></i><span class="opacity-70">Privée = mot de passe requis</span></span>
      </div>
    </div>

    <div class="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div v-for="r in filteredRooms" :key="r.id" @click="handleJoin(r)" class="group glass-panel glass-panel-hover cursor-pointer p-5 pb-6 flex flex-col">
        <div class="flex items-start justify-between mb-4">
          <h3 class="font-semibold text-base md:text-lg tracking-tight truncate max-w-[70%]" :title="r.name">{{ r.name }}</h3>
          <span :class="['badge-glass !px-2 !py-1', r.password ? 'text-purple-600 dark:text-purple-400 bg-purple-200/30 dark:bg-purple-500/20 border-purple-300/40 dark:border-purple-500/40':'text-emerald-600 dark:text-emerald-400 bg-emerald-200/30 dark:bg-emerald-500/20 border-emerald-300/40 dark:border-emerald-500/40']">{{ r.password ? 'Privée':'Publique' }}</span>
        </div>
        <div class="flex -space-x-2 mb-4">
          <div v-for="u in r.users.slice(0,4)" :key="u.id" class="w-9 h-9 rounded-full border border-white/40 dark:border-slate-700/60 flex items-center justify-center text-[11px] font-semibold shadow-soft backdrop-blur-sm" :style="{ background:u.color }" :title="u.name">{{ u.name.charAt(0) }}</div>
          <div v-if="r.users.length>4" class="w-9 h-9 rounded-full bg-slate-200/70 dark:bg-slate-600/60 border border-white/40 dark:border-slate-700/60 flex items-center justify-center text-[11px] font-semibold text-slate-600 dark:text-slate-200 backdrop-blur-sm">+{{ r.users.length-4 }}</div>
        </div>
        <div class="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-3">
          <span v-if="r.ownerId===currentUserId" class="text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><i class="pi pi-star text-xs"></i>Ma salle</span>
          <span v-else class="opacity-0 group-hover:opacity-80 transition flex items-center gap-1"><i class="pi pi-user text-[10px]"></i>{{ r.users.length }}</span>
          <span>{{ new Date(r.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) }}</span>
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
    <div v-if="!filteredRooms.length" class="text-center text-sm opacity-60 py-16">Aucune salle ne correspond aux filtres.</div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Tooltip from 'primevue/tooltip'
import { useCollaborationRoom } from '../composables/useCollaborationRoom'

const { room, filteredRooms, sortMode, showMine, showPrivacy, currentUserId, loading, initRoom, joinRoom, toggleWrite, banUser, unbanUser } = useCollaborationRoom()

function handleJoin(r:any){
  if(r.password){
    const value = window.prompt('Mot de passe ?') || undefined
    if(value===undefined) return
    joinRoom(r, value)
  } else {
    joinRoom(r)
  }
}

// Création de salle
const newRoomName = ref('Nouvelle salle')
const newRoomPrivate = ref(false)
function createRoom() { initRoom(newRoomName.value, newRoomPrivate.value) }

// Chat local (placeholder avant backend / WS)
interface LocalMessage { id:string; author:string; content:string; createdAt:Date }
const localMessages = ref<LocalMessage[]>([])
const draft = ref('')
function submitMessage() {
  if(!draft.value.trim()) return
  localMessages.value.push({ id: crypto.randomUUID(), author: 'Moi', content: draft.value.trim(), createdAt: new Date() })
  draft.value = ''
}
function formatTime(d:Date) { return d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) }

// Admin / permissions
const isOwner = computed(()=> room.value && room.value.ownerId === currentUserId.value)
function toggleAdmin() { /* future admin panel */ }

// Whiteboard navigation avec room id
function openWhiteboard() { if(room.value) window.history.pushState({},'',`/whiteboard/${room.value.id}`); else window.history.pushState({},'','/whiteboard') }

function exportRoom() { /* placeholder */ alert('Export à venir') }

</script>
<script lang="ts">
export default { directives: { tooltip: Tooltip } }
</script>
<style scoped>
.room-page { animation: fade .3s ease }
@keyframes fade { from { opacity:0; transform: translateY(4px) } to { opacity:1; transform: translateY(0) } }
</style>
