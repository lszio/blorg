# 沉浸式交互笔记本 (Dynamic Notebook) - Workspace 布局重构计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 彻底移除 Astro 默认模板，重构为具有左侧持久侧边栏、主内容区和沉浸式交互组件的 "Modern Workspace" 布局。

**Architecture:** 
1. **App Shell**: 一个全局的布局框架，包含固定的侧边栏和可滚动的中间内容区。
2. **Glassmorphism Sidebar**: 用于章节导航、搜索和快速设置。
3. **Interactive Content**: 保持 CodeMirror 6 编辑器和全局日志控制台。

**Tech Stack:** Astro 6, React 19, Tailwind v4, CodeMirror 6, Framer Motion.

---

### Task 1: 移除旧模板组件与重构 AppShell

**Files:**
- Modify: `src/layouts/BlogPost.astro`
- Create: `src/components/layout/AppSidebar.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: 更新全局样式，支持全屏布局**
在 `src/styles/global.css` 中确保 `html, body` 溢出隐藏，由内部容器处理滚动。
```css
html, body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}
```

- [ ] **Step 2: 编写 AppSidebar.astro**
实现玻璃拟态风格的侧边栏，包含：Logo、章节列表（动态抓取 blog 集合）、底部设置。

- [ ] **Step 3: 重构 BlogPost.astro**
移除 `<Header />` 和 `<Footer />`。
```astro
---
import BaseHead from '../components/BaseHead.astro';
import AppSidebar from '../components/layout/AppSidebar.astro';
import { GlobalConsole } from '../components/interactive/GlobalConsole';
import TOC from '../components/TOC.astro';
const { title, summary } = Astro.props;
---
<html lang="en">
  <head><BaseHead title={title} description={summary} /></head>
  <body class="bg-fixed bg-cover flex h-screen">
    <AppSidebar />
    <main class="flex-1 overflow-y-auto relative pt-16 pb-32">
       <div class="max-w-4xl mx-auto px-12">
         <article class="prose prose-slate max-w-none">
           <slot />
         </article>
       </div>
    </main>
    <GlobalConsole client:load />
  </body>
</html>
```

- [ ] **Step 4: 提交更改**
Run: `git add . && git commit -m "feat: implement modern workspace shell with persistent sidebar"`

---

### Task 2: 侧边栏动态数据与章节导航

**Files:**
- Modify: `src/components/layout/AppSidebar.astro`

- [ ] **Step 1: 在侧边栏中获取内容集合并渲染链接**
```astro
---
import { getCollection } from 'astro:content';
const posts = await getCollection('blog');
---
<nav class="flex flex-col gap-2 p-4">
  {posts.map(post => (
    <a href={`/blog/${post.id}`} class="px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm">
      {post.data.title}
    </a>
  ))}
</nav>
```

- [ ] **Step 2: 提交更改**
Run: `git add src/components/layout/AppSidebar.astro && git commit -m "feat: dynamic chapter navigation in sidebar"`

---

### Task 3: 优化内容区域与 TOC 集成

**Files:**
- Modify: `src/layouts/BlogPost.astro`
- Modify: `src/components/TOC.astro`

- [ ] **Step 1: 将 TOC 改为可选的浮动面板或右侧固定栏**
- [ ] **Step 2: 调整文章头部的视觉表现，使其更符合“笔记本”风格**

---

### Task 4: 首页 (Index) 适配

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: 重构首页，使其作为 Workspace 的入口或概览页**
- [ ] **Step 2: 提交更改**
Run: `git add src/pages/index.astro && git commit -m "feat: update homepage to match workspace design"`

---

### Task 5: 最终清理与验证

- [ ] **Step 1: 删除不再需要的旧组件 (Header, Footer, HeaderLink 等)**
- [ ] **Step 2: 运行 npm run build 验证**
