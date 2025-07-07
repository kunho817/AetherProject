import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { D, ONE, Decimal } from '@/utils/decimal'
import { useGameStore } from './gameState'
import type { 
  Constellation, 
  ConstellationType, 
  TrainState, 
  RailStation,
  GroupSynergy,
  RailIntersection,
  IntersectionEffect
} from '@/types/railroad'
import { ConstellationType as CT, ConstellationGroup, IntersectionType } from '@/types/railroad'

export const useRailRoadStore = defineStore('railroad', () => {
  // Core state
  const cosmicFragments = ref(0)
  const starRails = ref(0)
  const maxActiveConstellations = ref(3)
  const intersectionsUnlocked = ref(false)
  const discoveryMode = ref(true)
  
  // Intersection system
  const intersections = ref<Map<IntersectionType, RailIntersection>>(new Map())
  const activeIntersections = ref<IntersectionType[]>([])
  const maxActiveIntersections = ref(2)
  
  // Train state
  const train = ref<TrainState>({
    currentConstellation: null,
    currentStation: null,
    position: { x: 0, y: 0 },
    moving: false,
    speed: 1.0,
    movementCooldown: 0
  })
  
  // Discovery system
  const discoveryProgress = ref<Map<ConstellationType, number>>(new Map())
  const discoveryRequirements = ref<Map<ConstellationType, { fragments: number, starRails: number, prerequisite?: ConstellationType }>>(new Map())
  
  // Active constellations
  const activeConstellations = ref<ConstellationType[]>([])
  
  // Create constellation data based on concept
  const constellationData = {
    [CT.ARIES]: {
      id: CT.ARIES,
      name: 'Aries',
      advantage: { type: 'cost', value: D(0.7), description: 'Filament cost ^0.7' },
      penalty: { type: 'production', value: D(0.8), description: 'Production ×0.8' },
      specialMechanism: 'Cost increase factor -0.2',
      stationCount: 5
    },
    [CT.TAURUS]: {
      id: CT.TAURUS,
      name: 'Taurus',
      advantage: { type: 'production', value: D(5), description: 'Production ×5' },
      penalty: { type: 'cost', value: D(1.8), description: 'Cost ×1.8' },
      specialMechanism: 'Milestone effect ^1.2',
      stationCount: 6
    },
    [CT.GEMINI]: {
      id: CT.GEMINI,
      name: 'Gemini',
      advantage: { type: 'automation', value: D(5), description: 'Lower 5 tiers automated' },
      penalty: { type: 'production', value: D(0.7), description: 'Efficiency ×0.7' },
      specialMechanism: 'Nebula pattern effect ×2',
      stationCount: 5
    },
    [CT.CANCER]: {
      id: CT.CANCER,
      name: 'Cancer',
      advantage: { type: 'synergy', value: D(4), description: 'Synergy ×4' },
      penalty: { type: 'special', value: D(0.5), description: 'Movement speed ^0.5' },
      specialMechanism: 'Resource production minimum guaranteed',
      stationCount: 7
    },
    [CT.LEO]: {
      id: CT.LEO,
      name: 'Leo',
      advantage: { type: 'special', value: D(1.8), description: 'Pulsation control +80%' },
      penalty: { type: 'special', value: D(2), description: 'Pulsation penalty ×2' },
      specialMechanism: 'Effect: base × Starburst^0.3',
      stationCount: 6
    },
    [CT.VIRGO]: {
      id: CT.VIRGO,
      name: 'Virgo',
      advantage: { type: 'synergy', value: D(4), description: 'Nebula effect ×4' },
      penalty: { type: 'production', value: D(0.6), description: 'Essence gain ×0.6' },
      specialMechanism: 'Pattern recommendation and automation',
      stationCount: 5
    },
    [CT.LIBRA]: {
      id: CT.LIBRA,
      name: 'Libra',
      advantage: { type: 'special', value: D(3), description: 'Preservation rate ×3' },
      penalty: { type: 'production', value: D(0.75), description: 'Production acceleration ×0.75' },
      specialMechanism: 'Train speed adjustment (-50%/+100%)',
      stationCount: 6
    },
    [CT.SCORPIO]: {
      id: CT.SCORPIO,
      name: 'Scorpio',
      advantage: { type: 'special', value: D(2), description: 'Cataclysm effect ^2' },
      penalty: { type: 'production', value: D(0.8), description: 'Other state effects ×0.8' },
      specialMechanism: 'Debuff reversal mechanism',
      stationCount: 7
    },
    [CT.SAGITTARIUS]: {
      id: CT.SAGITTARIUS,
      name: 'Sagittarius',
      advantage: { type: 'production', value: D(10), description: 'Production ×10' },
      penalty: { type: 'automation', value: D(0), description: 'Automation disabled' },
      specialMechanism: 'Starburst starting point 10% → up to 50%',
      stationCount: 5
    },
    [CT.CAPRICORN]: {
      id: CT.CAPRICORN,
      name: 'Capricorn',
      advantage: { type: 'special', value: D(5), description: 'Fragment ×5' },
      penalty: { type: 'cost', value: D(1.5), description: 'Star Rail consumption ×1.5' },
      specialMechanism: 'Additional gain 50% chance',
      stationCount: 6
    },
    [CT.AQUARIUS]: {
      id: CT.AQUARIUS,
      name: 'Aquarius',
      advantage: { type: 'special', value: D(1.4), description: 'Starlight ×1.4' },
      penalty: { type: 'production', value: D(0.85), description: 'Production speed ×0.85' },
      specialMechanism: 'Early gain per milestone achievement',
      stationCount: 7
    },
    [CT.PISCES]: {
      id: CT.PISCES,
      name: 'Pisces',
      advantage: { type: 'special', value: D(2), description: 'Constellation effect ×2' },
      penalty: { type: 'cost', value: D(2), description: 'Activation cost ×2' },
      specialMechanism: 'Gain 10-30% of inactive constellation effects',
      stationCount: 6
    }
  }
  
  // Initialize constellations
  const constellations = ref<Map<ConstellationType, Constellation>>(new Map())
  
  function initializeIntersections() {
    // Primary adjacent intersections
    const adjacentIntersections = [
      { type: IntersectionType.ARIES_TAURUS, constellations: [CT.ARIES, CT.TAURUS], name: 'Spring Gateway' },
      { type: IntersectionType.TAURUS_GEMINI, constellations: [CT.TAURUS, CT.GEMINI], name: 'Duality Bridge' },
      { type: IntersectionType.GEMINI_CANCER, constellations: [CT.GEMINI, CT.CANCER], name: 'Emotional Nexus' },
      { type: IntersectionType.CANCER_LEO, constellations: [CT.CANCER, CT.LEO], name: 'Heart Junction' },
      { type: IntersectionType.LEO_VIRGO, constellations: [CT.LEO, CT.VIRGO], name: 'Precision Point' },
      { type: IntersectionType.VIRGO_LIBRA, constellations: [CT.VIRGO, CT.LIBRA], name: 'Balance Station' },
      { type: IntersectionType.LIBRA_SCORPIO, constellations: [CT.LIBRA, CT.SCORPIO], name: 'Transformation Hub' },
      { type: IntersectionType.SCORPIO_SAGITTARIUS, constellations: [CT.SCORPIO, CT.SAGITTARIUS], name: 'Vision Cross' },
      { type: IntersectionType.SAGITTARIUS_CAPRICORN, constellations: [CT.SAGITTARIUS, CT.CAPRICORN], name: 'Ambition Link' },
      { type: IntersectionType.CAPRICORN_AQUARIUS, constellations: [CT.CAPRICORN, CT.AQUARIUS], name: 'Innovation Node' },
      { type: IntersectionType.AQUARIUS_PISCES, constellations: [CT.AQUARIUS, CT.PISCES], name: 'Intuition Portal' },
      { type: IntersectionType.PISCES_ARIES, constellations: [CT.PISCES, CT.ARIES], name: "Cycle's End" }
    ]
    
    // Secondary opposite intersections
    const oppositeIntersections = [
      { type: IntersectionType.ARIES_LIBRA, constellations: [CT.ARIES, CT.LIBRA], name: 'Axis of Action' },
      { type: IntersectionType.TAURUS_SCORPIO, constellations: [CT.TAURUS, CT.SCORPIO], name: 'Power Nexus' },
      { type: IntersectionType.GEMINI_SAGITTARIUS, constellations: [CT.GEMINI, CT.SAGITTARIUS], name: 'Knowledge Bridge' },
      { type: IntersectionType.CANCER_CAPRICORN, constellations: [CT.CANCER, CT.CAPRICORN], name: 'Foundation Cross' },
      { type: IntersectionType.LEO_AQUARIUS, constellations: [CT.LEO, CT.AQUARIUS], name: 'Creative Hub' },
      { type: IntersectionType.VIRGO_PISCES, constellations: [CT.VIRGO, CT.PISCES], name: 'Service Portal' }
    ]
    
    // Tertiary elemental intersections
    const elementalIntersections = [
      { type: IntersectionType.FIRE_SIGNS, constellations: [CT.ARIES, CT.LEO], name: 'Fire Convergence' },
      { type: IntersectionType.EARTH_SIGNS, constellations: [CT.TAURUS, CT.VIRGO], name: 'Earth Convergence' },
      { type: IntersectionType.AIR_SIGNS, constellations: [CT.GEMINI, CT.LIBRA], name: 'Air Convergence' },
      { type: IntersectionType.WATER_SIGNS, constellations: [CT.CANCER, CT.SCORPIO], name: 'Water Convergence' }
    ]
    
    // Initialize all intersections
    const allIntersections = [
      ...adjacentIntersections, 
      ...oppositeIntersections, 
      ...elementalIntersections
    ]
    
    allIntersections.forEach((data, index) => {
      const [constellation1, constellation2] = data.constellations
      
      // Calculate position based on constellation positions
      const angle1 = Object.values(CT).indexOf(constellation1) * (2 * Math.PI / 12)
      const angle2 = Object.values(CT).indexOf(constellation2) * (2 * Math.PI / 12)
      const midAngle = (angle1 + angle2) / 2
      const radius = index < 12 ? 150 : index < 18 ? 250 : 200 // Adjacent, opposite, elemental
      
      intersections.value.set(data.type, {
        id: data.type,
        name: data.name,
        connectedConstellations: [constellation1, constellation2],
        unlocked: false,
        activationCost: index < 12 ? 10 : index < 18 ? 15 : 20, // Higher cost for more complex intersections
        activated: false,
        effect: generateIntersectionEffect(data.type, index),
        position: {
          x: Math.cos(midAngle) * radius,
          y: Math.sin(midAngle) * radius
        },
        visitCount: 0
      })
    })
  }
  
  function generateIntersectionEffect(_type: IntersectionType, index: number): IntersectionEffect {
    // Adjacent intersections: production bonuses
    if (index < 12) {
      return {
        type: 'production',
        baseValue: D(1.2),
        maxValue: D(2.0),
        scalingFactor: 0.1,
        description: 'Cross-constellation production bonus'
      }
    }
    
    // Opposite intersections: cost reductions
    if (index < 18) {
      return {
        type: 'cost',
        baseValue: D(0.8),
        maxValue: D(0.5),
        scalingFactor: 0.05,
        description: 'Cross-axis cost reduction'
      }
    }
    
    // Elemental intersections: special synergy effects
    return {
      type: 'synergy',
      baseValue: D(1.5),
      maxValue: D(3.0),
      scalingFactor: 0.15,
      description: 'Elemental synergy amplification'
    }
  }
  
  function initializeConstellations() {
    Object.values(CT).forEach(type => {
      const data = constellationData[type]
      const stations = generateStations(type, data.stationCount)
      
      constellations.value.set(type, {
        id: type,
        name: data.name,
        stations,
        unlocked: false,
        activated: false,
        activationCost: 5, // Base cost from concept
        completed: false,
        advantage: data.advantage,
        penalty: data.penalty,
        specialMechanism: data.specialMechanism
      } as Constellation)
    })
    
    // In discovery mode, only unlock first constellation
    if (discoveryMode.value) {
      constellations.value.get(CT.ARIES)!.unlocked = true
    } else {
      // Normal mode - unlock first few constellations
      constellations.value.get(CT.ARIES)!.unlocked = true
      constellations.value.get(CT.TAURUS)!.unlocked = true
      constellations.value.get(CT.GEMINI)!.unlocked = true
    }
  }
  
  function initializeDiscoverySystem() {
    // Set up discovery requirements for each constellation
    discoveryRequirements.value.set(CT.ARIES, { fragments: 0, starRails: 0 }) // Already unlocked
    discoveryRequirements.value.set(CT.TAURUS, { fragments: 3, starRails: 2, prerequisite: CT.ARIES })
    discoveryRequirements.value.set(CT.GEMINI, { fragments: 5, starRails: 3, prerequisite: CT.TAURUS })
    discoveryRequirements.value.set(CT.CANCER, { fragments: 8, starRails: 5, prerequisite: CT.GEMINI })
    discoveryRequirements.value.set(CT.LEO, { fragments: 12, starRails: 8, prerequisite: CT.CANCER })
    discoveryRequirements.value.set(CT.VIRGO, { fragments: 18, starRails: 12, prerequisite: CT.LEO })
    discoveryRequirements.value.set(CT.LIBRA, { fragments: 25, starRails: 15, prerequisite: CT.VIRGO })
    discoveryRequirements.value.set(CT.SCORPIO, { fragments: 35, starRails: 20, prerequisite: CT.LIBRA })
    discoveryRequirements.value.set(CT.SAGITTARIUS, { fragments: 50, starRails: 25, prerequisite: CT.SCORPIO })
    discoveryRequirements.value.set(CT.CAPRICORN, { fragments: 70, starRails: 30, prerequisite: CT.SAGITTARIUS })
    discoveryRequirements.value.set(CT.AQUARIUS, { fragments: 95, starRails: 35, prerequisite: CT.CAPRICORN })
    discoveryRequirements.value.set(CT.PISCES, { fragments: 125, starRails: 40, prerequisite: CT.AQUARIUS })
    
    // Initialize progress for all constellations
    Object.values(CT).forEach(type => {
      discoveryProgress.value.set(type, 0)
    })
  }
  
  function generateStations(constellation: ConstellationType, count: number): RailStation[] {
    const stations: RailStation[] = []
    const baseNames = [
      'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta'
    ]
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI
      const radius = 100 + (i * 20)
      
      stations.push({
        id: `${constellation}_${i}`,
        name: `${baseNames[i]} ${constellationData[constellation].name}`,
        unlocked: i === 0, // First station unlocked by default
        activated: false,
        unlockCost: Math.min(3, 1 + Math.floor(i / 2)), // 1-3 Star Rails
        visitCount: 0,
        effect: {
          type: 'production',
          baseValue: D(1.1 + i * 0.1),
          description: `Production ×${(1.1 + i * 0.1).toFixed(1)}`
        },
        position: {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        }
      })
    }
    
    return stations
  }
  
  // Group synergies
  const groupSynergies = computed((): GroupSynergy[] => [
    {
      group: ConstellationGroup.VERNAL_EQUINOX,
      constellations: [CT.ARIES, CT.TAURUS, CT.GEMINI],
      active: [CT.ARIES, CT.TAURUS, CT.GEMINI].every(c => activeConstellations.value.includes(c)),
      productionBonus: D(2.5),
      penaltyReduction: D(0.8),
      specialEffect: 'Production ×2.5, penalty ^0.8'
    },
    {
      group: ConstellationGroup.SUMMER_SOLSTICE,
      constellations: [CT.CANCER, CT.LEO, CT.VIRGO],
      active: [CT.CANCER, CT.LEO, CT.VIRGO].every(c => activeConstellations.value.includes(c)),
      productionBonus: D(1),
      penaltyReduction: D(0.9),
      specialEffect: 'System efficiency ^1.3, penalty ^0.9'
    },
    {
      group: ConstellationGroup.AUTUMNAL_EQUINOX,
      constellations: [CT.LIBRA, CT.SCORPIO, CT.SAGITTARIUS],
      active: [CT.LIBRA, CT.SCORPIO, CT.SAGITTARIUS].every(c => activeConstellations.value.includes(c)),
      productionBonus: D(1),
      penaltyReduction: D(1.2),
      specialEffect: 'Special effects ×2, penalty ×1.2'
    },
    {
      group: ConstellationGroup.WINTER_SOLSTICE,
      constellations: [CT.CAPRICORN, CT.AQUARIUS, CT.PISCES],
      active: [CT.CAPRICORN, CT.AQUARIUS, CT.PISCES].every(c => activeConstellations.value.includes(c)),
      productionBonus: D(1.5),
      penaltyReduction: D(0.75),
      specialEffect: 'Resource gain ×1.5, penalty ^0.75'
    }
  ])
  
  // Computed bonuses
  const totalProductionBonus = computed(() => {
    let bonus = ONE
    
    activeConstellations.value.forEach(type => {
      const constellation = constellations.value.get(type)
      if (constellation?.advantage.type === 'production') {
        bonus = bonus.mul(constellation.advantage.value)
      }
    })
    
    // Apply intersection bonuses
    activeIntersections.value.forEach(type => {
      const intersection = intersections.value.get(type)
      if (intersection?.effect.type === 'production') {
        const visits = intersection.visitCount
        const scaledValue = intersection.effect.baseValue.add(
          D(visits * intersection.effect.scalingFactor)
        )
        const effectiveValue = Decimal.min(scaledValue, intersection.effect.maxValue)
        bonus = bonus.mul(effectiveValue)
      }
    })
    
    // Apply group synergies
    groupSynergies.value.forEach(synergy => {
      if (synergy.active) {
        bonus = bonus.mul(synergy.productionBonus)
      }
    })
    
    return bonus
  })
  
  const totalCostMultiplier = computed(() => {
    let multiplier = ONE
    
    activeConstellations.value.forEach(type => {
      const constellation = constellations.value.get(type)
      
      // Apply constellation cost advantages (reductions)
      if (constellation?.advantage.type === 'cost') {
        multiplier = multiplier.mul(constellation.advantage.value)
      }
      
      // Apply constellation cost penalties (increases)
      if (constellation?.penalty.type === 'cost') {
        multiplier = multiplier.mul(constellation.penalty.value)
      }
    })
    
    // Apply intersection cost reductions
    activeIntersections.value.forEach(type => {
      const intersection = intersections.value.get(type)
      if (intersection?.effect.type === 'cost') {
        const visits = intersection.visitCount
        const scaledValue = intersection.effect.baseValue.sub(
          D(visits * intersection.effect.scalingFactor)
        )
        const effectiveValue = Decimal.max(scaledValue, intersection.effect.maxValue)
        multiplier = multiplier.mul(effectiveValue)
      }
    })
    
    return multiplier
  })
  
  // Get specific cost multiplier for different cost types
  function getCostMultiplier(costType: 'filament' | 'star_rail' | 'activation' | 'general'): Decimal {
    let multiplier = ONE
    
    activeConstellations.value.forEach(type => {
      const constellation = constellations.value.get(type)
      
      // Apply specific cost effects based on type and description
      if (constellation?.advantage.type === 'cost') {
        if (costType === 'filament' && constellation.advantage.description.includes('Filament')) {
          multiplier = multiplier.mul(constellation.advantage.value)
        } else if (costType === 'general' && !constellation.advantage.description.includes('Filament')) {
          multiplier = multiplier.mul(constellation.advantage.value)
        }
      }
      
      if (constellation?.penalty.type === 'cost') {
        if (costType === 'star_rail' && constellation.penalty.description.includes('Star Rail')) {
          multiplier = multiplier.mul(constellation.penalty.value)
        } else if (costType === 'activation' && constellation.penalty.description.includes('Activation')) {
          multiplier = multiplier.mul(constellation.penalty.value)
        } else if (costType === 'general' && !constellation.penalty.description.includes('Star Rail') && !constellation.penalty.description.includes('Activation')) {
          multiplier = multiplier.mul(constellation.penalty.value)
        }
      }
    })
    
    // Apply intersection cost reductions to all types
    activeIntersections.value.forEach(type => {
      const intersection = intersections.value.get(type)
      if (intersection?.effect.type === 'cost') {
        const visits = intersection.visitCount
        const scaledValue = intersection.effect.baseValue.sub(
          D(visits * intersection.effect.scalingFactor)
        )
        const effectiveValue = Decimal.max(scaledValue, intersection.effect.maxValue)
        multiplier = multiplier.mul(effectiveValue)
      }
    })
    
    return multiplier
  }
  
  const intersectionSynergyBonus = computed(() => {
    let bonus = ONE
    
    activeIntersections.value.forEach(type => {
      const intersection = intersections.value.get(type)
      if (intersection?.effect.type === 'synergy') {
        const visits = intersection.visitCount
        const scaledValue = intersection.effect.baseValue.add(
          D(visits * intersection.effect.scalingFactor)
        )
        const effectiveValue = Decimal.min(scaledValue, intersection.effect.maxValue)
        bonus = bonus.mul(effectiveValue)
      }
    })
    
    return bonus
  })
  
  // Actions
  function canUnlockStation(constellation: ConstellationType, stationId: string): boolean {
    const constellationData = constellations.value.get(constellation)
    if (!constellationData) return false
    
    const station = constellationData.stations.find(s => s.id === stationId)
    if (!station || station.unlocked) return false
    
    const adjustedCost = Math.ceil(station.unlockCost * getCostMultiplier('star_rail').toNumber())
    return starRails.value >= adjustedCost
  }
  
  function unlockStation(constellation: ConstellationType, stationId: string): boolean {
    if (!canUnlockStation(constellation, stationId)) return false
    
    const constellationData = constellations.value.get(constellation)!
    const station = constellationData.stations.find(s => s.id === stationId)!
    
    const adjustedCost = Math.ceil(station.unlockCost * getCostMultiplier('star_rail').toNumber())
    starRails.value -= adjustedCost
    station.unlocked = true
    
    // Generate cosmic fragments: 1 + (station order / 2)
    const stationIndex = constellationData.stations.indexOf(station)
    const fragmentGain = 1 + Math.floor(stationIndex / 2)
    cosmicFragments.value += fragmentGain
    
    return true
  }
  
  function canActivateConstellation(constellation: ConstellationType): boolean {
    const constellationData = constellations.value.get(constellation)
    if (!constellationData?.unlocked || constellationData.activated) return false
    if (activeConstellations.value.length >= maxActiveConstellations.value) return false
    
    // Check if all stations in the constellation are unlocked
    const allStationsUnlocked = constellationData.stations.every(station => station.unlocked)
    if (!allStationsUnlocked) return false
    
    const adjustedCost = Math.ceil(constellationData.activationCost * getCostMultiplier('activation').toNumber())
    return starRails.value >= adjustedCost
  }
  
  function activateConstellation(constellation: ConstellationType): boolean {
    if (!canActivateConstellation(constellation)) return false
    
    const constellationData = constellations.value.get(constellation)!
    
    const adjustedCost = Math.ceil(constellationData.activationCost * getCostMultiplier('activation').toNumber())
    starRails.value -= adjustedCost
    constellationData.activated = true
    activeConstellations.value.push(constellation)
    
    return true
  }
  
  function deactivateConstellation(constellation: ConstellationType): boolean {
    const index = activeConstellations.value.indexOf(constellation)
    if (index === -1) return false
    
    const constellationData = constellations.value.get(constellation)!
    constellationData.activated = false
    activeConstellations.value.splice(index, 1)
    
    return true
  }
  
  function moveTrain(constellation: ConstellationType, stationId: string): boolean {
    if (train.value.moving || train.value.movementCooldown > 0) return false
    
    const constellationData = constellations.value.get(constellation)
    if (!constellationData) return false
    
    const station = constellationData.stations.find(s => s.id === stationId)
    if (!station?.unlocked) return false
    
    train.value.moving = true
    train.value.currentConstellation = constellation
    train.value.currentStation = stationId
    train.value.position = { ...station.position }
    
    // Simulate travel time
    setTimeout(() => {
      train.value.moving = false
      train.value.movementCooldown = 2000 / train.value.speed // 2 second base cooldown
      
      // Visit station - enhance effect
      station.visitCount++
      
      // Station enhancement is calculated when needed: base effect + (visit count × 0.05) up to ×6
      
      // Add discovery progress for adjacent constellations in discovery mode
      if (discoveryMode.value) {
        // Find adjacent constellations that are not yet discovered
        const constellationIndex = Object.values(CT).indexOf(constellation)
        const totalConstellations = Object.values(CT).length
        
        // Check previous constellation
        if (constellationIndex > 0) {
          const prevConstellation = Object.values(CT)[constellationIndex - 1] as ConstellationType
          if (!constellations.value.get(prevConstellation)?.unlocked) {
            addDiscoveryProgress(prevConstellation, 10)
          }
        }
        
        // Check next constellation
        if (constellationIndex < totalConstellations - 1) {
          const nextConstellation = Object.values(CT)[constellationIndex + 1] as ConstellationType
          if (!constellations.value.get(nextConstellation)?.unlocked) {
            addDiscoveryProgress(nextConstellation, 10)
          }
        }
      }
      
      setTimeout(() => {
        train.value.movementCooldown = 0
      }, train.value.movementCooldown)
    }, 1000 / train.value.speed)
    
    return true
  }
  
  function unlockIntersections() {
    const adjustedCost = Math.ceil(20 * getCostMultiplier('star_rail').toNumber())
    if (starRails.value >= adjustedCost) {
      intersectionsUnlocked.value = true
      starRails.value -= adjustedCost
      return true
    }
    return false
  }
  
  function checkIntersectionUnlock() {
    // Auto-unlock intersections at 8 Starlight
    try {
      const gameStore = useGameStore()
      if (!intersectionsUnlocked.value && gameStore.starlight.amount.gte(8)) {
        intersectionsUnlocked.value = true
      }
    } catch {
      // Game store not available
    }
  }
  
  // Discovery mode functions
  function canDiscoverConstellation(constellation: ConstellationType): boolean {
    if (!discoveryMode.value) return false
    
    const requirements = discoveryRequirements.value.get(constellation)
    if (!requirements) return false
    
    // Check if already unlocked
    const constellationData = constellations.value.get(constellation)
    if (constellationData?.unlocked) return false
    
    // Check prerequisite
    if (requirements.prerequisite) {
      const prereq = constellations.value.get(requirements.prerequisite)
      if (!prereq?.unlocked) return false
    }
    
    // Check resources
    const adjustedRailCost = Math.ceil(requirements.starRails * getCostMultiplier('star_rail').toNumber())
    return cosmicFragments.value >= requirements.fragments && 
           starRails.value >= adjustedRailCost
  }
  
  function discoverConstellation(constellation: ConstellationType): boolean {
    if (!canDiscoverConstellation(constellation)) return false
    
    const requirements = discoveryRequirements.value.get(constellation)!
    const constellationData = constellations.value.get(constellation)!
    
    // Spend resources
    cosmicFragments.value -= requirements.fragments
    const adjustedRailCost = Math.ceil(requirements.starRails * getCostMultiplier('star_rail').toNumber())
    starRails.value -= adjustedRailCost
    
    // Unlock constellation
    constellationData.unlocked = true
    
    // Reset discovery progress
    discoveryProgress.value.set(constellation, 0)
    
    return true
  }
  
  function addDiscoveryProgress(constellation: ConstellationType, amount: number) {
    if (!discoveryMode.value) return
    
    const current = discoveryProgress.value.get(constellation) || 0
    discoveryProgress.value.set(constellation, Math.min(100, current + amount))
  }
  
  function toggleDiscoveryMode() {
    discoveryMode.value = !discoveryMode.value
    
    if (discoveryMode.value) {
      // Reset to discovery mode state
      constellations.value.forEach((constellation, type) => {
        if (type !== CT.ARIES) {
          constellation.unlocked = false
          constellation.activated = false
        }
      })
      activeConstellations.value = []
      initializeDiscoverySystem()
    } else {
      // Unlock first few constellations for normal mode
      constellations.value.get(CT.TAURUS)!.unlocked = true
      constellations.value.get(CT.GEMINI)!.unlocked = true
    }
  }
  
  // Intersection management functions
  function canUnlockIntersection(intersectionType: IntersectionType): boolean {
    if (!intersectionsUnlocked.value) return false
    
    const intersection = intersections.value.get(intersectionType)
    if (!intersection || intersection.unlocked) return false
    
    // Check if both connected constellations are unlocked
    const [constellation1Type, constellation2Type] = intersection.connectedConstellations
    const constellation1 = constellations.value.get(constellation1Type)
    const constellation2 = constellations.value.get(constellation2Type)
    
    if (!constellation1?.unlocked || !constellation2?.unlocked) return false
    
    const adjustedCost = Math.ceil(intersection.activationCost * getCostMultiplier('star_rail').toNumber())
    return starRails.value >= adjustedCost
  }
  
  function unlockIntersection(intersectionType: IntersectionType): boolean {
    if (!canUnlockIntersection(intersectionType)) return false
    
    const intersection = intersections.value.get(intersectionType)!
    
    const adjustedCost = Math.ceil(intersection.activationCost * getCostMultiplier('star_rail').toNumber())
    starRails.value -= adjustedCost
    intersection.unlocked = true
    
    return true
  }
  
  function canActivateIntersection(intersectionType: IntersectionType): boolean {
    const intersection = intersections.value.get(intersectionType)
    if (!intersection?.unlocked || intersection.activated) return false
    if (activeIntersections.value.length >= maxActiveIntersections.value) return false
    
    // Check if both connected constellations are active
    const [constellation1Type, constellation2Type] = intersection.connectedConstellations
    return activeConstellations.value.includes(constellation1Type) && activeConstellations.value.includes(constellation2Type)
  }
  
  function activateIntersection(intersectionType: IntersectionType): boolean {
    if (!canActivateIntersection(intersectionType)) return false
    
    const intersection = intersections.value.get(intersectionType)!
    
    intersection.activated = true
    activeIntersections.value.push(intersectionType)
    
    return true
  }
  
  function deactivateIntersection(intersectionType: IntersectionType): boolean {
    const index = activeIntersections.value.indexOf(intersectionType)
    if (index === -1) return false
    
    const intersection = intersections.value.get(intersectionType)!
    intersection.activated = false
    activeIntersections.value.splice(index, 1)
    
    return true
  }
  
  function moveTrainToIntersection(intersectionType: IntersectionType): boolean {
    if (train.value.moving || train.value.movementCooldown > 0) return false
    
    const intersection = intersections.value.get(intersectionType)
    if (!intersection?.unlocked) return false
    
    train.value.moving = true
    train.value.currentConstellation = null // At intersection, not at constellation
    train.value.currentStation = intersectionType
    train.value.position = { ...intersection.position }
    
    // Simulate travel time
    setTimeout(() => {
      train.value.moving = false
      train.value.movementCooldown = 3000 / train.value.speed // 3 second base cooldown for intersections
      
      // Space distortion chance: 10% chance to teleport to random location
      if (Math.random() < 0.1) {
        // Space distortion occurred - teleport to random constellation or intersection
        const allLocations: Array<{ type: 'constellation', constellation: ConstellationType } | { type: 'intersection', intersection: IntersectionType }> = []
        
        // Add all unlocked constellations
        constellations.value.forEach((constellation, constellationType) => {
          if (constellation.unlocked && constellation.stations.some(s => s.unlocked)) {
            allLocations.push({ type: 'constellation', constellation: constellationType })
          }
        })
        
        // Add all unlocked intersections
        intersections.value.forEach((intersection, intersectionType) => {
          if (intersection.unlocked) {
            allLocations.push({ type: 'intersection', intersection: intersectionType })
          }
        })
        
        if (allLocations.length > 0) {
          const randomLocation = allLocations[Math.floor(Math.random() * allLocations.length)]
          
          if (randomLocation.type === 'constellation') {
            // Teleport to a random station in this constellation
            const constellation = constellations.value.get(randomLocation.constellation)!
            const unlockedStations = constellation.stations.filter(s => s.unlocked)
            if (unlockedStations.length > 0) {
              const randomStation = unlockedStations[Math.floor(Math.random() * unlockedStations.length)]
              train.value.currentConstellation = randomLocation.constellation
              train.value.currentStation = randomStation.id
              train.value.position = { ...randomStation.position }
            }
          } else {
            // Teleport to intersection
            const intersectionData = intersections.value.get(randomLocation.intersection)!
            train.value.currentConstellation = null
            train.value.currentStation = randomLocation.intersection
            train.value.position = { ...intersectionData.position }
          }
        }
      } else {
        // Normal intersection visit
        intersection.visitCount++
        
        // Generate cosmic fragments: 2 + (visit count / 3)
        const fragmentGain = 2 + Math.floor(intersection.visitCount / 3)
        cosmicFragments.value += fragmentGain
      }
      
      setTimeout(() => {
        train.value.movementCooldown = 0
      }, train.value.movementCooldown)
    }, 1500 / train.value.speed)
    
    return true
  }
  
  function reset() {
    cosmicFragments.value = 0
    starRails.value = 0
    activeConstellations.value = []
    activeIntersections.value = []
    intersectionsUnlocked.value = false
    discoveryMode.value = true
    
    train.value = {
      currentConstellation: null,
      currentStation: null,
      position: { x: 0, y: 0 },
      moving: false,
      speed: 1.0,
      movementCooldown: 0
    }
    
    // Reset all constellations
    constellations.value.forEach(constellation => {
      constellation.activated = false
      constellation.completed = false
      constellation.unlocked = false
      constellation.stations.forEach(station => {
        station.unlocked = false
        station.activated = false
        station.visitCount = 0
      })
    })
    
    // Reset all intersections
    intersections.value.forEach(intersection => {
      intersection.unlocked = false
      intersection.activated = false
      intersection.visitCount = 0
    })
    
    initializeConstellations()
    initializeIntersections()
    if (discoveryMode.value) {
      initializeDiscoverySystem()
    }
  }
  
  function softReset() {
    activeConstellations.value = []
    activeIntersections.value = []
    
    train.value = {
      currentConstellation: null,
      currentStation: null,
      position: { x: 0, y: 0 },
      moving: false,
      speed: 1.0,
      movementCooldown: 0
    }
    
    // Deactivate but keep unlocked constellations
    constellations.value.forEach(constellation => {
      constellation.activated = false
      constellation.stations.forEach(station => {
        station.activated = false
        // Keep visitCount and unlocked status
      })
    })
    
    // Deactivate but keep unlocked intersections
    intersections.value.forEach(intersection => {
      intersection.activated = false
      // Keep visitCount and unlocked status
    })
  }
  
  // Tick function for updates
  function tick() {
    checkIntersectionUnlock()
  }
  
  // Star Memory System integration
  function preserveConstellation(constellation: ConstellationType, preservationRate: number) {
    const constellationData = constellations.value.get(constellation)
    if (!constellationData) return
    
    // Preserve stations based on rate
    constellationData.stations.forEach(station => {
      if (station.unlocked && Math.random() < preservationRate) {
        // Keep the station unlocked
        station.visitCount = Math.floor(station.visitCount * preservationRate)
      } else {
        // Reset to locked state
        station.unlocked = false
        station.visitCount = 0
      }
    })
    
    // Keep constellation unlocked if preservation rate is high enough
    if (preservationRate > 0.5) {
      constellationData.unlocked = true
    }
  }
  
  // Save/Load functions
  function save() {
    const saveData = {
      // Basic state
      cosmicFragments: cosmicFragments.value,
      starRails: starRails.value,
      maxActiveConstellations: maxActiveConstellations.value,
      intersectionsUnlocked: intersectionsUnlocked.value,
      discoveryMode: discoveryMode.value,
      maxActiveIntersections: maxActiveIntersections.value,
      
      // Active constellations
      activeConstellations: activeConstellations.value,
      activeIntersections: activeIntersections.value,
      
      // Train state
      train: {
        currentConstellation: train.value.currentConstellation,
        currentStation: train.value.currentStation,
        position: train.value.position,
        moving: train.value.moving,
        speed: train.value.speed,
        movementCooldown: train.value.movementCooldown
      },
      
      // Constellation data (unlocked, activated, station states)
      constellations: Array.from(constellations.value.entries()).map(([type, constellation]) => ({
        type,
        unlocked: constellation.unlocked,
        activated: constellation.activated,
        stations: constellation.stations.map(station => ({
          id: station.id,
          unlocked: station.unlocked,
          visitCount: station.visitCount
        }))
      })),
      
      // Intersection data (unlocked, activated, visit counts)
      intersections: Array.from(intersections.value.entries()).map(([type, intersection]) => ({
        type,
        unlocked: intersection.unlocked,
        activated: intersection.activated,
        visitCount: intersection.visitCount
      })),
      
      // Discovery system state
      discoveryProgress: Array.from(discoveryProgress.value.entries()),
      discoveryRequirements: Array.from(discoveryRequirements.value.entries())
    }
    
    return saveData
  }
  
  function load(saveData: any) {
    if (!saveData) return
    
    try {
      // Load basic state
      cosmicFragments.value = saveData.cosmicFragments || 0
      starRails.value = saveData.starRails || 0
      maxActiveConstellations.value = saveData.maxActiveConstellations || 3
      intersectionsUnlocked.value = saveData.intersectionsUnlocked || false
      discoveryMode.value = saveData.discoveryMode ?? true
      maxActiveIntersections.value = saveData.maxActiveIntersections || 2
      
      // Load active arrays
      activeConstellations.value = saveData.activeConstellations || []
      activeIntersections.value = saveData.activeIntersections || []
      
      // Load train state
      if (saveData.train) {
        train.value.currentConstellation = saveData.train.currentConstellation || null
        train.value.currentStation = saveData.train.currentStation || null
        train.value.position = saveData.train.position || { x: 0, y: 0 }
        train.value.moving = saveData.train.moving || false
        train.value.speed = saveData.train.speed || 1.0
        train.value.movementCooldown = saveData.train.movementCooldown || 0
      }
      
      // Load constellation states
      if (saveData.constellations) {
        saveData.constellations.forEach((savedConstellation: any) => {
          const constellation = constellations.value.get(savedConstellation.type)
          if (constellation) {
            constellation.unlocked = savedConstellation.unlocked || false
            constellation.activated = savedConstellation.activated || false
            
            // Load station states
            if (savedConstellation.stations) {
              savedConstellation.stations.forEach((savedStation: any) => {
                const station = constellation.stations.find(s => s.id === savedStation.id)
                if (station) {
                  station.unlocked = savedStation.unlocked || false
                  station.visitCount = savedStation.visitCount || 0
                }
              })
            }
          }
        })
      }
      
      // Load intersection states
      if (saveData.intersections) {
        saveData.intersections.forEach((savedIntersection: any) => {
          const intersection = intersections.value.get(savedIntersection.type)
          if (intersection) {
            intersection.unlocked = savedIntersection.unlocked || false
            intersection.activated = savedIntersection.activated || false
            intersection.visitCount = savedIntersection.visitCount || 0
          }
        })
      }
      
      // Load discovery system state
      if (saveData.discoveryProgress) {
        discoveryProgress.value = new Map(saveData.discoveryProgress)
      }
      if (saveData.discoveryRequirements) {
        discoveryRequirements.value = new Map(saveData.discoveryRequirements)
      }
      
      // Re-initialize discovery system if needed
      if (discoveryMode.value && discoveryRequirements.value.size === 0) {
        initializeDiscoverySystem()
      }
      
    } catch (error) {
      console.error('Failed to load Rail Road data:', error)
      // Re-initialize to default state
      initializeConstellations()
      initializeIntersections()
      if (discoveryMode.value) {
        initializeDiscoverySystem()
      }
    }
  }
  
  // Initialize on store creation
  initializeConstellations()
  initializeIntersections()
  if (discoveryMode.value) {
    initializeDiscoverySystem()
  }
  
  return {
    // State
    cosmicFragments,
    starRails,
    maxActiveConstellations,
    intersectionsUnlocked,
    discoveryMode,
    train,
    activeConstellations,
    constellations,
    intersections,
    activeIntersections,
    maxActiveIntersections,
    discoveryProgress,
    discoveryRequirements,
    
    // Computed
    groupSynergies,
    totalProductionBonus,
    totalCostMultiplier,
    intersectionSynergyBonus,
    
    // Actions
    canUnlockStation,
    unlockStation,
    canActivateConstellation,
    activateConstellation,
    deactivateConstellation,
    moveTrain,
    unlockIntersections,
    
    // Intersection actions
    canUnlockIntersection,
    unlockIntersection,
    canActivateIntersection,
    activateIntersection,
    deactivateIntersection,
    moveTrainToIntersection,
    
    // Discovery mode actions
    canDiscoverConstellation,
    discoverConstellation,
    addDiscoveryProgress,
    toggleDiscoveryMode,
    
    // Cost calculation functions
    getCostMultiplier,
    
    reset,
    softReset,
    tick,
    
    // Star Memory integration
    preserveConstellation,
    
    // Save/Load methods
    save,
    load
  }
})