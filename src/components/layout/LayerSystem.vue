<template>
  <div class="layer-system">
    <div class="layer-selector" v-if="availableLayers.length > 1">
      <h3 class="layer-title">Active Layer</h3>
      <div class="layer-buttons">
        <button
          v-for="layer in availableLayers"
          :key="layer.id"
          :class="['layer-button', { active: currentLayer === layer.id }]"
          @click="switchLayer(layer.id)"
          :disabled="!layer.unlocked"
        >
          <div class="layer-name">{{ layer.name }}</div>
          <div class="layer-description">{{ layer.description }}</div>
          <div v-if="!layer.unlocked" class="layer-lock">🔒</div>
        </button>
      </div>
    </div>
    
    <div class="layer-content">
      <slot :currentLayer="currentLayer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/gameState'

export interface GameLayer {
  id: string
  name: string
  description: string
  unlocked: boolean
  unlockCondition?: () => boolean
}

const gameStore = useGameStore()
const { starlight } = storeToRefs(gameStore)

const currentLayer = ref('glare')

// Define all game layers
const allLayers = computed<GameLayer[]>(() => [
  {
    id: 'glare',
    name: 'Glare Layer',
    description: 'The foundation of cosmic energy',
    unlocked: true
  },
  {
    id: 'nova',
    name: 'Nova Layer',
    description: 'Explosive stellar evolution',
    unlocked: starlight.value.amount.gte(50), // Example unlock condition
    unlockCondition: () => starlight.value.amount.gte(50)
  },
  {
    id: 'supernova',
    name: 'Supernova Layer',
    description: 'Cataclysmic stellar death',
    unlocked: false, // Will be implemented later
    unlockCondition: () => false
  },
  {
    id: 'pulsar',
    name: 'Pulsar Layer',
    description: 'Rapidly rotating neutron stars',
    unlocked: false,
    unlockCondition: () => false
  },
  {
    id: 'magnetar',
    name: 'Magnetar Layer',
    description: 'Highly magnetized neutron stars',
    unlocked: false,
    unlockCondition: () => false
  },
  {
    id: 'quasar',
    name: 'Quasar Layer',
    description: 'Active galactic nuclei',
    unlocked: false,
    unlockCondition: () => false
  },
  {
    id: 'blackhole',
    name: 'Black Hole Layer',
    description: 'Gravitational singularities',
    unlocked: false,
    unlockCondition: () => false
  },
  {
    id: 'wormhole',
    name: 'Wormhole Layer',
    description: 'Spacetime tunnels',
    unlocked: false,
    unlockCondition: () => false
  },
  {
    id: 'multiverse',
    name: 'Multiverse Layer',
    description: 'Multiple universes',
    unlocked: false,
    unlockCondition: () => false
  },
  {
    id: 'omnipotence',
    name: 'Omnipotence Layer',
    description: 'Ultimate cosmic power',
    unlocked: false,
    unlockCondition: () => false
  }
])

const availableLayers = computed(() => {
  return allLayers.value.filter(layer => layer.unlocked || layer.unlockCondition?.())
})

const emit = defineEmits<{
  layerChanged: [layerId: string]
}>()

function switchLayer(layerId: string) {
  const layer = allLayers.value.find(l => l.id === layerId)
  if (layer && layer.unlocked) {
    currentLayer.value = layerId
    emit('layerChanged', layerId)
  }
}

// Expose current layer for parent components
defineExpose({
  currentLayer: computed(() => currentLayer.value),
  switchLayer,
  availableLayers
})
</script>

<style scoped>
.layer-system {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.layer-selector {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.layer-title {
  font-size: 14px;
  color: var(--accent-purple);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.layer-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.layer-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  text-align: left;
}

.layer-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-blue);
  transform: translateY(-1px);
}

.layer-button.active {
  background: linear-gradient(135deg, rgba(0, 180, 216, 0.2), rgba(114, 9, 183, 0.1));
  border-color: var(--accent-blue);
  box-shadow: 0 0 20px rgba(0, 180, 216, 0.3);
}

.layer-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.layer-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.layer-description {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.3;
}

.layer-lock {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 12px;
  opacity: 0.7;
}

.layer-content {
  flex: 1;
  min-height: 0;
}

@media (max-width: 768px) {
  .layer-buttons {
    grid-template-columns: 1fr;
  }
  
  .layer-button {
    padding: 10px;
  }
  
  .layer-name {
    font-size: 12px;
  }
  
  .layer-description {
    font-size: 10px;
  }
}
</style>