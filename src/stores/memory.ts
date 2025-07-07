import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { D, ONE } from '@/utils/decimal'
import type { 
  StarMemorySlot, 
  MemoryTarget, 
  FilamentMemoryTarget,
  NebulaMemoryTarget,
  RailRoadMemoryTarget,
  UpgradeMemoryTarget 
} from '@/types/memory'
import { useGameStore } from './gameState'
import { useNebulaStore } from './nebula'
import { useRailRoadStore } from './railroad'

export const useMemoryStore = defineStore('memory', () => {
  // Core state
  const unlocked = ref(false)
  const maxSlots = ref(1)
  const slots = ref<StarMemorySlot[]>([])
  const preservationBonus = ref(ONE)
  
  // Initialize slots
  function initializeSlots() {
    slots.value = []
    for (let i = 0; i < maxSlots.value; i++) {
      slots.value.push({
        id: `slot_${i}`,
        occupied: false,
        target: null,
        preservationRate: D(0.3), // Base 30% preservation
        priority: 0
      })
    }
  }
  
  // Computed values
  const currentSlots = computed(() => slots.value.length)
  const availableSlots = computed(() => slots.value.filter(slot => !slot.occupied).length)
  const occupiedSlots = computed(() => slots.value.filter(slot => slot.occupied))
  
  // Unlock conditions and slot management
  function checkUnlockConditions() {
    const gameStore = useGameStore()
    
    // Unlock at 3 Starlight
    if (gameStore.starlight.amount.gte(3) && !unlocked.value) {
      unlocked.value = true
      initializeSlots()
    }
    
    // Slot expansion based on Starlight
    const currentStarlight = gameStore.starlight.amount.toNumber()
    let newMaxSlots = 1
    
    if (currentStarlight >= 15) {
      newMaxSlots = 3 // +2 slots at 15 Starlight
    } else if (currentStarlight >= 8) {
      newMaxSlots = 2 // +1 slot at 8 Starlight
    }
    
    if (currentStarlight >= 25) {
      newMaxSlots = 5 // Maximum 5 slots at 25 Starlight
    }
    
    if (newMaxSlots > maxSlots.value) {
      maxSlots.value = newMaxSlots
      // Add new slots
      while (slots.value.length < maxSlots.value) {
        slots.value.push({
          id: `slot_${slots.value.length}`,
          occupied: false,
          target: null,
          preservationRate: D(0.3),
          priority: 0
        })
      }
    }
    
    // Update preservation bonus based on Starlight
    if (currentStarlight >= 8) {
      preservationBonus.value = D(1.2) // ^1.2 preservation rate at 8 Starlight
    }
  }
  
  // Target creation functions
  function createFilamentTarget(tier: number, evolutionStage: number): FilamentMemoryTarget {
    const gameStore = useGameStore()
    const filament = gameStore.filaments[tier]
    
    return {
      type: 'filament',
      id: `filament_${tier}`,
      name: `${filament.name} (Evolution ${evolutionStage})`,
      preservationRate: D(0.5), // 50% preservation for evolution
      tier,
      evolutionStage
    }
  }
  
  function createNebulaTarget(pattern: string, positions: { x: number; y: number }[], filamentTypes: number[]): NebulaMemoryTarget {
    return {
      type: 'nebula',
      id: `nebula_${pattern}`,
      name: `${pattern} Pattern`,
      preservationRate: ONE, // Full preservation for 1 pattern
      pattern,
      gridPosition: positions,
      filamentTypes
    }
  }
  
  function createRailRoadTarget(constellation: any, stations: string[], enhancements: Map<string, number>): RailRoadMemoryTarget {
    return {
      type: 'railroad',
      id: `railroad_${constellation}`,
      name: `${constellation} Constellation`,
      preservationRate: D(0.3), // 30% preservation for path
      constellation,
      stations,
      enhancements
    }
  }
  
  function createUpgradeTarget(branch: string, upgrades: string[]): UpgradeMemoryTarget {
    return {
      type: 'upgrades',
      id: `upgrade_${branch}`,
      name: `${branch} Branch`,
      preservationRate: D(0.25), // 25% preservation for upgrades
      branch,
      upgrades
    }
  }
  
  // Slot management
  function assignTarget(slotId: string, target: MemoryTarget): boolean {
    const slot = slots.value.find(s => s.id === slotId)
    if (!slot || slot.occupied) return false
    
    slot.target = target
    slot.occupied = true
    slot.preservationRate = target.preservationRate.mul(preservationBonus.value)
    
    return true
  }
  
  function removeTarget(slotId: string): boolean {
    const slot = slots.value.find(s => s.id === slotId)
    if (!slot || !slot.occupied) return false
    
    slot.target = null
    slot.occupied = false
    slot.preservationRate = D(0.3)
    slot.priority = 0
    
    return true
  }
  
  function setPriorityPreservation(slotId: string): boolean {
    const gameStore = useGameStore()
    
    // Only available at 15 Starlight
    if (gameStore.starlight.amount.lt(15)) return false
    
    const slot = slots.value.find(s => s.id === slotId)
    if (!slot || !slot.target) return false
    
    // Set 100% preservation (uses 1 slot)
    slot.preservationRate = ONE
    slot.priority = 1
    
    return true
  }
  
  // Preservation application during reset
  function applyPreservation() {
    try {
      const gameStore = useGameStore()
      
      occupiedSlots.value.forEach(slot => {
        if (!slot.target) return
        
        const rate = slot.preservationRate.toNumber()
        
        switch (slot.target.type) {
          case 'filament':
            const filamentTarget = slot.target as FilamentMemoryTarget
            const filament = gameStore.filaments[filamentTarget.tier]
            if (filament) {
              // Preserve evolution stage with rate
              filament.evolution = Math.floor(filamentTarget.evolutionStage * rate)
            }
            break
            
          case 'nebula':
            try {
              const nebulaStore = useNebulaStore()
              const nebulaTarget = slot.target as NebulaMemoryTarget
              if (rate >= 1.0) {
                // Full preservation - restore exact pattern
                nebulaStore.restorePattern(nebulaTarget.pattern, nebulaTarget.gridPosition, nebulaTarget.filamentTypes)
              }
            } catch {
              // Nebula store not available
            }
            break
            
          case 'railroad':
            try {
              const railRoadStore = useRailRoadStore()
              const railRoadTarget = slot.target as RailRoadMemoryTarget
              if (rate > 0) {
                // Preserve partial constellation progress
                railRoadStore.preserveConstellation(railRoadTarget.constellation, rate)
              }
            } catch {
              // Railroad store not available
            }
            break
            
          case 'upgrades':
            // const upgradeTarget = slot.target as UpgradeMemoryTarget
            if (rate > 0) {
              // Preserve partial upgrade progress (will be implemented with upgrade system)
              // upgradeStore.preserveBranch(upgradeTarget.branch, rate)
            }
            break
        }
      })
    } catch {
      // Game store not available
    }
  }
  
  // Get available targets for assignment
  function getAvailableTargets(): MemoryTarget[] {
    const targets: MemoryTarget[] = []
    
    try {
      const gameStore = useGameStore()
      
      // Filament targets (evolved filaments)
      gameStore.filaments.forEach((filament, index) => {
        if (filament.evolution > 0) {
          targets.push(createFilamentTarget(index, filament.evolution))
        }
      })
      
      // Nebula targets (active patterns)
      try {
        const nebulaStore = useNebulaStore()
        const activePatternData = nebulaStore.getActivePatternData()
        activePatternData.forEach(pattern => {
          if (pattern) {
            // Convert NebulaType enum to numbers for storage
            const filamentTypeNumbers = pattern.filamentTypes.map(type => typeof type === 'number' ? type : 0)
            targets.push(createNebulaTarget(pattern.type, pattern.positions, filamentTypeNumbers))
          }
        })
      } catch {
        // Nebula store not available yet
      }
      
      // Railroad targets (active constellations)
      try {
        const railRoadStore = useRailRoadStore()
        railRoadStore.activeConstellations.forEach(constellation => {
          const constellationData = railRoadStore.constellations.get(constellation)
          if (constellationData) {
            const stations = constellationData.stations.filter(s => s.unlocked).map(s => s.id)
            const enhancements = new Map(constellationData.stations.map(s => [s.id, s.visitCount]))
            targets.push(createRailRoadTarget(constellation, stations, enhancements))
          }
        })
      } catch {
        // Railroad store not available yet
      }
    } catch {
      // Game store not available yet
    }
    
    return targets
  }
  
  // Save/Load functions
  function save() {
    return {
      unlocked: unlocked.value,
      maxSlots: maxSlots.value,
      slots: slots.value.map(slot => ({
        id: slot.id,
        occupied: slot.occupied,
        target: slot.target,
        preservationRate: slot.preservationRate.toString(),
        priority: slot.priority
      })),
      preservationBonus: preservationBonus.value.toString()
    }
  }
  
  function load(saveData: any) {
    if (!saveData) return
    
    unlocked.value = saveData.unlocked || false
    maxSlots.value = saveData.maxSlots || 1
    preservationBonus.value = D(saveData.preservationBonus || 1)
    
    if (saveData.slots) {
      slots.value = saveData.slots.map((slotData: any) => ({
        id: slotData.id,
        occupied: slotData.occupied || false,
        target: slotData.target,
        preservationRate: D(slotData.preservationRate || 0.3),
        priority: slotData.priority || 0
      }))
    } else {
      initializeSlots()
    }
  }
  
  function reset() {
    unlocked.value = false
    maxSlots.value = 1
    slots.value = []
    preservationBonus.value = ONE
  }
  
  // Auto-check unlock conditions
  function tick() {
    checkUnlockConditions()
  }
  
  return {
    // State
    unlocked,
    maxSlots,
    slots,
    preservationBonus,
    
    // Computed
    currentSlots,
    availableSlots,
    occupiedSlots,
    
    // Actions
    initializeSlots,
    checkUnlockConditions,
    assignTarget,
    removeTarget,
    setPriorityPreservation,
    applyPreservation,
    getAvailableTargets,
    createFilamentTarget,
    createNebulaTarget,
    createRailRoadTarget,
    createUpgradeTarget,
    tick,
    save,
    load,
    reset
  }
})