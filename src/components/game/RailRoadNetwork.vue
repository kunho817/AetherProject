<template>
  <div class="railroad-container">
    <h2 class="section-title">Rail Road Constellation Network</h2>
    
    <!-- Discovery Mode Toggle -->
    <div class="discovery-mode-toggle">
      <label class="toggle-label">
        <input 
          type="checkbox" 
          :checked="discoveryMode"
          @change="railRoadStore.toggleDiscoveryMode()"
        />
        <span>Discovery Mode</span>
      </label>
      <span class="discovery-description">
        {{ discoveryMode ? 'Explore and discover new constellations' : 'All constellations available' }}
      </span>
    </div>
    
    <div class="railroad-stats">
      <div class="stat-item">
        <span>Star Rails:</span>
        <span>{{ starRails }}</span>
      </div>
      <div class="stat-item">
        <span>Cosmic Fragments:</span>
        <span>{{ cosmicFragments }}</span>
      </div>
      <div class="stat-item">
        <span>Active Constellations:</span>
        <span>{{ activeConstellations.length }}/{{ maxActiveConstellations }}</span>
      </div>
      <div class="stat-item" v-if="intersectionsUnlocked">
        <span>Active Intersections:</span>
        <span>{{ activeIntersections.length }}/{{ maxActiveIntersections }}</span>
      </div>
      <div class="stat-item">
        <span>Train Status:</span>
        <span :class="getTrainStatusClass()">{{ getTrainStatus() }}</span>
      </div>
    </div>
    
    
    <div class="constellation-container" ref="constellationContainer">
      <div class="constellation-tabs" :style="{ transform: transform }">
        <button 
          v-for="constellation in availableConstellations"
        :key="constellation.id"
        :class="['constellation-tab', { 
          active: selectedConstellation === constellation.id,
          activated: constellation.activated,
          unlocked: constellation.unlocked,
          discoverable: discoveryMode && !constellation.unlocked && canDiscoverConstellation(constellation.id)
        }]"
        @click="selectConstellation(constellation.id)"
        :disabled="!constellation.unlocked && !(discoveryMode && canDiscoverConstellation(constellation.id))"
      >
        <div class="constellation-name">{{ constellation.name }}</div>
        <div v-if="discoveryMode && !constellation.unlocked" class="discovery-progress">
          <div class="progress-bar-mini">
            <div 
              class="progress-fill-mini" 
              :style="{ width: `${getDiscoveryProgress(constellation.id)}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ getDiscoveryProgress(constellation.id) }}%</span>
        </div>
        <div class="constellation-status">
          <span v-if="constellation.activated" class="status-active">●</span>
          <span v-else-if="constellation.unlocked" class="status-available">○</span>
          <span v-else-if="discoveryMode && canDiscoverConstellation(constellation.id)" class="status-discoverable">◆</span>
          <span v-else class="status-locked">✕</span>
        </div>
        </button>
      </div>
    </div>
    
    <div v-if="selectedConstellationData || (discoveryMode && selectedConstellation)" class="constellation-detail">
      <!-- Discovery Panel for Undiscovered Constellations -->
      <div v-if="discoveryMode && selectedConstellation && !selectedConstellationData?.unlocked" class="discovery-panel">
        <h3 class="discovery-title">Undiscovered Constellation</h3>
        <div class="discovery-requirements">
          <h4>Discovery Requirements:</h4>
          <div class="requirement-list">
            <div class="requirement-item">
              <span>Cosmic Fragments:</span>
              <span :class="{ met: hasEnoughFragments }">
                {{ cosmicFragments }}/{{ getDiscoveryRequirement(selectedConstellation).fragments }}
              </span>
            </div>
            <div class="requirement-item">
              <span>Star Rails:</span>
              <span :class="{ met: hasEnoughRails }">
                {{ starRails }}/{{ getDiscoveryRequirement(selectedConstellation).starRails }}
              </span>
            </div>
            <div v-if="selectedConstellation && getDiscoveryRequirement(selectedConstellation).prerequisite" class="requirement-item">
              <span>Prerequisite:</span>
              <span :class="{ met: isPrerequisiteMet }">
                {{ selectedConstellation ? getConstellationName(getDiscoveryRequirement(selectedConstellation).prerequisite!) : 'None' }}
              </span>
            </div>
          </div>
          <div class="discovery-progress-detail">
            <h4>Exploration Progress:</h4>
            <div class="progress-bar-large">
              <div 
                class="progress-fill-large" 
                :style="{ width: `${getDiscoveryProgress(selectedConstellation)}%` }"
              ></div>
            </div>
            <p class="progress-hint">Visit nearby constellation stations to increase progress</p>
          </div>
          <button 
            class="btn btn-primary btn-discover"
            :disabled="!canDiscoverConstellation(selectedConstellation)"
            @click="discoverConstellation(selectedConstellation)"
          >
            Discover Constellation
          </button>
        </div>
      </div>
      
      <!-- Normal Constellation Detail -->
      <div v-else-if="selectedConstellationData" class="constellation-header">
        <h3 class="constellation-title">{{ selectedConstellationData.name }}</h3>
        <div class="constellation-actions">
          <button 
            v-if="!selectedConstellationData.activated && selectedConstellation"
            class="btn btn-primary"
            :disabled="!canActivateConstellation(selectedConstellation)"
            @click="activateConstellation(selectedConstellation)"
          >
            Activate ({{ selectedConstellationData.activationCost }} Star Rails)
          </button>
          <button 
            v-else-if="selectedConstellation"
            class="btn btn-secondary"
            @click="deactivateConstellation(selectedConstellation)"
          >
            Deactivate
          </button>
        </div>
      </div>
      
      <div v-if="selectedConstellationData" class="constellation-effects">
        <div class="effect-item advantage">
          <span class="effect-label">Advantage:</span>
          <span class="effect-description">{{ selectedConstellationData.advantage.description }}</span>
        </div>
        <div class="effect-item penalty">
          <span class="effect-label">Penalty:</span>
          <span class="effect-description">{{ selectedConstellationData.penalty.description }}</span>
        </div>
        <div class="effect-item special">
          <span class="effect-label">Special:</span>
          <span class="effect-description">{{ selectedConstellationData.specialMechanism }}</span>
        </div>
      </div>
      
      <div v-if="selectedConstellationData" class="station-map">
        <h4 class="subsection-title">Station Network</h4>
        <div class="map-container">
          <svg class="station-svg" viewBox="-200 -200 400 400">
            <!-- Station connections -->
            <g class="connections">
              <template v-for="(station, index) in selectedConstellationData.stations" :key="`connection-${index}`">
                <path 
                  v-if="index < selectedConstellationData.stations.length - 1"
                  :d="getConnectionPath(station, selectedConstellationData.stations[index + 1])"
                  class="station-connection"
                  :class="{ active: station.unlocked && selectedConstellationData.stations[index + 1].unlocked }"
                />
              </template>
              <!-- Close the loop -->
              <path 
                v-if="selectedConstellationData.stations.length > 2"
                :d="getConnectionPath(
                  selectedConstellationData.stations[selectedConstellationData.stations.length - 1],
                  selectedConstellationData.stations[0]
                )"
                class="station-connection"
                :class="{ 
                  active: selectedConstellationData.stations[0].unlocked && 
                          selectedConstellationData.stations[selectedConstellationData.stations.length - 1].unlocked 
                }"
              />
            </g>
            
            <!-- Stations -->
            <g class="stations">
              <circle 
                v-for="station in selectedConstellationData.stations"
                :key="station.id"
                :cx="station.position.x / 2"
                :cy="station.position.y / 2"
                :r="12"
                :class="['station-node', {
                  unlocked: station.unlocked,
                  current: train.currentStation === station.id,
                  enhanced: station.visitCount > 0
                }]"
                @click="handleStationClick(station)"
              />
              
              <!-- Train position -->
              <circle 
                v-if="train.currentConstellation === selectedConstellation"
                :cx="train.position.x / 2"
                :cy="train.position.y / 2"
                r="8"
                class="train-marker"
                :class="{ moving: train.moving }"
              />
            </g>
            
            <!-- Station labels -->
            <g class="station-labels">
              <text 
                v-for="station in selectedConstellationData.stations"
                :key="`label-${station.id}`"
                :x="station.position.x / 2"
                :y="station.position.y / 2 + 25"
                class="station-label"
                text-anchor="middle"
              >
                {{ station.name }}
              </text>
            </g>
          </svg>
        </div>
      </div>
      
      <div v-if="selectedConstellationData" class="station-list">
        <h4 class="subsection-title">Station Details</h4>
        <div class="station-grid">
          <div 
            v-for="station in selectedConstellationData.stations"
            :key="station.id"
            :class="['station-card', {
              unlocked: station.unlocked,
              current: train.currentStation === station.id,
              enhanced: station.visitCount > 0
            }]"
          >
            <div class="station-header">
              <span class="station-name">{{ station.name }}</span>
              <span class="station-visits" v-if="station.visitCount > 0">
                {{ station.visitCount }} visits
              </span>
            </div>
            <div class="station-effect">{{ station.effect.description }}</div>
            <div class="station-enhancement" v-if="station.visitCount > 0">
              Enhancement: +{{ (Math.min(station.visitCount * 0.05, 5)).toFixed(2) }}% ({{ station.visitCount }}/100 visits)
            </div>
            <div class="station-actions">
              <button 
                v-if="!station.unlocked && selectedConstellation"
                class="btn btn-small"
                :disabled="!canUnlockStation(selectedConstellation, station.id)"
                @click="unlockStation(selectedConstellation, station.id)"
              >
                Unlock ({{ station.unlockCost }} Star Rails)
              </button>
              <button 
                v-else-if="train.currentStation !== station.id && selectedConstellation"
                class="btn btn-small btn-secondary"
                :disabled="train.moving || train.movementCooldown > 0"
                @click="moveTrain(selectedConstellation, station.id)"
              >
                Visit Station
              </button>
              <span v-else class="current-station">Current Location</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="group-synergies">
      <h4 class="subsection-title">Constellation Group Synergies</h4>
      <div class="synergy-grid">
        <div 
          v-for="synergy in groupSynergies"
          :key="synergy.group"
          :class="['synergy-item', { active: synergy.active }]"
        >
          <div class="synergy-name">{{ formatGroupName(synergy.group) }}</div>
          <div class="synergy-constellations">
            {{ synergy.constellations.map(c => getConstellationName(c)).join(', ') }}
          </div>
          <div class="synergy-effect">{{ synergy.specialEffect }}</div>
          <div v-if="synergy.active" class="synergy-status">✓ Active</div>
        </div>
      </div>
    </div>
    
    <!-- Intersection System -->
    <div v-if="intersectionsUnlocked" class="intersection-system">
      <h4 class="subsection-title">Rail Road Intersections</h4>
      <div class="intersection-status">
        <p class="unlock-message">
          Intersections unlocked! Connect different constellations for powerful bonuses.
        </p>
      </div>
      
      <div class="intersection-tabs">
        <button 
          v-for="intersection in availableIntersections"
          :key="intersection.id"
          :class="['intersection-tab', { 
            active: selectedIntersection === intersection.id,
            activated: intersection.activated,
            unlocked: intersection.unlocked
          }]"
          @click="selectIntersection(intersection.id as IntersectionType)"
          :disabled="!intersection.unlocked"
        >
          <div class="intersection-name">{{ intersection.name }}</div>
          <div class="intersection-connection">
            {{ getConstellationName(intersection.connectedConstellations[0]) }} ↔ 
            {{ getConstellationName(intersection.connectedConstellations[1]) }}
          </div>
          <div class="intersection-status">
            <span v-if="intersection.activated" class="status-active">●</span>
            <span v-else-if="intersection.unlocked" class="status-available">○</span>
            <span v-else class="status-locked">✕</span>
          </div>
        </button>
      </div>
      
      <div v-if="selectedIntersectionData" class="intersection-detail">
        <div class="intersection-header">
          <h5 class="intersection-title">{{ selectedIntersectionData.name }}</h5>
          <div class="intersection-actions">
            <button 
              v-if="!selectedIntersectionData.unlocked"
              class="btn btn-primary"
              :disabled="!selectedIntersection || !canUnlockIntersection(selectedIntersection)"
              @click="selectedIntersection && unlockIntersection(selectedIntersection)"
            >
              Unlock ({{ selectedIntersectionData.activationCost }} Star Rails)
            </button>
            <button 
              v-else-if="!selectedIntersectionData.activated"
              class="btn btn-primary"
              :disabled="!selectedIntersection || !canActivateIntersection(selectedIntersection)"
              @click="selectedIntersection && activateIntersection(selectedIntersection)"
            >
              Activate
            </button>
            <button 
              v-else
              class="btn btn-secondary"
              @click="selectedIntersection && deactivateIntersection(selectedIntersection)"
            >
              Deactivate
            </button>
            <button 
              v-if="selectedIntersectionData.unlocked"
              class="btn btn-action"
              :disabled="train.moving || train.movementCooldown > 0"
              @click="selectedIntersection && moveTrainToIntersection(selectedIntersection)"
            >
              Move Train Here
            </button>
          </div>
        </div>
        
        <div class="intersection-info">
          <div class="intersection-effect">
            <h6>Intersection Effect</h6>
            <p>{{ selectedIntersectionData.effect.description }}</p>
            <div class="effect-scaling">
              <span>Base: {{ format(selectedIntersectionData.effect.baseValue) }}</span>
              <span>Max: {{ format(selectedIntersectionData.effect.maxValue) }}</span>
              <span>Visits: {{ selectedIntersectionData.visitCount }}</span>
            </div>
          </div>
          
          <div class="intersection-requirements">
            <h6>Requirements</h6>
            <div class="requirement-item">
              <span>Both constellations must be unlocked and active</span>
            </div>
            <div class="requirement-item">
              <span>{{ getConstellationName(selectedIntersectionData.connectedConstellations[0]) }}: 
                <span :class="{ met: isConstellationActive(selectedIntersectionData.connectedConstellations[0]) }">
                  {{ isConstellationActive(selectedIntersectionData.connectedConstellations[0]) ? 'Active' : 'Inactive' }}
                </span>
              </span>
            </div>
            <div class="requirement-item">
              <span>{{ getConstellationName(selectedIntersectionData.connectedConstellations[1]) }}: 
                <span :class="{ met: isConstellationActive(selectedIntersectionData.connectedConstellations[1]) }">
                  {{ isConstellationActive(selectedIntersectionData.connectedConstellations[1]) ? 'Active' : 'Inactive' }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="total-bonuses">
      <h4 class="subsection-title">Total Constellation Effects</h4>
      <div class="bonus-grid">
        <div class="bonus-item">
          <span>Production Bonus:</span>
          <span class="bonus-value">×{{ format(totalProductionBonus) }}</span>
        </div>
        <div class="bonus-item">
          <span>Cost Multiplier:</span>
          <span class="bonus-value">×{{ format(totalCostMultiplier) }}</span>
        </div>
        <div v-if="intersectionsUnlocked" class="bonus-item">
          <span>Intersection Synergy:</span>
          <span class="bonus-value">×{{ format(intersectionSynergyBonus) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRailRoadStore } from '@/stores/railroad'
import { format } from '@/utils/formatting'
import type { ConstellationType, RailStation, ConstellationGroup, IntersectionType } from '@/types/railroad'

const railRoadStore = useRailRoadStore()

// Optimized camera controls
const constellationContainer = ref<HTMLElement>()
const zoom = ref(2.5) // Start at 250%
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)

let lastMouseX = 0
let lastMouseY = 0
let animationFrame = 0

const transform = computed(() => {
  return `translate(${panX.value}px, ${panY.value}px) scale(${zoom.value})`
})

// Throttled mouse wheel handler
const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  
  if (animationFrame) return // Skip if already animating
  
  animationFrame = requestAnimationFrame(() => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    zoom.value = Math.max(2.0, Math.min(3.5, zoom.value + delta))
    animationFrame = 0
  })
}

