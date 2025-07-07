<template>
  <div class="star-echo-container" v-if="unlocked">
    <h2 class="section-title">Star Echo System</h2>
    <div class="echo-description">
      <p>Place filaments around the central star to create resonance effects. 
         Larger tier differences provide additional bonuses.</p>
    </div>
    
    <div class="echo-stats">
      <div class="stat-item">
        <span>Placed Filaments:</span>
        <span>{{ occupiedSlots.length }}/{{ maxSlots }}</span>
      </div>
      <div class="stat-item">
        <span>Production Bonus:</span>
        <span class="bonus-value">×{{ format(starEchoBonus.productionMultiplier) }}</span>
      </div>
      <div class="stat-item">
        <span>Tier Difference Bonus:</span>
        <span class="bonus-value">×{{ format(starEchoBonus.tierDifferenceBonus) }}</span>
      </div>
      <div class="stat-item">
        <span>Total Bonus:</span>
        <span class="total-bonus">×{{ format(starEchoBonus.totalBonus) }}</span>
      </div>
    </div>
    
    <div class="echo-visualization">
      <div class="echo-container-visual">
        <svg class="echo-svg" viewBox="-200 -200 400 400">
          <!-- Central star -->
          <g class="central-star">
            <circle 
              cx="0" 
              cy="0" 
              r="30"
              :class="['star-core', { active: centralStarActive }]"
            />
            <text 
              x="0" 
              y="5" 
              text-anchor="middle" 
              class="star-label"
            >
              Central Star
            </text>
          </g>
          
          <!-- Echo slots -->
          <g class="echo-slots">
            <g 
              v-for="slot in slots"
              :key="slot.id"
              :transform="`translate(${slot.position.x}, ${slot.position.y})`"
              :class="['echo-slot', {
                occupied: slot.occupied,
                available: !slot.occupied && slot.unlocked
              }]"
              @click="handleSlotClick(slot)"
            >
              <circle 
                r="25"
                class="slot-circle"
              />
              <text 
                v-if="slot.occupied && slot.filamentTier !== null"
                text-anchor="middle"
                class="slot-tier"
                dy="5"
              >
                T{{ slot.filamentTier + 1 }}
              </text>
              <text 
                v-else
                text-anchor="middle"
                class="slot-empty"
                dy="5"
              >
                +
              </text>
            </g>
          </g>
          
          <!-- Connection lines from slots to central star -->
          <g class="connections">
            <line 
              v-for="slot in occupiedSlots"
              :key="`connection-${slot.id}`"
              x1="0"
              y1="0"
              :x2="slot.position.x"
              :y2="slot.position.y"
              class="echo-connection"
            />
          </g>
        </svg>
      </div>
    </div>
    
    <div class="filament-selection" v-if="showingFilamentSelection">
      <h3 class="subsection-title">Select Filament to Place</h3>
      <div class="filament-grid">
        <div 
          v-for="(filament, index) in availableFilaments"
          :key="index"
          :class="['filament-option', {
            disabled: !canPlaceFilament(selectedSlotId || '', index)
          }]"
          @click="placeSelectedFilament(index)"
        >
          <div class="filament-tier">Tier {{ index + 1 }}</div>
          <div class="filament-name">{{ filament.name }}</div>
          <div class="filament-owned">Owned: {{ Math.floor(filament.owned.toNumber()) }}</div>
        </div>
      </div>
      <div class="selection-actions">
        <button class="btn btn-secondary" @click="cancelFilamentSelection">
          Cancel
        </button>
        <button class="btn btn-warning" @click="clearAllFilaments">
          Clear All
        </button>
      </div>
    </div>
    
    <div class="placed-filaments" v-if="occupiedSlots.length > 0">
      <h3 class="subsection-title">Placed Filaments</h3>
      <div class="placed-list">
        <div 
          v-for="slot in occupiedSlots"
          :key="slot.id"
          class="placed-item"
        >
          <div class="placed-info">
            <span class="placed-tier">Tier {{ (slot.filamentTier || 0) + 1 }}</span>
            <span class="placed-name">{{ getFilamentName(slot.filamentTier || 0) }}</span>
          </div>
          <button 
            class="btn btn-small btn-remove"
            @click="removeFilament(slot.id)"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
    
    <div class="echo-info">
      <h3 class="subsection-title">System Information</h3>
      <div class="info-content">
        <div class="info-section">
          <h4>Base Effects</h4>
          <p>• Each placed filament: Production ×2</p>
          <p>• Effects are multiplicative</p>
        </div>
        <div class="info-section">
          <h4>Tier Difference Bonuses</h4>
          <p>• 1-2 tier difference: +10% bonus</p>
          <p>• 3-4 tier difference: +25% bonus</p>
          <p>• 5+ tier difference: +50% bonus</p>
        </div>
        <div class="info-section">
          <h4>Requirements</h4>
          <p>• Unlocks at 5th Starburst</p>
          <p>• Must own filaments to place them</p>
          <p>• Maximum 3 filaments can be placed</p>
        </div>
      </div>
    </div>
  </div>
  
  <div class="echo-locked" v-else>
    <div class="locked-content">
      <h2>Star Echo System</h2>
      <p>Unlocks at 5th Starburst</p>
      <div class="unlock-progress">
        <span>Current Starbursts: {{ starburstCount }}</span>
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${Math.min(100, (starburstCount / 5) * 100)}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStarEchoStore } from '@/stores/starecho'
import { useGameStore } from '@/stores/gameState'
import { format } from '@/utils/formatting'
import type { StarEchoSlot } from '@/types/starecho'

