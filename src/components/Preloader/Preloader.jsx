"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLenis } from "lenis/react";

import "./Preloader.css";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const EXIT_ANIMATION_MS = 700;
/** Brief pause at 100% before the exit animation so the fill feels complete. */
const AUTO_ADVANCE_DELAY_MS = 450;

let isInitialLoad = true;

export default function Preloader({
  title = "MARY JANE",
  duration = 2600,
  onEnter,
  onAnimationComplete,
}) {
  const lenis = useLenis();
  const exitStartedRef = useRef(false);
  const onEnterRef = useRef(onEnter);
  const onAnimationCompleteRef = useRef(onAnimationComplete);
  const [isVisible, setIsVisible] = useState(isInitialLoad);
  const [isScrollLocked, setIsScrollLocked] = useState(isInitialLoad);
  const [progress, setProgress] = useState(0);
  const [hasFinishedLoading, setHasFinishedLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  onEnterRef.current = onEnter;
  onAnimationCompleteRef.current = onAnimationComplete;

  const runExit = useCallback(() => {
    if (exitStartedRef.current) return;
    exitStartedRef.current = true;
    if (onEnterRef.current) onEnterRef.current();
    setIsExiting(true);
    setIsScrollLocked(false);

    window.setTimeout(() => {
      isInitialLoad = false;
      setIsVisible(false);
      if (onAnimationCompleteRef.current) onAnimationCompleteRef.current();
    }, EXIT_ANIMATION_MS);
  }, []);

  /* lock/unlock scroll while preloader is active */
  useEffect(() => {
    if (!isScrollLocked) {
      if (lenis) lenis.start();
      document.body.style.overflow = "";
      return;
    }

    if (lenis) lenis.stop();
    document.body.style.overflow = "hidden";

    return () => {
      if (lenis) lenis.start();
      document.body.style.overflow = "";
    };
  }, [lenis, isScrollLocked]);

  /* animate progress from 0 to 100 */
  useEffect(() => {
    if (!isVisible) return;

    let frameId = null;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const ratio = clamp(elapsed / duration, 0, 1);
      const percent = Math.round(ratio * 100);

      setProgress(percent);

      if (percent >= 100) {
        setHasFinishedLoading(true);
        return;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [duration, isVisible]);

  /* after loading completes, advance automatically (same path as former "View portfolio") */
  useEffect(() => {
    if (!hasFinishedLoading || !isVisible || isExiting) return;

    const timeoutId = window.setTimeout(() => {
      runExit();
    }, AUTO_ADVANCE_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [hasFinishedLoading, isVisible, isExiting, runExit]);

  const loadingText = useMemo(() => `Loading... ${progress}%`, [progress]);

  if (!isVisible) return null;

  return (
    <section
      className={`preloader ${isExiting ? "is-exiting" : ""}`}
      aria-label="Website preloader"
      aria-busy={!isExiting}
    >
      <div className="preloader-inner">
        <div className="preloader-title-wrap">
          <h2 className="preloader-title preloader-title-base">{title}</h2>
          <h2
            className="preloader-title preloader-title-fill"
            style={{ width: `${progress}%` }}
          >
            {title}
          </h2>
        </div>

        <div className="preloader-action-slot">
          <p
            className={`preloader-loading ${isExiting ? "is-hidden" : ""} mono`}
            aria-live="polite"
          >
            {loadingText}
          </p>
        </div>
      </div>
    </section>
  );
}

export { isInitialLoad };
