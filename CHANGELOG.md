# Changelog

All notable changes documented here. Format: [Keep a Changelog](https://keepachangelog.com), Versioning: [SemVer](https://semver.org).

## [Unreleased]

### Added
- Documentation reorganization with `docs/` structure
- AI-native git workflow with commit template

### Changed
- Moved 33 MD files: 12 active docs → `docs/`, 21 status docs → `docs/archive/2024-11/`

## [0.1.0] - 2024-11-17

**First tagged release. Copilot working, demo mode stable, RLS policies active.**

### Added
- Copilot conversational interface with real-time streaming
- Demo mode for unauthenticated access (no login required)
- RLS policies for `positioning_*` tables (secure multi-tenant)
- Comprehensive evidence chain testing suite
- Database: `positioning_flows`, `positioning_icps`, `positioning_value_props` tables
- Managers & stores for state management (`lib/managers/`, `lib/stores/`)

### Fixed
- URL normalization accepts URLs without `https://` protocol
- ICP card UX improvements and value prop validation
- RLS policies blocking server-side demo mode access
- ThemeProvider missing closing tag in layout

### Changed
- Upgraded ICP generation from GPT-3.5 to GPT-4o for higher quality
- Updated blueprints with TaxStar facts & refined data

### Technical
- **Database Schema**: 3 new tables with soft deletes, RLS, and analytics tracking
- **Evidence Chain**: 100% preserved across facts, ICPs, value props, emails, LinkedIn content
- **Testing**: Vitest suite with evidence validation, API integration tests

---

## Release Notes

### v0.1.0 - Demo-Ready MVP
- **Target Users**: Early YC applicants, founders validating positioning
- **Key Feature**: Evidence-backed ICP & value prop generation from website analysis
- **Status**: Production-ready for demos, needs copilot bug fix for full launch

---

[Unreleased]: https://github.com/flowtusk/flowtuskMVP/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/flowtusk/flowtuskMVP/releases/tag/v0.1.0
