"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const COLOR_HEX: Record<string, number> = {
  Black: 0x22262e, White: 0xe8ecf2, Grey: 0x8a93a3, Blue: 0x1e90ff, Red: 0xe5484d, Yellow: 0xf5c518,
  Transparent: 0xbfd9ef, "Matte black": 0x1a1d23,
};

/** Orbitable preview of the uploaded part on a build plate. */
export function MeshPreview({ positions, color, bed }: { positions: Float32Array; color: string; bed: { x: number; y: number; z: number } }) {
  const mount = useRef<HTMLDivElement>(null);
  const matRef = useRef<THREE.MeshStandardMaterial | null>(null);

  useEffect(() => {
    const el = mount.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 10000);
    scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x0a1024, 1.4));
    const dir = new THREE.DirectionalLight(0xffffff, 1.8);
    dir.position.set(1, 2, 1.5);
    scene.add(dir);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.computeVertexNormals();
    // STL is Z-up; three is Y-up
    geo.rotateX(-Math.PI / 2);
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    const c = bb.getCenter(new THREE.Vector3());
    geo.translate(-c.x, -bb.min.y, -c.z);
    const size = bb.getSize(new THREE.Vector3());

    const mat = new THREE.MeshStandardMaterial({ color: COLOR_HEX[color] ?? 0x1e90ff, roughness: 0.55, metalness: 0.05, flatShading: positions.length / 9 < 4000 });
    matRef.current = mat;
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // build plate sized to the printer bed, so customers see scale
    const plate = new THREE.GridHelper(Math.max(bed.x, bed.y), 16, 0x1e90ff, 0x1a2647);
    (plate.material as THREE.Material).transparent = true;
    (plate.material as THREE.Material).opacity = 0.6;
    scene.add(plate);
    const box = new THREE.Box3Helper(new THREE.Box3(new THREE.Vector3(-bed.x / 2, 0, -bed.y / 2), new THREE.Vector3(bed.x / 2, bed.z, bed.y / 2)), 0x23365e);
    scene.add(box);

    const radius = Math.max(size.length() / 2, 20);
    camera.position.set(radius * 2.2, radius * 1.6, radius * 2.4);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, size.y / 2, 0);
    controls.enableDamping = true;
    controls.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    controls.autoRotateSpeed = 1.2;
    controls.maxDistance = Math.max(bed.x, bed.y, bed.z) * 3;

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, camera);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [positions, bed.x, bed.y, bed.z]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    matRef.current?.color.setHex(COLOR_HEX[color] ?? 0x1e90ff);
  }, [color]);

  return <div ref={mount} className="h-full w-full cursor-grab active:cursor-grabbing" aria-label="3D preview of your part. Drag to rotate." role="img" />;
}
