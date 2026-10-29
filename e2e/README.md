# Chat Bubble E2E Tests

End-to-end tests for the chat bubble widget using [Playwright](https://playwright.dev/), verifying it works with **Open WebUI**.

Tests use [llmock](https://github.com/modAI-systems/llmock) as a mock LLM (echoes input back), making tests fast and deterministic.

## Project Structure

```
e2e/
├── .gitignore                         # Ignores test artifacts (playwright-report, test-results)
├── docker-compose.yml                # Services (mock-llm, backend, chat-bubble-dev)
├── Dockerfile.chat-bubble            # Builds & serves the widget for testing
├── entrypoint.sh                     # Generates test.html and starts http-server
├── package-lock.json                 # Locked test dependency versions
├── prepare-db-for-test.sh            # DB seed script (runs inside backend container)
├── playwright.openwebui.config.ts    # Playwright config for Open WebUI
├── package.json                      # Test scripts and dependencies
├── tests/
│   └── chat-bubble-open.spec.ts      # Test specs
├── utils/
│   └── setup.ts                      # Test setup (DB preparation via docker exec)
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
npm run test:openwebui      # Test with Open WebUI backend
```

### Test Specific Versions

By default the widget is built from the local source and Open WebUI uses the `:main` image. Two environment variables select other versions:

| Variable         | Effect                                                                              |
| ---------------- | ----------------------------------------------------------------------------------- |
| `BACKEND_IMAGE`  | Open WebUI image to test against                                                    |
| `WIDGET_VERSION` | Published `@headwai/chat-bubble` version from npm to test instead of the local source |

```bash
BACKEND_IMAGE=ghcr.io/open-webui/open-webui:v0.12.3 npm run test:openwebui
WIDGET_VERSION=9.0.0 BACKEND_IMAGE=ghcr.io/open-webui/open-webui:v0.12.4 npm run test:openwebui
```

The tested widget version is logged by the `chat-bubble-dev` container (`Serving chat bubble widget …`). Each run starts with an empty backend volume, so switching Open WebUI versions works without manual cleanup. Docker uses a locally cached image for a tag, so `docker pull` floating tags like `:main` before testing them.

### Interactive / Debug Modes

```bash
npm run test:openwebui:ui      # Playwright UI mode
npm run test:openwebui:debug   # Debug mode
npm run test:openwebui:headed  # Headed browser
```

### Manual Docker Control

If you prefer to manage Docker services yourself:

```bash
npm run docker:openwebui:up    # Start Open WebUI stack
npm run docker:openwebui:logs  # View logs
npm run docker:openwebui:down  # Stop & remove volumes
```

## Docker Architecture

The base `docker-compose.yml` defines three services:

| Service           | Description                                                                | Port |
| ----------------- | -------------------------------------------------------------------------- | ---- |
| `mock-llm`        | [llmock](https://github.com/modAI-systems/llmock) — OpenAI-compatible mock | 8086 |
| `backend`         | Open WebUI                                                                 | 8085 |
| `chat-bubble-dev` | Built widget served via http-server                                        | 5174 |

`openwebui/docker-compose.override.yml` sets the Open WebUI image and the API key the widget uses.

## CI

Tests run in GitHub Actions on pull requests to `main` that touch `src/`, `e2e/`, `package.json` or `vite.config.js`, against the last three Open WebUI releases. The check fails if the newest Open WebUI release fails. See `.github/workflows/compatibility.yml`.

Every Open WebUI release runs in its own job. Manual runs (`workflow_dispatch`) test a published version and open a pull request that updates the compatibility matrix.

## Troubleshooting

```bash
# Check service health
curl http://localhost:5174/test.html
curl http://localhost:8085/health

# View Docker logs
npm run docker:openwebui:logs

# Restart from scratch
npm run docker:openwebui:down
npm run docker:openwebui:up
```
