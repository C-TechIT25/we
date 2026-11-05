import { useEffect, useRef, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { platformFor, attributionFor } from '../utils/analytics';

// Mounted only on public profiles, never in the admin preview.
export default function ProfileAnalytics({ companyId, links, children }) {
  const root = useRef(null);
  const visits = useRef(new Set());
  const seen = useRef(new Set());
  const [attribution] = useState(() => attributionFor(window.location.search, document.referrer, window.location.origin));
  useEffect(() => {
    const record = (type, link) => {
      void addDoc(collection(db, 'analyticsEvents'), {
        companyId, type, linkId: link?.id || '', platform: link ? platformFor(link.url) : '', createdAt: serverTimestamp(), ...attribution,
      }).catch(error => console.warn('Analytics event could not be saved:', error.code));
    };
    if (!visits.current.has(companyId)) { visits.current.add(companyId); record('page_view'); }
    const container = root.current;
    const findLink = anchor => links.find(link => {
      if (anchor.dataset.linkId) return link.id === anchor.dataset.linkId;
      try { return new URL(link.url, window.location.href).href === anchor.href; } catch { return false; }
    });
    const click = event => {
      if (event.type === 'auxclick' && event.button !== 1) return;
      const anchor = event.target.closest('a[href]');
      const link = anchor && findLink(anchor);
      if (link) record('link_click', link);
    };
    container.addEventListener('click', click);
    container.addEventListener('auxclick', click);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
        const link = findLink(entry.target);
        const key = companyId + ':' + link?.id;
        if (link && !seen.current.has(key)) { seen.current.add(key); record('link_view', link); }
      });
    }, { threshold: 0.5 });
    container.querySelectorAll('a[href]').forEach(anchor => { if (findLink(anchor)) observer.observe(anchor); });
    return () => { observer.disconnect(); container.removeEventListener('click', click); container.removeEventListener('auxclick', click); };
  }, [companyId, links, attribution]);
  return <div ref={root} style={{ display: 'contents' }}>{children}</div>;
}
