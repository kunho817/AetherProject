<template>
  <div id="app">
    <div style="background: white; color: black; padding: 20px;">
      <h1>Aether Test - Mobile Debug</h1>
      <p>If you can see this, the app is rendering correctly.</p>
      
      <div>
        <h2>Device Info:</h2>
        <pre>{{ deviceInfo }}</pre>
      </div>
      
      <div>
        <h2>Mobile Settings:</h2>
        <pre>{{ mobileSettings }}</pre>
      </div>
      
      <div>
        <h2>Screen Classes:</h2>
        <pre>{{ screenClasses }}</pre>
      </div>
      
      <button @click="testClick">Test Button</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMobileOptimization } from '@/composables/useMobileOptimization'

const mobileOpt = useMobileOptimization()

const deviceInfo = computed(() => JSON.stringify(mobileOpt.deviceInfo.value, null, 2))
const mobileSettings = computed(() => JSON.stringify(mobileOpt.mobileSettings.value, null, 2))
const screenClasses = computed(() => JSON.stringify(mobileOpt.screenSizeClass.value, null, 2))

function testClick() {
  alert('Button clicked! App is interactive.')
}
</script>

<style>
#app {
  min-height: 100vh;
  background: #f0f0f0;
  padding: 20px;
}
</style>