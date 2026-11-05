export const domainMap = {
  'links.preconstructurals.com': 'precon-structurals',
  'links.ctechengineering.in': 'c-tech-engineering',
};

export function profileUrl(slug, origin = window.location.origin) {
  const domain = Object.keys(domainMap).find(host => domainMap[host] === slug);
  return domain ? `https://${domain}/` : new URL(`/${encodeURIComponent(slug)}`, origin).href;
}

export function campaignUrl(base, { source = '', medium = '', campaign = '' }) {
  const url = new URL(base);
  for (const [key, value] of Object.entries({ utm_source: source, utm_medium: medium, utm_campaign: campaign })) {
    if (value.trim()) url.searchParams.set(key, value.trim());
    else url.searchParams.delete(key);
  }
  return url.href;
}
