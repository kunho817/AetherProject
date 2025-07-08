<template>
  <div class="nebula-coordination-container">
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
        <span>Total Investment:</span>
        <span>{{ format(totalInvestment) }}</span>
      </div>
    </div>
    
    <!-- Detailed Nebula Visualization -->
    <div class="nebula-visualization">
      <div class="nebula-asset-container">
        <!-- Load appropriate nebula SVG asset -->
        <img 
          v-if="activeNebula" 
          :src="getNebulaAssetPath(activeNebula)" 
          :alt="getActiveConfig()?.name || 'Nebula'"
          class="nebula-asset"
        />
        
        <!-- Fallback simple visualization if no active nebula -->
        <svg v-else viewBox="0 0 400 300" class="nebula-svg">
          <defs>
            <radialGradient id="defaultGradient" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stop-color="#4a148c" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#1a0b42" stop-opacity="0.1" />
            </radialGradient>
          </defs>
          <ellipse cx="200" cy="150" rx="180" ry="120" fill="url(#defaultGradient)" />
          <text x="200" y="150" text-anchor="middle" fill="#fff" font-size="14" opacity="0.5">
            No Active Nebula
          </text>
        </svg>
        
        <!-- Overlay information -->
        <div class="nebula-overlay" v-if="activeNebula">
          <div class="perfect-indicator" v-if="getCentralComponent()?.isPerfect">
            ⭐ PERFECT CENTRAL COMPONENT
          </div>
          <div class="nebula-name-overlay">{{ getActiveConfig()?.name }}</div>
        </div>
      </div>
    </div>
    
    <!-- Active Nebula Display -->
    <div class="active-nebula-section" v-if="activeNebula">
      <h3 class="subsection-title">Active Nebula</h3>
      <div class="nebula-display">
        <div class="nebula-info">
          <div class="nebula-name">{{ getActiveConfig()?.name }}</div>
          <div class="nebula-description">{{ getActiveConfig()?.description }}</div>
          <div class="perfect-status">
            <span v-if="getCentralComponent()?.isPerfect" class="perfect-central">
              ⭐ Central Component Perfect: 3x Bonus!
            </span>
            <span class="perfect-count">
              {{ getPerfectCount() }}/7 Components Perfect (+{{ (getPerfectCount() * 20) }}% bonus, -{{ (getPerfectCount() * 10) }}% penalty)
            </span>
          </div>
        </div>
        <div class="nebula-effects">
          <div class="bonuses" v-if="currentBonuses.length > 0">
            <h4>Bonuses:</h4>
            <div 
              v-for="bonus in currentBonuses" 
              :key="bonus.type + bonus.target"
              class="effect-item bonus"
            >
              <span class="effect-value">+{{ formatEffectValue(bonus) }}</span>
              <span class="effect-description">{{ bonus.description }}</span>
            </div>
          </div>
          <div class="penalties" v-if="currentPenalties.length > 0">
            <h4>Penalties:</h4>
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
        <button class="btn btn-secondary" @click="nebulaStore.deactivateNebula">
          Deactivate Nebula
        </button>
      </div>
    </div>
    
    <!-- Interstellar Agglomerator Investment -->
    <div class="investment-section">
      <h3 class="subsection-title">
        Interstellar Agglomerator
        <button 
          v-if="totalInvestment.gt(0)"
          class="btn btn-secondary btn-small reset-btn"
          @click="nebulaStore.resetInvestments"
        >
          Reset (50% refund)
        </button>
      </h3>
      
      <!-- Single Agglomerator Status -->
      <div class="agglomerator-status">
        <div class="agglomerator-info">
          <div class="agglomerator-header">
            <div class="agglomerator-name">
              Interstellar Agglomerator Level {{ agglomerator.level }}
            </div>
            <div class="agglomerator-efficiency">
              {{ (agglomerator.efficiency * 100).toFixed(0) }}% Efficiency
            </div>
          </div>
          
          <div class="agglomerator-stats">
            <div class="stat-item">
              <span>Total Invested:</span>
              <span>{{ format(agglomerator.totalInvestedNM) }} NM</span>
            </div>
            <div class="stat-item">
              <span>Total Allocated:</span>
              <span>{{ format(totalAllocated) }} NM</span>
            </div>
            <div class="stat-item">
              <span>Available for Allocation:</span>
              <span>{{ format(availableAllocation) }} NM</span>
            </div>
          </div>
          
          <!-- Investment Controls -->
          <div class="investment-controls">
            <div class="investment-buttons">
              <button 
                class="btn btn-secondary btn-small invest-btn"
                @click="investInAgglomerator(1)"
                :disabled="!canInvestInAgglomerator(1)"
              >
                +1 NM
              </button>
              <button 
                class="btn btn-secondary btn-small invest-btn"
                @click="investInAgglomerator(10)"
                :disabled="!canInvestInAgglomerator(10)"
              >
                +10 NM
              </button>
              <button 
                class="btn btn-secondary btn-small invest-btn"
                @click="investInAgglomerator(100)"
                :disabled="!canInvestInAgglomerator(100)"
              >
                +100 NM
              </button>
              <button 
                class="btn btn-secondary btn-small invest-btn"
                @click="investInAgglomeratorPercent(0.1)"
                :disabled="!canInvestInAgglomerator(nebulaMaterial * 0.1)"
              >
                +10%
              </button>
              <button 
                class="btn btn-secondary btn-small invest-btn"
                @click="investInAgglomeratorPercent(0.5)"
                :disabled="!canInvestInAgglomerator(nebulaMaterial * 0.5)"
              >
                +50%
              </button>
              <button 
                class="btn btn-secondary btn-small invest-btn invest-max"
                @click="investInAgglomeratorMax()"
                :disabled="nebulaMaterial <= 0"
              >
                MAX
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Component Allocation -->
      <div class="component-allocation-section">
        <h4 class="subsection-title">Component Allocation</h4>
        <div class="components-grid">
          <div 
            v-for="allocation in componentAllocations"
            :key="allocation.component"
            class="component-card"
            :class="{ 'perfect': allocation.isPerfect, 'central': isComponentCentral(allocation.component) }"
          >
            <div class="component-header">
              <div class="component-name">
                {{ formatComponentName(allocation.component) }}
                <span v-if="allocation.isPerfect" class="perfect-indicator">✦</span>
                <span v-if="isComponentCentral(allocation.component)" class="central-indicator">⭐</span>
              </div>
              <div class="component-proportion">
                {{ allocation.proportion.toFixed(1) }}%
                <span v-if="getPerfectRatio(allocation.component)" class="perfect-ratio">
                  ({{ getPerfectRatio(allocation.component) }}% perfect)
                </span>
              </div>
            </div>
            
            <div class="component-stats">
              <div class="allocated-amount">
                Allocated: {{ format(allocation.allocatedNM) }} NM
              </div>
            </div>
            
            <!-- Allocation Controls -->
            <div class="allocation-controls">
              <!-- Allocation Slider -->
              <div class="allocation-slider">
                <input 
                  type="range" 
                  :min="0" 
                  :max="getMaxAllocation(allocation.component)"
                  :value="getSliderValue(allocation.component)"
                  @input="setComponentAllocation(allocation.component, parseInt(($event.target as HTMLInputElement).value))"
                  class="slider"
                />
                <div class="slider-labels">
                  <span>0</span>
                  <span>{{ getSliderLabel(allocation.component) }}</span>
                </div>
              </div>
              
              <!-- Allocation Buttons -->
              <div class="allocation-buttons">
                <button 
                  class="btn btn-secondary btn-small allocate-btn"
                  @click="allocateToComponent(allocation.component, 1)"
                  :disabled="!canAllocateToComponent(allocation.component, 1)"
                >
                  +1
                </button>
                <button 
                  class="btn btn-secondary btn-small allocate-btn"
                  @click="allocateToComponent(allocation.component, 10)"
                  :disabled="!canAllocateToComponent(allocation.component, 10)"
                >
                  +10
                </button>
                <button 
                  class="btn btn-secondary btn-small allocate-btn"
                  @click="allocateToComponent(allocation.component, 100)"
                  :disabled="!canAllocateToComponent(allocation.component, 100)"
                >
                  +100
                </button>
                <button 
                  class="btn btn-secondary btn-small allocate-btn allocate-max"
                  @click="allocateMaxToComponent(allocation.component)"
                  :disabled="availableAllocation.lte(0)"
                >
                  MAX
                </button>
              </div>
            </div>
            
            <div class="component-bar">
              <div 
                class="component-fill" 
                :style="{ width: allocation.proportion + '%', background: getComponentColor(allocation.component) }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Discovered Nebulae -->
    <div class="discovered-nebulae" v-if="discoveredNebulae.length > 0">
      <h3 class="subsection-title">Discovered Nebulae</h3>
      <div class="nebula-list">
        <div 
          v-for="nebulaType in discoveredNebulae"
          :key="nebulaType"
          :class="['nebula-item', { active: activeNebula === nebulaType }]"
          @click="nebulaStore.activateNebula(nebulaType)"
        >
          <div class="nebula-name">{{ getNebulaConfig(nebulaType)?.name }}</div>
          <div class="nebula-requirements">
            <span class="central-comp">
              Central: {{ formatComponentName(getNebulaConfig(nebulaType)?.centralComponent || NebulaComponent.HYDROGEN) }}
            </span>
            <span 
              v-for="req in getNebulaConfig(nebulaType)?.requirements"
              :key="req.component"
              class="requirement"
            >
              {{ formatComponentName(req.component) }}: {{ req.minPercent }}-{{ req.maxPercent }}%
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Perfect Ratios Guide -->
    <div class="perfect-ratios-guide">
      <h3 class="subsection-title">Perfect Ratios Guide</h3>
      <div class="guide-text">
        Each nebula has perfect component ratios. Achieving perfect ratios provides massive bonuses and reduces penalties.
        The central component provides 3x bonus when perfect. All perfect components add +20% bonus and -10% penalty each.
      </div>
      <div class="ratio-display" v-if="activeNebula">
        <h4>{{ getActiveConfig()?.name }} Perfect Ratios:</h4>
        <div class="ratio-grid">
          <div 
            v-for="ratio in getActiveConfig()?.perfectRatios"
            :key="ratio.component"
            class="ratio-item"
            :class="{ 'central': ratio.component === getActiveConfig()?.centralComponent }"
          >
            <span class="ratio-component">{{ formatComponentName(ratio.component) }}</span>
            <span class="ratio-value">{{ ratio.ratio }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNebulaStore } from '@/stores/nebula'
