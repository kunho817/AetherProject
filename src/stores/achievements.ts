import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Achievement, 
  GameStatistic, 
  AchievementProgress,
  StatisticSnapshot,
  AchievementNotification,
  MilestoneTracker
} from '@/types/achievements'
import { 
  AchievementCategory, 
  AchievementType, 
  AchievementRarity,
  StatisticCategory,
  StatisticType
} from '@/types/achievements'
import { useGameStore } from './gameState'

export const useAchievementStore = defineStore('achievements', () => {
  // Core state
  const achievements = ref<Map<string, Achievement>>(new Map())
  const statistics = ref<Map<string, GameStatistic>>(new Map())
  const achievementProgress = ref<Map<string, AchievementProgress>>(new Map())
  const notifications = ref<AchievementNotification[]>([])
  const milestoneTrackers = ref<Map<string, MilestoneTracker>>(new Map())
  
  // Session tracking
  const sessionStart = ref(Date.now())
  const lastSnapshot = ref<StatisticSnapshot | null>(null)
  const snapshotHistory = ref<StatisticSnapshot[]>([])
  
  // Settings
  const showNotifications = ref(true)
  const notificationDuration = ref(5000)
  const trackDetailedStats = ref(true)
  
  // Initialize achievements
  function initializeAchievements() {
    const achievementList: Achievement[] = [
      // Production Achievements
      {
        id: 'first_filament',
        name: 'Stellar Genesis',
        description: 'Purchase your first Cosmic Filament',
        category: AchievementCategory.PRODUCTION,
        type: AchievementType.SINGLE,
        condition: () => {
          const gameStore = useGameStore()
          return gameStore.filaments.some(f => f.owned.gt(0))
        },
        unlocked: false,
        completed: false,
        rarity: AchievementRarity.COMMON,
        reward: {
          type: 'multiplier',
          target: 'stardust_production',
          value: 1.1,
          description: '+10% Stardust production'
        }
      },
      
      {
        id: 'milestone_master',
        name: 'Milestone Master',
        description: 'Reach 10 milestones across all filaments',
        category: AchievementCategory.PROGRESSION,
        type: AchievementType.PROGRESS,
        condition: () => {
          const gameStore = useGameStore()
          const totalMilestones = gameStore.filaments.reduce((sum, f) => sum + f.milestone, 0)
          return totalMilestones >= 10
        },
        unlocked: false,
        completed: false,
        maxProgress: 10,
        rarity: AchievementRarity.UNCOMMON,
        reward: {
          type: 'multiplier',
          target: 'milestone_bonus',
          value: 1.25,
          description: '+25% milestone bonus effectiveness'
        }
      },
      
      {
        id: 'first_starburst',
        name: 'Stellar Rebirth',
        description: 'Perform your first Starburst',
        category: AchievementCategory.PROGRESSION,
        type: AchievementType.SINGLE,
        condition: () => {
          const gameStore = useGameStore()
          return gameStore.starburstCount > 0
        },
        unlocked: false,
        completed: false,
        rarity: AchievementRarity.UNCOMMON,
        reward: {
          type: 'multiplier',
          target: 'starburst_multiplier',
          value: 1.1,
          description: '+10% Starburst multiplier effectiveness'
        }
      },
      
      {
        id: 'starburst_veteran',
        name: 'Starburst Veteran',
        description: 'Perform 10 Starbursts',
        category: AchievementCategory.PROGRESSION,
        type: AchievementType.PROGRESS,
        condition: () => {
          const gameStore = useGameStore()
          return gameStore.starburstCount >= 10
        },
        unlocked: false,
        completed: false,
        maxProgress: 10,
        rarity: AchievementRarity.RARE,
        reward: {
          type: 'unlock',
          target: 'starburst_automation',
          description: 'Unlock early Starburst automation'
        }
      },
      
      {
        id: 'starlight_seeker',
        name: 'Starlight Seeker',
        description: 'Gain your first Starlight',
        category: AchievementCategory.PROGRESSION,
        type: AchievementType.SINGLE,
        condition: () => {
          const gameStore = useGameStore()
          return gameStore.starlight.amount.gt(0)
        },
        unlocked: false,
        completed: false,
        rarity: AchievementRarity.RARE,
        reward: {
          type: 'resource',
          target: 'stellar_energy',
          value: 100,
          description: 'Gain 100 Stellar Energy'
        }
      },
      
      // Mastery Achievements
      {
        id: 'tier_10_unlock',
        name: 'Cosmic Mastery',
        description: 'Unlock the highest tier Cosmic Filament',
        category: AchievementCategory.MASTERY,
        type: AchievementType.SINGLE,
        condition: () => {
          const gameStore = useGameStore()
          return gameStore.maxUnlockedTier >= 9 // 0-indexed, so 9 = tier 10
        },
        unlocked: false,
        completed: false,
        rarity: AchievementRarity.EPIC,
        reward: {
          type: 'multiplier',
          target: 'highest_tier_production',
          value: 2.0,
          description: 'Double highest tier filament production'
        }
      },
      
      {
        id: 'evolution_master',
        name: 'Evolution Master',
        description: 'Evolve a filament to maximum stage',
        category: AchievementCategory.MASTERY,
        type: AchievementType.SINGLE,
        condition: () => {
          const gameStore = useGameStore()
          return gameStore.filaments.some(f => f.evolution >= 3)
        },
        unlocked: false,
        completed: false,
        rarity: AchievementRarity.RARE,
        reward: {
          type: 'multiplier',
          target: 'evolution_effectiveness',
          value: 1.2,
          description: '+20% evolution bonus effectiveness'
        }
      },
      
      // Speed Achievements
      {
        id: 'speed_runner',
        name: 'Speed Runner',
        description: 'Reach 1st Starburst in under 5 minutes',
        category: AchievementCategory.SPEED,
        type: AchievementType.TIMED,
        condition: () => {
          const gameStore = useGameStore()
          const sessionTime = (Date.now() - sessionStart.value) / 1000
          return gameStore.starburstCount > 0 && sessionTime < 300
        },
        unlocked: false,
        completed: false,
        rarity: AchievementRarity.EPIC,
        reward: {
          type: 'multiplier',
          target: 'early_game_speed',
          value: 1.5,
          description: '+50% production for first hour'
        }
      },
      
      // Exploration Achievements
      {
        id: 'constellation_explorer',
        name: 'Constellation Explorer',
        description: 'Discover 5 different constellations',
        category: AchievementCategory.EXPLORATION,
        type: AchievementType.PROGRESS,
        condition: () => {
          // This would check railroad store for discovered constellations
          return false // Placeholder
        },
        unlocked: false,
        completed: false,
        maxProgress: 5,
        rarity: AchievementRarity.UNCOMMON,
        reward: {
          type: 'resource',
          target: 'star_rail',
          value: 5,
          description: 'Gain 5 Star Rails'
        }
      },
      
      // Collection Achievements
      {
        id: 'nebula_pattern_collector',
        name: 'Pattern Collector',
        description: 'Discover 10 different Nebula patterns',
        category: AchievementCategory.COLLECTION,
        type: AchievementType.PROGRESS,
        condition: () => {
          // This would check nebula store for discovered patterns
          return false // Placeholder
        },
        unlocked: false,
        completed: false,
        maxProgress: 10,
        rarity: AchievementRarity.RARE,
        reward: {
          type: 'unlock',
          target: 'advanced_patterns',
          description: 'Unlock advanced pattern combinations'
        }
      },
      
      // Secret Achievements
      {
        id: 'secret_harmony',
        name: 'Cosmic Harmony',
        description: 'Achieve perfect balance across all systems',
        category: AchievementCategory.SECRET,
        type: AchievementType.SINGLE,
        condition: () => {
          // Secret condition - requires specific combination of achievements
          return false // Hidden implementation
        },
        hidden: true,
        unlocked: false,
        completed: false,
        rarity: AchievementRarity.MYTHIC,
        reward: {
          type: 'multiplier',
          target: 'global_production',
          value: 3.0,
          description: 'Triple all production permanently'
        }
      }
    ]
    
    achievements.value.clear()
    achievementList.forEach(achievement => {
      achievements.value.set(achievement.id, achievement)
      
      if (achievement.type === AchievementType.PROGRESS) {
        achievementProgress.value.set(achievement.id, {
          achievementId: achievement.id,
          current: 0,
          target: achievement.maxProgress || 100,
          percentage: 0,
          lastUpdate: Date.now()
        })
      }
    })
  }
  
  // Initialize statistics
  function initializeStatistics() {
    const statisticsList: GameStatistic[] = [
      // General Statistics
      {
        id: 'total_time_played',
        name: 'Total Time Played',
        description: 'Total time spent playing the game',
        category: StatisticCategory.TIME,
        value: 0,
        type: StatisticType.DURATION,
        format: 'time',
        isVisible: true
      },
      
      {
        id: 'total_stardust_earned',
        name: 'Total Stardust Earned',
        description: 'Cumulative Stardust earned across all resets',
        category: StatisticCategory.PRODUCTION,
        value: 0,
        type: StatisticType.COUNTER,
        format: 'currency',
        isVisible: true
      },
      
      {
        id: 'total_clicks',
        name: 'Total Clicks',
        description: 'Total number of button clicks',
        category: StatisticCategory.GENERAL,
        value: 0,
        type: StatisticType.COUNTER,
        format: 'number',
        isVisible: true
      },
      
      // Production Statistics
      {
        id: 'highest_stardust_production',
        name: 'Highest Stardust/sec',
        description: 'Peak Stardust production rate achieved',
        category: StatisticCategory.PRODUCTION,
        value: 0,
        type: StatisticType.MAXIMUM,
        format: 'currency',
        isVisible: true
      },
      
      {
        id: 'average_production_rate',
        name: 'Average Production Rate',
        description: 'Average Stardust production over time',
        category: StatisticCategory.PRODUCTION,
        value: 0,
        type: StatisticType.AVERAGE,
        format: 'currency',
        isVisible: true
      },
      
      // Purchase Statistics  
      {
        id: 'total_filament_purchases',
        name: 'Total Filament Purchases',
        description: 'Total number of Cosmic Filaments purchased',
        category: StatisticCategory.PURCHASES,
        value: 0,
        type: StatisticType.COUNTER,
        format: 'number',
        isVisible: true
      },
      
      {
        id: 'most_expensive_purchase',
        name: 'Most Expensive Purchase',
        description: 'Highest cost item ever purchased',
        category: StatisticCategory.PURCHASES,
        value: 0,
        type: StatisticType.MAXIMUM,
        format: 'currency',
        isVisible: true
      },
      
      // Reset Statistics
      {
        id: 'total_starbursts',
        name: 'Total Starbursts',
        description: 'Number of Starbursts performed',
        category: StatisticCategory.RESETS,
        value: 0,
        type: StatisticType.COUNTER,
        format: 'number',
        isVisible: true
      },
      
      {
        id: 'fastest_starburst',
        name: 'Fastest Starburst',
        description: 'Shortest time to reach Starburst',
        category: StatisticCategory.RESETS,
        value: Infinity,
        type: StatisticType.MINIMUM,
        format: 'time',
        isVisible: true
      },
      
      // System Statistics
      {
        id: 'constellations_discovered',
        name: 'Constellations Discovered',
        description: 'Number of unique constellations found',
        category: StatisticCategory.SYSTEMS,
        value: 0,
        type: StatisticType.COUNTER,
        format: 'number',
        isVisible: true
      },
      
      {
        id: 'nebula_patterns_found',
        name: 'Nebula Patterns Found',
        description: 'Number of unique Nebula patterns discovered',
        category: StatisticCategory.SYSTEMS,
        value: 0,
        type: StatisticType.COUNTER,
        format: 'number',
        isVisible: true
      },
      
      // Efficiency Statistics
      {
        id: 'stardust_per_click',
        name: 'Stardust per Click',
        description: 'Average Stardust gained per interaction',
        category: StatisticCategory.EFFICIENCY,
        value: 0,
        type: StatisticType.AVERAGE,
        format: 'currency',
        precision: 2,
        isVisible: true
      },
      
      {
        id: 'achievement_completion_rate',
        name: 'Achievement Rate',
        description: 'Percentage of achievements completed',
        category: StatisticCategory.GENERAL,
        value: 0,
        type: StatisticType.PERCENTAGE,
        format: 'percentage',
        precision: 1,
        isVisible: true
      }
    ]
    
    statistics.value.clear()
    statisticsList.forEach(stat => {
      statistics.value.set(stat.id, stat)
    })
  }
  
  // Initialize milestone trackers
  function initializeMilestoneTrackers() {
    const trackers: MilestoneTracker[] = [
      {
        category: 'stardust_earned',
        current: 0,
        milestones: [1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e27, 1e30],
        completedMilestones: []
      },
      {
        category: 'starbursts_performed',
        current: 0,
        milestones: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
        completedMilestones: []
      },
      {
        category: 'filaments_purchased',
        current: 0,
        milestones: [10, 50, 100, 500, 1000, 5000, 10000, 50000],
        completedMilestones: []
      },
      {
        category: 'time_played',
        current: 0,
        milestones: [300, 1800, 3600, 10800, 21600, 86400, 604800], // 5min, 30min, 1h, 3h, 6h, 1d, 1w
        completedMilestones: []
      }
    ]
    
    milestoneTrackers.value.clear()
    trackers.forEach(tracker => {
      milestoneTrackers.value.set(tracker.category, tracker)
    })
  }
  
  // Computed values
  const totalAchievements = computed(() => achievements.value.size)
  
  const completedAchievements = computed(() => 
    Array.from(achievements.value.values()).filter(a => a.completed)
  )
  
  const availableAchievements = computed(() => 
    Array.from(achievements.value.values()).filter(a => a.unlocked && !a.completed && !a.hidden)
  )
  
  const hiddenAchievements = computed(() => 
    Array.from(achievements.value.values()).filter(a => a.hidden && !a.unlocked)
  )
  
  const achievementsByCategory = computed(() => {
    const grouped: Record<AchievementCategory, Achievement[]> = {} as any
    Object.values(AchievementCategory).forEach(cat => {
      grouped[cat] = Array.from(achievements.value.values())
        .filter(a => a.category === cat && (!a.hidden || a.unlocked))
    })
    return grouped
  })
  
  const completionPercentage = computed(() => {
    const total = totalAchievements.value
    const completed = completedAchievements.value.length
    return total > 0 ? Math.round((completed / total) * 100) : 0
  })
  
  const recentNotifications = computed(() => 
    notifications.value.filter(n => !n.dismissed).slice(-5)
  )
  
  // Achievement checking and unlocking
  function checkAchievements() {
    for (const achievement of achievements.value.values()) {
      if (achievement.completed) continue
      
      // Check if condition function exists
      if (!achievement.condition || typeof achievement.condition !== 'function') {
        console.warn(`Achievement ${achievement.id} has no condition function`)
        continue
      }
      
      // Check unlock conditions first
      if (!achievement.unlocked && achievement.condition()) {
        unlockAchievement(achievement.id)
      }
      
      // Check completion for unlocked achievements
      if (achievement.unlocked && !achievement.completed) {
        if (achievement.type === AchievementType.PROGRESS) {
          updateProgressAchievement(achievement.id)
        } else if (achievement.condition()) {
          completeAchievement(achievement.id)
        }
      }
    }
  }
  
  function unlockAchievement(achievementId: string) {
    const achievement = achievements.value.get(achievementId)
    if (!achievement || achievement.unlocked) return
    
    achievement.unlocked = true
    
    // Check if immediately completable
    if (achievement.condition()) {
      completeAchievement(achievementId)
    }
  }
  
  function completeAchievement(achievementId: string) {
    const achievement = achievements.value.get(achievementId)
    if (!achievement || achievement.completed) return
    
    achievement.completed = true
    achievement.completedAt = Date.now()
    
    // Apply reward if any
    if (achievement.reward) {
      applyAchievementReward(achievement.reward)
    }
    
    // Show notification
    if (showNotifications.value) {
      showAchievementNotification(achievement)
    }
    
    // Update statistics
    updateStatistic('achievement_completion_rate', completionPercentage.value)
  }
  
  function updateProgressAchievement(achievementId: string) {
    const achievement = achievements.value.get(achievementId)
    const progress = achievementProgress.value.get(achievementId)
    if (!achievement || !progress) return
    
    // This would need specific logic for each progress achievement
    // For now, using a placeholder implementation
    
    progress.lastUpdate = Date.now()
    progress.percentage = (progress.current / progress.target) * 100
    
    if (progress.current >= progress.target) {
      completeAchievement(achievementId)
    }
  }
  
  function applyAchievementReward(reward: any) {
    // Implementation would depend on reward type
    // This is a placeholder for reward application logic
    console.log('Applied achievement reward:', reward)
  }
  
  function showAchievementNotification(achievement: Achievement) {
    const notification: AchievementNotification = {
      achievement,
      timestamp: Date.now(),
      dismissed: false
    }
    
    notifications.value.push(notification)
    
    // Auto-dismiss after duration
    setTimeout(() => {
      dismissNotification(notification)
    }, notificationDuration.value)
  }
  
  function dismissNotification(notification: AchievementNotification) {
    notification.dismissed = true
    
    // Remove from array after a brief delay to allow for transition animations
    setTimeout(() => {
      const index = notifications.value.findIndex(n => n.timestamp === notification.timestamp)
      if (index !== -1) {
        notifications.value.splice(index, 1)
      }
    }, 500)
  }
  
  function dismissAllNotifications() {
    notifications.value.forEach(n => n.dismissed = true)
    
    // Clear all notifications after animation time
    setTimeout(() => {
      notifications.value = []
    }, 500)
  }
  
  // Statistics tracking
  function updateStatistic(statId: string, value: number | string) {
    const stat = statistics.value.get(statId)
    if (!stat) return
    
    switch (stat.type) {
      case StatisticType.COUNTER:
        stat.value = (stat.value as number) + (value as number)
        break
      case StatisticType.MAXIMUM:
        stat.value = Math.max(stat.value as number, value as number)
        break
      case StatisticType.MINIMUM:
        stat.value = Math.min(stat.value as number, value as number)
        break
      case StatisticType.AVERAGE:
        // Simple moving average implementation
        const currentAvg = stat.value as number
        const newValue = value as number
        stat.value = (currentAvg + newValue) / 2
        break
      default:
        stat.value = value
    }
  }
  
  function incrementStatistic(statId: string, amount: number = 1) {
    updateStatistic(statId, amount)
  }
  
  function recordMilestone(category: string, currentValue: number) {
    const tracker = milestoneTrackers.value.get(category)
    if (!tracker) return
    
    tracker.current = currentValue
    
    for (const milestone of tracker.milestones) {
      if (currentValue >= milestone && !tracker.completedMilestones.includes(milestone)) {
        tracker.completedMilestones.push(milestone)
        
        // Create dynamic achievement for milestone
        const milestoneAchievement: Achievement = {
          id: `milestone_${category}_${milestone}`,
          name: `${category} Milestone`,
          description: `Reach ${milestone} ${category}`,
          category: AchievementCategory.PROGRESSION,
          type: AchievementType.MILESTONE,
          condition: () => currentValue >= milestone,
          unlocked: true,
          completed: true,
          completedAt: Date.now(),
          rarity: AchievementRarity.COMMON
        }
        
        achievements.value.set(milestoneAchievement.id, milestoneAchievement)
        
        if (showNotifications.value) {
          showAchievementNotification(milestoneAchievement)
        }
      }
    }
    
    // Update next milestone
    tracker.nextMilestone = tracker.milestones.find(m => m > currentValue)
  }
  
  // Game event tracking
  function trackFilamentPurchase(_tier: number, cost: number, amount: number) {
    incrementStatistic('total_filament_purchases', amount)
    updateStatistic('most_expensive_purchase', cost)
    incrementStatistic('total_clicks', 1)
    
    recordMilestone('filaments_purchased', 
      Array.from(statistics.value.values())
        .find(s => s.id === 'total_filament_purchases')?.value as number || 0
    )
  }
  
  function trackStardustEarned(amount: number) {
    updateStatistic('total_stardust_earned', amount)
    recordMilestone('stardust_earned', 
      Array.from(statistics.value.values())
        .find(s => s.id === 'total_stardust_earned')?.value as number || 0
    )
  }
  
  function trackStarburst() {
    incrementStatistic('total_starbursts', 1)
    
    const timeSinceStart = (Date.now() - sessionStart.value) / 1000
    updateStatistic('fastest_starburst', timeSinceStart)
    
    recordMilestone('starbursts_performed', 
      Array.from(statistics.value.values())
        .find(s => s.id === 'total_starbursts')?.value as number || 0
    )
  }
  
  function trackProductionRate(rate: number) {
    updateStatistic('highest_stardust_production', rate)
    updateStatistic('average_production_rate', rate)
  }
  
  // Snapshot system
  function createSnapshot(): StatisticSnapshot {
    const snapshot: StatisticSnapshot = {
      timestamp: Date.now(),
      statistics: {},
      achievements: {
        total: totalAchievements.value,
        completed: completedAchievements.value.length,
        byCategory: {} as any,
        byRarity: {} as any
      }
    }
    
    // Capture statistics
    for (const [id, stat] of statistics.value) {
      snapshot.statistics[id] = stat.value
    }
    
    // Capture achievement data
    Object.values(AchievementCategory).forEach(cat => {
      snapshot.achievements.byCategory[cat] = achievementsByCategory.value[cat]?.length || 0
    })
    
    Object.values(AchievementRarity).forEach(rarity => {
      snapshot.achievements.byRarity[rarity] = completedAchievements.value
        .filter(a => a.rarity === rarity).length
    })
    
    return snapshot
  }
  
  function saveSnapshot() {
    const snapshot = createSnapshot()
    lastSnapshot.value = snapshot
    snapshotHistory.value.push(snapshot)
    
    // Keep only last 100 snapshots
    if (snapshotHistory.value.length > 100) {
      snapshotHistory.value = snapshotHistory.value.slice(-50)
    }
  }
  
  // Main tick function
  function tick() {
    checkAchievements()
    
    // Update time-based statistics
    const currentTime = Date.now()
    const sessionTime = (currentTime - sessionStart.value) / 1000
    updateStatistic('total_time_played', sessionTime)
    recordMilestone('time_played', sessionTime)
    
    // Save snapshot every 60 seconds
    if (!lastSnapshot.value || currentTime - lastSnapshot.value.timestamp > 60000) {
      saveSnapshot()
    }
  }
  
  // Save/Load
  function save() {
    return {
      achievements: Array.from(achievements.value.entries()),
      statistics: Array.from(statistics.value.entries()),
      achievementProgress: Array.from(achievementProgress.value.entries()),
      notifications: notifications.value.slice(-20), // Keep last 20 notifications
      milestoneTrackers: Array.from(milestoneTrackers.value.entries()),
      sessionStart: sessionStart.value,
      lastSnapshot: lastSnapshot.value,
      snapshotHistory: snapshotHistory.value.slice(-10), // Keep last 10 snapshots
      showNotifications: showNotifications.value,
      notificationDuration: notificationDuration.value,
      trackDetailedStats: trackDetailedStats.value
    }
  }
  
  function load(data: any) {
    if (!data) return
    
    // First, re-initialize achievements to restore condition functions
    initializeAchievements()
    
    // Then load saved states
    if (data.achievements) {
      const savedAchievements = new Map(data.achievements) as Map<string, any>
      savedAchievements.forEach((savedAchievement, id) => {
        const achievement = achievements.value.get(id)
        if (achievement && savedAchievement) {
          achievement.unlocked = savedAchievement.unlocked || false
          achievement.completed = savedAchievement.completed || false
        }
      })
    }
    
    if (data.statistics) {
      statistics.value = new Map(data.statistics)
    }
    
    if (data.achievementProgress) {
      achievementProgress.value = new Map(data.achievementProgress)
    }
    
    if (data.notifications) {
      notifications.value = data.notifications
    }
    
    if (data.milestoneTrackers) {
      milestoneTrackers.value = new Map(data.milestoneTrackers)
    }
    
    sessionStart.value = data.sessionStart || Date.now()
    lastSnapshot.value = data.lastSnapshot || null
    snapshotHistory.value = data.snapshotHistory || []
    showNotifications.value = data.showNotifications !== undefined ? data.showNotifications : true
    notificationDuration.value = data.notificationDuration || 5000
    trackDetailedStats.value = data.trackDetailedStats !== undefined ? data.trackDetailedStats : true
  }
  
  function reset() {
    achievements.value.clear()
    statistics.value.clear()
    achievementProgress.value.clear()
    notifications.value = []
    milestoneTrackers.value.clear()
    sessionStart.value = Date.now()
    lastSnapshot.value = null
    snapshotHistory.value = []
    
    initializeAchievements()
    initializeStatistics() 
    initializeMilestoneTrackers()
  }
  
  // Initialize
  initializeAchievements()
  initializeStatistics()
  initializeMilestoneTrackers()
  
  return {
    // State
    achievements,
    statistics,
    achievementProgress,
    notifications,
    milestoneTrackers,
    sessionStart,
    lastSnapshot,
    snapshotHistory,
    showNotifications,
    notificationDuration,
    trackDetailedStats,
    
    // Computed
    totalAchievements,
    completedAchievements,
    availableAchievements,
    hiddenAchievements,
    achievementsByCategory,
    completionPercentage,
    recentNotifications,
    
    // Actions
    checkAchievements,
    unlockAchievement,
    completeAchievement,
    updateProgressAchievement,
    showAchievementNotification,
    dismissNotification,
    dismissAllNotifications,
    updateStatistic,
    incrementStatistic,
    recordMilestone,
    trackFilamentPurchase,
    trackStardustEarned,
    trackStarburst,
    trackProductionRate,
    createSnapshot,
    saveSnapshot,
    tick,
    save,
    load,
    reset
  }
})