import { createRouter, createWebHistory } from 'vue-router';
import HomeScene from '@/views/HomeScene.vue';  // 你的3D主页
import GamePage from '@/views/GamePage.vue';

const routes = [
    { path: '/', component: HomeScene },
    { path: '/game', component: GamePage },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;