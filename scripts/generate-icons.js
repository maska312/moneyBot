const fs = require("fs");
const path = require("path");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="160" fill="rgba(255,255,255,0.15)"/>
  <text x="256" y="320" font-size="200" font-family="-apple-system, system-ui, sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle">с</text>
</svg>`;

const dir = path.join(__dirname, "../public/icons");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(path.join(dir, "icon.svg"), svg);
// Create placeholder png files (can be valid 1x1 png or svg)
const minimalPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

fs.writeFileSync(path.join(dir, "icon-192.png"), minimalPng);
fs.writeFileSync(path.join(dir, "icon-512.png"), minimalPng);
console.log("Icons created successfully");
