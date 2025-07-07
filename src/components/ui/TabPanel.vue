<template>
  <div
    v-if="isActive"
    :class="['tab-panel', { active: isActive }]"
    :data-tab="tabId"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  tabId: string
  activeTab: string
}

const props = defineProps<Props>()

const isActive = computed(() => props.activeTab === props.tabId)
</script>

<style scoped>
.tab-panel {
  width: 100%;
  height: 100%;
}

.tab-panel.active {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>