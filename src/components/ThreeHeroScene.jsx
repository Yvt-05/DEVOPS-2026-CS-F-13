import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/*
  ThreeHeroScene — Shivakriti Constructions
  ──────────────────────────────────────────
  A real Three.js WebGL architectural hero experience featuring:
  - Genuine 3D architectural geometry: multi-level cantilevered building,
    structural columns, floor slabs, recessed glass curtain walls, balconies,
    wood soffits, roof canopy, and rhythmic rooftop pergola.
  - Physical material differentiation (textured concrete, dark architectural metal,
    tinted glass, warm wood, and brushed architectural gold trim).
  - Multi-source architectural lighting (key sunlight casting soft shadows,
    cool sky fill, interior evening illumination, and upward cantilever accent).
  - Integrated 3D structural wireframe edges & CAD guide lines.
  - Cinematic 1.6-second building assembly sequence on mount.
  - Smooth cursor-based parallax (1–2.5° subtle camera orbit, disabled on mobile).
  - Page scroll interaction pulling the camera back as the user explores downward.
  - WebGL capability check with graceful fallback.
*/

function ThreeHeroScene() {
  const mountRef = useRef(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── 0. WebGL Support Verification ──────────────────────────────────────────
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const isMobile = "ontouchstart" in window || window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── 1. Scene, Camera, Renderer ────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = null;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Cinematic perspective camera at a high-angle architectural composition
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    const initialCamPos = { x: 5.6, y: 3.4, z: 8.8 };
    camera.position.set(initialCamPos.x, initialCamPos.y, initialCamPos.z);

    const lookTarget = new THREE.Vector3(0.5, 0.2, 0);
    camera.lookAt(lookTarget);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // ── 2. Architectural Lighting Design ───────────────────────────────────────
    // Soft ambient fill
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 0.55);
    scene.add(ambientLight);

    // Key Sun — directional light casting soft shadows across the cantilevers
    const keySun = new THREE.DirectionalLight(0xfffaec, 2.2);
    keySun.position.set(9, 14, 10);
    if (!isMobile) {
      keySun.castShadow = true;
      keySun.shadow.mapSize.width = 1024;
      keySun.shadow.mapSize.height = 1024;
      keySun.shadow.camera.near = 1;
      keySun.shadow.camera.far = 30;
      keySun.shadow.camera.left = -6;
      keySun.shadow.camera.right = 6;
      keySun.shadow.camera.top = 6;
      keySun.shadow.camera.bottom = -6;
      keySun.shadow.bias = -0.0005;
    }
    scene.add(keySun);

    // Cool architectural sky fill from opposite angle
    const skyFill = new THREE.DirectionalLight(0x7090b5, 0.65);
    skyFill.position.set(-8, 7, -6);
    scene.add(skyFill);

    // Warm interior illumination glowing through glass
    const interiorLight = new THREE.PointLight(0xffc27a, 1.4, 10);
    interiorLight.position.set(0.6, 0.4, 0.2);
    scene.add(interiorLight);

    // Upward architectural accent grazing the cantilever underside
    const groundAccent = new THREE.PointLight(0xb8956a, 0.7, 12);
    groundAccent.position.set(-1.8, -1.2, 2.2);
    scene.add(groundAccent);

    // ── 3. Architectural Materials Palette ─────────────────────────────────────
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x1f1f1f,
      roughness: 0.88,
      metalness: 0.08,
    });

    const shearWallMat = new THREE.MeshStandardMaterial({
      color: 0x272727,
      roughness: 0.82,
      metalness: 0.12,
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x121212,
      roughness: 0.35,
      metalness: 0.85,
    });

    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xb89a5a,
      roughness: 0.32,
      metalness: 0.75,
    });

    const warmWoodMat = new THREE.MeshStandardMaterial({
      color: 0x3d2d1f,
      roughness: 0.72,
      metalness: 0.05,
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x5a7590,
      roughness: 0.08,
      metalness: 0.25,
      transparent: true,
      opacity: 0.48,
    });

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0f141b,
      roughness: 0.15,
      metalness: 0.9,
    });

    const wireMat = new THREE.LineBasicMaterial({
      color: 0xb89a5a,
      transparent: true,
      opacity: 0.35,
    });

    const whiteWireMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.16,
    });

    // Helper to generate edge wireframe overlay
    function createWireEdges(geometry, material) {
      const edges = new THREE.EdgesGeometry(geometry);
      return new THREE.LineSegments(edges, material);
    }

    // ── 4. Master Architectural Model Hierarchy ────────────────────────────────
    const buildingRoot = new THREE.Group();
    // Offset building slightly to the right to frame the left editorial typography
    buildingRoot.position.set(0.65, -0.2, 0);
    scene.add(buildingRoot);

    // Disassembly / Assembly Stage Groups
    const groupFoundation = new THREE.Group();
    const groupGroundCore = new THREE.Group();
    const groupCantilever = new THREE.Group();
    const groupRoofPergola = new THREE.Group();

    buildingRoot.add(groupFoundation);
    buildingRoot.add(groupGroundCore);
    buildingRoot.add(groupCantilever);
    buildingRoot.add(groupRoofPergola);

    // ── A. FOUNDATION PODIUM & SITE CONTEXT ────────────────────────────────────
    // Main foundation podium slab
    const podiumGeo = new THREE.BoxGeometry(8.8, 0.28, 6.8);
    const podium = new THREE.Mesh(podiumGeo, concreteMat);
    podium.position.y = -1.5;
    podium.receiveShadow = true;
    groupFoundation.add(podium);
    groupFoundation.add(createWireEdges(podiumGeo, whiteWireMat));

    // Stepped entry terrace
    const plinthGeo = new THREE.BoxGeometry(4.8, 0.16, 2.6);
    const plinth = new THREE.Mesh(plinthGeo, concreteMat);
    plinth.position.set(-1.2, -1.3, 1.8);
    plinth.receiveShadow = true;
    groupFoundation.add(plinth);

    // Architectural reflecting water basin
    const basinGeo = new THREE.BoxGeometry(3.2, 0.06, 2.2);
    const basin = new THREE.Mesh(basinGeo, waterMat);
    basin.position.set(2.0, -1.33, 1.8);
    groupFoundation.add(basin);

    // Site blueprint grid
    const siteGrid = new THREE.GridHelper(10, 14, 0xb89a5a, 0x222222);
    siteGrid.position.y = -1.35;
    groupFoundation.add(siteGrid);

    // ── B. GROUND LEVEL (COLUMNS, CORE, & GLASS LOBBY) ─────────────────────────
    // Central concrete core
    const coreGeo = new THREE.BoxGeometry(2.0, 2.6, 2.0);
    const core = new THREE.Mesh(coreGeo, shearWallMat);
    core.position.set(-0.6, 0.0, -0.6);
    core.castShadow = true;
    core.receiveShadow = true;
    groupGroundCore.add(core);

    // Structural columns (slender dark metal pilotis)
    const colGeo = new THREE.BoxGeometry(0.12, 2.6, 0.12);
    const colPositions = [
      [-2.4, 0.0, -2.0],
      [1.8, 0.0, -2.0],
      [-2.4, 0.0, 1.6],
      [1.8, 0.0, 1.6],
      [3.2, 0.0, -0.4],
      [3.2, 0.0, 1.6],
    ];
    colPositions.forEach(([x, y, z]) => {
      const col = new THREE.Mesh(colGeo, darkMetalMat);
      col.position.set(x, y, z);
      col.castShadow = true;
      groupGroundCore.add(col);

      // CAD vertical axis guideline extending upward
      const guideGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, -1.3, z),
        new THREE.Vector3(x, 3.2, z),
      ]);
      const guideLine = new THREE.Line(guideGeo, wireMat);
      groupGroundCore.add(guideLine);
    });

    // Ground floor panoramic recessed glass
    const lobbyGlassGeo = new THREE.BoxGeometry(4.2, 2.4, 3.4);
    const lobbyGlass = new THREE.Mesh(lobbyGlassGeo, glassMat);
    lobbyGlass.position.set(0.4, 0.0, 0.0);
    groupGroundCore.add(lobbyGlass);
    groupGroundCore.add(createWireEdges(lobbyGlassGeo, whiteWireMat));

    // Intermediate floor slab
    const midSlabGeo = new THREE.BoxGeometry(7.2, 0.2, 5.6);
    const midSlab = new THREE.Mesh(midSlabGeo, concreteMat);
    midSlab.position.set(0.2, 1.3, 0.0);
    midSlab.castShadow = true;
    midSlab.receiveShadow = true;
    groupGroundCore.add(midSlab);

    // ── C. SECOND LEVEL (CANTILEVERED VILLA & BALCONIES) ───────────────────────
    // Primary cantilevered pavilion volume extending toward the viewer
    const cantGeo = new THREE.BoxGeometry(5.6, 2.0, 4.2);
    const cantilever = new THREE.Mesh(cantGeo, concreteMat);
    cantilever.position.set(-0.2, 2.3, 0.4);
    cantilever.castShadow = true;
    cantilever.receiveShadow = true;
    groupCantilever.add(cantilever);
    groupCantilever.add(createWireEdges(cantGeo, wireMat));

    // Warm architectural wood soffit underneath cantilever overhang
    const soffitGeo = new THREE.BoxGeometry(5.4, 0.05, 4.0);
    const soffit = new THREE.Mesh(soffitGeo, warmWoodMat);
    soffit.position.set(-0.2, 1.28, 0.4);
    groupCantilever.add(soffit);

    // Recessed panoramic upper glass facade
    const upperGlassGeo = new THREE.BoxGeometry(3.6, 1.8, 0.08);
    const upperGlass = new THREE.Mesh(upperGlassGeo, glassMat);
    upperGlass.position.set(-0.2, 2.3, 2.52);
    groupCantilever.add(upperGlass);

    // Horizontal architectural sunscreen louvers (brise-soleil)
    const louverGeo = new THREE.BoxGeometry(3.8, 0.04, 0.16);
    for (let i = 0; i < 4; i++) {
      const louver = new THREE.Mesh(louverGeo, darkMetalMat);
      louver.position.set(-0.2, 1.7 + i * 0.4, 2.6);
      louver.castShadow = true;
      groupCantilever.add(louver);
    }

    // Floating cantilevered balcony terrace
    const balcSlabGeo = new THREE.BoxGeometry(3.8, 0.12, 1.4);
    const balcSlab = new THREE.Mesh(balcSlabGeo, concreteMat);
    balcSlab.position.set(-0.2, 1.35, 3.2);
    balcSlab.castShadow = true;
    groupCantilever.add(balcSlab);

    // Balcony glass railing
    const balcGlassGeo = new THREE.BoxGeometry(3.7, 0.65, 0.04);
    const balcGlass = new THREE.Mesh(balcGlassGeo, glassMat);
    balcGlass.position.set(-0.2, 1.74, 3.86);
    groupCantilever.add(balcGlass);

    // Brushed gold architectural trim along balcony edge
    const balcTrimGeo = new THREE.BoxGeometry(3.8, 0.04, 0.05);
    const balcTrim = new THREE.Mesh(balcTrimGeo, goldAccentMat);
    balcTrim.position.set(-0.2, 2.08, 3.86);
    groupCantilever.add(balcTrim);

    // ── D. PENTHOUSE ROOF CANOPY & PERGOLA ──────────────────────────────────────
    // Thin floating modern roof slab
    const roofGeo = new THREE.BoxGeometry(6.6, 0.16, 5.0);
    const roof = new THREE.Mesh(roofGeo, concreteMat);
    roof.position.set(-0.1, 3.38, 0.3);
    roof.castShadow = true;
    roof.receiveShadow = true;
    groupRoofPergola.add(roof);

    // Signature architectural gold roof fascia line
    const fasciaGeo = new THREE.BoxGeometry(6.68, 0.06, 5.08);
    const fascia = new THREE.Mesh(fasciaGeo, goldAccentMat);
    fascia.position.set(-0.1, 3.44, 0.3);
    groupRoofPergola.add(fascia);

    // Rooftop pergola structural frame with repeating open slats
    const slatGeo = new THREE.BoxGeometry(0.06, 0.12, 3.6);
    for (let s = 0; s < 7; s++) {
      const slat = new THREE.Mesh(slatGeo, darkMetalMat);
      slat.position.set(-1.8 + s * 0.6, 3.65, 0.3);
      slat.castShadow = true;
      groupRoofPergola.add(slat);
    }

    // ── 5. Cinematic Entrance Assembly Animation ───────────────────────────────
    let startTime = performance.now();
    const assemblyDuration = prefersReducedMotion ? 0.01 : 1600; // ms

    if (!prefersReducedMotion) {
      // Set initial displaced states for the assembly
      groupFoundation.position.y = -0.8;
      groupGroundCore.scale.set(1, 0.01, 1);
      groupCantilever.position.x = -1.2;
      groupCantilever.position.y = 0.5;
      groupRoofPergola.position.y = 1.2;
    }

    function cubicEaseOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    // ── 6. Mouse Interaction & Camera Parallax ─────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const targetCamOffset = { x: 0, y: 0 };

    function onMouseMove(e) {
      if (isMobile) return;
      // Normalized coordinates: -0.5 to 0.5
      mouse.x = (e.clientX / window.innerWidth) - 0.5;
      mouse.y = (e.clientY / window.innerHeight) - 0.5;
      targetCamOffset.x = mouse.x * 1.8;
      targetCamOffset.y = -mouse.y * 1.0;
    }
    window.addEventListener("mousemove", onMouseMove);

    // ── 7. Scroll Interaction ─────────────────────────────────────────────────
    let scrollY = window.scrollY;
    function onScroll() {
      scrollY = window.scrollY;
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── 8. Window Resize Handler ──────────────────────────────────────────────
    function onResize() {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    // ── 9. Main Render Loop ───────────────────────────────────────────────────
    let animId;

    function animate(currentTime) {
      animId = requestAnimationFrame(animate);

      // Handle assembly sequence over time
      const elapsed = currentTime - startTime;
      const p = Math.min(elapsed / assemblyDuration, 1);

      if (!prefersReducedMotion && p < 1) {
        // Phase 1: Foundation settles
        const p1 = cubicEaseOut(Math.min(p / 0.45, 1));
        groupFoundation.position.y = -0.8 + 0.8 * p1;

        // Phase 2: Ground columns & core extrude
        const p2 = cubicEaseOut(Math.max(0, Math.min((p - 0.25) / 0.45, 1)));
        groupGroundCore.scale.y = 0.01 + 0.99 * p2;

        // Phase 3: Cantilever slides in
        const p3 = cubicEaseOut(Math.max(0, Math.min((p - 0.45) / 0.45, 1)));
        groupCantilever.position.x = -1.2 + 1.2 * p3;
        groupCantilever.position.y = 0.5 - 0.5 * p3;

        // Phase 4: Roof locks in place
        const p4 = cubicEaseOut(Math.max(0, Math.min((p - 0.65) / 0.35, 1)));
        groupRoofPergola.position.y = 1.2 - 1.2 * p4;
      } else {
        groupFoundation.position.y = 0;
        groupGroundCore.scale.y = 1;
        groupCantilever.position.x = 0;
        groupCantilever.position.y = 0;
        groupRoofPergola.position.y = 0;
      }

      // Smooth camera interpolation towards target parallax
      const scrollFactor = Math.min(scrollY / (window.innerHeight || 800), 1.2);
      const targetX = initialCamPos.x + targetCamOffset.x - scrollFactor * 0.8;
      const targetY = initialCamPos.y + targetCamOffset.y + scrollFactor * 1.5;
      const targetZ = initialCamPos.z + scrollFactor * 2.8;

      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY - camera.position.y) * 0.04;
      camera.position.z += (targetZ - camera.position.z) * 0.04;

      // Subtle counter-rotation on building for dimensional parallax
      const rotY = (mouse.x * 0.05) + (scrollFactor * 0.08);
      const rotX = -mouse.y * 0.025;
      buildingRoot.rotation.y += (rotY - buildingRoot.rotation.y) * 0.04;
      buildingRoot.rotation.x += (rotX - buildingRoot.rotation.x) * 0.04;

      camera.lookAt(lookTarget.x, lookTarget.y + scrollFactor * 0.3, lookTarget.z);

      renderer.render(scene, camera);
    }

    animate(performance.now());

    // ── 10. Complete Resource Disposal ────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);

      // Recursive disposal of meshes, geometries, and materials
      buildingRoot.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // WebGL Graceful Fallback
  if (!webGlSupported) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <img
          src="/images/hero/hero-bg.png"
          alt=""
          className="w-full h-full object-cover opacity-35"
        />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    />
  );
}

export default ThreeHeroScene;
