#!/usr/bin/env node

/**
 * Loma Images Optimization Script
 * Optimizes images from ~454MB to ~5-8MB using sharp
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎨 Loma Images Optimization');
console.log('=============================\n');

// Check if sharp is installed
try {
  require.resolve('sharp');
} catch (e) {
  console.log('❌ Sharp package not found!');
  console.log('\nInstalling sharp...\n');
  try {
    execSync('npm install sharp', { stdio: 'inherit' });
    console.log('\n✅ Sharp installed successfully!\n');
  } catch (err) {
    console.error('Failed to install sharp. Please run: npm install sharp');
    process.exit(1);
  }
}

const sharp = require('sharp');

// Configuration
const MAX_WIDTH = 1920;
const QUALITY = 85;
const BACKUP_DIR = 'public/loma/originals';
const BASE_DIR = 'public/loma';

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const getFileSize = (filePath) => {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
};

const optimizeImage = async (filePath) => {
  const fileName = path.basename(filePath);
  const originalSize = getFileSize(filePath);

  process.stdout.write(`  Optimizing ${fileName} (${formatBytes(originalSize)})... `);

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Only resize if image is larger than MAX_WIDTH
    let resizeOptions = {};
    if (metadata.width > MAX_WIDTH) {
      resizeOptions = {
        width: MAX_WIDTH,
        fit: 'inside',
        withoutEnlargement: true
      };
    }

    await image
      .resize(resizeOptions)
      .jpeg({ quality: QUALITY, progressive: true })
      .toFile(filePath + '.tmp');

    // Replace original with optimized
    fs.renameSync(filePath + '.tmp', filePath);

    const newSize = getFileSize(filePath);
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);

    console.log(`✓ ${formatBytes(newSize)} (${reduction}% reduction)`);

    return { originalSize, newSize };
  } catch (error) {
    console.log(`⚠ Failed: ${error.message}`);
    // Clean up temp file if exists
    try { fs.unlinkSync(filePath + '.tmp'); } catch {}
    return { originalSize, newSize: originalSize };
  }
};

const optimizeDirectory = async (dirPath, label) => {
  console.log(`\n${label}...`);

  const files = fs.readdirSync(dirPath)
    .filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg'))
    .map(file => path.join(dirPath, file));

  let totalOriginal = 0;
  let totalNew = 0;

  for (const file of files) {
    const { originalSize, newSize } = await optimizeImage(file);
    totalOriginal += originalSize;
    totalNew += newSize;
  }

  return { totalOriginal, totalNew };
};

const main = async () => {
  console.log('Configuration:');
  console.log(`  Max width: ${MAX_WIDTH}px`);
  console.log(`  Quality: ${QUALITY}%`);
  console.log(`  Backup location: ${BACKUP_DIR}\n`);

  // Create backup
  console.log('Creating backup of original images...');
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const dirsToBackup = ['hero', 'about', 'vision', 'team', 'menu'];
  for (const dir of dirsToBackup) {
    const srcDir = path.join(BASE_DIR, dir);
    const destDir = path.join(BACKUP_DIR, dir);
    if (fs.existsSync(srcDir)) {
      fs.mkdirSync(destDir, { recursive: true });
      const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jpg'));
      files.forEach(file => {
        fs.copyFileSync(
          path.join(srcDir, file),
          path.join(destDir, file)
        );
      });
    }
  }

  // Backup root jpg files
  const rootFiles = fs.readdirSync(BASE_DIR).filter(f => f.endsWith('.jpg'));
  rootFiles.forEach(file => {
    fs.copyFileSync(
      path.join(BASE_DIR, file),
      path.join(BACKUP_DIR, file)
    );
  });

  console.log('✓ Backup created\n');

  // Track total sizes
  let grandTotalOriginal = 0;
  let grandTotalNew = 0;

  // Optimize each directory
  const tasks = [
    { dir: 'hero', label: '🖼️  Optimizing Hero Carousel (5 images)' },
    { dir: 'about', label: '📖 Optimizing About Page (4 images)' },
    { dir: 'vision', label: '🎯 Optimizing Vision Page (4 images)' },
    { dir: 'team', label: '👨‍🍳 Optimizing Team Page (3 images)' },
    { dir: 'menu', label: '🍽️  Optimizing Menu Page (1 image)' },
  ];

  for (const { dir, label } of tasks) {
    const dirPath = path.join(BASE_DIR, dir);
    if (fs.existsSync(dirPath)) {
      const { totalOriginal, totalNew } = await optimizeDirectory(dirPath, label);
      grandTotalOriginal += totalOriginal;
      grandTotalNew += totalNew;
    }
  }

  // Optimize root directory images
  console.log('\n🏠 Optimizing Homepage Content (3 images)...');
  const rootJpgs = fs.readdirSync(BASE_DIR)
    .filter(f => f.endsWith('.jpg'))
    .map(f => path.join(BASE_DIR, f));

  for (const file of rootJpgs) {
    const { originalSize, newSize } = await optimizeImage(file);
    grandTotalOriginal += originalSize;
    grandTotalNew += newSize;
  }

  // Final summary
  console.log('\n=============================');
  console.log('✅ Optimization Complete!\n');
  console.log('📊 Results:');
  console.log(`  Original size: ${formatBytes(grandTotalOriginal)}`);
  console.log(`  New size: ${formatBytes(grandTotalNew)}`);
  const totalReduction = ((grandTotalOriginal - grandTotalNew) / grandTotalOriginal * 100).toFixed(1);
  console.log(`  Total reduction: ${totalReduction}%`);
  console.log(`  Backup location: ${BACKUP_DIR}\n`);
  console.log('Next steps:');
  console.log('1. Test all pages in browser');
  console.log('2. Check image quality');
  console.log('3. If satisfied, delete backup folder to save space\n');
};

main().catch(console.error);
