import { useState } from 'react';
import { Box, Typography, Button, IconButton, Snackbar, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Email, Phone, LocationOnOutlined, IosShare } from '@mui/icons-material';

export default function CtechProfile({ company, logo, headerColor = '#3673FC', isCtech = true }) {
  const [notice, setNotice] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const address = company.address || (isCtech ? '1291/G, 47th St, PHASE-II, Sathuvachari, Vellore, Tamil Nadu' : '');
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: company.name, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setNotice('Profile link copied'); }
    } catch (error) {
      if (error.name !== 'AbortError') setShareOpen(true);
    }
  };
  const contactStyle = { borderRadius: 8, bgcolor: '#f4f4f7', color: '#27272a', px: 2, py: 1, fontWeight: 500, fontSize: { xs: 13, sm: 14 }, '&:hover': { bgcolor: '#e9ebf2' } };
  return (
    <Box sx={{ position: 'relative', pt: { xs: '145px', sm: '232px' }, px: 2 }}>
      <Box aria-hidden="true" sx={{ position: 'absolute', inset: '0 0 auto', height: { xs: 270, sm: 410 }, bgcolor: headerColor, clipPath: 'polygon(0 0, 100% 0, 100% 66%, 0 100%)' }} />
      <Tooltip title="Share profile"><IconButton aria-label="Share company profile" onClick={share} sx={{ position: 'absolute', top: 12, right: 14, color: '#fff', bgcolor: 'rgba(0,0,0,0.16)', width: 44, height: 44, '&:hover': { bgcolor: 'rgba(0,0,0,0.25)' } }}><IosShare fontSize="small" /></IconButton></Tooltip>
      <Box sx={{ position: 'relative', maxWidth: 900, mx: 'auto', bgcolor: '#fff', borderRadius: '2px', textAlign: 'center', px: { xs: 2, sm: 5 }, pb: { xs: 4, sm: 5.5 }, boxShadow: '0 20px 42px rgba(24,32,48,0.12)' }}>
        <Box component="img" src={logo} alt={company.name} sx={{ width: { xs: 132, sm: 200 }, height: { xs: 132, sm: 200 }, borderRadius: '50%', objectFit: 'contain', bgcolor: '#fff', border: '3px solid #e5e5e5', boxShadow: '0 14px 36px rgba(0,0,0,0.16)', mt: { xs: '-44px', sm: '-60px' }, mb: { xs: 2.5, sm: 3 }, p: 1 }} />
        <Typography component="h1" sx={{ color: '#202020', fontSize: { xs: 20, sm: 28 }, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.22, maxWidth: 440, mx: 'auto' }}>
          {isCtech ? <>C-TECH ENGINEERING &amp;<br />CONSTRUCTION (P)<br />LIMITED</> : company.name}
        </Typography>
        <Box sx={{ mt: 2, color: '#71717a' }}>
          {address && <LocationOnOutlined sx={{ fontSize: 23, mb: 0.5 }} />}
          <Typography variant="body2" sx={{ fontSize: { xs: 13, sm: 14 }, fontWeight: 400, lineHeight: 1.6, maxWidth: 360, mx: 'auto' }}>
            {address || company.description}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.25, mt: 2.5, flexWrap: 'wrap' }}>
          {company.email && <Button href={'mailto:' + company.email} startIcon={<Email sx={{ color: headerColor }} />} sx={contactStyle}>Email</Button>}
          {company.phone && <Button href={'tel:' + company.phone} startIcon={<Phone sx={{ color: '#00c984' }} />} sx={contactStyle}>Call</Button>}
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
