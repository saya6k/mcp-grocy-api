#!/usr/bin/env node

/**
 * Script to fetch Grocy API documentation from Swagger, convert to markdown, and save
 * to src/resources/api-reference.md
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import swaggerToMd from 'swagger-to-md';

// Set up paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const targetDir = path.join(rootDir, 'src', 'resources');
const targetFile = path.join(targetDir, 'api-reference.md');

// Grocy API URL
const GROCY_SWAGGER_URL = 'https://demo.grocy.info/api/openapi/specification';

/**
 * Main function to fetch and process the API documentation
 */
async function main() {
  console.log('Starting to fetch Grocy API documentation...');
  console.log(`Root directory: ${rootDir}`);
  console.log(`Target directory: ${targetDir}`);
  console.log(`Target file: ${targetFile}`);
  
  try {
    // Ensure target directory exists
    await fs.ensureDir(targetDir);
    console.log('Target directory confirmed to exist');
    
    // Fetch Swagger documentation
    console.log(`Fetching Swagger documentation from ${GROCY_SWAGGER_URL}...`);
    let response;
    try {
      response = await axios.get(GROCY_SWAGGER_URL);
    } catch (error) {
      if (error.response) {
        console.error(`Failed to fetch API: Server responded with status code ${error.response.status}`);
        console.error(`Response data: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
      } else if (error.request) {
        console.error('Failed to fetch API: No response received from server');
      } else {
        console.error(`Failed to fetch API: ${error.message}`);
      }
      throw new Error(`Failed to fetch Grocy API from ${GROCY_SWAGGER_URL}`);
    }
    
    const swaggerData = response.data;
    console.log('Successfully fetched Swagger documentation');
    
    // Debug info
    console.log(`Swagger spec version: ${swaggerData.openapi || swaggerData.swagger}`);
    console.log(`API title: ${swaggerData.info?.title}`);
    console.log(`API version: ${swaggerData.info?.version}`);
    console.log(`Endpoints count: ${Object.keys(swaggerData.paths || {}).length}`);
    
    // Convert Swagger to markdown
    console.log('Converting Swagger documentation to markdown...');
    // swagger-to-md expects a JSON string, not an object
    const swaggerStr = JSON.stringify(swaggerData);
    let markdownContent = swaggerToMd(swaggerStr);
    console.log(`Generated raw content (${markdownContent.length} bytes)`);
    
    // Convert the HTML table to a proper Markdown table
    if (markdownContent.includes('<table>')) {
      console.log('Detected HTML table, converting to Markdown format...');
      
      // Extract the paths from the swagger data and create a proper Markdown table
      const paths = swaggerData.paths || {};
      const markdownRows = [];
      
      // Add table header
      markdownRows.push('| Path | Method | Summary |');
      markdownRows.push('|------|--------|---------|');
      
      // Process each path and its operations
      for (const path of Object.keys(paths).sort()) {
        const pathObj = paths[path];
        for (const method of Object.keys(pathObj)) {
          const operation = pathObj[method];
          markdownRows.push(`| ${path} | ${method.toUpperCase()} | ${operation.summary || ''} |`);
        }
      }
      
      // Replace the HTML table with the Markdown table
      markdownContent = markdownRows.join('\n');
    }
    
    console.log(`Generated markdown content (${markdownContent.length} bytes)`);
    
    // Add timestamp and header to the markdown
    const timestamp = new Date().toISOString();
    const finalContent = `# Grocy API Reference

> Auto-generated from ${GROCY_SWAGGER_URL} on ${timestamp}

${markdownContent}`;
    
    // Write to file
    console.log(`Writing markdown content to ${targetFile}...`);
    await fs.writeFile(targetFile, finalContent, 'utf8');
    console.log('Successfully wrote API reference to file');
    
    console.log('✅ Grocy API documentation successfully updated');
  } catch (error) {
    console.error('❌ Error while updating Grocy API documentation:');
    console.error(error.message);
    console.error('Stack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});