import { D } from '@/utils/decimal'
import { NebulaType, NebulaComponent } from '@/types/nebula'
import {
  UpgradeNode,
  UpgradeEffectType,
  UpgradeCategory,
  UpgradeNodeWithVisual,
  PartialComponentCost
} from '@/types/nebulaUpgrades'

// Helper function to create component costs
function componentCost(costs: PartialComponentCost): PartialComponentCost {
  return costs
}

// Coordinator Upgrades - Nebula Unlocks
export const coordinatorUnlockUpgrades: Record<NebulaType, UpgradeNodeWithVisual> = {
  [NebulaType.STELLAR_NURSERY]: {
    id: 'coordinator_unlock_stellar_nursery',
    type: 'coordinator',
    name: 'Stellar Nursery Access',
    description: 'Unlock the Stellar Nursery nebula and its upgrade tree',
    tier: 1,
    category: UpgradeCategory.UNLOCK,
    cost: {
      components: componentCost({
        [NebulaComponent.HYDROGEN]: 100,
        [NebulaComponent.HELIUM]: 50
      })
    },
    effects: [{
      type: UpgradeEffectType.UNLOCK_NEBULA,
      target: NebulaType.STELLAR_NURSERY,
      value: 1,
      description: 'Unlocks Stellar Nursery'
    }],
    purchased: false,
    available: true
  },
  
  [NebulaType.PLANETARY_NEBULA]: {
    id: 'coordinator_unlock_planetary_nebula',
    type: 'coordinator',
    name: 'Planetary Nebula Access',
    description: 'Unlock the Planetary Nebula and its upgrade tree',
    tier: 1,
    category: UpgradeCategory.UNLOCK,
    cost: {
      components: componentCost({
        [NebulaComponent.CARBON]: 80,
        [NebulaComponent.OXYGEN]: 60
      })
    },
    effects: [{
      type: UpgradeEffectType.UNLOCK_NEBULA,
      target: NebulaType.PLANETARY_NEBULA,
      value: 1,
      description: 'Unlocks Planetary Nebula'
    }],
    purchased: false,
    available: true
  },
  
  [NebulaType.SUPERNOVA_REMNANT]: {
    id: 'coordinator_unlock_supernova_remnant',
    type: 'coordinator',
    name: 'Supernova Remnant Access',
    description: 'Unlock the Supernova Remnant and its upgrade tree',
    tier: 2,
    category: UpgradeCategory.UNLOCK,
    cost: {
      components: componentCost({
        [NebulaComponent.IRON]: 100,
        [NebulaComponent.SILICON]: 75,
        [NebulaComponent.OXYGEN]: 50
      })
    },
    effects: [{
      type: UpgradeEffectType.UNLOCK_NEBULA,
      target: NebulaType.SUPERNOVA_REMNANT,
      value: 1,
      description: 'Unlocks Supernova Remnant'
    }],
    requires: ['coordinator_unlock_stellar_nursery'],
    purchased: false,
    available: false
  },
  
  [NebulaType.DARK_NEBULA]: {
    id: 'coordinator_unlock_dark_nebula',
    type: 'coordinator',
    name: 'Dark Nebula Access',
    description: 'Unlock the mysterious Dark Nebula and its upgrade tree',
    tier: 2,
    category: UpgradeCategory.UNLOCK,
    cost: {
      components: componentCost({
        [NebulaComponent.CARBON]: 150,
        [NebulaComponent.IRON]: 80
      })
    },
    effects: [{
      type: UpgradeEffectType.UNLOCK_NEBULA,
      target: NebulaType.DARK_NEBULA,
      value: 1,
      description: 'Unlocks Dark Nebula'
    }],
    requires: ['coordinator_unlock_planetary_nebula'],
    purchased: false,
    available: false
  },
  
  [NebulaType.REFLECTION_NEBULA]: {
    id: 'coordinator_unlock_reflection_nebula',
    type: 'coordinator',
    name: 'Reflection Nebula Access',
    description: 'Unlock the Reflection Nebula and its upgrade tree',
    tier: 3,
    category: UpgradeCategory.UNLOCK,
    cost: {
      components: componentCost({
        [NebulaComponent.HELIUM]: 200,
        [NebulaComponent.NITROGEN]: 150,
        [NebulaComponent.SILICON]: 100
      })
    },
    effects: [{
      type: UpgradeEffectType.UNLOCK_NEBULA,
      target: NebulaType.REFLECTION_NEBULA,
      value: 1,
      description: 'Unlocks Reflection Nebula'
    }],
    requires: ['coordinator_unlock_dark_nebula'],
    purchased: false,
    available: false
  },
  
  [NebulaType.EMISSION_NEBULA]: {
    id: 'coordinator_unlock_emission_nebula',
    type: 'coordinator',
    name: 'Emission Nebula Access',
    description: 'Unlock the Emission Nebula and its upgrade tree',
    tier: 3,
    category: UpgradeCategory.UNLOCK,
    cost: {
      components: componentCost({
        [NebulaComponent.HYDROGEN]: 250,
        [NebulaComponent.OXYGEN]: 200,
        [NebulaComponent.NITROGEN]: 100
      })
    },
    effects: [{
      type: UpgradeEffectType.UNLOCK_NEBULA,
      target: NebulaType.EMISSION_NEBULA,
      value: 1,
      description: 'Unlocks Emission Nebula'
    }],
    requires: ['coordinator_unlock_supernova_remnant'],
    purchased: false,
    available: false
  },
  
  [NebulaType.ABSORPTION_NEBULA]: {
    id: 'coordinator_unlock_absorption_nebula',
    type: 'coordinator',
    name: 'Absorption Nebula Access',
    description: 'Unlock the final Absorption Nebula and its upgrade tree',
    tier: 4,
    category: UpgradeCategory.UNLOCK,
    cost: {
      components: componentCost({
        [NebulaComponent.HYDROGEN]: 300,
        [NebulaComponent.HELIUM]: 250,
        [NebulaComponent.CARBON]: 200,
        [NebulaComponent.NITROGEN]: 150,
        [NebulaComponent.OXYGEN]: 150,
        [NebulaComponent.SILICON]: 100,
        [NebulaComponent.IRON]: 100
      })
    },
    effects: [{
      type: UpgradeEffectType.UNLOCK_NEBULA,
      target: NebulaType.ABSORPTION_NEBULA,
      value: 1,
      description: 'Unlocks Absorption Nebula'
    }],
    requires: ['coordinator_unlock_reflection_nebula', 'coordinator_unlock_emission_nebula'],
    purchased: false,
    available: false
  }
}

