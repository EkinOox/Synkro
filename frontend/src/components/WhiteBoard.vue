<template>
  <div class="whiteboard-container w-full h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:to-slate-900 relative overflow-hidden">

    <!-- Header avec bouton retour -->
    <div class="header-bar absolute top-4 left-4 right-4 flex justify-between items-center z-50">
      <div class="flex items-center gap-4">
        <!-- Bouton retour -->
        <Button
          @click="goBack"
          class="!p-3 !w-12 !h-12 rounded-2xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-xl hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300"
          severity="secondary"
          text
        >
          <i class="pi pi-arrow-left text-lg text-gray-700 dark:text-gray-300"></i>
        </Button>

        <!-- Titre -->
        <div class="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-xl px-6 py-3">
          <h1 class="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
            <i class="pi pi-palette text-blue-500"></i>
            Tableau Blanc Collaboratif
          </h1>
        </div>
      </div>

      <!-- Indicateur de connexion (déplacé) -->
      <div class="connection-status bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-xl p-3" :class="connectionStatusClass">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full" :class="statusDotClass"></div>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ connectionStatusText }}</span>
          <Button
            v-if="!isConnected"
            @click="reconnect"
            class="!p-1 !w-6 !h-6 ml-2"
            severity="secondary"
            text
            size="small"
          >
            <i class="pi pi-refresh text-xs text-gray-600 dark:text-gray-400"></i>
          </Button>
        </div>
      </div>
    </div>

    <!-- Panneau de collaboration (repositionné) -->
    <div
      v-if="showCollaboration"
      class="collaboration-panel absolute top-20 right-4 w-80 max-h-[calc(100vh-6rem)] bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl p-4 z-40 overflow-y-auto"
    >
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
      <div class="collaborators-list mb-4">
        <h4 class="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
          <i class="pi pi-users text-blue-400"></i>
          Collaborateurs ({{ collaborators.length }})
        </h4>

        <div class="space-y-2 mb-4">
          <div
            v-for="collaborator in collaborators"
            :key="collaborator.id"
            class="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all hover:bg-white/20"
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg"
              :style="{ backgroundColor: collaborator.color }"
            >
              {{ collaborator.name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-white/90">
                  {{ collaborator.name }}
                </span>
                <span v-if="collaborator.id === currentUserId" class="text-xs text-blue-400 font-medium bg-blue-500/20 px-2 py-1 rounded-full">
                  Vous
                </span>
              </div>
              <div class="flex items-center gap-2 text-xs text-white/60 mt-1">
                <i :class="collaborator.isActive ? 'pi pi-circle-fill text-green-400' : 'pi pi-circle text-gray-500'"></i>
                <span>{{ collaborator.isActive ? 'En ligne' : 'Hors ligne' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Partage -->
        <div class="invite-section p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
          <div class="flex items-center gap-2 mb-3">
            <i class="pi pi-share-alt text-purple-400"></i>
            <span class="text-sm font-medium text-white/90">
              Partager le tableau
            </span>
          </div>
          <div class="flex gap-2">
            <InputText
              v-model="shareLink"
              readonly
              class="flex-1 !text-xs !bg-white/10 !border-white/20 !text-white/80"
              placeholder="Lien de partage"
              size="small"
            />
            <Button
              @click="copyShareLink"
              class="!px-3 !py-2 !bg-purple-500/20 !border-purple-400/30 hover:!bg-purple-500/30 transition-all duration-300"
              severity="secondary"
              outlined
              size="small"
            >
              <i class="pi pi-copy text-xs text-purple-400"></i>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Barre d'outils principale -->
    <div class="toolbar fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl p-4 z-30">
      <div class="flex items-center gap-3">
        <!-- Outils de dessin -->
        <div class="flex items-center gap-2 border-r border-white/20 dark:border-gray-600/30 pr-3">
          <Button
            @click="setTool('pen')"
            :class="{ '!bg-blue-500/80 !text-white shadow-lg': currentTool === 'pen' }"
            class="!p-2 !w-10 !h-10 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-700/30"
            severity="secondary"
            text
          >
            <i class="pi pi-pencil text-lg"></i>
          </Button>
          <Button
            @click="setTool('eraser')"
            :class="{ '!bg-red-500/80 !text-white shadow-lg': currentTool === 'eraser' }"
            class="!p-2 !w-10 !h-10 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-700/30"
            severity="secondary"
            text
          >
            <i class="pi pi-minus-circle text-lg"></i>
          </Button>
          <Button
            @click="setTool('rectangle')"
            :class="{ '!bg-purple-500/80 !text-white shadow-lg': currentTool === 'rectangle' }"
            class="!p-2 !w-10 !h-10 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-700/30"
            severity="secondary"
            text
          >
            <i class="pi pi-stop text-lg"></i>
          </Button>
          <Button
            @click="setTool('circle')"
            :class="{ '!bg-green-500/80 !text-white shadow-lg': currentTool === 'circle' }"
            class="!p-2 !w-10 !h-10 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-700/30"
            severity="secondary"
            text
          >
            <i class="pi pi-circle text-lg"></i>
          </Button>
          <Button
            @click="setTool('text')"
            :class="{ '!bg-orange-500/80 !text-white shadow-lg': currentTool === 'text' }"
            class="!p-2 !w-10 !h-10 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-700/30"
            severity="secondary"
            text
          >
            <i class="pi pi-font text-lg"></i>
          </Button>
        </div>

        <!-- Couleurs -->
        <div class="flex items-center gap-2 border-r border-white/20 dark:border-gray-600/30 pr-3">
          <div class="flex gap-1">
            <div
              v-for="color in colors"
              :key="color"
              @click="setColor(color)"
              :class="{ 'ring-2 ring-white ring-offset-1': currentColor === color }"
              class="w-8 h-8 rounded-xl cursor-pointer transition-all hover:scale-110 shadow-lg"
              :style="{ backgroundColor: color }"
            ></div>
          </div>
          <div class="ml-2 bg-white/20 dark:bg-gray-700/20 rounded-xl p-1 backdrop-blur-sm">
            <ColorPicker
              v-model="currentColor"
            />
          </div>
        </div>

        <!-- Taille du pinceau -->
        <div class="flex items-center gap-3 border-r border-white/20 dark:border-gray-600/30 pr-3">
          <i class="pi pi-circle-fill text-sm text-gray-500 dark:text-gray-400"></i>
          <Slider
            v-model="brushSize"
            :min="1"
            :max="50"
            :step="1"
            class="w-20"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300 w-8 font-medium">{{ brushSize }}</span>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <Button
            @click="undo"
            :disabled="!canUndo"
            class="!p-2 !w-10 !h-10 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-700/30 disabled:opacity-50"
            severity="secondary"
            text
          >
            <i class="pi pi-undo text-lg"></i>
          </Button>
          <Button
            @click="redo"
            :disabled="!canRedo"
            class="!p-2 !w-10 !h-10 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-700/30 disabled:opacity-50"
            severity="secondary"
            text
          >
            <i class="pi pi-replay text-lg"></i>
          </Button>
          <Button
            @click="clearCanvas"
            class="!p-2 !w-10 !h-10 rounded-xl transition-all duration-300 hover:bg-red-500/20 text-red-600 dark:text-red-400"
            severity="secondary"
            text
          >
            <i class="pi pi-trash text-lg"></i>
          </Button>
        </div>

        <!-- Zoom -->
        <div class="flex items-center gap-2 border-l border-white/20 dark:border-gray-600/30 pl-3">
          <Button
            @click="zoomOut"
            class="!p-2 !w-10 !h-10 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-700/30"
            severity="secondary"
            text
          >
            <i class="pi pi-search-minus text-lg"></i>
          </Button>
          <span class="text-sm text-gray-700 dark:text-gray-300 w-12 text-center font-medium bg-white/20 dark:bg-gray-700/20 rounded-lg py-1">
            {{ Math.round(zoom * 100) }}%
          </span>
          <Button
            @click="zoomIn"
            class="!p-2 !w-10 !h-10 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-700/30"
            severity="secondary"
            text
          >
            <i class="pi pi-search-plus text-lg"></i>
          </Button>
          <Button
            @click="resetZoom"
            class="!p-2 !w-10 !h-10 rounded-xl transition-all duration-300 hover:bg-white/20 dark:hover:bg-gray-700/30"
            severity="secondary"
            text
          >
            <i class="pi pi-refresh text-lg"></i>
          </Button>
        </div>
      </div>
    </div>

    <!-- Canvas container -->
    <div
      ref="canvasContainer"
      class="absolute inset-0 w-full h-full overflow-hidden cursor-crosshair"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @wheel.passive="onWheel"
      @contextmenu.prevent
    >
      <!-- Grille de fond -->
      <div
        class="absolute inset-0 pointer-events-none opacity-30"
        :style="{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${panX}px ${panY}px`
        }"
      ></div>

      <canvas
        ref="canvas"
        class="absolute top-0 left-0 w-full h-full bg-white/50 backdrop-blur-sm rounded-lg shadow-inner"
        :style="{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }"
      ></canvas>

      <!-- Curseurs des collaborateurs -->
      <div class="absolute inset-0 pointer-events-none">
        <div
          v-for="(cursor, userId) in cursors"
          :key="userId"
          class="absolute transition-all duration-100 z-50"
          :style="{
            left: (cursor.x * zoom + panX) + 'px',
            top: (cursor.y * zoom + panY) + 'px',
            transform: 'translate(-50%, -50%)'
          }"
        >
          <!-- Curseur -->
          <div class="relative">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              class="drop-shadow-lg"
            >
              <path
                d="M5.65 2.15a.5.5 0 0 1 .8-.4l14.5 9a.5.5 0 0 1 0 .8l-14.5 9a.5.5 0 0 1-.8-.4V2.15z"
                :fill="cursor.color"
                stroke="white"
                stroke-width="1"
              />
            </svg>

            <!-- Nom du collaborateur -->
            <div
              class="absolute top-6 left-2 px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap"
              :style="{ backgroundColor: cursor.color }"
            >
              {{ cursor.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- Grid background (temporairement désactivée) -->
      <!--
      <div
        class="absolute inset-0 pointer-events-none"
        :style="{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${panX}px ${panY}px`
        }"
      ></div>
      -->
    </div>

    <!-- Menu flottant -->
    <div class="floating-menu fixed bottom-6 right-6 flex flex-col gap-3 z-30">
      <Button
        @click="toggleCollaboration"
        :class="{ '!bg-blue-500/80 !text-white shadow-lg': showCollaboration }"
        class="!p-3 !w-12 !h-12 rounded-2xl bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-xl hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-300"
        severity="secondary"
        text
      >
        <i class="pi pi-users text-lg"></i>
      </Button>
      <Button
        @click="saveCanvas"
        class="!p-3 !w-12 !h-12 rounded-2xl bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-xl hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-300"
        severity="secondary"
        text
      >
        <i class="pi pi-download text-lg"></i>
      </Button>
    </div>

    <!-- Saisie de texte -->
    <div
      v-if="isTextInput"
      class="text-input-overlay absolute inset-0 z-50"
      @click="finishTextInput"
    >
      <input
        ref="textInput"
        v-model="textInputValue"
        type="text"
        class="absolute bg-transparent border-none outline-none text-black font-medium"
        :style="{
          left: (textInputX * zoom + panX) + 'px',
          top: (textInputY * zoom + panY) + 'px',
          fontSize: (brushSize + 8) * zoom + 'px',
          color: currentColor
        }"
        @keyup.enter="finishTextInput"
        @click.stop
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import Button from 'primevue/button'
import Slider from 'primevue/slider'
import ColorPicker from 'primevue/colorpicker'
import InputText from 'primevue/inputtext'

// Types
interface Point {
  x: number
  y: number
}

interface DrawingElement {
  type: 'pen' | 'rectangle' | 'circle' | 'arrow' | 'line' | 'text' | 'eraser'
  points: Point[]
  color: string
  size: number
  text?: string
}

// Reactive state
const canvas = ref<HTMLCanvasElement>()
const canvasContainer = ref<HTMLDivElement>()
const textInput = ref<HTMLInputElement>()
const ctx = ref<CanvasRenderingContext2D | null>(null)

// Drawing state
const currentTool = ref<string>('pen')
const currentColor = ref('#000000')
const brushSize = ref(5)
const colors = [
  '#1F2937', // Gris foncé
  '#EF4444', // Rouge moderne
  '#10B981', // Vert émeraude
  '#3B82F6', // Bleu
  '#8B5CF6', // Violet
  '#F59E0B', // Ambre
  '#EC4899', // Rose
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316'  // Orange
]

// Canvas state
const elements = ref<DrawingElement[]>([])
const history = ref<DrawingElement[][]>([])
const historyStep = ref(-1)
const currentElement = ref<DrawingElement | null>(null)
const isDrawing = ref(false)

// Zoom and pan
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const lastPanPoint = ref({ x: 0, y: 0 })

// Text input
const isTextInput = ref(false)
const textInputValue = ref('')
const textInputX = ref(0)
const textInputY = ref(0)

// UI state
const showCollaboration = ref(false)

// Collaboration state
const isConnected = ref(false)
const connectionError = ref<string | null>(null)
const websocket = ref<WebSocket | null>(null)
const roomId = ref<string>('')
const collaborators = ref([
  {
    id: 'current-user',
    name: 'Vous',
    color: '#3B82F6',
    isActive: true
  }
])
const currentUserId = ref('current-user')
const shareLink = ref(`${window.location.origin}/whiteboard/shared/${Date.now()}`)
const cursors = ref<{ [key: string]: { x: number, y: number, color: string, name: string } }>({})

// Computed
const canUndo = computed(() => historyStep.value > 0)
const canRedo = computed(() => historyStep.value < history.value.length - 1)

// Computed pour collaboration
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
  if (isConnected.value) return 'Connecté - Collaboration active'
  if (connectionError.value) return connectionError.value
  return 'Connexion en cours...'
})

