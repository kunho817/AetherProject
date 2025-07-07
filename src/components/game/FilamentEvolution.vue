<template>
  <div class="evolution-container">
    <h2 class="section-title">Filament Evolution</h2>
    <div class="evolution-description">
      <p>Evolve your filaments through 3 stages to unlock enhanced production, synergies, and unique abilities.</p>
    </div>
    
    <div class="stage-progress">
      <h3 class="subsection-title">Evolution Stages</h3>
      <div class="stages-grid">
        <div 
          v-for="stage in [1, 2, 3]"
          :key="stage"
          :class="['stage-card', {
            unlocked: unlockedStages.has(stage),
            available: availableEvolutions.some(e => e.stage === stage)
          }]"
        >
          <div class="stage-header">
            <span class="stage-number">Stage {{ stage }}</span>
            <span v-if="unlockedStages.has(stage)" class="stage-status unlocked">✓</span>
            <span v-else class="stage-status locked">🔒</span>
          </div>
          <div class="stage-name">{{ getStageName(stage) }}</div>
          <div class="stage-description">{{ getStageDescription(stage) }}</div>
          <div class="stage-unlock">
            <span v-if="!unlockedStages.has(stage)">
              Unlocks at {{ getStageUnlockRequirement(stage) }} Starlight
            </span>
            <span v-else class="unlocked-text">Stage Unlocked</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="filament-evolution-grid">
      <h3 class="subsection-title">Filament Evolution Status</h3>
      <div class="filaments-grid">
        <div 
          v-for="(filament, index) in filaments"
          :key="filament.id"
          :class="['filament-evolution-card', {
            'can-evolve': canEvolveToNextStage(index),
            'max-evolution': filament.evolution >= 3
          }]"
        >
          <div class="filament-header">
            <div class="filament-info">
              <span class="filament-tier">T{{ filament.id }}</span>
              <span class="filament-name">{{ filament.name }}</span>
            </div>
            <div class="evolution-stage">
              <span class="current-stage">Stage {{ filament.evolution }}</span>
              <div class="evolution-progress-bar">
                <div 
                  class="evolution-fill"
                  :style="{ width: `${(filament.evolution / 3) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
          
          <div class="evolution-requirements">
            <div class="requirement-item">
              <span>Owned:</span>
              <span :class="{ met: filament.owned.gte(100) }">
                {{ Math.floor(filament.owned.toNumber()) }}/100
              </span>
            </div>
            <div v-if="filament.evolution < 3" class="requirement-item">
              <span>Cost:</span>
              <span :class="{ met: canAffordEvolution(index, filament.evolution + 1) }">
                {{ format(getEvolutionCost(index, filament.evolution + 1)) }} Essence
              </span>
            </div>
          </div>
          
          <div class="evolution-effects" v-if="filament.evolution > 0">
            <h4>Current Effects:</h4>
            <div class="effects-list">
              <div class="effect-item">Production ^{{ format(getFilamentEvolutionEffects(index).productionExponent) }}</div>
              <div class="effect-item" v-if="getFilamentEvolutionEffects(index).costFactorReduction.gt(0)">
                Cost factor -{{ format(getFilamentEvolutionEffects(index).costFactorReduction) }}
              </div>
              <div class="effect-item" v-if="getFilamentEvolutionEffects(index).hierarchySynergyMultiplier.gt(1)">
                Hierarchy synergy ×{{ format(getFilamentEvolutionEffects(index).hierarchySynergyMultiplier) }}
              </div>
              <div class="effect-item" v-if="getFilamentEvolutionEffects(index).gridAdjacencyBonus.gt(1)">
                Grid adjacency ×{{ format(getFilamentEvolutionEffects(index).gridAdjacencyBonus) }}
              </div>
              <div class="effect-item unique" v-if="getFilamentEvolutionEffects(index).uniqueAbility">
                {{ getFilamentEvolutionEffects(index).uniqueAbility }}
              </div>
            </div>
          </div>
          
          <div class="evolution-actions">
            <button 
              v-if="filament.evolution < 3"
              class="btn btn-primary"
              :disabled="!canEvolveFilament(index, filament.evolution + 1)"
              @click="evolveFilament(index, filament.evolution + 1)"
            >
              <span v-if="canEvolveFilament(index, filament.evolution + 1)">
                Evolve to Stage {{ filament.evolution + 1 }}
              </span>
              <span v-else-if="!unlockedStages.has(filament.evolution + 1)">
                Stage {{ filament.evolution + 1 }} Locked
              </span>
              <span v-else-if="filament.owned.lt(100)">
                Need 100 Purchases
              </span>
              <span v-else>
                Insufficient Essence
              </span>
            </button>
            <span v-else class="max-evolution-text">Maximum Evolution</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="evolution-info">
      <h3 class="subsection-title">Evolution System Information</h3>
      <div class="info-grid">
        <div class="info-section">
          <h4>Stage Effects</h4>
          <p><strong>Stage 1:</strong> Production ^1.5, cost factor -0.05</p>
          <p><strong>Stage 2:</strong> + Hierarchy synergy ×3, grid adjacency ×1.5</p>
          <p><strong>Stage 3:</strong> + Unique tier-specific abilities</p>
        </div>
        <div class="info-section">
          <h4>Requirements</h4>
          <p>• 100+ purchases of the filament</p>
          <p>• Nebular Essence (tier-based cost)</p>
          <p>• Stage unlocked by Starlight</p>
        </div>
        <div class="info-section">
          <h4>Stage Unlocks</h4>
          <p>• Stage 1: 5 Starlight</p>
          <p>• Stage 2: 8 Starlight</p>
          <p>• Stage 3: 18 Starlight</p>
        </div>
        <div class="info-section">
          <h4>Unique Abilities (Stage 3)</h4>
          <p>Each filament tier gains a unique ability at Stage 3</p>
          <p>From production bonuses to special mechanics</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEvolutionStore } from '@/stores/evolution'
