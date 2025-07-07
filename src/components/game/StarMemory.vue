<template>
  <div class="memory-container" v-if="unlocked">
    <h2 class="section-title">Star Memory System</h2>
    
    <div class="memory-stats">
      <div class="stat-item">
        <span>Available Slots:</span>
        <span>{{ availableSlots }}/{{ maxSlots }}</span>
      </div>
      <div class="stat-item">
        <span>Preservation Bonus:</span>
        <span>×{{ format(preservationBonus) }}</span>
      </div>
      <div class="stat-item">
        <span>Total Targets:</span>
        <span>{{ occupiedSlots.length }}</span>
      </div>
    </div>
    
    <div class="memory-slots">
      <h3 class="subsection-title">Memory Slots</h3>
      <div class="slots-grid">
        <div 
          v-for="slot in slots"
          :key="slot.id"
          :class="['memory-slot', {
            occupied: slot.occupied,
            priority: slot.priority > 0,
            available: !slot.occupied
          }]"
        >
          <div class="slot-header">
            <span class="slot-id">Slot {{ slot.id.split('_')[1] }}</span>
            <span v-if="slot.priority > 0" class="priority-badge">Priority</span>
          </div>
          
          <div v-if="slot.occupied && slot.target" class="slot-content">
            <div class="target-name">{{ slot.target.name }}</div>
            <div class="target-type">{{ formatTargetType(slot.target.type) }}</div>
            <div class="preservation-rate">
              Preservation: {{ (slot.preservationRate.toNumber() * 100).toFixed(1) }}%
            </div>
            <div class="slot-actions">
              <button 
                v-if="canSetPriority"
                class="btn btn-small btn-priority"
                :disabled="slot.priority > 0"
                @click="setPriorityPreservation(slot.id)"
              >
                Set Priority
              </button>
              <button 
                class="btn btn-small btn-remove"
                @click="removeTarget(slot.id)"
              >
                Remove
              </button>
            </div>
          </div>
          
          <div v-else class="slot-empty">
            <div class="empty-message">Empty Slot</div>
            <button 
              class="btn btn-small"
              :disabled="availableTargets.length === 0"
              @click="showTargetSelection(slot.id)"
            >
              Assign Target
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="available-targets" v-if="showingTargetSelection">
      <h3 class="subsection-title">Available Preservation Targets</h3>
      <div class="targets-grid">
        <div 
          v-for="target in availableTargets"
          :key="target.id"
          :class="['target-card', `target-${target.type}`]"
          @click="assignTargetToSlot(target)"
        >
          <div class="target-header">
            <span class="target-name">{{ target.name }}</span>
            <span class="target-type">{{ formatTargetType(target.type) }}</span>
          </div>
          <div class="target-details">
            <div class="preservation-info">
              Base Preservation: {{ (target.preservationRate.toNumber() * 100).toFixed(1) }}%
            </div>
            <div class="target-description">
              {{ getTargetDescription(target) }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="selection-actions">
        <button class="btn btn-secondary" @click="cancelTargetSelection">
          Cancel
        </button>
      </div>
    </div>
    
    <div class="memory-info">
      <h3 class="subsection-title">System Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <h4>Slot Expansion</h4>
          <p>• 8 Starlight: +1 slot (2 total)</p>
          <p>• 15 Starlight: +2 slots (3 total)</p>
          <p>• 25 Starlight: +2 slots (5 total max)</p>
        </div>
        <div class="info-item">
          <h4>Preservation Types</h4>
          <p>• Filament Evolution: 50% of stage</p>
          <p>• Nebula Patterns: 100% preservation</p>
          <p>• Railroad Progress: 30% of path</p>
          <p>• Upgrades: 25% of branch</p>
        </div>
        <div class="info-item">
          <h4>Priority Preservation</h4>
          <p>Available at 25 Starlight</p>
          <p>Provides 100% preservation</p>
          <p>Uses 1 slot per target</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMemoryStore } from '@/stores/memory'
import { useGameStore } from '@/stores/gameState'
import { format } from '@/utils/formatting'
import type { MemoryTarget } from '@/types/memory'

const memoryStore = useMemoryStore()
const gameStore = useGameStore()

