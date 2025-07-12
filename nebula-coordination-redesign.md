# Nebula Coordination Redesign Plan

## Overview
Transforming Nebula Coordination from a ratio-based allocation system to an upgrade tree system that serves as experiential content for the full upgrade system implementation.

## Core Concept Changes

### From Current System:
- Invest NM → Allocate to components → Achieve ratios → Activate nebulae
- Auto-switching based on component ratios
- Perfect ratios provide bonuses

### To New System:
- Spend NM → Buy components → Purchase nebula upgrades → Unlock permanent bonuses
- Manual upgrade tree progression
- Components as currency for nebula purchases

## Implementation Phases

### Phase 1: Core Data Structure Changes
1. **Remove/Deprecate**:
   - Component allocation system
   - Ratio-based activation
   - Auto-switching logic
   - Agglomerator investment system

2. **Add New Structures**:
   - Component inventory system (purchased components)
   - Upgrade tree data structure
   - Nebula purchase/unlock status
   - Upgrade purchase tracking

3. **Modify Nebula Store**:
   - Components become purchasable resources
   - Nebulae become permanent upgrades
   - Track purchased upgrades per nebula type

### Phase 2: Upgrade System Implementation
1. **Upgrade Categories** (8 total):
   - **Coordinator** (Core upgrade type)
     - Nebula unlock upgrades (7 total)
     - Component-specific bonus upgrades
     - Component purchase efficiency upgrades
   - **7 Nebula Types** (Each with own upgrade tree)
     - Bonus amplification upgrades
     - Penalty reduction upgrades
     - Nebula-specific special upgrades

2. **Purchase Flow**:
   - NM → Components (direct purchase)
   - Components → Nebula unlocks
   - Components → Nebula upgrades

3. **Upgrade Effects**:
   - Permanent bonuses (not ratio-dependent)
   - Stackable effects
   - Progressive power scaling

### Phase 3: UI Structure (Logic Only)
1. **Central Hub Design**:
   - Center: Coordinator icon (main control)
   - Orbit: 7 nebula icons
   - Click behavior: Expands selected icon's upgrade tree

2. **Tree Expansion Logic**:
   - Clicked icon moves to center
   - Other icons push outward
   - Upgrade nodes appear around central icon
   - Tree structure radiates from center

3. **State Management**:
   - Track current view (Coordinator or specific nebula)
   - Manage tree expansion/collapse states
   - Handle upgrade availability checks

### Phase 4: Component Economy
1. **Component Purchasing**:
   - Each component has escalating NM cost
   - Bulk purchase options
   - No allocation needed - direct inventory

2. **Component Spending**:
   - Different nebulae require different component combinations
   - Upgrades have component costs
   - Some upgrades may require multiple component types

### Phase 5: Migration & Compatibility
1. **Save Data Migration**:
   - Convert existing allocations to component inventory
   - Grant nebula unlocks based on discovery status
   - Preserve total NM investment value

2. **Balance Considerations**:
   - Component costs based on previous allocation costs
   - Nebula unlock costs proportional to previous requirements
   - Upgrade costs scale with power level

## Technical Implementation Order

### Step 1: Backend Preparation
- Create new TypeScript interfaces for upgrades
- Implement component inventory system
- Add upgrade tree data structures
- Create upgrade effect calculators

### Step 2: Store Refactoring
- Modify nebula store for new system
- Remove allocation-based logic
- Add purchase/upgrade tracking
- Implement component transactions

### Step 3: Core Mechanics
- Component purchase functions
- Nebula unlock mechanics
- Upgrade purchase validation
- Effect application system

### Step 4: UI Logic Framework
- Tree expansion/collapse logic
- Icon positioning calculations
- Upgrade node placement algorithms
- State transition management

### Step 5: Integration
- Connect to existing game systems
- Update save/load functionality
- Ensure backward compatibility
- Balance testing framework

## Data Structure Preview

```typescript
interface ComponentInventory {
  [NebulaComponent.HYDROGEN]: Decimal
  [NebulaComponent.HELIUM]: Decimal
  // ... etc
}

interface UpgradeNode {
  id: string
  type: 'coordinator' | NebulaType
  name: string
  description: string
  cost: {
    components?: Partial<ComponentInventory>
    nm?: Decimal
  }
  effects: UpgradeEffect[]
  requires?: string[] // prerequisite upgrade IDs
  purchased: boolean
}

interface NebulaUpgradeTree {
  unlocked: boolean
  upgrades: UpgradeNode[]
}
```

## Benefits of New System
1. **Clearer Progression**: Visual upgrade tree vs abstract ratios
2. **Permanent Investments**: No loss from ratio changes
3. **Strategic Choices**: Multiple upgrade paths
4. **Better Onboarding**: Intuitive purchase → unlock flow
5. **Expandability**: Easy to add new upgrades/nebulae

## Next Steps
1. Confirm design direction
2. Begin Phase 1 implementation
3. Create placeholder UI structure
4. Test core mechanics
5. Iterate based on feedback

This redesign transforms Nebula Coordination into a more engaging, strategic system that better prepares players for the full upgrade tree mechanics while maintaining the thematic connection to nebulae and cosmic components.