import { format } from '@/utils/formatting'
import { NebulaComponent, NebulaType, type NebulaConfiguration } from '@/types/nebula'

const nebulaStore = useNebulaStore()

const { 
  nebulaMaterial,
  agglomerator,
  componentAllocations,
  activeNebula,
  discoveredNebulae,
  nebulaConfigurations,
  totalInvestment,
  totalAllocated,
  availableAllocation,
  materialProductionRate,
  currentBonuses,
  currentPenalties
} = storeToRefs(nebulaStore)

function formatComponentName(component: NebulaComponent): string {
  return component.charAt(0).toUpperCase() + component.slice(1)
}

function getComponentColor(component: NebulaComponent): string {
  const colors = {
    [NebulaComponent.HYDROGEN]: '#ff6b6b',
    [NebulaComponent.HELIUM]: '#4ecdc4',
    [NebulaComponent.CARBON]: '#45b7d1',
    [NebulaComponent.NITROGEN]: '#96ceb4',
    [NebulaComponent.OXYGEN]: '#ffa726',
    [NebulaComponent.SILICON]: '#ba68c8',
    [NebulaComponent.IRON]: '#f06292'
  }
  return colors[component] || '#666'
}

function getNebulaAssetPath(nebulaType: NebulaType): string {
  const assetMap = {
    [NebulaType.STELLAR_NURSERY]: '/src/assets/nebulae/stellar-nursery.svg',
    [NebulaType.PLANETARY_NEBULA]: '/src/assets/nebulae/planetary-nebula.svg',
    [NebulaType.SUPERNOVA_REMNANT]: '/src/assets/nebulae/supernova-remnant.svg',
    [NebulaType.DARK_NEBULA]: '/src/assets/nebulae/dark-nebula.svg',
    [NebulaType.REFLECTION_NEBULA]: '/src/assets/nebulae/reflection-nebula.svg',
    [NebulaType.EMISSION_NEBULA]: '/src/assets/nebulae/emission-nebula.svg',
    [NebulaType.ABSORPTION_NEBULA]: '/src/assets/nebulae/absorption-nebula.svg'
  }
  return assetMap[nebulaType] || '/src/assets/nebulae/stellar-nursery.svg'
}

