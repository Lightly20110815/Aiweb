<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useProvidersStore } from '@/stores/providers'
import { useSessionsStore } from '@/stores/sessions'

const props = defineProps<{ sessionId: string | null }>()
const providersStore = useProvidersStore()
const sessionsStore = useSessionsStore()

const showDropdown = ref(false)
const customModel = ref('')
const dropdownRef = ref<HTMLElement | null>(null)

const currentSession = computed(() =>
  props.sessionId ? sessionsStore.getSession(props.sessionId) : null
)

const currentProvider = computed(() =>
  currentSession.value ? providersStore.getProvider(currentSession.value.providerId) : null
)

function onDocumentClick(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))

function selectProvider(providerId: string) {
  const provider = providersStore.getProvider(providerId)
  if (!provider || !props.sessionId) return
  const model = provider.defaultModel || provider.models[0] || ''
  sessionsStore.updateSessionModel(props.sessionId, providerId, model)
  showDropdown.value = false
}

function selectModel(model: string) {
  if (!currentProvider.value || !props.sessionId) return
  sessionsStore.updateSessionModel(props.sessionId, currentProvider.value.id, model)
  showDropdown.value = false
}

function addCustomModel() {
  const m = customModel.value.trim()
  if (!m || !currentProvider.value) return
  providersStore.addModel(currentProvider.value.id, m)
  selectModel(m)
  customModel.value = ''
}
</script>

<template>
  <div class="model-selector" ref="dropdownRef">
    <div v-if="providersStore.enabledProviders.length <= 1 && currentProvider" class="pills-row">
      <span class="pill provider-pill">{{ currentProvider.name }}</span>
      <select class="model-select" :value="currentSession?.model" @change="(e: Event) => selectModel((e.target as HTMLSelectElement).value)">
        <option v-for="m in currentProvider.models" :key="m" :value="m">{{ m }}</option>
      </select>
    </div>

    <div class="pills-row" v-else-if="providersStore.enabledProviders.length > 1">
      <button class="pill provider-pill clickable" @click.stop="showDropdown = !showDropdown">
        {{ currentProvider?.name ?? '选择' }}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <span v-if="currentSession?.model" class="pill model-pill">{{ currentSession?.model }}</span>
      <div class="dropdown-menu" v-if="showDropdown" @click.stop>
        <div class="dropdown-label">Provider</div>
        <button v-for="p in providersStore.enabledProviders" :key="p.id" class="dropdown-item" :class="{ active: currentProvider?.id === p.id }" @click="selectProvider(p.id)">
          <span>{{ p.name }}</span><span v-if="currentProvider?.id === p.id" class="check">&#10003;</span>
        </button>
        <div class="dropdown-divider"></div>
        <div class="dropdown-label">模型</div>
        <template v-if="currentProvider">
          <button v-for="m in currentProvider.models" :key="m" class="dropdown-item" :class="{ active: currentSession?.model === m }" @click="selectModel(m)">
            <span>{{ m }}</span><span v-if="currentSession?.model === m" class="check">&#10003;</span>
          </button>
          <div class="custom-model-row">
            <input v-model="customModel" placeholder="输入模型名称..." class="custom-input" @keydown.enter="addCustomModel" />
          </div>
        </template>
      </div>
    </div>

    <div v-else class="pills-row">
      <span class="pill provider-pill muted">未配置 Provider</span>
    </div>
  </div>
</template>

<style scoped>
.model-selector { position: relative; }
.pills-row { display: flex; align-items: center; gap: var(--space-2); }

.pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 20px; font-size: var(--text-xs); font-weight: 530; white-space: nowrap; }
.provider-pill { background: var(--accent-soft); color: var(--accent); border: 1px solid transparent; }
.provider-pill.clickable { cursor: pointer; transition: all var(--transition-fast); }
.provider-pill.clickable:hover { background: var(--accent); color: var(--text-on-accent); }
.provider-pill.muted { background: var(--panel); color: var(--text-soft); border: 1px solid var(--border); }
.model-pill { background: var(--panel); color: var(--text-muted); border: 1px solid var(--border); }

.model-select { padding: 2px 6px; font-size: var(--text-xs); font-family: var(--font-sans); border: 1px solid var(--border); border-radius: 20px; background: var(--panel); color: var(--text-muted); cursor: pointer; outline: none; }
.model-select:focus { border-color: var(--border-strong); }

.dropdown-menu { position: absolute; top: calc(100% + 6px); right: 0; min-width: 260px; max-height: 360px; overflow-y: auto; border-radius: var(--radius-lg); padding: var(--space-1); z-index: 120; box-shadow: var(--shadow-lg); animation: fadeIn 120ms ease both; background: var(--panel-solid); border: 1px solid var(--border); }
.dropdown-label { font-size: var(--text-xs); font-weight: 600; color: var(--text-soft); padding: var(--space-2) var(--space-3) var(--space-1); text-transform: uppercase; letter-spacing: 0.03em; }
.dropdown-item { display: flex; align-items: center; justify-content: space-between; width: 100%; text-align: left; padding: var(--space-2) var(--space-3); border: none; border-radius: var(--radius-sm); background: transparent; font-size: var(--text-sm); font-family: var(--font-sans); color: var(--text); cursor: pointer; transition: all var(--transition-fast); }
.dropdown-item:hover { background: var(--panel-hover); }
.dropdown-item.active { background: var(--accent-soft); color: var(--accent); }
.check { font-size: var(--text-xs); color: var(--accent); }
.dropdown-divider { height: 1px; background: var(--border); margin: var(--space-1) var(--space-2); }
.custom-model-row { padding: var(--space-1) var(--space-2) var(--space-2); }
.custom-input { width: 100%; padding: var(--space-1) var(--space-2); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: var(--text-xs); font-family: var(--font-sans); background: var(--panel-solid); color: var(--text); outline: none; }
.custom-input:focus { border-color: var(--border-strong); }
</style>
