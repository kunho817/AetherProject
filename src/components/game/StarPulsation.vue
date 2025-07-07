<template>
  <div class="star-pulsation-container">
    <h2 class="section-title">Star Pulsation System</h2>
    
    <div class="pulsation-stats">
      <div class="stat-item">
        <span>Stellar Energy:</span>
        <span>{{ format(stellarEnergy, 1) }}</span>
      </div>
      <div class="stat-item">
        <span>Cycles Completed:</span>
        <span>{{ cycle.cyclesCompleted }}</span>
      </div>
      <div class="stat-item">
        <span>Status:</span>
        <span :class="getStateClass()">{{ getStateDisplay() }}</span>
      </div>
    </div>
    
    <div class="pulsation-controls">
      <button 
        v-if="!isActive"
        class="btn btn-primary"
        :disabled="stellarEnergy < 10"
        @click="startPulsation"
      >
        Start Pulsation (10 Stellar Energy)
      </button>
      <button 
        v-else
        class="btn btn-secondary"
        @click="stopPulsation"
      >
        Stop Pulsation
      </button>
    </div>
    
    <div v-if="isActive" class="pulsation-display">
      <div class="state-info">
        <h3 class="current-state" :class="getStateClass()">
          {{ getStateDisplayName(cycle.state) }}
        </h3>
        <div class="state-description">
          {{ currentBonus.specialEffect }}
        </div>
      </div>
      
      <div class="state-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ 
              width: `${cycle.progress}%`,
              background: getStateGradient()
            }"
          ></div>
        </div>
        <div class="progress-text">
          {{ Math.floor(cycle.progress) }}% - {{ formatTime(timeToNextState) }} to {{ getStateDisplayName(nextStateInfo) }}
        </div>
      </div>
      
      <div class="bonus-display">
        <h4 class="subsection-title">Current Bonuses</h4>
        <div class="bonus-grid">
          <div class="bonus-item">
            <span>Stardust Multiplier:</span>
            <span class="bonus-value">×{{ format(currentBonus.stardustMultiplier) }}</span>
          </div>
          <div class="bonus-item">
            <span>Filament Efficiency:</span>
            <span class="bonus-value">×{{ format(currentBonus.filamentEfficiency) }}</span>
          </div>
          <div class="bonus-item">
            <span>Nebular Essence Rate:</span>
            <span class="bonus-value">×{{ format(currentBonus.nebularEssenceRate) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="state-cycle-preview">
      <h4 class="subsection-title">Pulsation Cycle</h4>
      <div class="cycle-states">
        <div 
          v-for="state in allStates"
          :key="state"
          :class="['state-preview', { 
            current: isActive && cycle.state === state,
            active: isActive
          }]"
        >
          <div class="state-name">{{ getStateDisplayName(state) }}</div>
          <div class="state-duration">{{ getStateDurationDisplay(state) }}s</div>
          <div class="state-bonus">×{{ getStateBonusPreview(state) }}</div>
        </div>
      </div>
    </div>
    
    <div class="upgrades-section">
      <h4 class="subsection-title">Pulsation Upgrades</h4>
      <div class="upgrade-grid">
        <div 
          v-for="upgrade in availableUpgrades"
          :key="upgrade.id"
          :class="['upgrade-item', { 
            purchased: upgrade.purchased,
            'can-afford': canPurchaseUpgrade(upgrade.id)
          }]"
        >
          <div class="upgrade-header">
            <span class="upgrade-name">{{ upgrade.name }}</span>
            <span v-if="!upgrade.purchased" class="upgrade-cost">
              {{ format(upgrade.cost) }} {{ upgrade.costType }}
            </span>
          </div>
          <div class="upgrade-description">{{ upgrade.description }}</div>
          <button 
            v-if="!upgrade.purchased"
            class="btn btn-small"
            :disabled="!canPurchaseUpgrade(upgrade.id)"
            @click="purchaseUpgrade(upgrade.id)"
          >
            Purchase
          </button>
          <div v-else class="purchased-indicator">✓ Purchased</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePulsationStore } from '@/stores/pulsation'
import { format, formatTime } from '@/utils/formatting'
import { PulsationState } from '@/types/pulsation'

const pulsationStore = usePulsationStore()

const { 
  cycle, 
  isActive, 
  stellarEnergy, 
  upgrades,
  currentBonus,
  nextStateInfo,
  timeToNextState
} = storeToRefs(pulsationStore)

const allStates = Object.values(PulsationState)

const availableUpgrades = computed(() => {
  return upgrades.value.filter(u => u.unlocked)
})

function getStateDisplay(): string {
  return isActive.value ? 'Active' : 'Inactive'
}

function getStateClass(): string {
  if (!isActive.value) return 'inactive'
  
  switch (cycle.value.state) {
    case PulsationState.EXPANSION: return 'expansion'
    case PulsationState.CONTRACTION: return 'contraction'
    case PulsationState.STABILITY: return 'stability'
    case PulsationState.CATACLYSM: return 'cataclysm'
    case PulsationState.FUSION: return 'fusion'
    default: return 'inactive'
  }
}

