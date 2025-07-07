<template>
  <div class="reset-system">
    <h2 class="section-title">Reset System</h2>
    
    <div class="reset-description">
      <p>Strategic resets can accelerate your progress through powerful bonuses and unlock new content.</p>
    </div>
    
    <div class="reset-options">
      
      <!-- Starburst Reset -->
      <div class="reset-card starburst">
        <div class="reset-header">
          <h3>🌟 Starburst</h3>
          <div class="reset-status">
            <span v-if="gameStore.canStarburst" class="available">AVAILABLE</span>
            <span v-else class="unavailable">LOCKED</span>
          </div>
        </div>
        
        <div class="reset-info">
          <div class="info-row">
            <span>Requirement:</span>
            <span>{{ getStarburstRequirementText() }}</span>
          </div>
          <div class="info-row">
            <span>Current:</span>
            <span>{{ getCurrentProgressText() }}</span>
          </div>
          <div class="info-row">
            <span>Count:</span>
            <span>{{ gameStore.starburstCount }}</span>
          </div>
          <div class="info-row">
            <span>Multiplier:</span>
            <span>{{ format(starburstMultiplier) }}×</span>
          </div>
          <div class="info-row" v-if="getNextUnlockText()">
            <span>Next Unlock:</span>
            <span>{{ getNextUnlockText() }}</span>
          </div>
        </div>
        
        <div class="reset-effects">
          <h4>Effects:</h4>
          <ul>
            <li>{{ getStarburstEffectText() }}</li>
            <li>Production multiplier: ×{{ format(getNextStarburstMultiplier()) }}</li>
            <li>Keep: Starlight, upgrades, unlocks, milestones</li>
            <li v-if="isFirstStarburst()">Unlock Tier 5 and Rail Road system</li>
            <li v-if="isStarEchoUnlock()">🌟 Unlock Star Echo System!</li>
          </ul>
        </div>
        
        <div class="reset-actions">
          <EnhancedButton
            :disabled="!gameStore.canStarburst"
            @click="performStarburst"
            variant="primary"
            size="medium"
            :particles="true"
            :glow="gameStore.canStarburst"
          >
            Perform Starburst
          </EnhancedButton>
        </div>
      </div>
      
      <!-- Starlight Reset -->
      <div class="reset-card starlight">
        <div class="reset-header">
          <h3>✨ Get Starlight</h3>
          <div class="reset-status">
            <span v-if="gameStore.canGetStarlight" class="available">AVAILABLE</span>
            <span v-else class="unavailable">LOCKED</span>
          </div>
        </div>
        
        <div class="reset-info">
          <div class="info-row">
            <span>Requirement:</span>
            <span>{{ format(D('1e100')) }} Stardust</span>
          </div>
          <div class="info-row">
            <span>Gain:</span>
            <span>{{ starlightGain }} Starlight</span>
          </div>
          <div class="info-row">
            <span>Total:</span>
            <span>{{ format(gameStore.starlight.amount) }}</span>
          </div>
        </div>
        
        <div class="reset-effects">
          <h4>Effects:</h4>
          <ul>
            <li>Gain {{ starlightGain }} Starlight</li>
            <li>Reset: Stardust, Starbursts, Filaments</li>
            <li>Keep: Star Rail, Upgrades, Memory</li>
          </ul>
        </div>
        
        <div class="reset-actions">
          <EnhancedButton
            :disabled="!gameStore.canGetStarlight"
            @click="performStarlightReset"
            variant="secondary"
            size="medium"
            :particles="true"
            :glow="gameStore.canGetStarlight"
          >
            Get Starlight
          </EnhancedButton>
        </div>
      </div>
      
      <!-- Supernova Reset (Future) -->
      <div class="reset-card supernova disabled">
        <div class="reset-header">
          <h3>💥 Supernova</h3>
          <div class="reset-status">
            <span class="future">FUTURE</span>
          </div>
        </div>
        
        <div class="reset-info">
          <div class="info-row">
            <span>Requirement:</span>
            <span>Nova Layer</span>
          </div>
        </div>
        
        <div class="reset-effects">
          <h4>Effects:</h4>
          <ul>
            <li>Transition to Nova Layer</li>
            <li>Massive bonuses and new mechanics</li>
            <li>Progress preservation system</li>
          </ul>
        </div>
        
        <div class="reset-actions">
          <EnhancedButton
            disabled
            variant="ghost"
            size="medium"
          >
            Coming Soon
          </EnhancedButton>
        </div>
      </div>
      
    </div>
    
    <div class="reset-warning">
      <h3>⚠️ Reset Safety</h3>
      <p>All resets are carefully designed to provide progression benefits. Review the "Keep" and "Reset" lists before proceeding.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/gameState'
