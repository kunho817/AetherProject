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
    
    <!-- Nebula Selection and Information Panel -->
    <div class="nebula-main-section">
      <!-- Left: Circular Orbit Nebula Selection -->
      <div class="nebula-orbit-container">
        <div class="nebula-orbit">
          <!-- Central Active Nebula -->
          <div class="nebula-center">
            <div 
              v-if="activeNebula"
              class="nebula-icon active-nebula-icon"
              @click="selectedNebula = activeNebula"
            >
              <img 
                :src="getNebulaIconPath(activeNebula)" 
                :alt="getActiveConfig()?.name || 'Nebula'"
                class="nebula-icon-img"
              />
              <div class="nebula-icon-name">{{ getActiveConfig()?.name }}</div>
            </div>
            <div v-else class="nebula-icon empty-nebula-icon">
              <div class="empty-nebula-text">No Active Nebula</div>
            </div>
          </div>
          
          <!-- Orbiting Nebula Icons -->
          <div 
            v-for="(nebulaType, index) in allNebulaTypes"
            :key="nebulaType"
            :class="[
              'nebula-orbit-item',
              { 
                'discovered': discoveredNebulae.includes(nebulaType),
                'active': activeNebula === nebulaType,
                'selected': selectedNebula === nebulaType
              }
            ]"
            :style="getOrbitPosition(index)"
            :data-nebula-type="nebulaType"
            @click="selectNebula(nebulaType)"
          >
            <div class="nebula-icon">
              <img 
                :src="getNebulaIconPath(nebulaType)" 
                :alt="getNebulaConfig(nebulaType)?.name"
                class="nebula-icon-img"
                :class="{ 'disabled': !discoveredNebulae.includes(nebulaType) && activeNebula !== nebulaType }"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right: Nebula Information Panel -->
      <div class="nebula-info-panel">
        <div v-if="selectedNebula" class="nebula-details">
          <h3 class="nebula-info-title">{{ getNebulaConfig(selectedNebula)?.name }}</h3>
          <p class="nebula-info-description">{{ getNebulaConfig(selectedNebula)?.description }}</p>
          
          <!-- Active Status Integration -->
          <div v-if="selectedNebula === activeNebula" class="nebula-status-section">
            <h4>Nebula Status - Currently Active</h4>
            <div class="active-status-content">
              <div class="perfect-status">
                <span v-if="getCentralComponent()?.isPerfect" class="perfect-central">
                  ⭐ Central Component Perfect: 3x Bonus!
                </span>
                <span class="perfect-count">
                  {{ getPerfectCount() }}/7 Components Perfect (+{{ (getPerfectCount() * 20) }}% bonus, -{{ (getPerfectCount() * 10) }}% penalty)
                </span>
              </div>
              <div class="active-effects-summary">
                <div class="bonuses-summary" v-if="currentBonuses.length > 0">
                  <span class="effect-label">Active Bonuses:</span>
                  <span class="effect-count">{{ currentBonuses.length }}</span>
                </div>
                <div class="penalties-summary" v-if="currentPenalties.length > 0">
                  <span class="effect-label">Active Penalties:</span>
                  <span class="effect-count">{{ currentPenalties.length }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Activation Requirements -->
          <div class="nebula-activation-section">
            <h4>Activation Requirements</h4>
            <div class="activation-requirements">
              <div class="requirement-item central-requirement">
                <span class="requirement-label">Central Component:</span>
                <span class="requirement-value">{{ formatComponentName(getNebulaConfig(selectedNebula)?.centralComponent || NebulaComponent.HYDROGEN) }}</span>
              </div>
              <div 
                v-for="req in getNebulaConfig(selectedNebula)?.requirements"
                :key="req.component"
                class="requirement-item"
              >
                <span class="requirement-label">{{ formatComponentName(req.component) }}:</span>
                <span class="requirement-value">{{ req.minPercent }}-{{ req.maxPercent }}%</span>
              </div>
            </div>
          </div>
          
          <!-- Nebula Effects -->
          <div class="nebula-effects-section">
            <h4 v-if="selectedNebula === activeNebula">Current Active Effects</h4>
            <h4 v-else>Effects When Active</h4>
            <div class="effects-grid">
              <div class="effects-column">
                <h5 class="effects-subtitle bonuses-title">Bonuses</h5>
                <div v-if="selectedNebula === activeNebula && currentBonuses.length > 0">
                  <div 
                    v-for="bonus in currentBonuses" 
                    :key="bonus.type + bonus.target"
                    class="effect-item bonus-item active-effect"
                  >
                    <span class="effect-icon">+</span>
                    <span class="effect-text">{{ formatEffectValue(bonus) }} {{ bonus.description }}</span>
                  </div>
                </div>
                <div v-else>
                  <div 
                    v-for="bonus in getNebulaConfig(selectedNebula)?.bonuses" 
                    :key="bonus.type + bonus.target"
                    class="effect-item bonus-item"
                  >
                    <span class="effect-icon">+</span>
                    <span class="effect-text">{{ formatEffectDescription(bonus) }}</span>
                  </div>
                </div>
              </div>
              <div class="effects-column">
                <h5 class="effects-subtitle penalties-title">Penalties</h5>
                <div v-if="selectedNebula === activeNebula && currentPenalties.length > 0">
                  <div 
                    v-for="penalty in currentPenalties" 
                    :key="penalty.type + penalty.target"
                    class="effect-item penalty-item active-effect"
                  >
                    <span class="effect-icon">-</span>
                    <span class="effect-text">{{ formatPenaltyValue(penalty) }} {{ penalty.description }}</span>
                  </div>
                </div>
                <div v-else>
                  <div 
                    v-for="penalty in getNebulaConfig(selectedNebula)?.penalties" 
                    :key="penalty.type + penalty.target"
                    class="effect-item penalty-item"
                  >
                    <span class="effect-icon">-</span>
                    <span class="effect-text">{{ formatEffectDescription(penalty) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Perfect Ratio Info -->
          <div class="perfect-ratio-info">
            <h4>Perfect Component Ratios</h4>
            <div class="perfect-ratio-grid">
              <div 
                v-for="ratio in getNebulaConfig(selectedNebula)?.perfectRatios"
                :key="ratio.component"
                class="perfect-ratio-item"
                :class="{ 'central': ratio.component === getNebulaConfig(selectedNebula)?.centralComponent }"
              >
                <span class="ratio-component-name">{{ formatComponentName(ratio.component) }}</span>
                <span class="ratio-percentage">{{ ratio.ratio }}%</span>
              </div>
            </div>
            <div class="perfect-bonus-note">
              <p>Perfect ratios provide:</p>
              <ul>
                <li>Central component: <strong>3x bonus multiplier</strong></li>
                <li>Each perfect component: <strong>+20% bonus, -10% penalty</strong></li>
              </ul>
            </div>
          </div>
          
          <!-- Activation Button -->
          <div class="activation-controls" v-if="discoveredNebulae.includes(selectedNebula) && selectedNebula !== activeNebula">
            <button 
              class="btn btn-primary activate-nebula-btn"
              @click="nebulaStore.activateNebula(selectedNebula)"
            >
              Activate {{ getNebulaConfig(selectedNebula)?.name }}
            </button>
          </div>
          <div class="activation-status" v-else-if="selectedNebula === activeNebula">
            <span class="status-active">Currently Active</span>
          </div>
        </div>
        <div v-else class="no-selection">
          <p>Click on a nebula to view its details</p>
        </div>
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
        <h4 class="subsection-title">
          Component Allocation
          <div class="allocation-quick-actions">
            <button 
              class="btn btn-secondary btn-small quick-action-btn"
              @click="balanceAllocations"
              :disabled="totalAllocated.lte(0)"
              title="Balance all components equally"
            >
              Balance
            </button>
            <button 
              class="btn btn-secondary btn-small quick-action-btn"
              @click="tryPerfectRatio"
              :disabled="!activeNebula || totalAllocated.lte(0)"
              title="Attempt perfect ratio for active nebula"
            >
              Perfect Ratio
            </button>
          </div>
        </h4>
        <div class="components-grid">
          <div 
            v-for="allocation in componentAllocations"
            :key="allocation.component"
            class="component-card"
            :class="{ 
              'perfect': allocation.isPerfect, 
              'central': isComponentCentral(allocation.component),
              'near-perfect': isNearPerfect(allocation.component)
            }"
          >
            <div class="component-header">
              <div class="component-name">
                {{ formatComponentName(allocation.component) }}
                <span v-if="allocation.isPerfect" class="perfect-indicator" title="Perfect ratio achieved!">✦</span>
                <span v-if="isComponentCentral(allocation.component)" class="central-indicator" title="Central component">⭐</span>
              </div>
              <div class="component-proportion">
                <span class="current-proportion">{{ allocation.proportion.toFixed(1) }}%</span>
                <span v-if="getPerfectRatio(allocation.component)" class="perfect-ratio">
                  <span class="ratio-separator">→</span>
                  <span class="target-ratio" :class="{ 'achieved': allocation.isPerfect }">{{ getPerfectRatio(allocation.component) }}%</span>
                </span>
              </div>
            </div>
            
            <div class="component-stats">
              <div class="allocated-amount">
                <span class="amount-label">Proportion:</span>
                <span class="amount-value">{{ allocation.proportion.toFixed(1) }}%</span>
              </div>
              <div v-if="getPerfectRatio(allocation.component)" class="perfect-hint">
                <span v-if="allocation.proportion < getPerfectRatio(allocation.component) - 0.5" class="need-more">
                  Target: {{ getPerfectRatio(allocation.component) }}%
                </span>
                <span v-else-if="allocation.proportion > getPerfectRatio(allocation.component) + 0.5" class="need-less">
                  Target: {{ getPerfectRatio(allocation.component) }}%
                </span>
                <span v-else class="perfect-achieved">
                  Perfect! ✨
                </span>
              </div>
            </div>
            
            <!-- Allocation Controls -->
            <div class="allocation-controls">
              <!-- Quick Adjustment Buttons -->
              <div class="quick-adjust-buttons">
                <button 
                  class="btn btn-secondary btn-small adjust-btn decrease-btn"
                  @click="adjustAllocation(allocation.component, -10)"
                  :disabled="allocation.allocatedNM.lte(0)"
                  title="Decrease by 10%"
                >
                  -10%
                </button>
                <button 
                  class="btn btn-secondary btn-small adjust-btn decrease-btn"
                  @click="adjustAllocation(allocation.component, -1)"
                  :disabled="allocation.allocatedNM.lte(0)"
                  title="Decrease by 1%"
                >
                  -1%
                </button>
                <button 
                  class="btn btn-secondary btn-small adjust-btn perfect-btn"
                  @click="setPerfectForComponent(allocation.component)"
                  :disabled="!canSetPerfect(allocation.component)"
                  title="Set to perfect ratio"
                >
                  Perfect
                </button>
                <button 
                  class="btn btn-secondary btn-small adjust-btn increase-btn"
                  @click="adjustAllocation(allocation.component, 1)"
                  :disabled="availableAllocation.lte(0)"
                  title="Increase by 1%"
                >
                  +1%
                </button>
                <button 
                  class="btn btn-secondary btn-small adjust-btn increase-btn"
                  @click="adjustAllocation(allocation.component, 10)"
                  :disabled="availableAllocation.lte(0)"
                  title="Increase by 10%"
                >
                  +10%
                </button>
              </div>
              
              <!-- Allocation Slider -->
              <div class="allocation-slider enhanced-slider">
                <div class="slider-track">
                  <div 
                    v-if="getPerfectRatio(allocation.component)"
                    class="perfect-ratio-marker"
                    :style="{ left: getPerfectMarkerPosition(allocation.component) + '%' }"
                  >
                    <div class="marker-line"></div>
                    <div class="marker-label">{{ getPerfectRatio(allocation.component) }}%</div>
                  </div>
                  <input 
                    type="range" 
                    :min="0" 
                    :max="getMaxAllocation(allocation.component)"
                    :value="getSliderValue(allocation.component)"
                    @input="setComponentAllocation(allocation.component, parseInt(($event.target as HTMLInputElement).value))"
                    class="slider"
                    :class="{ 'near-perfect': isNearPerfect(allocation.component) }"
                  />
                </div>
                <div class="slider-labels">
                  <span>0%</span>
                  <span class="current-value">{{ allocation.proportion.toFixed(1) }}%</span>
                  <span>100%</span>
                </div>
              </div>
              
            </div>
            
            <div class="component-bar-container">
              <div class="component-bar">
                <div 
                  class="component-fill" 
                  :style="{ 
                    width: allocation.proportion + '%', 
                    background: getComponentColor(allocation.component),
                    boxShadow: allocation.isPerfect ? `0 0 10px ${getComponentColor(allocation.component)}` : 'none'
                  }"
                >
                  <span v-if="allocation.proportion > 5" class="bar-percentage">{{ allocation.proportion.toFixed(0) }}%</span>
                </div>
                <div 
                  v-if="getPerfectRatio(allocation.component)"
                  class="perfect-ratio-line"
                  :style="{ left: getPerfectRatio(allocation.component) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
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

// Local state for UI
const selectedNebula = ref<NebulaType | null>(activeNebula.value)
const allNebulaTypes = Object.values(NebulaType)

// Watch for changes in active nebula to auto-select it
watch(activeNebula, (newActiveNebula, oldActiveNebula) => {
  if (newActiveNebula) {
    // Always select the active nebula when it changes
    selectedNebula.value = newActiveNebula
    
    // Log auto-switching for user awareness
    if (oldActiveNebula && oldActiveNebula !== newActiveNebula) {
      console.log(`Nebula auto-switched: ${oldActiveNebula} → ${newActiveNebula}`)
    }
  } else if (oldActiveNebula && !newActiveNebula) {
    // Nebula was deactivated - clear selection if it was the deactivated one
    if (selectedNebula.value === oldActiveNebula) {
      selectedNebula.value = null
    }
    console.log(`Nebula deactivated: ${oldActiveNebula} - no longer meets requirements`)
  }
})

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

function getNebulaIconPath(nebulaType: NebulaType): string {
  // Using simplified icon versions for the circular orbit UI
  const assetMap = {
    [NebulaType.STELLAR_NURSERY]: '/src/assets/nebulae/icons/stellar-nursery-icon.svg',
    [NebulaType.PLANETARY_NEBULA]: '/src/assets/nebulae/icons/planetary-nebula-icon.svg',
    [NebulaType.SUPERNOVA_REMNANT]: '/src/assets/nebulae/icons/supernova-remnant-icon.svg',
    [NebulaType.DARK_NEBULA]: '/src/assets/nebulae/icons/dark-nebula-icon.svg',
    [NebulaType.REFLECTION_NEBULA]: '/src/assets/nebulae/icons/reflection-nebula-icon.svg',
    [NebulaType.EMISSION_NEBULA]: '/src/assets/nebulae/icons/emission-nebula-icon.svg',
    [NebulaType.ABSORPTION_NEBULA]: '/src/assets/nebulae/icons/absorption-nebula-icon.svg'
  }
  return assetMap[nebulaType] || '/src/assets/nebulae/icons/stellar-nursery-icon.svg'
}

function getOrbitPosition(index: number): Record<string, string> {
  const totalNebulae = allNebulaTypes.length
  const angle = (index * 360) / totalNebulae - 90 // Start from top
  const radius = 120 // Distance from center
  const radian = (angle * Math.PI) / 180
  const x = Math.cos(radian) * radius
  const y = Math.sin(radian) * radius
  
  return {
    transform: `translate(${x}px, ${y}px)`
  }
}

function selectNebula(nebulaType: NebulaType): void {
  selectedNebula.value = nebulaType
  
  // Add a brief highlight effect when clicking
  const nebulaElement = document.querySelector(`[data-nebula-type="${nebulaType}"]`)
  if (nebulaElement) {
    nebulaElement.classList.add('just-clicked')
    setTimeout(() => {
      nebulaElement.classList.remove('just-clicked')
    }, 500)
  }
}

function formatEffectDescription(effect: any): string {
  if (effect.type === 'production_multiplier') {
    return `${effect.baseValue}× ${effect.target} production`
  } else if (effect.type === 'cost_reduction') {
    return `${(effect.baseValue * 100).toFixed(0)}% ${effect.target} cost reduction`
  } else if (effect.type === 'starecho_threshold') {
    return `${effect.baseValue}× Star Echo activation threshold`
  } else if (effect.type === 'production_reduction') {
    return `${(effect.baseValue * 100).toFixed(0)}% ${effect.target} production reduction`
  } else if (effect.type === 'cost_increase') {
    return `${(effect.baseValue * 100).toFixed(0)}% ${effect.target} cost increase`
  }
  return `${effect.baseValue} ${effect.target}`
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


// Slider helper functions
function getMaxAllocation(component: NebulaComponent): number {
  return 100 // Always use 0-100 for percentage
}

function getSliderValue(component: NebulaComponent): number {
  const allocation = componentAllocations.value.find(a => a.component === component)
  if (!allocation) return 0
  
  return Math.round(allocation.proportion)
}

function setComponentAllocation(component: NebulaComponent, sliderValue: number): void {
  const totalValue = totalAllocated.value.toNumber()
  
  if (totalValue === 0) {
    // If no allocation yet, use available investment to start allocating
    const availableValue = availableAllocation.value.toNumber()
    if (availableValue > 0) {
      const targetAmount = Math.floor((sliderValue / 100) * availableValue)
      nebulaStore.allocateToComponent(component, targetAmount)
    }
    return
  }
  
  // Convert percentage to actual amount
  const targetAmount = Math.floor((sliderValue / 100) * totalValue)
  nebulaStore.allocateToComponent(component, targetAmount)
}

// New helper functions for improved UI
function isNearPerfect(component: NebulaComponent): boolean {
  const allocation = componentAllocations.value.find(a => a.component === component)
  const perfectRatio = getPerfectRatio(component)
  if (!allocation || !perfectRatio) return false
  
  const diff = Math.abs(allocation.proportion - perfectRatio)
  return diff <= 2 && diff > 0.5 // Within 2% but not perfect
}


function balanceAllocations(): void {
  let totalValue = totalAllocated.value.toNumber()
  
  // If no allocation yet, use available investment
  if (totalValue === 0) {
    totalValue = availableAllocation.value.toNumber()
    if (totalValue === 0) return
  }
  
  const equalAmount = Math.floor(totalValue / 7)
  Object.values(NebulaComponent).forEach(component => {
    nebulaStore.allocateToComponent(component, equalAmount)
  })
}

function tryPerfectRatio(): void {
  const config = getActiveConfig()
  if (!config) return
  
  let totalValue = totalAllocated.value.toNumber()
  
  // If no allocation yet, use available investment
  if (totalValue === 0) {
    totalValue = availableAllocation.value.toNumber()
    if (totalValue === 0) return
  }
  
  // Allocate based on perfect ratios
  config.perfectRatios.forEach(ratio => {
    const amount = Math.floor((ratio.ratio / 100) * totalValue)
    nebulaStore.allocateToComponent(ratio.component, amount)
  })
}

function adjustAllocation(component: NebulaComponent, percentChange: number): void {
  let totalValue = totalAllocated.value.toNumber()
  
  // If no allocation yet, use available investment for the base
  if (totalValue === 0) {
    totalValue = availableAllocation.value.toNumber()
    if (totalValue === 0) return
  }
  
  const allocation = componentAllocations.value.find(a => a.component === component)
  if (!allocation) return
  
  const changeAmount = Math.floor((percentChange / 100) * totalValue)
  const currentAmount = allocation.allocatedNM.toNumber()
  const newAmount = Math.max(0, currentAmount + changeAmount)
  
  nebulaStore.allocateToComponent(component, newAmount)
}

function setPerfectForComponent(component: NebulaComponent): void {
  const perfectRatio = getPerfectRatio(component)
  if (!perfectRatio) return
  
  const totalValue = totalAllocated.value.toNumber()
  if (totalValue === 0) return
  
  const targetAmount = Math.floor((perfectRatio / 100) * totalValue)
  nebulaStore.allocateToComponent(component, targetAmount)
}

function canSetPerfect(component: NebulaComponent): boolean {
  const perfectRatio = getPerfectRatio(component)
  if (!perfectRatio) return false
  
  const totalValue = totalAllocated.value.toNumber()
  const availableValue = availableAllocation.value.toNumber()
  return totalValue > 0 || availableValue > 0 // Can set perfect if there's something to allocate
}

function getPerfectMarkerPosition(component: NebulaComponent): number {
  const perfectRatio = getPerfectRatio(component)
  if (!perfectRatio) return 0
  
  return perfectRatio // Perfect ratio is already a percentage
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

.nebula-main-section {
  display: flex;
  gap: 20px;
  min-height: 400px;
}

.nebula-orbit-container {
  flex: 0 0 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, rgba(74, 20, 140, 0.2) 0%, rgba(26, 5, 84, 0.3) 100%);
  border: 1px solid rgba(157, 78, 221, 0.4);
  border-radius: 12px;
  padding: 20px;
}

.nebula-orbit {
  position: relative;
  width: 260px;
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nebula-center {
  position: absolute;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.nebula-orbit-item {
  position: absolute;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nebula-icon {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(157, 78, 221, 0.3);
  padding: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.active-nebula-icon {
  width: 100px;
  height: 100px;
  background: rgba(147, 51, 234, 0.2);
  border: 3px solid var(--accent-purple);
  box-shadow: 0 0 20px rgba(147, 51, 234, 0.5);
  cursor: pointer;
}

.nebula-icon:hover {
  transform: scale(1.1);
  border-color: var(--accent-purple);
  background: rgba(147, 51, 234, 0.15);
}

.nebula-orbit-item.discovered .nebula-icon {
  border-color: rgba(157, 78, 221, 0.6);
  background: rgba(255, 255, 255, 0.08);
}


.nebula-orbit-item.active .nebula-icon {
  border-color: #00ff88;
  border-width: 4px;
  background: radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, rgba(0, 255, 136, 0.05) 100%);
  box-shadow: 
    0 0 25px rgba(0, 255, 136, 0.9),
    0 0 50px rgba(0, 255, 136, 0.6),
    0 0 75px rgba(0, 255, 136, 0.3),
    inset 0 0 20px rgba(0, 255, 136, 0.15);
  animation: activePulse 1.5s ease-in-out infinite;
  transform: scale(1.15);
  position: relative;
  z-index: 10;
}

.nebula-orbit-item.active .nebula-icon::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 2px solid rgba(0, 255, 136, 0.6);
  border-radius: 50%;
  animation: activeRing 2s linear infinite;
}

.nebula-orbit-item.active .nebula-icon::after {
  content: '';
  position: absolute;
  top: -12px;
  left: -12px;
  right: -12px;
  bottom: -12px;
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 50%;
  animation: activeRing 3s linear infinite reverse;
}

@keyframes activePulse {
  0%, 100% { 
    box-shadow: 
      0 0 25px rgba(0, 255, 136, 0.9),
      0 0 50px rgba(0, 255, 136, 0.6),
      0 0 75px rgba(0, 255, 136, 0.3),
      inset 0 0 20px rgba(0, 255, 136, 0.15);
    transform: scale(1.15);
  }
  50% { 
    box-shadow: 
      0 0 35px rgba(0, 255, 136, 1),
      0 0 70px rgba(0, 255, 136, 0.8),
      0 0 105px rgba(0, 255, 136, 0.5),
      inset 0 0 30px rgba(0, 255, 136, 0.25);
    transform: scale(1.2);
  }
}

@keyframes activeRing {
  0% { 
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% { 
    transform: rotate(360deg) scale(1.1);
    opacity: 1;
  }
}

.nebula-orbit-item.selected .nebula-icon {
  border-color: rgba(255, 255, 255, 0.8);
  border-width: 3px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.nebula-orbit-item.just-clicked .nebula-icon {
  animation: clickFlash 0.5s ease-out;
}

@keyframes clickFlash {
  0% {
    box-shadow: 
      0 0 50px rgba(255, 255, 255, 1),
      0 0 100px rgba(255, 255, 255, 0.8),
      inset 0 0 30px rgba(255, 255, 255, 0.3);
    transform: scale(1.3);
  }
  100% {
    box-shadow: none;
    transform: scale(1);
  }
}

.nebula-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: brightness(1) contrast(1);
  transition: filter 0.3s ease;
}

.nebula-icon-img.disabled {
  filter: grayscale(1) brightness(0.4) contrast(0.8);
  opacity: 0.5;
}

.nebula-orbit-item:not(.discovered):not(.active) .nebula-icon-img {
  filter: grayscale(1) brightness(0.4) contrast(0.8);
  opacity: 0.5;
}

.nebula-icon-name {
  position: absolute;
  bottom: -20px;
  font-size: 10px;
  color: var(--text-primary);
  white-space: nowrap;
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
  padding: 2px 6px;
  border-radius: 4px;
}

.empty-nebula-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  border: 2px dashed rgba(157, 78, 221, 0.3);
  border-radius: 50%;
}

.empty-nebula-text {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}

.nebula-info-panel {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(157, 78, 221, 0.3);
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
  max-height: 500px;
}

.nebula-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.nebula-info-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--accent-purple);
  margin: 0;
}

.nebula-info-description {
  color: var(--text-secondary);
  font-style: italic;
  line-height: 1.5;
  margin: 0;
}

.nebula-activation-section,
.nebula-effects-section,
.perfect-ratio-info {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 15px;
}

.nebula-activation-section h4,
.nebula-effects-section h4,
.perfect-ratio-info h4 {
  font-size: 14px;
  color: var(--text-primary);
  margin: 0 0 10px 0;
}

.activation-requirements {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.requirement-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  font-size: 13px;
}

.central-requirement {
  background: rgba(147, 51, 234, 0.15);
  border: 1px solid rgba(147, 51, 234, 0.3);
}

.requirement-label {
  color: var(--text-muted);
}

.requirement-value {
  color: var(--accent-green);
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
}

.effects-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.effects-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.effects-subtitle {
  font-size: 12px;
  font-weight: 600;
  margin: 0 0 5px 0;
}

.bonuses-title {
  color: var(--accent-green);
}

.penalties-title {
  color: #ef4444;
}

.effect-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.bonus-item {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.penalty-item {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.effect-icon {
  font-weight: 700;
  font-size: 14px;
}

.bonus-item .effect-icon {
  color: var(--accent-green);
}

.penalty-item .effect-icon {
  color: #ef4444;
}

.effect-text {
  color: var(--text-secondary);
  flex: 1;
}

.perfect-ratio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.perfect-ratio-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(157, 78, 221, 0.2);
  border-radius: 4px;
  font-size: 12px;
}

.perfect-ratio-item.central {
  background: rgba(147, 51, 234, 0.15);
  border-color: rgba(147, 51, 234, 0.3);
}

.ratio-component-name {
  color: var(--text-secondary);
}

.ratio-percentage {
  color: var(--accent-green);
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
}

.perfect-bonus-note {
  margin-top: 15px;
  padding: 10px;
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.perfect-bonus-note p {
  margin: 0 0 5px 0;
  font-weight: 600;
}

.perfect-bonus-note ul {
  margin: 0;
  padding-left: 20px;
}

.perfect-bonus-note li {
  margin: 3px 0;
}

.perfect-bonus-note strong {
  color: var(--accent-green);
}

.nebula-status-section {
  background: rgba(147, 51, 234, 0.1);
  border: 1px solid var(--accent-purple);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.nebula-status-section h4 {
  margin: 0 0 10px 0;
  color: var(--accent-purple);
  font-size: 14px;
}

.active-effect {
  background: rgba(147, 51, 234, 0.15) !important;
  border-color: var(--accent-purple) !important;
  animation: activeEffectPulse 3s ease-in-out infinite;
}

@keyframes activeEffectPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.activation-controls,
.activation-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.activate-nebula-btn {
  background: linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%);
  border: none;
  color: white;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.activate-nebula-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(147, 51, 234, 0.3);
}

.status-active {
  color: var(--accent-green);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-active::before {
  content: '•';
  font-size: 20px;
}


.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  font-style: italic;
}

.active-status-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.active-effects-summary {
  display: flex;
  gap: 20px;
  font-size: 14px;
}

.bonuses-summary,
.penalties-summary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.effect-label {
  color: var(--text-muted);
}

.bonuses-summary .effect-count {
  color: var(--accent-green);
  font-weight: 600;
}

.penalties-summary .effect-count {
  color: #ef4444;
  font-weight: 600;
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

.component-card.near-perfect {
  border-color: rgba(255, 215, 0, 0.5);
  background: rgba(255, 215, 0, 0.05);
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
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.current-proportion {
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
  color: var(--accent-blue);
}

.ratio-separator {
  color: var(--text-muted);
  font-size: 10px;
}

.target-ratio {
  font-family: 'Roboto Mono', monospace;
  color: var(--text-muted);
}

.target-ratio.achieved {
  color: #ffd700;
  font-weight: 700;
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

.allocation-quick-actions {
  display: flex;
  gap: 8px;
}

.quick-action-btn {
  font-size: 11px;
  padding: 4px 10px;
  background: rgba(147, 51, 234, 0.2);
  border-color: rgba(147, 51, 234, 0.5);
}

.quick-action-btn:hover:not(:disabled) {
  background: rgba(147, 51, 234, 0.4);
  border-color: rgba(147, 51, 234, 0.8);
}

.allocation-controls {
  margin: 15px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-adjust-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.adjust-btn {
  font-size: 10px;
  padding: 3px 6px;
  min-width: unset;
  border-radius: 3px;
}

.decrease-btn {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

.decrease-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.4);
  border-color: rgba(239, 68, 68, 0.8);
}

.increase-btn {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.5);
}

.increase-btn:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.4);
  border-color: rgba(34, 197, 94, 0.8);
}

.perfect-btn {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.5);
  font-weight: 600;
}

.perfect-btn:hover:not(:disabled) {
  background: rgba(255, 215, 0, 0.4);
  border-color: rgba(255, 215, 0, 0.8);
}

.enhanced-slider {
  position: relative;
}

.slider-track {
  position: relative;
  width: 100%;
  height: 30px;
  display: flex;
  align-items: center;
}

.perfect-ratio-marker {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: 1;
}

.marker-line {
  width: 2px;
  height: 20px;
  background: #ffd700;
  opacity: 0.6;
}

.marker-label {
  font-size: 9px;
  color: #ffd700;
  font-weight: 600;
  white-space: nowrap;
  margin-top: 2px;
}

.allocation-slider .slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(to right, 
    rgba(34, 197, 94, 0.1) 0%, 
    rgba(34, 197, 94, 0.3) 100%
  );
  outline: none;
  -webkit-appearance: none;
  position: relative;
  z-index: 2;
}

.allocation-slider .slider.near-perfect {
  background: linear-gradient(to right, 
    rgba(255, 215, 0, 0.1) 0%, 
    rgba(255, 215, 0, 0.3) 100%
  );
}

.allocation-slider .slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent-green);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.allocation-slider .slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

.allocation-slider .slider.near-perfect::-webkit-slider-thumb {
  background: #ffd700;
}

.allocation-slider .slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent-green);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.allocation-slider .slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