function getActiveConfig(): NebulaConfiguration | undefined {
  return nebulaConfigurations.value.find(config => config.type === activeNebula.value)
}

function getCentralComponent() {
  const config = getActiveConfig()
  if (!config) return null
  return componentAllocations.value.find(c => c.component === config.centralComponent)
}

function getPerfectCount(): number {
  return componentAllocations.value.filter(c => c.isPerfect).length
}

function isComponentCentral(component: NebulaComponent): boolean {
  return getActiveConfig()?.centralComponent === component
}

function getPerfectRatio(component: NebulaComponent): number | null {
  const config = getActiveConfig()
  if (!config) return null
  
  const ratio = config.perfectRatios.find(r => r.component === component)
  return ratio ? ratio.ratio : null
}

function getNebulaConfig(type: NebulaType): NebulaConfiguration | undefined {
  return nebulaConfigurations.value.find(config => config.type === type)
}

function formatEffectValue(effect: any): string {
  if (effect.type === 'production_multiplier') {
    return `${effect.scaledValue.toFixed(1)}× ${effect.target}`
  } else if (effect.type === 'cost_reduction') {
    return `${((1 - effect.scaledValue) * 100).toFixed(0)}% ${effect.target} cost reduction`
  } else if (effect.type === 'starecho_threshold') {
    return `${effect.scaledValue.toFixed(1)}× Star Echo threshold`
  }
  return `${effect.scaledValue.toFixed(1)} ${effect.target}`
}

