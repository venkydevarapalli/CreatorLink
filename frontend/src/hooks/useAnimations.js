import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-triggered reveal using IntersectionObserver.
 * Returns a ref to attach to the element.
 * The element gets the 'visible' class when it enters the viewport.
 */
export function useReveal(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: options.threshold || 0.1, rootMargin: options.rootMargin || '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

/**
 * Auto-applies 'visible' class on scroll for all elements with
 * .reveal, .reveal-left, .reveal-right, .reveal-scale classes.
 * Call this once in your App or layout component.
 */
export function useScrollReveal() {
  useEffect(() => {
    const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    // Observe existing elements
    const observe = () => {
      document.querySelectorAll(selectors).forEach((el) => {
        if (!el.classList.contains('visible')) {
          observer.observe(el);
        }
      });
    };

    observe();

    // Re-observe on DOM changes (for route transitions)
    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(observe);
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}

/**
 * Tilt effect on mouse move over an element.
 * Returns a ref and event handlers.
 */
export function useTilt(maxDeg = 8) {
  const ref = useRef(null);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${-y * maxDeg}deg) rotateY(${x * maxDeg}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = '';
  };

  return { ref, onMouseMove: handleMove, onMouseLeave: handleLeave };
}
