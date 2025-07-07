<template>
  <header class="header">
    <div class="header-content">
      <div class="game-title">
        Aether Project
        <span class="layer-indicator">{{ currentLayer }}</span>
      </div>
      
      <div class="resources-grid">
        <div class="resource-display" v-for="resource in displayedResources" :key="resource.id">
          <div class="resource-label">{{ resource.label }}</div>
          <div class="resource-value">{{ resource.value }}</div>
          <div v-if="resource.rate" class="resource-rate">{{ resource.rate }}/s</div>
        </div>
      </div>
      
      <div class="header-actions">
        <button
          v-if="gameStore.canStarburst"
          class="action-button starburst"
          @click="performStarburst"
        >
          Starburst
        </button>
        <button
          v-if="gameStore.canGetStarlight"
          class="action-button starlight"
          @click="performStarlightReset"
        >
          Get Starlight
        </button>
        <button
          class="action-button settings"
          @click="$emit('openSettings')"
        >
          ⚙️
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/gameState'
import { format } from '@/utils/formatting'

const gameStore = useGameStore()
const { 
  stardust, 
  starlight, 
  starRail, 
  nebularEssence, 
  stellarEnergy, 
  cosmicFragment,
  totalStardustProduction 
} = storeToRefs(gameStore)

defineEmits<{
  openSettings: []
}>()

const currentLayer = computed(() => 'Glare Layer')

const displayedResources = computed(() => [
  {
    id: 'stardust',
    label: 'Stardust',
    value: format(stardust.value.amount),
    rate: totalStardustProduction.value.gt(0) ? format(totalStardustProduction.value) : null
  },
  {
    id: 'starlight',
    label: 'Starlight',
    value: format(starlight.value.amount),
    rate: null
  },
  {
    id: 'starRail',
    label: 'Star Rail',
    value: starRail.value.toString(),
    rate: null
  },
  {
    id: 'nebularEssence',
    label: 'Nebular Essence',
    value: format(nebularEssence.value),
    rate: null
  },
  {
    id: 'stellarEnergy',
    label: 'Stellar Energy',
    value: format(stellarEnergy.value),
    rate: null
  },
  {
    id: 'cosmicFragment',
    label: 'Cosmic Fragment',
    value: format(cosmicFragment.value),
    rate: null
  }
].filter(resource => {
  // Only show resources that have been unlocked or have value
  if (resource.id === 'stardust') return true
  if (resource.id === 'starlight') return starlight.value.amount.gt(0) || gameStore.canGetStarlight
  if (resource.id === 'starRail') return starRail.value > 0 || starlight.value.amount.gt(0)
  if (resource.id === 'nebularEssence') return nebularEssence.value > 0 || starlight.value.amount.gte(1)
  if (resource.id === 'stellarEnergy') return stellarEnergy.value > 0 || starlight.value.amount.gte(2)
  if (resource.id === 'cosmicFragment') return cosmicFragment.value > 0 || starlight.value.amount.gte(5)
  return false
}))

function performStarburst() {
  gameStore.performStarburst()
}

function performStarlightReset() {
  gameStore.performStarlightReset()
}
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
}

.game-title {
  font-family: 'Roboto Mono', monospace;
  font-size: 28px;
  font-weight: 700;
  color: var(--accent-blue);
  text-shadow: 0 0 10px var(--accent-blue);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.layer-indicator {
  font-size: 12px;
  color: var(--accent-green);
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 4px;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  flex: 1;
  max-width: 800px;
}

.resource-display {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 12px 16px;
  min-width: 120px;
  transition: all 0.3s ease;
}

.resource-display:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-blue);
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
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.resource-rate {
  font-family: 'Roboto Mono', monospace;
  font-size: 10px;
  color: var(--accent-green);
  margin-top: 2px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-button {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-family: 'Exo 2', sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-button.starburst {
  background: linear-gradient(135deg, var(--accent-orange), var(--accent-red));
  color: white;
}

.action-button.starlight {
  background: linear-gradient(135deg, var(--accent-yellow), var(--accent-orange));
  color: white;
}

.action-button.settings {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border-secondary);
  color: var(--text-secondary);
  font-size: 16px;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.action-button.settings:hover {
  background: rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
}

@media (max-width: 1200px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .game-title {
    align-items: center;
  }
  
  .resources-grid {
    grid-template-columns: repeat(3, 1fr);
    max-width: 600px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 15px;
  }
  
  .game-title {
    font-size: 24px;
  }
  
  .resources-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .resource-display {
    padding: 8px 12px;
    min-width: 100px;
  }
  
  .action-button {
    padding: 8px 12px;
    font-size: 11px;
  }
}
</style>