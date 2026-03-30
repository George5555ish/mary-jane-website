"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

import { vertexShader, fragmentShader } from "./ironhill-shaders";

import "./IronhillShaderScroll.css";

gsap.registerPlugin(ScrollTrigger);

/** Images in `public/work` — add filenames here when new pieces are added. */
export const WORK_GALLERY_IMAGES = [
  "/work/1.jpeg",
  "/work/2.jpeg",
  "/work/3.jpeg",
  "/work/4.jpeg",
];

const CONFIG = {
  color: "#e0ded1",
  spread: 0.5,
  speed: 2,
  /** Scroll progress (0–1): narrow window = faster fade so more copy is readable sooner. */
  textRevealStart: 0.28,
  textRevealEnd: 0.42,
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0.88, g: 0.87, b: 0.82 };
}

export default function IronhillShaderScroll({
  imageSrc = "/home/about-1.jpg",
  headerTitle = "Morphogenesis",
  headerSubtitle = "Solid form gives way to liquid movement.",
}) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const contentInnerRef = useRef(null);
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const contentEl = contentInnerRef.current;
    if (!section || !canvas || !contentEl) return;

    const rgb = hexToRgb(CONFIG.color);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uProgress: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(section.offsetWidth, section.offsetHeight),
        },
        uColor: { value: new THREE.Vector3(rgb.r, rgb.g, rgb.b) },
        uSpread: { value: CONFIG.spread },
      },
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let rafId = 0;

    function resize() {
      const w = section.offsetWidth;
      const h = section.offsetHeight;
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      material.uniforms.uResolution.value.set(w, h);
    }

    function tick() {
      material.uniforms.uProgress.value = scrollProgressRef.current;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    }

    resize();
    tick();

    const ro = new ResizeObserver(() => {
      resize();
      ScrollTrigger.refresh();
    });
    ro.observe(section);

    const stackEl = section.querySelector(".ironhill-scroll__stack");
    if (stackEl) {
      gsap.set(stackEl, {
        autoAlpha: 0,
        y: 36,
        pointerEvents: "none",
      });
    }

    const stShader = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const prog = self.progress;
        scrollProgressRef.current = Math.min(prog * CONFIG.speed, 1.1);

        if (!stackEl) return;
        const { textRevealStart: a, textRevealEnd: b } = CONFIG;
        let t = 0;
        if (prog >= b) {
          t = 1;
        } else if (prog > a) {
          t = (prog - a) / (b - a);
        }
        gsap.set(stackEl, {
          autoAlpha: t,
          y: 36 * (1 - t),
          pointerEvents: t > 0.02 ? "auto" : "none",
        });
      },
    });

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      stShader.kill();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section
      className="ironhill-scroll"
      ref={sectionRef}
      aria-label="Shader scroll transition"
    >
      <div className="ironhill-scroll__img">
        <img src={imageSrc} alt="" />
      </div>

      <div className="ironhill-scroll__header">
        <h2>{headerTitle}</h2>
        <p>{headerSubtitle}</p>
      </div>

      <canvas className="ironhill-scroll__canvas" ref={canvasRef} />

      <div className="ironhill-scroll__content" ref={contentInnerRef}>
        <div className="ironhill-scroll__stack">
          <div className="ironhill-scroll__copy">
            <p className="ironhill-scroll__eyebrow mono">MARY JANE — PHOTOGRAPHY</p>

            <p className="ironhill-scroll__body">
              Her work sits between editorial clarity and something more intimate:
              portraits that refuse caricature, events distilled into rhythm and
              color, and still lifes that behave like memories—soft at the edges,
              exact where it counts. Every series is built the same way: observe
              longer than feels comfortable, then edit until only what matters
              remains.
            </p>

            <blockquote className="ironhill-scroll__quote">
              “I am not chasing perfection in the frame. I am chasing honesty—and
              honesty is almost always a little imperfect.”
            </blockquote>

            <p className="ironhill-scroll__body ironhill-scroll__body--closing">
              Whether the brief is a single headshot or a full day in motion, the
              through-line is the same: images that feel lived-in, deliberate, and
              unmistakably hers. This is the craft behind MARY JANE—quiet on the
              surface, restless in the detail.
            </p>
          </div>

          <div
            className="ironhill-scroll__carousel-wrap"
            aria-label="Selected work gallery"
          >
            <div className="ironhill-scroll__carousel-track">
              {[0, 1].flatMap((dup) =>
                WORK_GALLERY_IMAGES.map((src, i) => (
                  <figure
                    className="ironhill-scroll__carousel-item"
                    key={`${dup}-${i}`}
                  >
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      draggable={false}
                    />
                  </figure>
                )),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
