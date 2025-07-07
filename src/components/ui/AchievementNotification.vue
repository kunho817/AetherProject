<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in visibleNotifications"
          :key="notification.timestamp"
          :class="[
            'achievement-notification',
            `rarity-${notification.achievement.rarity}`,
            { 'entering': isEntering(notification) }
          ]"
        >
          <div class="notification-header">
            <div class="notification-icon">
              <span class="achievement-icon">🏆</span>
              <div class="rarity-glow"></div>
            </div>
            <div class="notification-content">
              <div class="notification-title">Achievement Unlocked!</div>
              <div class="achievement-name">{{ notification.achievement.name }}</div>
              <div class="achievement-description">{{ notification.achievement.description }}</div>
              <div v-if="notification.achievement.reward" class="achievement-reward">
                <span class="reward-icon">🎁</span>
                {{ notification.achievement.reward.description }}
              </div>
            </div>
            <button 
              class="notification-close"
              @click="dismissNotification(notification)"
            >
              ×
            </button>
          </div>
          
          <!-- Progress bar for auto-dismiss -->
          <div class="notification-progress">
            <div 
              class="progress-bar"
              :style="{ 
                width: `${getProgressPercentage(notification)}%`,
                animationDuration: `${notificationDuration}ms`
              }"
            ></div>
          </div>
          
          <!-- Rarity indicator -->
          <div :class="['rarity-indicator', `rarity-${notification.achievement.rarity}`]">
            {{ formatRarityName(notification.achievement.rarity) }}
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAchievementStore } from '@/stores/achievements'
import type { AchievementNotification } from '@/types/achievements'
import { AchievementRarity } from '@/types/achievements'

const achievementStore = useAchievementStore()

const {
  recentNotifications,
  notificationDuration
} = storeToRefs(achievementStore)

// Local state for animation tracking
const enteringNotifications = ref<Set<number>>(new Set())
const progressIntervals = ref<Map<number, number>>(new Map())

// Computed visible notifications (non-dismissed)
const visibleNotifications = computed(() => 
  recentNotifications.value.filter(n => !n.dismissed)
)

// Track which notifications are entering
function isEntering(notification: AchievementNotification): boolean {
  return enteringNotifications.value.has(notification.timestamp)
}

// Calculate progress percentage for auto-dismiss
function getProgressPercentage(notification: AchievementNotification): number {
  const elapsed = Date.now() - notification.timestamp
  const progress = Math.max(0, Math.min(100, (elapsed / notificationDuration.value) * 100))
  return 100 - progress // Invert so bar shrinks
}

// Format rarity name
function formatRarityName(rarity: AchievementRarity): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1)
}

// Dismiss specific notification
function dismissNotification(notification: AchievementNotification) {
  achievementStore.dismissNotification(notification)
  
  // Clear any associated interval
  const interval = progressIntervals.value.get(notification.timestamp)
  if (interval) {
    clearInterval(interval)
    progressIntervals.value.delete(notification.timestamp)
  }
  
  // Force remove from entering notifications
  enteringNotifications.value.delete(notification.timestamp)
}

// Watch for new notifications
let lastNotificationCount = 0

function checkForNewNotifications() {
  const currentCount = visibleNotifications.value.length
  
  if (currentCount > lastNotificationCount) {
    // New notification appeared
    const newNotifications = visibleNotifications.value.slice(lastNotificationCount)
    
    newNotifications.forEach(notification => {
      // Mark as entering for animation
      enteringNotifications.value.add(notification.timestamp)
      
      // Remove entering state after animation
      setTimeout(() => {
        enteringNotifications.value.delete(notification.timestamp)
      }, 500)
      
      // Set up progress interval for visual feedback
      const interval = setInterval(() => {
        const elapsed = Date.now() - notification.timestamp
        if (elapsed >= notificationDuration.value) {
          dismissNotification(notification)
        }
      }, 100)
      
      progressIntervals.value.set(notification.timestamp, interval)
    })
  }
  
  lastNotificationCount = currentCount
}

// Sound effects (optional) - placeholder for future audio system
// function playNotificationSound(rarity: AchievementRarity) {
//   const soundMap = {
//     [AchievementRarity.COMMON]: 'notification_common',
//     [AchievementRarity.UNCOMMON]: 'notification_uncommon',
//     [AchievementRarity.RARE]: 'notification_rare',
//     [AchievementRarity.EPIC]: 'notification_epic',
//     [AchievementRarity.LEGENDARY]: 'notification_legendary',
//     [AchievementRarity.MYTHIC]: 'notification_mythic'
//   }
//   console.log(`Playing sound: ${soundMap[rarity]}`)
// }

// Cleanup intervals on unmount
onUnmounted(() => {
  progressIntervals.value.forEach(interval => clearInterval(interval))
  progressIntervals.value.clear()
})