// Canvas methods
const initCanvas = () => {
  console.log('🎨 Initialisation du canvas...')

  if (!canvas.value) {
    console.error('❌ Élément canvas non trouvé')
    return
  }

  if (!canvasContainer.value) {
    console.error('❌ Container canvas non trouvé')
    return
  }

  // Utiliser les dimensions de la fenêtre complète
  const width = window.innerWidth
  const height = window.innerHeight

  console.log(`📐 Taille du canvas: ${width}x${height}`)

  // Définir les dimensions réelles du canvas
  canvas.value.width = width * 2  // Multiplier par 2 pour une meilleure résolution
  canvas.value.height = height * 2

  // Ajuster le style CSS pour l'affichage
  canvas.value.style.width = width + 'px'
  canvas.value.style.height = height + 'px'

  ctx.value = canvas.value.getContext('2d')
  if (ctx.value) {
    console.log('✅ Contexte 2D obtenu')

    // Ajuster l'échelle pour la haute résolution
    ctx.value.scale(2, 2)

    ctx.value.lineCap = 'round'
    ctx.value.lineJoin = 'round'

    // Fond transparent pour laisser voir le design derrière
    ctx.value.clearRect(0, 0, width, height)

    console.log('🎉 Canvas initialisé avec succès et prêt à dessiner!')
  } else {
    console.error('❌ Impossible d\'obtenir le contexte 2D')
  }
}

