<template>
  <div class="game-settings">
    <h2 class="section-title">Game Settings</h2>
    
    <div class="settings-container">
      
      <!-- Performance Settings -->
      <div class="settings-section">
        <h3 class="subsection-title">Performance</h3>
        
        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="settings.particlesEnabled"
              @change="updateSettings"
            />
            <span class="checkmark"></span>
            Enable Particle Effects
          </label>
          <p class="setting-description">Visual particle effects for actions and achievements</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="settings.animationsEnabled"
              @change="updateSettings"
            />
            <span class="checkmark"></span>
            Enable Animations
          </label>
          <p class="setting-description">Smooth transitions and UI animations</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="settings.backgroundEffectsEnabled"
              @change="updateSettings"
            />
            <span class="checkmark"></span>
            Background Effects
          </label>
          <p class="setting-description">Ambient background visual effects</p>
        </div>
        
        <div class="setting-item">
          <div class="setting-label">Auto-save Frequency</div>
          <select v-model="settings.autoSaveInterval" @change="updateSettings" class="setting-select">
            <option value="10000">10 seconds</option>
            <option value="30000">30 seconds</option>
            <option value="60000">1 minute</option>
            <option value="300000">5 minutes</option>
          </select>
          <p class="setting-description">How often the game saves automatically</p>
        </div>
      </div>
      
      <!-- Display Settings -->
      <div class="settings-section">
        <h3 class="subsection-title">Display</h3>
        
        <div class="setting-item">
          <div class="setting-label">Number Format</div>
          <select v-model="settings.numberFormat" @change="updateSettings" class="setting-select">
            <option value="scientific">Scientific (1.23e4)</option>
            <option value="engineering">Engineering (12.3K)</option>
            <option value="mixed">Mixed</option>
          </select>
          <p class="setting-description">How large numbers are displayed</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="settings.showTooltips"
              @change="updateSettings"
            />
            <span class="checkmark"></span>
            Show Tooltips
          </label>
          <p class="setting-description">Helpful information when hovering over elements</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="settings.compactMode"
              @change="updateSettings"
            />
            <span class="checkmark"></span>
            Compact Mode
          </label>
          <p class="setting-description">Reduce spacing for smaller screens</p>
        </div>
      </div>
      
      <!-- Notifications -->
      <div class="settings-section">
        <h3 class="subsection-title">Notifications</h3>
        
        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="settings.achievementNotifications"
              @change="updateSettings"
            />
            <span class="checkmark"></span>
            Achievement Notifications
          </label>
          <p class="setting-description">Show notifications when achievements are unlocked</p>
        </div>
        
        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="settings.milestoneNotifications"
              @change="updateSettings"
            />
            <span class="checkmark"></span>
            Milestone Notifications
          </label>
          <p class="setting-description">Show notifications for important milestones</p>
        </div>
        
        <div class="setting-item">
          <div class="setting-label">Notification Duration</div>
          <select v-model="settings.notificationDuration" @change="updateSettings" class="setting-select">
            <option value="3000">3 seconds</option>
            <option value="5000">5 seconds</option>
            <option value="7000">7 seconds</option>
            <option value="10000">10 seconds</option>
          </select>
          <p class="setting-description">How long notifications stay visible</p>
        </div>
      </div>
      
      <!-- Save/Load -->
      <div class="settings-section">
        <h3 class="subsection-title">Save & Load</h3>
        
        <div class="setting-actions">
          <EnhancedButton
            @click="exportSave"
            variant="primary"
            size="medium"
            :clickEffect="true"
          >
            Export Save
          </EnhancedButton>
          
          <EnhancedButton
            @click="importSave"
            variant="secondary"
            size="medium"
            :clickEffect="true"
          >
            Import Save
          </EnhancedButton>
          
          <EnhancedButton
            @click="saveGame"
            variant="ghost"
            size="medium"
            :clickEffect="true"
          >
            Save Now
          </EnhancedButton>
        </div>
        
        <div class="setting-item danger-zone">
          <div class="setting-label danger">Danger Zone</div>
          <EnhancedButton
            @click="resetGame"
            variant="warning"
            size="medium"
          >
            Reset All Progress
          </EnhancedButton>
          <p class="setting-description">⚠️ This will permanently delete all progress!</p>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameState'
