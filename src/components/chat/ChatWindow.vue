<script setup lang="ts">
import { watch, ref } from 'vue'
import { useChat } from '@/composables/useChat'
import { useSessionsStore } from '@/stores/sessions'
import { useProvidersStore } from '@/stores/providers'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'
import ModelSelector from './ModelSelector.vue'

const sessionsStore = useSessionsStore()
const providersStore = useProvidersStore()
const { isGenerating, error, send, stop, regenerate } = useChat()

const toastMessage = ref('')
const toastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

watch(error, (err) => {
  if (err) {
    toastMessage.value = err.message
    toastVisible.value = true
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => { toastVisible.value = false }, 5000)
  }
})

function dismissToast() {
  toastVisible.value = false
  if (toastTimer) clearTimeout(toastTimer)
}

function handleSend(content: string) {
  if (!sessionsStore.activeSessionId) {
    const provider = providersStore.defaultProvider
    if (!provider) return
    sessionsStore.createSession(provider.id, provider.defaultModel || provider.models[0] || '')
  }
  if (!sessionsStore.activeSessionId) return
  send(content, sessionsStore.activeSessionId)
}

function handleRegenerate() {
  if (!sessionsStore.activeSessionId) return
  regenerate(sessionsStore.activeSessionId)
}

function clearSession() {
  if (!sessionsStore.activeSessionId) return
  sessionsStore.clearSession(sessionsStore.activeSessionId)
}

function goToSettings() {
  window.dispatchEvent(new CustomEvent('open-settings'))
}
</script>

<template>
  <div class="chat-window">
    <div class="chat-topbar" v-if="sessionsStore.activeSession">
      <div class="topbar-left">
        <span class="topbar-title">{{ sessionsStore.activeSession?.title }}</span>
      </div>
      <div class="topbar-right">
        <ModelSelector :session-id="sessionsStore.activeSessionId" />
        <button class="topbar-btn" title="清空对话" @click="clearSession">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="chat-content">
      <div class="chat-inner">
        <MessageList :session="sessionsStore.activeSession" @regenerate="handleRegenerate" />
      </div>
    </div>

    <div v-if="!providersStore.defaultProvider" class="no-provider-bar">
      <span>请先配置 API Provider 以开始使用</span>
      <button class="bar-btn" @click="goToSettings">前往设置</button>
    </div>

    <ChatInput :disabled="false" :generating="isGenerating" @send="handleSend" @stop="stop" />

    <Transition name="toast">
      <div v-if="toastVisible" class="error-toast" @click="dismissToast">
        <span class="toast-icon">!</span>
        <span class="toast-msg">{{ toastMessage }}</span>
        <button class="toast-close" @click.stop="dismissToast">&times;</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.chat-window { display: flex; flex-direction: column; height: 100%; position: relative; }

.chat-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--border);
  background: var(--panel); min-height: 52px; flex-shrink: 0; z-index: 10;
}
.topbar-left { flex: 1; min-width: 0; }
.topbar-title { font-size: var(--text-sm); font-weight: 540; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.topbar-right { display: flex; align-items: center; gap: var(--space-2); }
.topbar-btn {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: transparent; color: var(--text-soft); cursor: pointer; transition: all var(--transition-fast);
}
.topbar-btn:hover { background: var(--panel-hover); color: var(--text); border-color: var(--border-strong); }

.chat-content { flex: 1; overflow: hidden; display: flex; justify-content: center; }
.chat-inner { width: 100%; max-width: var(--chat-max-width); display: flex; flex-direction: column; overflow: hidden; }

.no-provider-bar {
  display: flex; align-items: center; justify-content: center; gap: var(--space-3);
  padding: var(--space-2) var(--space-4); font-size: var(--text-sm);
  color: #d4b86a; background: rgba(180, 155, 80, 0.10);
  border-top: 1px solid rgba(180, 155, 80, 0.14); flex-shrink: 0;
}
.bar-btn {
  padding: 2px 10px; border: 1px solid rgba(180, 155, 80, 0.28); border-radius: var(--radius-sm);
  background: transparent; color: #d4b86a; font-size: var(--text-xs); font-family: var(--font-sans);
  cursor: pointer; transition: all var(--transition-fast);
}
.bar-btn:hover { background: rgba(180, 155, 80, 0.12); }

.error-toast {
  position: absolute; bottom: 120px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-4); background: var(--bg-toast);
  border: 1px solid rgba(255, 139, 154, 0.22); border-radius: var(--radius-md);
  box-shadow: var(--shadow-md); max-width: 480px; cursor: pointer; z-index: 50;
}
.toast-icon {
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--danger); color: #fff; font-size: 12px; font-weight: 700; flex-shrink: 0;
}
.toast-msg { font-size: var(--text-sm); color: #ffb3b9; flex: 1; }
.toast-close { background: none; border: none; font-size: 16px; cursor: pointer; color: #ffb3b9; flex-shrink: 0; }
.toast-close:hover { color: #fff; }

.toast-enter-active { transition: all 220ms ease-out; }
.toast-leave-active { transition: all 160ms ease-in; }
.toast-enter-from { opacity: 0; transform: translateX(-50%) translateY(8px); }
.toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }
</style>
