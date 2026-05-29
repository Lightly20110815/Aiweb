<script setup lang="ts">
import { computed, ref } from 'vue'
import { renderMarkdown } from '@/utils/markdown'
import type { Message } from '@/types/chat'

const props = defineProps<{ message: Message; isLast: boolean }>()
const emit = defineEmits<{ regenerate: [] }>()

const copied = ref(false)
const renderedContent = computed(() => renderMarkdown(props.message.content))

async function copyContent() {
  try { await navigator.clipboard.writeText(props.message.content) } catch {
    const ta = document.createElement('textarea')
    ta.value = props.message.content
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copied.value = true
  setTimeout(() => (copied.value = false), 1800)
}
</script>

<template>
  <div class="message anim-fade-in-up" :class="[message.role, message.status]">
    <template v-if="message.role === 'user'">
      <div class="msg-user-wrap">
        <div class="msg-user-bubble">{{ message.content }}</div>
      </div>
    </template>

    <template v-else>
      <div class="msg-ai-wrap">
        <div class="msg-ai-avatar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
            <path d="M12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"/>
          </svg>
        </div>
        <div class="msg-ai-content">
          <div class="msg-ai-bubble markdown-body" v-html="renderedContent" />

          <div v-if="message.status === 'streaming'" class="streaming-dots">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </div>

          <div v-if="message.status === 'error'" class="error-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            生成出错
          </div>

          <div class="msg-actions" v-if="message.status === 'normal' && message.content">
            <button class="msg-act-btn" @click="copyContent">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              {{ copied ? '已复制' : '复制' }}
            </button>
            <button v-if="isLast" class="msg-act-btn" @click="emit('regenerate')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
              重新生成
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.message { padding: var(--space-3) 0; animation-delay: 40ms; }

.msg-user-wrap { display: flex; justify-content: flex-end; }
.msg-user-bubble {
  max-width: 78%; padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg); border-bottom-right-radius: var(--radius-sm);
  background: var(--accent); color: var(--text-on-accent);
  font-size: var(--text-base); line-height: 1.65; white-space: pre-wrap; word-break: break-word;
}

.msg-ai-wrap { display: flex; gap: var(--space-3); max-width: 92%; }
.msg-ai-avatar {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: var(--radius-sm);
  background: var(--accent-soft); color: var(--accent); flex-shrink: 0; margin-top: 2px;
}
.msg-ai-content { flex: 1; min-width: 0; }
.msg-ai-bubble {
  padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border-top-left-radius: var(--radius-sm);
  background: var(--panel); border: 1px solid var(--border);
}

.streaming-dots { display: flex; gap: 4px; padding: var(--space-2) var(--space-4); }
.dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); animation: pulse-dot 1.2s infinite ease; }
.dot:nth-child(2) { animation-delay: 0.15s; }
.dot:nth-child(3) { animation-delay: 0.3s; }

.error-tag {
  display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-xs); color: var(--danger);
  padding: var(--space-1) var(--space-2); margin-top: var(--space-2); border-radius: var(--radius-sm); background: var(--danger-soft);
}

.msg-actions { display: flex; gap: var(--space-1); margin-top: var(--space-2); opacity: 0; transition: opacity var(--transition-fast); }
.msg-ai-wrap:hover .msg-actions { opacity: 1; }
.msg-act-btn {
  display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px;
  border: none; border-radius: var(--radius-sm); background: transparent;
  color: var(--text-soft); font-size: var(--text-xs); font-family: var(--font-sans);
  cursor: pointer; transition: all var(--transition-fast);
}
.msg-act-btn:hover { background: var(--panel-solid); color: var(--text-muted); }
</style>
