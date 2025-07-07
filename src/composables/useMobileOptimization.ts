/**
 * Vue composable for mobile optimization
 * Provides reactive mobile optimization state and utilities
 */

import { ref, computed, onMounted, onUnmounted, watch, readonly } from 'vue'
import { 
  mobileOptimizer, 
  type DeviceInfo, 
  type PerformanceMetrics, 
  type MobileSettings 
} from '@/utils/mobileOptimization'

export function useMobileOptimization() {
  // Reactive state
  const deviceInfo = ref<DeviceInfo>(mobileOptimizer.getDeviceInfo())
  const performanceMetrics = ref<PerformanceMetrics>(mobileOptimizer.getPerformanceMetrics())
  const mobileSettings = ref<MobileSettings>(mobileOptimizer.getMobileSettings())

  // Computed values for easy access
  const isMobile = computed(() => deviceInfo.value.isMobile)
  const isTablet = computed(() => deviceInfo.value.isTablet)
  const isDesktop = computed(() => deviceInfo.value.isDesktop)
  const isLowEndDevice = computed(() => deviceInfo.value.isLowEndDevice)
  const shouldReduceEffects = computed(() => mobileOptimizer.shouldUseReducedEffects())
  const shouldDisableParticles = computed(() => mobileOptimizer.shouldDisableParticles())
  const shouldReduceAnimations = computed(() => mobileOptimizer.shouldReduceAnimations())

  // Performance-based computed values
  const isLowPerformance = computed(() => performanceMetrics.value.isLowPerformance)
  const currentFPS = computed(() => performanceMetrics.value.fps)
  const memoryUsage = computed(() => performanceMetrics.value.memoryUsage)

  // Optimization settings
  const particlesEnabled = computed(() => mobileSettings.value.particlesEnabled)
  const backgroundEffectsEnabled = computed(() => mobileSettings.value.backgroundEffectsEnabled)
  const animationsEnabled = computed(() => mobileSettings.value.animationsEnabled)
  const complexShadowsEnabled = computed(() => mobileSettings.value.complexShadowsEnabled)
  const reducedMotion = computed(() => mobileSettings.value.reducedMotion)

  // Screen size classes for responsive design
  const screenSizeClass = computed(() => {
    const size = deviceInfo.value.screenSize
    return {
      'screen-small': size === 'small',
      'screen-medium': size === 'medium', 
      'screen-large': size === 'large',
      'mobile-device': isMobile.value,
      'tablet-device': isTablet.value,
      'desktop-device': isDesktop.value,
      'low-end-device': isLowEndDevice.value,
      'low-performance': isLowPerformance.value,
      'reduced-effects': shouldReduceEffects.value,
      'no-particles': shouldDisableParticles.value,
      'reduced-animations': shouldReduceAnimations.value
    }
  })

  // Performance class for CSS targeting
  const performanceClass = computed(() => {
    const fps = currentFPS.value
    const memory = memoryUsage.value
    
    if (fps < 20 || memory > 0.9) return 'performance-critical'
    if (fps < 30 || memory > 0.8) return 'performance-low'
    if (fps < 45 || memory > 0.6) return 'performance-medium'
    return 'performance-high'
  })

  // Device-specific optimizations
  const getOptimalGridColumns = computed(() => {
    if (isMobile.value) return 1
    if (isTablet.value) return 2
    if (isLowEndDevice.value) return 2
    return 3
  })

  const getOptimalParticleCount = computed(() => {
    if (shouldDisableParticles.value) return 0
    if (isMobile.value) return 5
    if (isLowEndDevice.value) return 10
    if (isLowPerformance.value) return 15
    return 25
  })

  const getOptimalAnimationDuration = computed(() => {
    if (reducedMotion.value) return 0
    if (shouldReduceAnimations.value) return 100
    if (isMobile.value) return 200
    return 300
  })

  // Update frequency based on performance
  const getOptimalUpdateFrequency = () => {
    return mobileOptimizer.getOptimalUpdateFrequency()
  }

  // Utility functions
  const updateSettings = (newSettings: Partial<MobileSettings>) => {
    mobileOptimizer.updateSettings(newSettings)
    mobileSettings.value = mobileOptimizer.getMobileSettings()
  }

  const enablePerformanceMode = () => {
    updateSettings({
      particlesEnabled: false,
      backgroundEffectsEnabled: false,
      complexShadowsEnabled: false,
      animationsEnabled: shouldReduceAnimations.value ? false : true,
      autoSaveFrequency: 60000
    })
  }

  const enableQualityMode = () => {
    if (!isLowEndDevice.value && !shouldReduceEffects.value) {
      updateSettings({
        particlesEnabled: !isMobile.value,
        backgroundEffectsEnabled: true,
        complexShadowsEnabled: !isMobile.value,
        animationsEnabled: true,
        autoSaveFrequency: 30000
      })
    }
  }

  const toggleParticles = () => {
    if (!shouldDisableParticles.value) {
      updateSettings({
        particlesEnabled: !mobileSettings.value.particlesEnabled
      })
    }
  }

  // Responsive breakpoint helpers
  const isSmallScreen = computed(() => deviceInfo.value.screenSize === 'small')
  const isMediumScreen = computed(() => deviceInfo.value.screenSize === 'medium')
  const isLargeScreen = computed(() => deviceInfo.value.screenSize === 'large')

  // Touch event helpers
  const supportsTouchEvents = computed(() => deviceInfo.value.supportsTouchEvents)
  
  const getTouchEventName = (eventType: 'start' | 'move' | 'end') => {
    if (!supportsTouchEvents.value) {
      return {
        start: 'mousedown',
        move: 'mousemove', 
        end: 'mouseup'
      }[eventType]
    }
    
    return {
      start: 'touchstart',
      move: 'touchmove',
      end: 'touchend'
    }[eventType]
  }

  // Memory management helpers
  const shouldCleanupResources = computed(() => {
    return memoryUsage.value > 0.7 || isLowEndDevice.value
  })

  const getMemoryPressureLevel = computed(() => {
    const usage = memoryUsage.value
    if (usage > 0.9) return 'critical'
    if (usage > 0.8) return 'high'
    if (usage > 0.6) return 'medium'
    return 'low'
  })

  // Setup performance monitoring
  onMounted(() => {
    const observerId = `mobile-optimization-${Date.now()}`
    
    mobileOptimizer.observePerformance(observerId, (metrics) => {
      performanceMetrics.value = metrics
    })

    // Cleanup on unmount
    onUnmounted(() => {
      mobileOptimizer.unobservePerformance(observerId)
    })
  })

  // Watch for settings changes but don't automatically apply CSS classes
  // Let components decide when to apply these classes
  watch(screenSizeClass, () => {
    // Classes are available via screenSizeClass computed, but not auto-applied
    // This prevents conflicts and gives components control
  })

  watch(performanceClass, () => {
    // Performance class is available via performanceClass computed
  })

  return {
    // Device info
    deviceInfo: readonly(deviceInfo),
    isMobile,
    isTablet,
    isDesktop,
    isLowEndDevice,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    supportsTouchEvents,

    // Performance metrics
    performanceMetrics: readonly(performanceMetrics),
    currentFPS,
    memoryUsage,
    isLowPerformance,
    
    // Optimization settings
    mobileSettings: readonly(mobileSettings),
    shouldReduceEffects,
    shouldDisableParticles,
    shouldReduceAnimations,
    particlesEnabled,
    backgroundEffectsEnabled,
    animationsEnabled,
    complexShadowsEnabled,
    reducedMotion,

    // Computed helpers
    screenSizeClass,
    performanceClass,
    getOptimalGridColumns,
    getOptimalParticleCount, 
    getOptimalAnimationDuration,
    shouldCleanupResources,
    getMemoryPressureLevel,

    // Utility functions
    updateSettings,
    enablePerformanceMode,
    enableQualityMode,
    toggleParticles,
    getOptimalUpdateFrequency,
    getTouchEventName
  }
}

// Global instance for app-wide access
let globalMobileOptimization: ReturnType<typeof useMobileOptimization> | null = null

export function useGlobalMobileOptimization() {
  try {
    if (!globalMobileOptimization) {
      globalMobileOptimization = useMobileOptimization()
    }
    return globalMobileOptimization
  } catch (error) {
    console.error('Failed to initialize global mobile optimization:', error)
    // Return a minimal version that won't crash
    return useMobileOptimization()
  }
}