// Efficient drag handlers
const handleMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return
  isDragging.value = true
  lastMouseX = e.clientX
  lastMouseY = e.clientY
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  
  if (animationFrame) return // Skip if already animating
  
  animationFrame = requestAnimationFrame(() => {
    const deltaX = e.clientX - lastMouseX
    const deltaY = e.clientY - lastMouseY
    
    panX.value += deltaX
    panY.value += deltaY
    
    lastMouseX = e.clientX
    lastMouseY = e.clientY
    animationFrame = 0
  })
}

const handleMouseUp = () => {
  isDragging.value = false
}

onMounted(() => {
  if (!constellationContainer.value) return
  
  const container = constellationContainer.value
  container.addEventListener('wheel', handleWheel, { passive: false })
  container.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  if (!constellationContainer.value) return
  
  const container = constellationContainer.value
  container.removeEventListener('wheel', handleWheel)
  container.removeEventListener('mousedown', handleMouseDown)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})



const {
  cosmicFragments,
  starRails,
  maxActiveConstellations,
  intersectionsUnlocked,
  train,
  activeConstellations,
  constellations,
  intersections,
  activeIntersections,
  maxActiveIntersections,
  groupSynergies,
  totalProductionBonus,
  totalCostMultiplier,
  intersectionSynergyBonus,
  discoveryMode,
  discoveryProgress,
  discoveryRequirements
} = storeToRefs(railRoadStore)

