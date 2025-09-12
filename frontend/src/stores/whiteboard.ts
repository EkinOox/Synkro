import { ref, computed } from 'vue'
import type { DrawingElement, WhiteboardState } from '../components/WhiteBoard'
import { WhiteboardUtils, HistoryManager, CollaborationManager } from '../components/WhiteBoard'

export const createWhiteboardStore = () => {
  // état principal
  const elements = ref<DrawingElement[]>([])
  const currentTool = ref('pen')
  const currentColor = ref('#000000')
  const brushSize = ref(2)
  const zoom = ref(1)
  const panX = ref(0)
  const panY = ref(0)

  // Managers
  const historyManager = new HistoryManager()
  const collaborationManager = new CollaborationManager()

  // état de collaboration
  const isCollaborating = ref(false)
  const roomId = ref<string | null>(null)
  const collaborators = ref<any[]>([])

  // Paramètres avancés
  const brushOpacity = ref(100)
  const brushHardness = ref(80)
  const pressureSensitive = ref(false)
  const smoothing = ref(true)
  const showGrid = ref(true)
  const snapToGrid = ref(false)
  const gridSize = ref(20)

  // Getters
  const canUndo = computed(() => historyManager.canUndo())
  const canRedo = computed(() => historyManager.canRedo())
  const totalElements = computed(() => elements.value.length)

  // Actions principales
  const addElement = (element: DrawingElement) => {
    element.id = WhiteboardUtils.generateId()
    element.timestamp = Date.now()
    elements.value.push(element)
    historyManager.saveState(elements.value)

    if (isCollaborating.value) {
      collaborationManager.sendElement(element)
    }
  }

  const removeElement = (elementId: string) => {
    const index = elements.value.findIndex(e => e.id === elementId)
    if (index > -1) {
      elements.value.splice(index, 1)
      historyManager.saveState(elements.value)
    }
  }

  const updateElement = (elementId: string, updates: Partial<DrawingElement>) => {
    const element = elements.value.find(e => e.id === elementId)
    if (element) {
      Object.assign(element, updates)
      historyManager.saveState(elements.value)
    }
  }

  const clearCanvas = () => {
    elements.value = []
    historyManager.saveState(elements.value)

    if (isCollaborating.value) {
      collaborationManager.sendClear()
    }
  }

  // Gestion de l'historique
  const undo = () => {
    const previousState = historyManager.undo()
    if (previousState) {
      elements.value = previousState
    }
  }

  const redo = () => {
    const nextState = historyManager.redo()
    if (nextState) {
      elements.value = nextState
    }
  }

  // Outils et paramètres
  const setTool = (tool: string) => {
    currentTool.value = tool
  }

  const setColor = (color: string) => {
    currentColor.value = color
  }

  const setBrushSize = (size: number) => {
    brushSize.value = size
  }

  const setZoom = (newZoom: number) => {
    zoom.value = Math.max(0.1, Math.min(5, newZoom))
  }

  const setPan = (x: number, y: number) => {
    panX.value = x
    panY.value = y
  }

  // Paramètres avancés
  const updateBrushSettings = (settings: {
    opacity?: number
    hardness?: number
    pressureSensitive?: boolean
    smoothing?: boolean
  }) => {
    if (settings.opacity !== undefined) brushOpacity.value = settings.opacity
    if (settings.hardness !== undefined) brushHardness.value = settings.hardness
    if (settings.pressureSensitive !== undefined) pressureSensitive.value = settings.pressureSensitive
    if (settings.smoothing !== undefined) smoothing.value = settings.smoothing
  }

  const updateGridSettings = (settings: {
    showGrid?: boolean
    snapToGrid?: boolean
    gridSize?: number
  }) => {
    if (settings.showGrid !== undefined) showGrid.value = settings.showGrid
    if (settings.snapToGrid !== undefined) snapToGrid.value = settings.snapToGrid
    if (settings.gridSize !== undefined) gridSize.value = settings.gridSize
  }

  // Collaboration
  const startCollaboration = async (newRoomId: string) => {
    try {
      await collaborationManager.connect('ws://localhost:8080/whiteboard', newRoomId)
      isCollaborating.value = true
      roomId.value = newRoomId

      // écouter les évènements de collaboration
      collaborationManager.on('element:add', (element: DrawingElement) => {
        elements.value.push(element)
      })

      collaborationManager.on('canvas:clear', () => {
        elements.value = []
      })

      collaborationManager.on('user:join', (user: any) => {
        collaborators.value.push(user)
      })

      collaborationManager.on('user:leave', (userId: string) => {
        const index = collaborators.value.findIndex(u => u.id === userId)
        if (index > -1) {
          collaborators.value.splice(index, 1)
        }
      })

    } catch (error) {
      console.error('Failed to start collaboration:', error)
      throw error
    }
  }

  const stopCollaboration = () => {
    collaborationManager.disconnect()
    isCollaborating.value = false
    roomId.value = null
    collaborators.value = []
  }

  // Import/Export
  const exportState = (): string => {
    const state: WhiteboardState = {
      elements: elements.value,
      zoom: zoom.value,
      panX: panX.value,
      panY: panY.value,
      currentTool: currentTool.value,
      currentColor: currentColor.value,
      brushSize: brushSize.value
    }
    return WhiteboardUtils.exportToJSON(state)
  }

  const importState = (jsonData: string): boolean => {
    const state = WhiteboardUtils.importFromJSON(jsonData)
    if (state) {
      elements.value = state.elements
      zoom.value = state.zoom
      panX.value = state.panX
      panY.value = state.panY
      currentTool.value = state.currentTool
      currentColor.value = state.currentColor
      brushSize.value = state.brushSize
      historyManager.saveState(elements.value)
      return true
    }
    return false
  }

  const exportAsImage = (canvas: HTMLCanvasElement, format: 'png' | 'jpeg' | 'svg' = 'png'): string => {
    if (format === 'svg') {
      // Générer du SVG basé sur les éléments
      return generateSVG()
    }
    return canvas.toDataURL(`image/${format}`)
  }

  const generateSVG = (): string => {
    const bbox = WhiteboardUtils.getBoundingBox(elements.value)
    if (!bbox) return '<svg></svg>'

    let svg = `<svg width="${bbox.width + 40}" height="${bbox.height + 40}" xmlns="http://www.w3.org/2000/svg">`
    svg += `<rect width="100%" height="100%" fill="white"/>`

    elements.value.forEach(element => {
      switch (element.type) {
        case 'pen':
          if (element.points.length > 1) {
            const pathData = element.points.map((point, index) =>
              `${index === 0 ? 'M' : 'L'} ${point.x - bbox.x + 20} ${point.y - bbox.y + 20}`
            ).join(' ')
            svg += `<path d="${pathData}" stroke="${element.color}" stroke-width="${element.size}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
          }
          break
        case 'rectangle':
          if (element.points.length >= 2) {
            const start = element.points[0]
            const end = element.points[1]
            svg += `<rect x="${Math.min(start.x, end.x) - bbox.x + 20}" y="${Math.min(start.y, end.y) - bbox.y + 20}" width="${Math.abs(end.x - start.x)}" height="${Math.abs(end.y - start.y)}" stroke="${element.color}" stroke-width="${element.size}" fill="none"/>`
          }
          break
        case 'circle':
          if (element.points.length >= 2) {
            const start = element.points[0]
            const end = element.points[1]
            const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
            svg += `<circle cx="${start.x - bbox.x + 20}" cy="${start.y - bbox.y + 20}" r="${radius}" stroke="${element.color}" stroke-width="${element.size}" fill="none"/>`
          }
          break
        case 'text':
          if (element.text && element.points.length > 0) {
            svg += `<text x="${element.points[0].x - bbox.x + 20}" y="${element.points[0].y - bbox.y + 20}" font-size="${element.size + 8}" fill="${element.color}">${element.text}</text>`
          }
          break
      }
    })

    svg += '</svg>'
    return svg
  }

  // Templates
  const loadTemplate = (templateId: string) => {
    // Charger des modèles prédéfinis
    const templates: Record<string, DrawingElement[]> = {
      'wireframe': [],
      'flowchart': [],
      'mindmap': [],
      'blank': []
    }

    const template = templates[templateId]
    if (template) {
      elements.value = [...template]
      historyManager.saveState(elements.value)
    }
  }

  // Nettoyage
  const resetState = () => {
    elements.value = []
    currentTool.value = 'pen'
    currentColor.value = '#000000'
    brushSize.value = 2
    zoom.value = 1
    panX.value = 0
    panY.value = 0
    historyManager.clear()
  }

  return {
    // état
    elements,
    currentTool,
    currentColor,
    brushSize,
    zoom,
    panX,
    panY,
    brushOpacity,
    brushHardness,
    pressureSensitive,
    smoothing,
    showGrid,
    snapToGrid,
    gridSize,
    isCollaborating,
    roomId,
    collaborators,

    // Getters
    canUndo,
    canRedo,
    totalElements,

    // Actions
    addElement,
    removeElement,
    updateElement,
    clearCanvas,
    undo,
    redo,
    setTool,
    setColor,
    setBrushSize,
    setZoom,
    setPan,
    updateBrushSettings,
    updateGridSettings,
    startCollaboration,
    stopCollaboration,
    exportState,
    importState,
    exportAsImage,
    generateSVG,
    loadTemplate,
    resetState
  }
}
