<template>
  <div id="app">
    <!-- Error boundary for debugging -->
    <div v-if="initError" style="background: white; color: red; padding: 20px;">
      <h2>Initialization Error</h2>
      <p>{{ initError }}</p>
      <button @click="retryInit">Retry</button>
    </div>
    
    <template v-else>
      <ResourceHeader />
    <div class="main-container">
      <div class="tab-container">
        <div class="tab-header">
          <EnhancedButton
            v-for="tab in tabs"
            :key="tab.id"
            variant="ghost"
            size="medium"
            :class="['tab-button', { active: activeTab === tab.id }]"
            @click="handleTabChange(tab.id)"
            :animated="true"
            :particles="false"
            :glow="activeTab === tab.id"
          >
            {{ tab.name }}
          </EnhancedButton>
        </div>
        <div class="tab-content">
          <Transition name="tab-switch" mode="out-in">
            <div :key="activeTab" class="tab-panel active">
              <StarMap v-if="activeTab === 'starmap'" />
              <FilamentManager v-else-if="activeTab === 'filaments'" />
              <FilamentEvolution v-else-if="activeTab === 'evolution'" />
              <NebulaGrid v-else-if="activeTab === 'nebula'" />
              <StarPulsation v-else-if="activeTab === 'pulsation'" />
              <RailRoadNetwork v-else-if="activeTab === 'railroad'" />
              <StarMemory v-else-if="activeTab === 'memory'" />
              <UpgradeTree v-else-if="activeTab === 'upgrades'" />
              <AutomationPanel v-else-if="activeTab === 'automation'" />
              <SpecialEvents v-else-if="activeTab === 'events'" />
              <CondensationSystem v-else-if="activeTab === 'condensation'" />
              <ResetPanel v-else-if="activeTab === 'reset'" />
              <SettingsPanel v-else-if="activeTab === 'settings'" />
              <HelpSystem v-else-if="activeTab === 'help'" />
              <AchievementPanel v-else-if="activeTab === 'achievements'" />
            </div>
          </Transition>
        </div>
      </div>
      <div class="sidebar">
        <ProductionInfo />
      </div>
    </div>
    
    <!-- Achievement Notifications -->
    <AchievementNotification />
    
      <!-- Performance Monitor -->
      <PerformanceMonitor 
        :visible="showPerformanceMonitor"
        :auto-hide="true"
        :show-on-warning="true"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useGameLoopStore } from '@/stores/gameLoop'
import { useGameStore } from '@/stores/gameState'
import ResourceHeader from '@/components/ui/ResourceHeader.vue'
import EnhancedButton from '@/components/ui/EnhancedButton.vue'
import { useVisualEffects } from '@/composables/useVisualEffects'
import { useGlobalMobileOptimization } from '@/composables/useMobileOptimization'
import StarMap from '@/components/game/StarMap.vue'
import FilamentManager from '@/components/game/FilamentManager.vue'
import NebulaGrid from '@/components/game/NebulaGrid.vue'
import StarPulsation from '@/components/game/StarPulsation.vue'
import RailRoadNetwork from '@/components/game/RailRoadNetwork.vue'
import StarMemory from '@/components/game/StarMemory.vue'
import UpgradeTree from '@/components/game/UpgradeTree.vue'
import FilamentEvolution from '@/components/game/FilamentEvolution.vue'
import AutomationPanel from '@/components/game/AutomationPanel.vue'
import SpecialEvents from '@/components/game/SpecialEvents.vue'
import CondensationSystem from '@/components/game/CondensationSystem.vue'
import ResetPanel from '@/components/game/ResetPanel.vue'
import SettingsPanel from '@/components/ui/SettingsPanel.vue'
import HelpSystem from '@/components/ui/HelpSystem.vue'
import AchievementPanel from '@/components/game/AchievementPanel.vue'
import AchievementNotification from '@/components/ui/AchievementNotification.vue'
import ProductionInfo from '@/components/ui/ProductionInfo.vue'
import PerformanceMonitor from '@/components/ui/PerformanceMonitor.vue'

// Initialize with error handling
let gameLoopStore: any
let animate: any
let mobileOpt: any
const gameStore = useGameStore()

try {
  // Initialize game loop store (auto-starts the game)
  gameLoopStore = useGameLoopStore()
  const visualEffects = useVisualEffects()
  animate = visualEffects.animate
  mobileOpt = useGlobalMobileOptimization()
} catch (error) {
  console.error('Initialization error:', error)
  initError.value = error.message || 'Failed to initialize application'
}

const activeTab = ref('starmap')
const showPerformanceMonitor = ref(false)
const initError = ref<string | null>(null)

