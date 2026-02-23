/**
 * 构建准备脚本
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

function prepare() {
    console.log('准备构建...');
    
    const assetsDir = path.join(rootDir, 'assets');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="48" fill="url(#grad)"/>
  <g fill="white">
    <path d="M128 48c-44.183 0-80 35.817-80 80s35.817 80 80 80 80-35.817 80-80-35.817-80-80-80zm0 144c-35.346 0-64-28.654-64-64s28.654-64 64-64 64 28.654 64 64-28.654 64-64 64z" opacity="0.3"/>
    <path d="M180 128l-40-40v28H96v24h44v28l40-40z"/>
    <circle cx="128" cy="128" r="16"/>
  </g>
</svg>`;
    
    const iconPngPath = path.join(assetsDir, 'icon.png');
    if (!fs.existsSync(iconPngPath)) {
        const sharp = require('sharp');
        if (sharp) {
            sharp(Buffer.from(iconSvg))
                .resize(256, 256)
                .png()
                .toFile(iconPngPath)
                .then(() => console.log('图标已生成'))
                .catch(err => console.log('图标生成失败:', err.message));
        }
    }
    
    console.log('构建准备完成');
}

prepare();
