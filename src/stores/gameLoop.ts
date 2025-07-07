import { defineStore } from 'pinia'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useGameStore } from './gameState'
import { usePulsationStore } from './pulsation'
import { useMemoryStore } from './memory'
import { useEventStore } from './events'
import { useCondensationStore } from './condensation'
import { useTooltipStore } from './tooltips'
import { useAchievementStore } from './achievements'
import { mobileOptimizer } from '@/utils/mobileOptimization'

export const useGameLoopStore = defineStore('gameLoop', () => {
  const gameStore = useGameStore()
  const pulsationStore = usePulsationStore()
  const memoryStore = useMemoryStore()
  const eventStore = useEventStore()
  const condensationStore = useCondensationStore()
  const tooltipStore = useTooltipStore()
  const achievementStore = useAchievementStore()
  
  const isRunning = ref(false)
  const lastUpdate = ref(Date.now())
  const fps = ref(0)
  const frameCount = ref(0)
  const lastFpsUpdate = ref(Date.now())
  const currentUpdateFrequency = ref(16) // Default 60 FPS
  const adaptiveMode = ref(true)
  
  let animationFrameId: number | null = null
  let autoSaveInterval: number | null = null
  let timeoutId: number | null = null
  let lastPerformanceCheck = Date.now()
  
  // Mobile optimization state
  const deviceInfo = mobileOptimizer.getDeviceInfo()
  const isMobileDevice = deviceInfo.isMobile || deviceInfo.isTablet
  const isLowEndDevice = deviceInfo.isLowEndDevice
  
  function gameLoop() {
    const now = Date.now()
    const deltaTime = Math.min((now - lastUpdate.value) / 1000, 0.1) // Cap at 100ms to prevent huge jumps
    
    lastUpdate.value = now
    
    // Update game state
    gameStore.tick(deltaTime)
    
    // Update systems based on device performance
    if (!isLowEndDevice || frameCount.value % 2 === 0) {
      // Update pulsation system (reduce frequency on low-end devices)
      pulsationStore.tick(deltaTime)
    }
    
    if (!isMobileDevice || frameCount.value % 3 === 0) {
      // Update memory system less frequently on mobile
      memoryStore.tick()
    }
    
    // Update event system
    eventStore.tick(deltaTime)
    
    if (frameCount.value % 2 === 0) {
      // Update condensation system every other frame
      condensationStore.tick()
    }
    
    if (!isMobileDevice || frameCount.value % 5 === 0) {
      // Update tooltip system less frequently on mobile
      tooltipStore.tick()
    }
    
    // Update achievement system
    achievementStore.tick()
    
    // Update FPS counter
    frameCount.value++
    if (now - lastFpsUpdate.value >= 1000) {
      fps.value = frameCount.value
      frameCount.value = 0
      lastFpsUpdate.value = now
      
      // Adaptive performance adjustment
      if (adaptiveMode.value && now - lastPerformanceCheck > 5000) {
        adjustPerformance()
        lastPerformanceCheck = now
      }
    }
    
    if (isRunning.value) {
      scheduleNextFrame()
    }
  }
  
  function scheduleNextFrame() {
    if (isMobileDevice && currentUpdateFrequency.value > 16) {
      // Use setTimeout for reduced frequency on mobile
      timeoutId = window.setTimeout(gameLoop, currentUpdateFrequency.value)
    } else {
      // Use requestAnimationFrame for desktop or 60fps mobile
      animationFrameId = requestAnimationFrame(gameLoop)
    }
  }
  
  function adjustPerformance() {
    const performanceMetrics = mobileOptimizer.getPerformanceMetrics()
    const optimalFrequency = mobileOptimizer.getOptimalUpdateFrequency()
    
    // Adjust update frequency based on performance
    if (performanceMetrics.fps < 30 && currentUpdateFrequency.value < 200) {
      currentUpdateFrequency.value = Math.min(currentUpdateFrequency.value + 16, 200)
    } else if (performanceMetrics.fps > 45 && currentUpdateFrequency.value > 16) {
      currentUpdateFrequency.value = Math.max(currentUpdateFrequency.value - 8, optimalFrequency)
    }
    
    // Emergency performance mode
    if (performanceMetrics.fps < 15 || performanceMetrics.memoryUsage > 0.9) {
      enableEmergencyMode()
    }
  }
  
  function enableEmergencyMode() {
    currentUpdateFrequency.value = 500 // 2 FPS
    
    // Notify mobile optimizer to reduce effects
    mobileOptimizer.updateSettings({
      particlesEnabled: false,
      backgroundEffectsEnabled: false,
      complexShadowsEnabled: false,
      animationsEnabled: false
    })
    
    console.warn('Emergency performance mode activated')
  }
  
  function start() {
    if (isRunning.value) return
    
    isRunning.value = true
    lastUpdate.value = Date.now()
    
    // Set initial update frequency based on device
    currentUpdateFrequency.value = mobileOptimizer.getOptimalUpdateFrequency()
    
    gameLoop()
    
    // Set up auto-save with mobile-optimized frequency
    const mobileSettings = mobileOptimizer.getMobileSettings()
    autoSaveInterval = window.setInterval(() => {
      gameStore.save()
    }, mobileSettings.autoSaveFrequency)
    
    // Set up performance monitoring
    mobileOptimizer.observePerformance('gameLoop', (metrics) => {
      // React to performance changes
      if (adaptiveMode.value && metrics.isLowPerformance) {
        adjustPerformance()
      }
    })
  }
  
  function stop() {
    isRunning.value = false
    
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    
    if (autoSaveInterval !== null) {
      clearInterval(autoSaveInterval)
      autoSaveInterval = null
    }
    
    // Clean up performance monitoring
    mobileOptimizer.unobservePerformance('gameLoop')
  }
  
  function reset() {
    stop()
    fps.value = 0
    frameCount.value = 0
    lastUpdate.value = Date.now()
    lastFpsUpdate.value = Date.now()
    currentUpdateFrequency.value = mobileOptimizer.getOptimalUpdateFrequency()
    adaptiveMode.value = true
  }
  
  function setUpdateFrequency(frequency: number) {
    currentUpdateFrequency.value = Math.max(16, Math.min(1000, frequency))
    adaptiveMode.value = false // Disable adaptive mode when manually set
  }
  
  function enableAdaptiveMode() {
    adaptiveMode.value = true
    currentUpdateFrequency.value = mobileOptimizer.getOptimalUpdateFrequency()
  }
  
  function getPerformanceInfo() {
    return {
      fps: fps.value,
      updateFrequency: currentUpdateFrequency.value,
      adaptiveMode: adaptiveMode.value,
      isMobile: isMobileDevice,
      isLowEnd: isLowEndDevice,
      performanceMetrics: mobileOptimizer.getPerformanceMetrics()
    }
  }
  
  // Auto-start on mount
  onMounted(async () => {
    // Try to load save with error handling
    try {
      const loadSuccess = gameStore.load()
      if (!loadSuccess) {
        console.warn('Failed to load save data, starting fresh')
      }
      
      // Wait for reactive updates to propagate
      await nextTick()
      
    } catch (error) {
      console.error('Error loading save data:', error)
      console.warn('Starting with fresh game state')
    }
    start()
  })
  
  // Clean up on unmount
  onUnmounted(() => {
    stop()
  })
  
  return {
    isRunning,
    fps,
    currentUpdateFrequency,
    adaptiveMode,
    start,
    stop,
    reset,
    setUpdateFrequency,
    enableAdaptiveMode,
    getPerformanceInfo
  }
})