# Loma Images - Direct Download Instructions

## Quick Download Method

For each image, use this format to download:
```
https://drive.google.com/uc?export=download&id=FILE_ID
```

## Images to Download (With Direct Links)

### 1. Hero Carousel Images (public/loma/hero/)

**hero-1.jpg**
- File ID: `1bbdikDfoS6t6Jvw9dwECaRFBMy_auFvC`
- Direct: https://drive.google.com/uc?export=download&id=1bbdikDfoS6t6Jvw9dwECaRFBMy_auFvC

**hero-2.jpg**
- File ID: `1VVvpGysgmutty5xYIfZtJ60iHHOIq2Pw`
- Direct: https://drive.google.com/uc?export=download&id=1VVvpGysgmutty5xYIfZtJ60iHHOIq2Pw

**hero-3.jpg**
- File ID: `15vufdNliul2DESV6Coc4szW3uWZZcl1z`
- Direct: https://drive.google.com/uc?export=download&id=15vufdNliul2DESV6Coc4szW3uWZZcl1z

**hero-4.jpg**
- File ID: `1U2YdLFCz77_5WhDBDLSDRy3a_r_qOVih`
- Direct: https://drive.google.com/uc?export=download&id=1U2YdLFCz77_5WhDBDLSDRy3a_r_qOVih

**hero-5.jpg**
- File ID: `16b3rHH_jEcGf3YDHNFognDSlNbxeAY8d`
- Direct: https://drive.google.com/uc?export=download&id=16b3rHH_jEcGf3YDHNFognDSlNbxeAY8d

---

### 2. About Page Images (public/loma/about/)

**about-hero.jpg** (same as hero-1)
- File ID: `1bbdikDfoS6t6Jvw9dwECaRFBMy_auFvC`
- Direct: https://drive.google.com/uc?export=download&id=1bbdikDfoS6t6Jvw9dwECaRFBMy_auFvC

**about-what-is-loma.jpg**
- File ID: `18F4WhswmS2zlyP_QdSui_HqWBeqZgj7l`
- Direct: https://drive.google.com/uc?export=download&id=18F4WhswmS2zlyP_QdSui_HqWBeqZgj7l

**about-philosophy.jpg** (same as hero-1)
- File ID: `1bbdikDfoS6t6Jvw9dwECaRFBMy_auFvC`
- Direct: https://drive.google.com/uc?export=download&id=1bbdikDfoS6t6Jvw9dwECaRFBMy_auFvC

**about-values.jpg**
- File ID: `1EdefA4kcNLW2kvAv315U_6MLJaYtWTxI`
- Direct: https://drive.google.com/uc?export=download&id=1EdefA4kcNLW2kvAv315U_6MLJaYtWTxI

---

### 3. Vision Page Images (public/loma/vision/)

**vision-hero.jpg**
- File ID: `1yLfI6DYijxwxPSAZsyTX1Kwo4QZMtvlh`
- Direct: https://drive.google.com/uc?export=download&id=1yLfI6DYijxwxPSAZsyTX1Kwo4QZMtvlh

**vision-contemporary.jpg**
- File ID: `1rAueyxto-zSPS6QcL0SeWv3k0WacUX8`
- Direct: https://drive.google.com/uc?export=download&id=1rAueyxto-zSPS6QcL0SeWv3k0WacUX8

**vision-heritage.jpg**
- File ID: `1t2EPHHuiG675aNGjxD73jGxtRJawzJof`
- Direct: https://drive.google.com/uc?export=download&id=1t2EPHHuiG675aNGjxD73jGxtRJawzJof

**vision-menu.jpg** ⚠️ TO BE PROVIDED (Mocktail photo)

---

### 4. Team Page Images (public/loma/team/)

**team-hero.jpg** ⚠️ TO BE PROVIDED (Chef photo)

**team-chef-video-poster.jpg** ⚠️ Folder link (need to check contents)
- Folder: https://drive.google.com/drive/folders/1dP7vDRA9-s0IDy8NZXLIiofAZWAvv2Wf

**team-brigade.jpg**
- File ID: `1edj25Nbt13-EREGzhLrpdLCzFfi9oJkd`
- Direct: https://drive.google.com/uc?export=download&id=1edj25Nbt13-EREGzhLrpdLCzFfi9oJkd

---

### 5. Menu Page Images (public/loma/menu/)

**menu-hero.jpg**
- File ID: `1i252Z7BjlRdbs8pgrtyeHzVWS7TxXAqd`
- Direct: https://drive.google.com/uc?export=download&id=1i252Z7BjlRdbs8pgrtyeHzVWS7TxXAqd

---

### 6. Homepage Content Images (public/loma/)

**heritage-evolution.jpg**
- File ID: `1plNwpsvMB-aqchGqzD2HVM7XW_hmyEM-`
- Direct: https://drive.google.com/uc?export=download&id=1plNwpsvMB-aqchGqzD2HVM7XW_hmyEM-

**chef-profile.jpg** ⚠️ TO BE PROVIDED (Chef Matteo photo)

**beyond-flavor.jpg** ⚠️ TO BE PROVIDED

---

## Download Methods

### Method 1: Manual Browser Download
1. Click each "Direct" link above
2. Browser will download automatically
3. Rename if needed
4. Move to correct folder

### Method 2: Command Line (wget)
```bash
# Example for hero-1.jpg
wget -O frontend/public/loma/hero/hero-1.jpg "https://drive.google.com/uc?export=download&id=1bbdikDfoS6t6Jvw9dwECaRFBMy_auFvC"
```

### Method 3: Command Line (curl)
```bash
# Example for hero-1.jpg
curl -L -o frontend/public/loma/hero/hero-1.jpg "https://drive.google.com/uc?export=download&id=1bbdikDfoS6t6Jvw9dwECaRFBMy_auFvC"
```

---

## Status Tracker

- [ ] 5/5 Hero images
- [ ] 4/4 About images
- [ ] 3/4 Vision images (missing mocktail)
- [ ] 1/3 Team images (missing chef hero & video poster)
- [ ] 1/1 Menu image
- [ ] 1/3 Homepage content images (missing chef profile & beyond-flavor)

**Total: 15/20 images available**
