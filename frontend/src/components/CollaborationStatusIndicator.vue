<template>
  <div class="collaboration-status-indicator">
    <!-- Indicateur global compact -->
    <div 
      class="status-badge"
      :class="getStatusClasses(globalStatus.status)"
      @click="showDetails = !showDetails"
    >
      <div class="flex items-center gap-2">
        <div class="status-icon">
          <div v-if="globalStatus.status === 'connecting'" class="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
          <i v-else-if="globalStatus.status === 'connected'" class="pi pi-check-circle"></i>
          <i v-else-if="globalStatus.status === 'error'" class="pi pi-exclamation-triangle"></i>
          <i v-else class="pi pi-times-circle"></i>
        </div>
        
        <div class="status-info">
          <span class="font-medium text-sm">{{ globalStatus.message }}</span>
          <div class="text-xs opacity-80" v-if="globalStatus.totalCollaborators > 0">
            {{ globalStatus.totalCollaborators }} collaborateur{{ globalStatus.totalCollaborators > 1 ? 's' : '' }}
          </div>
        </div>
        
        <button class="status-toggle text-xs opacity-60 hover:opacity-100">
          <i :class="showDetails ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
        </button>
      </div>
    </div>

    <!-- Détails des composants (dépliable) -->
    <Transition name="slide-down">
      <div v-if="showDetails" class="status-details">
        <div class="status-grid">
          <div 
            v-for="(component, key) in roomStatus" 
            :key="key"
            class="component-status"
            :class="getComponentStatusClasses(component)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="component-icon">
                  <i v-if="component.connecting" class="pi pi-spin pi-spinner text-xs"></i>
                  <i v-else-if="component.connected" class="pi pi-check text-green-400 text-xs"></i>
                  <i v-else-if="component.error" class="pi pi-times text-red-400 text-xs"></i>
                  <i v-else class="pi pi-circle text-gray-400 text-xs"></i>
                </div>
                <span class="text-sm font-medium">{{ component.name }}</span>
              </div>
              
              <div class="component-stats text-xs opacity-70">
                <span v-if="component.collaborators > 0">
                  {{ component.collaborators }} <i class="pi pi-users"></i>
                </span>
                <span v-if="component.error" class="text-red-400" :title="component.error">
                  <i class="pi pi-exclamation-triangle"></i>
                </span>
              </div>
            </div>
            
            <!-- Message d'erreur -->
            <div v-if="component.error" class="error-message text-xs text-red-300 mt-1">
              {{ component.error }}
            </div>
            
            <!-- Dernière mise à jour -->
            <div class="last-update text-xs opacity-50 mt-1">
              Mis à jour {{ formatRelativeTime(component.lastUpdate) }}
            </div>
          </div>
        </div>
        
        <!-- Actions rapides -->
        <div class="status-actions">
          <button @click="refreshAllConnections" class="action-btn">
            <i class="pi pi-refresh mr-1"></i>
            Reconnecter tout
          </button>
          <button @click="copyStatusInfo" class="action-btn">
            <i class="pi pi-copy mr-1"></i>
            Copier le statut
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoomStatus } from '../composables/useRoomStatus'

const { roomStatus, globalStatus, resetAllStatus } = useRoomStatus()

const showDetails = ref(false)

function getStatusClasses(status: string) {
  const baseClasses = 'px-4 py-2 rounded-xl backdrop-blur-sm border transition-all cursor-pointer hover:scale-105'
  
  switch (status) {
    case 'connected':
      return `${baseClasses} bg-green-500/20 border-green-400/30 text-green-100`
    case 'connecting':
      return `${baseClasses} bg-blue-500/20 border-blue-400/30 text-blue-100`
    case 'error':
      return `${baseClasses} bg-red-500/20 border-red-400/30 text-red-100`
    default:
      return `${baseClasses} bg-gray-500/20 border-gray-400/30 text-gray-100`
  }
}

function getComponentStatusClasses(component: any) {
  const baseClasses = 'p-3 rounded-lg backdrop-blur-sm border'
  
  if (component.error) {
    return `${baseClasses} bg-red-500/10 border-red-400/20`
  } else if (component.connected) {
    return `${baseClasses} bg-green-500/10 border-green-400/20`
  } else if (component.connecting) {
    return `${baseClasses} bg-blue-500/10 border-blue-400/20`
  } else {
    return `${baseClasses} bg-gray-500/10 border-gray-400/20`
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  
  if (seconds < 10) return 'à l\'instant'
  if (seconds < 60) return `il y a ${seconds}s`
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)}m`
  return `il y a ${Math.floor(seconds / 3600)}h`
}

function refreshAllConnections() {
  resetAllStatus()
  // Déclencher la reconnexion de tous les composants
  window.location.reload()
}

function copyStatusInfo() {
  const statusText = `Statut de collaboration Synkro:
${globalStatus.value.message}
Composants: ${globalStatus.value.connectedCount}/${globalStatus.value.totalComponents}
Collaborateurs: ${globalStatus.value.totalCollaborators}

Détails par composant:
${Object.entries(roomStatus.value)
  .map(([_, comp]) => `- ${(comp as any).name}: ${(comp as any).connected ? '?' : (comp as any).connecting ? '??' : '?'} ${(comp as any).error || ''}`)
  .join('\n')}`

  navigator.clipboard.writeText(statusText).then(() => {
    // TODO: Ajouter une notification toast
    console.log('Statut copié dans le presse-papiers')
  })
}
</script>

<style scoped>
.collaboration-status-indicator {
  position: relative;
  z-index: 40;
}

.status-badge {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.status-details {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 400px;
}

.status-grid {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.component-status {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.status-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* Animations */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

@media (max-width: 768px) {
  .status-details {
    left: -1rem;
    right: -1rem;
    max-width: none;
  }
  
  .status-actions {
    flex-direction: column;
  }
}
</style>
