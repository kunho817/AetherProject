import type { Decimal } from '@/utils/decimal'

export enum ConstellationType {
  ARIES = 'aries',
  TAURUS = 'taurus',
  GEMINI = 'gemini',
  CANCER = 'cancer',
  LEO = 'leo',
  VIRGO = 'virgo',
  LIBRA = 'libra',
  SCORPIO = 'scorpio',
  SAGITTARIUS = 'sagittarius',
  CAPRICORN = 'capricorn',
  AQUARIUS = 'aquarius',
  PISCES = 'pisces'
}

export interface RailStation {
  id: string
  name: string
  unlocked: boolean
  activated: boolean
  unlockCost: number // Star Rails
  visitCount: number
  effect: StationEffect
  position: { x: number; y: number }
}

export interface StationEffect {
  type: 'production' | 'cost' | 'synergy' | 'special'
  baseValue: Decimal
  description: string
}

export interface Constellation {
  id: ConstellationType
  name: string
  stations: RailStation[]
  unlocked: boolean
  activated: boolean
  activationCost: number // Star Rails
  completed: boolean
  advantage: ConstellationEffect
  penalty: ConstellationEffect
  specialMechanism: string
}

export interface ConstellationEffect {
  type: 'production' | 'cost' | 'synergy' | 'automation' | 'special'
  value: Decimal
  description: string
}

export interface TrainState {
  currentConstellation: ConstellationType | null
  currentStation: string | null
  position: { x: number; y: number }
  moving: boolean
  speed: number
  movementCooldown: number
}

export interface RailRoadState {
  constellations: Map<ConstellationType, Constellation>
  activeConstellations: ConstellationType[]
  maxActiveConstellations: number
  train: TrainState
  cosmicFragments: number
  intersectionsUnlocked: boolean
  discoveryMode: boolean
}

export enum ConstellationGroup {
  VERNAL_EQUINOX = 'vernal_equinox', // Aries, Taurus, Gemini
  SUMMER_SOLSTICE = 'summer_solstice', // Cancer, Leo, Virgo
  AUTUMNAL_EQUINOX = 'autumnal_equinox', // Libra, Scorpio, Sagittarius
  WINTER_SOLSTICE = 'winter_solstice' // Capricorn, Aquarius, Pisces
}

export interface GroupSynergy {
  group: ConstellationGroup
  constellations: ConstellationType[]
  active: boolean
  productionBonus: Decimal
  penaltyReduction: Decimal
  specialEffect: string
}

export interface RailIntersection {
  id: string
  name: string
  connectedConstellations: [ConstellationType, ConstellationType]
  unlocked: boolean
  activationCost: number // Star Rails
  activated: boolean
  effect: IntersectionEffect
  position: { x: number; y: number }
  visitCount: number
}

export interface IntersectionEffect {
  type: 'production' | 'cost' | 'synergy' | 'special'
  baseValue: Decimal
  maxValue: Decimal
  scalingFactor: number
  description: string
}

export enum IntersectionType {
  // Primary intersections (adjacent constellations)
  ARIES_TAURUS = 'aries_taurus',
  TAURUS_GEMINI = 'taurus_gemini',
  GEMINI_CANCER = 'gemini_cancer',
  CANCER_LEO = 'cancer_leo',
  LEO_VIRGO = 'leo_virgo',
  VIRGO_LIBRA = 'virgo_libra',
  LIBRA_SCORPIO = 'libra_scorpio',
  SCORPIO_SAGITTARIUS = 'scorpio_sagittarius',
  SAGITTARIUS_CAPRICORN = 'sagittarius_capricorn',
  CAPRICORN_AQUARIUS = 'capricorn_aquarius',
  AQUARIUS_PISCES = 'aquarius_pisces',
  PISCES_ARIES = 'pisces_aries',
  
  // Secondary intersections (opposite constellations)
  ARIES_LIBRA = 'aries_libra',
  TAURUS_SCORPIO = 'taurus_scorpio',
  GEMINI_SAGITTARIUS = 'gemini_sagittarius',
  CANCER_CAPRICORN = 'cancer_capricorn',
  LEO_AQUARIUS = 'leo_aquarius',
  VIRGO_PISCES = 'virgo_pisces',
  
  // Tertiary intersections (special combinations)
  FIRE_SIGNS = 'fire_signs', // Aries, Leo, Sagittarius
  EARTH_SIGNS = 'earth_signs', // Taurus, Virgo, Capricorn
  AIR_SIGNS = 'air_signs', // Gemini, Libra, Aquarius
  WATER_SIGNS = 'water_signs' // Cancer, Scorpio, Pisces
}