<template>
  <div class="events-container" v-if="unlocked">
    <h2 class="section-title">Special Events</h2>
    
    <div class="events-stats">
      <div class="stat-item">
        <span>Active Events:</span>
        <span>{{ currentActiveEvents.length }}/{{ maxActiveEvents }}</span>
      </div>
      <div class="stat-item">
        <span>Discovered Events:</span>
        <span>{{ discoveredEvents.size }}</span>
      </div>
      <div class="stat-item">
        <span>Global Multiplier:</span>
        <span>×{{ format(globalEventMultiplier) }}</span>
      </div>
    </div>
    
    <!-- Active Events -->
    <div class="active-events" v-if="currentActiveEvents.length > 0">
      <h3 class="subsection-title">Active Events</h3>
      <div class="events-grid">
        <div 
          v-for="event in currentActiveEvents"
          :key="event.id"
          :class="['event-card', `event-${event.rarity}`, 'active']"
        >
          <div class="event-header">
            <span class="event-name">{{ event.name }}</span>
            <span :class="['event-rarity', `rarity-${event.rarity}`]">
              {{ formatRarity(event.rarity) }}
            </span>
          </div>
          
          <div class="event-description">
            {{ event.description }}
          </div>
          
          <div class="event-timer">
            <div class="timer-bar">
              <div 
                class="timer-fill"
                :style="{ width: `${(event.remainingTime / event.duration) * 100}%` }"
              ></div>
            </div>
            <span class="timer-text">
              {{ formatTime(event.remainingTime) }} remaining
            </span>
          </div>
          
          <div class="event-effects">
            <h4>Effects:</h4>
            <div class="effects-list">
              <div 
                v-for="effect in event.effects"
                :key="effect.description"
                :class="['effect-item', `effect-${effect.type}`]"
              >
                {{ effect.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pending Choices -->
    <div class="pending-choices" v-if="currentPendingChoices.length > 0">
      <h3 class="subsection-title">Event Choices</h3>
      <div class="choices-grid">
        <div 
          v-for="choice in currentPendingChoices"
          :key="choice.id"
          class="choice-card"
        >
          <div class="choice-header">
            <h4 class="choice-title">{{ choice.title }}</h4>
            <div class="choice-timer" v-if="choice.timeLimit">
              {{ Math.ceil(choice.timeLimit) }}s to choose
            </div>
          </div>
          
          <div class="choice-description">
            {{ choice.description }}
          </div>
          
          <div class="choice-options">
            <button
              v-for="option in choice.options"
              :key="option.id"
              class="choice-option btn"
              @click="makeChoice(choice.id, option.id)"
            >
              <div class="option-text">{{ option.text }}</div>
              <div class="option-effects">
                <span 
                  v-for="effect in option.effects"
                  :key="effect.description"
                  class="option-effect"
                >
                  {{ effect.description }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Event History -->
    <div class="event-history" v-if="eventHistory.length > 0">
      <h3 class="subsection-title">Recent Events</h3>
      <div class="history-list">
        <div 
          v-for="(historyItem, index) in recentHistory"
          :key="index"
          class="history-item"
        >
          <div class="history-time">
            {{ formatTimestamp(historyItem.timestamp) }}
          </div>
          <div class="history-event">
            Event: {{ historyItem.eventId }}
          </div>
          <div class="history-choices" v-if="historyItem.choicesMade.length > 0">
            Choices: {{ historyItem.choicesMade.join(', ') }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Event Information -->
    <div class="event-info">
      <h3 class="subsection-title">Event System Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <h4>Event Types</h4>
          <p>• Cosmic Storm: Production vs Cost trade-offs</p>
          <p>• Stellar Alignment: Synergy and constellation boosts</p>
          <p>• Nebula Surge: Pattern creation bonuses</p>
          <p>• Temporal Flux: Time-based effects</p>
          <p>• Supernova Echo: Massive but rare bonuses</p>
        </div>
        <div class="info-item">
          <h4>Event Rarity</h4>
          <p>• Common: Frequent, small effects</p>
          <p>• Uncommon: Moderate effects</p>
          <p>• Rare: Strong effects, longer cooldowns</p>
          <p>• Epic: Very powerful, rare occurrence</p>
          <p>• Legendary: Game-changing, unique events</p>
        </div>
        <div class="info-item">
          <h4>Unlock Requirements</h4>
          <p>• System unlocks at 10 Starlight</p>
          <p>• Max active events increase with progression</p>
          <p>• Some events require specific milestones</p>
          <p>• Choices may have resource costs</p>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="locked-message">
    <h3>Special Events System</h3>
    <p>Unlock at 10 Starlight to discover cosmic events!</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useEventStore } from '@/stores/events'
import { format, formatTime } from '@/utils/formatting'

const eventStore = useEventStore()

const {
  unlocked,
  maxActiveEvents,
  globalEventMultiplier,
  discoveredEvents,
  eventHistory
} = storeToRefs(eventStore)

const {
  currentActiveEvents,
  currentPendingChoices
} = storeToRefs(eventStore)

const recentHistory = computed(() => {
  return eventHistory.value
    .slice(-10) // Last 10 events
    .reverse() // Most recent first
})

function formatRarity(rarity: string): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1)
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function makeChoice(choiceId: string, optionId: string) {
  eventStore.makeEventChoice(choiceId, optionId)
}
</script>

<style scoped>
.events-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.locked-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
  color: var(--text-muted);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-purple);
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 12px;
}

