export interface TooltipConfig {
  id: string
  title: string
  content: string
  category: TooltipCategory
  position: TooltipPosition
  trigger: TooltipTrigger
  delay?: number
  maxWidth?: number
  showArrow?: boolean
  persistent?: boolean
  dismissible?: boolean
}

export enum TooltipCategory {
  BASIC = 'basic',
  MECHANICS = 'mechanics',
  SYSTEMS = 'systems',
  PROGRESSION = 'progression',
  ENDGAME = 'endgame',
  FORMULAS = 'formulas'
}

export enum TooltipPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
  AUTO = 'auto'
}

export enum TooltipTrigger {
  HOVER = 'hover',
  CLICK = 'click',
  FOCUS = 'focus',
  MANUAL = 'manual'
}

export interface HelpTopic {
  id: string
  title: string
  description: string
  category: HelpCategory
  content: HelpContent[]
  prerequisites?: string[]
  unlockCondition?: () => boolean
  relatedTopics?: string[]
  searchTerms?: string[]
}

export enum HelpCategory {
  GETTING_STARTED = 'getting_started',
  CORE_MECHANICS = 'core_mechanics',
  ADVANCED_SYSTEMS = 'advanced_systems',
  OPTIMIZATION = 'optimization',
  LAYER_TRANSITION = 'layer_transition',
  TROUBLESHOOTING = 'troubleshooting'
}

export interface HelpContent {
  type: 'text' | 'list' | 'formula' | 'image' | 'table' | 'tip' | 'warning'
  content: string | string[] | HelpTable | HelpFormula
  title?: string
}

export interface HelpTable {
  headers: string[]
  rows: string[][]
}

export interface HelpFormula {
  formula: string
  variables: Record<string, string>
  example?: string
}

export interface TutorialStep {
  id: string
  title: string
  description: string
  target?: string // CSS selector
  position: TooltipPosition
  action?: 'highlight' | 'click' | 'input' | 'wait'
  condition?: () => boolean
  next?: string
  skippable?: boolean
}

export interface Tutorial {
  id: string
  name: string
  description: string
  category: TutorialCategory
  steps: TutorialStep[]
  unlockCondition?: () => boolean
  autoStart?: boolean
  canRestart?: boolean
}

export enum TutorialCategory {
  FIRST_STEPS = 'first_steps',
  SYSTEM_INTRODUCTION = 'system_introduction',
  ADVANCED_FEATURES = 'advanced_features',
  OPTIMIZATION_GUIDE = 'optimization_guide'
}

export interface TooltipState {
  activeTooltips: Map<string, TooltipConfig>
  hoveredElement: string | null
  clickedElement: string | null
  globalEnabled: boolean
  categoryEnabled: Map<TooltipCategory, boolean>
  tooltipHistory: string[]
  tutorialState: TutorialState
}

export interface TutorialState {
  activeTutorial: string | null
  currentStep: number
  completedTutorials: Set<string>
  skippedTutorials: Set<string>
  tutorialEnabled: boolean
}

export interface ContextualHelp {
  elementId: string
  helpTopicId: string
  priority: number
  condition?: () => boolean
}