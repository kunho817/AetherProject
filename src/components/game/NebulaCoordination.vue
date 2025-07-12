<template>
  <div class="nebula-coordination-container">
    <!-- Background Effects -->
    <div class="nebula-background-effects">
      <div class="nebula-particles"></div>
      <div class="nebula-waves"></div>
      <div class="nebula-glow"></div>
    </div>
    
    <h2 class="section-title">Nebula Coordination</h2>
    
    <!-- Nebula Material Status -->
    <div class="material-stats">
      <div class="stat-item">
        <span>Nebula Material:</span>
        <span>{{ format(nebulaMaterial) }}</span>
      </div>
      <div class="stat-item">
        <span>Production Rate:</span>
        <span>{{ format(materialProductionRate) }}/s</span>
      </div>
      <div class="stat-item">
        <span>Total Components:</span>
        <span>{{ format(totalComponentsOwned) }}</span>
      </div>
    </div>
    
    <!-- Main Upgrade Interface -->
    <div class="upgrade-interface">
      <!-- Central Hub -->
      <div class="central-hub">
        <!-- Coordinator Center -->
        <div 
          class="coordinator-center"
          :class="{ 'active': currentView === 'coordinator' }"
          @click="setView('coordinator')"
        >
          <div class="coordinator-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="coordinator-label">Coordinator</div>
        </div>
        
        <!-- Orbiting Nebula Icons -->
        <div 
          v-for="(nebulaType, index) in allNebulaTypes"
          :key="nebulaType"
          class="nebula-orbit-item"
          :class="{ 
            'unlocked': discoveredNebulae.includes(nebulaType),
            'active': currentView === nebulaType 
          }"
          :style="getOrbitPosition(index)"
          @click="setView(nebulaType)"
        >
          <div class="nebula-icon">
            <div class="nebula-icon-svg" v-html="getNebulaIconSVG(nebulaType)"></div>
          </div>
          <div class="nebula-label">{{ getNebulaDisplayName(nebulaType) }}</div>
        </div>
      </div>
      
      <!-- Upgrade Tree Display -->
      <div class="upgrade-tree-container" v-if="currentUpgrades.length > 0">
        <h3 class="tree-title">
          {{ currentView === 'coordinator' ? 'Coordinator Upgrades' : getNebulaDisplayName(currentView as NebulaType) + ' Upgrades' }}
          <span class="tree-subtitle">{{ currentUpgrades.length }} upgrades available</span>
        </h3>
        
        <div class="upgrade-tree">
          <div 
            v-for="tier in upgradesByTier"
            :key="tier.tierNumber"
            class="upgrade-tier"
          >
            <div 
              v-for="upgrade in tier.upgrades"
              :key="upgrade.id"
              class="upgrade-node"
              :class="{
                'purchased': upgradeTreeStore.purchasedUpgrades.has(upgrade.id),
                'available': canAffordUpgrade(upgrade.id),
                'locked': !isUpgradeAvailable(upgrade.id)
              }"
              :title="upgrade.description"
              @click="purchaseUpgrade(upgrade.id)"
            >
            <div class="upgrade-icon">
              <div class="upgrade-category-icon" :class="upgrade.category">
                <div class="category-icon-svg" v-html="getCategoryIconSVG(upgrade.category)"></div>
              </div>
            </div>
            
            <div class="upgrade-content">
              <div class="upgrade-header">
                <h4 class="upgrade-name">{{ upgrade.name }}</h4>
                <div class="upgrade-tier">T{{ upgrade.tier }}</div>
              </div>
              
              <p class="upgrade-description">{{ upgrade.description }}</p>
              
              <!-- Cost Display -->
              <div class="upgrade-cost">
                <div v-if="upgrade.cost.nm" class="cost-item nm-cost">
                  <span class="cost-label">NM:</span>
                  <span class="cost-value">{{ format(upgrade.cost.nm) }}</span>
                </div>
                
                <div v-if="upgrade.cost.components" class="component-costs">
                  <div 
                    v-for="(amount, component) in upgrade.cost.components"
                    :key="component"
                    class="cost-item component-cost"
                  >
                    <span class="cost-label">{{ formatComponentName(component as NebulaComponent) }}:</span>
                    <span class="cost-value">{{ format(amount || 0) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Effects Display -->
              <div class="upgrade-effects">
                <div 
                  v-for="effect in upgrade.effects"
                  :key="effect.type + effect.target"
                  class="effect-item"
                >
                  {{ effect.description }}
                </div>
              </div>
              
              <!-- Prerequisites -->
              <div v-if="upgrade.requires && upgrade.requires.length > 0" class="upgrade-prerequisites">
                <span class="prereq-label">Requires:</span>
                <div class="prereq-list">
                  <span 
                    v-for="reqId in upgrade.requires"
                    :key="reqId"
                    class="prereq-item"
                    :class="{ 'completed': upgradeTreeStore.purchasedUpgrades.has(reqId) }"
                  >
                    {{ getUpgradeName(reqId) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      <!-- Component Purchase Interface -->
      <div class="component-interface" v-if="currentView === 'coordinator'">
        <h3 class="component-title">Component Inventory</h3>
        
        <div class="component-grid">
          <div 
            v-for="component in allComponents"
            :key="component"
            class="component-item"
          >
            <div class="component-header">
              <h4 class="component-name">{{ formatComponentName(component) }}</h4>
              <div class="component-owned">{{ format(getComponentAmount(component)) }}</div>
            </div>
            
            <div class="component-purchase">
              <div class="purchase-options">
                <button 
                  v-for="option in getComponentPurchaseOptions(component)"
                  :key="option.amount"
                  class="purchase-button"
                  :class="{ 'disabled': !canAffordComponent(component, option.amount) }"
                  @click="purchaseComponent(component, option.amount)"
                >
                  Buy {{ option.amount }}x
                  <span class="purchase-cost">{{ format(option.currentCost) }} NM</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Active Effects Summary -->
    <div class="effects-summary" v-if="currentBonuses.length > 0 || currentPenalties.length > 0">
      <h3>Active Effects</h3>
      
      <div class="effects-grid">
        <div class="bonuses-section" v-if="currentBonuses.length > 0">
          <h4>Bonuses</h4>
          <div class="effect-list">
            <div 
              v-for="bonus in currentBonuses"
              :key="bonus.type + bonus.target"
              class="effect-item bonus"
            >
              <span class="effect-value">{{ formatEffectValue(bonus) }}</span>
              <span class="effect-description">{{ bonus.description }}</span>
            </div>
          </div>
        </div>
        
        <div class="penalties-section" v-if="currentPenalties.length > 0">
          <h4>Penalties</h4>
          <div class="effect-list">
            <div 
              v-for="penalty in currentPenalties"
              :key="penalty.type + penalty.target"
              class="effect-item penalty"
            >
              <span class="effect-value">{{ formatPenaltyValue(penalty) }}</span>
              <span class="effect-description">{{ penalty.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNebulaStore } from '@/stores/nebula'
import { useComponentInventoryStore } from '@/stores/componentInventory'
import { useNebulaUpgradeTreeStore } from '@/stores/nebulaUpgradeTree'
import { format } from '@/utils/formatting'
import { NebulaComponent, NebulaType } from '@/types/nebula'
import type { UpgradeType, UpgradeCategory } from '@/types/nebulaUpgrades'

const nebulaStore = useNebulaStore()
const componentStore = useComponentInventoryStore()
const upgradeTreeStore = useNebulaUpgradeTreeStore()

const { 
  nebulaMaterial,
  discoveredNebulae,
  materialProductionRate,
  currentBonuses,
  currentPenalties
} = storeToRefs(nebulaStore)

const { totalComponentsOwned } = storeToRefs(componentStore)

// UI State
const currentView = ref<UpgradeType>('coordinator')
const allNebulaTypes = Object.values(NebulaType)
const allComponents = Object.values(NebulaComponent)

// Current upgrades based on selected view
const currentUpgrades = computed(() => {
  return upgradeTreeStore.getUpgradesForType(currentView.value)
})

// Organize upgrades by tier for tree layout
const upgradesByTier = computed(() => {
  const upgrades = currentUpgrades.value
  const tierMap = new Map<number, typeof upgrades>()
  
  // Group upgrades by tier
  upgrades.forEach(upgrade => {
    if (!tierMap.has(upgrade.tier)) {
      tierMap.set(upgrade.tier, [])
    }
    tierMap.get(upgrade.tier)!.push(upgrade)
  })
  
  // Convert to sorted array
  return Array.from(tierMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([tierNumber, upgrades]) => ({
      tierNumber,
      upgrades
    }))
})

// Helper Functions
function setView(view: UpgradeType): void {
  // Only allow viewing unlocked nebulae or coordinator
  if (view === 'coordinator' || discoveredNebulae.value.includes(view as NebulaType)) {
    currentView.value = view
    upgradeTreeStore.setSelectedType(view)
  }
}

function getOrbitPosition(index: number): { transform: string } {
  const total = allNebulaTypes.length
  const angle = (index * 360) / total
  const radius = 120
  const x = Math.cos((angle * Math.PI) / 180) * radius
  const y = Math.sin((angle * Math.PI) / 180) * radius
  
  return {
    transform: `translate(${x}px, ${y}px)`
  }
}

// Note: SVG icons are now inlined in getNebulaIconSVG function

function getNebulaDisplayName(nebulaType: NebulaType): string {
  return nebulaType.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function formatComponentName(component: NebulaComponent): string {
  return component.charAt(0).toUpperCase() + component.slice(1)
}

function getCategoryIconSVG(category: UpgradeCategory): string {
  const icons = {
    unlock: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="11" width="18" height="10" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
      <path d="M12 1v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    bonus: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="currentColor"/>
    </svg>`,
    penalty: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    special: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.3"/>
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>`,
    component: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="2"/>
    </svg>`,
    global: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
      <path d="M2 12h20" stroke="currentColor" stroke-width="2"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="2"/>
    </svg>`
  }
  return icons[category] || `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
    <circle cx="9" cy="9" r="2" stroke="currentColor" stroke-width="2"/>
    <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" stroke-width="2"/>
  </svg>`
}

// Component Functions
function purchaseComponent(component: NebulaComponent, amount: number): void {
  nebulaStore.purchaseComponent(component, amount)
}

function canAffordComponent(component: NebulaComponent, amount: number): boolean {
  return nebulaStore.canAffordComponent(component, amount)
}

function getComponentAmount(component: NebulaComponent) {
  return nebulaStore.getComponentAmount(component)
}

function getComponentPurchaseOptions(component: NebulaComponent) {
  return componentStore.getComponentPurchaseOptions(component)
}

// Upgrade Functions
function purchaseUpgrade(upgradeId: string): void {
  if (canAffordUpgrade(upgradeId) && isUpgradeAvailable(upgradeId)) {
    nebulaStore.purchaseUpgrade(upgradeId)
  }
}

function canAffordUpgrade(upgradeId: string): boolean {
  return nebulaStore.canAffordUpgrade(upgradeId)
}

function isUpgradeAvailable(upgradeId: string): boolean {
  const upgrade = upgradeTreeStore.findUpgradeById(upgradeId)
  return upgrade ? upgradeTreeStore.isUpgradeAvailable(upgrade) : false
}

function getUpgradeName(upgradeId: string): string {
  const upgrade = upgradeTreeStore.findUpgradeById(upgradeId)
  return upgrade?.name || upgradeId
}

// Effect Formatting
function formatEffectValue(effect: any): string {
  if (effect.type === 'production_multiplier') {
    return `×${effect.value.toFixed(2)}`
  } else if (effect.type === 'cost_reduction') {
    return `${((1 - effect.value) * 100).toFixed(1)}% cheaper`
  }
  return `+${(effect.value * 100).toFixed(1)}%`
}

function formatPenaltyValue(penalty: any): string {
  if (penalty.type === 'penalty_reduction') {
    return `${(penalty.value * 100).toFixed(1)}% reduced`
  }
  return `${(penalty.value * 100).toFixed(1)}% penalty`
}

// SVG icon loading functions
function getNebulaIconSVG(nebulaType: NebulaType): string {
  const icons = {
    stellar_nursery: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="nurseryGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ff6b6b" stop-opacity="1"/>
          <stop offset="100%" stop-color="#ff6b6b" stop-opacity="0.3"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="25" fill="url(#nurseryGrad)"/>
      <circle cx="30" cy="30" r="8" fill="#ffffff" opacity="0.9"/>
      <circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.7"/>
      <circle cx="40" cy="25" r="3" fill="#ffffff" opacity="0.7"/>
      <circle cx="25" cy="40" r="3" fill="#ffffff" opacity="0.7"/>
    </svg>`,
    planetary_nebula: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="planetaryGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#4ecdc4" stop-opacity="0.3"/>
          <stop offset="50%" stop-color="#4ecdc4" stop-opacity="1"/>
          <stop offset="100%" stop-color="#4ecdc4" stop-opacity="0.2"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="25" fill="none" stroke="url(#planetaryGrad)" stroke-width="8"/>
      <circle cx="30" cy="30" r="5" fill="#ffffff" opacity="0.9"/>
    </svg>`,
    supernova_remnant: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="supernovaGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#e74c3c" stop-opacity="1"/>
          <stop offset="70%" stop-color="#f39c12" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#e74c3c" stop-opacity="0.2"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="28" fill="url(#supernovaGrad)"/>
      <polygon points="30,10 35,20 45,20 37,28 40,38 30,33 20,38 23,28 15,20 25,20" fill="#ffffff" opacity="0.9"/>
    </svg>`,
    dark_nebula: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="darkGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#2c3e50" stop-opacity="1"/>
          <stop offset="100%" stop-color="#34495e" stop-opacity="0.3"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="25" fill="url(#darkGrad)"/>
      <circle cx="25" cy="25" r="2" fill="#9b59b6" opacity="0.8"/>
      <circle cx="35" cy="20" r="1.5" fill="#9b59b6" opacity="0.6"/>
      <circle cx="40" cy="35" r="2" fill="#9b59b6" opacity="0.7"/>
    </svg>`,
    reflection_nebula: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="reflectionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3498db" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#85c1e9" stop-opacity="1"/>
          <stop offset="100%" stop-color="#3498db" stop-opacity="0.4"/>
        </linearGradient>
      </defs>
      <ellipse cx="30" cy="30" rx="25" ry="20" fill="url(#reflectionGrad)"/>
      <circle cx="30" cy="30" r="6" fill="#ffffff" opacity="0.9"/>
      <path d="M15 25 L45 35" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
      <path d="M20 35 L40 25" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
    </svg>`,
    emission_nebula: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="emissionGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#e67e22" stop-opacity="1"/>
          <stop offset="60%" stop-color="#f39c12" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#e67e22" stop-opacity="0.2"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="26" fill="url(#emissionGrad)"/>
      <circle cx="30" cy="30" r="4" fill="#ffffff" opacity="1"/>
      <circle cx="20" cy="25" r="2" fill="#ffffff" opacity="0.8"/>
      <circle cx="40" cy="35" r="2" fill="#ffffff" opacity="0.8"/>
      <circle cx="35" cy="15" r="1.5" fill="#ffffff" opacity="0.7"/>
      <circle cx="15" cy="40" r="1.5" fill="#ffffff" opacity="0.7"/>
    </svg>`,
    absorption_nebula: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="absorptionGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#8e44ad" stop-opacity="0.3"/>
          <stop offset="50%" stop-color="#9b59b6" stop-opacity="1"/>
          <stop offset="100%" stop-color="#8e44ad" stop-opacity="0.1"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="27" fill="url(#absorptionGrad)"/>
      <circle cx="30" cy="30" r="15" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
      <circle cx="30" cy="30" r="8" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.4"/>
      <circle cx="30" cy="30" r="3" fill="#ffffff" opacity="0.8"/>
    </svg>`
  }
  return icons[nebulaType] || icons.stellar_nursery
}
</script>

<style scoped>
.nebula-coordination-container {
  position: relative;
  padding: 20px;
  background: linear-gradient(135deg, #0a0a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: 12px;
  color: #ffffff;
  min-height: 600px;
}

.nebula-background-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0.2;
  border-radius: 12px;
  overflow: hidden;
}

.nebula-particles {
  background: radial-gradient(2px 2px at 20px 30px, rgba(64, 224, 208, 0.3), transparent),
              radial-gradient(2px 2px at 40px 70px, rgba(100, 149, 237, 0.2), transparent),
              radial-gradient(1px 1px at 90px 40px, rgba(255, 255, 255, 0.3), transparent),
              radial-gradient(1px 1px at 130px 80px, rgba(64, 224, 208, 0.2), transparent);
  background-size: 200px 100px;
  animation: sparkle 8s linear infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}

.nebula-waves {
  background: linear-gradient(45deg, transparent 40%, rgba(64, 224, 208, 0.1) 50%, transparent 60%);
  background-size: 50px 50px;
  animation: waves 10s linear infinite;
}

@keyframes waves {
  0% { transform: translateX(-50px) translateY(-50px); }
  100% { transform: translateX(50px) translateY(50px); }
}

.nebula-glow {
  background: radial-gradient(circle at 20% 80%, rgba(64, 224, 208, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(100, 149, 237, 0.1) 0%, transparent 50%);
  animation: glow 6s ease-in-out infinite alternate;
}

@keyframes glow {
  0% { opacity: 0.1; }
  100% { opacity: 0.3; }
}

.nebula-particles,
.nebula-waves,
.nebula-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.section-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.8rem;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(64, 224, 208, 0.5);
}

.material-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.upgrade-interface {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.central-hub {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  margin: 0 auto;
}

.coordinator-center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  background: rgba(100, 149, 237, 0.2);
  border: 2px solid #6495ed;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 80px;
  height: 80px;
}

.coordinator-center.active {
  background: rgba(100, 149, 237, 0.4);
  box-shadow: 0 0 30px rgba(100, 149, 237, 0.8);
  animation: coordinatorPulse 2s ease-in-out infinite;
}

@keyframes coordinatorPulse {
  0%, 100% { box-shadow: 0 0 30px rgba(100, 149, 237, 0.8); }
  50% { box-shadow: 0 0 40px rgba(100, 149, 237, 1), 0 0 60px rgba(100, 149, 237, 0.6); }
}

.coordinator-center:hover {
  transform: scale(1.05);
  box-shadow: 0 0 25px rgba(100, 149, 237, 0.7);
}

.coordinator-icon svg {
  width: 24px;
  height: 24px;
  color: #6495ed;
}

.coordinator-label {
  font-size: 0.8rem;
  color: #6495ed;
  font-weight: bold;
}

.nebula-orbit-item {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 60px;
  height: 60px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nebula-orbit-item.unlocked {
  opacity: 1;
}

.nebula-orbit-item:not(.unlocked) {
  opacity: 0.4;
  cursor: not-allowed;
}

.nebula-orbit-item.active {
  transform: scale(1.2);
}

.nebula-orbit-item.active .nebula-icon {
  box-shadow: 0 0 20px rgba(64, 224, 208, 0.8);
  border-color: rgba(64, 224, 208, 0.8);
}

.nebula-orbit-item.unlocked:hover {
  transform: scale(1.1);
}

.nebula-orbit-item.unlocked:hover .nebula-icon {
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
}

.nebula-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  position: relative;
}

.nebula-icon::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent, rgba(64, 224, 208, 0.6), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: rotate 3s linear infinite;
}

.nebula-orbit-item:hover .nebula-icon::before,
.nebula-orbit-item.active .nebula-icon::before {
  opacity: 1;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.nebula-icon-svg {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nebula-icon-svg svg {
  width: 90%;
  height: 90%;
}

.nebula-label {
  font-size: 0.7rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.upgrade-tree-container {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.tree-title {
  text-align: center;
  margin-bottom: 20px;
  color: #40e0d0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tree-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: normal;
}

.upgrade-tree {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 20px;
  min-height: 400px;
}

.upgrade-tier {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  position: relative;
}

.upgrade-tier::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, rgba(64, 224, 208, 0.3) 20%, rgba(64, 224, 208, 0.8) 50%, rgba(64, 224, 208, 0.3) 80%, transparent 100%);
  border-radius: 1px;
}

.upgrade-tier:first-child::before {
  display: none;
}

.upgrade-tier:not(:first-child) {
  position: relative;
}

.upgrade-tier:not(:first-child)::after {
  content: 'Tier ' attr(data-tier);
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(64, 224, 208, 0.2);
  color: #40e0d0;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  border: 1px solid rgba(64, 224, 208, 0.4);
}

.upgrade-node {
  position: relative;
  display: flex;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  width: 320px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.upgrade-node::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 20px;
  background: linear-gradient(180deg, rgba(64, 224, 208, 0.6) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.upgrade-node:hover::before {
  opacity: 1;
}

.upgrade-node:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 40px rgba(64, 224, 208, 0.2);
}

.upgrade-node.purchased {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.1) 100%);
  border-color: #22c55e;
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.upgrade-node.purchased::after {
  content: '✓';
  position: absolute;
  top: 8px;
  right: 8px;
  color: #22c55e;
  font-weight: bold;
  font-size: 1.2rem;
  text-shadow: 0 0 8px rgba(34, 197, 94, 0.8);
}

.upgrade-node.available {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 100%);
  border-color: #3b82f6;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: availablePulse 2s ease-in-out infinite;
}

@keyframes availablePulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2); }
  50% { box-shadow: 0 4px 30px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3); }
}

.upgrade-node.locked {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.2) 0%, rgba(107, 114, 128, 0.1) 100%);
  border-color: #6b7280;
  cursor: not-allowed;
  opacity: 0.6;
  filter: grayscale(0.8);
}

.upgrade-node.locked::after {
  content: '🔒';
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0.7;
}

.upgrade-icon {
  margin-right: 15px;
}

.upgrade-category-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.upgrade-category-icon.unlock {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.3) 0%, rgba(255, 193, 7, 0.1) 100%);
  border-color: rgba(255, 193, 7, 0.5);
}

.upgrade-category-icon.bonus {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(76, 175, 80, 0.1) 100%);
  border-color: rgba(76, 175, 80, 0.5);
}

.upgrade-category-icon.penalty {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.3) 0%, rgba(33, 150, 243, 0.1) 100%);
  border-color: rgba(33, 150, 243, 0.5);
}

.upgrade-category-icon.special {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.3) 0%, rgba(156, 39, 176, 0.1) 100%);
  border-color: rgba(156, 39, 176, 0.5);
}

.upgrade-category-icon.component {
  background: linear-gradient(135deg, rgba(255, 87, 34, 0.3) 0%, rgba(255, 87, 34, 0.1) 100%);
  border-color: rgba(255, 87, 34, 0.5);
}

.upgrade-category-icon.global {
  background: linear-gradient(135deg, rgba(0, 188, 212, 0.3) 0%, rgba(0, 188, 212, 0.1) 100%);
  border-color: rgba(0, 188, 212, 0.5);
}

.category-icon-svg {
  width: 24px;
  height: 24px;
  color: currentColor;
}

.category-icon-svg svg {
  width: 100%;
  height: 100%;
}

.upgrade-content {
  flex: 1;
}

.upgrade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.upgrade-name {
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;
}

.upgrade-tier {
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 0.8rem;
}

.upgrade-description {
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.upgrade-cost {
  margin-bottom: 10px;
}

.cost-item {
  display: inline-block;
  margin-right: 15px;
  font-size: 0.8rem;
}

.cost-label {
  color: rgba(255, 255, 255, 0.7);
}

.cost-value {
  color: #40e0d0;
  font-weight: bold;
}

.upgrade-effects {
  margin-bottom: 10px;
}

.effect-item {
  font-size: 0.8rem;
  color: #22c55e;
  margin-bottom: 2px;
}

.upgrade-prerequisites {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.prereq-list {
  display: inline;
}

.prereq-item {
  margin-right: 10px;
}

.prereq-item.completed {
  color: #22c55e;
}

.component-interface {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.component-title {
  text-align: center;
  margin-bottom: 20px;
  color: #40e0d0;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.component-item {
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.component-name {
  font-size: 1rem;
  color: #ffffff;
}

.component-owned {
  font-weight: bold;
  color: #40e0d0;
}

.purchase-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.purchase-button {
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid #3b82f6;
  border-radius: 4px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.purchase-button:hover:not(.disabled) {
  background: rgba(59, 130, 246, 0.4);
}

.purchase-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.purchase-cost {
  font-size: 0.8rem;
  color: #40e0d0;
}

.effects-summary {
  margin-top: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.effects-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.bonuses-section h4 {
  color: #22c55e;
  margin-bottom: 10px;
}

.penalties-section h4 {
  color: #ef4444;
  margin-bottom: 10px;
}

.effect-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.effect-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.effect-item.bonus {
  border-left: 3px solid #22c55e;
}

.effect-item.penalty {
  border-left: 3px solid #ef4444;
}

.effect-value {
  font-weight: bold;
}

.effect-description {
  color: rgba(255, 255, 255, 0.8);
}
</style>