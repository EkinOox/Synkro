<template>
  <div class="comment-board glass-panel rounded-xl p-6">
    <!-- En-tête avec statistiques -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h3 class="text-xl font-semibold text-white">Commentaires</h3>
        <div class="flex gap-2">
          <span class="badge-glass-primary text-xs">
            {{ commentStats.total }} total
          </span>
          <span class="badge-glass-warning text-xs" v-if="commentStats.unresolved > 0">
            {{ commentStats.unresolved }} non résolus
          </span>
        </div>
      </div>
      
      <!-- Indicateur de connexion -->
      <div class="flex items-center gap-3">
        <div v-if="isConnecting" class="flex items-center gap-2 text-blue-400">
          <div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
          <span class="text-sm">Synchronisation...</span>
        </div>
        <div v-else-if="isConnected" class="flex items-center gap-2 text-green-400">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span class="text-sm">Collaboratif</span>
        </div>
        <div v-else-if="error" class="flex items-center gap-2 text-red-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span class="text-sm">Hors ligne</span>
        </div>
        
        <button
          @click="showAddModal = true"
          class="btn-glass-primary text-sm"
          title="Ajouter un commentaire"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Nouveau
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="flex flex-wrap gap-3 mb-6">
      <div class="flex gap-1">
        <button
          @click="setFilter('all')"
          :class="['btn-glass-secondary text-sm', { 'btn-glass-primary': activeFilter === 'all' }]"
        >
          Tous ({{ commentStats.total }})
        </button>
        <button
          @click="setFilter('unresolved')"
          :class="['btn-glass-secondary text-sm', { 'btn-glass-primary': activeFilter === 'unresolved' }]"
        >
          Non résolus ({{ commentStats.unresolved }})
        </button>
        <button
          @click="setFilter('resolved')"
          :class="['btn-glass-secondary text-sm', { 'btn-glass-primary': activeFilter === 'resolved' }]"
        >
          Résolus ({{ commentStats.resolved }})
        </button>
        <button
          @click="setFilter('mine')"
          :class="['btn-glass-secondary text-sm', { 'btn-glass-primary': activeFilter === 'mine' }]"
        >
          Mes commentaires ({{ commentStats.mine }})
        </button>
      </div>

      <div class="flex gap-1">
        <button
          @click="setTypeFilter('all')"
          :class="['btn-glass-secondary text-sm', { 'btn-glass-primary': activeTypeFilter === 'all' }]"
        >
          Tous types
        </button>
        <button
          @click="setTypeFilter('comment')"
          :class="['btn-glass-secondary text-sm', { 'btn-glass-primary': activeTypeFilter === 'comment' }]"
        >
          ?? Commentaires ({{ commentStats.byType.comment }})
        </button>
        <button
          @click="setTypeFilter('suggestion')"
          :class="['btn-glass-secondary text-sm', { 'btn-glass-primary': activeTypeFilter === 'suggestion' }]"
        >
          ?? Suggestions ({{ commentStats.byType.suggestion }})
        </button>
        <button
          @click="setTypeFilter('question')"
          :class="['btn-glass-secondary text-sm', { 'btn-glass-primary': activeTypeFilter === 'question' }]"
        >
          ? Questions ({{ commentStats.byType.question }})
        </button>
      </div>
    </div>

    <!-- Liste des commentaires -->
    <div class="space-y-4 max-h-[400px] overflow-y-auto">
      <div
        v-for="comment in filteredComments"
        :key="comment.id"
        class="comment-card glass-panel rounded-lg p-4 border border-white/10"
        :class="{
          'border-green-400/30 bg-green-500/5': comment.resolved,
          'border-yellow-400/30 bg-yellow-500/5': comment.type === 'question' && !comment.resolved,
          'border-blue-400/30 bg-blue-500/5': comment.type === 'suggestion' && !comment.resolved
        }"
      >
        <!-- En-tête du commentaire -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium"
            >
              {{ comment.author.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-white font-medium">{{ comment.author.name }}</span>
                <span class="text-xs px-2 py-1 rounded-full" :class="{
                  'bg-blue-500/20 text-blue-300': comment.type === 'comment',
                  'bg-green-500/20 text-green-300': comment.type === 'suggestion',
                  'bg-yellow-500/20 text-yellow-300': comment.type === 'question'
                }">
                  {{ comment.type === 'comment' ? '??' : comment.type === 'suggestion' ? '??' : '?' }}
                  {{ comment.type === 'comment' ? 'Commentaire' : comment.type === 'suggestion' ? 'Suggestion' : 'Question' }}
                </span>
                <span
                  v-if="comment.resolved"
                  class="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300"
                >
                  ? Résolu
                </span>
              </div>
              <div class="text-xs text-white/60 mt-1">
                {{ formatDate(comment.timestamp) }}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-1">
            <button
              v-if="!comment.resolved"
              @click="resolveComment(comment.id)"
              class="btn-glass-success text-xs"
              title="Marquer comme résolu"
            >
              ?
            </button>
            <button
              v-else
              @click="unresolveComment(comment.id)"
              class="btn-glass-secondary text-xs"
              title="Rouvrir"
            >
              ??
            </button>
            <button
              v-if="comment.author.id === user.id"
              @click="deleteComment(comment.id)"
              class="btn-glass-danger text-xs"
              title="Supprimer"
            >
              ???
            </button>
            <button
              @click="replyToComment(comment)"
              class="btn-glass-secondary text-xs"
              title="Répondre"
            >
              ??
            </button>
          </div>
        </div>

        <!-- Contenu du commentaire -->
        <div class="text-white/90 mb-3 leading-relaxed">
          {{ comment.content }}
        </div>

        <!-- Réponses -->
        <div v-if="getReplies(comment.id).length > 0" class="ml-6 space-y-2 border-l-2 border-white/10 pl-4">
          <div
            v-for="reply in getReplies(comment.id)"
            :key="reply.id"
            class="bg-white/5 rounded-lg p-3"
          >
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-medium">
                {{ reply.author.name.charAt(0).toUpperCase() }}
              </div>
              <span class="text-sm text-white font-medium">{{ reply.author.name }}</span>
              <span class="text-xs text-white/60">{{ formatDate(reply.timestamp) }}</span>
            </div>
            <div class="text-sm text-white/90">{{ reply.content }}</div>
          </div>
        </div>
      </div>

      <!-- Message si aucun commentaire -->
      <div v-if="filteredComments.length === 0" class="text-center py-8 text-white/60">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" class="mx-auto mb-3 opacity-50">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
        <p>Aucun commentaire pour le moment</p>
        <button
          @click="showAddModal = true"
          class="btn-glass-primary mt-3"
        >
          Ajouter le premier commentaire
        </button>
      </div>
    </div>

    <!-- Actions globales -->
    <div class="flex justify-between mt-6 pt-4 border-t border-white/10" v-if="commentStats.resolved > 0">
      <button
        @click="clearAllResolved"
        class="btn-glass-warning text-sm"
        title="Supprimer tous les commentaires résolus"
      >
        Nettoyer les résolus ({{ commentStats.resolved }})
      </button>
    </div>

    <!-- Modal d'ajout de commentaire -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddModal = false"
    >
      <div class="glass-panel rounded-xl p-6 w-full max-w-md mx-4">
        <h4 class="text-lg font-semibold text-white mb-4">
          {{ replyingTo ? 'Répondre au commentaire' : 'Nouveau commentaire' }}
        </h4>

        <div class="space-y-4">
          <div v-if="!replyingTo">
            <label class="block text-sm font-medium text-white/80 mb-2">Type</label>
            <select v-model="newCommentType" class="glass-input w-full">
              <option value="comment">?? Commentaire</option>
              <option value="suggestion">?? Suggestion</option>
              <option value="question">? Question</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-white/80 mb-2">Contenu</label>
            <textarea
              v-model="newCommentContent"
              placeholder="écrivez votre commentaire..."
              class="glass-input w-full h-32 resize-none"
              @keydown.ctrl.enter="submitComment"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="cancelComment"
            class="btn-glass-secondary"
          >
            Annuler
          </button>
          <button
            @click="submitComment"
            :disabled="!newCommentContent.trim()"
            class="btn-glass-primary disabled:opacity-50"
          >
            {{ replyingTo ? 'Répondre' : 'Publier' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useYjsComments } from '../composables/useYjsComments'
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

// Composable Yjs Comments
const {
  filteredComments,
  commentStats,
  isConnected,
  isConnecting,
  collaborators,
  error,
  activeFilter,
  activeTypeFilter,
  setFilter,
  setTypeFilter,
  addComment,
  deleteComment,
  resolveComment,
  unresolveComment,
  clearAllResolved,
  getReplies
} = useYjsComments(props.roomId, {
  id: props.user.id,
  name: props.user.name,
  color: props.user.color || '#3b82f6',
  avatar: props.user.avatar
})

// Statut de collaboration
const { updateCommentsStatus } = useRoomStatus()

// Watcher pour mettre à jour le statut des commentaires
watch([isConnected, isConnecting, error, collaborators], () => {
  updateCommentsStatus(
    isConnected.value,
    isConnecting.value,
    error.value,
    collaborators.value.length
  )
}, { immediate: true })

// état du modal
const showAddModal = ref(false)
const newCommentContent = ref('')
const newCommentType = ref<'comment' | 'suggestion' | 'question'>('comment')
const replyingTo = ref<any>(null)

// Actions
const submitComment = () => {
  if (!newCommentContent.value.trim()) return

  addComment(
    newCommentContent.value,
    replyingTo.value ? 'comment' : newCommentType.value,
    undefined, // position
    replyingTo.value?.id
  )

  cancelComment()
}

const cancelComment = () => {
  showAddModal.value = false
  newCommentContent.value = ''
  newCommentType.value = 'comment'
  replyingTo.value = null
}

const replyToComment = (comment: any) => {
  replyingTo.value = comment
  showAddModal.value = true
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return 'à l\'instant'
  if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`
  if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`
  
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
/* Animation pour les nouveaux commentaires */
.comment-card {
  transition: all 0.3s ease;
}

.comment-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.05);
}

/* Styles pour le modal */
.glass-input {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: white;
}

.glass-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.glass-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
  background-color: rgba(255, 255, 255, 0.15);
}

/* Scrollbar personnalisée */
.max-h-\[400px\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[400px\]::-webkit-scrollbar-track {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 9999px;
}

.max-h-\[400px\]::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
}

.max-h-\[400px\]::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
