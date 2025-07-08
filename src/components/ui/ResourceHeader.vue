<template>
  <header class="header">
    <div class="header-content">
      <h1 class="game-title">AETHER - Glare Layer</h1>
      <div class="resources-grid">
        <div class="resource-display hover-lift resource-primary" :class="{ 'resource-updated': stardustUpdated }">
          <div class="resource-label">Stardust</div>
          <div class="resource-value" ref="stardustValueRef">{{ format(stardust.amount) }}</div>
          <div class="resource-rate">+{{ format(totalStardustProduction) }}/s</div>
          <div class="resource-efficiency" v-if="getProductionEfficiency() !== 1">
            Efficiency: {{ (getProductionEfficiency() * 100).toFixed(1) }}%
          </div>
          <div class="resource-particles" ref="stardustParticlesRef"></div>
        </div>
        <div class="resource-display hover-lift resource-premium" :class="{ 'resource-updated': starlightUpdated }">
          <div class="resource-label">Starlight</div>
          <div class="resource-value" ref="starlightValueRef">{{ format(starlight.amount) }}</div>
          <div class="resource-rate" v-if="canGetStarlight">Ready for reset!</div>
          <div class="resource-rate" v-else>{{ format(getStarlightProgress()) }} / {{ format(D('1e100')) }}</div>
          <div class="resource-glow"></div>
        </div>
        <div class="resource-display hover-lift resource-special" v-if="starRails > 0">
          <div class="resource-label">Star Rails</div>
          <div class="resource-value">{{ starRails }}</div>
          <div class="resource-rate">+{{ getRailGeneration() }}/starburst</div>
          <div class="resource-icon">🚂</div>
        </div>
        <div class="resource-display hover-lift resource-special" v-if="nebularEssence > 0">
          <div class="resource-label">Nebula Material</div>
          <div class="resource-value">{{ format(nebularEssence, 1) }}</div>
          <div class="resource-rate">+{{ format(getMaterialGeneration()) }}/s</div>
          <div class="resource-icon">🌌</div>
        </div>
        <div class="resource-display hover-lift resource-energy" v-if="stellarEnergy > 0">
          <div class="resource-label">Stellar Energy</div>
          <div class="resource-value">{{ format(stellarEnergy, 1) }}</div>
          <div class="resource-rate">Pulsation: {{ getPulsationState() }}</div>
          <div class="resource-icon">⚡</div>
        </div>
        <div class="resource-display hover-lift resource-special" v-if="cosmicFragments > 0">
          <div class="resource-label">Cosmic Fragments</div>
          <div class="resource-value">{{ cosmicFragments }}</div>
          <div class="resource-rate">Rail Road bonus</div>
          <div class="resource-icon">💎</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/gameState'
import { usePulsationStore } from '@/stores/pulsation'
import { useRailRoadStore } from '@/stores/railroad'
import { format } from '@/utils/formatting'
import { D } from '@/utils/decimal'
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

// Track reset events for proper display updates
const isResetting = ref(false)
watch(() => gameStore.starburstCount, () => {
  isResetting.value = true
  setTimeout(() => {
    isResetting.value = false
  }, 1000)
})

watch(() => gameStore.starlightResetCount, () => {
  isResetting.value = true
  setTimeout(() => {
    isResetting.value = false
  }, 1500)
})

// Advanced resource calculations
const canGetStarlight = computed(() => gameStore.canGetStarlight)

function getProductionEfficiency(): number {
  // Calculate efficiency based on system interactions
  const pulsationBonus = pulsationStore.currentBonus?.stardustMultiplier || D(1)
  const railBonus = railRoadStore.totalProductionBonus || D(1)
  const baseEfficiency = pulsationBonus.mul(railBonus).toNumber()
  return Math.min(baseEfficiency, 10) // Cap at 10x for display
}

function getStarlightProgress() {
  return stardust.value.amount
}