const selectedConstellation = ref<ConstellationType | null>(null)
const selectedIntersection = ref<IntersectionType | null>(null)

const availableConstellations = computed(() => {
  return Array.from(constellations.value.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  )
})

const selectedConstellationData = computed(() => {
  if (!selectedConstellation.value) return null
  return constellations.value.get(selectedConstellation.value)
})

const availableIntersections = computed(() => {
  return Array.from(intersections.value.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  )
})

const selectedIntersectionData = computed(() => {
  if (!selectedIntersection.value) return null
  return intersections.value.get(selectedIntersection.value)
})

function selectConstellation(constellation: ConstellationType) {
  selectedConstellation.value = constellation
}

function selectIntersection(intersection: IntersectionType) {
  selectedIntersection.value = intersection
}

function getTrainStatus(): string {
  if (train.value.moving) return 'Moving'
  if (train.value.movementCooldown > 0) return 'Cooling Down'
  if (train.value.currentStation) return 'At Station'
  return 'Idle'
}

function getTrainStatusClass(): string {
  if (train.value.moving) return 'status-moving'
  if (train.value.movementCooldown > 0) return 'status-cooldown'
  if (train.value.currentStation) return 'status-station'
  return 'status-idle'
}

function getConnectionPath(station1: RailStation, station2: RailStation): string {
  const x1 = station1.position.x / 2
  const y1 = station1.position.y / 2
  const x2 = station2.position.x / 2
  const y2 = station2.position.y / 2
  return `M ${x1} ${y1} L ${x2} ${y2}`
}

