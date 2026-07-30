export async function buildCard(THREE, stage) {
const loader = new THREE.TextureLoader();
const group = new THREE.Group();
group.name = 'peacesCard';

const W = 0.0856, H = 0.05398, T = 0.00052513, R = 0.0038;
function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

const cardShape = roundedRectShape(W, H, R);
const cardGeo = new THREE.ExtrudeGeometry(cardShape, { depth: T, bevelEnabled: true, bevelThickness: 0.00025, bevelSize: 0.00025, bevelSegments: 4, curveSegments: 24 });
cardGeo.translate(0, 0, -T / 2);
cardGeo.rotateX(-Math.PI / 2);
const cardMat = new THREE.MeshStandardMaterial({ color: 0xf7f4ef, roughness: 0.55, metalness: 0.15 });
cardMat.name = 'cardWhite';
const brushTex = await new Promise((res) => loader.load('../../assets/brushed-steel-bump.png', res));
const brushRoughTex = await new Promise((res) => loader.load('../../assets/brushed-steel-roughness.png', res));
brushTex.wrapS = brushTex.wrapT = THREE.RepeatWrapping;
brushRoughTex.wrapS = brushRoughTex.wrapT = THREE.RepeatWrapping;
brushTex.repeat.set(6, 4); brushRoughTex.repeat.set(6, 4);
cardMat.bumpMap = brushTex; cardMat.bumpScale = 0.00006;
cardMat.roughnessMap = brushRoughTex;
const cardBody = new THREE.Mesh(cardGeo, cardMat);
cardBody.name = 'cardBody';
cardBody.castShadow = true; cardBody.receiveShadow = true;
group.add(cardBody);

// Puzzle-knob connector protruding from the right edge, mid-height — built as a
// half-height(x) profile (neck pinches in, then bulges to a rounded head), mirrored
// top/bottom and capped with a semicircle at the tip. Guaranteed simple (non-self-
// intersecting) since each side is a single-valued function of x.
function smoothstep(a, b, t) { const x = Math.min(1, Math.max(0, (t - a) / (b - a))); return x * x * (3 - 2 * x); }
function knobShape() {
  const x0 = W / 2 - 0.0006; // slight overlap into the card body, hides the seam
  const L = 0.0105;          // protrusion depth
  const neckHalf = 0.0052, pinchHalf = 0.0044, headHalf = 0.008;
  const pinchT = 0.4;
  const dir = -1; // -1 = bulb points inward (toward card center), flush neck at the outer edge
  function hh(t) {
    if (t < pinchT) return neckHalf + (pinchHalf - neckHalf) * smoothstep(0, pinchT, t);
    return pinchHalf + (headHalf - pinchHalf) * smoothstep(pinchT, 1, t);
  }
  const N = 20;
  const s = new THREE.Shape();
  s.moveTo(x0, -neckHalf);
  for (let i = 0; i <= N; i++) { const t = i / N; s.lineTo(x0 + dir * t * L, hh(t) * -1); }
  const capCx = x0 + dir * L, capR = headHalf;
  const a0 = dir > 0 ? -Math.PI / 2 : Math.PI / 2 + Math.PI;
  const a1 = dir > 0 ? Math.PI / 2 : Math.PI / 2;
  s.absarc(capCx, 0, capR, a0, a1, dir < 0);
  for (let i = N; i >= 0; i--) { const t = i / N; s.lineTo(x0 + dir * t * L, hh(t)); }
  s.lineTo(x0, -neckHalf);
  return s;
}
const knobGeo = new THREE.ExtrudeGeometry(knobShape(), { depth: T * 0.4, bevelEnabled: true, bevelThickness: 0.00012, bevelSize: 0.00012, bevelSegments: 3, curveSegments: 24 });
knobGeo.translate(0, 0, -(T * 0.4) / 2);
knobGeo.rotateX(-Math.PI / 2);
const knobTex = await new Promise((res) => loader.load('../../assets/knob-metal-texture.png', res));
knobTex.colorSpace = THREE.SRGBColorSpace;
knobTex.wrapS = knobTex.wrapT = THREE.ClampToEdgeWrapping;
const knobMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: knobTex, roughness: 0.08, metalness: 0.4 });
knobMat.name = 'knobMetal';
const knob = new THREE.Mesh(knobGeo, knobMat);
knob.name = 'knobConnector';
knob.position.y = T / 2 + 0.00012; // sits nearly flush with the card surface, only slightly raised
knob.castShadow = true; knob.receiveShadow = true;
group.add(knob);

const knobBottom = new THREE.Mesh(knobGeo.clone(), knobMat);
knobBottom.name = 'knobConnectorBottom';
knobBottom.position.y = -(T / 2 + 0.00012);
knobBottom.rotation.z = Math.PI;
knobBottom.castShadow = true; knobBottom.receiveShadow = true;
group.add(knobBottom);

// Embossed logo decal on the card face
const logoTex = await new Promise((res) => loader.load('../../assets/peaces-logo-silver.png', res));
logoTex.colorSpace = THREE.SRGBColorSpace;
const logoAspect = logoTex.image ? logoTex.image.width / logoTex.image.height : 1;
const logoH = H * 0.42, logoW = logoH * logoAspect;
const logoGeo = new THREE.PlaneGeometry(logoW, logoH, 128, 128);
const logoBumpTex = await new Promise((res) => loader.load('../../assets/peaces-logo-bump.png', res));
const dispScale = 0.0028, dispBias = -0.502 * dispScale;
const logoMat = new THREE.MeshStandardMaterial({ map: logoTex, bumpMap: logoBumpTex, bumpScale: 0.0009, displacementMap: logoBumpTex, displacementScale: dispScale, displacementBias: dispBias, transparent: true, roughness: 0.1, metalness: 0.4, alphaTest: 0.1, side: THREE.DoubleSide });
logoMat.name = 'logoSilver';
const logo = new THREE.Mesh(logoGeo, logoMat);
logo.name = 'logoDecal';
logo.rotation.x = -Math.PI / 2;
logo.position.set(0, T / 2 + 0.0006, 0);
group.add(logo);

const logoBottom = new THREE.Mesh(logoGeo.clone(), logoMat);
logoBottom.name = 'logoDecalBottom';
logoBottom.rotation.x = Math.PI / 2;
logoBottom.position.set(0, -(T / 2 + 0.0006), 0);
group.add(logoBottom);

group.position.y = T / 2;

// Rim lights: bright, cool accents behind/above and below/front the card so its polished
// bevel edges catch a crisp highlight — sells the "sleek metal" feel beyond the flat key light.
const rimBack = new THREE.PointLight(0xdfe8ff, 0.06, 0.5, 2);
rimBack.position.set(-0.03, 0.05, -0.06);
stage._scene.add(rimBack);
const rimFront = new THREE.PointLight(0xfff3e6, 0.18, 0.4, 2);
rimFront.position.set(0.04, -0.02, 0.055);
stage._scene.add(rimFront);

const underLight = new THREE.PointLight(0xbcd4ff, 0.05, 0.35, 2);
underLight.position.set(0, -0.04, 0.012);
stage._scene.add(underLight);

return { group, materials: { card: cardMat, knob: knobMat, logo: logoMat } };
}
