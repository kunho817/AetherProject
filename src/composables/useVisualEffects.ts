import { ref, nextTick, onMounted, onUnmounted } from 'vue'

export interface VisualEffect {
  id: string
  type: EffectType
  element?: HTMLElement
  duration: number
  delay?: number
  easing?: string
  onComplete?: () => void
}

export type EffectType = 
  | 'fadeIn' 
  | 'fadeOut' 
  | 'slideIn' 
  | 'slideOut' 
  | 'scaleIn' 
  | 'scaleOut'
  | 'bounce'
  | 'shake'
  | 'glow'
  | 'pulse'
  | 'spin'
  | 'flip'
  | 'zoom'
  | 'highlight'
  | 'success'
  | 'error'
  | 'purchase'
  | 'starburst'

export interface AnimationConfig {
  duration?: number
  delay?: number
  easing?: string
  loop?: boolean
  direction?: 'normal' | 'reverse' | 'alternate'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
}

export interface NumberCounterConfig {
  from: number
  to: number
  duration?: number
  decimals?: number
  separator?: string
  prefix?: string
  suffix?: string
  easing?: (t: number) => number
  onUpdate?: (value: number, formattedValue: string) => void
  onComplete?: () => void
}

export interface ParticleConfig {
  type: 'stardust' | 'starlight' | 'energy' | 'celebration' | 'purchase'
  count?: number
  colors?: string[]
  size?: { min: number; max: number }
  speed?: { min: number; max: number }
  lifetime?: number
  gravity?: number
  spread?: number
}

