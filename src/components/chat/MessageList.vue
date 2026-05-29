<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import MessageItem from './MessageItem.vue'
import { useProvidersStore } from '@/stores/providers'
import type { Session } from '@/types/chat'

const props = defineProps<{ session: Session | null }>()
const emit = defineEmits<{ regenerate: [] }>()

const providersStore = useProvidersStore()
const listRef = ref<HTMLElement | null>(null)

function openSettings() {
  window.dispatchEvent(new CustomEvent('open-settings'))
}

function scrollToBottom() {
  nextTick(() => {
    if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
  })
}

watch(() => props.session?.messages.length, scrollToBottom)
watch(() => props.session?.messages, scrollToBottom, { deep: true })
</script>

<template>
  <div class="message-list" ref="listRef">
    <div v-if="!session" class="welcome">
      <div class="welcome-card anim-fade-in-up">
        <div class="welcome-glow"></div>
        <div class="welcome-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h1 class="welcome-title">AI Chat</h1>
        <p class="welcome-desc">一个本地保存 Provider 的轻量聊天工具</p>
        <div class="welcome-hints">
          <div class="hint-item"><div class="hint-num">1</div><span>设置 API Provider</span></div>
          <div class="hint-item"><div class="hint-num">2</div><span>选择模型</span></div>
          <div class="hint-item"><div class="hint-num">3</div><span>开始一段新对话</span></div>
        </div>
        <button v-if="!providersStore.defaultProvider" class="welcome-cta" @click="openSettings">配置 Provider</button>
        <p v-else class="welcome-ready">开始输入消息吧</p>
      </div>
    </div>

    <div v-else-if="session.messages.length === 0" class="welcome welcome-compact">
      <div class="welcome-card anim-fade-in">
        <p class="welcome-ready">开始一个新的对话吧</p>
      </div>
    </div>

    <template v-else>
      <MessageItem v-for="(msg, i) in session.messages" :key="msg.id" :message="msg" :is-last="i === session.messages.length - 1" @regenerate="emit('regenerate')" />
    </template>
  </div>
</template>

<style scoped>
.message-list { flex: 1; overflow-y: auto; padding: 0 var(--space-5); }

.welcome { display: flex; align-items: center; justify-content: center; height: 100%; padding: var(--space-6); }
.welcome-compact { height: 100%; }

.welcome-card {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: var(--space-6) var(--space-5); border-radius: var(--radius-xl);
  max-width: 460px; width: 100%; position: relative; overflow: hidden;
  background: var(--panel); border: 1px solid var(--border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.22);
}

.welcome-glow {
  position: absolute; top: -40%; left: 50%; transform: translateX(-50%);
  width: 180px; height: 180px; border-radius: 50%;
  background: radial-gradient(circle, rgba(155, 140, 255, 0.20) 0%, transparent 70%);
  pointer-events: none;
}

.welcome-icon {
  display: flex; align-items: center; justify-content: center;
  width: 60px; height: 60px; border-radius: var(--radius-lg);
  background: var(--accent-soft); color: var(--accent);
  margin-bottom: var(--space-4); position: relative; z-index: 1;
}

.welcome-title { font-size: var(--text-xl); font-weight: 700; color: var(--text); letter-spacing: -0.02em; margin-bottom: var(--space-2); position: relative; z-index: 1; }
.welcome-desc { font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-5); position: relative; z-index: 1; }

.welcome-hints { display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-5); width: 100%; position: relative; z-index: 1; }
.hint-item {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-2) var(--space-3); border-radius: var(--radius-md);
  background: rgba(255,255,255,0.035); font-size: var(--text-sm); color: var(--text-muted);
  border: 1px solid var(--border);
}
.hint-num {
  display: flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--accent-soft); color: var(--accent);
  font-size: var(--text-xs); font-weight: 700; flex-shrink: 0;
}

.welcome-cta {
  padding: var(--space-2) var(--space-6); border: none; border-radius: var(--radius-md);
  background: var(--accent); color: var(--text-on-accent); font-size: var(--text-sm); font-weight: 550;
  font-family: var(--font-sans); cursor: pointer; transition: all var(--transition-fast);
  position: relative; z-index: 1; box-shadow: 0 2px 12px rgba(155, 140, 255, 0.20);
}
.welcome-cta:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: 0 4px 18px rgba(155, 140, 255, 0.28); }

.welcome-ready { font-size: var(--text-sm); color: var(--text-soft); position: relative; z-index: 1; }
</style>
