import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  TooltipConfig, 
  HelpTopic, 
  Tutorial,
  ContextualHelp
} from '@/types/tooltips'
import { 
  TooltipCategory, 
  TooltipPosition, 
  TooltipTrigger,
  HelpCategory,
  TutorialCategory
} from '@/types/tooltips'
import { useGameStore } from './gameState'

export const useTooltipStore = defineStore('tooltips', () => {
  // Core state
  const activeTooltips = ref<Map<string, TooltipConfig>>(new Map())
  const hoveredElement = ref<string | null>(null)
  const clickedElement = ref<string | null>(null)
  const globalEnabled = ref(true)
  const categoryEnabled = ref<Map<TooltipCategory, boolean>>(new Map())
  const tooltipHistory = ref<string[]>([])
  
  // Tutorial state
  const activeTutorial = ref<string | null>(null)
  const currentStep = ref(0)
  const completedTutorials = ref<Set<string>>(new Set())
  const skippedTutorials = ref<Set<string>>(new Set())
  const tutorialEnabled = ref(true)
  
  // Help system state
  const helpTopics = ref<Map<string, HelpTopic>>(new Map())
  const tutorials = ref<Map<string, Tutorial>>(new Map())
  const contextualHelp = ref<Map<string, ContextualHelp>>(new Map())
  const searchQuery = ref('')
  const selectedCategory = ref<HelpCategory | null>(null)
  
  // Initialize default settings
  function initializeTooltipSettings() {
    Object.values(TooltipCategory).forEach(category => {
      categoryEnabled.value.set(category, true)
    })
  }
  
  // Initialize help topics
  function initializeHelpTopics() {
    const topics: HelpTopic[] = [
      // Getting Started
      {
        id: 'first_purchase',
        title: 'Making Your First Purchase',
        description: 'Learn how to buy your first Cosmic Filament',
        category: HelpCategory.GETTING_STARTED,
        content: [
          {
            type: 'text',
            content: 'Welcome to Aether! Your journey begins with purchasing Cosmic Filaments, which are the foundation of stellar production.'
          },
          {
            type: 'list',
            title: 'Steps to get started:',
            content: [
              'Wait for Stardust to accumulate (starts automatically)',
              'Click on "Orion Filament" when you have 10 Stardust',
              'Watch your production increase!',
              'Continue buying more filaments as you can afford them'
            ]
          },
          {
            type: 'tip',
            content: 'Buying more of the same filament type increases your production exponentially through milestone bonuses!'
          }
        ],
        relatedTopics: ['stardust_production', 'filament_hierarchy'],
        searchTerms: ['buy', 'purchase', 'first', 'start', 'orion', 'filament']
      },
      
      {
        id: 'stardust_production',
        title: 'Stardust Production',
        description: 'Understanding how Stardust is generated and used',
        category: HelpCategory.CORE_MECHANICS,
        content: [
          {
            type: 'text',
            content: 'Stardust is the fundamental currency of your stellar empire. It\'s produced automatically and can be spent on Cosmic Filaments.'
          },
          {
            type: 'formula',
            content: {
              formula: 'Production = Base × Filaments × Milestones × Multipliers',
              variables: {
                'Base': 'Starting production rate (1/sec)',
                'Filaments': 'Production from owned filaments',
                'Milestones': 'Bonus from reaching purchase milestones',
                'Multipliers': 'Various system bonuses (Starburst, Upgrades, etc.)'
              },
              example: 'With 10 Orion Filaments: 1 × 15 × 2 × 1 = 30 Stardust/sec'
            }
          },
          {
            type: 'tip',
            content: 'Production increases dramatically as you unlock new systems and reach higher milestones!'
          }
        ],
        relatedTopics: ['filament_hierarchy', 'starburst_system'],
        searchTerms: ['stardust', 'production', 'currency', 'generate']
      },
      
      {
        id: 'filament_hierarchy',
        title: 'Cosmic Filament Hierarchy',
        description: 'How different filament tiers work together',
        category: HelpCategory.CORE_MECHANICS,
        content: [
          {
            type: 'text',
            content: 'Cosmic Filaments are organized in a hierarchy where higher tiers boost the production of lower tiers.'
          },
          {
            type: 'table',
            content: {
              headers: ['Tier', 'Name', 'Base Cost', 'Production Multiplier'],
              rows: [
                ['1', 'Orion Filament', '10', '1.5x'],
                ['2', 'Eagle Filament', '100', '1.55x'],
                ['3', 'Crab Filament', '10,000', '1.6x'],
                ['4', 'Horsehead Filament', '1,000,000', '1.65x'],
                ['...', '...', '...', '...']
              ]
            }
          },
          {
            type: 'text',
            content: 'Each filament also provides synergy bonuses to adjacent tiers based on the formula:'
          },
          {
            type: 'formula',
            content: {
              formula: 'Synergy = (Lower Tier Count)^0.5 × (Higher Tier Count)^0.3',
              variables: {
                'Lower Tier Count': 'Number of filaments in the tier below',
                'Higher Tier Count': 'Number of filaments in the current tier'
              }
            }
          }
        ],
        relatedTopics: ['stardust_production', 'milestone_system'],
        searchTerms: ['filament', 'hierarchy', 'tier', 'synergy', 'bonus']
      },
      
      // Advanced Systems
      {
        id: 'starburst_system',
        title: 'Starburst Reset Mechanism',
        description: 'Understanding when and why to perform Starbursts',
        category: HelpCategory.ADVANCED_SYSTEMS,
        content: [
          {
            type: 'text',
            content: 'Starburst is your first prestige mechanic. It resets most progress but provides powerful multipliers to future production.'
          },
          {
            type: 'list',
            title: 'Starburst Benefits:',
            content: [
              'Permanent production multiplier that scales with Starlight',
              'Star Rail currency for constellation navigation',
              'Unlocks higher tier filaments',
              'Access to advanced systems'
            ]
          },
          {
            type: 'list',
            title: 'Starburst Conditions:',
            content: [
              '1st Starburst: Buy Tier 4 filament OR reach 1e20 Stardust',
              '2nd-9th: Reach 25 of highest tier filament',
              '10th+: Reach (50 + 5×count) Tier 10 filaments'
            ]
          },
          {
            type: 'warning',
            content: 'Starburst resets your Stardust and filament counts, but preserves milestones and evolution progress!'
          }
        ],
        unlockCondition: () => {
          const gameStore = useGameStore()
          return gameStore.starburstCount > 0 || gameStore.canStarburst
        },
        relatedTopics: ['starlight_system', 'filament_evolution'],
        searchTerms: ['starburst', 'reset', 'prestige', 'multiplier']
      },
      
      {
        id: 'starlight_system',
        title: 'Starlight and Major Resets',
        description: 'The deeper prestige layer with powerful upgrades',
        category: HelpCategory.ADVANCED_SYSTEMS,
        content: [
          {
            type: 'text',
            content: 'Starlight is earned through extensive soft resets and unlocks the most powerful systems in the game.'
          },
          {
            type: 'text',
            content: 'You gain 1 Starlight when your Stardust reaches 1e100 (100 Quintillion). This also provides Star Rail currency.'
          },
          {
            type: 'list',
            title: 'Starlight unlocks:',
            content: [
              '3+ Starlight: Star Memory System',
              '8+ Starlight: Upgrade Tree, Memory expansion',
              '15+ Starlight: Automation systems',
              '25+ Starlight: Priority preservation',
              '75+ Starlight: Condensation system'
            ]
          },
          {
            type: 'formula',
            content: {
              formula: 'Star Rails = floor((Starlight gained / 10)^0.5)',
              variables: {
                'Star Rails': 'Currency for constellation navigation',
                'Starlight gained': 'Total Starlight earned in current session'
              },
              example: 'Earning 40 Starlight gives floor((40/10)^0.5) = 2 Star Rails'
            }
          }
        ],
        unlockCondition: () => {
          const gameStore = useGameStore()
          return gameStore.starlight.amount.gte(1) || gameStore.canGetStarlight
        },
        relatedTopics: ['upgrade_tree', 'star_memory', 'railroad_system'],
        searchTerms: ['starlight', 'prestige', 'reset', 'upgrade', 'star rail']
      },
      
      // System-specific help
      {
        id: 'nebula_patterns',
        title: 'Nebula Grid Patterns',
        description: 'Creating and optimizing nebula formations',
        category: HelpCategory.ADVANCED_SYSTEMS,
        content: [
          {
            type: 'text',
            content: 'The Nebula Grid system allows you to place different cell types to create powerful pattern bonuses.'
          },
          {
            type: 'table',
            content: {
              headers: ['Pattern', 'Effect', 'Requirements'],
              rows: [
                ['Stellar Line', '+50% Stardust production', '3 Stardust cells in a line'],
                ['Cosmic Cross', '×2 all production', 'Cross with Multiplier center'],
                ['Nebular Diamond', '+25% filament boost', 'Diamond of Synergy cells'],
                ['Trinity Effect', '+100% hierarchy synergy', 'Triangle with Tier 1,5,10 filaments']
              ]
            }
          },
          {
            type: 'tip',
            content: 'Experiment with different combinations! Some patterns have hidden tier-specific requirements that provide massive bonuses.'
          }
        ],
        unlockCondition: () => {
          const gameStore = useGameStore()
          return gameStore.starlight.amount.gte(10)
        },
        relatedTopics: ['filament_hierarchy', 'optimization_guide'],
        searchTerms: ['nebula', 'grid', 'pattern', 'placement', 'bonus']
      }
    ]
    
    helpTopics.value.clear()
    topics.forEach(topic => {
      helpTopics.value.set(topic.id, topic)
    })
  }
  
  // Initialize tutorials
  function initializeTutorials() {
    const tutorialList: Tutorial[] = [
      {
        id: 'first_game',
        name: 'Welcome to Aether',
        description: 'Learn the basics of stellar management',
        category: TutorialCategory.FIRST_STEPS,
        autoStart: true,
        canRestart: true,
        steps: [
          {
            id: 'welcome',
            title: 'Welcome!',
            description: 'Welcome to Aether! This tutorial will guide you through your first stellar empire.',
            position: TooltipPosition.BOTTOM,
            skippable: true,
            next: 'check_stardust'
          },
          {
            id: 'check_stardust',
            title: 'Check Your Resources',
            description: 'Look at the resource panel at the top. You should see Stardust slowly accumulating.',
            target: '.resource-header',
            position: TooltipPosition.BOTTOM,
            action: 'highlight',
            condition: () => {
              const gameStore = useGameStore()
              return gameStore.stardust.amount.gte(1)
            },
            next: 'buy_first_filament'
          },
          {
            id: 'buy_first_filament',
            title: 'Buy Your First Filament',
            description: 'Click on "Orion Filament" to purchase it when you have 10 Stardust.',
            target: '[data-filament="0"]',
            position: TooltipPosition.RIGHT,
            action: 'click',
            condition: () => {
              const gameStore = useGameStore()
              return gameStore.filaments[0].owned > 0
            },
            next: 'production_increase'
          },
          {
            id: 'production_increase',
            title: 'Production Boost!',
            description: 'Notice how your Stardust production increased! This is the core loop of the game.',
            position: TooltipPosition.TOP,
            action: 'wait',
            next: 'buy_more'
          },
          {
            id: 'buy_more',
            title: 'Keep Growing',
            description: 'Continue buying more filaments to increase your production. Try to reach 10 Orion Filaments for a milestone bonus!',
            target: '[data-filament="0"]',
            position: TooltipPosition.RIGHT,
            condition: () => {
              const gameStore = useGameStore()
              return gameStore.filaments[0].owned >= 10
            },
            next: 'milestone_achieved'
          },
          {
            id: 'milestone_achieved',
            title: 'Milestone Achieved!',
            description: 'Great! You\'ve reached your first milestone. Every 10 filaments doubles that filament\'s production.',
            position: TooltipPosition.TOP,
            next: 'explore_tabs'
          },
          {
            id: 'explore_tabs',
            title: 'Explore the Galaxy',
            description: 'Use the tabs at the top to explore different systems. The Evolution tab will become important later!',
            target: '.tab-header',
            position: TooltipPosition.BOTTOM,
            skippable: true
          }
        ]
      },
      
      {
        id: 'starburst_intro',
        name: 'Your First Starburst',
        description: 'Learn about the prestige system',
        category: TutorialCategory.SYSTEM_INTRODUCTION,
        canRestart: true,
        unlockCondition: () => {
          const gameStore = useGameStore()
          return gameStore.canStarburst
        },
        steps: [
          {
            id: 'starburst_available',
            title: 'Starburst Available!',
            description: 'You can now perform your first Starburst! This is a major milestone that will reset some progress but provide permanent bonuses.',
            position: TooltipPosition.TOP,
            next: 'explain_starburst'
          },
          {
            id: 'explain_starburst',
            title: 'What is Starburst?',
            description: 'Starburst resets your Stardust and filament counts, but keeps milestones and provides a permanent production multiplier.',
            position: TooltipPosition.TOP,
            next: 'perform_starburst'
          },
          {
            id: 'perform_starburst',
            title: 'Perform Starburst',
            description: 'Go to the Reset tab and click "Perform Starburst" when you\'re ready!',
            target: '[data-tab="reset"]',
            position: TooltipPosition.BOTTOM,
            action: 'click'
          }
        ]
      }
    ]
    
    tutorials.value.clear()
    tutorialList.forEach(tutorial => {
      tutorials.value.set(tutorial.id, tutorial)
    })
  }
  
  // Computed values
  const availableHelpTopics = computed(() => {
    return Array.from(helpTopics.value.values()).filter(topic => {
      if (topic.unlockCondition && !topic.unlockCondition()) return false
      if (selectedCategory.value && topic.category !== selectedCategory.value) return false
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        return topic.title.toLowerCase().includes(query) ||
               topic.description.toLowerCase().includes(query) ||
               topic.searchTerms?.some(term => term.includes(query))
      }
      return true
    })
  })
  
  const availableTutorials = computed(() => {
    return Array.from(tutorials.value.values()).filter(tutorial => {
      return !tutorial.unlockCondition || tutorial.unlockCondition()
    })
  })
  
  const currentTutorial = computed(() => {
    return activeTutorial.value ? tutorials.value.get(activeTutorial.value) : null
  })
  
  const currentTutorialStep = computed(() => {
    if (!currentTutorial.value || currentStep.value >= currentTutorial.value.steps.length) return null
    return currentTutorial.value.steps[currentStep.value]
  })
  
  // Tooltip management
  function showTooltip(elementId: string, config: Partial<TooltipConfig>) {
    if (!globalEnabled.value) return
    
    const category = config.category || TooltipCategory.BASIC
    if (!categoryEnabled.value.get(category)) return
    
    const fullConfig: TooltipConfig = {
      id: elementId,
      title: config.title || '',
      content: config.content || '',
      category,
      position: config.position || TooltipPosition.AUTO,
      trigger: config.trigger || TooltipTrigger.HOVER,
      delay: config.delay || 500,
      maxWidth: config.maxWidth || 300,
      showArrow: config.showArrow !== false,
      persistent: config.persistent || false,
      dismissible: config.dismissible !== false
    }
    
    activeTooltips.value.set(elementId, fullConfig)
    tooltipHistory.value.push(elementId)
    
    // Keep history limited
    if (tooltipHistory.value.length > 50) {
      tooltipHistory.value = tooltipHistory.value.slice(-25)
    }
  }
  
  function hideTooltip(elementId: string) {
    activeTooltips.value.delete(elementId)
  }
  
  function hideAllTooltips() {
    activeTooltips.value.clear()
    hoveredElement.value = null
    clickedElement.value = null
  }
  
  function toggleTooltipCategory(category: TooltipCategory, enabled?: boolean) {
    const currentState = categoryEnabled.value.get(category) || false
    categoryEnabled.value.set(category, enabled !== undefined ? enabled : !currentState)
    
    // Hide tooltips of disabled categories
    if (!categoryEnabled.value.get(category)) {
      activeTooltips.value.forEach((config, id) => {
        if (config.category === category) {
          hideTooltip(id)
        }
      })
    }
  }
  
  // Tutorial management
  function startTutorial(tutorialId: string) {
    const tutorial = tutorials.value.get(tutorialId)
    if (!tutorial || !tutorialEnabled.value) return false
    
    if (tutorial.unlockCondition && !tutorial.unlockCondition()) return false
    
    activeTutorial.value = tutorialId
    currentStep.value = 0
    return true
  }
  
  function nextTutorialStep() {
    if (!currentTutorial.value) return false
    
    if (currentStep.value < currentTutorial.value.steps.length - 1) {
      currentStep.value++
      return true
    } else {
      completeTutorial()
      return false
    }
  }
  
  function previousTutorialStep() {
    if (currentStep.value > 0) {
      currentStep.value--
      return true
    }
    return false
  }
  
  function skipTutorial() {
    if (!currentTutorial.value) return
    
    skippedTutorials.value.add(currentTutorial.value.id)
    activeTutorial.value = null
    currentStep.value = 0
  }
  
  function completeTutorial() {
    if (!currentTutorial.value) return
    
    completedTutorials.value.add(currentTutorial.value.id)
    activeTutorial.value = null
    currentStep.value = 0
  }
  
  function resetTutorial(tutorialId: string) {
    completedTutorials.value.delete(tutorialId)
    skippedTutorials.value.delete(tutorialId)
  }
  
  // Help system
  function getHelpTopic(topicId: string): HelpTopic | undefined {
    return helpTopics.value.get(topicId)
  }
  
  function searchHelp(query: string) {
    searchQuery.value = query
  }
  
  function filterByCategory(category: HelpCategory | null) {
    selectedCategory.value = category
  }
  
  // Auto-tutorial checking
  function checkAutoTutorials() {
    if (!tutorialEnabled.value || activeTutorial.value) return
    
    for (const tutorial of tutorials.value.values()) {
      if (tutorial.autoStart && 
          !completedTutorials.value.has(tutorial.id) && 
          !skippedTutorials.value.has(tutorial.id) &&
          (!tutorial.unlockCondition || tutorial.unlockCondition())) {
        startTutorial(tutorial.id)
        break
      }
    }
  }
  
  function tick() {
    checkAutoTutorials()
    
    // Check tutorial step conditions
    if (currentTutorialStep.value?.condition && currentTutorialStep.value.condition()) {
      nextTutorialStep()
    }
  }
  
  // Save/Load
  function save() {
    return {
      globalEnabled: globalEnabled.value,
      categoryEnabled: Array.from(categoryEnabled.value.entries()),
      tooltipHistory: tooltipHistory.value.slice(-10), // Save last 10
      activeTutorial: activeTutorial.value,
      currentStep: currentStep.value,
      completedTutorials: Array.from(completedTutorials.value),
      skippedTutorials: Array.from(skippedTutorials.value),
      tutorialEnabled: tutorialEnabled.value,
      searchQuery: searchQuery.value,
      selectedCategory: selectedCategory.value
    }
  }
  
  function load(data: any) {
    if (!data) return
    
    globalEnabled.value = data.globalEnabled !== undefined ? data.globalEnabled : true
    tutorialEnabled.value = data.tutorialEnabled !== undefined ? data.tutorialEnabled : true
    
    if (data.categoryEnabled) {
      categoryEnabled.value.clear()
      data.categoryEnabled.forEach(([category, enabled]: [TooltipCategory, boolean]) => {
        categoryEnabled.value.set(category, enabled)
      })
    }
    
    if (data.tooltipHistory) {
      tooltipHistory.value = data.tooltipHistory
    }
    
    if (data.completedTutorials) {
      completedTutorials.value = new Set(data.completedTutorials)
    }
    
    if (data.skippedTutorials) {
      skippedTutorials.value = new Set(data.skippedTutorials)
    }
    
    searchQuery.value = data.searchQuery || ''
    selectedCategory.value = data.selectedCategory || null
  }
  
  function reset() {
    activeTooltips.value.clear()
    hoveredElement.value = null
    clickedElement.value = null
    globalEnabled.value = true
    categoryEnabled.value.clear()
    tooltipHistory.value = []
    activeTutorial.value = null
    currentStep.value = 0
    completedTutorials.value.clear()
    skippedTutorials.value.clear()
    tutorialEnabled.value = true
    searchQuery.value = ''
    selectedCategory.value = null
    
    initializeTooltipSettings()
  }
  
  // Initialize
  initializeTooltipSettings()
  initializeHelpTopics()
  initializeTutorials()
  
  return {
    // State
    activeTooltips,
    hoveredElement,
    clickedElement,
    globalEnabled,
    categoryEnabled,
    tooltipHistory,
    activeTutorial,
    currentStep,
    completedTutorials,
    skippedTutorials,
    tutorialEnabled,
    helpTopics,
    tutorials,
    contextualHelp,
    searchQuery,
    selectedCategory,
    
    // Computed
    availableHelpTopics,
    availableTutorials,
    currentTutorial,
    currentTutorialStep,
    
    // Actions
    showTooltip,
    hideTooltip,
    hideAllTooltips,
    toggleTooltipCategory,
    startTutorial,
    nextTutorialStep,
    previousTutorialStep,
    skipTutorial,
    completeTutorial,
    resetTutorial,
    getHelpTopic,
    searchHelp,
    filterByCategory,
    tick,
    save,
    load,
    reset
  }
})