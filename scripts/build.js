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
const version = process.env.RELEASE_VERSION || pkg.version;
console.log(`Using version: ${version}`);

const versionContent = `
// Auto-generated file - DO NOT MODIFY
export const VERSION = '${version}';
export const PACKAGE_NAME = '${pkg.name.toLowerCase()}'; // Ensure lowercase
export const SERVER_NAME = 'grocy-api';
`;

fs.writeFileSync(
  path.resolve(__dirname, '../src/version.ts'), 
  versionContent, 
  'utf8'
);

console.log('Generated version.ts with package values');

// Copy src/resources directory to build/resources
const srcResourcesDir = path.resolve(__dirname, '../src/resources');
const buildResourcesDir = path.resolve(buildDir, 'resources');

// Ensure src/resources exists and copy it
if (fs.existsSync(srcResourcesDir)) {
  fs.ensureDirSync(buildResourcesDir);
  fs.copySync(srcResourcesDir, buildResourcesDir);
  console.log('Copied src/resources to build/resources directory');
}

// Copy important root MD files (README, CHANGELOG, DOCS) to build/resources as well
const rootDir = path.resolve(__dirname, '..');
['README.md', 'CHANGELOG.md', 'DOCS.md'].forEach(file => {
  const sourcePath = path.join(rootDir, file);
  if (fs.existsSync(sourcePath)) {
    fs.copySync(sourcePath, path.join(buildResourcesDir, file));
    console.log(`Copied ${file} to build/resources`);
  }
});

// Remove the main().catch(console.error); line as main() is not defined
