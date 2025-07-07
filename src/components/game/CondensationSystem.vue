<template>
  <div class="condensation-container" v-if="unlocked">
    <h2 class="section-title">Condensation System</h2>
    <p class="system-description">
      Prepare for the Nova Layer by condensing your progress into powerful essences that will carry forward.
    </p>
    
    <div class="condensation-stats">
      <div class="stat-item">
        <span>Total Condensation Power:</span>
        <span>{{ format(totalCondensationPower) }}</span>
      </div>
      <div class="stat-item">
        <span>Available Targets:</span>
        <span>{{ unlockedTargets.length }}</span>
      </div>
      <div class="stat-item">
        <span>Total Essence:</span>
        <span>{{ format(totalEssenceAmount) }}</span>
      </div>
    </div>
    
    <!-- Essence Display -->
    <div class="essence-section">
      <h3 class="subsection-title">Condensed Essences</h3>
      <div class="essence-grid">
        <div 
          v-for="[type, essence] in essenceTypes"
          :key="type"
          :class="['essence-card', `essence-${type}`]"
        >
          <div class="essence-header">
            <span class="essence-name">{{ formatEssenceName(type) }}</span>
            <span class="essence-amount">{{ format(essence.amount) }}</span>
          </div>
          <div class="essence-description">
            {{ essence.description }}
          </div>
          <div class="essence-bonuses">
            <div 
              v-for="bonus in essence.bonuses"
              :key="bonus.description"
              class="bonus-item"
            >
              {{ bonus.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Condensation Targets -->
    <div class="targets-section">
      <h3 class="subsection-title">Condensation Targets</h3>
      <div class="targets-grid">
        <div 
          v-for="target in unlockedTargets"
          :key="target.id"
          :class="['target-card', `target-${target.type}`, {
            'can-condense': target.currentValue.gt(0)
          }]"
        >
          <div class="target-header">
            <span class="target-name">{{ target.name }}</span>
            <span class="target-priority">Priority {{ target.priority }}</span>
          </div>
          
          <div class="target-description">
            {{ target.description }}
          </div>
          
          <div class="target-values">
            <div class="current-value">
              Current: {{ format(target.currentValue) }}
            </div>
            <div class="condensation-rate">
              Rate: {{ (target.condensationRate.toNumber() * 100).toFixed(1) }}%
            </div>
            <div class="essence-gain">
              Gain: {{ format(target.currentValue.mul(target.condensationRate)) }} 
              {{ formatEssenceName(getEssenceTypeForTarget(target)) }}
            </div>
          </div>
          
          <div class="target-actions">
            <button 
              class="btn btn-condense"
              :disabled="target.currentValue.lte(0)"
              @click="condenseTarget(target.id)"
            >
              Condense
            </button>
            <div class="priority-controls">
              <button 
                class="btn-small btn-priority"
                @click="adjustPriority(target.id, -1)"
                :disabled="target.priority <= 1"
              >
                -
              </button>
              <span>{{ target.priority }}</span>
              <button 
                class="btn-small btn-priority"
                @click="adjustPriority(target.id, 1)"
                :disabled="target.priority >= 10"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Condensation Controls -->
    <div class="controls-section">
      <h3 class="subsection-title">Condensation Controls</h3>
      <div class="controls-grid">
        <div class="control-group">
          <h4>Manual Operations</h4>
          <button 
            class="btn btn-large btn-condense-all"
            :disabled="!canCondense || unlockedTargets.every(t => t.currentValue.lte(0))"
            @click="condenseAll()"
          >
            Condense All Targets
          </button>
          <p class="control-description">
            Condense all available targets based on their priority and current values.
          </p>
        </div>
        
        <div class="control-group">
          <h4>Auto-Condensation</h4>
          <div class="auto-controls">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="autoCondensationEnabled"
              >
              Enable Auto-Condensation
            </label>
            
            <div class="mode-selector">
              <label>Mode:</label>
              <select v-model="condensationMode" class="select-input">
                <option value="manual">Manual Only</option>
                <option value="threshold">Threshold Based</option>
                <option value="optimal">Optimal Timing</option>
                <option value="timed">Timed Intervals</option>
              </select>
            </div>
            
            <div class="threshold-input" v-if="condensationMode === 'threshold'">
              <label>Threshold:</label>
              <input 
                type="text" 
                v-model="thresholdInput"
                @blur="updateThreshold"
                class="text-input"
                placeholder="1e50"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Preset Management -->
    <div class="presets-section" v-if="presets.length > 0 || showCreatePreset">
      <h3 class="subsection-title">Condensation Presets</h3>
      
      <div class="existing-presets" v-if="presets.length > 0">
        <div 
          v-for="preset in presets"
          :key="preset.id"
          :class="['preset-card', { 'active': activePreset === preset.id }]"
        >
          <div class="preset-header">
            <span class="preset-name">{{ preset.name }}</span>
            <div class="preset-actions">
              <button 
                class="btn-small"
                @click="applyPreset(preset.id)"
                :disabled="activePreset === preset.id"
              >
                Apply
              </button>
              <button 
                class="btn-small btn-remove"
                @click="removePreset(preset.id)"
              >
                ×
              </button>
            </div>
          </div>
          <div class="preset-description">{{ preset.description }}</div>
        </div>
      </div>
      
      <div class="create-preset" v-if="showCreatePreset">
        <div class="preset-form">
          <input 
            v-model="newPresetName"
            placeholder="Preset name"
            class="text-input"
          >
          <input 
            v-model="newPresetDescription"
            placeholder="Description"
            class="text-input"
          >
          <div class="form-actions">
            <button class="btn" @click="createNewPreset">Create</button>
            <button class="btn btn-secondary" @click="cancelCreatePreset">Cancel</button>
          </div>
        </div>
      </div>
      
      <button 
        v-else
        class="btn btn-create-preset"
        @click="showCreatePreset = true"
      >
        Create New Preset
      </button>
    </div>
    
    <!-- Nova Layer Preview -->
    <div class="nova-preview-section">
      <h3 class="subsection-title">Nova Layer Preview</h3>
      <div class="nova-preview-card">
        <div class="preview-header">
          <span class="preview-title">Next Layer: Nova</span>
          <span :class="['preview-status', { 'ready': novaLayerPreview.unlocked }]">
            {{ novaLayerPreview.unlocked ? 'Ready!' : 'Requirements Not Met' }}
          </span>
        </div>
        
        <div class="preview-requirements">
          <h4>Requirements:</h4>
          <div class="requirements-list">
            <div 
              v-for="req in novaLayerPreview.requirements"
              :key="req.description"
              :class="['requirement-item', { 'met': req.met }]"
            >
              <span class="req-icon">{{ req.met ? '✓' : '✗' }}</span>
              <span class="req-text">{{ req.description }}</span>
            </div>
          </div>
        </div>
        
        <div class="preview-power">
          <h4>Estimated Nova Layer Power:</h4>
          <span class="power-value">{{ format(novaLayerPreview.estimatedPower) }}</span>
        </div>
        
        <div class="preview-features">
          <h4>New Systems:</h4>
          <ul class="features-list">
            <li v-for="system in novaLayerPreview.newSystems" :key="system">
              {{ system }}
            </li>
          </ul>
        </div>
        
        <div class="preserved-progress">
          <h4>Preserved Progress:</h4>
          <div class="preservation-list">
            <div 
              v-for="[key, value] in novaLayerPreview.preservedProgress"
              :key="key"
              class="preservation-item"
            >
              <span>{{ formatPreservationType(key) }}:</span>
              <span>{{ format(value) }}</span>
            </div>
          </div>
        </div>
        
        <button 
          v-if="novaLayerPreview.unlocked"
          class="btn btn-large btn-nova-transition"
          @click="initiateNovaTransition"
        >
          Ascend to Nova Layer
        </button>
      </div>
    </div>
    
    <!-- Condensation History -->
    <div class="history-section" v-if="condensationHistory.length > 0">
      <h3 class="subsection-title">Recent Condensations</h3>
      <div class="history-list">
        <div 
          v-for="(entry, index) in recentHistory"
          :key="index"
          class="history-item"
        >
          <div class="history-time">
            {{ formatTimestamp(entry.timestamp) }}
          </div>
          <div class="history-targets">
            Condensed: {{ entry.targetsCondensed.join(', ') }}
          </div>
          <div class="history-power">
            Power: {{ format(entry.totalPowerBefore) }} → {{ format(entry.totalPowerAfter) }}
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="locked-message">
    <h3>Condensation System</h3>
    <p>Unlock at 75 Starlight and 25 Starbursts to prepare for the Nova Layer!</p>
    <div class="unlock-progress">
      <div class="progress-item">
        <span>Starlight:</span>
        <span>{{ format(gameStore.starlight.amount) }} / 75</span>
      </div>
      <div class="progress-item">
        <span>Starbursts:</span>
        <span>{{ gameStore.starburstCount }} / 25</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCondensationStore } from '@/stores/condensation'
