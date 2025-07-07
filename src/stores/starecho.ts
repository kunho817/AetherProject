import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { D, ONE } from '@/utils/decimal'
import type { StarEchoSlot, StarEchoBonus } from '@/types/starecho'
import { useGameStore } from './gameState'

export const useStarEchoStore = defineStore('starecho', () => {
  // Core state
  const unlocked = ref(false)
  const maxSlots = ref(3) // According to concept: 3 filaments around central star
  const centralStarActive = ref(true)
  const slots = ref<StarEchoSlot[]>([])
  
  // Initialize star echo slots around central star
  function initializeSlots() {
    slots.value = []
    for (let i = 0; i < maxSlots.value; i++) {
      const angle = (i / maxSlots.value) * 2 * Math.PI
      const radius = 120 // Distance from central star
      
      slots.value.push({
        id: `echo_slot_${i}`,
        position: {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          angle: angle
        },
        filamentTier: null,
        occupied: false,
        unlocked: true // All slots available from start
      })
    }
  }
  
  // Computed bonuses
  const starEchoBonus = computed((): StarEchoBonus => {
    let productionMultiplier = ONE
    let tierDifferenceBonus = ONE
    
    const occupiedSlots = slots.value.filter(slot => slot.occupied && slot.filamentTier !== null)
    
    if (occupiedSlots.length === 0) {
      return {
        productionMultiplier: ONE,
        tierDifferenceBonus: ONE,
        totalBonus: ONE
      }
    }
    
    // Base bonus: Placed filaments production x2
    occupiedSlots.forEach(() => {
      productionMultiplier = productionMultiplier.mul(2)
    })
    
    // Tier difference bonus calculation
    if (occupiedSlots.length > 1) {
      const tiers = occupiedSlots.map(slot => slot.filamentTier!).sort((a, b) => a - b)
      const minTier = tiers[0]
      const maxTier = tiers[tiers.length - 1]
      const tierDifference = maxTier - minTier
      
      // Additional bonus for larger tier differences
      if (tierDifference >= 5) {
        tierDifferenceBonus = D(1.5) // +50% for large tier gaps
      } else if (tierDifference >= 3) {
        tierDifferenceBonus = D(1.25) // +25% for medium tier gaps
      } else if (tierDifference >= 1) {
        tierDifferenceBonus = D(1.1) // +10% for any tier difference
      }
    }
    
    const totalBonus = productionMultiplier.mul(tierDifferenceBonus)
    
    return {
      productionMultiplier,
      tierDifferenceBonus,
      totalBonus
    }
  })
  
  const availableSlots = computed(() => slots.value.filter(slot => !slot.occupied))
  const occupiedSlots = computed(() => slots.value.filter(slot => slot.occupied))
  
  // Unlock conditions
  function checkUnlockConditions() {
    const gameStore = useGameStore()
    
    // Unlock at 5th Starburst according to concept
    if (gameStore.starburstCount >= 5 && !unlocked.value) {
      unlocked.value = true
      initializeSlots()
    }
  }
  
  // Actions
  function canPlaceFilament(slotId: string, filamentTier: number): boolean {
    const slot = slots.value.find(s => s.id === slotId)
    if (!slot || slot.occupied || !slot.unlocked) return false
    
    const gameStore = useGameStore()
    
    // Check if filament tier is unlocked and owned
    if (filamentTier < 0 || filamentTier >= gameStore.filaments.length) return false
    if (filamentTier > gameStore.maxUnlockedTier) return false
    if (gameStore.filaments[filamentTier].owned.eq(0)) return false
    
    return true
  }
  
  function placeFilament(slotId: string, filamentTier: number): boolean {
    if (!canPlaceFilament(slotId, filamentTier)) return false
    
    const slot = slots.value.find(s => s.id === slotId)!
    
    slot.filamentTier = filamentTier
    slot.occupied = true
    
    return true
  }
  
  function removeFilament(slotId: string): boolean {
    const slot = slots.value.find(s => s.id === slotId)
    if (!slot || !slot.occupied) return false
    
    slot.filamentTier = null
    slot.occupied = false
    
    return true
  }
  
  function clearAllFilaments() {
    slots.value.forEach(slot => {
      slot.filamentTier = null
      slot.occupied = false
    })
  }
  
  // Get filament name for display
  function getFilamentName(tier: number): string {
    const gameStore = useGameStore()
    if (tier < 0 || tier >= gameStore.filaments.length) return 'Unknown'
    return gameStore.filaments[tier].name
  }
  
  // Save/Load functions
  function save() {
    return {
      unlocked: unlocked.value,
      maxSlots: maxSlots.value,
      centralStarActive: centralStarActive.value,
      slots: slots.value.map(slot => ({
        id: slot.id,
        filamentTier: slot.filamentTier,
        occupied: slot.occupied,
        unlocked: slot.unlocked
      }))
    }
  }
  
  function load(saveData: any) {
    if (!saveData) return
    
    unlocked.value = saveData.unlocked || false
    maxSlots.value = saveData.maxSlots || 3
    centralStarActive.value = saveData.centralStarActive !== false
    
    if (saveData.slots && unlocked.value) {
      // Restore slots but regenerate positions
      initializeSlots()
      saveData.slots.forEach((slotData: any, index: number) => {
        if (index < slots.value.length) {
          slots.value[index].filamentTier = slotData.filamentTier
          slots.value[index].occupied = slotData.occupied || false
          slots.value[index].unlocked = slotData.unlocked !== false
        }
      })
    }
  }
  
  function reset() {
    unlocked.value = false
    slots.value = []
    centralStarActive.value = true
  }
  
  function tick() {
    checkUnlockConditions()
  }
  
  return {
    // State
    unlocked,
    maxSlots,
    centralStarActive,
    slots,
    
    // Computed
    starEchoBonus,
    availableSlots,
    occupiedSlots,
    
    // Actions
    initializeSlots,
    checkUnlockConditions,
    canPlaceFilament,
    placeFilament,
    removeFilament,
    clearAllFilaments,
    getFilamentName,
    tick,
    save,
    load,
    reset
  }
})