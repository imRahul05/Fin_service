import { useState, useEffect, useRef } from "react";

/**
 * Lightweight hook to trigger entry animations on scroll using IntersectionObserver.
 * Zero external dependencies, 0kb runtime weight.
 *
 * @param {Object} [options]
 * @param {number} [options.threshold=0.15]
 * @param {string} [options.rootMargin='0px 0px -40px 0px']
 * @param {boolean} [options.triggerOnce=true]
 */
export function useScrollReveal(options = {}) {
  const {
    threshold = 0.15,
    rootMargin = "0px 0px -40px 0px",
    triggerOnce = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

export default useScrollReveal;
