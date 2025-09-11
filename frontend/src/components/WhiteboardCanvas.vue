<template>
  <div class="whiteboard relative select-none">
    <div class="glass-panel p-4 mb-4">
      <div class="flex items-center gap-3 mb-4 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-white/90">Couleur:</span>
          <input type="color" v-model="state.color" class="w-10 h-10 rounded-lg cursor-pointer border-2 border-white/20" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-white/90">Taille:</span>
          <input type="range" min="2" max="32" v-model.number="state.size" class="w-24" />
          <span class="text-sm text-white/70 w-8">{{ state.size }}</span>
        </div>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <button 
          @click="state.mode='draw'" 
          :class="['btn-glass-primary', state.mode === 'draw' ? 'ring-2 ring-blue-400' : '']"
        >
          <i class="pi pi-pencil mr-2"></i>
          Crayon
        </button>
        <button 
          @click="state.mode='erase'" 
          :class="['btn-glass-danger', state.mode === 'erase' ? 'ring-2 ring-red-400' : '']"
        >
          <i class="pi pi-eraser mr-2"></i>
          Gomme
        </button>
        <button @click="clearBoard" class="btn-glass-warning">
          <i class="pi pi-trash mr-2"></i>
          Effacer tout
        </button>
        <div class="badge-glass-info ml-auto">
          {{ strokes.length }} trait{{ strokes.length > 1 ? 's' : '' }}
        </div>
      </div>
    </div>
    <div class="glass-panel p-2">
      <canvas ref="canvasEl" class="w-full h-[500px] rounded-lg bg-white touch-none"></canvas>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import Button from 'primevue/button'

interface StrokePoint { x: number; y: number }
interface Stroke { id: string; color: string; size: number; points: StrokePoint[] }

const canvasEl = ref<HTMLCanvasElement|null>(null)
const ctx = ref<CanvasRenderingContext2D|null>(null)
const drawing = ref(false)
const strokes = ref<Stroke[]>([])
const currentStroke = ref<Stroke|null>(null)

const state = reactive({ color: '#2563eb', size: 6, mode: 'draw' as 'draw'|'erase' })

function resizeCanvas() {
  if (!canvasEl.value) return
  const rect = canvasEl.value.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  canvasEl.value.width = rect.width * dpr
  canvasEl.value.height = rect.height * dpr
  const context = canvasEl.value.getContext('2d')
  if (context) {
    context.scale(dpr, dpr)
    ctx.value = context
    redraw()
  }
}

function start(e: PointerEvent) {
  drawing.value = true
  const p = pointFromEvent(e)
  currentStroke.value = { 
    id: crypto.randomUUID(), 
    color: state.mode === 'draw' ? state.color : '#ffffff', 
    size: state.size, 
    points: [p] 
  }
}
function move(e: PointerEvent) {
  if (!drawing.value || !currentStroke.value) return
  const p = pointFromEvent(e)
  currentStroke.value.points.push(p)
  drawSegment(currentStroke.value)
}
function end() {
  if (currentStroke.value) strokes.value.push(currentStroke.value)
  currentStroke.value = null
  drawing.value = false
}

function pointFromEvent(e: PointerEvent): StrokePoint {
  if (!canvasEl.value) return { x: 0, y: 0 }
  const rect = canvasEl.value.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function drawSegment(stroke: Stroke) {
  if (!ctx.value) return
  const pts = stroke.points
  const l = pts.length
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'
  ctx.value.strokeStyle = stroke.color
  ctx.value.lineWidth = stroke.size
  ctx.value.beginPath()
  if (l === 1) {
    ctx.value.arc(pts[0].x, pts[0].y, stroke.size / 2, 0, Math.PI * 2)
    ctx.value.fillStyle = stroke.color
    ctx.value.fill()
  } else {
    ctx.value.moveTo(pts[l - 2].x, pts[l - 2].y)
    ctx.value.lineTo(pts[l - 1].x, pts[l - 1].y)
    ctx.value.stroke()
  }
}

function redraw() {
  if (!ctx.value) return
  ctx.value.clearRect(0, 0, ctx.value.canvas.width, ctx.value.canvas.height)
  strokes.value.forEach(drawStrokeFull)
}
function drawStrokeFull(stroke: Stroke) {
  if (!ctx.value) return
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'
  ctx.value.strokeStyle = stroke.color
  ctx.value.lineWidth = stroke.size
  ctx.value.beginPath()
  stroke.points.forEach((p, i) => {
    if (i === 0) ctx.value?.moveTo(p.x, p.y)
    else ctx.value?.lineTo(p.x, p.y)
  })
  ctx.value.stroke()
}

function clearBoard() {
  strokes.value = []
  redraw()
}

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  const c = canvasEl.value
  if (!c) return
  c.addEventListener('pointerdown', start)
  c.addEventListener('pointermove', move)
  window.addEventListener('pointerup', end)
})
</script>
<style scoped>
canvas { touch-action: none; }
</style>
