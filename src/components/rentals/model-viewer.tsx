"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * A rotatable, zoomable 3D model floating on the page (no frame). It only
 * downloads once it's near the viewport, only renders while on screen, and
 * turns slowly by itself. Drag to look around; pinch or Ctrl/Cmd + wheel
 * zooms. A plain mouse wheel and vertical swipes still scroll the
 * page, so the model never traps you.
 */
export type MaterialTint = { color: string; metalness?: number; roughness?: number };

export function ModelViewer({
  src,
  label,
  className,
  tone = "dark",
  tint,
}: {
  src: string;
  label: string;
  className?: string;
  tone?: "dark" | "light";
  /** Recolour materials by name, e.g. to match the real product's finish. */
  tint?: Record<string, MaterialTint>;
}) {
  const host = useRef<HTMLDivElement>(null);
  const zoomBy = useRef<(factor: number) => void>(() => {});
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let started = false;
    let visible = false;
    let raf = 0;
    let teardown: (() => void) | undefined;

    const start = () => {
      started = true;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.domElement.style.display = "block";
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(3, 5, 4);
      const rim = new THREE.DirectionalLight(0x67d4ff, 1.2);
      rim.position.set(-4, 3, -4);
      scene.add(key, rim, new THREE.HemisphereLight(0xffffff, 0x0a1024, 0.6));

      const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = true; // pinch on touch screens
      controls.zoomSpeed = 0.8;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.autoRotate = !reduce;
      controls.autoRotateSpeed = 1.4;
      controls.minPolarAngle = Math.PI * 0.2;
      controls.maxPolarAngle = Math.PI * 0.55;
      // let vertical swipes scroll the page on touch screens
      renderer.domElement.style.touchAction = "pan-y";
      // a plain wheel scrolls the page; only Ctrl/Cmd + wheel (and trackpad pinch) zooms
      const orbitWheel = (controls as unknown as { _onMouseWheel: EventListener })._onMouseWheel;
      renderer.domElement.removeEventListener("wheel", orbitWheel);
      const zoom = (factor: number) => {
        const offset = camera.position.clone().sub(controls.target);
        const next = THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance);
        camera.position.copy(controls.target).add(offset.setLength(next));
        controls.update();
      };
      zoomBy.current = zoom;
      const onWheel = (e: WheelEvent) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        e.stopPropagation();
        zoom(Math.exp(e.deltaY * 0.004));
      };
      renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

      const size = () => {
        const { width, height } = el.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(el);

      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      let model: THREE.Object3D | undefined;
      loader.load(
        src,
        (gltf) => {
          if (disposed) return;
          model = gltf.scene;
          if (tint) {
            model.traverse((o) => {
              const mats = (o as THREE.Mesh).material;
              (Array.isArray(mats) ? mats : mats ? [mats] : []).forEach((mat) => {
                const t = tint[mat.name];
                if (!t || !(mat instanceof THREE.MeshStandardMaterial)) return;
                mat.color.set(t.color);
                if (t.metalness !== undefined) mat.metalness = t.metalness;
                if (t.roughness !== undefined) mat.roughness = t.roughness;
              });
            });
          }
          // centre the model on the floor and frame it
          const box = new THREE.Box3().setFromObject(model);
          const dims = box.getSize(new THREE.Vector3());
          const centre = box.getCenter(new THREE.Vector3());
          const s = 2 / Math.max(dims.x, dims.y, dims.z);
          model.scale.setScalar(s);
          model.position.set(-centre.x * s, -centre.y * s, -centre.z * s);
          scene.add(model);
          const radius = Math.sqrt(dims.x ** 2 + dims.y ** 2 + dims.z ** 2) * s * 0.5;
          // fit the whole bounding sphere (so nothing is cut off at any angle),
          // using the narrower of the vertical and horizontal field of view
          const vFov = THREE.MathUtils.degToRad(camera.fov / 2);
          const hFov = Math.atan(Math.tan(vFov) * camera.aspect);
          const dist = (radius / Math.sin(Math.min(vFov, hFov))) * 1.08;
          camera.position.set(dist * 0.62, dist * 0.32, dist * 0.72);
          controls.minDistance = dist * 0.4;
          controls.maxDistance = dist * 2.2;
          controls.target.set(0, 0, 0);
          controls.update();
          setReady(true);
        },
        (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
        () => !disposed && setFailed(true),
      );

      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible) return;
        controls.update();
        renderer.render(scene, camera);
      };
      tick();

      teardown = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        renderer.domElement.removeEventListener("wheel", onWheel);
        controls.dispose();
        model?.traverse((o) => {
          const m = o as THREE.Mesh;
          m.geometry?.dispose();
          const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
          mats.forEach((mat) => {
            Object.values(mat).forEach((v) => v instanceof THREE.Texture && v.dispose());
            mat.dispose();
          });
        });
        envTex.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    // load when close, render only while visible
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !started) start();
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);

    return () => {
      disposed = true;
      io.disconnect();
      teardown?.();
    };
  }, [src, tint]);

  const muted = tone === "light" ? "text-[#050816]/45" : "text-white/45";

  return (
    <div className={className}>
      <div ref={host} role="img" aria-label={`3D model of the ${label}. Drag to rotate, pinch to zoom.`} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
      {!ready && !failed && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-3">
            <span className={clsx("size-8 animate-spin rounded-full border-2 border-t-[#1E90FF]", tone === "light" ? "border-[#050816]/10" : "border-white/15")} />
            <span className={clsx("font-mono text-[0.7rem] uppercase tracking-[0.1em]", muted)}>Loading model {progress ? `${progress}%` : ""}</span>
          </div>
        </div>
      )}
      {failed && (
        <p className={clsx("absolute inset-0 grid place-items-center font-mono text-xs uppercase tracking-[0.1em]", muted)}>Model unavailable</p>
      )}
    </div>
  );
}
