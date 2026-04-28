import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { listGigs, createGig, deleteGig } from '../api/gigs';
import { createBid } from '../api/bids';
import { GIG_CATEGORIES } from '../utils/constants';
import { formatCurrency, timeAgo } from '../utils/helpers';
import Modal from '../components/common/Modal';
import { Plus, IndianRupee, Clock, Send, MessageCircle, Filter, Trash2, ArrowRight } from 'lucide-react';

const CAN_POST = ['brand', 'influencer'];
const CAN_BID = ['editor', 'photographer', 'influencer'];

export default function GigMarketplace() {
  const { user } = useAuth();
  const { openChat } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const q = searchParams.get('q') || '';
  const [gigs, setGigs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', budget_min: '', budget_max: '', status: 'open', sort: 'created_at-desc' });
  const [bidModal, setBidModal] = useState(null);
  const [selectedGigDetails, setSelectedGigDetails] = useState(null);
  const [bidForm, setBidForm] = useState({ amount: '', turnaround_days: '', message: '' });
  const [bidLoading, setBidLoading] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', budget_min: 0, budget_max: 0, category: 'editing', role_target: [] });

  const isPostAllowed = CAN_POST.includes(user?.role);
  const isBidAllowed = CAN_BID.includes(user?.role);

  const loadGigs = async () => {
    setLoading(true);
    try {
      const [sort_by, sort_order] = filters.sort.split('-');
      const params = { ...filters, sort_by, sort_order, limit: 20 };
      delete params.sort;
      if (!params.category) delete params.category;
      if (!params.budget_min) delete params.budget_min;
      if (!params.budget_max) delete params.budget_max;
      if (!params.status) delete params.status;
      if (q) params.q = q;
      const { data } = await listGigs(params);
      setGigs(data.gigs || []);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadGigs(); }, [filters, q]);

  const handleBid = async () => {
    if (!bidModal) return;
    setBidLoading(true);
    try {
      await createBid({ gig_id: bidModal.id, amount: parseFloat(bidForm.amount), turnaround_days: parseInt(bidForm.turnaround_days), message: bidForm.message });
      setBidModal(null); setBidForm({ amount: '', turnaround_days: '', message: '' }); loadGigs();
    } catch (e) { alert(e.response?.data?.detail || 'Bid failed'); } finally { setBidLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createGig({ ...createForm, budget_min: parseFloat(createForm.budget_min) || 0, budget_max: parseFloat(createForm.budget_max) || 0 });
      setCreateModal(false); setCreateForm({ title: '', description: '', budget_min: 0, budget_max: 0, category: 'editing', role_target: [] }); loadGigs();
    } catch (e) { alert(e.response?.data?.detail || 'Create failed'); }
  };

  const handleDeleteGig = async (gigId) => {
    if (!confirm('Are you sure you want to delete this gig?')) return;
    try {
      await deleteGig(gigId);
      loadGigs();
    } catch (e) {
      alert(e.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 28, color: 'var(--color-foreground)', letterSpacing: '-1px' }}>
            {isPostAllowed ? 'My Gigs' : 'Browse Gigs'}
          </h1>
          <p style={{ color: 'var(--color-muted-foreground)', fontSize: 14, fontFamily: 'Inter', marginTop: 4 }}>
            {isPostAllowed ? `${total} gig${total !== 1 ? 's' : ''} posted` : `${total} gig${total !== 1 ? 's' : ''} available`}
          </p>
        </div>
        {isPostAllowed && (
          <button onClick={() => setCreateModal(true)} className="dc-btn-primary px-5 py-2.5 text-sm flex items-center gap-1.5">
            <Plus size={16} /> Post a Gig
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="dc-card p-4 mb-6 flex flex-wrap gap-3" style={{ borderRadius: 14 }}>
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="dc-input px-3 py-2 text-sm">
          <option value="">All Categories</option>
          {GIG_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input type="number" placeholder="Min ₹" value={filters.budget_min} onChange={(e) => setFilters({ ...filters, budget_min: e.target.value })} className="dc-input px-3 py-2 text-sm w-24" />
        <input type="number" placeholder="Max ₹" value={filters.budget_max} onChange={(e) => setFilters({ ...filters, budget_max: e.target.value })} className="dc-input px-3 py-2 text-sm w-24" />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="dc-input px-3 py-2 text-sm">
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="">All</option>
        </select>
        <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className="dc-input px-3 py-2 text-sm ml-auto">
          <option value="created_at-desc">Newest First</option>
          <option value="created_at-asc">Oldest First</option>
          <option value="budget_max-desc">Highest Amount</option>
          <option value="budget_min-asc">Lowest Amount</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <div className="dc-spinner"></div>
          <span style={{ color: 'var(--color-muted-foreground)', fontFamily: 'Inter', fontSize: 14 }}>Loading gigs…</span>
        </div>
      ) : gigs.length === 0 ? (
        <div className="dc-card p-16 text-center" style={{ borderRadius: 20 }}>
          <p style={{ fontSize: 40, opacity: 0.5 }}>📋</p>
          <p style={{ color: 'var(--color-muted-foreground)', fontFamily: 'Inter', fontSize: 14, marginTop: 8 }}>
            {isPostAllowed ? "You haven't posted any gigs yet." : 'No gigs available right now.'}
          </p>
          {isPostAllowed && <button onClick={() => setCreateModal(true)} className="dc-btn-primary px-5 py-2 text-sm mt-4">Post Your First Gig</button>}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {gigs.map((gig) => {
            const isOwner = gig.posted_by === user?.id || (gig.poster?.id === user?.id);
            return (
              <div key={gig.id} className="dc-card p-5 animate-fade-in" style={{ borderRadius: 20 }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="line-clamp-1" style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-foreground)' }}>{gig.title}</h3>
                  <span className={`shrink-0 dc-badge ${gig.status === 'open' ? 'dc-badge-green' : gig.status === 'in_progress' ? 'dc-badge-blue' : 'dc-badge-yellow'} capitalize`}>{gig.status?.replace('_', ' ')}</span>
                </div>
                <p className="line-clamp-2 mb-1" style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'Inter', lineHeight: 1.5 }}>{gig.description}</p>
                <button onClick={() => setSelectedGigDetails(gig)} className="text-[10px] text-[var(--color-primary)] font-medium flex items-center gap-1 hover:underline mb-3 mt-1">Read full description <ArrowRight size={10} /></button>
                {gig.poster && (
                  <div className="flex items-center gap-2 mb-3">
                    {gig.poster.avatar_url ? <img src={gig.poster.avatar_url} alt="" className="w-5 h-5 rounded-full" /> : <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-white text-[8px] font-bold">{gig.poster.display_name?.[0]}</div>}
                    <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'Inter' }}>{gig.poster.display_name}</span>
                    <span className="dc-badge dc-badge-gray capitalize">{gig.poster.role}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-3" style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'Inter' }}>
                  <span className="flex items-center gap-1"><IndianRupee size={12} />{formatCurrency(gig.budget_min, gig.budget_max)}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{timeAgo(gig.created_at)}</span>
                </div>
                <div className="flex gap-2 mt-auto">
                  {isBidAllowed && gig.status === 'open' && !isOwner && (
                    ((user.role === 'influencer' && gig.category === 'promotion' && gig.poster?.role === 'brand') ||
                     (user.role === 'editor' && gig.category === 'editing') ||
                     (user.role === 'photographer' && gig.category === 'photography')) && (
                      <button onClick={() => setBidModal(gig)} className="dc-btn-primary flex-1 px-3 py-1.5 text-xs flex items-center justify-center gap-1"><Send size={12} /> Place Bid</button>
                    )
                  )}
                  {gig.conversation_id && isOwner && (
                    <button onClick={() => openChat(gig.conversation_id)} className="flex-1 px-3 py-1.5 rounded-full text-xs font-medium flex items-center justify-center gap-1 transition-all" style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', fontWeight: 700 }}><MessageCircle size={12} /> Chat</button>
                  )}
                  {gig.conversation_id && !isOwner && gig.accepted_user === user?.id && (
                    <button onClick={() => openChat(gig.conversation_id)} className="flex-1 px-3 py-1.5 rounded-full text-xs font-medium flex items-center justify-center gap-1 transition-all" style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', fontWeight: 700 }}><MessageCircle size={12} /> Chat</button>
                  )}
                  {isOwner && gig.status === 'open' && (
                    <button onClick={() => handleDeleteGig(gig.id)} className="flex-1 px-3 py-1.5 rounded-full text-xs font-medium flex items-center justify-center gap-1 transition-all" style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', fontWeight: 700 }}><Trash2 size={12} /> Delete</button>
                  )}
                  {gig.status === 'completed' && (
                    <div className="flex-1 px-3 py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1 bg-emerald-500/10 text-emerald-500 uppercase tracking-widest">
                      Gig Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bid Modal */}
      <Modal isOpen={!!bidModal} onClose={() => setBidModal(null)} title={`Bid on: ${bidModal?.title}`}>
        <div className="space-y-4">
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'Inter' }}>Budget range: <span style={{ color: 'var(--color-foreground)', fontWeight: 500 }}>{formatCurrency(bidModal?.budget_min, bidModal?.budget_max)}</span></p>
          <div>
            <label className="block mb-1.5" style={{ fontSize: 12, fontFamily: 'Inter', fontWeight: 500, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Amount (₹)</label>
            <input type="number" value={bidForm.amount} onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })} className="dc-input w-full px-4 py-2.5 text-sm" placeholder="350" />
          </div>
          <div>
            <label className="block mb-1.5" style={{ fontSize: 12, fontFamily: 'Inter', fontWeight: 500, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '1px' }}>Turnaround (days)</label>
            <input type="number" value={bidForm.turnaround_days} onChange={(e) => setBidForm({ ...bidForm, turnaround_days: e.target.value })} className="dc-input w-full px-4 py-2.5 text-sm" placeholder="5" />
          </div>
          <div>
            <label className="block mb-1.5" style={{ fontSize: 12, fontFamily: 'Inter', fontWeight: 500, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '1px' }}>Message</label>
            <textarea rows={3} value={bidForm.message} onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })} className="dc-input w-full px-4 py-2.5 text-sm resize-none" placeholder="Why you're the best fit…" />
          </div>
          <button onClick={handleBid} disabled={bidLoading || !bidForm.amount || !bidForm.turnaround_days} className="dc-btn-primary w-full py-2.5 text-sm">{bidLoading ? 'Submitting…' : 'Submit Bid'}</button>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Post a New Gig" maxWidth="max-w-xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <input type="text" required value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} className="dc-input w-full px-4 py-2.5 text-sm" placeholder="Gig title" />
          <textarea rows={3} required value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} className="dc-input w-full px-4 py-2.5 text-sm resize-none" placeholder="Describe what you need done…" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={createForm.budget_min} onChange={(e) => setCreateForm({ ...createForm, budget_min: e.target.value })} className="dc-input px-4 py-2.5 text-sm" placeholder="Min ₹" />
            <input type="number" value={createForm.budget_max} onChange={(e) => setCreateForm({ ...createForm, budget_max: e.target.value })} className="dc-input px-4 py-2.5 text-sm" placeholder="Max ₹" />
          </div>
          <select value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })} className="dc-input w-full px-4 py-2.5 text-sm">
            {GIG_CATEGORIES.filter(c => user.role === 'brand' || c.value !== 'promotion').map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <button type="submit" className="dc-btn-primary w-full py-2.5 text-sm">Post Gig</button>
        </form>
      </Modal>

      {/* Gig Details Modal */}
      {selectedGigDetails && (
        <Modal isOpen={!!selectedGigDetails} onClose={() => setSelectedGigDetails(null)} title="Gig Details" maxWidth="max-w-2xl">
          <div className="space-y-4 pt-2">
            <h3 className="text-xl font-bold text-[var(--color-foreground)]">{selectedGigDetails.title}</h3>
            <div className="flex gap-3 text-xs">
              <span className="dc-badge dc-badge-blue capitalize">{selectedGigDetails.category}</span>
              <span className={`dc-badge ${selectedGigDetails.status === 'completed' ? 'dc-badge-green' : 'dc-badge-gray'} capitalize`}>{selectedGigDetails.status.replace('_', ' ')}</span>
            </div>
            <p className="text-sm font-medium text-emerald-400">Budget: {formatCurrency(selectedGigDetails.budget_min, selectedGigDetails.budget_max)}</p>
            <div className="pt-4 border-t border-[var(--color-border)]">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-[var(--color-muted-foreground)] mb-2">Full Description</h4>
              <p className="text-sm text-[var(--color-foreground)] whitespace-pre-wrap leading-relaxed">{selectedGigDetails.description}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
