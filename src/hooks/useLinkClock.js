import { useEffect, useState } from 'react';
import { timestampMs } from '../utils/links';

// Re-evaluate at schedule boundaries, also when a sleeping tab becomes visible.
export default function useLinkClock(links) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    let timer;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      clearTimeout(timer);
      const next = links.flatMap(link => [timestampMs(link.startsAt), timestampMs(link.endsAt)]).filter(ms => ms > time);
      if (next.length) timer = setTimeout(tick, Math.min(Math.min(...next) - time + 20, 2147483647));
    };
    timer = setTimeout(tick, 0);
    document.addEventListener('visibilitychange', tick);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', tick); };
  }, [links]);
  return now;
}