const handleResize = () => {
  // Réinitialiser le canvas lors du redimensionnement
  setTimeout(() => {
    initCanvas()
    redrawCanvas()
  }, 100)
}



// Tool methods
const setTool = (tool: string) => {
  currentTool.value = tool
  if (tool === 'text') {
    canvas.value?.style.setProperty('cursor', 'text')
  } else {
    canvas.value?.style.setProperty('cursor', 'crosshair')
  }
}

const setColor = (color: string) => {
  currentColor.value = color
}

// Drawing methods
const getMousePos = (event: MouseEvent): Point => {
  const rect = canvas.value?.getBoundingClientRect()
  if (!rect) return { x: 0, y: 0 }

  return {
    x: (event.clientX - rect.left - panX.value) / zoom.value,
    y: (event.clientY - rect.top - panY.value) / zoom.value
  }
}

const onMouseDown = (event: MouseEvent) => {
  if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
    // Middle mouse or Ctrl+click for panning
    isPanning.value = true
    lastPanPoint.value = { x: event.clientX, y: event.clientY }
    return
  }

  if (currentTool.value === 'text') {
    const pos = getMousePos(event)
    startTextInput(pos.x, pos.y)
    return
  }

  const pos = getMousePos(event)
  isDrawing.value = true

  currentElement.value = {
    type: currentTool.value as any,
    points: [pos],
    color: currentColor.value,
    size: brushSize.value,
    text: ''
  }

  if (currentTool.value === 'pen' || currentTool.value === 'eraser') {
    drawPenStroke(pos)
  }
}

