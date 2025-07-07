<template>
  <div class="upgrade-container" v-if="unlocked">
    <h2 class="section-title">Upgrade Tree - Star Core</h2>
    
    <div class="upgrade-stats">
      <div class="stat-item">
        <span>Total Starlight Spent:</span>
        <span>{{ format(totalStarlightSpent) }}</span>
      </div>
      <div class="stat-item">
        <span>Purchased Upgrades:</span>
        <span>{{ purchasedUpgradesList.length }}</span>
      </div>
      <div class="stat-item">
        <span>Available Upgrades:</span>
        <span>{{ availableUpgrades.length }}</span>
      </div>
      <div class="stat-item">
        <span>Path Status:</span>
        <span :class="pathLocked ? 'path-locked' : 'path-flexible'">
          {{ pathLocked ? 'Locked' : 'Flexible' }}
        </span>
      </div>
    </div>
    
    <div class="branch-tabs">
      <button 
        v-for="branch in unlockedBranches"
        :key="branch"
        :class="['branch-tab', { active: selectedBranch === branch }]"
        @click="selectedBranch = branch"
      >
        {{ formatBranchName(branch) }}
      </button>
    </div>
    
    
    <div class="upgrade-tree-container" ref="treeContainer">
      <div class="tree-visualization" :style="{ transform: transform }">
        <svg class="tree-svg" viewBox="-600 -600 1200 1200">
          <!-- Connection lines -->
          <g class="connections">
            <template v-for="upgrade in branchUpgrades" :key="`connection-${upgrade.id}`">
              <template v-for="prereq in upgrade.unlockCondition.prerequisites" :key="`line-${prereq}-${upgrade.id}`">
                <line 
                  v-if="getUpgradeById(prereq)"
                  :x1="getUpgradeById(prereq)?.position.x || 0"
                  :y1="getUpgradeById(prereq)?.position.y || 0"
                  :x2="upgrade.position.x"
                  :y2="upgrade.position.y"
                  :class="['connection-line', {
                    active: isUpgradePurchased(prereq) && isUpgradePurchased(upgrade.id),
                    available: isUpgradePurchased(prereq) && upgrade.unlocked
                  }]"
                />
              </template>
            </template>
          </g>
          
          <!-- Upgrade nodes -->
          <g class="upgrade-nodes">
            <g 
              v-for="upgrade in branchUpgrades"
              :key="upgrade.id"
              :transform="`translate(${upgrade.position.x}, ${upgrade.position.y})`"
              :class="['upgrade-node', {
                purchased: upgrade.purchased,
                available: upgrade.unlocked && !upgrade.purchased,
                locked: !upgrade.unlocked,
                'star-core': upgrade.id === 'star_core'
              }]"
              @click="handleUpgradeClick(upgrade)"
            >
              <circle 
                r="37.5"
                :class="['upgrade-circle', `tier-${upgrade.tier}`]"
              />
              <text 
                class="upgrade-tier-text"
                text-anchor="middle"
                dy="5"
              >
                T{{ upgrade.tier }}
              </text>
            </g>
          </g>
          
          <!-- Upgrade labels -->
          <g class="upgrade-labels">
            <text 
              v-for="upgrade in branchUpgrades"
              :key="`label-${upgrade.id}`"
              :x="upgrade.position.x"
              :y="upgrade.position.y + 67.5"
              class="upgrade-name"
              text-anchor="middle"
            >
              {{ upgrade.name }}
            </text>
          </g>
        </svg>
      </div>
    </div>
    
    <div class="upgrade-details" v-if="selectedUpgrade">
      <div class="upgrade-detail-card">
        <div class="upgrade-header">
          <h3 class="upgrade-title">{{ selectedUpgrade.name }}</h3>
          <div class="upgrade-cost">
            Cost: {{ selectedUpgrade.cost }} Starlight
          </div>
        </div>
        
        <div class="upgrade-description">
          {{ selectedUpgrade.description }}
        </div>
        
        <div class="upgrade-effects">
          <h4>Effects:</h4>
          <div class="effects-list">
            <div 
              v-for="effect in selectedUpgrade.effects"
              :key="effect.description"
              class="effect-item"
            >
              {{ effect.description }}
            </div>
          </div>
        </div>
        
        <div class="upgrade-requirements" v-if="selectedUpgrade.unlockCondition.prerequisites.length > 0">
          <h4>Prerequisites:</h4>
          <div class="prerequisites-list">
            <div 
              v-for="prereqId in selectedUpgrade.unlockCondition.prerequisites"
              :key="prereqId"
              :class="['prerequisite', { met: isUpgradePurchased(prereqId) }]"
            >
              {{ getUpgradeById(prereqId)?.name || prereqId }}
            </div>
          </div>
        </div>
        
        <div class="upgrade-actions">
          <button 
            v-if="!selectedUpgrade.purchased"
            class="btn btn-primary"
            :disabled="!canPurchaseUpgrade(selectedUpgrade.id)"
            @click="purchaseUpgrade(selectedUpgrade.id)"
          >
            <span v-if="canPurchaseUpgrade(selectedUpgrade.id)">Purchase Upgrade</span>
            <span v-else-if="!selectedUpgrade.unlocked">Not Unlocked</span>
            <span v-else>Insufficient Starlight</span>
          </button>
          <span v-else class="purchased-indicator">✓ Purchased</span>
        </div>
      </div>
    </div>
    
    <div class="branch-info">
      <h3 class="subsection-title">Branch Information</h3>
      <div class="branch-descriptions">
        <div class="branch-desc" v-if="selectedBranch === 'production'">
          <h4>"Heart of the Star" - Production Branch</h4>
          <p>Focuses on enhancing stellar production, milestone effects, and energy acceleration. 
             Culminates in harnessing supernova energy for massive production gains.</p>
        </div>
        <div class="branch-desc" v-if="selectedBranch === 'system'">
          <h4>"Shoulders of the Universe" - System Branch</h4>
          <p>Enhances synergistic interactions between cosmic systems. Advanced upgrades 
             introduce paradoxical effects and auto-optimization capabilities.</p>
        </div>
        <div class="branch-desc" v-if="selectedBranch === 'evolution'">
          <h4>"River of Time" - Evolution Branch</h4>
          <p>Manipulates temporal flows to enhance Starburst effects and preserve progress 
             through resets. Master time itself with eternal preservation loops.</p>
        </div>
        <div class="branch-desc" v-if="selectedBranch === 'expansion'">
          <h4>"Will of the Stars" - Expansion Branch</h4>
          <p>Expands dimensional boundaries and cosmic influence. Access parallel realities 
             and bend the very fabric of space-time to your will.</p>
        </div>
      </div>
    </div>
    
    <div class="path-warning" v-if="pathLocked">
      <div class="warning-content">
        <h4>⚠️ Upgrade Paths Locked</h4>
        <p>You have committed to specific upgrade paths. Changing paths requires a Starlight reset.</p>
        <p>This is a strategic choice that defines your progression approach.</p>
      </div>
    </div>
  </div>
  
  <div class="upgrade-locked" v-else>
    <div class="locked-content">
      <h2>Upgrade Tree System</h2>
      <p>Unlocks at 1 Starlight</p>
      <div class="unlock-progress">
        <span>Current Starlight: {{ format(starlight.amount) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUpgradeStore } from '@/stores/upgrades'
import { useGameStore } from '@/stores/gameState'
import { format } from '@/utils/formatting'
import type { Upgrade, UpgradeBranch } from '@/types/upgrades'
import { UpgradeBranch as UB } from '@/types/upgrades'

const upgradeStore = useUpgradeStore()
const gameStore = useGameStore()

// Optimized camera controls
const treeContainer = ref<HTMLElement>()
const zoom = ref(2.5) // Start at 250%
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)

