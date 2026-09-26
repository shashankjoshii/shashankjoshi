"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { ShaderMaterial, Mesh } from "three";
import { orbVertex, orbFragment, solidVertex } from "./shaders";

export type StageKind = "orb" | "knot";

/** Pointer in -1..1, tracked on the window so a pointer-events:none canvas can still follow it. */
function usePointer() {
  const p = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const move = (e: PointerEvent) => {
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return p;
}

function Orb({ still }: { still: boolean }) {
  const [detail] = useState(() => (window.matchMedia("(pointer: coarse)").matches ? 22 : 48));
  const mesh = useRef<Mesh>(null);
  const mat = useRef<ShaderMaterial>(null);
  const pointer = usePointer();
  const smooth = useRef({ x: 0, y: 0 });
  const uniforms = useMemo(
    () => ({
      uTime: { value: 3 },
      uAmp: { value: 0.24 },
      uPointer: { value: [0, 0] },
      uLight: { value: 0 },
    }),
    [],
  );

  useFrame((_, dt) => {
    if (!mesh.current || !mat.current || still) return;
    const u = mat.current.uniforms;
    const ease = Math.min(1, dt * 2.5);
    smooth.current.x += (pointer.current.x - smooth.current.x) * ease;
    smooth.current.y += (pointer.current.y - smooth.current.y) * ease;
    u.uTime.value += dt;
    u.uPointer.value = [smooth.current.x, smooth.current.y];
    // scroll drives the exit: the orb swells and tilts as the hero leaves
    const k = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
    u.uAmp.value = 0.24 + k * 0.14;
    mesh.current.rotation.y = u.uTime.value * 0.12 + smooth.current.x * 0.5;
    mesh.current.rotation.x = smooth.current.y * -0.35 + k * 0.6;
    mesh.current.position.set(smooth.current.x * 0.18, Math.sin(u.uTime.value * 0.6) * 0.06 + k * 0.5, 0);
    mesh.current.scale.setScalar(1 + k * 0.35);
  });

  return (
    <mesh ref={mesh}>
      {/* detail n = 20·n²·3 vertices, each running the noise three times: 48 is ~138k on desktop,
          touch devices get 22 (~29k) so building it doesn't freeze a mid-range phone */}
      <icosahedronGeometry args={[1, detail]} />
      <shaderMaterial ref={mat} vertexShader={orbVertex} fragmentShader={orbFragment} uniforms={uniforms} />
    </mesh>
  );
}

function Knot({ still }: { still: boolean }) {
  const mesh = useRef<Mesh>(null);
  const mat = useRef<ShaderMaterial>(null);
  const pointer = usePointer();
  const smooth = useRef({ x: 0, y: 0 });
  const uniforms = useMemo(() => ({ uTime: { value: 2 }, uLight: { value: 1 } }), []);

  useFrame((_, dt) => {
    if (!mesh.current || !mat.current || still) return;
    const ease = Math.min(1, dt * 2);
    smooth.current.x += (pointer.current.x - smooth.current.x) * ease;
    smooth.current.y += (pointer.current.y - smooth.current.y) * ease;
    mat.current.uniforms.uTime.value += dt;
    const t = mat.current.uniforms.uTime.value;
    mesh.current.rotation.set(t * 0.18 + smooth.current.y * -0.5, t * 0.24 + smooth.current.x * 0.7, t * 0.06);
  });

  return (
    <mesh ref={mesh} rotation={[0.4, 0.6, 0]}>
      <torusKnotGeometry args={[0.72, 0.26, 200, 32, 2, 3]} />
      <shaderMaterial ref={mat} vertexShader={solidVertex} fragmentShader={orbFragment} uniforms={uniforms} />
    </mesh>
  );
}

/**
 * One small R3F canvas. It only renders while it is on screen, and renders a single frame when
 * motion is reduced. Everything is transparent, so the page shows through around the object.
 */
export default function Stage({ kind, still }: { kind: StageKind; still: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={host} className="h-full w-full">
      <Canvas
        dpr={[1, 1.75]}
        frameloop={still ? "demand" : visible ? "always" : "never"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, kind === "orb" ? 3.6 : 3.9], fov: 40 }}
        style={{ background: "transparent" }}
      >
        {kind === "orb" ? <Orb still={still} /> : <Knot still={still} />}
      </Canvas>
    </div>
  );
}
