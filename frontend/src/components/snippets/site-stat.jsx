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
  
  // Handle non-numeric values like "4/5"
  const numericValue = parseFloat(value);
  const isNumeric = !isNaN(numericValue) && value.toString().match(/^\d+(\.\d+)?$/);
  const showCounter = inView && !prefersReducedMotion && isNumeric;

  const displayValue = useCountUp(isNumeric ? numericValue : 0, 900, 0, showCounter);

  return (
    <div ref={ref} className="site-stat-card d-flex flex-column align-items-center justify-content-center p-4" role="group" aria-label={`${label}: ${value}${suffix ? ' ' + suffix : ''}`}>
      {icon ? (
          <div className="site-stat-icon mb-3" aria-hidden="true">
              <img src={icon} alt="" className="stat-icon-img" />
          </div>
      ) : null}
      <div className="site-stat-number fw-bold" aria-live="polite" aria-atomic="true">
        {showCounter ? displayValue : value}
        {suffix ? (
          <>
            <span aria-hidden="true" className="site-stat-suffix">{suffix}</span>
            <span className="sr-only"> {suffix === '+' ? 'plus' : suffix}</span>
          </>
        ) : null}
      </div>
      <div className="site-stat-label text-center text-muted">{label}</div>
    </div>
  );
}

function Sitestat({
  title = 'We believe that to be the best, you have to learn from the best!',
  stats = [
    { value: '4/5', label: 'Average Tutor Ration', suffix: '', icon: '/Images/Home/First Place Ribbon.png' },
    { value: '6000', label: 'Hours of Experience', suffix: '+', icon: '/Images/Home/Clock.png' },
    { value: '4000', label: 'Completed Lessons', suffix: '+', icon: '/Images/Home/Brochure.png' },
    { value: '350', label: 'Tutors', suffix: '+', icon: '/Images/Home/User Menu Male.png' },
  ],
  variant = 'section'
}) {
  const ref = useAnimateOnScroll();
  return (
    <div ref={ref} className={`site-stat-section section-animate-target variant-${variant}`}>
      <section
        className="container-fluid section d-flex flex-column align-items-center justify-content-center g-0 z-index-0"
        id="site-stat"
      >
          <h2 className="fw-bold text-center site-stat-title mb-5">
            {title}
          </h2>
          <div className="container">
            <div className="row justify-content-center gap-4">
                {stats.map((s, idx) => (
                <div key={idx} className="col-lg-2 col-md-5 col-sm-10">
                    <StatCard value={s.value} label={s.label} suffix={s.suffix} icon={s.icon} />
                </div>
                ))}
            </div>
          </div>
      </section>
    </div>
  );
}

export default Sitestat;
