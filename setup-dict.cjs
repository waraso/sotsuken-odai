#!/usr/bin/env node
/**
 * Setup kuroshiro dictionaries for client-side usage
 * This script copies and decompresses the kuromoji dictionary files
 * from node_modules to the public directory
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const zlib = require('zlib');

const DICT_SOURCE = path.join(__dirname, 'node_modules', 'kuromoji', 'dict');
const DICT_DEST = path.join(__dirname, 'public', 'dict');

console.log('Setting up kuroshiro dictionaries...');

// Create dict directory if it doesn't exist
if (!fs.existsSync(DICT_DEST)) {
  fs.mkdirSync(DICT_DEST, { recursive: true });
}

// Copy and decompress dictionary files
const files = fs.readdirSync(DICT_SOURCE);
files.forEach(file => {
  const srcPath = path.join(DICT_SOURCE, file);
  const destPath = path.join(DICT_DEST, file);
  
  // Copy file
  fs.copyFileSync(srcPath, destPath);
  
  // Decompress if it's a .gz file
  if (file.endsWith('.dat.gz')) {
    console.log(`Decompressing ${file}...`);
    try {
      const gzippedData = fs.readFileSync(destPath);
      const decompressedData = zlib.gunzipSync(gzippedData);
      const decompressedPath = destPath.replace('.gz', '');
      fs.writeFileSync(decompressedPath, decompressedData);
      fs.unlinkSync(destPath); // Remove the gzipped file
    } catch (error) {
      console.error(`Failed to decompress ${file}:`, error.message);
    }
  }
});

console.log('Dictionary setup complete!');