function handleStationClick(station: RailStation) {
  if (!selectedConstellation.value) return
  
  if (!station.unlocked) {
    if (railRoadStore.canUnlockStation(selectedConstellation.value, station.id)) {
      railRoadStore.unlockStation(selectedConstellation.value, station.id)
    }
  } else if (train.value.currentStation !== station.id && !train.value.moving) {
    railRoadStore.moveTrain(selectedConstellation.value, station.id)
  }
}

function formatGroupName(group: ConstellationGroup): string {
  return group.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function getConstellationName(type: ConstellationType): string {
  const constellation = constellations.value.get(type)
  return constellation?.name || type
}

function isConstellationActive(constellation: ConstellationType): boolean {
  return activeConstellations.value.includes(constellation)
}

// Expose store methods
const canActivateConstellation = railRoadStore.canActivateConstellation
const activateConstellation = railRoadStore.activateConstellation
const deactivateConstellation = railRoadStore.deactivateConstellation
const canUnlockStation = railRoadStore.canUnlockStation
const unlockStation = railRoadStore.unlockStation
const moveTrain = railRoadStore.moveTrain

// Intersection methods
const canUnlockIntersection = railRoadStore.canUnlockIntersection
const unlockIntersection = railRoadStore.unlockIntersection
const canActivateIntersection = railRoadStore.canActivateIntersection
const activateIntersection = railRoadStore.activateIntersection
const deactivateIntersection = railRoadStore.deactivateIntersection
const moveTrainToIntersection = railRoadStore.moveTrainToIntersection

// Discovery mode computed properties
const canDiscoverConstellation = computed(() => (constellation: ConstellationType) => {
  return railRoadStore.canDiscoverConstellation(constellation)
})

const getDiscoveryProgress = computed(() => (constellation: ConstellationType) => {
  const progress = discoveryProgress.value.get(constellation) || 0
  return Math.min(100, Math.floor(progress * 100))
})

const getDiscoveryRequirement = computed(() => (constellation: ConstellationType) => {
  return discoveryRequirements.value.get(constellation) || { fragments: 0, starRails: 0 }
})

const hasEnoughFragments = computed(() => {
  if (!selectedConstellation.value) return false
  const req = getDiscoveryRequirement.value(selectedConstellation.value)
  return cosmicFragments.value >= req.fragments
})

const hasEnoughRails = computed(() => {
  if (!selectedConstellation.value) return false
  const req = getDiscoveryRequirement.value(selectedConstellation.value)
  return starRails.value >= req.starRails
})

const isPrerequisiteMet = computed(() => {
  if (!selectedConstellation.value) return false
  const req = getDiscoveryRequirement.value(selectedConstellation.value)
  if (!req.prerequisite) return true
  const prereq = constellations.value.get(req.prerequisite)
  return prereq?.unlocked || false
})

// Discovery mode methods
function discoverConstellation(constellation: ConstellationType) {
  railRoadStore.discoverConstellation(constellation)
}

// Auto-select first available constellation
if (availableConstellations.value.length > 0 && !selectedConstellation.value) {
  selectedConstellation.value = availableConstellations.value[0].id
}
</script>

<style scoped>
.railroad-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-green);
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.railroad-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  min-width: 150px;
  font-size: 14px;
}