.events-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  min-width: 180px;
  font-size: 14px;
}

.stat-item span:first-child {
  color: var(--text-muted);
}

.stat-item span:last-child {
  color: var(--text-primary);
  font-family: 'Roboto Mono', monospace;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.event-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid var(--border-secondary);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.event-card.event-common {
  border-left: 4px solid var(--accent-green);
}

.event-card.event-uncommon {
  border-left: 4px solid var(--accent-blue);
}

.event-card.event-rare {
  border-left: 4px solid var(--accent-purple);
}

.event-card.event-epic {
  border-left: 4px solid var(--accent-orange);
}

.event-card.event-legendary {
  border-left: 4px solid var(--accent-yellow);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.event-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 16px;
}

.event-rarity {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: 600;
}

.rarity-common { background: var(--accent-green); color: var(--bg-primary); }
.rarity-uncommon { background: var(--accent-blue); color: var(--bg-primary); }
.rarity-rare { background: var(--accent-purple); color: var(--bg-primary); }
.rarity-epic { background: var(--accent-orange); color: var(--bg-primary); }
.rarity-legendary { background: var(--accent-yellow); color: var(--bg-primary); }

.event-description {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.4;
}

.event-timer {
  margin-bottom: 15px;
}

.timer-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.timer-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-green), var(--accent-blue));
  transition: width 0.3s ease;
}

.timer-text {
  font-size: 12px;
  color: var(--text-muted);
  font-family: 'Roboto Mono', monospace;
}

.event-effects h4 {
  color: var(--accent-blue);
  font-size: 14px;
  margin-bottom: 8px;
}

.effects-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.effect-item {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
}

.effect-production { border-left: 3px solid var(--accent-green); }
.effect-cost { border-left: 3px solid var(--accent-red); }
.effect-multiplier { border-left: 3px solid var(--accent-purple); }
.effect-special { border-left: 3px solid var(--accent-yellow); }

.choices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.choice-card {
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid var(--accent-orange);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 0 15px rgba(255, 140, 0, 0.2);
}

.choice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.choice-title {
  color: var(--accent-orange);
  font-size: 16px;
  font-weight: 600;
}

.choice-timer {
  font-size: 12px;
  color: var(--accent-red);
  font-family: 'Roboto Mono', monospace;
  font-weight: 600;
}

.choice-description {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.4;
}

.choice-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.choice-option {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-secondary);
  border-radius: 8px;
  padding: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
}

.choice-option:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-blue);
  transform: translateY(-2px);
}

.option-text {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.option-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-effect {
  font-size: 11px;
  color: var(--accent-green);
  background: rgba(0, 255, 0, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  padding: 10px;
  font-size: 12px;
}

.history-time {
  color: var(--text-muted);
  font-family: 'Roboto Mono', monospace;
}

.history-event {
  color: var(--text-primary);
  font-weight: 500;
}

.history-choices {
  color: var(--accent-blue);
  font-style: italic;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
}

.info-item h4 {
  color: var(--accent-blue);
  margin-bottom: 10px;
  font-size: 14px;
}

.info-item p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 4px 0;
}

@media (max-width: 768px) {
  .events-grid,
  .choices-grid {
    grid-template-columns: 1fr;
  }
  
  .events-stats {
    flex-direction: column;
    gap: 10px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>