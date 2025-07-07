<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Game Settings</h2>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body">
        <div class="settings-section">
          <h3>Performance</h3>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                v-model="settings.particlesEnabled"
                @change="updateSettings"
              />
              Enable Particle Effects
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                v-model="settings.animationsEnabled"
                @change="updateSettings"
              />
              Enable Animations
            </label>
          </div>
          <div class="setting-item">
            <label>
              Auto-save Frequency:
              <select v-model="settings.autoSaveInterval" @change="updateSettings">
                <option value="10000">10 seconds</option>
                <option value="30000">30 seconds</option>
                <option value="60000">1 minute</option>
                <option value="300000">5 minutes</option>
              </select>
            </label>
          </div>
        </div>
        
        <div class="settings-section">
          <h3>Display</h3>
          <div class="setting-item">
            <label>
              Number Format:
              <select v-model="settings.numberFormat" @change="updateSettings">
                <option value="scientific">Scientific (1.23e4)</option>
                <option value="engineering">Engineering (12.3K)</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                v-model="settings.showTooltips"
                @change="updateSettings"
              />
              Show Tooltips
            </label>
          </div>
        </div>
        
        <div class="settings-section">
          <h3>Save/Load</h3>
          <div class="setting-item">
            <button class="btn btn-primary" @click="exportSave">Export Save</button>
            <button class="btn btn-secondary" @click="importSave">Import Save</button>
          </div>
          <div class="setting-item">
            <button class="btn btn-warning" @click="resetGame">Reset Game</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameState'

defineEmits<{
  close: []
}>()

const gameStore = useGameStore()

const settings = ref({
  particlesEnabled: true,
  animationsEnabled: true,
  autoSaveInterval: 30000,
  numberFormat: 'scientific',
  showTooltips: true
})

onMounted(() => {
  // Load settings from localStorage
  const savedSettings = localStorage.getItem('aetherSettings')
  if (savedSettings) {
    Object.assign(settings.value, JSON.parse(savedSettings))
  }
})

function updateSettings() {
  localStorage.setItem('aetherSettings', JSON.stringify(settings.value))
  // Apply settings changes if needed
}

function exportSave() {
  const saveData = gameStore.save()
  const blob = new Blob([saveData], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'aether-save.txt'
  a.click()
  URL.revokeObjectURL(url)
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
        const saveData = e.target?.result as string
        if (gameStore.load(saveData)) {
          alert('Save loaded successfully!')
        } else {
          alert('Failed to load save file!')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

function resetGame() {
  if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
    gameStore.reset()
    location.reload()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  background: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-secondary);
}

.modal-header h2 {
  color: var(--accent-blue);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.modal-body {
  padding: 20px;
}

.settings-section {
  margin-bottom: 30px;
}

.settings-section h3 {
  color: var(--accent-green);
  margin-bottom: 15px;
  font-size: 16px;
}

.setting-item {
  margin-bottom: 12px;
}

.setting-item label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: 14px;
}

.setting-item input, .setting-item select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border-secondary);
  border-radius: 4px;
  color: var(--text-primary);
  padding: 6px 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.btn-primary {
  background: var(--accent-blue);
  color: white;
}

.btn-secondary {
  background: var(--accent-green);
  color: white;
}

.btn-warning {
  background: var(--accent-red);
  color: white;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style>