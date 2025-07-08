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
    
    <!-- Active Nebula Display -->
    <div class="active-nebula-section" v-if="activeNebula">
      <h3 class="subsection-title">Active Nebula</h3>
      <div class="nebula-display">
        <div class="nebula-info">
          <div class="nebula-name">{{ getNebulaConfig(activeNebula)?.name }}</div>
          <div class="nebula-description">{{ getNebulaConfig(activeNebula)?.description }}</div>
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
        <button class="btn btn-secondary" @click="deactivateNebula">
          Deactivate Nebula
        </button>
      </div>
    </div>
    
    <!-- Component Investment -->
    <div class="investment-section">
      <h3 class="subsection-title">Component Investment</h3>
      <div class="components-grid">
        <div 
          v-for="component in components"
          :key="component.component"
          class="component-card"
        >
          <div class="component-header">
            <div class="component-name">{{ formatComponentName(component.component) }}</div>
            <div class="component-proportion">{{ component.proportion.toFixed(1) }}%</div>
          </div>
          <div class="component-stats">
            <div class="invested-amount">
              Invested: {{ format(component.invested) }}
            </div>
            <div class="investment-cost">
              Cost: {{ getInvestmentCost(component.component) }}
            </div>
          </div>
          <div class="component-actions">
            <button 
              class="btn btn-primary btn-small"
              :disabled="!canInvestInComponent(component.component, getInvestmentCost(component.component))"
              @click="investInComponent(component.component, getInvestmentCost(component.component))"
            >
              Invest +1
            </button>
            <button 
              class="btn btn-primary btn-small"
              :disabled="!canInvestInComponent(component.component, getInvestmentCost(component.component) * 10)"
              @click="investInComponent(component.component, getInvestmentCost(component.component) * 10)"
            >
              Invest +10
            </button>
          </div>
          <div class="component-bar">
            <div 
              class="component-fill" 
              :style="{ width: component.proportion + '%', background: getComponentColor(component.component) }"
            ></div>
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
          @click="activateNebula(nebulaType)"
        >
          <div class="nebula-name">{{ getNebulaConfig(nebulaType)?.name }}</div>
          <div class="nebula-requirements">
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
    
    <!-- Nebula Requirements Guide -->
    <div class="requirements-guide">
      <h3 class="subsection-title">Nebula Formation Guide</h3>
      <div class="guide-text">
        Invest Nebula Material into different components to coordinate nebula formation. 
        When component proportions fall within specific ranges, new nebula types will be discovered.
        Each nebula provides powerful bonuses but may also impose penalties.
      </div>
      <div class="undiscovered-nebulae">
        <div 
          v-for="config in undiscoveredNebulae"
          :key="config.type"
          class="undiscovered-item"
        >
          <div class="nebula-name">{{ config.name }}</div>
          <div class="nebula-requirements">
            Required: 
            <span 
              v-for="req in config.requirements"
              :key="req.component"
              class="requirement"
              :class="{ 'requirement-met': isRequirementMet(req) }"
            >
              {{ formatComponentName(req.component) }}: {{ req.minPercent }}-{{ req.maxPercent }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNebulaStore } from '@/stores/nebula'
import { format } from '@/utils/formatting'
import { NebulaComponent, NebulaType, type NebulaConfiguration } from '@/types/nebula'

const nebulaStore = useNebulaStore()

const { 
  nebulaMaterial,
  components,
  activeNebula,
  discoveredNebulae,
  nebulaConfigurations,
  totalInvestment,
  materialProductionRate,
  currentBonuses,
  currentPenalties
} = storeToRefs(nebulaStore)

const undiscoveredNebulae = computed(() => {
  return nebulaConfigurations.value.filter(config => !config.discovered)
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

function isRequirementMet(requirement: any): boolean {
  const component = components.value.find(c => c.component === requirement.component)
  if (!component) return false
  
  return component.proportion >= requirement.minPercent && component.proportion <= requirement.maxPercent
}

// Delegate to store functions
const canInvestInComponent = nebulaStore.canInvestInComponent
const investInComponent = nebulaStore.investInComponent
const getInvestmentCost = nebulaStore.getInvestmentCost
const activateNebula = nebulaStore.activateNebula
const deactivateNebula = nebulaStore.deactivateNebula
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

.nebula-coordination-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(157, 78, 221, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(147, 51, 234, 0.15) 0%, transparent 50%);
  pointer-events: none;
  border-radius: 12px;
  z-index: -1;
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

.active-nebula-section {
  background: rgba(147, 51, 234, 0.1);
  border: 1px solid var(--accent-purple);
  border-radius: 8px;
  padding: 15px;
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

.investment-section {
  flex: 1;
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.component-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
}

.component-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
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
}

.component-proportion {
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
  color: var(--accent-blue);
}

.component-stats {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
  font-size: 12px;
  color: var(--text-secondary);
}

.component-actions {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}

.btn-small {
  padding: 4px 8px;
  font-size: 11px;
}

.component-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.component-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.discovered-nebulae, .requirements-guide {
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

.requirement {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.requirement-met {
  background: rgba(34, 197, 94, 0.2);
  color: var(--accent-green);
}

.guide-text {
  color: var(--text-secondary);
  margin-bottom: 15px;
  line-height: 1.4;
}

.undiscovered-nebulae {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.undiscovered-item {
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
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