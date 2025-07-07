<template>
  <header class="header">
    <div class="header-content">
      <h1 class="game-title">AETHER - Glare Layer</h1>
      <div class="resources-grid">
        <div class="resource-display hover-lift" :class="{ 'resource-updated': stardustUpdated }">
          <div class="resource-label">Stardust</div>
          <div class="resource-value" ref="stardustValueRef">{{ format(stardust.amount) }}</div>
          <div class="resource-rate">+{{ format(totalStardustProduction) }}/s</div>
          <div class="resource-particles" ref="stardustParticlesRef"></div>
        </div>
        <div class="resource-display hover-lift" :class="{ 'resource-updated': starlightUpdated }">
          <div class="resource-label">Starlight</div>
          <div class="resource-value" ref="starlightValueRef">{{ format(starlight.amount) }}</div>
          <div class="resource-glow"></div>
        </div>
        <div class="resource-display hover-lift" v-if="starRails > 0">
          <div class="resource-label">Star Rails</div>
          <div class="resource-value">{{ starRails }}</div>
          <div class="resource-icon">🚂</div>
        </div>
        <div class="resource-display hover-lift" v-if="nebularEssence > 0">
          <div class="resource-label">Nebular Essence</div>
          <div class="resource-value">{{ nebularEssence }}</div>
          <div class="resource-icon">🌌</div>
        </div>
        <div class="resource-display hover-lift" v-if="stellarEnergy > 0">
          <div class="resource-label">Stellar Energy</div>
          <div class="resource-value">{{ format(stellarEnergy, 1) }}</div>
          <div class="resource-icon">⚡</div>
        </div>
        <div class="resource-display hover-lift" v-if="cosmicFragments > 0">
          <div class="resource-label">Cosmic Fragments</div>
          <div class="resource-value">{{ cosmicFragments }}</div>
          <div class="resource-icon">💎</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/gameState'
import { usePulsationStore } from '@/stores/pulsation'
import { useRailRoadStore } from '@/stores/railroad'
import { format } from '@/utils/formatting'
import { useVisualEffects } from '@/composables/useVisualEffects'

const gameStore = useGameStore()
const pulsationStore = usePulsationStore()
const railRoadStore = useRailRoadStore()
const { animateNumber, animate } = useVisualEffects()

const { 
  stardust, 
  starlight, 
  nebularEssence,
  totalStardustProduction 
} = storeToRefs(gameStore)

const { stellarEnergy } = storeToRefs(pulsationStore)
const { starRails, cosmicFragments } = storeToRefs(railRoadStore)

// Refs for animation targets
const stardustValueRef = ref<HTMLElement>()
const starlightValueRef = ref<HTMLElement>()
const stardustParticlesRef = ref<HTMLElement>()

// Animation state
const stardustUpdated = ref(false)
const starlightUpdated = ref(false)
const previousStardust = ref(stardust.value.amount)
const previousStarlight = ref(starlight.value.amount)

// Watch for resource changes and animate
watch(() => stardust.value.amount, async (newValue, oldValue) => {
  if (newValue.gt(oldValue) && stardustValueRef.value) {
    stardustUpdated.value = true
    
    // Animate the value change
    await animateNumber(stardustValueRef.value, {
      from: oldValue.toNumber(),
      to: newValue.toNumber(),
      duration: 800,
      decimals: 0
    })
    
    // Add success animation
    await animate(stardustValueRef.value, 'success')
    
    setTimeout(() => {
      stardustUpdated.value = false
    }, 1000)
  }
  previousStardust.value = newValue
})

watch(() => starlight.value.amount, async (newValue, oldValue) => {
  if (newValue.gt(oldValue) && starlightValueRef.value) {
    starlightUpdated.value = true
    
    // Special effect for starlight gain
    await animate(starlightValueRef.value, 'starburst')
    
    setTimeout(() => {
      starlightUpdated.value = false
    }, 2000)
  }
  previousStarlight.value = newValue
})
</script>

<style scoped>
.header {
  background: rgba(26, 26, 46, 0.95);
  border-bottom: 2px solid var(--border-primary);
  padding: 20px;
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.game-title {
  font-family: 'Roboto Mono', monospace;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(45deg, var(--accent-blue), var(--accent-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 10px var(--accent-blue);
  animation: title-pulse 4s ease-in-out infinite;
}

@keyframes title-pulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  flex: 1;
  max-width: 900px;
}

.resource-display {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 12px 16px;
  min-width: 120px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.resource-display::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
  pointer-events: none;
}

.resource-display:hover::before {
  left: 100%;
}

.resource-updated {
  background: rgba(0, 255, 0, 0.1);
  border-color: var(--accent-green);
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
}

.resource-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
  opacity: 0;
  animation: resource-glow 3s ease-in-out infinite;
  pointer-events: none;
}

.resource-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.resource-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 16px;
  opacity: 0.6;
  animation: icon-float 3s ease-in-out infinite;
}

@keyframes resource-glow {
  0%, 100% { opacity: 0; }
  50% { opacity: 0.3; }
}

@keyframes icon-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

.resource-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.resource-value {
  font-family: 'Roboto Mono', monospace;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  transition: all 0.3s ease;
  position: relative;
}

.resource-updated .resource-value {
  color: var(--accent-green);
  text-shadow: 0 0 8px var(--accent-green);
  transform: scale(1.05);
}

.resource-rate {
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  color: var(--accent-green);
  margin-top: 2px;
}</style>