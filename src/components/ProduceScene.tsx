import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { PRODUCE_MODELS } from '@/lib/produce';
import { cn } from '@/lib/utils';

/**
 * Photo-scanned produce floating in 3D (NVIDIA SimReady Assets, CC BY 4.0).
 *
 * Loaded lazily by the landing page. Rendering pauses while the scene is off
 * screen or the tab is hidden, and reduced motion users get one still frame.
 */

interface Placement {
  slug: string;
  /** Longest side in scene units. Sizes are relative, not to scale. */
  size: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

const LAYOUT: Placement[] = [
  { slug: 'brinjal', size: 1.85, position: [-0.95, 0.5, -0.7], rotation: [0.3, 0.4, 0.9] },
  { slug: 'tomato', size: 0.95, position: [0.2, -0.3, 0.7], rotation: [0.4, 0.2, 0.1] },
  { slug: 'onion', size: 1.05, position: [1.05, 0.7, -0.3], rotation: [0.2, -0.5, -0.3] },
  { slug: 'capsicum', size: 1.0, position: [-1.0, -0.75, 0.15], rotation: [0.5, 0.8, 0.2] },
  { slug: 'potato', size: 0.95, position: [1.1, -0.65, -0.1], rotation: [1.0, 0.3, 0.6] },
  { slug: 'mango', size: 1.1, position: [0.05, 0.95, -1.0], rotation: [0.2, 1.4, -0.4] },
];

interface Item {
  object: THREE.Object3D;
  base: THREE.Vector3;
  phase: number;
  spin: number;
}

export default function ProduceScene({ className, onReady }: { className?: string; onReady?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      return; // No WebGL: the static poster underneath stays visible.
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    scene.environmentIntensity = 0.85;

    const sun = new THREE.DirectionalLight(0xfff1dc, 1.6);
    sun.position.set(-3, 4, 5);
    scene.add(sun);
    scene.add(new THREE.HemisphereLight(0xfff8ec, 0xc9dccb, 0.5));

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    const cluster = new THREE.Group();
    scene.add(cluster);

    const items: Item[] = [];
    let disposed = false;
    let frame = 0;
    let visible = true;
    const pointer = { x: 0, y: 0 };
    let lastTime = performance.now();
    let elapsed = 0;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // Keep the whole cluster in view on narrow, tall screens.
      const radius = 1.65;
      const fit = radius / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      camera.position.set(0, 0, Math.max(7, fit / Math.min(camera.aspect, 1)));
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      // Lift the produce on phones, where a card sits over the lower half.
      cluster.position.y = width < 640 ? 0.55 : 0;
    };

    const render = () => renderer.render(scene, camera);

    const tick = () => {
      frame = 0;
      if (disposed || !visible) return;
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += delta;
      const t = elapsed;
      for (const item of items) {
        item.object.position.y = item.base.y + Math.sin(t * 0.7 + item.phase) * 0.07;
        item.object.rotation.y += item.spin * delta;
        item.object.rotation.x += Math.sin(t * 0.4 + item.phase) * 0.0015;
      }
      // Lean toward the pointer, and turn a little as the hero scrolls away.
      const scrollTurn = Math.min(window.scrollY / 900, 1) * 0.35;
      cluster.rotation.y += (pointer.x * 0.3 + scrollTurn - cluster.rotation.y) * 0.05;
      cluster.rotation.x += (pointer.y * 0.18 - cluster.rotation.x) * 0.05;
      render();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame || disposed || !visible || reducedMotion || !items.length) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      pointer.y = THREE.MathUtils.clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reducedMotion || !frame) render();
    });
    resizeObserver.observe(container);

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && document.visibilityState === 'visible';
      if (visible) start();
    });
    visibility.observe(container);

    const onVisibilityChange = () => {
      visible = document.visibilityState === 'visible';
      if (visible) start();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    if (!reducedMotion) window.addEventListener('pointermove', onPointerMove, { passive: true });

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const models = new Map(PRODUCE_MODELS.map((model) => [model.slug, model.url]));

    Promise.allSettled(
      LAYOUT.map(async (placement, index) => {
        const url = models.get(placement.slug);
        if (!url) return;
        const gltf = await loader.loadAsync(url);
        if (disposed) return;
        const object = gltf.scene;
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        object.scale.setScalar(placement.size / Math.max(size.x, size.y, size.z));
        const pivot = new THREE.Group();
        pivot.add(object);
        object.position.sub(box.getCenter(new THREE.Vector3()).multiplyScalar(object.scale.x));
        pivot.position.set(...placement.position);
        pivot.rotation.set(...placement.rotation);
        cluster.add(pivot);
        items.push({ object: pivot, base: pivot.position.clone(), phase: index * 1.3, spin: index % 2 ? 0.12 : -0.09 });
      }),
    ).then(() => {
      if (disposed || !items.length) return;
      resize();
      render();
      setReady(true);
      onReadyRef.current?.();
      start();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pointermove', onPointerMove);
      scene.traverse((node) => {
        const mesh = node as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const material of materials) {
          for (const value of Object.values(material)) {
            if (value instanceof THREE.Texture) value.dispose();
          }
          material.dispose();
        }
      });
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('transition-opacity duration-700 ease-out', ready ? 'opacity-100' : 'opacity-0', className)}
    />
  );
}
