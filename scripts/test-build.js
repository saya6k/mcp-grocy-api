#!/usr/bin/env node

/**
 * Test Build Script
 * 
 * This script performs a clean build of the project and verifies that all needed files
 * are generated correctly. It helps validate that the project is ready for release.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

console.log('🔍 Starting test build process...');

// Create a clean environment 
try {
  console.log('🧹 Cleaning build directory...');
  const buildDir = path.join(path.dirname(__dirname), 'build');
  if (fs.existsSync(buildDir)) {
    execSync('rm -rf build', { cwd: path.dirname(__dirname), stdio: 'inherit' });
  }
} catch (error) {
  console.error('❌ Failed to clean build directory:', error);
  process.exit(1);
}

// Run build
try {
  console.log('🏗️ Building project...');
  execSync('npm run build', { cwd: path.dirname(__dirname), stdio: 'inherit' });
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

// Verify build outputs
console.log('✅ Verifying build artifacts...');
const requiredFiles = [
  'build/index.js',
  'build/version.js',
  'build/resources'
];

const rootDir = path.dirname(__dirname);
const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(rootDir, file)));

if (missingFiles.length > 0) {
  console.error('❌ Missing required build artifacts:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
}

// Check if version in package.json matches version in src/version.ts
console.log('🔍 Verifying version consistency...');
const versionFileContent = fs.readFileSync(path.join(rootDir, 'build/version.js'), 'utf8');
const versionMatch = versionFileContent.match(/export const VERSION = ['"](.+)['"]/);

if (!versionMatch) {
  console.error('❌ Could not find VERSION in build/version.js');
  process.exit(1);
}

const buildVersion = versionMatch[1];
if (buildVersion !== packageJson.version) {
  console.error(`❌ Version mismatch: package.json has ${packageJson.version} but build/version.js has ${buildVersion}`);
  process.exit(1);
}

console.log(`✨ Test build successful! Version ${packageJson.version} verified.`);
console.log('🚀 The project is ready for release.');