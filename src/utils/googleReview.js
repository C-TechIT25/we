export const isGoogleReview = link => /google\s*reviews?/i.test(link.name || '') ||
  (link.icon === 'Google' && /reviews?/i.test(`${link.name || ''} ${link.bio || ''}`)) ||
  /(?:g\.page\/[^?#]*\/review|search\.google\.com\/local\/writereview)/i.test(link.url || '');
