import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { D, ONE } from '@/utils/decimal'
import type { 
  SpecialEvent, 
  EventChoice, 
  EventHistory,
  EventEffect,
  EventTriggerCondition,
  EventChoiceOption
} from '@/types/events'
import { EventType, EventRarity } from '@/types/events'
import { useGameStore } from './gameState'

export const useEventStore = defineStore('events', () => {
  // Core state
  const activeEvents = ref<Map<string, SpecialEvent>>(new Map())
  const pendingChoices = ref<Map<string, EventChoice>>(new Map())
  const eventHistory = ref<EventHistory[]>([])
  const globalEventMultiplier = ref(ONE)
  const lastEventTime = ref(0)
  const eventCooldownGlobal = ref(60) // 1 minute base cooldown
  const discoveredEvents = ref<Set<string>>(new Set())
  const maxActiveEvents = ref(2)
  const unlocked = ref(false)
  
  // Event definitions
  const eventDefinitions = ref<Map<string, SpecialEvent>>(new Map())
  
  function initializeEvents() {
    const events: SpecialEvent[] = [
      // Common Events
      {
        id: 'cosmic_storm_minor',
        name: 'Minor Cosmic Storm',
        description: 'A small cosmic storm increases production but raises costs',
        type: EventType.COSMIC_STORM,
        rarity: EventRarity.COMMON,
        duration: 120, // 2 minutes
        remainingTime: 0,
        active: false,
        effects: [
          {
            type: 'production',
            target: 'all',
            value: D(1.5),
            description: 'Production ×1.5'
          },
          {
            type: 'cost',
            target: 'filament',
            value: D(1.2),
            description: 'Filament costs ×1.2'
          }
        ],
        triggerConditions: [
          {
            type: 'random_chance',
            value: 0.02, // 2% chance per minute
            comparison: 'lte'
          }
        ],
        canTriggerAgain: true,
        cooldownTime: 300, // 5 minutes
        cooldownRemaining: 0
      },
      
      {
        id: 'stellar_alignment_harmony',
        name: 'Stellar Harmony',
        description: 'The stars align in perfect harmony, boosting all synergies',
        type: EventType.STELLAR_ALIGNMENT,
        rarity: EventRarity.UNCOMMON,
        duration: 180, // 3 minutes
        remainingTime: 0,
        active: false,
        effects: [
          {
            type: 'multiplier',
            target: 'synergy',
            value: D(3),
            description: 'All synergy effects ×3'
          },
          {
            type: 'special',
            target: 'constellation_power',
            value: D(1.5),
            description: 'Constellation effects +50%'
          }
        ],
        triggerConditions: [
          {
            type: 'starburst_count',
            value: 5,
            comparison: 'gte'
          },
          {
            type: 'random_chance',
            value: 0.01,
            comparison: 'lte'
          }
        ],
        canTriggerAgain: true,
        cooldownTime: 600, // 10 minutes
        cooldownRemaining: 0
      },
      
      {
        id: 'nebula_surge_creation',
        name: 'Nebula Creation Surge',
        description: 'A surge of cosmic energy makes pattern creation easier',
        type: EventType.NEBULA_SURGE,
        rarity: EventRarity.UNCOMMON,
        duration: 240, // 4 minutes
        remainingTime: 0,
        active: false,
        effects: [
          {
            type: 'cost',
            target: 'nebula_placement',
            value: D(0.5),
            description: 'Nebula placement costs ×0.5'
          },
          {
            type: 'special',
            target: 'pattern_discovery',
            value: D(2),
            description: 'Pattern discovery rate ×2'
          }
        ],
        triggerConditions: [
          {
            type: 'starlight_amount',
            value: 10,
            comparison: 'gte'
          }
        ],
        canTriggerAgain: true,
        cooldownTime: 900, // 15 minutes
        cooldownRemaining: 0
      },
      
      // Rare Events
      {
        id: 'temporal_flux_acceleration',
        name: 'Temporal Flux Acceleration',
        description: 'Time flows differently, affecting all systems',
        type: EventType.TEMPORAL_FLUX,
        rarity: EventRarity.RARE,
        duration: 300, // 5 minutes
        remainingTime: 0,
        active: false,
        effects: [
          {
            type: 'special',
            target: 'time_flow',
            value: D(2),
            description: 'Time flows ×2 faster for production'
          },
          {
            type: 'special',
            target: 'pulsation_speed',
            value: D(0.5),
            description: 'Pulsation cycles ×0.5 duration'
          }
        ],
        triggerConditions: [
          {
            type: 'time_played',
            value: 3600, // 1 hour
            comparison: 'gte'
          },
          {
            type: 'random_chance',
            value: 0.005,
            comparison: 'lte'
          }
        ],
        canTriggerAgain: true,
        cooldownTime: 1800, // 30 minutes
        cooldownRemaining: 0
      },
      
      // Epic Events
      {
        id: 'supernova_echo_wave',
        name: 'Supernova Echo Wave',
        description: 'The echo of a distant supernova reaches your star system',
        type: EventType.SUPERNOVA_ECHO,
        rarity: EventRarity.EPIC,
        duration: 600, // 10 minutes
        remainingTime: 0,
        active: false,
        effects: [
          {
            type: 'production',
            target: 'all',
            value: D(10),
            description: 'All production ×10'
          },
          {
            type: 'special',
            target: 'starburst_power',
            value: D(2),
            description: 'Starburst effects ×2'
          }
        ],
        triggerConditions: [
          {
            type: 'starburst_count',
            value: 20,
            comparison: 'gte'
          },
          {
            type: 'starlight_amount',
            value: 50,
            comparison: 'gte'
          }
        ],
        canTriggerAgain: false, // Once per game
        cooldownTime: 0,
        cooldownRemaining: 0
      }
    ]
    
    eventDefinitions.value.clear()
    events.forEach(event => {
      eventDefinitions.value.set(event.id, { ...event })
    })
  }
  
  // Computed values
  const currentActiveEvents = computed(() => Array.from(activeEvents.value.values()))
  const currentPendingChoices = computed(() => Array.from(pendingChoices.value.values()))
  const canTriggerNewEvent = computed(() => {
    const gameStore = useGameStore()
    const timeSinceLastEvent = gameStore.totalTimePlayed - lastEventTime.value
    return activeEvents.value.size < maxActiveEvents.value && 
           timeSinceLastEvent >= eventCooldownGlobal.value &&
           unlocked.value
  })
  
  // Event management
  function checkUnlockConditions() {
    const gameStore = useGameStore()
    
    // Unlock at 10 Starlight
    if (gameStore.starlight.amount.gte(10) && !unlocked.value) {
      unlocked.value = true
    }
    
    // Increase max active events with progression
    const starlight = gameStore.starlight.amount.toNumber()
    if (starlight >= 50) {
      maxActiveEvents.value = 4
    } else if (starlight >= 25) {
      maxActiveEvents.value = 3
    }
  }
  
  function checkEventTriggers() {
    if (!canTriggerNewEvent.value) return
    
    const gameStore = useGameStore()
    
    eventDefinitions.value.forEach(event => {
      if (event.active || !event.canTriggerAgain && discoveredEvents.value.has(event.id)) return
      if (event.cooldownRemaining > 0) return
      
      // Check all trigger conditions
      const conditionsMet = event.triggerConditions.every(condition => {
        return checkTriggerCondition(condition, gameStore)
      })
      
      if (conditionsMet) {
        triggerEvent(event.id)
      }
    })
  }
  
  function checkTriggerCondition(condition: EventTriggerCondition, gameStore: any): boolean {
    let currentValue: number
    
    switch (condition.type) {
      case 'starburst_count':
        currentValue = gameStore.starburstCount
        break
      case 'starlight_amount':
        currentValue = gameStore.starlight.amount.toNumber()
        break
      case 'filament_tier':
        currentValue = gameStore.maxUnlockedTier
        break
      case 'time_played':
        currentValue = gameStore.totalTimePlayed
        break
      case 'random_chance':
        currentValue = Math.random()
        break
      default:
        return false
    }
    
    switch (condition.comparison) {
      case 'gte': return currentValue >= condition.value
      case 'lte': return currentValue <= condition.value
      case 'eq': return currentValue === condition.value
      case 'gt': return currentValue > condition.value
      case 'lt': return currentValue < condition.value
      default: return false
    }
  }
  
  function triggerEvent(eventId: string): boolean {
    const eventTemplate = eventDefinitions.value.get(eventId)
    if (!eventTemplate || activeEvents.value.has(eventId)) return false
    
    // Create active event instance
    const activeEvent: SpecialEvent = {
      ...eventTemplate,
      remainingTime: eventTemplate.duration,
      active: true
    }
    
    activeEvents.value.set(eventId, activeEvent)
    discoveredEvents.value.add(eventId)
    
    // Update last event time
    const gameStore = useGameStore()
    lastEventTime.value = gameStore.totalTimePlayed
    
    // Apply start effects if any
    if (activeEvent.onStart) {
      activeEvent.onStart()
    }
    
    return true
  }
  
  function endEvent(eventId: string) {
    const event = activeEvents.value.get(eventId)
    if (!event) return
    
    // Apply end effects if any
    if (event.onEnd) {
      event.onEnd()
    }
    
    // Set cooldown
    const eventTemplate = eventDefinitions.value.get(eventId)
    if (eventTemplate) {
      eventTemplate.cooldownRemaining = eventTemplate.cooldownTime
    }
    
    activeEvents.value.delete(eventId)
  }
  
  function getEventEffectMultiplier(target: string): typeof ONE {
    let multiplier = ONE
    
    currentActiveEvents.value.forEach(event => {
      event.effects.forEach(effect => {
        if (effect.target === target || effect.target === 'all') {
          if (effect.type === 'production' || effect.type === 'multiplier') {
            multiplier = multiplier.mul(effect.value)
          }
        }
      })
    })
    
    return multiplier
  }
  
  function getEventCostMultiplier(target: string): typeof ONE {
    let multiplier = ONE
    
    currentActiveEvents.value.forEach(event => {
      event.effects.forEach(effect => {
        if (effect.target === target || effect.target === 'all') {
          if (effect.type === 'cost') {
            multiplier = multiplier.mul(effect.value)
          }
        }
      })
    })
    
    return multiplier
  }
  
  // Choice system
  function createEventChoice(eventId: string, title: string, description: string, options: EventChoiceOption[]): string {
    const choiceId = `choice_${eventId}_${Date.now()}`
    
    const choice: EventChoice = {
      id: choiceId,
      eventId,
      title,
      description,
      options,
      timeLimit: 60, // 1 minute to choose
      defaultOption: options[0]?.id
    }
    
    pendingChoices.value.set(choiceId, choice)
    return choiceId
  }
  
  function makeEventChoice(choiceId: string, optionId: string): boolean {
    const choice = pendingChoices.value.get(choiceId)
    if (!choice) return false
    
    const option = choice.options.find(opt => opt.id === optionId)
    if (!option) return false
    
    // Apply choice effects
    option.effects.forEach(effect => {
      applyEventEffect(effect)
    })
    
    // Record in history
    eventHistory.value.push({
      eventId: choice.eventId,
      timestamp: Date.now(),
      choicesMade: [optionId],
      outcomes: option.effects
    })
    
    // Remove choice
    pendingChoices.value.delete(choiceId)
    
    return true
  }
  
  function applyEventEffect(effect: EventEffect) {
    // This would integrate with other systems based on effect type and target
    // For now, just add to global multiplier
    if (effect.type === 'production') {
      globalEventMultiplier.value = globalEventMultiplier.value.mul(effect.value)
    }
  }
  
  function tick(deltaTime: number) {
    checkUnlockConditions()
    
    if (!unlocked.value) return
    
    // Update cooldowns
    eventDefinitions.value.forEach(event => {
      if (event.cooldownRemaining > 0) {
        event.cooldownRemaining = Math.max(0, event.cooldownRemaining - deltaTime)
      }
    })
    
    // Update active events
    activeEvents.value.forEach((event, eventId) => {
      event.remainingTime -= deltaTime
      
      if (event.remainingTime <= 0) {
        endEvent(eventId)
      }
    })
    
    // Update pending choices (remove expired ones)
    pendingChoices.value.forEach((choice, choiceId) => {
      if (choice.timeLimit) {
        choice.timeLimit -= deltaTime
        
        if (choice.timeLimit <= 0) {
          // Auto-select default option
          if (choice.defaultOption) {
            makeEventChoice(choiceId, choice.defaultOption)
          } else {
            pendingChoices.value.delete(choiceId)
          }
        }
      }
    })
    
    // Check for new events
    checkEventTriggers()
  }
  
  function reset() {
    activeEvents.value.clear()
    pendingChoices.value.clear()
    eventHistory.value = []
    globalEventMultiplier.value = ONE
    lastEventTime.value = 0
    discoveredEvents.value.clear()
    maxActiveEvents.value = 2
    unlocked.value = false
    
    // Reset all event cooldowns
    eventDefinitions.value.forEach(event => {
      event.cooldownRemaining = 0
      event.active = false
      event.remainingTime = 0
    })
  }
  
  // Save/Load
  function save() {
    return {
      activeEvents: Array.from(activeEvents.value.entries()),
      pendingChoices: Array.from(pendingChoices.value.entries()),
      eventHistory: eventHistory.value,
      globalEventMultiplier: globalEventMultiplier.value.toString(),
      lastEventTime: lastEventTime.value,
      discoveredEvents: Array.from(discoveredEvents.value),
      maxActiveEvents: maxActiveEvents.value,
      unlocked: unlocked.value,
      eventCooldowns: Array.from(eventDefinitions.value.entries()).map(([id, event]) => ({
        id,
        cooldownRemaining: event.cooldownRemaining
      }))
    }
  }
  
  function load(data: any) {
    if (!data) return
    
    unlocked.value = data.unlocked || false
    maxActiveEvents.value = data.maxActiveEvents || 2
    lastEventTime.value = data.lastEventTime || 0
    globalEventMultiplier.value = D(data.globalEventMultiplier || 1)
    
    if (data.eventHistory) {
      eventHistory.value = data.eventHistory
    }
    
    if (data.discoveredEvents) {
      discoveredEvents.value = new Set(data.discoveredEvents)
    }
    
    if (data.activeEvents) {
      activeEvents.value.clear()
      data.activeEvents.forEach(([id, event]: [string, any]) => {
        activeEvents.value.set(id, event)
      })
    }
    
    if (data.pendingChoices) {
      pendingChoices.value.clear()
      data.pendingChoices.forEach(([id, choice]: [string, any]) => {
        pendingChoices.value.set(id, choice)
      })
    }
    
    if (data.eventCooldowns) {
      data.eventCooldowns.forEach((cooldownData: any) => {
        const event = eventDefinitions.value.get(cooldownData.id)
        if (event) {
          event.cooldownRemaining = cooldownData.cooldownRemaining || 0
        }
      })
    }
  }
  
  // Initialize events
  initializeEvents()
  
  return {
    // State
    activeEvents,
    pendingChoices,
    eventHistory,
    globalEventMultiplier,
    discoveredEvents,
    maxActiveEvents,
    unlocked,
    
    // Computed
    currentActiveEvents,
    currentPendingChoices,
    canTriggerNewEvent,
    
    // Actions
    checkUnlockConditions,
    triggerEvent,
    endEvent,
    getEventEffectMultiplier,
    getEventCostMultiplier,
    createEventChoice,
    makeEventChoice,
    tick,
    reset,
    save,
    load
  }
})