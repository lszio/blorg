# Setup Infrastructure and Glassmorphism Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install necessary dependencies and configure Tailwind v4 with glassmorphism utilities and global theme variables.

**Architecture:** Extend existing Tailwind v4 configuration in `global.css` with custom theme variables for fonts, glass colors, and radii. Implement a custom utility layer for glassmorphism effects and update the global body style for the notebook aesthetic.

**Tech Stack:** Bun, Tailwind CSS v4, CodeMirror, Framer Motion.

---

### Task 1: Dependency Installation

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dependencies**

Run: `bun install @codemirror/view @codemirror/state @codemirror/language @codemirror/commands @codemirror/legacy-modes codemirror framer-motion --silent`

- [ ] **Step 2: Verify installation**

Run: `grep -E "@codemirror/view|@codemirror/state|@codemirror/language|@codemirror/commands|@codemirror/legacy-modes|codemirror|framer-motion" package.json`
Expected: All packages listed in dependencies.

---

### Task 2: Configure Global Styles and Glassmorphism

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Define new theme variables**

Add the following to the `@theme` block in `src/styles/global.css`:
```css
  --font-atkinson: "Atkinson", sans-serif;
  --font-mono: "JetBrains Mono", "Geist Mono", monospace;
  
  --color-glass: rgba(255, 255, 255, 0.4);
  --color-glass-border: rgba(255, 255, 255, 0.2);
  --color-glass-dark: rgba(0, 0, 0, 0.4);
  
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
```

- [ ] **Step 2: Add glassmorphism utility classes**

Add the `@layer utilities` block:
```css
@layer utilities {
  .glass {
    background: var(--color-glass);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--color-glass-border);
  }
  
  .glass-dark {
    background: var(--color-glass-dark);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}
```

- [ ] **Step 3: Update global body styles**

Replace the existing `body` block and background logic to match:
```css
body {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  font-family: var(--font-atkinson);
}
```

- [ ] **Step 4: Verify CSS changes**

Run: `grep -E "glass|--color-glass|min-height: 100vh" src/styles/global.css`
Expected: Presence of the new classes and variables.

---

### Task 3: Commit Changes

- [ ] **Step 1: Stage and commit**

Run: `git add package.json src/styles/global.css && git commit -m "chore: setup dependencies and tailwind v4 glassmorphism utilities"`

- [ ] **Step 2: Verify commit**

Run: `git log -1 --stat`
Expected: Commit message matches and shows changes to both files.
