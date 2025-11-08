#!/bin/bash

# Loma Images Optimization Script
# Reduces image sizes from ~454MB to ~5-8MB for web performance

echo "🎨 Loma Images Optimization"
echo "============================="
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found!"
    echo ""
    echo "Please install ImageMagick first:"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  macOS: brew install imagemagick"
    echo ""
    exit 1
fi

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAX_WIDTH=1920
QUALITY=85
BACKUP_DIR="public/loma/originals"

echo "Configuration:"
echo "  Max width: ${MAX_WIDTH}px"
echo "  Quality: ${QUALITY}%"
echo "  Backup location: $BACKUP_DIR"
echo ""

# Ask for confirmation
read -p "This will optimize all images. Continue? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Creating backup of original images..."
mkdir -p "$BACKUP_DIR"
cp -r public/loma/{hero,about,vision,team,menu} "$BACKUP_DIR/" 2>/dev/null
cp public/loma/*.jpg "$BACKUP_DIR/" 2>/dev/null
echo -e "${GREEN}✓ Backup created${NC}"
echo ""

# Function to optimize image
optimize_image() {
    local file=$1
    local original_size=$(du -h "$file" | cut -f1)

    echo -n "  Optimizing $(basename $file) ($original_size)... "

    # Create temporary file
    temp_file="${file}.tmp"

    # Optimize: resize to max width and compress
    convert "$file" \
        -resize ${MAX_WIDTH}x\> \
        -quality $QUALITY \
        -strip \
        "$temp_file"

    if [ $? -eq 0 ]; then
        mv "$temp_file" "$file"
        local new_size=$(du -h "$file" | cut -f1)
        echo -e "${GREEN}✓ $new_size${NC}"
    else
        rm -f "$temp_file"
        echo -e "${YELLOW}⚠ Failed${NC}"
    fi
}

# Optimize all directories
cd public/loma

echo "🖼️  Optimizing Hero Carousel (5 images)..."
for img in hero/*.jpg; do
    [ -f "$img" ] && optimize_image "$img"
done

echo ""
echo "📖 Optimizing About Page (4 images)..."
for img in about/*.jpg; do
    [ -f "$img" ] && optimize_image "$img"
done

echo ""
echo "🎯 Optimizing Vision Page (4 images)..."
for img in vision/*.jpg; do
    [ -f "$img" ] && optimize_image "$img"
done

echo ""
echo "👨‍🍳 Optimizing Team Page (3 images)..."
for img in team/*.jpg; do
    [ -f "$img" ] && optimize_image "$img"
done

echo ""
echo "🍽️  Optimizing Menu Page (1 image)..."
for img in menu/*.jpg; do
    [ -f "$img" ] && optimize_image "$img"
done

echo ""
echo "🏠 Optimizing Homepage Content (3 images)..."
for img in *.jpg; do
    [ -f "$img" ] && optimize_image "$img"
done

echo ""
echo "============================="
echo -e "${GREEN}✅ Optimization Complete!${NC}"
echo ""

# Calculate new total size
NEW_SIZE=$(du -sh . | cut -f1)
echo "📊 Results:"
echo "  Original size: 454MB"
echo "  New size: $NEW_SIZE"
echo "  Backup location: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "1. Test all pages in browser"
echo "2. Check image quality"
echo "3. If quality is poor, restore from backup and adjust QUALITY variable"
echo "4. If satisfied, delete backup folder to save space"
echo ""
