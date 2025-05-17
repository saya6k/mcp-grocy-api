#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

console.log('🐳 Preparing build for Docker environment...');

// Note: We no longer create a redundant resources directory at the root
// The src/resources directory already contains our documentation files
// and build.js will handle copying these to the build directory

// Generate version.ts file
const versionTsContent = `// Generated version file for Docker build
export const VERSION = '${packageJson.version}';
export const PACKAGE_NAME = '${packageJson.name.toLowerCase()}'; // Ensure lowercase
`;

fs.writeFileSync(path.join(rootDir, 'src', 'version.ts'), versionTsContent);
console.log('📝 Generated version.ts with package values');

console.log('✅ Docker build preparation complete');