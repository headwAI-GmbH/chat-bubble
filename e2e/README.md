# Chat Bubble E2E Testing Guide

This directory contains end-to-end (E2E) tests for the **HeadwAI Chat Bubble Widget** using [Playwright](https://playwright.dev/).

The tests verify that the chat bubble widget works correctly with different backend configurations:

- **HeadwAI ONE** backend
- **Open WebUI** backend

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Backend-Specific Testing](#backend-specific-testing)
- [Docker Architecture](#docker-architecture)
- [Troubleshooting](#troubleshooting)

## Overview

The E2E tests verify the chat bubble widget functionality from a user's perspective by automating browser interactions. Tests are organized by backend type and use a common Docker Compose setup with backend-specific overrides.

The tests use [llmock](https://github.com/modAI-systems/llmock) as a mock LLM backend instead of a real model server. llmock provides an OpenAI-compatible API that echoes user input back as output (mirror strategy), making tests fast and deterministic.

## Project Structure

```
e2e/
├── docker-compose.yml              # Main Docker Compose file with shared services
├── Dockerfile.chat-bubble          # Dockerfile for chat bubble dev server
├── test-runner.sh                  # Convenient script for running tests on both backends
├── headwaione/                     # HeadwAI ONE backend tests
│   ├── docker-compose.override.yml # HeadwAI ONE specific overrides
│   ├── tests/
│   │   └── chat-bubble-open.spec.ts
│   ├── playwright.config.ts
│   ├── package.json
│   └── README.md
├── openwebui/                      # Open WebUI backend tests
│   ├── docker-compose.override.yml # Open WebUI specific overrides
│   ├── tests/
│   │   └── chat-bubble-open.spec.ts
│   ├── playwright.config.ts
│   ├── package.json
│   └── README.md
├── utils/                          # Shared test utilities (legacy)
├── tests/                          # Legacy backend API tests
├── package.json                    # Legacy backend API test dependencies
├── playwright.config.ts            # Legacy backend API test config
├── playwright.kinoel.config.ts     # Kinoel-specific test config
├── prepare-db-for-test.sh          # Database preparation script (legacy)
├── Caddyfile                       # Caddy proxy configuration (legacy)
└── README.md                       # This file
```

## Quick Start

### Using the Test Runner Script (Recommended)

```bash
# Setup everything (install dependencies, build widget)
./test-runner.sh setup

# Test both backends
./test-runner.sh test

# Test specific backend
./test-runner.sh test headwaione
./test-runner.sh test openwebui

# Start services for development
./test-runner.sh up headwaione
./test-runner.sh up openwebui

# View logs
./test-runner.sh logs headwaione

# Stop services
./test-runner.sh down
```

### Manual Testing

```bash
# Test HeadwAI ONE backend
cd headwaione
npm install
npx playwright install
npm test

# Test Open WebUI backend
cd ../openwebui
npm install
npx playwright install
npm test
```

### Testing Specific Backend

```bash
# HeadwAI ONE only
cd headwaione
npm run docker:up    # Start services
npm test             # Run tests
npm run docker:down  # Stop services

# Open WebUI only
cd openwebui
npm run docker:up    # Start services
npm test             # Run tests
npm run docker:down  # Stop services
```

## Backend-Specific Testing

### HeadwAI ONE Backend

**Location**: `headwaione/`

**Configuration**:

- Backend: HeadwAI ONE (headwai/headwai-open-webui)
- Port: 8085
- Authentication: Origin header based
- Features: Domain access control, evaluation, sharing

**Commands**:

```bash
cd headwaione
npm test              # Run tests
npm run test:ui       # Interactive mode
npm run docker:logs   # View service logs
```

**Tests**:

- ✅ Chat bubble opens successfully
- ✅ HeadwAI branding appears correctly
- ✅ Deep-chat component loads
- ✅ Proper styling and positioning

### Open WebUI Backend

**Location**: `openwebui/`

**Configuration**:

- Backend: Open WebUI (ghcr.io/open-webui/open-webui)
- Port: 8080
- Authentication: API key based
- Features: Standard OpenAI compatibility

**Commands**:

```bash
cd openwebui
npm test              # Run tests
npm run test:ui       # Interactive mode
npm run docker:logs   # View service logs
```

**Tests**:

- ✅ Chat bubble opens successfully
- ✅ Open WebUI branding appears correctly
- ✅ API key authentication works
- ✅ Deep-chat component loads
- ✅ Proper styling and positioning

## Docker Architecture

### Main Services (`docker-compose.yml`)

**Shared services across both backends:**

- **mock-llm**: llmock service for predictable testing
- **backend**: Base backend configuration (overridden per backend)
- **chat-bubble-dev**: Widget development server
- **cleanup**: Database cleanup service

### Backend Overrides

**HeadwAI ONE** (`headwaione/docker-compose.override.yml`):

- Uses HeadwAI ONE Docker image
- Configures HeadwAI-specific environment variables
- Sets up evaluation and sharing features

**Open WebUI** (`openwebui/docker-compose.override.yml`):

- Uses Open WebUI Docker image
- Configures API key authentication
- Sets different port (8080) to avoid conflicts

### Usage

```bash
# Start HeadwAI ONE environment
cd headwaione
docker compose -f ../docker-compose.yml -f docker-compose.override.yml up -d

# Start Open WebUI environment
cd openwebui
docker compose -f ../docker-compose.yml -f docker-compose.override.yml up -d
```

## Troubleshooting

### Docker Issues

**Services won't start:**

```bash
# Check what's running
docker ps

# View service logs
docker compose logs [service-name]

# Restart everything
docker compose down -v
docker compose up --build -d
```

**Port conflicts:**

- HeadwAI ONE: 8085, 8086
- Open WebUI: 8080, 8087
- Chat Bubble: 5174

**Common fixes:**

```bash
# Kill processes on conflicting ports
lsof -ti:8085 | xargs kill -9

# Clean up Docker
docker system prune -a
```

### Test Issues

**Playwright errors:**

```bash
# Reinstall browsers
npx playwright install

# Run in debug mode
npm run test:debug

# Check service health
curl http://localhost:5174/test.html
curl http://localhost:8085/health  # or 8080 for Open WebUI
```

**Chat bubble not loading:**

```bash
# Check if widget was built
ls -la ../dist-widget/

# Rebuild widget if needed
cd ..
npm run build
```

### Network Issues

**CORS errors:**

- Check that CORS_ALLOW_ORIGIN includes http://localhost:5174
- Verify Docker networks are properly configured

**API authentication errors:**

- HeadwAI ONE: Check Origin header configuration
- Open WebUI: Verify API key is set correctly

### Development Tips

**Adding new tests:**

1. Create test files in `headwaione/tests/` or `openwebui/tests/`
2. Use existing test structure as template
3. Run `npm run test:ui` for interactive development

**Debugging failed tests:**

```bash
# Run specific test with trace
npx playwright test chat-bubble-open.spec.ts --trace on

# Generate and view report
npm run test:report
```

**Service debugging:**

```bash
# View all container logs
npm run docker:logs

# Execute commands in containers
docker exec -it backend-e2e /bin/bash
docker exec -it chat-bubble-dev-e2e /bin/sh
```

## Migration from Legacy Tests

The legacy backend API tests remain in the root `e2e/` directory:

- `tests/` - Backend API functionality tests
- `package.json` - Dependencies for legacy backend API tests
- `playwright.config.ts` - Configuration for legacy backend API tests
- `playwright.kinoel.config.ts` - Kinoel-specific backend API tests
- `utils/` - Shared utilities for legacy backend API tests

The new chat bubble widget tests are organized in backend-specific folders:

- `headwaione/` - Chat bubble tests with HeadwAI ONE backend
- `openwebui/` - Chat bubble tests with Open WebUI backend

This separation allows for:

- **Independent test execution** - Run widget tests separate from API tests
- **Backend-specific configurations** - Each backend has its own Docker overrides
- **Clearer test organization** - Widget tests vs API tests are clearly separated
- **Easier maintenance** - Changes to one test type don't affect the other
