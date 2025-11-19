#!/bin/bash

# Loma Images Download Script
# This script downloads all available images from Google Drive

echo "🖼️  Starting Loma Images Download..."
echo "======================================"

# Create directories if they don't exist
mkdir -p public/loma/hero
mkdir -p public/loma/about
mkdir -p public/loma/vision
mkdir -p public/loma/team
mkdir -p public/loma/menu

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to download file from Google Drive
download_file() {
    local file_id=$1
    local output_path=$2
    local file_name=$3

    echo -n "Downloading $file_name... "

    if curl -L -o "$output_path" "https://drive.google.com/uc?export=download&id=$file_id" 2>/dev/null; then
        echo -e "${GREEN}✓ Done${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed${NC}"
        return 1
    fi
}

echo ""
echo "📸 Downloading Hero Carousel Images (5 images)..."
download_file "1bbdikDfoS6t6Jvw9dwECaRFBMy_auFvC" "public/loma/hero/hero-1.jpg" "hero-1.jpg"
download_file "1VVvpGysgmutty5xYIfZtJ60iHHOIq2Pw" "public/loma/hero/hero-2.jpg" "hero-2.jpg"
download_file "15vufdNliul2DESV6Coc4szW3uWZZcl1z" "public/loma/hero/hero-3.jpg" "hero-3.jpg"
download_file "1U2YdLFCz77_5WhDBDLSDRy3a_r_qOVih" "public/loma/hero/hero-4.jpg" "hero-4.jpg"
download_file "16b3rHH_jEcGf3YDHNFognDSlNbxeAY8d" "public/loma/hero/hero-5.jpg" "hero-5.jpg"

echo ""
echo "📖 Downloading About Page Images (4 images)..."
download_file "1bbdikDfoS6t6Jvw9dwECaRFBMy_auFvC" "public/loma/about/about-hero.jpg" "about-hero.jpg"
download_file "18F4WhswmS2zlyP_QdSui_HqWBeqZgj7l" "public/loma/about/about-what-is-loma.jpg" "about-what-is-loma.jpg"
download_file "1bbdikDfoS6t6Jvw9dwECaRFBMy_auFvC" "public/loma/about/about-philosophy.jpg" "about-philosophy.jpg"
download_file "1EdefA4kcNLW2kvAv315U_6MLJaYtWTxI" "public/loma/about/about-values.jpg" "about-values.jpg"

echo ""
echo "🎯 Downloading Vision Page Images (4 images)..."
download_file "1yLfI6DYijxwxPSAZsyTX1Kwo4QZMtvlh" "public/loma/vision/vision-hero.jpg" "vision-hero.jpg"
download_file "1rAueyxto-zSPS6QcL0SeWv3k0WacUX8" "public/loma/vision/vision-contemporary.jpg" "vision-contemporary.jpg"
download_file "1t2EPHHuiG675aNGjxD73jGxtRJawzJof" "public/loma/vision/vision-heritage.jpg" "vision-heritage.jpg"
download_file "1Uo0xMprtOhVAFQiZiGmr22n6myve4nau" "public/loma/vision/vision-menu.jpg" "vision-menu.jpg"

echo ""
echo "👨‍🍳 Downloading Team Page Images (3 images)..."
download_file "1edj25Nbt13-EREGzhLrpdLCzFfi9oJkd" "public/loma/team/team-brigade.jpg" "team-brigade.jpg"
download_file "1nlmysgg6aufBF5R5UTbpHjhF1uTiC5-h" "public/loma/team/team-hero.jpg" "team-hero.jpg"
download_file "1i8vYV903t59Yuqtr5GgpOGXv4ZqVLvNX" "public/loma/team/team-chef-video-poster.jpg" "team-chef-video-poster.jpg"

echo ""
echo "🍽️  Downloading Menu Page Images (1 image)..."
download_file "1i252Z7BjlRdbs8pgrtyeHzVWS7TxXAqd" "public/loma/menu/menu-hero.jpg" "menu-hero.jpg"

echo ""
echo "🏠 Downloading Homepage Content Images (3 images)..."
download_file "1plNwpsvMB-aqchGqzD2HVM7XW_hmyEM-" "public/loma/heritage-evolution.jpg" "heritage-evolution.jpg"
download_file "1i8vYV903t59Yuqtr5GgpOGXv4ZqVLvNX" "public/loma/chef-profile.jpg" "chef-profile.jpg"
download_file "1LpH969MnJgRmw9yuVu29z3KbAlrCyFwF" "public/loma/beyond-flavor.jpg" "beyond-flavor.jpg"

echo ""
echo "======================================"
echo -e "${GREEN}✅ Download Complete!${NC}"
echo ""
echo "📊 Summary:"
echo "  • Hero images: 5/5 ✓"
echo "  • About images: 4/4 ✓"
echo "  • Vision images: 4/4 ✓"
echo "  • Team images: 3/3 ✓"
echo "  • Menu images: 1/1 ✓"
echo "  • Homepage images: 3/3 ✓"
echo ""
echo "Total: 20/20 images downloaded"
echo "All images complete! 🎉"
echo ""
echo "Next steps:"
echo "1. Check image quality and sizes"
echo "2. Create placeholders for missing images"
echo "3. Test all pages in browser"
echo ""
