import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { D, ONE } from '@/utils/decimal'
import type { 
  Upgrade, 
  UpgradeBranch
} from '@/types/upgrades'
import { UpgradeBranch as UB, UpgradeType as UT } from '@/types/upgrades'
import { useGameStore } from './gameState'

export const useUpgradeStore = defineStore('upgrades', () => {
  // Core state
  const unlocked = ref(false)
  const selectedPaths = ref(new Map<UpgradeBranch, string[]>())
  const purchasedUpgrades = ref(new Set<string>())
  const totalStarlightSpent = ref(D(0))
  const pathLocked = ref(false)
  
  // Upgrade data - Star Core hub with 4 major branches
  const upgradeData = ref<Map<string, Upgrade>>(new Map())
  
  // Initialize upgrade tree from concept document
  function initializeUpgrades() {
    const upgrades: Upgrade[] = [
      // Star Core (starting point)
      {
        id: 'star_core',
        name: 'Star Core',
        description: 'The heart of stellar evolution - starting point for all upgrade paths',
        branch: UB.PRODUCTION, // Belongs to all branches conceptually
        tier: 0,
        cost: D(0),
        costType: 'starlight',
        unlockCondition: { starlight: 1, prerequisites: [] },
        effects: [],
        purchased: true, // Always available
        unlocked: true,
        position: { x: 0, y: 0 } // Center position
      },
      
      // PRODUCTION BRANCH: "Heart of the Star"
      {
        id: 'fusion_ignition',
        name: 'Fusion Ignition',
        description: 'Stellar core ignition accelerates all production',
        branch: UB.PRODUCTION,
        tier: 1,
        cost: D(2),
        costType: 'starlight',
        unlockCondition: { starlight: 2, prerequisites: ['star_core'] },
        effects: [{
          type: UT.PRODUCTION,
          value: D(8),
          target: 'all',
          description: 'Production ×8'
        }],
        purchased: false,
        unlocked: false,
        position: { x: -200, y: -150 }
      },
      {
        id: 'star_pulse',
        name: 'Star Pulse',
        description: 'Rhythmic stellar pulsations enhance milestone achievements',
        branch: UB.PRODUCTION,
        tier: 2,
        cost: D(5),
        costType: 'starlight',
        unlockCondition: { starlight: 5, prerequisites: ['fusion_ignition'] },
        effects: [{
          type: UT.MULTIPLIER,
          value: D(1.5),
          target: 'milestones',
          description: 'Milestone effect ^1.5'
        }],
        purchased: false,
        unlocked: false,
        position: { x: -300, y: -250 }
      },
      {
        id: 'photon_acceleration',
        name: 'Photon Acceleration',
        description: 'Light-speed processes accelerate production time flow',
        branch: UB.PRODUCTION,
        tier: 3,
        cost: D(8),
        costType: 'starlight',
        unlockCondition: { starlight: 8, prerequisites: ['star_pulse'] },
        effects: [{
          type: UT.SPECIAL,
          value: D(4),
          target: 'production_time',
          description: 'Time ×4 (production only)'
        }],
        purchased: false,
        unlocked: false,
        position: { x: -400, y: -350 }
      },
      {
        id: 'supernova_energy',
        name: 'Supernova Energy',
        description: 'Harness supernova power for massive production gains',
        branch: UB.PRODUCTION,
        tier: 4,
        cost: D(15),
        costType: 'starlight',
        unlockCondition: { starlight: 15, prerequisites: ['photon_acceleration'] },
        effects: [
          {
            type: UT.PRODUCTION,
            value: D(1.3),
            target: 'all',
            description: 'Production ^1.3'
          },
          {
            type: UT.SPECIAL,
            value: D(0.5),
            target: 'pulsation_cycle',
            description: 'Pulsation cycle ^0.5'
          }
        ],
        purchased: false,
        unlocked: false,
        position: { x: -500, y: -450 }
      },
      
      // SYSTEM BRANCH: "Shoulders of the Universe"
      {
        id: 'cosmic_network',
        name: 'Cosmic Network',
        description: 'Interconnected cosmic systems amplify synergistic effects',
        branch: UB.SYSTEM,
        tier: 1,
        cost: D(3),
        costType: 'starlight',
        unlockCondition: { starlight: 3, prerequisites: ['star_core'] },
        effects: [{
          type: UT.SYNERGY,
          value: D(5),
          target: 'all',
          description: 'Synergy ×5'
        }],
        purchased: false,
        unlocked: false,
        position: { x: 200, y: -150 }
      },
      {
        id: 'dimensional_folding',
        name: 'Dimensional Folding',
        description: 'Fold space-time to concentrate system synergies',
        branch: UB.SYSTEM,
        tier: 2,
        cost: D(7),
        costType: 'starlight',
        unlockCondition: { starlight: 7, prerequisites: ['cosmic_network'] },
        effects: [{
          type: UT.SYNERGY,
          value: D(2),
          target: 'selected_system',
          description: 'Selected system synergy ^2'
        }],
        purchased: false,
        unlocked: false,
        position: { x: 300, y: -250 }
      },
      {
        id: 'multiple_paradox',
        name: 'Multiple Paradox',
        description: 'Paradoxical existence multiplies effects but introduces instability',
        branch: UB.SYSTEM,
        tier: 3,
        cost: D(12),
        costType: 'starlight',
        unlockCondition: { starlight: 12, prerequisites: ['dimensional_folding'] },
        effects: [
          {
            type: UT.MULTIPLIER,
            value: D(8),
            target: 'system_effects',
            description: 'System effect ×8'
          },
          {
            type: UT.SPECIAL,
            value: D(0.9),
            target: 'stability',
            description: 'Debuff occurs (10% production penalty)'
          }
        ],
        purchased: false,
        unlocked: false,
        position: { x: 400, y: -350 }
      },
      {
        id: 'cosmic_synchronize',
        name: 'Cosmic Synchronize',
        description: 'Perfect synchronization enables auto-optimization',
        branch: UB.SYSTEM,
        tier: 4,
        cost: D(20),
        costType: 'starlight',
        unlockCondition: { starlight: 20, prerequisites: ['multiple_paradox'] },
        effects: [
          {
            type: UT.AUTOMATION,
            value: D(1),
            target: 'optimization',
            description: 'Auto-optimization enabled'
          },
          {
            type: UT.MULTIPLIER,
            value: D(2),
            target: 'all_effects',
            description: 'Effect ×2'
          }
        ],
        purchased: false,
        unlocked: false,
        position: { x: 500, y: -450 }
      },
      
      // EVOLUTION BRANCH: "River of Time"
      {
        id: 'time_resonance',
        name: 'Time Resonance',
        description: 'Resonate with temporal flows to amplify Starburst effects',
        branch: UB.EVOLUTION,
        tier: 1,
        cost: D(4),
        costType: 'starlight',
        unlockCondition: { starlight: 4, prerequisites: ['star_core'] },
        effects: [{
          type: UT.MULTIPLIER,
          value: D(5),
          target: 'starburst',
          description: 'Starburst effect ×5'
        }],
        purchased: false,
        unlocked: false,
        position: { x: -200, y: 150 }
      },
      {
        id: 'quantum_invariance',
        name: 'Quantum Invariance',
        description: 'Quantum effects preserve more progress through resets',
        branch: UB.EVOLUTION,
        tier: 2,
        cost: D(9),
        costType: 'starlight',
        unlockCondition: { starlight: 9, prerequisites: ['time_resonance'] },
        effects: [{
          type: UT.SPECIAL,
          value: D(5),
          target: 'preservation',
          description: 'Preservation rate ×5'
        }],
        purchased: false,
        unlocked: false,
        position: { x: -300, y: 250 }
      },
      {
        id: 'dimensional_anchor',
        name: 'Dimensional Anchor',
        description: 'Anchor reality to prevent certain reset cycles',
        branch: UB.EVOLUTION,
        tier: 3,
        cost: D(14),
        costType: 'starlight',
        unlockCondition: { starlight: 14, prerequisites: ['quantum_invariance'] },
        effects: [{
          type: UT.SPECIAL,
          value: D(1),
          target: 'reset_skip',
          description: 'No reset every 3rd Starburst'
        }],
        purchased: false,
        unlocked: false,
        position: { x: -400, y: 350 }
      },
      {
        id: 'eternal_loop',
        name: 'Eternal Loop',
        description: 'Create temporal loops for automatic progress preservation',
        branch: UB.EVOLUTION,
        tier: 4,
        cost: D(25),
        costType: 'starlight',
        unlockCondition: { starlight: 25, prerequisites: ['dimensional_anchor'] },
        effects: [{
          type: UT.SPECIAL,
          value: D(0.4),
          target: 'auto_preservation',
          description: 'Progress auto-preservation ^0.4'
        }],
        purchased: false,
        unlocked: false,
        position: { x: -500, y: 450 }
      },
      
      // EXPANSION BRANCH: "Will of the Stars"
      {
        id: 'parallel_universe',
        name: 'Parallel Universe',
        description: 'Access parallel realities for simultaneous pulsation states',
        branch: UB.EXPANSION,
        tier: 1,
        cost: D(6),
        costType: 'starlight',
        unlockCondition: { starlight: 6, prerequisites: ['star_core'] },
        effects: [{
          type: UT.SPECIAL,
          value: D(1.5),
          target: 'pulsation_states',
          description: 'Pulsation states apply simultaneously ×1.5'
        }],
        purchased: false,
        unlocked: false,
        position: { x: 200, y: 150 }
      },
      {
        id: 'space_expansion',
        name: 'Space Expansion',
        description: 'Expand dimensional space for unlimited filament placement',
        branch: UB.EXPANSION,
        tier: 2,
        cost: D(10),
        costType: 'starlight',
        unlockCondition: { starlight: 10, prerequisites: ['parallel_universe'] },
        effects: [{
          type: UT.SPECIAL,
          value: D(1),
          target: 'grid_expansion',
          description: 'Grid allows same filament in all positions'
        }],
        purchased: false,
        unlocked: false,
        position: { x: 300, y: 250 }
      },
      {
        id: 'constellation_resonance',
        name: 'Constellation Resonance',
        description: 'Resonate with cosmic constellations for random boosts',
        branch: UB.EXPANSION,
        tier: 3,
        cost: D(16),
        costType: 'starlight',
        unlockCondition: { starlight: 16, prerequisites: ['space_expansion'] },
        effects: [{
          type: UT.SPECIAL,
          value: D(2),
          target: 'constellation_random',
          description: 'Random constellation effect ^2 per Starburst'
        }],
        purchased: false,
        unlocked: false,
        position: { x: 400, y: 350 }
      },
      {
        id: 'reality_expansion',
        name: 'Reality Expansion',
        description: 'Expand the very fabric of reality for enhanced progression',
        branch: UB.EXPANSION,
        tier: 4,
        cost: D(30),
        costType: 'starlight',
        unlockCondition: { starlight: 30, prerequisites: ['constellation_resonance'] },
        effects: [
          {
            type: UT.SPECIAL,
            value: D(1.5),
            target: 'filament_count',
            description: 'Filament purchase count ^1.5'
          },
          {
            type: UT.SPECIAL,
            value: D(0.8),
            target: 'milestone_criteria',
            description: 'Milestone criteria ^0.8'
          }
        ],
        purchased: false,
        unlocked: false,
        position: { x: 500, y: 450 }
      }
    ]
    
    // Initialize upgrade map
    upgradeData.value.clear()
    upgrades.forEach(upgrade => {
      upgradeData.value.set(upgrade.id, upgrade)
    })
    
    // Initialize selected paths
    selectedPaths.value.clear()
    Object.values(UB).forEach(branch => {
      selectedPaths.value.set(branch, [])
    })
  }
  
  // Computed values
  const availableUpgrades = computed(() => {
    return Array.from(upgradeData.value.values()).filter(upgrade => 
      upgrade.unlocked && !upgrade.purchased
    )
  })
  
  const purchasedUpgradesList = computed(() => {
    return Array.from(upgradeData.value.values()).filter(upgrade => upgrade.purchased)
  })
  
  const unlockedBranches = computed(() => {
    const gameStore = useGameStore()
    const starlight = gameStore.starlight.amount.toNumber()
    
    const branches: UpgradeBranch[] = []
    if (starlight >= 1) branches.push(UB.PRODUCTION, UB.SYSTEM, UB.EVOLUTION, UB.EXPANSION)
    return branches
  })
  
  // Get upgrade effects for other systems
  const getUpgradeBonus = computed(() => {
    return (target: string): { multiplier: typeof ONE, exponent: typeof ONE, special: any[] } => {
      let multiplier = ONE
      let exponent = ONE
      const special: any[] = []
      
      purchasedUpgradesList.value.forEach(upgrade => {
        upgrade.effects.forEach(effect => {
          if (effect.target === target || effect.target === 'all') {
            switch (effect.type) {
              case UT.PRODUCTION:
              case UT.MULTIPLIER:
                multiplier = multiplier.mul(effect.value)
                break
              case UT.EFFICIENCY:
                exponent = exponent.mul(effect.value)
                break
              case UT.SPECIAL:
                special.push({ type: effect.description, value: effect.value })
                break
            }
          }
        })
      })
      
      return { multiplier, exponent, special }
    }
  })
  
  // Unlock conditions and actions
  function checkUnlockConditions() {
    const gameStore = useGameStore()
    const starlight = gameStore.starlight.amount.toNumber()
    
    // Unlock system at first Starlight
    if (starlight >= 1 && !unlocked.value) {
      unlocked.value = true
    }
    
    upgradeData.value.forEach(upgrade => {
      if (!upgrade.unlocked && starlight >= upgrade.unlockCondition.starlight) {
        // Check prerequisites
        const prereqsMet = upgrade.unlockCondition.prerequisites.every(prereqId => 
          purchasedUpgrades.value.has(prereqId)
        )
        
        if (prereqsMet) {
          upgrade.unlocked = true
        }
      }
    })
  }
  
  function canPurchaseUpgrade(upgradeId: string): boolean {
    const upgrade = upgradeData.value.get(upgradeId)
    if (!upgrade || !upgrade.unlocked || upgrade.purchased) return false
    
    const gameStore = useGameStore()
    return gameStore.starlight.amount.gte(upgrade.cost)
  }
  
  function purchaseUpgrade(upgradeId: string): boolean {
    if (!canPurchaseUpgrade(upgradeId)) return false
    
    const upgrade = upgradeData.value.get(upgradeId)!
    const gameStore = useGameStore()
    
    // Deduct cost
    gameStore.starlight.amount = gameStore.starlight.amount.sub(upgrade.cost)
    totalStarlightSpent.value = totalStarlightSpent.value.add(upgrade.cost)
    
    // Mark as purchased
    upgrade.purchased = true
    purchasedUpgrades.value.add(upgradeId)
    
    // Add to selected path
    const branchPath = selectedPaths.value.get(upgrade.branch) || []
    branchPath.push(upgradeId)
    selectedPaths.value.set(upgrade.branch, branchPath)
    
    // Lock paths after first major branch upgrade (tier 1+)
    if (upgrade.tier >= 1 && !pathLocked.value) {
      pathLocked.value = true
    }
    
    return true
  }
  
  function resetUpgrades() {
    purchasedUpgrades.value.clear()
    totalStarlightSpent.value = D(0)
    pathLocked.value = false
    
    upgradeData.value.forEach(upgrade => {
      if (upgrade.id !== 'star_core') {
        upgrade.purchased = false
        upgrade.unlocked = false
      }
    })
    
    selectedPaths.value.clear()
    Object.values(UB).forEach(branch => {
      selectedPaths.value.set(branch, [])
    })
  }
  
  // Save/Load functions
  function save() {
    return {
      unlocked: unlocked.value,
      selectedPaths: Array.from(selectedPaths.value.entries()),
      purchasedUpgrades: Array.from(purchasedUpgrades.value),
      totalStarlightSpent: totalStarlightSpent.value.toString(),
      pathLocked: pathLocked.value
    }
  }
  
  function load(saveData: any) {
    if (!saveData) return
    
    unlocked.value = saveData.unlocked || false
    pathLocked.value = saveData.pathLocked || false
    totalStarlightSpent.value = D(saveData.totalStarlightSpent || 0)
    
    // Load purchased upgrades
    purchasedUpgrades.value.clear()
    if (saveData.purchasedUpgrades) {
      saveData.purchasedUpgrades.forEach((id: string) => {
        purchasedUpgrades.value.add(id)
        const upgrade = upgradeData.value.get(id)
        if (upgrade) {
          upgrade.purchased = true
        }
      })
    }
    
    // Load selected paths
    selectedPaths.value.clear()
    if (saveData.selectedPaths) {
      saveData.selectedPaths.forEach(([branch, path]: [UpgradeBranch, string[]]) => {
        selectedPaths.value.set(branch, path)
      })
    }
  }
  
  function tick() {
    checkUnlockConditions()
  }
  
  // Helper function to check if player has specific upgrade
  function hasUpgrade(upgradeId: string): boolean {
    return purchasedUpgrades.value.has(upgradeId)
  }
  
  // Initialize upgrades
  initializeUpgrades()
  
  return {
    // State
    unlocked,
    selectedPaths,
    purchasedUpgrades,
    totalStarlightSpent,
    pathLocked,
    upgradeData,
    
    // Computed
    availableUpgrades,
    purchasedUpgradesList,
    unlockedBranches,
    getUpgradeBonus,
    
    // Actions
    checkUnlockConditions,
    canPurchaseUpgrade,
    purchaseUpgrade,
    resetUpgrades,
    tick,
    save,
    load,
    hasUpgrade
  }
})