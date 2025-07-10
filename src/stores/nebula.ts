import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { D, ZERO } from '@/utils/decimal'
import type { 
  ComponentAllocation, 
  NebulaConfiguration,
  InterstellarAgglomerator
} from '@/types/nebula'
import { NebulaComponent, NebulaType } from '@/types/nebula'
import { useGameStore } from './gameState'

export const useNebulaStore = defineStore('nebula', () => {
  const gameStore = useGameStore()
  
  // Nebula Material (renamed from essence) - produced by filament purchases
  const nebulaMaterial = computed(() => gameStore.nebularEssence) // Will rename in gameStore later
  
  // Single Interstellar Agglomerator - aggregates all components
  const agglomerator = ref<InterstellarAgglomerator>({
    totalInvestedNM: ZERO,
    level: 1,
    efficiency: 1.0
  })
  
  // Component allocations - how NM is allocated to each component from the agglomerator
  const componentAllocations = ref<ComponentAllocation[]>([
    { component: NebulaComponent.HYDROGEN, allocatedNM: ZERO, proportion: 0, isPerfect: false },
    { component: NebulaComponent.HELIUM, allocatedNM: ZERO, proportion: 0, isPerfect: false },
    { component: NebulaComponent.CARBON, allocatedNM: ZERO, proportion: 0, isPerfect: false },
    { component: NebulaComponent.NITROGEN, allocatedNM: ZERO, proportion: 0, isPerfect: false },
    { component: NebulaComponent.OXYGEN, allocatedNM: ZERO, proportion: 0, isPerfect: false },
    { component: NebulaComponent.SILICON, allocatedNM: ZERO, proportion: 0, isPerfect: false },
    { component: NebulaComponent.IRON, allocatedNM: ZERO, proportion: 0, isPerfect: false }
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
      centralComponent: NebulaComponent.HYDROGEN,
      perfectRatios: [
        { component: NebulaComponent.HYDROGEN, ratio: 70 },
        { component: NebulaComponent.HELIUM, ratio: 22 },
        { component: NebulaComponent.CARBON, ratio: 3 },
        { component: NebulaComponent.NITROGEN, ratio: 2 },
        { component: NebulaComponent.OXYGEN, ratio: 2 },
        { component: NebulaComponent.SILICON, ratio: 0.5 },
        { component: NebulaComponent.IRON, ratio: 0.5 }
      ],
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
      centralComponent: NebulaComponent.HELIUM,
      perfectRatios: [
        { component: NebulaComponent.HYDROGEN, ratio: 25 },
        { component: NebulaComponent.HELIUM, ratio: 50 },
        { component: NebulaComponent.CARBON, ratio: 12 },
        { component: NebulaComponent.NITROGEN, ratio: 5 },
        { component: NebulaComponent.OXYGEN, ratio: 6 },
        { component: NebulaComponent.SILICON, ratio: 1 },
        { component: NebulaComponent.IRON, ratio: 1 }
      ],
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
      centralComponent: NebulaComponent.IRON,
      perfectRatios: [
        { component: NebulaComponent.HYDROGEN, ratio: 15 },
        { component: NebulaComponent.HELIUM, ratio: 10 },
        { component: NebulaComponent.CARBON, ratio: 8 },
        { component: NebulaComponent.NITROGEN, ratio: 7 },
        { component: NebulaComponent.OXYGEN, ratio: 20 },
        { component: NebulaComponent.SILICON, ratio: 15 },
        { component: NebulaComponent.IRON, ratio: 25 }
      ],
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
      centralComponent: NebulaComponent.CARBON,
      perfectRatios: [
        { component: NebulaComponent.HYDROGEN, ratio: 10 },
        { component: NebulaComponent.HELIUM, ratio: 5 },
        { component: NebulaComponent.CARBON, ratio: 60 },
        { component: NebulaComponent.NITROGEN, ratio: 8 },
        { component: NebulaComponent.OXYGEN, ratio: 5 },
        { component: NebulaComponent.SILICON, ratio: 10 },
        { component: NebulaComponent.IRON, ratio: 2 }
      ],
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
      centralComponent: NebulaComponent.HYDROGEN,
      perfectRatios: [
        { component: NebulaComponent.HYDROGEN, ratio: 40 },
        { component: NebulaComponent.HELIUM, ratio: 30 },
        { component: NebulaComponent.CARBON, ratio: 20 },
        { component: NebulaComponent.NITROGEN, ratio: 4 },
        { component: NebulaComponent.OXYGEN, ratio: 3 },
        { component: NebulaComponent.SILICON, ratio: 2 },
        { component: NebulaComponent.IRON, ratio: 1 }
      ],
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
      centralComponent: NebulaComponent.HYDROGEN,
      perfectRatios: [
        { component: NebulaComponent.HYDROGEN, ratio: 80 },
        { component: NebulaComponent.HELIUM, ratio: 8 },
        { component: NebulaComponent.CARBON, ratio: 3 },
        { component: NebulaComponent.NITROGEN, ratio: 2 },
        { component: NebulaComponent.OXYGEN, ratio: 5 },
        { component: NebulaComponent.SILICON, ratio: 1 },
        { component: NebulaComponent.IRON, ratio: 1 }
      ],
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
      centralComponent: NebulaComponent.NITROGEN,
      perfectRatios: [
        { component: NebulaComponent.HYDROGEN, ratio: 15 },
        { component: NebulaComponent.HELIUM, ratio: 10 },
        { component: NebulaComponent.CARBON, ratio: 20 },
        { component: NebulaComponent.NITROGEN, ratio: 35 },
        { component: NebulaComponent.OXYGEN, ratio: 8 },
        { component: NebulaComponent.SILICON, ratio: 7 },
        { component: NebulaComponent.IRON, ratio: 5 }
      ],
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
    return agglomerator.value.totalInvestedNM
  })
  
  const totalAllocated = computed(() => {
    return componentAllocations.value.reduce((total, comp) => total.add(comp.allocatedNM), ZERO)
  })
  
  const availableAllocation = computed(() => {
    return agglomerator.value.totalInvestedNM.sub(totalAllocated.value)
  })
  
  const materialProductionRate = computed(() => {
    // NM production based on filament purchases (0.1% of total filament value)
    const filamentValue = gameStore.filaments.reduce((total, filament, index) => {
      const cost = gameStore.getFilamentCost(index)
      return total.add(cost.mul(filament.purchased))
    }, ZERO)
    return filamentValue.mul(0.001) // 0.1% of filament investment value
  })
  
  // Invest NM into the agglomerator
  function investInAgglomerator(amount: number): boolean {
    if (gameStore.nebularEssence < amount) {
      return false
    }
    
    // Update investment and NM
    agglomerator.value.totalInvestedNM = agglomerator.value.totalInvestedNM.add(amount)
    gameStore.nebularEssence -= amount
    
    return true
  }
  
  // Allocate NM from agglomerator to a specific component
  function allocateToComponent(component: NebulaComponent, amount: number): boolean {
    const allocation = componentAllocations.value.find(a => a.component === component)
    if (!allocation) return false
    
    const currentAllocation = allocation.allocatedNM.toNumber()
    const difference = amount - currentAllocation
    
    // Check if we have enough available allocation
    if (difference > 0 && availableAllocation.value.lt(difference)) {
      return false
    }
    
    // Update allocation
    allocation.allocatedNM = D(amount)
    
    // Recalculate proportions and perfect ratios
    calculateProportions()
    checkPerfectRatios()
    checkNebulaFormation()
    
    return true
  }
  
  // Component investment functions
  function canInvestInComponent(_component: NebulaComponent, amount: number): boolean {
    return nebulaMaterial.value >= amount
  }
  
  // Helper function to check if we can allocate amount to component
  function canAllocateToComponent(component: NebulaComponent, amount: number): boolean {
    const allocation = componentAllocations.value.find(a => a.component === component)
    if (!allocation) return false
    
    const currentAllocation = allocation.allocatedNM.toNumber()
    const difference = amount - currentAllocation
    
    return difference <= 0 || availableAllocation.value.gte(difference)
  }
  
  function calculateProportions() {
    // Calculate total effective allocation across all components
    const totalEffectiveAllocation = componentAllocations.value.reduce((total, comp) => {
      return total.add(comp.allocatedNM.mul(agglomerator.value.efficiency))
    }, ZERO)
    
    if (totalEffectiveAllocation.eq(0)) {
      componentAllocations.value.forEach(comp => {
        comp.proportion = 0
        comp.isPerfect = false
      })
      return
    }
    
    componentAllocations.value.forEach(comp => {
      // Calculate proportion based on component allocation * efficiency
      const effectiveAllocation = comp.allocatedNM.mul(agglomerator.value.efficiency)
      comp.proportion = effectiveAllocation.div(totalEffectiveAllocation).mul(100).toNumber()
    })
  }
  
  function checkPerfectRatios() {
    if (!activeNebula.value) return
    
    const config = nebulaConfigurations.value.find(c => c.type === activeNebula.value)
    if (!config) return
    
    const tolerance = 0.5 // ±0.5% tolerance for perfect ratios
    
    componentAllocations.value.forEach(comp => {
      const perfectRatio = config.perfectRatios.find(r => r.component === comp.component)
      if (perfectRatio) {
        const diff = Math.abs(comp.proportion - perfectRatio.ratio)
        comp.isPerfect = diff <= tolerance
      } else {
        comp.isPerfect = false
      }
    })
  }
  
  function checkNebulaFormation() {
    // Check each nebula configuration to see if requirements are met
    for (const config of nebulaConfigurations.value) {
      if (config.discovered) continue
      
      const meetsRequirements = config.requirements.every(req => {
        const component = componentAllocations.value.find(c => c.component === req.component)
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
    
    // Auto-switch to better nebula based on current ratios
    checkForBetterNebula()
  }
  
  function checkForBetterNebula() {
    // Only auto-switch if we have some allocation
    if (totalAllocated.value.eq(0)) return
    
    // Check if current active nebula still meets its requirements
    let currentNebulaValid = false
    if (activeNebula.value) {
      const currentConfig = nebulaConfigurations.value.find(c => c.type === activeNebula.value)
      if (currentConfig) {
        currentNebulaValid = currentConfig.requirements.every(req => {
          const component = componentAllocations.value.find(c => c.component === req.component)
          if (!component) return false
          return component.proportion >= req.minPercent && component.proportion <= req.maxPercent
        })
      }
    }
    
    // Find all nebulae that meet their requirements with current ratios
    const validNebulae: NebulaType[] = []
    
    for (const nebulaType of discoveredNebulae.value) {
      const config = nebulaConfigurations.value.find(c => c.type === nebulaType)
      if (!config) continue
      
      // Check if current ratios meet this nebula's requirements
      const meetsRequirements = config.requirements.every(req => {
        const component = componentAllocations.value.find(c => c.component === req.component)
        if (!component) return false
        return component.proportion >= req.minPercent && component.proportion <= req.maxPercent
      })
      
      if (meetsRequirements) {
        validNebulae.push(nebulaType)
      }
    }
    
    // Auto-switching logic based on requirements
    if (validNebulae.length === 0) {
      // No valid nebulae - deactivate current if it's also invalid
      if (!currentNebulaValid && activeNebula.value) {
        const oldNebula = activeNebula.value
        activeNebula.value = null
        console.log(`Deactivated ${oldNebula} - no longer meets requirements`)
      }
    } else if (!currentNebulaValid || !activeNebula.value) {
      // Current nebula is invalid or no active nebula - switch to first valid one
      const newNebula = validNebulae[0]
      const oldNebula = activeNebula.value
      activeNebula.value = newNebula
      console.log(`Auto-switched from ${oldNebula || 'none'} to ${newNebula} - meets requirements`)
    } else if (validNebulae.length === 1 && validNebulae[0] !== activeNebula.value) {
      // Only one valid nebula and it's not current - switch to it
      const newNebula = validNebulae[0]
      const oldNebula = activeNebula.value
      activeNebula.value = newNebula
      console.log(`Auto-switched from ${oldNebula} to ${newNebula} - only valid option`)
    }
    // If current nebula is valid and multiple nebulae are valid, stay with current
    // This prevents unnecessary switching when multiple options are available
  }
  
  function calculatePerfectnessScore(config: NebulaConfiguration): number {
    let totalScore = 0
    let perfectCount = 0
    
    for (const perfectRatio of config.perfectRatios) {
      const component = componentAllocations.value.find(c => c.component === perfectRatio.component)
      if (!component) continue
      
      const difference = Math.abs(component.proportion - perfectRatio.ratio)
      
      // Perfect components get maximum score
      if (difference <= 0.5) {
        totalScore += 100
        perfectCount++
      } else {
        // Score decreases with distance from perfect ratio
        const score = Math.max(0, 100 - (difference * 2))
        totalScore += score
      }
    }
    
    // Bonus points for central component being perfect
    const centralComponent = componentAllocations.value.find(c => c.component === config.centralComponent)
    if (centralComponent) {
      const centralPerfectRatio = config.perfectRatios.find(r => r.component === config.centralComponent)
      if (centralPerfectRatio) {
        const centralDiff = Math.abs(centralComponent.proportion - centralPerfectRatio.ratio)
        if (centralDiff <= 0.5) {
          totalScore += 50 // Extra bonus for perfect central component
        }
      }
    }
    
    return totalScore / config.perfectRatios.length
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
    
    // Calculate perfect ratio bonuses
    const centralComponent = componentAllocations.value.find(c => c.component === config.centralComponent)
    const centralPerfectMultiplier = centralComponent?.isPerfect ? 3.0 : 1.0 // 3x bonus for perfect central
    
    const perfectComponents = componentAllocations.value.filter(c => c.isPerfect).length
    const perfectBonusMultiplier = 1 + (perfectComponents * 0.2) // +20% per perfect component
    
    return config.bonuses.map(bonus => ({
      ...bonus,
      scaledValue: bonus.baseValue * investmentMultiplier * centralPerfectMultiplier * perfectBonusMultiplier
    }))
  })
  
  const currentPenalties = computed(() => {
    if (!activeNebula.value) return []
    
    const config = nebulaConfigurations.value.find(c => c.type === activeNebula.value)
    if (!config) return []
    
    // Perfect ratios reduce penalties
    const perfectComponents = componentAllocations.value.filter(c => c.isPerfect).length
    const penaltyReduction = 1 - (perfectComponents * 0.1) // -10% penalty per perfect component
    
    return config.penalties.map(penalty => ({
      ...penalty,
      scaledValue: penalty.baseValue * Math.max(0.2, penaltyReduction) // Minimum 20% of original penalty
    }))
  })
  
  // Get agglomerator investment cost (increases exponentially)
  function getInvestmentCost(amount = 1): number {
    const baseCost = 10
    const currentInvestment = agglomerator.value.totalInvestedNM.toNumber()
    
    // Calculate cumulative cost for multiple investments
    let totalCost = 0
    for (let i = 0; i < amount; i++) {
      const investmentLevel = currentInvestment + i
      totalCost += Math.floor(baseCost * Math.pow(1.5, investmentLevel / 100))
    }
    
    return totalCost
  }
  
  // Reset agglomerator investments and get refund
  function resetInvestments(): boolean {
    // Calculate refund (50% of total investment)
    const refund = totalInvestment.value.mul(0.5).toNumber()
    
    // Reset agglomerator
    agglomerator.value = {
      totalInvestedNM: ZERO,
      level: 1,
      efficiency: 1.0
    }
    
    // Reset all component allocations
    componentAllocations.value.forEach(comp => {
      comp.allocatedNM = ZERO
      comp.proportion = 0
      comp.isPerfect = false
    })
    
    // Deactivate current nebula
    activeNebula.value = null
    
    // Give refund
    gameStore.nebularEssence += refund
    
    // Recalculate proportions (will all be 0)
    calculateProportions()
    
    return true
  }
  
  // Reset functions
  function reset() {
    agglomerator.value = {
      totalInvestedNM: ZERO,
      level: 1,
      efficiency: 1.0
    }
    componentAllocations.value.forEach(comp => {
      comp.allocatedNM = ZERO
      comp.proportion = 0
      comp.isPerfect = false
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
    agglomerator.value = {
      totalInvestedNM: ZERO,
      level: 1,
      efficiency: 1.0
    }
    componentAllocations.value.forEach(comp => {
      comp.allocatedNM = ZERO
      comp.proportion = 0
      comp.isPerfect = false
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
      agglomerator: {
        totalInvestedNM: agglomerator.value.totalInvestedNM.toString(),
        level: agglomerator.value.level,
        efficiency: agglomerator.value.efficiency
      },
      componentAllocations: componentAllocations.value.map(comp => ({
        component: comp.component,
        allocatedNM: comp.allocatedNM.toString(),
        proportion: comp.proportion,
        isPerfect: comp.isPerfect
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
      // Load agglomerator data
      if (saveData.agglomerator) {
        agglomerator.value = {
          totalInvestedNM: D(saveData.agglomerator.totalInvestedNM || 0),
          level: saveData.agglomerator.level || 1,
          efficiency: saveData.agglomerator.efficiency || 1.0
        }
      }
      
      // Load component allocation states
      if (saveData.componentAllocations && Array.isArray(saveData.componentAllocations)) {
        saveData.componentAllocations.forEach((savedComp: any) => {
          const component = componentAllocations.value.find(c => c.component === savedComp.component)
          if (component) {
            component.allocatedNM = D(savedComp.allocatedNM || 0)
            component.proportion = savedComp.proportion || 0
            component.isPerfect = savedComp.isPerfect || false
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
    agglomerator,
    componentAllocations,
    activeNebula,
    discoveredNebulae,
    nebulaConfigurations,
    
    // Computed
    totalInvestment,
    totalAllocated,
    availableAllocation,
    materialProductionRate,
    currentBonuses,
    currentPenalties,
    
    // Actions
    investInAgglomerator,
    allocateToComponent,
    canAllocateToComponent,
    canInvestInComponent,
    activateNebula,
    deactivateNebula,
    getInvestmentCost,
    resetInvestments,
    calculateProportions,
    checkPerfectRatios,
    checkNebulaFormation,
    tick,
    reset,
    softReset,
    
    // Save/Load
    save,
    load
  }
})