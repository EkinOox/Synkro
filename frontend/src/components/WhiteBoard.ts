// Types et interfaces pour le Whiteboard
export interface Point {
  x: number
  y: number
}

export interface DrawingElement {
  id: string
  type: 'pen' | 'rectangle' | 'circle' | 'arrow' | 'line' | 'text'
  points: Point[]
  color: string
  size: number
  text?: string
  timestamp: number
}

export interface WhiteboardState {
  elements: DrawingElement[]
  zoom: number
  panX: number
  panY: number
  currentTool: string
  currentColor: string
  brushSize: number
}

// Utilitaires pour la whiteboard
export class WhiteboardUtils {
  static generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  static calculateDistance(point1: Point, point2: Point): number {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2))
  }

  static isPointInRectangle(point: Point, rect: { x: number, y: number, width: number, height: number }): boolean {
    return point.x >= rect.x &&
           point.x <= rect.x + rect.width &&
           point.y >= rect.y &&
           point.y <= rect.y + rect.height
  }

  static smoothPath(points: Point[]): Point[] {
    if (points.length < 3) return points

    const smoothed: Point[] = [points[0]]

    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const next = points[i + 1]

      smoothed.push({
        x: (prev.x + curr.x + next.x) / 3,
        y: (prev.y + curr.y + next.y) / 3
      })
    }

    smoothed.push(points[points.length - 1])
    return smoothed
  }

  static exportToJSON(state: WhiteboardState): string {
    return JSON.stringify({
      ...state,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2)
  }

  static importFromJSON(jsonData: string): WhiteboardState | null {
    try {
      const data = JSON.parse(jsonData)

      // Validate structure
      if (!data.elements || !Array.isArray(data.elements)) {
        throw new Error('Invalid whiteboard data')
      }

      return {
        elements: data.elements || [],
        zoom: data.zoom || 1,
        panX: data.panX || 0,
        panY: data.panY || 0,
        currentTool: data.currentTool || 'pen',
        currentColor: data.currentColor || '#000000',
        brushSize: data.brushSize || 2
      }
    } catch (error) {
      console.error('Failed to import whiteboard data:', error)
      return null
    }
  }

  static getBoundingBox(elements: DrawingElement[]): { x: number, y: number, width: number, height: number } | null {
    if (elements.length === 0) return null

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    elements.forEach(element => {
      element.points.forEach(point => {
        minX = Math.min(minX, point.x)
        minY = Math.min(minY, point.y)
        maxX = Math.max(maxX, point.x)
        maxY = Math.max(maxY, point.y)
      })
    })

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }
}

// Gestionnaire de collaboration temps réel
export class CollaborationManager {
  private websocket: WebSocket | null = null
  private callbacks: Map<string, Function[]> = new Map()

  connect(url: string, roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.websocket = new WebSocket(`${url}?room=${roomId}`)

        this.websocket.onopen = () => {
          console.log('Connected to collaboration server')
          resolve()
        }

        this.websocket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            this.emit(message.type, message.data)
          } catch (error) {
            console.error('Failed to parse message:', error)
          }
        }

        this.websocket.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        this.websocket.onclose = () => {
          console.log('Disconnected from collaboration server')
          this.emit('disconnect', {})
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }
  }

  sendElement(element: DrawingElement): void {
    this.send('element:add', element)
  }

  sendCursorPosition(position: Point): void {
    this.send('cursor:move', position)
  }

  sendClear(): void {
    this.send('canvas:clear', {})
  }

  private send(type: string, data: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({ type, data }))
    }
  }

  on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event)!.push(callback)
  }

  off(event: string, callback: Function): void {
    const callbacks = this.callbacks.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.callbacks.get(event) || []
    callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Callback error:', error)
      }
    })
  }
}

// Gestionnaire de raccourcis clavier
export class KeyboardManager {
  private callbacks: Map<string, Function> = new Map()
  private isListening = false

  startListening(): void {
    if (this.isListening) return

    this.isListening = true
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    document.addEventListener('keyup', this.handleKeyUp.bind(this))
  }

  stopListening(): void {
    if (!this.isListening) return

    this.isListening = false
    document.removeEventListener('keydown', this.handleKeyDown.bind(this))
    document.removeEventListener('keyup', this.handleKeyUp.bind(this))
  }

  register(combination: string, callback: Function): void {
    this.callbacks.set(combination.toLowerCase(), callback)
  }

  unregister(combination: string): void {
    this.callbacks.delete(combination.toLowerCase())
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const combination = this.getKeyCombination(event)
    const callback = this.callbacks.get(combination)

    if (callback) {
      event.preventDefault()
      callback(event)
    }
  }

  private handleKeyUp(_event: KeyboardEvent): void {
    // Handle key up events if needed
  }

  private getKeyCombination(event: KeyboardEvent): string {
    const parts: string[] = []

    if (event.ctrlKey || event.metaKey) parts.push('ctrl')
    if (event.altKey) parts.push('alt')
    if (event.shiftKey) parts.push('shift')

    parts.push(event.code.toLowerCase())

    return parts.join('+')
  }
}

// Gestionnaire de l'historique avec optimisation
export class HistoryManager {
  private history: DrawingElement[][] = []
  private currentStep = -1
  private maxSize = 50

  saveState(elements: DrawingElement[]): void {
    // Remove any redo history
    this.history = this.history.slice(0, this.currentStep + 1)

    // Add new state
    this.history.push(JSON.parse(JSON.stringify(elements)))
    this.currentStep++

    // Limit history size
    if (this.history.length > this.maxSize) {
      this.history.shift()
      this.currentStep--
    }
  }

  undo(): DrawingElement[] | null {
    if (this.canUndo()) {
      this.currentStep--
      return JSON.parse(JSON.stringify(this.history[this.currentStep]))
    }
    return null
  }

  redo(): DrawingElement[] | null {
    if (this.canRedo()) {
      this.currentStep++
      return JSON.parse(JSON.stringify(this.history[this.currentStep]))
    }
    return null
  }

  canUndo(): boolean {
    return this.currentStep > 0
  }

  canRedo(): boolean {
    return this.currentStep < this.history.length - 1
  }

  clear(): void {
    this.history = []
    this.currentStep = -1
  }

  getStepsCount(): number {
    return this.history.length
  }
}

// Gestionnaire de performance pour le canvas
export class PerformanceManager {
  private lastFrameTime = 0
  private frameCount = 0
  private fps = 0
  private isMonitoring = false

  startMonitoring(): void {
    this.isMonitoring = true
    this.monitorFrame()
  }

  stopMonitoring(): void {
    this.isMonitoring = false
  }

  getFPS(): number {
    return this.fps
  }

  private monitorFrame(): void {
    if (!this.isMonitoring) return

    const now = performance.now()
    this.frameCount++

    if (now - this.lastFrameTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFrameTime))
      this.frameCount = 0
      this.lastFrameTime = now
    }

    requestAnimationFrame(() => this.monitorFrame())
  }

  optimizeCanvas(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Optimize canvas settings for better performance
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
  }

  shouldSkipFrame(elements: DrawingElement[]): boolean {
    // Skip rendering if there are too many elements and FPS is low
    return elements.length > 1000 && this.fps < 30
  }
}
