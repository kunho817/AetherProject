<template>
  <div class="automation-container">
    <h2 class="section-title">Automation Systems</h2>
    
    <div class="automation-status" v-if="!automationStore.canUnlockStarburstAutomation">
      <div class="status-card locked">
        <div class="status-icon">🔒</div>
        <div class="status-content">
          <h3>Automation Locked</h3>
          <p>Automation systems unlock at 15 Starlight</p>
          <p>Current: {{ format(gameStore.starlight.amount) }} Starlight</p>
        </div>
      </div>
    </div>

    <div class="automation-content" v-else>
      <!-- Starburst Automation -->
      <div class="automation-section">
        <div class="section-header">
          <h3 class="automation-title">
            <span class="automation-icon">⚡</span>
            Starburst Automation
          </h3>
          <div class="automation-toggle">
            <button 
              :class="['toggle-button', { active: starburstAutomation.enabled }]"
              @click="automationStore.toggleStarburstAutomation()"
              :disabled="!starburstAutomation.unlocked"
            >
              <span v-if="starburstAutomation.enabled">ON</span>
              <span v-else>OFF</span>
            </button>
          </div>
        </div>

        <div class="automation-body" v-if="starburstAutomation.unlocked">
          <!-- Quick Presets -->
          <div class="preset-section">
            <h4>Quick Presets</h4>
            <div class="preset-buttons">
              <button 
                class="btn btn-small"
                @click="automationStore.applyPreset('conservative')"
              >
                Conservative
              </button>
              <button 
                class="btn btn-small"
                @click="automationStore.applyPreset('balanced')"
              >
                Balanced
              </button>
              <button 
                class="btn btn-small"
                @click="automationStore.applyPreset('aggressive')"
              >
                Aggressive
              </button>
            </div>
          </div>

          <!-- Trigger Configuration -->
          <div class="trigger-section">
            <h4>Trigger Configuration</h4>
            
            <!-- Primary Trigger -->
            <div class="trigger-card">
              <div class="trigger-header">
                <span class="trigger-label">Primary Trigger</span>
                <label class="trigger-enabled">
                  <input 
                    type="checkbox"
                    :checked="starburstAutomation.triggers.primary.enabled"
                    @change="handlePrimaryTriggerEnable"
                  />
                  Enabled
                </label>
              </div>
              
              <div class="trigger-config">
                <div class="config-row">
                  <label>Type:</label>
                  <select 
                    :value="starburstAutomation.triggers.primary.type"
                    @change="handlePrimaryTriggerType"
                  >
                    <option value="stardust">Stardust Amount</option>
                    <option value="filament">Filament Count</option>
                    <option value="time">Time Interval</option>
                    <option value="hybrid">Hybrid (Auto-detect)</option>
                  </select>
                </div>
                
                <div class="config-row" v-if="starburstAutomation.triggers.primary.type === 'stardust'">
                  <label>Stardust Threshold:</label>
                  <input 
                    type="text"
                    :value="format(starburstAutomation.triggers.primary.value)"
                    @input="handlePrimaryTriggerValueInput"
                    placeholder="1e20"
                  />
                </div>
                
                <div class="config-row" v-if="starburstAutomation.triggers.primary.type === 'filament'">
                  <label>Filament Tier:</label>
                  <select 
                    :value="starburstAutomation.triggers.primary.tier || 0"
                    @change="handlePrimaryTriggerTier"
                  >
                    <option v-for="(filament, index) in gameStore.filaments" :key="index" :value="index">
                      {{ filament.name }}
                    </option>
                  </select>
                </div>
                
                <div class="config-row" v-if="starburstAutomation.triggers.primary.type === 'filament'">
                  <label>Count Threshold:</label>
                  <input 
                    type="number"
                    :value="starburstAutomation.triggers.primary.value"
                    @input="handlePrimaryTriggerNumber"
                    min="1"
                    max="1000"
                  />
                </div>
                
                <div class="config-row" v-if="starburstAutomation.triggers.primary.type === 'time'">
                  <label>Time Interval (seconds):</label>
                  <input 
                    type="number"
                    :value="starburstAutomation.triggers.primary.value"
                    @input="handlePrimaryTriggerNumber"
                    min="5"
                    max="3600"
                  />
                </div>
              </div>
            </div>

            <!-- Secondary Trigger -->
            <div class="trigger-card">
              <div class="trigger-header">
                <span class="trigger-label">Secondary Trigger (Optional)</span>
                <label class="trigger-enabled">
                  <input 
                    type="checkbox"
                    :checked="starburstAutomation.triggers.secondary?.enabled || false"
                    @change="handleSecondaryTriggerEnable"
                  />
                  Enabled
                </label>
              </div>
              
              <div class="trigger-config" v-if="starburstAutomation.triggers.secondary?.enabled">
                <div class="config-row">
                  <label>Type:</label>
                  <select 
                    :value="starburstAutomation.triggers.secondary?.type || 'time'"
                    @change="handleSecondaryTriggerType"
                  >
                    <option value="stardust">Stardust Amount</option>
                    <option value="filament">Filament Count</option>
                    <option value="time">Time Interval</option>
                  </select>
                </div>
                
                <div class="config-row" v-if="starburstAutomation.triggers.secondary?.type === 'time'">
                  <label>Time Interval (seconds):</label>
                  <input 
                    type="number"
                    :value="starburstAutomation.triggers.secondary?.value || 30"
                    @input="handleSecondaryTriggerNumber"
                    min="5"
                    max="3600"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Settings -->
          <div class="settings-section">
            <h4>Automation Settings</h4>
            <div class="settings-grid">
              <div class="setting-item">
                <label>Minimum Starlight:</label>
                <input 
                  type="number"
                  :value="starburstAutomation.settings.minimumStarlight"
                  @input="(event) => handleSettingNumber('minimumStarlight', event)"
                  min="0"
                  max="100"
                />
              </div>
              
              <div class="setting-item">
                <label>Delay Between Bursts (seconds):</label>
                <input 
                  type="number"
                  :value="starburstAutomation.settings.delayBetweenBursts"
                  @input="(event) => handleSettingNumber('delayBetweenBursts', event)"
                  min="1"
                  max="60"
                />
              </div>
            </div>
          </div>

          <!-- Statistics -->
          <div class="stats-section">
            <h4>Automation Statistics</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Total Auto-Bursts:</span>
                <span class="stat-value">{{ starburstAutomation.stats.totalAutoBursts }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Average Interval:</span>
                <span class="stat-value">
                  {{ starburstAutomation.stats.averageInterval > 0 ? 
                      Math.round(starburstAutomation.stats.averageInterval) + 's' : 
                      'N/A' }}
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Last Auto-Burst:</span>
                <span class="stat-value">
                  {{ starburstAutomation.stats.lastAutoBurst > 0 ? 
                      Math.round((Date.now() - starburstAutomation.stats.lastAutoBurst) / 1000) + 's ago' : 
                      'Never' }}
                </span>
              </div>
            </div>
            
            <div class="stats-actions">
              <button 
                class="btn btn-small btn-danger"
                @click="automationStore.resetAutomationStats()"
              >
                Reset Statistics
              </button>
            </div>
          </div>

          <!-- Status Display -->
          <div class="status-display">
            <div class="status-item">
              <span class="status-label">Current Status:</span>
              <span :class="['status-value', { 
                'status-active': starburstAutomation.enabled && automationStore.shouldAutoStarburst,
                'status-waiting': starburstAutomation.enabled && !automationStore.shouldAutoStarburst,
                'status-disabled': !starburstAutomation.enabled
              }]">
                <span v-if="!starburstAutomation.enabled">Disabled</span>
                <span v-else-if="automationStore.shouldAutoStarburst">Ready to Burst</span>
                <span v-else>Waiting for Conditions</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAutomationStore } from '@/stores/automation'