import { useGameStore } from '@/stores/gameState'
import { format } from '@/utils/formatting'
import { D } from '@/utils/decimal'
import type { CondensationTarget } from '@/types/condensation'

const condensationStore = useCondensationStore()
const gameStore = useGameStore()

const {
  unlocked,
  availableTargets,
  essenceTypes,
  totalCondensationPower,
  presets,
  activePreset,
  autoCondensationEnabled,
  condensationThreshold,
  condensationHistory,
  condensationMode
} = storeToRefs(condensationStore)

const {
  unlockedTargets,
  totalEssenceAmount,
  novaLayerPreview,
  canCondense
} = storeToRefs(condensationStore)

// Local reactive state
const showCreatePreset = ref(false)
const newPresetName = ref('')
const newPresetDescription = ref('')
const thresholdInput = ref(condensationThreshold.value.toString())

const recentHistory = computed(() => {
  return condensationHistory.value
    .slice(-5)
    .reverse()
})

function formatEssenceName(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1) + ' Essence'
}

function getEssenceTypeForTarget(target: CondensationTarget): string {
  switch (target.type) {
    case 'resource':
      return target.id.includes('starlight') ? 'temporal' : 'stellar'
    case 'progress':
      return target.id.includes('filament') ? 'cosmic' : 'dimensional'
    case 'system':
      return target.id.includes('pulsation') ? 'temporal' : 'dimensional'
    default:
      return 'stellar'
  }
}

