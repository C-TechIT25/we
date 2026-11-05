import AnimatedProfileBackground from './AnimatedProfileBackground';
import { getProfileStyle } from '../utils/profileStyles';
import { useState } from 'react';
import { Box, Typography, Button, IconButton, Snackbar, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Email, Phone, LocationOnOutlined, IosShare } from '@mui/icons-material';

export default function CtechProfile({ company, logo, headerColor = '#3673FC', isCtech = true, headerImage, profileStyle = 'normal', preview = false }) {
  const style = getProfileStyle(profileStyle);
  const modern = style === 'modern';
  const imageHeader = style === 'image';
  const [notice, setNotice] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const address = company.address || (isCtech ? '1291/G, 47th St, PHASE-II, Sathuvachari, Vellore, Tamil Nadu' : '');
  const commas = [...address.matchAll(/,/g)].map(match => match.index);
  const splitAt = commas.reduce((best, index) => Math.abs(index - address.length / 2) < Math.abs(best - address.length / 2) ? index : best, commas[0] ?? -1);
  const addressLines = splitAt >= 0 ? [address.slice(0, splitAt + 1).trim(), address.slice(splitAt + 1).trim()] : [address];
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: company.name, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setNotice('Profile link copied'); }
    } catch (error) {
      if (error.name !== 'AbortError') setShareOpen(true);
    }
  };
  const contactStyle = { borderRadius: 8, bgcolor: { xs: '#fff', sm: '#f4f4f7' }, color: '#27272a', px: 2, py: 1, fontWeight: 500, fontSize: { xs: 13, sm: 14 }, '&:hover': { bgcolor: '#e9ebf2' } };
  return (
    <Box sx={{ position: 'relative', pt: modern ? { xs: '155px', sm: '215px' } : imageHeader ? { xs: '180px', sm: '300px' } : { xs: '90px', sm: '232px' }, px: { xs: 1.5, sm: 2 } }}>
      <Box aria-hidden="true" sx={{ position: 'absolute', inset: '0 0 auto', height: modern ? { xs: 290, sm: 490 } : imageHeader ? { xs: 230, sm: 440 } : { xs: 90, sm: 410 }, overflow: 'hidden', bgcolor: headerColor, ...(modern && { background: 'linear-gradient(135deg, #10243a, ' + headerColor + ')' }), clipPath: modern || imageHeader ? 'none' : { xs: 'none', sm: 'polygon(0 0, 100% 0, 100% 66%, 0 100%)' } }}>
        {imageHeader && <Box component="img" src={headerImage} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />}
        {imageHeader && <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0002, #0000 40%, #0005)' }} />}
        {modern && <AnimatedProfileBackground color={headerColor} />}
        {!modern && <Box sx={{ position: 'absolute', top: '-70%', left: '10%', width: '65%', height: '190%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.13), transparent 65%)', pointerEvents: 'none' }} />}
      </Box>
      {!preview && <Tooltip title="Share profile"><IconButton aria-label="Share company profile" onClick={share} sx={{ position: 'absolute', top: 12, right: 14, color: '#fff', bgcolor: 'rgba(0,0,0,0.16)', width: 44, height: 44, borderRadius: '50%', '&:hover': { bgcolor: 'rgba(0,0,0,0.25)' } }}><IosShare fontSize="small" /></IconButton></Tooltip>}
      <Box sx={{ position: 'relative', maxWidth: 900, mx: 'auto', bgcolor: modern ? 'rgba(255,255,255,0.94)' : { xs: 'transparent', sm: '#fff' }, ...(modern && { backdropFilter: 'blur(20px)', border: '1px solid #ffffffaa' }), borderRadius: modern ? { xs: '24px', sm: '32px' } : '2px', textAlign: 'center', px: { xs: modern ? 1 : 0, sm: 5 }, pb: { xs: modern ? 3 : 1, sm: 5.5 }, boxShadow: modern ? '0 24px 70px rgba(24,32,48,0.18)' : { xs: 'none', sm: '0 20px 42px rgba(24,32,48,0.12)' } }}>
        <Box component="img" src={logo} alt={company.name} sx={{ width: { xs: 120, sm: 200 }, height: { xs: 120, sm: 200 }, aspectRatio: '1 / 1', flexShrink: 0, borderRadius: '50%', objectFit: 'contain', bgcolor: '#fff', border: '3px solid #e5e5e5', boxShadow: '0 14px 36px rgba(0,0,0,0.16)', mt: { xs: '-50px', sm: '-60px' }, mb: { xs: 2, sm: 3 }, p: 1 }} />
        <Typography component="h1" sx={{ color: '#202020', fontSize: { xs: modern ? 'clamp(13px, 4.7vw, 22px)' : 'clamp(14px, 5vw, 23px)', sm: 28 }, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.22, maxWidth: 620, mx: 'auto' }}>
          {isCtech ? <><Box component="span" sx={{ display: 'block', whiteSpace: 'nowrap' }}>C-TECH ENGINEERING &amp;</Box><Box component="span" sx={{ display: 'block', whiteSpace: 'nowrap' }}>CONSTRUCTION (P) LIMITED</Box></> : company.name}
        </Typography>
        <Box sx={{ mt: 1.5, color: '#71717a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
          {address && <LocationOnOutlined sx={{ fontSize: 23, flexShrink: 0 }} />}
          <Typography variant="body2" sx={{ fontSize: { xs: 'clamp(11px, 3.5vw, 14px)', sm: 14 }, fontWeight: 400, lineHeight: 1.6, maxWidth: 540, minWidth: 0, textAlign: 'center', overflowWrap: 'anywhere' }}>
            {address ? addressLines.map((line, index) => <Box component="span" key={index} sx={{ display: 'block' }}>{line}</Box>) : company.description}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.25, mt: 2, flexWrap: 'wrap' }}>
          {company.email && <Button href={preview ? undefined : 'mailto:' + company.email} startIcon={<Email sx={{ color: headerColor }} />} sx={contactStyle}>Email</Button>}
          {company.phone && <Button href={preview ? undefined : 'tel:' + company.phone} startIcon={<Phone sx={{ color: '#00c984' }} />} sx={contactStyle}>Call</Button>}
        </Box>
      </Box>
      <Dialog open={shareOpen} onClose={() => setShareOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Share this profile</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Copy this link and share it with anyone.</Typography>
          <TextField label="Profile link" value={window.location.href} fullWidth slotProps={{ input: { readOnly: true } }} onFocus={event => event.target.select()} />
        </DialogContent>
        <DialogActions><Button onClick={() => setShareOpen(false)}>Done</Button></DialogActions>
      </Dialog>
      <Snackbar open={Boolean(notice)} message={notice} autoHideDuration={4000} onClose={() => setNotice('')} />
    </Box>
  );
}
