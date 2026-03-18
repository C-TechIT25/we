import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SnackbarAlert from '../components/SnackbarAlert';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'error' });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch {
      setToast({ open: true, message: 'Invalid email or password. Please try again.', severity: 'error' });
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
        py: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient blobs */}
      <Box sx={{ position: 'fixed', top: '-20%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <Box sx={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 420,
          position: 'relative',
          zIndex: 1,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: { xs: 4, sm: 5 },
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          p: { xs: 3, sm: 4.5 },
        }}
      >
        {/* Logo / Icon */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 64, height: 64, borderRadius: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #d4d4d8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(255,255,255,0.25)',
            }}
          >
            <Lock sx={{ fontSize: 28, color: '#000' }} />
          </Box>
        </Box>

        <Typography variant="h4" fontWeight={800} textAlign="center" mb={0.5}
          sx={{ background: 'linear-gradient(135deg,#fff,#a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          Welcome to C-Tech
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={4}>
          Sign in to your admin account
        </Typography>

        {/* Email */}
        <TextField
          label="Email address"
          type="email"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email sx={{ fontSize: 18, color: 'rgba(255,255,255,0.3)' }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2.5 }}
        />

        {/* Password */}
        <TextField
          label="Password"
          type={showPwd ? 'text' : 'password'}
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock sx={{ fontSize: 18, color: 'rgba(255,255,255,0.3)' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPwd(!showPwd)} edge="end" size="small">
                  {showPwd ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3.5 }}
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          sx={{ py: 1.5, fontSize: '1rem', borderRadius: 3 }}
        >
          {loading
            ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} /> Signing in…</>
            : 'Sign in'}
        </Button>
      </Box>

      <SnackbarAlert {...toast} onClose={() => setToast({ ...toast, open: false })} />
    </Box>
  );
}
