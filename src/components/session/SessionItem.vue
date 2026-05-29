<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { Session } from '@/types/chat'

const props = defineProps<{ session: Session; active: boolean }>()
const emit = defineEmits<{ select: [id: string]; delete: [id: string]; rename: [id: string, title: string] }>()

const editing = ref(false)
const editTitle = ref('')
const renameInputRef = ref<HTMLInputElement | null>(null)

function startRename() {
  editTitle.value = props.session.title
  editing.value = true
  nextTick(() => renameInputRef.value?.focus())
}
function confirmRename() {
  const t = editTitle.value.trim()
  if (t) emit('rename', props.session.id, t)
  editing.value = false
}
function cancelRename() { editing.value = false }

function formatTime(ts: number): string {
  const d = new Date(ts), now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="session-item" :class="{ active }" @click="emit('select', session.id)">
    <div class="session-body" v-if="!editing">
      <div class="session-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
      <div class="session-info">
        <span class="session-title">{{ session.title }}</span>
        <span class="session-meta">{{ session.messages.length }} 条消息 · {{ formatTime(session.updatedAt) }}</span>
      </div>
    </div>
    <div class="session-body" v-else @click.stop>
      <input ref="renameInputRef" v-model="editTitle" class="rename-input" @keydown.enter="confirmRename" @keydown.escape="cancelRename" @blur="confirmRename" placeholder="会话名称" />
    </div>
    <div class="session-actions" v-if="!editing">
      <button class="act-btn" title="重命名" @click.stop="startRename">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <button class="act-btn danger" title="删除" @click.stop="emit('delete', session.id)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.session-item { display: flex; align-items: center; padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); cursor: pointer; gap: var(--space-2); transition: all var(--transition-fast); position: relative; }
.session-item:hover { background: var(--panel-hover); }
.session-item.active { background: var(--accent-soft); }

.session-body { flex: 1; min-width: 0; display: flex; align-items: center; gap: var(--space-2); }
.session-icon { display: flex; align-items: center; color: var(--text-soft); flex-shrink: 0; }
.session-item.active .session-icon { color: var(--accent); }
.session-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.session-title { font-size: var(--text-sm); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text); }
.session-meta { font-size: var(--text-xs); color: var(--text-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.session-actions { display: none; gap: 2px; flex-shrink: 0; }
.session-item:hover .session-actions { display: flex; }
.act-btn {
  display: flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border: none; border-radius: var(--radius-sm);
  background: transparent; color: var(--text-soft); cursor: pointer; transition: all var(--transition-fast);
}
.act-btn:hover { background: var(--panel-solid); color: var(--text); }
.act-btn.danger:hover { color: var(--danger); background: var(--danger-soft); }

.rename-input {
  width: 100%; padding: var(--space-1) var(--space-2);
  border: 1px solid var(--border-strong); border-radius: var(--radius-sm);
  font-size: var(--text-sm); font-family: var(--font-sans);
  background: var(--panel-solid); color: var(--text); outline: none;
}
</style>
