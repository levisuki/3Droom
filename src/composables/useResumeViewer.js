// src/composables/useResumeViewer.js
// 在电脑屏幕（Object_34）上渲染 PDF 简历，支持滚轮滚动、ESC 恢复桌面
import * as THREE from 'three';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerSrc;

// 屏幕显示区域的宽高比（来自 DesktopBg.png 1195x896）
const SCREEN_RATIO = 1195 / 896;
// 每页渲染宽度（像素），控制清晰度
const RENDER_WIDTH = 1000;
// 滚动步长（UV 单位）
const SCROLL_STEP = 0.03;

export function useResumeViewer() {
    let screenMesh = null;
    let controls = null;
    let resumeTexture = null;
    let isActive = false;
    let scrollY = 0;

    const bind = (mesh, orbitControls) => {
        screenMesh = mesh;
        controls = orbitControls;
    };

    // 渲染整份 PDF 为一张纵向长图纹理（每页竖直拼接），缓存复用
    const loadResume = async () => {
        if (resumeTexture) return resumeTexture;

        const pdf = await getDocument({ url: '/resume.pdf' }).promise;
        const numPages = pdf.numPages;

        // 计算每页高度与总高度
        const firstPage = await pdf.getPage(1);
        const baseVp = firstPage.getViewport({ scale: 1 });
        const scale = RENDER_WIDTH / baseVp.width;
        const pageH = baseVp.height * scale;
        const totalH = numPages * pageH;

        const canvas = document.createElement('canvas');
        canvas.width = RENDER_WIDTH;
        canvas.height = totalH;
        const ctx = canvas.getContext('2d');

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const vp = page.getViewport({ scale });
            await page.render({
                canvasContext: ctx,
                viewport: vp,
                transform: [1, 0, 0, 1, 0, (i - 1) * pageH],
            }).promise;
        }

        resumeTexture = new THREE.CanvasTexture(canvas);
        resumeTexture.colorSpace = THREE.SRGBColorSpace;

        // repeat.y 保证显示窗口像素比例为屏幕比例（不变形）
        const visibleH = RENDER_WIDTH / SCREEN_RATIO;
        resumeTexture.repeat.set(1, visibleH / totalH);
        resumeTexture.offset.y = 0;

        return resumeTexture;
    };

    // 滚轮处理：滚动 offset，preventDefault 阻止 OrbitControls 缩放
    const onWheel = (e) => {
        if (!isActive) return;
        e.preventDefault();
        const max = 1 - resumeTexture.repeat.y;
        scrollY = THREE.MathUtils.clamp(
            scrollY + e.deltaY * SCROLL_STEP,
            0,
            Math.max(0, max),
        );
        resumeTexture.offset.y = scrollY;
        resumeTexture.needsUpdate = true;
    };

    // ESC 恢复桌面
    const onKeydown = (e) => {
        if (e.key === 'Escape' && isActive) {
            close();
        }
    };

    const open = async () => {
        if (!screenMesh || isActive) return;
        try {
            const texture = await loadResume();
            screenMesh.material.map = texture;
            screenMesh.material.needsUpdate = true;
            scrollY = 0;
            texture.offset.y = 0;
            isActive = true;
            if (controls) controls.enableZoom = false;
            window.addEventListener('wheel', onWheel, { passive: false });
            window.addEventListener('keydown', onKeydown);
        } catch (err) {
            console.error('简历加载失败:', err);
        }
    };

    const close = () => {
        if (!screenMesh || !isActive) return;
        // 恢复桌面壁纸纹理
        new THREE.TextureLoader().load('/DesktopBg.png', (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            screenMesh.material.map = texture;
            screenMesh.material.needsUpdate = true;
        });
        isActive = false;
        if (controls) controls.enableZoom = true;
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('keydown', onKeydown);
    };

    return { bind, open, close, isActive };
}
