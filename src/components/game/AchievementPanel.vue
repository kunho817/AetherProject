<template>
  <div class="achievement-panel">
    <div class="panel-header">
      <h2 class="section-title">Achievements & Statistics</h2>
      <div class="completion-stats">
        <div class="completion-circle">
          <div class="progress-ring">
            <svg class="progress-svg" width="60" height="60">
              <circle 
                class="progress-ring-background"
                cx="30" cy="30" r="25"
                stroke-width="4"
                fill="transparent"
              />
              <circle 
                class="progress-ring-progress"
                cx="30" cy="30" r="25"
                stroke-width="4"
                fill="transparent"
                :stroke-dasharray="progressCircumference"
                :stroke-dashoffset="progressOffset"
              />
            </svg>
            <div class="progress-text">{{ completionPercentage }}%</div>
          </div>
        </div>
        <div class="completion-details">
          <div class="completion-item">
            <span class="label">Completed:</span>
            <span class="value">{{ completedAchievements.length }} / {{ totalAchievements }}</span>
          </div>
          <div class="completion-item">
            <span class="label">Points:</span>
            <span class="value">{{ totalAchievementPoints }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button 
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
        <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>
    
    <!-- Achievements Tab -->
    <div v-if="activeTab === 'achievements'" class="achievements-container">
      <div class="filter-controls">
        <div class="category-filters">
          <button 
            v-for="category in Object.values(AchievementCategory)"
            :key="category"
            :class="['filter-btn', { active: selectedCategory === category }]"
            @click="filterByCategory(category)"
          >
            {{ formatCategoryName(category) }}
            <span class="filter-count">
              {{ achievementsByCategory[category]?.length || 0 }}
            </span>
          </button>
          <button 
            :class="['filter-btn', { active: selectedCategory === null }]"
            @click="selectedCategory = null"
          >
            All
            <span class="filter-count">{{ visibleAchievements.length }}</span>
          </button>
        </div>
        
        <div class="rarity-filters">
          <button 
            v-for="rarity in Object.values(AchievementRarity)"
            :key="rarity"
            :class="['rarity-btn', `rarity-${rarity}`, { active: selectedRarity === rarity }]"
            @click="filterByRarity(rarity)"
          >
            {{ formatRarityName(rarity) }}
          </button>
          <button 
            :class="['rarity-btn', { active: selectedRarity === null }]"
            @click="selectedRarity = null"
          >
            All
          </button>
        </div>
        
        <div class="view-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="showCompleted">
            Show Completed
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="showHidden">
            Show Hidden
          </label>
        </div>
      </div>
      
      <div class="achievements-grid">
        <div 
          v-for="achievement in visibleAchievements"
          :key="achievement.id"
          :class="[
            'achievement-card',
            `rarity-${achievement.rarity}`,
            {
              'completed': achievement.completed,
              'locked': !achievement.unlocked,
              'hidden': achievement.hidden && !achievement.unlocked,
              'progress': achievement.type === AchievementType.PROGRESS
            }
          ]"
        >
          <div class="achievement-header">
            <div class="achievement-icon">
              <span :class="[
                'icon', 
                achievement.completed ? 'completed' : achievement.unlocked ? 'unlocked' : 'locked'
              ]">
                {{ getAchievementIcon(achievement) }}
              </span>
            </div>
            <div class="achievement-meta">
              <h3 class="achievement-name">
                {{ achievement.hidden && !achievement.unlocked ? '???' : achievement.name }}
              </h3>
              <span :class="['achievement-rarity', `rarity-${achievement.rarity}`]">
                {{ formatRarityName(achievement.rarity) }}
              </span>
            </div>
            <div class="achievement-status">
              <span v-if="achievement.completed" class="status-completed">✓</span>
              <span v-else-if="achievement.unlocked" class="status-unlocked">○</span>
              <span v-else class="status-locked">🔒</span>
            </div>
          </div>
          
          <div class="achievement-description">
            {{ achievement.hidden && !achievement.unlocked ? 
              'Hidden achievement - complete other achievements to reveal' : 
              achievement.description 
            }}
          </div>
          
          <!-- Progress Bar for Progress Achievements -->
          <div 
            v-if="achievement.type === AchievementType.PROGRESS && achievement.unlocked"
            class="achievement-progress"
          >
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: `${getAchievementProgress(achievement.id)}%` }"
              ></div>
            </div>
            <div class="progress-text">
              {{ getProgressText(achievement.id) }}
            </div>
          </div>
          
          <!-- Reward Display -->
          <div v-if="achievement.reward && (achievement.unlocked || achievement.completed)" class="achievement-reward">
            <div class="reward-label">Reward:</div>
            <div class="reward-description">{{ achievement.reward.description }}</div>
          </div>
          
          <!-- Completion Time -->
          <div v-if="achievement.completedAt" class="achievement-completion">
            <div class="completion-time">
              Completed: {{ formatDate(achievement.completedAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Statistics Tab -->
    <div v-if="activeTab === 'statistics'" class="statistics-container">
      <div class="stats-categories">
        <button 
          v-for="category in Object.values(StatisticCategory)"
          :key="category"
          :class="['stats-category-btn', { active: selectedStatsCategory === category }]"
          @click="selectedStatsCategory = category"
        >
          {{ formatCategoryName(category) }}
        </button>
        <button 
          :class="['stats-category-btn', { active: selectedStatsCategory === null }]"
          @click="selectedStatsCategory = null"
        >
          All
        </button>
      </div>
      
      <div class="statistics-grid">
        <div 
          v-for="stat in visibleStatistics"
          :key="stat.id"
          class="statistic-card"
        >
          <div class="stat-header">
            <h3 class="stat-name">{{ stat.name }}</h3>
            <span class="stat-category">{{ formatCategoryName(stat.category) }}</span>
          </div>
          <div class="stat-value">
            {{ formatStatValue(stat) }}
          </div>
          <div class="stat-description">
            {{ stat.description }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Milestones Tab -->
    <div v-if="activeTab === 'milestones'" class="milestones-container">
      <div class="milestones-grid">
        <div 
          v-for="[category, tracker] in milestoneTrackers"
          :key="category"
          class="milestone-card"
        >
          <div class="milestone-header">
            <h3 class="milestone-category">{{ formatCategoryName(category) }}</h3>
            <div class="milestone-current">{{ formatMilestoneValue(tracker.current) }}</div>
          </div>
          
          <div class="milestone-progress">
            <div class="milestones-list">
              <div 
                v-for="milestone in tracker.milestones"
                :key="milestone"
                :class="[
                  'milestone-item',
                  {
                    'completed': tracker.completedMilestones.includes(milestone),
                    'next': milestone === tracker.nextMilestone
                  }
                ]"
              >
                <span class="milestone-icon">
                  {{ tracker.completedMilestones.includes(milestone) ? '✓' : 
                     milestone === tracker.nextMilestone ? '○' : '—' }}
                </span>
                <span class="milestone-value">{{ formatMilestoneValue(milestone) }}</span>
              </div>
            </div>
            
            <div v-if="tracker.nextMilestone" class="next-milestone">
              <div class="next-milestone-label">Next Milestone:</div>
              <div class="next-milestone-target">{{ formatMilestoneValue(tracker.nextMilestone) }}</div>
              <div class="milestone-progress-bar">
                <div 
                  class="milestone-progress-fill"
                  :style="{ width: `${getMilestoneProgress(tracker)}%` }"
                ></div>
              </div>
              <div class="milestone-progress-text">
                {{ formatMilestoneValue(tracker.current) }} / {{ formatMilestoneValue(tracker.nextMilestone) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Records Tab -->
    <div v-if="activeTab === 'records'" class="records-container">
      <div class="records-section">
        <h3 class="records-title">Personal Records</h3>
        <div class="records-grid">
          <div class="record-card">
            <div class="record-label">Fastest Starburst</div>
            <div class="record-value">{{ formatTime(getFastestStarburst()) }}</div>
          </div>
          <div class="record-card">
            <div class="record-label">Highest Production</div>
            <div class="record-value">{{ formatProduction(getHighestProduction()) }}</div>
          </div>
          <div class="record-card">
            <div class="record-label">Most Expensive Purchase</div>
            <div class="record-value">{{ formatCurrency(getMostExpensivePurchase()) }}</div>
          </div>
          <div class="record-card">
            <div class="record-label">Session Best</div>
            <div class="record-value">{{ formatTime(getSessionBest()) }}</div>
          </div>
        </div>
      </div>
      
      <div class="records-section">
        <h3 class="records-title">Achievement Statistics</h3>
        <div class="achievement-stats-grid">
          <div 
            v-for="rarity in Object.values(AchievementRarity)"
            :key="rarity"
            class="achievement-stat-card"
          >
            <div :class="['stat-icon', `rarity-${rarity}`]">
              {{ getRarityIcon(rarity) }}
            </div>
            <div class="stat-info">
              <div class="stat-label">{{ formatRarityName(rarity) }}</div>
              <div class="stat-count">{{ getAchievementCountByRarity(rarity) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAchievementStore } from '@/stores/achievements'
import { format } from '@/utils/formatting'
import { 
  AchievementCategory, 
  AchievementType, 
  AchievementRarity,
  StatisticCategory 
} from '@/types/achievements'
import type { Achievement, GameStatistic, MilestoneTracker } from '@/types/achievements'

const achievementStore = useAchievementStore()

const {
  achievements,
  statistics,
  achievementProgress,
  milestoneTrackers,
  totalAchievements,
  completedAchievements,
  achievementsByCategory,
  completionPercentage
} = storeToRefs(achievementStore)

// Local state
const activeTab = ref('achievements')
const selectedCategory = ref<AchievementCategory | null>(null)
const selectedRarity = ref<AchievementRarity | null>(null)
const selectedStatsCategory = ref<StatisticCategory | null>(null)
const showCompleted = ref(true)
const showHidden = ref(false)

// Tab configuration
const tabs = computed(() => [
  { id: 'achievements', name: 'Achievements', count: completedAchievements.value.length },
  { id: 'statistics', name: 'Statistics', count: statistics.value.size },
  { id: 'milestones', name: 'Milestones', count: milestoneTrackers.value.size },
  { id: 'records', name: 'Records' }
])

// Progress circle calculations
const progressCircumference = computed(() => 2 * Math.PI * 25)
const progressOffset = computed(() => {
  return progressCircumference.value - (completionPercentage.value / 100) * progressCircumference.value
})

// Achievement points calculation
const totalAchievementPoints = computed(() => {
  const rarityPoints = {
    [AchievementRarity.COMMON]: 1,
    [AchievementRarity.UNCOMMON]: 2,
    [AchievementRarity.RARE]: 5,
    [AchievementRarity.EPIC]: 10,
    [AchievementRarity.LEGENDARY]: 25,
    [AchievementRarity.MYTHIC]: 50
  }
  
  return completedAchievements.value.reduce((total, achievement) => {
    return total + (rarityPoints[achievement.rarity] || 1)
  }, 0)
})

// Filtered achievements
const visibleAchievements = computed(() => {
  let filtered = Array.from(achievements.value.values())
  
  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(a => a.category === selectedCategory.value)
  }
  
  // Rarity filter
  if (selectedRarity.value) {
    filtered = filtered.filter(a => a.rarity === selectedRarity.value)
  }
  
  // Completion filter
  if (!showCompleted.value) {
    filtered = filtered.filter(a => !a.completed)
  }
  
  // Hidden filter
  if (!showHidden.value) {
    filtered = filtered.filter(a => !a.hidden || a.unlocked)
  }
  
  // Sort by completion status, then rarity, then name
  return filtered.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    
    const rarityOrder = Object.values(AchievementRarity)
    const aIndex = rarityOrder.indexOf(a.rarity)
    const bIndex = rarityOrder.indexOf(b.rarity)
    
    if (aIndex !== bIndex) {
      return bIndex - aIndex // Higher rarity first
    }
    
    return a.name.localeCompare(b.name)
  })
})

// Filtered statistics
const visibleStatistics = computed(() => {
  let filtered = Array.from(statistics.value.values()).filter(s => s.isVisible)
  
  if (selectedStatsCategory.value) {
    filtered = filtered.filter(s => s.category === selectedStatsCategory.value)
  }
  
  return filtered.sort((a, b) => a.name.localeCompare(b.name))
})

// Helper functions
function formatCategoryName(category: string): string {
  return category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function formatRarityName(rarity: string): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1)
}

function filterByCategory(category: AchievementCategory | null) {
  selectedCategory.value = selectedCategory.value === category ? null : category
}

function filterByRarity(rarity: AchievementRarity | null) {
  selectedRarity.value = selectedRarity.value === rarity ? null : rarity
}

function getAchievementIcon(achievement: Achievement): string {
  if (achievement.completed) {
    return '🏆'
  }
  
  const categoryIcons = {
    [AchievementCategory.PRODUCTION]: '⚡',
    [AchievementCategory.PROGRESSION]: '🚀',
    [AchievementCategory.EXPLORATION]: '🔍',
    [AchievementCategory.MASTERY]: '🎯',
    [AchievementCategory.SPEED]: '💨',
    [AchievementCategory.COLLECTION]: '📚',
    [AchievementCategory.SPECIAL]: '✨',
    [AchievementCategory.SECRET]: '🎭'
  }
  
  return categoryIcons[achievement.category] || '🌟'
}

function getRarityIcon(rarity: AchievementRarity): string {
  const rarityIcons = {
    [AchievementRarity.COMMON]: '🔵',
    [AchievementRarity.UNCOMMON]: '🟢',
    [AchievementRarity.RARE]: '🟡',
    [AchievementRarity.EPIC]: '🟣',
    [AchievementRarity.LEGENDARY]: '🟠',
    [AchievementRarity.MYTHIC]: '🔴'
  }
  
  return rarityIcons[rarity] || '⚪'
}

function getAchievementProgress(achievementId: string): number {
  const progress = achievementProgress.value.get(achievementId)
  return progress ? progress.percentage : 0
}

function getProgressText(achievementId: string): string {
  const progress = achievementProgress.value.get(achievementId)
  if (!progress) return ''
  
  return `${progress.current} / ${progress.target}`
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString()
}

function formatStatValue(stat: GameStatistic): string {
  const value = stat.value
  
  switch (stat.format) {
    case 'time':
      return formatTime(value as number)
    case 'currency':
      return formatCurrency(value as number)
    case 'percentage':
      return `${(value as number).toFixed(stat.precision || 1)}%`
    case 'number':
      return format(value as number)
    default:
      return String(value)
  }
}

function formatTime(seconds: number): string {
  if (seconds === Infinity) return 'Never'
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`
}

function formatCurrency(value: number): string {
  return format(value)
}

function formatProduction(value: number): string {
  return `${format(value)}/s`
}

function formatMilestoneValue(value: number): string {
  return format(value)
}

function getMilestoneProgress(tracker: MilestoneTracker): number {
  if (!tracker.nextMilestone) return 100
  
  const previousMilestone = tracker.milestones
    .filter(m => m < tracker.nextMilestone!)
    .pop() || 0
  
  const progress = (tracker.current - previousMilestone) / (tracker.nextMilestone - previousMilestone)
  return Math.max(0, Math.min(100, progress * 100))
}

function getAchievementCountByRarity(rarity: AchievementRarity): number {
  return completedAchievements.value.filter(a => a.rarity === rarity).length
}

function getFastestStarburst(): number {
  const stat = statistics.value.get('fastest_starburst')
  return stat ? stat.value as number : Infinity
}

function getHighestProduction(): number {
  const stat = statistics.value.get('highest_stardust_production')
  return stat ? stat.value as number : 0
}

function getMostExpensivePurchase(): number {
  const stat = statistics.value.get('most_expensive_purchase')
  return stat ? stat.value as number : 0
}

function getSessionBest(): number {
  // Calculate best session time - placeholder
  return 0
}
</script>

<style scoped>
.achievement-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-yellow);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.completion-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.completion-circle {
  position: relative;
}

.progress-ring {
  position: relative;
}

.progress-svg {
  transform: rotate(-90deg);
}

.progress-ring-background {
  stroke: rgba(255, 255, 255, 0.1);
}

.progress-ring-progress {
  stroke: var(--accent-yellow);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
  color: var(--accent-yellow);
  font-size: 12px;
}

.completion-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.completion-item {
  display: flex;
  justify-content: space-between;
  min-width: 120px;
  font-size: 12px;
}

.completion-item .label {
  color: var(--text-muted);
}

.completion-item .value {
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
}

.tab-navigation {
  display: flex;
  gap: 5px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 5px;
}

.tab-btn {
  flex: 1;
  padding: 10px 15px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.tab-btn.active {
  background: var(--accent-yellow);
  color: var(--bg-primary);
}

.tab-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
}

.tab-btn.active .tab-count {
  background: rgba(0, 0, 0, 0.2);
}

.achievements-container, 
.statistics-container, 
.milestones-container, 
.records-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
}

.category-filters, 
.rarity-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-btn, 
.rarity-btn, 
.stats-category-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border-secondary);
  border-radius: 20px;
  padding: 6px 12px;
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-btn:hover, 
.rarity-btn:hover, 
.stats-category-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
}

.filter-btn.active, 
.rarity-btn.active, 
.stats-category-btn.active {
  background: var(--accent-blue);
  color: white;
  border-color: var(--accent-blue);
}

.filter-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 1px 5px;
  border-radius: 8px;
  font-size: 9px;
}

.rarity-btn.rarity-common { border-color: #6b7280; }
.rarity-btn.rarity-uncommon { border-color: #10b981; }
.rarity-btn.rarity-rare { border-color: #f59e0b; }
.rarity-btn.rarity-epic { border-color: #8b5cf6; }
.rarity-btn.rarity-legendary { border-color: #f97316; }
.rarity-btn.rarity-mythic { border-color: #ef4444; }

.view-options {
  display: flex;
  gap: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-primary);
  cursor: pointer;
}

.achievements-grid, 
.statistics-grid, 
.milestones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.achievement-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid var(--border-secondary);
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s ease;
}

.achievement-card.completed {
  border-color: var(--accent-green);
  background: rgba(0, 255, 0, 0.1);
}

.achievement-card.locked {
  opacity: 0.6;
  filter: grayscale(50%);
}

.achievement-card.hidden {
  background: rgba(50, 50, 50, 0.3);
  border-style: dashed;
}

.achievement-card.rarity-common { border-left: 4px solid #6b7280; }
.achievement-card.rarity-uncommon { border-left: 4px solid #10b981; }
.achievement-card.rarity-rare { border-left: 4px solid #f59e0b; }
.achievement-card.rarity-epic { border-left: 4px solid #8b5cf6; }
.achievement-card.rarity-legendary { border-left: 4px solid #f97316; }
.achievement-card.rarity-mythic { border-left: 4px solid #ef4444; }

.achievement-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.achievement-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.achievement-meta {
  flex: 1;
}

.achievement-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.achievement-rarity {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  text-transform: uppercase;
  font-weight: 600;
}

.achievement-rarity.rarity-common { background: #6b7280; color: white; }
.achievement-rarity.rarity-uncommon { background: #10b981; color: white; }
.achievement-rarity.rarity-rare { background: #f59e0b; color: white; }
.achievement-rarity.rarity-epic { background: #8b5cf6; color: white; }
.achievement-rarity.rarity-legendary { background: #f97316; color: white; }
.achievement-rarity.rarity-mythic { background: #ef4444; color: white; }

.achievement-status {
  font-size: 16px;
}

.status-completed { color: var(--accent-green); }
.status-unlocked { color: var(--accent-blue); }
.status-locked { color: var(--text-muted); }

.achievement-description {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 12px;
}

.achievement-progress {
  margin: 12px 0;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple));
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  color: var(--text-muted);
  font-family: 'Roboto Mono', monospace;
}

.achievement-reward {
  background: rgba(255, 215, 0, 0.1);
  border-left: 3px solid var(--accent-yellow);
  padding: 8px;
  border-radius: 4px;
  margin-top: 10px;
}

.reward-label {
  font-size: 10px;
  color: var(--accent-yellow);
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.reward-description {
  font-size: 11px;
  color: var(--text-primary);
}

.achievement-completion {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border-secondary);
}

.completion-time {
  font-size: 10px;
  color: var(--text-muted);
  font-family: 'Roboto Mono', monospace;
}

.statistic-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 15px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.stat-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.stat-category {
  font-size: 10px;
  background: var(--accent-blue);
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  text-transform: uppercase;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-yellow);
  font-family: 'Roboto Mono', monospace;
  margin-bottom: 8px;
}

.stat-description {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.milestone-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 10px;
  padding: 15px;
}

.milestone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.milestone-category {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.milestone-current {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-green);
  font-family: 'Roboto Mono', monospace;
}

.milestones-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 15px;
}

.milestone-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.milestone-item.completed {
  color: var(--accent-green);
}

.milestone-item.next {
  color: var(--accent-blue);
  font-weight: 600;
}

.milestone-icon {
  width: 16px;
  text-align: center;
}

.next-milestone {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 10px;
}

.next-milestone-label {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.next-milestone-target {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-blue);
  font-family: 'Roboto Mono', monospace;
  margin-bottom: 8px;
}

.milestone-progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
}

.milestone-progress-fill {
  height: 100%;
  background: var(--accent-blue);
  transition: width 0.3s ease;
}

.milestone-progress-text {
  font-size: 10px;
  color: var(--text-muted);
  font-family: 'Roboto Mono', monospace;
}

.records-section {
  margin-bottom: 20px;
}

.records-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 12px;
}

.records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.record-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.record-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.record-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-yellow);
  font-family: 'Roboto Mono', monospace;
}

.achievement-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.achievement-stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-icon {
  font-size: 20px;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.stat-count {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
}

@media (max-width: 768px) {
  .achievements-grid, 
  .statistics-grid, 
  .milestones-grid {
    grid-template-columns: 1fr;
  }
  
  .panel-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .category-filters, 
  .rarity-filters {
    justify-content: center;
  }
}
</style>