import { format } from '@/utils/formatting'
import { D } from '@/utils/decimal'
import EnhancedButton from '@/components/ui/EnhancedButton.vue'

const gameStore = useGameStore()
const { starburstCount, starlight } = storeToRefs(gameStore)

const starburstMultiplier = computed(() => {
  if (starburstCount.value === 0) return D(1)
  
  // Enhanced tiered scaling formula
  let multiplier = D(1)
  if (starburstCount.value <= 4) {
    multiplier = D(2).pow(starburstCount.value)
  } else if (starburstCount.value <= 8) {
    const earlyBonus = D(2).pow(4) // x16 from first 4
    const midBonus = D(3).pow(starburstCount.value - 4)
    multiplier = earlyBonus.mul(midBonus)
  } else {
    const earlyBonus = D(2).pow(4) // x16 from first 4
    const midBonus = D(3).pow(4) // x81 from 5th-8th
    const lateBonus = D(3).pow(starburstCount.value - 8)
    multiplier = earlyBonus.mul(midBonus).mul(lateBonus)
  }
  
  // Apply Starlight scaling
  const starlightMult = D(1.1).pow(starlight.value.amount)
  return multiplier.mul(starlightMult)
})

const getNextStarburstMultiplier = () => {
  const nextCount = starburstCount.value + 1
  let multiplier = D(1)
  
  if (nextCount <= 4) {
    multiplier = D(2).pow(nextCount)
  } else if (nextCount <= 8) {
    const earlyBonus = D(2).pow(4)
    const midBonus = D(3).pow(nextCount - 4)
    multiplier = earlyBonus.mul(midBonus)
  } else {
    const earlyBonus = D(2).pow(4)
    const midBonus = D(3).pow(4)
    const lateBonus = D(3).pow(nextCount - 8)
    multiplier = earlyBonus.mul(midBonus).mul(lateBonus)
  }
  
  const starlightMult = D(1.1).pow(starlight.value.amount)
  return multiplier.mul(starlightMult)
}

const starlightGain = computed(() => {
  return gameStore.canGetStarlight ? 1 : 0
})

function performStarburst() {
  if (confirm('Perform Starburst reset? This will reset Stardust and Filaments but keep Starlight and unlocks.')) {
    gameStore.performStarburst()
  }
}

function getStarburstRequirementText() {
  const count = starburstCount.value
  
  // Match the actual gameStore logic exactly
  if (count === 0) {
    return '25 Tier 4 Filaments'
  } else if (count === 1) {
    return '25 Tier 5 Filaments'
  } else if (count === 2) {
    return '25 Tier 6 Filaments'
  } else if (count === 3) {
    return '25 Tier 7 Filaments'
  } else if (count === 4) {
    return '25 Tier 8 Filaments'
  } else if (count === 5) {
    return '25 Tier 9 Filaments'
  } else if (count === 6) {
    return '25 Tier 10 Filaments'
  } else if (count === 7) {
    return '25 Tier 10 Filaments'
  } else {
    // 8th+ Starburst - scaling requirements
    const baseReq = 25
    const scaling = count - 7 // 8th=1, 9th=2, etc.
    const requirement = baseReq + (scaling * 25)
    return `${requirement} Tier 10 Filaments`
  }
}

