import ModernSocialHub from '../../components/ModernSocialHub';
import CtechProfile from '../../components/CtechProfile';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, TextField, IconButton,
  Grid, Dialog, DialogTitle, DialogContent, DialogActions, Chip, InputAdornment,
  CircularProgress, Skeleton, Divider, Tooltip, FormControl, Select, MenuItem, RadioGroup, Radio, FormControlLabel
} from '@mui/material';
import {
  doc, getDoc, collection, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Delete as DeleteIcon, Edit as EditIcon, ArrowBack as ArrowBackIcon,
  Add as AddIcon, OpenInNew as OpenInNewIcon, Link as LinkIcon,
} from '@mui/icons-material';
import * as MuiIcons from '@mui/icons-material';
import SnackbarAlert from '../../components/SnackbarAlert';
import { PROFILE_STYLES, getProfileStyle } from '../../utils/profileStyles';
import { getCompanyAssets } from '../../utils/companyAssets';
import CompanyShareTools from '../../components/CompanyShareTools';
import { linkStatus, localDateInput, schedulePayload, sortLinks } from '../../utils/links';
import { profileUrl } from '../../utils/profileUrl';
import useLinkClock from '../../hooks/useLinkClock';
import { Switch } from '@mui/material';
import { writeBatch } from 'firebase/firestore';

const PRESETS = [
  { label: 'Twitter/X', color: 'linear-gradient(135deg,#1DA1F2,#0d83c9)' },
  { label: 'Instagram', color: 'linear-gradient(45deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' },
  { label: 'LinkedIn', color: 'linear-gradient(135deg,#0077b5,#005e93)' },
  { label: 'YouTube', color: 'linear-gradient(135deg,#FF0000,#b30000)' },
  { label: 'GitHub', color: 'linear-gradient(135deg,#2d333b,#161b22)' },
  { label: 'WhatsApp', color: 'linear-gradient(135deg,#25D366,#128C7E)' },
  { label: 'TikTok', color: 'linear-gradient(135deg,#010101,#2c2c2c)' },
  { label: 'Pinterest', color: 'linear-gradient(135deg,#E60023,#ad081b)' },
  { label: 'Snapchat', color: 'linear-gradient(135deg,#FFFC00,#e5e500)' },
  { label: 'Teal', color: 'linear-gradient(135deg,#0d9488,#0f766e)' },
  { label: 'Ocean', color: 'linear-gradient(135deg,#0369a1,#075985)' },
  { label: 'Slate', color: '#475569' },
];

const DEFAULT_THEME = { profileStyle: 'normal', backgroundColor: '#ffffff', textColor: '#172033', buttonStyle: 'outlined', cardStyle: 'glass' };

const EMPTY_FORM = { name: '', url: '', bio: '', icon: 'Link', background: PRESETS[9].color, enabled: true, startsAt: '', endsAt: '' };

