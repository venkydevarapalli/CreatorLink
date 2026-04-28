export const API_URL = '/';
export const WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

export const ROLES = [
  { value: 'brand', label: 'Brand', icon: '🏢', desc: 'Post job postings & manage bids' },
  { value: 'influencer', label: 'Influencer', icon: '⭐', desc: 'Apply to promotions & post edits' },
  { value: 'editor', label: 'Editor', icon: '🎬', desc: 'Edit videos & visual content' },
  { value: 'photographer', label: 'Photographer', icon: '📷', desc: 'Capture stunning visuals' },
  { value: 'admin', label: 'Admin', icon: '⚙️', desc: 'Manage the platform' },
];

export const GIG_CATEGORIES = [
  { value: 'editing', label: 'Editing' },
  { value: 'photography', label: 'Photography' },
  { value: 'promotion', label: 'Promotion' },
];

export const BID_STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  accepted: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  countered: 'bg-blue-500/20 text-blue-400',
  withdrawn: 'bg-gray-500/20 text-gray-400',
};

export const ROLE_COLORS = {
  brand: 'from-blue-500 to-cyan-500',
  influencer: 'from-pink-500 to-rose-500',
  editor: 'from-violet-500 to-purple-500',
  director: 'from-amber-500 to-orange-500',
  photographer: 'from-emerald-500 to-teal-500',
  admin: 'from-gray-500 to-slate-500',
};
