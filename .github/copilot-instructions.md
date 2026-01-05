# Copilot Instructions for chat-bubble Repository

## Project Overview

This repository contains the **HeadwAI Chat Bubble** - a customizable AI chat widget for embedding in websites. Built with **Svelte** and **Vite**, it wraps the `deep-chat` component to provide an easy-to-integrate chat interface that connects to HeadwAI ONE or Open WebUI endpoints. The widget is published to npm as `@headwai/chat-bubble` and distributed via jsDelivr CDN.

**Type**: JavaScript/Svelte library (widget/embeddable component)  
**Runtime**: Browser-based, Node.js 18+ for development  
**Frameworks**: Svelte 4, Vite 5, deep-chat 2.3.0

## Build & Development Commands

### Installation & Setup

**ALWAYS run `npm install` before building or running development server:**

```bash
npm install
```

If you get vulnerabilities warnings, ignore them unless specifically asked to fix security issues.

### Development Server

```bash
npm run dev
```

- Starts Vite dev server on **port 5174** (not default 5173)
- Opens at `http://localhost:5174/`
- Hot reload enabled
- Uses `.env` file for configuration (copy from `.env.example` if needed)
- **Note**: Dev server requires valid API endpoint configured in `.env` to fully test chat functionality

### Building for Production

**ALWAYS build using this sequence:**

```bash
npm run build
```

This command runs two steps:

1. `npm run build:widget` - Vite build to `dist-widget/` directory (takes 2-4 seconds)
2. `npm run copy:assets` - Copies `icons/` to `dist-widget/icons/`

**Build Output** (in `dist-widget/`):

- `chat-bubble.js` - Main bundle
- `chat-bubble.css` - Styles
- `index.html` - Widget loader page
- `icons/` - Favicon and icon assets

**Expected Build Warning**: Vite warns about chunk size >500 KB. This is normal and can be ignored.

### Code Formatting

```bash
npx prettier --check src/
npx prettier --write src/
```

- Prettier configured in `.prettierrc`
- Includes Svelte plugin
- **Note**: You'll see deprecation warning about `svelteBracketNewLine` - ignore it, formatting still works

### Preview Production Build

```bash
npm run preview
```

Serves the built widget for testing.

### Testing

**NO test suite exists** - this project has no automated tests. Validation is manual via:

- Building the widget successfully
- Testing in dev server (`npm run dev`)

## Repository Structure

### Root Files (Important)

- **`package.json`** - npm config, scripts, dependencies, version (currently 6.3.0)
- **`vite.config.js`** - Build configuration for widget output
- **`svelte.config.js`** - Svelte preprocessor config
- **`.prettierrc`** - Code formatting rules
- **`.env.example`** - Template for environment variables
- **`.gitignore`** - Excludes `.env`, `dist-widget/`, `node_modules/`
- **`index.html`** - Dev server entry point (loads `/src/widget.js`)
- **`test-widget.html`** - Manual test page for built widget from CDN

### Source Code (`src/`)

**Entry Points:**

- **`src/widget.js`** - Widget initialization, auto-mount logic, config merging
- **`src/App.svelte`** - Root Svelte component

**Components (`src/components/`):**

- **`ChatContent.svelte`** - Main chat interface using deep-chat
- **`ChatHeader.svelte`** - Chat window header with close/minimize
- **`ChatIcon.svelte`** - Floating bubble icon
- **`ChatDisclaimer.svelte`** - Privacy/legal disclaimer component
- **`ChatDisclaimerInfo.svelte`** - Detailed disclaimer information

**API Layer (`src/headwai-api/`):**

- **`client.js`** - Base API client configuration and HTTP utilities
- **`chats.js`** - Chat creation and management endpoints
- **`evaluations.js`** - Feedback and evaluation endpoints
- **`tags.js`** - Chat tagging functionality
- **`titles.js`** - Chat title generation
- **`index.js`** - Main API exports

**Utilities and Core:**

- **`src/utils.js`** - UUID generation, reference extraction helpers
- **`src/stores.js`** - Svelte stores for chat state (open/closed)
- **`src/logger.js`** - Console logging utility
- **`src/constants.js`** - Application constants and configuration defaults
- **`src/i18n.js`** - Internationalization utilities and language management

**Translations (`src/translations/`):**

- **`en.js`** - English language strings
- **`de.js`** - German language strings

### Configuration Files

**Environment Variables** (`.env` - create from `.env.example`):
All use `VITE_CHAT_BUBBLE_` prefix:

- `VITE_CHAT_BUBBLE_API_URL` - API endpoint (required)
- `VITE_CHAT_BUBBLE_ASSISTANT_ID` - Assistant model ID (required)
- `VITE_CHAT_BUBBLE_MAX_MESSAGES` - Message history limit (default: 0 = unlimited)
- `VITE_CHAT_BUBBLE_PLACEHOLDER_TEXT` - Input placeholder
- `VITE_CHAT_BUBBLE_INITIAL_MESSAGE` - Welcome message
- `VITE_CHAT_BUBBLE_CHAT_TITLE` - Header title
- Color/style variables: `*_BG_COLOR`, `*_TEXT_COLOR`, `*_FONT_FAMILY`, `*_FONT_SIZE`

**Runtime Config**: Widget can override env vars via `window.HEADWAI_CHAT_BUBBLE_CONFIG` or data attributes.

### Other Directories

- **`icons/`** - SVG favicon (copied to build output)
- **`docs/images/`** - Screenshots for README
- **`.github/workflows/`** - CI/CD for npm publishing

## CI/CD & Publishing

### GitHub Actions Workflow

**File**: `.github/workflows/publish.yml`

**Triggers:**

