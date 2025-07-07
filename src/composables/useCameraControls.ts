import { ref, onMounted, onUnmounted, Ref, computed } from 'vue'

interface CameraOptions {
  minZoom?: number
  maxZoom?: number
  zoomSpeed?: number
  panSpeed?: number
  defaultZoom?: number
  bounds?: {
    minX?: number
    maxX?: number
    minY?: number
    maxY?: number
  }
}

export function useCameraControls(
  containerRef: Ref<HTMLElement | null>,
  options: CameraOptions = {}
) {
  const {
    minZoom = 0.1,
    maxZoom = 3,
    zoomSpeed = 0.1,
    panSpeed = 1,
    defaultZoom = 1,
    bounds = {}
  } = options

  // Camera state
  const zoom = ref(defaultZoom)
  const panX = ref(0)
  const panY = ref(0)
  const isPanning = ref(false)

  // Mouse state for panning
  const lastMouseX = ref(0)
  const lastMouseY = ref(0)

  // Computed transform string
  const transform = computed(() => {
    return `translate(${panX.value}px, ${panY.value}px) scale(${zoom.value})`
  })

  // Zoom functions
  const zoomIn = () => {
    zoom.value = Math.min(zoom.value + zoomSpeed, maxZoom)
  }

  const zoomOut = () => {
    zoom.value = Math.max(zoom.value - zoomSpeed, minZoom)
  }

  const resetZoom = () => {
    zoom.value = defaultZoom
  }

  const setZoom = (value: number) => {
    zoom.value = Math.max(minZoom, Math.min(value, maxZoom))
  }

  // Pan functions
  const resetPan = () => {
    panX.value = 0
    panY.value = 0
  }

  const resetCamera = () => {
    resetZoom()
    resetPan()
  }

  // Fit content to view
  const fitToView = () => {
    if (!containerRef.value) return
    
    const container = containerRef.value
    const content = container.querySelector('.camera-content') as HTMLElement
    if (!content) return

    const containerRect = container.getBoundingClientRect()
    const contentRect = content.getBoundingClientRect()

    const scaleX = containerRect.width / contentRect.width
    const scaleY = containerRect.height / contentRect.height
    const scale = Math.min(scaleX, scaleY) * 0.9 // 90% to leave some margin

    zoom.value = Math.max(minZoom, Math.min(scale, maxZoom))
    resetPan()
  }

  // Mouse wheel zoom
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    
    const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed
    const newZoom = Math.max(minZoom, Math.min(zoom.value + delta, maxZoom))
    
    // Zoom towards mouse position
    if (containerRef.value) {
      const rect = containerRef.value.getBoundingClientRect()
      const mouseX = e.clientX - rect.left - rect.width / 2
      const mouseY = e.clientY - rect.top - rect.height / 2
      
      const zoomRatio = newZoom / zoom.value
      panX.value = mouseX + (panX.value - mouseX) * zoomRatio
      panY.value = mouseY + (panY.value - mouseY) * zoomRatio
    }
    
    zoom.value = newZoom
  }

  // Mouse drag panning
  const handleMouseDown = (e: MouseEvent) => {
    // Only pan with left mouse button
    if (e.button !== 0) return
    
    isPanning.value = true
    lastMouseX.value = e.clientX
    lastMouseY.value = e.clientY
    
    if (containerRef.value) {
      containerRef.value.style.cursor = 'grabbing'
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPanning.value) return
    
    const deltaX = e.clientX - lastMouseX.value
    const deltaY = e.clientY - lastMouseY.value
    
    panX.value += deltaX * panSpeed
    panY.value += deltaY * panSpeed
    
    // Apply bounds if specified
    if (bounds.minX !== undefined) panX.value = Math.max(panX.value, bounds.minX)
    if (bounds.maxX !== undefined) panX.value = Math.min(panX.value, bounds.maxX)
    if (bounds.minY !== undefined) panY.value = Math.max(panY.value, bounds.minY)
    if (bounds.maxY !== undefined) panY.value = Math.min(panY.value, bounds.maxY)
    
    lastMouseX.value = e.clientX
    lastMouseY.value = e.clientY
  }

  const handleMouseUp = () => {
    isPanning.value = false
    
    if (containerRef.value) {
      containerRef.value.style.cursor = 'grab'
    }
  }

  // Touch support for mobile
  let touchStartDistance = 0
  let touchStartZoom = 1

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom start
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      touchStartDistance = Math.sqrt(dx * dx + dy * dy)
      touchStartZoom = zoom.value
    } else if (e.touches.length === 1) {
      // Pan start
      isPanning.value = true
      lastMouseX.value = e.touches[0].clientX
      lastMouseY.value = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    
    if (e.touches.length === 2) {
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const scale = distance / touchStartDistance
      
      zoom.value = Math.max(minZoom, Math.min(touchStartZoom * scale, maxZoom))
    } else if (e.touches.length === 1 && isPanning.value) {
      // Pan
      const deltaX = e.touches[0].clientX - lastMouseX.value
      const deltaY = e.touches[0].clientY - lastMouseY.value
      
      panX.value += deltaX * panSpeed
      panY.value += deltaY * panSpeed
      
      lastMouseX.value = e.touches[0].clientX
      lastMouseY.value = e.touches[0].clientY
    }
  }

  const handleTouchEnd = () => {
    isPanning.value = false
  }

  // Setup event listeners
  onMounted(() => {
    if (!containerRef.value) return
    
    const container = containerRef.value
    container.style.cursor = 'grab'
    container.style.userSelect = 'none'
    container.style.touchAction = 'none'
    
    // Mouse events
    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    // Touch events
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)
  })

  onUnmounted(() => {
    if (!containerRef.value) return
    
    const container = containerRef.value
    container.removeEventListener('wheel', handleWheel)
    container.removeEventListener('mousedown', handleMouseDown)
    container.removeEventListener('touchstart', handleTouchStart)
    container.removeEventListener('touchmove', handleTouchMove)
    container.removeEventListener('touchend', handleTouchEnd)
    
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  })

  return {
    // State
    zoom,
    panX,
    panY,
    transform,
    isPanning,
    
    // Methods
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    resetPan,
    resetCamera,
    fitToView
  }
}