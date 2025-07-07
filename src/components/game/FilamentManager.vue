<template>
  <div class="filament-manager">
    <ParticleSystem ref="particleSystem" :enabled="true" />
    
    <h2 class="section-title">Cosmic Filaments</h2>
    
    <div class="filament-grid">
      <div 
        v-for="(filament, index) in filaments"
        :key="filament.id"
        :class="[
          'filament-card', 
          { 
            disabled: !canSeeFilament(index),
            'hierarchy-locked': isFilamentLocked(index)
          }
        ]"
        :ref="el => setCardRef(el, index)"
      >
        <div class="filament-header">
          <Tooltip
            :title="filament.name"
            :content="getFilamentTooltip(index)"
            :category="TooltipCategory.MECHANICS"
          >
            <h3 class="filament-name">{{ filament.name }}</h3>
          </Tooltip>
          <span class="filament-tier">Tier {{ filament.id }}</span>
        </div>
        
        <div class="filament-stats">
          <div class="stat-row">
            <span class="stat-label">Purchased:</span>
            <span class="stat-value purchased-highlight">{{ Math.floor(filament.purchased.toNumber()) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Total:</span>
            <span class="stat-value">{{ Math.floor(filament.owned.toNumber()) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Production:</span>
            <span class="stat-value">{{ format(getFilamentProduction(index)) }}/s</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Cost:</span>
            <span class="stat-value">{{ format(gameStore.getFilamentCost(index)) }}</span>
          </div>
          <div class="stat-row" v-if="filament.milestone > 0">
            <span class="stat-label">Milestone:</span>
            <span class="stat-value milestone-highlight">{{ filament.milestone }} (×{{ Math.pow(2, filament.milestone) }})</span>
          </div>
          <div class="stat-row" v-if="filament.evolution > 0">
            <span class="stat-label">Evolution:</span>
            <span class="stat-value evolution-highlight">{{ getEvolutionStageName(filament.evolution) }}</span>
          </div>
          <div class="stat-row" v-if="canShowNextMilestone(filament)">
            <span class="stat-label">Next Milestone:</span>
            <span class="stat-value next-milestone">{{ getNextMilestoneText(filament) }}</span>
          </div>
          <div class="stat-row" v-if="isFilamentLocked(index)">
            <span class="stat-label hierarchy-requirement">Requires:</span>
            <span class="stat-value hierarchy-requirement">Tier {{ getRequiredTier(index) }} Filament</span>
          </div>
        </div>
        
        <div class="filament-actions">
          <EnhancedButton 
            size="small"
            variant="primary"
            :disabled="!gameStore.canBuyFilament(index) || isFilamentLocked(index)"
            @click="buyFilament(index, 1)"
            :particles="true"
            :clickEffect="true"
          >
            Buy 1
          </EnhancedButton>
          <EnhancedButton 
            size="small"
            variant="secondary"
            :disabled="!gameStore.canBuyFilament(index) || isFilamentLocked(index)"
            @click="buyMax(index)"
            :particles="true"
            :clickEffect="true"
          >
            Buy Max
          </EnhancedButton>
        </div>
        
        <!-- Milestone Progress Bar -->
        <div class="progress-bar" v-if="filament.owned.gt(0)">
          <div 
            class="progress-fill progress-fill-animated"
            :style="{ width: `${getMilestoneProgress(filament)}%` }"
          ></div>
          <div class="progress-label">{{ getMilestoneProgressText(filament) }}</div>
        </div>
        
        <!-- Evolution Progress Bar -->
        <div class="evolution-progress" v-if="canShowEvolutionProgress(filament)">
          <div class="evolution-label">{{ getEvolutionProgressLabel(filament) }}</div>
          <div class="evolution-bar">
            <div 
              class="evolution-fill"
              :style="{ width: `${getEvolutionProgress(filament)}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/gameState'
import { useAchievementStore } from '@/stores/achievements'
import { format } from '@/utils/formatting'
import { D, type Decimal } from '@/utils/decimal'
import Tooltip from '@/components/ui/Tooltip.vue'
import EnhancedButton from '@/components/ui/EnhancedButton.vue'
import ParticleSystem from '@/components/effects/ParticleSystem.vue'
import { TooltipCategory } from '@/types/tooltips'
import { useVisualEffects } from '@/composables/useVisualEffects'

const gameStore = useGameStore()
const achievementStore = useAchievementStore()
const { filaments } = storeToRefs(gameStore)
const { animate, createParticleBurst } = useVisualEffects()

// Refs
const particleSystem = ref<InstanceType<typeof ParticleSystem>>()
const cardRefs = ref<Map<number, HTMLElement>>(new Map())

function setCardRef(el: any, index: number) {
  if (el) {
    cardRefs.value.set(index, el as HTMLElement)
  }
}

function canSeeFilament(index: number): boolean {
  // Check if tier is unlocked based on Starburst count
  return index <= gameStore.maxUnlockedTier
}

function isFilamentLocked(index: number): boolean {
  // Check if this filament is locked due to hierarchical requirements
  if (!canSeeFilament(index)) return true
  
  // Tier 1 (index 0) is never locked by hierarchy
  if (index === 0) return false
  
  // Check if all previous tiers have been purchased
  for (let i = 0; i < index; i++) {
    if (filaments.value[i].purchased.eq(0)) {
      return true
    }
  }
  
  return false
}

function getRequiredTier(index: number): number | null {
  // Returns the first unpurchased tier that blocks this purchase, or null if not blocked
  if (index === 0) return null
  
  for (let i = 0; i < index; i++) {
    if (filaments.value[i].purchased.eq(0)) {
      return i + 1 // Return tier number (1-indexed)
    }
  }
  
  return null
}

function getFilamentProduction(index: number): Decimal {
  const filament = filaments.value[index]
  
  // No production if no purchased filaments (matches hierarchical system logic)
  if (filament.purchased.eq(0) || filament.owned.eq(0)) {
    return D(0)
  }
  
  // Base production uses owned amount but influenced by purchased
  let production = filament.baseProduction.mul(filament.owned)
  
  // Milestone bonus based on PURCHASED filaments only
  const milestoneBonus = D(2).pow(Math.floor(filament.purchased.toNumber() / 10))
  production = production.mul(milestoneBonus)
  
  // Apply purchased factor (matches the main production system)
  production = production.mul(filament.purchased)
  
  // NO hierarchy bonus in display to match actual production calculation
  // This prevents displaying artificial production for unpurchased tiers
  
  return production
}

async function buyFilament(index: number, amount: number) {
  if (!gameStore.canBuyFilament(index)) return
  
  const cost = gameStore.getFilamentCost(index)
  
  // Make the purchase
  gameStore.buyFilament(index, amount)
  
  const actualAmount = amount
  
  if (actualAmount > 0) {
    // Track achievement progress
    achievementStore.trackFilamentPurchase(index, cost.toNumber(), actualAmount)
    
    // Visual effects
    await playPurchaseEffects(index, actualAmount)
  }
}

async function buyMax(index: number) {
  if (!gameStore.canBuyFilament(index)) return
  
  let totalBought = 0
  let totalCost = 0
  
  while (gameStore.canBuyFilament(index) && totalBought < 100) {
    const cost = gameStore.getFilamentCost(index)
    totalCost += cost.toNumber()
    gameStore.buyFilament(index, 1)
    totalBought++
  }
  
  if (totalBought > 0) {
    // Track achievement progress
    achievementStore.trackFilamentPurchase(index, totalCost, totalBought)
    
    // Visual effects
    await playPurchaseEffects(index, totalBought, true)
  }
}

async function playPurchaseEffects(index: number, amount: number, isMax: boolean = false) {
  const card = cardRefs.value.get(index)
  if (!card) return
  
  // Card animation
  await animate(card, 'purchase')
  
  // Create particles at card center
  const rect = card.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  
  // Different effects for single vs max purchase
  if (isMax) {
    // Burst effect for max purchase
    particleSystem.value?.createBurstEffect(
      centerX - rect.left, 
      centerY - rect.top, 
      'purchase', 
      Math.min(amount, 15)
    )
    
    // Screen flash for large purchases
    if (amount >= 10) {
      createParticleBurst(centerX, centerY, {
        type: 'purchase',
        count: 20,
        colors: ['#00ff00', '#90EE90', '#32CD32']
      })
    }
  } else {
    // Single particle for regular purchase
    particleSystem.value?.createParticle(
      'purchase',
      centerX - rect.left,
      centerY - rect.top
    )
  }
  
  // Milestone celebration
  const filament = filaments.value[index]
  if (filament.owned.gt(0) && Math.floor(filament.owned.toNumber()) % 10 === 0) {
    await nextTick()
    particleSystem.value?.createCelebrationEffect(
      centerX - rect.left,
      centerY - rect.top
    )
    
    // Animate milestone text
    const milestoneElement = card.querySelector('.stat-value')
    if (milestoneElement) {
      await animate(milestoneElement as HTMLElement, 'bounce')
    }
  }
}

function getEvolutionStageName(stage: number): string {
  const stages = ['', 'Enhanced', 'Augmented', 'Transcendent']
  return stages[stage] || 'Unknown'
}

function canShowNextMilestone(filament: any): boolean {
  return filament.purchased.gt(0) && (filament.purchased.toNumber() % 10) !== 0
}

function getNextMilestoneText(filament: any): string {
  const nextMilestone = Math.floor(filament.purchased.toNumber() / 10) + 1
  const nextMilestoneAt = nextMilestone * 10
  const remaining = nextMilestoneAt - filament.purchased.toNumber()
  return `${remaining} more purchases (×${Math.pow(2, nextMilestone)})`
}

function getMilestoneProgress(filament: any): number {
  return (filament.purchased.toNumber() % 10) * 10
}

function getMilestoneProgressText(filament: any): string {
  const current = filament.purchased.toNumber() % 10
  return `${current}/10 purchases to next milestone`
}

function canShowEvolutionProgress(filament: any): boolean {
  const purchased = filament.purchased.toNumber()
  return purchased >= 20 && filament.evolution < 3 // Show when close to evolution
}

function getEvolutionProgress(filament: any): number {
  const purchased = filament.purchased.toNumber()
  
  if (filament.evolution === 0) {
    // Progress to Enhanced (25 purchases)
    return Math.min(100, (purchased / 25) * 100)
  } else if (filament.evolution === 1) {
    // Progress to Augmented (100 purchases total)
    return Math.min(100, (purchased / 100) * 100)
  } else if (filament.evolution === 2) {
    // Progress to Transcendent (250 purchases total)
    return Math.min(100, (purchased / 250) * 100)
  }
  
  return 100
}

function getEvolutionProgressLabel(filament: any): string {
  const purchased = filament.purchased.toNumber()
  
  if (filament.evolution === 0) {
    return `Enhanced at 25 purchases (${purchased}/25)`
  } else if (filament.evolution === 1) {
    return `Augmented at 100 purchases (${purchased}/100)`
  } else if (filament.evolution === 2) {
    return `Transcendent at 250 purchases (${purchased}/250)`
  }
  
  return 'Fully Evolved'
}

function getFilamentTooltip(index: number): string {
  const filament = filaments.value[index]
  const nextMilestone = Math.floor(filament.owned.toNumber() / 10) + 1
  const nextMilestoneAt = nextMilestone * 10
  
  const evolutionInfo = filament.evolution > 0 ? `
    <strong>Evolution Stage:</strong> ${getEvolutionStageName(filament.evolution)}<br>
    <strong>Evolution Bonus:</strong> +${(filament.evolution * 50)}% base production<br>
  ` : `
    <strong>Evolution:</strong> Enhanced at 25 owned<br>
  `
  
  // Add hierarchy requirement info
  const hierarchyInfo = isFilamentLocked(index) ? `
    <div class="warning">
      <strong>⚠️ Locked:</strong> Requires Tier ${getRequiredTier(index)} Filament first<br>
      <em>Must purchase all previous tiers before unlocking this one</em><br>
    </div>
    <br>
  ` : ''
  
  const tooltipHtml = `
    <div>
      ${hierarchyInfo}
      <strong>Base Cost:</strong> ${format(filament.baseCost)}<br>
      <strong>Cost Factor:</strong> ×${filament.costFactor}<br>
      <strong>Production Multiplier:</strong> ×${filament.productionMultiplier}<br>
      ${evolutionInfo}
      <br>
      <strong>Current Milestone:</strong> ${filament.milestone} (×${Math.pow(2, filament.milestone)} production)<br>
      <strong>Next Milestone:</strong> At ${nextMilestoneAt} owned (×${Math.pow(2, nextMilestone)} production)<br>
      <br>
      <div class="tip">
        <strong>Purchase Order:</strong> Must buy all lower tiers first<br>
        <strong>Milestones:</strong> Every 10 purchases doubles production<br>
        <strong>Evolution:</strong> 25/50/75 purchases unlock evolution stages
      </div>
    </div>
  `
  
  return tooltipHtml
}
</script>

<style scoped>
.filament-manager {
  height: 100%;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-green);
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.filament-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.filament-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-secondary);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.filament-card:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-blue);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.filament-card:not(.disabled) {
  cursor: pointer;
}

.filament-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
  pointer-events: none;
}

.filament-card:hover::before {
  left: 100%;
}

.filament-card.disabled {
  opacity: 0.3;
  pointer-events: none;
}

.filament-card.hierarchy-locked {
  background: rgba(255, 165, 0, 0.1);
  border-color: rgba(255, 165, 0, 0.5);
  position: relative;
}

.filament-card.hierarchy-locked::after {
  content: '🔒';
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 16px;
  opacity: 0.7;
}

.filament-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.filament-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.3);
}

