/**
 * Buildsy Image Manifest Generator
 * 
 * Run this script whenever you add or remove images from public/[category] folders.
 * It scans all category directories in public/ and generates public/manifest.json file.
 * 
 * Usage: node generate-manifest.js
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');
const MANIFEST_PATH = path.join(PUBLIC_DIR, 'manifest.json');
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif|avif|svg)$/i;

function generateManifest() {
  const categories = fs.readdirSync(PUBLIC_DIR)
    .filter(item => {
      const fullPath = path.join(PUBLIC_DIR, item);
      return fs.statSync(fullPath).isDirectory();
    });

  const manifest = {};

  categories.forEach(category => {
    const categoryPath = path.join(PUBLIC_DIR, category);
    const images = fs.readdirSync(categoryPath)
      .filter(file => IMAGE_EXTENSIONS.test(file))
      .sort();
    manifest[category] = images;
  });

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log('✅ Manifest generated successfully!');
  console.log(`📁 Categories: ${Object.keys(manifest).length}`);
  Object.entries(manifest).forEach(([cat, imgs]) => {
    console.log(`   ${cat}: ${imgs.length} images`);
  });
}

generateManifest();
