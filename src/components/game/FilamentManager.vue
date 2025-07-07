<template>
  <div class="filament-manager">
    <ParticleSystem ref="particleSystem" :enabled="true" />
    
    <h2 class="section-title">Cosmic Filaments</h2>
    
    <div class="filament-grid">
      <div 
        v-for="(filament, index) in filaments"
        :key="filament.id"
        :class="['filament-card', { disabled: !canSeeFilament(index) }]"
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
            <span class="stat-label">Owned:</span>
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
            <span class="stat-value">{{ filament.milestone }} (x{{ Math.pow(2, filament.milestone) }})</span>
          </div>
        </div>
        
        <div class="filament-actions">
          <EnhancedButton 
            size="small"
            variant="primary"
            :disabled="!gameStore.canBuyFilament(index)"
            @click="buyFilament(index, 1)"
            :particles="true"
            :clickEffect="true"
          >
            Buy 1
          </EnhancedButton>
          <EnhancedButton 
            size="small"
            variant="secondary"
            :disabled="!gameStore.canBuyFilament(index)"
            @click="buyMax(index)"
            :particles="true"
            :clickEffect="true"
          >
            Buy Max
          </EnhancedButton>
        </div>
        
        <div class="progress-bar" v-if="filament.owned.gt(0)">
          <div 
            class="progress-fill progress-fill-animated"
            :style="{ width: `${(filament.owned.toNumber() % 10) * 10}%` }"
          ></div>
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

function setCardRef(el: HTMLElement | null, index: number) {
  if (el) {
    cardRefs.value.set(index, el)
  }
}

function canSeeFilament(index: number): boolean {
  // Check if tier is unlocked based on Starburst count
  return index <= gameStore.maxUnlockedTier
}

function getFilamentProduction(index: number): Decimal {
  const filament = filaments.value[index]
  if (filament.owned.eq(0)) return D(0)
  
  let production = filament.baseProduction.mul(filament.owned)
  
  // Milestone bonus
  const milestoneBonus = D(2).pow(Math.floor(filament.owned.toNumber() / 10))
  production = production.mul(milestoneBonus)
  
  // Hierarchy bonus
  if (index > 0 && filaments.value[index - 1].owned.gt(0)) {
    const hierarchyBonus = D(filaments.value[index - 1].owned).pow(0.5)
      .mul(D(filament.owned).pow(0.3))
    production = production.mul(hierarchyBonus)
  }
  
  return production
}

async function buyFilament(index: number, amount: number) {
  if (!gameStore.canBuyFilament(index)) return
  
  const cost = gameStore.getFilamentCost(index)
  const beforeOwned = filaments.value[index].owned
  
  // Make the purchase
  gameStore.buyFilament(index, amount)
  
  const afterOwned = filaments.value[index].owned
  const actualAmount = afterOwned.sub(beforeOwned).toNumber()
  
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
  const beforeOwned = filaments.value[index].owned
  
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

function getFilamentTooltip(index: number): string {
  const filament = filaments.value[index]
  const nextMilestone = Math.floor(filament.owned.toNumber() / 10) + 1
  const nextMilestoneAt = nextMilestone * 10
  
  const tooltipHtml = `
    <div>
      <strong>Base Cost:</strong> ${format(filament.baseCost)}<br>
      <strong>Cost Factor:</strong> ×${filament.costFactor}<br>
      <strong>Production Multiplier:</strong> ×${filament.productionMultiplier}<br>
      <br>
      <strong>Current Milestone:</strong> ${filament.milestone} (×${Math.pow(2, filament.milestone)} production)<br>
      <strong>Next Milestone:</strong> At ${nextMilestoneAt} owned (×${Math.pow(2, nextMilestone)} production)<br>
      <br>
      <div class="tip">
        <strong>Tip:</strong> Every 10 purchases doubles this filament's production!
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
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

.filament-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.filament-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.filament-tier {
  font-size: 12px;
  color: var(--accent-blue);
  font-weight: 700;
}

.filament-stats {
  margin-bottom: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 4px;
}

.stat-label {
  color: var(--text-muted);
}

.stat-value {
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
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
}</style>