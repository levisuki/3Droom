// 射线检测
// src/composables/useRaycaster.js
import * as THREE from 'three';

export function useRaycaster() {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    // 1. 归一化坐标计算
    const getPointer = (event, container) => {
        const rect = container.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        return pointer;
    };

    // 2. 核心：检测点击到了哪个物体
    const castRay = (event, container, camera, model) => {
        if (!model) {
            return { hit: false, object: null, name: null, uv: null };
        }

        const pointer = getPointer(event, container);
        raycaster.setFromCamera(pointer, camera);

        // 收集所有 Mesh（可以缓存，但为了通用性这里实时收集）
        const meshes = [];
        model.traverse((child) => {
            if (child.isMesh) {
                meshes.push(child);
            }
        });

        const intersects = raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            return {
                hit: true,
                object: intersects[0].object,
                name: intersects[0].object.name || '未命名物体',
                uv: intersects[0].uv || null
            };
        }

        return { hit: false, object: null, name: null, uv: null };
    };

    return {
        castRay,
        getPointer
    };
}