function formatPreservationType(key: string): string {
  const types: Record<string, string> = {
    essence_bonuses: 'Essence Bonuses',
    mastery_levels: 'Mastery Levels',
    unlock_speed: 'Unlock Speed Bonus'
  }
  return types[key] || key
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

function adjustPriority(targetId: string, delta: number) {
  const target = availableTargets.value.find(t => t.id === targetId)
  if (target) {
    target.priority = Math.max(1, Math.min(10, target.priority + delta))
  }
}

function updateThreshold() {
  try {
    condensationThreshold.value = D(thresholdInput.value)
  } catch {
    thresholdInput.value = condensationThreshold.value.toString()
  }
}

function createNewPreset() {
  if (newPresetName.value.trim()) {
    condensationStore.createPreset(newPresetName.value, newPresetDescription.value)
    cancelCreatePreset()
  }
}

function cancelCreatePreset() {
  showCreatePreset.value = false
  newPresetName.value = ''
  newPresetDescription.value = ''
}

function removePreset(presetId: string) {
  const index = presets.value.findIndex(p => p.id === presetId)
  if (index >= 0) {
    presets.value.splice(index, 1)
    if (activePreset.value === presetId) {
      activePreset.value = null
    }
  }
}

function initiateNovaTransition() {
  // This would trigger the actual layer transition
  // For now, just show an alert
  alert('Nova Layer transition would begin here! This will be implemented when the Nova Layer is designed.')
}

// Expose store methods
const condenseTarget = condensationStore.condenseTarget
const condenseAll = condensationStore.condenseAll
const applyPreset = condensationStore.applyPreset
</script>

<style scoped>
.condensation-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.locked-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
  color: var(--text-muted);
}

.unlock-progress {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-item {
  display: flex;
  justify-content: space-between;
  min-width: 200px;
  font-family: 'Roboto Mono', monospace;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-purple);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.system-description {
  color: var(--text-secondary);
  font-style: italic;
  margin-bottom: 15px;
  line-height: 1.4;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 12px;
}

.condensation-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  min-width: 200px;
  font-size: 14px;
}

.stat-item span:first-child {
  color: var(--text-muted);
}

.stat-item span:last-child {
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
}

.essence-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.essence-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid var(--border-secondary);
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s ease;
}