import { useGameStore } from '@/stores/gameState'
import { format } from '@/utils/formatting'
import { D } from '@/utils/decimal'

const automationStore = useAutomationStore()
const gameStore = useGameStore()

const { starburstAutomation } = storeToRefs(automationStore)

function updatePrimaryTrigger(key: string, value: any) {
  automationStore.updateStarburstTrigger('primary', { [key]: value })
}

function updateSecondaryTrigger(key: string, value: any) {
  automationStore.updateStarburstTrigger('secondary', { [key]: value })
}

function updatePrimaryTriggerValue(value: string) {
  try {
    const decimal = D(value)
    updatePrimaryTrigger('value', decimal)
  } catch {
    // Invalid input, ignore
  }
}

function updateSetting(key: string, value: any) {
  automationStore.updateStarburstSettings({ [key]: value })
}

function handlePrimaryTriggerEnable(event: Event) {
  const target = event.target as HTMLInputElement
  updatePrimaryTrigger('enabled', target.checked)
}

function handlePrimaryTriggerType(event: Event) {
  const target = event.target as HTMLSelectElement
  updatePrimaryTrigger('type', target.value)
}

function handlePrimaryTriggerValueInput(event: Event) {
  const target = event.target as HTMLInputElement
  updatePrimaryTriggerValue(target.value)
}

