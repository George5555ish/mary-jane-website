"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Preloader, { isInitialLoad } from "@/components/Preloader/Preloader";
import Copy from "@/components/Copy/Copy";
import DiningMenu from "@/components/DiningMenu/DiningMenu";
import IronhillShaderScroll from "@/components/IronhillShaderScroll/IronhillShaderScroll";
import Testimonials from "@/components/Testimonials/Testimonials";
import CTA from "@/components/CTA/CTA";
import ImageBanner from "@/components/ImageBanner/ImageBanner";

import "./home.css";

gsap.registerPlugin(ScrollTrigger);

const ABOUT_IMAGE_COUNT = 6;

function playHeroEntrance(heroEl) {
  if (!heroEl) return;
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    heroEl.classList.remove("hero--portfolio--pending");
    return;
  }

  const portrait = heroEl.querySelector(".hero--portfolio__portrait");
  const left = heroEl.querySelector(".hero--portfolio__left");
  const right = heroEl.querySelector(".hero--portfolio__right");
  if (!portrait || !left || !right) {
    heroEl.classList.remove("hero--portfolio--pending");
    return;
  }

  gsap.set(portrait, { opacity: 0, y: 36 });
  gsap.set(left, { opacity: 0, x: -40 });
  gsap.set(right, { opacity: 0, x: 40 });

  const ease = "sine.out";
  const fadeDuration = 0.85;
  /* Stagger start times by ~40–45ms so reads sequential but stays tight */
  const staggerMs = 0.042;

  const tl = gsap.timeline({
    onComplete: () => {
      heroEl.classList.remove("hero--portfolio--pending");
    },
  });

  tl.to(
    portrait,
    { opacity: 1, y: 0, duration: fadeDuration, ease },
    0,
  )
    .to(
      left,
      { opacity: 1, x: 0, duration: fadeDuration, ease },
      staggerMs,
    )
    .to(
      right,
      { opacity: 1, x: 0, duration: fadeDuration, ease },
      staggerMs * 2,
    );
}

export default function Home() {
  const aboutSectionRef = useRef(null);
  const heroRef = useRef(null);
  const heroEntranceStartedRef = useRef(false);

  const handlePreloaderEnter = () => {
    if (heroEntranceStartedRef.current) return;
    heroEntranceStartedRef.current = true;
    requestAnimationFrame(() => playHeroEntrance(heroRef.current));
  };

  useLayoutEffect(() => {
    if (isInitialLoad) return;
    if (heroEntranceStartedRef.current) return;
    if (!heroRef.current) return;
    heroEntranceStartedRef.current = true;
    playHeroEntrance(heroRef.current);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const aboutImages = gsap.utils.toArray(".about-img");

      /* scale each about image in and out as it scrolls through the viewport */
      aboutImages.forEach((image) => {
        const imageScaleTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: image,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });

        imageScaleTimeline
          .fromTo(image, { scale: 0.5 }, { scale: 1.25, ease: "none" })
          .to(image, { scale: 0.5, ease: "none" });
      });

      /* fade out the about header as the image gallery scrolls away */
      gsap.to(".about-header h3", {
        opacity: 0,
        ease: "power1.out",
        scrollTrigger: {
          trigger: ".about-imgs",
          start: "bottom bottom",
          end: "bottom 30%",
          scrub: true,
        },
      });
    }, aboutSectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Preloader onEnter={handlePreloaderEnter} />

      <section
        className="hero hero--portfolio hero--portfolio--pending"
        aria-label="Introduction"
        ref={heroRef}
      >
        <div className="hero--portfolio__bg" aria-hidden />
        <p className="hero--portfolio__greeting">Hey, there</p>

        <div className="hero--portfolio__figure">
          <img
            src="/mary/main.png"
            alt="Mary Jane"
            className="hero--portfolio__portrait"
          />
        </div>

        <div className="hero--portfolio__bottom">
          <div className="hero--portfolio__left">
            <span className="hero--portfolio__badge">
              <span className="hero--portfolio__badge-dot" aria-hidden />
              Available for new opportunities
            </span>
            <h1 className="hero--portfolio__name">
              I AM <br />
              MARY JANE
            </h1>
          </div>
          <div className="hero--portfolio__right">
            <p className="hero--portfolio__spec">
              Specialized in portrait, editorial, events, and fine art
              photography—with print and digital delivery.
            </p>
            <p className="hero--portfolio__role">PHOTOGRAPHER</p>
          </div>
        </div>
      </section>

      <section className="about" ref={aboutSectionRef}>
        <div className="about-header">
          <div className="container">
            <Copy type="lines">
              <h3>
                Images built on light, balance, and restraint—where composition
                and mood meet in a frame that feels effortless.
              </h3>
            </Copy>

            <div className="section-footer">
              <Copy type="lines" trigger=".about" start="top 50%" delay={0.5}>
                <p className="sm">Editorial</p>
              </Copy>
              <Copy type="lines" trigger=".about" start="top 50%" delay={0.6}>
                <p className="sm">On Location</p>
              </Copy>
            </div>
          </div>
        </div>

        <div className="about-imgs">
          <div className="container">
            {Array.from({ length: ABOUT_IMAGE_COUNT }, (_, index) => (
              <div
                key={index + 1}
                className="about-img"
                id={`about-img-${index + 1}`}
              >
                <img src={`/home/about-${index + 1}.jpg`} alt="" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <DiningMenu />
      <IronhillShaderScroll />
      <Testimonials />
      <CTA />
      <ImageBanner />
    </>
  );
}
