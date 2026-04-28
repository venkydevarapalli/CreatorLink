import { useEffect, useState, useRef } from "react";

export function useCountUp(end, duration = 2000, startOnVisible = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !startOnVisible) return;

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const startTime = performance.now();
        const animate = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * end));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        obs.unobserve(el);
      }
    }, { threshold: 0.3 });

    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration, startOnVisible]);

  return { count, ref };
}
