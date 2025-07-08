<template>
  <div id="app">
    <!-- Error boundary for debugging -->
    <div v-if="initError" class="error-container">
      <h2>Initialization Error</h2>
      <p>{{ initError }}</p>
      <button @click="retryInit" class="retry-button">Retry</button>
    </div>
    
    <template v-else>
      <!-- Game Header -->
      <GameHeader @openSettings="showSettings = true" />
      
      <!-- Main Content Container -->
      <div class="main-container">
        
        <!-- Primary Game Content -->
        <div class="game-content">
          <LayerSystem v-slot="{ currentLayer }" @layerChanged="handleLayerChange">
            
            <!-- Glare Layer Content -->
            <template v-if="currentLayer === 'glare'">
              <TabContainer
                :tabs="glareTabs"
                defaultTab="starmap"
                @tabChanged="handleTabChange"
                v-slot="{ activeTab }"
              >
                <TabPanel tabId="starmap" :activeTab="activeTab">
                  <StarMap />
                </TabPanel>
                
                <TabPanel tabId="filaments" :activeTab="activeTab">
                  <FilamentManager />
                </TabPanel>
                
                <TabPanel tabId="evolution" :activeTab="activeTab">
                  <FilamentEvolution />
                </TabPanel>
                
                <TabPanel tabId="nebula" :activeTab="activeTab">
                  <NebulaCoordination />
                </TabPanel>
                
                <TabPanel tabId="pulsation" :activeTab="activeTab">
                  <StarPulsation />
                </TabPanel>
                
                <TabPanel tabId="railroad" :activeTab="activeTab">
                  <RailRoadNetwork />
                </TabPanel>
                
                <TabPanel tabId="memory" :activeTab="activeTab">
                  <StarMemory />
                </TabPanel>
                
                <TabPanel tabId="upgrades" :activeTab="activeTab">
                  <UpgradeTree />
                </TabPanel>
                
                <TabPanel tabId="automation" :activeTab="activeTab">
                  <AutomationSystem />
                </TabPanel>
                
                <TabPanel tabId="events" :activeTab="activeTab">
                  <SpecialEvents />
                </TabPanel>
                
                <TabPanel tabId="condensation" :activeTab="activeTab">
                  <CondensationSystem />
                </TabPanel>
                
                <TabPanel tabId="reset" :activeTab="activeTab">
                  <ResetSystem />
                </TabPanel>
                
                <TabPanel tabId="settings" :activeTab="activeTab">
                  <GameSettings />
                </TabPanel>
                
                <TabPanel tabId="help" :activeTab="activeTab">
                  <HelpSystem />
                </TabPanel>
                
                <TabPanel tabId="achievements" :activeTab="activeTab">
                  <AchievementSystem />
                </TabPanel>
              </TabContainer>
            </template>
            
            <!-- Nova Layer Content (Future) -->
            <template v-else-if="currentLayer === 'nova'">
              <div class="layer-placeholder">
                <h2>Nova Layer</h2>
                <p>Coming soon! The Nova Layer will introduce new mechanics and challenges.</p>
              </div>
            </template>
            
            <!-- Other Layers Placeholder -->
            <template v-else>
              <div class="layer-placeholder">
                <h2>{{ currentLayer }} Layer</h2>
                <p>This layer is not yet implemented.</p>
              </div>
            </template>
            
          </LayerSystem>
        </div>
        
        <!-- Side Panel -->
        <div class="side-panel" @mouseenter="handleSidePanelHover(true)" @mouseleave="handleSidePanelHover(false)">
          <div class="panel-section production-info-section" :class="{ 'expanded': showProductionInfo }">
            <h3 class="panel-title clickable" @click="toggleProductionInfo">
              Production Info
              <span class="expand-icon" :class="{ 'rotated': showProductionInfo }">▼</span>
            </h3>
            <div class="production-info-container" :class="{ 'visible': showProductionInfo }">
              <ProductionInfo />
            </div>
          </div>
          
          <div class="panel-section">
            <h3 class="panel-title">Quick Actions</h3>
            <div class="quick-actions">
              <EnhancedButton
                v-if="gameStore.canStarburst"
                variant="primary"
                size="medium"
                @click="performStarburst"
                :particles="true"
                :glow="true"
              >
                Starburst
              </EnhancedButton>
              
              <EnhancedButton
                v-if="gameStore.canGetStarlight"
                variant="secondary"
                size="medium"
                @click="performStarlightReset"
                :particles="true"
                :glow="true"
              >
                Get Starlight
              </EnhancedButton>
              
              <EnhancedButton
                variant="ghost"
                size="small"
                @click="saveGame"
                :clickEffect="true"
              >
                Save Game
              </EnhancedButton>
            </div>
          </div>
          
          <div class="panel-section" v-if="showPerformanceMonitor">
            <h3 class="panel-title">Performance</h3>
            <PerformanceMonitor />
          </div>
        </div>
      </div>
    </template>
    
    <!-- Achievement Notifications -->
    <AchievementNotification />
    
    <!-- Settings Modal -->
    <SettingsModal v-if="showSettings" @close="showSettings = false" />
    
    <!-- Performance Monitor Toggle -->
    <button
      v-if="!showPerformanceMonitor"
      class="performance-toggle"
      @click="showPerformanceMonitor = true"
      title="Show Performance Monitor"
    >
      📊
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameState'
import { useGameLoopStore } from '@/stores/gameLoop'
import { mobileOptimizer } from '@/utils/mobileOptimization'
import { useVisualEffects } from '@/composables/useVisualEffects'
// Temporarily disabled: import { useErrorHandler } from '@/composables/useErrorHandler'