const onMouseMove = (event: MouseEvent) => {
  const pos = getMousePos(event)

  // Envoyer la position du curseur aux collaborateurs (throttled)
  sendCursorPosition(pos.x, pos.y)

  if (isPanning.value) {
    const deltaX = event.clientX - lastPanPoint.value.x
    const deltaY = event.clientY - lastPanPoint.value.y
    panX.value += deltaX
    panY.value += deltaY
    lastPanPoint.value = { x: event.clientX, y: event.clientY }
    redrawCanvas()
    return
  }

  if (!isDrawing.value || !currentElement.value) return

  if (currentTool.value === 'pen' || currentTool.value === 'eraser') {
    currentElement.value.points.push(pos)
    drawPenStroke(pos)
  } else {
    // For shapes, update the end point
    if (currentElement.value.points.length > 1) {
      currentElement.value.points[1] = pos
    } else {
      currentElement.value.points.push(pos)
    }
    redrawCanvas()
    drawCurrentElement()
  }
}

const onMouseUp = () => {
  if (isPanning.value) {
    isPanning.value = false
    return
  }

  if (isDrawing.value && currentElement.value) {
    const completedElement = { ...currentElement.value }
    elements.value.push(completedElement)

    // Envoyer l'élément aux collaborateurs
    sendDrawing(completedElement)

    saveToHistory()
    currentElement.value = null
    isDrawing.value = false
  }
}

