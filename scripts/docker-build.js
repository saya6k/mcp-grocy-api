#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));

console.log('🐳 Preparing build for Docker environment...');

// Create resources directory
const resourcesDir = path.join(rootDir, 'resources');
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
  console.log('📁 Created resources directory');
}

// Copy markdown files to resources directory
try {
  const files = fs.readdirSync(rootDir);
  
  // Define which files to include or exclude
  const filesToExclude = ['CHANGELOG.md', 'README.md', 'DOCS.md']; // Files to exclude
  // OR: const filesToInclude = ['REQUIRED_FILE.md']; // Only include these specific files
  
  const markdownFiles = files
    .filter(file => file.endsWith('.md'))
    .filter(file => !filesToExclude.includes(file)); // Exclude specified files
    // OR: .filter(file => filesToInclude.includes(file)); // Only include specified files
  
  markdownFiles.forEach(file => {
    fs.copyFileSync(path.join(rootDir, file), path.join(resourcesDir, file));
  });
  console.log(`📝 Copied ${markdownFiles.length} markdown resources`);
} catch (error) {
  console.error('Error copying markdown files:', error);
}

// Generate version.ts file
const versionTsContent = `// Generated version file for Docker build
export const VERSION = '${packageJson.version}';
export const PACKAGE_NAME = '${packageJson.name.toLowerCase()}'; // Ensure lowercase
`;

fs.writeFileSync(path.join(rootDir, 'src', 'version.ts'), versionTsContent);
console.log('📝 Generated version.ts with package values');

console.log('✅ Docker build preparation complete');