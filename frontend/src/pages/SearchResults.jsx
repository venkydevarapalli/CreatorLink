import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { listGigs } from '../api/gigs';
import { listUsers } from '../api/users';
import { Search, User, Briefcase, ChevronRight } from 'lucide-react';
import { formatCurrency, timeAgo } from '../utils/helpers';

export default function SearchResults() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const q = searchParams.get('q') || '';

  const [gigs, setGigs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'gigs', 'users'

  useEffect(() => {
    if (!q) {
      setGigs([]);
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      listGigs({ q, limit: 10 }),
      listUsers({ search: q, limit: 10 })
    ])
      .then(([gigsRes, usersRes]) => {
        setGigs(gigsRes.data.gigs || []);
        setUsers(usersRes.data.users || []);
      })
      .catch(err => console.error("Search failed:", err))
      .finally(() => setLoading(false));
  }, [q]);

  if (loading) {
    return (
      <div className="pt-24 text-center flex flex-col items-center gap-3">
        <div className="dc-spinner"></div>
        <span style={{ color: 'var(--color-muted-foreground)', fontFamily: 'Inter' }}>Searching...</span>
      </div>
    );
  }

  const renderGigCard = (gig) => (
    <Link key={gig.id} to={`/gigs`} className="dc-card p-5 hover:border-[var(--color-primary)]/50 transition-all block text-left" style={{ borderRadius: 16 }}>
      <h3 className="line-clamp-1 mb-2 font-bold text-[var(--color-foreground)]">{gig.title}</h3>
      <p className="line-clamp-2 text-sm text-[var(--color-muted-foreground)] mb-3">{gig.description}</p>
      <div className="flex items-center justify-between text-xs text-[var(--color-muted-foreground)]">
        <span>{formatCurrency(gig.budget_min, gig.budget_max)}</span>
        <span>{timeAgo(gig.created_at)}</span>
      </div>
    </Link>
  );

  const renderUserCard = (u) => (
    <Link key={u.id} to={`/profile/${u.id}`} className="dc-card p-4 flex items-center gap-4 hover:border-[var(--color-primary)]/50 transition-all text-left" style={{ borderRadius: 16 }}>
      {u.avatar_url ? (
        <img src={u.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
      ) : (
        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
          {u.display_name?.[0]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-[var(--color-foreground)] truncate">{u.display_name}</h3>
        <p className="text-xs text-[var(--color-muted-foreground)] capitalize">{u.role}</p>
      </div>
      <ChevronRight size={16} className="text-[var(--color-muted-foreground)]" />
    </Link>
  );

  return (
    <div className="animate-fade-in max-w-5xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)] tracking-tight">
          Search Results for "{q}"
        </h1>
        <p className="text-[var(--color-muted-foreground)] mt-2">
          Found {gigs.length} gigs and {users.length} users.
        </p>
      </div>

      <div className="flex gap-4 mb-8 border-b border-[var(--color-border)] pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'all' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'}`}
        >
          All Results
        </button>
        <button
          onClick={() => setActiveTab('gigs')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'gigs' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'}`}
        >
          Gigs ({gigs.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'users' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'}`}
        >
          Brands & Creators ({users.length})
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Gigs Section */}
        {(activeTab === 'all' || activeTab === 'gigs') && (
          <div>
            <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
              <Briefcase size={18} /> Found Gigs
            </h2>
            {gigs.length === 0 ? (
              <p className="text-[var(--color-muted-foreground)] text-sm">No gigs found matching your search.</p>
            ) : (
              <div className="grid gap-3">
                {gigs.map(renderGigCard)}
              </div>
            )}
          </div>
        )}

        {/* Users Section */}
        {(activeTab === 'all' || activeTab === 'users') && (
          <div>
            <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
              <User size={18} /> Found Brands & Creators
            </h2>
            {users.length === 0 ? (
              <p className="text-[var(--color-muted-foreground)] text-sm">No users found matching your search.</p>
            ) : (
              <div className="grid gap-3">
                {users.map(renderUserCard)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