const onWheel = (event: WheelEvent) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  const newZoom = Math.max(0.1, Math.min(5, zoom.value * delta))

  // Get mouse position relative to canvas
  const rect = canvas.value?.getBoundingClientRect()
  if (rect) {
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    // Adjust pan to zoom around mouse position
    panX.value = mouseX - (mouseX - panX.value) * (newZoom / zoom.value)
    panY.value = mouseY - (mouseY - panY.value) * (newZoom / zoom.value)
  }

  zoom.value = newZoom
  redrawCanvas()
}

const drawPenStroke = (point: Point) => {
  if (!ctx.value || !currentElement.value) return

  // Configuration spéciale pour l'eraser
  if (currentElement.value.type === 'eraser') {
    ctx.value.globalCompositeOperation = 'destination-out'
    ctx.value.strokeStyle = 'rgba(0,0,0,1)'
    ctx.value.lineWidth = currentElement.value.size * 2 // Eraser plus gros
  } else {
    ctx.value.globalCompositeOperation = 'source-over'
    ctx.value.strokeStyle = currentElement.value.color
    ctx.value.lineWidth = currentElement.value.size
  }

  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'

  const points = currentElement.value.points
  if (points.length < 2) return

  ctx.value.beginPath()
  ctx.value.moveTo(points[points.length - 2].x, points[points.length - 2].y)
  ctx.value.lineTo(point.x, point.y)
  ctx.value.stroke()

  // Remettre le mode normal après l'eraser
  if (currentElement.value.type === 'eraser') {
    ctx.value.globalCompositeOperation = 'source-over'
  }
}

const drawCurrentElement = () => {
  if (!ctx.value || !currentElement.value) return

  const element = currentElement.value
  ctx.value.strokeStyle = element.color
  ctx.value.lineWidth = element.size
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'

  switch (element.type) {
    case 'rectangle':
      if (element.points.length >= 2) {
        const start = element.points[0]
        const end = element.points[1]
        ctx.value.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y)
      }
      break

    case 'circle':
      if (element.points.length >= 2) {
        const start = element.points[0]
        const end = element.points[1]
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
        ctx.value.beginPath()
        ctx.value.arc(start.x, start.y, radius, 0, 2 * Math.PI)
        ctx.value.stroke()
      }
      break
  }
}

