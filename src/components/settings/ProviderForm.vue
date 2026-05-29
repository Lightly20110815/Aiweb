<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Provider, RequestFormat } from '@/types/provider'
import { BUILTIN_PROVIDER_TEMPLATES, BUILTIN_DEFAULT_MODELS } from '@/types/provider'

const props = defineProps<{ provider: Provider; isNew: boolean }>()
const emit = defineEmits<{ save: [provider: Provider]; cancel: [] }>()

const form = ref<Provider>({ ...props.provider })
const showApiKey = ref(false)
const newModel = ref('')

watch(() => props.provider, (p) => { form.value = { ...p } })

const requestFormats: { label: string; value: RequestFormat }[] = [
  { label: 'OpenAI 兼容', value: 'openai-compatible' },
  { label: 'Anthropic', value: 'anthropic' },
  { label: 'Google Gemini', value: 'gemini' },
  { label: '自定义', value: 'custom' },
]

function applyTemplate(templateName: string) {
  const tpl = BUILTIN_PROVIDER_TEMPLATES.find((t) => t.name === templateName)
  if (tpl) {
    form.value.name = tpl.name
    form.value.baseUrl = tpl.baseUrl
    form.value.requestFormat = tpl.requestFormat
    form.value.defaultModel = BUILTIN_DEFAULT_MODELS[tpl.name] ?? ''
    form.value.models = [form.value.defaultModel]
  }
}

function addModel(model: string) {
  if (model && !form.value.models.includes(model)) {
    form.value.models.push(model)
  }
}

function removeModel(idx: number) {
  const removed = form.value.models[idx]
  form.value.models.splice(idx, 1)
  if (form.value.defaultModel === removed) {
    form.value.defaultModel = form.value.models[0] ?? ''
  }
}

function handleSubmit() {
  if (!form.value.name.trim()) return
  emit('save', { ...form.value })
}
</script>

<template>
  <form class="provider-form" @submit.prevent="handleSubmit">
    <div class="form-group" v-if="isNew">
      <label class="form-label">快速选择</label>
      <div class="template-grid">
        <button v-for="tpl in BUILTIN_PROVIDER_TEMPLATES" :key="tpl.name" type="button" class="template-chip" @click="applyTemplate(tpl.name)">{{ tpl.name }}</button>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group flex-1">
        <label class="form-label">名称</label>
        <input v-model="form.name" class="form-input" placeholder="我的 API" required />
      </div>
      <div class="form-group" style="width:180px">
        <label class="form-label">请求格式</label>
        <select v-model="form.requestFormat" class="form-input"><option v-for="fmt in requestFormats" :key="fmt.value" :value="fmt.value">{{ fmt.label }}</option></select>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">API Base URL</label>
      <input v-model="form.baseUrl" class="form-input" placeholder="https://api.openai.com/v1" />
    </div>

    <div class="form-group">
      <label class="form-label">API Key</label>
      <div class="key-wrap">
        <input :type="showApiKey ? 'text' : 'password'" v-model="form.apiKey" class="form-input" placeholder="sk-..." />
        <button type="button" class="toggle-btn" @click="showApiKey = !showApiKey">{{ showApiKey ? '隐藏' : '显示' }}</button>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">模型</label>
      <div class="model-tags">
        <span v-for="(m, i) in form.models" :key="m" class="model-tag">{{ m }}<button type="button" class="tag-remove" @click="removeModel(i)">&times;</button></span>
      </div>
      <div class="add-row">
        <input v-model="newModel" class="form-input" placeholder="输入模型名后按添加" @keydown.enter.prevent="addModel(newModel); newModel = ''" />
        <button type="button" class="add-model-btn" @click="addModel(newModel); newModel = ''">添加</button>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">默认模型</label>
      <select v-model="form.defaultModel" class="form-input">
        <option value="">-- 选择一个默认模型 --</option>
        <option v-for="m in form.models" :key="m" :value="m">{{ m }}</option>
      </select>
    </div>

    <div class="form-foot">
      <label class="check-label"><input type="checkbox" v-model="form.enabled" />启用</label>
      <label class="check-label"><input type="checkbox" :checked="form.isDefault" @change="form.isDefault = !form.isDefault" />设为默认</label>
      <div class="foot-spacer"></div>
      <button type="button" class="cancel-btn" @click="emit('cancel')">取消</button>
      <button type="submit" class="save-btn">保存</button>
    </div>
  </form>
</template>

<style scoped>
.provider-form { display: flex; flex-direction: column; gap: var(--space-4); }
.form-group { display: flex; flex-direction: column; gap: var(--space-1); }
.form-label { font-size: var(--text-xs); font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; }
.form-input { padding: var(--space-2) var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: var(--text-sm); font-family: var(--font-sans); background: var(--panel-solid); color: var(--text); outline: none; transition: border-color var(--transition-fast); }
.form-input:focus { border-color: var(--border-strong); }

.form-row { display: flex; gap: var(--space-4); }
.flex-1 { flex: 1; }

.template-grid { display: flex; flex-wrap: wrap; gap: var(--space-1); }
.template-chip { padding: var(--space-1) var(--space-3); border: 1px solid var(--border); border-radius: 20px; background: var(--panel-solid); font-size: var(--text-xs); font-family: var(--font-sans); color: var(--text-muted); cursor: pointer; transition: all var(--transition-fast); }
.template-chip:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }

.key-wrap { display: flex; gap: var(--space-2); }
.key-wrap .form-input { flex: 1; }
.toggle-btn { padding: 0 var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--panel-solid); font-size: var(--text-xs); font-family: var(--font-sans); color: var(--text-soft); cursor: pointer; white-space: nowrap; transition: all var(--transition-fast); }
.toggle-btn:hover { color: var(--text-muted); border-color: var(--border-strong); }

.model-tags { display: flex; flex-wrap: wrap; gap: var(--space-1); }
.model-tag { display: inline-flex; align-items: center; gap: 3px; padding: 2px 10px; border-radius: 20px; background: var(--accent-soft); color: var(--accent); font-size: var(--text-xs); }
.tag-remove { background: none; border: none; cursor: pointer; font-size: 14px; color: var(--accent); padding: 0 1px; }
.tag-remove:hover { color: var(--danger); }
.add-row { display: flex; gap: var(--space-2); }
.add-row .form-input { flex: 1; }
.add-model-btn { padding: var(--space-2) var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--panel-solid); font-size: var(--text-xs); font-family: var(--font-sans); color: var(--text-muted); cursor: pointer; transition: all var(--transition-fast); }
.add-model-btn:hover { background: var(--panel-hover); color: var(--text); }

.form-foot { display: flex; align-items: center; gap: var(--space-3); padding-top: var(--space-3); border-top: 1px solid var(--border); }
.check-label { display: flex; align-items: center; gap: var(--space-1); font-size: var(--text-sm); color: var(--text-muted); cursor: pointer; }
.foot-spacer { flex: 1; }
.cancel-btn { padding: var(--space-2) var(--space-4); border: 1px solid var(--border); border-radius: var(--radius-sm); background: transparent; font-size: var(--text-sm); font-family: var(--font-sans); color: var(--text-muted); cursor: pointer; transition: all var(--transition-fast); }
.cancel-btn:hover { background: var(--panel-hover); color: var(--text); }
.save-btn { padding: var(--space-2) var(--space-5); border: none; border-radius: var(--radius-sm); background: var(--accent); color: var(--text-on-accent); font-size: var(--text-sm); font-weight: 550; font-family: var(--font-sans); cursor: pointer; transition: all var(--transition-fast); }
.save-btn:hover { background: var(--accent-hover); }
</style>
