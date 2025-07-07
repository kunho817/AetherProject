<template>
  <div class="reset-panel">
    <h2 class="section-title">Reset Options</h2>
    
    <div class="reset-section">
      <h3 class="subsection-title">Starburst</h3>
      <p class="reset-description">
        Perform a soft reset to gain a powerful production multiplier.
        Resets Stardust and Filaments, but keeps milestones.
      </p>
      <div class="reset-requirement">
        <span>Requirement:</span>
        <span :class="{ 'requirement-met': canStarburst }">
          {{ format(stardust.amount) }} / 1e100 Stardust
        </span>
      </div>
      <div class="reset-bonus" v-if="canStarburst">
        <span>Current Multiplier:</span>
        <span>{{ format(currentStarburstMultiplier) }}x</span>
      </div>
      <div class="reset-bonus" v-if="canStarburst">
        <span>After Reset:</span>
        <span>{{ format(nextStarburstMultiplier) }}x</span>
      </div>
      <button 
        class="btn btn-primary"
        :disabled="!canStarburst"
        @click="performStarburst"
      >
        Perform Starburst
      </button>
    </div>
    
    <div class="reset-section">
      <h3 class="subsection-title">Starlight Reset</h3>
      <p class="reset-description">
        Perform an extensive reset to gain Starlight and Star Rail.
        Resets everything from Starburst plus milestones and evolution.
      </p>
      <div class="reset-requirement">
        <span>Requirement:</span>
        <span :class="{ 'requirement-met': canGetStarlight }">
          {{ format(stardust.amount) }} / 1e100 Stardust
        </span>
      </div>
      <div class="reset-bonus" v-if="canGetStarlight">
        <span>Starlight Gain:</span>
        <span>+1</span>
      </div>
      <div class="reset-bonus" v-if="canGetStarlight">
        <span>Star Rail Gain:</span>
        <span>+{{ calculateStarRailGain() }}</span>
      </div>
      <button 
        class="btn btn-primary"
        :disabled="!canGetStarlight"
        @click="performStarlightReset"
      >
        Perform Starlight Reset
      </button>
    </div>
    
    <div class="reset-stats">
      <h3 class="subsection-title">Reset Statistics</h3>
      <div class="stat-row">
        <span>Total Starbursts:</span>
        <span>{{ starburstCount }}</span>
      </div>
      <div class="stat-row">
        <span>Total Starlight Resets:</span>
        <span>{{ starlightResetCount }}</span>
      </div>
      <div class="stat-row">
        <span>Current Starlight:</span>
        <span>{{ format(starlight.amount) }}</span>
      </div>
      <div class="stat-row">
        <span>Current Star Rail:</span>
        <span>{{ starRail }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/gameState'
import { format } from '@/utils/formatting'
import { D } from '@/utils/decimal'

const gameStore = useGameStore()
const { 
  stardust, 
  starlight, 
  starRail,
  starburstCount, 
  starlightResetCount,
  canStarburst,
  canGetStarlight 
} = storeToRefs(gameStore)

const currentStarburstMultiplier = computed(() => {
  if (starburstCount.value === 0) return D(1)
  const base = D(2).mul(D(1.1).pow(starlight.value.amount))
  return base.pow(starburstCount.value)
})

const nextStarburstMultiplier = computed(() => {
  const base = D(2).mul(D(1.1).pow(starlight.value.amount))
  return base.pow(starburstCount.value + 1)
})

function calculateStarRailGain(): number {
  const starlightGain = 1 // Will be dynamic later
  return Math.max(1, Math.floor(Math.pow(starlightGain / 10, 0.5)))
}

function performStarburst() {
  if (confirm('Are you sure you want to perform a Starburst? This will reset your Stardust and Filaments.')) {
    gameStore.performStarburst()
  }
}

function performStarlightReset() {
  if (confirm('Are you sure you want to perform a Starlight Reset? This will reset everything from Starburst plus milestones.')) {
    gameStore.performStarlightReset()
  }
}
</script>

<style scoped>
.reset-panel {
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

.reset-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 12px;
}

.reset-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 15px;
  line-height: 1.5;
}

.reset-requirement {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 10px;
}

.reset-requirement span:first-child {
  color: var(--text-muted);
}

.reset-requirement span:last-child {
  color: var(--accent-red);
  font-family: 'Roboto Mono', monospace;
}

.requirement-met {
  color: var(--accent-green) !important;
}

.reset-bonus {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 10px;
}

.reset-bonus span:first-child {
  color: var(--text-muted);
}

.reset-bonus span:last-child {
  color: var(--accent-yellow);
  font-family: 'Roboto Mono', monospace;
}

.btn-primary {
  width: 100%;
  margin-top: 15px;
}

.reset-stats {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 20px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-row span:first-child {
  color: var(--text-muted);
}

.stat-row span:last-child {
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
}</style>