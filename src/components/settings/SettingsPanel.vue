<script setup lang="ts">
import { ref } from 'vue'
import { useProvidersStore } from '@/stores/providers'
import { useSettingsStore } from '@/stores/settings'
import { useSessionsStore } from '@/stores/sessions'
import ProviderList from './ProviderList.vue'
import ProviderForm from './ProviderForm.vue'
import AdvancedParams from './AdvancedParams.vue'
import type { Provider } from '@/types/provider'

const emit = defineEmits<{ close: [] }>()

const providersStore = useProvidersStore()
const settingsStore = useSettingsStore()
const sessionsStore = useSessionsStore()

const editingProvider = ref<Provider | null>(null)
const isNewProvider = ref(false)
const activeTab = ref<'providers' | 'general' | 'data'>('providers')

function addNew() {
  isNewProvider.value = true
  editingProvider.value = {
    id: '', name: '', baseUrl: '', apiKey: '', models: [],
    defaultModel: '', requestFormat: 'openai-compatible',
    enabled: true, isDefault: false, createdAt: Date.now(),
  }
}

function editProvider(id: string) {
  const p = providersStore.getProvider(id)
  if (p) { isNewProvider.value = false; editingProvider.value = { ...p } }
}

function handleSave(provider: Provider) {
  if (isNewProvider.value) {
    const p = providersStore.addProvider()
    providersStore.updateProvider(p.id, provider)
  } else {
    providersStore.updateProvider(provider.id, provider)
  }
  if (provider.isDefault) providersStore.setDefault(provider.id)
  editingProvider.value = null
}

function handleDelete(id: string) { providersStore.removeProvider(id) }

function handleExport() {
  if (!sessionsStore.activeSession) return
  const json = sessionsStore.exportSession(sessionsStore.activeSession.id)
  if (!json) return
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chat-${sessionsStore.activeSession.title.slice(0, 20)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'; input.accept = '.json'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const session = sessionsStore.importSession(reader.result as string)
      if (session) { sessionsStore.setActiveSession(session.id); emit('close') }
      else alert('导入失败：文件格式不正确')
    }
    reader.readAsText(file)
  }
  input.click()
}
</script>

<template>
  <div class="settings-layout">
    <div class="settings-topbar">
      <button class="back-btn" @click="emit('close')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        <span>返回</span>
      </button>
    </div>

    <div class="settings-body">
      <div class="settings-tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'providers' }" @click="activeTab = 'providers'">Provider</button>
        <button class="tab-btn" :class="{ active: activeTab === 'general' }" @click="activeTab = 'general'">通用</button>
        <button class="tab-btn" :class="{ active: activeTab === 'data' }" @click="activeTab = 'data'">数据</button>
      </div>

      <div class="settings-content">
        <div v-if="activeTab === 'providers'" class="tab-page anim-fade-in">
          <div class="section-head">
            <div>
              <h3>API Provider</h3>
              <p class="section-desc">管理 AI 服务的连接配置</p>
            </div>
            <button class="add-btn" @click="addNew">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              添加
            </button>
          </div>
          <ProviderList :providers="providersStore.providers" @edit="editProvider" @delete="handleDelete" @set-default="providersStore.setDefault" />
        </div>

        <div v-if="activeTab === 'general'" class="tab-page anim-fade-in">
          <h3>通用设置</h3>
          <p class="section-desc">调整应用行为和外观</p>

          <div class="setting-card">
            <label class="setting-row">
              <div class="setting-info"><span class="setting-label">流式输出</span><span class="setting-hint">实时逐字显示 AI 回复</span></div>
              <input type="checkbox" :checked="settingsStore.settings.streamEnabled" @change="settingsStore.updateSetting('streamEnabled', ($event.target as HTMLInputElement).checked)" />
            </label>
          </div>
          <div class="setting-card">
            <label class="setting-row">
              <div class="setting-info"><span class="setting-label">保存 API Key</span><span class="setting-hint">Key 存储在浏览器本地，不会上传</span></div>
              <input type="checkbox" :checked="settingsStore.settings.saveApiKeys" @change="settingsStore.updateSetting('saveApiKeys', ($event.target as HTMLInputElement).checked)" />
            </label>
          </div>
          <div class="setting-card">
            <div class="setting-row">
              <div class="setting-info"><span class="setting-label">主题</span></div>
              <select class="theme-select" :value="settingsStore.settings.theme" @change="settingsStore.updateSetting('theme', ($event.target as HTMLSelectElement).value as 'light'|'dark'|'system')">
                <option value="system">跟随系统</option><option value="dark">深色</option><option value="light">浅色</option>
              </select>
            </div>
          </div>

          <div class="section-divider" />
          <AdvancedParams />

          <div class="privacy-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>纯前端应用，API Key 仅保存在浏览器本地。建议仅在个人设备使用。</span>
          </div>
        </div>

        <div v-if="activeTab === 'data'" class="tab-page anim-fade-in">
          <h3>数据管理</h3>
          <p class="section-desc">导出或导入对话数据</p>
          <div class="setting-card">
            <div class="data-row">
              <div class="setting-info"><span class="setting-label">导出当前对话</span><span class="setting-hint">保存为 JSON 文件</span></div>
              <button class="data-btn" :disabled="!sessionsStore.activeSession" @click="handleExport">导出</button>
            </div>
          </div>
          <div class="setting-card">
            <div class="data-row">
              <div class="setting-info"><span class="setting-label">导入对话</span><span class="setting-hint">从 JSON 文件导入</span></div>
              <button class="data-btn" @click="handleImport">导入</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="editingProvider" class="modal-overlay" @click.self="editingProvider = null">
      <div class="modal-panel anim-fade-in-up">
        <div class="modal-head">
          <h3>{{ isNewProvider ? '新增 Provider' : '编辑 Provider' }}</h3>
          <button class="modal-close" @click="editingProvider = null">&times;</button>
        </div>
        <ProviderForm :provider="editingProvider" :is-new="isNewProvider" @save="handleSave" @cancel="editingProvider = null" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-layout { display: flex; flex-direction: column; height: 100%; }
