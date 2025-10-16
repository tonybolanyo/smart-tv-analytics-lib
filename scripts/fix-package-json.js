const fs = require('fs');
const path = require('path');

/**
 * Script to fix the dist/package.json file by removing the esm2015 entry
 * 
 * The esm2015 entry points to non-flat ES modules that don't have Ivy metadata,
 * causing "does not have 'ɵmod' property" errors in Angular applications.
 * 
 * The fesm2015 and es2015 entries point to the flat ES module bundles which 
 * work correctly with Angular and ngcc.
 */

const distPackageJsonPath = path.join(__dirname, '../dist/package.json');

if (!fs.existsSync(distPackageJsonPath)) {
  console.error('Error: dist/package.json not found');
  process.exit(1);
}

// Read the package.json
const packageJson = JSON.parse(fs.readFileSync(distPackageJsonPath, 'utf8'));

// Remove the esm2015 entry
if (packageJson.esm2015) {
  delete packageJson.esm2015;
  console.log('✓ Removed esm2015 entry from dist/package.json');
}

// Remove any ngcc processing markers to ensure clean state
if (packageJson.__processed_by_ivy_ngcc__) {
  delete packageJson.__processed_by_ivy_ngcc__;
  console.log('✓ Removed ngcc processing markers from dist/package.json');
}

// Remove ivy_ngcc entries added by ngcc
const ivyNgccKeys = Object.keys(packageJson).filter(key => key.includes('_ivy_ngcc'));
ivyNgccKeys.forEach(key => {
  delete packageJson[key];
  if (ivyNgccKeys.length > 0) {
    console.log(`✓ Removed ${ivyNgccKeys.length} ivy_ngcc entries from dist/package.json`);
  }
});

// Write the updated package.json
fs.writeFileSync(distPackageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✓ dist/package.json updated successfully');
