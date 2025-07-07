<template>
  <div class="help-system">
    <div class="help-header">
      <h2 class="help-title">Help & Tutorials</h2>
      <div class="help-controls">
        <button 
          class="btn btn-tutorial" 
          @click="showTutorialSelector = !showTutorialSelector"
          :disabled="availableTutorials.length === 0"
        >
          Tutorials
        </button>
        <button 
          class="btn btn-settings" 
          @click="showSettings = !showSettings"
        >
          Settings
        </button>
      </div>
    </div>
    
    <!-- Tutorial Selector -->
    <div v-if="showTutorialSelector" class="tutorial-selector">
      <h3 class="section-title">Available Tutorials</h3>
      <div class="tutorial-grid">
        <div 
          v-for="tutorial in availableTutorials"
          :key="tutorial.id"
          :class="['tutorial-card', {
            'completed': completedTutorials.has(tutorial.id),
            'skipped': skippedTutorials.has(tutorial.id),
            'active': activeTutorial === tutorial.id
          }]"
        >
          <div class="tutorial-header">
            <span class="tutorial-name">{{ tutorial.name }}</span>
            <span :class="['tutorial-status', getTutorialStatus(tutorial.id)]">
              {{ getTutorialStatusText(tutorial.id) }}
            </span>
          </div>
          <div class="tutorial-description">{{ tutorial.description }}</div>
          <div class="tutorial-actions">
            <button 
              v-if="!completedTutorials.has(tutorial.id) && activeTutorial !== tutorial.id"
              class="btn btn-small"
              @click="startTutorial(tutorial.id)"
            >
              Start
            </button>
            <button 
              v-if="activeTutorial === tutorial.id"
              class="btn btn-small btn-danger"
              @click="skipTutorial()"
            >
              Skip
            </button>
            <button 
              v-if="completedTutorials.has(tutorial.id) && tutorial.canRestart"
              class="btn btn-small btn-secondary"
              @click="resetTutorial(tutorial.id)"
            >
              Restart
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Active Tutorial Display -->
    <div v-if="currentTutorial && currentTutorialStep" class="active-tutorial">
      <div class="tutorial-progress">
        <h3>{{ currentTutorial.name }}</h3>
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${((currentStep + 1) / currentTutorial.steps.length) * 100}%` }"
          ></div>
        </div>
        <span class="progress-text">
          Step {{ currentStep + 1 }} of {{ currentTutorial.steps.length }}
        </span>
      </div>
      
      <div class="tutorial-step">
        <h4>{{ currentTutorialStep.title }}</h4>
        <p>{{ currentTutorialStep.description }}</p>
        
        <div class="tutorial-controls">
          <button 
            class="btn btn-small btn-secondary"
            @click="previousTutorialStep()"
            :disabled="currentStep === 0"
          >
            Previous
          </button>
          <button 
            class="btn btn-small"
            @click="nextTutorialStep()"
          >
            Next
          </button>
          <button 
            v-if="currentTutorialStep.skippable"
            class="btn btn-small btn-danger"
            @click="skipTutorial()"
          >
            Skip Tutorial
          </button>
        </div>
      </div>
    </div>
    
    <!-- Help Search and Navigation -->
    <div class="help-navigation">
      <div class="search-section">
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Search help topics..."
          class="search-input"
        >
        <button 
          v-if="searchQuery"
          class="btn btn-small btn-clear"
          @click="searchQuery = ''"
        >
          Clear
        </button>
      </div>
      
      <div class="category-filters">
        <button 
          v-for="category in Object.values(HelpCategory)"
          :key="category"
          :class="['category-button', { 'active': selectedCategory === category }]"
          @click="filterByCategory(selectedCategory === category ? null : category)"
        >
          {{ formatCategoryName(category) }}
        </button>
      </div>
    </div>
    
    <!-- Help Topics -->
    <div class="help-topics">
      <h3 class="section-title">
        Help Topics
        <span v-if="selectedCategory">({{ formatCategoryName(selectedCategory) }})</span>
        <span v-if="searchQuery">(Search: "{{ searchQuery }}")</span>
      </h3>
      
      <div v-if="availableHelpTopics.length === 0" class="no-results">
        <p>No help topics found matching your criteria.</p>
        <button class="btn btn-secondary" @click="clearFilters">Clear Filters</button>
      </div>
      
      <div v-else class="topics-list">
        <div 
          v-for="topic in availableHelpTopics"
          :key="topic.id"
          :class="['topic-card', { 'expanded': expandedTopic === topic.id }]"
          @click="toggleTopic(topic.id)"
        >
          <div class="topic-header">
            <span class="topic-title">{{ topic.title }}</span>
            <span :class="['topic-category', `category-${topic.category}`]">
              {{ formatCategoryName(topic.category) }}
            </span>
          </div>
          <div class="topic-description">{{ topic.description }}</div>
          
          <div v-if="expandedTopic === topic.id" class="topic-content">
            <div 
              v-for="(content, index) in topic.content"
              :key="index"
              :class="['content-section', `content-${content.type}`]"
            >
              <h4 v-if="content.title" class="content-title">{{ content.title }}</h4>
              
              <div v-if="content.type === 'text'" class="content-text">
                {{ content.content as string }}
              </div>
              
              <ul v-else-if="content.type === 'list'" class="content-list">
                <li v-for="item in content.content as string[]" :key="item">
                  {{ item }}
                </li>
              </ul>
              
              <div v-else-if="content.type === 'formula'" class="content-formula">
                <div class="formula-expression">
                  {{ (content.content as any).formula }}
                </div>
                <div class="formula-variables">
                  <div 
                    v-for="(desc, variable) in (content.content as any).variables"
                    :key="variable"
                    class="variable-item"
                  >
                    <strong>{{ variable }}:</strong> {{ desc }}
                  </div>
                </div>
                <div v-if="(content.content as any).example" class="formula-example">
                  <strong>Example:</strong> {{ (content.content as any).example }}
                </div>
              </div>
              
              <div v-else-if="content.type === 'table'" class="content-table">
                <table>
                  <thead>
                    <tr>
                      <th v-for="header in (content.content as any).headers" :key="header">
                        {{ header }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, rowIndex) in (content.content as any).rows" :key="rowIndex">
                      <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                        {{ cell }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div v-else-if="content.type === 'tip'" class="content-tip">
                <div class="tip-icon">💡</div>
                <div class="tip-text">{{ content.content as string }}</div>
              </div>
              
              <div v-else-if="content.type === 'warning'" class="content-warning">
                <div class="warning-icon">⚠️</div>
                <div class="warning-text">{{ content.content as string }}</div>
              </div>
            </div>
            
            <div v-if="topic.relatedTopics && topic.relatedTopics.length > 0" class="related-topics">
              <h4>Related Topics:</h4>
              <div class="related-links">
                <button 
                  v-for="relatedId in topic.relatedTopics"
                  :key="relatedId"
                  class="btn btn-small btn-link"
                  @click.stop="showTopic(relatedId)"
                >
                  {{ getHelpTopic(relatedId)?.title || relatedId }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Tooltip Settings -->
    <div v-if="showSettings" class="tooltip-settings">
      <h3 class="section-title">Tooltip & Help Settings</h3>
      
      <div class="setting-group">
        <label class="setting-label">
          <input type="checkbox" v-model="globalEnabled">
          Enable All Tooltips
        </label>
      </div>
      
      <div class="setting-group">
        <label class="setting-label">
          <input type="checkbox" v-model="tutorialEnabled">
          Enable Tutorials
        </label>
      </div>
      
      <div class="category-settings">
        <h4>Tooltip Categories:</h4>
        <div 
          v-for="category in Object.values(TooltipCategory)"
          :key="category"
          class="category-setting"
        >
          <label class="setting-label">
            <input 
              type="checkbox" 
              :checked="categoryEnabled.get(category)"
              @change="toggleTooltipCategory(category, ($event.target as HTMLInputElement).checked)"
            >
            {{ formatCategoryName(category) }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTooltipStore } from '@/stores/tooltips'
import { HelpCategory, TooltipCategory } from '@/types/tooltips'

const tooltipStore = useTooltipStore()

const {
  globalEnabled,
  categoryEnabled,
  activeTutorial,
  currentStep,
  completedTutorials,
  skippedTutorials,
  tutorialEnabled,
  searchQuery,
  selectedCategory
} = storeToRefs(tooltipStore)

const {
  availableHelpTopics,
  availableTutorials,
  currentTutorial,
  currentTutorialStep
} = storeToRefs(tooltipStore)

// Local state
const showTutorialSelector = ref(false)
const showSettings = ref(false)
const expandedTopic = ref<string | null>(null)

function formatCategoryName(category: string): string {
  return category.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function getTutorialStatus(tutorialId: string): string {
  if (activeTutorial.value === tutorialId) return 'active'
  if (completedTutorials.value.has(tutorialId)) return 'completed'
  if (skippedTutorials.value.has(tutorialId)) return 'skipped'
  return 'available'
}

function getTutorialStatusText(tutorialId: string): string {
  const status = getTutorialStatus(tutorialId)
  switch (status) {
    case 'active': return 'In Progress'
    case 'completed': return 'Completed'
    case 'skipped': return 'Skipped'
    default: return 'Available'
  }
}

function toggleTopic(topicId: string) {
  expandedTopic.value = expandedTopic.value === topicId ? null : topicId
}

function showTopic(topicId: string) {
  expandedTopic.value = topicId
  // Scroll to topic
  setTimeout(() => {
    const element = document.querySelector(`[data-topic="${topicId}"]`)
    element?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = null
}

// Expose store methods
const startTutorial = tooltipStore.startTutorial
const nextTutorialStep = tooltipStore.nextTutorialStep
const previousTutorialStep = tooltipStore.previousTutorialStep
const skipTutorial = tooltipStore.skipTutorial
const resetTutorial = tooltipStore.resetTutorial
const getHelpTopic = tooltipStore.getHelpTopic
const filterByCategory = tooltipStore.filterByCategory
const toggleTooltipCategory = tooltipStore.toggleTooltipCategory
</script>

<style scoped>
.help-system {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 100%;
  overflow-y: auto;
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.help-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-purple);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.help-controls {
  display: flex;
  gap: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 12px;
}

.tutorial-selector {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
}

.tutorial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.tutorial-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid var(--border-secondary);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tutorial-card.completed {
  border-color: var(--accent-green);
  background: rgba(0, 255, 0, 0.1);
}

.tutorial-card.skipped {
  border-color: var(--accent-orange);
  background: rgba(255, 140, 0, 0.1);
}

.tutorial-card.active {
  border-color: var(--accent-blue);
  background: rgba(0, 180, 216, 0.1);
  box-shadow: 0 0 15px rgba(0, 180, 216, 0.3);
}

.tutorial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.tutorial-name {
  font-weight: 600;
  color: var(--text-primary);
}

.tutorial-status {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: 600;
}

.tutorial-status.available { background: var(--border-secondary); }
.tutorial-status.active { background: var(--accent-blue); color: white; }
.tutorial-status.completed { background: var(--accent-green); color: white; }
.tutorial-status.skipped { background: var(--accent-orange); color: white; }

.tutorial-description {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 12px;
}

.tutorial-actions {
  display: flex;
  gap: 8px;
}

.active-tutorial {
  background: linear-gradient(135deg, rgba(0, 180, 216, 0.1), rgba(114, 9, 183, 0.05));
  border: 2px solid var(--accent-blue);
  border-radius: 12px;
  padding: 20px;
}

.tutorial-progress {
  margin-bottom: 15px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple));
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--text-muted);
  font-family: 'Roboto Mono', monospace;
}

.tutorial-step h4 {
  color: var(--accent-blue);
  margin-bottom: 10px;
}

.tutorial-controls {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.help-navigation {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.search-section {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border-secondary);
  border-radius: 6px;
  padding: 10px 15px;
  color: var(--text-primary);
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 2px rgba(0, 180, 216, 0.2);
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 20px;
  padding: 6px 16px;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.category-button.active {
  background: var(--accent-blue);
  color: white;
  border-color: var(--accent-blue);
}

.help-topics {
  flex: 1;
}

.no-results {
  text-align: center;
  color: var(--text-muted);
  padding: 40px;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.topic-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.topic-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-blue);
}

.topic-card.expanded {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-blue);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.topic-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 15px;
}

.topic-category {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  font-weight: 600;
  background: var(--border-secondary);
  color: var(--text-muted);
}

.topic-description {
  color: var(--text-secondary);
  font-size: 13px;
}

.topic-content {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--border-secondary);
}

.content-section {
  margin-bottom: 15px;
}

.content-title {
  color: var(--accent-blue);
  font-size: 14px;
  margin-bottom: 8px;
}

.content-text {
  color: var(--text-primary);
  line-height: 1.5;
}

.content-list {
  margin: 0;
  padding-left: 20px;
  color: var(--text-primary);
}

.content-list li {
  margin: 6px 0;
}

.content-formula {
  background: rgba(255, 215, 0, 0.1);
  border-left: 4px solid var(--accent-yellow);
  padding: 15px;
  border-radius: 6px;
  font-family: 'Roboto Mono', monospace;
}

.formula-expression {
  font-weight: 600;
  color: var(--accent-yellow);
  margin-bottom: 10px;
  font-size: 14px;
}

.formula-variables {
  margin: 10px 0;
}

.variable-item {
  margin: 4px 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.formula-example {
  margin-top: 10px;
  font-size: 12px;
  color: var(--accent-green);
}

.content-table table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
}

.content-table th,
.content-table td {
  border: 1px solid var(--border-secondary);
  padding: 8px;
  text-align: left;
  font-size: 12px;
}

.content-table th {
  background: rgba(255, 255, 255, 0.1);
  font-weight: 600;
  color: var(--accent-blue);
}

.content-tip {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(0, 255, 0, 0.1);
  border-left: 4px solid var(--accent-green);
  padding: 12px;
  border-radius: 6px;
}

.tip-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.tip-text {
  color: var(--text-primary);
  line-height: 1.4;
}

.content-warning {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(255, 0, 0, 0.1);
  border-left: 4px solid var(--accent-red);
  padding: 12px;
  border-radius: 6px;
}

.warning-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.warning-text {
  color: var(--text-primary);
  line-height: 1.4;
}

.related-topics {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--border-secondary);
}

.related-topics h4 {
  color: var(--accent-blue);
  font-size: 13px;
  margin-bottom: 8px;
}

.related-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-link {
  background: none;
  border: 1px solid var(--accent-blue);
  color: var(--accent-blue);
}

.btn-link:hover {
  background: var(--accent-blue);
  color: white;
}

.tooltip-settings {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
}

.setting-group {
  margin-bottom: 15px;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
}

.category-settings h4 {
  color: var(--accent-blue);
  margin-bottom: 10px;
  font-size: 14px;
}

.category-setting {
  margin: 8px 0;
}

@media (max-width: 768px) {
  .tutorial-grid {
    grid-template-columns: 1fr;
  }
  
  .help-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .category-filters {
    justify-content: center;
  }
}
</style>