# Chat Bubble E2E Tests

End-to-end tests for the chat bubble widget using [Playwright](https://playwright.dev/), verifying it works with both **HeadwAI ONE** and **Open WebUI** backends.

Tests use [llmock](https://github.com/modAI-systems/llmock) as a mock LLM (echoes input back), making tests fast and deterministic.

## Project Structure

```
e2e/
├── docker-compose.yml                # Shared services (mock-llm, backend, chat-bubble-dev)
├── Dockerfile.chat-bubble            # Builds & serves the widget for testing
├── entrypoint.sh                     # Generates test.html and starts http-server
├── prepare-db-for-test.sh            # DB seed script (runs inside backend container)
├── playwright.headwaione.config.ts   # Playwright config for HeadwAI ONE
├── playwright.openwebui.config.ts    # Playwright config for Open WebUI
├── package.json                      # Test scripts and dependencies
├── tests/
│   └── chat-bubble-open.spec.ts      # Shared test specs (both backends)
├── utils/
│   └── setup.ts                      # Test setup (DB preparation via docker exec)
├── headwaione/
│   └── docker-compose.override.yml   # HeadwAI ONE image & env overrides
└── openwebui/
    └── docker-compose.override.yml   # Open WebUI image & env overrides
```

## Quick Start

From the `e2e/` directory:

```bash
npm install
npx playwright install
```

### Run Tests

Each command starts Docker services automatically (via Playwright `webServer`), runs the tests, then tears down:

```bash
npm run test:headwaione     # Test with HeadwAI ONE backend
npm run test:openwebui      # Test with Open WebUI backend
```

### Interactive / Debug Modes

```bash
npm run test:headwaione:ui      # Playwright UI mode
npm run test:openwebui:ui
npm run test:headwaione:debug   # Debug mode
npm run test:openwebui:debug
npm run test:headwaione:headed  # Headed browser
npm run test:openwebui:headed
```

### Manual Docker Control

If you prefer to manage Docker services yourself:

```bash
npm run docker:headwaione:up    # Start HeadwAI ONE stack
npm run docker:headwaione:logs  # View logs
npm run docker:headwaione:down  # Stop & remove volumes

npm run docker:openwebui:up     # Start Open WebUI stack
npm run docker:openwebui:logs
npm run docker:openwebui:down
```

## Docker Architecture

The base `docker-compose.yml` defines three shared services:

| Service | Description | Port |
|---|---|---|
| `mock-llm` | [llmock](https://github.com/modAI-systems/llmock) — OpenAI-compatible mock | 8086 |
| `backend` | Open WebUI / HeadwAI ONE (overridden per backend) | 8085 |
| `chat-bubble-dev` | Built widget served via http-server | 5174 |

Each backend has a `docker-compose.override.yml` that swaps the backend image and sets backend-specific environment variables (e.g. API key for Open WebUI, Origin-based auth for HeadwAI ONE).

## CI

Tests run automatically in GitHub Actions on pushes/PRs to `main`/`develop` that touch `src/`, `e2e/`, `package.json`, or `vite.config.js`. See `.github/workflows/widget-e2e-tests.yml`.

Both backends are tested in parallel jobs. You can also trigger manually and select a specific backend via `workflow_dispatch`.

## Troubleshooting

```bash
# Check service health
curl http://localhost:5174/test.html
curl http://localhost:8085/health

# View Docker logs
npm run docker:headwaione:logs  # or docker:openwebui:logs

# Restart from scratch
npm run docker:headwaione:down
npm run docker:headwaione:up
```