let lastMouseX = 0
let lastMouseY = 0
let animationFrame = 0

const transform = computed(() => {
  return `translate(${panX.value}px, ${panY.value}px) scale(${zoom.value})`
})

// Throttled mouse wheel handler
const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  
  if (animationFrame) return // Skip if already animating
  
  animationFrame = requestAnimationFrame(() => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    zoom.value = Math.max(2.0, Math.min(3.5, zoom.value + delta))
    animationFrame = 0
  })
}

// Efficient drag handlers
const handleMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return
  isDragging.value = true
  lastMouseX = e.clientX
  lastMouseY = e.clientY
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  
  if (animationFrame) return // Skip if already animating
  
  animationFrame = requestAnimationFrame(() => {
    const deltaX = e.clientX - lastMouseX
    const deltaY = e.clientY - lastMouseY
    
    panX.value += deltaX
    panY.value += deltaY
    
    lastMouseX = e.clientX
    lastMouseY = e.clientY
    animationFrame = 0
  })
}

const handleMouseUp = () => {
  isDragging.value = false
}

onMounted(() => {
  if (!treeContainer.value) return
  
  const container = treeContainer.value
  container.addEventListener('wheel', handleWheel, { passive: false })
  container.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  if (!treeContainer.value) return
  
  const container = treeContainer.value
  container.removeEventListener('wheel', handleWheel)
  container.removeEventListener('mousedown', handleMouseDown)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})



