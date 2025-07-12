import { Decimal } from '@/utils/decimal'
import { NebulaType, NebulaComponent } from './nebula'

// Component inventory tracking
export interface ComponentInventory {
  [NebulaComponent.HYDROGEN]: Decimal
  [NebulaComponent.HELIUM]: Decimal
  [NebulaComponent.CARBON]: Decimal
  [NebulaComponent.NITROGEN]: Decimal
  [NebulaComponent.OXYGEN]: Decimal
  [NebulaComponent.SILICON]: Decimal
  [NebulaComponent.IRON]: Decimal
}

// Upgrade types
export type UpgradeType = 'coordinator' | NebulaType

// Effect types for upgrades
export enum UpgradeEffectType {
  // Component effects
  COMPONENT_COST_REDUCTION = 'component_cost_reduction',
  COMPONENT_BULK_PURCHASE = 'component_bulk_purchase',
  
  // Nebula effects
  NEBULA_BONUS_MULTIPLIER = 'nebula_bonus_multiplier',
  NEBULA_PENALTY_REDUCTION = 'nebula_penalty_reduction',
  NEBULA_SPECIAL_EFFECT = 'nebula_special_effect',
  
  // Coordinator effects
  UNLOCK_NEBULA = 'unlock_nebula',
  GLOBAL_COMPONENT_BONUS = 'global_component_bonus',
  
  // Production effects
  PRODUCTION_MULTIPLIER = 'production_multiplier',
  COST_REDUCTION = 'cost_reduction'
}

// Upgrade effect definition
export interface UpgradeEffect {
  type: UpgradeEffectType
  target?: string // Component type, nebula type, or resource
  value: number
  description: string
}

// Component cost structure
export interface ComponentCost {
  [component: string]: Decimal
}

// Upgrade node definition
export interface UpgradeNode {
  id: string
  type: UpgradeType
  name: string
  description: string
  tier: number // For positioning in tree
  cost: {
    components?: Partial<ComponentInventory>
    nm?: Decimal
  }
  effects: UpgradeEffect[]
  requires?: string[] // Prerequisite upgrade IDs
  purchased: boolean
  available: boolean
  position?: { x: number; y: number } // For UI positioning
}

// Nebula upgrade tree
export interface NebulaUpgradeTree {
  type: NebulaType
  unlocked: boolean
  baseUnlockCost: Partial<ComponentInventory>
  upgrades: UpgradeNode[]
}

// Coordinator upgrade tree
export interface CoordinatorUpgradeTree {
  upgrades: UpgradeNode[]
}

// Complete upgrade system state
export interface NebulaUpgradeSystem {
  componentInventory: ComponentInventory
  componentPurchaseCount: { [key in NebulaComponent]: number } // For cost scaling
  
  coordinator: CoordinatorUpgradeTree
  nebulaTrees: Map<NebulaType, NebulaUpgradeTree>
  
  purchasedUpgrades: Set<string> // All purchased upgrade IDs
  activeEffects: UpgradeEffect[] // Compiled list of all active effects
}

// Component purchase options
export interface ComponentPurchaseOption {
  component: NebulaComponent
  amount: number
  baseCost: Decimal
  scalingFactor: number
  currentCost: Decimal
}

// UI State for upgrade tree view
export interface UpgradeTreeViewState {
  selectedType: UpgradeType
  expandedNodes: Set<string>
  hoveredNode: string | null
  canPurchase: Set<string> // Upgrade IDs that can be purchased
}

// Upgrade tree configuration (for defining upgrade trees)
export interface UpgradeTreeConfig {
  coordinator: {
    unlockNebula: {
      [key in NebulaType]: UpgradeNode
    }
    componentUpgrades: UpgradeNode[]
    globalUpgrades: UpgradeNode[]
  }
  nebulae: {
    [key in NebulaType]: {
      bonusUpgrades: UpgradeNode[]
      penaltyUpgrades: UpgradeNode[]
      specialUpgrades: UpgradeNode[]
    }
  }
}

// Helper type for partial component costs
export type PartialComponentCost = Partial<Record<NebulaComponent, number>>

// Upgrade categories for organization
export enum UpgradeCategory {
  UNLOCK = 'unlock',
  BONUS = 'bonus',
  PENALTY = 'penalty',
  SPECIAL = 'special',
  COMPONENT = 'component',
  GLOBAL = 'global'
}

// Visual configuration for upgrade nodes
export interface UpgradeNodeVisual {
  icon?: string
  color?: string
  borderColor?: string
  glowColor?: string
}

// Extended upgrade node with visual info
export interface UpgradeNodeWithVisual extends UpgradeNode {
  visual?: UpgradeNodeVisual
  category: UpgradeCategory
}