import sharp from 'sharp';
import { encode } from 'sharp-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIco() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  console.log('🎨 Generating favicon.ico from PNG files...');
  
  try {
    // Read the PNG files for ICO generation (16x16, 32x32, 48x48)
    const sizes = [16, 32, 48];
    const images = [];
    
    for (const size of sizes) {
      const pngPath = path.join(publicDir, `favicon-${size}x${size}.png`);
      if (fs.existsSync(pngPath)) {
        // Use sharp to read and process the image
        const imageBuffer = await sharp(pngPath)
          .resize(size, size)
          .png()
          .toBuffer();
        images.push(imageBuffer);
        console.log(`✅ Added ${size}x${size} to ICO`);
      }
    }
    
    if (images.length === 0) {
      throw new Error('No PNG files found for ICO generation');
    }
    
    // Generate ICO file using sharp-ico
    const icoBuffer = await encode(images);
    
    // Write ICO file
    const icoPath = path.join(publicDir, 'favicon.ico');
    fs.writeFileSync(icoPath, icoBuffer);
    
    console.log('✅ Generated favicon.ico');
    console.log(`🎉 ICO file created with ${images.length} sizes!`);
    
  } catch (error) {
    console.error('❌ Error generating ICO:', error);
    process.exit(1);
  }
}

// Run the script
generateIco(); 