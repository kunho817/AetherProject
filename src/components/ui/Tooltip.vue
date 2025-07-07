<template>
  <div class="tooltip-wrapper" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" @click="onClick">
    <slot />
    <Teleport to="body">
      <div
        v-if="showTooltip"
        ref="tooltipElement"
        :class="['tooltip', `tooltip-${position}`, { 'tooltip-persistent': persistent }]"
        :style="tooltipStyle"
        @mouseenter="onTooltipEnter"
        @mouseleave="onTooltipLeave"
      >
        <div class="tooltip-arrow" v-if="showArrow"></div>
        <div class="tooltip-content">
          <div v-if="title" class="tooltip-title">{{ title }}</div>
          <div class="tooltip-body" v-html="content"></div>
          <button 
            v-if="dismissible && persistent"
            class="tooltip-close"
            @click="hideTooltip"
          >
            ×
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { TooltipPosition, TooltipTrigger } from '@/types/tooltips'

interface Props {
  title?: string
  content: string
  position?: TooltipPosition
  trigger?: TooltipTrigger
  delay?: number
  maxWidth?: number
  showArrow?: boolean
  persistent?: boolean
  dismissible?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  position: TooltipPosition.AUTO,
  trigger: TooltipTrigger.HOVER,
  delay: 500,
  maxWidth: 300,
  showArrow: true,
  persistent: false,
  dismissible: true,
  disabled: false
})

const showTooltip = ref(false)
const tooltipElement = ref<HTMLElement>()
const triggerElement = ref<HTMLElement>()
const showTimeout = ref<number>()
const hideTimeout = ref<number>()
const isHoveringTooltip = ref(false)

const tooltipStyle = computed(() => {
  return {
    maxWidth: `${props.maxWidth}px`,
    zIndex: 1000
  }
})

function onMouseEnter() {
  if (props.disabled || props.trigger !== TooltipTrigger.HOVER) return
  
  clearTimeout(hideTimeout.value)
  showTimeout.value = window.setTimeout(() => {
    showTooltipElement()
  }, props.delay)
}

function onMouseLeave() {
  if (props.disabled || props.trigger !== TooltipTrigger.HOVER) return
  
  clearTimeout(showTimeout.value)
  if (!props.persistent && !isHoveringTooltip.value) {
    hideTimeout.value = window.setTimeout(() => {
      hideTooltip()
    }, 100)
  }
}

function onClick() {
  if (props.disabled || props.trigger !== TooltipTrigger.CLICK) return
  
  if (showTooltip.value) {
    hideTooltip()
  } else {
    showTooltipElement()
  }
}

function onTooltipEnter() {
  if (props.persistent) {
    isHoveringTooltip.value = true
    clearTimeout(hideTimeout.value)
  }
}

function onTooltipLeave() {
  if (props.persistent) {
    isHoveringTooltip.value = false
    if (props.trigger === TooltipTrigger.HOVER) {
      hideTimeout.value = window.setTimeout(() => {
        hideTooltip()
      }, 100)
    }
  }
}

async function showTooltipElement() {
  showTooltip.value = true
  
  await nextTick()
  
  if (tooltipElement.value && triggerElement.value) {
    positionTooltip()
  }
}

function hideTooltip() {
  showTooltip.value = false
  isHoveringTooltip.value = false
  clearTimeout(showTimeout.value)
  clearTimeout(hideTimeout.value)
}

