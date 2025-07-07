<template>
  <div v-if="!hasError" class="error-boundary">
    <slot />
  </div>
  
  <div v-else class="error-container">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">{{ errorTitle }}</h2>
      <p class="error-message">{{ errorMessage }}</p>
      
      <div v-if="showDetails" class="error-details">
        <h3>Error Details:</h3>
        <pre class="error-stack">{{ errorStack }}</pre>
        <div class="error-info">
          <div class="info-row">
            <span>Component:</span>
            <span>{{ componentName }}</span>
          </div>
          <div class="info-row">
            <span>Timestamp:</span>
            <span>{{ errorTimestamp }}</span>
          </div>
          <div class="info-row">
            <span>User Agent:</span>
            <span>{{ getUserAgent() }}...</span>
          </div>
        </div>
      </div>
      
      <div class="error-actions">
        <button 
          class="btn btn-primary" 
          @click="retry"
          :disabled="retryCount >= maxRetries"
        >
          {{ retryCount >= maxRetries ? 'Max Retries Reached' : `Retry (${retryCount}/${maxRetries})` }}
        </button>
        
        <button 
          class="btn btn-secondary" 
          @click="showDetails = !showDetails"
        >
          {{ showDetails ? 'Hide' : 'Show' }} Details
        </button>
        
        <button 
          class="btn btn-ghost" 
          @click="reportError"
        >
          Report Issue
        </button>
        
        <button 
          class="btn btn-warning" 
          @click="resetComponent"
        >
          Reset Component
        </button>
      </div>
      
      <div class="error-suggestions">
        <h3>Suggestions:</h3>
        <ul>
          <li v-for="suggestion in suggestions" :key="suggestion">
            {{ suggestion }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onErrorCaptured, onMounted, withDefaults } from 'vue'

interface Props {
  componentName?: string
  fallbackMessage?: string
  maxRetries?: number
  enableReporting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  componentName: 'Unknown Component',
  fallbackMessage: 'Something went wrong in this component.',
  maxRetries: 3,
  enableReporting: true
})

const emit = defineEmits<{
  error: [error: Error, componentName: string]
  retry: [retryCount: number]
  reset: []
}>()

// Error state
const hasError = ref(false)
const error = ref<Error | null>(null)
const errorTimestamp = ref<string>('')
const retryCount = ref(0)
const showDetails = ref(false)

// Computed properties
const errorTitle = computed(() => {
  if (!error.value) return 'Unknown Error'
  
  // Categorize common errors
  if (error.value.name === 'TypeError') return 'Type Error'
  if (error.value.name === 'ReferenceError') return 'Reference Error'
  if (error.value.name === 'SyntaxError') return 'Syntax Error'
  if (error.value.message.includes('fetch')) return 'Network Error'
  if (error.value.message.includes('undefined')) return 'Undefined Value Error'
  
  return error.value.name || 'Application Error'
})

const errorMessage = computed(() => {
  if (!error.value) return props.fallbackMessage
  
  // Provide user-friendly messages for common errors
  const message = error.value.message
  
  if (message.includes('Cannot read properties of undefined')) {
    return 'A required piece of data is missing. This might be a loading issue.'
  }
  
  if (message.includes('fetch')) {
    return 'Unable to connect to the server. Please check your internet connection.'
  }
  
  if (message.includes('JSON')) {
    return 'Data format error. The save file might be corrupted.'
  }
  
  return message || props.fallbackMessage
})

const errorStack = computed(() => {
  return error.value?.stack || 'No stack trace available'
})

const suggestions = computed(() => {
  const suggestions: string[] = []
  
  if (!error.value) return suggestions
  
  const message = error.value.message.toLowerCase()
  
  if (message.includes('undefined') || message.includes('null')) {
    suggestions.push('Try refreshing the page to reload the game state')
    suggestions.push('Check if you have a recent save file to restore from')
  }
  
  if (message.includes('fetch') || message.includes('network')) {
    suggestions.push('Check your internet connection')
    suggestions.push('Try again in a few moments')
    suggestions.push('Consider working offline with saved data')
  }
  
  if (message.includes('storage') || message.includes('quota')) {
    suggestions.push('Clear browser storage and restart')
    suggestions.push('Export your save before clearing storage')
  }
  
  suggestions.push('Report this error if it keeps happening')
  suggestions.push('Try reloading the page as a last resort')
  
  return suggestions
})

