# 设计文档：沉浸式交互笔记本 (Dynamic Notebook) UI/UX 重构

本方案旨在将当前的极简博客模板重构为一个沉浸式的交互编程与阅读环境。通过引入玻璃拟态视觉风格、全功能编辑器和优化的内容布局，提升用户在阅读技术文章时的交互体验。

## 1. 目标 (Goals)
- **沉浸感**：减少视觉噪音，使代码与文本自然融合。
- **专业度**：提供接近 IDE 的代码编辑体验（语法高亮、补全、快捷键）。
- **交互性**：简化代码执行流程，提供清晰的反馈。
- **现代美感**：采用玻璃拟态 (Glassmorphism) 和流畅的动画。

## 2. 核心组件设计 (Core Components)

### 2.1 InteractiveCell (代码单元格)
- **容器**：`backdrop-filter: blur(16px)`，半透明背景，细边框，圆角。
- **编辑器**：集成 **CodeMirror 6**。
  - 支持 `scheme` 语法高亮。
  - 快捷键：`Ctrl/Cmd + Enter` 执行。
- **内联输出**：
  - 显示在编辑器下方。
  - 成功态：绿色指示符。
  - 错误态：红色指示符，显示详细堆栈。

### 2.2 GlobalConsole (全局控制台)
- **位置**：页面底部吸附，支持折叠。
- **功能**：
  - 汇总所有单元格的输出日志。
  - 清空日志按钮。
  - 显示解释器当前状态。

### 2.3 Layout & Navigation (布局与导航)
- **文章宽度**：限制在 `768px` (md) 以保证阅读体验。
- **目录 (TOC)**：侧边悬浮目录，随阅读进度点亮。
- **页眉 (Header)**：玻璃拟态，吸顶显示文章标题和阅读进度。

## 3. 视觉规范 (Visual Specs)
- **背景**：柔和的线性渐变（浅蓝到浅灰）。
- **字体**：
  - 正文：Geist / Atkinson Hyperlegible。
  - 代码：JetBrains Mono / Geist Mono。
- **阴影**：使用分层的软阴影，强调组件的悬浮感。

## 4. 技术栈 (Tech Stack)
- **Framework**: Astro 6.x
- **UI Components**: React 19 + shadcn/ui (Radix Nova)
- **Styling**: Tailwind CSS v4
- **Editor**: CodeMirror 6
- **Interpreter**: lips (Scheme)

## 5. 实施路线图 (Implementation Roadmap)
1. **基础建设**：配置 Tailwind v4 变量，添加 CodeMirror 依赖。
2. **核心组件**：重构 `InteractiveCell` 并集成 CodeMirror。
3. **全局状态**：实现跨组件的日志汇总机制。
4. **页面重构**：更新 `BlogPost.astro` 布局。
5. **打磨**：添加动画和响应式适配。
