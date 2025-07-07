<template>
  <div class="star-map-container">
    <ParticleSystem ref="particleSystem" :enabled="true" :showBackgroundEffects="true" />
    <h2 class="section-title star-map-title">Star Map</h2>
    
    <!-- Star Echo System (when unlocked) -->
    <div v-if="starEchoUnlocked" class="star-echo-section">
      <StarEcho />
    </div>
    
    <!-- Traditional Star Map (when Star Echo not unlocked) -->
    <div v-else class="traditional-star-map">
      <div class="star-map" ref="starMapRef">
        <div 
          class="central-star"
          :class="{ 
            'star-expansion': pulsationState === 'expansion',
            'star-contraction': pulsationState === 'contraction',
            'star-stabilization': pulsationState === 'stabilization'
          }"
          @click="handleStarClick"
        >
          <div class="star-core"></div>
          <div class="star-flare"></div>
        </div>
        
        <!-- Filament Orbits -->
        <div 
          v-for="(filament, index) in visibleFilaments"
          :key="filament.id"
          class="filament-orbit hover-lift"
          :style="getOrbitStyle(index)"
        >
          <div 
            class="filament"
            :class="{ 
              'filament-active': filament.owned.gt(0),
              'filament-pulsing': filament.owned.gt(0) && index === activePulsingIndex
            }"
            :style="getFilamentStyle(filament)"
            @click="selectFilament(filament)"
            @mouseenter="handleFilamentHover(index, true)"
            @mouseleave="handleFilamentHover(index, false)"
          >
            <span class="filament-count">{{ Math.floor(filament.owned.toNumber()) }}</span>
            <div class="filament-glow" v-if="filament.owned.gt(0)"></div>
          </div>
        </div>
      </div>
      
      <div class="star-info">
        <div class="info-grid">
          <div class="info-card">
            <h4>Starburst Count</h4>
            <p class="info-value">{{ starburstCount }}</p>
          </div>
          <div class="info-card" v-if="starburstCount > 0">
            <h4>Starburst Multiplier</h4>
            <p class="info-value">{{ format(starburstMultiplier) }}x</p>
          </div>
          <div class="info-card" v-if="starburstCount >= 4">
            <h4>Next Unlock</h4>
            <p class="info-value">Star Echo at 5th Starburst</p>
          </div>
          <div class="info-card" v-if="pulsationState">
            <h4>Star State</h4>
            <p class="info-value capitalize">{{ pulsationState }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/gameState'
import { useStarEchoStore } from '@/stores/starecho'
import { usePulsationStore } from '@/stores/pulsation'
import { format } from '@/utils/formatting'
import { D } from '@/utils/decimal'
import StarEcho from '@/components/game/StarEcho.vue'
import ParticleSystem from '@/components/effects/ParticleSystem.vue'
import { useVisualEffects } from '@/composables/useVisualEffects'

const gameStore = useGameStore()
const starEchoStore = useStarEchoStore()
const pulsationStore = usePulsationStore()
const { filaments, starburstCount, starlight } = storeToRefs(gameStore)
const { unlocked: starEchoUnlocked } = storeToRefs(starEchoStore)
const pulsationState = computed(() => (pulsationStore as any)?.currentState || 'stable')
const { animate, createParticleBurst, shakeScreen } = useVisualEffects()

// Refs
const particleSystem = ref<InstanceType<typeof ParticleSystem>>()
const starMapRef = ref<HTMLElement>()
const activePulsingIndex = ref<number>(-1)
const pulsingInterval = ref<number>()

const visibleFilaments = computed(() => {
  return filaments.value.filter((_, index) => {
    if (index === 0) return true
    return filaments.value[index - 1].owned.gt(0)
  })
})

const starburstMultiplier = computed(() => {
  if (starburstCount.value === 0) return D(1)
  const base = D(2).mul(D(1.1).pow(starlight.value.amount))
  return base.pow(starburstCount.value)
})

function getOrbitStyle(index: number) {
  const radius = 150 + index * 40
  return {
    width: `${radius * 2}px`,
    height: `${radius * 2}px`,
    top: `50%`,
    left: `50%`,
    transform: `translate(-50%, -50%)`,
    animationDuration: `${60 + index * 10}s`
  }
}

function getFilamentStyle(filament: any) {
  const tierColors = [
    'var(--accent-blue)',
    'var(--accent-green)',
    'var(--accent-purple)',
    'var(--accent-orange)',
    'var(--accent-red)',
    'var(--accent-yellow)',
    '#ff00ff',
    '#00ffff',
    '#ff00aa',
    '#00ff00'
  ]
  
  return {
    background: `radial-gradient(circle, ${tierColors[filament.id - 1]} 0%, transparent 70%)`,
    boxShadow: filament.owned.gt(0) ? `0 0 20px ${tierColors[filament.id - 1]}` : 'none'
  }
}

async function selectFilament(filament: any) {
  console.log('Selected filament:', filament)
  
  // Visual feedback for selection
  const filamentElements = document.querySelectorAll('.filament')
  const targetElement = filamentElements[filament.id - 1] as HTMLElement
  
  if (targetElement) {
    await animate(targetElement, 'bounce')
    
    // Create selection particles
    const rect = targetElement.getBoundingClientRect()
    const mapRect = starMapRef.value?.getBoundingClientRect()
    
    if (mapRect) {
      const relativeX = rect.left + rect.width / 2 - mapRect.left
      const relativeY = rect.top + rect.height / 2 - mapRect.top
      
      particleSystem.value?.createParticle(
        'starlight',
        relativeX,
        relativeY
      )
    }
  }
}

async function handleStarClick() {
  // Create starburst effect
  const rect = starMapRef.value?.getBoundingClientRect()
  if (rect) {
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    particleSystem.value?.createCelebrationEffect(centerX, centerY)
    
    // Screen effects for dramatic impact
    createParticleBurst(rect.left + centerX, rect.top + centerY, {
      type: 'celebration',
      count: 25,
      colors: ['#ffd700', '#ff8c00', '#ff6b35']
    })
    
    shakeScreen(15, 800)
  }
}

function handleFilamentHover(index: number, isHovering: boolean) {
  if (isHovering && visibleFilaments.value[index]?.owned.gt(0)) {
    activePulsingIndex.value = index
    
    // Create hover particles
    const filamentElements = document.querySelectorAll('.filament')
    const targetElement = filamentElements[index] as HTMLElement
    
    if (targetElement && particleSystem.value) {
      const rect = targetElement.getBoundingClientRect()
      const mapRect = starMapRef.value?.getBoundingClientRect()
      
      if (mapRect) {
        const relativeX = rect.left + rect.width / 2 - mapRect.left
        const relativeY = rect.top + rect.height / 2 - mapRect.top
        
        particleSystem.value.createParticle(
          'energy',
          relativeX,
          relativeY
        )
      }
    }
  } else {
    activePulsingIndex.value = -1
  }
}

// Animation cycle for filaments
function startFilamentAnimationCycle() {
  pulsingInterval.value = setInterval(() => {
    const activeFilaments = visibleFilaments.value.filter(f => f.owned.gt(0))
    if (activeFilaments.length > 0) {
      const randomIndex = Math.floor(Math.random() * activeFilaments.length)
      activePulsingIndex.value = randomIndex
      
      setTimeout(() => {
        activePulsingIndex.value = -1
      }, 2000)
    }
  }, 5000)
}

onMounted(() => {
  startFilamentAnimationCycle()
})

onUnmounted(() => {
  if (pulsingInterval.value) {
    clearInterval(pulsingInterval.value)
  }
})
</script>

<style scoped>
.star-map-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-green);
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
}

