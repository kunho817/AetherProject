<template>
  <button
    ref="buttonRef"
    :class="[
      'enhanced-btn',
      `btn-${variant}`,
      `btn-${size}`,
      {
        'btn-disabled': disabled,
        'btn-loading': loading,
        'btn-success': showSuccess,
        'btn-glow': glow,
        'btn-animated': animated,
        'btn-pulsing': pulsing
      }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    v-bind="$attrs"
  >
    <!-- Background Effects -->
    <div class="btn-background">
      <div class="btn-gradient"></div>
      <div class="btn-shine" v-if="shouldShowShine"></div>
      <div class="btn-ripple" v-if="shouldShowRipple" ref="rippleRef"></div>
    </div>
    
    <!-- Content -->
    <div class="btn-content">
      <!-- Loading Spinner -->
      <div v-if="loading" class="btn-loading-spinner">
        <div class="spinner"></div>
      </div>
      
      <!-- Success Icon -->
      <div v-else-if="showSuccess" class="btn-success-icon">
        <svg viewBox="0 0 24 24" class="success-check">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>
      </div>
      
      <!-- Default Content -->
      <template v-else>
        <!-- Icon -->
        <div v-if="icon" class="btn-icon">
          <component v-if="typeof icon === 'object'" :is="icon" />
          <span v-else>{{ icon }}</span>
        </div>
        
        <!-- Text -->
        <span class="btn-text">
          <slot>{{ text }}</slot>
        </span>
        
        <!-- Badge/Counter -->
        <div v-if="badge" class="btn-badge">
          {{ badge }}
        </div>
      </template>
    </div>
    
    <!-- Particle Emitter -->
    <div class="btn-particles" ref="particleContainer">
      <div
        v-for="particle in particles"
        :key="particle.id"
        :class="['btn-particle', `particle-${particle.type}`]"
        :style="getParticleStyle(particle)"
        @animationend="removeParticle(particle.id)"
      ></div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useMobileOptimization } from '@/composables/useMobileOptimization'

interface ButtonParticle {
  id: string
  type: 'success' | 'click' | 'hover' | 'special'
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
}

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost'
  size?: 'small' | 'medium' | 'large' | 'xl'
  disabled?: boolean
  loading?: boolean
  text?: string
  icon?: string | object
  badge?: string | number
  glow?: boolean
  animated?: boolean
  pulsing?: boolean
  shine?: boolean
  ripple?: boolean
  particles?: boolean
  clickEffect?: boolean
  successDuration?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  loading: false,
  glow: false,
  animated: true,
  pulsing: false,
  shine: true,
  ripple: true,
  particles: true,
  clickEffect: true,
  successDuration: 2000
})

// Mobile optimization
const mobileOpt = useMobileOptimization()
const shouldShowParticles = computed(() => 
  props.particles && 
  !mobileOpt.shouldDisableParticles.value && 
  mobileOpt.particlesEnabled.value
)
const shouldShowRipple = computed(() => 
  props.ripple && 
  !mobileOpt.shouldReduceEffects.value
)
const shouldShowShine = computed(() => 
  props.shine && 
  !mobileOpt.shouldReduceEffects.value && 
  mobileOpt.complexShadowsEnabled.value
)
const effectiveAnimationDuration = computed(() => 
  mobileOpt.getOptimalAnimationDuration.value
)

const emit = defineEmits<{
  click: [event: MouseEvent]
  success: []
  hover: [state: boolean]
}>()

// Reactive state
const buttonRef = ref<HTMLButtonElement>()
const rippleRef = ref<HTMLElement>()
const particleContainer = ref<HTMLElement>()
const particles = ref<ButtonParticle[]>([])
const showSuccess = ref(false)
const isHovered = ref(false)
const clickCount = ref(0)
const nextParticleId = ref(0)

// Success state management
let successTimeout: number | null = null

const buttonVariants = {
  primary: {
    base: '#0066cc',
    hover: '#0052a3',
    gradient: 'linear-gradient(135deg, #0066cc, #004c99)',
    glow: '#0066cc'
  },
  secondary: {
    base: '#6b7280',
    hover: '#4b5563',
    gradient: 'linear-gradient(135deg, #6b7280, #4b5563)',
    glow: '#6b7280'
  },
  success: {
    base: '#10b981',
    hover: '#059669',
    gradient: 'linear-gradient(135deg, #10b981, #047857)',
    glow: '#10b981'
  },
  danger: {
    base: '#ef4444',
    hover: '#dc2626',
    gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)',
    glow: '#ef4444'
  },
  warning: {
    base: '#f59e0b',
    hover: '#d97706',
    gradient: 'linear-gradient(135deg, #f59e0b, #b45309)',
    glow: '#f59e0b'
  },
  info: {
    base: '#06b6d4',
    hover: '#0891b2',
    gradient: 'linear-gradient(135deg, #06b6d4, #0e7490)',
    glow: '#06b6d4'
  },
  ghost: {
    base: 'transparent',
    hover: 'rgba(255, 255, 255, 0.1)',
    gradient: 'none',
    glow: '#ffffff'
  }
}

