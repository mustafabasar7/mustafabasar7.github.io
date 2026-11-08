import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextSplitter } from "../utils/textSplitter";
import { isDesktop, getWidth } from "./viewport";

/**
 * Motion module: owns GSAP scroll-reveal setup AND teardown for split text.
 * Callers get one function, `mountTextReveals()`, which returns a disposer
 * that kills animations/ScrollTriggers, reverts split DOM and removes listeners.
 */

/** Below this width the scroll text reveals are not used (historical value). */
export const REVEAL_MIN_WIDTH = 900;

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Pure: should scroll text reveals run for this viewport / user preference? */
export function shouldReveal(width: number, reducedMotion: boolean): boolean {
  return !reducedMotion && width >= REVEAL_MIN_WIDTH;
}

interface RevealEl extends HTMLElement {
  anim?: gsap.core.Animation;
  split?: TextSplitter;
}

gsap.registerPlugin(ScrollTrigger);

const ToggleAction = "play pause resume reverse";

function release(el: RevealEl) {
  if (el.anim) {
    el.anim.progress(1).kill();
    el.anim = undefined;
  }
  el.split?.revert();
  el.split = undefined;
}

function build() {
  const paras = document.querySelectorAll<RevealEl>(".para");
  const titles = document.querySelectorAll<RevealEl>(".title");
  const start = !isDesktop() ? "top 60%" : "20% 60%";

  paras.forEach((para) => {
    para.classList.add("visible");
    release(para);
    para.split = new TextSplitter(para, { type: "lines,words", linesClass: "split-line" });
    para.anim = gsap.fromTo(
      para.split.words,
      { autoAlpha: 0, y: 80 },
      {
        autoAlpha: 1,
        scrollTrigger: { trigger: para.parentElement?.parentElement, toggleActions: ToggleAction, start },
        duration: 1,
        ease: "power3.out",
        y: 0,
        stagger: 0.02,
      }
    );
  });
  titles.forEach((title) => {
    release(title);
    title.split = new TextSplitter(title, { type: "chars,lines", linesClass: "split-line" });
    title.anim = gsap.fromTo(
      title.split.chars,
      { autoAlpha: 0, y: 80, rotate: 10 },
      {
        autoAlpha: 1,
        scrollTrigger: { trigger: title.parentElement?.parentElement, toggleActions: ToggleAction, start },
        duration: 0.8,
        ease: "power2.inOut",
        y: 0,
        rotate: 0,
        stagger: 0.03,
      }
    );
  });
}

function teardown() {
  document.querySelectorAll<RevealEl>(".para, .title").forEach(release);
}

/** Sets up scroll text reveals; returns a disposer (call on unmount). */
export function mountTextReveals(): () => void {
  ScrollTrigger.config({ ignoreMobileResize: true });

  const run = () => {
    if (!shouldReveal(getWidth(), prefersReducedMotion())) return;
    build();
  };
  const onRefresh = () => run();

  run();
  window.addEventListener("resize", run);
  ScrollTrigger.addEventListener("refresh", onRefresh);

  return () => {
    window.removeEventListener("resize", run);
    ScrollTrigger.removeEventListener("refresh", onRefresh);
    teardown();
  };
}