const {
  unlocked,
  maxSlots,
  slots,
  preservationBonus,
  availableSlots,
  occupiedSlots
} = storeToRefs(memoryStore)

const showingTargetSelection = ref(false)
const selectedSlotForAssignment = ref<string | null>(null)

const availableTargets = computed(() => memoryStore.getAvailableTargets())

const canSetPriority = computed(() => gameStore.starlight.amount.gte(25))

function showTargetSelection(slotId: string) {
  selectedSlotForAssignment.value = slotId
  showingTargetSelection.value = true
}

function cancelTargetSelection() {
  selectedSlotForAssignment.value = null
  showingTargetSelection.value = false
}

function assignTargetToSlot(target: MemoryTarget) {
  if (!selectedSlotForAssignment.value) return
  
  if (memoryStore.assignTarget(selectedSlotForAssignment.value, target)) {
    cancelTargetSelection()
  }
}

function formatTargetType(type: string): string {
  const types: Record<string, string> = {
    filament: 'Filament Evolution',
    nebula: 'Nebula Pattern',
    railroad: 'Railroad Progress',
    upgrades: 'Upgrade Branch'
  }
  return types[type] || type
}

function getTargetDescription(target: MemoryTarget): string {
  switch (target.type) {
    case 'filament':
      return 'Preserves filament evolution stage'
    case 'nebula':
      return 'Preserves complete nebula pattern'
    case 'railroad':
      return 'Preserves constellation stations and enhancements'
    case 'upgrades':
      return 'Preserves upgrade branch progress'
    default:
      return 'Unknown target type'
  }
}

// Expose store methods
const removeTarget = memoryStore.removeTarget
const setPriorityPreservation = memoryStore.setPriorityPreservation
</script>

<style scoped>
.memory-container {
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

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 12px;
}

.memory-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  min-width: 180px;
  font-size: 14px;
}

.stat-item span:first-child {
  color: var(--text-muted);
}

.stat-item span:last-child {
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.memory-slot {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid var(--border-secondary);
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
  min-height: 150px;
}

.memory-slot.occupied {
  border-color: var(--accent-purple);
  background: rgba(138, 43, 226, 0.1);
}

.memory-slot.priority {
  border-color: var(--accent-yellow);
  background: rgba(255, 215, 0, 0.1);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}

.memory-slot.available {
  border-color: var(--accent-green);
  border-style: dashed;
}

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.slot-id {
  font-weight: 600;
  color: var(--text-primary);
}

.priority-badge {
  background: var(--accent-yellow);
  color: var(--bg-primary);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.slot-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.target-name {
  font-weight: 600;
  color: var(--accent-purple);
  font-size: 14px;
}

.target-type {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.preservation-rate {
  font-size: 13px;
  color: var(--accent-green);
  font-family: 'Roboto Mono', monospace;
}

.slot-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn-priority {
  background: var(--accent-yellow);
  color: var(--bg-primary);
}

.btn-remove {
  background: var(--accent-red);
}

.slot-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  padding: 20px 0;
}

.empty-message {
  color: var(--text-muted);
  font-style: italic;
}

.targets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.target-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.target-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.target-card.target-filament {
  border-left: 4px solid var(--accent-green);
}

.target-card.target-nebula {
  border-left: 4px solid var(--accent-blue);
}

.target-card.target-railroad {
  border-left: 4px solid var(--accent-orange);
}

.target-card.target-upgrades {
  border-left: 4px solid var(--accent-purple);
}

.target-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.target-header .target-name {
  font-weight: 600;
  color: var(--text-primary);
}

.target-header .target-type {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.target-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preservation-info {
  font-size: 12px;
  color: var(--accent-green);
  font-family: 'Roboto Mono', monospace;
}

.target-description {
  font-size: 12px;
  color: var(--text-secondary);
}

.selection-actions {
  text-align: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
}

.info-item h4 {
  color: var(--accent-blue);
  margin-bottom: 10px;
  font-size: 14px;
}

.info-item p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 4px 0;
}

@media (max-width: 768px) {
  .slots-grid {
    grid-template-columns: 1fr;
  }
  
  .targets-grid {
    grid-template-columns: 1fr;
  }
  
  .memory-stats {
    flex-direction: column;
    gap: 10px;
  }
}</style>