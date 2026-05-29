<script setup lang="ts">
import type { Provider } from '@/types/provider'

defineProps<{ providers: Provider[] }>()
const emit = defineEmits<{ edit: [id: string]; delete: [id: string]; setDefault: [id: string] }>()
</script>

<template>
  <div class="provider-list">
    <div v-if="providers.length === 0" class="empty">
      <p class="empty-title">还没有 Provider</p>
      <p class="empty-desc">点击上方「添加」按钮开始配置</p>
    </div>

    <div v-for="p in providers" :key="p.id" class="provider-card">
      <div class="card-main">
        <div class="card-info">
          <div class="card-name">
            {{ p.name }}
            <span v-if="p.isDefault" class="badge default">默认</span>
            <span v-if="!p.enabled" class="badge off">已禁用</span>
          </div>
          <div class="card-meta">
            <span>{{ p.baseUrl || '(未设置 Base URL)' }}</span>
            <span class="meta-sep">·</span>
            <span>{{ p.models.length }} 个模型</span>
            <span class="meta-sep">·</span>
            <span>{{ p.requestFormat }}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="act" @click="emit('edit', p.id)">编辑</button>
          <button v-if="!p.isDefault && p.enabled" class="act" @click="emit('setDefault', p.id)">设为默认</button>
          <button class="act danger" @click="emit('delete', p.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.provider-list { display: flex; flex-direction: column; gap: var(--space-2); }

.empty { text-align: center; padding: var(--space-6) var(--space-4); }
.empty-title { font-size: var(--text-base); font-weight: 500; color: var(--text-muted); margin-bottom: var(--space-1); }
.empty-desc { font-size: var(--text-sm); color: var(--text-soft); }

.provider-card { border-radius: var(--radius-md); padding: var(--space-4); background: var(--panel); border: 1px solid var(--border); transition: all var(--transition-fast); }
.provider-card:hover { border-color: var(--border-strong); }
.card-main { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); }
.card-info { flex: 1; min-width: 0; }
.card-name { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-base); font-weight: 550; color: var(--text); margin-bottom: var(--space-1); }
.badge { font-size: var(--text-xs); padding: 1px 7px; border-radius: 10px; font-weight: 530; }
.badge.default { background: var(--accent-soft); color: var(--accent); }
.badge.off { background: var(--panel-solid); color: var(--text-soft); }
.card-meta { display: flex; align-items: center; gap: var(--space-1); font-size: var(--text-xs); color: var(--text-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.meta-sep { color: var(--text-soft); }

.card-actions { display: flex; gap: var(--space-1); flex-shrink: 0; }
.act { padding: var(--space-1) var(--space-3); border: 1px solid var(--border); border-radius: var(--radius-sm); background: transparent; font-size: var(--text-xs); font-family: var(--font-sans); color: var(--text-muted); cursor: pointer; transition: all var(--transition-fast); }
.act:hover { background: var(--panel-hover); color: var(--text); border-color: var(--border-strong); }
.act.danger { color: var(--danger); border-color: transparent; }
.act.danger:hover { background: var(--danger-soft); border-color: rgba(255, 139, 154, 0.2); }

@media (max-width: 640px) {
  .card-main { flex-direction: column; align-items: flex-start; }
  .card-actions { width: 100%; justify-content: flex-end; }
}
</style>