function handlePrimaryTriggerNumber(event: Event) {
  const target = event.target as HTMLInputElement
  updatePrimaryTrigger('value', parseInt(target.value))
}

function handlePrimaryTriggerTier(event: Event) {
  const target = event.target as HTMLSelectElement
  updatePrimaryTrigger('tier', parseInt(target.value))
}

function handleSecondaryTriggerEnable(event: Event) {
  const target = event.target as HTMLInputElement
  updateSecondaryTrigger('enabled', target.checked)
}

function handleSecondaryTriggerType(event: Event) {
  const target = event.target as HTMLSelectElement
  updateSecondaryTrigger('type', target.value)
}

function handleSecondaryTriggerNumber(event: Event) {
  const target = event.target as HTMLInputElement
  updateSecondaryTrigger('value', parseInt(target.value))
}

function handleSettingNumber(key: string, event: Event) {
  const target = event.target as HTMLInputElement
  updateSetting(key, parseInt(target.value))
}
</script>

<style scoped>
.automation-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-purple);
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.automation-status {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.status-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  max-width: 400px;
}

.status-card.locked {
  border-color: var(--text-muted);
}

.status-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.status-content h3 {
  color: var(--text-primary);
  margin-bottom: 10px;
}

.status-content p {
  color: var(--text-secondary);
  margin: 5px 0;
}

.automation-content {
  flex: 1;
  overflow-y: auto;
}

.automation-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.automation-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-blue);
  display: flex;
  align-items: center;
  gap: 8px;
}

.automation-icon {
  font-size: 20px;
}

.toggle-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  padding: 8px 16px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 60px;
}

.toggle-button.active {
  background: var(--accent-green);
  border-color: var(--accent-green);
  color: var(--text-dark);
}

.toggle-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.automation-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preset-section h4,
.trigger-section h4,
.settings-section h4,
.stats-section h4 {
  font-size: 14px;
  color: var(--accent-purple);
  margin-bottom: 12px;
}

.preset-buttons {
  display: flex;
  gap: 8px;
}

.trigger-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
}

.trigger-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.trigger-label {
  font-weight: 600;
  color: var(--text-primary);
}

.trigger-enabled {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.trigger-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.config-row label {
  min-width: 140px;
  font-size: 12px;
  color: var(--text-muted);
}

.config-row select,
.config-row input {
  flex: 1;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border-secondary);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 12px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.setting-item label {
  font-size: 12px;
  color: var(--text-muted);
}

.setting-item input {
  width: 80px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border-secondary);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.stat-value {
  font-size: 12px;
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
}

.stats-actions {
  text-align: right;
}

.btn-danger {
  background: rgba(220, 53, 69, 0.2);
  border-color: var(--accent-red);
  color: var(--accent-red);
}

.btn-danger:hover {
  background: rgba(220, 53, 69, 0.3);
}

.status-display {
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px solid var(--border-secondary);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-size: 14px;
  color: var(--text-muted);
}

.status-value {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-active {
  background: rgba(6, 255, 165, 0.2);
  color: var(--accent-green);
}

.status-waiting {
  background: rgba(255, 215, 0, 0.2);
  color: var(--accent-yellow);
}

.status-disabled {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .preset-buttons {
    flex-direction: column;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .config-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .config-row label {
    min-width: auto;
  }
}
</style>