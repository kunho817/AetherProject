<template>
  <div 
    ref="containerRef" 
    class="particle-container"
    :class="{ 'particles-enabled': enabled }"
  >
    <!-- Particle Elements -->
    <div
      v-for="particle in activeParticles"
      :key="particle.id"
      :class="['particle', `particle-${particle.type}`]"
      :style="getParticleStyle(particle)"
      @animationend="removeParticle(particle.id)"
    >
      <div 
        v-if="particle.type === 'starburst'" 
        class="particle-inner starburst-inner"
      ></div>
      <div 
        v-if="particle.type === 'achievement'" 
        class="particle-inner achievement-inner"
      >
        {{ particle.icon || '🏆' }}
      </div>
    </div>
    
    <!-- Background Effect Layers -->
    <div v-if="shouldShowBackgroundEffects" class="background-effects">
      <!-- Cosmic Dust -->
      <div class="cosmic-dust">
        <div 
          v-for="n in dustParticleCount" 
          :key="`dust-${n}`"
          class="dust-particle"
          :style="getDustParticleStyle(n)"
        ></div>
      </div>
      
      <!-- Energy Lines -->
      <div class="energy-lines">
        <div 
          v-for="n in energyLineCount" 
          :key="`energy-${n}`"
          class="energy-line"
          :style="getEnergyLineStyle(n)"
        ></div>
      </div>
      
      <!-- Constellation Background -->
      <div class="constellation-bg">
        <svg class="constellation-svg" viewBox="0 0 800 600">
          <defs>
            <radialGradient id="starGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
            </radialGradient>
          </defs>
          
          <!-- Background Stars -->
          <g class="background-stars">
            <circle 
              v-for="star in backgroundStars" 
              :key="star.id"
              :cx="star.x" 
              :cy="star.y" 
              :r="star.size"
              fill="url(#starGradient)"
              :opacity="star.opacity"
              class="bg-star"
              :style="{ animationDelay: `${star.delay}s` }"
            />
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMobileOptimization } from '@/composables/useMobileOptimization'

interface Particle {
  id: string
  type: ParticleType
  x: number
  y: number
  vx?: number
  vy?: number
  size: number
  color: string
  duration: number
  delay?: number
  icon?: string
  rotation?: number
  scale?: number
}

interface BackgroundStar {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  delay: number
}

type ParticleType = 
  | 'stardust' 
  | 'starlight' 
  | 'energy' 
  | 'cosmic' 
  | 'nebula' 
  | 'starburst' 
  | 'achievement'
  | 'purchase'
  | 'milestone'

interface Props {
  enabled?: boolean
  showBackgroundEffects?: boolean
  intensity?: number
  maxParticles?: number
}

const props = withDefaults(defineProps<Props>(), {
  enabled: true,
  showBackgroundEffects: true,
  intensity: 1,
  maxParticles: 100
})

// Mobile optimization
const mobileOpt = useMobileOptimization()
const shouldShowParticles = computed(() => 
  props.enabled && 
  !mobileOpt.shouldDisableParticles.value && 
  mobileOpt.particlesEnabled.value
)
const shouldShowBackgroundEffects = computed(() => 
  props.showBackgroundEffects && 
  mobileOpt.backgroundEffectsEnabled.value && 
  !mobileOpt.shouldReduceEffects.value
)
const effectiveIntensity = computed(() => {
  let intensity = props.intensity
  if (mobileOpt.isLowEndDevice.value) intensity *= 0.3
  else if (mobileOpt.isMobile.value) intensity *= 0.5
  else if (mobileOpt.isLowPerformance.value) intensity *= 0.7
  return Math.max(0.1, intensity)
})
const effectiveMaxParticles = computed(() => {
  const optimal = mobileOpt.getOptimalParticleCount.value
  return Math.min(props.maxParticles, optimal)
})

const emit = defineEmits<{
  particleCreated: [particle: Particle]
  particleDestroyed: [particleId: string]
}>()

// Reactive state
const containerRef = ref<HTMLElement>()
const activeParticles = ref<Particle[]>([])
const nextParticleId = ref(0)
const animationFrameId = ref<number>()

