<template>
  <div class="flex flex-col h-80">
    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
      <div 
        v-for="message in messages" 
        :key="message.id"
        :class="[
          'flex',
          message.userId === currentUserId ? 'justify-end' : 'justify-start'
        ]"
      >
        <div 
          :class="[
            'max-w-xs px-4 py-2 rounded-2xl shadow-sm',
            message.userId === currentUserId 
              ? 'bg-brand-500 text-white rounded-br-sm' 
              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
          ]"
        >
          <div v-if="message.userId !== currentUserId" class="text-xs font-semibold mb-1 text-brand-600 dark:text-brand-400">
            {{ message.userName }}
          </div>
          <div class="text-sm">{{ message.content }}</div>
          <div 
            :class="[
              'text-xs mt-1',
              message.userId === currentUserId ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
            ]"
          >
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Input message -->
    <div class="flex gap-2">
      <InputText
        v-model="newMessage"
        placeholder="Tapez votre message..."
        class="flex-1"
        @keyup.enter="sendMessage"
        :disabled="!canWrite"
      />
      <Button 
        icon="pi pi-send" 
        @click="sendMessage"
        :disabled="!newMessage.trim() || !canWrite"
        severity="info"
        rounded
      />
    </div>

    <!-- Indicateur de frappe -->
    <div v-if="typingUsers.length > 0" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
      <i class="pi pi-circle-fill animate-pulse mr-1"></i>
      {{ typingIndicator }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

interface Props {
  roomId: string
  user: {
    id: string
    name: string
    color: string
    avatar?: string
  }
  canWrite?: boolean
}

interface Message {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: Date
}

const props = withDefaults(defineProps<Props>(), {
  canWrite: true
})

const messages = ref<Message[]>([])
const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()
const typingUsers = ref<string[]>([])
let socket: WebSocket
let typingTimeout: number

const currentUserId = computed(() => props.user.id)

const typingIndicator = computed(() => {
  const count = typingUsers.value.length
  if (count === 1) return `${typingUsers.value[0]} est en train d'écrire...`
  if (count === 2) return `${typingUsers.value[0]} et ${typingUsers.value[1]} sont en train d'écrire...`
  if (count > 2) return `${count} personnes sont en train d'écrire...`
  return ''
})

onMounted(() => {
  // Connexion WebSocket pour le chat en temps réel
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
  socket = new WebSocket(`${wsUrl}/whiteboard`)
  
  socket.onopen = () => {
    // Rejoindre la room
    socket.send(JSON.stringify({
      type: 'join_room',
      roomId: props.roomId,
      user: props.user
    }))
  }
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    handleSocketMessage(data)
  }

  // Charger l'historique des messages
  loadChatHistory()
})

onUnmounted(() => {
  socket?.close()
})

watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

function loadChatHistory() {
  // Simuler le chargement de l'historique
  messages.value = [
    {
      id: '1',
      userId: '2',
      userName: 'Bob',
      content: 'Salut tout le monde !',
      timestamp: new Date(Date.now() - 60000)
    },
    {
      id: '2',
      userId: '1',
      userName: 'Alice',
      content: 'Hello ! Comment ça va ?',
      timestamp: new Date(Date.now() - 30000)
    }
  ]
}

function sendMessage() {
  if (!newMessage.value.trim() || !props.canWrite) return

  const message: Message = {
    id: Date.now().toString(),
    userId: props.user.id,
    userName: props.user.name,
    content: newMessage.value.trim(),
    timestamp: new Date()
  }

  // Ajouter localement
  messages.value.push(message)

  // Envoyer via WebSocket
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'chat_message',
      roomId: props.roomId,
      content: message.content,
      timestamp: message.timestamp,
      user: props.user
    }))
  }

  newMessage.value = ''
  stopTyping()
}

function handleSocketMessage(data: any) {
  switch (data.type) {
    case 'chat_message':
      messages.value.push({
        id: data.id || Date.now().toString(),
        userId: data.user.id,
        userName: data.user.name,
        content: data.content,
        timestamp: new Date(data.timestamp)
      })
      break
    
    case 'typing-start':
      if (data.user && !typingUsers.value.includes(data.user.name)) {
        typingUsers.value.push(data.user.name)
      }
      break
    
    case 'typing-stop':
      if (data.user) {
        typingUsers.value = typingUsers.value.filter(user => user !== data.user.name)
      }
      break
  }
}

function onTyping() {
  // Envoyer l'indicateur de frappe
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'typing-start',
      roomId: props.roomId,
      user: props.user
    }))
  }

  // Arrêter l'indicateur après 2 secondes d'inactivité
  clearTimeout(typingTimeout)
  typingTimeout = setTimeout(stopTyping, 2000)
}

function stopTyping() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'typing-stop',
      roomId: props.roomId,
      user: props.user
    }))
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Détecter la frappe
watch(newMessage, () => {
  if (newMessage.value) {
    onTyping()
  }
})
</script>

<style scoped>
/* Scrollbar personnalisée */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.4);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.6);
}
</style>