.filament-tier {
  font-size: 14px;
  color: var(--accent-blue);
  font-weight: 800;
  background: rgba(59, 130, 246, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid var(--accent-blue);
}

.filament-stats {
  margin-bottom: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 6px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-label {
  color: var(--text-muted);
  font-weight: 600;
  min-width: 80px;
}

.stat-value {
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
  font-weight: 700;
  text-align: right;
  min-width: 100px;
}

.filament-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
  flex: 1;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple));
  transition: width 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: progress-shine 2s ease-in-out infinite;
}

@keyframes progress-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.stat-value {
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
  transition: all 0.3s ease;
}

.stat-value.number-increment {
  color: var(--accent-green);
  transform: scale(1.1);
}

/* Enhanced animations */
.filament-card.purchase-success {
  animation: purchase-success 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
}

@keyframes purchase-success {
  0% { transform: scale(1); background: rgba(255, 255, 255, 0.05); }
  25% { transform: scale(1.02); background: rgba(0, 255, 0, 0.1); }
  50% { transform: scale(1.01); background: rgba(0, 255, 0, 0.05); }
  100% { transform: scale(1); background: rgba(255, 255, 255, 0.05); }
}

/* Enhanced stat highlights */
.purchased-highlight {
  color: var(--accent-green) !important;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
}