function getCurrentProgressText() {
  const count = starburstCount.value
  
  if (count === 0) {
    return `${format(gameStore.filaments[3].purchased)} / 25`
  } else if (count === 1) {
    return `${format(gameStore.filaments[4].purchased)} / 25`
  } else if (count === 2) {
    return `${format(gameStore.filaments[5].purchased)} / 25`
  } else if (count === 3) {
    return `${format(gameStore.filaments[6].purchased)} / 25`
  } else if (count === 4) {
    return `${format(gameStore.filaments[7].purchased)} / 25`
  } else if (count === 5) {
    return `${format(gameStore.filaments[8].purchased)} / 25`
  } else if (count >= 6) {
    const baseReq = 25
    const scaling = count >= 8 ? count - 7 : 0
    const requirement = baseReq + (scaling * 25)
    return `${format(gameStore.filaments[9].purchased)} / ${requirement}`
  }
  return '0 / 25'
}

function getHighestUnlockedTier() {
  const maxTier = Math.min(9, 3 + starburstCount.value)
  for (let i = maxTier; i >= 0; i--) {
    if (gameStore.filaments[i].owned.gt(0)) {
      return i
    }
  }
  return 0
}

function getStarburstEffectText() {
  const count = starburstCount.value
  
  if (count === 0) {
    return 'Breakthrough: Unlock Tier 5 filament'
  } else if (count <= 3) {
    return `Unlock Tier ${Math.min(10, count + 5)} filament`
  } else if (count === 4) {
    return 'Enhanced scaling begins (x3 multiplier)'
  } else {
    return 'Continued exponential growth'
  }
}

function getNextUnlockText() {
  const count = starburstCount.value
  
  if (count === 4) {
    return 'Star Echo System at 5th Starburst'
  } else if (count === 6) {
    return 'All filament tiers unlocked'
  }
  return null
}

function isFirstStarburst() {
  return starburstCount.value === 0
}

function isStarEchoUnlock() {
  return starburstCount.value === 4
}

function performStarlightReset() {
  if (confirm('Get Starlight? This will reset more progress but provide valuable Starlight currency.')) {
    gameStore.performStarlightReset()
  }
}
</script>

<style scoped>
.reset-system {
  height: 100%;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-red);
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.reset-description {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 20px;
}

.reset-description p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.reset-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.reset-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
}

.reset-card.starburst {
  border-color: rgba(255, 107, 53, 0.5);
}

.reset-card.starlight {
  border-color: rgba(255, 215, 0, 0.5);
}

.reset-card.supernova {
  border-color: rgba(239, 68, 68, 0.5);
}

.reset-card.disabled {
  opacity: 0.6;
}

.reset-card:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.reset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.reset-header h3 {
  color: var(--text-primary);
  margin: 0;
  font-size: 16px;
}

.reset-status {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.available {
  color: var(--accent-green);
}

.unavailable {
  color: var(--text-muted);
}

.future {
  color: var(--accent-purple);
}

.reset-info {
  margin-bottom: 15px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 4px;
}

.info-row span:first-child {
  color: var(--text-muted);
}

.info-row span:last-child {
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
}

.reset-effects {
  margin-bottom: 20px;
}

.reset-effects h4 {
  color: var(--accent-blue);
  font-size: 14px;
  margin-bottom: 8px;
}

.reset-effects ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.reset-effects li {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  padding-left: 15px;
  position: relative;
}

.reset-effects li::before {
  content: '•';
  color: var(--accent-blue);
  font-weight: bold;
  position: absolute;
  left: 0;
}

.reset-actions {
  text-align: center;
}

.reset-warning {
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 8px;
  padding: 15px;
}

.reset-warning h3 {
  color: var(--accent-orange);
  font-size: 14px;
  margin-bottom: 8px;
}

.reset-warning p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .reset-options {
    grid-template-columns: 1fr;
  }
}
</style>