const drawElement = (element: DrawingElement) => {
  if (!ctx.value) return

  ctx.value.strokeStyle = element.color
  ctx.value.lineWidth = element.size
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'

  switch (element.type) {
    case 'pen':
      if (element.points.length > 1) {
        ctx.value.beginPath()
        ctx.value.moveTo(element.points[0].x, element.points[0].y)
        for (let i = 1; i < element.points.length; i++) {
          ctx.value.lineTo(element.points[i].x, element.points[i].y)
        }
        ctx.value.stroke()
      }
      break

    case 'eraser':
      if (element.points.length > 1) {
        ctx.value.globalCompositeOperation = 'destination-out'
        ctx.value.strokeStyle = 'rgba(0,0,0,1)'
        ctx.value.lineWidth = element.size * 2
        ctx.value.beginPath()
        ctx.value.moveTo(element.points[0].x, element.points[0].y)
        for (let i = 1; i < element.points.length; i++) {
          ctx.value.lineTo(element.points[i].x, element.points[i].y)
        }
        ctx.value.stroke()
        ctx.value.globalCompositeOperation = 'source-over'
      }
      break

    case 'rectangle':
      if (element.points.length >= 2) {
        const start = element.points[0]
        const end = element.points[1]
        ctx.value.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y)
      }
      break

    case 'circle':
      if (element.points.length >= 2) {
        const start = element.points[0]
        const end = element.points[1]
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
        ctx.value.beginPath()
        ctx.value.arc(start.x, start.y, radius, 0, 2 * Math.PI)
        ctx.value.stroke()
      }
      break

    case 'text':
      if (element.text && element.points.length > 0) {
        ctx.value.font = `${element.size + 8}px Arial`
        ctx.value.fillStyle = element.color
        ctx.value.fillText(element.text, element.points[0].x, element.points[0].y)
      }
      break
  }
}

const redrawCanvas = () => {
  if (!ctx.value || !canvas.value) return

  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)

  elements.value.forEach(element => {
    drawElement(element)
  })

  if (currentElement.value && isDrawing.value) {
    drawCurrentElement()
  }
}

// Text methods
const startTextInput = (x: number, y: number) => {
  isTextInput.value = true
  textInputX.value = x
  textInputY.value = y
  textInputValue.value = ''

  nextTick(() => {
    textInput.value?.focus()
  })
}

const finishTextInput = () => {
  if (textInputValue.value.trim()) {
    const textElement: DrawingElement = {
      type: 'text',
      points: [{ x: textInputX.value, y: textInputY.value }],
      color: currentColor.value,
      size: brushSize.value,
      text: textInputValue.value
    }

    elements.value.push(textElement)
    sendDrawing(textElement)
    saveToHistory()
  }

  isTextInput.value = false
  textInputValue.value = ''
}

// History methods
const saveToHistory = () => {
  history.value = history.value.slice(0, historyStep.value + 1)
  history.value.push([...elements.value])
  historyStep.value++

  // Limit history size
  if (history.value.length > 50) {
    history.value.shift()
    historyStep.value--
  }
}

const undo = () => {
  if (canUndo.value) {
    historyStep.value--
    elements.value = [...history.value[historyStep.value]]
    redrawCanvas()
  }
}

const redo = () => {
  if (canRedo.value) {
    historyStep.value++
    elements.value = [...history.value[historyStep.value]]
    redrawCanvas()
  }
}

// Canvas actions
const clearCanvas = (fromRemote = false) => {
  elements.value = []
  saveToHistory()
  redrawCanvas()

  // Envoyer l'action aux collaborateurs (sauf si c'est déjà une action distante)
  if (!fromRemote && isConnected.value) {
    sendMessage({
      type: 'canvas_cleared'
    })
  }
}

