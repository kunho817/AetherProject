import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { D, ZERO, ONE, type Decimal } from '@/utils/decimal'
import type { Resource, FilamentTier } from '@/types/game'
import { usePulsationStore } from './pulsation'
import { useRailRoadStore } from './railroad'
import { ConstellationType } from '@/types/railroad'
import { useNebulaStore } from './nebula'
import { useMemoryStore } from './memory'
import { useUpgradeStore } from './upgrades'
import { useStarEchoStore } from './starecho'
import { useEvolutionStore } from './evolution'
import { useAutomationStore } from './automation'
import { useEventStore } from './events'
import { useCondensationStore } from './condensation'
import { useTooltipStore } from './tooltips'
import { useAchievementStore } from './achievements'

export const useGameStore = defineStore('game', () => {
  // Resources
  const stardust = ref<Resource>({
    amount: ZERO,
    production: ONE,
    multiplier: ONE
  })
  
  const starlight = ref<Resource>({
    amount: ZERO,
    production: ZERO,
    multiplier: ONE
  })
  
  const starRail = ref(0)
  const nebularEssence = ref(0)
  const stellarEnergy = ref(0)
  const cosmicFragment = ref(0)
  
  // Reset counters
  const starburstCount = ref(0)
  const starlightResetCount = ref(0)
  
  // Filaments
  const filamentData = [
    { name: 'Orion Filament', baseCost: D(10), costFactor: 1.8, productionMultiplier: 1.5 },
    { name: 'Eagle Filament', baseCost: D(100), costFactor: 1.85, productionMultiplier: 1.55 },
    { name: 'Crab Filament', baseCost: D('1e4'), costFactor: 1.9, productionMultiplier: 1.6 },
    { name: 'Horsehead Filament', baseCost: D('1e6'), costFactor: 1.95, productionMultiplier: 1.65 },
    { name: 'Trifid Filament', baseCost: D('1e9'), costFactor: 2.0, productionMultiplier: 1.7 },
    { name: 'Planetary Filament', baseCost: D('1e13'), costFactor: 2.1, productionMultiplier: 1.75 },
    { name: 'Butterfly Filament', baseCost: D('1e18'), costFactor: 2.2, productionMultiplier: 1.8 },
    { name: 'Reflection Filament', baseCost: D('1e24'), costFactor: 2.25, productionMultiplier: 1.85 },
    { name: 'Dark Filament', baseCost: D('1e31'), costFactor: 2.3, productionMultiplier: 1.9 },
    { name: 'Remnant Filament', baseCost: D('1e40'), costFactor: 2.4, productionMultiplier: 2.0 }
  ]
  
  const filaments = ref<FilamentTier[]>(
    filamentData.map((data, i) => ({
      id: i + 1,
      name: data.name,
      baseCost: data.baseCost,
      costFactor: data.costFactor,
      baseProduction: D(data.productionMultiplier),
      productionMultiplier: data.productionMultiplier,
      purchased: ZERO, // Filaments directly purchased by user
      owned: ZERO, // Total filaments (purchased + produced)
      milestone: 0,
      evolution: 0
    }))
  )
  
  // Time tracking
  const lastSave = ref(Date.now())
  const totalTimePlayed = ref(0)
  const currentSessionTime = ref(0)
  
  // Get other stores (will be null initially, but that's ok)
  function getPulsationStore() {
    try {
      return usePulsationStore()
    } catch {
      return null
    }
  }
  
  function getRailRoadStore() {
    try {
      return useRailRoadStore()
    } catch {
      return null
    }
  }
  
  function getNebulaStore() {
    try {
      return useNebulaStore()
    } catch {
      return null
    }
  }
  
  function getMemoryStore() {
    try {
      return useMemoryStore()
    } catch {
      return null
    }
  }
  
  function getUpgradeStore() {
    try {
      return useUpgradeStore()
    } catch {
      return null
    }
  }
  
  function getStarEchoStore() {
    try {
      return useStarEchoStore()
    } catch {
      return null
    }
  }
  
  function getEvolutionStore() {
    try {
      return useEvolutionStore()
    } catch {
      return null
    }
  }
  
  function getAutomationStore() {
    try {
      return useAutomationStore()
    } catch {
      return null
    }
  }
  
  function getEventStore() {
    try {
      return useEventStore()
    } catch {
      return null
    }
  }
  
  function getCondensationStore() {
    try {
      return useCondensationStore()
    } catch {
      return null
    }
  }
  
  function getTooltipStore() {
    try {
      return useTooltipStore()
    } catch {
      return null
    }
  }
  
  function getAchievementStore() {
    try {
      return useAchievementStore()
    } catch {
      return null
    }
  }

  // Computed values
  const totalStardustProduction = computed(() => {
    try {
      let total = stardust.value.production
      
      // Only Tier 1 (Orion) filaments produce Stardust directly
      const tier1Filament = filaments.value[0] // Orion Filament
      if (tier1Filament.purchased.gt(0)) { // Must have purchased Tier 1 filaments
      const evolutionStore = getEvolutionStore()
      const evolutionEffects = evolutionStore?.getFilamentEvolutionEffects(0) || {
        productionExponent: ONE,
        hierarchySynergyMultiplier: ONE,
        uniqueAbility: null
      }
      
      // Production based on total owned, but milestone based on purchased
      let base = tier1Filament.baseProduction.mul(tier1Filament.owned)
      
      // Apply evolution production exponent
      base = base.pow(evolutionEffects.productionExponent)
      
      // Milestone bonus based on PURCHASED filaments only
      const milestoneBonus = D(2).pow(Math.floor(tier1Filament.purchased.toNumber() / 10))
      
      // No hierarchy synergy for Tier 1 (it's the bottom tier)
      
      // Apply unique abilities for Stage 3 evolution
      let uniqueBonus = ONE
      if (evolutionEffects.uniqueAbility?.includes('Orion\'s Light')) {
        uniqueBonus = D(5) // Base production ×5
      }
      
      // Apply purchased multiplier (consistent with hierarchical system)
      base = base.mul(tier1Filament.purchased)
      
      total = total.add(base.mul(milestoneBonus).mul(uniqueBonus))
    }
    
    // Apply Tier 10 unique ability (Remnant Supremacy)
    const evolutionStore = getEvolutionStore()
    if (evolutionStore && filaments.value[9]?.evolution >= 3) {
      const tier10Effects = evolutionStore.getFilamentEvolutionEffects(9)
      if (tier10Effects.uniqueAbility?.includes('Remnant Supremacy')) {
        total = total.pow(1.2) // All production ^1.2
      }
    }
    
    // Apply multipliers
    total = total.mul(stardust.value.multiplier)
    
    // Starburst multiplier (improved formula from concept)
    if (starburstCount.value > 0) {
      let starburstMult = ONE
      
      // Enhanced tiered scaling formula from modular documentation
      if (starburstCount.value <= 4) {
        // 1st-4th Starburst: x2 each (cumulative up to x16)
        starburstMult = D(2).pow(starburstCount.value)
      } else if (starburstCount.value <= 8) {
        // 5th-8th Starburst: x3 each (enhanced scaling period)
        const earlyBonus = D(2).pow(4) // x16 from first 4
        const midBonus = D(3).pow(starburstCount.value - 4) // x3 per additional
        starburstMult = earlyBonus.mul(midBonus)
      } else {
        // 9th+ Starbursts: Continued x3 scaling (exponential late game)
        const earlyBonus = D(2).pow(4) // x16 from first 4
        const midBonus = D(3).pow(4) // x81 from 5th-8th
        const lateBonus = D(3).pow(starburstCount.value - 8) // Continued x3
        starburstMult = earlyBonus.mul(midBonus).mul(lateBonus)
      }
      
      // Apply Starlight multiplier (x1.1 per Starlight)
      const starlightMult = D(1.1).pow(starlight.value.amount)
      starburstMult = starburstMult.mul(starlightMult)
      
      // Apply upgrade bonuses
      const upgradeStore = getUpgradeStore()
      if (upgradeStore) {
        // Time Resonance Upgrade (4 Starlight): Starburst effect x5
        if (upgradeStore.hasUpgrade('time_resonance')) {
          starburstMult = starburstMult.mul(5)
        }
        
        // Constellation Resonance Upgrade (16 Starlight): Random constellation effect ^2 per Starburst
        if (upgradeStore.hasUpgrade('constellation_resonance')) {
          // Apply additional multiplier based on active constellations
          const railRoadStore = getRailRoadStore()
          if (railRoadStore && railRoadStore.activeConstellations.length > 0) {
            const constellationBonus = D(2).pow(starburstCount.value)
            starburstMult = starburstMult.mul(constellationBonus)
          }
        }
      }
      
      total = total.mul(starburstMult)
    }
    
    // Pulsation bonus
    const pulsationStore = getPulsationStore()
    if (pulsationStore) {
      total = total.mul(pulsationStore.currentBonus.stardustMultiplier)
    }
    
    // Rail Road constellation bonus
    const railRoadStore = getRailRoadStore()
    if (railRoadStore) {
      total = total.mul(railRoadStore.totalProductionBonus)
    }
    
    // Upgrade Tree bonuses
    const upgradeStore = getUpgradeStore()
    if (upgradeStore) {
      const productionBonus = upgradeStore.getUpgradeBonus('production')
      total = total.mul(productionBonus.multiplier)
      total = total.pow(productionBonus.exponent)
    }
    
    // Star Echo System bonus
    const starEchoStore = getStarEchoStore()
    if (starEchoStore && starEchoStore.unlocked) {
      total = total.mul(starEchoStore.starEchoBonus.totalBonus)
    }
    
    // Special Events bonus
    const eventStore = getEventStore()
    if (eventStore && eventStore.unlocked) {
      total = total.mul(eventStore.getEventEffectMultiplier('production'))
      total = total.mul(eventStore.globalEventMultiplier)
    }
    
    // Apply Nebula pattern bonuses
    const nebulaStore = getNebulaStore()
    if (nebulaStore) {
      total = total.mul(nebulaStore.totalBonus.production)
      total = total.mul(nebulaStore.totalBonus.multiplier)
      }
      
      return total
    } catch (error) {
      console.error('Error in totalStardustProduction computation:', error)
      return stardust.value.production // Fallback to base production
    }
  })
  
  const canStarburst = computed(() => {
    // Hard-coded Starburst conditions based on highest unlocked tier
    
    // 1st Starburst: 25 Tier 4 Filaments (index 3)
    if (starburstCount.value === 0) {
      return filaments.value[3].purchased.gte(25)
    }
    
    // 2nd Starburst: 25 of highest unlocked tier (Tier 5, index 4)
    if (starburstCount.value === 1) {
      return filaments.value[4].purchased.gte(25)
    }
    
    // 3rd Starburst: 25 of highest unlocked tier (Tier 6, index 5)  
    if (starburstCount.value === 2) {
      return filaments.value[5].purchased.gte(25)
    }
    
    // 4th Starburst: 25 of highest unlocked tier (Tier 7, index 6)
    if (starburstCount.value === 3) {
      return filaments.value[6].purchased.gte(25)
    }
    
    // 5th Starburst: 25 of highest unlocked tier (Tier 8, index 7)
    if (starburstCount.value === 4) {
      return filaments.value[7].purchased.gte(25)
    }
    
    // 6th Starburst: 25 of highest unlocked tier (Tier 9, index 8)
    if (starburstCount.value === 5) {
      return filaments.value[8].purchased.gte(25)
    }
    
    // 7th Starburst: 25 of highest unlocked tier (Tier 10, index 9) - ALL TIERS NOW UNLOCKED
    if (starburstCount.value === 6) {
      return filaments.value[9].purchased.gte(25)
    }
    
    // 8th Starburst: START SCALING - 50 of Tier 10 (index 9)
    if (starburstCount.value === 7) {
      return filaments.value[9].purchased.gte(50)
    }
    
    // 9th Starburst: 75 of Tier 10 (index 9)
    if (starburstCount.value === 8) {
      return filaments.value[9].purchased.gte(75)
    }
    
    // 10th Starburst: 100 of Tier 10 (index 9)
    if (starburstCount.value === 9) {
      return filaments.value[9].purchased.gte(100)
    }
    
    // 11th+ Starbursts: Continuing to scale by +25 each time
    if (starburstCount.value >= 10) {
      const requiredTier10 = 100 + (25 * (starburstCount.value - 9)) // 125, 150, 175, 200...
      return filaments.value[9].purchased.gte(requiredTier10)
    }
    
    return false
  })
  
  const maxUnlockedTier = computed(() => {
    // Initial: Can purchase Tier 1-4 filaments
    // Each Starburst unlocks 1 additional tier
    // 6th Starburst: All tiers (10 tiers) fully unlocked
    return Math.min(9, 3 + starburstCount.value) // 0-indexed, so tier 4 = index 3
  })
  
  // Function kept for potential future use
  // function getHighestUnlockedTier(): number {
  //   for (let i = maxUnlockedTier.value; i >= 0; i--) {
  //     if (filaments.value[i].owned.gt(0)) {
  //       return i
  //     }
  //   }
  //   return 0
  // }
  
  // Removed getHighestPurchasedTier() - no longer needed with hard-coded Starburst conditions
  
  const canGetStarlight = computed(() => stardust.value.amount.gte('1e100'))
  
  // Hierarchical filament production system
  function updateFilamentProduction(deltaTime: number) {
    try {
      // Process from highest tier to lowest (Tier 10 → Tier 9 → ... → Tier 2 → Tier 1)
      for (let tier = 9; tier >= 1; tier--) { // 9 = Tier 10 (index 9), down to 1 = Tier 2 (index 1)
        const producerFilament = filaments.value[tier] // Higher tier that produces
        const targetFilament = filaments.value[tier - 1] // Lower tier that gets produced
        
        // Only produce if user has actually purchased filaments of this tier
        if (producerFilament.purchased.gt(0)) {
        // Calculate production with all bonuses
        const evolutionStore = getEvolutionStore()
        const evolutionEffects = evolutionStore?.getFilamentEvolutionEffects(tier) || {
          productionExponent: ONE,
          hierarchySynergyMultiplier: ONE,
          uniqueAbility: null
        }
        
        // Production = Total Owned * User Purchased influence
        // Base production uses total owned but is influenced by purchased count
        let production = producerFilament.baseProduction.mul(producerFilament.owned)
        
        // Apply evolution production exponent
        production = production.pow(evolutionEffects.productionExponent)
        
        // Milestone bonus based on PURCHASED filaments only
        const milestoneBonus = D(2).pow(Math.floor(producerFilament.purchased.toNumber() / 10))
        production = production.mul(milestoneBonus)
        
        // Apply user purchased factor (this is the key: purchased filaments enable production)
        production = production.mul(producerFilament.purchased)
        
        // NO hierarchy synergy in production calculation
        // Synergy bonuses should be separate from core production to avoid confusion
        
        // Apply unique abilities for Stage 3 evolution
        if (evolutionEffects.uniqueAbility) {
          if (tier === 1 && evolutionEffects.uniqueAbility.includes('Eagle\'s Swiftness')) {
            production = production.mul(2) // Production speed ×2
          }
        }
        
        // Apply global multipliers
        production = production.mul(stardust.value.multiplier)
        
        // Apply Starburst multiplier (only affects filament-to-filament production)
        if (starburstCount.value > 0) {
          let starburstMult = ONE
          
          // Apply same enhanced scaling to filament production
          if (starburstCount.value <= 4) {
            starburstMult = D(2).pow(starburstCount.value)
          } else if (starburstCount.value <= 8) {
            const earlyBonus = D(2).pow(4)
            const midBonus = D(3).pow(starburstCount.value - 4)
            starburstMult = earlyBonus.mul(midBonus)
          } else {
            const earlyBonus = D(2).pow(4)
            const midBonus = D(3).pow(4)
            const lateBonus = D(3).pow(starburstCount.value - 8) // Continued x3
            starburstMult = earlyBonus.mul(midBonus).mul(lateBonus)
          }
          
          const starlightMult = D(1.1).pow(starlight.value.amount)
          starburstMult = starburstMult.mul(starlightMult)
          
          production = production.mul(starburstMult)
        }
        
        // Apply other system bonuses
        const pulsationStore = getPulsationStore()
        if (pulsationStore) {
          production = production.mul(pulsationStore.currentBonus.stardustMultiplier)
        }
        
        const railRoadStore = getRailRoadStore()
        if (railRoadStore) {
          production = production.mul(railRoadStore.totalProductionBonus)
        }
        
        const upgradeStore = getUpgradeStore()
        if (upgradeStore) {
          const productionBonus = upgradeStore.getUpgradeBonus('production')
          production = production.mul(productionBonus.multiplier)
          production = production.pow(productionBonus.exponent)
        }
        
        const starEchoStore = getStarEchoStore()
        if (starEchoStore && starEchoStore.unlocked) {
          production = production.mul(starEchoStore.starEchoBonus.totalBonus)
        }
        
        const eventStore = getEventStore()
        if (eventStore && eventStore.unlocked) {
          production = production.mul(eventStore.getEventEffectMultiplier('production'))
          production = production.mul(eventStore.globalEventMultiplier)
        }
        
        // Add production to target filament's total owned (not purchased)
        const gain = production.mul(deltaTime)
        
          // Only add meaningful production gains to prevent floating point accumulation
          if (gain.gt(0)) {
            targetFilament.owned = targetFilament.owned.add(gain)
          }
        }
      }
    } catch (error) {
      console.error('Error in updateFilamentProduction:', error)
      // Don't let production errors break the entire game loop
    }
  }
  
  // Game loop
  function tick(deltaTime: number) {
    try {
      // Update filament production (hierarchical chain)
      updateFilamentProduction(deltaTime)
      
      // Update stardust
      const stardustGain = totalStardustProduction.value.mul(deltaTime)
      stardust.value.amount = stardust.value.amount.add(stardustGain)
    
    // Nebular Essence is now generated only from filament purchases
    // (moved to buyFilament function to match concept)
    
    // Update time tracking
    totalTimePlayed.value += deltaTime
    currentSessionTime.value += deltaTime
    
    // Track achievements and statistics
    const achievementStore = getAchievementStore()
    if (achievementStore) {
      achievementStore.trackStardustEarned(stardustGain.toNumber())
      achievementStore.trackProductionRate(totalStardustProduction.value.toNumber())
    }
    
    // Update Star Memory system
    const memoryStore = getMemoryStore()
    if (memoryStore) {
      memoryStore.tick()
    }
    
    // Update Rail Road system
    const railRoadStore = getRailRoadStore()
    if (railRoadStore) {
      railRoadStore.tick()
    }
    
    // Update Upgrade Tree system
    const upgradeStore = getUpgradeStore()
    if (upgradeStore) {
      upgradeStore.tick()
    }
    
    // Update Star Echo system
    const starEchoStore = getStarEchoStore()
    if (starEchoStore) {
      starEchoStore.tick()
    }
    
    // Update Evolution system
    const evolutionStore = getEvolutionStore()
    if (evolutionStore) {
      evolutionStore.tick()
    }
    
    // Update Automation system
    const automationStore = getAutomationStore()
    if (automationStore) {
      automationStore.tick()
    }
    
      // Check Nebula expansion conditions
      const nebulaStore = getNebulaStore()
      if (nebulaStore) {
        nebulaStore.checkExpansion()
      }
    } catch (error) {
      console.error('Error in game tick:', error)
      // Don't let tick errors break the game loop entirely
    }
  }
  
  // Filament functions
  function getFilamentCost(tier: number): Decimal {
    const filament = filaments.value[tier]
    
    // Apply evolution cost factor reduction
    const evolutionStore = getEvolutionStore()
    const evolutionEffects = evolutionStore?.getFilamentEvolutionEffects(tier) || {
      productionExponent: ONE,
      costFactorReduction: D(0),
      hierarchySynergyMultiplier: ONE,
      gridAdjacencyBonus: ONE,
      uniqueAbility: null
    }
    
    let adjustedCostFactor = D(filament.costFactor).sub(evolutionEffects.costFactorReduction)
    
    // Apply unique cost reduction abilities
    if (evolutionEffects.uniqueAbility?.includes('Crab\'s Tenacity')) {
      adjustedCostFactor = adjustedCostFactor.pow(0.8) // Cost reduction ^0.8
    }
    
    // Apply Rail Road constellation cost factor reductions (Aries special mechanism)
    const railRoadStore = getRailRoadStore()
    if (railRoadStore) {
      // Check for Aries constellation special mechanism: "Cost increase factor -0.2"
      const activeConstellations = railRoadStore.activeConstellations
      if (activeConstellations.includes(ConstellationType.ARIES)) {
        adjustedCostFactor = adjustedCostFactor.sub(0.2) // Reduce cost increase factor by 0.2
      }
    }
    
    // Cost based on purchased filaments (what user actually bought)
    const purchasedForCost = D(Math.floor(filament.purchased.toNumber()))
    let finalCost = filament.baseCost.mul(adjustedCostFactor.pow(purchasedForCost))
    
    // Apply Nebula Square pattern bonus (cost^0.6 exponent)
    const nebulaStore = getNebulaStore()
    if (nebulaStore) {
      finalCost = finalCost.pow(nebulaStore.totalBonus.costExponent)
    }
    
    // Apply Rail Road constellation cost multiplier effects
    if (railRoadStore) {
      finalCost = finalCost.mul(railRoadStore.getCostMultiplier('filament'))
    }
    
    // Apply Special Events cost multiplier effects
    const eventStore = getEventStore()
    if (eventStore && eventStore.unlocked) {
      finalCost = finalCost.mul(eventStore.getEventCostMultiplier('filament'))
    }
    
    return finalCost
  }
  
  function canBuyFilament(tier: number): boolean {
    // Check if we have enough stardust
    if (!stardust.value.amount.gte(getFilamentCost(tier))) {
      return false
    }
    
    // Check if tier is unlocked based on Starburst count
    if (tier > maxUnlockedTier.value) {
      return false
    }
    
    // Hierarchical purchase requirement: All previous tiers must have at least 1 purchased
    for (let i = 0; i < tier; i++) {
      if (filaments.value[i].purchased.eq(0)) {
        return false
      }
    }
    
    return true
  }
  
  function buyFilament(tier: number, amount = 1) {
    const filament = filaments.value[tier]
    let bought = 0
    let totalCost = ZERO
    
    for (let i = 0; i < amount; i++) {
      const cost = getFilamentCost(tier)
      if (stardust.value.amount.gte(cost)) {
        stardust.value.amount = stardust.value.amount.sub(cost)
        totalCost = totalCost.add(cost)
        filament.purchased = filament.purchased.add(1)
        filament.owned = filament.owned.add(1) // Initially same as purchased
        bought++
        
        // Update milestone based on purchased count
        filament.milestone = Math.floor(filament.purchased.toNumber() / 10)
      } else {
        break
      }
    }
    
    // Generate Nebular Essence: 0.01% of total purchase cost
    if (totalCost.gt(0)) {
      const essenceGain = totalCost.mul(0.0001) // 0.01% = 0.0001
      nebularEssence.value += essenceGain.toNumber()
    }
    
    // Track achievements and statistics
    if (bought > 0) {
      const achievementStore = getAchievementStore()
      if (achievementStore) {
        achievementStore.trackFilamentPurchase(tier, totalCost.toNumber(), bought)
      }
    }
    
    return bought
  }
  
  // Reset functions moved below
  
  function performStarlightReset() {
    if (!canGetStarlight.value) return
    
    // Apply Star Memory preservation before reset
    const memoryStore = getMemoryStore()
    if (memoryStore && memoryStore.unlocked) {
      memoryStore.applyPreservation()
    }
    
    let starlightGain = ONE // Base gain of 1 Starlight
    
    // Apply Nebula Cross pattern bonus (x1.75 Starlight gain)
    const nebulaStore = getNebulaStore()
    if (nebulaStore) {
      starlightGain = starlightGain.mul(nebulaStore.totalBonus.starlightGain)
    }
    
    starlight.value.amount = starlight.value.amount.add(starlightGain)
    starlightResetCount.value++
    
    // Reset more things than starburst
    stardust.value.amount = ZERO
    starburstCount.value = 0
    
    filaments.value.forEach(filament => {
      filament.purchased = ZERO
      filament.owned = ZERO
      filament.milestone = 0
      filament.evolution = 0
    })
    
    // Reset Nebula Store essence to match gameState
    if (nebulaStore) {
      nebulaStore.nebularEssence = 0
    }
    
    // Force reactivity update by triggering changes
    stardust.value.production = stardust.value.production.add(0)
    starlight.value.production = starlight.value.production.add(0)
  }
  
  function performStarburst() {
    if (!canStarburst.value) return
    
    const oldStarburstCount = starburstCount.value
    starburstCount.value++
    
    // Generate Star Rail during Starburst if player can get Starlight
    // Formula: (starlight_gained / 10) ^ 0.5 based on current potential gain
    if (canGetStarlight.value) {
      const potentialStarlightGain = 1 // Would gain 1 Starlight if doing Starlight reset now
      const starRailGain = Math.max(1, Math.floor(Math.pow(potentialStarlightGain / 10, 0.5)))
      starRail.value += starRailGain
      
      // Sync Star Rails with Rail Road store
      const railRoadStore = getRailRoadStore()
      if (railRoadStore) {
        railRoadStore.starRails += starRailGain
      }
    }
    
    // Check for Dimensional Anchor upgrade - skip reset every 3rd Starburst
    const upgradeStore = getUpgradeStore()
    const hasDimensionalAnchor = upgradeStore?.hasUpgrade('dimensional_anchor') || false
    const shouldSkipReset = hasDimensionalAnchor && (starburstCount.value % 3 === 0)
    
    if (!shouldSkipReset) {
      // Perform normal reset
      stardust.value.amount = ZERO
      
      // Reset filaments - milestones should reflect new purchased count (0)
      filaments.value.forEach(filament => {
        filament.purchased = ZERO
        filament.owned = ZERO
        filament.milestone = 0  // Reset milestone since purchased = 0
        // evolution is retained per design
      })
      
      // Reset Nebula Store essence to match gameState reset
      const nebulaStore = getNebulaStore()
      if (nebulaStore) {
        nebulaStore.nebularEssence = 0
      }
    }
    
    // Force reactivity update by triggering a change
    stardust.value.production = stardust.value.production.add(0)
    
    // Track achievements and statistics
    const achievementStore = getAchievementStore()
    if (achievementStore) {
      achievementStore.trackStarburst()
    }
    
    // Note: Multiplier benefits are still applied regardless of reset status
    // This is handled automatically by the totalStardustProduction computed property
  }
  
  // Save/Load functions
  function save(): string {
    const saveData: any = {
      version: 1,
      stardust: {
        amount: stardust.value.amount.toString(),
        multiplier: stardust.value.multiplier.toString()
      },
      starlight: {
        amount: starlight.value.amount.toString(),
        multiplier: starlight.value.multiplier.toString()
      },
      starRail: starRail.value,
      nebularEssence: nebularEssence.value,
      stellarEnergy: stellarEnergy.value,
      cosmicFragment: cosmicFragment.value,
      starburstCount: starburstCount.value,
      starlightResetCount: starlightResetCount.value,
      filaments: filaments.value.map(f => ({
        purchased: f.purchased.toString(),
        owned: f.owned.toString(),
        milestone: f.milestone,
        evolution: f.evolution
      })),
      totalTimePlayed: totalTimePlayed.value,
      lastSave: Date.now()
    }
    
    // Add Star Memory system save data
    const memoryStore = getMemoryStore()
    if (memoryStore) {
      saveData.memory = memoryStore.save()
    }
    
    // Add Upgrade Tree system save data
    const upgradeStore = getUpgradeStore()
    if (upgradeStore) {
      saveData.upgrades = upgradeStore.save()
    }
    
    // Add Star Echo system save data
    const starEchoStore = getStarEchoStore()
    if (starEchoStore) {
      saveData.starecho = starEchoStore.save()
    }
    
    // Add Evolution system save data
    const evolutionStore = getEvolutionStore()
    if (evolutionStore) {
      saveData.evolution = evolutionStore.save()
    }
    
    // Add Automation system save data
    const automationStore = getAutomationStore()
    if (automationStore) {
      saveData.automation = automationStore.save()
    }
    
    // Add Rail Road system save data
    const railRoadStore = getRailRoadStore()
    if (railRoadStore) {
      saveData.railroad = railRoadStore.save()
    }
    
    // Add Nebula system save data
    const nebulaStore = getNebulaStore()
    if (nebulaStore) {
      saveData.nebula = nebulaStore.save()
    }
    
    // Add Pulsation system save data
    const pulsationStore = getPulsationStore()
    if (pulsationStore) {
      saveData.pulsation = pulsationStore.save()
    }
    
    // Add Condensation system save data
    const condensationStore = getCondensationStore()
    if (condensationStore) {
      saveData.condensation = condensationStore.save()
    }
    
    // Add Tooltip system save data
    const tooltipStore = getTooltipStore()
    if (tooltipStore) {
      saveData.tooltips = tooltipStore.save()
    }
    
    // Add Achievement system save data
    const achievementStore = getAchievementStore()
    if (achievementStore) {
      saveData.achievements = achievementStore.save()
    }
    
    const saveString = btoa(JSON.stringify(saveData))
    localStorage.setItem('aetherSave', saveString)
    return saveString
  }
  
  function load(saveString?: string) {
    const dataString = saveString || localStorage.getItem('aetherSave')
    if (!dataString) return false
    
    try {
      const saveData = JSON.parse(atob(dataString))
      
      // Load resources
      stardust.value.amount = D(saveData.stardust.amount)
      stardust.value.multiplier = D(saveData.stardust.multiplier || 1)
      starlight.value.amount = D(saveData.starlight.amount)
      starlight.value.multiplier = D(saveData.starlight.multiplier || 1)
      
      starRail.value = saveData.starRail || 0
      nebularEssence.value = saveData.nebularEssence || 0
      stellarEnergy.value = saveData.stellarEnergy || 0
      cosmicFragment.value = saveData.cosmicFragment || 0
      
      starburstCount.value = saveData.starburstCount || 0
      starlightResetCount.value = saveData.starlightResetCount || 0
      
      // Load filaments
      saveData.filaments?.forEach((saved: any, index: number) => {
        if (filaments.value[index]) {
          filaments.value[index].purchased = D(saved.purchased || saved.owned || 0) // Backward compatibility
          filaments.value[index].owned = D(saved.owned || 0)
          filaments.value[index].milestone = saved.milestone || 0
          filaments.value[index].evolution = saved.evolution || 0
        }
      })
      
      totalTimePlayed.value = saveData.totalTimePlayed || 0
      lastSave.value = saveData.lastSave || Date.now()
      
      // Load Star Memory system data
      const memoryStore = getMemoryStore()
      if (memoryStore && saveData.memory) {
        memoryStore.load(saveData.memory)
      }
      
      // Load Upgrade Tree system data
      const upgradeStore = getUpgradeStore()
      if (upgradeStore && saveData.upgrades) {
        upgradeStore.load(saveData.upgrades)
      }
      
      // Load Star Echo system data
      const starEchoStore = getStarEchoStore()
      if (starEchoStore && saveData.starecho) {
        starEchoStore.load(saveData.starecho)
      }
      
      // Load Evolution system data
      const evolutionStore = getEvolutionStore()
      if (evolutionStore && saveData.evolution) {
        evolutionStore.load(saveData.evolution)
      }
      
      // Load Automation system data
      const automationStore = getAutomationStore()
      if (automationStore && saveData.automation) {
        automationStore.load(saveData.automation)
      }
      
      // Load Rail Road system data
      const railRoadStore = getRailRoadStore()
      if (railRoadStore && saveData.railroad) {
        railRoadStore.load(saveData.railroad)
      }
      
      // Load Nebula system data
      const nebulaStore = getNebulaStore()
      if (nebulaStore && saveData.nebula) {
        nebulaStore.load(saveData.nebula)
      }
      
      // Load Pulsation system data
      const pulsationStore = getPulsationStore()
      if (pulsationStore && saveData.pulsation) {
        pulsationStore.load(saveData.pulsation)
      }
      
      // Load Condensation system data
      const condensationStore = getCondensationStore()
      if (condensationStore && saveData.condensation) {
        condensationStore.load(saveData.condensation)
      }
      
      // Load Tooltip system data
      const tooltipStore = getTooltipStore()
      if (tooltipStore && saveData.tooltips) {
        tooltipStore.load(saveData.tooltips)
      }
      
      // Load Achievement system data
      const achievementStore = getAchievementStore()
      if (achievementStore && saveData.achievements) {
        achievementStore.load(saveData.achievements)
      }
      
      // Validate critical state after loading
      if (stardust.value.amount.lt(0) || starlight.value.amount.lt(0)) {
        console.error('Invalid resource amounts detected after load')
        return false
      }
      
      // Ensure filaments have valid Decimal values
      filaments.value.forEach(filament => {
        if (!filament.owned || typeof filament.owned.toNumber !== 'function') {
          filament.owned = ZERO
        }
      })
      
      return true
    } catch (e) {
      console.error('Failed to load save:', e)
      return false
    }
  }
  
  function reset() {
    stardust.value = { amount: ZERO, production: ONE, multiplier: ONE }
    starlight.value = { amount: ZERO, production: ZERO, multiplier: ONE }
    starRail.value = 0
    nebularEssence.value = 0
    stellarEnergy.value = 0
    cosmicFragment.value = 0
    starburstCount.value = 0
    starlightResetCount.value = 0
    
    filaments.value.forEach(filament => {
      filament.purchased = ZERO
      filament.owned = ZERO
      filament.milestone = 0
      filament.evolution = 0
    })
    
    totalTimePlayed.value = 0
    currentSessionTime.value = 0
    lastSave.value = Date.now()
    
    localStorage.removeItem('aetherSave')
  }
  
  return {
    // State
    stardust,
    starlight,
    starRail,
    nebularEssence,
    stellarEnergy,
    cosmicFragment,
    starburstCount,
    starlightResetCount,
    filaments,
    totalTimePlayed,
    currentSessionTime,
    
    // Computed
    totalStardustProduction,
    canStarburst,
    canGetStarlight,
    maxUnlockedTier,
    
    // Actions
    tick,
    getFilamentCost,
    canBuyFilament,
    buyFilament,
    performStarburst,
    performStarlightReset,
    save,
    load,
    reset
  }
})