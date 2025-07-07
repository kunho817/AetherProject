import { ref, computed } from 'vue'

interface ErrorEntry {
  id: string
  error: Error
  component: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  recovered: boolean
  retryCount: number
}

interface ErrorContext {
  componentName: string
  action: string
  data?: any
}

class ErrorHandler {
  private errors = ref<ErrorEntry[]>([])
  private maxErrors = 50
  
  // Global error counts
  readonly totalErrors = computed(() => this.errors.value.length)
  readonly criticalErrors = computed(() => 
    this.errors.value.filter(e => e.severity === 'critical').length
  )
  readonly recentErrors = computed(() => 
    this.errors.value.filter(e => 
      Date.now() - e.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    )
  )
  
  // Error handling methods
  handleError(error: Error, context: ErrorContext = { componentName: 'Unknown', action: 'Unknown' }) {
    console.error(`Error in ${context.componentName}:`, error)
    
    const errorEntry: ErrorEntry = {
      id: this.generateId(),
      error,
      component: context.componentName,
      timestamp: new Date(),
      severity: this.determineSeverity(error, context),
      recovered: false,
      retryCount: 0
    }
    
    this.addError(errorEntry)
    this.logError(errorEntry, context)
    
    // Handle critical errors immediately
    if (errorEntry.severity === 'critical') {
      this.handleCriticalError(errorEntry, context)
    }
    
    return errorEntry.id
  }
  
  handleAsyncError(promise: Promise<any>, context: ErrorContext): Promise<any> {
    return promise.catch(error => {
      this.handleError(error, context)
      throw error // Re-throw to allow component-level handling
    })
  }
  
  handleSafeOperation<T>(
    operation: () => T, 
    fallback: T, 
    context: ErrorContext
  ): T {
    try {
      return operation()
    } catch (error) {
      this.handleError(error as Error, context)
      return fallback
    }
  }
  
  async handleSafeAsyncOperation<T>(
    operation: () => Promise<T>, 
    fallback: T, 
    context: ErrorContext
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      this.handleError(error as Error, context)
      return fallback
    }
  }
  
  markRecovered(errorId: string) {
    const error = this.errors.value.find(e => e.id === errorId)
    if (error) {
      error.recovered = true
    }
  }
  
  incrementRetry(errorId: string) {
    const error = this.errors.value.find(e => e.id === errorId)
    if (error) {
      error.retryCount++
    }
  }
  
  clearErrors() {
    this.errors.value = []
  }
  
  getErrorReport(): string {
    const report = {
      summary: {
        total: this.totalErrors.value,
        critical: this.criticalErrors.value,
        recent: this.recentErrors.value.length
      },
      errors: this.errors.value.map(e => ({
        id: e.id,
        message: e.error.message,
        component: e.component,
        timestamp: e.timestamp.toISOString(),
        severity: e.severity,
        recovered: e.recovered,
        retryCount: e.retryCount
      })),
      system: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    }
    
    return JSON.stringify(report, null, 2)
  }
  
  // Private methods
  private addError(error: ErrorEntry) {
    this.errors.value.push(error)
    
    // Keep only the most recent errors
    if (this.errors.value.length > this.maxErrors) {
      this.errors.value.splice(0, this.errors.value.length - this.maxErrors)
    }
  }
  
  private determineSeverity(error: Error, context: ErrorContext): ErrorEntry['severity'] {
    const message = error.message.toLowerCase()
    const component = context.componentName.toLowerCase()
    
    // Critical errors that break core functionality
    if (
      message.includes('chunk load failed') ||
      message.includes('loading chunk') ||
      component.includes('gamestate') ||
      component.includes('gameloop') ||
      message.includes('cannot read properties of undefined reading \'save\'') ||
      message.includes('cannot read properties of undefined reading \'load\'')
    ) {
      return 'critical'
    }
    
    // High severity - important features broken
    if (
      component.includes('starburst') ||
      component.includes('starlight') ||
      component.includes('filament') ||
      message.includes('network') ||
      message.includes('fetch')
    ) {
      return 'high'
    }
    
    // Medium severity - secondary features
    if (
      component.includes('particle') ||
      component.includes('animation') ||
      component.includes('tooltip') ||
      message.includes('timeout')
    ) {
      return 'medium'
    }
    
    // Low severity - cosmetic or minor issues
    return 'low'
  }
  
  private handleCriticalError(error: ErrorEntry, _context: ErrorContext) {
    console.error('🚨 CRITICAL ERROR DETECTED:', error)
    
    // Try to save game state before potential crash
    try {
      const gameStore = this.getGameStore()
      if (gameStore) {
        gameStore.save()
        console.log('Emergency save completed')
      }
    } catch (saveError) {
      console.error('Failed to perform emergency save:', saveError)
    }
    
    // Show user notification for critical errors
    this.showCriticalErrorNotification(error)
  }
  
  private showCriticalErrorNotification(error: ErrorEntry) {
    // Create a simple notification for critical errors
    const notification = document.createElement('div')
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff073a;
        color: white;
        padding: 16px;
        border-radius: 8px;
        z-index: 10000;
        max-width: 300px;
        font-family: system-ui, sans-serif;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      ">
        <strong>🚨 Critical Error</strong><br>
        <small>${error.error.message}</small><br>
        <button onclick="this.parentElement.parentElement.remove()" style="
          margin-top: 8px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
        ">Dismiss</button>
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 10000)
  }
  
  private logError(error: ErrorEntry, context: ErrorContext) {
    // Store in localStorage for persistence
    try {
      const errorLog = JSON.parse(localStorage.getItem('aether_error_log') || '[]')
      errorLog.push({
        id: error.id,
        message: error.error.message,
        stack: error.error.stack,
        component: error.component,
        timestamp: error.timestamp.toISOString(),
        severity: error.severity,
        context: context
      })
      
      // Keep only last 20 errors in localStorage
      if (errorLog.length > 20) {
        errorLog.splice(0, errorLog.length - 20)
      }
      
      localStorage.setItem('aether_error_log', JSON.stringify(errorLog))
    } catch (storageError) {
      console.warn('Failed to log error to localStorage:', storageError)
    }
  }
  
  private getGameStore() {
    try {
      // Dynamic import to avoid circular dependencies
      return (window as any).__game_store__
    } catch {
      return null
    }
  }
  
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

