import type { Decimal } from '@/utils/decimal'

export interface AutomationTrigger {
  type: 'stardust' | 'filament' | 'time' | 'hybrid'
  enabled: boolean
  value: Decimal | number
  tier?: number // For filament-based triggers
}

export interface StarburstAutomation {
  unlocked: boolean
  enabled: boolean
  triggers: {
    primary: AutomationTrigger
    secondary?: AutomationTrigger
  }
  settings: {
    preserveStardust: boolean
    preserveFilaments: boolean
    minimumStarlight: number
    delayBetweenBursts: number // in seconds
  }
  stats: {
    totalAutoBursts: number
    lastAutoBurst: number
    averageInterval: number
  }
}

export interface AutomationSettings {
  starburst: StarburstAutomation
  // Future automation systems can be added here
}