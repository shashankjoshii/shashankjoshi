"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { onReady } from "@/lib/ready";
import { canRunShader, isCoarsePointer } from "@/lib/capability";

const vertex = /* glsl */ `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// "Light Table": refracted caustics on a white surface, the pale pattern light makes through
// moving water or thick glass. An iterated sin-warp (Hoskins-style), no textures. It only ever
// darkens white toward a pale blue, and never below ~#F0F5FF, so text contrast is untouched.
const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uShear;
  uniform vec2 uRes;

  #define TAU 6.28318530718
  #define ITER 5

  float caustic(vec2 uv, float t) {
    vec2 p = mod(uv * TAU, TAU) - 250.0;
    vec2 i = p;
    float c = 1.0;
    float inten = 0.005;
    for (int n = 0; n < ITER; n++) {
      float tt = t * (1.0 - (3.5 / float(n + 1)));
      i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
      c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
    }
    c /= float(ITER);
    c = 1.17 - pow(c, 1.4);
    return pow(abs(c), 8.0);
  }

  void main() {
    vec2 uv = vUv * vec2(uRes.x / uRes.y, 1.0) * 0.55;
    // fast scrolling shears the glass sideways
    uv.x += uv.y * uShear;
    float c = clamp(caustic(uv, uTime), 0.0, 1.0);
    // fade toward the right so the type on the left stays on quieter ground
    float side = mix(0.55, 1.0, smoothstep(0.1, 0.9, vUv.x));
    vec3 col = vec3(1.0) - c * uIntensity * side * vec3(0.06, 0.04, 0.0);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * One fixed canvas behind the whole page. Intensity is choreographed by scroll (full in the hero,
 * gone through the work, back at Contact) and the render loop idles at zero. Reduced motion or an
 * under-powered device gets a single still frame or a CSS gradient, pinned to the hero only.
 */
export function LightField() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const capable = canRunShader();
    let disposed = false;
    let cleanup = () => {};

    // static presentation: absolutely placed over the first screen, not following the scroll
    const stillMode = () => {
      el.style.position = "absolute";
      el.style.height = "100svh";
    };

    const start = async () => {
      if (!capable) {
        stillMode();
        el.style.background =
          "radial-gradient(60% 55% at 72% 42%, #eef2ff 0%, rgba(255,255,255,0) 100%)";
        return;
      }
      if (reduced) stillMode();

      const { Renderer, Program, Mesh, Triangle } = await import("ogl");
      if (disposed) return;

      const renderer = new Renderer({ dpr: 0.5, alpha: false });
      const gl = renderer.gl;
      const canvas = gl.canvas as HTMLCanvasElement;
      canvas.style.cssText = `width:100%;height:100%;display:block;opacity:0;transition:${reduced ? "none" : "opacity 1.4s ease"}`;
      el.appendChild(canvas);

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uTime: { value: 4 },
          uIntensity: { value: 1 },
          uShear: { value: 0 },
          uRes: { value: [1, 1] },
        },
      });
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

      const resize = () => {
        renderer.setSize(el.clientWidth, el.clientHeight);
        program.uniforms.uRes.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
        if (reduced) renderer.render({ scene: mesh });
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      const off = onReady(() => {
        canvas.style.opacity = "1";
      });
      const dispose = () => {
        off();
        ro.disconnect();
        canvas.remove();
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };

      if (reduced) {
        program.uniforms.uIntensity.value = 0.7;
        renderer.render({ scene: mesh });
        cleanup = dispose;
        return;
      }

      // ---- scroll choreography: hero 1 -> 0, quiet through the work, 0 -> 0.6 into Contact ----
      const state = { intensity: 1, vel: 0, smoothVel: 0 };
      let contactTop = Infinity;
      const measure = () => {
        contactTop = document.getElementById("contact")?.offsetTop ?? Infinity;
      };
      const compute = (y: number) => {
        const vh = window.innerHeight;
        const hero = 1 - clamp01(y / (vh * 0.8));
        const contact = clamp01((y + vh - contactTop) / (vh * 0.9)) * 0.6;
        state.intensity = Math.max(hero, contact);
      };
      measure();
      compute(window.scrollY);
      ScrollTrigger.addEventListener("refresh", measure);
      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          state.vel = self.getVelocity();
          compute(self.scroll());
        },
      });

      const thirtyFps = isCoarsePointer();
      let frame = 0;
      let t = 4;
      let shown = true;
      const tick = (_time: number, dt: number) => {
        // idle: nothing to draw while the page is in the quiet middle
        if (state.intensity < 0.002) {
          if (shown) {
            canvas.style.visibility = "hidden";
            shown = false;
          }
          return;
        }
        if (!shown) {
          canvas.style.visibility = "visible";
          shown = true;
        }
        if (thirtyFps && frame++ % 2) return;

        state.smoothVel += (state.vel - state.smoothVel) * 0.1;
        state.vel *= 0.92;
        const v = Math.min(Math.abs(state.smoothVel) / 1500, 2.5);
        t += (dt / 1000) * (0.3 + v);
        program.uniforms.uTime.value = t;
        program.uniforms.uIntensity.value = state.intensity;
        program.uniforms.uShear.value = Math.max(-0.35, Math.min(0.35, state.smoothVel / 6000));
        renderer.render({ scene: mesh });
      };
      gsap.ticker.add(tick);

      cleanup = () => {
        gsap.ticker.remove(tick);
        ScrollTrigger.removeEventListener("refresh", measure);
        st.kill();
        dispose();
      };
    };

    // never on the LCP path: after the preloader, and only when the browser is idle
    const offReady = onReady(() => {
      const run = () => void start();
      if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 1500 });
      else setTimeout(run, 200);
    });

    return () => {
      disposed = true;
      offReady();
      cleanup();
    };
  }, []);

  return <div ref={host} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />;
}