const saveCanvas = () => {
  if (!canvas.value) return

  const link = document.createElement('a')
  link.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.png`
  link.href = canvas.value.toDataURL()
  link.click()
}

// Zoom methods
const zoomIn = () => {
  zoom.value = Math.min(5, zoom.value * 1.2)
  redrawCanvas()
}

const zoomOut = () => {
  zoom.value = Math.max(0.1, zoom.value / 1.2)
  redrawCanvas()
}

const resetZoom = () => {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
  redrawCanvas()
}

// Lifecycle
onMounted(async () => {
  // Attendre que le DOM soit complètement rendu
  await nextTick()

  // Initialiser le canvas avec un délai pour s'assurer que les éléments sont visibles
  setTimeout(() => {
    initCanvas()
    console.log('Canvas initialisé')
  }, 100)

  initCollaboration()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  // Fermer la connexion WebSocket
  if (websocket.value) {
    websocket.value.close()
  }
})

// UI Methods
const toggleCollaboration = () => {
  showCollaboration.value = !showCollaboration.value
}

// Navigation
const goBack = () => {
  // Utiliser le router Vue pour revenir à la page précédente
  window.history.length > 1 ? window.history.back() : (window.location.href = '/')
}

// Collaboration methods
const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value)
    console.log('Lien copié dans le presse-papier')
  } catch (error) {
    console.error('Erreur lors de la copie:', error)
  }
}

// ===== FONCTIONS DE COLLABORATION =====

// Génération d'un ID unique pour les salles
const generateRoomId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// Initialisation de la collaboration
const initCollaboration = () => {
  // Générer ou récupérer l'ID de la salle depuis l'URL
  const urlParams = new URLSearchParams(window.location.search)
  const urlRoomId = urlParams.get('room') || urlParams.get('share')

  if (urlRoomId) {
    roomId.value = urlRoomId
  } else {
    roomId.value = generateRoomId()
    // Mettre à jour l'URL sans recharger la page
    const newUrl = `${window.location.pathname}?room=${roomId.value}`
    window.history.replaceState({}, '', newUrl)
  }

  // Mettre à jour le lien de partage
  shareLink.value = `${window.location.origin}/whiteboard?room=${roomId.value}`

  // Activer la connexion WebSocket
  console.log('🎨 Initialisation de la collaboration pour la room:', roomId.value)
  connectToRoom()
}

// Connexion WebSocket
const connectToRoom = () => {
  try {
    // URL du WebSocket - port 3002 comme configuré dans le serveur
    const wsUrl = `ws://localhost:3002/whiteboard`
    console.log('🔗 Tentative de connexion à:', wsUrl)

    websocket.value = new WebSocket(wsUrl)

    websocket.value.onopen = () => {
      console.log('✅ Connexion WebSocket établie')
      isConnected.value = true
      connectionError.value = null

      // Rejoindre la salle avec les informations utilisateur
      sendMessage({
        type: 'join_room',
        roomId: roomId.value,
        user: {
          id: currentUserId.value,
          name: 'Utilisateur ' + Math.floor(Math.random() * 1000),
          color: generateUserColor()
        }
      })
    }

    websocket.value.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        console.log('📨 Message reçu:', message.type)
        handleWebSocketMessage(message)
      } catch (error) {
        console.error('Erreur parsing message WebSocket:', error)
      }
    }

    websocket.value.onclose = (event) => {
      console.log('📌 Connexion WebSocket fermée', event.code, event.reason)
      isConnected.value = false

      // Reconnexion automatique seulement si ce n'est pas une fermeture intentionnelle
      if (event.code !== 1000) {
        setTimeout(() => {
          if (!isConnected.value && websocket.value?.readyState === WebSocket.CLOSED) {
            console.log('🔄 Tentative de reconnexion...')
            connectToRoom()
          }
        }, 3000)
      }
    }

    websocket.value.onerror = (error) => {
      console.error('❌ Erreur WebSocket:', error)
      connectionError.value = 'Erreur de connexion'
      isConnected.value = false
    }

  } catch (error) {
    console.error('💥 Impossible de se connecter au WebSocket:', error)
    connectionError.value = 'Service de collaboration indisponible'
    isConnected.value = false
  }
}

// Génération d'une couleur utilisateur aléatoire
const generateUserColor = () => {
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16']
  return colors[Math.floor(Math.random() * colors.length)]
}

