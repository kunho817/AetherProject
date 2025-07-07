import type { Decimal } from '@/utils/decimal'

export interface Resource {
  amount: Decimal
  production: Decimal
  multiplier: Decimal
}

export interface FilamentTier {
  id: number
  name: string
  baseCost: Decimal
  costFactor: number
  baseProduction: Decimal
  productionMultiplier: number
  purchased: Decimal // Filaments directly purchased by user
  owned: Decimal // Total filaments (purchased + produced)
  milestone: number
  evolution: number
}

export interface FilamentEvolution {
  stage: number
  name: string
  description: string
  unlockCondition: {
    starlight: number
    purchases: number
    cost: Decimal
  }
  effects: {
    productionExponent: Decimal
    costFactorReduction: Decimal
    hierarchySynergyMultiplier: Decimal
    gridAdjacencyBonus: Decimal
    uniqueAbility?: string
  }
}

export interface GameState {
  stardust: Resource
  starlight: Resource
  starRail: number
  nebularEssence: number
  stellarEnergy: number
  cosmicFragment: number
  
  starburstCount: number
  starlightResetCount: number
  
  filaments: FilamentTier[]
  
  lastSave: number
  totalTimePlayed: number
  currentSessionTime: number
}