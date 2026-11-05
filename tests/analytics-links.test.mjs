import assert from 'node:assert/strict';
import test from 'node:test';
import { attributionFor, dateRange, rangeDays, summarizeEvents } from '../src/utils/analytics.js';
import { linkStatus, schedulePayload, sortLinks } from '../src/utils/links.js';
import { campaignUrl, profileUrl } from '../src/utils/profileUrl.js';
import { csvCell, reportRows } from '../src/utils/analyticsExport.js';
import QRCode from 'qrcode';

test('UTM source wins over referrer and campaign is preserved', () => {
  assert.deepEqual(attributionFor('?utm_source=QR&utm_medium=offline&utm_campaign=Card%20A', 'https://instagram.com/', 'https://example.com'), { source: 'qr', medium: 'offline', campaign: 'Card A' });
  assert.equal(attributionFor('', 'https://l.instagram.com/', 'https://example.com').source, 'instagram');
  assert.equal(attributionFor('', 'https://example.com/other', 'https://example.com').source, 'direct');
  assert.equal(attributionFor('', 'not a URL', '').source, 'direct');
  assert.equal(attributionFor('?utm_source=' + 'a'.repeat(200)).source.length, 100);
});

test('inclusive UTC ranges handle leap days, invalid dates and boundaries', () => {
  assert.deepEqual(dateRange(7, new Date('2026-01-03T12:00:00Z')), { start: '2025-12-28', end: '2026-01-03' });
  assert.equal(rangeDays('2024-02-28', '2024-03-01'), 3);
  assert.equal(rangeDays('2026-02-30', '2026-03-01'), 0);
  assert.equal(rangeDays('', ''), 0);
  assert.equal(rangeDays('2026-10-30', '2026-10-30'), 1);
});

test('aggregations retain legacy data and separate incoming source from outgoing platform', () => {
  const event = (type, date, extra = {}) => ({ type, platform: 'YouTube', createdAt: { toDate: () => new Date(date) }, ...extra });
  const traffic = { source: 'instagram', medium: 'social', campaign: 'launch' };
  const stats = summarizeEvents([
    event('page_view', '2026-10-30T00:00:00Z', traffic),
    event('link_click', '2026-10-30T23:59:59Z', traffic),
    event('link_view', '2026-10-30T01:00:00Z', traffic),
    event('page_view', '2026-10-30T05:00:00Z'),
    event('page_view', '2026-10-29T23:59:59Z', traffic),
    event('page_view', '2026-10-31T00:00:00Z', traffic),
    { type: 'page_view' },
  ], 1, new Date('2026-10-30T12:00:00Z'));
  assert.equal(stats.views, 2); assert.equal(stats.clicks, 1); assert.equal(stats.impressions, 1);
  assert.equal(stats.platforms[0].name, 'YouTube');
  assert.equal(stats.sources.find(row => row.source === 'instagram').clicks, 1);
  assert.equal(stats.sources.find(row => row.source === 'unknown (legacy)').views, 1);
  assert.equal(summarizeEvents([], 7).daily.length, 7);
});

test('scheduling is inclusive at start and exclusive at end, disabled wins', () => {
  const startsAt = '2026-10-30T10:00:00Z', endsAt = '2026-10-30T11:00:00Z';
  assert.equal(linkStatus({}), 'Live');
  assert.equal(linkStatus({ startsAt, endsAt }, Date.parse(startsAt) - 1), 'Scheduled');
  assert.equal(linkStatus({ startsAt, endsAt }, Date.parse(startsAt)), 'Live');
  assert.equal(linkStatus({ startsAt, endsAt }, Date.parse(endsAt)), 'Expired');
  assert.equal(linkStatus({ enabled: false, startsAt }), 'Disabled');
  assert.throws(() => schedulePayload(endsAt, startsAt), /after/);
  assert.throws(() => schedulePayload('bad date', ''), /valid/);
  assert.deepEqual(schedulePayload('', ''), { startsAt: null, endsAt: null });
});

test('explicit order precedes legacy chronological order without mutation', () => {
  const links = [{ id: 'old', createdAt: '2020-01-01' }, { id: 'new', createdAt: '2026-01-01' }, { id: 'ordered', order: 0 }];
  assert.deepEqual(sortLinks(links).map(link => link.id), ['ordered', 'new', 'old']);
  assert.equal(links[0].id, 'old');
});

test('QR URLs use custom domains and encode campaign parameters', async () => {
  assert.equal(profileUrl('precon-structurals', 'https://admin.example.com'), 'https://links.preconstructurals.com/');
  assert.equal(profileUrl('new-company', 'https://admin.example.com'), 'https://admin.example.com/new-company');
  const url = campaignUrl('https://links.preconstructurals.com/', { source: 'qr', medium: 'offline', campaign: 'Card & poster' });
  assert.equal(new URL(url).searchParams.get('utm_campaign'), 'Card & poster');
  const svg = await QRCode.toString(url, { type: 'svg', margin: 4 });
  assert.match(svg, /<svg/);
  const matrix = QRCode.create(url); assert.ok(matrix.modules.size > 20);
});

test('CSV quotes multiline values and neutralizes formulas; exports share aggregates', () => {
  assert.equal(csvCell('a,"b"\nc'), '"a,""b""\nc"');
  assert.equal(csvCell('=SUM(A1)'), '"\'=SUM(A1)"');
  assert.equal(csvCell('  @formula'), '"\'  @formula"');
  const stats = summarizeEvents([], 1, new Date('2026-10-30'));
  const rows = reportRows(stats, { company: 'A', start: '2026-10-30', end: '2026-10-30' });
  assert.deepEqual(rows.find(row => row[0] === 'Profile views'), ['Profile views', 0]);
  assert.ok(rows.some(row => row[0] === '2026-10-30' && row[1] === 0));
});