// Handle click with effects
async function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading) return
  
  clickCount.value++
  
  // Create ripple effect
  if (shouldShowRipple.value && buttonRef.value && rippleRef.value) {
    createRippleEffect(event)
  }
  
  // Create click particles
  if (shouldShowParticles.value && props.clickEffect) {
    createClickParticles(event)
  }
  
  // Emit click event
  emit('click', event)
  
  // Show success state if this is a significant action
  if (clickCount.value % 5 === 0) {
    showSuccessState()
  }
}

function handleMouseEnter() {
  isHovered.value = true
  emit('hover', true)
  
  if (shouldShowParticles.value && !mobileOpt.isMobile.value) {
    createHoverParticles()
  }
}

function handleMouseLeave() {
  isHovered.value = false
  emit('hover', false)
}

// Ripple effect
function createRippleEffect(event: MouseEvent) {
  const button = buttonRef.value!
  const ripple = rippleRef.value!
  const rect = button.getBoundingClientRect()
  
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  ripple.style.transform = 'scale(0)'
  ripple.style.opacity = '1'
  
  // Trigger animation
  requestAnimationFrame(() => {
    ripple.style.transform = 'scale(4)'
    ripple.style.opacity = '0'
  })
}

// Particle creation
function createClickParticles(event: MouseEvent) {
  if (!buttonRef.value) return
  
  const rect = buttonRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // Create burst of particles
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8
    const speed = Math.random() * 3 + 2
    
    createParticle({
      type: 'click',
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 4 + 2,
      color: buttonVariants[props.variant].base,
      life: 1000
    })
  }
}

function createHoverParticles() {
  if (!buttonRef.value) return
  
  const rect = buttonRef.value.getBoundingClientRect()
  const x = Math.random() * rect.width
  const y = Math.random() * rect.height
  
  createParticle({
    type: 'hover',
    x,
    y,
    vx: (Math.random() - 0.5) * 2,
    vy: Math.random() * -2 - 1,
    size: Math.random() * 3 + 1,
    color: buttonVariants[props.variant].glow,
    life: 2000
  })
}

function createSuccessParticles() {
  if (!buttonRef.value) return
  
  const rect = buttonRef.value.getBoundingClientRect()
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  // Create celebration burst
  for (let i = 0; i < 15; i++) {
    const angle = (Math.PI * 2 * i) / 15
    const speed = Math.random() * 4 + 3
    
    setTimeout(() => {
      createParticle({
        type: 'success',
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 3,
        color: '#10b981',
        life: 1500
      })
    }, i * 30)
  }
}

function createParticle(config: Omit<ButtonParticle, 'id'>) {
  const particle: ButtonParticle = {
    ...config,
    id: `particle-${nextParticleId.value++}`
  }
  
  particles.value.push(particle)
  
  // Remove particle after its lifetime
  setTimeout(() => {
    removeParticle(particle.id)
  }, particle.life)
}

function removeParticle(particleId: string) {
  const index = particles.value.findIndex(p => p.id === particleId)
  if (index !== -1) {
    particles.value.splice(index, 1)
  }
}

function getParticleStyle(particle: ButtonParticle) {
  return {
    left: `${particle.x}px`,
    top: `${particle.y}px`,
    width: `${particle.size}px`,
    height: `${particle.size}px`,
    backgroundColor: particle.color,
    '--particle-vx': `${particle.vx * 20}px`,
    '--particle-vy': `${particle.vy * 20}px`,
    '--particle-life': `${particle.life}ms`
  }
}

// Success state
function showSuccessState() {
  showSuccess.value = true
  createSuccessParticles()
  emit('success')
  
  if (successTimeout) {
    clearTimeout(successTimeout)
  }
  
  successTimeout = setTimeout(() => {
    showSuccess.value = false
  }, props.successDuration)
}

// Expose public methods
defineExpose({
  showSuccess: showSuccessState,
  createParticles: createClickParticles
})

onUnmounted(() => {
  if (successTimeout) {
    clearTimeout(successTimeout)
  }
})
</script>

<style scoped>
.enhanced-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  user-select: none;
  outline: none;
  z-index: 1;
}

/* Size variants */
.btn-small {
  padding: 8px 16px;
  font-size: 12px;
  min-height: 32px;
}

.btn-medium {
  padding: 12px 24px;
  font-size: 14px;
  min-height: 40px;
}

.btn-large {
  padding: 16px 32px;
  font-size: 16px;
  min-height: 48px;
}