function getStateDisplayName(state: PulsationState): string {
  return state.charAt(0).toUpperCase() + state.slice(1)
}

function getStateGradient(): string {
  switch (cycle.value.state) {
    case PulsationState.EXPANSION: return 'linear-gradient(90deg, var(--accent-green), var(--accent-blue))'
    case PulsationState.CONTRACTION: return 'linear-gradient(90deg, var(--accent-purple), var(--accent-orange))'
    case PulsationState.STABILITY: return 'linear-gradient(90deg, var(--accent-blue), var(--accent-green))'
    case PulsationState.CATACLYSM: return 'linear-gradient(90deg, var(--accent-red), var(--accent-yellow))'
    case PulsationState.FUSION: return 'linear-gradient(90deg, var(--accent-yellow), var(--accent-orange))'
    default: return 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))'
  }
}

function getStateDurationDisplay(state: PulsationState): string {
  // Using the concept's durations
  const baseDurations: Record<PulsationState, number> = {
    [PulsationState.EXPANSION]: 15,
    [PulsationState.CONTRACTION]: 15,
    [PulsationState.STABILITY]: 10,
    [PulsationState.CATACLYSM]: 12,
    [PulsationState.FUSION]: 8
  }
  return baseDurations[state].toString()
}

function getStateBonusPreview(state: PulsationState): string {
  switch (state) {
    case PulsationState.EXPANSION: return '5.0'
    case PulsationState.CONTRACTION: return '0.75'
    case PulsationState.STABILITY: return '1.5'
    case PulsationState.CATACLYSM: return '1.5*'
    case PulsationState.FUSION: return '1.5'
    default: return '1.0'
  }
}

function startPulsation() {
  pulsationStore.startPulsation()
}

function stopPulsation() {
  pulsationStore.stopPulsation()
}

function canPurchaseUpgrade(upgradeId: string): boolean {
  return pulsationStore.canPurchaseUpgrade(upgradeId)
}

function purchaseUpgrade(upgradeId: string) {
  pulsationStore.purchaseUpgrade(upgradeId)
}
</script>

<style scoped>
.star-pulsation-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-green);
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.pulsation-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  min-width: 150px;
  font-size: 14px;
}

.stat-item span:first-child {
  color: var(--text-muted);
}

.stat-item span:last-child {
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
}

.inactive { color: var(--text-muted); }
.expansion { color: var(--accent-green); }
.contraction { color: var(--accent-purple); }
.stability { color: var(--accent-blue); }
.cataclysm { color: var(--accent-red); }
.fusion { color: var(--accent-orange); }

.pulsation-controls {
  margin: 15px 0;
}

.pulsation-display {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--border-secondary);
}

.state-info {
  text-align: center;
  margin-bottom: 20px;
}

.current-state {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.state-description {
  font-style: italic;
  color: var(--text-secondary);
}

.state-progress {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 10px;
}

.progress-text {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  font-family: 'Roboto Mono', monospace;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 12px;
}

.bonus-display {
  margin-bottom: 20px;
}

.bonus-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.bonus-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
}

.bonus-value {
  color: var(--accent-yellow);
  font-family: 'Roboto Mono', monospace;
  font-weight: 700;
}

.state-cycle-preview {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.cycle-states {
  display: flex;
  gap: 10px;
  overflow-x: auto;
}

.state-preview {
  min-width: 120px;
  text-align: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.state-preview.current {
  border-color: var(--accent-yellow);
  opacity: 1;
  transform: scale(1.05);
}

.state-preview.active {
  opacity: 0.8;
}

.state-name {
  font-weight: 600;
  font-size: 12px;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.state-duration {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.state-bonus {
  font-size: 11px;
  color: var(--accent-green);
  font-family: 'Roboto Mono', monospace;
}

.upgrades-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
}

.upgrade-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.upgrade-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
}

.upgrade-item.can-afford {
  border-color: var(--accent-green);
}

.upgrade-item.purchased {
  border-color: var(--accent-blue);
  background: rgba(0, 180, 216, 0.1);
}

.upgrade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.upgrade-name {
  font-weight: 600;
  color: var(--text-primary);
}

.upgrade-cost {
  font-size: 12px;
  color: var(--accent-yellow);
  font-family: 'Roboto Mono', monospace;
}

.upgrade-description {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 10px;
  line-height: 1.4;
}

.purchased-indicator {
  color: var(--accent-green);
  font-weight: 600;
  text-align: center;
}

@media (max-width: 768px) {
  .cycle-states {
    flex-direction: column;
  }
  
  .bonus-grid {
    grid-template-columns: 1fr;
  }
  
  .upgrade-grid {
    grid-template-columns: 1fr;
  }
}</style>