import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ── Callout anchor data (positioned for the 3-story house) ── */
const CALLOUTS = [
  { id: "roof", title: "ROOF STRUCTURE", desc: "Reinforced concrete with architectural frame", anchor: [-1.2, 3.9, 0.2] },
  { id: "floors", title: "FLOOR LEVELS", desc: "Thoughtfully designed living spaces", anchor: [-1.6, 0.5, 1.2] },
  { id: "facade", title: "FACADE DETAIL", desc: "Premium materials with timeless appeal", anchor: [1.5, 2.2, 1.2] },
  { id: "frame", title: "STRUCTURAL FRAME", desc: "Engineered for strength and durability", anchor: [1.2, -1.2, 1.5] },
];

/* ── Camera presets (adjusted for tall narrow building) ── */
const PRESETS = {
  exterior: { p: [7.0, 4.5, 12.0], t: [0, 0.8, 0] },
  facade:   { p: [0, 1.5, 11.0],   t: [0, 0.8, 0] },
  rooftop:  { p: [2.5, 9.0, 5.0],  t: [0, 3.0, 0] },
  entrance: { p: [0.5, -1.0, 8.0], t: [0, -1.5, 1.0] },
  structure:{ p: [-6.0, 4.0, 8.0], t: [0, 0.8, 0] },
};