.stat-item span:first-child {
  color: var(--text-muted);
}

.stat-item span:last-child {
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
}

.status-moving { color: var(--accent-green); }
.status-cooldown { color: var(--accent-orange); }
.status-station { color: var(--accent-blue); }
.status-idle { color: var(--text-muted); }

/* Discovery Mode Styles */
.discovery-mode-toggle {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.toggle-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.discovery-description {
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
}

.constellation-tab.discoverable {
  border-color: var(--accent-purple);
  background: rgba(138, 43, 226, 0.1);
}

.status-discoverable {
  color: var(--accent-purple);
}

.discovery-progress {
  margin-top: 4px;
}

.progress-bar-mini {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
  background: var(--accent-purple);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 10px;
  color: var(--accent-purple);
  margin-top: 2px;
}

/* Discovery Panel */
.discovery-panel {
  padding: 20px;
  background: rgba(138, 43, 226, 0.05);
  border: 1px solid var(--accent-purple);
  border-radius: 8px;
}

.discovery-title {
  font-size: 18px;
  color: var(--accent-purple);
  margin-bottom: 15px;
}

.discovery-requirements h4 {
  color: var(--accent-blue);
  font-size: 14px;
  margin-bottom: 10px;
}

.requirement-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.requirement-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
}

.requirement-item span:first-child {
  color: var(--text-secondary);
}

