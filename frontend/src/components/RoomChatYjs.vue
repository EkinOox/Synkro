<template>
  <div class="flex flex-col h-80">
    <!-- état de connexion -->
    <div v-if="!isConnected" class="flex items-center justify-center py-4 text-white/60">
      <div class="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white/60 mr-2"></div>
      <span class="text-sm">{{ isConnecting ? 'Connexion au chat...' : 'Chat déconnecté' }}</span>
    </div>

    <!-- Messages -->
    <div v-else>
      <div ref="messagesContainer" class="flex-1 overflow-y-auto mb-4 space-y-3 pr-2" style="max-height: 240px;">
        <div 
          v-for="message in messages" 
          :key="message.id"
          :class="[
            'flex',
            message.userId === user.id ? 'justify-end' : 'justify-start'
          ]"
        >
          <div 
            v-if="message.type === 'system'"
            class="w-full text-center"
          >
            <div class="inline-block px-3 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
              {{ message.content }}
            </div>
          </div>
          <div 
            v-else
            :class="[
              'max-w-xs px-4 py-2 rounded-2xl shadow-sm',
              message.userId === user.id 
                ? 'bg-brand-500 text-white rounded-br-sm' 
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
            ]"
          >
            <div v-if="message.userId !== user.id" class="text-xs font-semibold mb-1 text-brand-600 dark:text-brand-400">
              {{ message.userName }}
            </div>
            <div class="text-sm">{{ message.content }}</div>
            <div 
              :class="[
                'text-xs mt-1',
                message.userId === user.id ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
              ]"
            >
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
        </div>

        <!-- Indicateur de frappe -->
        <div v-if="typingUsers.length > 0" class="flex justify-start">
          <div class="max-w-xs px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-2xl rounded-bl-sm">
            <div class="text-xs">
              {{ typingUsers.join(', ') }} {{ typingUsers.length === 1 ? 'est en train d\'écrire' : 'sont en train d\'écrire' }}...
            </div>
            <div class="flex gap-1 mt-1">
              <div class="w-2 h-2 bg-current rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 0.1s;"></div>
              <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input message -->
      <div class="flex gap-2 mt-auto">
        <InputText
          v-model="newMessage"
          placeholder="Tapez votre message..."
          class="flex-1"
          @keyup.enter="handleSendMessage"
          @input="handleTyping"
          :disabled="!canWrite || !isConnected"
        />
        <Button 
          icon="pi pi-send" 
          @click="handleSendMessage"
          :disabled="!newMessage.trim() || !canWrite || !isConnected"
          severity="info"
          rounded
          size="small"
        />
      </div>
    </div>

    <!-- Erreur de connexion -->
    <div v-if="error" class="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
      <div class="text-red-400 text-sm flex items-center gap-2">
        <i class="pi pi-exclamation-triangle"></i>
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useYjsChat } from '../composables/useYjsChat'
import { useRoomStatus } from '../composables/useRoomStatus'

interface Props {
  roomId: string
  user: {
    id: string
    name: string
    color?: string
    avatar?: string
  }
  canWrite?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canWrite: true
})

// état local
const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()
let typingTimeout: number | null = null

// Chat collaboratif Yjs
const {
  isConnected,
  isConnecting,
  error,
  messages,
  typingUsers,
  initializeChat,
  sendMessage,
  setTypingStatus
} = useYjsChat(props.roomId, {
  id: props.user.id,
  name: props.user.name,
  color: props.user.color,
  avatar: props.user.avatar
})

// Statut de collaboration
const { updateChatStatus } = useRoomStatus()

// Watcher pour mettre à jour le statut
watch([isConnected, isConnecting, error, typingUsers], () => {
  updateChatStatus(
    isConnected.value,
    isConnecting.value,
    error.value,
    typingUsers.value.length
  )
}, { immediate: true })

// Initialiser le chat au montage
onMounted(async () => {
  await initializeChat()
})

// Auto-scroll vers le bas quand de nouveaux messages arrivent
watch(messages, async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}, { deep: true })

// Gérer l'envoi de message
const handleSendMessage = () => {
  if (newMessage.value.trim() && props.canWrite && isConnected.value) {
    sendMessage(newMessage.value)
    newMessage.value = ''
  }
}

// Gérer l'indicateur de frappe
const handleTyping = () => {
  if (!props.canWrite || !isConnected.value) return

  // Indiquer qu'on est en train de taper
  setTypingStatus(true)

  // Annuler le timeout précédent
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }

  // Arrêter l'indicateur après 2 secondes d'inactivité
  typingTimeout = setTimeout(() => {
    setTypingStatus(false)
  }, 2000)
}

// Formater l'heure
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<style scoped>
/* Scrollbar personnalisée pour les messages */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}

/* Animation pour les messages entrants */
.space-y-3 > div {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Couleurs brand */
.text-brand-500 {
  color: #3b82f6;
}

.text-brand-600 {
  color: #2563eb;
}

.text-brand-400 {
  color: #60a5fa;
}

.bg-brand-500 {
  background-color: #3b82f6;
}
</style>
