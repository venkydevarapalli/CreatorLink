import { formatDistanceToNow, format } from 'date-fns';

export function timeAgo(date) {
  if (!date) return '';
  // Backend stores UTC via datetime.utcnow() but omits the 'Z' suffix.
  // Without 'Z', JS Date() treats the string as local time → wrong offset.
  let dateStr = typeof date === 'string' ? date : String(date);
  if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
    dateStr += 'Z';
  }
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function formatDate(date) {
  if (!date) return '';
  let dateStr = typeof date === 'string' ? date : String(date);
  if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
    dateStr += 'Z';
  }
  return format(new Date(dateStr), 'MMM d, yyyy');
}

export function formatCurrency(min, max) {
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  if (min && max && min !== max) return `${fmt(min)} – ${fmt(max)}`;
  if (max) return fmt(max);
  if (min) return `${fmt(min)}+`;
  return 'Negotiable';
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export function truncate(str, len = 80) {
  if (!str || str.length <= len) return str;
  return str.slice(0, len) + '…';
}