- **Automatic**: Push to `main` branch → publishes to npm with `latest` tag
- **Manual**: `workflow_dispatch` → publishes with `rc` tag

**Build Steps:**

1. Checkout code
2. Setup Node.js 18
3. `npm ci` (clean install)
4. `npm run build`
5. Check if version exists on npm
6. Publish to npm (if version is new)
7. Create git tag for main branch releases

**Publishing Requirements:**

- `NPM_TOKEN` secret must be configured
- Version in `package.json` must be unique
- Build must succeed

**Version Bumping** (before publishing):

```bash
npm version patch  # 6.3.0 -> 6.3.1
npm version minor  # 6.3.0 -> 6.4.0
npm version major  # 6.3.0 -> 7.0.0
```

This updates `package.json`, `package-lock.json`, creates commit & git tag.

## Key Architecture & Patterns

### Widget Initialization Flow

1. `src/widget.js` loads when script tag executes
2. On `DOMContentLoaded`:
   - Merges env vars + `window.HEADWAI_CHAT_BUBBLE_CONFIG`
   - Finds `[data-chat-bubble]` elements OR `#chat-bubble-container`
   - Creates `App` Svelte instance(s)
3. `App.svelte` renders ChatIcon (closed) or ChatWindow (open)
4. User clicks icon → toggles `isChatOpen` store → shows ChatHeader + ChatContent

### API Integration

Widget makes requests to 4 HeadwAI ONE or Open WebUI API endpoints:

1. **Chat Creation** - `POST {apiUrl}/api/v1/chats/new`
2. **Chat Completions** - WebSocket `{apiUrl}/api/chat/completions` (streaming)
3. **Chat Storage** - `POST {apiUrl}/api/v1/chats/{chatId}`
4. **Feedback** - `POST {apiUrl}/api/v1/evaluations/feedback`
5. **Chat Tagging** - `POST {apiUrl}/api/v1/chats/{chatId}/tags`
6. **Tag Generation** - `POST {apiUrl}/api/v1/tasks/tags/completions`
7. **Title Generation** - `POST {apiUrl}/api/v1/tasks/title/completions`

**HeadwAI ONE**: All requests require `Origin` header matching whitelisted domain in HeadwAI ONE config.

**Open WebUI**: The widget also supports Open WebUI endpoints using the same API structure. For Open WebUI, use an API key for authentication instead of the Origin header requirement. No domain whitelisting is needed.

### Configuration Precedence

1. Data attributes (`data-chat-bubble-*`) on individual elements
2. `window.HEADWAI_CHAT_BUBBLE_CONFIG` global object
3. Environment variables (`VITE_CHAT_BUBBLE_*`)
4. Hardcoded defaults in components

## Common Issues & Workarounds

### Build Issues

**Issue**: `dist-widget/` already exists  
**Solution**: `rm -rf dist-widget/` before building, or just re-run build (overwrites)

**Issue**: Icons missing in build output  
**Solution**: `npm run copy:assets` or use full `npm run build`

### Development Issues

**Issue**: `.env` not loading  
**Solution**: Create `.env` from `.env.example`, restart dev server

**Issue**: CORS errors in dev  
**Solution**: HeadwAI ONE API must allow `http://localhost:5174` in published assistant config, or use Open WebUI with API key authentication

**Issue**: Port 5174 in use  
**Solution**: Kill process on port or change port in `package.json` dev script

### Publishing Issues

**Issue**: "Version already exists on npm"  
**Solution**: Bump version with `npm version patch/minor/major`

**Issue**: npm publish fails authentication  
**Solution**: Run `npm login` or ensure `NPM_TOKEN` secret is set

## Making Code Changes

### File to Edit for Common Tasks

- **Add/modify chat features**: `src/components/ChatContent.svelte`
- **Change chat header/UI**: `src/components/ChatHeader.svelte`
- **Modify bubble icon**: `src/components/ChatIcon.svelte`
- **Add/modify disclaimer**: `src/components/ChatDisclaimer.svelte` + `src/components/ChatDisclaimerInfo.svelte`
- **Add config options**: Update `src/widget.js` + `src/App.svelte`
- **Change API calls**: `src/headwai-api/` modules (`chats.js`, `evaluations.js`, `tags.js`, `titles.js`)
- **Modify API client**: `src/headwai-api/client.js`
- **Update translations**: `src/translations/en.js` + `src/translations/de.js`
- **Change constants**: `src/constants.js`
- **Update internationalization**: `src/i18n.js`
- **Update styling**: Component `<style>` sections (scoped CSS)
- **Build config**: `vite.config.js`

### Coding Standards

- **Prettier**: Always format before committing
- **Svelte conventions**: Use `<script>`, `<main>`, `<style>` order
- **Component props**: Define with `export let propName`
- **Stores**: Import from `src/stores.js`, use `$storeName` syntax
- **Logging**: Use `logger.log/warn/error` from `src/logger.js`

### Dependencies

**Production:**

- `deep-chat@2.3.0` - Core chat component (large bundle)

**Dev:**

- `svelte@^4.2.9`
- `vite@^5.0.12`
- `@sveltejs/vite-plugin-svelte@^3.0.1`
- `prettier@^3.6.2` + `prettier-plugin-svelte@^3.4.0`

**IMPORTANT**: Do NOT upgrade `deep-chat` without testing - it's the core dependency.

## Trust These Instructions

These instructions are comprehensive and tested. When working on this repository:

1. **Follow the build commands exactly as documented**
2. **Use the specified Node.js version (18+)**
3. **Do NOT commit `dist-widget/` or `node_modules/`**
4. **Always run `npm install` first after cloning**
5. **Format code with Prettier before committing**

Only search for additional information if these instructions are incomplete or proven incorrect.
