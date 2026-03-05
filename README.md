# PtcMoo - Interactive Particle FX Playground

沉浸式可交互粒子特效网页，使用 `HTML + CSS + ES Modules + Canvas + WebGL` 构建。

## 快速运行

```bash
python -m http.server 8080
# 打开 http://localhost:8080
```

## 目录结构

- `index.html`：页面结构、面板、加载层、语言与主题入口。
- `style.css`：玻璃拟态样式、主题变量、响应式与微交互动画。
- `script.js`：主流程编排、模块装配、事件联动。
- `core/particle-engine.js`：粒子物理与多输入交互核心（鼠标/键盘/触摸）。
- `render/webgl-shaders.js`：WebGL 背景着色器层（噪点、扫描感、霓虹氛围）。
- `ui/control-panel.js`：控制面板输入绑定、键盘可达性支持。
- `audio/sound-system.js`：基于 WebAudio 的轻量交互音效。
- `i18n/language-system.js`：中英双语切换。
- `config/preset-manager.js`：本地持久化、命名预设、分享链接导出。
- `presets/default-presets.json`：三套示例主题预设。
- 音效由 `audio/sound-system.js` 使用 WebAudio 实时合成，无需额外二进制资源。

## 功能摘要

- 粒子支持吸引/排斥、爆发、连线、碰撞反弹、重力与摩擦、拖拽轨迹。
- 触摸支持单击爆发、滑动轨迹、双指捏合调整密度、长按快捷打开面板。
- 键盘支持方向键控制流向、`Space` 爆发、`F` 切换 30/60 FPS、`H` 高对比模式。
- 控制面板支持实时调参（粒子、交互、后期效果、主题）。
- 主题包含可爱 / 赛博 / 极简，并联动背景与粒子风格。
- 支持本地存储配置、命名预设、分享链接生成。

## 可访问性

- 所有核心按钮具备 `aria-label`。
- 面板控件支持键盘操作与 Tab 导航。
- 提供高对比度显示切换模式。

## 说明

- 若设备性能较弱，粒子引擎会自动降低初始粒子数量。
- WebGL 不可用时，系统仍可通过 2D Canvas 正常渲染主要粒子效果。
