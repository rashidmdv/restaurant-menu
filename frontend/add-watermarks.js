#!/usr/bin/env node

/**
 * Add watermarks to placeholder images
 * Makes it easy to identify which images need to be replaced
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

console.log('🎨 Adding Watermarks to Placeholder Images');
console.log('==========================================\n');

// List of placeholder images that need watermarks
const placeholderImages = [
  {
    path: 'public/loma/beyond-flavor.jpg',
    label: 'Homepage - Beyond Flavor Section'
  },
  {
    path: 'public/loma/chef-profile.jpg',
    label: 'Homepage - Chef Matteo Section'
  },
  {
    path: 'public/loma/vision/vision-menu.jpg',
    label: 'Vision Page - Mocktail Photo'
  },
  {
    path: 'public/loma/team/team-hero.jpg',
    label: 'Team Page - Hero Section'
  },
  {
    path: 'public/loma/team/team-chef-video-poster.jpg',
    label: 'Team Page - Video Poster'
  }
];

const addWatermark = async (imagePath, label) => {
  const fileName = path.basename(imagePath);

  try {
    process.stdout.write(`  Processing ${fileName}... `);

    // Get image dimensions
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const { width, height } = metadata;

    // Create SVG watermark with diagonal text
    const svgWatermark = `
      <svg width="${width}" height="${height}">
        <defs>
          <filter id="shadow">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.8"/>
          </filter>
        </defs>
        <g transform="translate(${width / 2}, ${height / 2}) rotate(-45)">
          <text
            x="0"
            y="0"
            text-anchor="middle"
            font-family="Arial, sans-serif"
            font-size="${Math.min(width, height) * 0.08}"
            font-weight="bold"
            fill="white"
            fill-opacity="0.8"
            stroke="rgba(0,0,0,0.5)"
            stroke-width="3"
            filter="url(#shadow)"
          >
            PLACEHOLDER
          </text>
          <text
            x="0"
            y="${Math.min(width, height) * 0.1}"
            text-anchor="middle"
            font-family="Arial, sans-serif"
            font-size="${Math.min(width, height) * 0.04}"
            font-weight="normal"
            fill="white"
            fill-opacity="0.7"
            stroke="rgba(0,0,0,0.4)"
            stroke-width="2"
          >
            Replace with actual image
          </text>
        </g>
      </svg>
    `;

    // Composite watermark onto image
    await image
      .composite([{
        input: Buffer.from(svgWatermark),
        top: 0,
        left: 0
      }])
      .toFile(imagePath + '.watermarked.jpg');

    // Replace original with watermarked version
    fs.renameSync(imagePath + '.watermarked.jpg', imagePath);

    console.log('✓ Watermark added');
  } catch (error) {
    console.log(`✗ Failed: ${error.message}`);
  }
};

const main = async () => {
  console.log('Adding watermarks to 5 placeholder images:\n');

  for (const { path: imgPath, label } of placeholderImages) {
    console.log(`\n${label}`);
    if (fs.existsSync(imgPath)) {
      await addWatermark(imgPath, label);
    } else {
      console.log(`  ⚠ File not found: ${imgPath}`);
    }
  }

  console.log('\n==========================================');
  console.log('✅ Watermarking Complete!\n');
  console.log('Watermarked images:');
  placeholderImages.forEach(({ path: imgPath }) => {
    console.log(`  • ${imgPath}`);
  });
  console.log('\nThese images now have visible "PLACEHOLDER" watermarks.');
  console.log('Replace them when you receive the actual images from the client.\n');
};

main().catch(console.error);
