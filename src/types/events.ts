import type { Decimal } from '@/utils/decimal'

export enum EventType {
  COSMIC_STORM = 'cosmic_storm',
  STELLAR_ALIGNMENT = 'stellar_alignment',
  NEBULA_SURGE = 'nebula_surge',
  TEMPORAL_FLUX = 'temporal_flux',
  SUPERNOVA_ECHO = 'supernova_echo',
  FILAMENT_RESONANCE = 'filament_resonance',
  CONSTELLATION_CONVERGENCE = 'constellation_convergence'
}

export enum EventRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon', 
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface EventEffect {
  type: 'production' | 'cost' | 'multiplier' | 'special'
  target: string
  value: Decimal
  description: string
}

export interface SpecialEvent {
  id: string
  name: string
  description: string
  type: EventType
  rarity: EventRarity
  duration: number // seconds
  remainingTime: number
  active: boolean
  effects: EventEffect[]
  triggerConditions: EventTriggerCondition[]
  onStart?: () => void
  onEnd?: () => void
  canTriggerAgain: boolean
  cooldownTime: number
  cooldownRemaining: number
}

export interface EventTriggerCondition {
  type: 'starburst_count' | 'starlight_amount' | 'filament_tier' | 'time_played' | 'random_chance'
  value: number
  comparison: 'gte' | 'lte' | 'eq' | 'gt' | 'lt'
}

export interface EventChoiceOption {
  id: string
  text: string
  effects: EventEffect[]
  requirements?: EventTriggerCondition[]
  cost?: { type: string, amount: Decimal }
}

export interface EventChoice {
  id: string
  eventId: string
  title: string
  description: string
  options: EventChoiceOption[]
  timeLimit?: number // seconds to make choice
  defaultOption?: string // if time runs out
}

export interface EventHistory {
  eventId: string
  timestamp: number
  choicesMade: string[]
  outcomes: EventEffect[]
}

export interface EventState {
  activeEvents: Map<string, SpecialEvent>
  pendingChoices: Map<string, EventChoice>
  eventHistory: EventHistory[]
  globalEventMultiplier: Decimal
  lastEventTime: number
  eventCooldownGlobal: number
  discoveredEvents: Set<string>
  maxActiveEvents: number
}