.milestone-highlight {
  color: var(--accent-yellow) !important;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

.evolution-highlight {
  color: var(--accent-purple) !important;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(147, 51, 234, 0.6);
}

.next-milestone {
  color: var(--text-muted) !important;
  font-style: italic;
  font-size: 11px;
}

.hierarchy-requirement {
  color: #ff8c00 !important;
  font-weight: 600;
  font-size: 11px;
  text-shadow: 0 0 6px rgba(255, 140, 0, 0.5);
}

/* Progress bar enhancements */
.progress-bar {
  position: relative;
}

.progress-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  color: var(--text-primary);
  font-weight: 600;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  pointer-events: none;
  z-index: 2;
}

/* Evolution progress styling */
.evolution-progress {
  margin-top: 12px;
  padding: 8px;
  background: rgba(147, 51, 234, 0.1);
  border: 1px solid rgba(147, 51, 234, 0.3);
  border-radius: 6px;
}

.evolution-label {
  font-size: 11px;
  color: var(--accent-purple);
  font-weight: 600;
  margin-bottom: 6px;
  text-align: center;
}

.evolution-bar {
  width: 100%;
  height: 6px;
  background: rgba(147, 51, 234, 0.2);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.evolution-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-purple), var(--accent-blue));
  transition: width 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
}

.evolution-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: evolution-shine 3s ease-in-out infinite;
}

@keyframes evolution-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Milestone celebration */
.milestone-celebration {
  animation: milestone-celebration 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes milestone-celebration {
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(2deg); }
  50% { transform: scale(1.05) rotate(-1deg); }
  75% { transform: scale(1.02) rotate(1deg); }
  100% { transform: scale(1) rotate(0deg); }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .filament-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .filament-card {
    padding: 12px;
    margin: 0 4px;
  }
  
  .filament-actions {
    flex-direction: column;
    gap: 6px;
  }
  
  .progress-label {
    font-size: 9px;
  }
  
  .evolution-label {
    font-size: 10px;
  }
  
  .stat-row {
    font-size: 11px;
  }
}</style>