// Background effect settings
const dustParticleCount = computed(() => 
  shouldShowBackgroundEffects.value ? Math.floor(20 * effectiveIntensity.value) : 0
)
const energyLineCount = computed(() => 
  shouldShowBackgroundEffects.value ? Math.floor(5 * effectiveIntensity.value) : 0
)

// Background stars
const backgroundStars = ref<BackgroundStar[]>([])

// Particle type configurations
const particleConfigs = {
  stardust: {
    baseSize: 3,
    color: '#ffd700',
    duration: 2000,
    gravity: 0.1,
    sparkle: true
  },
  starlight: {
    baseSize: 4,
    color: '#e0e7ff',
    duration: 3000,
    gravity: 0.05,
    glow: true
  },
  energy: {
    baseSize: 2,
    color: '#00d4ff',
    duration: 1500,
    gravity: 0,
    electric: true
  },
  cosmic: {
    baseSize: 5,
    color: '#9333ea',
    duration: 4000,
    gravity: 0.02,
    trail: true
  },
  nebula: {
    baseSize: 6,
    color: '#06b6d4',
    duration: 3500,
    gravity: 0.03,
    swirl: true
  },
  starburst: {
    baseSize: 20,
    color: '#ff8c00',
    duration: 1000,
    gravity: 0,
    explosion: true
  },
  achievement: {
    baseSize: 30,
    color: '#ffd700',
    duration: 2000,
    gravity: -0.1,
    special: true
  },
  purchase: {
    baseSize: 8,
    color: '#00ff00',
    duration: 800,
    gravity: 0.15,
    success: true
  },
  milestone: {
    baseSize: 15,
    color: '#ff6b6b',
    duration: 1500,
    gravity: 0.05,
    celebration: true
  }
}

// Initialize background stars
function initializeBackgroundStars() {
  backgroundStars.value = []
  for (let i = 0; i < 50; i++) {
    backgroundStars.value.push({
      id: i,
      x: Math.random() * 800,
      y: Math.random() * 600,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      delay: Math.random() * 10
    })
  }
}

// Create a new particle
function createParticle(
  type: ParticleType, 
  x: number, 
  y: number, 
  options: Partial<Particle> = {}
): string {
  if (!shouldShowParticles.value || activeParticles.value.length >= effectiveMaxParticles.value) {
    return ''
  }

  const config = particleConfigs[type]
  const particleId = `particle-${nextParticleId.value++}`
  
  const particle: Particle = {
    id: particleId,
    type,
    x,
    y,
    vx: (Math.random() - 0.5) * 2,
    vy: Math.random() * -2 - 1,
    size: config.baseSize + Math.random() * 3,
    color: config.color,
    duration: config.duration + Math.random() * 1000,
    rotation: Math.random() * 360,
    scale: 1,
    ...options
  }

  activeParticles.value.push(particle)
  emit('particleCreated', particle)
  
  // Auto-remove particle after duration
  setTimeout(() => {
    removeParticle(particleId)
  }, particle.duration)
  
  return particleId
}

// Remove a particle
function removeParticle(particleId: string) {
  const index = activeParticles.value.findIndex(p => p.id === particleId)
  if (index !== -1) {
    activeParticles.value.splice(index, 1)
    emit('particleDestroyed', particleId)
  }
}

// Get particle style
function getParticleStyle(particle: Particle): Record<string, string | number> {
  const config = particleConfigs[particle.type]
  
  return {
    position: 'absolute',
    left: `${particle.x}px`,
    top: `${particle.y}px`,
    width: `${particle.size}px`,
    height: `${particle.size}px`,
    background: particle.color,
    borderRadius: particle.type === 'starburst' ? '0' : '50%',
    transform: `rotate(${particle.rotation || 0}deg) scale(${particle.scale || 1})`,
    animationDuration: `${particle.duration}ms`,
    boxShadow: (config as any)?.glow ? `0 0 ${particle.size * 2}px ${particle.color}` : 'none',
    pointerEvents: 'none',
    zIndex: particle.type === 'achievement' ? 1000 : 100
  }
}

