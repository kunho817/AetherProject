import type { UpgradeNodeWithVisual } from '@/types/nebulaUpgrades'

// Tree layout utilities for upgrade tree positioning

export interface TreePosition {
  x: number
  y: number
}

export interface TreeLayoutNode extends UpgradeNodeWithVisual {
  position: TreePosition
  children: TreeLayoutNode[]
  depth: number
}

// Calculate positions for upgrade tree layout
export function calculateTreePositions(
  upgrades: UpgradeNodeWithVisual[],
  centerX: number = 0,
  centerY: number = 0,
  nodeSpacing: number = 120
): Map<string, TreePosition> {
  const positions = new Map<string, TreePosition>()
  
  // Group upgrades by tier
  const tiers = new Map<number, UpgradeNodeWithVisual[]>()
  upgrades.forEach(upgrade => {
    if (!tiers.has(upgrade.tier)) {
      tiers.set(upgrade.tier, [])
    }
    tiers.get(upgrade.tier)!.push(upgrade)
  })
  
  // Sort tiers
  const sortedTiers = Array.from(tiers.keys()).sort((a, b) => a - b)
  
  sortedTiers.forEach((tier, tierIndex) => {
    const tierUpgrades = tiers.get(tier)!
    const tierY = centerY + tierIndex * nodeSpacing
    
    // Calculate tier width
    const tierWidth = (tierUpgrades.length - 1) * nodeSpacing
    const startX = centerX - tierWidth / 2
    
    tierUpgrades.forEach((upgrade, upgradeIndex) => {
      const x = startX + upgradeIndex * nodeSpacing
      positions.set(upgrade.id, { x, y: tierY })
    })
  })
  
  return positions
}

// Calculate radial positions around a center point
export function calculateRadialPositions(
  upgrades: UpgradeNodeWithVisual[],
  centerX: number = 0,
  centerY: number = 0,
  radius: number = 150
): Map<string, TreePosition> {
  const positions = new Map<string, TreePosition>()
  
  if (upgrades.length === 0) return positions
  
  // Single upgrade goes at center
  if (upgrades.length === 1) {
    positions.set(upgrades[0].id, { x: centerX, y: centerY })
    return positions
  }
  
  // Multiple upgrades arranged in a circle
  const angleStep = (2 * Math.PI) / upgrades.length
  let startAngle = -Math.PI / 2 // Start at top
  
  upgrades.forEach((upgrade, index) => {
    const angle = startAngle + index * angleStep
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    positions.set(upgrade.id, { x, y })
  })
  
  return positions
}

// Build dependency tree structure
export function buildDependencyTree(upgrades: UpgradeNodeWithVisual[]): TreeLayoutNode[] {
  const upgradeMap = new Map<string, UpgradeNodeWithVisual>()
  const nodeMap = new Map<string, TreeLayoutNode>()
  const roots: TreeLayoutNode[] = []
  
  // Create lookup map and initialize nodes
  upgrades.forEach(upgrade => {
    upgradeMap.set(upgrade.id, upgrade)
    nodeMap.set(upgrade.id, {
      ...upgrade,
      position: { x: 0, y: 0 },
      children: [],
      depth: 0
    })
  })
  
  // Build parent-child relationships
  upgrades.forEach(upgrade => {
    const node = nodeMap.get(upgrade.id)!
    
    if (!upgrade.requires || upgrade.requires.length === 0) {
      // Root node
      roots.push(node)
    } else {
      // Child node - add to all parents
      upgrade.requires.forEach(parentId => {
        const parentNode = nodeMap.get(parentId)
        if (parentNode) {
          parentNode.children.push(node)
        }
      })
    }
  })
  
  // Calculate depths
  function calculateDepth(node: TreeLayoutNode, depth: number = 0): void {
    node.depth = depth
    node.children.forEach(child => calculateDepth(child, depth + 1))
  }
  
  roots.forEach(root => calculateDepth(root))
  
  return roots
}

// Get all upgrades that depend on a given upgrade
export function getDependentUpgrades(
  upgradeId: string,
  allUpgrades: UpgradeNodeWithVisual[]
): UpgradeNodeWithVisual[] {
  return allUpgrades.filter(upgrade => 
    upgrade.requires?.includes(upgradeId) ?? false
  )
}

// Get all upgrades that a given upgrade depends on
export function getPrerequisiteUpgrades(
  upgradeId: string,
  allUpgrades: UpgradeNodeWithVisual[]
): UpgradeNodeWithVisual[] {
  const upgrade = allUpgrades.find(u => u.id === upgradeId)
  if (!upgrade?.requires) return []
  
  const prerequisites: UpgradeNodeWithVisual[] = []
  const upgradeMap = new Map(allUpgrades.map(u => [u.id, u]))
  
  upgrade.requires.forEach(prereqId => {
    const prereq = upgradeMap.get(prereqId)
    if (prereq) {
      prerequisites.push(prereq)
    }
  })
  
  return prerequisites
}

// Check if an upgrade chain is valid (no circular dependencies)
export function validateUpgradeChain(upgrades: UpgradeNodeWithVisual[]): boolean {
  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  
  function hasCycle(upgradeId: string): boolean {
    if (recursionStack.has(upgradeId)) {
      return true // Cycle detected
    }
    
    if (visited.has(upgradeId)) {
      return false // Already processed
    }
    
    visited.add(upgradeId)
    recursionStack.add(upgradeId)
    
    const upgrade = upgrades.find(u => u.id === upgradeId)
    if (upgrade?.requires) {
      for (const prereqId of upgrade.requires) {
        if (hasCycle(prereqId)) {
          return true
        }
      }
    }
    
    recursionStack.delete(upgradeId)
    return false
  }
  
  // Check each upgrade for cycles
  for (const upgrade of upgrades) {
    if (!visited.has(upgrade.id)) {
      if (hasCycle(upgrade.id)) {
        return false
      }
    }
  }
  
  return true
}

// Get maximum depth of upgrade tree
export function getMaxTreeDepth(upgrades: UpgradeNodeWithVisual[]): number {
  const roots = buildDependencyTree(upgrades)
  
  function getDepth(node: TreeLayoutNode): number {
    if (node.children.length === 0) {
      return node.depth
    }
    
    return Math.max(...node.children.map(getDepth))
  }
  
  if (roots.length === 0) return 0
  
  return Math.max(...roots.map(getDepth))
}

// Calculate optimal spacing based on tree size
export function calculateOptimalSpacing(
  upgrades: UpgradeNodeWithVisual[],
  containerWidth: number,
  containerHeight: number
): { nodeSpacing: number; radius: number } {
  const maxDepth = getMaxTreeDepth(upgrades)
  const maxNodesPerTier = Math.max(
    ...Array.from(
      upgrades.reduce((tiers, upgrade) => {
        const tier = upgrade.tier
        tiers.set(tier, (tiers.get(tier) || 0) + 1)
        return tiers
      }, new Map<number, number>()).values()
    )
  )
  
  const nodeSpacing = Math.min(
    containerWidth / (maxNodesPerTier + 1),
    containerHeight / (maxDepth + 1),
    120 // Maximum spacing
  )
  
  const radius = Math.min(
    containerWidth * 0.3,
    containerHeight * 0.3,
    150 // Maximum radius
  )
  
  return { nodeSpacing, radius }
}