function getRailGeneration(): number {
  if (!canGetStarlight.value) return 0
  const potentialStarlight = 1
  return Math.max(1, Math.floor(Math.pow(potentialStarlight / 10, 0.5)))
}

function getMaterialGeneration() {
  // NM production based on filament purchases (0.1% of total filament value per second)
  const filamentValue = gameStore.filaments.reduce((total, filament, index) => {
    const cost = gameStore.getFilamentCost(index)
    return total.add(cost.mul(filament.purchased))
  }, D(0))
  return filamentValue.mul(0.001) // 0.1% of filament investment value per second
}

function getPulsationState(): string {
  return (pulsationStore as any)?.currentState || 'stable'
}

// Watch for resource changes and animate
watch(() => stardust.value.amount, async (newValue, oldValue) => {
  if (!oldValue) oldValue = D(0)
  
  // Check for reset (value went down significantly or to zero)
  const isReset = newValue.lt(oldValue.mul(0.1)) || newValue.eq(0)
  
  if (stardustValueRef.value) {
    if (isReset && oldValue.gt(0)) {
      // Handle reset animation
      stardustUpdated.value = true
      await animate(stardustValueRef.value, 'bounce')
      setTimeout(() => {
        stardustUpdated.value = false
      }, 500)
    } else if (newValue.gt(oldValue)) {
      // Handle normal increase
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
  }
  previousStardust.value = newValue
}, { immediate: true })

watch(() => starlight.value.amount, async (newValue, oldValue) => {
  if (!oldValue) oldValue = D(0)
  
  // Check for reset or gain
  const isReset = newValue.lt(oldValue) && newValue.eq(0)
  const isGain = newValue.gt(oldValue)
  
  if (starlightValueRef.value) {
    if (isReset && oldValue.gt(0)) {
      // Handle starlight reset (shouldn't happen, but just in case)
      starlightUpdated.value = true
      await animate(starlightValueRef.value, 'bounce')
      setTimeout(() => {
        starlightUpdated.value = false
      }, 1000)
    } else if (isGain) {
      starlightUpdated.value = true
      
      // Special effect for starlight gain
      await animate(starlightValueRef.value, 'purchase')
      
      setTimeout(() => {
        starlightUpdated.value = false
      }, 2000)
    }
  }
  previousStarlight.value = newValue
}, { immediate: true })
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
}

.resource-efficiency {
  font-family: 'Roboto Mono', monospace;
  font-size: 10px;
  color: var(--accent-blue);
  margin-top: 1px;
  opacity: 0.8;
}

/* Resource type styling */
.resource-primary {
  border-color: var(--accent-yellow);
  background: rgba(255, 215, 0, 0.05);
}

.resource-premium {
  border-color: var(--accent-purple);
  background: rgba(147, 51, 234, 0.05);
}

.resource-special {
  border-color: var(--accent-blue);
  background: rgba(59, 130, 246, 0.05);
}

.resource-energy {
  border-color: var(--accent-green);
  background: rgba(34, 197, 94, 0.05);
}

.resource-primary:hover {
  background: rgba(255, 215, 0, 0.1);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
}

.resource-premium:hover {
  background: rgba(147, 51, 234, 0.1);
  box-shadow: 0 4px 15px rgba(147, 51, 234, 0.2);
}

.resource-special:hover {
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
}

.resource-energy:hover {
  background: rgba(34, 197, 94, 0.1);
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.2);
}

/* Enhanced responsiveness */
@media (max-width: 768px) {
  .header {
    padding: 12px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 12px;
  }
  
  .game-title {
    font-size: 20px;
    text-align: center;
  }
  
  .resources-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    width: 100%;
  }
  
  .resource-display {
    padding: 8px 12px;
    min-width: unset;
  }
  
  .resource-value {
    font-size: 14px;
  }
  
  .resource-rate, .resource-efficiency {
    font-size: 10px;
  }
  
  .resource-icon {
    font-size: 14px;
  }
}</style>