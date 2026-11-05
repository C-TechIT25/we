export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename;
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function csvCell(value) {
  let text = String(value ?? '');
  // Prevent spreadsheet formula execution from user-controlled campaign names.
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return `"${text.replaceAll('"', '""')}"`;
}

export function reportRows(stats, { company, start, end }) {
  return [
    ['Analytics report', company], ['UTC date range', start, end],
    ['Metric', 'Count'], ['Profile views', stats.views], ['Link impressions', stats.impressions], ['Link clicks', stats.clicks], [],
    ['Daily activity'], ['Date (UTC)', 'Profile views', 'Link clicks'], ...stats.daily.map(row => [row.date, row.views, row.clicks]), [],
    ['Social platform performance'], ['Platform', 'Link impressions', 'Clicks'], ...stats.platforms.map(row => [row.name, row.views, row.clicks]), [],
    ['Traffic sources & campaigns'], ['Source', 'Medium', 'Campaign', 'Profile views', 'Clicks'], ...stats.sources.map(row => [row.source, row.medium, row.campaign || '(none)', row.views, row.clicks]), [],
    ['Counts include repeat visits. Impressions are on this profile, not inside social apps.'],
  ];
}

export function exportCsv(stats, meta) {
  const csv = '\ufeff' + reportRows(stats, meta).map(row => row.map(csvCell).join(',')).join('\r\n');
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `analytics-${meta.start}-${meta.end}.csv`);
}

// Render with the browser's fonts so company/campaign names retain Unicode glyphs.
// Each A4 page is drawn separately; tables wrap and paginate before the footer.
export async function exportPdf(stats, meta) {
  const { jsPDF } = await import('jspdf');
  await document.fonts.ready;
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const width = 1240, height = 1754, margin = 70, bottom = 1640;
  let canvas, ctx, y, page = 0;
  function newPage() {
    canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#3673fc'; ctx.fillRect(0, 0, width, 14);
    ctx.font = 'bold 34px Arial'; ctx.fillStyle = '#172033'; ctx.fillText('Analytics report', margin, 80);
    y = 120;
  }
  function flush() {
    ctx.font = '20px Arial'; ctx.fillStyle = '#64748b';
    ctx.fillText(`${meta.start} - ${meta.end} (UTC)`, margin, height - 55);
    ctx.fillText(`Page ${++page}`, width - 160, height - 55);
    if (page > 1) pdf.addPage();
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 595.28, 841.89, undefined, 'FAST');
  }
  function wrap(text, maxWidth) {
    const lines = []; let line = '';
    for (const char of String(text)) {
      if (char === '\n' || (line && ctx.measureText(line + char).width > maxWidth)) { lines.push(line); line = ''; }
      if (char !== '\n') line += char;
    }
    lines.push(line); return lines;
  }
  function paragraph(text, bold = false) {
    ctx.font = `${bold ? 'bold ' : ''}24px Arial`;
    const lines = wrap(text, width - margin * 2);
    for (const line of lines) {
      if (y + 36 > bottom) { flush(); newPage(); }
      ctx.font = `${bold ? 'bold ' : ''}24px Arial`; ctx.fillStyle = '#172033'; ctx.fillText(line, margin, y); y += 34;
    }
    y += 12;
  }
  function table(headers, rows, fractions) {
    const widths = fractions.map(f => f * (width - margin * 2));
    function row(values, header = false) {
      ctx.font = `${header ? 'bold ' : ''}21px Arial`;
      const lines = values.map((value, i) => wrap(value, widths[i] - 24));
      const rowHeight = Math.max(...lines.map(items => items.length)) * 29 + 22;
      if (y + rowHeight > bottom) { flush(); newPage(); row(headers, true); }
      ctx.fillStyle = header ? '#eaf1ff' : '#f8fafc'; ctx.fillRect(margin, y, width - margin * 2, rowHeight - 2);
      ctx.font = `${header ? 'bold ' : ''}21px Arial`; ctx.fillStyle = '#172033';
      let x = margin;
      lines.forEach((items, i) => { items.forEach((line, j) => ctx.fillText(line, x + 12, y + 29 + j * 29)); x += widths[i]; });
      y += rowHeight;
    }
    row(headers, true);
    rows.forEach(values => row(values));
    if (!rows.length) paragraph('No activity in this period.');
    y += 24;
  }
  newPage();
  paragraph(meta.company, true);
  paragraph(`${meta.start} to ${meta.end} (UTC)`);
  table(['Profile views', 'Link impressions', 'Link clicks'], [[stats.views, stats.impressions, stats.clicks]], [0.34, 0.33, 0.33]);
  paragraph('Daily profile views (blue) and link clicks (green)', true);
  const top = y + 15, chartHeight = 180, chartWidth = width - 2 * margin;
  const max = Math.max(1, ...stats.daily.flatMap(day => [day.views, day.clicks]));
  ctx.strokeStyle = '#e2e8f0'; ctx.strokeRect(margin, top, chartWidth, chartHeight);
  ['views', 'clicks'].forEach((key, index) => {
    ctx.strokeStyle = index ? '#0d9488' : '#3673fc'; ctx.lineWidth = 4; ctx.beginPath();
    stats.daily.forEach((day, i) => {
      const x = margin + i / Math.max(1, stats.daily.length - 1) * chartWidth;
      const yy = top + chartHeight - day[key] / max * chartHeight;
      if (i === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      if (stats.daily.length === 1) { ctx.lineTo(x + 8, yy); }
    }); ctx.stroke();
  });
  y = top + chartHeight + 38;
  paragraph(`Scale: 0 to ${max}. Dates: ${meta.start} to ${meta.end}.`);
  paragraph('Traffic sources & campaigns', true);
  table(['Source', 'Medium', 'Campaign', 'Views', 'Clicks'], stats.sources.map(row => [row.source, row.medium, row.campaign || '(none)', row.views, row.clicks]), [0.24, 0.18, 0.34, 0.12, 0.12]);
  paragraph('Social platform performance', true);
  table(['Platform', 'Impressions', 'Clicks'], stats.platforms.map(row => [row.name, row.views, row.clicks]), [0.5, 0.25, 0.25]);
  paragraph('Daily activity', true);
  table(['Date (UTC)', 'Profile views', 'Link clicks'], stats.daily.map(row => [row.date, row.views, row.clicks]), [0.5, 0.25, 0.25]);
  paragraph('Counts include repeat visits and clicks, not unique people. Impressions measure visibility on the profile, not views inside social media apps.');
  flush();
  pdf.save(`analytics-${meta.start}-${meta.end}.pdf`);
}
