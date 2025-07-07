import type { Decimal } from '@/utils/decimal'

export enum PulsationState {
  EXPANSION = 'expansion',
  CONTRACTION = 'contraction',
  STABILITY = 'stability',
  CATACLYSM = 'cataclysm',
  FUSION = 'fusion'
}

export interface PulsationCycle {
  state: PulsationState
  progress: number // 0-100
  duration: number // seconds for current state
  totalCycleTime: number
  cyclesCompleted: number
}

export interface PulsationBonus {
  stardustMultiplier: Decimal
  filamentEfficiency: Decimal
  nebularEssenceRate: Decimal
  specialEffect?: string
}

export interface PulsationUpgrade {
  id: string
  name: string
  description: string
  cost: Decimal
  costType: 'starlight' | 'nebularEssence' | 'stellarEnergy'
  effect: PulsationEffect
  unlocked: boolean
  purchased: boolean
}

export interface PulsationEffect {
  type: 'cycle_speed' | 'bonus_multiplier' | 'state_duration' | 'special'
  value: number
  target?: PulsationState
}