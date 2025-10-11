# Scripts

This directory contains utility scripts for the Smart TV Analytics library.

## update-readme-badges.js

Updates the README.md file with current project badges including:
- Version badge (from package.json)
- NPM package badge
- License badge  
- Coverage badges (from test coverage reports)
  - Overall coverage
  - Statements coverage
  - Branches coverage
  - Functions coverage

### Usage

```bash
# Run tests with coverage first
npm run test:coverage

# Then update badges
npm run update-badges
```

The script will:
1. Read the version from package.json
2. Parse coverage data from coverage/smart-tv-analytics/lcov.info
3. Generate badge URLs with appropriate colors based on coverage percentages
4. Update README.md with the badges

### Badge Colors

Coverage badges use the following color scheme:
- 90%+ = bright green
- 80-89% = green
- 70-79% = yellow-green
- 60-69% = yellow
- 50-59% = orange
- <50% = red

### Requirements

- Node.js
- Coverage report must exist at `coverage/smart-tv-analytics/lcov.info`
- This is automatically generated when running `npm run test:coverage`