// Get dust particle style
function getDustParticleStyle(index: number) {
  const delay = (index * 100) % 3000
  const duration = 3000 + Math.random() * 2000
  const size = Math.random() * 2 + 1
  
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`,
    width: `${size}px`,
    height: `${size}px`
  }
}

// Get energy line style
function getEnergyLineStyle(index: number) {
  const delay = (index * 400) % 2000
  const duration = 2000 + Math.random() * 1000
  
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`,
    background: `linear-gradient(to bottom, transparent, ${
      ['#00d4ff', '#9333ea', '#06b6d4'][index % 3]
    }, transparent)`
  }
}

// Burst effect for special events
function createBurstEffect(x: number, y: number, type: ParticleType = 'stardust', count: number = 10) {
  if (!shouldShowParticles.value) return
  
  // Reduce particle count on mobile devices
  const effectiveCount = mobileOpt.isMobile.value ? Math.min(count, 5) : 
                        mobileOpt.isLowEndDevice.value ? Math.min(count, 3) : count
  
  for (let i = 0; i < effectiveCount; i++) {
    const angle = (Math.PI * 2 * i) / count
    const speed = Math.random() * 3 + 2
    // Distance calculated for potential future use
    // const distance = Math.random() * 50 + 30
    
    createParticle(type, x, y, {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      delay: i * 50
    })
  }
}

// Continuous particle stream
function createParticleStream(
  startX: number, 
  startY: number, 
  endX: number, 
  endY: number, 
  type: ParticleType = 'energy',
  duration: number = 2000
) {
  if (!shouldShowParticles.value) return
  
  const basePars = Math.floor(duration / 100)
  const particleCount = mobileOpt.isMobile.value ? Math.min(basePars, 10) : 
                      mobileOpt.isLowEndDevice.value ? Math.min(basePars, 5) : basePars
  
  for (let i = 0; i < particleCount; i++) {
    const progress = i / particleCount
    const x = startX + (endX - startX) * progress
    const y = startY + (endY - startY) * progress
    
    setTimeout(() => {
      createParticle(type, x, y, {
        vx: (endX - startX) / duration * 100,
        vy: (endY - startY) / duration * 100
      })
    }, i * 100)
  }
}

// Create celebration effect
function createCelebrationEffect(x: number, y: number) {
  if (!shouldShowParticles.value) return
  
  // Scale down effects for mobile
  const mainBurstCount = mobileOpt.isMobile.value ? 8 : 15
  const secondaryBurstCount = mobileOpt.isMobile.value ? 4 : 8
  const sparkleCount = mobileOpt.isMobile.value ? 10 : 20
  
  // Main burst
  createBurstEffect(x, y, 'starlight', mainBurstCount)
  
  if (!mobileOpt.isLowEndDevice.value) {
    // Secondary bursts
    setTimeout(() => {
      createBurstEffect(x - 20, y - 20, 'energy', secondaryBurstCount)
      createBurstEffect(x + 20, y - 20, 'cosmic', secondaryBurstCount)
    }, 200)
    
    // Final sparkles
    setTimeout(() => {
      for (let i = 0; i < sparkleCount; i++) {
        const offsetX = (Math.random() - 0.5) * 100
        const offsetY = (Math.random() - 0.5) * 100
        
        setTimeout(() => {
          createParticle('stardust', x + offsetX, y + offsetY, {
            size: Math.random() * 3 + 1
          })
        }, i * 50)
      }
    }, 500)
  }
}

// Public API methods
defineExpose({
  createParticle,
  removeParticle,
  createBurstEffect,
  createParticleStream,
  createCelebrationEffect,
  clearAllParticles: () => {
    activeParticles.value = []
  }
})

// Initialize
onMounted(() => {
  initializeBackgroundStars()
})

onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
})
</script>

<style scoped>
.particle-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

/* Mobile-specific particle optimizations */
.mobile-device .particle-container {
  display: none;
}

.low-end-device .background-effects {
  display: none;
}

.no-particles .particle-container,
.performance-critical .particle-container,
.performance-low .particle-container {
  display: none;
}

.particle {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
}

/* Particle type specific styles */
.particle-stardust {
  background: radial-gradient(circle, var(--particle-stardust) 0%, transparent 70%);
  animation: stardust-particle var(--duration, 2s) ease-out forwards;
}

