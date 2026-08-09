// src/composables/useCameraAnimation.js
import * as THREE from 'three';

export function useCameraAnimation(camera, controls) {
    // ===== 状态 =====
    let isAnimating = false;
    let animStartTime = 0;
    const animDuration = 1200;
    let startPos = new THREE.Vector3();
    let endPos = new THREE.Vector3();
    let startTarget = new THREE.Vector3();
    let endTarget = new THREE.Vector3();

    // ===== 预设视角 =====
    const views = {
        default: { pos: [3, 2, 5], target: [0, 0, 0] },
        computer: { pos: [-1.36, 2, -1.22], target: [-1.38, 2, -1.22] },
        game: { pos: [-0.12, 2.63, -0.04], target: [-0.089, 2.63, -1.66] },
    };

    // ===== 飞向某视角 =====
    function flyToView(viewName) {
        const view = views[viewName];
        if (!view) return;

        startPos.copy(camera.position);
        startTarget.copy(controls.target);
        endPos.set(...view.pos);
        endTarget.set(...view.target);

        isAnimating = true;
        animStartTime = performance.now();
    }

    // ===== 在 animate 循环中调用 =====
    function updateAnimation() {
        if (!isAnimating) return;

        const elapsed = performance.now() - animStartTime;
        const t = Math.min(elapsed / animDuration, 1);
        const ease = t * t * (3 - 2 * t);

        camera.position.lerpVectors(startPos, endPos, ease);
        controls.target.lerpVectors(startTarget, endTarget, ease);

        if (t >= 1) {
            isAnimating = false;
        }
    }

    // // ===== 添加新视角（可选） =====
    // function addView(name, pos, target) {
    //     views[name] = { pos, target };
    // }

    return {
        flyToView,
        updateAnimation,
        // addView,
        views,
    };
}