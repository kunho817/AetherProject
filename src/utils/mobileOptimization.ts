/**
 * Mobile Performance Optimization Utilities
 * Handles device detection, performance monitoring, and mobile-specific optimizations
 */

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLowEndDevice: boolean
  supportsTouchEvents: boolean
  pixelRatio: number
  screenSize: 'small' | 'medium' | 'large'
  platform: 'ios' | 'android' | 'desktop' | 'unknown'
  connectionType: 'slow' | 'fast' | 'unknown'
}

export interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  isLowPerformance: boolean
  shouldReduceEffects: boolean
  lastMeasurement: number
}

export interface MobileSettings {
  particlesEnabled: boolean
  backgroundEffectsEnabled: boolean
  animationsEnabled: boolean
  complexShadowsEnabled: boolean
  autoSaveFrequency: number
  maxVisibleElements: number
  reducedMotion: boolean
}

class MobileOptimizer {
  private deviceInfo: DeviceInfo
  private performanceMetrics: PerformanceMetrics
  private mobileSettings: MobileSettings
  private observers: Map<string, (metrics: PerformanceMetrics) => void> = new Map()
  private performanceMonitorId: number | null = null

  constructor() {
    try {
      this.deviceInfo = this.detectDevice()
      this.performanceMetrics = {
        fps: 60,
        memoryUsage: 0,
        isLowPerformance: false,
        shouldReduceEffects: false,
        lastMeasurement: Date.now()
      }
      this.mobileSettings = this.getOptimalSettings()
      
      // Delay performance monitoring to avoid blocking initialization
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          this.initPerformanceMonitoring()
        }, 100)
      }
    } catch (error) {
      console.error('MobileOptimizer initialization error:', error)
      // Set safe defaults if initialization fails
      this.deviceInfo = {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLowEndDevice: false,
        supportsTouchEvents: false,
        pixelRatio: 1,
        screenSize: 'large',
        platform: 'desktop',
        connectionType: 'unknown'
      }
      this.performanceMetrics = {
        fps: 60,
        memoryUsage: 0,
        isLowPerformance: false,
        shouldReduceEffects: false,
        lastMeasurement: Date.now()
      }
      this.mobileSettings = {
        particlesEnabled: true,
        backgroundEffectsEnabled: true,
        animationsEnabled: true,
        complexShadowsEnabled: true,
        autoSaveFrequency: 30000,
        maxVisibleElements: 200,
        reducedMotion: false
      }
    }
  }

  /**
   * Detect device capabilities and characteristics
   */
  private detectDevice(): DeviceInfo {
    try {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isTablet = /ipad|tablet|kindle/i.test(userAgent) || (isMobile && window.innerWidth > 768)
      const isDesktop = !isMobile && !isTablet
      
      // Low-end device detection based on multiple factors
      const isLowEndDevice = this.detectLowEndDevice()
      
      const supportsTouchEvents = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0
      const pixelRatio = window.devicePixelRatio || 1
      
      const screenSize = this.getScreenSize()
      const platform = this.detectPlatform(userAgent)
      const connectionType = this.detectConnectionType()

      return {
        isMobile,
        isTablet,
        isDesktop,
        isLowEndDevice,
        supportsTouchEvents,
        pixelRatio,
        screenSize,
        platform,
        connectionType
      }
    } catch (error) {
      console.error('Device detection error:', error)
      // Return safe defaults
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLowEndDevice: false,
        supportsTouchEvents: false,
        pixelRatio: 1,
        screenSize: 'large',
        platform: 'desktop',
        connectionType: 'unknown'
      }
    }
  }

  private detectLowEndDevice(): boolean {
    // Check hardware concurrency (CPU cores)
    const cpuCores = navigator.hardwareConcurrency || 1
    if (cpuCores <= 2) return true

    // Check device memory (if available)
    const deviceMemory = (navigator as any).deviceMemory
    if (deviceMemory && deviceMemory <= 2) return true

    // Check user agent for known low-end devices
    const userAgent = navigator.userAgent.toLowerCase()
    const lowEndPatterns = [
      'android.*[24]\\.',  // Android 2.x or 4.x
      'android.*sm-j',     // Samsung J series
      'android.*sm-a[01]', // Samsung A0x, A1x series  
      'android.*lgl',      // LG low-end devices
      'mobile.*safari.*version/[89]' // Old mobile Safari
    ]
    
    return lowEndPatterns.some(pattern => new RegExp(pattern).test(userAgent))
  }

  private getScreenSize(): 'small' | 'medium' | 'large' {
    const width = window.innerWidth
    if (width < 768) return 'small'
    if (width < 1200) return 'medium'
    return 'large'
  }

  private detectPlatform(userAgent: string): 'ios' | 'android' | 'desktop' | 'unknown' {
    if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios'
    if (/android/i.test(userAgent)) return 'android'
    if (!this.deviceInfo?.isMobile) return 'desktop'
    return 'unknown'
  }

  private detectConnectionType(): 'slow' | 'fast' | 'unknown' {
    const connection = (navigator as any).connection
    if (!connection) return 'unknown'
    
    const slowConnections = ['slow-2g', '2g', '3g']
    const effectiveType = connection.effectiveType
    
    if (slowConnections.includes(effectiveType)) return 'slow'
    if (effectiveType === '4g' || connection.downlink > 1.5) return 'fast'
    
    return 'unknown'
  }

  /**
   * Get optimal settings based on device capabilities
   */
  private getOptimalSettings(): MobileSettings {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isLowEnd = this.deviceInfo.isLowEndDevice
    const isMobile = this.deviceInfo.isMobile
    const isSlowConnection = this.deviceInfo.connectionType === 'slow'

    return {
      particlesEnabled: !isLowEnd && !isMobile && !prefersReducedMotion,
      backgroundEffectsEnabled: !isLowEnd && !prefersReducedMotion,
      animationsEnabled: !prefersReducedMotion,
      complexShadowsEnabled: !isLowEnd && !isMobile,
      autoSaveFrequency: isSlowConnection ? 60000 : 30000, // 60s vs 30s
      maxVisibleElements: isLowEnd ? 50 : isMobile ? 100 : 200,
      reducedMotion: prefersReducedMotion || isLowEnd
    }
  }

  /**
   * Initialize performance monitoring
   */
  private initPerformanceMonitoring() {
    if (this.deviceInfo.isDesktop && !this.deviceInfo.isLowEndDevice) {
      // Full monitoring for desktop
      this.startAdvancedMonitoring()
    } else {
      // Lightweight monitoring for mobile
      this.startLightweightMonitoring()
    }

    // Monitor preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', () => {
      this.mobileSettings.reducedMotion = mediaQuery.matches
      this.notifyObservers()
    })
  }

  private startAdvancedMonitoring() {
    let frameCount = 0
    let lastTime = performance.now()

    const measureFrame = (currentTime: number) => {
      frameCount++
      
      if (currentTime - lastTime >= 1000) { // Every second
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        frameCount = 0
        lastTime = currentTime
        
        this.updatePerformanceMetrics(fps)
      }
      
      this.performanceMonitorId = requestAnimationFrame(measureFrame)
    }
    
    this.performanceMonitorId = requestAnimationFrame(measureFrame)
  }

  private startLightweightMonitoring() {
    // Check performance every 5 seconds on mobile
    setInterval(() => {
      const memoryInfo = (performance as any).memory
      const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit : 0
      
      this.performanceMetrics.memoryUsage = memoryUsage
      this.performanceMetrics.isLowPerformance = memoryUsage > 0.8
      this.performanceMetrics.lastMeasurement = Date.now()
      
      this.notifyObservers()
    }, 5000)
  }

  private updatePerformanceMetrics(fps: number) {
    const memoryInfo = (performance as any).memory
    const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit : 0
    
    this.performanceMetrics = {
      fps,
      memoryUsage,
      isLowPerformance: fps < 45 || memoryUsage > 0.8,
      shouldReduceEffects: fps < 30 || memoryUsage > 0.9,
      lastMeasurement: Date.now()
    }
    
    // Auto-adjust settings based on performance
    if (this.performanceMetrics.shouldReduceEffects) {
      this.applyPerformanceReductions()
    }
    
    this.notifyObservers()
  }

  private applyPerformanceReductions() {
    if (this.performanceMetrics.fps < 20) {
      // Critical performance - disable all effects
      this.mobileSettings.particlesEnabled = false
      this.mobileSettings.backgroundEffectsEnabled = false
      this.mobileSettings.complexShadowsEnabled = false
    } else if (this.performanceMetrics.fps < 30) {
      // Low performance - reduce effects
      this.mobileSettings.particlesEnabled = false
      this.mobileSettings.backgroundEffectsEnabled = false
    }
  }

  private notifyObservers() {
    this.observers.forEach(callback => {
      try {
        callback(this.performanceMetrics)
      } catch (error) {
        console.warn('Error in performance observer callback:', error)
      }
    })
  }

  /**
   * Public API
   */
  
  public getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo }
  }

  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics }
  }

  public getMobileSettings(): MobileSettings {
    return { ...this.mobileSettings }
  }

  public updateSettings(newSettings: Partial<MobileSettings>) {
    this.mobileSettings = { ...this.mobileSettings, ...newSettings }
  }

  public observePerformance(id: string, callback: (metrics: PerformanceMetrics) => void) {
    this.observers.set(id, callback)
  }

  public unobservePerformance(id: string) {
    this.observers.delete(id)
  }

  public shouldUseReducedEffects(): boolean {
    return (
      this.mobileSettings.reducedMotion ||
      this.deviceInfo.isLowEndDevice ||
      this.performanceMetrics.shouldReduceEffects
    )
  }

  public shouldDisableParticles(): boolean {
    return (
      !this.mobileSettings.particlesEnabled ||
      this.deviceInfo.isMobile ||
      this.performanceMetrics.isLowPerformance
    )
  }

  public shouldReduceAnimations(): boolean {
    return (
      this.mobileSettings.reducedMotion ||
      this.performanceMetrics.fps < 45
    )
  }

  public getOptimalUpdateFrequency(): number {
    if (this.deviceInfo.isLowEndDevice) return 500 // 2 FPS
    if (this.deviceInfo.isMobile) return 200 // 5 FPS  
    if (this.performanceMetrics.fps < 30) return 100 // 10 FPS
    return 16 // 60 FPS
  }

  public cleanup() {
    if (this.performanceMonitorId) {
      cancelAnimationFrame(this.performanceMonitorId)
      this.performanceMonitorId = null
    }
    this.observers.clear()
  }
}

// Singleton instance
export const mobileOptimizer = new MobileOptimizer()

// Helper functions
export function isMobileDevice(): boolean {
  return mobileOptimizer.getDeviceInfo().isMobile
}

export function isLowEndDevice(): boolean {
  return mobileOptimizer.getDeviceInfo().isLowEndDevice
}

export function shouldReduceEffects(): boolean {
  return mobileOptimizer.shouldUseReducedEffects()
}

export function shouldDisableParticles(): boolean {
  return mobileOptimizer.shouldDisableParticles()
}

export function getOptimalSettings(): MobileSettings {
  return mobileOptimizer.getMobileSettings()
}