import EnhancedButton from '@/components/ui/EnhancedButton.vue'

const gameStore = useGameStore()

const settings = ref({
  particlesEnabled: true,
  animationsEnabled: true,
  backgroundEffectsEnabled: true,
  autoSaveInterval: 30000,
  numberFormat: 'scientific',
  showTooltips: true,
  compactMode: false,
  achievementNotifications: true,
  milestoneNotifications: true,
  notificationDuration: 5000
})

onMounted(() => {
  loadSettings()
})

function loadSettings() {
  const savedSettings = localStorage.getItem('aetherSettings')
  if (savedSettings) {
    try {
      Object.assign(settings.value, JSON.parse(savedSettings))
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }
}

function updateSettings() {
  try {
    localStorage.setItem('aetherSettings', JSON.stringify(settings.value))
    
    // Apply settings changes to global systems if needed
    applySettings()
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

function applySettings() {
  // Apply settings to relevant systems
  if (settings.value.compactMode) {
    document.body.classList.add('compact-mode')
  } else {
    document.body.classList.remove('compact-mode')
  }
}

function exportSave() {
  try {
    const saveData = gameStore.save()
    const blob = new Blob([saveData], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aether-save-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export save:', error)
    alert('Failed to export save file!')
  }
}

function importSave() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.txt'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const saveData = e.target?.result as string
          if (gameStore.load(saveData)) {
            alert('Save loaded successfully!')
            location.reload()
          } else {
            alert('Failed to load save file! The file may be corrupted.')
          }
        } catch (error) {
          console.error('Failed to import save:', error)
          alert('Failed to import save file!')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

function saveGame() {
  try {
    gameStore.save()
    // Show brief confirmation
    const notification = document.createElement('div')
    notification.textContent = 'Game Saved!'
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--accent-green);
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      z-index: 10000;
    `
    document.body.appendChild(notification)
    setTimeout(() => notification.remove(), 2000)
  } catch (error) {
    console.error('Failed to save game:', error)
  }
}

function resetGame() {
  const confirmText = 'DELETE ALL PROGRESS'
  const userInput = prompt(`This will permanently delete ALL progress!\n\nType "${confirmText}" to confirm:`)
  
  if (userInput === confirmText) {
    try {
      gameStore.reset()
      localStorage.removeItem('aetherSettings')
      alert('All progress has been reset.')
      location.reload()
    } catch (error) {
      console.error('Failed to reset game:', error)
      alert('Failed to reset game!')
    }
  }
}
</script>

<style scoped>
.game-settings {
  height: 100%;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.settings-container {
  display: grid;
  gap: 30px;
}

.settings-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 20px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-green);
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 5px;
}

.setting-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid var(--border-secondary);
  border-radius: 3px;
  position: relative;
  transition: all 0.3s ease;
}

.setting-label input[type="checkbox"]:checked + .checkmark {
  background: var(--accent-green);
  border-color: var(--accent-green);
}

.setting-label input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: -2px;
  left: 2px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.setting-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  color: var(--text-primary);
  padding: 8px 12px;
  font-size: 14px;
  width: 100%;
  max-width: 200px;
}

.setting-select:focus {
  outline: none;
  border-color: var(--accent-blue);
}

.setting-description {
  font-size: 12px;
  color: var(--text-muted);
  margin: 5px 0 0 0;
  line-height: 1.4;
}

.setting-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.danger-zone {
  border-top: 1px solid rgba(255, 107, 53, 0.3);
  padding-top: 20px;
  margin-top: 20px;
}

.setting-label.danger {
  color: var(--accent-red);
  font-weight: 600;
}

@media (max-width: 768px) {
  .setting-actions {
    flex-direction: column;
  }
  
  .setting-select {
    max-width: none;
  }
}
</style>