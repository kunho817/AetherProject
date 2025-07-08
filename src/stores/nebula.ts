import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { D, ZERO } from '@/utils/decimal'
import type { 
  ComponentInvestment, 
  NebulaConfiguration
} from '@/types/nebula'
import { NebulaComponent, NebulaType } from '@/types/nebula'
import { useGameStore } from './gameState'

export const useNebulaStore = defineStore('nebula', () => {
  const gameStore = useGameStore()
  
  // Nebula Material (renamed from essence) - produced by filament purchases
  const nebulaMaterial = computed(() => gameStore.nebularEssence) // Will rename in gameStore later
  
  // Component investments
  const components = ref<ComponentInvestment[]>([
    { component: NebulaComponent.HYDROGEN, invested: ZERO, proportion: 0 },
    { component: NebulaComponent.HELIUM, invested: ZERO, proportion: 0 },
    { component: NebulaComponent.CARBON, invested: ZERO, proportion: 0 },
    { component: NebulaComponent.NITROGEN, invested: ZERO, proportion: 0 },
    { component: NebulaComponent.OXYGEN, invested: ZERO, proportion: 0 },
    { component: NebulaComponent.SILICON, invested: ZERO, proportion: 0 },
    { component: NebulaComponent.IRON, invested: ZERO, proportion: 0 }
  ])
  
  // Nebula state
  const activeNebula = ref<NebulaType | null>(null)
  const discoveredNebulae = ref<NebulaType[]>([])
  
  // Nebula configurations with requirements, bonuses, and penalties
  const nebulaConfigurations = ref<NebulaConfiguration[]>([
    {
      type: NebulaType.STELLAR_NURSERY,
      name: 'Stellar Nursery',
      description: 'A birthplace of stars, rich in hydrogen and helium. Massively boosts star formation.',
      requirements: [
        { component: NebulaComponent.HYDROGEN, minPercent: 60, maxPercent: 80 },
        { component: NebulaComponent.HELIUM, minPercent: 15, maxPercent: 30 }
      ],
      bonuses: [
        { type: 'production_multiplier', target: 'stardust', baseValue: 5.0, description: 'Stellar formation boost' },
        { type: 'production_multiplier', target: 'filaments', baseValue: 3.0, description: 'Enhanced filament growth' }
      ],
      penalties: [
        { type: 'cost_increase', target: 'starlight', baseValue: 2.0, description: 'Difficult starlight extraction' }
      ],
      discovered: false
    },
    {
      type: NebulaType.PLANETARY_NEBULA,
      name: 'Planetary Nebula', 
      description: 'Expelled stellar material creating beautiful symmetric structures. Enhances precision operations.',
      requirements: [
        { component: NebulaComponent.HELIUM, minPercent: 40, maxPercent: 60 },
        { component: NebulaComponent.CARBON, minPercent: 20, maxPercent: 35 },
        { component: NebulaComponent.OXYGEN, minPercent: 10, maxPercent: 25 }
      ],
      bonuses: [
        { type: 'cost_reduction', target: 'all', baseValue: 0.7, description: 'Enhanced efficiency' },
        { type: 'starecho_threshold', target: 'starecho', baseValue: 1.5, description: 'Increased Star Echo threshold' }
      ],
      penalties: [
        { type: 'production_reduction', target: 'stardust', baseValue: 0.6, description: 'Lower raw production' }
      ],
      discovered: false
    },
    {
      type: NebulaType.SUPERNOVA_REMNANT,
      name: 'Supernova Remnant',
      description: 'The explosive aftermath of stellar death. Extreme energy but chaotic and destructive.',
      requirements: [
        { component: NebulaComponent.IRON, minPercent: 30, maxPercent: 50 },
        { component: NebulaComponent.SILICON, minPercent: 20, maxPercent: 35 },
        { component: NebulaComponent.OXYGEN, minPercent: 15, maxPercent: 30 }
      ],
      bonuses: [
        { type: 'production_multiplier', target: 'all', baseValue: 10.0, description: 'Explosive energy release' }
      ],
      penalties: [
        { type: 'cost_increase', target: 'all', baseValue: 3.0, description: 'Chaotic and unstable' },
        { type: 'production_reduction', target: 'starlight', baseValue: 0.3, description: 'Starlight interference' }
      ],
      discovered: false
    },
    {
      type: NebulaType.DARK_NEBULA,
      name: 'Dark Nebula',
      description: 'Dense clouds that block starlight. Mysterious and provides unique enhancement paths.',
      requirements: [
        { component: NebulaComponent.CARBON, minPercent: 50, maxPercent: 70 },
        { component: NebulaComponent.SILICON, minPercent: 20, maxPercent: 40 }
      ],
      bonuses: [
        { type: 'starecho_threshold', target: 'starecho', baseValue: 3.0, description: 'Greatly increased Star Echo threshold' },
        { type: 'cost_reduction', target: 'filaments', baseValue: 0.4, description: 'Enhanced filament stability' }
      ],
      penalties: [
        { type: 'production_reduction', target: 'stardust', baseValue: 0.2, description: 'Blocked stellar light' },
        { type: 'production_reduction', target: 'starlight', baseValue: 0.1, description: 'Severely blocked starlight' }
      ],
      discovered: false
    },
    {
      type: NebulaType.REFLECTION_NEBULA,
      name: 'Reflection Nebula',
      description: 'Reflects light from nearby stars. Provides balanced enhancements with minimal penalties.',
      requirements: [
        { component: NebulaComponent.HYDROGEN, minPercent: 30, maxPercent: 50 },
        { component: NebulaComponent.HELIUM, minPercent: 20, maxPercent: 40 },
        { component: NebulaComponent.CARBON, minPercent: 15, maxPercent: 30 }
      ],
      bonuses: [
        { type: 'production_multiplier', target: 'starlight', baseValue: 4.0, description: 'Enhanced light reflection' },
        { type: 'cost_reduction', target: 'stardust', baseValue: 0.8, description: 'Improved stellar processes' }
      ],
      penalties: [], // Balanced nebula with no penalties
      discovered: false
    },
    {
      type: NebulaType.EMISSION_NEBULA,
      name: 'Emission Nebula',
      description: 'Glowing clouds of ionized gas. Provides extreme starlight production.',
      requirements: [
        { component: NebulaComponent.HYDROGEN, minPercent: 70, maxPercent: 90 },
        { component: NebulaComponent.OXYGEN, minPercent: 5, maxPercent: 20 }
      ],
      bonuses: [
        { type: 'production_multiplier', target: 'starlight', baseValue: 15.0, description: 'Intense ionized emission' }
      ],
      penalties: [
        { type: 'production_reduction', target: 'filaments', baseValue: 0.4, description: 'Ionization disrupts filaments' },
        { type: 'cost_increase', target: 'stardust', baseValue: 2.5, description: 'Energy-intensive processes' }
      ],
      discovered: false
    },
    {
      type: NebulaType.ABSORPTION_NEBULA,
      name: 'Absorption Nebula',
      description: 'Dense material that absorbs specific wavelengths. Specialized for advanced operations.',
      requirements: [
        { component: NebulaComponent.NITROGEN, minPercent: 40, maxPercent: 60 },
        { component: NebulaComponent.CARBON, minPercent: 25, maxPercent: 45 },
        { component: NebulaComponent.IRON, minPercent: 10, maxPercent: 25 }
      ],
      bonuses: [
        { type: 'starecho_threshold', target: 'starecho', baseValue: 2.0, description: 'Enhanced Star Echo capacity' },
        { type: 'cost_reduction', target: 'all', baseValue: 0.5, description: 'Selective absorption efficiency' }
      ],
      penalties: [
        { type: 'production_reduction', target: 'stardust', baseValue: 0.7, description: 'Absorbed stellar energy' }
      ],
      discovered: false
    }
  ])
  
  // Computed values
  const totalInvestment = computed(() => {
    return components.value.reduce((total, comp) => total.add(comp.invested), ZERO)
  })
  
  const materialProductionRate = computed(() => {
    // NM production based on filament purchases (0.1% of total filament value)
    const filamentValue = gameStore.filaments.reduce((total, filament, index) => {
      const cost = gameStore.getFilamentCost(index)
      return total.add(cost.mul(filament.purchased))
    }, ZERO)
    return filamentValue.mul(0.001) // 0.1% of filament investment value
  })
  
  // Component investment functions
  function canInvestInComponent(_component: NebulaComponent, amount: number): boolean {
    return nebulaMaterial.value >= amount
  }
  
  function investInComponent(component: NebulaComponent, amount: number): boolean {
    if (!canInvestInComponent(component, amount)) return false
    
    const componentData = components.value.find(c => c.component === component)
    if (!componentData) return false
    
    // Deduct NM and add to investment
    gameStore.nebularEssence -= amount
    componentData.invested = componentData.invested.add(amount)
    
    // Recalculate proportions
    calculateProportions()
    
    // Check for new nebula formation
    checkNebulaFormation()
    
    return true
  }
  
  function calculateProportions() {
    const total = totalInvestment.value
    if (total.eq(0)) {
      components.value.forEach(comp => comp.proportion = 0)
      return
    }
    
    components.value.forEach(comp => {
      comp.proportion = comp.invested.div(total).mul(100).toNumber()
    })
  }
  
  function checkNebulaFormation() {
    // Check each nebula configuration to see if requirements are met
    for (const config of nebulaConfigurations.value) {
      if (config.discovered) continue
      
      const meetsRequirements = config.requirements.every(req => {
        const component = components.value.find(c => c.component === req.component)
        if (!component) return false
        
        return component.proportion >= req.minPercent && component.proportion <= req.maxPercent
      })
      
      if (meetsRequirements) {
        config.discovered = true
        if (!discoveredNebulae.value.includes(config.type)) {
          discoveredNebulae.value.push(config.type)
        }
        
        // Auto-activate first discovered nebula
        if (!activeNebula.value) {
          activeNebula.value = config.type
        }
      }
    }
  }
  
  function activateNebula(type: NebulaType): boolean {
    const config = nebulaConfigurations.value.find(c => c.type === type)
    if (!config || !config.discovered) return false
    
    activeNebula.value = type
    return true
  }
  
  function deactivateNebula() {
    activeNebula.value = null
  }
  
  // Calculate current bonuses from active nebula
  const currentBonuses = computed(() => {
    if (!activeNebula.value) return []
    
    const config = nebulaConfigurations.value.find(c => c.type === activeNebula.value)
    if (!config) return []
    
    // Apply logarithmic scaling based on total investment
    const investmentMultiplier = Math.log10(Math.max(10, totalInvestment.value.toNumber())) / Math.log10(10)
    
    return config.bonuses.map(bonus => ({
      ...bonus,
      scaledValue: bonus.baseValue * investmentMultiplier
    }))
  })
  
  const currentPenalties = computed(() => {
    if (!activeNebula.value) return []
    
    const config = nebulaConfigurations.value.find(c => c.type === activeNebula.value)
    if (!config) return []
    
    // Penalties are not scaled with investment (they remain constant)
    return config.penalties.map(penalty => ({
      ...penalty,
      scaledValue: penalty.baseValue
    }))
  })
  
  // Get component investment cost (increases exponentially)
  function getInvestmentCost(component: NebulaComponent, amount = 1): number {
    const componentData = components.value.find(c => c.component === component)
    if (!componentData) return 1
    
    const baseCost = 10
    const currentInvestment = componentData.invested.toNumber()
    
    // Exponential cost scaling
    return Math.floor(baseCost * Math.pow(1.5, currentInvestment / 100) * amount)
  }
  
  // Reset functions
  function reset() {
    components.value.forEach(comp => {
      comp.invested = ZERO
      comp.proportion = 0
    })
    activeNebula.value = null
    discoveredNebulae.value = []
    nebulaConfigurations.value.forEach(config => {
      config.discovered = false
    })
    gameStore.nebularEssence = 0
  }
  
  function softReset() {
    // Keep discovered nebulae but reset investments
    components.value.forEach(comp => {
      comp.invested = ZERO
      comp.proportion = 0
    })
    activeNebula.value = null
  }
  
  // Production tick - generate NM from filaments
  function tick(deltaTime: number) {
    const production = materialProductionRate.value.mul(deltaTime).toNumber()
    gameStore.nebularEssence += production
  }
  
  // Save/Load functions
  function save() {
    return {
      components: components.value.map(comp => ({
        component: comp.component,
        invested: comp.invested.toString(),
        proportion: comp.proportion
      })),
      activeNebula: activeNebula.value,
      discoveredNebulae: discoveredNebulae.value,
      nebulaConfigurations: nebulaConfigurations.value.map(config => ({
        type: config.type,
        discovered: config.discovered
      }))
    }
  }
  
  function load(saveData: any) {
    if (!saveData) return
    
    try {
      // Load component investments
      if (saveData.components && Array.isArray(saveData.components)) {
        saveData.components.forEach((savedComp: any) => {
          const component = components.value.find(c => c.component === savedComp.component)
          if (component) {
            component.invested = D(savedComp.invested || 0)
            component.proportion = savedComp.proportion || 0
          }
        })
      }
      
      // Load active nebula
      if (saveData.activeNebula) {
        activeNebula.value = saveData.activeNebula
      }
      
      // Load discovered nebulae
      if (saveData.discoveredNebulae && Array.isArray(saveData.discoveredNebulae)) {
        discoveredNebulae.value = saveData.discoveredNebulae
      }
      
      // Load nebula discovery states
      if (saveData.nebulaConfigurations && Array.isArray(saveData.nebulaConfigurations)) {
        saveData.nebulaConfigurations.forEach((savedConfig: any) => {
          const config = nebulaConfigurations.value.find(c => c.type === savedConfig.type)
          if (config) {
            config.discovered = savedConfig.discovered || false
          }
        })
      }
      
      // Recalculate proportions
      calculateProportions()
      
    } catch (error) {
      console.error('Failed to load Nebula Coordination data:', error)
      reset()
    }
  }
  
  return {
    // State
    nebulaMaterial,
    components,
    activeNebula,
    discoveredNebulae,
    nebulaConfigurations,
    
    // Computed
    totalInvestment,
    materialProductionRate,
    currentBonuses,
    currentPenalties,
    
    // Actions
    canInvestInComponent,
    investInComponent,
    activateNebula,
    deactivateNebula,
    getInvestmentCost,
    calculateProportions,
    checkNebulaFormation,
    tick,
    reset,
    softReset,
    
    // Save/Load
    save,
    load
  }
})