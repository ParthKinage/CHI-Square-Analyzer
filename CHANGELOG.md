# Changelog

All notable changes to the **Chi-Square Goodness-of-Fit Test Analyzer** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.1.0] - 2026-04-01

### Added
- Configurable significance level (`alpha`) — users can now choose between α = 0.01, 0.05, and 0.10
- `/export` API endpoint to download results as a CSV file for offline analysis
- `CHANGELOG.md` to track project history and version changes

### Changed
- Backend now returns selected alpha level in API response for frontend rendering
- Critical value is now dynamically computed based on user-selected alpha

### Fixed
- Edge case: zero expected frequency now returns a descriptive error instead of a division-by-zero crash

---

## [1.0.0] - 2026-03-27

### Added
- Initial release of the Chi-Square Goodness-of-Fit Test Analyzer
- Flask backend with SciPy-powered chi-square computation (`scipy.stats.chisquare`)
- NumPy array handling for observed and expected frequency normalization
- Step-by-step computation breakdown: (O−E), (O−E)², and (O−E)²/E per category
- Hypothesis decision logic: Accept / Reject H₀ at α = 0.05
- 5 pre-loaded sample datasets: Fair Dice, Coin Flip, Blood Types, Survey, Traffic
- Brutalist dark UI with sharp edges and lime (#BAFF2A) accent color
- Canvas-rendered bar chart for observed vs. expected value comparison
- Keyboard shortcut: `Ctrl+Enter` to run the test
- Responsive layout — desktop, tablet, mobile
- One-click startup scripts: `start.bat` (Windows), `start.sh` (Mac/Linux)
- Auto-setup script: `download_project.py`
- Render.com deployment configuration: `deployment.yaml`
- MIT License

---

## [Unreleased]

### Planned
- Export results as PDF report
- Add Chi-Square Independence Test (contingency tables)
- Save/load test sessions via localStorage
- Animated step-by-step walkthrough mode
- Multi-language support (Marathi, Hindi, English)
