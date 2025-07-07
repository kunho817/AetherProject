# Cosmic Filaments System

## Overview

Cosmic Filaments form the core production chain of the Glare Layer. This hierarchical system features 10 tiers of filaments, each producing the tier below it, creating an interconnected web of exponential growth.

## Filament Tiers

### Tier Structure (0-indexed)

| Tier | Name | Base Cost | Cost Factor | Production Multiplier |
|------|------|-----------|-------------|----------------------|
| 0 | Void Filament | 10 | 1.8 | 1.5x |
| 1 | Cosmic Filament | 100 | 1.85 | 1.55x |
| 2 | Spiral Filament | 1e4 | 1.9 | 1.6x |
| 3 | Ring Filament | 1e6 | 1.95 | 1.65x |
| 4 | Horsehead Filament | 1e9 | 2.0 | 1.7x |
| 5 | Helix Filament | 1e13 | 2.1 | 1.75x |
| 6 | Plasma Filament | 1e18 | 2.2 | 1.8x |
| 7 | Quantum Filament | 1e24 | 2.25 | 1.85x |
| 8 | Dark Filament | 1e31 | 2.3 | 1.9x |
| 9 | Remnant Filament | 1e40 | 2.4 | 2.0x |

## Production Mechanics

### Hierarchical Production
- Each tier produces the tier below it
- Tier 0 (Void) produces Stardust directly
- Higher tiers create exponential scaling through the chain

### Base Production Formula
```typescript
production = owned * productionMultiplier * globalMultipliers
```

### Cost Scaling
```typescript
cost = baseCost * (costFactor ** owned)
```

## Milestone System

### Milestone Bonuses
- **Every 10 purchases**: x2 production multiplier for that tier
- **Every 25 purchases**: Unlock next evolution stage
- **Every 50 purchases**: Special milestone bonus
- **Every 100 purchases**: Tier-specific unique bonus

### Milestone Types

**Production Milestones** (10, 20, 30, ...):
- Doubles production of specific tier
- Cumulative effect (10th = x2, 20th = x4, 30th = x8)
- Visual indicator shows next milestone progress

**Evolution Milestones** (25, 50, 75):
- Unlock evolution stages for filament
- Each stage provides unique benefits
- Required for accessing advanced features

**Special Milestones** (50, 100, 200, ...):
- Unlock tier-specific abilities
- Cross-tier synergy bonuses
- Access to unique mechanics

## Evolution System

### Three Evolution Stages per Filament

**Stage 1: Enhanced** (Unlock: 25 purchases)
- +50% base production
- Enhanced visual effects
- Improved milestone bonuses

**Stage 2: Augmented** (Unlock: 50 purchases, 100 total owned)
- +100% base production
- Cross-tier synergy bonuses
- Unlock tier-specific abilities

**Stage 3: Transcendent** (Unlock: 75 purchases, 250 total owned)
- +200% base production
- Maximum synergy effects
- Access to condensation system

### Evolution Benefits

**Enhanced Stage**:
- Production: Base × 1.5
- Synergy: +25% from adjacent tiers
- Visual: Particle effects upgrade

**Augmented Stage**:
- Production: Base × 2.0
- Synergy: +50% from adjacent tiers
- Special: Unlock tier ability

**Transcendent Stage**:
- Production: Base × 3.0
- Synergy: +100% from adjacent tiers
- Ultimate: Condensation contribution

## Synergy System

### Hierarchy Synergy
```typescript
bonus = (lowerTierQty ** 0.5) * (higherTierQty ** 0.3)
```

### Adjacent Tier Bonuses
- Each tier receives bonuses from tiers ±1
- Evolution stages amplify synergy effects
- Constellation effects can modify synergy

### Cross-Tier Effects
- Certain upgrades affect multiple tiers
- Pattern bonuses from Nebula system
- Rail Road constellation effects

## Unlock Progression

### Tier Unlock Conditions
- **Tiers 0-3**: Available from start
- **Tier 4+**: Unlocked through Starburst resets
- **Final Tiers**: Require multiple Starbursts

### Starburst Unlocks
- 1st Starburst: Unlock Tier 4 (Horsehead)
- 2nd Starburst: Unlock Tier 5 (Helix)
- 3rd Starburst: Unlock Tier 6 (Plasma)
- 4th Starburst: Unlock Tier 7 (Quantum)
- 5th Starburst: Unlock Tier 8 (Dark)
- 6th Starburst: Unlock Tier 9 (Remnant)

## Strategic Considerations

### Early Game Strategy
1. **Focus on Lower Tiers**: Build strong foundation
2. **Milestone Timing**: Plan purchases for milestone efficiency
3. **Balanced Growth**: Avoid over-investing in single tier

### Mid Game Optimization
1. **Synergy Maximization**: Balance adjacent tiers
2. **Evolution Planning**: Strategically evolve key tiers
3. **Reset Timing**: Coordinate with Starburst progression

### Late Game Mastery
1. **Perfect Balance**: Optimize entire chain
2. **Condensation Preparation**: Build toward layer transition
3. **Cross-System Integration**: Coordinate with all systems

## Quality of Life Features

### Visual Improvements
- **Star Map Integration**: Filaments displayed as orbital elements
- **Production Visualization**: Real-time production indicators
- **Evolution Effects**: Visual feedback for evolution stages
- **Mobile Optimization**: Touch-friendly tier management

### Information Display
- **Next Milestone**: Clear indication of progress
- **Production Breakdown**: Detailed contribution analysis
- **Efficiency Metrics**: Cost-effectiveness indicators
- **Synergy Calculator**: Preview of synergy effects

### Automation Integration
- **Auto-Filaments**: Automated purchasing at 15 Starlight
- **Smart Buying**: Optimal purchase distribution
- **Milestone Targeting**: Automated milestone optimization
- **Evolution Management**: Automated evolution decisions

## Advanced Mechanics

### Condensation Integration
- Transcendent filaments contribute to condensation
- Higher tiers provide exponentially more condensation
- Evolution stages multiply condensation effectiveness

### Cross-Layer Persistence
- Certain bonuses persist to Nova Layer
- Evolution achievements carry forward
- Milestone bonuses may have lasting effects

### Special Events
- **Filament Storms**: Temporary production bonuses
- **Cosmic Alignment**: Enhanced synergy periods
- **Evolution Events**: Reduced evolution requirements
- **Tier Celebrations**: Special milestone rewards

## Future Enhancements

### Nova Layer Integration
- New tier unlocks (10-19)
- Enhanced evolution system
- Cross-layer filament interactions
- Advanced synergy mechanics

### Advanced Features
- **Filament Specialization**: Choose tier focus areas
- **Custom Evolution Paths**: Player-directed evolution
- **Prestige Filaments**: Meta-progression system
- **Community Challenges**: Shared filament goals