// Envoi d'un message WebSocket
const sendMessage = (message: any) => {
  if (websocket.value && websocket.value.readyState === WebSocket.OPEN) {
    websocket.value.send(JSON.stringify(message))
  }
}

// Gestion des messages WebSocket reçus
const handleWebSocketMessage = (message: any) => {
  switch (message.type) {
    case 'user_joined':
      addCollaborator(message.user)
      break

    case 'user_left':
      removeCollaborator(message.userId)
      break

    case 'drawing_update':
      applyRemoteDrawing(message.data)
      break

    case 'cursor_move':
      updateRemoteCursor(message.userId, message.position, message.user)
      break

    case 'canvas_cleared':
      clearCanvas(true) // Marquer comme action distante
      break

    case 'collaborators_list':
      collaborators.value = message.collaborators
      break

    case 'canvas_sync':
      // Synchroniser avec l'historique existant
      elements.value = message.elements || []
      redrawCanvas()
      break

    default:
      console.log('Message non géré:', message)
  }
}

// Ajouter un collaborateur
const addCollaborator = (user: any) => {
  const existingIndex = collaborators.value.findIndex(c => c.id === user.id)
  if (existingIndex === -1) {
    collaborators.value.push({
      id: user.id,
      name: user.name,
      color: user.color,
      isActive: true
    })
  }
}

// Supprimer un collaborateur
const removeCollaborator = (userId: string) => {
  const index = collaborators.value.findIndex(c => c.id === userId)
  if (index > -1) {
    collaborators.value.splice(index, 1)
  }
  // Supprimer le curseur
  if (cursors.value[userId]) {
    delete cursors.value[userId]
  }
}

// Mettre à jour le curseur d'un collaborateur distant
const updateRemoteCursor = (userId: string, position: { x: number, y: number }, user: any) => {
  if (userId !== currentUserId.value) {
    cursors.value[userId] = {
      x: position.x,
      y: position.y,
      color: user.color,
      name: user.name
    }

    // Supprimer le curseur après 2 secondes d'inactivité
    setTimeout(() => {
      if (cursors.value[userId]) {
        delete cursors.value[userId]
      }
    }, 2000)
  }
}

// Appliquer un dessin distant
const applyRemoteDrawing = (drawingData: any) => {
  // Ajouter l'élément sans le synchroniser à nouveau
  elements.value.push(drawingData.element)
  redrawCanvas()
}

// Envoyer les mouvements de curseur avec throttle
let lastCursorUpdate = 0
const sendCursorPosition = (x: number, y: number) => {
  const now = Date.now()
  if (isConnected.value && now - lastCursorUpdate > 50) { // Limite à 20 FPS
    lastCursorUpdate = now
    sendMessage({
      type: 'cursor_move',
      userId: currentUserId.value,
      position: { x, y },
      user: {
        name: collaborators.value.find(c => c.id === currentUserId.value)?.name || 'Utilisateur',
        color: collaborators.value.find(c => c.id === currentUserId.value)?.color || '#3B82F6'
      }
    })
  }
}

// Envoyer un dessin
const sendDrawing = (element: any) => {
  if (isConnected.value) {
    sendMessage({
      type: 'drawing_update',
      data: { element }
    })
  }
}

// Reconnexion manuelle
const reconnect = () => {
  if (websocket.value) {
    websocket.value.close()
  }
  connectionError.value = null
  connectToRoom()
}



// Initialize history with empty state
saveToHistory()
</script>

<style scoped>
.whiteboard-container {
  user-select: none;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header-bar {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.toolbar {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.collaboration-panel {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.floating-menu {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.floating-menu button {
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.text-input-overlay {
  pointer-events: none;
}

.text-input-overlay input {
  pointer-events: all;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 4px 8px;
}

/* Animation pour les outils sélectionnés */
:deep(.toolbar button:has(.pi)) {
  transition: all 0.3s ease;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Smooth transitions */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Canvas styles */
canvas {
  image-rendering: auto;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
}

/* Scrollbar personnalisé */
.collaboration-panel::-webkit-scrollbar {
  width: 6px;
}

.collaboration-panel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.collaboration-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.collaboration-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
