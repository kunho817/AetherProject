# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

- **Project**: Aether - An incremental game (10 layers, currently implementing Glare Layer)
- **Status**: Design phase complete, ready for implementation
- **Stack**: Vue.js 3 + TypeScript + Pinia + break_eternity.js
- **Development**: Multiple Claude CLI instances working on features in parallel
- **Key Rule**: Complete and test each feature before moving to the next

## Project Overview

Aether Project is an incremental game with complex mechanics and strategic depth, designed for players who enjoy intricate game systems. The game consists of 10 layers, with the first layer (Glare Layer) being the primary focus of current development.

## Project Status

**Current State**: Design documentation only - no implementation exists yet.

**Available Files**:
- `Aether_Project_Concept.md` - High-level overview of all 10 game layers
- `Aether_Project_Glare_Layer_Concept.md` - Comprehensive design document for the Glare Layer (24,633 lines)
- `UI_Design_Ref.html` - Complete UI/CSS reference with animations and styling
- `break_eternity.js` - Library for handling large numbers (already downloaded)
- `CLI_Ref.md` - Claude CLI reference documentation

## Technology Stack (Planned)

Based on the parent directory's CLAUDE.md, this should be implemented as:
- **Framework**: Vue.js 3
- **State Management**: Pinia
- **Number Handling**: break_eternity.js (for large numbers beyond JavaScript's limits)
- **Styling**: CSS with animations and custom properties

## Project File Structure

```
Aether/
├── src/
│   ├── components/           # Vue components
│   │   ├── game/            # Game-specific components
│   │   │   ├── StarMap.vue
│   │   │   ├── ResourceDisplay.vue
│   │   │   ├── FilamentOrbit.vue
│   │   │   ├── NebulaGrid.vue
│   │   │   └── RailRoadNetwork.vue
│   │   └── ui/              # UI components
│   ├── stores/              # Pinia stores
│   │   ├── resources.ts     # Resource management
│   │   ├── filaments.ts     # Cosmic Filaments system
│   │   ├── starburst.ts     # Reset mechanics
│   │   ├── nebula.ts        # Grid system
│   │   └── gameLoop.ts      # Main game loop
│   ├── utils/               # Utilities
│   │   ├── decimal.ts       # break_eternity wrapper
│   │   ├── formatting.ts    # Number formatting
│   │   └── calculations.ts  # Game calculations
│   ├── types/               # TypeScript types
│   └── assets/              # Images, styles
├── public/                  # Static assets
├── tests/                   # Test files
└── docs/                    # Design documents
    ├── Aether_Project_Concept.md
    └── Aether_Project_Glare_Layer_Concept.md

```

## Key Design Documents

### Aether_Project_Glare_Layer_Concept.md
Contains complete specifications for:
- 15 detailed sections covering all game mechanics
- Exact formulas for calculations (e.g., Starburst multiplier: base x2, cumulative with x1.1 per Starlight)
- Reset mechanics (Starburst at 1e100 Stardust, tier unlock conditions)
- All 12 constellation effects with penalties and synergies
- UI layout specifications (Star Map system)
- Progression timeline (50+ hours to Nova Layer)

### UI_Design_Ref.html
Provides complete CSS implementation including:
- Star Map layout with central star and orbiting filaments
- Nebula grid system styling
- Rail Road constellation network visualization
- Animation keyframes for pulsation effects
- Color schemes and visual hierarchy
- Responsive design considerations

## Game Architecture

### Core Systems (Glare Layer)

1. **Resource System**
   - Stardust (basic production)
   - Starlight (prestige currency)
   - Star Rail, Nebular Essence, Stellar Energy, Cosmic Fragment

2. **Production Systems**
   - Cosmic Filaments (10 tiers with hierarchical production)
   - Milestone system (bonuses at purchase thresholds)
   - Evolution system (3 stages per filament)

3. **Reset Mechanisms**
   - Starburst (soft reset)
   - Starlight (extensive soft reset)
   - Supernova (layer transition preparation)

4. **Advanced Systems**
   - Nebula grid system with pattern bonuses
   - Star Pulsation with 5 cycle states
   - Rail Road constellation navigation
   - Star Memory preservation system
   - Upgrade tree with 4 branches

## Development Commands

### Initial Project Setup (First Claude Instance)

```bash
# Create Vue.js project with TypeScript, Pinia, and Vitest
npm create vue@latest . -- --typescript --jsx --pinia --vitest --eslint --prettier

# Install additional dependencies
npm install break-eternity
npm install -D @types/node

# Copy existing assets
cp break_eternity.js src/utils/
```

### Development Commands (Once Project Exists)

```bash
# Start development server
npm run dev

# Build for production
npm run build
npm run preview

# Code quality
npm run type-check
npm run lint
npm run format

# Testing
npm run test:unit
npm run test:unit -- --coverage
```

### Claude CLI Commands for Parallel Development

```bash
# Start new Claude instance for specific feature
claude "Implement the Resource System for Aether according to CLAUDE.md"

# Continue existing session
claude -c

# Resume specific session by ID
claude -r "<session-id>"

# Non-interactive mode for automated tasks
claude -p "Run all unit tests and report results"

# With specific permissions for development
claude --allowedTools "Bash(npm:*)" "Bash(git:*)" "Read" "Edit" "Write"
```

### Testing Commands

```bash
# Run all tests
npm run test

# Run specific test file
npm run test src/stores/__tests__/resources.test.ts

# Run tests in watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Implementation Guidelines

When implementing the game:

1. **State Management Structure**
   - Create separate Pinia stores for each major system (resources, filaments, nebula, etc.)
   - Use computed properties for derived values (production rates, multipliers)
   - Implement save/load functionality early

2. **Component Architecture**
   - `StarMap.vue` - Main game view with central star
   - `FilamentOrbit.vue` - Circular filament display
   - `NebulaGrid.vue` - Grid-based placement system
   - `RailRoadNetwork.vue` - Constellation navigation
   - `ResourceHeader.vue` - Resource display panel

3. **Number Handling**
   - Use Decimal from break_eternity.js for all game values
   - Implement proper number formatting (scientific notation)
   - Handle exponential growth properly (up to 1e10000+)

4. **Performance Considerations**
   - Implement efficient game loop (requestAnimationFrame)
   - Batch DOM updates
   - Use Vue's reactive system efficiently
   - Consider web workers for heavy calculations

5. **Save System**
   - Implement auto-save every 30 seconds
   - Use localStorage for persistence
   - Include save versioning for future updates
   - Compress save data

## Critical Game Values

### Key Formulas (from design doc)
- **Starlight Gain**: 1 Starlight when Stardust reaches 1e100
- **Star Rail Gain**: `Math.floor((starlightGained / 10) ** 0.5)` (minimum 1)
- **Filament Cost**: `baseCost * (costIncreaseFactor ** owned)`
- **Milestone Bonus**: x2 production for every 10 purchases
- **Hierarchy Synergy**: `(lowerTierQty ** 0.5) * (higherTierQty ** 0.3)`
- **Starburst Multiplier**: Base x2, cumulative (x1.1 per Starlight)

### Filament Base Values
| Tier | Base Cost | Cost Factor | Production Mult |
|------|-----------|-------------|-----------------|
| 1    | 10        | 1.8         | 1.5x            |
| 2    | 100       | 1.85        | 1.55x           |
| 3    | 1e4       | 1.9         | 1.6x            |
| 4    | 1e6       | 1.95        | 1.65x           |
| 5    | 1e9       | 2.0         | 1.7x            |
| 6    | 1e13      | 2.1         | 1.75x           |
| 7    | 1e18      | 2.2         | 1.8x            |
| 8    | 1e24      | 2.25        | 1.85x           |
| 9    | 1e31      | 2.3         | 1.9x            |
| 10   | 1e40      | 2.4         | 2.0x            |

## Key Implementation Challenges

1. **Complex Reset System**: Multiple reset types with different preservation rules
2. **Synergy Calculations**: Many interconnected systems affecting each other
3. **UI Complexity**: Displaying 10+ systems simultaneously without overwhelming players
4. **Number Scale**: Handling numbers from 10 to 1e10000+
5. **State Persistence**: Preserving complex game state across resets

## Testing Approach

When implementation begins:
- Unit tests for game calculations
- Integration tests for system interactions
- Save/load integrity tests
- Performance benchmarks for game loop
- Manual playtesting for game balance

## Development Workflow

### Parallel Claude CLI Strategy

The Aether Project implementation will use multiple Claude Code instances working in parallel:

1. **Feature Decomposition**: Break down the Glare Layer into independent, testable features
2. **Parallel Development**: Each Claude instance focuses on one specific feature
3. **Incremental Integration**: Complete and test each feature before moving to the next
4. **Test-Driven Progress**: Each feature must be tested and confirmed working before proceeding

### Implementation Order (Glare Layer)

Each feature should be implemented by a separate Claude instance in this order:

1. **Project Initialization** (Claude Instance #1)
   ```bash
   claude "Initialize the Aether Vue.js project according to CLAUDE.md specifications"
   ```

2. **Core Systems** (Claude Instance #2)
   ```bash
   claude "Implement Stardust resource and basic game loop for Aether"
   ```

3. **Cosmic Filaments** (Claude Instance #3)
   ```bash
   claude "Implement the 10-tier Cosmic Filaments system with formulas from design doc"
   ```

4. **Reset Systems** (Claude Instance #4)
   ```bash
   claude "Implement Starburst and Starlight reset mechanics"
   ```

5. **Advanced Features** (Claude Instances #5-10)
   - Nebula Grid System
   - Star Pulsation System
   - Rail Road System
   - Star Memory System
   - Upgrade Tree System
   - UI Polish and Integration

### Testing Protocol

Each feature must pass these tests before proceeding:
- Unit tests for core calculations
- Integration test with existing features
- Manual gameplay test for user experience
- Performance test (maintain 60 FPS)
- Save/load compatibility test