function positionTooltip() {
  if (!tooltipElement.value || !triggerElement.value) return
  
  const tooltip = tooltipElement.value
  const trigger = triggerElement.value
  const triggerRect = trigger.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  let position = props.position
  let left = 0
  let top = 0
  
  // Auto positioning
  if (position === TooltipPosition.AUTO) {
    const spaceTop = triggerRect.top
    const spaceBottom = viewportHeight - triggerRect.bottom
    const spaceRight = viewportWidth - triggerRect.right
    
    if (spaceBottom >= tooltipRect.height) {
      position = TooltipPosition.BOTTOM
    } else if (spaceTop >= tooltipRect.height) {
      position = TooltipPosition.TOP
    } else if (spaceRight >= tooltipRect.width) {
      position = TooltipPosition.RIGHT
    } else {
      position = TooltipPosition.LEFT
    }
  }
  
  // Calculate position
  switch (position) {
    case TooltipPosition.TOP:
      left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
      top = triggerRect.top - tooltipRect.height - 8
      break
    case TooltipPosition.BOTTOM:
      left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
      top = triggerRect.bottom + 8
      break
    case TooltipPosition.LEFT:
      left = triggerRect.left - tooltipRect.width - 8
      top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
      break
    case TooltipPosition.RIGHT:
      left = triggerRect.right + 8
      top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
      break
  }
  
  // Clamp to viewport
  left = Math.max(8, Math.min(left, viewportWidth - tooltipRect.width - 8))
  top = Math.max(8, Math.min(top, viewportHeight - tooltipRect.height - 8))
  
  tooltip.style.left = `${left}px`
  tooltip.style.top = `${top}px`
  tooltip.className = tooltip.className.replace(/tooltip-(top|bottom|left|right)/g, '')
  tooltip.classList.add(`tooltip-${position}`)
}

function handleClickOutside(event: MouseEvent) {
  if (props.trigger === TooltipTrigger.CLICK && 
      showTooltip.value && 
      tooltipElement.value && 
      triggerElement.value &&
      !tooltipElement.value.contains(event.target as Node) &&
      !triggerElement.value.contains(event.target as Node)) {
    hideTooltip()
  }
}

onMounted(() => {
  triggerElement.value = document.querySelector(`[data-tooltip="${Math.random()}"]`) as HTMLElement
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  clearTimeout(showTimeout.value)
  clearTimeout(hideTimeout.value)
})

defineExpose({
  show: showTooltipElement,
  hide: hideTooltip
})
</script>

<style scoped>
.tooltip-wrapper {
  display: inline-block;
  position: relative;
}

.tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 0;
  font-size: 13px;
  line-height: 1.4;
  z-index: 1000;
  pointer-events: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
}

.tooltip-persistent {
  pointer-events: auto;
}

.tooltip-content {
  padding: 12px;
  position: relative;
}

.tooltip-title {
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 6px;
  font-size: 14px;
}

.tooltip-body {
  color: var(--text-primary);
}

.tooltip-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 16px;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.tooltip-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 6px solid transparent;
}

.tooltip-top .tooltip-arrow {
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: rgba(0, 0, 0, 0.9);
  border-bottom: none;
}

.tooltip-bottom .tooltip-arrow {
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: rgba(0, 0, 0, 0.9);
  border-top: none;
}

.tooltip-left .tooltip-arrow {
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: rgba(0, 0, 0, 0.9);
  border-right: none;
}

.tooltip-right .tooltip-arrow {
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: rgba(0, 0, 0, 0.9);
  border-left: none;
}

/* HTML content styling */
.tooltip-body :deep(ul) {
  margin: 8px 0;
  padding-left: 20px;
}

.tooltip-body :deep(li) {
  margin: 4px 0;
}

.tooltip-body :deep(strong) {
  color: var(--accent-yellow);
  font-weight: 600;
}

.tooltip-body :deep(em) {
  color: var(--accent-blue);
  font-style: italic;
}

.tooltip-body :deep(code) {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
}

.tooltip-body :deep(.formula) {
  background: rgba(255, 215, 0, 0.1);
  border-left: 3px solid var(--accent-yellow);
  padding: 8px;
  margin: 8px 0;
  font-family: 'Roboto Mono', monospace;
}

.tooltip-body :deep(.tip) {
  background: rgba(0, 255, 0, 0.1);
  border-left: 3px solid var(--accent-green);
  padding: 8px;
  margin: 8px 0;
}

.tooltip-body :deep(.warning) {
  background: rgba(255, 0, 0, 0.1);
  border-left: 3px solid var(--accent-red);
  padding: 8px;
  margin: 8px 0;
}
</style>