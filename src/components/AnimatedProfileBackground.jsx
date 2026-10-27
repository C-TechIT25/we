import { useEffect, useRef, useState } from 'react';
import './AnimatedProfileBackground.css';

// Original layered light effect; no licensed assets or WebGL required.
export default function AnimatedProfileBackground({ color }) {
  const ref = useRef(null);
  const [active, setActive] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting));
    observer.observe(ref.current);
    const visibility = () => {
      if (document.hidden) setActive(false);
      else {
        const rect = ref.current.getBoundingClientRect();
        setActive(rect.bottom > 0 && rect.top < window.innerHeight);
      }
    };
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  return (
    <div ref={ref} aria-hidden="true" className="profile-lights" data-active={active} style={{ '--profile-light': color }}>
      <div className="profile-lights__bloom" />
      <div className="profile-lights__rays">
        {[0, 1, 2, 3, 4].map(index => <i key={index} className="profile-lights__ray" style={{ '--i': index }} />)}
      </div>
      <div className="profile-lights__haze" />
      {Array.from({ length: 14 }, (_, index) => <i key={index} className="profile-lights__spark" style={{ left: ((index * 37 + 11) % 100) + '%', top: ((index * 23 + 17) % 100) + '%', '--i': index }} />)}
      <div className="profile-lights__vignette" />
    </div>
  );
}
