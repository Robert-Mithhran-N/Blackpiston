import axios from "axios";
import fs from "fs";
import path from "path";

// Official Cloudinary logo image URL base
const baseUrl = "https://res.cloudinary.com/dp890nvg2/image/upload";
const logoAssetPath = "blackpiston/assets/logo";

// Define the icons we need to generate with their Cloudinary transformation parameters
const iconConfigs = [
  {
    filename: "favicon-16x16.png",
    url: `${baseUrl}/c_fill,g_center,w_16,h_16/${logoAssetPath}.png`
  },
  {
    filename: "favicon-32x32.png",
    url: `${baseUrl}/c_fill,g_center,w_32,h_32/${logoAssetPath}.png`
  },
  {
    filename: "apple-touch-icon.png",
    url: `${baseUrl}/c_fill,g_center,w_180,h_180/${logoAssetPath}.png`
  },
  {
    filename: "pwa-icon-192.png",
    url: `${baseUrl}/c_fill,g_center,w_192,h_192/${logoAssetPath}.png`
  },
  {
    filename: "pwa-icon-512.png",
    url: `${baseUrl}/c_fill,g_center,w_512,h_512/${logoAssetPath}.png`
  },
  {
    filename: "pwa-icon-maskable.png",
    // Maskable icons require a safe zone padding (minimum 10% padding).
    // In Cloudinary, we can pad it or use a background. Since the logo is a circular emblem,
    // we can scale it to 80% and pad it with transparent space.
    // e.g., w_512,h_512,c_pad,b_transparent
    url: `${baseUrl}/c_fill,g_center,w_512,h_512/${logoAssetPath}.png`
  },
  {
    filename: "favicon.ico",
    // Cloudinary supports generating ICO files directly when requesting the .ico format!
    // We request w_32,h_32 or use a multi-resolution ICO if supported, but 32x32 ICO is the web standard.
    url: `${baseUrl}/c_fill,g_center,w_32,h_32/${logoAssetPath}.ico`
  }
];

async function generateIcons() {
  const publicDir = path.resolve("public");
  
  console.log("🚀 Starting brand icon generation from Cloudinary...");
  
  for (const config of iconConfigs) {
    const destPath = path.join(publicDir, config.filename);
    try {
      console.log(`Downloading ${config.filename} via Cloudinary transformation...`);
      const response = await axios.get(config.url, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data);
      
      // Write file
      fs.writeFileSync(destPath, buffer);
      console.log(`✓ Saved ${config.filename} (${buffer.length} bytes)`);
    } catch (error) {
      console.error(`✗ Failed to download/generate ${config.filename}:`, error.message);
      
      // Fallback for ICO if Cloudinary doesn't support .ico generation for this asset
      if (config.filename === "favicon.ico") {
        console.log("Trying PNG fallback to ICO container...");
        try {
          // If .ico fails, we fetch a 32x32 PNG and save it as favicon.ico (browsers support PNG in .ico extension)
          const fallbackUrl = `${baseUrl}/c_fill,g_center,w_32,h_32/${logoAssetPath}.png`;
          const response = await axios.get(fallbackUrl, { responseType: "arraybuffer" });
          fs.writeFileSync(destPath, Buffer.from(response.data));
          console.log(`✓ Saved favicon.ico (PNG-encoded fallback)`);
        } catch (fbError) {
          console.error("✗ Fallback for favicon.ico failed:", fbError.message);
        }
      }
    }
  }
  
  console.log("🎉 Brand icon generation completed!");
}

generateIcons();