// Coordinator Component Upgrades
export const coordinatorComponentUpgrades: UpgradeNodeWithVisual[] = [
  {
    id: 'coordinator_hydrogen_efficiency_1',
    type: 'coordinator',
    name: 'Hydrogen Collection I',
    description: 'Reduce Hydrogen component cost by 10%',
    tier: 1,
    category: UpgradeCategory.COMPONENT,
    cost: {
      nm: D(1000)
    },
    effects: [{
      type: UpgradeEffectType.COMPONENT_COST_REDUCTION,
      target: NebulaComponent.HYDROGEN,
      value: 0.9, // 10% reduction
      description: '10% cheaper Hydrogen'
    }],
    purchased: false,
    available: true
  },
  {
    id: 'coordinator_helium_efficiency_1',
    type: 'coordinator',
    name: 'Helium Collection I',
    description: 'Reduce Helium component cost by 10%',
    tier: 1,
    category: UpgradeCategory.COMPONENT,
    cost: {
      nm: D(1500)
    },
    effects: [{
      type: UpgradeEffectType.COMPONENT_COST_REDUCTION,
      target: NebulaComponent.HELIUM,
      value: 0.9,
      description: '10% cheaper Helium'
    }],
    purchased: false,
    available: true
  },
  {
    id: 'coordinator_bulk_purchase_1',
    type: 'coordinator',
    name: 'Bulk Component Processing',
    description: 'Unlock x10 bulk purchase for all components',
    tier: 2,
    category: UpgradeCategory.COMPONENT,
    cost: {
      nm: D(5000),
      components: componentCost({
        [NebulaComponent.HYDROGEN]: 50,
        [NebulaComponent.HELIUM]: 30
      })
    },
    effects: [{
      type: UpgradeEffectType.COMPONENT_BULK_PURCHASE,
      value: 10,
      description: 'x10 bulk purchases'
    }],
    purchased: false,
    available: true
  }
]

