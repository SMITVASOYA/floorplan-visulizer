/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

// Procedural textures generator with zero external asset dependencies
export class ProceduralTextureGenerator {
  private static cachedTextures: Map<string, THREE.CanvasTexture> = new Map();

  /**
   * Generates a warm natural oak parquet flooring texture
   */
  public static getHardwoodOakTexture(maxAnisotropy: number = 8): THREE.CanvasTexture {
    const key = `hardwood_oak_${maxAnisotropy}`;
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base warm oak tone
    ctx.fillStyle = '#b08d57';
    ctx.fillRect(0, 0, size, size);

    // Plank grid
    const plankHeight = 32;
    const plankWidth = 128;
    const rows = size / plankHeight;
    const cols = size / plankWidth;

    for (let r = 0; r < rows; r++) {
      const offsetX = (r % 2) * (plankWidth / 2);
      for (let c = -1; c < cols + 1; c++) {
        const x = c * plankWidth + offsetX;
        const y = r * plankHeight;

        // Subtle plank tone variation
        const toneVar = Math.sin(r * 12.9898 + c * 78.233) * 0.08;
        const baseR = Math.min(255, Math.max(0, Math.floor(176 + toneVar * 40)));
        const baseG = Math.min(255, Math.max(0, Math.floor(138 + toneVar * 35)));
        const baseB = Math.min(255, Math.max(0, Math.floor(92 + toneVar * 30)));

        ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
        ctx.fillRect(x, y, plankWidth, plankHeight);

        // Wood grain lines
        ctx.strokeStyle = `rgba(80, 50, 20, 0.15)`;
        ctx.lineWidth = 1;
        for (let g = 0; g < 4; g++) {
          const gy = y + 4 + g * 6 + (Math.sin(g + x) * 2);
          ctx.beginPath();
          ctx.moveTo(x, gy);
          ctx.lineTo(x + plankWidth, gy + (Math.cos(x + g) * 1.5));
          ctx.stroke();
        }

        // Plank bevel edge
        ctx.strokeStyle = 'rgba(60, 40, 20, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, plankWidth, plankHeight);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = maxAnisotropy;
    this.cachedTextures.set(key, texture);
    return texture;
  }

  /**
   * Generates modern Italian marble tile texture with subtle veining
   */
  public static getMarbleTileTexture(maxAnisotropy: number = 8): THREE.CanvasTexture {
    const key = `marble_tile_${maxAnisotropy}`;
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Polished ivory background
    ctx.fillStyle = '#f1ece4';
    ctx.fillRect(0, 0, size, size);

    // Marble veins
    ctx.strokeStyle = 'rgba(170, 160, 150, 0.25)';
    ctx.lineWidth = 2.5;
    for (let v = 0; v < 6; v++) {
      ctx.beginPath();
      let vx = (v * 90) % size;
      let vy = 0;
      ctx.moveTo(vx, vy);
      while (vy < size) {
        vx += (Math.sin(vy * 0.05 + v) * 6) + (Math.random() - 0.5) * 4;
        vy += 12;
        ctx.lineTo(vx, vy);
      }
      ctx.stroke();
    }

    // Tile grid lines (grout)
    const tileSize = 128;
    ctx.strokeStyle = 'rgba(190, 180, 170, 0.7)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= size; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let y = 0; y <= size; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = maxAnisotropy;
    this.cachedTextures.set(key, texture);
    return texture;
  }

  /**
   * Generates architectural polished concrete texture
   */
  public static getPolishedConcreteTexture(maxAnisotropy: number = 8): THREE.CanvasTexture {
    const key = `polished_concrete_${maxAnisotropy}`;
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#787d82';
    ctx.fillRect(0, 0, size, size);

    // Fine mineral aggregate specks
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 1.5;
      const shade = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(40, 40, 45, 0.12)';
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Expansion joint seams
    ctx.strokeStyle = 'rgba(50, 55, 60, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = maxAnisotropy;
    this.cachedTextures.set(key, texture);
    return texture;
  }

  /**
   * Generates light Nordic birch wood texture
   */
  public static getNordicBirchTexture(maxAnisotropy: number = 8): THREE.CanvasTexture {
    const key = `nordic_birch_${maxAnisotropy}`;
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#e8dcc8';
    ctx.fillRect(0, 0, size, size);

    // Subtle grain
    ctx.strokeStyle = 'rgba(160, 140, 115, 0.12)';
    ctx.lineWidth = 1;
    for (let y = 0; y < size; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y + Math.sin(y * 0.1) * 2);
      ctx.lineTo(size, y + Math.cos(y * 0.08) * 3);
      ctx.stroke();
    }

    // Planks
    const plankH = 40;
    ctx.strokeStyle = 'rgba(140, 120, 95, 0.25)';
    ctx.lineWidth = 1.2;
    for (let y = 0; y <= size; y += plankH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = maxAnisotropy;
    this.cachedTextures.set(key, texture);
    return texture;
  }

  /**
   * Generates a soft radial contact shadow texture to ground objects on floor
   */
  public static getContactShadowTexture(): THREE.CanvasTexture {
    const key = 'contact_shadow';
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    gradient.addColorStop(0.35, 'rgba(0, 0, 0, 0.35)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.12)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    this.cachedTextures.set(key, texture);
    return texture;
  }

  /**
   * Procedural architectural facade texture with curtain wall glass and spandrel mullions
   */
  public static getBuildingFacadeTexture(maxAnisotropy: number = 8): THREE.CanvasTexture {
    const key = `building_facade_${maxAnisotropy}`;
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Architectural spandrel slate
    ctx.fillStyle = '#1c222e';
    ctx.fillRect(0, 0, size, size);

    const floorHeight = 64;
    const windowWidth = 48;
    const mullionWidth = 8;

    for (let y = 8; y < size; y += floorHeight) {
      // Concrete floor slab line
      ctx.fillStyle = '#2d3748';
      ctx.fillRect(0, y - 6, size, 8);

      for (let x = 8; x < size - 8; x += windowWidth + mullionWidth) {
        // Architectural tint glass
        const glassGrad = ctx.createLinearGradient(x, y, x, y + floorHeight - 16);
        glassGrad.addColorStop(0, '#324155');
        glassGrad.addColorStop(0.5, '#253346');
        glassGrad.addColorStop(1, '#1a2332');
        ctx.fillStyle = glassGrad;
        ctx.fillRect(x, y, windowWidth, floorHeight - 16);

        // Mullion frame
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, windowWidth, floorHeight - 16);

        // Warm interior evening light reflection in 30% of windows
        if ((x * 7 + y * 13) % 5 === 0) {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
          ctx.fillRect(x + 4, y + 4, windowWidth - 8, floorHeight - 24);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 4);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = maxAnisotropy;
    this.cachedTextures.set(key, texture);
    return texture;
  }
}
