import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import { loadJSON, saveJSON } from '@/utils/storage'
import type { Session, Message } from '@/types/chat'

const STORAGE_KEY = 'sessions'
const ACTIVE_KEY = 'activeSessionId'

export const useSessionsStore = defineStore('sessions', () => {
  const sessions = ref<Session[]>(loadJSON<Session[]>(STORAGE_KEY, []))
  const activeSessionId = ref<string | null>(loadJSON<string | null>(ACTIVE_KEY, null))

  // Validate that the active session still exists
  if (activeSessionId.value && !sessions.value.find((s) => s.id === activeSessionId.value)) {
    activeSessionId.value = sessions.value[0]?.id ?? null
  }

  const activeSession = computed(() =>
    sessions.value.find((s) => s.id === activeSessionId.value) ?? null,
  )

  const sortedSessions = computed(() =>
    [...sessions.value].sort((a, b) => b.updatedAt - a.updatedAt),
  )

  function save() {
    saveJSON(STORAGE_KEY, sessions.value)
    saveJSON(ACTIVE_KEY, activeSessionId.value)
  }

  function getSession(id: string): Session | undefined {
    return sessions.value.find((s) => s.id === id)
  }

  function createSession(providerId: string, model: string): Session {
    const session: Session = {
      id: nanoid(),
      title: '新对话',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      providerId,
      model,
      messages: [],
    }
    sessions.value.push(session)
    activeSessionId.value = session.id
    save()
    return session
  }

  function deleteSession(id: string) {
    sessions.value = sessions.value.filter((s) => s.id !== id)
    if (activeSessionId.value === id) {
      activeSessionId.value = sessions.value[0]?.id ?? null
    }
    save()
  }

  function renameSession(id: string, title: string) {
    const session = sessions.value.find((s) => s.id === id)
    if (session) {
      session.title = title
      session.updatedAt = Date.now()
      save()
    }
  }

  function clearSession(id: string) {
    const session = sessions.value.find((s) => s.id === id)
    if (session) {
      session.messages = []
      session.title = '新对话'
      session.updatedAt = Date.now()
      save()
    }
  }

  function setActiveSession(id: string | null) {
    activeSessionId.value = id
  }

  function addMessage(sessionId: string, message: Message) {
    const session = sessions.value.find((s) => s.id === sessionId)
    if (session) {
      session.messages.push(message)
      session.updatedAt = Date.now()
      save()
    }
  }

  function updateMessage(sessionId: string, messageId: string, updates: Partial<Message>) {
    const session = sessions.value.find((s) => s.id === sessionId)
    if (session) {
      const idx = session.messages.findIndex((m) => m.id === messageId)
      if (idx !== -1) {
        session.messages[idx] = { ...session.messages[idx], ...updates }
        session.updatedAt = Date.now()
        save()
      }
    }
  }

  function updateMessageContent(sessionId: string, messageId: string, content: string) {
    updateMessage(sessionId, messageId, { content })
  }

  function removeMessage(sessionId: string, messageId: string) {
    const session = sessions.value.find((s) => s.id === sessionId)
    if (session) {
      session.messages = session.messages.filter((m) => m.id !== messageId)
      session.updatedAt = Date.now()
      save()
    }
  }

  function updateSessionModel(sessionId: string, providerId: string, model: string) {
    const session = sessions.value.find((s) => s.id === sessionId)
    if (session) {
      session.providerId = providerId
      session.model = model
      session.updatedAt = Date.now()
      save()
    }
  }

  /** Export a session as JSON string */
  function exportSession(id: string): string | null {
    const session = sessions.value.find((s) => s.id === id)
    if (!session) return null
    return JSON.stringify(session, null, 2)
  }

  /** Import a session from JSON string */
  function importSession(json: string): Session | null {
    try {
      const parsed = JSON.parse(json)
      if (!parsed.id || !parsed.messages || !Array.isArray(parsed.messages)) return null
      // Assign new IDs to avoid collisions
      const session: Session = {
        id: nanoid(),
        title: parsed.title ?? '导入的对话',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        providerId: parsed.providerId ?? '',
        model: parsed.model ?? '',
        messages: (parsed.messages as Message[]).map((m) => ({
          ...m,
          id: nanoid(),
          createdAt: Date.now(),
        })),
      }
      sessions.value.push(session)
      save()
      return session
    } catch {
      return null
    }
  }

  return {
    sessions,
    activeSessionId,
    activeSession,
    sortedSessions,
    getSession,
    createSession,
    deleteSession,
    renameSession,
    clearSession,
    setActiveSession,
    addMessage,
    updateMessage,
    updateMessageContent,
    removeMessage,
    updateSessionModel,
    exportSession,
    importSession,
  }
})
