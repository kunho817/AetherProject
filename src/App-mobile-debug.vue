<template>
  <div id="app">
    <!-- Force visible debug info -->
    <div style="position: fixed; top: 0; left: 0; right: 0; background: white; color: black; padding: 10px; z-index: 9999;">
      <h3>Mobile Debug Info</h3>
      <p>App is rendering: YES</p>
      <p>Error catching active</p>
    </div>
    
    <!-- Original app content with error boundary -->
    <div style="padding-top: 100px;">
      <ResourceHeader />
      <div class="main-container">
        <div class="tab-container">
          <div class="tab-header">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="['tab-button', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              {{ tab.name }}
            </button>
          </div>
          <div class="tab-content">
            <div class="tab-panel active">
              <div v-if="activeTab === 'starmap'">
                <h2>Star Map Panel</h2>
                <p>If you see this, tabs are working</p>
              </div>
              <div v-else>
                <h2>{{ activeTab }} Panel</h2>
                <p>Tab content placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import ResourceHeader from '@/components/ui/ResourceHeader.vue'

const activeTab = ref('starmap')

const tabs = [
  { id: 'starmap', name: 'Star Map' },
  { id: 'filaments', name: 'Cosmic Filaments' },
  { id: 'settings', name: 'Settings' }
]

// Error catching
onErrorCaptured((error, instance, info) => {
  console.error('Component error:', error)
  console.error('Error info:', info)
  console.error('Instance:', instance)
  
  // Show error in UI
  const errorDiv = document.createElement('div')
  errorDiv.style.cssText = 'position: fixed; bottom: 0; left: 0; right: 0; background: red; color: white; padding: 10px; z-index: 9999;'
  errorDiv.textContent = `Error: ${error.message}`
  document.body.appendChild(errorDiv)
  
  return false // Prevent error propagation
})
</script>

<style>
#app {
  background: #1a1a2e;
  color: white;
  min-height: 100vh;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tab-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
}

.tab-header {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab-button {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  border-radius: 4px;
}

.tab-button.active {
  background: rgba(0, 180, 216, 0.3);
  border-color: #00b4d8;
}

.tab-content {
  min-height: 400px;
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  border-radius: 4px;
}
</style>