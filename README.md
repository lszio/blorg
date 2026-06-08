# Blorg — Interactive Learning Workspace

A modern, interactive environment for exploring computer science classics. Code blocks are executable cells; the reader edits and runs them in place.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | [Astro 6](https://astro.build) (static site + islands) |
| Interactive UI | [React 19](https://react.dev) |
| Code Editor | [CodeMirror 6](https://codemirror.net) |
| Scheme Interpreter | [LIPS](https://github.com/jcubic/lips) (browser-side) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Content Format | Org-mode (via [orgajs](https://github.com/orgajs/orgajs)) + Markdown/MDX |
| Persistence | Origin Private File System (OPFS) |

## Getting Started

```sh
bun install
bun dev
```

Opens at `http://localhost:4321`.

## Commands

| Command | Action |
|---|---|
| `bun install` | Install dependencies |
| `bun dev` | Start dev server |
| `bun build` | Build for production → `dist/` |
| `bun preview` | Preview production build |

## Architecture

```
src/
├── components/
│   ├── interactive/     # CodeMirror, GlobalConsole, InteractiveCell
│   ├── layout/          # AppSidebar
│   └── ui/              # shadcn/ui components
├── content/
│   └── blog/            # Posts in .md, .mdx, .org
├── layouts/             # BlogPost layout (TOC, sidebar, console)
├── lib/
│   ├── interpreters/    # Session, Interpreter, LogStore
│   ├── persistence/     # OPFS wrapper (PersistBackend)
│   ├── types.ts         # Core domain model (Cell, Workspace, EventBus)
│   └── utils.ts         # cn() helper
├── pages/               # Astro routes
└── styles/              # Global CSS + Tailwind
```

## Deployment

Blorg builds to a static `dist/` directory and can be deployed anywhere static files are served (Railway, Cloudflare Pages, Netlify, Vercel). Nixpacks and Railway configs are included.

## Overview

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `bun install`          | Installs dependencies                            |
| `bun dev`             | Starts local dev server at `localhost:4321`      |
| `bun build`           | Build your production site to `./dist/`          |
| `bun preview`         | Preview your build locally, before deploying     |
| `bun astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help` | Get help using the Astro CLI                     |