function SkeletonCard() {
  return (
    <Card sx={{ p: 2.5, mb: 1.5 }}>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2, flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton height={20} width="45%" sx={{ mb: 0.5 }} />
          <Skeleton height={14} width="65%" />
        </Box>
      </Box>
    </Card>
  );
}

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [links, setLinks] = useState([]);
  const now = useLinkClock(links);
  const [dragId, setDragId] = useState(null);
  const [updatingLinks, setUpdatingLinks] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [themeForm, setThemeForm] = useState(DEFAULT_THEME);
  const [savingTheme, setSavingTheme] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [savedTheme, setSavedTheme] = useState(DEFAULT_THEME);
  const themeChanged = Object.keys(DEFAULT_THEME).some(key => themeForm[key] !== savedTheme[key]);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const closeToast = () => setToast(t => ({ ...t, open: false }));

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'companies', id));
      if (snap.exists()) {
        const data = snap.data();
        setCompany({ id: snap.id, ...data });
        const loadedTheme = Object.fromEntries(Object.entries(DEFAULT_THEME).map(([key, fallback]) => [key, data.theme?.[key] || fallback]));
        loadedTheme.profileStyle = getProfileStyle(data.theme?.profileStyle);
        setSavedTheme(loadedTheme);
        setThemeForm(loadedTheme);
      } else {
        navigate('/admin');
      }
    })();

    return onSnapshot(collection(db, `companies/${id}/links`), snap => {
      setLinks(
        sortLinks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      );
      setLoading(false);
    });
  }, [id, navigate]);

  const openAdd = () => { setForm(EMPTY_FORM); setFormMode('add'); setOpenModal(true); };
  const openEdit = (link) => {
    setCurrentId(link.id);
    setForm({ name: link.name, url: link.url, bio: link.bio || '', icon: link.icon || 'Link', background: link.background || PRESETS[9].color, enabled: link.enabled !== false, startsAt: localDateInput(link.startsAt), endsAt: localDateInput(link.endsAt) });
    setFormMode('edit');
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.url) {
      return setToast({ open: true, message: 'Name and URL are required.', severity: 'error' });
    }
    let schedule;
    try {
      schedule = schedulePayload(form.startsAt, form.endsAt);
      if (!['https:', 'http:'].includes(new URL(form.url).protocol)) throw new Error('Use an http or https link.');
    } catch (error) { return setToast({ open: true, message: error.message, severity: 'error' }); }
    setSaving(true);
    try {
      const payload = { name: form.name, url: form.url, bio: form.bio, icon: form.icon, background: form.background, enabled: form.enabled, ...schedule };
      if (formMode === 'add') {
        await addDoc(collection(db, `companies/${id}/links`), { ...payload, order: Math.min(0, ...links.map(link => Number.isFinite(link.order) ? link.order : 0)) - 1, createdAt: serverTimestamp() });
        setToast({ open: true, message: 'Link added!', severity: 'success' });
      } else {
        await updateDoc(doc(db, `companies/${id}/links`, currentId), payload);
        setToast({ open: true, message: 'Link updated!', severity: 'success' });
      }
      setOpenModal(false);
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: 'Error saving link.', severity: 'error' });
    }
    setSaving(false);
  };

  const handleSaveTheme = async () => {
    setSavingTheme(true);
    try {
      await updateDoc(doc(db, 'companies', id), { theme: themeForm });
      setSavedTheme({ ...themeForm });
      setToast({ open: true, message: 'Theme updated!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: 'Error saving theme.', severity: 'error' });
    }
    setSavingTheme(false);
  };

  const handleDelete = async (linkId) => {
    if (!window.confirm('Delete this link?')) return;
    try {
      await deleteDoc(doc(db, `companies/${id}/links`, linkId));
      setToast({ open: true, message: 'Deleted', severity: 'success' });
    } catch {
      setToast({ open: true, message: 'Error deleting', severity: 'error' });
    }
  };

  const reorder = async (fromId, toId) => {
    if (updatingLinks || !fromId || fromId === toId) return;
    const from = links.findIndex(link => link.id === fromId), to = links.findIndex(link => link.id === toId);
    if (from < 0 || to < 0) return;
    const ordered = [...links];
    ordered.splice(to, 0, ordered.splice(from, 1)[0]);
    setUpdatingLinks(true); setDragId(null);
    try {
      const batch = writeBatch(db);
      ordered.forEach((link, index) => batch.update(doc(db, `companies/${id}/links`, link.id), { order: index }));
      await batch.commit();
      setToast({ open: true, message: 'Link order saved.', severity: 'success' });
    } catch { setToast({ open: true, message: 'Could not save link order. Please retry.', severity: 'error' }); }
    finally { setUpdatingLinks(false); }
  };

  const toggleLink = async link => {
    setUpdatingLinks(true);
    try { await updateDoc(doc(db, `companies/${id}/links`, link.id), { enabled: link.enabled === false }); }
    catch { setToast({ open: true, message: 'Could not update link visibility.', severity: 'error' }); }
    finally { setUpdatingLinks(false); }
  };

  return (
    <Box>
      {/* Back */}
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin')} sx={{ mb: 2, ml: -1 }}>
        All companies
      </Button>

      {/* Company Banner */}
      {company && (
        <Card sx={{ mb: 3, overflow: 'hidden' }}>
          {company.headerUrl ? (
            <Box sx={{ width: '100%', height: { xs: 110, sm: 160 }, position: 'relative', overflow: 'hidden' }}>
              <Box component="img" src={company.headerUrl} alt="header"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 40%,rgba(7,11,20,0.85) 100%)' }} />
            </Box>
          ) : null}

          <CardContent sx={{ p: { xs: 2.5, sm: 4 }, mt: 0, position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center', minWidth: 0, flex: '1 1 300px' }}>
                {/* Company Logo from local assets */}
                {(() => {
                  const cAssets = getCompanyAssets(company.slug);
                  return (
                    <Box sx={{
                      width: { xs: 56, sm: 72 }, height: { xs: 56, sm: 72 },
                      borderRadius: 3,
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: 'none',
                    }}>
                      <Box component="img" src={cAssets.logo} alt={company.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.5 }} />
                    </Box>
                  );
                })()}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 1.3, fontSize: 10 }}>Company profile</Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, overflowWrap: 'anywhere' }} mb={0.3}>{company.name}</Typography>
                  {company.description && (
                    <Typography variant="body2" color="text.secondary"
                      sx={{ maxWidth: { xs: '100%', sm: 420 }, wordBreak: 'break-word', lineHeight: 1.6 }}>
                      {company.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    <Chip icon={<LinkIcon sx={{ fontSize: 12 }} />} label={`/${company.slug}`} size="small"
                      sx={{ bgcolor: '#f6f8fa', color: '#526171', fontSize: '0.72rem', height: 28, maxWidth: '100%' }} />
                    {company.email && (
                      <Chip icon={<MuiIcons.Email sx={{ fontSize: 12 }} />} label={company.email} size="small"
                        sx={{ bgcolor: '#f6f8fa', color: '#526171', fontSize: '0.72rem', height: 28, maxWidth: '100%' }} />
                    )}
                    {company.phone && (
                      <Chip icon={<MuiIcons.Phone sx={{ fontSize: 12 }} />} label={company.phone} size="small"
                        sx={{ bgcolor: '#f6f8fa', color: '#526171', fontSize: '0.72rem', height: 28, maxWidth: '100%' }} />
                    )}
                  </Box>
                </Box>
              </Box>
              <Button variant="outlined" endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                component="a" href={profileUrl(company.slug)} target="_blank" rel="noopener noreferrer" size="small" sx={{ flexShrink: 0 }}>
                View public page
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {company && <CompanyShareTools key={company.id} company={company} />}
      {/* Theme Settings */}
      {company && (
        <Card sx={{ mb: 4, overflow: 'hidden' }}>
          <Box sx={{ p: { xs: 2.5, sm: 4 }, borderBottom: '1px solid #e8ecf2' }}>
            <Typography id="profile-style-label" variant="h6" sx={{ fontSize: '1.1rem' }}>Public profile style</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>Choose a look for this company, then save your changes.</Typography>
            <RadioGroup aria-labelledby="profile-style-label" value={themeForm.profileStyle} onChange={e => setThemeForm({ ...themeForm, profileStyle: e.target.value })} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
              {PROFILE_STYLES.map(style => {
                const selected = themeForm.profileStyle === style.value;
                const color = /c-tech|ctech/i.test(company.slug) ? '#3673FC' : '#d53b43';
                return <Box key={style.value} sx={{ border: '2px solid', borderColor: selected ? 'primary.main' : '#e8ecf2', borderRadius: 3, overflow: 'hidden', bgcolor: selected ? '#f5f8ff' : '#fff', '&:focus-within': { outline: '2px solid #3673FC', outlineOffset: 3 } }}>
                  <Box component="label" htmlFor={'profile-style-' + style.value} aria-hidden="true" sx={{ display: 'block', cursor: savingTheme ? 'default' : 'pointer', height: 92, position: 'relative', overflow: 'hidden', bgcolor: '#f4f4f7' }}>
                    <Box sx={{ height: 55, background: style.value === 'modern' ? 'linear-gradient(120deg, #10243a, ' + color + ', #8edcfa)' : color, ...(style.value === 'image' && { backgroundImage: 'url(' + getCompanyAssets(company.slug).header + ')', backgroundSize: 'cover', backgroundPosition: 'center' }) }} />
                    <Box sx={{ position: 'absolute', top: 36, left: 'calc(50% - 21px)', width: 42, height: 42, borderRadius: '50%', bgcolor: '#fff', p: 0.5, boxShadow: '0 3px 10px #0002' }}><Box component="img" src={getCompanyAssets(company.slug).logo} alt="" sx={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit' }} /></Box>
                  </Box>
                  <FormControlLabel value={style.value} disabled={savingTheme} control={<Radio size="small" inputProps={{ id: 'profile-style-' + style.value }} />} sx={{ m: 0, p: 1, width: '100%', alignItems: 'flex-start' }} label={<Box sx={{ pt: 0.6 }}><Typography variant="body2" fontWeight={600}>{style.label}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, pr: 1 }}>{style.description}</Typography></Box>} />
                </Box>;
              })}
            </RadioGroup>
          </Box>
          <Box sx={{ p: { xs: 2.5, sm: 4 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(200px, 0.8fr) minmax(0, 2fr)' }, gap: { xs: 3, md: 6 } }}>
            <Box>
              <Box sx={{ width: 42, height: 42, display: 'grid', placeItems: 'center', bgcolor: '#eaf1ff', color: 'primary.main', borderRadius: 2.5, mb: 2 }}><MuiIcons.PaletteOutlined fontSize="small" /></Box>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 0.75 }}>Page appearance</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: 270 }}>Make this profile feel like your brand. Choose your page colors and how buttons and links appear.</Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, alignContent: 'start' }}>
              {[{ key: 'backgroundColor', label: 'Background color', hint: 'The canvas behind your profile.' }, { key: 'textColor', label: 'Text color', hint: 'Your company name and description.' }].map(({ key, label, hint }) => (
                <Box key={key}>
                  <Typography component="label" htmlFor={key} variant="body2" fontWeight={600} sx={{ display: 'block', mb: 1 }}>{label}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, border: '1px solid #dce2e8', borderRadius: 2, px: 1.5, height: 50, bgcolor: '#fff', '&:focus-within': { borderColor: 'primary.main', boxShadow: '0 0 0 3px #eaf1ff' } }}>
                    <Box component="input" id={key} type="color" value={themeForm[key]} disabled={savingTheme} onChange={e => setThemeForm({ ...themeForm, [key]: e.target.value })} sx={{ width: 30, height: 30, p: 0, border: 0, bgcolor: 'transparent', cursor: 'pointer', flexShrink: 0, '&::-webkit-color-swatch-wrapper': { p: 0 }, '&::-webkit-color-swatch': { border: '1px solid #dce2e8', borderRadius: '6px' } }} />
                    <Typography sx={{ fontFamily: 'monospace', fontSize: 14, flex: 1 }}>{themeForm[key].toUpperCase()}</Typography>
                    <MuiIcons.UnfoldMore sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>{hint}</Typography>
                </Box>
              ))}
              {[{ key: 'buttonStyle', label: 'Button style', options: [['outlined', 'Outlined'], ['contained', 'Solid'], ['text', 'Minimal']] }, { key: 'cardStyle', label: 'Link card style', options: [['glass', 'Glass'], ['solid', 'Solid'], ['transparent', 'Transparent']] }].map(({ key, label, options }) => (
                <FormControl fullWidth key={key} disabled={savingTheme}>
                  <Typography component="label" id={key + '-label'} variant="body2" fontWeight={600} sx={{ mb: 1 }}>{label}</Typography>
                  <Select labelId={key + '-label'} value={themeForm[key]} onChange={e => setThemeForm({ ...themeForm, [key]: e.target.value })} sx={{ height: 50 }}>
                    {options.map(([value, text]) => <MenuItem key={value} value={value}>{text}</MenuItem>)}
                  </Select>
                </FormControl>
              ))}
            </Box>
          </Box>
          <Box sx={{ px: { xs: 2.5, sm: 4 }, py: 2, borderTop: '1px solid #e8ecf2', bgcolor: '#fafcfc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary" role="status">{themeChanged ? 'You have unsaved changes.' : 'Changes will apply to your public page.'}</Typography>
            <Box sx={{ display: 'flex', gap: 1, ml: 'auto', flexWrap: 'wrap' }}>
              <Button variant="outlined" onClick={() => setPreviewOpen(true)} startIcon={<MuiIcons.VisibilityOutlined />}>Preview style</Button>
              {themeChanged && <Button color="secondary" disabled={savingTheme} onClick={() => setThemeForm({ ...savedTheme })}>Discard</Button>}
              <Button variant="contained" onClick={handleSaveTheme} disabled={savingTheme || !themeChanged} startIcon={savingTheme ? <CircularProgress size={16} color="inherit" /> : <MuiIcons.CheckRounded sx={{ fontSize: 18 }} />}>
                {savingTheme ? 'Saving...' : 'Save changes'}
              </Button>
            </Box>
          </Box>
        </Card>
      )}

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} fullWidth maxWidth={themeForm.profileStyle === 'modern' ? 'xl' : 'md'} aria-labelledby="profile-preview-title">
        <DialogTitle id="profile-preview-title">{PROFILE_STYLES.find(style => style.value === themeForm.profileStyle)?.label} preview</DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#f4f4f7', overflowX: 'hidden' }}>
          {company && (themeForm.profileStyle === 'modern' ? <ModernSocialHub company={company} logo={getCompanyAssets(company.slug).logo} links={links} preview /> : <CtechProfile key={themeForm.profileStyle} company={company} logo={getCompanyAssets(company.slug).logo} headerImage={getCompanyAssets(company.slug).header} isCtech={/c-tech|ctech/i.test(company.slug)} headerColor={/c-tech|ctech/i.test(company.slug) ? '#3673FC' : '#d53b43'} profileStyle={themeForm.profileStyle} preview />)}
        </DialogContent>
        <DialogActions><Typography variant="caption" color="text.secondary" sx={{ mr: 'auto', pl: 1 }}>Preview only. Save changes to update the public page.</Typography><Button onClick={() => setPreviewOpen(false)}>Close</Button></DialogActions>
      </Dialog>

      {/* Links header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Social Links</Typography>
          <Typography variant="body2" color="text.secondary">Drag the handle or use arrows to reorder. Scheduled times use your local timezone.</Typography>
          {!loading && <Typography variant="caption" color="text.secondary">{links.length} link{links.length !== 1 ? 's' : ''}</Typography>}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small">
          Add Link
        </Button>
      </Box>

      {/* Links — full-width stacked list */}
      {loading ? (
        <Box>
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </Box>
      ) : links.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6, border: '1px dashed #cbd5e1', background: 'transparent' }}>
          <LinkIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1.5 }} />
          <Typography color="text.secondary" variant="body2">No links yet. Add your first social link.</Typography>
        </Card>
      ) : (
        /* Full-width links list */
        <Box>
          {links.map((link, index) => {
            const Ico = MuiIcons[link.icon] || MuiIcons['Link'];
            return (
              <Card
                key={link.id}
                onDragOver={event => { if (dragId && !updatingLinks) event.preventDefault(); }}
                onDrop={event => { event.preventDefault(); void reorder(dragId, link.id); }}
                className="lift"
                sx={{
                  mb: 1.5,
                  width: '100%',
                  background: link.background?.includes('rgba(255') ? '#475569' : (link.background || '#475569'),
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2, flexWrap: 'wrap' }}>
                  <IconButton draggable={!updatingLinks} aria-label={`Drag to reorder ${link.name}`} onDragStart={event => { event.dataTransfer.setData('text/plain', link.id); event.dataTransfer.effectAllowed = 'move'; setDragId(link.id); }} onDragEnd={() => setDragId(null)} sx={{ color: 'white', cursor: 'grab' }}><MuiIcons.DragIndicator /></IconButton>
                  {/* Icon */}
                  <Box sx={{
                    width: 48, height: 48, borderRadius: 2,
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Ico sx={{ fontSize: 24, color: '#fff' }} />
                  </Box>

                  {/* Text */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={600} color="white" noWrap>
                      {link.name}
                    </Typography>
                    <Chip size="small" label={linkStatus(link, now)} sx={{ bgcolor: '#fff', color: '#172033', mt: 0.5 }} />
                    {(link.startsAt || link.endsAt) && <Typography variant="caption" display="block" sx={{ color: '#fff', mt: 0.5 }}>{link.startsAt ? `From ${localDateInput(link.startsAt).replace('T', ' ')}` : 'No start limit'}{link.endsAt ? ` until ${localDateInput(link.endsAt).replace('T', ' ')}` : ''}</Typography>}
                    {link.bio && (
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }} noWrap>
                        {link.bio}
                      </Typography>
                    )}
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <Switch checked={link.enabled !== false} disabled={updatingLinks} onChange={() => toggleLink(link)} inputProps={{ 'aria-label': `Enable ${link.name}` }} />
                    <IconButton size="small" sx={{ color: '#fff' }} disabled={updatingLinks || index === 0} aria-label={`Move ${link.name} up`} onClick={() => reorder(link.id, links[index - 1].id)}><MuiIcons.ArrowUpward fontSize="small" /></IconButton>
                    <IconButton size="small" sx={{ color: '#fff' }} disabled={updatingLinks || index === links.length - 1} aria-label={`Move ${link.name} down`} onClick={() => reorder(link.id, links[index + 1].id)}><MuiIcons.ArrowDownward fontSize="small" /></IconButton>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(link)}
                        aria-label={`Edit ${link.name}`} sx={{ color: '#fff', background: 'rgba(255,255,255,0.15)', '&:hover': { background: 'rgba(255,255,255,0.25)' } }}>
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(link.id)}
                        aria-label={`Delete ${link.name}`} sx={{ color: '#b91c1c', background: '#fff', '&:hover': { color: '#b91c1c', background: '#fee2e2' } }}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth scroll="paper">
        <DialogTitle sx={{ pb: 1, fontWeight: 700, fontSize: '1.05rem' }}>
          {formMode === 'add' ? 'Add Social Link' : 'Edit Social Link'}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid size={12}><FormControlLabel control={<Switch checked={form.enabled} onChange={e => setField('enabled', e.target.checked)} />} label="Enabled on public profile" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField type="datetime-local" label="Start time (optional)" value={form.startsAt} onChange={e => setField('startsAt', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth size="small" helperText="Your local time. Blank = immediately." /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField type="datetime-local" label="End time (optional)" value={form.endsAt} onChange={e => setField('endsAt', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth size="small" helperText="Your local time. Blank = no expiry." /></Grid>
            <Grid size={{ xs: 12, sm: 7 }}>
              <TextField label="Platform Name *" fullWidth value={form.name}
                onChange={e => setField('name', e.target.value)} placeholder="e.g. Instagram" size="small" />
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                label="MUI Icon Name"
                fullWidth size="small"
                value={form.icon}
                onChange={e => setField('icon', e.target.value)}
                placeholder="Instagram"
                helperText="e.g. LinkedIn, YouTube"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {(() => { const I = MuiIcons[form.icon]; return I ? <I sx={{ fontSize: 17, color: '#34d399' }} /> : null; })()}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="URL *" fullWidth value={form.url}
                onChange={e => setField('url', e.target.value)} placeholder="https://…" size="small" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Bio / Description" fullWidth multiline rows={2}
                value={form.bio} onChange={e => setField('bio', e.target.value)} size="small" />
            </Grid>

            {/* Background presets */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.2 }}>
                Background Style
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {PRESETS.map((p, i) => (
                  <Tooltip key={i} title={p.label} placement="top">
                    <Box
                      onClick={() => setField('background', p.color)}
                      sx={{
                        width: 32, height: 32, borderRadius: 1.5, background: p.color,
                        cursor: 'pointer', transition: 'all 0.2s',
                        border: form.background === p.color ? '2px solid #3673FC' : '2px solid transparent',
                        boxShadow: form.background === p.color ? '0 0 0 3px #b8ceff' : 'none',
                        transform: form.background === p.color ? 'scale(1.18)' : 'scale(1)',
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>

              {/* Live preview */}
              <Box sx={{ p: 2, borderRadius: 3, background: form.background?.includes('rgba(255') ? '#475569' : form.background, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 42, height: 42, borderRadius: 2, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {(() => { const I = MuiIcons[form.icon] || MuiIcons['Link']; return <I sx={{ color: '#fff', fontSize: 22 }} />; })()}
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="white">{form.name || 'Platform Name'}</Typography>
                  {form.bio && <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>{form.bio}</Typography>}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, gap: 1 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}>
            {saving ? 'Saving…' : 'Save Link'}
          </Button>
        </DialogActions>
      </Dialog>

      <SnackbarAlert {...toast} onClose={closeToast} />
    </Box>
  );
}
