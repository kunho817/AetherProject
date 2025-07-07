<template>
  <div id="app" style="background: white; color: black; min-height: 100vh; padding: 20px;">
    <h1>Aether - Minimal Test</h1>
    <p>This is a minimal version to test if the app renders.</p>
    
    <div style="margin-top: 20px; padding: 20px; border: 1px solid #ccc;">
      <h2>Basic Game State</h2>
      <p>Stardust: {{ stardust }}</p>
      <button @click="addStardust" style="padding: 10px; background: #007bff; color: white; border: none; cursor: pointer;">
        Add Stardust
      </button>
    </div>
    
    <div style="margin-top: 20px; padding: 20px; border: 1px solid #ccc;">
      <h2>Mobile Detection Status</h2>
      <p v-if="mobileError" style="color: red;">Mobile detection error: {{ mobileError }}</p>
      <div v-else>
        <p>Mobile optimization loaded successfully</p>
        <p>Device type: {{ deviceType }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/gameState'

const gameStore = useGameStore()
const { stardust } = storeToRefs(gameStore)

const mobileError = ref<string | null>(null)
const deviceType = ref('Unknown')

// Test mobile optimization with error handling
try {
  const { useMobileOptimization } = require('@/composables/useMobileOptimization')
  const mobileOpt = useMobileOptimization()
  deviceType.value = mobileOpt.isMobile.value ? 'Mobile' : 'Desktop'
} catch (error) {
  mobileError.value = error.message
  console.error('Mobile optimization error:', error)
}

function addStardust() {
  // Simple test function
  console.log('Adding stardust...')
}
</script>