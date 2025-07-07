import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { D, ONE } from '@/utils/decimal'
import type { NebulaCell, NebulaType, NebulaPattern } from '@/types/nebula'
import { NebulaType as NT } from '@/types/nebula'
import { useGameStore } from './gameState'

export const useNebulaStore = defineStore('nebula', () => {
  // Grid state
  const gridSize = ref(3) // Start with 3x3 as per Concept.md
  const gridWidth = ref(3) // Track width separately for 4x3 expansion
  const gridHeight = ref(3) // Track height separately
  const grid = ref<NebulaCell[][]>([])
  const nebularEssence = ref(0)
  const basePlacementCost = ref(D(10))
  
  // Patterns
  const patterns = ref<NebulaPattern[]>([
    {
      id: 'line_production',
      name: 'Stellar Line',
      description: 'Three Stardust cells in a line: +50% Stardust production',
      pattern: [
        { x: 0, y: 0, type: NT.STARDUST },
        { x: 1, y: 0, type: NT.STARDUST },
        { x: 2, y: 0, type: NT.STARDUST }
      ],
      bonus: {
        type: 'production',
        value: D(1.5),
        target: 'stardust'
      },
      discovered: false
    },
    {
      id: 'cross_multiplier',
      name: 'Cosmic Cross',
      description: 'Cross pattern with Multiplier center: x1.75 Starlight gain',
      pattern: [
        { x: 1, y: 0, type: NT.STARDUST },
        { x: 0, y: 1, type: NT.FILAMENT },
        { x: 1, y: 1, type: NT.MULTIPLIER },
        { x: 2, y: 1, type: NT.FILAMENT },
        { x: 1, y: 2, type: NT.STARDUST }
      ],
      bonus: {
        type: 'starlight_gain',
        value: D(1.75),
        target: 'starlight'
      },
      discovered: false
    },
    {
      id: 'diamond_synergy',
      name: 'Nebular Diamond',
      description: 'Diamond formation: Synergy cells boost adjacent cells by 25%',
      pattern: [
        { x: 1, y: 0, type: NT.SYNERGY },
        { x: 0, y: 1, type: NT.FILAMENT },
        { x: 2, y: 1, type: NT.FILAMENT },
        { x: 1, y: 2, type: NT.SYNERGY }
      ],
      bonus: {
        type: 'special',
        value: D(1.25),
        target: 'filaments'
      },
      discovered: false
    },
    {
      id: 'catalyst_square',
      name: 'Catalytic Square',
      description: 'Square of Catalyst cells: Purchase cost ^0.6',
      pattern: [
        { x: 0, y: 0, type: NT.CATALYST },
        { x: 1, y: 0, type: NT.CATALYST },
        { x: 0, y: 1, type: NT.CATALYST },
        { x: 1, y: 1, type: NT.CATALYST }
      ],
      bonus: {
        type: 'cost_exponent',
        value: D(0.6),
        target: 'all'
      },
      discovered: false
    },
    {
      id: 'triangle_production',
      name: 'Stellar Triangle',
      description: 'Triangle formation: Doubles production efficiency',
      pattern: [
        { x: 1, y: 0, type: NT.FILAMENT },
        { x: 0, y: 2, type: NT.FILAMENT },
        { x: 2, y: 2, type: NT.FILAMENT }
      ],
      bonus: {
        type: 'production',
        value: D(2),
        target: 'filaments'
      },
      discovered: false
    },
    {
      id: 'circle_synergy',
      name: 'Cosmic Circle',
      description: 'Circular formation: Triples synergy effects',
      pattern: [
        { x: 1, y: 0, type: NT.SYNERGY },
        { x: 0, y: 1, type: NT.SYNERGY },
        { x: 2, y: 1, type: NT.SYNERGY },
        { x: 0, y: 2, type: NT.SYNERGY },
        { x: 2, y: 2, type: NT.SYNERGY },
        { x: 1, y: 3, type: NT.SYNERGY }
      ],
      bonus: {
        type: 'special',
        value: D(3),
        target: 'synergy'
      },
      discovered: false
    },
    {
      id: 'trinity_combination',
      name: 'Trinity Effect',
      description: 'Special combination: Triangle with Tier 1, 5, 10 filaments (+100% hierarchy synergy)',
      pattern: [
        { x: 1, y: 0, type: NT.FILAMENT, tier: 1 },
        { x: 0, y: 2, type: NT.FILAMENT, tier: 5 },
        { x: 2, y: 2, type: NT.FILAMENT, tier: 10 }
      ],
      bonus: {
        type: 'special',
        value: D(2),
        target: 'hierarchy_synergy'
      },
      discovered: false,
      specialRequirement: 'tier_specific'
    },
    {
      id: 'balanced_cross',
      name: 'Balanced Cross',
      description: 'Special combination: Cross with even-tier filaments (Tier 2,4,6,8,10) - x5 production',
      pattern: [
        { x: 1, y: 0, type: NT.FILAMENT, tier: 2 },
        { x: 0, y: 1, type: NT.FILAMENT, tier: 4 },
        { x: 1, y: 1, type: NT.MULTIPLIER },
        { x: 2, y: 1, type: NT.FILAMENT, tier: 6 },
        { x: 1, y: 2, type: NT.FILAMENT, tier: 8 },
        { x: 1, y: 3, type: NT.FILAMENT, tier: 10 }
      ],
      bonus: {
        type: 'production',
        value: D(5),
        target: 'all'
      },
      discovered: false,
      specialRequirement: 'tier_specific'
    }
  ])
  
  const activePatterns = ref<string[]>([])
  
  // Initialize grid
  function initializeGrid() {
    grid.value = []
    for (let y = 0; y < gridHeight.value; y++) {
      const row: NebulaCell[] = []
      for (let x = 0; x < gridWidth.value; x++) {
        row.push({
          x,
          y,
          type: null,
          level: 0,
          active: false,
          tier: undefined
        })
      }
      grid.value.push(row)
    }
  }
  
  // Computed values
  const placementCost = computed(() => {
    const placedCells = grid.value.flat().filter(cell => cell.type !== null).length
    return basePlacementCost.value.mul(D(1.5).pow(placedCells))
  })
  
  const discoveredPatterns = computed(() => {
    return patterns.value.filter(p => p.discovered)
  })
  
  const totalBonus = computed(() => {
    let productionBonus = ONE
    let multiplierBonus = ONE
    let costReduction = ONE
    let costExponent = ONE
    let starlightGain = ONE
    let synergyBonus = ONE
    let hierarchySynergyBonus = ONE
    
    activePatterns.value.forEach(patternId => {
      const pattern = patterns.value.find(p => p.id === patternId)
      if (pattern) {
        switch (pattern.bonus.type) {
          case 'production':
            productionBonus = productionBonus.mul(pattern.bonus.value)
            break
          case 'multiplier':
            multiplierBonus = multiplierBonus.mul(pattern.bonus.value)
            break
          case 'cost_reduction':
            costReduction = costReduction.mul(pattern.bonus.value)
            break
          case 'cost_exponent':
            costExponent = costExponent.mul(pattern.bonus.value)
            break
          case 'starlight_gain':
            starlightGain = starlightGain.mul(pattern.bonus.value)
            break
          case 'special':
            if (pattern.bonus.target === 'synergy') {
              synergyBonus = synergyBonus.mul(pattern.bonus.value)
            } else if (pattern.bonus.target === 'hierarchy_synergy') {
              hierarchySynergyBonus = hierarchySynergyBonus.mul(pattern.bonus.value)
            }
            break
        }
      }
    })
    
    return {
      production: productionBonus,
      multiplier: multiplierBonus,
      costReduction,
      costExponent,
      starlightGain,
      synergy: synergyBonus,
      hierarchySynergy: hierarchySynergyBonus
    }
  })
  
  // Actions
  function canPlaceCell(x: number, y: number, _type: NebulaType): boolean {
    if (x < 0 || x >= gridSize.value || y < 0 || y >= gridSize.value) return false
    if (grid.value[y][x].type !== null) return false
    if (nebularEssence.value < placementCost.value.toNumber()) return false
    return true
  }
  
  function placeCell(x: number, y: number, type: NebulaType, tier?: number): boolean {
    if (!canPlaceCell(x, y, type)) return false
    
    grid.value[y][x] = {
      x,
      y,
      type,
      level: 1,
      active: true,
      tier: type === NT.FILAMENT ? tier : undefined
    }
    
    nebularEssence.value -= placementCost.value.toNumber()
    checkPatterns()
    return true
  }
  
  function removeCell(x: number, y: number): boolean {
    if (x < 0 || x >= gridSize.value || y < 0 || y >= gridSize.value) return false
    if (grid.value[y][x].type === null) return false
    
    // Refund 50% of placement cost
    const refund = placementCost.value.div(2).floor()
    nebularEssence.value += refund.toNumber()
    
    grid.value[y][x] = {
      x,
      y,
      type: null,
      level: 0,
      active: false,
      tier: undefined
    }
    
    checkPatterns()
    return true
  }
  
  function upgradeCell(x: number, y: number): boolean {
    if (x < 0 || x >= gridSize.value || y < 0 || y >= gridSize.value) return false
    
    const cell = grid.value[y][x]
    if (cell.type === null) return false
    
    const upgradeCost = basePlacementCost.value.mul(D(2).pow(cell.level))
    if (nebularEssence.value < upgradeCost.toNumber()) return false
    
    nebularEssence.value -= upgradeCost.toNumber()
    cell.level++
    
    return true
  }
  
  function checkPatterns() {
    const newActivePatterns: string[] = []
    
    patterns.value.forEach(pattern => {
      if (isPatternActive(pattern)) {
        newActivePatterns.push(pattern.id)
        if (!pattern.discovered) {
          pattern.discovered = true
          // TODO: Show notification
        }
      }
    })
    
    activePatterns.value = newActivePatterns
  }
  
  function isPatternActive(pattern: NebulaPattern): boolean {
    // Check all possible positions where this pattern could fit
    for (let startY = 0; startY <= gridSize.value - getPatternHeight(pattern); startY++) {
      for (let startX = 0; startX <= gridSize.value - getPatternWidth(pattern); startX++) {
        if (checkPatternAt(pattern, startX, startY)) {
          return true
        }
      }
    }
    return false
  }
  
  function checkPatternAt(pattern: NebulaPattern, startX: number, startY: number): boolean {
    // Ensure grid is initialized
    if (!grid.value || grid.value.length === 0) return false
    
    return pattern.pattern.every(patternCell => {
      const x = startX + patternCell.x
      const y = startY + patternCell.y
      
      if (x < 0 || x >= gridSize.value || y < 0 || y >= gridSize.value) return false
      
      // Check if row exists
      if (!grid.value[y]) return false
      
      const gridCell = grid.value[y][x]
      if (!gridCell) return false
      
      // Check basic type match
      if (gridCell.type !== patternCell.type) return false
      
      // Check tier requirement for special patterns
      if (pattern.specialRequirement === 'tier_specific' && patternCell.tier !== undefined) {
        if (gridCell.tier !== patternCell.tier) return false
      }
      
      return true
    })
  }
  
  function getPatternWidth(pattern: NebulaPattern): number {
    return Math.max(...pattern.pattern.map(cell => cell.x)) + 1
  }
  
  function getPatternHeight(pattern: NebulaPattern): number {
    return Math.max(...pattern.pattern.map(cell => cell.y)) + 1
  }
  
  function expandGrid() {
    // According to Concept.md: expansion happens at Starlight milestones
    // 3x3 → 4x3 at 12 Starlight, 4x3 → 4x4 at 20 Starlight
    const gameStore = useGameStore() as any
    const starlight = gameStore?.starlight?.amount?.toNumber() || 0
    
    let expanded = false
    
    if (gridWidth.value === 3 && gridHeight.value === 3 && starlight >= 12) {
      // First expansion: 3x3 → 4x3 (add row)
      gridHeight.value = 4
      gridSize.value = Math.max(gridWidth.value, gridHeight.value)
      expanded = true
      
      // Add new row at bottom
      const newRow: NebulaCell[] = []
      for (let x = 0; x < gridWidth.value; x++) {
        newRow.push({
          x,
          y: gridHeight.value - 1,
          type: null,
          level: 0,
          active: false,
          tier: undefined
        })
      }
      grid.value.push(newRow)
      
    } else if (gridWidth.value === 3 && gridHeight.value === 4 && starlight >= 20) {
      // Second expansion: 4x3 → 4x4 (add column)
      gridWidth.value = 4
      gridSize.value = Math.max(gridWidth.value, gridHeight.value)
      expanded = true
      
      // Add new column to all rows
      for (let y = 0; y < gridHeight.value; y++) {
        grid.value[y].push({
          x: gridWidth.value - 1,
          y,
          type: null,
          level: 0,
          active: false,
          tier: undefined
        })
      }
    }
    
    if (!expanded) return false
    
    return true
  }
  
  function reset() {
    nebularEssence.value = 0
    gridSize.value = 3 // Reset to initial 3x3 size
    gridWidth.value = 3
    gridHeight.value = 3
    activePatterns.value = []
    patterns.value.forEach(p => p.discovered = false)
    initializeGrid()
  }
  
  function softReset() {
    // Keep discovered patterns but clear grid
    gridSize.value = 3 // Reset to initial 3x3 size
    gridWidth.value = 3
    gridHeight.value = 3
    activePatterns.value = []
    initializeGrid()
  }
  
  // Star Memory System integration
  function getActivePatternData() {
    return activePatterns.value.map(patternId => {
      const pattern = patterns.value.find(p => p.id === patternId)
      if (!pattern) return null
      
      // Find where this pattern is placed
      for (let startY = 0; startY <= gridSize.value - getPatternHeight(pattern); startY++) {
        for (let startX = 0; startX <= gridSize.value - getPatternWidth(pattern); startX++) {
          if (checkPatternAt(pattern, startX, startY)) {
            return {
              type: pattern.id,
              positions: pattern.pattern.map(cell => ({
                x: startX + cell.x,
                y: startY + cell.y
              })),
              filamentTypes: pattern.pattern.map(cell => cell.type)
            }
          }
        }
      }
      return null
    }).filter(p => p !== null)
  }
  
  function restorePattern(patternId: string, positions: { x: number; y: number }[], filamentTypes: any[]) {
    const pattern = patterns.value.find(p => p.id === patternId)
    if (!pattern) return false
    
    // Clear any conflicting cells first
    positions.forEach(pos => {
      if (pos.x < gridSize.value && pos.y < gridSize.value) {
        grid.value[pos.y][pos.x] = {
          x: pos.x,
          y: pos.y,
          type: null,
          level: 0,
          active: false,
          tier: undefined
        }
      }
    })
    
    // Place the pattern cells
    positions.forEach((pos, index) => {
      if (pos.x < gridSize.value && pos.y < gridSize.value && index < filamentTypes.length) {
        grid.value[pos.y][pos.x] = {
          x: pos.x,
          y: pos.y,
          type: filamentTypes[index],
          level: 1,
          active: true,
          tier: undefined // Pattern restoration doesn't preserve tier info yet
        }
      }
    })
    
    checkPatterns()
    return true
  }
  
  // Save/Load functions
  function save() {
    const saveData = {
      // Basic state
      gridSize: gridSize.value,
      nebularEssence: nebularEssence.value,
      basePlacementCost: basePlacementCost.value.toString(),
      
      // Grid state (cells with their types, levels, and tiers)
      grid: grid.value.map(row => 
        row.map(cell => ({
          x: cell.x,
          y: cell.y,
          type: cell.type,
          level: cell.level,
          active: cell.active,
          tier: cell.tier
        }))
      ),
      
      // Pattern states (discovered patterns)
      patterns: patterns.value.map(pattern => ({
        id: pattern.id,
        discovered: pattern.discovered
      })),
      
      // Active patterns
      activePatterns: activePatterns.value
    }
    
    return saveData
  }
  
  function load(saveData: any) {
    if (!saveData) return
    
    try {
      // Load basic state
      gridSize.value = saveData.gridSize || 5
      nebularEssence.value = saveData.nebularEssence || 0
      basePlacementCost.value = D(saveData.basePlacementCost || 10)
      
      // Load grid state
      if (saveData.grid && Array.isArray(saveData.grid)) {
        // Ensure grid is the right size
        if (grid.value.length !== gridSize.value) {
          initializeGrid() // Reinitialize if size mismatch
        }
        
        // Load cell data
        saveData.grid.forEach((savedRow: any[], y: number) => {
          if (y < grid.value.length) {
            savedRow.forEach((savedCell: any, x: number) => {
              if (x < grid.value[y].length) {
                const cell = grid.value[y][x]
                cell.type = savedCell.type || null
                cell.level = savedCell.level || 0
                cell.active = savedCell.active || false
                cell.tier = savedCell.tier || undefined
              }
            })
          }
        })
      } else {
        // Initialize fresh grid if no valid save data
        initializeGrid()
      }
      
      // Load pattern discovery states
      if (saveData.patterns && Array.isArray(saveData.patterns)) {
        saveData.patterns.forEach((savedPattern: any) => {
          const pattern = patterns.value.find(p => p.id === savedPattern.id)
          if (pattern) {
            pattern.discovered = savedPattern.discovered || false
          }
        })
      }
      
      // Load active patterns
      if (saveData.activePatterns && Array.isArray(saveData.activePatterns)) {
        activePatterns.value = saveData.activePatterns
      } else {
        activePatterns.value = []
      }
      
      // Ensure grid is initialized before checking patterns
      if (!grid.value || grid.value.length === 0) {
        initializeGrid()
      }
      
      // Recheck patterns to ensure consistency
      checkPatterns()
      
    } catch (error) {
      console.error('Failed to load Nebula data:', error)
      // Re-initialize to default state
      initializeGrid()
      patterns.value.forEach(pattern => { pattern.discovered = false })
      activePatterns.value = []
    }
  }
  
  // Auto-expansion check function
  function checkExpansion() {
    expandGrid() // Will automatically check conditions and expand if eligible
  }
  
  // Initialize on store creation
  initializeGrid()
  
  return {
    // State
    grid,
    gridSize,
    gridWidth,
    gridHeight,
    nebularEssence,
    patterns,
    activePatterns,
    
    // Computed
    placementCost,
    discoveredPatterns,
    totalBonus,
    
    // Actions
    canPlaceCell,
    placeCell,
    removeCell,
    upgradeCell,
    expandGrid,
    checkExpansion,
    checkPatterns,
    reset,
    softReset,
    
    // Star Memory integration
    getActivePatternData,
    restorePattern,
    
    // Save/Load methods
    save,
    load
  }
})