.settings-topbar { display: flex; align-items: center; padding: var(--space-2) var(--space-5); border-bottom: 1px solid var(--border); background: var(--panel); flex-shrink: 0; }
.back-btn { display: inline-flex; align-items: center; gap: var(--space-1); padding: var(--space-1) var(--space-2); border: none; border-radius: var(--radius-sm); background: transparent; color: var(--text-muted); font-size: var(--text-sm); font-family: var(--font-sans); cursor: pointer; transition: all var(--transition-fast); }
.back-btn:hover { background: var(--panel-hover); color: var(--text); }

.settings-body { flex: 1; overflow: hidden; display: flex; }
.settings-tabs { display: flex; flex-direction: column; gap: 2px; padding: var(--space-4) var(--space-3); border-right: 1px solid var(--border); width: 120px; flex-shrink: 0; }
.tab-btn { text-align: left; padding: var(--space-2) var(--space-3); border: none; border-radius: var(--radius-sm); background: transparent; font-size: var(--text-sm); font-family: var(--font-sans); color: var(--text-muted); cursor: pointer; transition: all var(--transition-fast); }
.tab-btn:hover { background: var(--panel-hover); color: var(--text); }
.tab-btn.active { background: var(--accent-soft); color: var(--accent); font-weight: 550; }

.settings-content { flex: 1; overflow-y: auto; padding: var(--space-5); }
.tab-page { max-width: 640px; }
.tab-page h3 { font-size: var(--text-md); font-weight: 650; margin-bottom: var(--space-1); color: var(--text); }
.section-desc { font-size: var(--text-sm); color: var(--text-soft); margin-bottom: var(--space-4); }
.section-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-4); }
.section-head h3 { margin-bottom: var(--space-1); color: var(--text); }

.add-btn { display: inline-flex; align-items: center; gap: var(--space-1); padding: var(--space-2) var(--space-4); border: none; border-radius: var(--radius-md); background: var(--accent); color: var(--text-on-accent); font-size: var(--text-sm); font-weight: 550; font-family: var(--font-sans); cursor: pointer; transition: all var(--transition-fast); }
.add-btn:hover { background: var(--accent-hover); }

.setting-card { border-radius: var(--radius-md); padding: var(--space-4); margin-bottom: var(--space-3); background: var(--panel); border: 1px solid var(--border); }
.setting-row, .data-row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); }
.setting-info { display: flex; flex-direction: column; gap: 1px; }
.setting-label { font-size: var(--text-sm); font-weight: 530; color: var(--text); }
.setting-hint { font-size: var(--text-xs); color: var(--text-soft); }
.theme-select { padding: var(--space-1) var(--space-3); font-size: var(--text-sm); font-family: var(--font-sans); border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--panel-solid); color: var(--text); cursor: pointer; outline: none; }
.data-btn { padding: var(--space-1) var(--space-4); border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--panel-solid); color: var(--text); font-size: var(--text-sm); font-family: var(--font-sans); cursor: pointer; transition: all var(--transition-fast); }
.data-btn:hover:not(:disabled) { background: var(--panel-hover); border-color: var(--border-strong); }
.data-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.section-divider { height: 1px; background: var(--border); margin: var(--space-5) 0; }

.privacy-note { display: flex; align-items: flex-start; gap: var(--space-2); margin-top: var(--space-5); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); background: rgba(180, 140, 40, 0.08); color: #d4b86a; font-size: var(--text-xs); line-height: 1.6; }
.privacy-note svg { flex-shrink: 0; margin-top: 1px; }

.modal-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0, 0, 0, 0.50); display: flex; align-items: center; justify-content: center; padding: var(--space-5); }
.modal-panel { background: var(--panel-solid); border: 1px solid var(--border); border-radius: var(--radius-xl); max-width: 540px; width: 100%; max-height: 85vh; overflow-y: auto; padding: var(--space-5); box-shadow: var(--shadow-lg); }
.modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-5); }
.modal-head h3 { font-size: var(--text-md); font-weight: 650; color: var(--text); }
.modal-close { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border: none; border-radius: var(--radius-sm); background: transparent; font-size: 20px; color: var(--text-soft); cursor: pointer; transition: all var(--transition-fast); }
.modal-close:hover { background: var(--panel-hover); color: var(--text); }

@media (max-width: 768px) {
  .settings-body { flex-direction: column; }
  .settings-tabs { flex-direction: row; width: 100%; padding: var(--space-2) var(--space-3); border-right: none; border-bottom: 1px solid var(--border); overflow-x: auto; }
  .tab-btn { white-space: nowrap; }
}
</style>
