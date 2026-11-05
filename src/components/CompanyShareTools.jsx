import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { campaignUrl, profileUrl } from '../utils/profileUrl';
import { downloadBlob } from '../utils/analyticsExport';

export default function CompanyShareTools({ company }) {
  const [source, setSource] = useState('qr');
  const [medium, setMedium] = useState('offline');
  const [campaign, setCampaign] = useState('visiting-card');
  const [size, setSize] = useState(1024);
  const [qr, setQr] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const url = campaignUrl(profileUrl(company.slug), { source, medium, campaign });
  useEffect(() => {
    let active = true;
    import('qrcode').then(async ({ default: QRCode }) => {
      const options = { errorCorrectionLevel: 'M', margin: 4, width: size };
      const [png, svg] = await Promise.all([QRCode.toDataURL(url, options), QRCode.toString(url, { ...options, type: 'svg' })]);
      if (active) { setQr({ png, svg, url, size }); setError(''); }
    }).catch(() => { if (active) { setQr(null); setError('QR generation failed. Try a shorter campaign name.'); } });
    return () => { active = false; };
  }, [url, size]);
  const ready = qr?.url === url && qr?.size === size;
  const preset = value => {
    setSource(value); setMedium(value === 'qr' ? 'offline' : 'social');
    setCampaign(value === 'qr' ? 'visiting-card' : 'profile'); setNotice('');
  };
  const download = format => {
    if (!ready) return;
    if (format === 'svg') downloadBlob(new Blob([qr.svg], { type: 'image/svg+xml' }), `${company.slug}-qr.svg`);
    else { const anchor = document.createElement('a'); anchor.href = qr.png; anchor.download = `${company.slug}-qr.png`; anchor.click(); }
  };
  return <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
    <Typography variant="h6">QR code & campaign links</Typography>
    <Typography variant="body2" color="text.secondary" mb={2}>Create a tracked profile link for visiting cards, posters or social media.</Typography>
    <Stack direction={{ xs: 'column', md: 'row' }} gap={3}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" gap={1} mb={2} flexWrap="wrap"><Button onClick={() => preset('qr')}>QR / print</Button><Button onClick={() => preset('instagram')}>Instagram</Button><Button onClick={() => preset('facebook')}>Facebook</Button></Stack>
        <Stack gap={2}>
          <TextField label="Source" value={source} onChange={e => setSource(e.target.value)} inputProps={{ maxLength: 100 }} helperText="Example: qr, instagram, newsletter" size="small" />
          <TextField label="Medium" value={medium} onChange={e => setMedium(e.target.value)} inputProps={{ maxLength: 100 }} helperText="Example: offline, social, email" size="small" />
          <TextField label="Campaign" value={campaign} onChange={e => setCampaign(e.target.value)} inputProps={{ maxLength: 100 }} size="small" />
          <TextField label="Tracked profile URL" value={url} slotProps={{ input: { readOnly: true } }} multiline size="small" />
          <Button variant="outlined" onClick={async () => { try { await navigator.clipboard.writeText(url); setNotice('Link copied.'); } catch { setNotice('Select the URL above and copy it manually.'); } }}>Copy campaign link</Button>
          {notice && <Typography role="status" variant="caption">{notice}</Typography>}
        </Stack>
      </Box>
      <Stack alignItems="center" gap={2} sx={{ width: { xs: '100%', md: 270 } }}>
        {ready ? <Box component="img" src={qr.png} alt={`QR code for ${company.name}`} sx={{ width: 220, height: 220, maxWidth: '100%' }} /> : <Box role="status" sx={{ height: 220, display: 'grid', placeItems: 'center' }}>Generating QR...</Box>}
        <TextField select fullWidth label="PNG resolution" value={size} onChange={e => setSize(Number(e.target.value))} size="small">{[512, 1024, 2048].map(value => <MenuItem value={value} key={value}>{value} × {value} px</MenuItem>)}</TextField>
        <Stack direction="row" gap={1}><Button disabled={!ready} onClick={() => download('png')} variant="contained">PNG</Button><Button disabled={!ready} onClick={() => download('svg')} variant="outlined">SVG</Button></Stack>
        <Typography variant="caption" color="text.secondary">Use SVG for sharp print at any size. Scan a proof before printing; changing the profile slug can break printed codes.</Typography>
      </Stack>
    </Stack>
    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
  </Card>;
}
