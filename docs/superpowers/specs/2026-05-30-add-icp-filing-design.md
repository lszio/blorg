# Design Doc: Add ICP Filing Information

This document outlines the plan to add ICP filing information to the footer of the blog.

## Problem
In China, websites are required to display their ICP (Internet Content Provider) filing number in the footer, linked to the official MIIT website.

## Proposed Solution
1. **Global Constant**: Add the ICP number to `src/consts.ts` for easy management.
2. **Footer Update**: Modify `src/components/Footer.astro` to include a link to the MIIT website with the ICP number.

## Technical Details

### 1. `src/consts.ts`
Add a new export:
```typescript
export const SITE_ICP = '沪ICP备2024096567号-1';
```

### 2. `src/components/Footer.astro`
- Import `SITE_ICP` from `../consts`.
- Add the following markup below the copyright notice:
```astro
<div class="icp">
    <a href="https://beian.miit.gov.cn/" target="_blank">{SITE_ICP}</a>
</div>
```
- Update CSS to ensure `.icp` and its link match the footer's theme (e.g., centered, appropriate color and spacing).

## Success Criteria
- The ICP number "沪ICP备2024096567号-1" is visible in the footer on all pages.
- Clicking the ICP number opens `https://beian.miit.gov.cn/` in a new tab.
- The styling is consistent with the existing footer design.
