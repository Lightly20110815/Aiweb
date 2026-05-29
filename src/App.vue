<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import { useTheme } from '@/composables/useTheme'
import SessionList from '@/components/session/SessionList.vue'
import ChatWindow from '@/components/chat/ChatWindow.vue'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'

const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)
const { isDark, toggleTheme } = useTheme(settings)

const showSettings = ref(false)
const mobileSidebarOpen = ref(false)

function onOpenSettings() {
  showSettings.value = true
}

onMounted(() => window.addEventListener('open-settings', onOpenSettings))
onUnmounted(() => window.removeEventListener('open-settings', onOpenSettings))
</script>

<template>
  <div class="app-layout">
    <div v-if="mobileSidebarOpen" class="mobile-overlay" @click="mobileSidebarOpen = false" />

    <aside
      class="sidebar"
      :class="{
        collapsed: settings.sidebarCollapsed && !mobileSidebarOpen,
        'mobile-open': mobileSidebarOpen,
      }"
    >
      <div class="sidebar-inner">
        <div class="sidebar-brand">
          <div class="brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span class="brand-name">AI Chat</span>
          <span class="brand-dot"></span>
        </div>

        <SessionList />

        <div class="sidebar-footer">
          <button class="footer-btn" :class="{ active: showSettings }" @click="showSettings = !showSettings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span>设置</span>
          </button>
          <button class="footer-btn" @click="toggleTheme">
            <svg v-if="isDark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <span>{{ isDark ? '浅色' : '深色' }}</span>
          </button>
        </div>
      </div>

      <button class="collapse-btn" @click="settingsStore.updateSetting('sidebarCollapsed', !settings.sidebarCollapsed)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
    </aside>

    <main class="main-area">
      <button class="mobile-toggle" @click="mobileSidebarOpen = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <SettingsPanel v-if="showSettings" @close="showSettings = false" />
      <ChatWindow v-else />
    </main>
  </div>
</template>

<style scoped>
.app-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; }

.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  height: 100vh;
  position: relative;
  z-index: 100;
  border-right: 1px solid var(--sidebar-border);
  background: var(--sidebar);
  display: flex;
  flex-direction: column;
  transition: margin-left 280ms cubic-bezier(0.4, 0, 0.2, 1), opacity 280ms cubic-bezier(0.4, 0, 0.2, 1);
}
.sidebar.collapsed { margin-left: calc(-1 * var(--sidebar-width)); opacity: 0; pointer-events: none; }
.sidebar-inner { flex: 1; display: flex; flex-direction: column; padding: var(--space-4); overflow: hidden; }

.sidebar-brand { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-1) var(--space-4); }
.brand-icon {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: var(--radius-md);
  background: var(--accent-soft); color: var(--accent);
}
.brand-name { font-size: var(--text-md); font-weight: 650; color: var(--text); letter-spacing: -0.01em; }
.brand-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-left: auto; }

.sidebar-footer {
  display: flex; flex-direction: column; gap: 2px;
  padding-top: var(--space-3); border-top: 1px solid var(--sidebar-border); margin-top: auto;
}
.footer-btn {
  display: flex; align-items: center; gap: var(--space-2);
  width: 100%; padding: var(--space-2) var(--space-3);
  border: none; border-radius: var(--radius-sm);
  background: transparent; color: var(--text-muted);
  font-size: var(--text-sm); font-family: var(--font-sans);
  cursor: pointer; transition: all var(--transition-fast);
}
.footer-btn:hover { background: var(--panel-hover); color: var(--text); }
.footer-btn.active { color: var(--accent); }

.collapse-btn {
  position: absolute; right: -4px; top: 50%; transform: translate(100%, -50%);
  display: flex; align-items: center; justify-content: center;
  width: 22px; height: 48px;
  border: 1px solid var(--sidebar-border); border-left: none; border-radius: 0 6px 6px 0;
  background: var(--sidebar); color: var(--text-soft);
  cursor: pointer; transition: all var(--transition-fast); z-index: 101;
}
.collapse-btn:hover { color: var(--text); background: var(--panel-solid); }

.main-area { flex: 1; height: 100vh; overflow: hidden; position: relative; display: flex; flex-direction: column; }

.mobile-toggle {
  display: none; position: absolute; top: var(--space-3); left: var(--space-3); z-index: 90;
  border: 1px solid var(--border); background: var(--panel); color: var(--text);
  padding: var(--space-2); border-radius: var(--radius-sm); cursor: pointer;
}
.mobile-overlay {
  display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); z-index: 99;
}

@media (max-width: 768px) {
  .sidebar { position: fixed; left: 0; top: 0; z-index: 200; transform: translateX(-100%);
    transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  .sidebar.mobile-open { transform: translateX(0); }
  .sidebar.collapsed { margin-left: 0; opacity: 1; pointer-events: auto; }
  .mobile-toggle { display: flex; }
  .mobile-overlay { display: block; }
  .collapse-btn { display: none; }
}
</style>