.star-map {
  position: relative;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle at center, rgba(0, 180, 216, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  margin: 0 auto;
}

.central-star {
  position: absolute;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, var(--accent-yellow) 0%, var(--accent-orange) 50%, transparent 70%);
  border-radius: 50%;
  box-shadow: 
    0 0 60px var(--accent-yellow),
    0 0 120px var(--accent-orange),
    0 0 180px rgba(255, 107, 53, 0.5);
  animation: starPulse 4s ease-in-out infinite;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  /* Enhanced touch targets */
  min-width: 48px;
  min-height: 48px;
  touch-action: manipulation;
}

.central-star:hover, .central-star:focus {
  transform: translate(-50%, -50%) scale(1.05);
  box-shadow: 
    0 0 80px var(--accent-yellow),
    0 0 160px var(--accent-orange),
    0 0 240px rgba(255, 107, 53, 0.7);
}

/* Enhanced pulsation states */
.central-star.star-expansion {
  animation: starExpansion 2s ease-out;
  transform: translate(-50%, -50%) scale(1.2);
}

.central-star.star-contraction {
  animation: starContraction 1.5s ease-in;
  transform: translate(-50%, -50%) scale(0.8);
}

.central-star.star-stabilization {
  animation: starStabilization 3s ease-in-out;
  transform: translate(-50%, -50%) scale(1.0);
}