// Set up notification checking
onMounted(() => {
  // Check for new notifications every 100ms
  const checkInterval = setInterval(checkForNewNotifications, 100)
  
  onUnmounted(() => {
    clearInterval(checkInterval)
  })
})
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.achievement-notification {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(30, 30, 30, 0.95));
  border: 2px solid var(--border-primary);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(16px);
  overflow: hidden;
  pointer-events: auto;
  position: relative;
  min-height: 100px;
  transform: translateX(100%);
  animation: slideIn 0.5s ease-out forwards;
}

.achievement-notification.entering {
  transform: scale(1.05);
  animation: slideInBounce 0.6s ease-out forwards;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInBounce {
  0% {
    transform: translateX(100%) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: translateX(-10px) scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

/* Rarity-specific styling */
.achievement-notification.rarity-common {
  border-color: #6b7280;
  box-shadow: 0 8px 32px rgba(107, 114, 128, 0.3);
}

.achievement-notification.rarity-uncommon {
  border-color: #10b981;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
}

.achievement-notification.rarity-rare {
  border-color: #f59e0b;
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3);
}

.achievement-notification.rarity-epic {
  border-color: #8b5cf6;
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);
}

.achievement-notification.rarity-legendary {
  border-color: #f97316;
  box-shadow: 0 8px 32px rgba(249, 115, 22, 0.4);
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(0, 0, 0, 0.95));
}

.achievement-notification.rarity-mythic {
  border-color: #ef4444;
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.5);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(0, 0, 0, 0.95));
  animation: mythicGlow 2s ease-in-out infinite alternate;
}

@keyframes mythicGlow {
  from {
    box-shadow: 0 8px 32px rgba(239, 68, 68, 0.5);
  }
  to {
    box-shadow: 0 12px 48px rgba(239, 68, 68, 0.8);
  }
}

.notification-header {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  position: relative;
}

.notification-icon {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-yellow), #fbbf24);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.achievement-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.rarity-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background: inherit;
  filter: blur(8px);
  opacity: 0.5;
  z-index: -1;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-yellow);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.achievement-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  line-height: 1.2;
}

.achievement-description {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 8px;
}

.achievement-reward {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--accent-green);
  background: rgba(0, 255, 0, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 0, 0.2);
}

.reward-icon {
  font-size: 12px;
}

.notification-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple));
  transition: width 0.1s linear;
  border-radius: 0 0 10px 10px;
}

.rarity-indicator {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 6px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.rarity-indicator.rarity-common { 
  background: rgba(107, 114, 128, 0.8); 
  color: white; 
}

.rarity-indicator.rarity-uncommon { 
  background: rgba(16, 185, 129, 0.8); 
  color: white; 
}

.rarity-indicator.rarity-rare { 
  background: rgba(245, 158, 11, 0.8); 
  color: white; 
}

.rarity-indicator.rarity-epic { 
  background: rgba(139, 92, 246, 0.8); 
  color: white; 
}

.rarity-indicator.rarity-legendary { 
  background: rgba(249, 115, 22, 0.8); 
  color: white; 
  animation: legendaryShimmer 2s ease-in-out infinite;
}

.rarity-indicator.rarity-mythic { 
  background: rgba(239, 68, 68, 0.8); 
  color: white; 
  animation: mythicShimmer 1.5s ease-in-out infinite;
}

@keyframes legendaryShimmer {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes mythicShimmer {
  0%, 100% { 
    transform: scale(1);
    background: rgba(239, 68, 68, 0.8);
  }
  50% { 
    transform: scale(1.15);
    background: rgba(239, 68, 68, 1);
  }
}

/* Transition animations */
.notification-enter-active {
  transition: all 0.5s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .achievement-notification {
    min-height: 80px;
  }
  
  .notification-header {
    padding: 12px;
    gap: 12px;
  }
  
  .notification-icon {
    width: 40px;
    height: 40px;
  }
  
  .achievement-icon {
    font-size: 20px;
  }
  
  .achievement-name {
    font-size: 14px;
  }
  
  .achievement-description {
    font-size: 11px;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .achievement-notification {
    border-width: 3px;
    background: rgba(0, 0, 0, 1);
  }
  
  .notification-title,
  .achievement-name {
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .achievement-notification {
    animation: slideInSimple 0.3s ease-out forwards;
  }
  
  .achievement-notification.entering {
    animation: slideInSimple 0.3s ease-out forwards;
  }
  
  @keyframes slideInSimple {
    from {
      transform: translateX(50px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .rarity-indicator.rarity-legendary,
  .rarity-indicator.rarity-mythic {
    animation: none;
  }
  
  .achievement-notification.rarity-mythic {
    animation: none;
  }
}
</style>