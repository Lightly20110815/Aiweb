<script setup lang="ts">
defineProps<{ show: boolean; title?: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header" v-if="title">
          <h2>{{ title }}</h2>
          <button class="modal-close" @click="emit('close')">&times;</button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,.5); display: flex;
  align-items: center; justify-content: center;
  padding: 20px;
}
.modal-content {
  background: var(--bg-primary);
  border-radius: 12px; max-width: 640px; width: 100%;
  max-height: 85vh; overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,.3);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 0; font-size: 18px; font-weight: 600;
}
.modal-close {
  background: none; border: none; font-size: 24px;
  cursor: pointer; color: var(--text-secondary);
}
.modal-body { padding: 24px; }
</style>
