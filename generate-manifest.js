/**
 * Buildsy Image Manifest Generator
 * 
 * Run this script whenever you add or remove images from public/images/[category] folders.
 * It scans all category directories and generates a manifest.json file.
 * 
 * Usage: node generate-manifest.js
 */

const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'public', 'images');
const MANIFEST_PATH = path.join(IMAGES_DIR, 'manifest.json');
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif|avif|svg)$/i;

function generateManifest() {
  const categories = fs.readdirSync(IMAGES_DIR)
    .filter(item => {
      const fullPath = path.join(IMAGES_DIR, item);
      return fs.statSync(fullPath).isDirectory();
    });

  const manifest = {};

  categories.forEach(category => {
    const categoryPath = path.join(IMAGES_DIR, category);
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
