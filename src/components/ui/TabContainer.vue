<template>
  <div class="tab-container">
    <div class="tab-header">
      <button
        v-for="tab in visibleTabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="setActiveTab(tab.id)"
      >
        {{ tab.name }}
      </button>
    </div>
    
    <div class="tab-content">
      <slot :activeTab="activeTab" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

export interface Tab {
  id: string
  name: string
  visible?: () => boolean
}

interface Props {
  tabs: Tab[]
  defaultTab?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: ''
})

const emit = defineEmits<{
  tabChanged: [tabId: string]
}>()

// Find first visible tab or use defaultTab
const activeTab = ref(props.defaultTab || props.tabs.find(t => !t.visible || t.visible())?.id || '')

const visibleTabs = computed(() => {
  return props.tabs.filter(tab => !tab.visible || tab.visible())
})

// Update active tab if it becomes invisible
watch(visibleTabs, (newTabs) => {
  if (!newTabs.find(t => t.id === activeTab.value)) {
    activeTab.value = newTabs[0]?.id || ''
  }
}, { immediate: true })

function setActiveTab(tabId: string) {
  activeTab.value = tabId
  emit('tabChanged', tabId)
}

// Expose activeTab for parent components
defineExpose({
  activeTab: computed(() => activeTab.value),
  setActiveTab
})
</script>

<style scoped>
.tab-container {
  background: rgba(22, 33, 62, 0.8);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.tab-header {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid var(--border-primary);
  flex-wrap: wrap;
}

.tab-button {
  flex: 1;
  min-width: 140px;
  padding: 12px 16px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-family: 'Exo 2', sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-right: 1px solid var(--border-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tab-button:last-child {
  border-right: none;
}

.tab-button.active {
  background: linear-gradient(135deg, rgba(0, 180, 216, 0.2), rgba(114, 9, 183, 0.1));
  color: var(--accent-blue);
  box-shadow: inset 0 -3px 0 var(--accent-blue);
}

.tab-button:hover:not(.active) {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.tab-content {
  padding: 20px;
  min-height: 700px;
  max-height: 700px;
  overflow-y: auto;
}

/* Custom scrollbar */
.tab-content::-webkit-scrollbar {
  width: 8px;
}

.tab-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.tab-content::-webkit-scrollbar-thumb {
  background: var(--accent-blue);
  border-radius: 4px;
  opacity: 0.7;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .tab-button {
    min-width: 120px;
    padding: 10px 12px;
    font-size: 11px;
  }
  
  .tab-content {
    padding: 15px;
    min-height: 600px;
    max-height: 600px;
  }
}
</style>