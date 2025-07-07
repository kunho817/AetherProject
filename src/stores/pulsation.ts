import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { D, ONE } from '@/utils/decimal'
import type { PulsationCycle, PulsationBonus, PulsationUpgrade } from '@/types/pulsation'
import { PulsationState } from '@/types/pulsation'
import { useGameStore } from './gameState'

export const usePulsationStore = defineStore('pulsation', () => {
  // Pulsation cycle state
  const cycle = ref<PulsationCycle>({
    state: PulsationState.EXPANSION,
    progress: 0,
    duration: 0,
    totalCycleTime: 60, // Total cycle time
    cyclesCompleted: 0
  })
  
  const isActive = ref(false)
  const stellarEnergy = ref(0)
  const maxStellarEnergy = ref(1000)
  const stellarEnergyRate = ref(1) // base 1/sec
  const manualControlUnlocked = ref(false)
  const manualControlCooldown = ref(0) // seconds until next manual control allowed
  
  // State durations (in seconds) - based on concept
  const baseDurations = {
    [PulsationState.EXPANSION]: 15,
    [PulsationState.CONTRACTION]: 15,
    [PulsationState.STABILITY]: 10,
    [PulsationState.CATACLYSM]: 12,
    [PulsationState.FUSION]: 8
  }
  
  // Upgrades
  const upgrades = ref<PulsationUpgrade[]>([
    // Basic Upgrades
    {
      id: 'faster_awakening',
      name: 'Rapid Awakening',
      description: 'Reduces Awakening state duration by 50%',
      cost: D(10),
      costType: 'stellarEnergy',
      effect: { type: 'state_duration', value: 0.5, target: PulsationState.EXPANSION },
      unlocked: true,
      purchased: false
    },
    {
      id: 'extended_peak',
      name: 'Extended Peak',
      description: 'Increases Peak state duration by 100%',
      cost: D(25),
      costType: 'stellarEnergy',
      effect: { type: 'state_duration', value: 2.0, target: PulsationState.STABILITY },
      unlocked: false,
      purchased: false
    },
    {
      id: 'cycle_amplifier',
      name: 'Cycle Amplifier',
      description: 'Increases all pulsation bonuses by 50%',
      cost: D(100),
      costType: 'stellarEnergy',
      effect: { type: 'bonus_multiplier', value: 1.5 },
      unlocked: false,
      purchased: false
    },
    {
      id: 'perpetual_motion',
      name: 'Perpetual Motion',
      description: 'Eliminates Dormant state, cycles continuously',
      cost: D(500),
      costType: 'stellarEnergy',
      effect: { type: 'special', value: 1 },
      unlocked: false,
      purchased: false
    },
    
    // Celestial Observatory Upgrades (high-tier starlight costs)
    {
      id: 'stellar_observatory',
      name: 'Stellar Observatory',
      description: 'Unlock advanced stellar observation capabilities',
      cost: D(8),
      costType: 'starlight',
      effect: { type: 'special', value: 1 },
      unlocked: false,
      purchased: false
    },
    {
      id: 'temporal_calibration',
      name: 'Temporal Calibration',
      description: 'Synchronize pulsation cycles with cosmic rhythms (+25% all bonuses)',
      cost: D(12),
      costType: 'starlight',
      effect: { type: 'bonus_multiplier', value: 1.25 },
      unlocked: false,
      purchased: false
    },
    {
      id: 'quantum_resonance',
      name: 'Quantum Resonance',
      description: 'Quantum effects allow simultaneous pulsation states (stacks bonuses)',
      cost: D(18),
      costType: 'starlight',
      effect: { type: 'special', value: 2 },
      unlocked: false,
      purchased: false
    },
    {
      id: 'cosmic_attunement',
      name: 'Cosmic Attunement',
      description: 'Attune to cosmic frequencies for permanent state benefits',
      cost: D(25),
      costType: 'starlight',
      effect: { type: 'special', value: 3 },
      unlocked: false,
      purchased: false
    },
    {
      id: 'stellar_singularity',
      name: 'Stellar Singularity',
      description: 'Create a controlled singularity for exponential pulsation effects',
      cost: D(35),
      costType: 'starlight',
      effect: { type: 'special', value: 4 },
      unlocked: false,
      purchased: false
    }
  ])
  
  // Computed values
  const currentBonus = computed((): PulsationBonus => {
    if (!isActive.value) {
      return {
        stardustMultiplier: ONE,
        filamentEfficiency: ONE,
        nebularEssenceRate: ONE
      }
    }
    
    let baseMultiplier = ONE
    let filamentBonus = ONE
    let essenceBonus = ONE
    let specialEffect = ''
    
    switch (cycle.value.state) {
      case PulsationState.EXPANSION:
        // Production x5, cost x1.5, Rail Road speed x2, prediction accuracy x0.8
        baseMultiplier = D(5.0)
        filamentBonus = D(1.0)
        essenceBonus = D(1.0)
        specialEffect = 'Production x5, costs x1.5, enhanced Rail Road speed'
        break
        
      case PulsationState.CONTRACTION:
        // Cost ^0.5, production x0.75, Starlight gain x1.4, constellation effect x2
        baseMultiplier = D(0.75)
        filamentBonus = D(1.0)
        essenceBonus = D(1.0)
        specialEffect = 'Reduced costs, enhanced Starlight gain, constellation boost'
        break
        
      case PulsationState.STABILITY:
        // All effects x1.5, stellar energy gain x2, Nebula synergy x0.8
        baseMultiplier = D(1.5)
        filamentBonus = D(1.5)
        essenceBonus = D(1.5)
        specialEffect = 'Balanced enhancement across all systems'
        break
        
      case PulsationState.CATACLYSM:
        // Random production ^1.5, filament level effect x0.65, constellation spike x10
        baseMultiplier = D(1.5).pow(Math.random() * 2) // Random between 1 and 2.25
        filamentBonus = D(0.65)
        essenceBonus = D(1.0)
        specialEffect = 'Chaotic energy surges, unpredictable effects'
        break
        
      case PulsationState.FUSION:
        // Nebula synergy ^2, upgrade effect x1.5, energy consumption x3
        baseMultiplier = D(1.0)
        filamentBonus = D(1.5)
        essenceBonus = D(4.0) // Nebula synergy ^2
        specialEffect = 'Maximum synergy achieved, high energy consumption'
        break
    }
    
    // Apply upgrade bonuses
    const amplifierUpgrade = upgrades.value.find(u => u.id === 'cycle_amplifier')
    if (amplifierUpgrade?.purchased) {
      baseMultiplier = baseMultiplier.mul(1.5)
      filamentBonus = filamentBonus.mul(1.5)
      essenceBonus = essenceBonus.mul(1.5)
    }
    
    // Apply Celestial Observatory upgrade bonuses
    const temporalCalibration = upgrades.value.find(u => u.id === 'temporal_calibration')
    if (temporalCalibration?.purchased) {
      baseMultiplier = baseMultiplier.mul(1.25)
      filamentBonus = filamentBonus.mul(1.25)
      essenceBonus = essenceBonus.mul(1.25)
    }
    
    // Quantum Resonance: Stack current state bonus with previous state
    const quantumResonance = upgrades.value.find(u => u.id === 'quantum_resonance')
    if (quantumResonance?.purchased) {
      // Add 50% of previous state's bonus (simulating dual state effect)
      baseMultiplier = baseMultiplier.mul(1.5)
      filamentBonus = filamentBonus.mul(1.5)
      essenceBonus = essenceBonus.mul(1.5)
    }
    
    // Cosmic Attunement: Permanent minor bonus from all states
    const cosmicAttunement = upgrades.value.find(u => u.id === 'cosmic_attunement')
    if (cosmicAttunement?.purchased) {
      // +20% base bonus from cosmic attunement
      baseMultiplier = baseMultiplier.mul(1.2)
      filamentBonus = filamentBonus.mul(1.2)
      essenceBonus = essenceBonus.mul(1.2)
    }
    
    // Stellar Singularity: Exponential scaling based on cycles completed
    const stellarSingularity = upgrades.value.find(u => u.id === 'stellar_singularity')
    if (stellarSingularity?.purchased) {
      const singularityMultiplier = D(1.1).pow(cycle.value.cyclesCompleted)
      baseMultiplier = baseMultiplier.mul(singularityMultiplier)
      filamentBonus = filamentBonus.mul(singularityMultiplier)
      essenceBonus = essenceBonus.mul(singularityMultiplier)
    }
    
    return {
      stardustMultiplier: baseMultiplier,
      filamentEfficiency: filamentBonus,
      nebularEssenceRate: essenceBonus,
      specialEffect
    }
  })
  
  const nextStateInfo = computed(() => {
    const states = Object.values(PulsationState)
    const currentIndex = states.indexOf(cycle.value.state)
    const nextIndex = (currentIndex + 1) % states.length
    
    return states[nextIndex]
  })
  
  const timeToNextState = computed(() => {
    const currentDuration = getStateDuration(cycle.value.state)
    return Math.max(0, currentDuration - cycle.value.duration)
  })
  
  const canUseManualControl = computed(() => {
    return manualControlUnlocked.value && manualControlCooldown.value <= 0 && isActive.value
  })
  
  // Manual control costs based on concept document
  const manualControlCosts = {
    [PulsationState.EXPANSION]: 100,
    [PulsationState.CONTRACTION]: 100,
    [PulsationState.STABILITY]: 250, // Peak state costs more
    [PulsationState.CATACLYSM]: 50, // Chaos state costs less but is dangerous
    [PulsationState.FUSION]: 50 // Fusion state costs less but drains energy
  }
  
  // Actions
  function startPulsation() {
    if (stellarEnergy.value < 10) return false
    
    stellarEnergy.value -= 10
    isActive.value = true
    cycle.value.state = PulsationState.EXPANSION
    cycle.value.progress = 0
    cycle.value.duration = 0
    
    return true
  }
  
  function stopPulsation() {
    isActive.value = false
    cycle.value.state = PulsationState.EXPANSION
    cycle.value.progress = 0
    cycle.value.duration = 0
  }
  
  function canForceState(targetState: PulsationState): boolean {
    if (!canUseManualControl.value) return false
    if (cycle.value.state === targetState) return false // Already in this state
    
    const cost = manualControlCosts[targetState]
    return stellarEnergy.value >= cost
  }
  
  function forceState(targetState: PulsationState): boolean {
    if (!canForceState(targetState)) return false
    
    const cost = manualControlCosts[targetState]
    stellarEnergy.value -= cost
    
    // Change to target state immediately
    cycle.value.state = targetState
    cycle.value.duration = 0
    cycle.value.progress = 0
    
    // Set cooldown (30 seconds base + 10 seconds per energy cost)
    manualControlCooldown.value = 30 + (cost / 10)
    
    return true
  }
  
  function unlockManualControl(): boolean {
    // Unlock condition: 500 stellar energy spent on manual controls or specific upgrade
    // For now, unlock when reaching 500 total stellar energy
    if (stellarEnergy.value >= 500 || maxStellarEnergy.value >= 2000) {
      manualControlUnlocked.value = true
      return true
    }
    return false
  }
  
  function tick(deltaTime: number) {
    // Update manual control cooldown
    if (manualControlCooldown.value > 0) {
      manualControlCooldown.value = Math.max(0, manualControlCooldown.value - deltaTime)
    }
    
    // Check for manual control unlock
    if (!manualControlUnlocked.value) {
      unlockManualControl()
    }
    
    // Check for upgrade unlocks
    unlockUpgrades()
    
    // Always accumulate stellar energy (up to max)
    let energyRate = stellarEnergyRate.value
    
    // Modify energy rate based on state
    if (isActive.value) {
      switch (cycle.value.state) {
        case PulsationState.STABILITY:
          energyRate *= 2 // x2 during stability
          break
        case PulsationState.FUSION:
          energyRate *= 3 // x3 consumption during fusion (negative)
          energyRate = -energyRate
          break
      }
    }
    
    stellarEnergy.value = Math.min(
      maxStellarEnergy.value,
      Math.max(0, stellarEnergy.value + deltaTime * energyRate)
    )
    
    if (!isActive.value) return
    
    cycle.value.duration += deltaTime
    
    const currentDuration = getStateDuration(cycle.value.state)
    cycle.value.progress = Math.min(100, (cycle.value.duration / currentDuration) * 100)
    
    // Check if we should advance to next state
    if (cycle.value.duration >= currentDuration) {
      advanceState()
    }
  }
  
  function advanceState() {
    const states = Object.values(PulsationState)
    const currentIndex = states.indexOf(cycle.value.state)
    let nextIndex = (currentIndex + 1) % states.length
    
    cycle.value.state = states[nextIndex]
    cycle.value.duration = 0
    cycle.value.progress = 0
    
    // Complete cycle when returning to expansion
    if (cycle.value.state === PulsationState.EXPANSION) {
      cycle.value.cyclesCompleted++
    }
  }
  
  function getStateDuration(state: PulsationState): number {
    let duration = baseDurations[state]
    
    // Apply upgrade modifiers
    upgrades.value.forEach(upgrade => {
      if (upgrade.purchased && upgrade.effect.type === 'state_duration' && upgrade.effect.target === state) {
        duration *= upgrade.effect.value
      }
    })
    
    return duration
  }
  
  // Removed getEnergyRate function - energy generation is now handled in tick()
  
  function getGameStore() {
    try {
      return useGameStore()
    } catch {
      return null
    }
  }
  
  function canPurchaseUpgrade(upgradeId: string): boolean {
    const upgrade = upgrades.value.find(u => u.id === upgradeId)
    if (!upgrade || upgrade.purchased || !upgrade.unlocked) return false
    
    switch (upgrade.costType) {
      case 'stellarEnergy':
        return stellarEnergy.value >= upgrade.cost.toNumber()
      case 'starlight':
        const gameStore = getGameStore()
        return gameStore ? gameStore.starlight.amount.gte(upgrade.cost) : false
      default:
        return false
    }
  }
  
  function purchaseUpgrade(upgradeId: string): boolean {
    if (!canPurchaseUpgrade(upgradeId)) return false
    
    const upgrade = upgrades.value.find(u => u.id === upgradeId)!
    
    switch (upgrade.costType) {
      case 'stellarEnergy':
        stellarEnergy.value -= upgrade.cost.toNumber()
        break
      case 'starlight':
        const gameStore = getGameStore()
        if (gameStore) {
          gameStore.starlight.amount = gameStore.starlight.amount.sub(upgrade.cost)
        }
        break
    }
    
    upgrade.purchased = true
    
    // Unlock next upgrades
    unlockUpgrades()
    
    return true
  }
  
  function unlockUpgrades() {
    const gameStore = getGameStore()
    const starlight = gameStore ? gameStore.starlight.amount.toNumber() : 0
    
    // Basic upgrades
    if (upgrades.value.find(u => u.id === 'faster_awakening')?.purchased) {
      const extendedPeak = upgrades.value.find(u => u.id === 'extended_peak')
      if (extendedPeak) extendedPeak.unlocked = true
    }
    
    if (cycle.value.cyclesCompleted >= 10) {
      const amplifier = upgrades.value.find(u => u.id === 'cycle_amplifier')
      if (amplifier) amplifier.unlocked = true
    }
    
    if (upgrades.value.find(u => u.id === 'cycle_amplifier')?.purchased) {
      const perpetual = upgrades.value.find(u => u.id === 'perpetual_motion')
      if (perpetual) perpetual.unlocked = true
    }
    
    // Celestial Observatory upgrades unlock with Starlight milestones
    if (starlight >= 8) {
      const observatory = upgrades.value.find(u => u.id === 'stellar_observatory')
      if (observatory) observatory.unlocked = true
    }
    
    if (upgrades.value.find(u => u.id === 'stellar_observatory')?.purchased) {
      const temporal = upgrades.value.find(u => u.id === 'temporal_calibration')
      if (temporal) temporal.unlocked = true
    }
    
    if (upgrades.value.find(u => u.id === 'temporal_calibration')?.purchased) {
      const quantum = upgrades.value.find(u => u.id === 'quantum_resonance')
      if (quantum) quantum.unlocked = true
    }
    
    if (upgrades.value.find(u => u.id === 'quantum_resonance')?.purchased) {
      const cosmic = upgrades.value.find(u => u.id === 'cosmic_attunement')
      if (cosmic) cosmic.unlocked = true
    }
    
    if (upgrades.value.find(u => u.id === 'cosmic_attunement')?.purchased && cycle.value.cyclesCompleted >= 50) {
      const singularity = upgrades.value.find(u => u.id === 'stellar_singularity')
      if (singularity) singularity.unlocked = true
    }
  }
  
  function reset() {
    isActive.value = false
    stellarEnergy.value = 0
    manualControlUnlocked.value = false
    manualControlCooldown.value = 0
    cycle.value = {
      state: PulsationState.EXPANSION,
      progress: 0,
      duration: 0,
      totalCycleTime: 60,
      cyclesCompleted: 0
    }
    upgrades.value.forEach(upgrade => {
      upgrade.purchased = false
      upgrade.unlocked = upgrade.id === 'faster_awakening'
    })
  }
  
  function softReset() {
    isActive.value = false
    manualControlCooldown.value = 0
    cycle.value = {
      state: PulsationState.EXPANSION,
      progress: 0,
      duration: 0,
      totalCycleTime: 60,
      cyclesCompleted: 0
    }
  }

  // Save/Load methods
  function save() {
    return {
      cycle: {
        state: cycle.value.state,
        progress: cycle.value.progress,
        duration: cycle.value.duration,
        totalCycleTime: cycle.value.totalCycleTime,
        cyclesCompleted: cycle.value.cyclesCompleted
      },
      isActive: isActive.value,
      stellarEnergy: stellarEnergy.value,
      maxStellarEnergy: maxStellarEnergy.value,
      stellarEnergyRate: stellarEnergyRate.value,
      manualControlUnlocked: manualControlUnlocked.value,
      manualControlCooldown: manualControlCooldown.value,
      upgrades: upgrades.value.map(upgrade => ({
        id: upgrade.id,
        purchased: upgrade.purchased,
        unlocked: upgrade.unlocked
      }))
    }
  }

  function load(data: any) {
    if (data.cycle) {
      cycle.value = {
        state: data.cycle.state ?? PulsationState.EXPANSION,
        progress: data.cycle.progress ?? 0,
        duration: data.cycle.duration ?? 0,
        totalCycleTime: data.cycle.totalCycleTime ?? 60,
        cyclesCompleted: data.cycle.cyclesCompleted ?? 0
      }
    }
    
    if (data.isActive !== undefined) {
      isActive.value = data.isActive
    }
    
    if (data.stellarEnergy !== undefined) {
      stellarEnergy.value = data.stellarEnergy
    }
    
    if (data.maxStellarEnergy !== undefined) {
      maxStellarEnergy.value = data.maxStellarEnergy
    }
    
    if (data.stellarEnergyRate !== undefined) {
      stellarEnergyRate.value = data.stellarEnergyRate
    }
    
    if (data.manualControlUnlocked !== undefined) {
      manualControlUnlocked.value = data.manualControlUnlocked
    }
    
    if (data.manualControlCooldown !== undefined) {
      manualControlCooldown.value = data.manualControlCooldown
    }
    
    if (data.upgrades && Array.isArray(data.upgrades)) {
      data.upgrades.forEach((savedUpgrade: any) => {
        const upgrade = upgrades.value.find(u => u.id === savedUpgrade.id)
        if (upgrade) {
          upgrade.purchased = savedUpgrade.purchased ?? false
          upgrade.unlocked = savedUpgrade.unlocked ?? false
        }
      })
    }
  }
  
  return {
    // State
    cycle,
    isActive,
    stellarEnergy,
    upgrades,
    manualControlUnlocked,
    manualControlCooldown,
    
    // Computed
    currentBonus,
    nextStateInfo,
    timeToNextState,
    canUseManualControl,
    
    // Actions
    startPulsation,
    stopPulsation,
    tick,
    canPurchaseUpgrade,
    purchaseUpgrade,
    canForceState,
    forceState,
    unlockManualControl,
    reset,
    softReset,
    save,
    load
  }
})