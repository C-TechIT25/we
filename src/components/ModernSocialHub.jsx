import GoogleLogo from './GoogleLogo';
import { isGoogleReview } from '../utils/googleReview';
import { getCompanyAssets } from '../utils/companyAssets';
import { useState } from 'react';
import { Instagram, LinkedIn, WhatsApp, YouTube, Facebook, X, Google, Telegram, Language, NorthEast, ShareOutlined, Email, Phone, LocationOn, ArrowForward, Link as LinkIcon } from '@mui/icons-material';
import { Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import './ModernSocialHub.css';

const platforms = [
  ['website', /website|official site/i, Language, 'Our website', 'Explore our projects and expertise'],
  ['instagram', /instagram/i, Instagram, 'Instagram', 'A closer look at our work'],
  ['linkedin', /linkedin/i, LinkedIn, 'LinkedIn', 'Ideas, insights & opportunities'],
  ['whatsapp', /whatsapp|wa.me/i, WhatsApp, 'WhatsApp Channel', 'Updates, straight to you'],
  ['youtube', /youtube|youtu.be/i, YouTube, 'YouTube', 'Watch our stories'],
  ['facebook', /facebook|fb.com/i, Facebook, 'Facebook', 'Join our community'],
  ['twitter', /twitter|x.com/i, X, 'X (Twitter)', 'News & conversations'],
  ['google', /google|maps|g.page/i, Google, 'Google Profile', 'Reviews & directions'],
  ['telegram', /telegram|t.me/i, Telegram, 'Telegram', 'Stay in the loop'],
];
function platform(link) { return platforms.find(([, match]) => match.test(link.name + ' ' + link.url)) || ['other', null, LinkIcon, link.name, link.bio || 'Connect with us']; }
const safeUrl = value => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; } };

export default function ModernSocialHub({ company, logo, links = [], preview = false }) {
  const [notice, setNotice] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const ctech = /c-tech|ctech/i.test(company.slug || '');
  const precon = /precon/i.test(company.slug || '');
  const companyAssets = getCompanyAssets(company.slug);
  const backgroundPhoto = companyAssets.building || company.headerUrl || companyAssets.header;
  const brand = ctech ? 'C-TECH' : company.name;
  const fullName = ctech ? 'C-Tech Engineering & Construction (P) Limited' : company.name;
  const address = company.address || (ctech ? '1291/G, 47th St, Phase II, Sathuvachari, Vellore, Tamil Nadu' : '');
  const website = links.find(link => /website|official site/i.test(link.name));
  const socialLinks = links;
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: fullName, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setNotice('Profile link copied'); }
    } catch (error) { if (error.name !== 'AbortError') setShareOpen(true); }
  }
  return <div className={precon ? 'social-hub social-hub--precon' : 'social-hub'}>
    <header className="hub-nav">
      <nav aria-label="Profile actions">{safeUrl(website?.url) && <a data-link-id={website?.id} href={preview ? undefined : website.url} target="_blank" rel="noopener noreferrer"><Language /> <span>Our website</span></a>}<button onClick={share} disabled={preview}><ShareOutlined /> Share profile</button></nav>
    </header>
    <main className="hub-shell"><div className="hub-columns">
      <section className="hub-brand-panel">
        <img className="hub-building-photo" src={backgroundPhoto} alt="" onError={event => { if (event.currentTarget.dataset.fallback) return; event.currentTarget.dataset.fallback = 'true'; event.currentTarget.src = companyAssets.header; }} />
        <div className="hub-photo-fade" aria-hidden="true" />
        <div className="hub-logo-orbit"><img src={logo} alt={fullName} /></div>
        <div className="hub-status">BUILDING CONNECTIONS</div>
        <h1>Building excellence.<br /><em>Staying connected.</em></h1>
        <h2>{fullName}</h2>
        <p>Explore our work. Follow our journey.<br />Let’s build together.</p>
        <div className="hub-panel-bottom">{address && <span className="hub-location"><LocationOn />{ctech ? 'Vellore, Tamil Nadu' : address}</span>}
          <div className="hub-contact">{company.email && <a href={preview ? undefined : 'mailto:' + company.email}><Email />Email us</a>}{company.phone && <a href={preview ? undefined : 'tel:' + company.phone}><Phone />Call us</a>}</div>
        </div>
      </section>
      <section className="hub-network"><div className="hub-heading"><span>THE {brand} NETWORK</span><h2>One place. <em>Every connection.</em></h2><p>Find us on your favourite platform.</p></div>
        <div className="hub-social-grid">{socialLinks.map(link => { const [key, , Icon, title, subtitle] = platform(link); const googleReview = isGoogleReview(link); return <a key={link.id} data-link-id={link.id} className={'hub-social-card hub-platform-' + key + (googleReview ? ' google-review-card' : '')} href={preview ? undefined : safeUrl(link.url)} target="_blank" rel="noopener noreferrer"><span className={'hub-social-logo hub-logo-' + key}>{key === 'google' || googleReview ? <GoogleLogo /> : <Icon />}</span><div><h3>{googleReview || key === 'other' ? link.name : title}</h3><p>{link.bio || subtitle}</p></div><span className="hub-arrow"><NorthEast /></span></a>; })}</div>
        {!socialLinks.length && <p className="hub-empty">Social links will appear here once published.</p>}
      </section></div>
      {address && <div className="hub-address"><LocationOn /><span>{address}</span><a href={preview ? undefined : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address)} target="_blank" rel="noopener noreferrer"><LocationOn /> Get directions <ArrowForward /></a></div>}
      <footer className="hub-footer"><span>© {new Date().getFullYear()} {fullName}</span><span>Built on trust. Connected by ideas. <i /></span></footer>
    </main>
    <Snackbar open={Boolean(notice)} message={notice} autoHideDuration={4000} onClose={() => setNotice('')} />
    <Dialog open={shareOpen} onClose={() => setShareOpen(false)} fullWidth maxWidth="sm"><DialogTitle>Share profile</DialogTitle><DialogContent><TextField fullWidth label="Profile link" value={window.location.href} slotProps={{ input: { readOnly: true } }} onFocus={event => event.target.select()} sx={{ mt: 1 }} /></DialogContent><DialogActions><Button onClick={() => setShareOpen(false)}>Done</Button></DialogActions></Dialog>
  </div>;
}
