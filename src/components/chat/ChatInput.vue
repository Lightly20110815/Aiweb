<script setup lang="ts">
import { ref, nextTick } from 'vue'

const props = defineProps<{ disabled: boolean; generating: boolean }>()
const emit = defineEmits<{ send: [content: string]; stop: [] }>()

const input = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
}

function send() {
  const text = input.value.trim()
  if (!text || props.disabled) return
  emit('send', text)
  input.value = ''
  nextTick(autoResize)
}

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 200) + 'px'
}
</script>

<template>
  <div class="input-area">
    <div class="input-container">
      <div class="input-shell">
        <textarea
          ref="textareaRef"
          v-model="input"
          class="input-field"
          placeholder="输入消息，Enter 发送，Shift+Enter 换行..."
          :disabled="disabled"
          @keydown="handleKeydown"
          @input="autoResize"
          rows="1"
        />
        <div class="input-actions">
          <button v-if="generating" class="send-btn stop-btn" @click="emit('stop')" title="停止生成">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
          </button>
          <button v-else class="send-btn" :class="{ ready: input.trim() && !disabled }" :disabled="!input.trim() || disabled" @click="send" title="发送">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
      <p class="input-hint">API Key 仅保存在本地。AI 可能会出错，请自行判断。</p>
    </div>
  </div>
</template>

<style scoped>
.input-area { padding: var(--space-3) var(--space-5) var(--space-5); flex-shrink: 0; }
.input-container { max-width: var(--chat-max-width); margin: 0 auto; width: 100%; }

.input-shell {
  display: flex; align-items: flex-end; gap: var(--space-3);
  padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
  background: rgba(28, 29, 50, 0.92); border: 1px solid var(--border); border-radius: var(--radius-xl);
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}
.input-shell:focus-within {
  border-color: var(--border-strong);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18), 0 0 0 3px rgba(155, 140, 255, 0.10);
}

.input-field {
  flex: 1; border: none; background: transparent; resize: none;
  font-size: var(--text-base); line-height: 1.55; font-family: var(--font-sans);
  color: var(--text); outline: none; padding: var(--space-1) 0;
  max-height: 200px; min-height: 24px;
}
.input-field::placeholder { color: var(--text-soft); }
.input-field:disabled { opacity: 0.4; }

.input-actions { display: flex; align-items: center; flex-shrink: 0; }

.send-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border: none; border-radius: var(--radius-md);
  background: var(--accent-soft); color: var(--text-muted); cursor: pointer;
  transition: all var(--transition-fast);
}
.send-btn.ready {
  background: var(--accent); color: var(--text-on-accent);
  box-shadow: 0 2px 10px rgba(155, 140, 255, 0.22);
}
.send-btn.ready:hover { background: var(--accent-hover); transform: scale(1.05); }
.send-btn:disabled { cursor: not-allowed; }

.stop-btn { background: var(--danger); color: #fff; box-shadow: 0 2px 10px rgba(255, 139, 154, 0.22); }
.stop-btn:hover { background: #ff6b7a; transform: scale(1.05); }

.input-hint { text-align: center; font-size: var(--text-xs); color: var(--text-soft); margin-top: var(--space-2); }
</style>