function formatPenaltyValue(penalty: any): string {
  if (penalty.type === 'production_reduction') {
    return `-${((1 - penalty.scaledValue) * 100).toFixed(0)}% ${penalty.target} production`
  } else if (penalty.type === 'cost_increase') {
    return `+${((penalty.scaledValue - 1) * 100).toFixed(0)}% ${penalty.target} costs`
  }
  return `-${penalty.scaledValue.toFixed(1)} ${penalty.target}`
}

// Agglomerator investment helper functions
function canInvestInAgglomerator(amount: number): boolean {
  return nebulaMaterial.value >= amount
}

function investInAgglomerator(amount: number): void {
  if (!canInvestInAgglomerator(amount)) return
  nebulaStore.investInAgglomerator(amount)
}

function investInAgglomeratorPercent(percent: number): void {
  const amount = Math.floor(nebulaMaterial.value * percent)
  investInAgglomerator(amount)
}

function investInAgglomeratorMax(): void {
  const amount = nebulaMaterial.value
  investInAgglomerator(amount)
}

// Component allocation helper functions
function canAllocateToComponent(component: NebulaComponent, amount: number): boolean {
  return nebulaStore.canAllocateToComponent(component, amount)
}

function allocateToComponent(component: NebulaComponent, amount: number): void {
  const allocation = componentAllocations.value.find(a => a.component === component)
  if (!allocation) return
  
  const newAmount = allocation.allocatedNM.add(amount).toNumber()
  nebulaStore.allocateToComponent(component, newAmount)
}

function allocateMaxToComponent(component: NebulaComponent): void {
  const allocation = componentAllocations.value.find(a => a.component === component)
  if (!allocation) return
  
  const currentAllocation = allocation.allocatedNM.toNumber()
  const maxAllocation = currentAllocation + availableAllocation.value.toNumber()
  nebulaStore.allocateToComponent(component, maxAllocation)
}

// Slider helper functions
function getMaxAllocation(component: NebulaComponent): number {
  const allocation = componentAllocations.value.find(a => a.component === component)
  if (!allocation) return 0
  
  const currentAllocation = allocation.allocatedNM.toNumber()
  const available = availableAllocation.value.toNumber()
  
  // Max allocation is current allocation + available allocation
  const maxValue = Math.max(0, currentAllocation + available)
  
  // For very large numbers, cap at a reasonable slider value and use percentage-based scaling
  if (maxValue > 10000) {
    return 10000 // Use scaled slider, handled in setComponentAllocation
  }
  
  return maxValue
}