const starEchoStore = useStarEchoStore()
const gameStore = useGameStore()

const {
  unlocked,
  maxSlots,
  centralStarActive,
  slots,
  starEchoBonus,
  occupiedSlots
} = storeToRefs(starEchoStore)

const { starburstCount, filaments, maxUnlockedTier } = storeToRefs(gameStore)

const showingFilamentSelection = ref(false)
const selectedSlotId = ref<string | null>(null)

const availableFilaments = computed(() => {
  return filaments.value.slice(0, maxUnlockedTier.value + 1)
})

function handleSlotClick(slot: StarEchoSlot) {
  if (slot.occupied) {
    // Remove filament
    starEchoStore.removeFilament(slot.id)
  } else {
    // Show filament selection
    selectedSlotId.value = slot.id
    showingFilamentSelection.value = true
  }
}

function placeSelectedFilament(filamentTier: number) {
  if (!selectedSlotId.value) return
  
  if (starEchoStore.placeFilament(selectedSlotId.value, filamentTier)) {
    cancelFilamentSelection()
  }
}

function cancelFilamentSelection() {
  selectedSlotId.value = null
  showingFilamentSelection.value = false
}

// Expose store methods
const canPlaceFilament = starEchoStore.canPlaceFilament
const removeFilament = starEchoStore.removeFilament
const clearAllFilaments = starEchoStore.clearAllFilaments
const getFilamentName = starEchoStore.getFilamentName
</script>

<style scoped>
.star-echo-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-green);
  margin-bottom: 12px;
}

.echo-description {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 10px;
}

.echo-description p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.echo-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.stat-item span:first-child {
  color: var(--text-muted);
}

.stat-item span:last-child {
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
}

.bonus-value {
  color: var(--accent-green) !important;
}

.total-bonus {
  color: var(--accent-yellow) !important;
  font-weight: 700;
}

.echo-visualization {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.echo-svg {
  width: 100%;
  max-width: 400px;
  height: 300px;
}

.star-core {
  fill: rgba(255, 215, 0, 0.4);
  stroke: var(--accent-yellow);
  stroke-width: 3;
  filter: drop-shadow(0 0 15px var(--accent-yellow));
}

.star-core.active {
  animation: starPulse 2s ease-in-out infinite;
}

@keyframes starPulse {
  0%, 100% { 
    fill: rgba(255, 215, 0, 0.4);
    stroke-width: 3;
  }
  50% { 
    fill: rgba(255, 215, 0, 0.6);
    stroke-width: 4;
  }
}

.star-label {
  font-size: 8px;
  fill: var(--accent-yellow);
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
  text-anchor: middle;
}

.echo-slot {
  cursor: pointer;
  transition: all 0.3s ease;
}

.echo-slot:hover {
  transform: scale(1.1);
}

.slot-circle {
  fill: rgba(255, 255, 255, 0.1);
  stroke: var(--border-secondary);
  stroke-width: 2;
  transition: all 0.3s ease;
}

.echo-slot.available .slot-circle {
  fill: rgba(6, 255, 165, 0.2);
  stroke: var(--accent-green);
  stroke-width: 3;
  stroke-dasharray: 5,5;
}

.echo-slot.occupied .slot-circle {
  fill: rgba(0, 180, 216, 0.3);
  stroke: var(--accent-blue);
  stroke-width: 3;
  filter: drop-shadow(0 0 10px var(--accent-blue));
}

.slot-tier {
  font-size: 10px;
  fill: var(--accent-blue);
  font-family: 'Roboto Mono', monospace;
  font-weight: 700;
}

.slot-empty {
  font-size: 16px;
  fill: var(--accent-green);
  font-weight: 700;
}

.echo-connection {
  stroke: var(--accent-blue);
  stroke-width: 2;
  opacity: 0.6;
  animation: connectionPulse 3s ease-in-out infinite;
}

@keyframes connectionPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.filament-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.filament-option {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filament-option:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-blue);
}

.filament-option.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.filament-tier {
  font-size: 12px;
  color: var(--accent-blue);
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
}

.filament-name {
  font-size: 13px;
  color: var(--text-primary);
  margin: 4px 0;
}

.filament-owned {
  font-size: 11px;
  color: var(--text-muted);
  font-family: 'Roboto Mono', monospace;
}

.selection-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.placed-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.placed-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 10px;
}

.placed-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.placed-tier {
  font-size: 11px;
  color: var(--accent-blue);
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
}

.placed-name {
  font-size: 13px;
  color: var(--text-primary);
}

.btn-remove {
  background: var(--accent-red);
}

.info-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 12px;
}

.info-section h4 {
  color: var(--accent-green);
  font-size: 14px;
  margin-bottom: 8px;
}

.info-section p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 4px 0;
  line-height: 1.4;
}

.echo-locked {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.locked-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 40px;
  max-width: 400px;
}

.locked-content h2 {
  color: var(--accent-blue);
  margin-bottom: 15px;
}

.locked-content p {
  color: var(--text-muted);
  margin-bottom: 20px;
}

.unlock-progress {
  font-family: 'Roboto Mono', monospace;
  color: var(--accent-green);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-top: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-blue), var(--accent-green));
  transition: width 0.3s ease;
}

@media (max-width: 768px) {
  .echo-stats {
    grid-template-columns: 1fr;
  }
  
  .filament-grid {
    grid-template-columns: 1fr;
  }
  
  .info-content {
    grid-template-columns: 1fr;
  }
}</style>