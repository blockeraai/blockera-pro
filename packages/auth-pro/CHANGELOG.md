## Unreleased

### Development Notes
- Package README documents public connect UI and PHP auth/OAuth APIs.

## 1.1.2 (2025-06-28)

### Improvements
- Improved the update notice by adding a clearer version number comparison and ensuring proper cleanup of old notices.

## 1.1.1 (2025-06-16)

### Bug Fixes
- Fixed an issue where the plugin update notification persisted in the WordPress admin dashboard even after successfully updating the plugin. This ensures that outdated update notices are properly cleared once updates are completed.

## 1.1.0 (2025-06-12)

### Bug Fixes
- Fixed an issue that caused license activation to fail.
- Fixed an issue where version comparison was incorrect during the update check process.

### New Features
- Added OAuth 2-step verification client for activating purchased licenses on the website.
- Implemented UI/UX improvements for the license activation process.
