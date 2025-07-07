import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { D, ONE } from '@/utils/decimal'
import type { FilamentEvolution } from '@/types/game'
import { useGameStore } from './gameState'

export const useEvolutionStore = defineStore('evolution', () => {
  // Core state
  const unlockedStages = ref<Set<number>>(new Set([0])) // Stage 0 = no evolution
  const evolutionData = ref<Map<string, FilamentEvolution>>(new Map())
  
  // Initialize evolution data based on concept document
  function initializeEvolutions() {
    const evolutions: FilamentEvolution[] = [
      // Stage 1 Evolution
      {
        stage: 1,
        name: 'Stellar Awakening',
        description: 'First evolution stage - enhanced production and reduced costs',
        unlockCondition: {
          starlight: 5,
          purchases: 100,
          cost: D(1000) // Base Nebular Essence cost
        },
        effects: {
          productionExponent: D(1.5), // Production ^1.5
          costFactorReduction: D(0.05), // Cost increase factor -0.05
          hierarchySynergyMultiplier: ONE,
          gridAdjacencyBonus: ONE,
          uniqueAbility: undefined
        }
      },
      
      // Stage 2 Evolution
      {
        stage: 2,
        name: 'Cosmic Resonance',
        description: 'Second evolution stage - enhanced synergies and grid bonuses',
        unlockCondition: {
          starlight: 8,
          purchases: 100,
          cost: D(5000) // Higher Nebular Essence cost
        },
        effects: {
          productionExponent: D(1.5),
          costFactorReduction: D(0.05),
          hierarchySynergyMultiplier: D(3), // Hierarchy synergy efficiency ×3
          gridAdjacencyBonus: D(1.5), // Grid adjacency synergy ×1.5
          uniqueAbility: undefined
        }
      },
      
      // Stage 3 Evolution - Unique abilities per tier
      {
        stage: 3,
        name: 'Transcendent Form',
        description: 'Final evolution stage - unique tier-specific abilities',
        unlockCondition: {
          starlight: 18,
          purchases: 100,
          cost: D(25000) // Highest Nebular Essence cost
        },
        effects: {
          productionExponent: D(1.5),
          costFactorReduction: D(0.05),
          hierarchySynergyMultiplier: D(3),
          gridAdjacencyBonus: D(1.5),
          uniqueAbility: 'tier_specific' // Will be defined per tier
        }
      }
    ]
    
    evolutionData.value.clear()
    evolutions.forEach(evolution => {
      evolutionData.value.set(`stage_${evolution.stage}`, evolution)
    })
  }
  
  // Tier-specific unique abilities for Stage 3
  const tierUniqueAbilities = {
    0: 'Orion\'s Light: Base production ×5',
    1: 'Eagle\'s Swiftness: Production speed ×2',
    2: 'Crab\'s Tenacity: Cost reduction ^0.8',
    3: 'Horsehead\'s Power: Milestone threshold ^0.9',
    4: 'Trifid\'s Harmony: Synergy ×3',
    5: 'Planetary Influence: Grid effect ×2',
    6: 'Butterfly Effect: Random bonuses ×1.5',
    7: 'Reflection Mastery: Mirror adjacent effects',
    8: 'Dark Matter: Hidden production ×10',
    9: 'Remnant Supremacy: All production ^1.2'
  }
  
  // Computed values
  const availableEvolutions = computed(() => {
    const gameStore = useGameStore()
    const starlight = gameStore.starlight.amount.toNumber()
    
    const available: FilamentEvolution[] = []
    
    // Check stage unlocks
    if (starlight >= 5 && !unlockedStages.value.has(1)) {
      const stage1 = evolutionData.value.get('stage_1')
      if (stage1) available.push(stage1)
    }
    
    if (starlight >= 8 && !unlockedStages.value.has(2)) {
      const stage2 = evolutionData.value.get('stage_2')
      if (stage2) available.push(stage2)
    }
    
    if (starlight >= 18 && !unlockedStages.value.has(3)) {
      const stage3 = evolutionData.value.get('stage_3')
      if (stage3) available.push(stage3)
    }
    
    return available
  })
  
  // Check if filament can evolve to specific stage
  function canEvolveFilament(tier: number, stage: number): boolean {
    const gameStore = useGameStore()
    const filament = gameStore.filaments[tier]
    
    if (!filament || !unlockedStages.value.has(stage)) return false
    if (filament.evolution >= stage) return false
    if (filament.owned < 100) return false // Need 100+ purchases
    
    const evolution = evolutionData.value.get(`stage_${stage}`)
    if (!evolution) return false
    
    // Check Nebular Essence cost (tier-based scaling)
    const cost = evolution.unlockCondition.cost.mul(D(tier + 1))
    return gameStore.nebularEssence >= cost.toNumber()
  }
  
  function evolveFilament(tier: number, stage: number): boolean {
    if (!canEvolveFilament(tier, stage)) return false
    
    const gameStore = useGameStore()
    const filament = gameStore.filaments[tier]
    const evolution = evolutionData.value.get(`stage_${stage}`)!
    
    // Deduct cost
    const cost = evolution.unlockCondition.cost.mul(D(tier + 1))
    gameStore.nebularEssence -= cost.toNumber()
    
    // Apply evolution
    filament.evolution = stage
    
    return true
  }
  
  // Get evolution effects for a filament
  function getFilamentEvolutionEffects(tier: number) {
    const gameStore = useGameStore()
    const filament = gameStore.filaments[tier]
    
    if (!filament || filament.evolution === 0) {
      return {
        productionExponent: ONE,
        costFactorReduction: D(0),
        hierarchySynergyMultiplier: ONE,
        gridAdjacencyBonus: ONE,
        uniqueAbility: null
      }
    }
    
    const evolution = evolutionData.value.get(`stage_${filament.evolution}`)
    if (!evolution) {
      return {
        productionExponent: ONE,
        costFactorReduction: D(0),
        hierarchySynergyMultiplier: ONE,
        gridAdjacencyBonus: ONE,
        uniqueAbility: null
      }
    }
    
    let uniqueAbility = null
    if (filament.evolution === 3) {
      uniqueAbility = tierUniqueAbilities[tier as keyof typeof tierUniqueAbilities] || null
    }
    
    return {
      productionExponent: evolution.effects.productionExponent,
      costFactorReduction: evolution.effects.costFactorReduction,
      hierarchySynergyMultiplier: evolution.effects.hierarchySynergyMultiplier,
      gridAdjacencyBonus: evolution.effects.gridAdjacencyBonus,
      uniqueAbility
    }
  }
  
  // Get evolution cost for display
  function getEvolutionCost(tier: number, stage: number) {
    const evolution = evolutionData.value.get(`stage_${stage}`)
    if (!evolution) return D(0)
    
    return evolution.unlockCondition.cost.mul(D(tier + 1))
  }
  
  // Check unlock conditions for stages
  function checkStageUnlocks() {
    const gameStore = useGameStore()
    const starlight = gameStore.starlight.amount.toNumber()
    
    if (starlight >= 5) unlockedStages.value.add(1)
    if (starlight >= 8) unlockedStages.value.add(2)
    if (starlight >= 18) unlockedStages.value.add(3)
  }
  
  // Get stage name
  function getStageName(stage: number): string {
    const evolution = evolutionData.value.get(`stage_${stage}`)
    return evolution?.name || `Evolution Stage ${stage}`
  }
  
  // Get stage description
  function getStageDescription(stage: number): string {
    const evolution = evolutionData.value.get(`stage_${stage}`)
    return evolution?.description || ''
  }
  
  // Save/Load functions
  function save() {
    return {
      unlockedStages: Array.from(unlockedStages.value)
    }
  }
  
  function load(saveData: any) {
    if (!saveData) return
    
    unlockedStages.value.clear()
    if (saveData.unlockedStages) {
      saveData.unlockedStages.forEach((stage: number) => {
        unlockedStages.value.add(stage)
      })
    }
    
    // Always ensure stage 0 is available
    unlockedStages.value.add(0)
  }
  
  function reset() {
    unlockedStages.value.clear()
    unlockedStages.value.add(0)
  }
  
  function tick() {
    checkStageUnlocks()
  }
  
  // Initialize evolution data
  initializeEvolutions()
  
  return {
    // State
    unlockedStages,
    evolutionData,
    
    // Computed
    availableEvolutions,
    
    // Actions
    canEvolveFilament,
    evolveFilament,
    getFilamentEvolutionEffects,
    getEvolutionCost,
    getStageName,
    getStageDescription,
    checkStageUnlocks,
    tick,
    save,
    load,
    reset
  }
})