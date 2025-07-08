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

// Component investment data
export interface ComponentInvestment {
  component: NebulaComponent
  invested: Decimal // Total NM invested
  proportion: number // Current proportion in nebula (0-100%)
}

// Nebula configuration for different types
export interface NebulaConfiguration {
  type: NebulaType
  name: string
  description: string
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
  components: ComponentInvestment[]
  activeNebula: NebulaType | null
  discoveredNebulae: NebulaType[]
  totalInvestment: Decimal // Total NM invested across all components
}