# Changelog

All notable changes to this project will be documented in this file.

## [10.0.0] - 2026-10-29

### Removed

- **Breaking:** Support for HeadwAI ONE. The chat bubble only works with Open WebUI.

### Changed

- **Breaking:** `apiKey` is required. A missing API key is logged as error in the browser console.
- Requests no longer send the `assistantId` field that was only used by HeadwAI ONE.
- The compatibility matrix and its end-to-end tests only cover Open WebUI.

## [9.0.0] - 2026-10-22

### Added

- Compatibility matrix in the README listing the HeadwAI ONE and Open WebUI versions each chat bubble version was tested against. Automated end-to-end tests run against the last three releases of HeadwAI ONE and Open WebUI.

### Changed

- **Breaking:** The chat completions request no longer sends `chat_id`, `id`, `parent_id` or `user_message`, so the backend answers with server-sent events. The chat history is still stored by the chat bubble. Older backends that need these fields no longer work, see the compatibility matrix.

### Fixed

- Chat completions with HeadwAI ONE / Open WebUI 0.12 failing with `No valid stream events were sent` or `409 Message already exists or has an invalid ID.`

## [8.4.0] - 2026-07-06

### Added

- Configurable message bubble max width (`messageBubbleMaxWidth`), default widened from deep-chat's 60% to 85%

### Changed

- Updated deep-chat from 2.3.0 to 2.4.2 (submit button position value migrated from deprecated `outside-right` to `outside-end`)

## [8.3.5] - 2026-07-02

### Changed

- Increase z-index for Chat Icon to 999998 and Chat Container to 999999 for mobile and desktop

## [8.3.4] - 2026-06-29

### Fixed

- Improved accessibility

## [8.3.3] - 2026-05-11

### Added

- Configurable error message

## [8.3.2] - 2026-03-05

### Added

- e2e playwright tests for HeadwAI ONE and Open WebUI

## [8.3.1] - 2026-02-17

### Changed

- Moved storage of accepted terms of service / disclaimer from local to session
- Made terms of service / disclaimer message to be scrollable

## [8.3.0] - 2026-01-22

### Added

- Speech Bubble Hint. A subtle way to catch the user's attention.

## [8.2.0] - 2026-01-21

### Added

- Capability to render html in disclaimer message and info message.

## [8.0.2] - 2026-01-05

### Changed

- To trusted publisher configuration to publish npm package

## [8.0.1] - 2026-01-05

### Added

- Compatability with Open WebUI
- Open source relevant files

## [7.5.0] - 2025-11-26

### Changed

- Use font-size instead of rem as basis for Disclaimer Info
- Increased size of HeadwAI Chat Bubble Icon in header
- Refactored styling within components to remove inline styles

## [7.4.0] - 2025-11-26

### Removed

- Removed updating HeadwAI Chat Bubble Title with Conversation Title.

## [7.3.2] - 2025-11-24

- Extract changelog entries to populate GitHub release bodies.
- Include CHANGELOG.md in the published package files.

## [7.3.1] - 2025-11-21

- Align Submit Button to the Text Input field
- Added GitHub Release automation workflow.
- Added CHANGELOG.md file.

## [7.3.0] - 2025-11-21

- Initial changelog creation.
