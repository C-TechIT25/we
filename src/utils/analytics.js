export function platformFor(url = '') {
  let host;
  try { host = new URL(url).hostname.toLowerCase(); } catch { return 'Other'; }
  const platforms = { Instagram: ['instagram.com'], Facebook: ['facebook.com', 'fb.com'], WhatsApp: ['wa.me', 'whatsapp.com'], YouTube: ['youtube.com', 'youtu.be'], LinkedIn: ['linkedin.com'], X: ['x.com', 'twitter.com'], TikTok: ['tiktok.com'], Telegram: ['t.me', 'telegram.org'], Google: ['google.com', 'goo.gl'] };
  return Object.entries(platforms).find(([, domains]) => domains.some(domain => host === domain || host.endsWith('.' + domain)))?.[0] || 'Website / other';
}

export function summarizeEvents(events, days, now = new Date()) {
  const daily = Array.from({ length: days }, (_, i) => {
    const date = new Date(now); date.setUTCHours(0, 0, 0, 0); date.setUTCDate(date.getUTCDate() - days + 1 + i);
    return { date: date.toISOString().slice(0, 10), views: 0, clicks: 0 };
  });
  const byDay = new Map(daily.map(day => [day.date, day]));
  const platforms = new Map();
  let views = 0, clicks = 0, impressions = 0;
  for (const event of events) {
    const date = event.createdAt?.toDate?.();
    if (!date) continue;
    const day = byDay.get(date.toISOString().slice(0, 10));
    if (!day) continue;
    if (event.type === 'page_view') { views++; day.views++; continue; }
    if (!['link_view', 'link_click'].includes(event.type)) continue;
    const name = event.platform || 'Other';
    if (!platforms.has(name)) platforms.set(name, { name, views: 0, clicks: 0 });
    const row = platforms.get(name);
    if (event.type === 'link_click') { clicks++; row.clicks++; day.clicks++; }
    else { impressions++; row.views++; }
  }
  return { views, clicks, impressions, daily, platforms: [...platforms.values()].sort((a, b) => b.clicks - a.clicks || b.views - a.views) };
}
