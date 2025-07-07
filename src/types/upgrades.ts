import type { Decimal } from '@/utils/decimal'

export enum UpgradeBranch {
  PRODUCTION = 'production',
  SYSTEM = 'system', 
  EVOLUTION = 'evolution',
  EXPANSION = 'expansion'
}

export enum UpgradeType {
  PRODUCTION = 'production',
  MULTIPLIER = 'multiplier',
  COST_REDUCTION = 'cost_reduction',
  EFFICIENCY = 'efficiency',
  AUTOMATION = 'automation',
  SYNERGY = 'synergy',
  SPECIAL = 'special'
}

export interface UpgradeEffect {
  type: UpgradeType
  value: Decimal
  target: string
  description: string
}

export interface Upgrade {
  id: string
  name: string
  description: string
  branch: UpgradeBranch
  tier: number
  cost: Decimal
  costType: 'starlight'
  unlockCondition: {
    starlight: number
    prerequisites: string[]
  }
  effects: UpgradeEffect[]
  purchased: boolean
  unlocked: boolean
  position: { x: number; y: number }
}

export interface IntersectionUpgrade extends Upgrade {
  isIntersection: true
  branches: [UpgradeBranch, UpgradeBranch]
  exclusiveWith?: string
}

export interface SecretUpgrade extends Upgrade {
  isSecret: true
  discoveryCondition: {
    description: string
    check: () => boolean
  }
}

export interface UpgradeTreeState {
  unlocked: boolean
  selectedPaths: Map<UpgradeBranch, string[]>
  purchasedUpgrades: Set<string>
  totalStarlightSpent: Decimal
  pathLocked: boolean
}

// Branch-specific upgrade data from concept document
export interface ProductionBranchUpgrades {
  fusionIgnition: Upgrade     // 2 Starlight: Production x8
  starPulse: Upgrade          // 5 Starlight: Milestone effect ^1.5
  photonAcceleration: Upgrade // 8 Starlight: Time x4 (production only)
  supernovaEnergy: Upgrade    // 15 Starlight: Production ^1.3, pulsation cycle ^0.5
}

export interface SystemBranchUpgrades {
  cosmicNetwork: Upgrade      // 3 Starlight: Synergy x5
  dimensionalFolding: Upgrade // 7 Starlight: Selected system synergy ^2
  multipleParadox: Upgrade    // 12 Starlight: System effect x8, debuff occurs
  cosmicSynchronize: Upgrade  // 20 Starlight: Auto-optimization + effect x2
}

export interface EvolutionBranchUpgrades {
  timeResonance: Upgrade      // 4 Starlight: Starburst effect x5
  quantumInvariance: Upgrade  // 9 Starlight: Preservation rate x5
  dimensionalAnchor: Upgrade  // 14 Starlight: No reset every 3rd Starburst
  eternalLoop: Upgrade        // 25 Starlight: Progress auto-preservation ^0.4
}

export interface ExpansionBranchUpgrades {
  parallelUniverse: Upgrade   // 6 Starlight: Pulsation states apply simultaneously x1.5
  spaceExpansion: Upgrade     // 10 Starlight: Grid allows same filament in all positions
  constellationResonance: Upgrade // 16 Starlight: Random constellation effect ^2 per Starburst
  realityExpansion: Upgrade   // 30 Starlight: Filament purchase count ^1.5, milestone criteria ^0.8
}