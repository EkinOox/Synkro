<template>
  <div class="flex flex-col gap-4">
    <!-- Barre d'outils -->
    <div class="flex flex-wrap items-center gap-3 p-4 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-sm backdrop-blur-sm">
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
        <Button
          @click="setTool('arrow')"
          :class="{ '!bg-brand-500 !text-white': currentTool === 'arrow' }"
          class="!p-2 !w-10 !h-10 rounded-lg"
          severity="secondary"
          text
          v-tooltip.top="'Flèche'"
        >
          <i class="pi pi-arrow-up-right"></i>
        </Button>
        <Button
          @click="setTool('text')"
          :class="{ '!bg-brand-500 !text-white': currentTool === 'text' }"
          class="!p-2 !w-10 !h-10 rounded-lg"
          severity="secondary"
          text
          v-tooltip.top="'Texte'"
        >
          <i class="pi pi-font"></i>
        </Button>
      </div>

      <!-- Couleurs -->
      <div class="flex items-center gap-2 border-r border-gray-300 dark:border-gray-600 pr-3">
        <div class="flex gap-1">
          <div
            v-for="color in colors"
            :key="color"
            @click="setColor(color)"
            :class="{ 'ring-2 ring-brand-500 ring-offset-1': currentColor === color }"
            class="w-8 h-8 rounded-lg cursor-pointer transition-all hover:scale-110 shadow-sm border border-gray-200"
            :style="{ backgroundColor: color }"
          ></div>
        </div>
        <ColorPicker v-model="currentColor" class="ml-2" />
      </div>

      <!-- Taille du trait -->
      <div class="flex items-center gap-3 border-r border-gray-300 dark:border-gray-600 pr-3">
        <i class="pi pi-circle-fill text-xs text-gray-500"></i>
        <Slider
          v-model="brushSize"
          :min="1"
          :max="50"
          class="w-24"
        />
        <span class="text-sm text-gray-600 dark:text-gray-400 min-w-[2rem]">{{ brushSize }}px</span>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <Button
          @click="undo"
          :disabled="!canUndo"
          icon="pi pi-undo"
          severity="secondary"
          text
          v-tooltip.top="'Annuler'"
        />
        <Button
          @click="redo"
          :disabled="!canRedo"
          icon="pi pi-redo"
          severity="secondary"
          text
          v-tooltip.top="'Rétablir'"
        />
        <Button
          @click="clearCanvas"
          icon="pi pi-trash"
          severity="danger"
          text
          v-tooltip.top="'Effacer tout'"
        />
        <Button
          @click="saveCanvas"
          icon="pi pi-save"
          severity="success"
          text
          v-tooltip.top="'Sauvegarder'"
        />
      </div>
    </div>

    <!-- Canvas -->
    <div class="relative bg-white rounded-xl shadow-lg overflow-hidden" ref="canvasContainer">
      <canvas
        ref="canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="handleTouch"
        @touchmove.prevent="handleTouch"
        @touchend.prevent="stopDrawing"
        class="cursor-crosshair w-full h-96"
        :style="{ cursor: getCursor() }"
      ></canvas>

      <!-- Input texte pour l'outil texte -->
      <input
        v-if="isTextInput"
        ref="textInput"
        v-model="textValue"
        @keyup.enter="addText"
        @blur="addText"
        class="absolute border-2 border-brand-500 bg-transparent outline-none"
        :style="{
          left: textPosition.x + 'px',
          top: textPosition.y + 'px',
          fontSize: brushSize + 'px',
          color: currentColor
        }"
      />
    </div>

    <!-- Participants en temps réel -->
    <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <i class="pi pi-users"></i>
      <span>{{ collaborators.length }} personne(s) dessinent en temps réel</span>
      <div class="flex gap-1 ml-2">
        <div
          v-for="collaborator in collaborators"
          :key="collaborator.id"
          class="w-3 h-3 rounded-full animate-pulse"
          :style="{ backgroundColor: collaborator.color }"
          :title="collaborator.name"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import Button from 'primevue/button'
import Slider from 'primevue/slider'
import ColorPicker from 'primevue/colorpicker'

interface Props {
  roomId: string
  user: {
    id: string
    name: string
    color: string
    avatar?: string
  }
}

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

interface Collaborator {
  id: number
  name: string
  color: string
  cursor: Point
}

const props = defineProps<Props>()

const canvas = ref<HTMLCanvasElement>()
const canvasContainer = ref<HTMLDivElement>()
const textInput = ref<HTMLInputElement>()
const ctx = ref<CanvasRenderingContext2D | null>(null)

