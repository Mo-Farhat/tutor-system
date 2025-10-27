import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../../css/snippets/site-stat.css';
import useAnimateOnScroll from '../../utils/useAnimateOnScroll';

function useInView(ref, options = { threshold: 0.2 }) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, options);
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, options]);
  return inView;
}

function useCountUp(target, duration = 900, start = 0, enabled = true) {
  const [value, setValue] = useState(start);
  const startTsRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    let raf;
    const step = (ts) => {
      if (!startTsRef.current) startTsRef.current = ts;
      const elapsed = ts - startTsRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (target - start) * progress);
      setValue(current);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start, enabled]);

  return value;
}

function StatCard({ value, label, suffix = '', icon = null }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  const numericTarget = Number(value);
  const isNumeric = Number.isFinite(numericTarget);
  const showCounter = inView && !prefersReducedMotion && isNumeric;

  const displayValue = useCountUp(isNumeric ? numericTarget : 0, 900, 0, showCounter);

  return (
    <div ref={ref} className="site-stat-card" role="group" aria-label={`${label}: ${value}${suffix ? ' ' + suffix : ''}`}>
      {icon ? <div className="site-stat-icon" aria-hidden="true">{icon}</div> : null}
      <div className="site-stat-number" aria-live="polite" aria-atomic="true">
        {showCounter ? displayValue : value}
        {suffix ? (
          <>
            <span aria-hidden="true" className="site-stat-suffix">{suffix}</span>
            <span className="sr-only"> {suffix === '+' ? 'plus' : suffix}</span>
          </>
        ) : null}
      </div>
      <div className="site-stat-label">{label}</div>
    </div>
  );
}

function Sitestat({
  title = 'We believe that to be the best, you have to learn from the best!',
  stats = [
    { value: '4.9', label: 'Average Tutor Rating', suffix: '/5' },
    { value: '6000', label: 'Hours of Experience', suffix: '+' },
    { value: '4000', label: 'Completed Lessons', suffix: '+' },
    { value: '350', label: 'Tutors', suffix: '+' },
  ],
  variant = 'section'
}) {
  const ref = useAnimateOnScroll();
  return (
    <div ref={ref} className={`site-stat-section section-animate-target variant-${variant}`}>
      <section
        className="row container-fluid section d-flex g-0 z-index-0"
        id="site-stat"
      >
        <div className="row col-8 d-flex gap-5 site-stat-sec">
          <h2 className="fw-bold d-flex site-stat-title">
            {title}
          </h2>
          <div className="site-stat-grid">
            {stats.map((s, idx) => (
              <StatCard key={idx} value={s.value} label={s.label} suffix={s.suffix} icon={s.icon} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Sitestat;
