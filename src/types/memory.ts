import type { Decimal } from '@/utils/decimal'
import type { ConstellationType } from './railroad'

export interface StarMemorySlot {
  id: string
  occupied: boolean
  target: MemoryTarget | null
  preservationRate: Decimal
  priority: number
}

export interface MemoryTarget {
  type: 'filament' | 'nebula' | 'railroad' | 'upgrades'
  id: string
  name: string
  preservationRate: Decimal
  specificTarget?: any // For storing specific configuration
}

export interface FilamentMemoryTarget extends MemoryTarget {
  type: 'filament'
  tier: number
  evolutionStage: number
}

export interface NebulaMemoryTarget extends MemoryTarget {
  type: 'nebula'
  pattern: string
  gridPosition: { x: number; y: number }[]
  filamentTypes: number[]
}

export interface RailRoadMemoryTarget extends MemoryTarget {
  type: 'railroad'
  constellation: ConstellationType
  stations: string[]
  enhancements: Map<string, number>
}

export interface UpgradeMemoryTarget extends MemoryTarget {
  type: 'upgrades'
  branch: string
  upgrades: string[]
}

export interface StarMemoryState {
  unlocked: boolean
  maxSlots: number
  currentSlots: number
  slots: StarMemorySlot[]
  preservationBonus: Decimal
  totalStarlight: Decimal
}