import { useGameStore } from '@/stores/gameState'
import { format } from '@/utils/formatting'

const evolutionStore = useEvolutionStore()
const gameStore = useGameStore()

const {
  unlockedStages,
  availableEvolutions
} = storeToRefs(evolutionStore)

const { filaments, nebularEssence } = storeToRefs(gameStore)

// Remove unused computed
// const visibleFilaments = computed(() => {
//   return filaments.value.slice(0, maxUnlockedTier.value + 1)
// })

function canEvolveToNextStage(tier: number): boolean {
  const filament = filaments.value[tier]
  if (!filament || filament.evolution >= 3) return false
  
  return evolutionStore.canEvolveFilament(tier, filament.evolution + 1)
}

function canAffordEvolution(tier: number, stage: number): boolean {
  const cost = evolutionStore.getEvolutionCost(tier, stage)
  return nebularEssence.value >= cost.toNumber()
}

function getStageUnlockRequirement(stage: number): number {
  const requirements = { 1: 5, 2: 8, 3: 18 }
  return requirements[stage as keyof typeof requirements] || 0
}

// Expose store methods
const canEvolveFilament = evolutionStore.canEvolveFilament
const evolveFilament = evolutionStore.evolveFilament
const getFilamentEvolutionEffects = evolutionStore.getFilamentEvolutionEffects
const getEvolutionCost = evolutionStore.getEvolutionCost
const getStageName = evolutionStore.getStageName
const getStageDescription = evolutionStore.getStageDescription
</script>

<style scoped>
.evolution-container {
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

.evolution-description {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 10px;
}

.evolution-description p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.stages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stage-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
}

.stage-card.unlocked {
  border-color: var(--accent-green);
  background: rgba(6, 255, 165, 0.1);
}

.stage-card.available {
  border-color: var(--accent-yellow);
  background: rgba(255, 215, 0, 0.1);
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stage-number {
  font-weight: 600;
  color: var(--accent-purple);
  font-family: 'Roboto Mono', monospace;
}

.stage-status.unlocked {
  color: var(--accent-green);
}

.stage-status.locked {
  color: var(--text-muted);
}

.stage-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.stage-description {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.stage-unlock {
  font-size: 11px;
  color: var(--text-muted);
}

.unlocked-text {
  color: var(--accent-green) !important;
  font-weight: 600;
}

.filaments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.filament-evolution-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
}

.filament-evolution-card.can-evolve {
  border-color: var(--accent-green);
  background: rgba(6, 255, 165, 0.05);
}

.filament-evolution-card.max-evolution {
  border-color: var(--accent-purple);
  background: rgba(138, 43, 226, 0.05);
}

.filament-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.filament-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filament-tier {
  font-size: 11px;
  color: var(--accent-blue);
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
  background: rgba(0, 180, 216, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

.filament-name {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 600;
}

.evolution-stage {
  text-align: right;
}

.current-stage {
  font-size: 12px;
  color: var(--accent-purple);
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
}

.evolution-progress-bar {
  width: 60px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin-top: 4px;
  overflow: hidden;
}

.evolution-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple));
  transition: width 0.3s ease;
}

.evolution-requirements {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.requirement-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.requirement-item span:first-child {
  color: var(--text-muted);
}

.requirement-item span:last-child {
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
}

.requirement-item span.met {
  color: var(--accent-green);
}

.evolution-effects {
  margin-bottom: 12px;
}

.evolution-effects h4 {
  font-size: 13px;
  color: var(--accent-green);
  margin-bottom: 6px;
}

.effects-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.effect-item {
  font-size: 11px;
  color: var(--accent-green);
  font-family: 'Roboto Mono', monospace;
}

.effect-item.unique {
  color: var(--accent-yellow);
  font-weight: 600;
}

.evolution-actions {
  text-align: center;
}

.max-evolution-text {
  color: var(--accent-purple);
  font-weight: 600;
  font-size: 14px;
}

.info-grid {
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
  color: var(--accent-purple);
  font-size: 14px;
  margin-bottom: 8px;
}

.info-section p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 4px 0;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .stages-grid {
    grid-template-columns: 1fr;
  }
  
  .filaments-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .filament-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}</style>