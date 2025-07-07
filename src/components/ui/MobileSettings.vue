<template>
  <div class="mobile-settings">
    <div class="settings-section">
      <h3>Mobile Performance</h3>
      <p class="section-description">
        Optimize the game for your device to improve performance and battery life.
      </p>
      
      <!-- Device Information -->
      <div class="device-info-card">
        <h4>Device Information</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Device Type:</span>
            <span class="info-value">{{ deviceTypeText }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Performance:</span>
            <span class="info-value" :class="performanceClass">{{ performanceText }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Screen Size:</span>
            <span class="info-value">{{ screenSizeText }}</span>
          </div>
          <div class="info-item" v-if="connectionSpeed !== 'unknown'">
            <span class="info-label">Connection:</span>
            <span class="info-value">{{ connectionSpeed }}</span>
          </div>
        </div>
      </div>
      
      <!-- Performance Mode Toggle -->
      <div class="performance-mode-card">
        <h4>Performance Mode</h4>
        <p class="card-description">
          Automatically optimize settings based on your device's performance.
        </p>
        
        <div class="mode-buttons">
          <button 
            class="mode-btn"
            :class="{ active: currentMode === 'auto' }"
            @click="setMode('auto')"
          >
            <div class="mode-icon">🎯</div>
            <div class="mode-info">
              <div class="mode-name">Auto</div>
              <div class="mode-desc">Adaptive settings</div>
            </div>
          </button>
          
          <button 
            class="mode-btn"
            :class="{ active: currentMode === 'performance' }"
            @click="setMode('performance')"
          >
            <div class="mode-icon">⚡</div>
            <div class="mode-info">
              <div class="mode-name">Performance</div>
              <div class="mode-desc">Maximum speed</div>
            </div>
          </button>
          
          <button 
            class="mode-btn"
            :class="{ active: currentMode === 'quality', disabled: !canUseQuality }"
            @click="setMode('quality')"
            :disabled="!canUseQuality"
          >
            <div class="mode-icon">✨</div>
            <div class="mode-info">
              <div class="mode-name">Quality</div>
              <div class="mode-desc">Best visuals</div>
            </div>
          </button>
        </div>
      </div>
      
      <!-- Manual Settings -->
      <div class="manual-settings-card">
        <h4>Manual Settings</h4>
        <p class="card-description">
          Fine-tune individual settings for your preferences.
        </p>
        
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Particle Effects</label>
              <span class="setting-desc">Visual particle animations</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                v-model="localSettings.particlesEnabled"
                @change="updateSettings"
                :disabled="shouldDisableParticles"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Background Effects</label>
              <span class="setting-desc">Cosmic dust and energy lines</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                v-model="localSettings.backgroundEffectsEnabled"
                @change="updateSettings"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Complex Shadows</label>
              <span class="setting-desc">Enhanced shadow effects</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                v-model="localSettings.complexShadowsEnabled"
                @change="updateSettings"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Animations</label>
              <span class="setting-desc">UI transition animations</span>
            </div>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                v-model="localSettings.animationsEnabled"
                @change="updateSettings"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
      
      <!-- Update Frequency -->
      <div class="update-frequency-card">
        <h4>Update Frequency</h4>
        <p class="card-description">
          Lower values improve performance but reduce smoothness.
        </p>
        
        <div class="frequency-slider">
          <label class="slider-label">
            Game Speed: {{ frequencyText }}
          </label>
          <input 
            type="range" 
            min="16" 
            max="500" 
            step="16"
            v-model="updateFrequency"
            @input="updateGameFrequency"
            class="slider"
          >
          <div class="slider-marks">
            <span>60 FPS</span>
            <span>30 FPS</span>
            <span>10 FPS</span>
            <span>2 FPS</span>
          </div>
        </div>
      </div>
      
      <!-- Auto-Save Settings -->
      <div class="autosave-card">
        <h4>Auto-Save</h4>
        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">Save Interval</label>
            <span class="setting-desc">How often to save your progress</span>
          </div>
          <select 
            v-model="autoSaveInterval" 
            @change="updateAutoSave"
            class="save-select"
          >
            <option value="15000">15 seconds</option>
            <option value="30000">30 seconds</option>
            <option value="60000">1 minute</option>
            <option value="120000">2 minutes</option>
          </select>
        </div>
      </div>
      
      <!-- Battery Optimization -->
      <div class="battery-card" v-if="showBatteryOptions">
        <h4>Battery Optimization</h4>
        <p class="card-description">
          Special settings to extend battery life on mobile devices.
        </p>
        
        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">Battery Saver Mode</label>
            <span class="setting-desc">Minimal effects for longer battery life</span>
          </div>
          <label class="toggle-switch">
            <input 
              type="checkbox" 
              v-model="batterySaverMode"
              @change="updateBatterySaver"
            >
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
      
      <!-- Performance Tips -->
      <div class="tips-card" v-if="performanceTips.length > 0">
        <h4>Performance Tips</h4>
        <ul class="tips-list">
          <li v-for="tip in performanceTips" :key="tip" class="tip-item">
            {{ tip }}
          </li>
        </ul>
      </div>
      
      <!-- Reset to Defaults -->
      <div class="reset-card">
        <button class="reset-btn" @click="resetToDefaults">
          Reset to Recommended Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMobileOptimization } from '@/composables/useMobileOptimization'
import { useGameLoopStore } from '@/stores/gameLoop'

const mobileOpt = useMobileOptimization()
const gameLoop = useGameLoopStore()

// Local reactive state
const localSettings = ref({ ...mobileOpt.mobileSettings.value })
const updateFrequency = ref(gameLoop.currentUpdateFrequency)
const autoSaveInterval = ref(localSettings.value.autoSaveFrequency)
const batterySaverMode = ref(false)
const currentMode = ref<'auto' | 'performance' | 'quality'>('auto')

// Computed values
const deviceTypeText = computed(() => {
  const device = mobileOpt.deviceInfo.value
  if (device.isLowEndDevice) return `${device.isMobile ? 'Mobile' : 'Desktop'} (Low-end)`
  if (device.isMobile) return device.platform === 'ios' ? 'iPhone/iPad' : 'Android'
  if (device.isTablet) return 'Tablet'
  return 'Desktop'
})

const performanceText = computed(() => {
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

const screenSizeText = computed(() => {
  const device = mobileOpt.deviceInfo.value
  return `${device.screenSize} (${device.pixelRatio}x DPI)`
})

const connectionSpeed = computed(() => mobileOpt.deviceInfo.value.connectionType)

const shouldDisableParticles = computed(() => mobileOpt.shouldDisableParticles.value)

const canUseQuality = computed(() => 
  !mobileOpt.isLowEndDevice.value && 
  !mobileOpt.shouldReduceEffects.value &&
  mobileOpt.currentFPS.value > 45
)

const frequencyText = computed(() => {
  const freq = updateFrequency.value
  if (freq <= 16) return '60 FPS'
  if (freq <= 33) return '30 FPS'
  if (freq <= 100) return '10 FPS'
  return '2 FPS'
})

const showBatteryOptions = computed(() => mobileOpt.isMobile.value)

const performanceTips = computed(() => {
  const tips = []
  
  if (mobileOpt.isMobile.value) {
    tips.push('Close other apps running in the background')
    tips.push('Reduce screen brightness to save battery')
    tips.push('Use Wi-Fi instead of mobile data when possible')
  }
  
  if (mobileOpt.isLowPerformance.value) {
    tips.push('Enable Performance Mode for better frame rates')
    tips.push('Disable particle effects and background animations')
  }
  
  if (mobileOpt.memoryUsage.value > 0.7) {
    tips.push('Refresh the page to clear memory usage')
    tips.push('Close unused browser tabs')
  }
  
  return tips
})

// Methods
function updateSettings() {
  mobileOpt.updateSettings(localSettings.value)
  currentMode.value = 'auto' // Switch to auto when manually changing settings
}

function setMode(mode: 'auto' | 'performance' | 'quality') {
  if (mode === 'quality' && !canUseQuality.value) return
  
  currentMode.value = mode
  
  switch (mode) {
    case 'performance':
      mobileOpt.enablePerformanceMode()
      updateFrequency.value = 100 // 10 FPS
      gameLoop.setUpdateFrequency(100)
      break
      
    case 'quality':
      mobileOpt.enableQualityMode()
      updateFrequency.value = 16 // 60 FPS
      gameLoop.setUpdateFrequency(16)
      break
      
    case 'auto':
    default:
      gameLoop.enableAdaptiveMode()
      updateFrequency.value = mobileOpt.getOptimalUpdateFrequency()
      break
  }
  
  localSettings.value = { ...mobileOpt.mobileSettings.value }
}

function updateGameFrequency() {
  gameLoop.setUpdateFrequency(updateFrequency.value)
  currentMode.value = 'auto' // Switch to manual mode
}

function updateAutoSave() {
  localSettings.value.autoSaveFrequency = autoSaveInterval.value
  updateSettings()
}

function updateBatterySaver() {
  if (batterySaverMode.value) {
    // Enable battery saver mode
    document.body.classList.add('battery-saver')
    setMode('performance')
    updateFrequency.value = 200 // 5 FPS
    gameLoop.setUpdateFrequency(200)
  } else {
    // Disable battery saver mode
    document.body.classList.remove('battery-saver')
    setMode('auto')
  }
}

function resetToDefaults() {
  // Reset to optimal settings for this device
  const deviceInfo = mobileOpt.deviceInfo.value
  
  if (deviceInfo.isLowEndDevice) {
    setMode('performance')
  } else if (deviceInfo.isMobile) {
    setMode('auto')
  } else {
    setMode('quality')
  }
  
  batterySaverMode.value = false
  document.body.classList.remove('battery-saver')
  autoSaveInterval.value = deviceInfo.isMobile ? 60000 : 30000
  updateAutoSave()
}

// Watch for external settings changes
watch(() => mobileOpt.mobileSettings.value, (newSettings) => {
  localSettings.value = { ...newSettings }
}, { deep: true })

watch(() => gameLoop.currentUpdateFrequency, (newFreq) => {
  updateFrequency.value = newFreq
})
</script>

<style scoped>
.mobile-settings {
  max-width: 800px;
  margin: 0 auto;
}

.settings-section h3 {
  font-size: 20px;
  color: var(--accent-blue);
  margin-bottom: 8px;
}

.section-description {
  color: var(--text-muted);
  margin-bottom: 24px;
  line-height: 1.5;
}

/* Cards */
.device-info-card,
.performance-mode-card,
.manual-settings-card,
.update-frequency-card,
.autosave-card,
.battery-card,
.tips-card,
.reset-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.device-info-card h4,
.performance-mode-card h4,
.manual-settings-card h4,
.update-frequency-card h4,
.autosave-card h4,
.battery-card h4,
.tips-card h4 {
  font-size: 16px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.card-description {
  color: var(--text-muted);
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.4;
}

/* Device Info */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.info-label {
  color: var(--text-muted);
  font-size: 12px;
}

.info-value {
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
}

.performance-poor { color: var(--accent-red); }
.performance-fair { color: var(--accent-orange); }
.performance-good { color: var(--accent-blue); }
.performance-excellent { color: var(--accent-green); }

/* Mode Buttons */
.mode-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid var(--border-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-btn:hover:not(:disabled) {
  border-color: var(--accent-blue);
  background: rgba(255, 255, 255, 0.08);
}

.mode-btn.active {
  border-color: var(--accent-green);
  background: rgba(0, 255, 165, 0.1);
}

.mode-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mode-icon {
  font-size: 24px;
}

.mode-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.mode-desc {
  font-size: 12px;
  color: var(--text-muted);
}

/* Settings List */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-secondary);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
  margin-bottom: 4px;
}

.setting-desc {
  color: var(--text-muted);
  font-size: 12px;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-secondary);
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--accent-green);
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Frequency Slider */
.frequency-slider {
  margin-top: 16px;
}

.slider-label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--border-secondary);
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.slider:hover {
  opacity: 1;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-blue);
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-blue);
  cursor: pointer;
  border: none;
}

.slider-marks {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-muted);
}

/* Select */
.save-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 4px;
  color: var(--text-primary);
  padding: 8px 12px;
  font-size: 14px;
}

/* Tips */
.tips-list {
  margin: 0;
  padding-left: 20px;
}

.tip-item {
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.4;
}

/* Reset Button */
.reset-btn {
  width: 100%;
  padding: 12px 24px;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid var(--accent-orange);
  border-radius: 6px;
  color: var(--accent-orange);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: rgba(255, 107, 53, 0.2);
  border-color: var(--accent-orange);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .mode-buttons {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .toggle-switch {
    align-self: flex-end;
  }
}
</style>