// État du dessin
const currentTool = ref('pen')
const currentColor = ref('#000000')
const brushSize = ref(5)
const isDrawing = ref(false)
const elements = ref<DrawingElement[]>([])
const history = ref<DrawingElement[][]>([])
const historyStep = ref(-1)

// Couleurs prédéfinies
const colors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000'
]

// Texte
const isTextInput = ref(false)
const textPosition = ref({ x: 0, y: 0 })
const textValue = ref('')

// Collaboration
const collaborators = ref<Collaborator[]>([])
let socket: WebSocket

// État de l'historique
const canUndo = computed(() => historyStep.value > 0)
const canRedo = computed(() => historyStep.value < history.value.length - 1)

onMounted(() => {
  initCanvas()
  setupWebSocket()
})

onUnmounted(() => {
  socket?.close()
})

function initCanvas() {
  if (canvas.value && canvasContainer.value) {
    const rect = canvasContainer.value.getBoundingClientRect()
    canvas.value.width = rect.width
    canvas.value.height = 384 // h-96 = 24rem = 384px
    ctx.value = canvas.value.getContext('2d')
    
    if (ctx.value) {
      ctx.value.lineCap = 'round'
      ctx.value.lineJoin = 'round'
    }
  }
}

function setupWebSocket() {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
  socket = new WebSocket(`${wsUrl}/whiteboard`)
  
  socket.onopen = () => {
    // Rejoindre la room
    socket.send(JSON.stringify({
      type: 'join_room',
      roomId: props.roomId,
      user: {
        id: props.user.id,
        name: props.user.name,
        color: props.user.color
      }
    }))
  }
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    handleWebSocketMessage(data)
  }
}

function handleWebSocketMessage(data: any) {
  switch (data.type) {
    case 'drawing':
      // Dessiner l'élément reçu d'un autre utilisateur
      drawElement(data.element)
      break
    case 'cursor':
      // Mettre à jour la position du curseur d'un collaborateur
      updateCollaboratorCursor(data.userId, data.position, data.userName, data.color)
      break
    case 'clear':
      // Effacer le canvas
      clearCanvas(false)
      break
  }
}

function setTool(tool: string) {
  currentTool.value = tool
  isTextInput.value = false
}

function setColor(color: string) {
  currentColor.value = color
}

function getCursor() {
  switch (currentTool.value) {
    case 'eraser': return 'grab'
    case 'text': return 'text'
    default: return 'crosshair'
  }
}

function startDrawing(event: MouseEvent) {
  if (!canvas.value || !ctx.value) return

  const rect = canvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  if (currentTool.value === 'text') {
    startTextInput(x, y)
    return
  }

  isDrawing.value = true
  
  const newElement: DrawingElement = {
    type: currentTool.value as any,
    points: [{ x, y }],
    color: currentColor.value,
    size: brushSize.value
  }

  elements.value.push(newElement)
  saveState()
}

function draw(event: MouseEvent) {
  if (!isDrawing.value || !canvas.value || !ctx.value) return

  const rect = canvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const currentElement = elements.value[elements.value.length - 1]
  currentElement.points.push({ x, y })

  redrawCanvas()

  // Envoyer via WebSocket
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'drawing',
      roomId: props.roomId,
      element: currentElement,
      user: props.user
    }))
  }
}

function stopDrawing() {
  isDrawing.value = false
}

function handleTouch(event: TouchEvent) {
  const touch = event.touches[0]
  if (!touch) return

  const mouseEvent = new MouseEvent(event.type === 'touchstart' ? 'mousedown' : 'mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  })

  if (event.type === 'touchstart') {
    startDrawing(mouseEvent)
  } else if (event.type === 'touchmove') {
    draw(mouseEvent)
  }
}

function startTextInput(x: number, y: number) {
  textPosition.value = { x, y }
  textValue.value = ''
  isTextInput.value = true
  
  nextTick(() => {
    textInput.value?.focus()
  })
}

function addText() {
  if (!textValue.value.trim() || !ctx.value) return

  const textElement: DrawingElement = {
    type: 'text',
    points: [textPosition.value],
    color: currentColor.value,
    size: brushSize.value,
    text: textValue.value
  }

  elements.value.push(textElement)
  drawElement(textElement)
  saveState()

  isTextInput.value = false
  textValue.value = ''

  // Envoyer via WebSocket
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'drawing',
      roomId: props.roomId,
      element: textElement,
      user: props.user
    }))
  }
}

