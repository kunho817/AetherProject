<template>
  <div class="nebula-grid-container">
    <h2 class="section-title">Nebula Grid System</h2>
    
    <div class="nebula-stats">
      <div class="stat-item">
        <span>Nebular Essence:</span>
        <span>{{ nebularEssence.toFixed(2) }}</span>
      </div>
      <div class="stat-item">
        <span>Production Rate:</span>
        <span>{{ essenceProductionRate.toFixed(2) }}/s</span>
      </div>
      <div class="stat-item">
        <span>Placement Cost:</span>
        <span>{{ placementCost.eq(0) ? 'Free' : format(placementCost) }}</span>
      </div>
      <div class="stat-item">
        <span>Active Patterns:</span>
        <span>{{ activePatterns.length }}</span>
      </div>
    </div>
    
    <div class="nebula-controls">
      <div class="cell-type-selector">
        <button 
          v-for="type in cellTypes"
          :key="type.id"
          :class="['cell-type-btn', { active: selectedType === type.id }]"
          :title="type.description"
          @click="selectedType = type.id"
        >
          <div class="cell-preview" :style="getCellStyle(type.id)"></div>
          <span>{{ type.name }}</span>
        </button>
      </div>
      
      <!-- Tier selector for filament cells -->
      <div v-if="selectedType === 'filament'" class="tier-selector">
        <h4 class="tier-selector-title">Select Filament Tier:</h4>
        <div class="tier-buttons">
          <button 
            v-for="tier in availableFilamentTiers"
            :key="tier"
            :class="['tier-btn', { active: selectedTier === tier }]"
            @click="selectedTier = tier"
          >
            Tier {{ tier }}
          </button>
        </div>
      </div>
      
      <div class="grid-actions">
        <button 
          class="btn btn-secondary"
          @click="clearGrid"
        >
          Clear Grid
        </button>
        <button 
          class="btn btn-secondary"
          :disabled="!canExpandGrid"
          @click="expandGrid"
        >
          Expand Grid ({{ format(expansionCost) }})
        </button>
      </div>
    </div>
    
    <div class="nebula-grid" :style="{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }">
      <template v-for="(row, y) in grid" :key="`row-${y}`">
        <div 
          v-for="(cell, x) in row"
          :key="`cell-${x}-${y}`"
          :class="['nebula-cell', { 
            active: cell.active,
            empty: cell.type === null,
            'can-place': canPlaceHere(x, y)
          }]"
          :style="getCellStyle(cell.type)"
          :title="getCellTooltip(cell)"
          @click="handleCellClick(x, y)"
          @contextmenu.prevent="handleCellRightClick(x, y)"
        >
          <div v-if="cell.type" class="cell-content">
            <div class="cell-type">{{ getCellTypeIcon(cell.type) }}</div>
            <div class="cell-level" v-if="cell.level > 1">{{ cell.level }}</div>
            <div class="cell-tier" v-if="cell.type === 'filament' && cell.tier">T{{ cell.tier }}</div>
          </div>
          <div v-else class="cell-placeholder">
            <div class="placement-indicator" v-if="canPlaceHere(x, y)">+</div>
          </div>
        </div>
      </template>
    </div>
    
    <div class="pattern-display">
      <h3 class="subsection-title">Discovered Patterns</h3>
      <div class="pattern-list">
        <div 
          v-for="pattern in discoveredPatterns"
          :key="pattern.id"
          :class="['pattern-item', { active: activePatterns.includes(pattern.id) }]"
        >
          <div class="pattern-name">{{ pattern.name }}</div>
          <div class="pattern-description">{{ pattern.description }}</div>
          <div class="pattern-bonus">
            Bonus: {{ formatBonus(pattern.bonus) }}
          </div>
        </div>
      </div>
      
      <div v-if="discoveredPatterns.length === 0" class="no-patterns">
        Place cells in patterns to discover bonuses!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNebulaStore } from '@/stores/nebula'
import { useGameStore } from '@/stores/gameState'
import { format } from '@/utils/formatting'
import { NebulaType, type NebulaBonus } from '@/types/nebula'
import { D } from '@/utils/decimal'

const nebulaStore = useNebulaStore()
const gameStore = useGameStore()

