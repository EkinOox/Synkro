<template>
  <div class="flex flex-col gap-4">
    <!-- Formulaire de création -->
    <div v-if="canWrite" class="glass-panel p-4">
      <div class="flex gap-3">
        <select
          v-model="newCommentType"
          class="glass-input w-32"
        >
          <option value="comment">Commentaire</option>
          <option value="postit">Post-it</option>
          <option value="note">Note</option>
          <option value="question">Question</option>
        </select>
        <input
          v-model="newCommentTitle"
          placeholder="Titre (optionnel)"
          class="glass-input flex-1"
        />
        <button
          @click="startCreating"
          class="btn-glass-success"
          title="Ajouter"
        >
          <i class="pi pi-plus"></i>
        </button>
      </div>
    </div>

    <!-- Zone de création de commentaire -->
    <div v-if="isCreating" class="glass-panel p-4">
      <textarea
        v-model="newCommentContent"
        placeholder="Écrivez votre commentaire ou note..."
        rows="3"
        class="glass-input w-full mb-4 resize-none"
      ></textarea>
      <div class="flex items-center justify-between">
        <div class="flex gap-3">
          <input
            type="color"
            v-model="newCommentColor"
            class="w-10 h-10 rounded-lg cursor-pointer border-2 border-white/20"
          />
          <select
            v-model="newCommentPriority"
            class="glass-input"
          >
            <option value="low">Basse</option>
            <option value="normal">Normale</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
        <div class="flex gap-2">
          <button @click="cancelCreating" class="btn-glass-secondary">
            Annuler
          </button>
          <button @click="createComment" class="btn-glass-success">
            Créer
          </button>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="glass-panel p-3">
      <div class="flex items-center gap-4 text-sm flex-wrap">
        <span class="text-white/70 font-medium">Filtrer:</span>
        <div class="flex gap-2 flex-wrap">
          <span class="text-white/60 text-xs">Types:</span>
          <button
            v-for="type in commentTypes"
            :key="type.value"
            @click="toggleFilter('types', type.value)"
            :class="[
              'btn-glass-secondary text-xs',
              selectedTypes.includes(type.value) ? 'btn-glass-primary' : ''
            ]"
          >
            {{ type.label }}
          </button>
        </div>
        <div class="flex gap-2 flex-wrap">
          <span class="text-white/60 text-xs">Priorités:</span>
          <button
            v-for="priority in priorities"
            :key="priority.value"
            @click="toggleFilter('priorities', priority.value)"
            :class="[
              'btn-glass-secondary text-xs',
              selectedPriorities.includes(priority.value) ? 'btn-glass-primary' : ''
            ]"
          >
            {{ priority.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Liste des commentaires -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="comment in filteredComments"
        :key="comment.id"
        class="glass-panel p-4 cursor-pointer transition-all hover:scale-105 transform relative"
        @click="selectComment(comment)"
        :style="{ borderLeft: `4px solid ${comment.color}` }"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <i :class="getTypeIcon(comment.type)" class="text-sm"></i>
            <span v-if="comment.title" class="font-semibold text-sm text-white">{{ comment.title }}</span>
            <span
              v-if="comment.priority !== 'normal'"
              :class="getPriorityClasses(comment.priority)"
              class="text-xs px-2 py-1 rounded-full"
            >
              {{ getPriorityLabel(comment.priority) }}
            </span>
          </div>
          <div v-if="canWrite || comment.authorId === currentUserId" class="relative">
            <button
              @click.stop="toggleMenu(comment.id)"
              class="btn-glass-secondary text-xs p-1"
            >
              <i class="pi pi-ellipsis-v"></i>
            </button>
            <div
              v-if="activeMenu === comment.id"
              class="absolute right-0 top-8 glass-panel p-2 min-w-32 z-10"
            >
              <button
                v-if="comment.authorId === currentUserId"
                @click="editComment(comment)"
                class="btn-glass-secondary w-full text-left text-xs mb-1"
              >
                <i class="pi pi-pencil mr-2"></i>
                Modifier
              </button>
              <button
                v-if="canWrite || comment.authorId === currentUserId"
                @click="deleteComment(comment.id)"
                class="btn-glass-danger w-full text-left text-xs"
              >
                <i class="pi pi-trash mr-2"></i>
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <!-- Contenu -->
        <div class="text-sm mb-3 line-clamp-3 text-white/90">
          {{ comment.content }}
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between text-xs text-white/60">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-medium text-white">
              {{ comment.authorName.charAt(0).toUpperCase() }}
            </div>
            <span>{{ comment.authorName }}</span>
          </div>
          <span>{{ formatDate(comment.createdAt) }}</span>
        </div>

        <!-- Réponses -->
        <div v-if="comment.replies.length > 0" class="mt-3 pt-3 border-t border-white/20">
          <div class="flex items-center justify-between text-xs text-white/60">
            <div class="flex items-center gap-2">
              <i class="pi pi-comments"></i>
              <span>{{ comment.replies.length }} réponse(s)</span>
            </div>
            <button
              @click.stop="showReplies(comment)"
              class="btn-glass-secondary text-xs"
            >
              Voir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog de détail/modification -->
    <div
      v-if="showDetailDialog"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click="showDetailDialog = false"
    >
      <div
        class="glass-panel p-6 w-full max-w-2xl max-h-96 overflow-y-auto m-4"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">
            {{ selectedComment?.title || 'Commentaire' }}
          </h3>
          <button @click="showDetailDialog = false" class="btn-glass-secondary p-2">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div v-if="selectedComment" class="space-y-4">
          <!-- Contenu du commentaire -->
          <div v-if="!isEditing">
            <p class="text-white/90 mb-4">{{ selectedComment.content }}</p>

            <!-- Réponses -->
            <div v-if="selectedComment.replies.length > 0" class="space-y-3">
              <h4 class="font-semibold text-white">Réponses:</h4>
              <div
                v-for="reply in selectedComment.replies"
                :key="reply.id"
                class="glass-section p-3"
              >
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-sm font-medium text-white">
                    {{ reply.authorName.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-medium text-sm text-white">{{ reply.authorName }}</span>
                      <span class="text-xs text-white/60">{{ formatDate(reply.createdAt) }}</span>
                    </div>
                    <p class="text-sm text-white/90">{{ reply.content }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Formulaire de réponse -->
            <div v-if="canWrite" class="mt-4">
              <textarea
                v-model="newReply"
                placeholder="Ajouter une réponse..."
                rows="2"
                class="glass-input w-full mb-2 resize-none"
              ></textarea>
              <button
                @click="addReply"
                :disabled="!newReply.trim()"
                class="btn-glass-success"
              >
                Répondre
              </button>
            </div>
          </div>

          <!-- Mode édition -->
          <div v-else class="space-y-3">
            <input
              v-model="editingComment.title"
              placeholder="Titre"
              class="glass-input w-full"
            />
            <textarea
              v-model="editingComment.content"
              rows="4"
              class="glass-input w-full resize-none"
            ></textarea>
            <div class="flex gap-3">
              <input
                type="color"
                v-model="editingComment.color"
                class="w-10 h-10 rounded-lg cursor-pointer border-2 border-white/20"
              />
              <select
                v-model="editingComment.priority"
                class="glass-input"
              >
                <option value="low">Basse</option>
                <option value="normal">Normale</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Footer du dialog -->
        <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-white/20">
          <div v-if="!isEditing" class="flex gap-2">
            <button
              v-if="selectedComment?.authorId === currentUserId"
              @click="startEditing"
              class="btn-glass-secondary"
            >
              <i class="pi pi-pencil mr-2"></i>
              Modifier
            </button>
            <button @click="showDetailDialog = false" class="btn-glass-primary">
              Fermer
            </button>
          </div>
          <div v-else class="flex gap-2">
            <button @click="cancelEditing" class="btn-glass-secondary">
              Annuler
            </button>
            <button @click="saveEdit" class="btn-glass-success">
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  roomId: string
  canWrite?: boolean
}

interface Comment {
  id: string
  type: 'comment' | 'postit' | 'note' | 'question'
  title?: string
  content: string
  color: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  authorId: number
  authorName: string
  authorAvatar: string
  createdAt: Date
  updatedAt?: Date
  replies: Reply[]
}

interface Reply {
  id: string
  content: string
  authorId: number
  authorName: string
  authorAvatar: string
  createdAt: Date
}

const props = withDefaults(defineProps<Props>(), {
  canWrite: true
})

const comments = ref<Comment[]>([])
const currentUserId = ref(1)
const activeMenu = ref<string | null>(null)

// Création
const isCreating = ref(false)
const newCommentType = ref('comment')
const newCommentTitle = ref('')
const newCommentContent = ref('')
const newCommentColor = ref('#3B82F6')
const newCommentPriority = ref('normal')

// Filtres
const selectedTypes = ref(['comment', 'postit', 'note', 'question'])
const selectedPriorities = ref(['low', 'normal', 'high', 'urgent'])

// Dialog de détail
const showDetailDialog = ref(false)
const selectedComment = ref<Comment | null>(null)
const isEditing = ref(false)
const editingComment = ref<Partial<Comment>>({})
const newReply = ref('')

const commentTypes = [
  { label: 'Commentaire', value: 'comment' },
  { label: 'Post-it', value: 'postit' },
  { label: 'Note', value: 'note' },
  { label: 'Question', value: 'question' }
]

const priorities = [
  { label: 'Basse', value: 'low' },
  { label: 'Normale', value: 'normal' },
  { label: 'Haute', value: 'high' },
  { label: 'Urgente', value: 'urgent' }
]

const filteredComments = computed(() => {
  return comments.value.filter(comment =>
    selectedTypes.value.includes(comment.type) &&
    selectedPriorities.value.includes(comment.priority)
  )
})

onMounted(() => {
  loadComments()
  document.addEventListener('click', closeMenus)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenus)
})

function closeMenus() {
  activeMenu.value = null
}

function toggleMenu(commentId: string) {
  activeMenu.value = activeMenu.value === commentId ? null : commentId
}

function toggleFilter(type: 'types' | 'priorities', value: string) {
  if (type === 'types') {
    const index = selectedTypes.value.indexOf(value)
    if (index > -1) {
      selectedTypes.value.splice(index, 1)
    } else {
      selectedTypes.value.push(value)
    }
  } else {
    const index = selectedPriorities.value.indexOf(value)
    if (index > -1) {
      selectedPriorities.value.splice(index, 1)
    } else {
      selectedPriorities.value.push(value)
    }
  }
}

function loadComments() {
  // Simuler le chargement des commentaires
  comments.value = [
    {
      id: '1',
      type: 'postit',
      title: 'Idée importante',
      content: 'Nous devrions ajouter une fonctionnalité de sauvegarde automatique.',
      color: '#F59E0B',
      priority: 'high',
      authorId: 2,
      authorName: 'Bob',
      authorAvatar: '/avatars/bob.png',
      createdAt: new Date(Date.now() - 3600000),
      replies: []
    },
    {
      id: '2',
      type: 'question',
      content: 'Comment gérer les permissions pour les invités ?',
      color: '#EF4444',
      priority: 'normal',
      authorId: 3,
      authorName: 'Charlie',
      authorAvatar: '/avatars/charlie.png',
      createdAt: new Date(Date.now() - 1800000),
      replies: [
        {
          id: 'r1',
          content: 'On pourrait créer un système de rôles.',
          authorId: 1,
          authorName: 'Alice',
          authorAvatar: '/avatars/alice.png',
          createdAt: new Date(Date.now() - 1500000)
        }
      ]
    }
  ]
}

function startCreating() {
  isCreating.value = true
}

function cancelCreating() {
  isCreating.value = false
  resetForm()
}

function createComment() {
  if (!newCommentContent.value.trim()) return

  const comment: Comment = {
    id: Date.now().toString(),
    type: newCommentType.value as any,
    title: newCommentTitle.value || undefined,
    content: newCommentContent.value.trim(),
    color: newCommentColor.value,
    priority: newCommentPriority.value as any,
    authorId: currentUserId.value,
    authorName: 'Moi',
    authorAvatar: '/avatars/me.png',
    createdAt: new Date(),
    replies: []
  }

  comments.value.unshift(comment)
  resetForm()
  isCreating.value = false

  // Envoyer via WebSocket
  // socket.send(JSON.stringify({ type: 'comment-create', comment }))
}

function resetForm() {
  newCommentType.value = 'comment'
  newCommentTitle.value = ''
  newCommentContent.value = ''
  newCommentColor.value = '#3B82F6'
  newCommentPriority.value = 'normal'
}

function selectComment(comment: Comment) {
  selectedComment.value = comment
  showDetailDialog.value = true
  activeMenu.value = null
}

function editComment(comment: Comment) {
  selectedComment.value = comment
  showDetailDialog.value = true
  startEditing()
  activeMenu.value = null
}

function startEditing() {
  if (!selectedComment.value) return
  isEditing.value = true
  editingComment.value = { ...selectedComment.value }
}

function cancelEditing() {
  isEditing.value = false
  editingComment.value = {}
}

function saveEdit() {
  if (!selectedComment.value || !editingComment.value.content) return

  Object.assign(selectedComment.value, editingComment.value, {
    updatedAt: new Date()
  })

  isEditing.value = false
  editingComment.value = {}

  // Envoyer via WebSocket
  // socket.send(JSON.stringify({ type: 'comment-update', comment: selectedComment.value }))
}

function deleteComment(commentId: string) {
  const index = comments.value.findIndex(c => c.id === commentId)
  if (index !== -1) {
    comments.value.splice(index, 1)
    showDetailDialog.value = false
    activeMenu.value = null

    // Envoyer via WebSocket
    // socket.send(JSON.stringify({ type: 'comment-delete', commentId }))
  }
}

function addReply() {
  if (!selectedComment.value || !newReply.value.trim()) return

  const reply: Reply = {
    id: Date.now().toString(),
    content: newReply.value.trim(),
    authorId: currentUserId.value,
    authorName: 'Moi',
    authorAvatar: '/avatars/me.png',
    createdAt: new Date()
  }

  selectedComment.value.replies.push(reply)
  newReply.value = ''

  // Envoyer via WebSocket
  // socket.send(JSON.stringify({ type: 'reply-create', commentId: selectedComment.value.id, reply }))
}

function showReplies(comment: Comment) {
  selectComment(comment)
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'postit': return 'pi pi-bookmark-fill text-yellow-400'
    case 'question': return 'pi pi-question-circle text-blue-400'
    case 'note': return 'pi pi-file-edit text-green-400'
    default: return 'pi pi-comment text-gray-400'
  }
}

function getPriorityClasses(priority: string) {
  switch (priority) {
    case 'urgent': return 'bg-red-500 text-white'
    case 'high': return 'bg-orange-500 text-white'
    case 'low': return 'bg-blue-500 text-white'
    default: return 'bg-gray-500 text-white'
  }
}

function getPriorityLabel(priority: string) {
  switch (priority) {
    case 'urgent': return 'Urgent'
    case 'high': return 'Haute'
    case 'low': return 'Basse'
    default: return 'Normal'
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