function drawElement(element: DrawingElement) {
  if (!ctx.value) return

  ctx.value.globalCompositeOperation = element.type === 'eraser' ? 'destination-out' : 'source-over'
  ctx.value.strokeStyle = element.color
  ctx.value.fillStyle = element.color
  ctx.value.lineWidth = element.size

  switch (element.type) {
    case 'pen':
    case 'eraser':
      drawFreehand(element.points)
      break
    case 'rectangle':
      drawRectangle(element.points)
      break
    case 'circle':
      drawCircle(element.points)
      break
    case 'arrow':
      drawArrow(element.points)
      break
    case 'text':
      drawText(element)
      break
  }
}

function drawFreehand(points: Point[]) {
  if (!ctx.value || points.length < 2) return

  ctx.value.beginPath()
  ctx.value.moveTo(points[0].x, points[0].y)
  
  for (let i = 1; i < points.length; i++) {
    ctx.value.lineTo(points[i].x, points[i].y)
  }
  
  ctx.value.stroke()
}

function drawRectangle(points: Point[]) {
  if (!ctx.value || points.length < 2) return

  const start = points[0]
  const end = points[points.length - 1]
  const width = end.x - start.x
  const height = end.y - start.y

  ctx.value.strokeRect(start.x, start.y, width, height)
}

function drawCircle(points: Point[]) {
  if (!ctx.value || points.length < 2) return

  const start = points[0]
  const end = points[points.length - 1]
  const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))

  ctx.value.beginPath()
  ctx.value.arc(start.x, start.y, radius, 0, 2 * Math.PI)
  ctx.value.stroke()
}

function drawArrow(points: Point[]) {
  if (!ctx.value || points.length < 2) return

  const start = points[0]
  const end = points[points.length - 1]

  // Ligne principale
  ctx.value.beginPath()
  ctx.value.moveTo(start.x, start.y)
  ctx.value.lineTo(end.x, end.y)
  ctx.value.stroke()

  // Pointe de la flèche
  const angle = Math.atan2(end.y - start.y, end.x - start.x)
  const arrowLength = 20
  const arrowAngle = Math.PI / 6

  ctx.value.beginPath()
  ctx.value.moveTo(end.x, end.y)
  ctx.value.lineTo(
    end.x - arrowLength * Math.cos(angle - arrowAngle),
    end.y - arrowLength * Math.sin(angle - arrowAngle)
  )
  ctx.value.moveTo(end.x, end.y)
  ctx.value.lineTo(
    end.x - arrowLength * Math.cos(angle + arrowAngle),
    end.y - arrowLength * Math.sin(angle + arrowAngle)
  )
  ctx.value.stroke()
}

function drawText(element: DrawingElement) {
  if (!ctx.value || !element.text) return

  ctx.value.font = `${element.size}px Arial`
  ctx.value.fillText(element.text, element.points[0].x, element.points[0].y)
}

function redrawCanvas() {
  if (!ctx.value || !canvas.value) return

  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
  
  elements.value.forEach(element => {
    drawElement(element)
  })
}

function saveState() {
  historyStep.value++
  if (historyStep.value < history.value.length) {
    history.value.length = historyStep.value
  }
  history.value.push([...elements.value])
}

function undo() {
  if (!canUndo.value) return

  historyStep.value--
  elements.value = [...history.value[historyStep.value]]
  redrawCanvas()
}

function redo() {
  if (!canRedo.value) return

  historyStep.value++
  elements.value = [...history.value[historyStep.value]]
  redrawCanvas()
}

function clearCanvas(broadcast = true) {
  elements.value = []
  if (ctx.value && canvas.value) {
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
  }
  saveState()

  if (broadcast && socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'clear',
      roomId: props.roomId,
      user: props.user
    }))
  }
}

function saveCanvas() {
  if (!canvas.value) return

  const link = document.createElement('a')
  link.download = `whiteboard-${props.roomId}.png`
  link.href = canvas.value.toDataURL()
  link.click()
}

function updateCollaboratorCursor(userId: number, position: Point, userName: string, color: string) {
  const existingIndex = collaborators.value.findIndex(c => c.id === userId)
  
  if (existingIndex !== -1) {
    collaborators.value[existingIndex].cursor = position
  } else {
    collaborators.value.push({
      id: userId,
      name: userName,
      color: color,
      cursor: position
    })
  }
}
</script>

<style scoped>
canvas {
  touch-action: none;
}
</style>
