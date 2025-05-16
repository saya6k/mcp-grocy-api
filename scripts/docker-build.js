#!/usr/bin/env node

/**
 * Docker Build Script
 * 
 * A simplified version of build.js for use in Docker build environments.
 * This skips unnecessary checks and prepares for TypeScript compilation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.dirname(__dirname);

console.log('🐳 Preparing build for Docker environment...');

// Create resources directory if it doesn't exist
const resourcesDir = path.join(rootDir, 'build', 'resources');
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
  console.log('📁 Created resources directory');
}

// Copy markdown resources
const srcResourcesDir = path.join(rootDir, 'src', 'resources');
if (fs.existsSync(srcResourcesDir)) {
  try {
    const files = fs.readdirSync(srcResourcesDir);
    files.forEach(file => {
      if (file.endsWith('.md')) {
        fs.copyFileSync(
          path.join(srcResourcesDir, file),
          path.join(resourcesDir, file)
        );
      }
    });
    console.log('📝 Copied markdown resources');
  } catch (err) {
    console.error('⚠️ Error copying resources:', err);
  }
}

console.log('✅ Docker build preparation complete');