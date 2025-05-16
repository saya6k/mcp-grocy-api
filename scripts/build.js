#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read package.json manually instead of using import assertion
const pkgPath = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Ensure the build directory exists
const buildDir = path.resolve(__dirname, '../build');
fs.ensureDirSync(buildDir);

// Generate version.ts with package values
const versionContent = `
// Auto-generated file - DO NOT MODIFY
export const VERSION = '${pkg.version}';
export const PACKAGE_NAME = '${pkg.name.toLowerCase()}'; // Ensure lowercase
`;

fs.writeFileSync(
  path.resolve(__dirname, '../src/version.ts'), 
  versionContent, 
  'utf8'
);

console.log('Generated version.ts with package values');

// Copy resources directory to build
const resourcesDir = path.resolve(__dirname, '../resources');
const buildResourcesDir = path.resolve(buildDir, 'resources');

if (fs.existsSync(resourcesDir)) {
  fs.ensureDirSync(buildResourcesDir);
  fs.copySync(resourcesDir, buildResourcesDir);
  console.log('Copied resources to build directory');
}

// Remove the main().catch(console.error); line as main() is not defined