.star-core {
  position: absolute;
  top: 20%;
  left: 20%;
  width: 60%;
  height: 60%;
  background: radial-gradient(circle, #ffffff 0%, var(--accent-yellow) 70%);
  border-radius: 50%;
  animation: coreRotate 8s linear infinite;
}

.star-flare {
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background: conic-gradient(from 0deg, transparent, var(--accent-orange), transparent, var(--accent-red), transparent);
  border-radius: 50%;
  animation: flareRotate 12s linear infinite;
  opacity: 0.6;
}

@keyframes coreRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes flareRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

@keyframes starPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.9; }
}

.filament-orbit {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: orbitRotate linear infinite;
}

@keyframes orbitRotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.filament {
  position: absolute;
  width: 40px;
  height: 40px;
  background: radial-gradient(circle, var(--accent-blue) 0%, transparent 70%);
  border-radius: 50%;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  /* Enhanced mobile touch targets */
  min-width: 48px;
  min-height: 48px;
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
}

.filament:hover {
  transform: translateX(-50%) scale(1.2);
}

.filament-active {
  animation: filament-pulse 3s ease-in-out infinite;
}

.filament-pulsing {
  animation: filament-active-pulse 1.5s ease-in-out infinite;
}

.filament-glow {
  position: absolute;
  top: -25%;
  left: -25%;
  width: 150%;
  height: 150%;
  border-radius: 50%;
  background: radial-gradient(circle, currentColor 0%, transparent 70%);
  opacity: 0.3;
  animation: glow-pulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes filament-pulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.05); }
}

@keyframes filament-active-pulse {
  0%, 100% { 
    transform: translateX(-50%) scale(1);
    box-shadow: 0 0 10px currentColor;
  }
  50% { 
    transform: translateX(-50%) scale(1.15);
    box-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
  }
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

/* Enhanced pulsation state animations with visual feedback */
@keyframes starExpansion {
  0% { 
    transform: translate(-50%, -50%) scale(1);
    box-shadow: 0 0 60px var(--accent-yellow), 0 0 120px var(--accent-orange);
    filter: brightness(1);
  }
  25% {
    transform: translate(-50%, -50%) scale(1.15);
    box-shadow: 0 0 90px var(--accent-yellow), 0 0 160px var(--accent-orange);
    filter: brightness(1.2);
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.3);
    box-shadow: 0 0 120px var(--accent-yellow), 0 0 200px var(--accent-orange);
    filter: brightness(1.4);
  }
  75% {
    transform: translate(-50%, -50%) scale(1.25);
    box-shadow: 0 0 110px var(--accent-yellow), 0 0 190px var(--accent-orange);
    filter: brightness(1.3);
  }
  100% { 
    transform: translate(-50%, -50%) scale(1.2);
    box-shadow: 0 0 100px var(--accent-yellow), 0 0 180px var(--accent-orange);
    filter: brightness(1.1);
  }
}

