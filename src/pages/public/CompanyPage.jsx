import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Container, Card, CardActionArea, Skeleton, Grid, Button,
} from '@mui/material';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import * as MuiIcons from '@mui/icons-material';
import { ArrowForwardIos } from '@mui/icons-material';
import { getCompanyAssets } from '../../utils/companyAssets';

/* ── Skeleton for one link row ── */
function LinkSkeleton() {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Card sx={{ background: 'rgba(255,255,255,0.04)' }}>
        <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="rounded" width={52} height={52} sx={{ borderRadius: 2, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton height={21} width="40%" sx={{ mb: 0.5 }} />
            <Skeleton height={15} width="60%" />
          </Box>
        </Box>
      </Card>
    </Box>
  );
}

/* ── Skeleton for the header hero ── */
function HeroSkeleton() {
  return (
    <Box>
      <Skeleton variant="rectangular" width="100%" height={260} sx={{ borderRadius: 0 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: -5, px: 2 }}>
        <Skeleton variant="rounded" width={100} height={100} sx={{ borderRadius: 3, mb: 2 }} />
        <Skeleton height={38} width="55%" sx={{ mb: 1 }} />
        <Skeleton height={18} width="80%" sx={{ mb: 0.5 }} />
        <Skeleton height={18} width="65%" />
      </Box>
    </Box>
  );
}

export default function CompanyPage({ companySlug }) {
  const { company_name } = useParams();
  const slug = companySlug || company_name;
  const [company, setCompany] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubLinks = () => { };
    if (!slug) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'companies'), where('slug', '==', slug))
        );
        if (snap.empty) { setError('not_found'); setLoading(false); return; }
        const comp = { id: snap.docs[0].id, ...snap.docs[0].data() };
        setCompany(comp);
        unsubLinks = onSnapshot(collection(db, `companies/${comp.id}/links`), s => {
          setLinks(
            s.docs.map(d => ({ id: d.id, ...d.data() }))
              .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          );
          setLoading(false);
        });
      } catch {
        setError('error'); setLoading(false);
      }
    })();
    return () => unsubLinks();
  }, [slug]);

  // Resolve local assets based on the company slug
  const assets = company ? getCompanyAssets(company.slug) : null;

  /* ── 404 state ── */
  if (error) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ fontSize: { xs: '5rem', sm: '8rem' }, fontWeight: 900, opacity: 0.07, lineHeight: 1, mb: 1 }}>
          404
        </Typography>
        <Typography variant="h5" fontWeight={700} mb={1}>Company not found</Typography>
        <Typography variant="body2" color="text.secondary">
          This page doesn't exist or was removed.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{
      minHeight: '100vh', pb: 10, position: 'relative', overflow: 'hidden',
      ...(company?.theme?.backgroundColor && { backgroundColor: company.theme.backgroundColor }),
    }}>

      {/* Ambient blobs */}
      <Box sx={{
        position: 'fixed', top: '-15%', left: '50%', transform: 'translateX(-50%)',
        width: '100vw', height: '55vh',
        background: 'radial-gradient(ellipse,rgba(255,255,255,0.08) 0%,transparent 65%)',
        pointerEvents: 'none', zIndex: 0,
      }} className="anim-pulse" />
      <Box sx={{
        position: 'fixed', bottom: '-5%', right: '-15%',
        width: '45vw', height: '45vw', borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(255,255,255,0.06) 0%,transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} className="anim-float" />
      <Box sx={{
        position: 'fixed', top: '20%', left: '-15%',
        width: '35vw', height: '35vw', borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(255,255,255,0.05) 0%,transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} className="anim-float-rev" />

      {/* ══ HERO ══ */}
      {loading ? (
        <HeroSkeleton />
      ) : (
        <Box sx={{ position: 'relative', zIndex: 1 }}>

          {/* Header / Banner image from local assets */}
          <Box
            sx={{
              width: '100%',
              height: { xs: 210, sm: 290, md: 440 },
              position: 'relative',
              overflow: 'hidden',
              mb: { xs: 0, sm: 12 },
            }}
          >
            <Box
              component="img"
              src={assets.header}
              alt="header"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', maxHeight: { xs: 100, sm: '100%' } }}
            />
            {/* Bottom fade to background */}
            <Box sx={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 0%, rgba(7,11,20,0.5) 55%, rgba(7,11,20,1) 100%)',
            }} />
          </Box>

          {/* ── Logo + Name + Description ── */}
          <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2, px: { xs: 2, sm: 3 }, mt: { xs: -16, sm: -17 } }}>
            <Box sx={{ mt: { xs: -7, sm: -9 }, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

              {/* Company Logo from local assets */}
              <Box
                sx={{
                  width: { xs: 90, sm: 112 },
                  height: { xs: 90, sm: 112 },
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: '3px solid rgba(255,255,255,0.14)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 5px rgba(255,255,255,0.12)',
                  background: '#fff',           /* white bg so transparent logos look clean */
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mb: 2.5, flexShrink: 0,
                }}
              >
                <Box
                  component="img"
                  src={assets.logo}
                  alt={company.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.5, }}
                />
              </Box>

              {/* Company Name */}
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{
                  fontSize: { xs: '1.45rem', sm: '2.1rem' },
                  letterSpacing: '-0.02em',
                  ...(company?.theme?.textColor ? {
                    color: company.theme.textColor,
                  } : {
                    background: 'linear-gradient(135deg,#fff 0%,#d4d4d8 55%,#a1a1aa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }),
                  mb: 1.5,
                  px: { xs: 1, sm: 0 },
                  wordBreak: 'break-word',
                }}
              >
                {company.name}
              </Typography>

              {/* Company Description */}
              {company.description && (
                <Typography
                  variant="body1"
                  color={company?.theme?.textColor ? undefined : 'text.secondary'}
                  sx={{
                    ...(company?.theme?.textColor && { color: company.theme.textColor, opacity: 0.8 }),
                    maxWidth: { xs: '100%', sm: 650 },
                    textAlign: 'center',
                    lineHeight: 1.75,
                    fontSize: { xs: '0.775rem', sm: '0.97rem' },
                    wordBreak: 'break-word',
                    px: { xs: 0.5, sm: 0 },
                  }}
                >
                  {company.description}
                </Typography>
              )}

              {/* Contact Info (Email & Phone) */}
              {(company.email || company.phone) && (
                <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2 }, justifyContent: 'center', mt: 2.5, flexWrap: 'wrap' }}>
                  {company.email && (
                    <Button
                      variant={company?.theme?.buttonStyle || 'outlined'}
                      size="small"
                      startIcon={<MuiIcons.Email />}
                      href={`mailto:${company.email}`}
                      sx={{
                        borderRadius: 6, textTransform: 'none',
                        ...(company?.theme?.buttonStyle !== 'contained' ? { color: company?.theme?.textColor || '#d4d4d8', borderColor: 'rgba(255,255,255,0.2)' } : { bgcolor: 'rgba(255,255,255,1)', color: '#000' }),
                        px: 2,
                        '&:hover': {
                          ...(company?.theme?.buttonStyle !== 'contained' ? { borderColor: '#fff', color: '#fff', background: 'rgba(255,255,255,0.1)' } : { bgcolor: 'rgba(255,255,255,0.85)' })
                        }
                      }}
                    >
                      Email
                    </Button>
                  )}
                  {company.phone && (
                    <Button
                      variant={company?.theme?.buttonStyle || 'outlined'}
                      size="small"
                      startIcon={<MuiIcons.Phone />}
                      href={`tel:${company.phone}`}
                      sx={{
                        borderRadius: 6, textTransform: 'none',
                        ...(company?.theme?.buttonStyle !== 'contained' ? { color: company?.theme?.textColor || '#d4d4d8', borderColor: 'rgba(255,255,255,0.2)' } : { bgcolor: 'rgba(255,255,255,1)', color: '#000' }),
                        px: 2,
                        '&:hover': {
                          ...(company?.theme?.buttonStyle !== 'contained' ? { borderColor: '#fff', color: '#fff', background: 'rgba(255,255,255,0.1)' } : { bgcolor: 'rgba(255,255,255,0.85)' })
                        }
                      }}
                    >
                      Call
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          </Container>
        </Box>
      )}

      {/* ══ LINKS ══ */}
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, px: { xs: 2, sm: 3 }, mt: 4 }}>
        {loading ? (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><LinkSkeleton /></Grid>
            <Grid item xs={12} sm={6}><LinkSkeleton /></Grid>
            <Grid item xs={12} sm={6}><LinkSkeleton /></Grid>
          </Grid>
        ) : links.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <MuiIcons.LinkOff sx={{ fontSize: 40, color: 'rgba(255,255,255,0.12)', mb: 1.5 }} />
            <Typography variant="body2" color="text.secondary">No links published yet.</Typography>
          </Box>
        ) : (
          <Grid container spacing={2} justifyContent={'center'}>
            {links.map(link => {
              const Ico = MuiIcons[link.icon] || MuiIcons['Link'];
              return (
                <Grid item xs={12} sm={6} key={link.id}>
                  <Card
                    className="lift"
                    sx={{
                      background:
                        company?.theme?.cardStyle === 'solid' ? (link.background || 'rgba(255,255,255,0.1)') :
                        company?.theme?.cardStyle === 'transparent' ? 'transparent' :
                        (link.background || 'rgba(255,255,255,0.05)'),
                      backdropFilter: company?.theme?.cardStyle === 'transparent' ? 'none' : 'blur(20px)',
                      WebkitBackdropFilter: company?.theme?.cardStyle === 'transparent' ? 'none' : 'blur(20px)',
                      border: company?.theme?.cardStyle === 'transparent' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: { xs: 3, sm: 3.5 },
                      overflow: 'hidden',
                      height: '100%',
                      minWidth: { xs: '300px', sm: '400px' }
                    }}
                  >
                    <CardActionArea
                      component="a"
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ p: { xs: 1.75, sm: 2.25 }, display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, height: '100%' }}
                    >
                      {/* Icon */}
                      <Box sx={{
                        width: { xs: 50, sm: 56 }, height: { xs: 50, sm: 56 },
                        borderRadius: { xs: 2, sm: 2.5 },
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, overflow: 'hidden',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                      }}>
                        <Ico sx={{ fontSize: { xs: 26, sm: 28 }, color: '#fff' }} />
                      </Box>

                      {/* Text */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={700} color="white"
                          sx={{ lineHeight: 1.25, mb: link.bio ? 0.3 : 0, fontSize: { xs: '0.95rem', sm: '1.02rem' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {link.name}
                        </Typography>
                        {link.bio && (
                          <Typography variant="body2"
                            sx={{ color: 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: { xs: '0.78rem', sm: '0.84rem' } }}>
                            {link.bio}
                          </Typography>
                        )}
                      </Box>

                      <ArrowForwardIos sx={{ fontSize: { xs: 12, sm: 13 }, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Footer */}

      </Container>
    </Box>
  );
}
