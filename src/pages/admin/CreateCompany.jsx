import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, CircularProgress,
  Typography, InputAdornment, Divider,
} from '@mui/material';
import {
  AddBusiness as AddBusinessIcon,
  Business as BusinessIcon,
  LinkRounded as LinkIcon,
} from '@mui/icons-material';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import SnackbarAlert from '../../components/SnackbarAlert';

export default function CreateCompany() {
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail]             = useState('');
  const [phone, setPhone]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [toast, setToast]             = useState({ open: false, message: '', severity: 'success' });

  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slug) return;
    setLoading(true);
    try {
      // Uniqueness check
      const q = query(collection(db, 'companies'), where('slug', '==', slug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setToast({ open: true, message: 'A company with this name already exists!', severity: 'error' });
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'companies'), {
        name: name.trim(),
        slug,
        email: email.trim(),
        phone: phone.trim(),
        description: description.trim(),
        createdAt: serverTimestamp(),
      });

      setToast({ open: true, message: 'Company created successfully!', severity: 'success' });
      setName('');
      setDescription('');
      setEmail('');
      setPhone('');
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: 'Failed to create company.', severity: 'error' });
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      {/* Page heading */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4" fontWeight={800}
          sx={{ background: 'linear-gradient(135deg,#fff,#a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          Create Company
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Fill in the details below to add a new company to your platform.
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <form onSubmit={handleSubmit}>
            {/* Company Name */}
            <TextField
              label="Company Name *"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.3)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Slug preview */}
            {slug && (
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.8,
                  mb: 2.5, px: 1.5, py: 1,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: 2,
                }}
              >
                <LinkIcon sx={{ fontSize: 14, color: '#d4d4d8' }} />
                <Typography variant="caption" sx={{ color: '#f4f4f5', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  yoursite.com/<strong>{slug}</strong>
                </Typography>
              </Box>
            )}

            {/* Email & Phone */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                label="Email (optional)"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Phone No (optional)"
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Box>

            {/* Description */}
            <TextField
              label="Description (optional)"
              fullWidth multiline rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this company…"
              sx={{ mb: 3.5 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || !name.trim()}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AddBusinessIcon />}
              sx={{ py: 1.5, borderRadius: 3 }}
            >
              {loading ? 'Creating…' : 'Create Company'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <SnackbarAlert {...toast} onClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
}