@keyframes starContraction {
  0% { 
    transform: translate(-50%, -50%) scale(1);
    box-shadow: 0 0 60px var(--accent-yellow), 0 0 120px var(--accent-orange);
    filter: brightness(1);
  }
  25% {
    transform: translate(-50%, -50%) scale(0.85);
    box-shadow: 0 0 45px var(--accent-yellow), 0 0 90px var(--accent-orange);
    filter: brightness(0.9);
  }
  50% { 
    transform: translate(-50%, -50%) scale(0.6);
    box-shadow: 0 0 30px var(--accent-yellow), 0 0 60px var(--accent-orange);
    filter: brightness(0.8);
  }
  75% {
    transform: translate(-50%, -50%) scale(0.7);
    box-shadow: 0 0 35px var(--accent-yellow), 0 0 70px var(--accent-orange);
    filter: brightness(0.85);
  }
  100% { 
    transform: translate(-50%, -50%) scale(0.8);
    box-shadow: 0 0 40px var(--accent-yellow), 0 0 80px var(--accent-orange);
    filter: brightness(0.9);
  }
}

@keyframes starStabilization {
  0% { 
    transform: translate(-50%, -50%) scale(1.2);
    box-shadow: 0 0 100px var(--accent-yellow), 0 0 180px var(--accent-orange);
    filter: brightness(1.1);
  }
  20% { 
    transform: translate(-50%, -50%) scale(0.8);
    box-shadow: 0 0 40px var(--accent-yellow), 0 0 80px var(--accent-orange);
    filter: brightness(0.9);
  }
  40% { 
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: 0 0 80px var(--accent-yellow), 0 0 140px var(--accent-orange);
    filter: brightness(1.05);
  }
  60% { 
    transform: translate(-50%, -50%) scale(0.9);
    box-shadow: 0 0 50px var(--accent-yellow), 0 0 100px var(--accent-orange);
    filter: brightness(0.95);
  }
  80% {
    transform: translate(-50%, -50%) scale(1.05);
    box-shadow: 0 0 70px var(--accent-yellow), 0 0 130px var(--accent-orange);
    filter: brightness(1.02);
  }
  100% { 
    transform: translate(-50%, -50%) scale(1.0);
    box-shadow: 0 0 60px var(--accent-yellow), 0 0 120px var(--accent-orange);
    filter: brightness(1);
  }
}

.filament-count {
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
}

.star-info {
  margin-top: 30px;
  text-align: center;
  width: 100%;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  max-width: 600px;
  margin: 0 auto;
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
}

.info-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-blue);
  transform: translateY(-2px);
}

.info-card h4 {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  font-family: 'Roboto Mono', monospace;
}

.capitalize {
  text-transform: capitalize;
}

.star-map-title {
  background: linear-gradient(45deg, var(--accent-yellow), var(--accent-orange));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: title-glow 3s ease-in-out infinite;
}

@keyframes title-glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}

@media (max-width: 768px) {
  .star-map {
    width: 400px;
    height: 400px;
  }
  
  .central-star {
    width: 80px;
    height: 80px;
    /* Ensure touch target compliance even on mobile */
    min-width: 48px;
    min-height: 48px;
  }
  
  .filament {
    width: 48px; /* WCAG compliance */
    height: 48px;
    top: -24px;
    /* Enhanced mobile interaction */
    border: 2px solid transparent;
    transition: all 0.2s ease;
  }
  
  .filament:active {
    transform: translateX(-50%) scale(0.95);
    border-color: var(--accent-blue);
  }
  
  .filament-count {
    font-size: 11px !important;
    font-weight: 800;
  }
  
  /* Simplified animations for mobile */
  .central-star.star-expansion,
  .central-star.star-contraction,
  .central-star.star-stabilization {
    animation-duration: 1s !important;
  }
  
  /* Enhanced touch feedback */
  .info-card {
    min-height: 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}</style>