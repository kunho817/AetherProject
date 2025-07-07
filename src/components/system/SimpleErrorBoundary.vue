<template>
  <div v-if="!hasError">
    <slot />
  </div>
  
  <div v-else class="error-fallback">
    <div class="error-content">
      <h3>⚠️ Something went wrong</h3>
      <p>{{ errorMessage }}</p>
      <div class="error-actions">
        <button @click="retry" class="retry-btn">Try Again</button>
        <button @click="reload" class="reload-btn">Reload Page</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

interface Props {
  componentName?: string
}

const props = withDefaults(defineProps<Props>(), {
  componentName: 'Component'
})

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((error: Error) => {
  console.error(`Error in ${props.componentName}:`, error)
  hasError.value = true
  errorMessage.value = error.message || 'An unexpected error occurred'
  return false
})

function retry() {
  hasError.value = false
  errorMessage.value = ''
}

function reload() {
  window.location.reload()
}
</script>

<style scoped>
.error-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 20px;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 8px;
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-content h3 {
  color: var(--accent-red);
  margin-bottom: 12px;
}

.error-content p {
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-size: 14px;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.retry-btn, .reload-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.retry-btn {
  background: var(--accent-blue);
  color: white;
}

.reload-btn {
  background: var(--accent-orange);
  color: white;
}

.retry-btn:hover, .reload-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
</style>