// Global error handler instance
const globalErrorHandler = new ErrorHandler()

// Global error event listeners
window.addEventListener('error', (event) => {
  globalErrorHandler.handleError(event.error || new Error(event.message), {
    componentName: 'Global',
    action: 'Window Error Event',
    data: { filename: event.filename, lineno: event.lineno, colno: event.colno }
  })
})

window.addEventListener('unhandledrejection', (event) => {
  globalErrorHandler.handleError(
    event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
    {
      componentName: 'Global',
      action: 'Unhandled Promise Rejection'
    }
  )
})

// Composable
export function useErrorHandler() {
  return {
    // Error handling methods
    handleError: globalErrorHandler.handleError.bind(globalErrorHandler),
    handleAsyncError: globalErrorHandler.handleAsyncError.bind(globalErrorHandler),
    handleSafeOperation: globalErrorHandler.handleSafeOperation.bind(globalErrorHandler),
    handleSafeAsyncOperation: globalErrorHandler.handleSafeAsyncOperation.bind(globalErrorHandler),
    
    // Error management
    markRecovered: globalErrorHandler.markRecovered.bind(globalErrorHandler),
    incrementRetry: globalErrorHandler.incrementRetry.bind(globalErrorHandler),
    clearErrors: globalErrorHandler.clearErrors.bind(globalErrorHandler),
    getErrorReport: globalErrorHandler.getErrorReport.bind(globalErrorHandler),
    
    // Reactive error statistics
    totalErrors: globalErrorHandler.totalErrors,
    criticalErrors: globalErrorHandler.criticalErrors,
    recentErrors: globalErrorHandler.recentErrors,
    
    // Error wrapping utilities
    withErrorHandling: <T extends (...args: any[]) => any>(
      fn: T,
      context: ErrorContext
    ): T => {
      return ((...args: any[]) => {
        return globalErrorHandler.handleSafeOperation(
          () => fn(...args),
          undefined,
          context
        )
      }) as T
    },
    
    withAsyncErrorHandling: <T extends (...args: any[]) => Promise<any>>(
      fn: T,
      context: ErrorContext
    ): T => {
      return ((...args: any[]) => {
        return globalErrorHandler.handleSafeAsyncOperation(
          () => fn(...args),
          Promise.resolve(undefined),
          context
        )
      }) as T
    }
  }
}