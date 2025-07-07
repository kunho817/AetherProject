import type { Decimal } from '@/utils/decimal'

export interface CondensationTarget {
  id: string
  name: string
  description: string
  type: 'resource' | 'progress' | 'system'
  currentValue: Decimal
  condensationRate: Decimal // What % gets condensed into essence
  priority: number
  unlocked: boolean
}

export interface CondensationEssence {
  type: 'stellar' | 'cosmic' | 'temporal' | 'dimensional'
  amount: Decimal
  description: string
  bonuses: CondensationBonus[]
}

export interface CondensationBonus {
  type: 'production' | 'cost' | 'multiplier' | 'unlock' | 'special'
  target: string
  value: Decimal
  description: string
}

export interface CondensationPreset {
  id: string
  name: string
  description: string
  targets: Map<string, number> // target ID -> priority
  customSettings: Map<string, any>
}

export interface CondensationRequirement {
  type: 'starlight' | 'starburst' | 'achievement' | 'time_played' | 'system_level'
  value: number
  description: string
  met: boolean
}

export interface NovaLayerPreview {
  unlocked: boolean
  requirements: CondensationRequirement[]
  estimatedPower: Decimal
  newSystems: string[]
  preservedProgress: Map<string, Decimal>
  essenceCarryover: Map<string, Decimal>
}

export interface CondensationState {
  unlocked: boolean
  availableTargets: CondensationTarget[]
  essenceTypes: Map<string, CondensationEssence>
  totalCondensationPower: Decimal
  presets: CondensationPreset[]
  activePreset: string | null
  autoCondensationEnabled: boolean
  condensationThreshold: Decimal
  novaLayerPreview: NovaLayerPreview
  condensationHistory: CondensationHistoryEntry[]
}

export interface CondensationHistoryEntry {
  timestamp: number
  targetsCondensed: string[]
  essenceGained: Map<string, Decimal>
  totalPowerBefore: Decimal
  totalPowerAfter: Decimal
}

export enum CondensationMode {
  MANUAL = 'manual',
  THRESHOLD = 'threshold',
  TIMED = 'timed',
  OPTIMAL = 'optimal'
}