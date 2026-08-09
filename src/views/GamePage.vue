<!-- src/views/GamePage.vue -->
<template>
  <div class="game-container">
    <img src="/bg2.png" alt="电脑桌面" class="fullscreen-image" />
    <button @click="goBack" class="close-btn">返回房间</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

function goBack() {
  router.push('/');
}
</script>

<style scoped>
.game-container {
  position: fixed;
  inset: 0; /* top left right bottom = 0，等价top:0;left:0;width:100vw;height:100vh */
  z-index: 100;
  background: black;
}
.fullscreen-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 不要设置z-index！ */
}
.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  font-size: 20px;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  /* DOM顺序在后，天然在图片上层，无需z-index */
}
</style>