.essence-stellar { border-left: 4px solid var(--accent-yellow); }
.essence-cosmic { border-left: 4px solid var(--accent-purple); }
.essence-temporal { border-left: 4px solid var(--accent-blue); }
.essence-dimensional { border-left: 4px solid var(--accent-green); }

.essence-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.essence-name {
  font-weight: 600;
  color: var(--text-primary);
}

.essence-amount {
  font-family: 'Roboto Mono', monospace;
  color: var(--accent-yellow);
  font-weight: 600;
}

.essence-description {
  color: var(--text-secondary);
  font-size: 12px;
  margin-bottom: 10px;
  line-height: 1.3;
}

.essence-bonuses {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bonus-item {
  font-size: 11px;
  color: var(--accent-green);
  background: rgba(0, 255, 0, 0.1);
  padding: 3px 6px;
  border-radius: 8px;
}

.targets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.target-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid var(--border-secondary);
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s ease;
}

.target-card.can-condense {
  border-color: var(--accent-green);
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
}

.target-resource { border-left: 4px solid var(--accent-blue); }
.target-progress { border-left: 4px solid var(--accent-purple); }
.target-system { border-left: 4px solid var(--accent-orange); }

.target-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.target-name {
  font-weight: 600;
  color: var(--text-primary);
}

.target-priority {
  font-size: 11px;
  background: var(--accent-blue);
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
}

.target-description {
  color: var(--text-secondary);
  font-size: 12px;
  margin-bottom: 12px;
  line-height: 1.3;
}

.target-values {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
  font-size: 12px;
}

.current-value { color: var(--text-primary); }
.condensation-rate { color: var(--accent-orange); }
.essence-gain { color: var(--accent-green); }

.target-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-condense {
  background: var(--accent-green);
  color: white;
}

.btn-condense:disabled {
  background: var(--border-secondary);
  color: var(--text-muted);
}

.priority-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.btn-priority {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent-blue);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.btn-priority:disabled {
  background: var(--border-secondary);
  color: var(--text-muted);
  cursor: not-allowed;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.control-group {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
}

.control-group h4 {
  color: var(--accent-blue);
  margin-bottom: 10px;
  font-size: 14px;
}

.btn-condense-all {
  width: 100%;
  background: var(--accent-purple);
  color: white;
  margin-bottom: 10px;
}

.control-description {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.3;
}

.auto-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.mode-selector,
.threshold-input {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.select-input,
.text-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border-secondary);
  border-radius: 4px;
  padding: 6px 10px;
  color: var(--text-primary);
  font-size: 12px;
}

.nova-preview-card {
  background: linear-gradient(135deg, rgba(255, 140, 0, 0.1), rgba(255, 215, 0, 0.05));
  border: 2px solid var(--accent-orange);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(255, 140, 0, 0.3);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.preview-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-orange);
}

.preview-status {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
  background: var(--accent-red);
  color: white;
}

.preview-status.ready {
  background: var(--accent-green);
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 15px;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.requirement-item.met {
  color: var(--accent-green);
}

.req-icon {
  font-weight: 600;
  width: 16px;
}

.power-value {
  font-family: 'Roboto Mono', monospace;
  color: var(--accent-yellow);
  font-size: 16px;
  font-weight: 600;
}

.features-list {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: var(--text-secondary);
}

.preservation-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.preservation-item {
  display: flex;
  justify-content: space-between;
}

.btn-nova-transition {
  width: 100%;
  background: linear-gradient(135deg, var(--accent-orange), var(--accent-yellow));
  color: var(--bg-primary);
  font-weight: 600;
  margin-top: 15px;
  font-size: 16px;
  padding: 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  padding: 10px;
  font-size: 12px;
}

.history-time {
  color: var(--text-muted);
  font-family: 'Roboto Mono', monospace;
}

.history-targets {
  color: var(--text-primary);
  margin: 4px 0;
}

.history-power {
  color: var(--accent-green);
  font-family: 'Roboto Mono', monospace;
}

@media (max-width: 768px) {
  .essence-grid,
  .targets-grid,
  .controls-grid {
    grid-template-columns: 1fr;
  }
  
  .condensation-stats {
    flex-direction: column;
    gap: 10px;
  }
}
</style>