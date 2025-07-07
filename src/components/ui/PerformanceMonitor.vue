<template>
  <div 
    v-if="showMonitor" 
    class="performance-monitor"
    :class="{ 
      'monitor-expanded': expanded,
      'monitor-warning': isPerformanceWarning,
      'monitor-critical': isPerformanceCritical
    }"
  >
    <div class="monitor-header" @click="expanded = !expanded">
      <div class="monitor-status">
        <div :class="['status-indicator', statusColor]"></div>
        <span class="status-text">{{ statusText }}</span>
      </div>
      <button class="monitor-toggle">
        {{ expanded ? '▼' : '▲' }}
      </button>
    </div>
    
    <Transition name="monitor-expand">
      <div v-if="expanded" class="monitor-content">
        <!-- Performance Metrics -->
        <div class="metrics-section">
          <h4>Performance</h4>
          <div class="metric-grid">
            <div class="metric-item">
              <span class="metric-label">FPS</span>
              <span class="metric-value" :class="fpsClass">{{ currentFPS }}</span>
            </div>
            <div class="metric-item" v-if="memoryUsage > 0">
              <span class="metric-label">Memory</span>
              <span class="metric-value" :class="memoryClass">{{ memoryPercentage }}%</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Update Rate</span>
              <span class="metric-value">{{ updateRate }}ms</span>
            </div>
          </div>
        </div>
        
        <!-- Device Info -->
        <div class="device-section">
          <h4>Device</h4>
          <div class="device-info">
            <div class="device-item">
              <span class="device-label">Type:</span>
              <span class="device-value">{{ deviceType }}</span>
            </div>
            <div class="device-item">
              <span class="device-label">Screen:</span>
              <span class="device-value">{{ screenInfo }}</span>
            </div>
            <div class="device-item" v-if="connectionType !== 'unknown'">
              <span class="device-label">Connection:</span>
              <span class="device-value">{{ connectionType }}</span>
            </div>
          </div>
        </div>
        
        <!-- Optimization Settings -->
        <div class="settings-section">
          <h4>Optimizations</h4>
          <div class="optimization-toggles">
            <label class="toggle-item">
              <input 
                type="checkbox" 
                v-model="localSettings.particlesEnabled"
                @change="updateOptimizations"
                :disabled="shouldDisableParticles"
              >
              <span class="toggle-label">Particles</span>
              <span v-if="shouldDisableParticles" class="toggle-disabled">(Auto-disabled)</span>
            </label>
            
            <label class="toggle-item">
              <input 
                type="checkbox" 
                v-model="localSettings.backgroundEffectsEnabled"
                @change="updateOptimizations"
              >
              <span class="toggle-label">Background Effects</span>
            </label>
            
            <label class="toggle-item">
              <input 
                type="checkbox" 
                v-model="localSettings.animationsEnabled"
                @change="updateOptimizations"
              >
              <span class="toggle-label">Animations</span>
            </label>
            
            <label class="toggle-item">
              <input 
                type="checkbox" 
                v-model="localSettings.complexShadowsEnabled"
                @change="updateOptimizations"
              >
              <span class="toggle-label">Complex Shadows</span>
            </label>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="actions-section">
          <button 
            class="action-btn performance-btn" 
            @click="enablePerformanceMode"
            :disabled="isPerformanceMode"
          >
            Performance Mode
          </button>
          <button 
            class="action-btn quality-btn" 
            @click="enableQualityMode"
            :disabled="!canEnableQuality"
          >
            Quality Mode
          </button>
        </div>
        
        <!-- Performance Tips -->
        <div v-if="performanceTips.length > 0" class="tips-section">
          <h4>Performance Tips</h4>
          <ul class="tips-list">
            <li v-for="tip in performanceTips" :key="tip" class="tip-item">
              {{ tip }}
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useMobileOptimization } from '@/composables/useMobileOptimization'
import { useGameLoopStore } from '@/stores/gameLoop'

interface Props {
  visible?: boolean
  autoHide?: boolean
  showOnWarning?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  autoHide: true,
  showOnWarning: true
})

const mobileOpt = useMobileOptimization()
const gameLoop = useGameLoopStore()

const expanded = ref(false)
const localSettings = ref({ ...mobileOpt.mobileSettings.value })

// Computed values
const showMonitor = computed(() => {
  if (props.visible) return true
  if (props.showOnWarning && isPerformanceWarning.value) return true
  return false
})

const currentFPS = computed(() => mobileOpt.currentFPS.value || gameLoop.fps)
const memoryUsage = computed(() => mobileOpt.memoryUsage.value)
const memoryPercentage = computed(() => Math.round(memoryUsage.value * 100))
const updateRate = computed(() => gameLoop.currentUpdateFrequency)

const isPerformanceWarning = computed(() => currentFPS.value < 45 || memoryUsage.value > 0.7)
const isPerformanceCritical = computed(() => currentFPS.value < 30 || memoryUsage.value > 0.9)

const statusColor = computed(() => {
  if (isPerformanceCritical.value) return 'critical'
  if (isPerformanceWarning.value) return 'warning'
  return 'good'
})

const statusText = computed(() => {
  if (isPerformanceCritical.value) return 'Critical'
  if (isPerformanceWarning.value) return 'Warning'
  return 'Good'
})

const fpsClass = computed(() => {
  const fps = currentFPS.value
  if (fps < 30) return 'metric-critical'
  if (fps < 45) return 'metric-warning'
  return 'metric-good'
})

