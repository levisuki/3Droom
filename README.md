# 灾厄之下 · Calamity Underneath

一个基于 **Vue 3 + Three.js** 构建的 3D 交互式作品集场景。用户可以在一个可自由漫游的 3D 房间中探索，点击房间内的电脑屏幕，查看个人作品、PDF 简历并跳转到外部项目。

## ✨ 功能特性

- **3D 房间场景**：加载 GLTF 房间模型，包含多光源与阴影映射的沉浸式渲染
- **自由视角漫游**：OrbitControls 支持旋转 / 缩放 / 平移，阻尼平滑
- **相机飞行动画**：点击交互点后平滑飞向目标视角（默认 / 电脑 / 游戏）
- **屏幕纹理渲染**：房间电脑屏幕贴图壁纸，图标即纹理的一部分
- **图标点击识别**：基于 Raycaster 与 UV 坐标判断点击命中哪个图标，无需额外热区层，旋转缩放都不错位
- **PDF 简历查看**：点击"简历"图标，使用 PDF.js 将简历渲染到电脑屏幕上，支持滚轮滚动查看，按 `ESC` 恢复桌面
- **外部跳转**：点击"Token 记账"、"实时天气"图标跳转到对应外部站点
- **页面路由**：点击游戏机图标跳转至游戏占位页
- **背景音乐**：右下角圆形按钮控制 BGM 播放 / 暂停

## 🧩 技术栈

- [Vue 3](https://vuejs.org/)（`<script setup>`）+ [Vue Router](https://router.vuejs.org/)
- [Three.js](https://threejs.org/)（WebGL 渲染、GLTFLoader、OrbitControls、CSS2DRenderer 已被移除）
- [PDF.js](https://mozilla.github.io/pdf.js/)（`pdfjs-dist`）
- [Vite](https://vitejs.dev/)

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview
```

开发服务器默认运行在 `http://localhost:5173`。

## 🗂️ 项目结构

```
calamity-underneath/
├── public/                      # 静态资源（直接通过根路径引用）
│   ├── DesktopBg.png            # 电脑屏幕壁纸 + 图标合成图
│   ├── resume.pdf               # 简历（点击"简历"图标渲染）
│   ├── bgm.mp3                  # 背景音乐
│   └── ...
├── src/
│   ├── assets/                  # 图标、素材
│   ├── components/              # 通用组件
│   │   ├── AudioControl.vue     # BGM 播放控制按钮
│   │   └── ComputerDesktop.vue  # 桌面 UI 组件（暂未使用）
│   ├── composables/             # 组合式函数
│   │   ├── useAudio.js          # 音频播放/暂停状态管理
│   │   ├── useCameraAnimation.js# 相机飞行动画
│   │   ├── useRaycaster.js      # 3D 拾取（点击物体 / UV）
│   │   └── useResumeViewer.js   # PDF 简历渲染到屏幕 + 滚动 + ESC 恢复
│   ├── models/room.glb          # 房间 3D 模型
│   ├── router/index.js          # 路由配置（/、/game）
│   ├── views/
│   │   ├── HomeScene.vue        # 3D 主场景页
│   │   └── GamePage.vue         # 游戏占位页
│   ├── App.vue                  # 根组件（全局音频 + 路由出口）
│   ├── main.js                  # 应用入口
│   └── style.css                # 全局样式
├── index.html
├── vite.config.js
└── package.json
```

## 🎮 交互说明

| 交互对象 | 操作 | 行为 |
| --- | --- | --- |
| 电脑屏幕 · 简历图标 | 点击 | 飞向电脑视角，将 `resume.pdf` 渲染到屏幕，滚轮滚动查看，`ESC` 恢复桌面 |
| 电脑屏幕 · Token 记账图标 | 点击 | 新标签页打开 Token 记账待办应用 |
| 电脑屏幕 · 实时天气图标 | 点击 | 新标签页打开天气项目 |
| 游戏机（Object_6） | 点击 | 飞向游戏视角后跳转 `/game` 游戏页 |
| 背景音乐按钮 | 点击 | 播放 / 暂停 BGM |

## ⚙️ 图标区域配置

图标在纹理上的点击区域定义于 `src/views/HomeScene.vue` 的 `ICON_REGIONS`，使用 UV 归一化坐标（0~1）。更换壁纸图片后，可运行项目点击屏幕查看控制台输出的 UV，再据此调整：

```js
const ICON_REGIONS = {
  'token-log': { x: 0.035, y: 0.90, w: 0.070, h: 0.10 },
  'weather':   { x: 0.125, y: 0.88, w: 0.070, h: 0.12 },
  'resume':    { x: 0.22,  y: 0.87, w: 0.070, h: 0.12 },
};
```

## 📝 常见问题

**Q：点击屏幕没反应 / 点不准图标？**
A：`ICON_REGIONS` 中的区域与壁纸图标位置不匹配。在浏览器控制台点击屏幕会打印命中点的 UV 坐标，据此修正区域范围即可。

**Q：简历加载失败（`getDocument - expected either data, range, or url parameter`）？**
A：确认 `useResumeViewer.js` 中使用的是 `getDocument({ url: '/resume.pdf' })` 对象传参形式（pdf.js v6 起不再支持直接传字符串）。

**Q：简历渲染在屏幕上看不清？**
A：`RENDER_WIDTH`（`useResumeViewer.js`）控制 PDF 渲染分辨率，值越大越清晰，但会消耗更多内存。

## 📄 License

MIT
