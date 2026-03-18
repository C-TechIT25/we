import React, { useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, IconButton, AppBar, Toolbar, Divider, Avatar, Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AddBusiness as AddBusinessIcon,
  GridView as GridViewIcon,
  LogoutRounded as LogoutIcon,
  LinkRounded as LinkRoundedIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DRAWER_W = 260;

const NAV = [
  { label: 'Companies', icon: <GridViewIcon />, path: '/admin' },
  { label: 'Create Company', icon: <AddBusinessIcon />, path: '/admin/create' },
];

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); }
    catch (e) { console.error(e); }
  };

  const isActive = (path) =>
    path === '/admin'
      ? location.pathname === '/admin' || location.pathname.startsWith('/admin/company/')
      : location.pathname === path;

  const DrawerContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: 1, pb: 2 }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 38, height: 38, borderRadius: 2.5,
          background: 'linear-gradient(135deg,#ffffff,#d4d4d8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(255,255,255,0.25)', flexShrink: 0,
        }}>
          <LinkRoundedIcon sx={{ fontSize: 18, color: '#000' }} />
        </Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff', letterSpacing: '-0.01em', lineHeight: 1 }}>
          C-Tech Profile
        </Typography>
      </Box>

      <Divider sx={{ mx: 2, mb: 2 }} />

      {/* Nav Items */}
      <List sx={{ px: 1.5, flexGrow: 1 }}>
        {NAV.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={{
                  borderRadius: 2.5,
                  px: 2,
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  '& .MuiListItemIcon-root': { color: active ? '#ffffff' : 'rgba(255,255,255,0.28)', minWidth: 36 },
                  '&:hover': { background: 'rgba(255,255,255,0.09)', color: '#ffffff' },
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  mb: 0.5, py: 1.2,
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: active ? 700 : 500 }}
                />
                {active && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ffffff', flexShrink: 0 }} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User + Logout */}
      <Box sx={{ px: 1.5, mt: 'auto' }}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1, mb: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 13, fontWeight: 700 }}>
            {currentUser?.email?.[0]?.toUpperCase() || 'A'}
          </Avatar>
          <Box sx={{ overflow: 'hidden', flex: 1 }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 120 }}>{currentUser?.email?.split('@')[0]}</Typography>
            <Typography variant="caption" sx={{ display: 'block', color: '#d4d4d8', mt: -0.5 }}>Admin</Typography>
          </Box>
        </Box>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2.5, px: 2, py: 1,
            color: 'rgba(248,113,113,0.65)',
            '&:hover': { background: 'rgba(248,113,113,0.08)', color: '#fca5a5' },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 34 }}><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Sign out" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── App Bar (shown on mobile, sits above sidebar on desktop) ── */}
      <AppBar
        position="fixed"
        sx={{
          /* On sm+ screens, shrink the AppBar so it doesn't overlap the drawer */
          width: { sm: `calc(100% - ${DRAWER_W}px)` },
          ml: { sm: `${DRAWER_W}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 1.5, minHeight: { xs: 58, sm: 66 } }}>
          {/* Hamburger — only on mobile */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { sm: 'none' }, mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            fontWeight={700}
            noWrap
            sx={{ flexGrow: 1, fontSize: { xs: '1rem', sm: '1.1rem' } }}
          >
            Admin Dashboard
          </Typography>

          <Chip
            label="Admin"
            size="small"
            sx={{
              bgcolor: 'rgba(99,102,241,0.18)',
              color: '#a5b4fc',
              fontWeight: 600,
              fontSize: '0.7rem',
              display: { xs: 'none', sm: 'flex' },
            }}
          />
        </Toolbar>
      </AppBar>

      {/* ── Sidebar nav (box that reserves space on desktop) ── */}
      <Box
        component="nav"
        sx={{
          width: { sm: DRAWER_W },
          flexShrink: { sm: 0 },
        }}
      >
        {/* Temporary (mobile) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_W, boxSizing: 'border-box' },
          }}
        >
          <DrawerContent />
        </Drawer>

        {/* Permanent (desktop) */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_W, boxSizing: 'border-box' },
          }}
          open
        >
          <DrawerContent />
        </Drawer>
      </Box>

      {/* ── Main content area — offset by toolbar height on top ── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,                  /* prevents overflow on small screens */
          width: { xs: '100%', sm: `calc(100% - ${DRAWER_W}px)` },
          mt: { xs: '58px', sm: '66px' }, /* match Toolbar minHeight */
          p: { xs: 2, sm: 3, md: 4 },
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
