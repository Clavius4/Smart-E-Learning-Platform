function parseDurationSeconds(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return 0;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  if (trimmed.includes(':')) {
    const parts = trimmed.split(':').map((part) => Number(part));
    if (parts.every((part) => Number.isFinite(part))) {
      return parts.reduce((total, part) => (total * 60) + part, 0);
    }
  }

  const hours = /(\d+(?:\.\d+)?)\s*h/i.exec(trimmed)?.[1];
  const minutes = /(\d+(?:\.\d+)?)\s*m/i.exec(trimmed)?.[1];
  const seconds = /(\d+(?:\.\d+)?)\s*s/i.exec(trimmed)?.[1];

  if (hours || minutes || seconds) {
    return (Number(hours || 0) * 3600) + (Number(minutes || 0) * 60) + Number(seconds || 0);
  }

  const parsed = parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDuration(value) {
  const totalSeconds = Math.max(0, Math.floor(parseDurationSeconds(value)));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

module.exports = {
  parseDurationSeconds,
  formatDuration
};
