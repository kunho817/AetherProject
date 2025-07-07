import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { D, ZERO } from '@/utils/decimal'
import type { 
  CondensationTarget,
  CondensationEssence,
  CondensationPreset,
  CondensationRequirement,
  NovaLayerPreview,
  CondensationHistoryEntry
} from '@/types/condensation'
import { CondensationMode } from '@/types/condensation'
import { useGameStore } from './gameState'

export const useCondensationStore = defineStore('condensation', () => {
  // Core state
  const unlocked = ref(false)
  const availableTargets = ref<CondensationTarget[]>([])
  const essenceTypes = ref<Map<string, CondensationEssence>>(new Map())
  const totalCondensationPower = ref(ZERO)
  const presets = ref<CondensationPreset[]>([])
  const activePreset = ref<string | null>(null)
  const autoCondensationEnabled = ref(false)
  const condensationThreshold = ref(D('1e50'))
  const condensationHistory = ref<CondensationHistoryEntry[]>([])
  const condensationMode = ref(CondensationMode.MANUAL)
  
  // Initialize essence types
  function initializeEssenceTypes() {
    const essences = new Map<string, CondensationEssence>()
    
    essences.set('stellar', {
      type: 'stellar',
      amount: ZERO,
      description: 'Essence of stellar processes and energy',
      bonuses: [
        {
          type: 'production',
          target: 'nova_layer_base',
          value: D(1.1),
          description: 'Nova Layer base production +10% per essence'
        }
      ]
    })
    
    essences.set('cosmic', {
      type: 'cosmic',
      amount: ZERO,
      description: 'Essence of cosmic structures and filaments',
      bonuses: [
        {
          type: 'unlock',
          target: 'nova_filaments',
          value: D(1),
          description: 'Unlock advanced Nova Layer filament types'
        }
      ]
    })
    
    essences.set('temporal', {
      type: 'temporal',
      amount: ZERO,
      description: 'Essence of time flow and pulsation cycles',
      bonuses: [
        {
          type: 'special',
          target: 'time_compression',
          value: D(1.2),
          description: 'Time flows 20% faster in Nova Layer'
        }
      ]
    })
    
    essences.set('dimensional', {
      type: 'dimensional',
      amount: ZERO,
      description: 'Essence of spatial dimensions and constellation networks',
      bonuses: [
        {
          type: 'multiplier',
          target: 'nova_synergy',
          value: D(2),
          description: 'Nova Layer synergy effects ×2'
        }
      ]
    })
    
    essenceTypes.value = essences
  }
  
  // Initialize condensation targets
  function initializeCondensationTargets() {
    const gameStore = useGameStore()
    const targets: CondensationTarget[] = []
    
    // Resource targets
    targets.push({
      id: 'stardust_condensation',
      name: 'Stardust Reserves',
      description: 'Condense accumulated stardust into stellar essence',
      type: 'resource',
      currentValue: gameStore.stardust.amount,
      condensationRate: D(0.01), // 1% conversion rate
      priority: 1,
      unlocked: true
    })
    
    targets.push({
      id: 'starlight_condensation',
      name: 'Starlight Energy',
      description: 'Condense starlight into temporal essence',
      type: 'resource',
      currentValue: gameStore.starlight.amount,
      condensationRate: D(0.5), // 50% conversion rate
      priority: 2,
      unlocked: gameStore.starlight.amount.gte(1)
    })
    
    // Progress targets
    targets.push({
      id: 'filament_progress',
      name: 'Filament Mastery',
      description: 'Condense filament evolution progress into cosmic essence',
      type: 'progress',
      currentValue: D(gameStore.filaments.reduce((sum, f) => sum + f.evolution, 0)),
      condensationRate: D(0.2), // 20% conversion rate
      priority: 3,
      unlocked: gameStore.filaments.some(f => f.evolution > 0)
    })
    
    targets.push({
      id: 'starburst_experience',
      name: 'Starburst Experience',
      description: 'Condense reset experience into dimensional essence',
      type: 'progress',
      currentValue: D(gameStore.starburstCount),
      condensationRate: D(1), // 100% conversion rate
      priority: 4,
      unlocked: gameStore.starburstCount > 0
    })
    
    // System targets
    targets.push({
      id: 'pulsation_mastery',
      name: 'Pulsation Mastery',
      description: 'Condense pulsation cycle knowledge into temporal essence',
      type: 'system',
      currentValue: D(10), // Placeholder value
      condensationRate: D(0.3), // 30% conversion rate
      priority: 5,
      unlocked: false // Will be unlocked when pulsation is advanced
    })
    
    targets.push({
      id: 'constellation_network',
      name: 'Constellation Network',
      description: 'Condense railway network progress into dimensional essence',
      type: 'system',
      currentValue: D(5), // Placeholder value
      condensationRate: D(0.25), // 25% conversion rate
      priority: 6,
      unlocked: false // Will be unlocked when railroad is advanced
    })
    
    availableTargets.value = targets
  }
  
  // Computed values
  const unlockedTargets = computed(() => 
    availableTargets.value.filter(target => target.unlocked)
  )
  
  const totalEssenceAmount = computed(() => {
    let total = ZERO
    essenceTypes.value.forEach(essence => {
      total = total.add(essence.amount)
    })
    return total
  })
  
  const novaLayerPreview = computed((): NovaLayerPreview => {
    const gameStore = useGameStore()
    
    const requirements: CondensationRequirement[] = [
      {
        type: 'starlight',
        value: 100,
        description: 'Reach 100 Starlight',
        met: gameStore.starlight.amount.gte(100)
      },
      {
        type: 'starburst',
        value: 50,
        description: 'Complete 50 Starbursts',
        met: gameStore.starburstCount >= 50
      },
      {
        type: 'system_level',
        value: 5,
        description: 'Max out 5 major systems',
        met: false // Will be calculated based on actual system progress
      },
      {
        type: 'time_played',
        value: 72000, // 20 hours
        description: 'Play for 20 hours total',
        met: gameStore.totalTimePlayed >= 72000
      }
    ]
    
    const allRequirementsMet = requirements.every(req => req.met)
    
    return {
      unlocked: allRequirementsMet,
      requirements,
      estimatedPower: calculateNovaLayerPower(),
      newSystems: [
        'Nova Filaments (Tier 11-20)',
        'Galactic Networks',
        'Quantum Pulsation',
        'Stellar Forge',
        'Reality Compression'
      ],
      preservedProgress: new Map([
        ['essence_bonuses', totalEssenceAmount.value],
        ['mastery_levels', D(availableTargets.value.length)],
        ['unlock_speed', D(2)]
      ]),
      essenceCarryover: new Map(
        Array.from(essenceTypes.value.entries()).map(([type, essence]) => [type, essence.amount])
      )
    }
  })
  
  const canCondense = computed(() => {
    return unlocked.value && unlockedTargets.value.length > 0
  })
  
  // Unlock conditions
  function checkUnlockConditions() {
    const gameStore = useGameStore()
    
    // Unlock at 75 Starlight and 25+ Starbursts
    if (gameStore.starlight.amount.gte(75) && gameStore.starburstCount >= 25 && !unlocked.value) {
      unlocked.value = true
      initializeEssenceTypes()
      initializeCondensationTargets()
    }
    
    // Update target unlock conditions
    if (unlocked.value) {
      updateTargetUnlockStatus()
    }
  }
  
  function updateTargetUnlockStatus() {
    const gameStore = useGameStore()
    
    availableTargets.value.forEach(target => {
      switch (target.id) {
        case 'starlight_condensation':
          target.unlocked = gameStore.starlight.amount.gte(1)
          target.currentValue = gameStore.starlight.amount
          break
        case 'stardust_condensation':
          target.currentValue = gameStore.stardust.amount
          break
        case 'filament_progress':
          target.unlocked = gameStore.filaments.some(f => f.evolution > 0)
          target.currentValue = D(gameStore.filaments.reduce((sum, f) => sum + f.evolution, 0))
          break
        case 'starburst_experience':
          target.unlocked = gameStore.starburstCount > 0
          target.currentValue = D(gameStore.starburstCount)
          break
        case 'pulsation_mastery':
          // Will be updated when pulsation store is available
          break
        case 'constellation_network':
          // Will be updated when railroad store is available
          break
      }
    })
  }
  
  // Condensation operations
  function condenseTarget(targetId: string): boolean {
    const target = availableTargets.value.find(t => t.id === targetId)
    if (!target || !target.unlocked || target.currentValue.lte(0)) return false
    
    const essenceGained = target.currentValue.mul(target.condensationRate)
    const essenceType = getEssenceTypeForTarget(target)
    
    // Add essence
    const essence = essenceTypes.value.get(essenceType)
    if (essence) {
      essence.amount = essence.amount.add(essenceGained)
    }
    
    // Apply condensation effects based on target type
    applyCondensationEffects(target)
    
    // Record in history
    recordCondensation(targetId, essenceType, essenceGained)
    
    // Update total power
    totalCondensationPower.value = totalCondensationPower.value.add(essenceGained)
    
    return true
  }
  
  function condenseAll(): boolean {
    if (!canCondense.value) return false
    
    const targetsBefore = new Map(availableTargets.value.map(t => [t.id, t.currentValue]))
    const powerBefore = totalCondensationPower.value
    const essenceGained = new Map<string, typeof ZERO>()
    
    unlockedTargets.value.forEach(target => {
      if (target.currentValue.gt(0)) {
        const gained = target.currentValue.mul(target.condensationRate)
        const essenceType = getEssenceTypeForTarget(target)
        
        essenceGained.set(essenceType, (essenceGained.get(essenceType) || ZERO).add(gained))
        condenseTarget(target.id)
      }
    })
    
    // Record comprehensive history entry
    condensationHistory.value.push({
      timestamp: Date.now(),
      targetsCondensed: Array.from(targetsBefore.keys()),
      essenceGained,
      totalPowerBefore: powerBefore,
      totalPowerAfter: totalCondensationPower.value
    })
    
    return true
  }
  
  function getEssenceTypeForTarget(target: CondensationTarget): string {
    switch (target.type) {
      case 'resource':
        return target.id.includes('starlight') ? 'temporal' : 'stellar'
      case 'progress':
        return target.id.includes('filament') ? 'cosmic' : 'dimensional'
      case 'system':
        return target.id.includes('pulsation') ? 'temporal' : 'dimensional'
      default:
        return 'stellar'
    }
  }
  
  function applyCondensationEffects(target: CondensationTarget) {
    // Apply immediate effects based on target type
    // This could include resetting certain progress, applying bonuses, etc.
    
    // Reset the condensed value to zero or reduced amount
    if (target.type === 'resource') {
      // Resources get fully consumed
      target.currentValue = ZERO
    } else {
      // Progress/systems might retain some amount
      target.currentValue = target.currentValue.mul(D(1).sub(target.condensationRate))
    }
  }
  
  function recordCondensation(_targetId: string, _essenceType: string, _amount: typeof ZERO) {
    // Individual condensation record (for detailed tracking)
    // The main history is recorded in condenseAll()
  }
  
  function calculateNovaLayerPower(): typeof ZERO {
    let power = ZERO
    
    // Base power from total essence
    power = power.add(totalEssenceAmount.value.mul(10))
    
    // Bonus power from diverse essence types
    const diversityBonus = D(essenceTypes.value.size).pow(1.5)
    power = power.mul(diversityBonus)
    
    // Achievement-based power bonuses
    const gameStore = useGameStore()
    if (gameStore.starburstCount >= 50) {
      power = power.mul(1.5)
    }
    if (gameStore.starlight.amount.gte(100)) {
      power = power.mul(2)
    }
    
    return power
  }
  
  // Preset management
  function createPreset(name: string, description: string): string {
    const presetId = `preset_${Date.now()}`
    const targets = new Map<string, number>()
    
    // Capture current priority settings
    availableTargets.value.forEach(target => {
      targets.set(target.id, target.priority)
    })
    
    const preset: CondensationPreset = {
      id: presetId,
      name,
      description,
      targets,
      customSettings: new Map([
        ['auto_enabled', autoCondensationEnabled.value.toString()],
        ['threshold', condensationThreshold.value.toString()],
        ['mode', condensationMode.value]
      ])
    }
    
    presets.value.push(preset)
    return presetId
  }
  
  function applyPreset(presetId: string): boolean {
    const preset = presets.value.find(p => p.id === presetId)
    if (!preset) return false
    
    // Apply target priorities
    preset.targets.forEach((priority, targetId) => {
      const target = availableTargets.value.find(t => t.id === targetId)
      if (target) {
        target.priority = priority
      }
    })
    
    // Apply custom settings
    autoCondensationEnabled.value = preset.customSettings.get('auto_enabled') || false
    condensationThreshold.value = D(preset.customSettings.get('threshold') || '1e50')
    condensationMode.value = preset.customSettings.get('mode') || CondensationMode.MANUAL
    
    activePreset.value = presetId
    return true
  }
  
  // Auto-condensation
  function checkAutoCondensation() {
    if (!autoCondensationEnabled.value || !canCondense.value) return
    
    switch (condensationMode.value) {
      case CondensationMode.THRESHOLD:
        if (totalEssenceAmount.value.gte(condensationThreshold.value)) {
          condenseAll()
        }
        break
      case CondensationMode.OPTIMAL:
        // Implement optimal condensation logic
        checkOptimalCondensation()
        break
      case CondensationMode.TIMED:
        // Implement timed condensation (would need additional timer state)
        break
    }
  }
  
  function checkOptimalCondensation() {
    // Determine if it's optimal to condense based on current progress
    const gameStore = useGameStore()
    
    // Simple heuristic: condense when we have significant idle time
    const productionRate = gameStore.totalStardustProduction
    const currentReserves = gameStore.stardust.amount
    
    // If we have more than 1 hour of production stored, consider condensing
    const oneHourProduction = productionRate.mul(3600)
    if (currentReserves.gte(oneHourProduction.mul(5))) {
      condenseAll()
    }
  }
  
  function tick() {
    checkUnlockConditions()
    
    if (!unlocked.value) return
    
    updateTargetUnlockStatus()
    checkAutoCondensation()
  }
  
  function reset() {
    unlocked.value = false
    availableTargets.value = []
    essenceTypes.value.clear()
    totalCondensationPower.value = ZERO
    presets.value = []
    activePreset.value = null
    autoCondensationEnabled.value = false
    condensationThreshold.value = D('1e50')
    condensationHistory.value = []
    condensationMode.value = CondensationMode.MANUAL
  }
  
  // Save/Load
  function save() {
    return {
      unlocked: unlocked.value,
      availableTargets: availableTargets.value.map(target => ({
        ...target,
        currentValue: target.currentValue.toString(),
        condensationRate: target.condensationRate.toString()
      })),
      essenceTypes: Array.from(essenceTypes.value.entries()).map(([type, essence]) => [
        type, 
        {
          ...essence,
          amount: essence.amount.toString(),
          bonuses: essence.bonuses.map(bonus => ({
            ...bonus,
            value: bonus.value.toString()
          }))
        }
      ]),
      totalCondensationPower: totalCondensationPower.value.toString(),
      presets: presets.value,
      activePreset: activePreset.value,
      autoCondensationEnabled: autoCondensationEnabled.value,
      condensationThreshold: condensationThreshold.value.toString(),
      condensationHistory: condensationHistory.value.map(entry => ({
        ...entry,
        essenceGained: Array.from(entry.essenceGained.entries()),
        totalPowerBefore: entry.totalPowerBefore.toString(),
        totalPowerAfter: entry.totalPowerAfter.toString()
      })),
      condensationMode: condensationMode.value
    }
  }
  
  function load(data: any) {
    if (!data) return
    
    unlocked.value = data.unlocked || false
    autoCondensationEnabled.value = data.autoCondensationEnabled || false
    condensationThreshold.value = D(data.condensationThreshold || '1e50')
    totalCondensationPower.value = D(data.totalCondensationPower || 0)
    activePreset.value = data.activePreset || null
    condensationMode.value = data.condensationMode || CondensationMode.MANUAL
    
    if (data.availableTargets) {
      availableTargets.value = data.availableTargets.map((target: any) => ({
        ...target,
        currentValue: D(target.currentValue),
        condensationRate: D(target.condensationRate)
      }))
    }
    
    if (data.essenceTypes) {
      essenceTypes.value.clear()
      data.essenceTypes.forEach(([type, essence]: [string, any]) => {
        essenceTypes.value.set(type, {
          ...essence,
          amount: D(essence.amount),
          bonuses: essence.bonuses.map((bonus: any) => ({
            ...bonus,
            value: D(bonus.value)
          }))
        })
      })
    }
    
    if (data.presets) {
      presets.value = data.presets
    }
    
    if (data.condensationHistory) {
      condensationHistory.value = data.condensationHistory.map((entry: any) => ({
        ...entry,
        essenceGained: new Map(entry.essenceGained),
        totalPowerBefore: D(entry.totalPowerBefore),
        totalPowerAfter: D(entry.totalPowerAfter)
      }))
    }
  }
  
  return {
    // State
    unlocked,
    availableTargets,
    essenceTypes,
    totalCondensationPower,
    presets,
    activePreset,
    autoCondensationEnabled,
    condensationThreshold,
    condensationHistory,
    condensationMode,
    
    // Computed
    unlockedTargets,
    totalEssenceAmount,
    novaLayerPreview,
    canCondense,
    
    // Actions
    checkUnlockConditions,
    condenseTarget,
    condenseAll,
    createPreset,
    applyPreset,
    tick,
    reset,
    save,
    load
  }
})