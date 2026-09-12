## Unreleased

### New Features
- Search and replace can include block attributes (for example image alt or CSS classes) and All (visible text plus attributes).

### Automated Tests
- Cypress covers unlocked Attributes and All scopes for search and replace.
- Cypress covers regex replace of an image alt attribute.

### Development Notes
- Package README documents public editor overlay APIs (`registerEditorExtensions`, canvas, states).

## 1.0.1 (2025-07-20)

### Bug Fixes
- Fixed an issue where styles weren't being applied in the correct order across different screen sizes, ensuring your responsive designs now work as expected.