function getSliderValue(component: NebulaComponent): number {
  const allocation = componentAllocations.value.find(a => a.component === component)
  if (!allocation) return 0
  
  const currentAllocation = allocation.allocatedNM.toNumber()
  const available = availableAllocation.value.toNumber()
  const maxPossible = currentAllocation + available
  
  if (maxPossible > 10000) {
    // For large numbers, return percentage-based slider value
    const percentage = currentAllocation / maxPossible
    return Math.floor(percentage * 10000)
  } else {
    // For smaller numbers, return direct value
    return currentAllocation
  }
}

function getSliderLabel(component: NebulaComponent): string {
  const allocation = componentAllocations.value.find(a => a.component === component)
  if (!allocation) return "0"
  
  const currentAllocation = allocation.allocatedNM.toNumber()
  const available = availableAllocation.value.toNumber()
  const maxPossible = currentAllocation + available
  
  if (maxPossible > 10000) {
    return "100% (scaled)"
  } else {
    return maxPossible.toString()
  }
}

function setComponentAllocation(component: NebulaComponent, sliderValue: number): void {
  const allocation = componentAllocations.value.find(a => a.component === component)
  if (!allocation) return
  
  const currentAllocation = allocation.allocatedNM.toNumber()
  const available = availableAllocation.value.toNumber()
  const maxPossible = currentAllocation + available
  
  let actualAmount: number
  
  if (maxPossible > 10000) {
    // For large numbers, use percentage-based scaling
    const percentage = sliderValue / 10000
    actualAmount = Math.floor(maxPossible * percentage)
  } else {
    // For smaller numbers, use direct value
    actualAmount = sliderValue
  }
  
  nebulaStore.allocateToComponent(component, actualAmount)
}

// All store functions are accessed directly via nebulaStore
</script>

<style scoped>
.nebula-coordination-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: linear-gradient(135deg, 
    rgba(157, 78, 221, 0.1) 0%, 
    rgba(58, 12, 163, 0.1) 25%,
    rgba(29, 78, 216, 0.1) 50%,
    rgba(147, 51, 234, 0.1) 75%,
    rgba(168, 85, 247, 0.1) 100%
  );
  border: 1px solid rgba(157, 78, 221, 0.3);
  border-radius: 12px;
  box-shadow: 
    0 0 20px rgba(157, 78, 221, 0.2),
    inset 0 0 20px rgba(147, 51, 234, 0.1);
  position: relative;
  padding: 20px;
  overflow-y: auto;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-green);
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-purple);
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reset-btn {
  font-size: 12px;
  padding: 4px 12px;
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

.material-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(157, 78, 221, 0.3);
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

.nebula-visualization {
  background: radial-gradient(circle at center, rgba(74, 20, 140, 0.3) 0%, rgba(26, 5, 84, 0.5) 100%);
  border: 1px solid rgba(157, 78, 221, 0.4);
  border-radius: 12px;
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.nebula-asset-container {
  position: relative;
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nebula-asset {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 15px rgba(157, 78, 221, 0.5));
  transition: filter 0.3s ease;
}

.nebula-asset:hover {
  filter: drop-shadow(0 0 20px rgba(157, 78, 221, 0.7));
}

.nebula-svg {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 0 10px rgba(157, 78, 221, 0.5));
}

.nebula-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: none;
  z-index: 2;
}

