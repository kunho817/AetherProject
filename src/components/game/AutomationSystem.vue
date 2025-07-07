<template>
  <div class="automation-system">
    <h2 class="section-title">Automation System</h2>
    
    <div class="automation-description">
      <p>Automate your Aether operations to maximize efficiency and reduce manual clicking.</p>
    </div>
    
    <div class="automation-section" v-if="automationStore.unlocked">
      <h3 class="subsection-title">Available Automations</h3>
      
      <div class="automation-grid">
        <div
          v-for="automation in automationStore.availableAutomations"
          :key="automation.id"
          :class="['automation-card', { 
            enabled: automation.enabled,
            affordable: canAfford(automation)
          }]"
        >
          <div class="automation-header">
            <h4 class="automation-name">{{ automation.name }}</h4>
            <div class="automation-status">
              <span v-if="automation.enabled" class="status-enabled">ENABLED</span>
              <span v-else class="status-disabled">DISABLED</span>
            </div>
          </div>
          
          <div class="automation-description">
            {{ automation.description }}
          </div>
          
          <div class="automation-details">
            <div class="detail-row">
              <span>Interval:</span>
              <span>{{ automation.interval / 1000 }}s</span>
            </div>
            <div class="detail-row">
              <span>Cost:</span>
              <span>{{ format(automation.cost) }} Starlight</span>
            </div>
          </div>
          
          <div class="automation-actions">
            <EnhancedButton
              v-if="!automation.enabled"
              :disabled="!canAfford(automation)"
              @click="purchaseAutomation(automation.id)"
              variant="primary"
              size="small"
              :particles="true"
            >
              Purchase
            </EnhancedButton>
            
            <EnhancedButton
              v-else
              @click="toggleAutomation(automation.id)"
              :variant="automation.active ? 'warning' : 'secondary'"
              size="small"
              :clickEffect="true"
            >
              {{ automation.active ? 'Pause' : 'Resume' }}
            </EnhancedButton>
          </div>
        </div>
      </div>
    </div>
    
    <div class="automation-locked" v-else>
      <div class="locked-content">
        <h3>🤖 Automation System Locked</h3>
        <p>Unlock automation at {{ automationStore.unlockRequirement }} Starlight</p>
        <div class="progress-indicator">
          <span>Current: {{ format(gameStore.starlight.amount) }} Starlight</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Removed unused imports: computed, storeToRefs
import { useAutomationStore } from '@/stores/automation'
import { useGameStore } from '@/stores/gameState'
import { format } from '@/utils/formatting'
import EnhancedButton from '@/components/ui/EnhancedButton.vue'

const automationStore = useAutomationStore()
const gameStore = useGameStore()

function canAfford(automation: any): boolean {
  return gameStore.starlight.amount.gte(automation.cost)
}

function purchaseAutomation(_automationId: string) {
  automationStore.purchaseAutomation()
}

function toggleAutomation(_automationId: string) {
  automationStore.toggleAutomation()
}
</script>

<style scoped>
.automation-system {
  height: 100%;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-purple);
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 15px;
}

.automation-description {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 20px;
}

.automation-description p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.automation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.automation-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
}

.automation-card.enabled {
  border-color: var(--accent-green);
  background: rgba(6, 255, 165, 0.05);
}

.automation-card.affordable:not(.enabled) {
  border-color: var(--accent-blue);
}

.automation-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.automation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.automation-name {
  font-size: 14px;
  color: var(--text-primary);
  margin: 0;
}

.automation-status {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.status-enabled {
  color: var(--accent-green);
}

.status-disabled {
  color: var(--text-muted);
}

.automation-description {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  line-height: 1.4;
}

.automation-details {
  margin-bottom: 15px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 4px;
}

.detail-row span:first-child {
  color: var(--text-muted);
}

.detail-row span:last-child {
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
}

.automation-actions {
  text-align: center;
}

.automation-locked {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.locked-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 40px;
  max-width: 400px;
}

.locked-content h3 {
  color: var(--accent-purple);
  margin-bottom: 15px;
}

.locked-content p {
  color: var(--text-muted);
  margin-bottom: 15px;
}

.progress-indicator {
  font-family: 'Roboto Mono', monospace;
  color: var(--accent-green);
  font-size: 14px;
}

@media (max-width: 768px) {
  .automation-grid {
    grid-template-columns: 1fr;
  }
}
</style>