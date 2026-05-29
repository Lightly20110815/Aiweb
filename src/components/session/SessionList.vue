<script setup lang="ts">
import { useSessionsStore } from '@/stores/sessions'
import { useProvidersStore } from '@/stores/providers'
import SessionItem from './SessionItem.vue'

const sessionsStore = useSessionsStore()
const providersStore = useProvidersStore()

function newChat() {
  const provider = providersStore.defaultProvider
  if (!provider) { window.dispatchEvent(new CustomEvent('open-settings')); return }
  sessionsStore.createSession(provider.id, provider.defaultModel || provider.models[0] || '')
}
function handleDelete(id: string) { sessionsStore.deleteSession(id) }
function handleRename(id: string, title: string) { sessionsStore.renameSession(id, title) }
</script>

<template>
  <div class="session-list">
    <button class="new-chat-btn" @click="newChat">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      <span>新对话</span>
    </button>

    <div class="sessions-scroll">
      <div v-if="sessionsStore.sessions.length === 0" class="empty-state">
        <p class="empty-title">还没有对话</p>
        <p class="empty-desc">从一次提问开始。</p>
        <button class="empty-btn" @click="newChat">
          <template v-if="providersStore.defaultProvider">开始新对话</template>
          <template v-else>配置 Provider</template>
        </button>
      </div>
      <SessionItem
        v-for="s in sessionsStore.sortedSessions"
        :key="s.id"
        :session="s"
        :active="s.id === sessionsStore.activeSessionId"
        @select="sessionsStore.setActiveSession"
        @delete="handleDelete"
        @rename="handleRename"
      />
    </div>

    <div class="session-count" v-if="sessionsStore.sessions.length > 0">
      {{ sessionsStore.sessions.length }} 个对话
    </div>
  </div>
</template>

<style scoped>
.session-list { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.new-chat-btn {
  display: flex; align-items: center; justify-content: center; gap: var(--space-2);
  width: 100%; padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border); border-radius: var(--radius-md);
  background: var(--panel-solid); color: var(--text);
  font-size: var(--text-sm); font-weight: 540; font-family: var(--font-sans);
  cursor: pointer; transition: all var(--transition-fast);
}
.new-chat-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--panel-hover); }

.sessions-scroll { flex: 1; overflow-y: auto; margin-top: var(--space-3); display: flex; flex-direction: column; gap: 2px; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--space-7) var(--space-4); text-align: center; }
.empty-title { font-size: var(--text-base); font-weight: 500; color: var(--text-muted); margin-bottom: 2px; }
.empty-desc { font-size: var(--text-sm); color: var(--text-soft); margin-bottom: var(--space-5); }
.empty-btn {
  padding: var(--space-2) var(--space-4); border: 1px solid var(--border); border-radius: var(--radius-md);
  background: var(--accent-soft); color: var(--accent); font-size: var(--text-sm); font-family: var(--font-sans);
  cursor: pointer; transition: all var(--transition-fast);
}
.empty-btn:hover { background: var(--accent); color: var(--text-on-accent); }

.session-count { padding-top: var(--space-2); font-size: var(--text-xs); color: var(--text-soft); text-align: center; }
</style>
