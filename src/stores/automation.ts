import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { D, type Decimal } from '@/utils/decimal'
import type { AutomationTrigger, AutomationSettings } from '@/types/automation'
import { useGameStore } from './gameState'

export const useAutomationStore = defineStore('automation', () => {
  // Core automation state
  const automationSettings = ref<AutomationSettings>({
    starburst: {
      unlocked: false,
      enabled: false,
      triggers: {
        primary: {
          type: 'stardust',
          enabled: true,
          value: D('1e20')
        },
        secondary: {
          type: 'filament',
          enabled: false,
          value: 25,
          tier: 9 // Remnant Filament
        }
      },
      settings: {
        preserveStardust: false,
        preserveFilaments: false,
        minimumStarlight: 0,
        delayBetweenBursts: 5
      },
      stats: {
        totalAutoBursts: 0,
        lastAutoBurst: 0,
        averageInterval: 0
      }
    }
  })

  // Track time for automation timing
  const lastAutoCheck = ref(Date.now())
  const intervalHistory = ref<number[]>([])

  // Get game store safely
  function getGameStore() {
    try {
      return useGameStore()
    } catch {
      return null
    }
  }

  // Computed values
  const starburstAutomation = computed(() => automationSettings.value.starburst)

  const canUnlockStarburstAutomation = computed(() => {
    const gameStore = getGameStore()
    if (!gameStore) return false
    
    // Unlock at 15 Starlight
    return gameStore.starlight.amount.gte(15)
  })

  const shouldAutoStarburst = computed(() => {
    const gameStore = getGameStore()
    if (!gameStore || !starburstAutomation.value.unlocked || !starburstAutomation.value.enabled) {
      return false
    }

    // Check minimum Starlight requirement
    if (gameStore.starlight.amount.lt(starburstAutomation.value.settings.minimumStarlight)) {
      return false
    }

    // Check delay between bursts
    const timeSinceLastBurst = (Date.now() - starburstAutomation.value.stats.lastAutoBurst) / 1000
    if (timeSinceLastBurst < starburstAutomation.value.settings.delayBetweenBursts) {
      return false
    }

    const automation = starburstAutomation.value
    const primaryTrigger = automation.triggers.primary
    const secondaryTrigger = automation.triggers.secondary

    // Check primary trigger
    let primaryMet = false
    if (primaryTrigger.enabled) {
      switch (primaryTrigger.type) {
        case 'stardust':
          primaryMet = gameStore.stardust.amount.gte(primaryTrigger.value as Decimal)
          break
        case 'filament':
          if (primaryTrigger.tier !== undefined) {
            const filament = gameStore.filaments[primaryTrigger.tier]
            primaryMet = filament && filament.owned.gte(primaryTrigger.value as number)
          }
          break
        case 'time':
          primaryMet = timeSinceLastBurst >= (primaryTrigger.value as number)
          break
        case 'hybrid':
          // Hybrid: either stardust OR filament condition
          const stardustMet = gameStore.stardust.amount.gte(D('1e20'))
          const filamentMet = gameStore.canStarburst
          primaryMet = stardustMet || filamentMet
          break
      }
    }

    // Check secondary trigger (if enabled)
    let secondaryMet = true
    if (secondaryTrigger?.enabled) {
      switch (secondaryTrigger.type) {
        case 'stardust':
          secondaryMet = gameStore.stardust.amount.gte(secondaryTrigger.value as Decimal)
          break
        case 'filament':
          if (secondaryTrigger.tier !== undefined) {
            const filament = gameStore.filaments[secondaryTrigger.tier]
            secondaryMet = filament && filament.owned.gte(secondaryTrigger.value as number)
          }
          break
        case 'time':
          secondaryMet = timeSinceLastBurst >= (secondaryTrigger.value as number)
          break
      }
    }

    return primaryMet && secondaryMet && gameStore.canStarburst
  })

  // Actions
  function unlockStarburstAutomation() {
    if (!canUnlockStarburstAutomation.value) return false
    
    automationSettings.value.starburst.unlocked = true
    return true
  }

  function toggleStarburstAutomation() {
    if (!starburstAutomation.value.unlocked) return false
    
    automationSettings.value.starburst.enabled = !automationSettings.value.starburst.enabled
    return true
  }

  function updateStarburstTrigger(type: 'primary' | 'secondary', trigger: Partial<AutomationTrigger>) {
    if (!starburstAutomation.value.unlocked) return false

    const targetTrigger = automationSettings.value.starburst.triggers[type]
    if (!targetTrigger) return false

    // Update trigger properties
    if (trigger.type !== undefined) targetTrigger.type = trigger.type
    if (trigger.enabled !== undefined) targetTrigger.enabled = trigger.enabled
    if (trigger.value !== undefined) targetTrigger.value = trigger.value
    if (trigger.tier !== undefined) targetTrigger.tier = trigger.tier

    return true
  }

  function updateStarburstSettings(settings: Partial<typeof automationSettings.value.starburst.settings>) {
    if (!starburstAutomation.value.unlocked) return false

    Object.assign(automationSettings.value.starburst.settings, settings)
    return true
  }

  function performAutoStarburst() {
    const gameStore = getGameStore()
    if (!gameStore || !shouldAutoStarburst.value) return false

    // Perform the starburst
    gameStore.performStarburst()

    // Update stats
    const now = Date.now()
    const timeSinceLastBurst = (now - automationSettings.value.starburst.stats.lastAutoBurst) / 1000
    
    if (automationSettings.value.starburst.stats.lastAutoBurst > 0) {
      intervalHistory.value.push(timeSinceLastBurst)
      // Keep only last 10 intervals for average calculation
      if (intervalHistory.value.length > 10) {
        intervalHistory.value.shift()
      }
    }

    automationSettings.value.starburst.stats.totalAutoBursts++
    automationSettings.value.starburst.stats.lastAutoBurst = now
    
    // Calculate average interval
    if (intervalHistory.value.length > 0) {
      const sum = intervalHistory.value.reduce((a, b) => a + b, 0)
      automationSettings.value.starburst.stats.averageInterval = sum / intervalHistory.value.length
    }

    return true
  }

  function resetAutomationStats() {
    automationSettings.value.starburst.stats = {
      totalAutoBursts: 0,
      lastAutoBurst: 0,
      averageInterval: 0
    }
    intervalHistory.value = []
  }

  function tick() {
    const now = Date.now()
    lastAutoCheck.value = now

    // Check for automation unlock
    if (!starburstAutomation.value.unlocked && canUnlockStarburstAutomation.value) {
      unlockStarburstAutomation()
    }

    // Perform auto-starburst if conditions are met
    if (shouldAutoStarburst.value) {
      performAutoStarburst()
    }
  }

  // Preset configurations
  function applyPreset(presetName: string) {
    if (!starburstAutomation.value.unlocked) return false

    const presets = {
      'conservative': {
        triggers: {
          primary: {
            type: 'stardust' as const,
            enabled: true,
            value: D('1e25')
          },
          secondary: {
            type: 'time' as const,
            enabled: true,
            value: 30
          }
        },
        settings: {
          preserveStardust: true,
          preserveFilaments: true,
          minimumStarlight: 5,
          delayBetweenBursts: 10
        }
      },
      'balanced': {
        triggers: {
          primary: {
            type: 'hybrid' as const,
            enabled: true,
            value: D('1e20')
          },
          secondary: {
            type: 'filament' as const,
            enabled: true,
            value: 15,
            tier: 9
          }
        },
        settings: {
          preserveStardust: false,
          preserveFilaments: false,
          minimumStarlight: 2,
          delayBetweenBursts: 5
        }
      },
      'aggressive': {
        triggers: {
          primary: {
            type: 'stardust' as const,
            enabled: true,
            value: D('1e15')
          },
          secondary: {
            type: 'time' as const,
            enabled: true,
            value: 10
          }
        },
        settings: {
          preserveStardust: false,
          preserveFilaments: false,
          minimumStarlight: 0,
          delayBetweenBursts: 2
        }
      }
    }

    const preset = presets[presetName as keyof typeof presets]
    if (!preset) return false

    // Apply preset
    Object.assign(automationSettings.value.starburst.triggers, preset.triggers)
    Object.assign(automationSettings.value.starburst.settings, preset.settings)

    return true
  }

  // Save/Load functions
  function save() {
    return {
      automationSettings: {
        starburst: {
          unlocked: automationSettings.value.starburst.unlocked,
          enabled: automationSettings.value.starburst.enabled,
          triggers: {
            primary: {
              type: automationSettings.value.starburst.triggers.primary.type,
              enabled: automationSettings.value.starburst.triggers.primary.enabled,
              value: automationSettings.value.starburst.triggers.primary.value.toString(),
              tier: automationSettings.value.starburst.triggers.primary.tier
            },
            secondary: automationSettings.value.starburst.triggers.secondary ? {
              type: automationSettings.value.starburst.triggers.secondary.type,
              enabled: automationSettings.value.starburst.triggers.secondary.enabled,
              value: automationSettings.value.starburst.triggers.secondary.value.toString(),
              tier: automationSettings.value.starburst.triggers.secondary.tier
            } : undefined
          },
          settings: automationSettings.value.starburst.settings,
          stats: automationSettings.value.starburst.stats
        }
      },
      intervalHistory: intervalHistory.value
    }
  }

  function load(saveData: any) {
    if (!saveData) return

    if (saveData.automationSettings?.starburst) {
      const starburstData = saveData.automationSettings.starburst
      
      automationSettings.value.starburst.unlocked = starburstData.unlocked || false
      automationSettings.value.starburst.enabled = starburstData.enabled || false
      
      if (starburstData.triggers) {
        if (starburstData.triggers.primary) {
          const primary = starburstData.triggers.primary
          automationSettings.value.starburst.triggers.primary = {
            type: primary.type,
            enabled: primary.enabled,
            value: typeof primary.value === 'string' ? D(primary.value) : primary.value,
            tier: primary.tier
          }
        }
        
        if (starburstData.triggers.secondary) {
          const secondary = starburstData.triggers.secondary
          automationSettings.value.starburst.triggers.secondary = {
            type: secondary.type,
            enabled: secondary.enabled,
            value: typeof secondary.value === 'string' ? D(secondary.value) : secondary.value,
            tier: secondary.tier
          }
        }
      }
      
      if (starburstData.settings) {
        Object.assign(automationSettings.value.starburst.settings, starburstData.settings)
      }
      
      if (starburstData.stats) {
        Object.assign(automationSettings.value.starburst.stats, starburstData.stats)
      }
    }
    
    if (saveData.intervalHistory) {
      intervalHistory.value = saveData.intervalHistory
    }
  }

  function reset() {
    automationSettings.value = {
      starburst: {
        unlocked: false,
        enabled: false,
        triggers: {
          primary: {
            type: 'stardust',
            enabled: true,
            value: D('1e20')
          },
          secondary: {
            type: 'filament',
            enabled: false,
            value: 25,
            tier: 9
          }
        },
        settings: {
          preserveStardust: false,
          preserveFilaments: false,
          minimumStarlight: 0,
          delayBetweenBursts: 5
        },
        stats: {
          totalAutoBursts: 0,
          lastAutoBurst: 0,
          averageInterval: 0
        }
      }
    }
    intervalHistory.value = []
  }

  // Computed properties for component usage
  const unlocked = computed(() => starburstAutomation.value.unlocked)
  
  const availableAutomations = computed(() => [
    {
      id: 'starburst',
      name: 'Auto Starburst',
      description: 'Automatically perform Starburst when conditions are met',
      enabled: starburstAutomation.value.enabled,
      active: starburstAutomation.value.enabled && shouldAutoStarburst.value,
      interval: starburstAutomation.value.settings.delayBetweenBursts * 1000,
      cost: D(50) // 50 Starlight to unlock
    }
  ])
  
  const unlockRequirement = computed(() => 50) // 50 Starlight required

  return {
    // State
    automationSettings,
    starburstAutomation,
    
    // Computed
    canUnlockStarburstAutomation,
    shouldAutoStarburst,
    unlocked,
    availableAutomations,
    unlockRequirement,
    
    // Actions
    unlockStarburstAutomation,
    toggleStarburstAutomation,
    updateStarburstTrigger,
    updateStarburstSettings,
    performAutoStarburst,
    resetAutomationStats,
    applyPreset,
    purchaseAutomation: unlockStarburstAutomation,
    toggleAutomation: toggleStarburstAutomation,
    tick,
    save,
    load,
    reset
  }
})