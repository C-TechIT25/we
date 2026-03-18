/**
 * companyAssets.js
 * Maps company slugs to their local logo and header images from the assets folder.
 * Add additional companies here as needed.
 */
import ctechlogo from '../assets/ctechlogo.png';
import preconlogo from '../assets/preconlogo.png';
import ctechbg from '../assets/ctechbg.png';
import preconbg from '../assets/preconbg.jpg';

/**
 * Returns { logo, header } for a given company slug.
 * Falls back to preconlogo / hero if the slug is not specifically listed.
 */
export function getCompanyAssets(slug = '') {
  const s = slug.toLowerCase().trim();

  if (s === 'c-tech-engineering-construction-pvt-ltd' || s.includes('ctech') || s.includes('c-tech')) {
    return { logo: ctechlogo, header: ctechbg };
  }

  // Default / fallback (e.g. precon or any other company)
  return { logo: preconlogo, header: preconbg };
}
