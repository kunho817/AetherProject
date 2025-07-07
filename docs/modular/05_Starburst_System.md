# Starburst System

## Core Concept

Starburst is the primary reset mechanism in Aether, providing exponential progression through strategic resets. Each Starburst grants powerful multipliers while resetting specific resources, creating a risk-reward dynamic central to the game.

## Starburst Conditions (Updated)

### Tiered Progression System

**First Starburst (Breakthrough)**:
- **Condition A**: Purchase first Tier 4 filament (Horsehead Nebula)
- **Condition B**: Reach 1e20 Stardust
- **Benefit**: Unlocks Tier 5, x2 production multiplier
- **Philosophy**: Multiple paths to first major milestone

**Early Starbursts (2nd-4th)**:
- **Requirements**: Progressive tier unlock requirements
- **Multiplier**: x2 per Starburst (cumulative)
- **Scaling**: Linear progression with clear goals
- **Total Power**: Up to x16 (2^4) by 4th Starburst

**Mid Starbursts (5th-8th)**:
- **Requirements**: Enhanced filament counts
- **Multiplier**: x3 per Starburst (enhanced scaling)
- **Special**: 5th Starburst unlocks Star Echo System
- **Total Power**: x16 × 3^(count-4) exponential scaling

**Late Starbursts (9th+)**:
- **Requirements**: 50+(5×count) Remnant Filaments (Tier 9)
- **Multiplier**: Continued x3 scaling
- **Challenge**: Exponentially increasing requirements
- **Preparation**: Building toward Nova Layer transition

## Multiplier System

### Base Multiplier Formula
```typescript
function calculateStarburstMultiplier(count: number): Decimal {
  if (count === 0) return D(1)
  
  if (count <= 4) {
    // Early game: x2 per Starburst
    return D(2).pow(count)
  } else {
    // Late game: x16 base × x3^(additional)
    const earlyGameBase = D(16) // 2^4
    const lateGameMultiplier = D(3).pow(count - 4)
    return earlyGameBase.mul(lateGameMultiplier)
  }
}
```

### Multiplier Enhancements

**Time Resonance Upgrade** (4 Starlight):
- Multiplies Starburst effect by 5
- Applies to entire multiplier chain
- Permanent enhancement after purchase

**Constellation Resonance** (16 Starlight):
- Squares random constellation effect per Starburst
- Synergizes with Rail Road system
- Creates compound bonuses

**Starlight Scaling**:
- Additional x1.1 per Starlight owned
- Applies multiplicatively to base Starburst effect
- Rewards long-term Starlight accumulation

## Reset Mechanics

### What Gets Reset
- **Cosmic Filaments**: All tiers return to 0
- **Stardust**: Reset to 0
- **Temporary Bonuses**: Event bonuses, temporary multipliers
- **Automation Settings**: Some automation configurations

### What Persists
- **Starlight**: All accumulated Starlight
- **Upgrades**: All purchased upgrades
- **Rail Road Progress**: Stations and discovered paths
- **Nebula Placements**: Grid configurations
- **Star Memory**: Items preserved by memory system
- **Achievements**: All earned achievements
- **Evolution Progress**: Filament evolution stages

### Special Mechanics

**Dimensional Anchor Upgrade**:
- Skip reset every 3rd Starburst
- Allows accumulation without losing progress
- Strategic timing for maximum benefit

**Star Rail Generation**:
- Generate Star Rail during Starburst if eligible for Starlight
- Formula: `Math.floor((starlightGained / 10) ** 0.5)` minimum 1
- Links Starburst to Rail Road progression

## Strategic Depth

### Timing Decisions

**When to Starburst Early**:
- Unlock next tier quickly
- Break through production walls
- Access new systems and mechanics

**When to Delay Starburst**:
- Accumulate resources for next layer
- Complete achievement requirements
- Optimize for maximum multiplier gain

### Optimization Strategies

**Early Game**:
1. Rush to first Starburst for tier unlocks
2. Build balanced filament foundation
3. Learn reset timing through experience

**Mid Game**:
1. Coordinate Starburst with other systems
2. Use Star Memory for strategic preservation
3. Time resets for constellation bonuses

**Late Game**:
1. Plan multi-Starburst strategies
2. Optimize for condensation preparation
3. Coordinate with all game systems

## Integration with Other Systems

### Star Memory Synergy
- **Preservation**: Save key resources across Starburst
- **Strategic Planning**: Choose what to preserve
- **Efficiency**: Faster rebuilding after reset

### Rail Road Interaction
- **Constellation Timing**: Coordinate with constellation effects
- **Path Optimization**: Use Rail Road bonuses effectively
- **Synergy Bonuses**: Stack multiple system effects

### Nebula Grid Benefits
- **Pattern Bonuses**: Grid patterns enhance Starburst effects
- **Cross-System**: Nebula bonuses apply to production
- **Strategic Placement**: Optimize grid for Starburst timing

### Upgrade Tree Coordination
- **Branch Synergy**: Different upgrade paths enhance Starburst
- **Timing**: Coordinate upgrades with reset timing
- **Long-term Planning**: Build toward optimal configurations

## Visual and Audio Design

### Visual Effects
- **Starburst Animation**: Dramatic visual feedback
- **Multiplier Display**: Clear indication of power gain
- **Progress Indicators**: Visual countdown to next Starburst
- **Mobile Optimization**: Touch-friendly Starburst button

### Audio Design
- **Starburst Sound**: Satisfying audio feedback
- **Milestone Chimes**: Audio cues for achievements
- **Progression Music**: Dynamic music based on Starburst count

## Quality of Life Features

### Information Display
- **Next Starburst**: Clear requirement display
- **Multiplier Preview**: Show potential gains
- **Timing Suggestions**: Optimal reset timing hints
- **Historical Tracking**: Record of past Starbursts

### Safety Features
- **Confirmation Dialog**: Prevent accidental resets
- **Preview Mode**: See effects before committing
- **Undo Protection**: Brief undo window for mistakes
- **Mobile Safeguards**: Extra confirmation on mobile

### Automation Support
- **Auto-Starburst**: Unlocks at 15 Starlight
- **Condition Monitoring**: Track requirements automatically
- **Smart Timing**: AI-suggested optimal timing
- **Safety Overrides**: Player control over automation

## Achievement Integration

### Starburst Achievements
- **Speed Achievements**: Fast Starburst challenges
- **Efficiency Rewards**: Optimal multiplier achievements
- **Milestone Rewards**: Starburst count achievements
- **Strategy Bonuses**: Rewards for different approaches

### Cross-System Achievements
- **Combo Achievements**: Coordinate with other resets
- **Synergy Rewards**: Maximize system interactions
- **Perfect Timing**: Optimal coordination achievements

## Future Development

### Nova Layer Integration
- **Cross-Layer Effects**: Starburst bonuses that persist
- **Enhanced Mechanics**: New Starburst variants
- **Meta-Progression**: Starburst mastery system

### Advanced Features
- **Starburst Variants**: Different types with unique benefits
- **Conditional Modifiers**: Situational bonuses
- **Dynamic Scaling**: Adaptive requirements
- **Community Challenges**: Shared Starburst goals

## Performance Considerations

### Mobile Optimization
- **Efficient Calculations**: Optimized multiplier computation
- **Visual Performance**: Smooth animations on mobile
- **Memory Management**: Proper cleanup of effects
- **Battery Efficiency**: Minimal CPU usage

### Scalability
- **Large Numbers**: Handles extreme Starburst counts
- **Performance**: Maintains 60fps during effects
- **Memory**: Efficient storage of Starburst history
- **Future-Proof**: Scales to Nova Layer requirements