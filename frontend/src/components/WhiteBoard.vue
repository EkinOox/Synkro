<template>
  <div class="whiteboard-container w-full h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 relative overflow-hidden">

    <!-- Panneau de collaboration (gauche) -->
    <div
      v-if="showCollaboration"
      class="collaboration-panel fixed top-4 left-4 w-80 max-h-[calc(100vh-2rem)] bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl p-4 z-40 overflow-y-auto"
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
        <h4 class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
          <i class="pi pi-users text-blue-500"></i>
          Collaborateurs ({{ collaborators.length }})
        </h4>

        <div class="space-y-2 mb-4">
          <div
            v-for="collaborator in collaborators"
            :key="collaborator.id"
            class="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
              :style="{ backgroundColor: collaborator.color }"
            >
              {{ collaborator.name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {{ collaborator.name }}
                </span>
                <span v-if="collaborator.id === currentUserId" class="text-xs text-blue-500 font-medium">
                  (Vous)
                </span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <i :class="collaborator.isActive ? 'pi pi-circle-fill text-green-500' : 'pi pi-circle text-gray-400'"></i>
                <span>{{ collaborator.isActive ? 'Actif' : 'Inactif' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Partage -->
        <div class="invite-section p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div class="flex items-center gap-2 mb-2">
            <i class="pi pi-share-alt text-blue-500"></i>
            <span class="text-sm font-medium text-blue-800 dark:text-blue-300">
              Partager le tableau
            </span>
          </div>
          <div class="flex gap-2">
            <InputText
              v-model="shareLink"
              readonly
              class="flex-1 !text-xs"
              placeholder="Lien de partage"
              size="small"
            />
            <Button
              @click="copyShareLink"
              class="!px-2 !py-1"
              severity="secondary"
              outlined
              size="small"
            >
              <i class="pi pi-copy text-xs"></i>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Panneau d'outils avancés (droite) -->
    <div
      v-if="showAdvanced"
      class="advanced-tools fixed top-4 right-4 w-80 max-h-[calc(100vh-2rem)] bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl p-4 z-40 overflow-y-auto"
    >
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
        <i class="pi pi-cog text-blue-500"></i>
        Outils Avancés
      </h3>

      <!-- Calques -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Calques</h4>
        <div class="space-y-2">
          <div
            v-for="layer in layers"
            :key="layer.id"
            class="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
          >
            <Button
              @click="toggleLayerVisibility(layer.id)"
              :class="{ '!text-blue-500': layer.visible }"
              class="!p-1 !w-8 !h-8"
              severity="secondary"
              text
              size="small"
            >
              <i :class="layer.visible ? 'pi pi-eye' : 'pi pi-eye-slash'"></i>
            </Button>
            <span class="flex-1 text-sm text-gray-700 dark:text-gray-300">{{ layer.name }}</span>
            <Button
              @click="deleteLayer(layer.id)"
              class="!p-1 !w-8 !h-8 !text-red-500"
              severity="secondary"
              text
              size="small"
            >
              <i class="pi pi-trash"></i>
            </Button>
          </div>
          <Button
            @click="addLayer"
            class="w-full !py-2"
            severity="secondary"
            outlined
          >
            <i class="pi pi-plus mr-2"></i>
            Nouveau Calque
          </Button>
        </div>
      </div>

      <!-- Paramètres du pinceau -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Pinceau</h4>
        <div class="space-y-3">
          <div>
            <label class="text-xs text-gray-600 dark:text-gray-400">Opacité</label>
            <Slider
              v-model="brushOpacity"
              :min="0"
              :max="100"
              :step="5"
              class="w-full mt-1"
            />
            <span class="text-xs text-gray-500">{{ brushOpacity }}%</span>
          </div>
          <div>
            <label class="text-xs text-gray-600 dark:text-gray-400">Dureté</label>
            <Slider
              v-model="brushHardness"
              :min="0"
              :max="100"
              :step="10"
              class="w-full mt-1"
            />
            <span class="text-xs text-gray-500">{{ brushHardness }}%</span>
          </div>
        </div>
      </div>

      <!-- Export -->
      <div class="mb-4">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Export</h4>
        <div class="grid grid-cols-2 gap-2">
          <Button
            @click="exportAsPNG"
            class="!py-2"
            severity="secondary"
            outlined
            size="small"
          >
            <i class="pi pi-image mr-1"></i>
            PNG
          </Button>
          <Button
            @click="exportAsSVG"
            class="!py-2"
            severity="secondary"
            outlined
            size="small"
          >
            <i class="pi pi-file mr-1"></i>
            SVG
          </Button>
          <Button
            @click="exportAsPDF"
            class="!py-2"
            severity="secondary"
            outlined
            size="small"
          >
            <i class="pi pi-file-pdf mr-1"></i>
            PDF
          </Button>
          <Button
            @click="exportAsJSON"
            class="!py-2"
            severity="secondary"
            outlined
            size="small"
          >
            <i class="pi pi-download mr-1"></i>
            JSON
          </Button>
        </div>
      </div>
    </div>

    <!-- Toolbar principal -->
    <div class="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div class="flex items-center gap-2 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl">
        <!-- Outils de dessin -->
        <div class="flex items-center gap-1 pr-3 border-r border-gray-300/50">
          <Button
            @click="setTool('select')"
            :class="{ '!bg-blue-500 !text-white': currentTool === 'select' }"
            class="!p-2 !w-10 !h-10 rounded-lg transition-all"
            severity="secondary"
            text
          >
            <i class="pi pi-cursor text-lg"></i>
          </Button>
          <Button
            @click="setTool('pen')"
            :class="{ '!bg-blue-500 !text-white': currentTool === 'pen' }"
            class="!p-2 !w-10 !h-10 rounded-lg transition-all"
            severity="secondary"
            text
          >
            <i class="pi pi-pencil text-lg"></i>
          </Button>
          <Button
            @click="setTool('eraser')"
            :class="{ '!bg-blue-500 !text-white': currentTool === 'eraser' }"
            class="!p-2 !w-10 !h-10 rounded-lg transition-all"
            severity="secondary"
            text
          >
            <i class="pi pi-trash text-lg"></i>
          </Button>
        </div>

        <!-- Formes -->
        <div class="flex items-center gap-1 pr-3 border-r border-gray-300/50">
          <Button
            @click="setTool('rectangle')"
            :class="{ '!bg-blue-500 !text-white': currentTool === 'rectangle' }"
            class="!p-2 !w-10 !h-10 rounded-lg transition-all"
            severity="secondary"
            text
          >
            <i class="pi pi-stop text-lg"></i>
          </Button>
          <Button
            @click="setTool('circle')"
            :class="{ '!bg-blue-500 !text-white': currentTool === 'circle' }"
            class="!p-2 !w-10 !h-10 rounded-lg transition-all"
            severity="secondary"
            text
          >
            <i class="pi pi-circle text-lg"></i>
          </Button>
          <Button
            @click="setTool('arrow')"
            :class="{ '!bg-blue-500 !text-white': currentTool === 'arrow' }"
            class="!p-2 !w-10 !h-10 rounded-lg transition-all"
            severity="secondary"
            text
          >
            <i class="pi pi-arrow-up-right text-lg"></i>
          </Button>
          <Button
            @click="setTool('line')"
            :class="{ '!bg-blue-500 !text-white': currentTool === 'line' }"
            class="!p-2 !w-10 !h-10 rounded-lg transition-all"
            severity="secondary"
            text
          >
            <i class="pi pi-minus text-lg"></i>
          </Button>
        </div>

        <!-- Texte -->
        <div class="flex items-center gap-1 pr-3 border-r border-gray-300/50">
          <Button
            @click="setTool('text')"
            :class="{ '!bg-blue-500 !text-white': currentTool === 'text' }"
            class="!p-2 !w-10 !h-10 rounded-lg transition-all"
            severity="secondary"
            text
          >
            <i class="pi pi-font text-lg"></i>
          </Button>
        </div>

        <!-- Couleurs -->
        <div class="flex items-center gap-2 pr-3 border-r border-gray-300/50">
          <div class="flex gap-1">
            <div
              v-for="color in colors"
              :key="color"
              @click="setColor(color)"
              :class="{ 'ring-2 ring-blue-500': currentColor === color }"
              class="w-6 h-6 rounded-full cursor-pointer border border-gray-300 transition-all hover:scale-110"
              :style="{ backgroundColor: color }"
            ></div>
          </div>
        </div>

        <!-- Taille du pinceau -->
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Taille:</label>
          <Slider
            v-model="brushSize"
            :min="1"
            :max="20"
            :step="1"
            class="w-20"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ brushSize }}px</span>
        </div>

        <!-- Boutons de panneaux -->
        <div class="flex items-center gap-1 pl-3 border-l border-gray-300/50">
          <Button
            @click="toggleCollaboration"
            :class="{ '!bg-blue-500 !text-white': showCollaboration }"
            class="!p-2 !w-10 !h-10 rounded-lg transition-all"
            severity="secondary"
            text
          >
            <i class="pi pi-users text-lg"></i>
          </Button>
          <Button
            @click="toggleAdvanced"
            :class="{ '!bg-blue-500 !text-white': showAdvanced }"
            class="!p-2 !w-10 !h-10 rounded-lg transition-all"
            severity="secondary"
            text
          >
            <i class="pi pi-cog text-lg"></i>
          </Button>
        </div>
      </div>
    </div>

    <!-- Actions toolbar -->
    <div class="absolute top-20 right-4 z-50">
      <div class="flex flex-col gap-2 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl">
        <Button
          @click="undo"
          :disabled="!canUndo"
          class="!p-2 !w-10 !h-10 rounded-lg"
          severity="secondary"
          text
        >
          <i class="pi pi-undo text-lg"></i>
        </Button>
        <Button
          @click="redo"
          :disabled="!canRedo"
          class="!p-2 !w-10 !h-10 rounded-lg"
          severity="secondary"
          text
        >
          <i class="pi pi-refresh text-lg"></i>
        </Button>
        <div class="w-6 h-px bg-gray-300"></div>
        <Button
          @click="clearCanvas"
          class="!p-2 !w-10 !h-10 rounded-lg text-red-600 hover:!bg-red-50"
          severity="secondary"
          text
        >
          <i class="pi pi-trash text-lg"></i>
        </Button>
        <Button
          @click="saveCanvas"
          class="!p-2 !w-10 !h-10 rounded-lg text-green-600 hover:!bg-green-50"
          severity="secondary"
          text
        >
          <i class="pi pi-download text-lg"></i>
        </Button>
      </div>
    </div>

    <!-- Zoom controls -->
    <div class="absolute bottom-4 right-4 z-50">
      <div class="flex items-center gap-2 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl">
        <Button
          @click="zoomOut"
          class="!p-2 !w-10 !h-10 rounded-lg"
          severity="secondary"
          text
        >
          <i class="pi pi-minus text-lg"></i>
        </Button>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[50px] text-center">
          {{ Math.round(zoom * 100) }}%
        </span>
        <Button
          @click="zoomIn"
          class="!p-2 !w-10 !h-10 rounded-lg"
          severity="secondary"
          text
        >
          <i class="pi pi-plus text-lg"></i>
        </Button>
        <Button
          @click="resetZoom"
          class="!p-2 !w-10 !h-10 rounded-lg"
          severity="secondary"
          text
        >
          <i class="pi pi-refresh text-lg"></i>
        </Button>
      </div>
    </div>

    <!-- Canvas container -->
    <div
      ref="canvasContainer"
      class="w-full h-full overflow-hidden cursor-crosshair"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @wheel="onWheel"
      @contextmenu.prevent
    >
      <canvas
        ref="canvas"
        class="absolute"
        :style="{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }"
      ></canvas>

      <!-- Grid background -->
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

      <!-- Text input overlay -->
      <input
        v-if="isTextInput"
        ref="textInput"
        v-model="textInputValue"
        @blur="finishTextInput"
        @keydown.enter="finishTextInput"
        @keydown.escape="cancelTextInput"
        class="absolute border-2 border-blue-500 bg-transparent text-lg outline-none"
        :style="{
          left: textInputX + 'px',
          top: textInputY + 'px',
          color: currentColor,
          fontSize: brushSize + 8 + 'px'
        }"
      />
    </div>

    <!-- Loading overlay -->
    <div v-if="isLoading" class="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl">
        <ProgressSpinner class="w-8 h-8" />
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import Button from 'primevue/button'
import Slider from 'primevue/slider'
import ProgressSpinner from 'primevue/progressspinner'
import InputText from 'primevue/inputtext'

// Types
interface Point {
  x: number
  y: number
}

interface DrawingElement {
  type: 'pen' | 'rectangle' | 'circle' | 'arrow' | 'line' | 'text'
  points: Point[]
  color: string
  size: number
  text?: string
}

// Reactive state
const canvas = ref<HTMLCanvasElement>()
const canvasContainer = ref<HTMLDivElement>()
const textInput = ref<HTMLInputElement>()
const ctx = ref<CanvasRenderingContext2D>()

// Tools and drawing state
const currentTool = ref<string>('pen')
const currentColor = ref<string>('#000000')
const brushSize = ref<number>(2)
const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB']

// Canvas state
const isDrawing = ref(false)
const isPanning = ref(false)
const panX = ref(0)
const panY = ref(0)
const zoom = ref(1)
const lastPanPoint = ref<Point>({ x: 0, y: 0 })

// Drawing elements and history
const elements = ref<DrawingElement[]>([])
const history = ref<DrawingElement[][]>([])
const historyStep = ref(0)
const currentElement = ref<DrawingElement | null>(null)

// Text input
const isTextInput = ref(false)
const textInputValue = ref('')
const textInputX = ref(0)
const textInputY = ref(0)

// UI state
const isLoading = ref(false)
const showCollaboration = ref(false)
const showAdvanced = ref(false)

// Collaboration state
const isConnected = ref(false)
const connectionError = ref<string | null>(null)
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

// Advanced tools state
const layers = ref([
  { id: '1', name: 'Calque 1', visible: true }
])
const brushOpacity = ref(100)
const brushHardness = ref(80)

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
  if (isConnected.value) return 'Connecté'
  if (connectionError.value) return 'Erreur de connexion'
  return 'Connexion...'
})

