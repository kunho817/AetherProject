import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { D, ZERO, ONE } from '@/utils/decimal'
import type { Decimal } from '@/utils/decimal'
import { NebulaComponent } from '@/types/nebula'
import type { ComponentInventory, ComponentPurchaseOption } from '@/types/nebulaUpgrades'
import { componentBaseCosts, componentScalingFactors } from '@/config/nebulaUpgrades'

export const useComponentInventoryStore = defineStore('componentInventory', () => {
  // Component inventory state
  const inventory = ref<ComponentInventory>({
    [NebulaComponent.HYDROGEN]: ZERO,
    [NebulaComponent.HELIUM]: ZERO,
    [NebulaComponent.CARBON]: ZERO,
    [NebulaComponent.NITROGEN]: ZERO,
    [NebulaComponent.OXYGEN]: ZERO,
    [NebulaComponent.SILICON]: ZERO,
    [NebulaComponent.IRON]: ZERO
  })

  // Track purchase count for cost scaling
  const purchaseCount = ref<Record<NebulaComponent, number>>({
    [NebulaComponent.HYDROGEN]: 0,
    [NebulaComponent.HELIUM]: 0,
    [NebulaComponent.CARBON]: 0,
    [NebulaComponent.NITROGEN]: 0,
    [NebulaComponent.OXYGEN]: 0,
    [NebulaComponent.SILICON]: 0,
    [NebulaComponent.IRON]: 0
  })

  // Applied cost reduction multipliers (from upgrades)
  const costReductionMultipliers = ref<Record<NebulaComponent, number>>({
    [NebulaComponent.HYDROGEN]: 1.0,
    [NebulaComponent.HELIUM]: 1.0,
    [NebulaComponent.CARBON]: 1.0,
    [NebulaComponent.NITROGEN]: 1.0,
    [NebulaComponent.OXYGEN]: 1.0,
    [NebulaComponent.SILICON]: 1.0,
    [NebulaComponent.IRON]: 1.0
  })

  // Bulk purchase multipliers (from upgrades)
  const bulkPurchaseOptions = ref<number[]>([1, 10]) // Default: 1x, upgrade unlocks 10x

  // Get current cost for a component
  function getComponentCost(component: NebulaComponent, amount: number = 1): Decimal {
    const baseCost = componentBaseCosts[component]
    const scalingFactor = componentScalingFactors[component]
    const currentPurchases = purchaseCount.value[component]
    const reductionMultiplier = costReductionMultipliers.value[component]

    let totalCost = ZERO
    for (let i = 0; i < amount; i++) {
      const purchaseLevel = currentPurchases + i
      const cost = D(baseCost).mul(D(scalingFactor).pow(purchaseLevel)).mul(reductionMultiplier)
      totalCost = totalCost.add(cost)
    }

    return totalCost
  }

  // Get purchase options for a component
  function getComponentPurchaseOptions(component: NebulaComponent): ComponentPurchaseOption[] {
    return bulkPurchaseOptions.value.map(amount => ({
      component,
      amount,
      baseCost: D(componentBaseCosts[component]),
      scalingFactor: componentScalingFactors[component],
      currentCost: getComponentCost(component, amount)
    }))
  }

  // Check if can afford component purchase
  function canAffordComponent(component: NebulaComponent, amount: number, availableNM: Decimal): boolean {
    return availableNM.gte(getComponentCost(component, amount))
  }

  // Purchase components
  function purchaseComponent(component: NebulaComponent, amount: number): Decimal {
    const cost = getComponentCost(component, amount)
    
    // Add to inventory
    inventory.value[component] = inventory.value[component].add(amount)
    
    // Update purchase count for cost scaling
    purchaseCount.value[component] += amount
    
    return cost
  }

  // Spend components (for upgrades)
  function spendComponents(costs: Partial<ComponentInventory>): boolean {
    // Check if we have enough of each component
    for (const [component, required] of Object.entries(costs)) {
      const componentType = component as NebulaComponent
      if (required && inventory.value[componentType].lt(required)) {
        return false
      }
    }

    // Spend the components
    for (const [component, required] of Object.entries(costs)) {
      const componentType = component as NebulaComponent
      if (required) {
        inventory.value[componentType] = inventory.value[componentType].sub(required)
      }
    }

    return true
  }

  // Check if can afford component costs
  function canAffordComponents(costs: Partial<ComponentInventory>): boolean {
    for (const [component, required] of Object.entries(costs)) {
      const componentType = component as NebulaComponent
      if (required && inventory.value[componentType].lt(required)) {
        return false
      }
    }
    return true
  }

  // Apply cost reduction upgrade
  function applyCostReduction(component: NebulaComponent, multiplier: number): void {
    costReductionMultipliers.value[component] *= multiplier
  }

  // Unlock bulk purchase option
  function unlockBulkPurchase(multiplier: number): void {
    if (!bulkPurchaseOptions.value.includes(multiplier)) {
      bulkPurchaseOptions.value.push(multiplier)
      bulkPurchaseOptions.value.sort((a, b) => a - b)
    }
  }

  // Get total components owned
  const totalComponentsOwned = computed(() => {
    return Object.values(inventory.value).reduce((total, amount) => total.add(amount), ZERO)
  })

  // Get component by type
  function getComponentAmount(component: NebulaComponent): Decimal {
    return inventory.value[component]
  }

  // Migration function to convert from old allocation system
  function migrateFromAllocations(allocations: Record<NebulaComponent, Decimal>): void {
    Object.entries(allocations).forEach(([component, allocated]) => {
      const componentType = component as NebulaComponent
      // Convert allocated NM to component count (rough approximation)
      const estimatedComponents = Math.floor(allocated.div(componentBaseCosts[componentType]).toNumber())
      inventory.value[componentType] = D(estimatedComponents)
      purchaseCount.value[componentType] = estimatedComponents
    })
  }

  // Save/Load functions
  function save() {
    return {
      inventory: Object.fromEntries(
        Object.entries(inventory.value).map(([k, v]) => [k, v.toString()])
      ),
      purchaseCount: { ...purchaseCount.value },
      costReductionMultipliers: { ...costReductionMultipliers.value },
      bulkPurchaseOptions: [...bulkPurchaseOptions.value]
    }
  }

  function load(data: any): void {
    if (data.inventory) {
      Object.entries(data.inventory).forEach(([component, amount]) => {
        const componentType = component as NebulaComponent
        inventory.value[componentType] = D(amount as string)
      })
    }

    if (data.purchaseCount) {
      Object.assign(purchaseCount.value, data.purchaseCount)
    }

    if (data.costReductionMultipliers) {
      Object.assign(costReductionMultipliers.value, data.costReductionMultipliers)
    }

    if (data.bulkPurchaseOptions) {
      bulkPurchaseOptions.value = [...data.bulkPurchaseOptions]
    }
  }

  // Reset function
  function reset(): void {
    Object.keys(inventory.value).forEach(component => {
      const componentType = component as NebulaComponent
      inventory.value[componentType] = ZERO
      purchaseCount.value[componentType] = 0
      costReductionMultipliers.value[componentType] = 1.0
    })
    bulkPurchaseOptions.value = [1]
  }

  return {
    // State
    inventory,
    purchaseCount,
    costReductionMultipliers,
    bulkPurchaseOptions,

    // Computed
    totalComponentsOwned,

    // Actions
    getComponentCost,
    getComponentPurchaseOptions,
    canAffordComponent,
    purchaseComponent,
    spendComponents,
    canAffordComponents,
    applyCostReduction,
    unlockBulkPurchase,
    getComponentAmount,
    migrateFromAllocations,

    // Persistence
    save,
    load,
    reset
  }
})