const memoryClass = computed(() => {
  const usage = memoryUsage.value
  if (usage > 0.9) return 'metric-critical'
  if (usage > 0.7) return 'metric-warning'
  return 'metric-good'
})

const deviceType = computed(() => {
  const device = mobileOpt.deviceInfo.value
  if (device.isMobile) return device.platform === 'ios' ? 'iPhone/iPad' : 'Android Mobile'
  if (device.isTablet) return 'Tablet'
  return 'Desktop'
})

const screenInfo = computed(() => {
  const device = mobileOpt.deviceInfo.value
  return `${device.screenSize} (${device.pixelRatio}x)`
})

const connectionType = computed(() => mobileOpt.deviceInfo.value.connectionType)

const shouldDisableParticles = computed(() => mobileOpt.shouldDisableParticles.value)

const isPerformanceMode = computed(() => {
  const settings = localSettings.value
  return !settings.particlesEnabled && 
         !settings.backgroundEffectsEnabled && 
         !settings.complexShadowsEnabled
})

const canEnableQuality = computed(() => {
  return !mobileOpt.isLowEndDevice.value && 
         !mobileOpt.shouldReduceEffects.value && 
         currentFPS.value > 45
})

const performanceTips = computed(() => {
  const tips = []
  
  if (mobileOpt.isMobile.value) {
    tips.push('Close background apps to improve performance')
    tips.push('Lower screen brightness to save battery')
  }
  
  if (isPerformanceWarning.value) {
    tips.push('Disable particles and background effects')
    tips.push('Switch to performance mode')
  }
  
  if (memoryUsage.value > 0.8) {
    tips.push('Clear browser cache and refresh the page')
    tips.push('Close other browser tabs')
  }
  
  if (mobileOpt.deviceInfo.value.connectionType === 'slow') {
    tips.push('Enable reduced data mode')
    tips.push('Increase auto-save interval')
  }
  
  return tips
})

// Methods
function updateOptimizations() {
  mobileOpt.updateSettings(localSettings.value)
}

function enablePerformanceMode() {
  mobileOpt.enablePerformanceMode()
  localSettings.value = { ...mobileOpt.mobileSettings.value }
}

function enableQualityMode() {
  if (canEnableQuality.value) {
    mobileOpt.enableQualityMode()
    localSettings.value = { ...mobileOpt.mobileSettings.value }
  }
}

// Watch for settings changes
watch(() => mobileOpt.mobileSettings.value, (newSettings) => {
  localSettings.value = { ...newSettings }
}, { deep: true })

// Auto-show on performance issues
watch(isPerformanceWarning, (warning) => {
  if (warning && props.autoHide && props.showOnWarning) {
    expanded.value = true
  }
})

onMounted(() => {
  // Show monitor briefly on mobile devices
  if (mobileOpt.isMobile.value) {
    setTimeout(() => {
      expanded.value = true
      setTimeout(() => {
        if (props.autoHide) expanded.value = false
      }, 3000)
    }, 1000)
  }
})
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  min-width: 200px;
  max-width: 350px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  font-size: 12px;
}

.monitor-warning {
  border-color: var(--accent-orange);
  box-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
}

.monitor-critical {
  border-color: var(--accent-red);
  box-shadow: 0 0 10px rgba(255, 7, 58, 0.5);
  animation: monitor-pulse 2s ease-in-out infinite;
}

@keyframes monitor-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.monitor-header {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid var(--border-secondary);
}

.monitor-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-green);
}

.status-indicator.warning {
  background: var(--accent-orange);
}

.status-indicator.critical {
  background: var(--accent-red);
  animation: indicator-blink 1s ease-in-out infinite;
}

@keyframes indicator-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.status-text {
  font-weight: 600;
  color: var(--text-primary);
}

.monitor-toggle {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 12px;
}

.monitor-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.monitor-content h4 {
  margin: 0 0 8px 0;
  font-size: 11px;
  color: var(--accent-blue);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Metrics Section */
.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.metric-label {
  color: var(--text-muted);
  font-size: 10px;
}

.metric-value {
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
  color: var(--text-primary);
}

.metric-good { color: var(--accent-green); }
.metric-warning { color: var(--accent-orange); }
.metric-critical { color: var(--accent-red); }

/* Device Section */
.device-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.device-item {
  display: flex;
  justify-content: space-between;
}

.device-label {
  color: var(--text-muted);
  font-size: 10px;
}

.device-value {
  color: var(--text-primary);
  font-size: 10px;
}

/* Settings Section */
.optimization-toggles {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle-item input[type="checkbox"] {
  margin: 0;
}

.toggle-label {
  color: var(--text-primary);
  font-size: 11px;
}

.toggle-disabled {
  color: var(--text-muted);
  font-size: 10px;
  font-style: italic;
}

/* Actions Section */
.actions-section {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-blue);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.performance-btn {
  border-color: var(--accent-orange);
}

.quality-btn {
  border-color: var(--accent-green);
}

/* Tips Section */
.tips-list {
  margin: 0;
  padding-left: 16px;
  color: var(--text-secondary);
}

.tip-item {
  font-size: 10px;
  margin-bottom: 4px;
  line-height: 1.3;
}

/* Transitions */
.monitor-expand-enter-active,
.monitor-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.monitor-expand-enter-from,
.monitor-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.monitor-expand-enter-to,
.monitor-expand-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .performance-monitor {
    bottom: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .metric-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-section {
    flex-direction: column;
  }
}
</style>