const { 
  grid, 
  gridSize, 
  nebularEssence, 
  placementCost,
  essenceProductionRate,
  activePatterns, 
  discoveredPatterns 
} = storeToRefs(nebulaStore)

const selectedType = ref<NebulaType>(NebulaType.STARDUST)
const selectedTier = ref<number>(1)

const cellTypes = [
  { 
    id: NebulaType.STARDUST, 
    name: 'Stardust', 
    color: '#00b4d8',
    description: 'Produces 0.1 essence/s per level. Basic production cell.'
  },
  { 
    id: NebulaType.FILAMENT, 
    name: 'Filament', 
    color: '#06ffa5',
    description: 'Produces 0.2 essence/s per level. Can have specific tiers for patterns.'
  },
  { 
    id: NebulaType.MULTIPLIER, 
    name: 'Multiplier', 
    color: '#7209b7',
    description: 'Produces 0.5 essence/s per level. Enhances adjacent cells.'
  },
  { 
    id: NebulaType.SYNERGY, 
    name: 'Synergy', 
    color: '#ff6b35',
    description: 'Produces 0.3 essence/s per level. Creates pattern bonuses.'
  },
  { 
    id: NebulaType.CATALYST, 
    name: 'Catalyst', 
    color: '#ffd700',
    description: 'Produces 1.0 essence/s per level. Most efficient producer.'
  }
]

const availableFilamentTiers = computed(() => {
  // Return tiers 1-10 based on unlocked filament tiers from game state
  const maxTier = Math.min(10, gameStore.maxUnlockedTier + 1)
  return Array.from({ length: maxTier }, (_, i) => i + 1)
})

const expansionCost = computed(() => {
  return D(1000).mul(D(2).pow(gridSize.value - 5))
})

const canExpandGrid = computed(() => {
  return nebularEssence.value >= expansionCost.value.toNumber()
})

function getCellStyle(type: NebulaType | null) {
  if (!type) return {}
  
  const cellType = cellTypes.find(ct => ct.id === type)
  return {
    background: `radial-gradient(circle, ${cellType?.color || '#666'} 0%, transparent 70%)`,
    border: `2px solid ${cellType?.color || '#666'}`
  }
}

function getCellTypeIcon(type: NebulaType): string {
  switch (type) {
    case NebulaType.STARDUST: return '✦'
    case NebulaType.FILAMENT: return '〰'
    case NebulaType.MULTIPLIER: return '✕'
    case NebulaType.SYNERGY: return '◊'
    case NebulaType.CATALYST: return '⚡'
    default: return '?'
  }
}

function getCellTooltip(cell: any): string {
  if (!cell.type) return 'Click to place a cell'
  
  const typeInfo = cellTypes.find(t => t.id === cell.type)
  if (!typeInfo) return ''
  
  let tooltip = `${typeInfo.name} (Level ${cell.level})\n`
  tooltip += `Production: ${(cell.level * getProductionRate(cell.type)).toFixed(2)} essence/s\n`
  
  if (cell.type === NebulaType.FILAMENT && cell.tier) {
    tooltip += `Tier ${cell.tier} Filament\n`
  }
  
  tooltip += `Left-click: Upgrade (Cost: ${getUpgradeCost(cell.level).toFixed(0)})\n`
  tooltip += `Right-click: Remove (Refund: ${(placementCost.value.div(2).toNumber()).toFixed(0)})`
  
  return tooltip
}

function getProductionRate(type: NebulaType): number {
  switch (type) {
    case NebulaType.STARDUST: return 0.1
    case NebulaType.FILAMENT: return 0.2
    case NebulaType.MULTIPLIER: return 0.5
    case NebulaType.SYNERGY: return 0.3
    case NebulaType.CATALYST: return 1.0
    default: return 0
  }
}

function getUpgradeCost(level: number): number {
  return 50 * Math.pow(2, level - 1)
}

function canPlaceHere(x: number, y: number): boolean {
  return nebulaStore.canPlaceCell(x, y, selectedType.value)
}

function handleCellClick(x: number, y: number) {
  const cell = grid.value[y][x]
  
  if (cell.type === null) {
    // Place new cell
    const tier = selectedType.value === NebulaType.FILAMENT ? selectedTier.value : undefined
    if (nebulaStore.placeCell(x, y, selectedType.value, tier)) {
      // Success feedback
    }
  } else {
    // Upgrade existing cell
    nebulaStore.upgradeCell(x, y)
  }
}

