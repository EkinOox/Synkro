<template>
  <div class="flex flex-col gap-4">
    <!-- état de connexion -->
    <div v-if="!isConnected" class="flex items-center justify-center py-4 text-white/60">
      <div class="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white/60 mr-2"></div>
      <span class="text-sm">{{ isConnecting ? 'Connexion au tableau...' : 'Tableau déconnecté' }}</span>
    </div>

    <!-- Barre d'outils -->
    <div v-else class="flex flex-wrap items-center gap-3 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-sm backdrop-blur-sm">
      <!-- Outils de dessin -->
      <div class="flex items-center gap-2 border-r border-gray-300 dark:border-gray-600 pr-3">
        <Button
          @click="setTool('pen')"
          :class="{ '!bg-brand-500 !text-white': currentTool === 'pen' }"
          class="!p-2 !w-10 !h-10 rounded-lg"
          severity="secondary"
          text
          v-tooltip.top="'Crayon'"
        >
          <i class="pi pi-pencil"></i>
        </Button>
        <Button
          @click="setTool('eraser')"
          :class="{ '!bg-brand-500 !text-white': currentTool === 'eraser' }"
          class="!p-2 !w-10 !h-10 rounded-lg"
          severity="secondary"
          text
          v-tooltip.top="'Gomme'"
        >
          <i class="pi pi-eraser"></i>
        </Button>
        <Button
          @click="setTool('rectangle')"
          :class="{ '!bg-brand-500 !text-white': currentTool === 'rectangle' }"
          class="!p-2 !w-10 !h-10 rounded-lg"
          severity="secondary"
          text
          v-tooltip.top="'Rectangle'"
        >
          <i class="pi pi-stop"></i>
        </Button>
        <Button
          @click="setTool('circle')"
          :class="{ '!bg-brand-500 !text-white': currentTool === 'circle' }"
          class="!p-2 !w-10 !h-10 rounded-lg"
          severity="secondary"
          text
          v-tooltip.top="'Cercle'"
        >
          <i class="pi pi-circle"></i>
        </Button>
      </div>

      <!-- Couleurs -->
      <div class="flex items-center gap-2 border-r border-gray-300 dark:border-gray-600 pr-3">
        <div class="text-sm font-medium">Couleur:</div>
        <div class="flex gap-1">
          <button
            v-for="color in colors"
            :key="color"
            @click="setColor(color)"
            :class="[
              'w-6 h-6 rounded-full border-2 transition-all',
              currentColor === color ? 'border-gray-800 dark:border-white scale-110' : 'border-gray-300 dark:border-gray-600'
            ]"
            :style="{ backgroundColor: color }"
            :title="color"
          ></button>
        </div>
      </div>

      <!-- Taille du pinceau -->
      <div class="flex items-center gap-2 border-r border-gray-300 dark:border-gray-600 pr-3">
        <span class="text-sm font-medium">Taille:</span>
        <input
          v-model.number="brushSize"
          type="range"
          min="1"
          max="20"
          class="w-20"
        />
        <span class="text-sm w-6">{{ brushSize }}</span>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <Button
          @click="clearCanvas"
          class="!p-2 !w-10 !h-10 rounded-lg !bg-red-500 !text-white"
          v-tooltip.top="'Effacer tout'"
        >
          <i class="pi pi-trash"></i>
        </Button>
        <Button
          @click="undo"
          :disabled="!canUndo"
          class="!p-2 !w-10 !h-10 rounded-lg"
          severity="secondary"
          v-tooltip.top="'Annuler'"
        >
          <i class="pi pi-undo"></i>
        </Button>
      </div>

      <!-- Collaborateurs -->
      <div v-if="collaborators.length > 0" class="flex items-center gap-2 ml-auto">
        <span class="text-sm text-gray-600 dark:text-gray-400">Collaborateurs:</span>
        <div class="flex -space-x-2">
          <div
            v-for="collaborator in collaborators"
            :key="collaborator.id"
            class="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-medium"
            :style="{ backgroundColor: collaborator.color }"
            :title="collaborator.name"
          >
            {{ collaborator.name.charAt(0).toUpperCase() }}
          </div>
        </div>
      </div>
    </div>

    <!-- Canvas -->
    <div v-if="isConnected" class="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <canvas
        ref="canvasRef"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart="startDrawing"
        @touchmove="draw"
        @touchend="stopDrawing"
        class="cursor-crosshair touch-none"
        :width="canvasWidth"
        :height="canvasHeight"
      ></canvas>
      
      <!-- Overlay pour les curseurs des collaborateurs -->
      <div class="absolute inset-0 pointer-events-none">
        <div
          v-for="collaborator in collaborators"
          :key="`cursor-${collaborator.id}`"
          class="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg pointer-events-none transition-all duration-100"
          :style="{ 
            backgroundColor: collaborator.color,
            left: `${collaboratorCursors[collaborator.id]?.x || 0}px`,
            top: `${collaboratorCursors[collaborator.id]?.y || 0}px`,
            transform: 'translate(-50%, -50%)'
          }"
        >
          <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {{ collaborator.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- Erreur de connexion -->
    <div v-if="error" class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
      <div class="text-red-400 text-sm flex items-center gap-2">
        <i class="pi pi-exclamation-triangle"></i>
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import Button from 'primevue/button'
import { useYjsWhiteboard } from '../composables/useYjsWhiteboard'
import { useRoomStatus } from '../composables/useRoomStatus'

interface Props {
  roomId: string
  user: {
    id: string
    name: string
    color?: string
  }
}

const props = defineProps<Props>()

// Références DOM
const canvasRef = ref<HTMLCanvasElement>()

// état du canvas
const canvasWidth = ref(800)
const canvasHeight = ref(400)
const currentTool = ref('pen')
const currentColor = ref('#3b82f6')
const brushSize = ref(3)
const isDrawing = ref(false)
const canUndo = ref(false)

// Couleurs disponibles
const colors = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#ec4899', // pink
  '#000000', // black
]

// état de dessin local
let lastX = 0
let lastY = 0
let currentPath: Array<{ x: number; y: number }> = []

// Curseurs des collaborateurs
const collaboratorCursors = ref<Record<string, { x: number; y: number }>>({})

// Whiteboard collaboratif Yjs
const {
  isConnected,
  isConnecting,
  collaborators,
  error,
  paths,
  shapes,
  initializeWhiteboard,
  addPath,
  clearWhiteboard
} = useYjsWhiteboard(props.roomId, {
  id: props.user.id,
  name: props.user.name,
  color: props.user.color || currentColor.value
})

// Statut de collaboration
const { updateWhiteboardStatus } = useRoomStatus()

// Watcher pour mettre à jour le statut
watch([isConnected, isConnecting, error, collaborators], () => {
  updateWhiteboardStatus(
    isConnected.value,
    isConnecting.value,
    error.value,
    collaborators.value.length
  )
}, { immediate: true })

// Initialiser le whiteboard au montage
onMounted(async () => {
  await initializeWhiteboard()
  await nextTick()
  if (canvasRef.value) {
    initializeCanvas()
  }
})

// Redessiner quand les données changent
watch([paths, shapes], () => {
  redrawCanvas()
}, { deep: true })

// Initialiser le canvas
const initializeCanvas = () => {
  if (!canvasRef.value) return
  
  const rect = canvasRef.value.parentElement?.getBoundingClientRect()
  if (rect) {
    canvasWidth.value = rect.width
    canvasHeight.value = Math.max(400, rect.height)
  }
  
  redrawCanvas()
}

// Redessiner tout le canvas
const redrawCanvas = () => {
  if (!canvasRef.value) return
  
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  // Effacer le canvas
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

  // Dessiner tous les chemins
  paths.value.forEach(path => {
    if (path.points.length < 2) return

    ctx.beginPath()
    ctx.strokeStyle = path.color
    ctx.lineWidth = path.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.moveTo(path.points[0].x, path.points[0].y)
    for (let i = 1; i < path.points.length; i++) {
      ctx.lineTo(path.points[i].x, path.points[i].y)
    }
    ctx.stroke()
  })

  // Dessiner toutes les formes
  shapes.value.forEach(shape => {
    ctx.beginPath()
    ctx.strokeStyle = shape.color
    ctx.lineWidth = shape.strokeWidth

    switch (shape.type) {
      case 'rectangle':
        ctx.rect(shape.x, shape.y, shape.width, shape.height)
        break
      case 'circle':
        const radius = Math.sqrt(shape.width * shape.width + shape.height * shape.height) / 2
        ctx.arc(shape.x + shape.width / 2, shape.y + shape.height / 2, radius, 0, 2 * Math.PI)
        break
    }
    ctx.stroke()
  })
}

// Obtenir les coordonnées relatives au canvas
const getCanvasCoordinates = (event: MouseEvent | TouchEvent) => {
  if (!canvasRef.value) return { x: 0, y: 0 }
  
  const rect = canvasRef.value.getBoundingClientRect()
  let clientX: number
  let clientY: number

  if (event instanceof MouseEvent) {
    clientX = event.clientX
    clientY = event.clientY
  } else {
    clientX = event.touches[0].clientX
    clientY = event.touches[0].clientY
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
}

// Commencer à dessiner
const startDrawing = (event: MouseEvent | TouchEvent) => {
  if (!isConnected.value) return
  
  event.preventDefault()
  isDrawing.value = true
  
  const coords = getCanvasCoordinates(event)
  lastX = coords.x
  lastY = coords.y
  currentPath = [{ x: lastX, y: lastY }]
}

// Dessiner
const draw = (event: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !isConnected.value) return
  
  event.preventDefault()
  const coords = getCanvasCoordinates(event)

  if (currentTool.value === 'pen') {
    currentPath.push({ x: coords.x, y: coords.y })
    
    // Dessiner localement pour la fluidité
    drawLine(lastX, lastY, coords.x, coords.y)
  }

  lastX = coords.x
  lastY = coords.y
}

// Arrêter de dessiner
const stopDrawing = () => {
  if (!isDrawing.value) return
  
  isDrawing.value = false

  if (currentTool.value === 'pen' && currentPath.length > 1) {
    // Ajouter le chemin au document partagé
    addPath({
      tool: currentTool.value,
      color: currentColor.value,
      width: brushSize.value,
      points: currentPath
    })
  }

  currentPath = []
}

// Dessiner une ligne localement
const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
  if (!canvasRef.value) return
  
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.strokeStyle = currentColor.value
  ctx.lineWidth = brushSize.value
  ctx.lineCap = 'round'
  ctx.stroke()
}

// Actions de la barre d'outils
const setTool = (tool: string) => {
  currentTool.value = tool
}

const setColor = (color: string) => {
  currentColor.value = color
}

const clearCanvas = () => {
  clearWhiteboard()
}

const undo = () => {
  // Logique d'annulation (simplifiée)
  if (paths.value.length > 0) {
    // Pour une vraie implémentation, il faudrait gérer un historique
    console.log('Undo pas encore implémenté pour la collaboration')
  }
}
</script>

<style scoped>
/* Styles pour le canvas et les outils */
.cursor-crosshair {
  cursor: crosshair;
}

/* Couleurs brand */
.bg-brand-500 {
  background-color: #3b82f6;
}

.text-brand-500 {
  color: #3b82f6;
}

/* Animation pour les curseurs collaboratifs */
.transition-all {
  transition: all 0.1s ease-out;
}

/* Responsive canvas */
@media (max-width: 768px) {
  .flex-wrap {
    flex-direction: column;
    align-items: stretch;
  }
  
  .border-r {
    border-right: none;
    border-bottom: 1px solid;
    padding-bottom: 0.75rem;
    margin-bottom: 0.75rem;
  }
}
</style>
