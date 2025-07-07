<template>
  <div class="settings-panel">
    <h2 class="section-title">Settings</h2>
    
    <!-- Mobile Performance Settings -->
    <MobileSettings v-if="showMobileSettings" />
    
    <div class="settings-section">
      <h3 class="subsection-title">Save Management</h3>
      <div class="button-group">
        <button class="btn btn-secondary" @click="saveGame">
          Manual Save
        </button>
        <button class="btn btn-secondary" @click="exportSave">
          Export Save
        </button>
        <button class="btn btn-secondary" @click="importSave">
          Import Save
        </button>
      </div>
      <p class="save-info">
        Last saved: {{ lastSaveTime }}
      </p>
    </div>
    
    <div class="settings-section">
      <h3 class="subsection-title">Game Info</h3>
      <div class="stat-row">
        <span>Total Time Played:</span>
        <span>{{ formatTime(totalTimePlayed) }}</span>
      </div>
      <div class="stat-row">
        <span>Current Session:</span>
        <span>{{ formatTime(currentSessionTime) }}</span>
      </div>
      <div class="stat-row">
        <span>Game FPS:</span>
        <span :class="fpsClass">{{ fps }}</span>
      </div>
      <div class="stat-row" v-if="showMobileSettings">
        <span>Device Type:</span>
        <span>{{ deviceType }}</span>
      </div>
      <div class="stat-row" v-if="showMobileSettings">
        <span>Performance:</span>
        <span :class="performanceClass">{{ performanceStatus }}</span>
      </div>
      <div class="stat-row">
        <span>Update Rate:</span>
        <span>{{ updateRate }}ms ({{ updateRateText }})</span>
      </div>
    </div>
    
    <div class="settings-section danger-zone">
      <h3 class="subsection-title">Danger Zone</h3>
      <button class="btn btn-danger" @click="hardReset">
        Hard Reset
      </button>
      <p class="warning-text">
        This will completely reset your game progress!
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/gameState'
import { useGameLoopStore } from '@/stores/gameLoop'
import { useMobileOptimization } from '@/composables/useMobileOptimization'
import { formatTime } from '@/utils/formatting'
import MobileSettings from './MobileSettings.vue'

const gameStore = useGameStore()
const gameLoopStore = useGameLoopStore()
const mobileOpt = useMobileOptimization()

const { totalTimePlayed, currentSessionTime } = storeToRefs(gameStore)
const { fps, currentUpdateFrequency } = storeToRefs(gameLoopStore)

// Mobile optimization computed values
const showMobileSettings = computed(() => 
  mobileOpt.isMobile.value || 
  mobileOpt.isTablet.value || 
  mobileOpt.isLowEndDevice.value
)

const deviceType = computed(() => {
  const device = mobileOpt.deviceInfo.value
  if (device.isLowEndDevice) return `${device.isMobile ? 'Mobile' : 'Desktop'} (Low-end)`
  if (device.isMobile) return device.platform === 'ios' ? 'iPhone/iPad' : 'Android'
  if (device.isTablet) return 'Tablet'
  return 'Desktop'
})

const performanceStatus = computed(() => {
  if (mobileOpt.isLowPerformance.value) return 'Poor'
  if (mobileOpt.currentFPS.value < 45) return 'Fair'
  if (mobileOpt.currentFPS.value < 55) return 'Good'
  return 'Excellent'
})

const performanceClass = computed(() => {
  if (mobileOpt.isLowPerformance.value) return 'performance-poor'
  if (mobileOpt.currentFPS.value < 45) return 'performance-fair'
  if (mobileOpt.currentFPS.value < 55) return 'performance-good'
  return 'performance-excellent'
})

const fpsClass = computed(() => {
  const fpsValue = fps.value
  if (fpsValue < 30) return 'fps-critical'
  if (fpsValue < 45) return 'fps-warning'
  return 'fps-good'
})

const updateRate = computed(() => currentUpdateFrequency.value)

const updateRateText = computed(() => {
  const rate = updateRate.value
  if (rate <= 16) return '60 FPS'
  if (rate <= 33) return '30 FPS'
  if (rate <= 100) return '10 FPS'
  return '2 FPS'
})

// TODO: Add lastSave to gameStore
const lastSaveTime = computed(() => {
  return 'Just now'
})

function saveGame() {
  gameStore.save()
  alert('Game saved!')
}

function exportSave() {
  const saveData = gameStore.save()
  navigator.clipboard.writeText(saveData)
  alert('Save data copied to clipboard!')
}

function importSave() {
  const saveData = prompt('Paste your save data:')
  if (saveData) {
    if (gameStore.load(saveData)) {
      alert('Save loaded successfully!')
    } else {
      alert('Invalid save data!')
    }
  }
}

function hardReset() {
  if (confirm('Are you sure you want to completely reset your game? This cannot be undone!')) {
    if (confirm('Are you REALLY sure? All progress will be lost!')) {
      gameStore.reset()
      gameLoopStore.reset()
      location.reload()
    }
  }
}
</script>

<style scoped>
.settings-panel {
  height: 100%;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-green);
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.settings-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 15px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.button-group .btn {
  flex: 1;
  min-width: 120px;
}

.save-info {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-row span:first-child {
  color: var(--text-muted);
}

.stat-row span:last-child {
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
}

/* Performance status colors */
.performance-poor {
  color: var(--accent-red);
}

.performance-fair {
  color: var(--accent-orange);
}

.performance-good {
  color: var(--accent-blue);
}

.performance-excellent {
  color: var(--accent-green);
}

/* FPS status colors */
.fps-critical {
  color: var(--accent-red);
  font-weight: 700;
}

.fps-warning {
  color: var(--accent-orange);
  font-weight: 600;
}

.fps-good {
  color: var(--accent-green);
  font-weight: 600;
}

.danger-zone {
  border-color: rgba(255, 7, 58, 0.3);
  background: rgba(255, 7, 58, 0.05);
}

.btn-danger {
  background: var(--accent-red);
  width: 100%;
}

.btn-danger:hover {
  background: #cc0530;
  box-shadow: 0 5px 15px rgba(255, 7, 58, 0.4);
}

.warning-text {
  font-size: 12px;
  color: var(--accent-red);
  text-align: center;
  margin-top: 10px;
}</style>