import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { D, ZERO } from '@/utils/decimal'
import type { Decimal } from '@/utils/decimal'
import { NebulaComponent, NebulaType } from '@/types/nebula'
import { useGameStore } from './gameState'
import { useComponentInventoryStore } from './componentInventory'
import { useNebulaUpgradeTreeStore } from './nebulaUpgradeTree'

export const useNebulaStore = defineStore('nebula', () => {
  const gameStore = useGameStore()
  const componentStore = useComponentInventoryStore()
  const upgradeTreeStore = useNebulaUpgradeTreeStore()
  
  // Nebula Material - available for component purchases
  const nebulaMaterial = computed(() => D(gameStore.nebularEssence))
  
  // Legacy compatibility for migration
  const legacyTotalInvestment = ref<Decimal>(ZERO)
  
  // Nebula state - now based on unlocked status from upgrade tree
  const discoveredNebulae = computed(() => upgradeTreeStore.unlockedNebulaTypes)
  
  // New upgrade-based bonus system
  const activeUpgradeEffects = computed(() => {
    return upgradeTreeStore.activeEffects
  })
  
  // NM production rate with upgrade bonuses
  const materialProductionRate = computed(() => {
    // Base NM production based on filament purchases (0.1% of total filament value)
    const filamentValue = gameStore.filaments.reduce((total, filament, index) => {
      const cost = gameStore.getFilamentCost(index)
      return total.add(cost.mul(filament.purchased))
    }, ZERO)
    
    // Apply upgrade effects for NM production
    let baseRate = filamentValue.mul(0.001)
    
    activeUpgradeEffects.value.forEach(effect => {
      if (effect.type === 'production_multiplier' && effect.target === 'nebula_material') {
        baseRate = baseRate.mul(effect.value)
      }
    })
    
    return baseRate
  })
  
  // Component purchase functions
  function purchaseComponent(component: NebulaComponent, amount: number = 1): boolean {
    const cost = componentStore.getComponentCost(component, amount)
    
    if (nebulaMaterial.value.lt(cost)) {
      return false
    }
    
    // Purchase components
    const actualCost = componentStore.purchaseComponent(component, amount)
    gameStore.nebularEssence -= actualCost.toNumber()
    
    return true
  }
  
  function canAffordComponent(component: NebulaComponent, amount: number = 1): boolean {
    return componentStore.canAffordComponent(component, amount, nebulaMaterial.value)
  }
  
  function getComponentCost(component: NebulaComponent, amount: number = 1): Decimal {
    return componentStore.getComponentCost(component, amount)
  }
  
  function getComponentAmount(component: NebulaComponent): Decimal {
    return componentStore.getComponentAmount(component)
  }
  
  // Upgrade purchase functions
  function purchaseUpgrade(upgradeId: string): boolean {
    const result = upgradeTreeStore.purchaseUpgrade(upgradeId, nebulaMaterial.value)
    
    if (result.success) {
      // Deduct NM cost if any
      if (result.nmCost.gt(0)) {
        gameStore.nebularEssence -= result.nmCost.toNumber()
      }
      return true
    }
    
    return false
  }
  
  function canAffordUpgrade(upgradeId: string): boolean {
    const upgrade = upgradeTreeStore.findUpgradeById(upgradeId)
    if (!upgrade) return false
    
    return upgradeTreeStore.canAffordUpgrade(upgrade, nebulaMaterial.value)
  }
  
  // Unlock nebula (through upgrade purchase)
  function unlockNebula(nebulaType: NebulaType): boolean {
    const unlockUpgradeId = `coordinator_unlock_${nebulaType.toLowerCase()}`
    return purchaseUpgrade(unlockUpgradeId)
  }
  
  // Get current bonuses from all active upgrades
  const currentBonuses = computed(() => {
    const bonuses: any[] = []
    
    activeUpgradeEffects.value.forEach(effect => {
      switch (effect.type) {
        case 'nebula_bonus_multiplier':
          bonuses.push({
            type: 'production_multiplier',
            target: effect.target,
            value: effect.value,
            description: effect.description,
            source: 'upgrade'
          })
          break
        case 'production_multiplier':
          bonuses.push({
            type: 'production_multiplier',
            target: effect.target,
            value: effect.value,
            description: effect.description,
            source: 'upgrade'
          })
          break
        case 'cost_reduction':
          bonuses.push({
            type: 'cost_reduction',
            target: effect.target,
            value: effect.value,
            description: effect.description,
            source: 'upgrade'
          })
          break
        case 'global_component_bonus':
          bonuses.push({
            type: 'production_multiplier',
            target: 'all_components',
            value: effect.value,
            description: effect.description,
            source: 'upgrade'
          })
          break
      }
    })
    
    return bonuses
  })
  
  // Get current penalties (mostly from reduced upgrade penalties)
  const currentPenalties = computed(() => {
    const penalties: any[] = []
    
    activeUpgradeEffects.value.forEach(effect => {
      if (effect.type === 'nebula_penalty_reduction') {
        // This represents a reduction in penalty, so we track the remaining penalty
        const remainingPenalty = 1 - effect.value
        if (remainingPenalty > 0) {
          penalties.push({
            type: 'penalty_reduction',
            target: effect.target,
            value: remainingPenalty,
            description: `Reduced ${effect.description}`,
            source: 'upgrade'
          })
        }
      }
    })
    
    return penalties
  })
  
  // Migration function from old allocation system
  function migrateFromLegacySystem(legacyData: any): void {
    // Extract total investment for reference
    if (legacyData.agglomerator?.totalInvestedNM) {
      legacyTotalInvestment.value = D(legacyData.agglomerator.totalInvestedNM)
    }
    
    // Convert component allocations to component inventory
    if (legacyData.componentAllocations) {
      const allocations: Record<NebulaComponent, Decimal> = {
        [NebulaComponent.HYDROGEN]: ZERO,
        [NebulaComponent.HELIUM]: ZERO,
        [NebulaComponent.CARBON]: ZERO,
        [NebulaComponent.NITROGEN]: ZERO,
        [NebulaComponent.OXYGEN]: ZERO,
        [NebulaComponent.SILICON]: ZERO,
        [NebulaComponent.IRON]: ZERO
      }
      
      legacyData.componentAllocations.forEach((comp: any) => {
        if (comp.allocatedNM) {
          allocations[comp.component as NebulaComponent] = D(comp.allocatedNM)
        }
      })
      
      componentStore.migrateFromAllocations(allocations)
    }
    
    // Convert discovered nebulae to unlocked nebulae
    if (legacyData.discoveredNebulae) {
      upgradeTreeStore.migrateFromOldSystem(legacyData.discoveredNebulae)
    }
    
    console.log('Migrated from legacy Nebula Coordination system')
  }
  
  // Production tick - generate NM from filaments
  function tick(deltaTime: number) {
    const production = materialProductionRate.value.mul(deltaTime).toNumber()
    gameStore.nebularEssence += production
    
    // Update available purchases in upgrade tree
    upgradeTreeStore.updateAvailablePurchases(nebulaMaterial.value)
  }
  
  // Reset functions
  function reset(): void {
    legacyTotalInvestment.value = ZERO
    componentStore.reset()
    upgradeTreeStore.reset()
    gameStore.nebularEssence = 0
  }
  
  function softReset(): void {
    // Keep discovered nebulae and component inventory, reset only temporary state
    // In the new system, this might reset component inventory but keep unlock progress
    componentStore.reset()
  }
  
  // Save/Load functions
  function save() {
    return {
      legacyTotalInvestment: legacyTotalInvestment.value.toString(),
      // Component inventory and upgrade tree save themselves
      migrationComplete: true
    }
  }
  
  function load(saveData: any): void {
    if (!saveData) return
    
    try {
      // Check if this is legacy data that needs migration
      if (!saveData.migrationComplete && (saveData.agglomerator || saveData.componentAllocations)) {
        migrateFromLegacySystem(saveData)
        return
      }
      
      // Load new system data
      if (saveData.legacyTotalInvestment) {
        legacyTotalInvestment.value = D(saveData.legacyTotalInvestment)
      }
      
    } catch (error) {
      console.error('Failed to load Nebula store data:', error)
      reset()
    }
  }
  
  return {
    // State
    nebulaMaterial,
    legacyTotalInvestment,
    discoveredNebulae,
    
    // Computed
    materialProductionRate,
    currentBonuses,
    currentPenalties,
    activeUpgradeEffects,
    
    // Component actions
    purchaseComponent,
    canAffordComponent,
    getComponentCost,
    getComponentAmount,
    
    // Upgrade actions
    purchaseUpgrade,
    canAffordUpgrade,
    unlockNebula,
    
    // System actions
    tick,
    reset,
    softReset,
    migrateFromLegacySystem,
    
    // Save/Load
    save,
    load
  }
})