// Methods
const setTool = (tool: string) => {
  currentTool.value = tool
  if (tool !== 'text') {
    finishTextInput()
  }
}

const setColor = (color: string) => {
  currentColor.value = color
}

const getMousePos = (event: MouseEvent): Point => {
  const rect = canvas.value!.getBoundingClientRect()
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

  if (currentTool.value === 'pen') {
    drawPenStroke(pos)
  }
}

const onMouseMove = (event: MouseEvent) => {
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

  const pos = getMousePos(event)

  if (currentTool.value === 'pen') {
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
    elements.value.push({ ...currentElement.value })
    saveToHistory()
    currentElement.value = null
    isDrawing.value = false
  }
}

const onWheel = (event: WheelEvent) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  const newZoom = Math.max(0.1, Math.min(5, zoom.value * delta))

  const rect = canvas.value!.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  panX.value = mouseX - (mouseX - panX.value) * (newZoom / zoom.value)
  panY.value = mouseY - (mouseY - panY.value) * (newZoom / zoom.value)

  zoom.value = newZoom
  redrawCanvas()
}

const drawPenStroke = (point: Point) => {
  if (!ctx.value || !currentElement.value) return

  ctx.value.strokeStyle = currentElement.value.color
  ctx.value.lineWidth = currentElement.value.size
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'

  const points = currentElement.value.points
  if (points.length < 2) return

  ctx.value.beginPath()
  ctx.value.moveTo(points[points.length - 2].x, points[points.length - 2].y)
  ctx.value.lineTo(point.x, point.y)
  ctx.value.stroke()
}

