<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

function updateAdvanced(key: string, value: string) {
  const num = value === '' ? undefined : parseFloat(value)
  settingsStore.updateSetting('advanced', { ...settingsStore.settings.advanced, [key]: num })
}
</script>

<template>
  <div class="advanced-params">
    <label class="toggle-row">
      <input type="checkbox" :checked="settingsStore.settings.advancedEnabled" @change="settingsStore.updateSetting('advancedEnabled', ($event.target as HTMLInputElement).checked)" />
      <div class="toggle-info">
        <span class="toggle-label">高级参数</span>
        <span class="toggle-hint">关闭时使用模型默认值，开启后仅发送下方填写的参数</span>
      </div>
    </label>

    <div class="params-grid" v-if="settingsStore.settings.advancedEnabled">
      <div class="param-item"><label>Temperature</label><input type="number" min="0" max="2" step="0.1" :value="settingsStore.settings.advanced.temperature" @input="updateAdvanced('temperature', ($event.target as HTMLInputElement).value)" placeholder="默认" class="param-input" /></div>
      <div class="param-item"><label>Top P</label><input type="number" min="0" max="1" step="0.05" :value="settingsStore.settings.advanced.topP" @input="updateAdvanced('topP', ($event.target as HTMLInputElement).value)" placeholder="默认" class="param-input" /></div>
      <div class="param-item"><label>Max Tokens</label><input type="number" min="1" step="1" :value="settingsStore.settings.advanced.maxTokens" @input="updateAdvanced('maxTokens', ($event.target as HTMLInputElement).value)" placeholder="默认" class="param-input" /></div>
      <div class="param-item"><label>Presence Penalty</label><input type="number" min="-2" max="2" step="0.1" :value="settingsStore.settings.advanced.presencePenalty" @input="updateAdvanced('presencePenalty', ($event.target as HTMLInputElement).value)" placeholder="默认" class="param-input" /></div>
      <div class="param-item"><label>Frequency Penalty</label><input type="number" min="-2" max="2" step="0.1" :value="settingsStore.settings.advanced.frequencyPenalty" @input="updateAdvanced('frequencyPenalty', ($event.target as HTMLInputElement).value)" placeholder="默认" class="param-input" /></div>
    </div>
  </div>
</template>

<style scoped>
.advanced-params { padding: var(--space-4); border-radius: var(--radius-md); background: var(--panel); border: 1px solid var(--border); }
.toggle-row { display: flex; align-items: flex-start; gap: var(--space-3); cursor: pointer; }
.toggle-info { display: flex; flex-direction: column; gap: 1px; }
.toggle-label { font-size: var(--text-sm); font-weight: 530; color: var(--text); }
.toggle-hint { font-size: var(--text-xs); color: var(--text-soft); }
.params-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: var(--space-3); margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--border); }
.param-item { display: flex; flex-direction: column; gap: var(--space-1); }
.param-item label { font-size: var(--text-xs); color: var(--text-soft); }
.param-input { padding: var(--space-1) var(--space-2); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: var(--text-sm); font-family: var(--font-sans); background: var(--panel-solid); color: var(--text); outline: none; transition: border-color var(--transition-fast); }
.param-input:focus { border-color: var(--border-strong); }
</style>
