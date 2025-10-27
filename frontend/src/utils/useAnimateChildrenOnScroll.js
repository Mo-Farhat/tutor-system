import { useRef, useEffect } from 'react';

/**
 * Observe direct child elements of a parent and toggle an in-view class
 * on each child as it enters/leaves the viewport.
 *
 * Options:
 * - once: animate only the first time a child enters (default: true)
 * - threshold: IntersectionObserver threshold (default: 0.25)
 * - rootMargin: margins to tweak trigger point (default: '0px 0px -10% 0px')
 * - inViewClass: class to add when in view (default: 'in-view')
 * - childFilter: function to pick which direct children to observe
 */
export default function useAnimateChildrenOnScroll(options = {}) {
  const {
    once = true,
    threshold = 0.25,
    rootMargin = '0px 0px -10% 0px',
    inViewClass = 'in-view',
    childFilter = (el) => el.classList.contains('row'),
  } = options;

  const parentRef = useRef(null);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    const children = Array.from(parent.children).filter(childFilter);

    if (!('IntersectionObserver' in window)) {
      children.forEach((el) => el.classList.add(inViewClass));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.add(inViewClass);
            if (once) observer.unobserve(el);
          } else if (!once) {
            el.classList.remove(inViewClass);
          }
        });
      },
      { threshold, rootMargin }
    );

    children.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [once, threshold, rootMargin, inViewClass, childFilter]);

  return parentRef;
}
