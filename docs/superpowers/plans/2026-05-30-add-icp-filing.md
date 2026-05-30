# Add ICP Filing Information Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a linked ICP filing number to the website footer.

**Architecture:** Define the ICP number in a global constants file and render it as a link in the shared Footer component.

**Tech Stack:** Astro, TypeScript, CSS.

---

### Task 1: Update Constants

**Files:**
- Modify: `src/consts.ts`

- [ ] **Step 1: Add SITE_ICP to constants**

Update `src/consts.ts` to include the ICP number.

```typescript
// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Astro Blog';
export const SITE_DESCRIPTION = 'Welcome to my website!';
export const SITE_ICP = '沪ICP备2024096567号-1';
```

- [ ] **Step 2: Commit constants change**

```bash
git add src/consts.ts
git commit -m "chore: add SITE_ICP constant"
```

---

### Task 2: Update Footer Component

**Files:**
- Modify: `src/components/Footer.astro`

- [ ] **Step 1: Import SITE_ICP and add markup**

Modify `src/components/Footer.astro` to import the constant and add the ICP link below the copyright notice.

```astro
---
import { SITE_ICP } from '../consts';
const today = new Date();
---

<footer>
	&copy; {today.getFullYear()} Your name here. All rights reserved.
	<div class="icp">
		<a href="https://beian.miit.gov.cn/" target="_blank">{SITE_ICP}</a>
	</div>
	<div class="social-links">
...
```

- [ ] **Step 2: Add styling for ICP link**

Update the `<style>` section in `src/components/Footer.astro`.

```css
	.icp {
		margin-top: 0.5em;
		font-size: 0.8em;
	}
	.icp a {
		text-decoration: none;
		color: rgb(var(--gray));
	}
	.icp a:hover {
		color: rgb(var(--gray-dark));
	}
```

- [ ] **Step 3: Commit footer changes**

```bash
git add src/components/Footer.astro
git commit -m "feat: add ICP filing information to footer"
```

---

### Task 3: Verification

- [ ] **Step 1: Build the project to check for errors**

Run: `npm run build`
Expected: Successful build with no errors.

- [ ] **Step 2: Verify the footer visually (manual/screenshot if possible)**
Check that the ICP link appears below the copyright notice and links to `https://beian.miit.gov.cn/`.