function ThreeHeroScene({ immersive = false, showWireframe = false, duskMode = true, cameraPreset = null, onPresetDone }) {
  const mountRef = useRef(null);
  const [webGlOk, setWebGlOk] = useState(true);
  const coRef = useRef({}); // callout DOM elements
  const sr = useRef({});    // scene runtime refs (camera, controls, car, etc.)
  const pr = useRef({ immersive, showWireframe, duskMode, cameraPreset });

  // Keep props ref in sync for animation loop access
  useEffect(() => { pr.current = { immersive, showWireframe, duskMode, cameraPreset }; }, [immersive, showWireframe, duskMode, cameraPreset]);

  // Toggle orbit controls + canvas pointer events
  useEffect(() => {
    const { controls, ren } = sr.current;
    if (controls) controls.enabled = immersive;
    if (ren?.domElement) ren.domElement.style.pointerEvents = immersive ? 'auto' : 'none';
  }, [immersive]);

  // Camera preset
  useEffect(() => {
    if (cameraPreset && PRESETS[cameraPreset]) {
      const ps = PRESETS[cameraPreset];
      sr.current.presetGoal = {
        pos: new THREE.Vector3(...ps.p),
        tgt: new THREE.Vector3(...ps.t),
      };
    }
  }, [cameraPreset]);

  // Wireframe toggle
  useEffect(() => {
    if (sr.current.wfGroup) sr.current.wfGroup.visible = showWireframe;
  }, [showWireframe]);

  // Day / Dusk lighting
  useEffect(() => {
    const s = sr.current;
    if (!s.amb) return;
    if (duskMode) {
      s.amb.color.setHex(0xdde4f0); s.amb.groundColor.setHex(0x403830); s.amb.intensity = 0.85;
      s.sun.intensity = 2.8; s.sun.color.setHex(0xffecc0);
      if (s.ren) s.ren.toneMappingExposure = 1.4;
      if (s.scene) s.scene.fog = new THREE.FogExp2(0x0c0c0c, 0.014);
      s.iLts?.forEach(l => { l.intensity = 0.65; });
    } else {
      s.amb.color.setHex(0xf0f4ff); s.amb.groundColor.setHex(0x706860); s.amb.intensity = 1.2;
      s.sun.intensity = 2.0; s.sun.color.setHex(0xfff8ee);
      if (s.ren) s.ren.toneMappingExposure = 1.9;
      if (s.scene) s.scene.fog = new THREE.FogExp2(0x808890, 0.008);
      s.iLts?.forEach(l => { l.intensity = 0.15; });
    }
  }, [duskMode]);

  /* ══════════════ MAIN THREE.JS SETUP ══════════════ */
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // WebGL check
    try {
      const cv = document.createElement("canvas");
      if (!(cv.getContext("webgl") || cv.getContext("experimental-webgl"))) { setWebGlOk(false); return; }
    } catch { setWebGlOk(false); return; }

    let cleanupFn = null;
    try {

    const mobile = "ontouchstart" in window || window.innerWidth < 768;
    const noMo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x0c0c0c, 0.014);

    let cw = el.clientWidth || window.innerWidth;
    let ch = el.clientHeight || window.innerHeight;

    // ── Camera (adjusted for taller building) ──
    const cam = new THREE.PerspectiveCamera(28, cw / ch, 0.1, 150);
    const camEnd = new THREE.Vector3(7.0, 4.5, 12.0);
    const camInit = new THREE.Vector3(3.5, 2.5, 6.5);
    cam.position.copy(noMo ? camEnd : camInit);
    const lookAt = new THREE.Vector3(0, 0.8, 0);
    cam.lookAt(lookAt);

    // ── Renderer ──
    const ren = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    ren.setSize(cw, ch);
    ren.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 2));
    ren.toneMapping = THREE.ACESFilmicToneMapping;
    ren.toneMappingExposure = 1.4;
    if (!mobile) { ren.shadowMap.enabled = true; ren.shadowMap.type = THREE.PCFSoftShadowMap; }
    ren.domElement.style.pointerEvents = 'none';
    el.appendChild(ren.domElement);

    // ── OrbitControls ──
    const controls = new OrbitControls(cam, ren.domElement);
    controls.enabled = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 5;
    controls.maxDistance = 25;
    controls.minPolarAngle = Math.PI * 0.1;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.set(0, 0.8, 0);
    controls.enablePan = false;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;

    // ── Lighting — cinematic architectural ──
    const amb = new THREE.HemisphereLight(0xdde4f0, 0x403830, 0.85);
    scene.add(amb);

    const sun = new THREE.DirectionalLight(0xffecc0, 2.8);
    sun.position.set(12, 18, 10);
    if (!mobile) {
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      Object.assign(sun.shadow.camera, { near: 1, far: 50, left: -14, right: 14, top: 14, bottom: -14 });
      sun.shadow.bias = -0.0002;
      sun.shadow.normalBias = 0.02;
      sun.shadow.radius = 3;
    }
    scene.add(sun);

    const sky = new THREE.DirectionalLight(0x88aac8, 0.6);
    sky.position.set(-10, 8, -8);
    scene.add(sky);
    const fill = new THREE.DirectionalLight(0xfff5e8, 0.35);
    fill.position.set(-6, 4, 10);
    scene.add(fill);
    const rim = new THREE.PointLight(0xffd090, 0.55, 25);
    rim.position.set(-5, 1, -4);
    scene.add(rim);
    const bounce = new THREE.PointLight(0xe8d8c8, 0.4, 16);
    bounce.position.set(0, -3, 5);
    scene.add(bounce);

    // Interior window lights array for day/dusk toggles
    const iLts = [];

    // ── Materials (refined architectural PBR) ──
    const WHT = new THREE.MeshStandardMaterial({ color: 0xf4f0eb, roughness: 0.65, metalness: 0.03, envMapIntensity: 0.4 });
    const WHT2 = new THREE.MeshStandardMaterial({ color: 0xeee9e2, roughness: 0.72, metalness: 0.02, envMapIntensity: 0.3 });
    const WDK = new THREE.MeshStandardMaterial({ color: 0x62442d, roughness: 0.48, metalness: 0.05, envMapIntensity: 0.5 });
    const GRY = new THREE.MeshStandardMaterial({ color: 0x827d76, roughness: 0.82, metalness: 0.05, envMapIntensity: 0.3 });
    const GRY2 = new THREE.MeshStandardMaterial({ color: 0x605c56, roughness: 0.85, metalness: 0.04, envMapIntensity: 0.25 });
    const MTL = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.22, metalness: 0.94, envMapIntensity: 0.8 });
    const GLS = new THREE.MeshStandardMaterial({ color: 0x1b2c3a, roughness: 0.04, metalness: 0.35, transparent: true, opacity: 0.40, envMapIntensity: 1.2 });
    const GLS_BALCONY = new THREE.MeshStandardMaterial({ color: 0x22384a, roughness: 0.03, metalness: 0.45, transparent: true, opacity: 0.48, envMapIntensity: 1.4 });
    const BRS = new THREE.MeshStandardMaterial({ color: 0xb89a5a, roughness: 0.25, metalness: 0.85, envMapIntensity: 0.7 });
    const GRN = new THREE.MeshStandardMaterial({ color: 0x3d5832, roughness: 0.7, metalness: 0.0 });
    const GRN2 = new THREE.MeshStandardMaterial({ color: 0x4a6a3e, roughness: 0.65, metalness: 0.0 });
    const FLOWER = new THREE.MeshStandardMaterial({ color: 0xd9b244, roughness: 0.6, metalness: 0.0 }); // yellow flowering shrubs
    const STN = new THREE.MeshStandardMaterial({ color: 0x8c8680, roughness: 0.88, metalness: 0.02, envMapIntensity: 0.2 });
    const PVD = new THREE.MeshStandardMaterial({ color: 0x5a544e, roughness: 0.92, metalness: 0.01 });
    const ASPHALT = new THREE.MeshStandardMaterial({ color: 0x242424, roughness: 0.95, metalness: 0.02 });
    const CURB = new THREE.MeshStandardMaterial({ color: 0xa8a29a, roughness: 0.85, metalness: 0.02 });
    const LED = new THREE.MeshStandardMaterial({ color: 0xffeedd, emissive: 0xffd090, emissiveIntensity: 0.55, roughness: 0.25 });
    const TRK = new THREE.MeshStandardMaterial({ color: 0x443224, roughness: 0.85, metalness: 0.0 });

    // Interior room materials
    const INT_WALL = new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.85, metalness: 0.0 });
    const INT_WOOD = new THREE.MeshStandardMaterial({ color: 0x7c5a38, roughness: 0.55, metalness: 0.04 });
    const INT_FABRIC = new THREE.MeshStandardMaterial({ color: 0x484440, roughness: 0.85, metalness: 0.0 });
    const INT_CURTAIN = new THREE.MeshStandardMaterial({ color: 0xfaf6ef, transparent: true, opacity: 0.82, roughness: 0.9 });

    // ── Helpers ──
    function mk(geo, mat, x, y, z, shd) {
      const o = new THREE.Mesh(geo, mat);
      o.position.set(x, y, z);
      if (shd) { o.castShadow = true; o.receiveShadow = true; }
      return o;
    }

    // Architectural Window with deep reveal, metal frame, sill, and visible interior room
    function win(parent, x, y, z, w, h, d, interiorType, horizMullion) {
      const rd = Math.max(d * 0.7, 0.07); // frame reveal depth
      const ft = 0.018; // frame thickness

      // 1. Recessed Frame (top, bottom, left, right)
      parent.add(mk(new THREE.BoxGeometry(w + 0.01, ft, rd), MTL, x, y + h / 2 - ft / 2, z - rd / 2));
      parent.add(mk(new THREE.BoxGeometry(w + 0.01, ft, rd), MTL, x, y - h / 2 + ft / 2, z - rd / 2));
      parent.add(mk(new THREE.BoxGeometry(ft, h - ft * 2, rd), MTL, x - w / 2 + ft / 2, y, z - rd / 2));
      parent.add(mk(new THREE.BoxGeometry(ft, h - ft * 2, rd), MTL, x + w / 2 - ft / 2, y, z - rd / 2));

      // 2. Horizontal mullion if requested
      if (horizMullion) {
        parent.add(mk(new THREE.BoxGeometry(w - ft * 2, 0.012, rd * 0.7), MTL, x, y + h * 0.1, z - rd * 0.4));
      }

      // 3. Stone sill at bottom
      parent.add(mk(new THREE.BoxGeometry(w + 0.06, 0.025, 0.05), STN, x, y - h / 2 - 0.01, z - 0.01));

      // 4. Glass pane
      parent.add(mk(new THREE.BoxGeometry(w - ft * 2, h - ft * 2, 0.012), GLS, x, y, z - rd * 0.45));

      // 5. Interior space behind glass
      if (interiorType) {
        const roomD = 0.75; // depth of the interior room
        const roomZ = z - rd - roomD / 2;

        // Back wall
        parent.add(mk(new THREE.BoxGeometry(w + 0.2, h + 0.1, 0.02), INT_WALL, x, y, z - rd - roomD));
        // Ceiling
        parent.add(mk(new THREE.BoxGeometry(w + 0.2, 0.02, roomD), INT_WALL, x, y + h / 2 + 0.05, roomZ));
        // Floor (wood)
        parent.add(mk(new THREE.BoxGeometry(w + 0.2, 0.02, roomD), INT_WOOD, x, y - h / 2 - 0.04, roomZ));
        // Side walls
        parent.add(mk(new THREE.BoxGeometry(0.02, h + 0.1, roomD), INT_WALL, x - w / 2 - 0.08, y, roomZ));
        parent.add(mk(new THREE.BoxGeometry(0.02, h + 0.1, roomD), INT_WALL, x + w / 2 + 0.08, y, roomZ));

        // Ceiling recessed downlight (warm LED)
        parent.add(mk(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 8), LED, x, y + h / 2 + 0.03, roomZ));

        // Point light inside room
        const roomLight = new THREE.PointLight(0xffdfa0, 0.65, 3.2);
        roomLight.position.set(x, y + h * 0.2, roomZ);
        scene.add(roomLight);
        iLts.push(roomLight);

        // Interior furniture by type
        if (interiorType === "living") {
          // Modern sofa silhouette
          parent.add(mk(new THREE.BoxGeometry(w * 0.7, 0.14, 0.22), INT_FABRIC, x, y - h / 2 + 0.07, roomZ));
          parent.add(mk(new THREE.BoxGeometry(w * 0.7, 0.20, 0.08), INT_FABRIC, x, y - h / 2 + 0.14, z - rd - roomD + 0.08));
          // Floor lamp
          parent.add(mk(new THREE.CylinderGeometry(0.01, 0.01, h * 0.7, 6), MTL, x + w * 0.35, y - h * 0.15, roomZ + 0.1));
          parent.add(mk(new THREE.CylinderGeometry(0.06, 0.09, 0.08, 8), LED, x + w * 0.35, y + h * 0.22, roomZ + 0.1));
          // Sheer curtains framing window edges
          parent.add(mk(new THREE.BoxGeometry(0.08, h - ft * 2, 0.015), INT_CURTAIN, x - w / 2 + 0.05, y, z - rd * 0.8));
          parent.add(mk(new THREE.BoxGeometry(0.08, h - ft * 2, 0.015), INT_CURTAIN, x + w / 2 - 0.05, y, z - rd * 0.8));
        } else if (interiorType === "bedroom") {
          // Bed headboard / credenza silhouette
          parent.add(mk(new THREE.BoxGeometry(w * 0.65, 0.25, 0.08), INT_WOOD, x, y - h / 2 + 0.14, z - rd - roomD + 0.08));
          // Bedside lamp
          parent.add(mk(new THREE.CylinderGeometry(0.04, 0.06, 0.07, 8), LED, x - w * 0.25, y - h / 2 + 0.22, z - rd - roomD + 0.15));
          // Curtain
          parent.add(mk(new THREE.BoxGeometry(0.09, h - ft * 2, 0.015), INT_CURTAIN, x - w / 2 + 0.05, y, z - rd * 0.8));
        } else if (interiorType === "study") {
          // Work desk
          parent.add(mk(new THREE.BoxGeometry(w * 0.7, 0.03, 0.25), INT_WOOD, x, y - h / 2 + 0.15, roomZ + 0.05));
          // Desk chair
          parent.add(mk(new THREE.BoxGeometry(0.18, 0.22, 0.18), INT_FABRIC, x, y - h / 2 + 0.18, roomZ + 0.25));
          // Bookshelf silhouette against back wall
          parent.add(mk(new THREE.BoxGeometry(0.15, h * 0.7, 0.12), INT_WOOD, x + w * 0.32, y - h * 0.05, z - rd - roomD + 0.08));
          // Desk lamp
          parent.add(mk(new THREE.SphereGeometry(0.03, 6, 4), LED, x - w * 0.2, y - h / 2 + 0.22, roomZ + 0.05));
        } else {
          // Simple soft warm glow interior
          parent.add(mk(new THREE.BoxGeometry(w * 0.5, 0.12, 0.2), INT_WOOD, x, y - h / 2 + 0.06, roomZ));
        }
      } else {
        // Standard window: subtle dark warm cavity (not flat solid black!)
        parent.add(mk(new THREE.BoxGeometry(w, h, rd), new THREE.MeshStandardMaterial({ color: 0x141618, roughness: 0.95 }), x, y, z - rd / 2, 0));
      }
    }

    // ══════════════════════════════════════════════════════
    // BUILDING — 3-story Indian residential (from reference image)
    // ══════════════════════════════════════════════════════

    const bldg = new THREE.Group();
    bldg.position.set(0.8, 0, 0);
    scene.add(bldg);

    const G = {};
    ["base", "cols", "slabs", "walls", "details", "roof"].forEach(k => { G[k] = new THREE.Group(); bldg.add(G[k]); });

    // ── Dimensions (tall narrow house) ──
    const BL = -1.7, BR = 1.8;       // 3.5 wide
    const BF = 1.0, BB = -1.2;       // 2.2 deep
    const GY = -2.2;                  // ground
    const CW = GY + 0.65;            // compound wall top
    const S1 = -0.5;                  // first floor slab
    const S2 = 1.15;                  // second floor slab
    const S3 = 2.8;                   // roof slab
    const TT = 3.85;                  // tower top
    const ST = 0.12;                  // slab thickness
    const D = 0.18;                   // wall thickness
    const sW = BR - BL, sD = BF - BB;
    const mX = (BL + BR) / 2, mZ = (BF + BB) / 2;

    // Tower column (left side extending above roof)
    const TL = BL, TR = BL + 0.9;

    // ═══ BASE & SURROUNDING SITE ═══
    // Main foundation base
    G.base.add(mk(new THREE.BoxGeometry(22, 0.06, 18), STN, 0, GY - 0.03, 0, 1));
    // Property paved lawn / courtyard
    G.base.add(mk(new THREE.BoxGeometry(11, 0.02, 8.5), PVD, 0.5, GY + 0.01, 0, 1));

    // ── Continuous Asphalt Road Loop ──
    const roadY = GY + 0.015;
    // Front Road
    G.base.add(mk(new THREE.BoxGeometry(20, 0.022, 2.5), ASPHALT, 0, roadY, 4.3, 1));
    // Rear Lane
    G.base.add(mk(new THREE.BoxGeometry(18, 0.022, 2.4), ASPHALT, 0, roadY, -4.5, 1));
    // Right Connecting Road
    G.base.add(mk(new THREE.BoxGeometry(2.4, 0.022, 9.2), ASPHALT, 5.5, roadY, -0.1, 1));
    // Left Connecting Road
    G.base.add(mk(new THREE.BoxGeometry(2.4, 0.022, 9.2), ASPHALT, -5.5, roadY, -0.1, 1));

    // Road Curbs (inner perimeter separating road from plot)
    G.base.add(mk(new THREE.BoxGeometry(11.2, 0.04, 0.08), CURB, 0.5, GY + 0.03, 3.0));
    G.base.add(mk(new THREE.BoxGeometry(11.2, 0.04, 0.08), CURB, 0.5, GY + 0.03, -3.2));
    G.base.add(mk(new THREE.BoxGeometry(0.08, 0.04, 6.4), CURB, 4.2, GY + 0.03, -0.1));
    G.base.add(mk(new THREE.BoxGeometry(0.08, 0.04, 6.4), CURB, -4.2, GY + 0.03, -0.1));

    // Dashed center line markings on front road
    for (let i = -7; i <= 7; i += 2) {
      G.base.add(mk(new THREE.BoxGeometry(1.0, 0.002, 0.06), WHT, i, roadY + 0.012, 4.3));
    }

    // ── Compound Boundary Walls (fully connecting to property) ──
    const cwH = CW - GY;
    const cwZ = BF + 0.85; // front compound wall Z position
    // Front Left Wall
    G.base.add(mk(new THREE.BoxGeometry(sW * 0.55, cwH, 0.12), GRY2, BL + sW * 0.27, GY + cwH / 2, cwZ, 1));
    // Circular decorative medallion on left wall (matching reference photo!)
    const medallion = mk(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 24), WHT, BL + sW * 0.27, GY + cwH * 0.52, cwZ + 0.07);
    medallion.rotateX(Math.PI / 2);
    G.base.add(medallion);
    const medallionInner = mk(new THREE.CylinderGeometry(0.14, 0.14, 0.025, 24), BRS, BL + sW * 0.27, GY + cwH * 0.52, cwZ + 0.072);
    medallionInner.rotateX(Math.PI / 2);
    G.base.add(medallionInner);

    // Front Right Gate Pillar
    const pillarX = BR - 0.25;
    G.base.add(mk(new THREE.BoxGeometry(0.45, cwH * 1.05, 0.18), GRY, pillarX, GY + cwH * 0.525, cwZ, 1));
    // Nameplate on gate pillar ("SHIVAKRITI")
    G.base.add(mk(new THREE.BoxGeometry(0.36, 0.12, 0.02), WHT, pillarX, GY + cwH * 0.65, cwZ + 0.10));
    G.base.add(mk(new THREE.BoxGeometry(0.28, 0.03, 0.025), BRS, pillarX, GY + cwH * 0.65, cwZ + 0.102));

    // Modern Gate (between left wall and right pillar)
    const gateW = pillarX - 0.22 - (BL + sW * 0.55);
    const gateX = (pillarX - 0.22 + (BL + sW * 0.55)) / 2;
    G.base.add(mk(new THREE.BoxGeometry(gateW, cwH * 0.85, 0.03), MTL, gateX, GY + cwH * 0.425, cwZ));
    // Vertical gate slats
    for (let i = 0; i < 7; i++) {
      G.base.add(mk(new THREE.BoxGeometry(0.015, cwH * 0.8, 0.04), WDK, gateX - gateW / 2 + (i + 1) * (gateW / 8), GY + cwH * 0.425, cwZ, 1));
    }

    // Left Side Boundary Wall (connecting front wall back to rear)
    const sideWallLen = cwZ - (BB - 0.4);
    G.base.add(mk(new THREE.BoxGeometry(0.12, cwH * 0.9, sideWallLen), GRY2, BL - 0.2, GY + cwH * 0.45, (cwZ + BB - 0.4) / 2, 1));
    // Right Side Boundary Wall
    G.base.add(mk(new THREE.BoxGeometry(0.12, cwH * 0.9, sideWallLen), GRY2, BR + 0.3, GY + cwH * 0.45, (cwZ + BB - 0.4) / 2, 1));
    // Rear Boundary Wall
    G.base.add(mk(new THREE.BoxGeometry(sW + 0.62, cwH * 0.8, 0.12), GRY2, mX, GY + cwH * 0.4, BB - 0.4, 1));

    // Hedges along top of compound wall (properly seated flush)
    for (let i = 0; i < 5; i++) {
      G.base.add(mk(new THREE.BoxGeometry(0.40, 0.14, 0.18), GRN, BL + 0.35 + i * 0.45, CW + 0.07, cwZ, 1));
    }
    // Low flowering planters in front of right compound wall (matching reference image!)
    const planW = 0.9;
    G.base.add(mk(new THREE.BoxGeometry(planW, 0.14, 0.26), GRY, BR - 0.3, GY + 0.07, cwZ + 0.22, 1));
    for (let i = 0; i < 4; i++) {
      G.base.add(mk(new THREE.SphereGeometry(0.06, 6, 5), FLOWER, BR - 0.65 + i * 0.24, GY + 0.17, cwZ + 0.22, 1));
    }

    // Trees (anchored firmly into the ground so trunks NEVER hover)
    function addTree(gp, x, z, h, thick) {
      // Trunk starts below ground at GY - 0.15 for seamless grounding
      const trunkH = h * 0.55;
      const ty = GY - 0.05 + trunkH / 2;
      gp.add(mk(new THREE.CylinderGeometry(thick * 0.55, thick, trunkH, 8), TRK, x, ty, z, 1));
      // Organic multi-cluster foliage
      const cR = h * 0.20;
      gp.add(mk(new THREE.IcosahedronGeometry(cR, 1), GRN, x, GY + h * 0.52, z, 1));
      gp.add(mk(new THREE.IcosahedronGeometry(cR * 0.85, 1), GRN2, x + cR * 0.4, GY + h * 0.58, z - cR * 0.3, 1));
      gp.add(mk(new THREE.IcosahedronGeometry(cR * 0.75, 1), GRN, x - cR * 0.35, GY + h * 0.62, z + cR * 0.25, 1));
      gp.add(mk(new THREE.IcosahedronGeometry(cR * 0.60, 1), GRN2, x + cR * 0.1, GY + h * 0.68, z - cR * 0.15, 1));
    }
    addTree(G.base, -2.8, 2.2, 2.7, 0.06);
    addTree(G.base,  3.2, 1.8, 2.5, 0.05);
    addTree(G.base, -2.6, -1.8, 2.9, 0.06);
    addTree(G.base,  3.0, -1.6, 2.6, 0.05);

    // Ground-level shrubs
    [[-1.8, 1.8, 0.22], [2.2, 1.6, 0.20], [-2.2, 0.4, 0.22], [2.4, -0.6, 0.18]].forEach(([x, z, r]) => {
      G.base.add(mk(new THREE.IcosahedronGeometry(r, 1), GRN, x, GY + r * 0.65, z, 1));
      G.base.add(mk(new THREE.IcosahedronGeometry(r * 0.75, 1), GRN2, x + r * 0.3, GY + r * 0.55, z - r * 0.2, 1));
    });

    // ═══ GROUND FLOOR (GY to S1) — Entrance, Doors, Louvers, Living Window ═══
    const gfH = S1 - GY;

    // Back wall
    G.cols.add(mk(new THREE.BoxGeometry(sW, gfH, D), WHT, mX, GY + gfH / 2, BB + D / 2, 1));
    // Left wall
    G.cols.add(mk(new THREE.BoxGeometry(D, gfH, sD), WHT2, BL + D / 2, GY + gfH / 2, mZ, 1));
    // Right wall
    G.cols.add(mk(new THREE.BoxGeometry(D, gfH, sD), GRY, BR - D / 2, GY + gfH / 2, mZ, 1));

    // Front ground floor — left section: covered parking / staircase alcove
    G.cols.add(mk(new THREE.BoxGeometry(1.0, gfH * 0.5, D), WHT, BL + 0.5, GY + gfH * 0.25, BF - D / 2, 1));
    // Staircase diagonal element
    const stairGeo = new THREE.BoxGeometry(1.2, 0.06, 0.8);
    const stairMesh = mk(stairGeo, WHT2, BL + 0.6, GY + gfH * 0.45, BF - 0.1, 1);
    stairMesh.rotation.z = -0.45;
    G.cols.add(stairMesh);
    G.cols.add(mk(new THREE.BoxGeometry(0.02, gfH * 0.6, 0.02), MTL, BL + 1.1, GY + gfH * 0.5, BF + 0.1));

    // Ground Floor Main Entrance Door (Center)
    const doorW = 0.58, doorH = gfH * 0.75;
    const doorX = -0.22, doorY = GY + doorH / 2;
    // Door recess frame
    G.cols.add(mk(new THREE.BoxGeometry(doorW + 0.06, doorH + 0.04, D), MTL, doorX, doorY, BF - D / 2));
    // Wooden door leaf
    G.cols.add(mk(new THREE.BoxGeometry(doorW, doorH, 0.04), WDK, doorX, doorY, BF - 0.02, 1));
    // Modern vertical brass door handle
    G.cols.add(mk(new THREE.CylinderGeometry(0.01, 0.01, 0.35, 8), BRS, doorX + doorW * 0.35, doorY, BF + 0.02));

    // Vertical metal louvers beside door
    const louverCount = 10;
    const louverSpan = 0.55;
    const louverX = 0.25;
    G.cols.add(mk(new THREE.BoxGeometry(louverSpan + 0.04, gfH * 0.65 + 0.04, 0.015), MTL, louverX, GY + gfH * 0.56, BF + 0.01));
    for (let i = 0; i < louverCount; i++) {
      const lx = louverX - louverSpan / 2 + (i + 0.5) * (louverSpan / louverCount);
      const blade = mk(new THREE.BoxGeometry(0.012, gfH * 0.62, 0.045), MTL, lx, GY + gfH * 0.56, BF + 0.02, 1);
      blade.rotation.y = 0.15;
      G.cols.add(blade);
    }

    // Front ground floor — Right: Large Living Room Window with Visible Interior
    G.cols.add(mk(new THREE.BoxGeometry(1.0, gfH * 0.45, D), WHT, BR - 0.6, GY + gfH * 0.22, BF - D / 2, 1));
    win(G.cols, BR - 0.6, GY + gfH * 0.65, BF, 0.85, gfH * 0.45, D, "living", true);

    // Right side ground floor window with warm interior glow
    win(G.cols, BR, GY + gfH * 0.55, (BB + mZ) / 2 + 0.3, 0.6, gfH * 0.38, D, "lounge", false);

    // Facade junction reveals
    G.cols.add(mk(new THREE.BoxGeometry(0.008, gfH, 0.03), GRY2, BL + 1.05, GY + gfH / 2, BF + 0.01));
    G.cols.add(mk(new THREE.BoxGeometry(0.008, gfH, 0.03), GRY2, 0.55, GY + gfH / 2, BF + 0.01));

    // ═══ SLABS (with edge reveals and drip lines) ═══
    // First floor slab
    G.slabs.add(mk(new THREE.BoxGeometry(sW + 0.3, ST, sD + 0.2), WHT, mX, S1 + ST / 2, mZ + 0.1, 1));
    G.slabs.add(mk(new THREE.BoxGeometry(sW + 0.3, 0.008, 0.012), GRY2, mX, S1 - 0.004, BF + 0.2));
    // First floor front balcony slab (left projection)
    G.slabs.add(mk(new THREE.BoxGeometry(1.5, ST, 1.0), WHT, BL + 0.75, S1 + ST / 2, BF + 0.7, 1));
    G.slabs.add(mk(new THREE.BoxGeometry(1.48, 0.01, 0.98), WHT2, BL + 0.75, S1 - 0.005, BF + 0.7));
    G.slabs.add(mk(new THREE.BoxGeometry(1.5, 0.008, 0.012), GRY2, BL + 0.75, S1 - 0.004, BF + 1.19));

    // Second floor slab
    G.slabs.add(mk(new THREE.BoxGeometry(sW + 0.2, ST, sD + 0.15), WHT, mX, S2 + ST / 2, mZ + 0.08, 1));
    G.slabs.add(mk(new THREE.BoxGeometry(sW + 0.2, 0.008, 0.012), GRY2, mX, S2 - 0.004, BF + 0.15));
    // Second floor front cantilever (right side projection)
    G.slabs.add(mk(new THREE.BoxGeometry(1.4, ST, 0.8), WHT, BR - 0.5, S2 + ST / 2, BF + 0.5, 1));
    G.slabs.add(mk(new THREE.BoxGeometry(1.38, 0.01, 0.78), WHT2, BR - 0.5, S2 - 0.005, BF + 0.5));
    G.slabs.add(mk(new THREE.BoxGeometry(1.4, 0.008, 0.012), GRY2, BR - 0.5, S2 - 0.004, BF + 0.89));

    // Roof slab
    G.slabs.add(mk(new THREE.BoxGeometry(sW + 0.3, 0.14, sD + 0.2), WHT, mX, S3 + 0.07, mZ, 1));
    G.slabs.add(mk(new THREE.BoxGeometry(sW + 0.3, 0.008, 0.012), GRY2, mX, S3 - 0.004, BF + 0.1));

    // Subtle edge lines (architectural overlay)
    const ew = new THREE.LineBasicMaterial({ color: 0xb89a5a, transparent: true, opacity: 0.06 });
    [S1, S2].forEach(sy => {
      const eg = new THREE.EdgesGeometry(new THREE.BoxGeometry(sW + 0.3, ST, sD + 0.2), 25);
      const ln = new THREE.LineSegments(eg, ew);
      ln.position.set(mX, sy + ST / 2, mZ + 0.1);
      G.slabs.add(ln);
    });

    // ═══ FIRST FLOOR WALLS (S1 to S2) ═══
    const f1B = S1 + ST, f1T = S2, f1H = f1T - f1B;

    // Back wall
    G.walls.add(mk(new THREE.BoxGeometry(sW, f1H, D), WHT, mX, (f1B + f1T) / 2, BB + D / 2, 1));
    // Left wall
    G.walls.add(mk(new THREE.BoxGeometry(D, f1H, sD), WHT2, BL + D / 2, (f1B + f1T) / 2, mZ, 1));
    // Right wall
    G.walls.add(mk(new THREE.BoxGeometry(D, f1H, sD), GRY, BR - D / 2, (f1B + f1T) / 2, mZ, 1));

    // Front facade — Left: Teak wood cladding panel + Bedroom Window with visible interior
    G.walls.add(mk(new THREE.BoxGeometry(1.2, f1H, 0.04), WDK, BL + 0.6, (f1B + f1T) / 2, BF + 0.02, 1));
    win(G.walls, BL + 0.6, (f1B + f1T) / 2 + 0.05, BF + 0.04, 0.68, f1H * 0.58, 0.06, "bedroom", true);

    // Front facade — Center: Grey textured architectural panel with horizontal groove
    G.walls.add(mk(new THREE.BoxGeometry(0.8, f1H, D), GRY, 0, (f1B + f1T) / 2, BF - D / 2, 1));
    G.walls.add(mk(new THREE.BoxGeometry(0.8, 0.02, 0.03), MTL, 0, (f1B + f1T) / 2, BF + 0.01));

    // Front facade — Right: White wall + Dining/Lounge Window with visible interior
    G.walls.add(mk(new THREE.BoxGeometry(1.2, f1H, D), WHT, BR - 0.6, (f1B + f1T) / 2, BF - D / 2, 1));
    G.walls.add(mk(new THREE.BoxGeometry(0.5, f1H, 0.04), WDK, BR - 0.25, (f1B + f1T) / 2, BF + 0.02, 1));
    win(G.walls, BR - 0.8, (f1B + f1T) / 2 + 0.05, BF, 0.65, f1H * 0.52, D, "study", true);

    // Right side first floor windows
    win(G.walls, BR, (f1B + f1T) / 2, mZ + 0.3, 0.5, f1H * 0.45, D, "lounge", false);
    win(G.walls, BR, (f1B + f1T) / 2, mZ - 0.5, 0.45, f1H * 0.4, D, null, false);

    // Facade reveals
    G.walls.add(mk(new THREE.BoxGeometry(0.006, f1H, 0.03), GRY2, BL + 1.22, (f1B + f1T) / 2, BF + 0.01));
    G.walls.add(mk(new THREE.BoxGeometry(0.006, f1H, 0.03), GRY2, 0.42, (f1B + f1T) / 2, BF + 0.01));

    // LED strip under overhang
    G.walls.add(mk(new THREE.BoxGeometry(sW * 0.6, 0.015, 0.025), LED, mX + 0.2, f1T - 0.02, BF + 0.05));

    // ═══ SECOND FLOOR WALLS (S2 to S3) ═══
    const f2B = S2 + ST, f2T = S3, f2H = f2T - f2B;

    // Back wall
    G.walls.add(mk(new THREE.BoxGeometry(sW, f2H, D), WHT, mX, (f2B + f2T) / 2, BB + D / 2, 1));
    // Left wall
    G.walls.add(mk(new THREE.BoxGeometry(D, f2H, sD), WHT2, BL + D / 2, (f2B + f2T) / 2, mZ, 1));
    // Right wall
    G.walls.add(mk(new THREE.BoxGeometry(D, f2H, sD), GRY, BR - D / 2, (f2B + f2T) / 2, mZ, 1));

    // Front facade — Left: Wood panel + Window
    G.walls.add(mk(new THREE.BoxGeometry(1.0, f2H, 0.04), WDK, BL + 0.5, (f2B + f2T) / 2, BF + 0.02, 1));
    win(G.walls, BL + 0.5, (f2B + f2T) / 2 + 0.05, BF + 0.04, 0.62, f2H * 0.52, 0.06, "bedroom", true);

    // Front facade — Center-Right: White wall with Ribbon Studio Windows
    G.walls.add(mk(new THREE.BoxGeometry(1.8, f2H, D), WHT, mX + 0.45, (f2B + f2T) / 2, BF - D / 2, 1));
    G.walls.add(mk(new THREE.BoxGeometry(0.6, f2H, 0.04), WDK, BR - 0.3, (f2B + f2T) / 2, BF + 0.02, 1));
    win(G.walls, 0.2, (f2B + f2T) / 2 + 0.05, BF, 0.58, f2H * 0.50, D, "study", true);
    win(G.walls, 1.0, (f2B + f2T) / 2 + 0.05, BF, 0.58, f2H * 0.50, D, "living", true);

    // Right side second floor window
    win(G.walls, BR, (f2B + f2T) / 2, mZ, 0.5, f2H * 0.45, D, "lounge", false);

    // Facade reveals
    G.walls.add(mk(new THREE.BoxGeometry(0.006, f2H, 0.03), GRY2, BL + 1.02, (f2B + f2T) / 2, BF + 0.01));
    G.walls.add(mk(new THREE.BoxGeometry(0.006, f2H, 0.03), GRY2, BR - 0.58, (f2B + f2T) / 2, BF + 0.01));

    // LED strip under second floor overhang
    G.walls.add(mk(new THREE.BoxGeometry(sW * 0.5, 0.015, 0.025), LED, mX + 0.3, f2T - 0.02, BF + 0.05));

    // ═══ BALCONIES, RAILINGS, CANOPY & LANDSCAPING ═══

    // First floor left balcony — Glass Railing with Corner Return (No Gaps)
    const b1Top = S1 + ST;
    // Front Glass Railing
    G.details.add(mk(new THREE.BoxGeometry(1.48, 0.52, 0.02), GLS_BALCONY, BL + 0.75, b1Top + 0.27, BF + 1.18));
    G.details.add(mk(new THREE.BoxGeometry(1.50, 0.02, 0.03), MTL, BL + 0.75, b1Top + 0.54, BF + 1.18));
    G.details.add(mk(new THREE.BoxGeometry(1.50, 0.02, 0.03), MTL, BL + 0.75, b1Top + 0.02, BF + 1.18));
    // Left Return Glass Railing (sealing the balcony securely)
    G.details.add(mk(new THREE.BoxGeometry(0.02, 0.52, 0.96), GLS_BALCONY, BL + 0.01, b1Top + 0.27, BF + 0.70));
    G.details.add(mk(new THREE.BoxGeometry(0.03, 0.02, 0.98), MTL, BL + 0.01, b1Top + 0.54, BF + 0.70));
    // Railing posts
    for (let i = 0; i < 3; i++) {
      G.details.add(mk(new THREE.BoxGeometry(0.02, 0.54, 0.02), MTL, BL + 0.15 + i * 0.60, b1Top + 0.27, BF + 1.18));
    }

    // Planter Box firmly seated ON TOP of Balcony Slab
    G.details.add(mk(new THREE.BoxGeometry(0.55, 0.16, 0.24), GRY2, BL + 0.45, b1Top + 0.08, BF + 0.88));
    G.details.add(mk(new THREE.SphereGeometry(0.12, 6, 5), GRN, BL + 0.45, b1Top + 0.22, BF + 0.88, 1));
    G.details.add(mk(new THREE.SphereGeometry(0.09, 5, 4), GRN2, BL + 0.58, b1Top + 0.20, BF + 0.88, 1));

    // First floor right — glass railing along slab edge
    G.details.add(mk(new THREE.BoxGeometry(1.2, 0.50, 0.02), GLS_BALCONY, BR - 0.4, S1 + 0.33, BF + 0.05));
    G.details.add(mk(new THREE.BoxGeometry(1.25, 0.02, 0.03), MTL, BR - 0.4, S1 + 0.56, BF + 0.05));

    // Second floor — Cantilever Glass Railing with Side Return
    const b2Top = S2 + ST;
    // Front Glass Railing
    G.details.add(mk(new THREE.BoxGeometry(1.38, 0.50, 0.02), GLS_BALCONY, BR - 0.50, b2Top + 0.26, BF + 0.88));
    G.details.add(mk(new THREE.BoxGeometry(1.40, 0.02, 0.03), MTL, BR - 0.50, b2Top + 0.52, BF + 0.88));
    G.details.add(mk(new THREE.BoxGeometry(1.40, 0.02, 0.03), MTL, BR - 0.50, b2Top + 0.02, BF + 0.88));
    // Right Return Railing
    G.details.add(mk(new THREE.BoxGeometry(0.02, 0.50, 0.78), GLS_BALCONY, BR + 0.19, b2Top + 0.26, BF + 0.50));
    G.details.add(mk(new THREE.BoxGeometry(0.03, 0.02, 0.80), MTL, BR + 0.19, b2Top + 0.52, BF + 0.50));
    for (let i = 0; i < 3; i++) {
      G.details.add(mk(new THREE.BoxGeometry(0.02, 0.52, 0.02), MTL, BR - 1.15 + i * 0.65, b2Top + 0.26, BF + 0.88));
    }

    // Second floor left projection with horizontal safety rails
    G.details.add(mk(new THREE.BoxGeometry(0.9, 0.08, 0.6), WHT, BL + 0.45, S2, BF + 0.4, 1));
    for (let i = 0; i < 4; i++) {
      G.details.add(mk(new THREE.BoxGeometry(0.85, 0.015, 0.015), MTL, BL + 0.45, S2 + 0.12 + i * 0.12, BF + 0.68));
    }
    G.details.add(mk(new THREE.BoxGeometry(0.02, 0.5, 0.02), MTL, BL + 0.05, S2 + 0.25, BF + 0.68));
    G.details.add(mk(new THREE.BoxGeometry(0.02, 0.5, 0.02), MTL, BL + 0.85, S2 + 0.25, BF + 0.68));

    // Entrance Canopy & Structure (connected seamlessly to wall)
    G.details.add(mk(new THREE.BoxGeometry(sW * 0.5, 0.06, 0.9), WHT, mX - 0.2, S1 - 0.03, BF + 0.65, 1));
    G.details.add(mk(new THREE.BoxGeometry(sW * 0.5 + 0.02, 0.018, 0.92), BRS, mX - 0.2, S1 - 0.06, BF + 0.65));
    G.details.add(mk(new THREE.BoxGeometry(sW * 0.48, 0.008, 0.88), WHT2, mX - 0.2, S1 - 0.065, BF + 0.65));
    // Warm downlight under entrance porch
    const porchLight = new THREE.PointLight(0xffe0a0, 0.7, 2.5);
    porchLight.position.set(mX - 0.2, S1 - 0.10, BF + 0.65);
    scene.add(porchLight);
    iLts.push(porchLight);

    // Entrance Steps (seamlessly grounded with stone treads and metal nosing)
    for (let i = 0; i < 3; i++) {
      const stepW = 1.3 - i * 0.05;
      const sy = GY + 0.035 + i * 0.07;
      const sz = BF + 0.85 + i * 0.22;
      G.details.add(mk(new THREE.BoxGeometry(stepW, 0.07, 0.22), STN, doorX, sy, sz, 1));
      G.details.add(mk(new THREE.BoxGeometry(stepW + 0.01, 0.008, 0.015), MTL, doorX, sy + 0.036, sz + 0.11));
    }

    // Modern Wall Sconce Lights (warm glow accents)
    [[BL + 0.6, f1T - 0.12, BF + 0.06], [BR - 0.6, f1T - 0.12, BF + 0.06],
     [0, f2T - 0.12, BF + 0.06], [BL + 0.5, f2T - 0.12, BF + 0.06]].forEach(([x, y, z]) => {
      G.details.add(mk(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8), MTL, x, y, z));
      G.details.add(mk(new THREE.SphereGeometry(0.018, 6, 4), LED, x, y - 0.04, z + 0.005));
    });

    // Planters at Entrance (solidly grounded on the paved ground, no floating)
    [[-0.85, BF + 0.80], [0.55, BF + 0.80]].forEach(([x, z]) => {
      // Pot sitting firmly on pavement (GY + 0.01)
      const potH = 0.24;
      G.details.add(mk(new THREE.CylinderGeometry(0.13, 0.10, potH, 10), GRY2, x, GY + 0.01 + potH / 2, z, 1));
      G.details.add(mk(new THREE.CylinderGeometry(0.14, 0.14, 0.018, 10), GRY, x, GY + 0.01 + potH, z));
      // Organic shrub clusters
      G.details.add(mk(new THREE.IcosahedronGeometry(0.11, 1), GRN, x, GY + 0.01 + potH + 0.08, z, 1));
      G.details.add(mk(new THREE.IcosahedronGeometry(0.08, 1), GRN2, x + 0.04, GY + 0.01 + potH + 0.12, z - 0.02, 1));
    });

    // ═══ ROOF — Tower, Terrace, Parapet ═══
    // Parapets
    G.roof.add(mk(new THREE.BoxGeometry(sW + 0.3, 0.20, 0.06), WHT, mX, S3 + 0.24, BF + 0.1));
    G.roof.add(mk(new THREE.BoxGeometry(sW + 0.3, 0.20, 0.06), WHT, mX, S3 + 0.24, BB - 0.1));
    G.roof.add(mk(new THREE.BoxGeometry(0.06, 0.20, sD + 0.4), WHT, BR + 0.15, S3 + 0.24, mZ));
    G.roof.add(mk(new THREE.BoxGeometry(sW + 0.4, 0.025, sD + 0.4), MTL, mX, S3 + 0.35, mZ));

    // Left Tower Structure (extends above roof)
    const twW = TR - TL, twH = TT - S3;
    G.roof.add(mk(new THREE.BoxGeometry(twW, twH, sD * 0.6), WHT, (TL + TR) / 2, S3 + twH / 2, mZ + 0.15, 1));
    G.roof.add(mk(new THREE.BoxGeometry(twW + 0.02, twH, 0.04), WHT2, (TL + TR) / 2, S3 + twH / 2, BF + 0.12, 1));
    G.roof.add(mk(new THREE.BoxGeometry(twW + 0.1, 0.06, sD * 0.65), MTL, (TL + TR) / 2, TT + 0.03, mZ + 0.15));

    // Tower Front Window looking onto Rooftop
    win(G.roof, (TL + TR) / 2, S3 + twH * 0.62, BF + 0.14, 0.62, twH * 0.42, 0.06, "study", false);

    // Tower Balcony (firmly seated)
    const tbY = TT - 0.5;
    G.roof.add(mk(new THREE.BoxGeometry(twW + 0.2, 0.06, 0.4), WHT, (TL + TR) / 2, tbY, BF + 0.35, 1));
    // Horizontal metal railings
    for (let i = 0; i < 3; i++) {
      G.roof.add(mk(new THREE.BoxGeometry(twW + 0.15, 0.015, 0.015), MTL, (TL + TR) / 2, tbY + 0.10 + i * 0.13, BF + 0.52));
    }
    G.roof.add(mk(new THREE.BoxGeometry(0.02, 0.42, 0.02), MTL, TL - 0.05, tbY + 0.22, BF + 0.52));
    G.roof.add(mk(new THREE.BoxGeometry(0.02, 0.42, 0.02), MTL, TR + 0.05, tbY + 0.22, BF + 0.52));

    // Planter on tower balcony (sitting directly on top of slab)
    G.roof.add(mk(new THREE.BoxGeometry(0.50, 0.14, 0.18), GRY2, (TL + TR) / 2, tbY + 0.10, BF + 0.32));
    G.roof.add(mk(new THREE.SphereGeometry(0.10, 6, 5), GRN, (TL + TR) / 2 - 0.1, tbY + 0.20, BF + 0.32, 1));
    G.roof.add(mk(new THREE.SphereGeometry(0.08, 5, 4), GRN2, (TL + TR) / 2 + 0.15, tbY + 0.19, BF + 0.32, 1));
    G.roof.add(mk(new THREE.BoxGeometry(twW + 0.04, 0.02, 0.04), BRS, (TL + TR) / 2, S3 + 0.01, BF + 0.12));

    // ═══ WIREFRAME OVERLAY ═══
    const wfGroup = new THREE.Group();
    wfGroup.visible = false;
    const wfMat = new THREE.LineBasicMaterial({ color: 0xb89a5a, transparent: true, opacity: 0.22 });
    const bbEdge = new THREE.EdgesGeometry(new THREE.BoxGeometry(sW + 0.2, TT - GY + 0.2, sD + 0.2));
    const bbLine = new THREE.LineSegments(bbEdge, wfMat);
    bbLine.position.set(mX, (GY + TT) / 2, mZ);
    wfGroup.add(bbLine);
    [GY, S1, S2, S3].forEach(sy => {
      const fp = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(sW + 0.5, 0.005, sD + 0.5)), wfMat);
      fp.position.set(mX, sy, mZ);
      wfGroup.add(fp);
    });
    const glMat = new THREE.LineBasicMaterial({ color: 0xb89a5a, transparent: true, opacity: 0.12 });
    [BL, mX, BR].forEach(x => {
      [BB, mZ, BF].forEach(z => {
        const pts = [new THREE.Vector3(x, GY - 0.2, z), new THREE.Vector3(x, TT + 0.3, z)];
        wfGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), glMat));
      });
    });
    const twEdge = new THREE.EdgesGeometry(new THREE.BoxGeometry(twW + 0.1, twH + 0.1, sD * 0.65));
    const twLine = new THREE.LineSegments(twEdge, wfMat);
    twLine.position.set((TL + TR) / 2, S3 + twH / 2, mZ + 0.15);
    wfGroup.add(twLine);
    bldg.add(wfGroup);

    // Subtle guide lines
    const sgMat = new THREE.LineBasicMaterial({ color: 0xb89a5a, transparent: true, opacity: 0.05 });
    [BL, mX, BR].forEach(x => {
      G.base.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, GY, BB - 0.3), new THREE.Vector3(x, TT + 0.5, BB - 0.3)]),
        sgMat
      ));
    });

    // ══════════════════════════════════════════════════════
    // REALISTIC CONTINUOUSLY MOVING LUXURY CAR
    // ══════════════════════════════════════════════════════

    function createCar() {
      const car = new THREE.Group();

      const carPaint = new THREE.MeshStandardMaterial({
        color: 0x9b1b22, // luxury deep crimson red metallic (matches reference image)
        roughness: 0.22,
        metalness: 0.85,
        envMapIntensity: 1.2,
      });
      const carPaintDark = new THREE.MeshStandardMaterial({
        color: 0x6e1218,
        roughness: 0.28,
        metalness: 0.8,
      });
      const carGlass = new THREE.MeshStandardMaterial({
        color: 0x14202c,
        roughness: 0.04,
        metalness: 0.5,
        transparent: true,
        opacity: 0.68,
        envMapIntensity: 1.6,
      });
      const carTrim = new THREE.MeshStandardMaterial({
        color: 0x161616,
        roughness: 0.35,
        metalness: 0.8,
      });
      const tireMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.88,
        metalness: 0.05,
      });
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.2,
        metalness: 0.92,
      });
      const headLightMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xfff2dd,
        emissiveIntensity: 1.2,
        roughness: 0.1,
      });
      const tailLightMat = new THREE.MeshStandardMaterial({
        color: 0xdd1111,
        emissive: 0xff1111,
        emissiveIntensity: 1.0,
        roughness: 0.2,
      });

      // Car body chassis
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.14, 1.55), carPaint);
      chassis.position.y = 0.15;
      chassis.castShadow = true;
      car.add(chassis);

      // Underbody diffuser / dark trim
      const under = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.05, 1.52), carTrim);
      under.position.y = 0.07;
      car.add(under);

      // Hood / Bonnet (sloped)
      const hood = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.52), carPaint);
      hood.position.set(0, 0.21, 0.46);
      hood.rotation.x = 0.06;
      car.add(hood);

      // Trunk / Boot (sloped)
      const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.09, 0.38), carPaint);
      trunk.position.set(0, 0.23, -0.52);
      trunk.rotation.x = -0.04;
      car.add(trunk);

      // Cabin / Greenhouse
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.19, 0.72), carPaintDark);
      cabin.position.set(0, 0.29, -0.05);
      car.add(cabin);

      // Windshield
      const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.20, 0.02), carGlass);
      windshield.position.set(0, 0.29, 0.30);
      windshield.rotation.x = -0.55;
      car.add(windshield);

      // Rear window
      const rearWin = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.18, 0.02), carGlass);
      rearWin.position.set(0, 0.29, -0.40);
      rearWin.rotation.x = 0.52;
      car.add(rearWin);

      // Side windows
      const sideWinL = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.15, 0.60), carGlass);
      sideWinL.position.set(-0.285, 0.28, -0.05);
      car.add(sideWinL);
      const sideWinR = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.15, 0.60), carGlass);
      sideWinR.position.set(0.285, 0.28, -0.05);
      car.add(sideWinR);

      // Roof panel
      const roof = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.02, 0.56), carPaint);
      roof.position.set(0, 0.39, -0.07);
      car.add(roof);

      // Side mirrors
      const mirGeo = new THREE.BoxGeometry(0.07, 0.04, 0.05);
      const mirL = new THREE.Mesh(mirGeo, carTrim);
      mirL.position.set(-0.34, 0.25, 0.24);
      car.add(mirL);
      const mirR = new THREE.Mesh(mirGeo, carTrim);
      mirR.position.set(0.34, 0.25, 0.24);
      car.add(mirR);

      // Front grille
      const grille = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 0.02), carTrim);
      grille.position.set(0, 0.14, 0.78);
      car.add(grille);

      // Headlights
      const hlGeo = new THREE.BoxGeometry(0.12, 0.04, 0.03);
      const hlL = new THREE.Mesh(hlGeo, headLightMat);
      hlL.position.set(-0.22, 0.17, 0.77);
      car.add(hlL);
      const hlR = new THREE.Mesh(hlGeo, headLightMat);
      hlR.position.set(0.22, 0.17, 0.77);
      car.add(hlR);

      // Headlight soft beam (subtle pointlight)
      const headGlow = new THREE.PointLight(0xfff2dd, 1.2, 3.5);
      headGlow.position.set(0, 0.2, 1.1);
      car.add(headGlow);

      // Taillights
      const tlGeo = new THREE.BoxGeometry(0.18, 0.035, 0.02);
      const tlL = new THREE.Mesh(tlGeo, tailLightMat);
      tlL.position.set(-0.20, 0.20, -0.78);
      car.add(tlL);
      const tlR = new THREE.Mesh(tlGeo, tailLightMat);
      tlR.position.set(0.20, 0.20, -0.78);
      car.add(tlR);

      // 4 Wheels
      const wheelRadius = 0.12;
      const wheelThick = 0.07;
      const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThick, 16);
      wheelGeo.rotateZ(Math.PI / 2);

      const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.65, wheelRadius * 0.65, wheelThick + 0.005, 10);
      rimGeo.rotateZ(Math.PI / 2);

      const wheels = [];
      const wheelPositions = [
        [-0.32, 0.12,  0.46], // Front Left
        [ 0.32, 0.12,  0.46], // Front Right
        [-0.32, 0.12, -0.48], // Rear Left
        [ 0.32, 0.12, -0.48], // Rear Right
      ];

      wheelPositions.forEach(([wx, wy, wz]) => {
        const wGroup = new THREE.Group();
        wGroup.position.set(wx, wy, wz);

        const tire = new THREE.Mesh(wheelGeo, tireMat);
        tire.castShadow = true;
        wGroup.add(tire);

        const rim = new THREE.Mesh(rimGeo, rimMat);
        wGroup.add(rim);

        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, wheelThick + 0.01, 8), carTrim);
        cap.rotateZ(Math.PI / 2);
        wGroup.add(cap);

        car.add(wGroup);
        wheels.push(wGroup);
      });

      return { car, wheels };
    }

    // Closed driving path loop around the outside of the house
    const carPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.5, roadY, 4.3),
      new THREE.Vector3(-1.0, roadY, 4.3),
      new THREE.Vector3( 2.5, roadY, 4.3),
      new THREE.Vector3( 5.2, roadY, 3.8),
      new THREE.Vector3( 5.8, roadY, 1.5),
      new THREE.Vector3( 5.8, roadY, -1.5),
      new THREE.Vector3( 5.2, roadY, -3.8),
      new THREE.Vector3( 2.5, roadY, -4.5),
      new THREE.Vector3(-1.0, roadY, -4.5),
      new THREE.Vector3(-4.5, roadY, -4.5),
      new THREE.Vector3(-5.8, roadY, -3.5),
      new THREE.Vector3(-6.0, roadY, -0.5),
      new THREE.Vector3(-5.8, roadY,  2.5),
    ], true, 'catmullrom', 0.2);

    const carData = createCar();
    scene.add(carData.car);

    // ── Store refs ──
    sr.current = { controls, ren, cam, amb, sun, iLts, wfGroup, scene, bldg, carData, carPath };

    // ── Assembly Animation ──
    const t0 = performance.now();
    const dur = noMo ? 10 : 3200;
    const camDur = noMo ? 10 : 4000;
    let assemblyDone = false;

    if (!noMo) {
      G.base.position.y = -1.8;
      G.cols.position.y = -1.5;
      G.slabs.position.x = -2.5;
      G.walls.position.y = -1.0;
      G.details.position.y = 0.8;
      G.roof.position.y = 3.0;
    } else {
      assemblyDone = true;
    }

    const ease = t => 1 - Math.pow(1 - t, 3);
    const easeIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // ── Mouse parallax ──
    const mT = { x: 0, y: 0 }, mC = { x: 0, y: 0 };
    function onMM(e) {
      if (mobile || pr.current.immersive) return;
      mT.x = (e.clientX / window.innerWidth - 0.5) * 1.0;
      mT.y = -(e.clientY / window.innerHeight - 0.5) * 0.5;
    }
    window.addEventListener("mousemove", onMM);

    let sY = window.scrollY;
    const onSc = () => { sY = window.scrollY; };
    window.addEventListener("scroll", onSc, { passive: true });

    // ── Keyboard (immersive mode) ──
    const keysDown = new Set();
    function onKD(e) {
      if (!pr.current.immersive) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d'].includes(e.key)) {
        e.preventDefault();
        keysDown.add(e.key);
      }
    }
    function onKU(e) { keysDown.delete(e.key); }
    window.addEventListener('keydown', onKD);
    window.addEventListener('keyup', onKU);

    function onRs() {
      if (!el) return;
      cw = el.clientWidth || window.innerWidth;
      ch = el.clientHeight || window.innerHeight;
      cam.aspect = cw / ch; cam.updateProjectionMatrix(); ren.setSize(cw, ch);
    }
    window.addEventListener("resize", onRs);

    // ── Render loop ──
    let fid;
    const projVec = new THREE.Vector3();
    let lastNow = performance.now();
    const carLoopDuration = 26000; // 26 seconds per complete loop (smooth, luxury pace)
    const carPathLength = carPath.getLength();
    const carSpeed = carPathLength / (carLoopDuration / 1000); // units per second
    const wheelRotPerSec = carSpeed / 0.12;

    function frame(now) {
      fid = requestAnimationFrame(frame);
      const dt = Math.min((now - lastNow) / 1000, 0.1);
      lastNow = now;

      const t = now - t0;
      const p = Math.min(t / dur, 1);
      const cp = Math.min(t / camDur, 1);

      // Assembly animation
      if (!noMo && p < 1) {
        G.base.position.y = -1.8 * (1 - ease(Math.min(p / 0.3, 1)));
        G.cols.position.y = -1.5 * (1 - ease(Math.max(0, Math.min((p - 0.1) / 0.35, 1))));
        G.slabs.position.x = -2.5 * (1 - ease(Math.max(0, Math.min((p - 0.25) / 0.3, 1))));
        G.walls.position.y = -1.0 * (1 - ease(Math.max(0, Math.min((p - 0.4) / 0.35, 1))));
        G.details.position.y = 0.8 * (1 - ease(Math.max(0, Math.min((p - 0.55) / 0.3, 1))));
        G.roof.position.y = 3.0 * (1 - ease(Math.max(0, Math.min((p - 0.65) / 0.35, 1))));
        iLts.forEach(l => { l.intensity = ease(Math.max(0, Math.min((p - 0.75) / 0.25, 1))) * 0.65; });
      } else if (!assemblyDone) {
        ["base", "cols", "walls", "details", "roof"].forEach(k => { G[k].position.y = 0; });
        G.slabs.position.x = 0;
        iLts.forEach(l => { l.intensity = 0.65; });
        assemblyDone = true;
      }

      // ── Moving Car Continuous Path Animation ──
      const carProgress = ((now - t0) % carLoopDuration) / carLoopDuration;
      const cPos = carPath.getPointAt(carProgress);
      carData.car.position.copy(cPos);

      // Dynamic orientation tangent
      const cTan = carPath.getTangentAt(carProgress);
      carData.car.rotation.y = Math.atan2(cTan.x, cTan.z);

      // Continuous Wheel Spin
      carData.wheels.forEach(w => {
        w.rotation.x += wheelRotPerSec * dt;
      });

      // ── Camera modes ──
      const isImm = pr.current.immersive;

      if (isImm) {
        // Keyboard orbit
        const rs = 0.025;
        if (keysDown.has('ArrowLeft') || keysDown.has('a')) controls.rotateLeft(rs);
        if (keysDown.has('ArrowRight') || keysDown.has('d')) controls.rotateLeft(-rs);
        if (keysDown.has('ArrowUp') || keysDown.has('w')) controls.rotateUp(rs);
        if (keysDown.has('ArrowDown') || keysDown.has('s')) controls.rotateUp(-rs);

        // Camera preset lerp
        const goal = sr.current.presetGoal;
        if (goal) {
          cam.position.lerp(goal.pos, 0.04);
          controls.target.lerp(goal.tgt, 0.04);
          if (cam.position.distanceTo(goal.pos) < 0.08) {
            sr.current.presetGoal = null;
            if (onPresetDone) onPresetDone();
          }
        }

        controls.update();
      } else {
        // Normal hero mode — camera entrance + parallax + scroll
        if (!noMo && cp < 1) cam.position.lerpVectors(camInit, camEnd, easeIO(cp));

        mC.x += (mT.x - mC.x) * 0.04;
        mC.y += (mT.y - mC.y) * 0.04;

        const sf = Math.min(sY / (window.innerHeight || 800), 1.5);

        if (cp >= 1 || noMo) {
          cam.position.set(camEnd.x + mC.x - sf * 0.4, camEnd.y + mC.y + sf * 0.8, camEnd.z + sf * 2.5);
        }

        bldg.rotation.y += (mC.x * 0.02 - bldg.rotation.y) * 0.05;
        bldg.rotation.x += (mC.y * 0.008 - bldg.rotation.x) * 0.05;

        cam.lookAt(lookAt.x, lookAt.y + sf * 0.12, lookAt.z);
      }

      // ── Callout position projection ──
      if (assemblyDone) {
        CALLOUTS.forEach(c => {
          const cel = coRef.current[c.id];
          if (!cel) return;
          projVec.set(...c.anchor);
          bldg.localToWorld(projVec);
          projVec.project(cam);
          if (projVec.z > 1 || projVec.z < -1) { cel.style.opacity = '0'; return; }
          const sx = (projVec.x * 0.5 + 0.5) * cw;
          const sy = (-projVec.y * 0.5 + 0.5) * ch;
          cel.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
          cel.style.opacity = isImm ? '0' : '1';
        });
      }

      ren.render(scene, cam);
    }
    frame(performance.now());

    // ── Cleanup ──
    cleanupFn = () => {
      cancelAnimationFrame(fid);
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("scroll", onSc);
      window.removeEventListener("resize", onRs);
      window.removeEventListener('keydown', onKD);
      window.removeEventListener('keyup', onKU);
      controls.dispose();
      bldg.traverse(o => {
        o.geometry?.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
      });
      carData.car.traverse(o => {
        o.geometry?.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
      });
      ren.dispose();
      if (el.contains(ren.domElement)) el.removeChild(ren.domElement);
    };

    } catch (err) {
      console.error("[ThreeHeroScene] 3D initialization failed:", err);
    }

    return () => { if (cleanupFn) cleanupFn(); };
  }, []);

  /* ══════════════ RENDER ══════════════ */
  if (!webGlOk) return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <img src="/images/hero/hero-bg.png" alt="" className="w-full h-full object-cover opacity-30" />
    </div>
  );

  return (
    <div ref={mountRef} className="absolute inset-0 overflow-hidden" aria-hidden="true" style={{ pointerEvents: 'none' }}>
      {/* Architectural Callouts — positioned by animation loop */}
      {CALLOUTS.map(c => (
        <div
          key={c.id}
          ref={el => { coRef.current[c.id] = el; }}
          className="absolute top-0 left-0 pointer-events-none z-[6]"
          style={{ opacity: 0, willChange: 'transform', transition: 'opacity 0.6s ease' }}
        >
          <div className={`flex items-start gap-1.5 ${c.id === 'facade' || c.id === 'frame' ? 'flex-row-reverse text-right' : ''}`}>
            <div className="shrink-0 mt-[5px]">
              <div className="w-[5px] h-[5px] rounded-full bg-[#b89a5a]" />
            </div>
            <div className={`shrink-0 mt-[7px] ${c.id === 'facade' || c.id === 'frame' ? 'w-8 sm:w-14' : 'w-8 sm:w-14'} h-px bg-[#b89a5a]/30`} />
            <div className="shrink-0">
              <div className="text-[7px] sm:text-[8px] tracking-[0.25em] uppercase text-[#b89a5a] whitespace-nowrap font-medium">{c.title}</div>
              <div className="text-[7px] sm:text-[8px] text-[#a7a29a]/60 whitespace-nowrap">{c.desc}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ThreeHeroScene;
