import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, Chip, LinearProgress, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { RefreshRounded } from '@mui/icons-material';
import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { summarizeEvents } from '../../utils/analytics';

const number = value => value.toLocaleString();
const colors = ['#3673fc', '#14b8a6'];

function Trend({ daily }) {
  const max = Math.max(1, ...daily.flatMap(day => [day.views, day.clicks]));
  const x = i => 48 + i * 700 / Math.max(1, daily.length - 1);
  const y = value => 206 - value / max * 170;
  return <Box component="svg" viewBox="0 0 780 250" role="img" aria-label="Daily profile views in blue and link clicks in green. Dates use UTC." sx={{ width: '100%', display: 'block' }}>
    {[0, 0.5, 1].map(tick => <g key={tick}><line x1="48" x2="748" y1={y(max * tick)} y2={y(max * tick)} stroke="#e8ecf2" /><text x="38" y={y(max * tick) + 4} textAnchor="end" fontSize="12" fill="#64748b">{Math.round(max * tick)}</text></g>)}
    {['views', 'clicks'].map((key, series) => <g key={key}><polyline fill="none" stroke={colors[series]} strokeWidth="3" points={daily.map((day, i) => `${x(i)},${y(day[key])}`).join(' ')} />{daily.map((day, i) => <circle key={day.date} cx={x(i)} cy={y(day[key])} r="3" fill={colors[series]}><title>{day.date}: {day[key]} {key}</title></circle>)}</g>)}
    {[0, Math.floor((daily.length - 1) / 2), daily.length - 1].map(i => <text key={i} x={x(i)} y="237" textAnchor="middle" fontSize="12" fill="#64748b">{daily[i].date.slice(5)}</text>)}
  </Box>;
}

export default function Analytics() {
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState('all');
  const [days, setDays] = useState(30);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    const start = new Date(); start.setUTCHours(0, 0, 0, 0); start.setUTCDate(start.getUTCDate() - days + 1);
    Promise.all([
      getDocs(collection(db, 'companies')),
      getDocs(query(collection(db, 'analyticsEvents'), where('createdAt', '>=', Timestamp.fromDate(start)))),
    ]).then(([companySnap, eventSnap]) => {
      if (!active) return;
      setCompanies(companySnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setEvents(eventSnap.docs.map(doc => doc.data()));
      setError(''); setLoading(false);
    }).catch(() => {
      if (active) { setError('Analytics could not be loaded. Check your connection and Firestore analytics permissions, then retry.'); setLoading(false); }
    });
    return () => { active = false; };
  }, [days, revision]);
  const stats = useMemo(() => summarizeEvents(events.filter(event => company === 'all' || event.companyId === company), days), [events, company, days]);
  const changeDays = event => { setLoading(true); setDays(Number(event.target.value)); };
  const refresh = () => { setLoading(true); setRevision(value => value + 1); };
  return <Box>
    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2} mb={3}>
      <Box><Typography variant="h4" fontWeight={800}>Analytics</Typography><Typography color="text.secondary" variant="body2" mt={0.5}>See how people discover and interact with your links.</Typography></Box>
      <Button startIcon={<RefreshRounded />} onClick={refresh} disabled={loading}>Refresh</Button>
    </Stack>
    <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} mb={3}>
      <TextField select label="Company" value={company} onChange={event => setCompany(event.target.value)} size="small" sx={{ minWidth: 220 }}><MenuItem value="all">All companies</MenuItem>{companies.map(item => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}</TextField>
      <TextField select label="Date range (UTC)" value={days} onChange={changeDays} size="small" sx={{ minWidth: 190 }}>{[7, 30, 90].map(value => <MenuItem key={value} value={value}>Last {value} days</MenuItem>)}</TextField>
      <Chip label="Recorded activity" variant="outlined" sx={{ alignSelf: 'center' }} />
    </Stack>
    {loading ? <Box role="status" aria-label="Loading analytics"><LinearProgress /><Typography sx={{ py: 4 }} color="text.secondary">Loading analytics…</Typography></Box> : error ? <Alert severity="error" action={<Button onClick={refresh}>Retry</Button>}>{error}</Alert> : <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        {[['Profile views', number(stats.views), 'Times a profile was opened'], ['Link impressions', number(stats.impressions), 'Links visible on the profile'], ['Link clicks', number(stats.clicks), 'Clicks to linked destinations'], ['Clicks / impressions', `${stats.impressions ? (stats.clicks / stats.impressions * 100).toFixed(1) : '0'}%`, 'Repeat clicks are included']].map(([title, value, caption]) => <Card key={title} sx={{ p: { xs: 2, md: 3 } }}><Typography variant="body2" color="text.secondary">{title}</Typography><Typography variant="h4" fontWeight={800} my={1}>{value}</Typography><Typography variant="caption" color="text.secondary">{caption}</Typography></Card>)}
      </Box>
      {!stats.views && !stats.impressions && !stats.clicks && <Alert severity="info" sx={{ mb: 3 }}>No activity in this period. Tracking starts after this update is deployed; historical visits are not available.</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' }, gap: 3, mb: 3 }}>
        <Card sx={{ p: 3, minWidth: 0 }}><Typography variant="h6">Activity over time</Typography><Stack direction="row" gap={2} my={2}><Typography variant="caption" color={colors[0]}>? Profile views</Typography><Typography variant="caption" color={colors[1]}>? Link clicks</Typography></Stack><Trend daily={stats.daily} /></Card>
        <Card sx={{ p: 3 }}><Typography variant="h6" mb={2}>Clicks by platform</Typography>{!stats.platforms.length && <Typography color="text.secondary" variant="body2">Platform activity will appear here.</Typography>}{stats.platforms.map(row => <Box key={row.name} mb={2}><Stack direction="row" justifyContent="space-between" mb={0.5}><Typography variant="body2">{row.name}</Typography><Typography variant="body2" fontWeight={700}>{number(row.clicks)}</Typography></Stack><LinearProgress variant="determinate" value={stats.clicks ? row.clicks / stats.clicks * 100 : 0} sx={{ height: 8, borderRadius: 4, bgcolor: '#eff5ff' }} /></Box>)}</Card>
      </Box>
      <Card sx={{ p: { xs: 2, md: 3 } }}><Typography variant="h6">Social media performance</Typography><Typography variant="body2" color="text.secondary" mt={0.5} mb={2}>Impressions count a link once per page load when at least half of it is visible. These are not views inside social media apps.</Typography>
        <TableContainer><Table size="small" aria-label="Social media performance"><TableHead><TableRow>{['Platform', 'Link impressions', 'Clicks', 'Clicks / impressions'].map(label => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead><TableBody>{stats.platforms.map(row => <TableRow key={row.name}><TableCell>{row.name}</TableCell><TableCell>{number(row.views)}</TableCell><TableCell>{number(row.clicks)}</TableCell><TableCell>{row.views ? `${(row.clicks / row.views * 100).toFixed(1)}%` : '—'}</TableCell></TableRow>)}{!stats.platforms.length && <TableRow><TableCell colSpan={4} sx={{ py: 4, textAlign: 'center' }}>No link activity yet</TableCell></TableRow>}</TableBody></Table></TableContainer>
      </Card>
      <Typography variant="caption" color="text.secondary" display="block" mt={2}>Counts include repeat visits and clicks, not unique people. Browser blocking or failed connections can prevent tracking. All dates use UTC.</Typography>
    </>}
  </Box>;
}