.allocation-slider .slider.near-perfect::-moz-range-thumb {
  background: #ffd700;
}

.allocation-slider .slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 5px;
}

.slider-labels .current-value {
  color: var(--accent-green);
  font-weight: 600;
}



.component-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.allocated-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.amount-label {
  color: var(--text-muted);
}

.amount-value {
  font-family: 'Roboto Mono', monospace;
  color: var(--accent-green);
  font-weight: 500;
}

.perfect-hint {
  font-size: 11px;
  font-style: italic;
}

.need-more {
  color: #fbbf24;
}

.need-less {
  color: #f87171;
}

.perfect-achieved {
  color: #ffd700;
  font-weight: 600;
}

.component-bar-container {
  position: relative;
  margin-top: 10px;
}

.component-bar {
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: visible;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.component-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 6px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 4px;
}

.bar-percentage {
  font-size: 9px;
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.perfect-ratio-line {
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 2px;
  background: #ffd700;
  opacity: 0.8;
  pointer-events: none;
  z-index: 3;
  box-shadow: 0 0 4px rgba(255, 215, 0, 0.5);
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
  
  .nebula-main-section {
    flex-direction: column;
  }
  
  .nebula-orbit-container {
    flex: none;
    height: 300px;
  }
  
  .nebula-orbit {
    transform: scale(0.8);
  }
  
  .components-grid {
    grid-template-columns: 1fr;
  }
  
  .effects-grid {
    grid-template-columns: 1fr;
  }
  
  .material-stats {
    flex-direction: column;
    gap: 10px;
  }
}
</style>