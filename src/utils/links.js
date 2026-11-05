export function timestampMs(value) {
  if (!value) return null;
  const ms = value.toMillis ? value.toMillis() : new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

export function linkStatus(link, now = Date.now()) {
  if (link.enabled === false) return 'Disabled';
  const start = timestampMs(link.startsAt), end = timestampMs(link.endsAt);
  if (end !== null && now >= end) return 'Expired';
  if (start !== null && now < start) return 'Scheduled';
  return 'Live';
}

export function sortLinks(links) {
  return [...links].sort((a, b) => {
    const aOrder = Number.isFinite(a.order) ? a.order : Number.MAX_SAFE_INTEGER;
    const bOrder = Number.isFinite(b.order) ? b.order : Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder || (timestampMs(b.createdAt) || 0) - (timestampMs(a.createdAt) || 0) || String(a.id).localeCompare(String(b.id));
  });
}

export function localDateInput(value) {
  const ms = timestampMs(value);
  if (ms === null) return '';
  const date = new Date(ms);
  return new Date(ms - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function schedulePayload(start, end) {
  const startsAt = start ? new Date(start) : null;
  const endsAt = end ? new Date(end) : null;
  if ((startsAt && !Number.isFinite(+startsAt)) || (endsAt && !Number.isFinite(+endsAt))) throw new Error('Enter valid schedule dates.');
  if (startsAt && endsAt && endsAt <= startsAt) throw new Error('End time must be after start time.');
  return { startsAt, endsAt };
}
