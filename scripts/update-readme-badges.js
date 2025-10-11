#!/usr/bin/env node

/**
 * Script to update README.md with badges for build status, version, and coverage
 * This script reads the package.json for version and coverage data from lcov.info
 */

const fs = require('fs');
const path = require('path');

// Read package.json for version
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Read lcov.info for coverage data
const lcovPath = path.join(__dirname, '..', 'coverage', 'smart-tv-analytics', 'lcov.info');
let statementsCoverage = 0;
let branchesCoverage = 0;
let functionsCoverage = 0;
let linesCoverage = 0;

if (fs.existsSync(lcovPath)) {
  const lcovData = fs.readFileSync(lcovPath, 'utf8');
  
  // Parse lcov.info to get coverage percentages
  let totalStatements = 0, coveredStatements = 0;
  let totalBranches = 0, coveredBranches = 0;
  let totalFunctions = 0, coveredFunctions = 0;
  let totalLines = 0, coveredLines = 0;
  
  const lines = lcovData.split('\n');
  for (const line of lines) {
    if (line.startsWith('LF:')) totalLines += parseInt(line.split(':')[1]);
    if (line.startsWith('LH:')) coveredLines += parseInt(line.split(':')[1]);
    if (line.startsWith('BRF:')) totalBranches += parseInt(line.split(':')[1]);
    if (line.startsWith('BRH:')) coveredBranches += parseInt(line.split(':')[1]);
    if (line.startsWith('FNF:')) totalFunctions += parseInt(line.split(':')[1]);
    if (line.startsWith('FNH:')) coveredFunctions += parseInt(line.split(':')[1]);
  }
  
  // DA lines for statements
  for (const line of lines) {
    if (line.startsWith('DA:')) {
      totalStatements++;
      const count = parseInt(line.split(',')[1]);
      if (count > 0) coveredStatements++;
    }
  }
  
  statementsCoverage = totalStatements > 0 ? ((coveredStatements / totalStatements) * 100).toFixed(2) : 0;
  branchesCoverage = totalBranches > 0 ? ((coveredBranches / totalBranches) * 100).toFixed(2) : 0;
  functionsCoverage = totalFunctions > 0 ? ((coveredFunctions / totalFunctions) * 100).toFixed(2) : 0;
  linesCoverage = totalLines > 0 ? ((coveredLines / totalLines) * 100).toFixed(2) : 0;
}

// Function to get badge color based on coverage percentage
function getBadgeColor(percentage) {
  if (percentage >= 90) return 'brightgreen';
  if (percentage >= 80) return 'green';
  if (percentage >= 70) return 'yellowgreen';
  if (percentage >= 60) return 'yellow';
  if (percentage >= 50) return 'orange';
  return 'red';
}

// Generate badge URLs
const versionBadge = `![Version](https://img.shields.io/badge/version-${version}-blue.svg)`;
const npmBadge = `![npm](https://img.shields.io/npm/v/smart-tv-analytics.svg)`;
const licenseBadge = `![License](https://img.shields.io/badge/license-MIT-green.svg)`;

const statementsColor = getBadgeColor(statementsCoverage);
const branchesColor = getBadgeColor(branchesCoverage);
const functionsColor = getBadgeColor(functionsCoverage);
const linesColor = getBadgeColor(linesCoverage);

const coverageBadge = `![Coverage](https://img.shields.io/badge/coverage-${linesCoverage}%25-${linesColor}.svg)`;
const statementsBadge = `![Statements](https://img.shields.io/badge/statements-${statementsCoverage}%25-${statementsColor}.svg)`;
const branchesBadge = `![Branches](https://img.shields.io/badge/branches-${branchesCoverage}%25-${branchesColor}.svg)`;
const functionsBadge = `![Functions](https://img.shields.io/badge/functions-${functionsCoverage}%25-${functionsColor}.svg)`;

// Read README.md
const readmePath = path.join(__dirname, '..', 'README.md');
let readme = fs.readFileSync(readmePath, 'utf8');

// Create badges section
const badgesSection = `# Smart TV Analytics Library

${versionBadge} ${npmBadge} ${licenseBadge} ${coverageBadge}

${statementsBadge} ${branchesBadge} ${functionsBadge}

`;

// Replace the title and add badges
const titleRegex = /^# Smart TV Analytics Library\n*/m;
readme = readme.replace(titleRegex, badgesSection);

// Write updated README.md
fs.writeFileSync(readmePath, readme, 'utf8');

console.log('✅ README.md updated with badges');
console.log(`   Version: ${version}`);
console.log(`   Coverage: ${linesCoverage}%`);
console.log(`   - Statements: ${statementsCoverage}%`);
console.log(`   - Branches: ${branchesCoverage}%`);
console.log(`   - Functions: ${functionsCoverage}%`);
console.log(`   - Lines: ${linesCoverage}%`);
