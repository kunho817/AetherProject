import type { Decimal } from '@/utils/decimal'

// Nebula component types for investment
export enum NebulaComponent {
  HYDROGEN = 'hydrogen',
  HELIUM = 'helium',
  CARBON = 'carbon',
  NITROGEN = 'nitrogen',
  OXYGEN = 'oxygen',
  SILICON = 'silicon',
  IRON = 'iron'
}

// Nebula types created through coordination
export enum NebulaType {
  STELLAR_NURSERY = 'stellar_nursery',
  PLANETARY_NEBULA = 'planetary_nebula',
  SUPERNOVA_REMNANT = 'supernova_remnant',
  DARK_NEBULA = 'dark_nebula',
  REFLECTION_NEBULA = 'reflection_nebula',
  EMISSION_NEBULA = 'emission_nebula',
  ABSORPTION_NEBULA = 'absorption_nebula'
}

// Interstellar Agglomerator - single element that aggregates all components
export interface InterstellarAgglomerator {
  totalInvestedNM: Decimal // Total NM invested in the agglomerator
  level: number // Agglomerator level (affects efficiency)
  efficiency: number // Efficiency multiplier for component allocation
}

// Component allocation data - how NM is allocated to each component
export interface ComponentAllocation {
  component: NebulaComponent
  allocatedNM: Decimal // NM allocated to this component from the agglomerator
  proportion: number // Current proportion in nebula (0-100%) based on allocation
  isPerfect: boolean // Whether this component is at its perfect ratio
}

// Nebula configuration for different types
export interface NebulaConfiguration {
  type: NebulaType
  name: string
  description: string
  centralComponent: NebulaComponent // The main component for this nebula
  perfectRatios: { component: NebulaComponent; ratio: number }[] // Perfect ratios for all components
  requirements: { component: NebulaComponent; minPercent: number; maxPercent: number }[]
  bonuses: NebulaBonus[]
  penalties: NebulaPenalty[]
  discovered: boolean
}

// Bonus effects from coordinated nebulae
export interface NebulaBonus {
  type: 'production_multiplier' | 'cost_reduction' | 'starecho_threshold' | 'special'
  target: 'stardust' | 'filaments' | 'starlight' | 'all' | 'starecho'
  baseValue: number // Base bonus value
  description: string
}

// Penalty effects from coordinated nebulae
export interface NebulaPenalty {
  type: 'production_reduction' | 'cost_increase' | 'special'
  target: 'stardust' | 'filaments' | 'starlight' | 'all'
  baseValue: number // Base penalty value
  description: string
}

// Main nebula coordination state
export interface NebulaState {
  nebulaMaterial: Decimal // Renamed from nebularEssence
  materialProductionRate: Decimal // NM production from filaments
  agglomerator: InterstellarAgglomerator // Single agglomerator for all components
  componentAllocations: ComponentAllocation[] // How NM is allocated to components
  activeNebula: NebulaType | null
  discoveredNebulae: NebulaType[]
  totalInvestment: Decimal // Total NM invested in the agglomerator
}