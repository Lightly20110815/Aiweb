import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { sendMessage } from '@/api/chat'
import { useSessionsStore } from '@/stores/sessions'
import { useProvidersStore } from '@/stores/providers'
import { useSettingsStore } from '@/stores/settings'
import { nanoid } from 'nanoid'
import type { Message, ChatError } from '@/types/chat'

export function useChat() {
  const sessionsStore = useSessionsStore()
  const providersStore = useProvidersStore()
  const settingsStore = useSettingsStore()
  const { settings: appSettings } = storeToRefs(settingsStore)

  const isGenerating = ref(false)
  const abortController = ref<AbortController | null>(null)
  const error = ref<ChatError | null>(null)

  /** Core: send messages to API and stream response into the assistant message */
  async function _executeRequest(sessionId: string, assistantMsgId: string) {
    const session = sessionsStore.getSession(sessionId)
    if (!session) return

    const provider = providersStore.getProvider(session.providerId)
    if (!provider) {
      error.value = { type: 'unknown', message: '未选择 API Provider，请在设置中配置。' }
      return
    }
    if (!provider.apiKey) {
      error.value = { type: 'auth', message: 'API Key 未填写，请在设置中配置。' }
      return
    }
    if (!session.model) {
      error.value = { type: 'unknown', message: '未选择模型。' }
      return
    }

    error.value = null
    isGenerating.value = true

    const assistantMsg = session.messages.find((m) => m.id === assistantMsgId)
    if (!assistantMsg) {
      isGenerating.value = false
      return
    }
    assistantMsg.status = 'streaming'
    assistantMsg.content = ''

    const controller = new AbortController()
    abortController.value = controller

    const messages = session.messages
      .filter((m) => m.id !== assistantMsgId)
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      await sendMessage({
        provider,
        model: session.model,
        messages,
        stream: appSettings.value.streamEnabled,
        advanced: appSettings.value.advancedEnabled ? appSettings.value.advanced : undefined,
      }, {
        signal: controller.signal,
        onChunk(chunk: string) {
          assistantMsg.content += chunk
          sessionsStore.updateMessageContent(sessionId, assistantMsgId, assistantMsg.content)
        },
        onError(err: ChatError) {
          error.value = err
          assistantMsg.status = 'error'
          assistantMsg.content = err.message
          sessionsStore.updateMessage(sessionId, assistantMsgId, assistantMsg)
        },
      })
      if (assistantMsg.status === 'streaming') {
        assistantMsg.status = 'normal'
      }
      sessionsStore.updateMessage(sessionId, assistantMsgId, assistantMsg)
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        if (assistantMsg.content) {
          assistantMsg.status = 'normal'
        } else {
          assistantMsg.status = 'error'
          assistantMsg.content = '生成已停止。'
        }
        sessionsStore.updateMessage(sessionId, assistantMsgId, assistantMsg)
      } else {
        const errMsg = e instanceof Error ? e.message : '未知错误'
        assistantMsg.status = 'error'
        assistantMsg.content = errMsg
        sessionsStore.updateMessage(sessionId, assistantMsgId, assistantMsg)
        error.value = { type: 'network', message: errMsg }
      }
    } finally {
      isGenerating.value = false
      abortController.value = null
    }
  }

  async function send(
    content: string,
    sessionId: string,
  ): Promise<void> {
    const session = sessionsStore.getSession(sessionId)
    if (!session) return

    // Auto-generate title from first user message
    if (session.messages.length === 0) {
      session.title = content.slice(0, 20) + (content.length > 20 ? '...' : '')
    }

    // Add user message
    const userMsg: Message = {
      id: nanoid(),
      role: 'user',
      content,
      createdAt: Date.now(),
      status: 'normal',
    }
    sessionsStore.addMessage(sessionId, userMsg)

    // Add placeholder assistant message
    const assistantMsg: Message = {
      id: nanoid(),
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      status: 'normal',
    }
    sessionsStore.addMessage(sessionId, assistantMsg)

    await _executeRequest(sessionId, assistantMsg.id)
  }

  function stop() {
    abortController.value?.abort()
  }

  async function regenerate(sessionId: string): Promise<void> {
    const session = sessionsStore.getSession(sessionId)
    if (!session || session.messages.length < 2) return

    // Only remove the last assistant message — keep all user messages intact
    const msgs = session.messages
    const lastIdx = msgs.length - 1

    if (msgs[lastIdx].role !== 'assistant') return

    // Remove last assistant message
    sessionsStore.removeMessage(sessionId, msgs[lastIdx].id)

    // Insert a fresh placeholder assistant message
    const assistantMsg: Message = {
      id: nanoid(),
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      status: 'normal',
    }
    sessionsStore.addMessage(sessionId, assistantMsg)

    await _executeRequest(sessionId, assistantMsg.id)
  }

  return { isGenerating, error, send, stop, regenerate }
}
