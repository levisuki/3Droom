<!-- src/components/ComputerDesktop.vue -->
<template>
  <!-- 无模板，纯 JS 动态生成 UI -->
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

import fileSvg from '@/assets/icons/file.svg?raw';
import folderSvg from '@/assets/icons/folder.svg?raw';
import gameSvg from '@/assets/icons/game.svg?raw';

const iconMap = {
  file: fileSvg,
  folder: folderSvg,
  game: gameSvg,
};

const props = defineProps({
  position: { type: Object, required: true },
  scene: { type: Object, required: true },
});

const emit = defineEmits(['openFile']);

const files = [
  { id: 'resume', label: '简历.pdf', icon: 'file' },
  { id: 'project', label: '项目资料', icon: 'folder' },
  { id: 'game', label: '伪人游戏.exe', icon: 'game' },
];

let label = null;

function createDesktopUI() {
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 8px;
    background: transparent;
    pointer-events: auto;
    width: auto;
  `;

  files.forEach(({ id, label: text, icon }) => {
    const svgCode = iconMap[icon];
    if (!svgCode) {
      console.warn(`图标 "${icon}" 未找到`);
      return;
    }

    const item = document.createElement('div');
    item.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      font-size: 13px;
      font-family: 'Segoe UI', sans-serif;
      padding: 4px 10px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      border: none;
      cursor: pointer;
      transition: background 0.15s ease;
      user-select: none;
      white-space: nowrap;
    `;

    // SVG 固定尺寸
    const svgWithSize = svgCode.replace(
      /<svg/,
      `<svg width="20" height="20" style="vertical-align:middle;flex-shrink:0;"`
    );

    item.innerHTML = `
      ${svgWithSize}
      <span>${text}</span>
    `;

    item.addEventListener('mouseenter', () => {
      item.style.background = 'rgba(255, 255, 255, 0.15)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.background = 'rgba(0, 0, 0, 0.3)';
    });
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      emit('openFile', id);
    });

    container.appendChild(item);
  });

  const labelObj = new CSS2DObject(container);
  // 位置偏移：Z轴尽量小，贴近屏幕表面
  labelObj.position.copy(props.position);
  labelObj.position.z += 0.005; // 可调，建议0.001~0.01之间
  return labelObj;
}

onMounted(() => {
  if (props.scene && props.position) {
    label = createDesktopUI();
    props.scene.add(label);
  }
});

onBeforeUnmount(() => {
  if (label && props.scene) {
    props.scene.remove(label);
  }
});
</script>