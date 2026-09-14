## Unreleased

### New Features
- Search and replace can include block attributes (for example image alt or CSS classes) and All (visible text plus attributes).

### Automated Tests
- Cypress covers unlocked Attributes and All scopes for search and replace,
  including remembering the chosen scope after a page reload.
- Cypress covers regex replace of an image alt attribute, and that Attributes
  stays selected after reload.

### Development Notes
- Canvas bootstrap only fills empty breakpoint types; extension overlays stay on inner-block and support merge filters.
- Package README documents public editor overlay APIs (`registerEditorExtensions`, canvas, states).

## 1.0.1 (2025-07-20)

### Bug Fixes
- Fixed an issue where styles weren't being applied in the correct order across different screen sizes, ensuring your responsive designs now work as expected.
