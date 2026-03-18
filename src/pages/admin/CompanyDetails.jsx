import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, TextField, IconButton,
  Grid, Dialog, DialogTitle, DialogContent, DialogActions, Chip, InputAdornment,
  CircularProgress, Skeleton, Divider, Tooltip,
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
import { getCompanyAssets } from '../../utils/companyAssets';

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
  { label: 'Indigo', color: 'linear-gradient(135deg,#6366f1,#4f46e5)' },
  { label: 'Purple', color: 'linear-gradient(135deg,#7c3aed,#8b5cf6)' },
  { label: 'Glass', color: 'rgba(255,255,255,0.07)' },
];

const EMPTY_FORM = { name: '', url: '', bio: '', icon: 'Link', background: PRESETS[9].color };

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const closeToast = () => setToast(t => ({ ...t, open: false }));

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'companies', id));
      if (snap.exists()) setCompany({ id: snap.id, ...snap.data() });
      else navigate('/admin');
    })();

    return onSnapshot(collection(db, `companies/${id}/links`), snap => {
      setLinks(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      );
      setLoading(false);
    });
  }, [id, navigate]);

  const openAdd = () => { setForm(EMPTY_FORM); setFormMode('add'); setOpenModal(true); };
  const openEdit = (link) => {
    setCurrentId(link.id);
    setForm({ name: link.name, url: link.url, bio: link.bio || '', icon: link.icon || 'Link', background: link.background || PRESETS[9].color });
    setFormMode('edit');
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.url) {
      return setToast({ open: true, message: 'Name and URL are required.', severity: 'error' });
    }
    setSaving(true);
    try {
      const payload = { name: form.name, url: form.url, bio: form.bio, icon: form.icon, background: form.background };
      if (formMode === 'add') {
        await addDoc(collection(db, `companies/${id}/links`), { ...payload, createdAt: serverTimestamp() });
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

  const handleDelete = async (linkId) => {
    if (!window.confirm('Delete this link?')) return;
    try {
      await deleteDoc(doc(db, `companies/${id}/links`, linkId));
      setToast({ open: true, message: 'Deleted', severity: 'success' });
    } catch {
      setToast({ open: true, message: 'Error deleting', severity: 'error' });
    }
  };

  return (
    <Box>
      {/* Back */}
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin')} sx={{ mb: 2, ml: -1 }}>
        Back
      </Button>

      {/* Company Banner */}
      {company && (
        <Card sx={{ mb: 3, overflow: 'hidden' }}>
          {/* Banner top bar */}
          <Box sx={{ height: 5, background: 'linear-gradient(90deg,#ffffff,#d4d4d8,#a1a1aa)' }} />
          {company.headerUrl ? (
            <Box sx={{ width: '100%', height: { xs: 110, sm: 160 }, position: 'relative', overflow: 'hidden' }}>
              <Box component="img" src={company.headerUrl} alt="header"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 40%,rgba(7,11,20,0.85) 100%)' }} />
            </Box>
          ) : null}

          <CardContent sx={{ p: { xs: 2.5, sm: 3 }, mt: company.headerUrl ? -3 : 0, position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                {/* Company Logo from local assets */}
                {(() => {
                  const cAssets = getCompanyAssets(company.slug);
                  return (
                    <Box sx={{
                      width: { xs: 56, sm: 72 }, height: { xs: 56, sm: 72 },
                      borderRadius: 3,
                      background: '#fff',
                      border: '3px solid rgba(255,255,255,0.1)',
                      overflow: 'hidden', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    }}>
                      <Box component="img" src={cAssets.logo} alt={company.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.5 }} />
                    </Box>
                  );
                })()}
                <Box>
                  <Typography variant="h5" fontWeight={800} mb={0.3}>{company.name}</Typography>
                  {company.description && (
                    <Typography variant="body2" color="text.secondary"
                      sx={{ maxWidth: { xs: '100%', sm: 420 }, wordBreak: 'break-word', lineHeight: 1.6 }}>
                      {company.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    <Chip icon={<LinkIcon sx={{ fontSize: 12 }} />} label={`/${company.slug}`} size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#d4d4d8', fontSize: '0.68rem' }} />
                    {company.email && (
                      <Chip icon={<MuiIcons.Email sx={{ fontSize: 12 }} />} label={company.email} size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#d4d4d8', fontSize: '0.68rem' }} />
                    )}
                    {company.phone && (
                      <Chip icon={<MuiIcons.Phone sx={{ fontSize: 12 }} />} label={company.phone} size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#d4d4d8', fontSize: '0.68rem' }} />
                    )}
                  </Box>
                </Box>
              </Box>
              <Button variant="outlined" endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                onClick={() => window.open(`/${company.slug}`, '_blank')} size="small" sx={{ flexShrink: 0 }}>
                Public page
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Links header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Social Links</Typography>
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
        <Card sx={{ textAlign: 'center', py: 6, border: '1px dashed rgba(255,255,255,0.08)', background: 'transparent' }}>
          <LinkIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.12)', mb: 1.5 }} />
          <Typography color="text.secondary" variant="body2">No links yet. Add your first social link.</Typography>
        </Card>
      ) : (
        /* Full-width links list */
        <Box>
          {links.map(link => {
            const Ico = MuiIcons[link.icon] || MuiIcons['Link'];
            return (
              <Card
                key={link.id}
                className="lift"
                sx={{
                  mb: 1.5,
                  width: '100%',
                  background: link.background,
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2 }}>
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
                    <Typography variant="subtitle2" fontWeight={700} color="white" noWrap>
                      {link.name}
                    </Typography>
                    {link.bio && (
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }} noWrap>
                        {link.bio}
                      </Typography>
                    )}
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(link)}
                        sx={{ color: 'rgba(255, 255, 255, 1)', background: 'rgba(255, 255, 255, 0.42)', '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.1)' } }}>
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(link.id)}
                        sx={{ color: 'rgba(255, 0, 0, 1)', background: 'rgba(255, 255, 255, 0.42)', '&:hover': { color: '#ff0000ff', background: 'rgba(255, 0, 0, 1)' } }}>
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
            <Grid item xs={12} sm={7}>
              <TextField label="Platform Name *" fullWidth value={form.name}
                onChange={e => setField('name', e.target.value)} placeholder="e.g. Instagram" size="small" />
            </Grid>
            <Grid item xs={12} sm={5}>
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
            <Grid item xs={12}>
              <TextField label="URL *" fullWidth value={form.url}
                onChange={e => setField('url', e.target.value)} placeholder="https://…" size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Bio / Description" fullWidth multiline rows={2}
                value={form.bio} onChange={e => setField('bio', e.target.value)} size="small" />
            </Grid>

            {/* Background presets */}
            <Grid item xs={12}>
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
                        border: form.background === p.color ? '2px solid #ffffff' : '2px solid transparent',
                        boxShadow: form.background === p.color ? '0 0 0 3px rgba(255,255,255,0.3)' : 'none',
                        transform: form.background === p.color ? 'scale(1.18)' : 'scale(1)',
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>

              {/* Live preview */}
              <Box sx={{ p: 2, borderRadius: 3, background: form.background, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