.perfect-indicator {
  background: rgba(255, 215, 0, 0.9);
  color: #000;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.nebula-name-overlay {
  background: rgba(0, 0, 0, 0.7);
  color: var(--accent-purple);
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.active-nebula-section {
  background: rgba(147, 51, 234, 0.1);
  border: 1px solid var(--accent-purple);
  border-radius: 8px;
  padding: 15px;
}

.perfect-status {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.perfect-central {
  color: #ffd700;
  font-weight: 600;
}

.perfect-count {
  color: var(--accent-green);
  font-size: 14px;
}

.investment-section {
  flex: 1;
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.component-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
}

.component-card.perfect {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.component-card.central {
  border-color: var(--accent-purple);
  background: rgba(147, 51, 234, 0.1);
}

.component-card.perfect.central {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.15);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.component-name {
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 5px;
}

.perfect-indicator {
  color: #ffd700;
}

.central-indicator {
  color: var(--accent-purple);
}

.component-proportion {
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
  color: var(--accent-blue);
  font-size: 12px;
}

.agglomerator-level {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
  color: var(--accent-green);
  font-size: 11px;
  margin-top: 2px;
}

.perfect-ratio {
  color: var(--accent-green);
  font-size: 10px;
}

.investment-controls {
  margin: 15px 0;
}

.investment-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.invest-btn {
  font-size: 11px;
  padding: 4px 8px;
  background: rgba(157, 78, 221, 0.2);
  border: 1px solid rgba(157, 78, 221, 0.5);
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 40px;
}

.invest-btn:hover:not(:disabled) {
  background: rgba(157, 78, 221, 0.4);
  border-color: rgba(157, 78, 221, 0.8);
}

.invest-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.invest-max {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.5);
}

.invest-max:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.4);
  border-color: rgba(34, 197, 94, 0.8);
}

.agglomerator-status {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(157, 78, 221, 0.3);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.agglomerator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.agglomerator-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-purple);
}

.agglomerator-efficiency {
  font-size: 14px;
  color: var(--accent-green);
  font-family: 'Roboto Mono', monospace;
}

.agglomerator-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.component-allocation-section {
  margin-top: 20px;
}

.allocation-controls {
  margin: 15px 0;
}

.allocation-slider {
  margin-bottom: 10px;
}

.allocation-slider .slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(34, 197, 94, 0.2);
  outline: none;
  -webkit-appearance: none;
}

.allocation-slider .slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent-green);
  cursor: pointer;
}

.allocation-slider .slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent-green);
  cursor: pointer;
  border: none;
}

.allocation-slider .slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 5px;
}

.allocation-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.allocate-btn {
  font-size: 11px;
  padding: 4px 8px;
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.5);
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 40px;
}

.allocate-btn:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.4);
  border-color: rgba(34, 197, 94, 0.8);
}

.allocate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.allocate-max {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.5);
}

.allocate-max:hover:not(:disabled) {
  background: rgba(255, 215, 0, 0.4);
  border-color: rgba(255, 215, 0, 0.8);
}

.allocated-amount {
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  color: var(--accent-green);
}

.component-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 10px;
}

.component-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.perfect-ratios-guide {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 15px;
}

.ratio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.ratio-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  border: 1px solid var(--border-secondary);
}

.ratio-item.central {
  border-color: var(--accent-purple);
  background: rgba(147, 51, 234, 0.1);
}

.ratio-component {
  font-size: 12px;
  color: var(--text-secondary);
}

.ratio-value {
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
  color: var(--accent-green);
}

.guide-text {
  color: var(--text-secondary);
  margin-bottom: 15px;
  line-height: 1.4;
}

.discovered-nebulae {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 15px;
}

.nebula-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nebula-item {
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nebula-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nebula-item.active {
  border-color: var(--accent-purple);
  background: rgba(147, 51, 234, 0.2);
}

.nebula-requirements {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 5px;
}

.central-comp {
  color: var(--accent-purple);
  font-weight: 600;
}

.requirement {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.nebula-display {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.nebula-info {
  text-align: center;
}

.nebula-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-purple);
  margin-bottom: 5px;
}

.nebula-description {
  color: var(--text-secondary);
  font-style: italic;
}

.nebula-effects {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.bonuses h4, .penalties h4 {
  font-size: 14px;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.effect-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 5px;
}

.effect-item.bonus {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.effect-item.penalty {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.effect-value {
  font-weight: 600;
  font-family: 'Roboto Mono', monospace;
}

.effect-item.bonus .effect-value {
  color: var(--accent-green);
}

.effect-item.penalty .effect-value {
  color: #ef4444;
}

.effect-description {
  font-size: 12px;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .nebula-coordination-container {
    padding: 15px;
  }
  
  .components-grid {
    grid-template-columns: 1fr;
  }
  
  .nebula-effects {
    grid-template-columns: 1fr;
  }
  
  .material-stats {
    flex-direction: column;
    gap: 10px;
  }
}
</style>