const {
  unlocked,
  totalStarlightSpent,
  pathLocked,
  purchasedUpgradesList,
  availableUpgrades,
  unlockedBranches,
  upgradeData
} = storeToRefs(upgradeStore)

const { starlight } = storeToRefs(gameStore)

const selectedBranch = ref<UpgradeBranch>(UB.PRODUCTION)
const selectedUpgrade = ref<Upgrade | null>(null)

const branchUpgrades = computed(() => {
  const allUpgrades = Array.from(upgradeData.value.values())
  if (selectedBranch.value === UB.PRODUCTION) {
    return allUpgrades.filter(u => 
      u.branch === UB.PRODUCTION || u.id === 'star_core'
    )
  }
  return allUpgrades.filter(u => 
    u.branch === selectedBranch.value || u.id === 'star_core'
  )
})

function formatBranchName(branch: UpgradeBranch): string {
  const names = {
    [UB.PRODUCTION]: 'Heart of the Star',
    [UB.SYSTEM]: 'Shoulders of the Universe', 
    [UB.EVOLUTION]: 'River of Time',
    [UB.EXPANSION]: 'Will of the Stars'
  }
  return names[branch] || branch
}

function getUpgradeById(id: string): Upgrade | undefined {
  return upgradeData.value.get(id)
}

function isUpgradePurchased(id: string): boolean {
  return upgradeData.value.get(id)?.purchased || false
}

function handleUpgradeClick(upgrade: Upgrade) {
  selectedUpgrade.value = upgrade
}

// Expose store methods
const canPurchaseUpgrade = upgradeStore.canPurchaseUpgrade
const purchaseUpgrade = upgradeStore.purchaseUpgrade

// Auto-select star core initially
if (upgradeData.value.has('star_core')) {
  selectedUpgrade.value = upgradeData.value.get('star_core')!
}
</script>

