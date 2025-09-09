<template>
  <div class="advanced-tools">
    <!-- Panneau d'outils avancés -->
    <div class="tools-panel bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl p-4 max-w-md">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
        <i class="pi pi-cog text-blue-500"></i>
        Outils Avancés
      </h3>

      <!-- Layers -->
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

      <!-- Brush settings -->
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
          <div class="flex gap-2">
            <label class="text-xs text-gray-600 dark:text-gray-400 flex items-center">
              <input
                type="checkbox"
                v-model="pressureSensitive"
                class="mr-2"
              />
              Pression
            </label>
            <label class="text-xs text-gray-600 dark:text-gray-400 flex items-center">
              <input
                type="checkbox"
                v-model="smoothing"
                class="mr-2"
              />
              Lissage
            </label>
          </div>
        </div>
      </div>

      <!-- Grid and snapping -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Grille & Magnétisme</h4>
        <div class="space-y-3">
          <div class="flex gap-2">
            <label class="text-xs text-gray-600 dark:text-gray-400 flex items-center">
              <input
                type="checkbox"
                v-model="showGrid"
                class="mr-2"
              />
              Afficher la grille
            </label>
            <label class="text-xs text-gray-600 dark:text-gray-400 flex items-center">
              <input
                type="checkbox"
                v-model="snapToGrid"
                class="mr-2"
              />
              Magnétisme
            </label>
          </div>
          <div>
            <label class="text-xs text-gray-600 dark:text-gray-400">Taille grille</label>
            <InputNumber
              v-model="gridSize"
              :min="5"
              :max="50"
              :step="5"
              class="w-full mt-1"
              size="small"
            />
          </div>
        </div>
      </div>

      <!-- Export options -->
      <div class="mb-6">
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

      <!-- Templates -->
      <div class="mb-4">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Modèles</h4>
        <div class="grid grid-cols-3 gap-2">
          <Button
            v-for="template in templates"
            :key="template.id"
            @click="loadTemplate(template.id)"
            class="!p-2 aspect-square flex flex-col items-center justify-center"
            severity="secondary"
            outlined
            size="small"
          >
            <i :class="template.icon" class="text-lg mb-1"></i>
            <span class="text-xs">{{ template.name }}</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from 'primevue/button'
import Slider from 'primevue/slider'
import InputNumber from 'primevue/inputnumber'

// Interface pour les calques
interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
}

// Interface pour les modèles
interface Template {
  id: string
  name: string
  icon: string
  elements: any[]
}

// Props et émissions
const emit = defineEmits([
  'brushSettingsChanged',
  'gridSettingsChanged',
  'layerChanged',
  'templateLoaded',
  'export'
])

// État des calques
const layers = ref<Layer[]>([
  { id: '1', name: 'Calque 1', visible: true, locked: false }
])

// Paramètres du pinceau
const brushOpacity = ref(100)
const brushHardness = ref(80)
const pressureSensitive = ref(false)
const smoothing = ref(true)

// Paramètres de grille
const showGrid = ref(true)
const snapToGrid = ref(false)
const gridSize = ref(20)

// Modèles prédéfinis
const templates = ref<Template[]>([
  {
    id: 'wireframe',
    name: 'Wireframe',
    icon: 'pi pi-th-large',
    elements: []
  },
  {
    id: 'flowchart',
    name: 'Organigramme',
    icon: 'pi pi-sitemap',
    elements: []
  },
  {
    id: 'mindmap',
    name: 'Mind Map',
    icon: 'pi pi-share-alt',
    elements: []
  },
  {
    id: 'diagram',
    name: 'Diagramme',
    icon: 'pi pi-chart-line',
    elements: []
  },
  {
    id: 'presentation',
    name: 'Présentation',
    icon: 'pi pi-desktop',
    elements: []
  },
  {
    id: 'blank',
    name: 'Vierge',
    icon: 'pi pi-file',
    elements: []
  }
])

// Méthodes des calques
const addLayer = () => {
  const newLayer: Layer = {
    id: Date.now().toString(),
    name: `Calque ${layers.value.length + 1}`,
    visible: true,
    locked: false
  }
  layers.value.push(newLayer)
  emit('layerChanged', { action: 'add', layer: newLayer })
}

const deleteLayer = (layerId: string) => {
  if (layers.value.length > 1) {
    const index = layers.value.findIndex(l => l.id === layerId)
    if (index > -1) {
      const layer = layers.value[index]
      layers.value.splice(index, 1)
      emit('layerChanged', { action: 'delete', layer })
    }
  }
}

const toggleLayerVisibility = (layerId: string) => {
  const layer = layers.value.find(l => l.id === layerId)
  if (layer) {
    layer.visible = !layer.visible
    emit('layerChanged', { action: 'toggle', layer })
  }
}

// Méthodes d'export
const exportAsPNG = () => {
  emit('export', { format: 'png' })
}

const exportAsSVG = () => {
  emit('export', { format: 'svg' })
}

const exportAsPDF = () => {
  emit('export', { format: 'pdf' })
}

const exportAsJSON = () => {
  emit('export', { format: 'json' })
}

// Charger un modèle
const loadTemplate = (templateId: string) => {
  const template = templates.value.find(t => t.id === templateId)
  if (template) {
    emit('templateLoaded', template)
  }
}

// Watchers pour émettre les changements
watch([brushOpacity, brushHardness, pressureSensitive, smoothing], () => {
  emit('brushSettingsChanged', {
    opacity: brushOpacity.value,
    hardness: brushHardness.value,
    pressureSensitive: pressureSensitive.value,
    smoothing: smoothing.value
  })
})

watch([showGrid, snapToGrid, gridSize], () => {
  emit('gridSettingsChanged', {
    showGrid: showGrid.value,
    snapToGrid: snapToGrid.value,
    gridSize: gridSize.value
  })
})
</script>

<style scoped>
.advanced-tools {
  position: absolute;
  top: 4rem;
  right: 4rem;
  z-index: 40;
  max-height: calc(100vh - 8rem);
  overflow-y: auto;
}

.tools-panel {
  min-width: 280px;
}

/* Scrollbar styling */
.advanced-tools::-webkit-scrollbar {
  width: 6px;
}

.advanced-tools::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.advanced-tools::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.advanced-tools::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>