.particle-starlight {
  background: radial-gradient(circle, var(--particle-starlight) 0%, transparent 70%);
  animation: starlight-particle var(--duration, 3s) ease-out forwards;
  box-shadow: 0 0 10px var(--particle-starlight);
}

.particle-energy {
  background: var(--particle-energy);
  animation: energy-particle var(--duration, 1.5s) linear forwards;
  box-shadow: 0 0 8px var(--particle-energy);
}

.particle-cosmic {
  background: radial-gradient(circle, var(--particle-cosmic) 0%, rgba(147, 51, 234, 0.3) 100%);
  animation: cosmic-particle var(--duration, 4s) ease-out forwards;
}

.particle-nebula {
  background: radial-gradient(circle, var(--particle-nebula) 0%, rgba(6, 182, 212, 0.3) 100%);
  animation: nebula-particle var(--duration, 3.5s) ease-out forwards;
}

.particle-starburst {
  background: radial-gradient(circle, var(--accent-yellow) 0%, var(--accent-orange) 50%, transparent 100%);
  animation: starburst-explosion var(--duration, 1s) ease-out forwards;
  border-radius: 0;
}

.particle-achievement {
  background: radial-gradient(circle, var(--accent-yellow) 0%, rgba(255, 215, 0, 0.3) 100%);
  animation: achievement-particle var(--duration, 2s) ease-out forwards;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 0 20px var(--accent-yellow);
}

.particle-purchase {
  background: radial-gradient(circle, var(--accent-green) 0%, rgba(0, 255, 0, 0.3) 100%);
  animation: purchase-particle var(--duration, 0.8s) ease-out forwards;
}

.particle-milestone {
  background: radial-gradient(circle, #ff6b6b 0%, rgba(255, 107, 107, 0.3) 100%);
  animation: milestone-particle var(--duration, 1.5s) ease-out forwards;
  box-shadow: 0 0 15px #ff6b6b;
}

/* Particle inner elements */
.starburst-inner {
  width: 100%;
  height: 100%;
  background: conic-gradient(from 0deg, var(--accent-yellow), var(--accent-orange), var(--accent-red), var(--accent-yellow));
  border-radius: 50%;
  animation: rotate 1s linear infinite;
}

.achievement-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: inherit;
  animation: pulse 1s ease-in-out infinite;
}

/* Background effects */
.background-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.3;
  z-index: -1;
}

.cosmic-dust {
  position: absolute;
  width: 100%;
  height: 100%;
}

.dust-particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: dust-float 5s linear infinite;
}

.energy-lines {
  position: absolute;
  width: 100%;
  height: 100%;
}

.energy-line {
  position: absolute;
  width: 2px;
  height: 100%;
  animation: energy-flow 2s linear infinite;
}

.constellation-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.1;
}

.constellation-svg {
  width: 100%;
  height: 100%;
}

.bg-star {
  animation: twinkle 3s ease-in-out infinite;
}

/* Keyframe animations */
@keyframes stardust-particle {
  0% {
    transform: translateY(0) scale(0) rotate(0deg);
    opacity: 0;
  }
  15% {
    opacity: 1;
    transform: scale(1.2) rotate(45deg);
  }
  85% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-100px) scale(0.3) rotate(180deg);
    opacity: 0;
  }
}

@keyframes starlight-particle {
  0% {
    transform: translateY(0) scale(0) rotate(0deg);
    opacity: 0;
    filter: brightness(1);
  }
  10% {
    opacity: 1;
    transform: scale(1) rotate(30deg);
    filter: brightness(1.5);
  }
  50% {
    transform: scale(1.1) rotate(180deg);
    filter: brightness(2);
  }
  90% {
    opacity: 1;
    filter: brightness(1.2);
  }
  100% {
    transform: translateY(-120px) scale(0.5) rotate(360deg);
    opacity: 0;
    filter: brightness(0.5);
  }
}

@keyframes energy-particle {
  0% {
    transform: translateY(0) scale(1) rotate(0deg);
    opacity: 1;
    filter: brightness(1);
  }
  25% {
    transform: scale(1.3) rotate(90deg);
    filter: brightness(1.8);
  }
  75% {
    transform: translateY(-60px) scale(0.8) rotate(270deg);
    opacity: 0.7;
  }
  100% {
    transform: translateY(-80px) scale(0.3) rotate(360deg);
    opacity: 0;
    filter: brightness(0.2);
  }
}

