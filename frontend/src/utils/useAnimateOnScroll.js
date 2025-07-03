import { useRef, useEffect } from 'react';

const useAnimateOnScroll = () => {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let hasAnimated = false;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          node.classList.add('section-animate');
          hasAnimated = true;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
};

export default useAnimateOnScroll; 