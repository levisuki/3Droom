<template>
  <div ref="container" class="scene-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { useRaycaster } from '@/composables/useRaycaster';
import { useCameraAnimation } from '../composables/useCameraAnimation';
import { useResumeViewer } from '../composables/useResumeViewer';
import { useRouter } from 'vue-router';

const router = useRouter();
const container = ref(null);

let scene, camera, renderer, model, controls, flyToView, updateAnimation;

const { castRay } = useRaycaster();
const resumeViewer = useResumeViewer();

// 图标在纹理上的归一化区域（UV 坐标，左上角+外扩）
const ICON_REGIONS = {
  'token-log': { x: 0.035, y: 0.90, w: 0.070, h: 0.10 },
  'weather':   { x: 0.125, y: 0.88, w: 0.070, h: 0.12 },
  'resume':    { x: 0.22, y: 0.87, w: 0.070, h: 0.12 },
};

function hitIcon(uv) {
  for (const [id, r] of Object.entries(ICON_REGIONS)) {
    if (uv.x >= r.x && uv.x <= r.x + r.w &&
        uv.y >= r.y && uv.y <= r.y + r.h) return id;
  }
  return null;
}

// --- 初始化场景 ---
function initScene() {
  console.log('🥚 1.初始化场景(准备阶段)');

  const width = container.value.clientWidth;
  const height = container.value.clientHeight;
  
  // 1. 场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  // 2. 相机
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(3, 2, 5);

  // 3. 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.value.appendChild(renderer.domElement);

  // 4. 轨道控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // 6. 灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0xffcc88, 0.4);
  fillLight.position.set(-3, 1, 4);
  scene.add(fillLight);

  // 7. 视角动画
  const cameraAnimation = useCameraAnimation(camera, controls);
  flyToView = cameraAnimation.flyToView;
  updateAnimation = cameraAnimation.updateAnimation;

  window.addEventListener('resize', onResize);
}

// --- 加载 GLB 模型 ---
function loadModel() {
  const loader = new GLTFLoader();

  loader.load(
    '/models/room.glb',
    (gltf) => {
      model = gltf.scene;
      model.scale.set(1, 1, 1);
      model.position.set(0, -0.5, 0);
      scene.add(model);

      const textureLoader = new THREE.TextureLoader();

      model.traverse((child) => {
        if (child.isMesh && child.name === 'Object_34') {
          // 贴纹理（壁纸 + 图标合成图）
          textureLoader.load('/DesktopBg.png', (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            const newMaterial = new THREE.MeshStandardMaterial({
              map: texture,
              color: 0xffffff,
              metalness: 0,
              roughness: 1,
              side: THREE.DoubleSide,
            });
            child.material = newMaterial;
          });
          // 绑定 PDF 简历查看器到屏幕网格
          resumeViewer.bind(child, controls);
        }
      });

      console.log('模型加载成功！');
    },
    (xhr) => {
      const progress = (xhr.loaded / xhr.total) * 100;
      console.log(`加载进度: ${Math.round(progress)}%`);
    },
    (error) => {
      console.error('模型加载失败:', error);
    }
  );
}

// --- 图标点击分发 ---
function handleIconClick(iconId) {
  if (iconId === 'token-log') {
    console.log('🖱️ 点击图标: token-log');
    window.open('https://todo-4vs.pages.dev/', '_blank');
  } else if (iconId === 'weather') {
    console.log('🖱️ 点击图标: weather');
    window.open('https://github.com/levisuki/weatherview', '_blank');
  } else if (iconId === 'resume') {
    console.log('🖱️ 点击图标: resume，渲染 PDF 简历');
    flyToView('computer');
    resumeViewer.open();
  } else {
    console.log(`🖱️ 点击图标: ${iconId}`);
  }
}

// --- 3D 点击事件 ---
function handleCanvasClick(event) {
  const result = castRay(event, container.value, camera, model);
  if (result.hit) {
    console.log(`🎯 点击到了: ${result.name}`);
    if (result.name === 'Object_6') {
      flyToView('game');
      setTimeout(() => router.push('/game'), 800);
    } else if (result.name === 'Object_34') {
      if (result.uv) {
        const icon = hitIcon(result.uv);
        if (icon) {
          handleIconClick(icon);
        } else {
          console.log(`🖥️ 屏幕UV: x=${result.uv.x.toFixed(3)}, y=${result.uv.y.toFixed(3)}`);
        }
      }
      flyToView('computer');
    }
  } else {
    console.log('🌌 空白背景');
  }
}

// --- 动画循环 ---
function animate() {
  controls.update();
  requestAnimationFrame(animate);
  updateAnimation();
  renderer.render(scene, camera);
}

// --- 窗口自适应 ---
function onResize() {
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// --- 生命周期 ---
onMounted(() => {
  initScene();
  loadModel();
  animate();
  container.value.addEventListener('click', handleCanvasClick);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  renderer.dispose();
  if (model) {
    model.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }
});
</script>

<style scoped>
.scene-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 1;
}
</style>