import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { D, ZERO } from '@/utils/decimal'
import type { Decimal } from '@/utils/decimal'
import { NebulaType, NebulaComponent } from '@/types/nebula'
import type {
  UpgradeNode,
  UpgradeNodeWithVisual,
  UpgradeType,
  UpgradeEffect,
  NebulaUpgradeTree,
  CoordinatorUpgradeTree,
  UpgradeTreeViewState,
  ComponentInventory
} from '@/types/nebulaUpgrades'
import {
  coordinatorUnlockUpgrades,
  coordinatorComponentUpgrades,
  coordinatorGlobalUpgrades,
  stellarNurseryUpgrades,
  planetaryNebulaUpgrades,
  supernovaRemnantUpgrades,
  darkNebulaUpgrades,
  reflectionNebulaUpgrades,
  emissionNebulaUpgrades,
  absorptionNebulaUpgrades
} from '@/config/nebulaUpgrades'
import { useComponentInventoryStore } from './componentInventory'

export const useNebulaUpgradeTreeStore = defineStore('nebulaUpgradeTree', () => {
  // Core state
  const purchasedUpgrades = ref<Set<string>>(new Set())
  const unlockedNebulae = ref<Set<NebulaType>>(new Set())
  
  // UI state
  const viewState = ref<UpgradeTreeViewState>({
    selectedType: 'coordinator',
    expandedNodes: new Set(),
    hoveredNode: null,
    canPurchase: new Set()
  })

  // Coordinator upgrade tree
  const coordinatorTree = ref<CoordinatorUpgradeTree>({
    upgrades: [
      ...Object.values(coordinatorUnlockUpgrades),
      ...coordinatorComponentUpgrades,
      ...coordinatorGlobalUpgrades
    ]
  })

  // Nebula upgrade trees
  const nebulaTrees = ref<Map<NebulaType, NebulaUpgradeTree>>(new Map([
    [NebulaType.STELLAR_NURSERY, {
      type: NebulaType.STELLAR_NURSERY,
      unlocked: false,
      baseUnlockCost: {
        [NebulaComponent.HYDROGEN]: D(100),
        [NebulaComponent.HELIUM]: D(50)
      },
      upgrades: stellarNurseryUpgrades
    }],
    [NebulaType.PLANETARY_NEBULA, {
      type: NebulaType.PLANETARY_NEBULA,
      unlocked: false,
      baseUnlockCost: {
        [NebulaComponent.CARBON]: D(80),
        [NebulaComponent.OXYGEN]: D(60)
      },
      upgrades: planetaryNebulaUpgrades
    }],
    [NebulaType.SUPERNOVA_REMNANT, {
      type: NebulaType.SUPERNOVA_REMNANT,
      unlocked: false,
      baseUnlockCost: {
        [NebulaComponent.IRON]: D(100),
        [NebulaComponent.SILICON]: D(75),
        [NebulaComponent.OXYGEN]: D(50)
      },
      upgrades: supernovaRemnantUpgrades
    }],
    [NebulaType.DARK_NEBULA, {
      type: NebulaType.DARK_NEBULA,
      unlocked: false,
      baseUnlockCost: {
        [NebulaComponent.CARBON]: D(150),
        [NebulaComponent.IRON]: D(80)
      },
      upgrades: darkNebulaUpgrades
    }],
    [NebulaType.REFLECTION_NEBULA, {
      type: NebulaType.REFLECTION_NEBULA,
      unlocked: false,
      baseUnlockCost: {
        [NebulaComponent.HELIUM]: D(200),
        [NebulaComponent.NITROGEN]: D(150),
        [NebulaComponent.SILICON]: D(100)
      },
      upgrades: reflectionNebulaUpgrades
    }],
    [NebulaType.EMISSION_NEBULA, {
      type: NebulaType.EMISSION_NEBULA,
      unlocked: false,
      baseUnlockCost: {
        [NebulaComponent.HYDROGEN]: D(250),
        [NebulaComponent.OXYGEN]: D(200),
        [NebulaComponent.NITROGEN]: D(100)
      },
      upgrades: emissionNebulaUpgrades
    }],
    [NebulaType.ABSORPTION_NEBULA, {
      type: NebulaType.ABSORPTION_NEBULA,
      unlocked: false,
      baseUnlockCost: {
        [NebulaComponent.HYDROGEN]: D(300),
        [NebulaComponent.HELIUM]: D(250),
        [NebulaComponent.CARBON]: D(200),
        [NebulaComponent.NITROGEN]: D(150),
        [NebulaComponent.OXYGEN]: D(150),
        [NebulaComponent.SILICON]: D(100),
        [NebulaComponent.IRON]: D(100)
      },
      upgrades: absorptionNebulaUpgrades
    }]
  ]))

  // Get component inventory store
  const componentStore = useComponentInventoryStore()

  // Get all active upgrade effects
  const activeEffects = computed((): UpgradeEffect[] => {
    const effects: UpgradeEffect[] = []
    
    // Coordinator effects
    coordinatorTree.value.upgrades.forEach(upgrade => {
      if (purchasedUpgrades.value.has(upgrade.id)) {
        effects.push(...upgrade.effects)
      }
    })

    // Nebula effects
    nebulaTrees.value.forEach(tree => {
      if (tree.unlocked) {
        tree.upgrades.forEach(upgrade => {
          if (purchasedUpgrades.value.has(upgrade.id)) {
            effects.push(...upgrade.effects)
          }
        })
      }
    })

    return effects
  })

  // Check if upgrade is available for purchase
  function isUpgradeAvailable(upgrade: UpgradeNodeWithVisual): boolean {
    // Already purchased
    if (purchasedUpgrades.value.has(upgrade.id)) {
      return false
    }

    // Check prerequisites
    if (upgrade.requires) {
      const hasAllPrereqs = upgrade.requires.every(reqId => 
        purchasedUpgrades.value.has(reqId)
      )
      if (!hasAllPrereqs) {
        return false
      }
    }

    return true
  }

  // Check if can afford upgrade
  function canAffordUpgrade(upgrade: UpgradeNodeWithVisual, availableNM: Decimal): boolean {
    if (!isUpgradeAvailable(upgrade)) {
      return false
    }

    // Check NM cost
    if (upgrade.cost.nm && availableNM.lt(upgrade.cost.nm)) {
      return false
    }

    // Check component costs
    if (upgrade.cost.components) {
      if (!componentStore.canAffordComponents(upgrade.cost.components)) {
        return false
      }
    }

    return true
  }

  // Purchase an upgrade
  function purchaseUpgrade(upgradeId: string, availableNM: Decimal): { success: boolean; nmCost: Decimal; error?: string } {
    const upgrade = findUpgradeById(upgradeId)
    if (!upgrade) {
      return { success: false, nmCost: ZERO, error: 'Upgrade not found' }
    }

    if (!canAffordUpgrade(upgrade, availableNM)) {
      return { success: false, nmCost: ZERO, error: 'Cannot afford upgrade' }
    }

    // Calculate costs
    const nmCost = upgrade.cost.nm || ZERO

    // Spend components if required
    if (upgrade.cost.components) {
      const componentSpent = componentStore.spendComponents(upgrade.cost.components)
      if (!componentSpent) {
        return { success: false, nmCost: ZERO, error: 'Failed to spend components' }
      }
    }

    // Mark as purchased
    purchasedUpgrades.value.add(upgradeId)

    // Apply effects
    applyUpgradeEffects(upgrade.effects)

    // Handle special unlock effects
    upgrade.effects.forEach(effect => {
      if (effect.type === 'unlock_nebula' && effect.target) {
        unlockNebula(effect.target as NebulaType)
      }
    })

    return { success: true, nmCost }
  }

  // Apply upgrade effects
  function applyUpgradeEffects(effects: UpgradeEffect[]): void {
    effects.forEach(effect => {
      switch (effect.type) {
        case 'component_cost_reduction':
          if (effect.target) {
            componentStore.applyCostReduction(effect.target as NebulaComponent, effect.value)
          }
          break
        case 'component_bulk_purchase':
          componentStore.unlockBulkPurchase(effect.value)
          break
        // Other effects will be applied by the game systems that read activeEffects
      }
    })
  }

  // Unlock a nebula
  function unlockNebula(nebulaType: NebulaType): void {
    unlockedNebulae.value.add(nebulaType)
    const tree = nebulaTrees.value.get(nebulaType)
    if (tree) {
      tree.unlocked = true
    }
  }

  // Find upgrade by ID
  function findUpgradeById(upgradeId: string): UpgradeNodeWithVisual | null {
    // Search coordinator tree
    const coordinatorUpgrade = coordinatorTree.value.upgrades.find(u => u.id === upgradeId)
    if (coordinatorUpgrade) {
      return coordinatorUpgrade
    }

    // Search nebula trees
    for (const tree of nebulaTrees.value.values()) {
      const nebulaUpgrade = tree.upgrades.find(u => u.id === upgradeId)
      if (nebulaUpgrade) {
        return nebulaUpgrade
      }
    }

    return null
  }

  // Get upgrades for a specific type
  function getUpgradesForType(type: UpgradeType): UpgradeNodeWithVisual[] {
    if (type === 'coordinator') {
      return coordinatorTree.value.upgrades
    } else {
      const tree = nebulaTrees.value.get(type as NebulaType)
      return tree ? tree.upgrades : []
    }
  }

  // Get unlocked nebula types
  const unlockedNebulaTypes = computed(() => {
    return Array.from(unlockedNebulae.value)
  })

  // Update available purchases
  function updateAvailablePurchases(availableNM: Decimal): void {
    const canPurchase = new Set<string>()
    
    // Check all upgrades
    const allUpgrades = [
      ...coordinatorTree.value.upgrades,
      ...Array.from(nebulaTrees.value.values()).flatMap(tree => tree.upgrades)
    ]

    allUpgrades.forEach(upgrade => {
      if (canAffordUpgrade(upgrade, availableNM)) {
        canPurchase.add(upgrade.id)
      }
    })

    viewState.value.canPurchase = canPurchase
  }

  // UI state management
  function setSelectedType(type: UpgradeType): void {
    viewState.value.selectedType = type
  }

  function toggleNodeExpansion(nodeId: string): void {
    if (viewState.value.expandedNodes.has(nodeId)) {
      viewState.value.expandedNodes.delete(nodeId)
    } else {
      viewState.value.expandedNodes.add(nodeId)
    }
  }

  function setHoveredNode(nodeId: string | null): void {
    viewState.value.hoveredNode = nodeId
  }

  // Migration function
  function migrateFromOldSystem(discoveredNebulae: NebulaType[]): void {
    // Auto-unlock discovered nebulae
    discoveredNebulae.forEach(nebulaType => {
      const unlockUpgradeId = `coordinator_unlock_${nebulaType.toLowerCase()}`
      purchasedUpgrades.value.add(unlockUpgradeId)
      unlockNebula(nebulaType)
    })
  }

  // Save/Load functions
  function save() {
    return {
      purchasedUpgrades: Array.from(purchasedUpgrades.value),
      unlockedNebulae: Array.from(unlockedNebulae.value),
      viewState: {
        selectedType: viewState.value.selectedType,
        expandedNodes: Array.from(viewState.value.expandedNodes)
      }
    }
  }

  function load(data: any): void {
    if (data.purchasedUpgrades) {
      purchasedUpgrades.value = new Set(data.purchasedUpgrades)
      
      // Reapply effects
      purchasedUpgrades.value.forEach(upgradeId => {
        const upgrade = findUpgradeById(upgradeId)
        if (upgrade) {
          applyUpgradeEffects(upgrade.effects)
        }
      })
    }

    if (data.unlockedNebulae) {
      unlockedNebulae.value = new Set(data.unlockedNebulae)
      
      // Update nebula tree unlock status
      data.unlockedNebulae.forEach((nebulaType: NebulaType) => {
        const tree = nebulaTrees.value.get(nebulaType)
        if (tree) {
          tree.unlocked = true
        }
      })
    }

    if (data.viewState) {
      viewState.value.selectedType = data.viewState.selectedType || 'coordinator'
      if (data.viewState.expandedNodes) {
        viewState.value.expandedNodes = new Set(data.viewState.expandedNodes)
      }
    }
  }

  // Reset function
  function reset(): void {
    purchasedUpgrades.value.clear()
    unlockedNebulae.value.clear()
    viewState.value = {
      selectedType: 'coordinator',
      expandedNodes: new Set(),
      hoveredNode: null,
      canPurchase: new Set()
    }

    // Reset nebula tree unlock status
    nebulaTrees.value.forEach(tree => {
      tree.unlocked = false
    })
  }

  return {
    // State
    purchasedUpgrades,
    unlockedNebulae,
    viewState,
    coordinatorTree,
    nebulaTrees,

    // Computed
    activeEffects,
    unlockedNebulaTypes,

    // Actions
    isUpgradeAvailable,
    canAffordUpgrade,
    purchaseUpgrade,
    unlockNebula,
    findUpgradeById,
    getUpgradesForType,
    updateAvailablePurchases,

    // UI State
    setSelectedType,
    toggleNodeExpansion,
    setHoveredNode,

    // Migration
    migrateFromOldSystem,

    // Persistence
    save,
    load,
    reset
  }
})