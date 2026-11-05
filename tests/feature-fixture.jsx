import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from '../src/theme';
import CompanyShareTools from '../src/components/CompanyShareTools';
import Analytics from '../src/pages/admin/Analytics';
import ModernSocialHub from '../src/components/ModernSocialHub';
import useLinkClock from '../src/hooks/useLinkClock';
import { linkStatus, sortLinks } from '../src/utils/links';

const company = { id: 'test', slug: 'precon-structurals', name: 'Test Company – परीक्षण' };
const scheduledLinks = [
  { id: 'website', name: 'Website', url: 'https://example.com', order: 2 },
  { id: 'youtube', name: 'YouTube', url: 'https://youtube.com', order: 0 },
  { id: 'hidden', name: 'Hidden social', url: 'https://facebook.com', enabled: false },
  { id: 'scheduled', name: 'Scheduled social', url: 'https://instagram.com', order: 1, startsAt: new Date(Date.now() + 2000), endsAt: new Date(Date.now() + 4500) },
];
function ScheduleFixture() {
  const now = useLinkClock(scheduledLinks);
  const visible = sortLinks(scheduledLinks).filter(link => linkStatus(link, now) === 'Live');
  return <><Box data-testid="visible-links">{visible.map(link => link.name).join(', ')}</Box><ModernSocialHub company={company} logo="/favicon.svg" links={visible} preview /></>;
}
const loadData = async range => {
  if (new URLSearchParams(location.search).has('error')) throw new Error('Fixture load failure');
  const events = [];
  if (!new URLSearchParams(location.search).has('empty')) {
    for (let i = 0; i < 90; i++) {
      const time = new Date(`${range.end}T12:00:00Z`); time.setUTCDate(time.getUTCDate() - i);
      for (const type of ['page_view', 'link_view', 'link_click']) {
        events.push({ companyId: i % 2 ? 'test' : 'second', type, createdAt: { toDate: () => time }, platform: i % 2 ? 'Instagram' : 'YouTube', source: i % 2 ? 'instagram' : 'qr', medium: i % 2 ? 'social' : 'offline', campaign: i % 3 ? 'Launch – अभियान' : 'Poster & card' });
      }
    }
  }
  return { companies: [company, { id: 'second', name: 'Second company' }], events };
};
createRoot(document.getElementById('root')).render(<ThemeProvider theme={theme}><CssBaseline /><Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1250, mx: 'auto' }}>{location.search.includes('schedule') ? <ScheduleFixture /> : <><CompanyShareTools company={company} /><Analytics loadData={loadData} /></>}</Box></ThemeProvider>);