const drawCurrentElement = () => {
  if (!ctx.value || !currentElement.value) return

  const element = currentElement.value
  const points = element.points

  if (points.length < 2) return

  ctx.value.strokeStyle = element.color
  ctx.value.lineWidth = element.size
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'

  const start = points[0]
  const end = points[1]

  switch (element.type) {
    case 'rectangle':
      ctx.value.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y)
      break

    case 'circle':
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
      ctx.value.beginPath()
      ctx.value.arc(start.x, start.y, radius, 0, 2 * Math.PI)
      ctx.value.stroke()
      break

    case 'line':
      ctx.value.beginPath()
      ctx.value.moveTo(start.x, start.y)
      ctx.value.lineTo(end.x, end.y)
      ctx.value.stroke()
      break

    case 'arrow':
      drawArrow(start, end)
      break
  }
}

const drawArrow = (start: Point, end: Point) => {
  if (!ctx.value) return

  const headlen = 15
  const angle = Math.atan2(end.y - start.y, end.x - start.x)

  ctx.value.beginPath()
  ctx.value.moveTo(start.x, start.y)
  ctx.value.lineTo(end.x, end.y)
  ctx.value.stroke()

  // Draw arrow head
  ctx.value.beginPath()
  ctx.value.moveTo(end.x, end.y)
  ctx.value.lineTo(end.x - headlen * Math.cos(angle - Math.PI / 6), end.y - headlen * Math.sin(angle - Math.PI / 6))
  ctx.value.moveTo(end.x, end.y)
  ctx.value.lineTo(end.x - headlen * Math.cos(angle + Math.PI / 6), end.y - headlen * Math.sin(angle + Math.PI / 6))
  ctx.value.stroke()
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

    case 'line':
      if (element.points.length >= 2) {
        const start = element.points[0]
        const end = element.points[1]
        ctx.value.beginPath()
        ctx.value.moveTo(start.x, start.y)
        ctx.value.lineTo(end.x, end.y)
        ctx.value.stroke()
      }
      break

    case 'arrow':
      if (element.points.length >= 2) {
        drawArrow(element.points[0], element.points[1])
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

  if (currentElement.value && isDrawing.value && currentTool.value !== 'pen') {
    drawCurrentElement()
  }
}

const startTextInput = (x: number, y: number) => {
  finishTextInput() // Finish any existing text input

  isTextInput.value = true
  textInputValue.value = ''
  textInputX.value = x * zoom.value + panX.value
  textInputY.value = y * zoom.value + panY.value

  nextTick(() => {
    textInput.value?.focus()
  })
}

const finishTextInput = () => {
  if (!isTextInput.value || !textInputValue.value.trim()) {
    cancelTextInput()
    return
  }

  const element: DrawingElement = {
    type: 'text',
    points: [{
      x: (textInputX.value - panX.value) / zoom.value,
      y: (textInputY.value - panY.value) / zoom.value
    }],
    color: currentColor.value,
    size: brushSize.value,
    text: textInputValue.value
  }

  elements.value.push(element)
  saveToHistory()
  redrawCanvas()
  cancelTextInput()
}

const cancelTextInput = () => {
  isTextInput.value = false
  textInputValue.value = ''
}

const saveToHistory = () => {
  // Remove any redo history when adding new element
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

const clearCanvas = () => {
  elements.value = []
  saveToHistory()
  redrawCanvas()
}

const saveCanvas = () => {
  if (!canvas.value) return

  const link = document.createElement('a')
  link.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.png`
  link.href = canvas.value.toDataURL()
  link.click()
}

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

const initCanvas = () => {
  if (!canvas.value || !canvasContainer.value) return

  const container = canvasContainer.value
  canvas.value.width = container.clientWidth
  canvas.value.height = container.clientHeight

  ctx.value = canvas.value.getContext('2d')!

  // Initialize history
  history.value = [[]]
  historyStep.value = 0

  redrawCanvas()
}

const handleResize = () => {
  initCanvas()
}

onMounted(() => {
  initCanvas()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// UI Methods
const toggleCollaboration = () => {
  showCollaboration.value = !showCollaboration.value
  if (showAdvanced.value && showCollaboration.value) {
    showAdvanced.value = false
  }
}

const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
  if (showCollaboration.value && showAdvanced.value) {
    showCollaboration.value = false
  }
}

// Collaboration methods
const reconnect = () => {
  connectionError.value = null
  isConnected.value = false
  setTimeout(() => {
    isConnected.value = true
  }, 2000)
}

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value)
    console.log('Lien copié dans le presse-papier')
  } catch (error) {
    console.error('Erreur lors de la copie:', error)
  }
}

// Layer methods
const addLayer = () => {
  const newLayer = {
    id: Date.now().toString(),
    name: `Calque ${layers.value.length + 1}`,
    visible: true
  }
  layers.value.push(newLayer)
}

const deleteLayer = (layerId: string) => {
  if (layers.value.length > 1) {
    const index = layers.value.findIndex(l => l.id === layerId)
    if (index > -1) {
      layers.value.splice(index, 1)
    }
  }
}

const toggleLayerVisibility = (layerId: string) => {
  const layer = layers.value.find(l => l.id === layerId)
  if (layer) {
    layer.visible = !layer.visible
    redrawCanvas()
  }
}

// Export methods
const exportAsPNG = () => {
  if (!canvas.value) return
  const link = document.createElement('a')
  link.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.png`
  link.href = canvas.value.toDataURL('image/png')
  link.click()
}

const exportAsSVG = () => {
  const svg = generateSVG()
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.svg`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

const exportAsPDF = () => {
  // Implementation pour export PDF
  console.log('Export PDF - à implémenter')
}

const exportAsJSON = () => {
  const data = {
    elements: elements.value,
    zoom: zoom.value,
    panX: panX.value,
    panY: panY.value
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.json`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

const generateSVG = (): string => {
  if (elements.value.length === 0) return '<svg></svg>'

  // Calculer les limites
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  elements.value.forEach(element => {
    element.points.forEach(point => {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    })
  })

  const width = maxX - minX + 40
  const height = maxY - minY + 40

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`
  svg += `<rect width="100%" height="100%" fill="white"/>`

  elements.value.forEach(element => {
    switch (element.type) {
      case 'pen':
        if (element.points.length > 1) {
          const pathData = element.points.map((point, index) =>
            `${index === 0 ? 'M' : 'L'} ${point.x - minX + 20} ${point.y - minY + 20}`
          ).join(' ')
          svg += `<path d="${pathData}" stroke="${element.color}" stroke-width="${element.size}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
        }
        break
      case 'rectangle':
        if (element.points.length >= 2) {
          const start = element.points[0]
          const end = element.points[1]
          svg += `<rect x="${Math.min(start.x, end.x) - minX + 20}" y="${Math.min(start.y, end.y) - minY + 20}" width="${Math.abs(end.x - start.x)}" height="${Math.abs(end.y - start.y)}" stroke="${element.color}" stroke-width="${element.size}" fill="none"/>`
        }
        break
      case 'circle':
        if (element.points.length >= 2) {
          const start = element.points[0]
          const end = element.points[1]
          const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
          svg += `<circle cx="${start.x - minX + 20}" cy="${start.y - minY + 20}" r="${radius}" stroke="${element.color}" stroke-width="${element.size}" fill="none"/>`
        }
        break
      case 'text':
        if (element.text && element.points.length > 0) {
          svg += `<text x="${element.points[0].x - minX + 20}" y="${element.points[0].y - minY + 20}" font-size="${element.size + 8}" fill="${element.color}">${element.text}</text>`
        }
        break
    }
  })

  svg += '</svg>'
  return svg
}
</script>

<style scoped>
.whiteboard-container {
  user-select: none;
}

.cursor-crosshair {
  cursor: crosshair;
}

.cursor-crosshair.panning {
  cursor: grab;
}

.cursor-crosshair.panning:active {
  cursor: grabbing;
}
</style>