export function useVisualEffects() {
  const activeEffects = ref<Map<string, VisualEffect>>(new Map())
  const animationFrame = ref<number>()
  const reducedMotion = ref(false)
  
  // Check for reduced motion preference
  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.value = mediaQuery.matches
    
    mediaQuery.addEventListener('change', (e) => {
      reducedMotion.value = e.matches
    })
  })
  
  // Cleanup on unmount
  onUnmounted(() => {
    if (animationFrame.value) {
      cancelAnimationFrame(animationFrame.value)
    }
    activeEffects.value.clear()
  })
  
  // Animation presets
  const animationPresets: Record<EffectType, AnimationConfig> = {
    fadeIn: { duration: 300, easing: 'ease-out' },
    fadeOut: { duration: 300, easing: 'ease-in' },
    slideIn: { duration: 400, easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)' },
    slideOut: { duration: 300, easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)' },
    scaleIn: { duration: 300, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
    scaleOut: { duration: 200, easing: 'ease-in' },
    bounce: { duration: 600, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
    shake: { duration: 500, easing: 'ease-in-out' },
    glow: { duration: 1000, easing: 'ease-in-out', loop: true, direction: 'alternate' },
    pulse: { duration: 2000, easing: 'ease-in-out', loop: true, direction: 'alternate' },
    spin: { duration: 1000, easing: 'linear', loop: true },
    flip: { duration: 600, easing: 'ease-in-out' },
    zoom: { duration: 300, easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)' },
    highlight: { duration: 800, easing: 'ease-out' },
    success: { duration: 500, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
    error: { duration: 400, easing: 'ease-out' },
    purchase: { duration: 300, easing: 'ease-out' },
    starburst: { duration: 1000, easing: 'ease-out' }
  }
  
  // Core animation function
  function animate(
    element: HTMLElement | string,
    effect: EffectType,
    config: AnimationConfig = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      if (reducedMotion.value) {
        resolve()
        return
      }
      
      const el = typeof element === 'string' ? 
        document.querySelector(element) as HTMLElement : element
      
      if (!el) {
        resolve()
        return
      }
      
      const preset = animationPresets[effect]
      const finalConfig = { ...preset, ...config }
      
      const effectId = `effect-${Date.now()}-${Math.random()}`
      const visualEffect: VisualEffect = {
        id: effectId,
        type: effect,
        element: el,
        duration: finalConfig.duration || 300,
        delay: finalConfig.delay || 0,
        easing: finalConfig.easing || 'ease',
        onComplete: () => {
          activeEffects.value.delete(effectId)
          resolve()
        }
      }
      
      activeEffects.value.set(effectId, visualEffect)
      applyAnimation(el, effect, finalConfig, visualEffect.onComplete!)
    })
  }
  
  // Apply specific animation
  function applyAnimation(
    element: HTMLElement,
    effect: EffectType,
    config: AnimationConfig,
    onComplete: () => void
  ) {
    const keyframes = getKeyframes(effect)
    const options: KeyframeAnimationOptions = {
      duration: config.duration,
      delay: config.delay || 0,
      easing: config.easing || 'ease',
      fill: config.fillMode || 'both',
      iterations: config.loop ? Infinity : 1,
      direction: config.direction || 'normal'
    }
    
    const animation = element.animate(keyframes, options)
    
    animation.addEventListener('finish', () => {
      if (!config.loop) {
        onComplete()
      }
    })
    
    return animation
  }
  
  // Get keyframes for effect type
  function getKeyframes(effect: EffectType): Keyframe[] {
    switch (effect) {
      case 'fadeIn':
        return [
          { opacity: 0 },
          { opacity: 1 }
        ]
      
      case 'fadeOut':
        return [
          { opacity: 1 },
          { opacity: 0 }
        ]
      
      case 'slideIn':
        return [
          { transform: 'translateX(-100%)', opacity: 0 },
          { transform: 'translateX(0)', opacity: 1 }
        ]
      
      case 'slideOut':
        return [
          { transform: 'translateX(0)', opacity: 1 },
          { transform: 'translateX(100%)', opacity: 0 }
        ]
      
      case 'scaleIn':
        return [
          { transform: 'scale(0)', opacity: 0 },
          { transform: 'scale(1)', opacity: 1 }
        ]
      
      case 'scaleOut':
        return [
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(0)', opacity: 0 }
        ]
      
      case 'bounce':
        return [
          { transform: 'translateY(0)' },
          { transform: 'translateY(-20px)' },
          { transform: 'translateY(0)' },
          { transform: 'translateY(-10px)' },
          { transform: 'translateY(0)' }
        ]
      
      case 'shake':
        return [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-10px)' },
          { transform: 'translateX(10px)' },
          { transform: 'translateX(-10px)' },
          { transform: 'translateX(10px)' },
          { transform: 'translateX(0)' }
        ]
      
      case 'glow':
        return [
          { boxShadow: '0 0 5px currentColor' },
          { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' }
        ]
      
      case 'pulse':
        return [
          { transform: 'scale(1)' },
          { transform: 'scale(1.05)' }
        ]
      
      case 'spin':
        return [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(360deg)' }
        ]
      
      case 'flip':
        return [
          { transform: 'rotateY(0deg)' },
          { transform: 'rotateY(180deg)' }
        ]
      
      case 'zoom':
        return [
          { transform: 'scale(1)' },
          { transform: 'scale(1.1)' },
          { transform: 'scale(1)' }
        ]
      
      case 'highlight':
        return [
          { backgroundColor: 'transparent' },
          { backgroundColor: 'rgba(255, 215, 0, 0.3)' },
          { backgroundColor: 'transparent' }
        ]
      
      case 'success':
        return [
          { transform: 'scale(1)', backgroundColor: 'transparent' },
          { transform: 'scale(1.05)', backgroundColor: 'rgba(0, 255, 0, 0.2)' },
          { transform: 'scale(1)', backgroundColor: 'transparent' }
        ]
      
      case 'error':
        return [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-10px)', backgroundColor: 'rgba(255, 0, 0, 0.2)' },
          { transform: 'translateX(10px)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(0)', backgroundColor: 'transparent' }
        ]
      
      case 'purchase':
        return [
          { transform: 'scale(1)', backgroundColor: 'transparent' },
          { transform: 'scale(1.1)', backgroundColor: 'rgba(0, 255, 0, 0.3)' },
          { transform: 'scale(1)', backgroundColor: 'transparent' }
        ]
      
      case 'starburst':
        return [
          { 
            transform: 'scale(0) rotate(0deg)', 
            opacity: 1,
            boxShadow: '0 0 0 rgba(255, 140, 0, 0.8)'
          },
          { 
            transform: 'scale(1.5) rotate(180deg)', 
            opacity: 0.8,
            boxShadow: '0 0 40px rgba(255, 140, 0, 0.8)'
          },
          { 
            transform: 'scale(3) rotate(360deg)', 
            opacity: 0,
            boxShadow: '0 0 80px rgba(255, 140, 0, 0.4)'
          }
        ]
      
      default:
        return [{ opacity: 1 }]
    }
  }
  
  // Number counter animation
  function animateNumber(
    target: { value: number } | HTMLElement,
    config: NumberCounterConfig
  ): Promise<void> {
    return new Promise((resolve) => {
      if (reducedMotion.value) {
        const finalValue = config.to
        if ('value' in target) {
          target.value = finalValue
        } else {
          target.textContent = formatNumber(finalValue, config)
        }
        config.onComplete?.()
        resolve()
        return
      }
      
      const duration = config.duration || 1000
      const easing = config.easing || ((t: number) => t * (2 - t)) // ease-out quad
      const startTime = performance.now()
      const startValue = config.from
      const endValue = config.to
      const diff = endValue - startValue
      
      function updateNumber(currentTime: number) {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easing(progress)
        const currentValue = startValue + (diff * easedProgress)
        
        const formattedValue = formatNumber(currentValue, config)
        
        if ('value' in target) {
          target.value = currentValue
        } else {
          target.textContent = formattedValue
        }
        
        config.onUpdate?.(currentValue, formattedValue)
        
        if (progress < 1) {
          requestAnimationFrame(updateNumber)
        } else {
          config.onComplete?.()
          resolve()
        }
      }
      
      requestAnimationFrame(updateNumber)
    })
  }
  
  // Format number for display
  function formatNumber(value: number, config: NumberCounterConfig): string {
    const decimals = config.decimals || 0
    const separator = config.separator || ','
    const prefix = config.prefix || ''
    const suffix = config.suffix || ''
    
    let formatted = value.toFixed(decimals)
    
    // Add thousand separators
    if (separator) {
      const parts = formatted.split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
      formatted = parts.join('.')
    }
    
    return prefix + formatted + suffix
  }
  
  // Element entrance animation
  async function enterElement(element: HTMLElement | string, effect: EffectType = 'fadeIn') {
    await nextTick()
    return animate(element, effect)
  }
  
  // Element exit animation
  async function exitElement(element: HTMLElement | string, effect: EffectType = 'fadeOut') {
    return animate(element, effect)
  }
  
  // Stagger animations for multiple elements
  async function staggerAnimations(
    elements: (HTMLElement | string)[],
    effect: EffectType,
    staggerDelay: number = 100,
    config: AnimationConfig = {}
  ) {
    const promises = elements.map((element, index) => {
      const delayedConfig = {
        ...config,
        delay: (config.delay || 0) + (index * staggerDelay)
      }
      return animate(element, effect, delayedConfig)
    })
    
    return Promise.all(promises)
  }
  
  // Quick effect helpers
  const quickEffects = {
    success: (element: HTMLElement | string) => animate(element, 'success'),
    error: (element: HTMLElement | string) => animate(element, 'error'),
    purchase: (element: HTMLElement | string) => animate(element, 'purchase'),
    highlight: (element: HTMLElement | string) => animate(element, 'highlight'),
    bounce: (element: HTMLElement | string) => animate(element, 'bounce'),
    shake: (element: HTMLElement | string) => animate(element, 'shake'),
    glow: (element: HTMLElement | string, loop = true) => 
      animate(element, 'glow', { loop }),
    pulse: (element: HTMLElement | string, loop = true) => 
      animate(element, 'pulse', { loop }),
    spin: (element: HTMLElement | string, loop = true) => 
      animate(element, 'spin', { loop })
  }
  
  // Particle burst effect
  function createParticleBurst(
    x: number,
    y: number,
    config: ParticleConfig
  ) {
    if (reducedMotion.value) return
    
    // This would integrate with the ParticleSystem component
    // For now, create a simple DOM-based particle effect
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = `${x}px`
    container.style.top = `${y}px`
    container.style.pointerEvents = 'none'
    container.style.zIndex = '9999'
    
    document.body.appendChild(container)
    
    const count = config.count || 10
    const colors = config.colors || ['#ffd700', '#ff6b6b', '#4ecdc4']
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div')
      const size = Math.random() * (config.size?.max || 6) + (config.size?.min || 2)
      const angle = (Math.PI * 2 * i) / count
      const speed = Math.random() * (config.speed?.max || 100) + (config.speed?.min || 50)
      const color = colors[Math.floor(Math.random() * colors.length)]
      
      particle.style.position = 'absolute'
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.backgroundColor = color
      particle.style.borderRadius = '50%'
      particle.style.pointerEvents = 'none'
      
      container.appendChild(particle)
      
      const animation = particle.animate([
        {
          transform: 'translate(0, 0) scale(0)',
          opacity: 1
        },
        {
          transform: `translate(${Math.cos(angle) * speed}px, ${Math.sin(angle) * speed}px) scale(1)`,
          opacity: 0.8
        },
        {
          transform: `translate(${Math.cos(angle) * speed * 1.5}px, ${Math.sin(angle) * speed * 1.5 + 50}px) scale(0)`,
          opacity: 0
        }
      ], {
        duration: config.lifetime || 1000,
        easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
      })
      
      animation.addEventListener('finish', () => {
        particle.remove()
      })
    }
    
    // Clean up container
    setTimeout(() => {
      container.remove()
    }, (config.lifetime || 1000) + 100)
  }
  
  // Screen shake effect
  function shakeScreen(_intensity: number = 10, duration: number = 500) {
    if (reducedMotion.value) return
    
    const element = document.documentElement
    
    animate(element, 'shake', {
      duration,
      easing: 'ease-in-out'
    })
  }
  
  // Flash effect for the entire screen
  function flashScreen(color: string = 'rgba(255, 255, 255, 0.5)', duration: number = 200) {
    if (reducedMotion.value) return
    
    const flash = document.createElement('div')
    flash.style.position = 'fixed'
    flash.style.top = '0'
    flash.style.left = '0'
    flash.style.width = '100%'
    flash.style.height = '100%'
    flash.style.backgroundColor = color
    flash.style.pointerEvents = 'none'
    flash.style.zIndex = '99999'
    flash.style.opacity = '0'
    
    document.body.appendChild(flash)
    
    const animation = flash.animate([
      { opacity: 0 },
      { opacity: 1 },
      { opacity: 0 }
    ], {
      duration,
      easing: 'ease-out'
    })
    
    animation.addEventListener('finish', () => {
      flash.remove()
    })
  }
  
  return {
    // Core functions
    animate,
    animateNumber,
    enterElement,
    exitElement,
    staggerAnimations,
    
    // Quick effects
    ...quickEffects,
    
    // Particle and screen effects
    createParticleBurst,
    shakeScreen,
    flashScreen,
    
    // State
    activeEffects,
    reducedMotion,
    
    // Animation presets
    animationPresets
  }
}