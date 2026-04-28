import { useState, useEffect } from 'react';
import { getAnalytics, listUsers, deleteUser, listGigsAdmin, deleteGigAdmin, listBidsAdmin, deleteBidAdmin } from '../../api/admin';
import { Trash2, ExternalLink, Users, Briefcase, Gavel, Clock, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/helpers';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [anRes, userRes, gigRes, bidRes] = await Promise.all([
        getAnalytics(), listUsers(), listGigsAdmin(), listBidsAdmin()
      ]);
      setAnalytics(anRes.data);
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);
      setGigs(Array.isArray(gigRes.data) ? gigRes.data : []);
      setBids(Array.isArray(bidRes.data) ? bidRes.data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try { await deleteUser(id); setUsers(users.filter(u => u.id !== id)); setAnalytics(prev => ({ ...prev, total_users: prev.total_users - 1 })); } catch (e) { alert(e.response?.data?.detail || "Failed to delete user"); }
  };
  const handleDeleteGig = async (id) => {
    if (!window.confirm("Remove this gig from the platform?")) return;
    try { await deleteGigAdmin(id); setGigs(gigs.filter(g => g.id !== id)); setAnalytics(prev => ({ ...prev, total_gigs: prev.total_gigs - 1 })); } catch (e) { alert(e.response?.data?.detail || "Failed to delete gig"); }
  };
  const handleDeleteBid = async (id) => {
    if (!window.confirm("Remove this bid?")) return;
    try { await deleteBidAdmin(id); setBids(bids.filter(b => b.id !== id)); setAnalytics(prev => ({ ...prev, total_bids: prev.total_bids - 1 })); } catch (e) { alert(e.response?.data?.detail || "Failed to delete bid"); }
  };

  const statusBadge = (status) => {
    const map = {
      open: 'dc-badge-green', in_progress: 'dc-badge-blue', completed: 'dc-badge-purple',
      pending: 'dc-badge-yellow', accepted: 'dc-badge-green', rejected: 'dc-badge-red', countered: 'dc-badge-blue',
    };
    return `dc-badge ${map[status] || 'dc-badge-gray'}`;
  };

  const roleBadge = (role) => {
    const map = { admin: 'dc-badge-red', brand: 'dc-badge-purple', influencer: 'dc-badge-yellow', editor: 'dc-badge-green', photographer: 'dc-badge-blue' };
    return `dc-badge ${map[role] || 'dc-badge-gray'}`;
  };

  const tabs = [
    { id: 'users', label: 'Community', icon: Users, count: users.length },
    { id: 'gigs', label: 'Gigs', icon: Briefcase, count: gigs.length },
    { id: 'bids', label: 'Bids', icon: Gavel, count: bids.length },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        {[
          { label: 'Total Users', val: analytics?.total_users, icon: Users },
          { label: 'Total Gigs', val: analytics?.total_gigs, icon: Briefcase },
          { label: 'Total Bids', val: analytics?.total_bids, icon: Gavel },
        ].map((s, i) => (
          <div key={s.label} className="dc-stat animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="dc-stat-label">{s.label}</p>
                <p className="dc-stat-number mt-1">{s.val || 0}</p>
              </div>
              <div className="p-2 rounded-lg bg-[var(--color-primary)]/10">
                <s.icon size={18} className="text-[var(--color-primary)]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="dc-card overflow-hidden" style={{ borderRadius: 20 }}>
        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)] bg-[var(--color-secondary)]">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-[var(--color-primary)] border-[var(--color-primary)]'
                  : 'text-[var(--color-muted-foreground)] border-transparent hover:text-[var(--color-foreground)]'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              <span className="dc-badge dc-badge-gray ml-1">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-16 text-center flex flex-col items-center gap-3">
              <div className="dc-spinner" />
              <span className="text-sm text-[var(--color-muted-foreground)]">Loading data…</span>
            </div>
          ) : (
            <div className="overflow-x-auto">

              {activeTab === 'users' && (
                <div>
                  <div className="flex justify-end p-4 border-b border-[var(--color-border)]">
                    <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} className="dc-input text-sm py-2 px-4 rounded-xl w-auto bg-[var(--color-background)]" style={{ border: '1px solid var(--color-border)' }}>
                      <option value="all">Filter by Role: All</option>
                      <option value="brand">Brand</option>
                      <option value="influencer">Influencer</option>
                      <option value="editor">Editor</option>
                      <option value="photographer">Photographer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <table className="w-full text-left whitespace-nowrap">
                  <thead><tr>
                    {['Member', 'Role', 'Email', 'Joined', 'Actions'].map(h => (
                      <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-[var(--color-muted-foreground)] ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {users.filter(u => userRoleFilter === 'all' || u.role === userRoleFilter).map(u => (
                      <tr key={u.id} className="transition-colors border-t border-[var(--color-border)] hover:bg-[var(--color-secondary)]">
                        <td className="px-4 py-3.5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : u.display_name?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--color-foreground)]">{u.display_name}</p>
                            <span className="text-xs text-amber-400">★ {u.ratings || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5"><span className={roleBadge(u.role)}>{u.role}</span></td>
                        <td className="px-4 py-3.5 text-sm text-[var(--color-muted-foreground)]">{u.email}</td>
                        <td className="px-4 py-3.5 text-sm text-[var(--color-muted-foreground)]">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/profile/${u.id}`} className="dc-btn-ghost p-1.5 rounded-lg"><ExternalLink size={14} /></Link>
                            {u.role !== 'admin' && <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 rounded-lg transition-all bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={14} /></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.filter(u => userRoleFilter === 'all' || u.role === userRoleFilter).length === 0 && <tr><td colSpan="5" className="px-4 py-12 text-center text-[var(--color-muted-foreground)]">No users found</td></tr>}
                  </tbody>
                </table>
                </div>
              )}

              {activeTab === 'gigs' && (
                <table className="w-full text-left whitespace-nowrap">
                  <thead><tr>
                    {['Gig Title', 'Posted By', 'Category', 'Budget', 'Status', 'Action'].map(h => (
                      <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-[var(--color-muted-foreground)] ${h === 'Action' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {gigs.map(g => (
                      <tr key={g.id} className="transition-colors border-t border-[var(--color-border)] hover:bg-[var(--color-secondary)]">
                        <td className="px-4 py-3.5 max-w-xs truncate text-sm font-medium text-[var(--color-foreground)]">{g.title}</td>
                        <td className="px-4 py-3.5 text-sm text-[var(--color-muted-foreground)]">{g.poster_name}</td>
                        <td className="px-4 py-3.5"><span className="dc-badge dc-badge-blue capitalize">{g.category}</span></td>
                        <td className="px-4 py-3.5 text-sm text-emerald-400">{formatCurrency(g.budget_min, g.budget_max)}</td>
                        <td className="px-4 py-3.5"><span className={statusBadge(g.status)}>{g.status}</span></td>
                        <td className="px-4 py-3.5 text-right">
                          <button onClick={() => handleDeleteGig(g.id)} className="p-1.5 rounded-lg transition-all bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                    {gigs.length === 0 && <tr><td colSpan="6" className="px-4 py-12 text-center text-[var(--color-muted-foreground)]">No gigs yet</td></tr>}
                  </tbody>
                </table>
              )}

              {activeTab === 'bids' && (
                <table className="w-full text-left whitespace-nowrap">
                  <thead><tr>
                    {['Bidder', 'For Gig', 'Amount', 'Days', 'Status', 'Message', 'Action'].map(h => (
                      <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-[var(--color-muted-foreground)] ${h === 'Action' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {bids.map(b => (
                      <tr key={b.id} className="transition-colors border-t border-[var(--color-border)] hover:bg-[var(--color-secondary)]">
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-medium text-[var(--color-foreground)]">{b.bidder_name}</p>
                          <span className="dc-badge dc-badge-blue capitalize" style={{ fontSize: 10 }}>{b.bidder_role}</span>
                        </td>
                        <td className="px-4 py-3.5 max-w-[180px] truncate text-sm text-[var(--color-muted-foreground)]">{b.gig_title}</td>
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-1 text-sm text-emerald-400"><IndianRupee size={12} />{b.amount}</span>
                          {b.counter_amount && <span className="text-xs text-amber-400">↔ ₹{b.counter_amount}</span>}
                        </td>
                        <td className="px-4 py-3.5"><span className="flex items-center gap-1 text-sm text-[var(--color-muted-foreground)]"><Clock size={12} />{b.turnaround_days}d</span></td>
                        <td className="px-4 py-3.5"><span className={statusBadge(b.status)}>{b.status}</span></td>
                        <td className="px-4 py-3.5 max-w-[120px] truncate text-xs text-[var(--color-muted-foreground)]">{b.message || '-'}</td>
                        <td className="px-4 py-3.5 text-right">
                          <button onClick={() => handleDeleteBid(b.id)} className="p-1.5 rounded-lg transition-all bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                    {bids.length === 0 && <tr><td colSpan="7" className="px-4 py-12 text-center text-[var(--color-muted-foreground)]">No bids yet</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
