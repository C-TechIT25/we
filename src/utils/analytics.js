export function platformFor(url = '') {
  let host;
  try { host = new URL(url).hostname.toLowerCase(); } catch { return 'Other'; }
  const platforms = { Instagram: ['instagram.com'], Facebook: ['facebook.com', 'fb.com'], WhatsApp: ['wa.me', 'whatsapp.com'], YouTube: ['youtube.com', 'youtu.be'], LinkedIn: ['linkedin.com'], X: ['x.com', 'twitter.com'], TikTok: ['tiktok.com'], Telegram: ['t.me', 'telegram.org'], Google: ['google.com', 'goo.gl'] };
  return Object.entries(platforms).find(([, domains]) => domains.some(domain => host === domain || host.endsWith('.' + domain)))?.[0] || 'Website / other';
}

export function attributionFor(search = '', referrer = '', origin = '') {
  const params = new URLSearchParams(search);
  const clean = value => [...(value || '').trim()].filter(char => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127).join('').slice(0, 100);
  let source = clean(params.get('utm_source')).toLowerCase();
  let medium = clean(params.get('utm_medium')).toLowerCase();
  const campaign = clean(params.get('utm_campaign'));
  if (!source) {
    try {
      const ref = new URL(referrer);
      if (ref.origin !== origin) {
        const platform = platformFor(ref.href);
        source = platform === 'Website / other' ? clean(ref.hostname) : platform.toLowerCase();
        medium ||= platform === 'Website / other' ? 'referral' : 'social';
      }
    } catch { /* Missing referrer is normal for direct visits. */ }
  }
  return { source: source || 'direct', medium: medium || (source ? 'unspecified' : 'none'), campaign };
}

export function dateRange(days = 30, now = new Date()) {
  const end = now.toISOString().slice(0, 10);
  const start = new Date(`${end}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - days + 1);
  return { start: start.toISOString().slice(0, 10), end };
}

export function rangeDays(start, end) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) return 0;
  const first = new Date(`${start}T00:00:00Z`), last = new Date(`${end}T00:00:00Z`);
  if (!Number.isFinite(+first) || !Number.isFinite(+last) || first.toISOString().slice(0, 10) !== start || last.toISOString().slice(0, 10) !== end) return 0;
  return Math.round((last - first) / 86400000) + 1;
}

export function summarizeEvents(events, days, now = new Date()) {
  const daily = Array.from({ length: days }, (_, i) => {
    const date = new Date(now); date.setUTCHours(0, 0, 0, 0); date.setUTCDate(date.getUTCDate() - days + 1 + i);
    return { date: date.toISOString().slice(0, 10), views: 0, clicks: 0 };
  });
  const byDay = new Map(daily.map(day => [day.date, day]));
  const platforms = new Map();
  const sources = new Map();
  let views = 0, clicks = 0, impressions = 0;
  for (const event of events) {
    const date = event.createdAt?.toDate?.();
    if (!date) continue;
    const day = byDay.get(date.toISOString().slice(0, 10));
    if (!day) continue;
    if (!['page_view', 'link_view', 'link_click'].includes(event.type)) continue;
    const source = event.source || 'unknown (legacy)';
    const medium = event.medium || 'unspecified', campaign = event.campaign || '';
    const sourceKey = JSON.stringify([source, medium, campaign]);
    if (!sources.has(sourceKey)) sources.set(sourceKey, { source, medium, campaign, views: 0, clicks: 0 });
    const traffic = sources.get(sourceKey);
    if (event.type === 'page_view') traffic.views++;
    if (event.type === 'link_click') traffic.clicks++;
    if (event.type === 'page_view') { views++; day.views++; continue; }
    if (!['link_view', 'link_click'].includes(event.type)) continue;
    const name = event.platform || 'Other';
    if (!platforms.has(name)) platforms.set(name, { name, views: 0, clicks: 0 });
    const row = platforms.get(name);
    if (event.type === 'link_click') { clicks++; row.clicks++; day.clicks++; }
    else { impressions++; row.views++; }
  }
  return { views, clicks, impressions, daily, sources: [...sources.values()].sort((a, b) => b.views - a.views || b.clicks - a.clicks), platforms: [...platforms.values()].sort((a, b) => b.clicks - a.clicks || b.views - a.views) };
}