.requirement-item span.met {
  color: var(--accent-green);
  font-weight: 600;
}

.requirement-item span:not(.met) {
  color: var(--accent-red);
}

.discovery-progress-detail {
  margin-top: 20px;
}

.discovery-progress-detail h4 {
  color: var(--accent-blue);
  font-size: 14px;
  margin-bottom: 10px;
}

.progress-bar-large {
  width: 100%;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill-large {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-purple) 0%, var(--accent-blue) 100%);
  transition: width 0.5s ease;
}

.progress-hint {
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
  margin-bottom: 20px;
}

.btn-discover {
  width: 100%;
  background: var(--accent-purple);
  border-color: var(--accent-purple);
}

.btn-discover:hover:not(:disabled) {
  background: color-mix(in srgb, var(--accent-purple) 80%, white);
  border-color: color-mix(in srgb, var(--accent-purple) 80%, white);
}

.btn-discover:disabled {
  background: rgba(138, 43, 226, 0.3);
  border-color: rgba(138, 43, 226, 0.3);
}

.constellation-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.constellation-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.constellation-tab:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.constellation-tab.active {
  border-color: var(--accent-blue);
  background: rgba(0, 180, 216, 0.2);
  color: var(--text-primary);
}

.constellation-tab.activated {
  border-color: var(--accent-green);
}

.constellation-tab:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.constellation-name {
  font-weight: 600;
}

.status-active { color: var(--accent-green); }
.status-available { color: var(--accent-blue); }
.status-locked { color: var(--text-muted); }

.constellation-detail {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--border-secondary);
}

.constellation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.constellation-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-blue);
}