// Apply mobile optimization classes on mount
onMounted(() => {
  if (!mobileOpt) {
    console.error('Mobile optimization not available')
    return
  }
  
  try {
    // Debug mobile optimization
    console.log('Mobile Optimization Debug:', {
      deviceInfo: mobileOpt.deviceInfo.value,
      shouldDisableParticles: mobileOpt.shouldDisableParticles.value,
      particlesEnabled: mobileOpt.particlesEnabled.value
    })
    
    // Performance monitoring setup
    const deviceInfo = mobileOpt.deviceInfo.value
    if (deviceInfo.isMobile || deviceInfo.isLowEndDevice) {
      console.log('Mobile optimizations enabled', {
        device: deviceInfo.platform,
        isLowEnd: deviceInfo.isLowEndDevice,
        screenSize: deviceInfo.screenSize,
        connection: deviceInfo.connectionType
      })
      
      // Show performance monitor on mobile devices initially
      showPerformanceMonitor.value = true
      setTimeout(() => {
        showPerformanceMonitor.value = false
      }, 5000)
    }
  } catch (error) {
    console.error('Error in mobile optimization setup:', error)
  }
  
  // Show performance monitor in development or for debugging
  if (import.meta.env.DEV) {
    // Toggle performance monitor with Ctrl+Shift+P
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        showPerformanceMonitor.value = !showPerformanceMonitor.value
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
  }
})

async function handleTabChange(tabId: string) {
  if (activeTab.value === tabId) return
  
  activeTab.value = tabId
  
  // Add tab switch effect (only if animate is available)
  if (animate) {
    const tabContent = document.querySelector('.tab-content')
    if (tabContent) {
      await animate(tabContent as HTMLElement, 'slideIn')
    }
  }
}

function retryInit() {
  window.location.reload()
}

// Define all tabs with visibility conditions
const allTabs = [
  { id: 'starmap', name: 'Star Map', visible: () => true },
  { id: 'filaments', name: 'Cosmic Filaments', visible: () => true },
  { id: 'evolution', name: 'Evolution', visible: () => gameStore.starlight.amount.gte(5) },
  { id: 'nebula', name: 'Nebula Grid', visible: () => gameStore.starlight.amount.gte(1) },
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
]

// Computed tabs - only show visible ones
const tabs = computed(() => {
  try {
    return allTabs.filter(tab => {
      try {
        return tab.visible()
      } catch (error) {
        console.warn(`Error checking tab visibility for ${tab.id}:`, error)
        return false
      }
    })
  } catch (error) {
    console.error('Error computing visible tabs:', error)
    return allTabs.filter(tab => tab.id === 'starmap' || tab.id === 'filaments')
  }
})
</script>

<style scoped>
.main-container {
  max-width: 1800px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 20px;
}

.tab-container {
  background: rgba(22, 33, 62, 0.8);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
}

.tab-header {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid var(--border-primary);
}

.tab-button {
  flex: 1;
  min-width: 140px;
  padding: 12px 16px;
  font-family: 'Exo 2', sans-serif;
  font-size: 12px;
  font-weight: 600;
  border-right: 1px solid var(--border-secondary);
  border-radius: 0;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.tab-button:last-child {
  border-right: none;
}

.tab-button.active {
  background: linear-gradient(135deg, rgba(0, 180, 216, 0.2), rgba(114, 9, 183, 0.1)) !important;
  color: var(--accent-blue) !important;
  box-shadow: inset 0 -3px 0 var(--accent-blue), 0 0 15px rgba(0, 180, 216, 0.3);
  transform: translateY(-1px);
}

.tab-button:hover:not(.active) {
  background: rgba(255, 255, 255, 0.05) !important;
  color: var(--text-primary) !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.tab-content {
  padding: 20px;
  min-height: 700px;
  max-height: 700px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.tab-panel {
  animation: page-enter 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
}

/* Tab transition animations */
.tab-switch-enter-active,
.tab-switch-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.tab-switch-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.tab-switch-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.tab-switch-enter-to,
.tab-switch-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.sidebar {
  background: rgba(22, 33, 62, 0.8);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 20px;
}

@media (max-width: 1200px) {
  .main-container {
    grid-template-columns: 1fr;
    padding: 15px;
    gap: 15px;
  }
  
  .sidebar {
    margin-top: 0;
  }
  
  .tab-header {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .tab-button {
    min-width: 100px;
    flex-shrink: 0;
  }
}

/* Enhanced mobile responsiveness */
@media (max-width: 640px) {
  .main-container {
    padding: 10px;
    gap: 10px;
  }
  
  .tab-content {
    padding: 15px;
    max-height: 60vh;
    min-height: 60vh;
  }
  
  .tab-button {
    padding: 10px 8px;
    font-size: 11px;
    min-width: 90px;
  }
}

/* Landscape mobile optimization */
@media (max-width: 768px) and (orientation: landscape) {
  .main-container {
    grid-template-columns: 1fr 300px;
  }
  
  .tab-content {
    max-height: 50vh;
    min-height: 50vh;
  }
}</style>