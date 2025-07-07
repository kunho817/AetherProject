import type { Decimal } from '@/utils/decimal'

export interface NebulaCell {
  x: number
  y: number
  type: NebulaType | null
  level: number
  active: boolean
  tier?: number // For tier-specific filament cells
}

export enum NebulaType {
  STARDUST = 'stardust',
  FILAMENT = 'filament',
  MULTIPLIER = 'multiplier',
  SYNERGY = 'synergy',
  CATALYST = 'catalyst'
}

export interface NebulaPattern {
  id: string
  name: string
  description: string
  pattern: { x: number; y: number; type: NebulaType; tier?: number }[]
  bonus: NebulaBonus
  discovered: boolean
  specialRequirement?: 'tier_specific' | 'adjacency_bonus'
}

export interface NebulaBonus {
  type: 'production' | 'multiplier' | 'cost_reduction' | 'special'
  value: Decimal
  target: 'stardust' | 'filaments' | 'all' | 'synergy' | 'hierarchy_synergy'
}

export interface NebulaState {
  grid: NebulaCell[][]
  gridSize: number
  nebularEssence: number
  placementCost: Decimal
  patterns: NebulaPattern[]
  activePatterns: string[]
}