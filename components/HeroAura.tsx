"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import { onReady } from "@/lib/ready";

const vertex = /* glsl */ `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Domain-warped fbm haze, ink to a dark gold.
const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse; // -1..1, drifts the field a few percent

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - vec2(0.78, 0.5) - uMouse * 0.025) * vec2(uRes.x / uRes.y, 1.0);

    vec2 q = vec2(fbm(p * 2.2 + uTime * 0.03), fbm(p * 2.2 + 5.2 - uTime * 0.025));
    float f = fbm(p * 2.0 + 3.0 * q);

    float falloff = smoothstep(0.85, 0.05, length(p));
    float haze = f * falloff;

    vec3 ink = vec3(0.043, 0.039, 0.035);
    vec3 goldLo = vec3(0.431, 0.353, 0.204);
    vec3 col = mix(ink, goldLo, haze * 1.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function HeroAura() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = wrap.current;
    if (!host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 1) * 0.75, alpha: false });
    } catch {
      return; // no WebGL: the CSS background carries the hero
    }
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.cssText = `width:100%;height:100%;display:block;opacity:0;transition:${reduced ? "none" : "opacity 1.6s ease"}`;
    host.appendChild(canvas);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: { uTime: { value: 0 }, uRes: { value: [1, 1] }, uMouse: { value: [0, 0] } },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      renderer.setSize(host.clientWidth, host.clientHeight);
      program.uniforms.uRes.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
      if (reduced) renderer.render({ scene: mesh });
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // Pointer drift: eased toward the target inside the existing frame loop (no extra rAF, no state).
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const target = [0, 0];
    const onMove = (e: PointerEvent) => {
      target[0] = (e.clientX / window.innerWidth) * 2 - 1;
      target[1] = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    if (fine && !reduced) window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let visible = true;
    const t0 = performance.now();
    const frame = (now: number) => {
      program.uniforms.uTime.value = (now - t0) / 1000;
      const m = program.uniforms.uMouse.value as number[];
      m[0] += (target[0] - m[0]) * 0.04;
      m[1] += (target[1] - m[1]) * 0.04;
      renderer.render({ scene: mesh });
      raf = visible ? requestAnimationFrame(frame) : 0;
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !reduced && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(host);

    const off = onReady(() => {
      canvas.style.opacity = "1";
    });

    if (reduced) {
      program.uniforms.uTime.value = 4;
      renderer.render({ scene: mesh });
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      off();
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div ref={wrap} aria-hidden className="pointer-events-none absolute inset-0 -z-10" />;
}
