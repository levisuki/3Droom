<!-- src/components/AudioControl.vue -->
<template>
  <button @click="togglePlay" class="audio-btn" :title="isPlaying ? '暂停音乐' : '播放音乐'">
    {{ isPlaying ? '⏸' : '▶' }}
  </button>
</template>

<script setup>
import { useAudio } from '@/composables/useAudio';
const { isPlaying, togglePlay } = useAudio();
</script>

<style scoped>
.audio-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}
.audio-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.08);
  border-color: rgba(255, 255, 255, 0.5);
}
.audio-btn:active {
  transform: scale(0.92);
}
</style>