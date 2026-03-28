// Generates a radial alpha gradient texture for use as an alphaMap in Three.js
// White in the center, fades to black at the edge
import * as THREE from 'three';

export function createRadialAlphaTexture(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, 'white');
  gradient.addColorStop(1, 'black');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}