.btn-xl {
  padding: 20px 40px;
  font-size: 18px;
  min-height: 56px;
}

/* Color variants */
.btn-primary {
  background: linear-gradient(135deg, #0066cc, #004c99);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
}

.btn-primary:hover:not(.btn-disabled) {
  background: linear-gradient(135deg, #0052a3, #003d7a);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
  box-shadow: 0 2px 8px rgba(107, 114, 128, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #10b981, #047857);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b, #b45309);
  color: white;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.btn-info {
  background: linear-gradient(135deg, #06b6d4, #0e7490);
  color: white;
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
}

.btn-ghost {
  background: transparent;
  color: var(--text-primary);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: none;
}

.btn-ghost:hover:not(.btn-disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

/* States */
.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-loading {
  pointer-events: none;
}

.btn-success {
  background: linear-gradient(135deg, #10b981, #047857) !important;
}

.btn-glow {
  box-shadow: 0 0 20px currentColor;
}

.btn-animated:active:not(.btn-disabled) {
  transform: scale(0.98);
}

.btn-pulsing {
  animation: btn-pulse 2s ease-in-out infinite;
}

@keyframes btn-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Background effects */
.btn-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: inherit;
}

.btn-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  transition: all 0.3s ease;
}

.btn-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
  transform: translateX(-100%) translateY(-100%) rotate(45deg);
  transition: transform 0.6s ease;
}

.enhanced-btn:hover .btn-shine {
  transform: translateX(100%) translateY(100%) rotate(45deg);
}

.btn-ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  pointer-events: none;
  transition: transform 0.4s ease, opacity 0.4s ease;
}

/* Content */
.btn-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 2;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
}

.btn-text {
  white-space: nowrap;
}

.btn-badge {
  background: rgba(255, 255, 255, 0.2);
  color: currentColor;
  font-size: 0.75em;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

/* Loading spinner */
.btn-loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Success icon */
.btn-success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: success-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.success-check {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

@keyframes success-bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Particles */
.btn-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: inherit;
}

.btn-particle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.particle-click {
  animation: particle-click var(--particle-life, 1000ms) ease-out forwards;
}

.particle-hover {
  animation: particle-hover var(--particle-life, 2000ms) ease-out forwards;
}

.particle-success {
  animation: particle-success var(--particle-life, 1500ms) ease-out forwards;
  box-shadow: 0 0 6px currentColor;
}

@keyframes particle-click {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--particle-vx), var(--particle-vy)) scale(0);
    opacity: 0;
  }
}

@keyframes particle-hover {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 0;
  }
  20% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    transform: translate(var(--particle-vx), var(--particle-vy)) scale(0.5);
    opacity: 0;
  }
}

@keyframes particle-success {
  0% {
    transform: translate(0, 0) scale(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 1;
  }
  100% {
    transform: translate(var(--particle-vx), var(--particle-vy)) scale(0.3) rotate(360deg);
    opacity: 0;
  }
}

/* Mobile optimizations */
.mobile-device .btn-particles,
.no-particles .btn-particles {
  display: none;
}

.mobile-device .btn-shine,
.reduced-effects .btn-shine {
  display: none;
}

.mobile-device .enhanced-btn {
  /* Larger touch targets */
  min-height: 48px;
  min-width: 48px;
}

.low-end-device .enhanced-btn {
  /* Simplified styling for low-end devices */
  background: var(--accent-blue) !important;
  box-shadow: none !important;
  border-radius: 4px !important;
}

.low-end-device .btn-background {
  display: none;
}

/* Performance-based optimizations */
.performance-critical .enhanced-btn,
.performance-low .enhanced-btn {
  transition: none !important;
  animation: none !important;
}

.performance-critical .btn-background,
.performance-critical .btn-particles {
  display: none !important;
}

/* Responsive touch improvements */
@media (max-width: 768px) {
  .enhanced-btn {
    /* Better touch feedback */
    -webkit-tap-highlight-color: rgba(0, 180, 216, 0.3);
  }
  
  .enhanced-btn:active {
    transform: scale(0.98);
  }
}

/* Accessibility and reduced motion */
@media (prefers-reduced-motion: reduce) {
  .enhanced-btn,
  .btn-shine,
  .btn-particle {
    animation: none !important;
    transition: none !important;
  }
  
  .btn-pulsing {
    animation: none !important;
  }
}

.reduced-animations .enhanced-btn,
.reduced-animations .btn-shine,
.reduced-animations .btn-particle {
  animation-duration: 0.1s !important;
  transition-duration: 0.1s !important;
}

/* Focus styles */
.enhanced-btn:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .enhanced-btn {
    border: 2px solid currentColor;
  }
  
  .btn-ghost {
    border-width: 3px;
  }
}
</style>