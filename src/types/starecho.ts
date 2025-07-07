import type { Decimal } from '@/utils/decimal'

export interface StarEchoSlot {
  id: string
  position: { x: number; y: number; angle: number }
  filamentTier: number | null
  occupied: boolean
  unlocked: boolean
}

export interface StarEchoBonus {
  productionMultiplier: Decimal
  tierDifferenceBonus: Decimal
  totalBonus: Decimal
}

export interface StarEchoState {
  unlocked: boolean
  maxSlots: number
  slots: StarEchoSlot[]
  centralStarActive: boolean
}