// Coordinator Global Upgrades
export const coordinatorGlobalUpgrades: UpgradeNodeWithVisual[] = [
  {
    id: 'coordinator_global_production_1',
    type: 'coordinator',
    name: 'Nebula Synergy',
    description: 'All nebula bonuses increased by 10%',
    tier: 3,
    category: UpgradeCategory.GLOBAL,
    cost: {
      nm: D(10000),
      components: componentCost({
        [NebulaComponent.HYDROGEN]: 100,
        [NebulaComponent.HELIUM]: 100,
        [NebulaComponent.CARBON]: 100
      })
    },
    effects: [{
      type: UpgradeEffectType.GLOBAL_COMPONENT_BONUS,
      value: 1.1,
      description: '+10% all nebula bonuses'
    }],
    requires: ['coordinator_unlock_supernova_remnant', 'coordinator_unlock_dark_nebula'],
    purchased: false,
    available: false
  }
]

// Stellar Nursery Upgrades
export const stellarNurseryUpgrades: UpgradeNodeWithVisual[] = [
  // Bonus upgrades
  {
    id: 'stellar_nursery_bonus_1',
    type: NebulaType.STELLAR_NURSERY,
    name: 'Stellar Incubation',
    description: 'Increase Stardust production bonus by 25%',
    tier: 1,
    category: UpgradeCategory.BONUS,
    cost: {
      components: componentCost({
        [NebulaComponent.HYDROGEN]: 50,
        [NebulaComponent.HELIUM]: 25
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_BONUS_MULTIPLIER,
      target: 'stardust_production',
      value: 1.25,
      description: '+25% Stardust production bonus'
    }],
    purchased: false,
    available: true
  },
  
  // Penalty reduction
  {
    id: 'stellar_nursery_penalty_1',
    type: NebulaType.STELLAR_NURSERY,
    name: 'Stabilized Formation',
    description: 'Reduce Filament cost penalty by 50%',
    tier: 1,
    category: UpgradeCategory.PENALTY,
    cost: {
      components: componentCost({
        [NebulaComponent.CARBON]: 40,
        [NebulaComponent.OXYGEN]: 30
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_PENALTY_REDUCTION,
      target: 'filament_cost',
      value: 0.5,
      description: '50% less Filament cost penalty'
    }],
    purchased: false,
    available: true
  },
  
  // Special upgrade
  {
    id: 'stellar_nursery_special_1',
    type: NebulaType.STELLAR_NURSERY,
    name: 'Protostar Formation',
    description: 'Gain bonus Starlight based on Hydrogen components owned',
    tier: 2,
    category: UpgradeCategory.SPECIAL,
    cost: {
      components: componentCost({
        [NebulaComponent.HYDROGEN]: 200,
        [NebulaComponent.HELIUM]: 100,
        [NebulaComponent.OXYGEN]: 50
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_SPECIAL_EFFECT,
      target: 'starlight_from_hydrogen',
      value: 0.01, // 1% of hydrogen as starlight bonus
      description: 'Hydrogen components boost Starlight gain'
    }],
    requires: ['stellar_nursery_bonus_1'],
    purchased: false,
    available: false
  }
]

// Component base costs (for purchasing)
export const componentBaseCosts: Record<NebulaComponent, number> = {
  [NebulaComponent.HYDROGEN]: 10,
  [NebulaComponent.HELIUM]: 25,
  [NebulaComponent.CARBON]: 50,
  [NebulaComponent.NITROGEN]: 100,
  [NebulaComponent.OXYGEN]: 150,
  [NebulaComponent.SILICON]: 300,
  [NebulaComponent.IRON]: 500
}

// Component cost scaling factors
export const componentScalingFactors: Record<NebulaComponent, number> = {
  [NebulaComponent.HYDROGEN]: 1.15,
  [NebulaComponent.HELIUM]: 1.18,
  [NebulaComponent.CARBON]: 1.20,
  [NebulaComponent.NITROGEN]: 1.22,
  [NebulaComponent.OXYGEN]: 1.25,
  [NebulaComponent.SILICON]: 1.28,
  [NebulaComponent.IRON]: 1.30
}

// Planetary Nebula Upgrades
export const planetaryNebulaUpgrades: UpgradeNodeWithVisual[] = [
  {
    id: 'planetary_nebula_bonus_1',
    type: NebulaType.PLANETARY_NEBULA,
    name: 'Planetary Wind Control',
    description: 'Increase Filament production bonus by 20%',
    tier: 1,
    category: UpgradeCategory.BONUS,
    cost: {
      components: componentCost({
        [NebulaComponent.CARBON]: 60,
        [NebulaComponent.OXYGEN]: 40
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_BONUS_MULTIPLIER,
      target: 'filament_production',
      value: 1.20,
      description: '+20% Filament production bonus'
    }],
    purchased: false,
    available: true
  },
  {
    id: 'planetary_nebula_penalty_1',
    type: NebulaType.PLANETARY_NEBULA,
    name: 'Stable Nebular Shell',
    description: 'Reduce Starburst effectiveness penalty by 40%',
    tier: 1,
    category: UpgradeCategory.PENALTY,
    cost: {
      components: componentCost({
        [NebulaComponent.HELIUM]: 50,
        [NebulaComponent.NITROGEN]: 30
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_PENALTY_REDUCTION,
      target: 'starburst_effectiveness',
      value: 0.6,
      description: '40% less Starburst penalty'
    }],
    purchased: false,
    available: true
  },
  {
    id: 'planetary_nebula_special_1',
    type: NebulaType.PLANETARY_NEBULA,
    name: 'Ionization Enhancement',
    description: 'Gain bonus Nebular Essence based on total components',
    tier: 2,
    category: UpgradeCategory.SPECIAL,
    cost: {
      components: componentCost({
        [NebulaComponent.CARBON]: 150,
        [NebulaComponent.OXYGEN]: 100,
        [NebulaComponent.NITROGEN]: 75
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_SPECIAL_EFFECT,
      target: 'essence_from_components',
      value: 0.02,
      description: 'Total components boost Nebular Essence'
    }],
    requires: ['planetary_nebula_bonus_1'],
    purchased: false,
    available: false
  }
]

// Supernova Remnant Upgrades
export const supernovaRemnantUpgrades: UpgradeNodeWithVisual[] = [
  {
    id: 'supernova_remnant_bonus_1',
    type: NebulaType.SUPERNOVA_REMNANT,
    name: 'Shockwave Amplification',
    description: 'Increase Stellar Energy bonus by 30%',
    tier: 1,
    category: UpgradeCategory.BONUS,
    cost: {
      components: componentCost({
        [NebulaComponent.IRON]: 80,
        [NebulaComponent.SILICON]: 60
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_BONUS_MULTIPLIER,
      target: 'stellar_energy',
      value: 1.30,
      description: '+30% Stellar Energy bonus'
    }],
    purchased: false,
    available: true
  },
  {
    id: 'supernova_remnant_penalty_1',
    type: NebulaType.SUPERNOVA_REMNANT,
    name: 'Remnant Stabilization',
    description: 'Reduce Star Rail requirement penalty by 60%',
    tier: 1,
    category: UpgradeCategory.PENALTY,
    cost: {
      components: componentCost({
        [NebulaComponent.CARBON]: 70,
        [NebulaComponent.IRON]: 50
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_PENALTY_REDUCTION,
      target: 'star_rail_requirement',
      value: 0.4,
      description: '60% less Star Rail requirement penalty'
    }],
    purchased: false,
    available: true
  },
  {
    id: 'supernova_remnant_special_1',
    type: NebulaType.SUPERNOVA_REMNANT,
    name: 'Element Synthesis',
    description: 'Iron components boost all other component effectiveness',
    tier: 2,
    category: UpgradeCategory.SPECIAL,
    cost: {
      components: componentCost({
        [NebulaComponent.IRON]: 200,
        [NebulaComponent.SILICON]: 150,
        [NebulaComponent.OXYGEN]: 100
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_SPECIAL_EFFECT,
      target: 'iron_synergy_boost',
      value: 0.05,
      description: 'Iron enhances all component bonuses'
    }],
    requires: ['supernova_remnant_bonus_1'],
    purchased: false,
    available: false
  }
]

// Dark Nebula Upgrades
export const darkNebulaUpgrades: UpgradeNodeWithVisual[] = [
  {
    id: 'dark_nebula_bonus_1',
    type: NebulaType.DARK_NEBULA,
    name: 'Shadow Mastery',
    description: 'Increase Cosmic Fragment bonus by 25%',
    tier: 1,
    category: UpgradeCategory.BONUS,
    cost: {
      components: componentCost({
        [NebulaComponent.CARBON]: 100,
        [NebulaComponent.IRON]: 60
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_BONUS_MULTIPLIER,
      target: 'cosmic_fragment',
      value: 1.25,
      description: '+25% Cosmic Fragment bonus'
    }],
    purchased: false,
    available: true
  },
  {
    id: 'dark_nebula_penalty_1',
    type: NebulaType.DARK_NEBULA,
    name: 'Darkness Adaptation',
    description: 'Reduce visibility penalty by 70%',
    tier: 1,
    category: UpgradeCategory.PENALTY,
    cost: {
      components: componentCost({
        [NebulaComponent.SILICON]: 80,
        [NebulaComponent.NITROGEN]: 50
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_PENALTY_REDUCTION,
      target: 'visibility_penalty',
      value: 0.3,
      description: '70% less visibility penalty'
    }],
    purchased: false,
    available: true
  },
  {
    id: 'dark_nebula_special_1',
    type: NebulaType.DARK_NEBULA,
    name: 'Void Resonance',
    description: 'Dark matter absorption increases with Carbon components',
    tier: 2,
    category: UpgradeCategory.SPECIAL,
    cost: {
      components: componentCost({
        [NebulaComponent.CARBON]: 250,
        [NebulaComponent.IRON]: 150,
        [NebulaComponent.SILICON]: 100
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_SPECIAL_EFFECT,
      target: 'dark_matter_absorption',
      value: 0.03,
      description: 'Carbon enhances dark matter collection'
    }],
    requires: ['dark_nebula_bonus_1'],
    purchased: false,
    available: false
  }
]

// Reflection Nebula Upgrades
export const reflectionNebulaUpgrades: UpgradeNodeWithVisual[] = [
  {
    id: 'reflection_nebula_bonus_1',
    type: NebulaType.REFLECTION_NEBULA,
    name: 'Light Amplification',
    description: 'Increase all production bonuses by 15%',
    tier: 1,
    category: UpgradeCategory.BONUS,
    cost: {
      components: componentCost({
        [NebulaComponent.HELIUM]: 120,
        [NebulaComponent.NITROGEN]: 80
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_BONUS_MULTIPLIER,
      target: 'all_production',
      value: 1.15,
      description: '+15% all production bonuses'
    }],
    purchased: false,
    available: true
  },
  {
    id: 'reflection_nebula_penalty_1',
    type: NebulaType.REFLECTION_NEBULA,
    name: 'Reflection Stabilization',
    description: 'Reduce light scattering penalty by 50%',
    tier: 1,
    category: UpgradeCategory.PENALTY,
    cost: {
      components: componentCost({
        [NebulaComponent.SILICON]: 100,
        [NebulaComponent.HELIUM]: 70
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_PENALTY_REDUCTION,
      target: 'light_scattering',
      value: 0.5,
      description: '50% less light scattering penalty'
    }],
    purchased: false,
    available: true
  },
  {
    id: 'reflection_nebula_special_1',
    type: NebulaType.REFLECTION_NEBULA,
    name: 'Stellar Mirror Effect',
    description: 'Helium components multiply effectiveness of all other upgrades',
    tier: 2,
    category: UpgradeCategory.SPECIAL,
    cost: {
      components: componentCost({
        [NebulaComponent.HELIUM]: 300,
        [NebulaComponent.NITROGEN]: 200,
        [NebulaComponent.SILICON]: 150
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_SPECIAL_EFFECT,
      target: 'helium_mirror_multiplier',
      value: 0.01,
      description: 'Helium amplifies all upgrade effects'
    }],
    requires: ['reflection_nebula_bonus_1'],
    purchased: false,
    available: false
  }
]

// Emission Nebula Upgrades
export const emissionNebulaUpgrades: UpgradeNodeWithVisual[] = [
  {
    id: 'emission_nebula_bonus_1',
    type: NebulaType.EMISSION_NEBULA,
    name: 'Ionization Control',
    description: 'Increase Starlight gain by 35%',
    tier: 1,
    category: UpgradeCategory.BONUS,
    cost: {
      components: componentCost({
        [NebulaComponent.HYDROGEN]: 150,
        [NebulaComponent.OXYGEN]: 100
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_BONUS_MULTIPLIER,
      target: 'starlight_gain',
      value: 1.35,
      description: '+35% Starlight gain bonus'
    }],
    purchased: false,
    available: true
  },
  {
    id: 'emission_nebula_penalty_1',
    type: NebulaType.EMISSION_NEBULA,
    name: 'Energy Regulation',
    description: 'Reduce emission instability penalty by 55%',
    tier: 1,
    category: UpgradeCategory.PENALTY,
    cost: {
      components: componentCost({
        [NebulaComponent.NITROGEN]: 90,
        [NebulaComponent.OXYGEN]: 70
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_PENALTY_REDUCTION,
      target: 'emission_instability',
      value: 0.45,
      description: '55% less emission instability penalty'
    }],
    purchased: false,
    available: true
  },
  {
    id: 'emission_nebula_special_1',
    type: NebulaType.EMISSION_NEBULA,
    name: 'Hydrogen Fusion Cascade',
    description: 'Hydrogen components trigger chain reactions for bonus effects',
    tier: 2,
    category: UpgradeCategory.SPECIAL,
    cost: {
      components: componentCost({
        [NebulaComponent.HYDROGEN]: 400,
        [NebulaComponent.OXYGEN]: 250,
        [NebulaComponent.NITROGEN]: 150
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_SPECIAL_EFFECT,
      target: 'hydrogen_fusion_cascade',
      value: 0.04,
      description: 'Hydrogen triggers cascading bonuses'
    }],
    requires: ['emission_nebula_bonus_1'],
    purchased: false,
    available: false
  }
]

// Absorption Nebula Upgrades
export const absorptionNebulaUpgrades: UpgradeNodeWithVisual[] = [
  {
    id: 'absorption_nebula_bonus_1',
    type: NebulaType.ABSORPTION_NEBULA,
    name: 'Total Absorption',
    description: 'Increase all resource generation by 40%',
    tier: 1,
    category: UpgradeCategory.BONUS,
    cost: {
      components: componentCost({
        [NebulaComponent.HYDROGEN]: 200,
        [NebulaComponent.HELIUM]: 150,
        [NebulaComponent.CARBON]: 100
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_BONUS_MULTIPLIER,
      target: 'all_resources',
      value: 1.40,
      description: '+40% all resource generation'
    }],
    purchased: false,
    available: true
  },
  {
    id: 'absorption_nebula_penalty_1',
    type: NebulaType.ABSORPTION_NEBULA,
    name: 'Absorption Balance',
    description: 'Reduce absorption overflow penalty by 80%',
    tier: 1,
    category: UpgradeCategory.PENALTY,
    cost: {
      components: componentCost({
        [NebulaComponent.NITROGEN]: 120,
        [NebulaComponent.SILICON]: 100,
        [NebulaComponent.IRON]: 80
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_PENALTY_REDUCTION,
      target: 'absorption_overflow',
      value: 0.2,
      description: '80% less absorption overflow penalty'
    }],
    purchased: false,
    available: true
  },
  {
    id: 'absorption_nebula_special_1',
    type: NebulaType.ABSORPTION_NEBULA,
    name: 'Universal Synthesis',
    description: 'All components work together multiplicatively',
    tier: 2,
    category: UpgradeCategory.SPECIAL,
    cost: {
      components: componentCost({
        [NebulaComponent.HYDROGEN]: 500,
        [NebulaComponent.HELIUM]: 400,
        [NebulaComponent.CARBON]: 300,
        [NebulaComponent.NITROGEN]: 250,
        [NebulaComponent.OXYGEN]: 200,
        [NebulaComponent.SILICON]: 150,
        [NebulaComponent.IRON]: 100
      })
    },
    effects: [{
      type: UpgradeEffectType.NEBULA_SPECIAL_EFFECT,
      target: 'universal_synthesis',
      value: 0.1,
      description: 'All components synergize multiplicatively'
    }],
    requires: ['absorption_nebula_bonus_1'],
    purchased: false,
    available: false
  }
]