@keyframes cosmic-particle {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
    filter: hue-rotate(0deg);
  }
  25% {
    opacity: 1;
    transform: scale(1.2) rotate(90deg);
    filter: hue-rotate(90deg);
  }
  75% {
    opacity: 0.9;
    transform: scale(1.5) rotate(270deg);
    filter: hue-rotate(270deg);
  }
  100% {
    transform: scale(2.5) rotate(360deg) translateY(-40px);
    opacity: 0;
    filter: hue-rotate(360deg);
  }
}

@keyframes nebula-particle {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
    filter: blur(0px);
  }
  20% {
    opacity: 1;
    transform: scale(1) rotate(90deg);
    filter: blur(1px);
  }
  50% {
    transform: scale(1.8) rotate(180deg);
    filter: blur(2px);
  }
  80% {
    opacity: 0.8;
    filter: blur(3px);
  }
  100% {
    transform: scale(2) rotate(360deg);
    opacity: 0;
    filter: blur(5px);
  }
}

@keyframes achievement-particle {
  0% {
    transform: translateY(0) scale(0) rotate(-180deg);
    opacity: 0;
  }
  25% {
    transform: scale(1.2) rotate(-90deg);
    opacity: 1;
  }
  75% {
    transform: translateY(-50px) scale(1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) scale(0.8) rotate(90deg);
    opacity: 0;
  }
}

@keyframes purchase-particle {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) translateY(-40px);
    opacity: 0;
  }
}

@keyframes milestone-particle {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  30% {
    transform: scale(1.3) rotate(120deg);
    opacity: 1;
  }
  70% {
    transform: scale(1) rotate(240deg);
    opacity: 1;
  }
  100% {
    transform: scale(0.5) rotate(360deg) translateY(-60px);
    opacity: 0;
  }
}

@keyframes starburst-explosion {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 1;
    filter: brightness(2);
  }
  25% {
    transform: scale(1.5) rotate(90deg);
    opacity: 1;
    filter: brightness(3);
  }
  50% {
    transform: scale(3) rotate(180deg);
    opacity: 0.8;
    filter: brightness(2.5);
  }
  75% {
    transform: scale(4) rotate(270deg);
    opacity: 0.4;
    filter: brightness(1.5);
  }
  100% {
    transform: scale(5) rotate(360deg);
    opacity: 0;
    filter: brightness(0.5);
  }
}

@keyframes dust-float {
  0% {
    transform: translateY(100vh) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
    transform: translateY(90vh) translateX(5px) rotate(45deg);
  }
  50% {
    transform: translateY(50vh) translateX(10px) rotate(180deg);
  }
  90% {
    opacity: 1;
    transform: translateY(10vh) translateX(15px) rotate(315deg);
  }
  100% {
    transform: translateY(-20px) translateX(20px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes energy-flow {
  0% {
    transform: translateY(100%) scaleY(0);
    opacity: 0;
  }
  25% {
    opacity: 1;
    transform: translateY(75%) scaleY(0.5);
  }
  50% {
    transform: translateY(50%) scaleY(1);
  }
  75% {
    transform: translateY(25%) scaleY(0.8);
  }
  100% {
    transform: translateY(0%) scaleY(0);
    opacity: 0;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.8; }
}

/* Enhanced particle effects */
.particle-stardust::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: radial-gradient(circle, var(--accent-yellow) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0.5;
  animation: sparkle 1s ease-in-out infinite;
}

.particle-energy::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, var(--accent-blue) 0%, transparent 50%);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  opacity: 0.3;
  animation: electric-pulse 0.5s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.2); }
}

@keyframes electric-pulse {
  0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.3); }
}

/* Performance optimizations */
.particle-container {
  will-change: transform;
  contain: layout style paint;
}

.particle {
  will-change: transform, opacity;
  contain: layout style;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .particle-container {
    display: none; /* Disable particles on mobile for performance */
  }
  
  .mobile-device .particle-stardust::after,
  .mobile-device .particle-energy::before {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .particle {
    animation: none !important;
  }
  
  .background-effects {
    display: none;
  }
}
</style>