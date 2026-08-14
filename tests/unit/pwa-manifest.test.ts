import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("PWA Manifest & iOS Assets Verification", () => {
  it("should have a valid manifest.json with required PWA attributes", () => {
    const manifestPath = path.resolve(__dirname, "../../public/manifest.json");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    expect(manifest.name).toContain("Семейный бюджет");
    expect(manifest.short_name).toBe("Финансы");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  it("should have icon files in public/icons", () => {
    const icon192 = path.resolve(__dirname, "../../public/icons/icon-192.png");
    const icon512 = path.resolve(__dirname, "../../public/icons/icon-512.png");
    const iconSvg = path.resolve(__dirname, "../../public/icons/icon.svg");

    expect(fs.existsSync(icon192)).toBe(true);
    expect(fs.existsSync(icon512)).toBe(true);
    expect(fs.existsSync(iconSvg)).toBe(true);
  });
});