function getUserAgent(): string {
  return (window as any)?.navigator?.userAgent?.slice(0, 50) || 'Unknown'
}

// Error handling
onErrorCaptured((err: Error, instance, info) => {
  console.error('Error boundary caught error:', err)
  console.error('Component info:', info)
  console.error('Instance:', instance)
  
  hasError.value = true
  error.value = err
  errorTimestamp.value = new Date().toISOString()
  
  // Emit error event for logging
  emit('error', err, props.componentName)
  
  // Log to external service if enabled
  if (props.enableReporting) {
    logError(err, info)
  }
  
  // Return false to stop propagation
  return false
})

// Actions
function retry() {
  if (retryCount.value >= props.maxRetries) return
  
  retryCount.value++
  hasError.value = false
  error.value = null
  showDetails.value = false
  
  emit('retry', retryCount.value)
  
  // Give component time to re-render
  setTimeout(() => {
    // If error still exists after retry, show it again
    if (error.value) {
      hasError.value = true
    }
  }, 100)
}

function resetComponent() {
  hasError.value = false
  error.value = null
  retryCount.value = 0
  showDetails.value = false
  
  emit('reset')
}

function reportError() {
  if (!error.value) return
  
  const errorReport = {
    error: {
      name: error.value.name,
      message: error.value.message,
      stack: error.value.stack
    },
    component: props.componentName,
    timestamp: errorTimestamp.value,
    userAgent: navigator.userAgent,
    url: window.location.href,
    retryCount: retryCount.value
  }
  
  // Copy to clipboard for user to report
  navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
    .then(() => {
      alert('Error report copied to clipboard. Please paste this when reporting the issue.')
    })
    .catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = JSON.stringify(errorReport, null, 2)
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Error report copied to clipboard.')
    })
}

function logError(err: Error, info: string) {
  // In a real app, you'd send this to an error tracking service
  console.group('🚨 Error Boundary Report')
  console.error('Error:', err)
  console.error('Component Info:', info)
  console.error('Component Name:', props.componentName)
  console.error('Timestamp:', new Date().toISOString())
  console.groupEnd()
  
  // Store in localStorage for debugging
  try {
    const errorLog = JSON.parse(localStorage.getItem('aether_error_log') || '[]')
    errorLog.push({
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack
      },
      componentInfo: info,
      componentName: props.componentName,
      timestamp: new Date().toISOString(),
      url: window.location.href
    })
    
    // Keep only last 10 errors
    if (errorLog.length > 10) {
      errorLog.splice(0, errorLog.length - 10)
    }
    
    localStorage.setItem('aether_error_log', JSON.stringify(errorLog))
  } catch (storageError) {
    console.warn('Failed to log error to localStorage:', storageError)
  }
}

// Initialize
onMounted(() => {
  console.log(`Error boundary initialized for ${props.componentName}`)
})
</script>

<style scoped>
.error-boundary {
  height: 100%;
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 20px;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.error-content {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 10px rgba(255, 107, 53, 0.5));
}

.error-title {
  color: var(--accent-red);
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
}

.error-message {
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 24px;
}

.error-details {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
  text-align: left;
}

.error-details h3 {
  color: var(--accent-orange);
  font-size: 14px;
  margin-bottom: 12px;
}

.error-stack {
  background: rgba(0, 0, 0, 0.5);
  color: var(--text-muted);
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  white-space: pre-wrap;
  margin-bottom: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.error-info {
  display: grid;
  gap: 4px;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.error-suggestions {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  text-align: left;
}

.error-suggestions h3 {
  color: var(--accent-blue);
  font-size: 14px;
  margin-bottom: 12px;
}

.error-suggestions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.error-suggestions li {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 8px;
  padding-left: 16px;
  position: relative;
}

.error-suggestions li::before {
  content: '💡';
  position: absolute;
  left: 0;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent-blue);
  color: white;
}

.btn-secondary {
  background: var(--accent-green);
  color: white;
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-secondary);
}

.btn-warning {
  background: var(--accent-orange);
  color: white;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  opacity: 0.9;
}

@media (max-width: 768px) {
  .error-container {
    padding: 15px;
    min-height: 250px;
  }
  
  .error-title {
    font-size: 20px;
  }
  
  .error-message {
    font-size: 14px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    min-width: 120px;
  }
}
</style>