// Layout Components
import GameHeader from '@/components/layout/GameHeader.vue'
import LayerSystem from '@/components/layout/LayerSystem.vue'
import TabContainer from '@/components/ui/TabContainer.vue'
import TabPanel from '@/components/ui/TabPanel.vue'

// Game Components
import StarMap from '@/components/game/StarMap.vue'
import FilamentManager from '@/components/game/FilamentManager.vue'
import FilamentEvolution from '@/components/game/FilamentEvolution.vue'
import NebulaCoordination from '@/components/game/NebulaCoordination.vue'
import StarPulsation from '@/components/game/StarPulsation.vue'
import RailRoadNetwork from '@/components/game/RailRoadNetwork.vue'
import StarMemory from '@/components/game/StarMemory.vue'
import UpgradeTree from '@/components/game/UpgradeTree.vue'
import AutomationSystem from '@/components/game/AutomationSystem.vue'
import SpecialEvents from '@/components/game/SpecialEvents.vue'
import CondensationSystem from '@/components/game/CondensationSystem.vue'
import ResetSystem from '@/components/game/ResetSystem.vue'

// UI Components
import ProductionInfo from '@/components/ui/ProductionInfo.vue'
import EnhancedButton from '@/components/ui/EnhancedButton.vue'
import AchievementNotification from '@/components/ui/AchievementNotification.vue'
import PerformanceMonitor from '@/components/ui/PerformanceMonitor.vue'

// System Components
import GameSettings from '@/components/system/GameSettings.vue'
import HelpSystem from '@/components/ui/HelpSystem.vue'
import AchievementSystem from '@/components/game/AchievementPanel.vue'
import SettingsModal from '@/components/system/SettingsModal.vue'
// Temporarily disabled: import ErrorBoundary from '@/components/system/ErrorBoundary.vue'

// Initialize stores and utilities
const gameStore = useGameStore()
// const errorHandler = useErrorHandler()

try {
  useGameLoopStore()
  useVisualEffects()
  
  // Store global reference for emergency saves
  ;(window as any).__game_store__ = gameStore
} catch (error) {
  console.error('Initialization error:', error)
  // errorHandler.handleError(error as Error, {
  //   componentName: 'App',
  //   action: 'Initialization'
  // })
}

// UI State
const showSettings = ref(false)
const showPerformanceMonitor = ref(false)
const initError = ref<string | null>(null)
const showProductionInfo = ref(false)
const productionInfoHoverTimeout = ref<number | null>(null)

// Define Glare Layer tabs with visibility conditions
const glareTabs = computed(() => [
  { id: 'starmap', name: 'Star Map', visible: () => true },
  { id: 'filaments', name: 'Cosmic Filaments', visible: () => true },
  { id: 'evolution', name: 'Evolution', visible: () => gameStore.starlight.amount.gte(5) },
  { id: 'nebula', name: 'Nebula Coordination', visible: () => gameStore.starlight.amount.gte(1) },
  { id: 'pulsation', name: 'Star Pulsation', visible: () => gameStore.starlight.amount.gte(2) },
  { id: 'railroad', name: 'Rail Road', visible: () => gameStore.starlight.amount.gte(8) },
  { id: 'memory', name: 'Star Memory', visible: () => gameStore.starlight.amount.gte(3) },
  { id: 'upgrades', name: 'Upgrade Tree', visible: () => gameStore.starlight.amount.gte(1) },
  { id: 'automation', name: 'Automation', visible: () => gameStore.starlight.amount.gte(15) },
  { id: 'events', name: 'Special Events', visible: () => gameStore.starlight.amount.gte(15) },
  { id: 'condensation', name: 'Condensation', visible: () => gameStore.starlight.amount.gte(20) },
  { id: 'reset', name: 'Reset', visible: () => true },
  { id: 'settings', name: 'Settings', visible: () => true },
  { id: 'help', name: 'Help', visible: () => true },
  { id: 'achievements', name: 'Achievements', visible: () => true }
])

