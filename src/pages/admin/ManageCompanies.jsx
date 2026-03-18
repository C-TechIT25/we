import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardActionArea, CardContent,
  Button, IconButton, Skeleton, Chip, InputAdornment, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
} from '@mui/material';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import SnackbarAlert from '../../components/SnackbarAlert';

function CompanySkeleton() {
  return (
    <Grid container spacing={2.5}>
      {[...Array(3)].map((_, i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Card sx={{ p: 2.5, height: 160 }}>
            <Skeleton variant="rounded" width="60%" height={22} sx={{ mb: 1.5 }} />
            <Skeleton variant="text" height={16} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" height={16} width="70%" sx={{ mb: 2 }} />
            <Skeleton variant="rounded" width={80} height={22} />
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default function ManageCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'companies'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setCompanies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this company and all its links?')) return;
    try {
      await deleteDoc(doc(db, 'companies', id));
      setToast({ open: true, message: 'Company deleted', severity: 'success' });
    } catch {
      setToast({ open: true, message: 'Failed to delete', severity: 'error' });
    }
  };

  const openEdit = (company, e) => {
    e.stopPropagation();
    setEditingCompany(company);
    setEditName(company.name);
    setEditDesc(company.description || '');
    setEditEmail(company.email || '');
    setEditPhone(company.phone || '');
    setEditSlug(company.slug || '');
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editName.trim()) return;
    setEditLoading(true);
    try {
      const finalSlug = (editSlug.trim() || editName.trim())
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      await updateDoc(doc(db, 'companies', editingCompany.id), {
        name: editName.trim(),
        description: editDesc.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        slug: finalSlug,
      });
      setToast({ open: true, message: 'Company updated', severity: 'success' });
      setEditOpen(false);
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: 'Failed to update company', severity: 'error' });
    }
    setEditLoading(false);
  };

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight={800}
            sx={{ background: 'linear-gradient(135deg,#fff,#a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Companies
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.3}>
            {loading ? '—' : `${companies.length} company${companies.length !== 1 ? 'ies' : 'y'} total`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/create')}
          sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          New Company
        </Button>
      </Box>

      {/* Search */}
      {!loading && companies.length > 3 && (
        <TextField
          size="small"
          placeholder="Search companies…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.3)' }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3, maxWidth: 320 }}
        />
      )}

      {/* Content */}
      {loading ? (
        <CompanySkeleton />
      ) : filtered.length === 0 ? (
        <Card
          sx={{
            border: '1px dashed rgba(255,255,255,0.1)',
            background: 'transparent',
            textAlign: 'center',
            py: 6, px: 3,
          }}
        >
          <BusinessIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.15)', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} color="text.secondary" gutterBottom>
            {search ? 'No matches found' : 'No companies yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {search ? 'Try a different search term.' : 'Create your first company to get started.'}
          </Typography>
          {!search && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/admin/create')}>
              Create Company
            </Button>
          )}
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map(company => (
            <Grid item xs={12} sm={6} md={4} key={company.id}>
              <Card
                className="lift"
                sx={{ height: '100%', position: 'relative', overflow: 'hidden', maxWidth: { xs: '300px', sm: '400px' }, minWidth: { xs: '200px', sm: '400px' } }}
              >
                {/* top accent bar */}
                <Box sx={{ height: 3, background: 'linear-gradient(90deg,#ffffff,#a1a1aa)', borderRadius: '20px 20px 0 0' }} />
                <CardActionArea
                  onClick={() => navigate(`/admin/company/${company.id}`)}
                  sx={{ p: 2.5, pb: 1.5, height: 'calc(100% - 3px)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}
                >
                  {/* Icon + Name row */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, width: '100%' }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: 2,
                      background: 'rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <BusinessIcon sx={{ fontSize: 20, color: '#ffffff' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{ lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {company.name}
                      </Typography>
                      <Chip
                        label={`/${company.slug}`}
                        size="small"
                        sx={{
                          fontSize: '0.65rem', height: 18, mt: 0.3,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          color: '#d4d4d8',
                          maxWidth: '100%',
                          '& .MuiChip-label': { px: 1, overflow: 'hidden', textOverflow: 'ellipsis' },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      flexGrow: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 2,
                      fontSize: '0.82rem',
                    }}
                  >
                    {company.description || 'No description provided.'}
                  </Typography>

                  {/* Footer row */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Typography variant="caption" sx={{ color: '#d4d4d8', display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      Manage links <ChevronRightIcon sx={{ fontSize: 14 }} />
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={(e) => openEdit(company, e)}
                        sx={{
                          color: 'rgba(255, 255, 255, 1)', mr: 0.5,
                          '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.1)' },
                        }}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleDelete(company.id, e)}
                        sx={{
                          color: 'rgba(255, 0, 0, 1)',
                          '&:hover': { color: '#ff0000ff', background: 'rgba(255, 0, 0, 1)' },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => !editLoading && setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Company</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Name"
            fullWidth
            required
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="URL Slug"
            fullWidth
            required
            value={editSlug}
            onChange={(e) => setEditSlug(e.target.value)}
            placeholder="e.g. company-name"
            helperText="The unique identifier used in the URL"
            InputProps={{
              startAdornment: <InputAdornment position="start">/</InputAdornment>,
            }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              label="Email"
              fullWidth
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
            <TextField
              label="Phone No"
              fullWidth
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
          </Box>
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)} disabled={editLoading}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            disabled={editLoading || !editName.trim()}
          >
            {editLoading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <SnackbarAlert {...toast} onClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
}
