import { useEffect, useRef } from "react";
import * as THREE from "three";

/*
  ThreeHeroScene
  ──────────────
  An interactive 3D architectural experience for the Shivakriti Constructions hero section.

  What it renders:
  - A stylized wireframe building model with 4 construction stages:
      Foundation → Structure → Exterior → Completed
  - Each stage is a separate mesh group that fades in as the user scrolls
  - The camera responds to mouse movement (subtle tilt)
  - Ambient particle field gives depth

  Interactions:
  - Mouse move — subtle camera rotation (parallax feel)
  - Scroll     — progresses through construction stages
*/
function ThreeHeroScene() {
  const mountRef = useRef(null);   // The DOM element Three.js renders into
  const sceneRef = useRef({});     // Holds all Three.js objects for cleanup

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── 1. Scene, Camera, Renderer ────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = null;  // Transparent — lets the CSS background show through

    const width  = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4, 3, 8);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);   // Transparent background
    container.appendChild(renderer.domElement);

    // ── 2. Lighting ───────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff8f0, 1.2);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Warm accent light from below — mimics construction site lighting
    const accentLight = new THREE.PointLight(0xb8956a, 0.6, 20);
    accentLight.position.set(-3, -1, 3);
    scene.add(accentLight);

    // ── 3. Materials ─────────────────────────────────────────────────────
    const wireMat    = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.12 });
    const solidMat   = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8, metalness: 0.2 });
    const glassMat   = new THREE.MeshStandardMaterial({ color: 0x88aacc, transparent: true, opacity: 0.25, roughness: 0.1 });
    const accentMat  = new THREE.MeshStandardMaterial({ color: 0xb8956a, roughness: 0.6 });   // warm gold accent

    // ── 4. Building Groups — one per construction stage ────────────────────

    const building = new THREE.Group();
    scene.add(building);

    // Stage 1 — FOUNDATION: a flat slab with grid lines
    const foundationGroup = new THREE.Group();
    const slabGeo  = new THREE.BoxGeometry(4, 0.15, 3);
    const slab     = new THREE.Mesh(slabGeo, solidMat);
    slab.position.y = -1.5;
    foundationGroup.add(slab);

    // Grid on the slab surface
    const gridHelper = new THREE.GridHelper(4, 8, 0x444444, 0x222222);
    gridHelper.position.y = -1.42;
    foundationGroup.add(gridHelper);

    building.add(foundationGroup);

    // Stage 2 — STRUCTURE: vertical columns and horizontal beams
    const structureGroup = new THREE.Group();
    const colGeo = new THREE.BoxGeometry(0.12, 3, 0.12);

    // Four corner columns
    const colPositions = [[-1.8, 0, -1.3], [1.8, 0, -1.3], [-1.8, 0, 1.3], [1.8, 0, 1.3]];
    colPositions.forEach(([x, y, z]) => {
      const col = new THREE.Mesh(colGeo, accentMat);
      col.position.set(x, y, z);
      structureGroup.add(col);
    });

    // Horizontal beams — top
    const beamGeo = new THREE.BoxGeometry(3.72, 0.1, 0.1);
    [-1.3, 1.3].forEach((z) => {
      const beam = new THREE.Mesh(beamGeo, accentMat);
      beam.position.set(0, 1.4, z);
      structureGroup.add(beam);
    });
    const beamGeo2 = new THREE.BoxGeometry(0.1, 0.1, 2.72);
    [-1.8, 1.8].forEach((x) => {
      const beam = new THREE.Mesh(beamGeo2, accentMat);
      beam.position.set(x, 1.4, 0);
      structureGroup.add(beam);
    });

    // Wireframe structural outline
    const structWire = new THREE.Mesh(new THREE.BoxGeometry(3.8, 3.1, 2.8), wireMat);
    structWire.position.y = 0;
    structureGroup.add(structWire);

    building.add(structureGroup);

    // Stage 3 — EXTERIOR: solid walls and floor plates
    const exteriorGroup = new THREE.Group();

    // Four exterior walls (thin boxes)
    const wallConfigs = [
      { s: [3.7, 2.8, 0.08], p: [0, 0, 1.36]  },   // front
      { s: [3.7, 2.8, 0.08], p: [0, 0, -1.36] },   // back
      { s: [0.08, 2.8, 2.72], p: [-1.86, 0, 0] },  // left
      { s: [0.08, 2.8, 2.72], p: [1.86, 0, 0]  },  // right
    ];
    wallConfigs.forEach(({ s, p }) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(...s), solidMat);
      wall.position.set(...p);
      exteriorGroup.add(wall);
    });

    // Window panels (glass material)
    const winGeo = new THREE.PlaneGeometry(0.7, 0.9);
    const windowPositions = [
      [[-0.9, 0.1, 1.37], [0, 0, 0]],
      [[0.9, 0.1, 1.37],  [0, 0, 0]],
    ];
    windowPositions.forEach(([[x, y, z]]) => {
      const win = new THREE.Mesh(winGeo, glassMat);
      win.position.set(x, y, z);
      exteriorGroup.add(win);
    });

    building.add(exteriorGroup);

    // Stage 4 — COMPLETED: roof and finishing details
    const completedGroup = new THREE.Group();

    // Flat roof slab
    const roofGeo = new THREE.BoxGeometry(3.96, 0.12, 2.88);
    const roof    = new THREE.Mesh(roofGeo, solidMat);
    roof.position.y = 1.46;
    completedGroup.add(roof);

    // Rooftop parapet
    const parapetGeo  = new THREE.BoxGeometry(3.96, 0.3, 0.08);
    const parapetGeo2 = new THREE.BoxGeometry(0.08, 0.3, 2.88);
    [[0, 1.61, 1.44], [0, 1.61, -1.44]].forEach(([x, y, z]) => {
      const p = new THREE.Mesh(parapetGeo, solidMat);
      p.position.set(x, y, z);
      completedGroup.add(p);
    });
    [[-1.97, 1.61, 0], [1.97, 1.61, 0]].forEach(([x, y, z]) => {
      const p = new THREE.Mesh(parapetGeo2, solidMat);
      p.position.set(x, y, z);
      completedGroup.add(p);
    });

    building.add(completedGroup);

    // ── 5. Ambient particle field ─────────────────────────────────────────
    const particleCount = 120;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3]     = (Math.random() - 0.5) * 18;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.35 });
    const particles   = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── 6. Stage visibility — controlled by scroll position ───────────────
    const stages = [foundationGroup, structureGroup, exteriorGroup, completedGroup];

    function updateStages(scrollY) {
      // Each stage becomes visible at 25% scroll intervals within the hero height
      const heroHeight  = window.innerHeight;
      const progress    = Math.min(scrollY / heroHeight, 1);  // 0 → 1 as user scrolls through hero

      stages.forEach((group, i) => {
        const threshold = i * 0.25;  // 0%, 25%, 50%, 75% scroll
        group.visible   = progress >= threshold;
      });
    }

    // ── 7. Mouse movement — subtle camera tilt ────────────────────────────
    const mouse = { x: 0, y: 0 };
    const targetRotation = { x: 0, y: 0 };

    function onMouseMove(e) {
      // Normalize to -0.5 → 0.5
      mouse.x = (e.clientX / window.innerWidth)  - 0.5;
      mouse.y = (e.clientY / window.innerHeight) - 0.5;
    }
    window.addEventListener("mousemove", onMouseMove);

    function onScroll() {
      updateStages(window.scrollY);
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    // Show foundation by default
    updateStages(0);

    // ── 8. Handle window resize ────────────────────────────────────────────
    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    // ── 9. Animation loop ─────────────────────────────────────────────────
    let animId;

    function animate() {
      animId = requestAnimationFrame(animate);

      // Smoothly interpolate camera rotation toward mouse position
      targetRotation.y += (mouse.x * 0.4 - targetRotation.y) * 0.05;
      targetRotation.x += (mouse.y * 0.2 - targetRotation.x) * 0.05;

      building.rotation.y = targetRotation.y;
      building.rotation.x = targetRotation.x;

      // Slow continuous rotation for life when mouse is idle
      building.rotation.y += 0.001;

      // Particles drift slowly
      particles.rotation.y += 0.0003;

      renderer.render(scene, camera);
    }

    animate();

    // Store refs for cleanup
    sceneRef.current = { renderer, animId, onMouseMove, onScroll, onResize };

    // ── Cleanup on component unmount ──────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}

export default ThreeHeroScene;
