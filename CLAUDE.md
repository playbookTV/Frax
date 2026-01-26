# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fractal Glass is a Figma plugin that applies procedural prismatic glass overlay effects to frames and groups. It uses Figma's native GLASS effect API to create variable-width glass pane strips.

## Commands

All commands run from the `fractal/` directory:

```bash
cd fractal

# Development
npm run dev          # Watch mode with hot reload
npm run build        # Production build (minified)

# Quality
npm run lint         # ESLint
npm run format       # Prettier format
npm run format:check # Check formatting only

# Testing
npm run vitest       # Unit tests (experimental, requires dev server running)
npm run playwright   # E2E tests (experimental)
```

## Architecture

### Dual Execution Contexts

The plugin runs in two separate sandboxed environments:

1. **Main thread** (`src/main/`) - Runs in Figma's plugin sandbox
   - Has access to `figma` global API
   - Cannot access DOM or browser APIs
   - Entry: [main.ts](fractal/src/main/main.ts)

2. **UI thread** (`src/ui/`) - Runs in sandboxed iframe
   - Preact-based UI using `@create-figma-plugin/ui`
   - Cannot access Figma API directly
   - Entry: [ui.tsx](fractal/src/ui/ui.tsx)

Communication between threads uses `postMessage`:
- Main → UI: `figma.ui.postMessage()`
- UI → Main: `parent.postMessage({ pluginMessage: {...} }, '*')`

### Core Files

- [effectGenerator.ts](fractal/src/main/effectGenerator.ts) - Glass effect generation logic; defines `GlassSettings` interface and creates glass pane frames with GLASS effects
- [App.tsx](fractal/src/ui/App.tsx) - Main UI component with all parameter controls (stripe density, frosting, refraction, depth, dispersion, lighting)

### Build Output

Built files go to `fractal/build/` (main.js, ui.js). The `manifest.json` references these.

## Superpowers Agent Workflows

This repo includes a Superpowers agent system (`.agent/`). Key rules:

1. **Plan gate**: Non-trivial changes require brainstorm → plan → user approval before implementation
2. **Verification mandatory**: Always provide commands to verify changes
3. **Artifacts**: Save brainstorm/plan/review output to `artifacts/superpowers/`

## Testing Notes

Tests use `plugma/vitest` which provides a mocked Figma environment. Vitest tests are in `fractal/vitest/`, Playwright tests in `fractal/playwright/`.