<style scoped>
.upgrade-container {
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

.upgrade-stats {
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

.path-locked { color: var(--accent-red); }
.path-flexible { color: var(--accent-green); }

.branch-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.branch-tab {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  font-weight: 600;
}

.branch-tab:hover:not(.active) {
  background: rgba(255, 255, 255, 0.1);
}

.branch-tab.active {
  border-color: var(--accent-purple);
  background: rgba(138, 43, 226, 0.2);
  color: var(--text-primary);
}

.upgrade-tree-container {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  cursor: grab;
  user-select: none;
}

.upgrade-tree-container:active {
  cursor: grabbing;
}

.tree-visualization {
  transform-origin: center center;
  will-change: transform;
}

.tree-svg {
  width: 100%;
  max-width: 800px;
  height: 400px;
}

.connection-line {
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 2;
  fill: none;
}

.connection-line.available {
  stroke: var(--accent-blue);
  stroke-width: 3;
}

.connection-line.active {
  stroke: var(--accent-purple);
  stroke-width: 4;
  filter: drop-shadow(0 0 5px var(--accent-purple));
}

.upgrade-node {
  cursor: pointer;
  transition: all 0.3s ease;
}

.upgrade-node:hover:not(.locked) {
  /* Remove transform scale to prevent movement */
  /* transform: scale(1.1); */
  filter: brightness(1.2);
}

.upgrade-circle {
  fill: rgba(255, 255, 255, 0.1);
  stroke: var(--border-secondary);
  stroke-width: 2;
  transition: all 0.3s ease;
}

.upgrade-node.locked .upgrade-circle {
  fill: rgba(100, 100, 100, 0.2);
  stroke: var(--text-muted);
}

.upgrade-node.available .upgrade-circle {
  fill: rgba(0, 180, 216, 0.3);
  stroke: var(--accent-blue);
  stroke-width: 3;
}

.upgrade-node.available:hover .upgrade-circle {
  fill: rgba(0, 180, 216, 0.5);
  stroke-width: 4;
  box-shadow: 0 0 20px var(--accent-blue);
}

.upgrade-node.purchased .upgrade-circle {
  fill: rgba(138, 43, 226, 0.5);
  stroke: var(--accent-purple);
  stroke-width: 4;
  filter: drop-shadow(0 0 10px var(--accent-purple));
}

.upgrade-node.star-core .upgrade-circle {
  fill: rgba(255, 215, 0, 0.4);
  stroke: var(--accent-yellow);
  stroke-width: 5;
  filter: drop-shadow(0 0 15px var(--accent-yellow));
}

.upgrade-circle.tier-0 { stroke-width: 5; }
.upgrade-circle.tier-1 { stroke-width: 3; }
.upgrade-circle.tier-2 { stroke-width: 3; }
.upgrade-circle.tier-3 { stroke-width: 3; }
.upgrade-circle.tier-4 { stroke-width: 4; }

.upgrade-tier-text {
  font-size: 18px;
  fill: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
}

.upgrade-name {
  font-size: 15px;
  fill: var(--text-secondary);
  font-family: 'Roboto Mono', monospace;
}

.upgrade-details {
  margin-top: 20px;
}

.upgrade-detail-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 20px;
}

.upgrade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.upgrade-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-purple);
}

.upgrade-cost {
  font-family: 'Roboto Mono', monospace;
  color: var(--accent-yellow);
  font-weight: 600;
}

.upgrade-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 15px;
  line-height: 1.5;
}

.upgrade-effects h4,
.upgrade-requirements h4 {
  font-size: 14px;
  color: var(--accent-blue);
  margin-bottom: 8px;
}

.effects-list,
.prerequisites-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 15px;
}

.effect-item {
  font-size: 13px;
  color: var(--accent-green);
  font-family: 'Roboto Mono', monospace;
}

.prerequisite {
  font-size: 12px;
  color: var(--text-muted);
}

.prerequisite.met {
  color: var(--accent-green);
}

.upgrade-actions {
  text-align: center;
}

.purchased-indicator {
  color: var(--accent-green);
  font-weight: 600;
  font-size: 16px;
}

.branch-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
}

.branch-desc h4 {
  color: var(--accent-blue);
  margin-bottom: 8px;
}

.branch-desc p {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.path-warning {
  background: rgba(255, 165, 0, 0.1);
  border: 1px solid var(--accent-orange);
  border-radius: 8px;
  padding: 15px;
}

.warning-content h4 {
  color: var(--accent-orange);
  margin-bottom: 8px;
}

.warning-content p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 4px 0;
}

.upgrade-locked {
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
}

.locked-content h2 {
  color: var(--accent-purple);
  margin-bottom: 15px;
}

.locked-content p {
  color: var(--text-muted);
  margin-bottom: 20px;
}

.unlock-progress {
  font-family: 'Roboto Mono', monospace;
  color: var(--accent-blue);
}

@media (max-width: 768px) {
  .upgrade-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .branch-tabs {
    flex-direction: column;
  }
  
  .upgrade-stats {
    flex-direction: column;
    gap: 10px;
  }
}


.tree-visualization {
  transition: transform 0.1s ease-out;
  transform-origin: center center;
}

/* Hide overflow on SVG to prevent issues */
.tree-svg {
  overflow: visible;
}
</style>