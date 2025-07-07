<template>
  <div class="production-info">
    <h2 class="section-title">Production Info</h2>
    
    <div class="production-section">
      <h3 class="subsection-title">Stardust Production</h3>
      <div class="production-breakdown">
        <div class="production-item">
          <span>Base Production:</span>
          <span>{{ format(stardust.production) }}/s</span>
        </div>
        <div class="production-item" v-for="(filament, index) in activeFilaments" :key="filament.id">
          <span>{{ filament.name }}:</span>
          <span>{{ format(getFilamentProduction(index)) }}/s</span>
        </div>
        <div class="production-item total">
          <span>Total Production:</span>
          <span>{{ format(totalStardustProduction) }}/s</span>
        </div>
      </div>
    </div>
    
    <div class="production-section" v-if="hasMultipliers">
      <h3 class="subsection-title">Multipliers</h3>
      <div class="multiplier-breakdown">
        <div class="multiplier-item" v-if="starburstCount > 0">
          <span>Starburst:</span>
          <span>{{ format(starburstMultiplier) }}x</span>
        </div>
        <div class="multiplier-item" v-if="stardust.multiplier.gt(1)">
          <span>Other:</span>
          <span>{{ format(stardust.multiplier) }}x</span>
        </div>
      </div>
    </div>
    
    <div class="production-section">
      <h3 class="subsection-title">Time to Goals</h3>
      <div class="goal-breakdown">
        <div class="goal-item" v-if="!canStarburst">
          <span>Starburst:</span>
          <span>{{ timeToStarburst }}</span>
        </div>
        <div class="goal-item" v-if="!canGetStarlight">
          <span>Starlight:</span>
          <span>{{ timeToStarlight }}</span>
        </div>
        <div class="goal-item" v-for="(time, index) in filamentGoals" :key="index">
          <span>{{ filaments[index].name }}:</span>
          <span>{{ time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/gameState'
import { format, formatTime } from '@/utils/formatting'
import { D, type Decimal } from '@/utils/decimal'

const gameStore = useGameStore()
const { 
  stardust, 
  starlight,
  filaments, 
  starburstCount,
  totalStardustProduction,
  canStarburst,
  canGetStarlight
} = storeToRefs(gameStore)

const activeFilaments = computed(() => {
  return filaments.value.filter(f => f.owned.gt(0))
})

const starburstMultiplier = computed(() => {
  if (starburstCount.value === 0) return D(1)
  const base = D(2).mul(D(1.1).pow(starlight.value.amount))
  return base.pow(starburstCount.value)
})

const hasMultipliers = computed(() => {
  return starburstCount.value > 0 || stardust.value.multiplier.gt(1)
})

const timeToStarburst = computed(() => {
  if (canStarburst.value) return 'Available'
  const needed = D('1e100').sub(stardust.value.amount)
  const time = needed.div(totalStardustProduction.value).toNumber()
  return formatTime(time)
})

const timeToStarlight = computed(() => {
  if (canGetStarlight.value) return 'Available'
  const needed = D('1e100').sub(stardust.value.amount)
  const time = needed.div(totalStardustProduction.value).toNumber()
  return formatTime(time)
})

const filamentGoals = computed(() => {
  const goals = []
  for (let i = 0; i < filaments.value.length; i++) {
    if (i === 0 || filaments.value[i - 1].owned.gt(0)) {
      if (!gameStore.canBuyFilament(i)) {
        const cost = gameStore.getFilamentCost(i)
        const needed = cost.sub(stardust.value.amount)
        if (needed.gt(0)) {
          const time = needed.div(totalStardustProduction.value).toNumber()
          goals.push(formatTime(time))
        } else {
          goals.push('Available')
        }
      }
    }
  }
  return goals
})

function getFilamentProduction(index: number): Decimal {
  const filament = filaments.value[index]
  if (filament.owned.eq(0)) return D(0)
  
  let production = filament.baseProduction.mul(filament.owned)
  
  // Milestone bonus
  const milestoneBonus = D(2).pow(Math.floor(filament.owned.toNumber() / 10))
  production = production.mul(milestoneBonus)
  
  // Hierarchy bonus
  if (index > 0 && filaments.value[index - 1].owned.gt(0)) {
    const hierarchyBonus = filaments.value[index - 1].owned.pow(0.5)
      .mul(filament.owned.pow(0.3))
    production = production.mul(hierarchyBonus)
  }
  
  return production
}
</script>

<style scoped>
.production-info {
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

.production-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.subsection-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 12px;
}

.production-breakdown,
.multiplier-breakdown,
.goal-breakdown {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.production-item,
.multiplier-item,
.goal-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.production-item span:first-child,
.multiplier-item span:first-child,
.goal-item span:first-child {
  color: var(--text-muted);
}

.production-item span:last-child,
.multiplier-item span:last-child,
.goal-item span:last-child {
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
}

.production-item.total {
  border-top: 1px solid var(--border-secondary);
  padding-top: 6px;
  margin-top: 6px;
  font-weight: 600;
}

.production-item.total span:last-child {
  color: var(--accent-yellow);
}</style>