function handleCellRightClick(x: number, y: number) {
  // Remove cell
  nebulaStore.removeCell(x, y)
}

function clearGrid() {
  if (confirm('Clear the entire grid? You will get 50% refund for placed cells.')) {
    for (let y = 0; y < gridSize.value; y++) {
      for (let x = 0; x < gridSize.value; x++) {
        nebulaStore.removeCell(x, y)
      }
    }
  }
}

function expandGrid() {
  nebulaStore.expandGrid()
}

function formatBonus(bonus: NebulaBonus): string {
  switch (bonus.type) {
    case 'production':
      return `+${((bonus.value.toNumber() - 1) * 100).toFixed(0)}% ${bonus.target} production`
    case 'multiplier':
      return `×${bonus.value.toFixed(1)} ${bonus.target} multiplier`
    case 'cost_reduction':
      return `-${((1 - bonus.value.toNumber()) * 100).toFixed(0)}% ${bonus.target} costs`
    case 'special':
      return `${bonus.value.toFixed(1)}× special bonus to ${bonus.target}`
    default:
      return 'Unknown bonus'
  }
}

// Update nebular essence from game store
gameStore.$subscribe((mutation, state) => {
  if (mutation.events && 'nebularEssence' in mutation.events) {
    nebularEssence.value = state.nebularEssence
  }
})
</script>

<style scoped>
.nebula-grid-container {
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

.nebula-stats {
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

.nebula-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cell-type-selector {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.cell-type-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.cell-type-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.cell-type-btn.active {
  border-color: var(--accent-blue);
  background: rgba(0, 180, 216, 0.2);
}

.cell-preview {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.grid-actions {
  display: flex;
  gap: 10px;
}

.nebula-grid {
  display: grid;
  gap: 3px;
  max-width: 600px;
  margin: 0 auto;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.nebula-cell {
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 40px;
}

.nebula-cell.empty {
  background: rgba(255, 255, 255, 0.02);
}

.nebula-cell.can-place {
  border-color: var(--accent-green);
  background: rgba(6, 255, 165, 0.1);
}

.nebula-cell.active {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.nebula-cell:hover {
  transform: scale(1.05);
  z-index: 1;
}

.cell-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  position: relative;
  width: 100%;
  height: 100%;
}

.cell-type {
  font-size: 16px;
  color: var(--text-primary);
}

.cell-level {
  font-size: 10px;
  font-family: 'Roboto Mono', monospace;
  color: var(--accent-yellow);
  font-weight: 700;
}

.cell-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placement-indicator {
  font-size: 20px;
  color: var(--accent-green);
  opacity: 0.7;
}

.pattern-display {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 12px;
}

.pattern-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pattern-item {
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.pattern-item.active {
  border-color: var(--accent-green);
  background: rgba(6, 255, 165, 0.1);
}

.pattern-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.pattern-description {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.pattern-bonus {
  font-size: 12px;
  color: var(--accent-yellow);
  font-family: 'Roboto Mono', monospace;
}

.no-patterns {
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
  padding: 20px;
}

/* Tier Selection */
.tier-selector {
  margin-top: 15px;
  padding: 15px;
  background: rgba(6, 255, 165, 0.05);
  border: 1px solid var(--accent-green);
  border-radius: 8px;
}

.tier-selector-title {
  font-size: 14px;
  color: var(--accent-green);
  margin-bottom: 10px;
  font-weight: 600;
}

.tier-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tier-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 4px;
  padding: 6px 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
}

.tier-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-green);
}

.tier-btn.active {
  background: var(--accent-green);
  border-color: var(--accent-green);
  color: var(--text-primary);
}

/* Cell tier display */
.cell-tier {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 8px;
  font-weight: 600;
  color: var(--accent-yellow);
  background: rgba(0, 0, 0, 0.7);
  padding: 1px 3px;
  border-radius: 2px;
  font-family: 'Roboto Mono', monospace;
}

@media (max-width: 768px) {
  .nebula-grid {
    max-width: 300px;
  }
  
  .nebula-cell {
    min-height: 30px;
  }
  
  .cell-type-btn {
    padding: 6px 8px;
    font-size: 12px;
  }
}</style>