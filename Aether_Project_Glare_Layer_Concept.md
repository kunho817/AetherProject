# Aether Project - Glare Layer Final Design Document

## Table of Contents
1. [Game Overview](#1-game-overview)
2. [Reset Mechanisms and Number System](#2-reset-mechanisms-and-number-system)
3. [Basic Resource System](#3-basic-resource-system)
4. [Cosmic Filaments System](#4-cosmic-filaments-system)
5. [Starburst System](#5-starburst-system)
6. [Nebula System](#6-nebula-system)
7. [Star Pulsation System](#7-star-pulsation-system)
8. [Rail Road System](#8-rail-road-system)
9. [Star Memory System](#9-star-memory-system)
10. [Upgrade Tree System](#10-upgrade-tree-system)
11. [Special Event System](#11-special-event-system)
12. [Condensation System](#12-condensation-system)
13. [Nova Layer Transition Preparation](#13-nova-layer-transition-preparation)
14. [Star Map UI System](#14-star-map-ui-system)
15. [Game Progression Flow](#15-game-progression-flow)

---

## 1. Game Overview

Aether Project is an incremental game that provides complexity and strategic depth from the beginning, with difficulty scaling geometrically as you progress to late game. Designed for gamers who prefer complex mechanisms, it combines elements from Antimatter Dimensions and The Modding Tree.

Glare Layer is the game's first layer, themed around stellar evolution and cosmic energy flow. Players manage stellar energy, develop cosmic filaments, and harness the power of constellations to ultimately evolve to the next layer through supernova explosions.

## 2. Reset Mechanisms and Number System

### 2.1 Reset Mechanisms

#### Soft Reset
A reset that only initializes functions below the corresponding reset function's level.

##### Starburst (Initial Soft Reset)
* **Reset Target**: Cosmic Filaments, Stardust
* **Retained**: Upgrades, Rail Road progress, Nebula/Star Echo placement, Star Pulsation settings
* **Effect**: Production multiplier effect applied, higher tier unlock

##### Starlight (Extensive Soft Reset)
* **Reset Target**: Starburst count, Cosmic Filaments, Stardust, Nebula placement, Upgrades, Rail Road progress
* **Retained**: Accumulated Starlight, items preserved by Star Memory System
* **Effect**: Base production increase, additional system unlock, new game mechanism introduction
* **Additional Requirements**: Also required when changing Rail Road constellations or upgrade paths

##### Supernova (Soft Reset for Nova Layer Preparation)
* **Reset Target**: Starburst, Cosmic Filaments, Stardust, Nebula, Rail Road, Star Pulsation settings
* **Retained**: Condensation investment, accumulated Starlight
* **Effect**: Nova preparation quest progress, Nova energy condensation enhancement
* **Usage Timing**: Used during Nova condensation phenomenon (after 100+ Starlight investment)

#### Hard Reset
A reset that completely initializes all game progress.
* **Reset Target**: All progress, achievements, statistics
* **Retained**: Nothing (complete initialization)

#### Layer Reset
A reset that initializes everything in the current layer and opens the next layer.

##### Supernova Ignition (Nova Layer Entry)
* **Reset Target**: All Glare Layer elements (including Starlight, Condensation)
* **Retained**: Permanent upgrades between layers (Supernova evolution path, etc.)
* **Acquired Resources**: Nova energy/Nova Layer resources
* **Effect**: Nova Layer unlock, new game mechanism introduction
* **Activation Condition**: Nova preparation quest complete, 120+ Starlight invested

### 2.2 Number System and Effect Design
* **Game Scale**: Starlight acquisition starts at Stardust 1e100, then rapidly increases to 1e1000, 1e10000, etc.
* **Effect Value Design Principles**:
  * **base**: Uses x(multiply), +, ^ operators
  * **exponential**: Uses + operator
  * **entire(base^exponent value)**: Uses *, + operators

## 3. Basic Resource System

* **Stardust**: Basic production resource. Foundation of all production.
* **Starlight**: Primary prestige resource. Gain 1 when reaching Stardust 1e100 (includes major reset).
* **Star Rail**: Resource needed for constellation navigation. Gain `(Starlight gained / 10) ^ 0.5` on Starburst (rounded down, minimum 1).
* **Nebular Essence**: Used for Nebula system upgrades. Gain `0.01%` of purchase cost when buying Cosmic Filaments.
* **Stellar Energy**: Accumulates over time (base 1/sec, max 1000). Used for Star Pulsation cycle manipulation.
* **Cosmic Fragment**: Used for special upgrades in Rail Road system. Gain `1 + (station order / 2)` when unlocking Rail Road stations (rounded down).

## 4. Cosmic Filaments System

### 4.1 Basic Structure
10 types of Cosmic Filaments form a hierarchical production chain.

| Tier | Name                  | Production Target      | Base Cost  | Cost Increase Factor | Production Multiplier on Purchase |
| :--- | :-------------------- | :--------------------- | :--------- | :------------------- | :-------------------------------- |
| 1    | Orion Filament        | Stardust               | 10         | 1.8                  | 1.5x                              |
| 2    | Eagle Filament        | Orion Filament         | 100        | 1.85                 | 1.55x                             |
| 3    | Crab Filament         | Eagle Filament         | 1e4        | 1.9                  | 1.6x                              |
| 4    | Horsehead Filament    | Crab Filament          | 1e6        | 1.95                 | 1.65x                             |
| 5    | Trifid Filament       | Horsehead Filament     | 1e9        | 2.0                  | 1.7x                              |
| 6    | Planetary Filament    | Trifid Filament        | 1e13       | 2.1                  | 1.75x                             |
| 7    | Butterfly Filament    | Planetary Filament     | 1e18       | 2.2                  | 1.8x                              |
| 8    | Reflection Filament   | Butterfly Filament     | 1e24       | 2.25                 | 1.85x                             |
| 9    | Dark Filament         | Reflection Filament    | 1e31       | 2.3                  | 1.9x                              |
| 10   | Remnant Filament      | Dark Filament          | 1e40       | 2.4                  | 2.0x                              |

### 4.2 Milestone System
* **10 Purchase Milestone**: Production x2 for each 10 purchases of the filament
* **Cumulative Effect**: x4 at 20 purchases, x8 at 30 purchases, etc.

### 4.3 Star Echo System (Early Nebula Precursor)
* **Unlock Condition**: Upon achieving 5th Starburst
* **Structure**: Simplified system allowing placement of 3 filaments around central star
* **Effect**: Placed filaments production x2, additional bonus for larger tier differences

### 4.4 Filament Evolution System
* **Unlock Conditions**: 
  * Stage 1 Evolution: System unlocked at 5 Starlight
  * Stage 2 Evolution: Unlocked at 8 Starlight
  * Stage 3 Evolution: Unlocked at 18 Starlight

* **Evolution Conditions**: 100+ purchases of the filament + Nebular Essence (tier-based cost)

* **Evolution Effects**:
  * Stage 1: Production ^1.5, cost increase factor -0.05
  * Stage 2: Hierarchy synergy efficiency x3, grid adjacency synergy x1.5
  * Stage 3: Unique ability unlock (e.g., Tier 10 - all production ^1.2)

## 5. Starburst System

### 5.1 Activation Conditions
* **1st**: When first purchasing Tier 4 filament (Horsehead) (or reaching Stardust 1e20)
* **2nd-9th**: When reaching 25 of current highest tier filament
* **10th onwards**: When reaching 50+(5×Starburst count) Remnant Filaments (Tier 10)

### 5.2 Tier Unlock
* Initial: Can purchase Tier 1-4 filaments
* Each Starburst unlocks 1 additional tier
* 6th Starburst: All tiers (10 tiers) fully unlocked

### 5.3 Multiplier Effects
* **Base Multiplier**: Production x2 after first Starburst
* **Cumulative Effects**:
  * 1st-4th: x2 each (cumulative x16)
  * 5th-8th: x3 each (cumulative x16 × 3^4 = x432)
  * 9th onwards: x1.5 each
* **Starlight Effect**: Effect x1.1 per Starlight

### 5.4 Automation
* **Unlock Condition**: Reaching 15 Starlight
* **Options**:
  * Conditional automation: Auto Starburst when production reaches x10 of benchmark
  * Time-based: Timer setting, auto-execute when conditions met
  * Enable/disable toggle provided

## 6. Nebula System

### 6.1 Basic Structure
* **Unlock Condition**: Upon first Starlight acquisition (evolves from Star Echo)
* **Grid Structure**:
  * Initial: 3×3 grid
  * 12 Starlight: Can expand to 4×3 grid
  * 20 Starlight: 4×4 grid expansion and all patterns unlocked

### 6.2 Synergy Effects
* **Hierarchy Synergy**: `(lower tier quantity)^0.5 × (higher tier quantity)^0.3`
* **Grid Synergy**: Production x1.3 when placed adjacent
* **Pattern Bonuses**:
  * Triangle: Production x2
  * Cross: Starlight gain x1.75
  * Square: Purchase cost ^0.6
  * Circle: Synergy x3

### 6.3 Variant Pattern System
* Effects change based on filament tiers included in the same basic pattern
* **Special Combination Examples**:
  * Triangle with Tier 1, 5, 10 filaments triggers "Trinity" effect - production ^1.2
  * Cross with Tier 2, 4, 6, 8, 10 triggers "Balanced Cross" - cost ^0.4

## 7. Star Pulsation System

### 7.1 Unlock and Gradual Expansion
* **2 Starlight**: Only Expansion and Contraction phases exist
* **5 Starlight**: Stability phase added
* **12 Starlight**: Cataclysm and Fusion phases added, prediction and control enabled

### 7.2 Cycle States and Effects
* **Expansion Phase** (15 sec): Production x5, cost x1.5, Rail Road speed x2, prediction accuracy x0.8
* **Contraction Phase** (15 sec): Cost ^0.5, production x0.75, Starlight gain x1.4, constellation effect x2, movement speed ^0.7
* **Stability Phase** (10 sec): All effects x1.5, stellar energy gain x2, Nebula synergy x0.8, Star Rail consumption ^0.6
* **Cataclysm Phase** (12 sec): Random production ^1.5 (every 5 sec), filament level effect x0.65, constellation effect spike x10
* **Fusion Phase** (8 sec): Nebula synergy ^2, upgrade effect x1.5, energy consumption x3, constellation effect x3, movement disabled

### 7.3 Manual Control System
* **Normal Transition**: Consume 100 stellar energy, transition to next state
* **Rapid Transition**: Consume 250 stellar energy, instantly transition to desired state, but 10% chance to enter "Unstable" state
* **State Extension**: Consume 50 stellar energy, extend current state by 10 sec, but "Unstable" probability increases with extensions
* **Unstable State**: All production halted, lasts 15 sec, then transitions to random state

### 7.4 Celestial Observatory Upgrades
* **Telescope**: Improve cycle prediction accuracy (up to 90%)
* **Phase Analyzer**: Display exact remaining time of current state
* **Energy Flow Analysis**: Detailed display of resource acquisition rates (per state)
* **Cycle Regulator**: Extend current state using stellar energy
* **State Transitioner**: Instantly transition to next state using stellar energy

## 8. Rail Road System

### 8.1 Basic Structure
* **12 Constellation Paths**: Each constellation contains 5-7 stations
* **Station Unlock Cost**: 1-3 Star Rails (increases with path progress)
* **Constellation Activation Cost**: 5 Star Rails (after path completion)
* **Limitation**: Only about 70% of all nodes can be activated, maximum 3 constellations active simultaneously

### 8.2 Constellation Effects and Dilemma System

| Constellation | Basic Effect (Advantage) | Penalty (Disadvantage) | Special Mechanism |
|---------------|-------------------------|----------------------|-------------------|
| Aries | Filament cost ^0.7 | Production x0.8 | Cost increase factor -0.2 |
| Taurus | Production x5 | Cost x1.8 | Milestone effect ^1.2 |
| Gemini | Lower 5 tiers automated | Efficiency x0.7 | Nebula pattern effect x2 |
| Cancer | Synergy x4 | Movement speed ^0.5 | Resource production minimum guaranteed |
| Leo | Pulsation control +80% | Pulsation penalty x2 | Effect: base × Starburst^0.3 |
| Virgo | Nebula effect x4 | Essence gain x0.6 | Pattern recommendation and automation |
| Libra | Preservation rate x3 | Production acceleration x0.75 | Train speed adjustment (-50%/+100%) |
| Scorpio | Cataclysm effect ^2 | Other state effects x0.8 | Debuff reversal mechanism |
| Sagittarius | Production x10 | Automation disabled | Starburst starting point 10% → up to 50% |
| Capricorn | Fragment x5 | Star Rail consumption x1.5 | Additional gain 50% chance |
| Aquarius | Starlight x1.4 | Production speed x0.85 | Early gain per milestone achievement |
| Pisces | Constellation effect x2 | Activation cost x2 | Gain 10-30% of inactive constellation effects |

### 8.3 Constellation Group Synergies
* **Vernal Equinox Group** (Aries, Taurus, Gemini): When activated together, production x2.5, penalty ^0.8
* **Summer Solstice Group** (Cancer, Leo, Virgo): When activated together, system efficiency ^1.3, penalty ^0.9
* **Autumnal Equinox Group** (Libra, Scorpio, Sagittarius): When activated together, special effects x2, penalty x1.2
* **Winter Solstice Group** (Capricorn, Aquarius, Pisces): When activated together, resource gain x1.5, penalty ^0.75

### 8.4 Station Enhancement System
* **Basic Principle**: Node effects permanently increase each time the train visits
* **Enhancement Formula**: Base effect plus `(visit count × 0.05)` multiplier increase
* **Maximum Enhancement**: Effect x6 (100 visits)

### 8.5 Railroad Intersections
* **Unlock Condition**: Reaching 8 Starlight
* **Function**: Provides movement paths between constellations, holds special effects
* **Risk Element**: 10% chance of "space distortion" when passing intersection, moves to random location

### 8.6 Constellation Journey System
* **Discovery Mode**: All stations covered in fog when first exploring constellation paths
* **Station Exploration**: Move train to discover new stations, random events occur during exploration
* **Path Recording**: Once explored, paths are permanently recorded in "Star Map"

### 8.7 Constellation Selection Permanence
* **Initial Selection**: First 3 constellations can be freely selected and activated
* **Constellation Replacement**: Changing already activated constellations or trying new constellation combinations requires **Starlight reset**
* **Strategic Significance**: Constellation selection is a major strategic decision maintained throughout one Starlight cycle

## 9. Star Memory System

### 9.1 Basic Concept
* **Unlock Condition**: Reaching 3 Starlight
* **Function**: Preserves part of progress reset during Starlight acquisition
* **Slots**: Initially 1, increases up to 5 with additional Starlight

### 9.2 Preservation Targets and Values
* **Filament Evolution**: Preserves selected tier's filament evolution stage ^0.5
* **Nebula Pattern**: Fully preserves 1 Nebula pattern
* **Rail Road Progress**: Preserves selected constellation path 1 ^0.3
* **Upgrades**: Preserves selected upgrade tree 1 ^0.25

### 9.3 Extended Features
* **8 Starlight**: Preservation rate ^1.2
* **15 Starlight**: Additional slots +2 (total 3)
* **25 Starlight**: Can preserve specific items 100% (uses 1 slot)

### 9.4 Strategy Preservation Options
* **Specific Path Preservation**: Use Star Memory slots to partially preserve selected Rail Road paths or upgrade paths
* **Preservation Limit**: Complete preservation impossible, maximum 30% preservation by default
* **Priority Preservation**: Can designate "priority preservation items" with slot option added at 15 Starlight

## 10. Upgrade Tree System

### 10.1 Basic Structure
* **Central Hub**: "Star Core" - starting point for all upgrade trees
* **4 Major Branches**: Each enhances core game mechanisms
* **Cost**: Consumes Starlight (initially 1-2, later 5-30 Starlight/upgrade)
* **Unlock Condition**: Basic branches unlock on first Starlight, expand with additional Starlight

### 10.2 Four Major Branch Upgrades

#### Production Branch "Heart of the Star"
* **Fusion Ignition** (2 Starlight): Production x8
* **Star Pulse** (5 Starlight): Milestone effect ^1.5
* **Photon Acceleration** (8 Starlight): Time x4 (production only)
* **Supernova Energy** (15 Starlight): Production ^1.3, pulsation cycle ^0.5

#### System Branch "Shoulders of the Universe"
* **Cosmic Network** (3 Starlight): Synergy x5
* **Dimensional Folding** (7 Starlight): Selected system synergy ^2
* **Multiple Paradox** (12 Starlight): System effect x8, debuff occurs
* **Cosmic Synchronize** (20 Starlight): Auto-optimization + effect x2

#### Evolution Branch "River of Time"
* **Time Resonance** (4 Starlight): Starburst effect x5
* **Quantum Invariance** (9 Starlight): Preservation rate x5
* **Dimensional Anchor** (14 Starlight): No reset every 3rd Starburst
* **Eternal Loop** (25 Starlight): Progress auto-preservation ^0.4

#### Expansion Branch "Will of the Stars"
* **Parallel Universe** (6 Starlight): Pulsation states apply simultaneously x1.5
* **Space Expansion** (10 Starlight): Grid allows same filament in all positions
* **Constellation Resonance** (16 Starlight): Random constellation effect ^2 per Starburst
* **Reality Expansion** (30 Starlight): Filament purchase count ^1.5, milestone criteria ^0.8

### 10.3 Intersection Upgrades
* Special upgrades located where two branches meet
* Very high cost (25-50 Starlight) and game-altering effects
* Only one selectable per intersection (other side permanently blocked)

### 10.4 Secret Upgrades
* 4 hidden upgrades only displayed when specific conditions are met
* Powerful and unique effects: upgrades that fundamentally change game mechanisms

### 10.5 Upgrade Path Permanence
* **Initial Selection**: First upgrade in each branch can be freely selected
* **Path Lock**: Selecting upgrades in a specific branch requires **Starlight reset** to change paths
* **Intersection Selection**: Upgrade selection at two-branch intersections is particularly important, requiring reset to change

## 11. Special Event System

### 11.1 "Star Resonance" Event (15 Starlight)
* **Discovery**: Glowing "resonance points" appear, special "resonance node" created in Rail Road center
* **Activation Conditions**:
  * 3 specific constellations activated simultaneously
  * Star pulsation in "Fusion" state
  * Specific Nebula pattern configured
* **Challenge**: 5 pulsation state transitions and Nebula pattern configuration within 30 seconds
* **Reward**: Nebula-pulsation system synergy ^1.5, production increase effect after Starburst

### 11.2 "Supernova Omen" Event (18 Starlight)
* **Signs**: Central star instability effect, energy explosion
* **3 Special Missions**: 
  * **Core Analysis**: Achieve 50 Tier 10 filaments
  * **Pressure Test**: Maintain central star in "Cataclysm" state for 80 seconds
  * **Energy Alignment**: Activate 12 constellations in specific order (10 seconds each)
* **Reward**: Adds "Supernova Stage" to star pulsation (effect x12), Supernova evolution path enhancement

## 12. Condensation System (20 Starlight)

### 12.1 Basic Mechanism
* **Function**: Invest Starlight to reduce Starburst target and prepare for Nova Layer
* **Effect Calculation**: Target ^(1 - invested Starlight^0.6 × 0.01)
* **Maximum Effect**: Target ^0.05 (95% reduction)

### 12.2 Investment Stages
* **Initial Stage** (1-10 Starlight): Target reduction + Stardust production x1.1/Starlight
* **Middle Stage** (10-50 Starlight): Additionally Starburst effect x1.5
* **Advanced Stage** (50-100 Starlight): Additionally Nebula synergy ^1.3
* **Final Stage** (100+ Starlight): Nova condensation phenomenon occurs, Nova Layer unlock preparation

### 12.3 System Integration
* **Nebula Integration**: Condensation efficiency x1.15 when specific patterns configured
* **Star Pulsation Integration**: Bonus gained when investing during Fusion state
* **Rail Road Integration**: Investment cost ^0.9 with special circular path
* **Supernova Integration**: Specific evolution paths support Nova preparation quests

## 13. Nova Layer Transition Preparation

### 13.1 Nova Signs (25 Starlight)
* **Cosmic Changes**: Background gradually shifts to red/orange hues
* **Instability**: Star pulsation cycles occasionally change randomly
* **Message**: "Something is approaching from afar..."

### 13.2 Star Instability (30+ Starlight & Condensation Start)
* **Visual Effects**: Star grows larger and more unstable with Condensation investment
* **Flickering**: Background stars flicker more frequently as investment increases
* **Warning**: "Explosion imminent" warning message at 100+ Starlight investment

### 13.3 Nova Condensation Phenomenon (100+ Starlight)
* **Phenomenon Occurrence**: Nova energy condensation phenomenon occurs in space
* **Supernova Activation**: Supernova possible at this stage (soft reset maintaining Condensation/Starlight)
* **Efficiency**: Nova preparation quests progress more efficiently through Supernova

### 13.4 Nova Preparation Quests
* **"Star Completion"**: Invest 120+ Starlight in Condensation
* **"Knowledge of the Universe"**: Activate all constellations at least once
* **"Matter Evolution"**: Evolve each tier filament to at least stage 2
* **"Pattern Completion"**: Complete special Nebula pattern "Nova's Prelude"
* **Upon Meeting Conditions**: "Supernova Ignition" button activates, Nova Layer entry possible

## 14. Star Map UI System

### 14.1 Basic Configuration
* **Central Star (Glare)**: Screen center, displays Stardust production and pulsation state
* **Filament Orbits**: 10 concentric orbits around central star, each tier filament placement
* **Nebula Zone**: Grid in left area, filament placement area
* **Rail Road Network**: Right and outer areas, railways extending to constellations

### 14.2 Control Panel
* **Resource Display**: Shows current amount and acquisition rate of all resources
* **System Toggle**: Switches between detailed control panels for each system
* **Starburst Button**: Central button activated when conditions met
* **Event Notifications**: Displays special events and achievable goals

### 14.3 Synergy Visualization
* **Energy Flow**: Connections between activated systems represented by light lines
* **Synergy Strength**: Synergy strength expressed by line brightness and thickness
* **Information Display**: Detailed values popup on mouse over elements

### 14.4 UI Evolution
* **Initial**: Only central star and few filament orbits displayed (simple form)
* **After Starburst**: Orbit addition, partial Rail Road unlock
* **First Starlight**: Overall UI color change, Nebula zone appears
* **Additional Starlight**: Progressive UI element expansion and complexity
* **Nova Preparation**: Central star color change, overall red tone increase

### 14.5 Selection System Visualization
* **Locked Selections**: Currently activated constellations and nodes, selected upgrade paths shown with lock icons
* **Change Unavailable Display**: "Selectable after Starlight reset" tooltip on mouse over inactive nodes
* **Path Visualization**: Selected upgrade paths displayed with bright connection lines

## 15. Game Progression Flow

### 15.1 Initial Stage (0 Starlight)
* **0-30 min**: Purchase Tier 1-4 filaments, set up basic production
* **30 min-1 hr**: First Starburst, Tier 5 filament unlock
* **1-2 hrs**: Unlock higher tiers with additional Starbursts
* **2-3 hrs**: Star Echo system unlock after 5th Starburst
* **3-4 hrs**: Tier 10 unlock complete, Starburst optimization

### 15.2 Starlight Acquisition Stage
* **4-8 hrs**: Target Stardust 1e100 achievement, first Starlight acquisition
* **Starlight Acquisition**: "Star Birth" event, Nebula system unlock, UI changes
* **After First Reset**: Production increase, rapid growth through Starburst repetition

### 15.3 System Expansion Stage
* **1-3 Starlight** (8-10 hrs): Star pulsation, basic Star Memory unlock
* **4-7 Starlight** (10-12 hrs): Filament evolution stage 1, Star pulsation stability phase
* **8-12 Starlight** (12-15 hrs): Rail Road intersections, filament evolution stage 2, complete pulsation
* **13-18 Starlight** (15-20 hrs): Star resonance event, Starburst automation, supernova omen

### 15.4 Nova Preparation Stage
* **20+ Starlight** (20-25 hrs): Condensation system unlock
* **25-50 Starlight** (25-35 hrs): Nova signs occur, Condensation investment
* **50-100 Starlight** (35-45 hrs): Deepening Condensation investment, Nova condensation phenomenon
* **100+ Starlight** (45-50 hrs): Supernova activation, Nova preparation quest progress
* **Quest Complete** (50+ hrs): Enter Nova Layer via "Supernova Ignition"

### 15.5 Strategic Choices and Reset Play
* **Initial Strategy Formation**: Decide Rail Road and upgrade direction in first few Starlights
* **Mid-term Optimization**: Optimize within chosen paths, preserve progress with Star Memory system
* **Late-game Preparation**: Preparation work for Nova Layer entry, efficiency through Supernova