<!-- App.vue -->

<script setup>
import { ref, onMounted } from 'vue';
import { useAudio } from '@/composables/useAudio';
import AudioControl from '@/components/AudioControl.vue';
import HomeScene from './views/HomeScene.vue';


const audioRef = ref(null);
const { initAudio } = useAudio();

onMounted(() => {
  initAudio(audioRef.value);
});
</script>

<template>
  <router-view/>
 <audio ref="audioRef" src="/bgm.mp3" loop style="display: none;"></audio>
  <AudioControl /> 
</template>