// Event Handlers
function retryInit() {
  window.location.reload()
}

function handleLayerChange(layerId: string) {
  console.log('Layer changed to:', layerId)
}

function handleTabChange(tabId: string) {
  console.log('Tab changed to:', tabId)
}

function toggleProductionInfo() {
  showProductionInfo.value = !showProductionInfo.value
}

function handleSidePanelHover(isHovering: boolean) {
  if (productionInfoHoverTimeout.value) {
    clearTimeout(productionInfoHoverTimeout.value)
    productionInfoHoverTimeout.value = null
  }
  
  if (isHovering) {
    // Show production info immediately on hover
    productionInfoHoverTimeout.value = window.setTimeout(() => {
      showProductionInfo.value = true
    }, 300) // 300ms delay before showing
  } else {
    // Hide production info after delay when not hovering
    productionInfoHoverTimeout.value = window.setTimeout(() => {
      showProductionInfo.value = false
    }, 1000) // 1s delay before hiding
  }
}

function performStarburst() {
  try {
    gameStore.performStarburst()
  } catch (error) {
    console.error('Starburst error:', error)
  }
}

function performStarlightReset() {
  try {
    gameStore.performStarlightReset()
  } catch (error) {
    console.error('Starlight reset error:', error)
  }
}

function saveGame() {
  try {
    gameStore.save()
  } catch (error) {
    console.error('Save game error:', error)
  }
}

// Mobile optimization setup
onMounted(() => {
  try {
    const deviceInfo = mobileOptimizer.getDeviceInfo()
    if (deviceInfo.isMobile || deviceInfo.isLowEndDevice) {
      console.log('Mobile optimizations enabled', {
        device: deviceInfo.platform,
        isLowEnd: deviceInfo.isLowEndDevice,
        screenSize: deviceInfo.screenSize,
        connection: deviceInfo.connectionType
      })
      
      showPerformanceMonitor.value = true
      setTimeout(() => {
        showPerformanceMonitor.value = false
      }, 5000)
    }
  } catch (error) {
    console.error('Error in mobile optimization setup:', error)
  }
})
</script>

<style scoped>
#app {
  min-height: 100vh;
  background: 
    radial-gradient(ellipse at 20% 80%, rgba(114, 9, 183, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(0, 180, 216, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  font-family: 'Exo 2', sans-serif;
  color: var(--text-primary);
  overflow-x: hidden;
}

.error-container {
  background: rgba(255, 255, 255, 0.95);
  color: var(--accent-red);
  padding: 20px;
  border-radius: 8px;
  margin: 20px;
  text-align: center;
}

.retry-button {
  background: var(--accent-blue);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
}

.main-container {
  max-width: 1800px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 20px;
  min-height: calc(100vh - 120px);
}

.game-content {
  min-height: 0;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-section {
  background: rgba(22, 33, 62, 0.8);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.panel-title {
  font-size: 14px;
  color: var(--accent-green);
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.panel-title.clickable {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: color 0.3s ease;
  user-select: none;
}

.panel-title.clickable:hover {
  color: var(--accent-blue);
}

.expand-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
  opacity: 0.7;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.production-info-section {
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
}

.production-info-container {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.4s ease;
  overflow: hidden;
}

.production-info-container.visible {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}

.production-info-section.expanded {
  border-color: var(--accent-blue);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.layer-placeholder {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid var(--border-secondary);
}

.layer-placeholder h2 {
  color: var(--accent-blue);
  margin-bottom: 15px;
  font-size: 24px;
}

.layer-placeholder p {
  color: var(--text-secondary);
  font-size: 16px;
}

.performance-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid var(--border-secondary);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 18px;
  z-index: 1000;
  transition: all 0.3s ease;
}

.performance-toggle:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

@media (max-width: 1200px) {
  .main-container {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }
  
  .side-panel {
    grid-row: 2;
    flex-direction: row;
    overflow-x: auto;
  }
  
  .panel-section {
    min-width: 300px;
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 15px;
    gap: 15px;
  }
  
  .side-panel {
    flex-direction: column;
  }
  
  .panel-section {
    min-width: auto;
    padding: 15px;
  }
}
</style>