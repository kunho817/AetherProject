export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  type: AchievementType
  condition: () => boolean
  reward?: AchievementReward
  hidden?: boolean
  prerequisite?: string[]
  unlocked: boolean
  completed: boolean
  completedAt?: number
  progress?: number
  maxProgress?: number
  rarity: AchievementRarity
}

export enum AchievementCategory {
  PRODUCTION = 'production',
  PROGRESSION = 'progression', 
  EXPLORATION = 'exploration',
  MASTERY = 'mastery',
  SPEED = 'speed',
  COLLECTION = 'collection',
  SPECIAL = 'special',
  SECRET = 'secret'
}

export enum AchievementType {
  SINGLE = 'single',           // One-time unlock
  PROGRESS = 'progress',       // Progress towards goal
  MILESTONE = 'milestone',     // Reaching specific values
  CUMULATIVE = 'cumulative',   // Total accumulated
  STREAK = 'streak',          // Consecutive actions
  TIMED = 'timed'             // Within time limit
}

export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon', 
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic'
}

export interface AchievementReward {
  type: 'multiplier' | 'resource' | 'unlock' | 'cosmetic'
  target?: string
  value?: number
  description: string
}

export interface GameStatistic {
  id: string
  name: string
  description: string
  category: StatisticCategory
  value: number | string
  type: StatisticType
  format?: 'number' | 'time' | 'percentage' | 'currency' | 'custom'
  precision?: number
  isVisible: boolean
  trackingStart?: number
}

export enum StatisticCategory {
  GENERAL = 'general',
  PRODUCTION = 'production',
  PURCHASES = 'purchases',
  RESETS = 'resets',
  SYSTEMS = 'systems',
  TIME = 'time',
  EFFICIENCY = 'efficiency',
  RECORDS = 'records'
}

export enum StatisticType {
  COUNTER = 'counter',         // Simple incrementing counter
  MAXIMUM = 'maximum',         // Track highest value
  MINIMUM = 'minimum',         // Track lowest value
  AVERAGE = 'average',         // Rolling average
  RATE = 'rate',              // Per second rate
  PERCENTAGE = 'percentage',   // Calculated percentage
  DURATION = 'duration',      // Time-based tracking
  COLLECTION = 'collection'    // Set of items
}

export interface AchievementProgress {
  achievementId: string
  current: number
  target: number
  percentage: number
  lastUpdate: number
}

export interface StatisticSnapshot {
  timestamp: number
  statistics: Record<string, number | string>
  achievements: {
    total: number
    completed: number
    byCategory: Record<AchievementCategory, number>
    byRarity: Record<AchievementRarity, number>
  }
}

export interface AchievementNotification {
  achievement: Achievement
  timestamp: number
  dismissed: boolean
}

export interface MilestoneTracker {
  category: string
  current: number
  milestones: number[]
  nextMilestone?: number
  completedMilestones: number[]
}