.constellation-effects {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.effect-item {
  display: flex;
  font-size: 14px;
}

.effect-label {
  min-width: 100px;
  font-weight: 600;
}

.effect-item.advantage .effect-label { color: var(--accent-green); }
.effect-item.penalty .effect-label { color: var(--accent-red); }
.effect-item.special .effect-label { color: var(--accent-purple); }

.effect-description {
  color: var(--text-primary);
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 12px;
}

.map-container {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.station-svg {
  width: 100%;
  max-width: 400px;
  height: 300px;
  margin: 0 auto;
  display: block;
}

.station-connection {
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 2;
  fill: none;
}

.station-connection.active {
  stroke: var(--accent-blue);
  stroke-width: 3;
}

.station-node {
  fill: rgba(255, 255, 255, 0.3);
  stroke: var(--border-secondary);
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.3s ease;
}

.station-node.unlocked {
  fill: var(--accent-blue);
  stroke: var(--accent-blue);
}

.station-node.current {
  fill: var(--accent-green);
  stroke: var(--accent-green);
  stroke-width: 4;
}

.station-node.enhanced {
  stroke-width: 3;
  filter: brightness(1.2);
}

.station-node:hover {
  transform: scale(1.2);
}

.train-marker {
  fill: var(--accent-orange);
  stroke: var(--accent-red);
  stroke-width: 2;
  animation: trainPulse 2s ease-in-out infinite;
}

.train-marker.moving {
  animation: trainMoving 1s ease-in-out infinite;
}

@keyframes trainPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes trainMoving {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.station-label {
  font-size: 10px;
  fill: var(--text-secondary);
  font-family: 'Roboto Mono', monospace;
}

.station-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.station-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  padding: 12px;
  transition: all 0.3s ease;
}

.station-card.unlocked {
  border-color: var(--accent-blue);
  background: rgba(0, 180, 216, 0.1);
}

.station-card.current {
  border-color: var(--accent-green);
  background: rgba(6, 255, 165, 0.1);
}

.station-card.enhanced {
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.station-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.station-name {
  font-weight: 600;
  color: var(--text-primary);
}

.station-visits {
  font-size: 12px;
  color: var(--accent-yellow);
  font-family: 'Roboto Mono', monospace;
}

.station-effect {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.station-enhancement {
  font-size: 11px;
  color: var(--accent-green);
  margin-bottom: 8px;
  font-family: 'Roboto Mono', monospace;
}

.station-actions {
  display: flex;
  justify-content: center;
}

.current-station {
  color: var(--accent-green);
  font-weight: 600;
  font-size: 12px;
}

.synergy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.synergy-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
}

.synergy-item.active {
  border-color: var(--accent-green);
  background: rgba(6, 255, 165, 0.1);
}

.synergy-name {
  font-weight: 600;
  color: var(--accent-purple);
  margin-bottom: 8px;
}

.synergy-constellations {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.synergy-effect {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.synergy-status {
  color: var(--accent-green);
  font-weight: 600;
  font-size: 12px;
}

.bonus-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.bonus-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.bonus-value {
  color: var(--accent-yellow);
  font-family: 'Roboto Mono', monospace;
  font-weight: 700;
}

/* Intersection System Styles */
.intersection-system {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border-secondary);
}

.intersection-status {
  margin-bottom: 15px;
}

.unlock-message {
  color: var(--accent-green);
  font-style: italic;
  margin: 0;
}

.intersection-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.intersection-tab {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.intersection-tab:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-blue);
}

.intersection-tab.active {
  background: rgba(0, 180, 216, 0.2);
  border-color: var(--accent-blue);
}

.intersection-tab.activated {
  background: rgba(6, 255, 165, 0.1);
  border-color: var(--accent-green);
}

.intersection-tab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.intersection-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.intersection-connection {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.intersection-detail {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 20px;
  margin-top: 15px;
}

.intersection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.intersection-title {
  font-size: 16px;
  color: var(--accent-purple);
  margin: 0;
}

.intersection-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.intersection-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.intersection-effect h6,
.intersection-requirements h6 {
  color: var(--accent-blue);
  margin-bottom: 8px;
  font-size: 14px;
}

.effect-scaling {
  display: flex;
  gap: 15px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-muted);
}

.requirement-item {
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.requirement-item .met {
  color: var(--accent-green);
  font-weight: 600;
}

@media (max-width: 768px) {
  .constellation-tabs {
    flex-direction: column;
  }
  
  .constellation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .station-grid {
    grid-template-columns: 1fr;
  }
  
  .synergy-grid {
    grid-template-columns: 1fr;
  }
  
  .intersection-tabs {
    flex-direction: column;
  }
  
  .intersection-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .intersection-info {
    grid-template-columns: 1fr;
  }
}

.constellation-container {
  position: relative;
  overflow: hidden;
  cursor: grab;
  user-select: none;
}

.constellation-container:active {
  cursor: grabbing;
}

.constellation-tabs {
  transform-origin: center center;
  will-change: transform;
}

</style>