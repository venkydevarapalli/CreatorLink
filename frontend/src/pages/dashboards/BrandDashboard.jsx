import { useState, useEffect } from 'react';
import { listGigs } from '../../api/gigs';
import { listBidsForGig } from '../../api/bids';
import { Link } from 'react-router-dom';
import { formatCurrency, timeAgo } from '../../utils/helpers';
import { Briefcase, IndianRupee, Clock, ArrowRight } from 'lucide-react';
import { BID_STATUS_COLORS } from '../../utils/constants';
import Modal from '../../components/common/Modal';

export default function BrandDashboard({ user }) {
  const [gigs, setGigs] = useState([]);
  const [gigBids, setGigBids] = useState({});
  const [selectedGig, setSelectedGig] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    listGigs({ limit: 10 }).then(async r => {
      const myGigs = (r.data.gigs || []).filter(g => g.poster?.id === user.id);
      setGigs(myGigs);
      const allBids = await Promise.all(myGigs.map(g => listBidsForGig(g.id).catch(() => ({ data: { bids: [] } }))));
      const bidsMap = {};
      myGigs.forEach((g, i) => bidsMap[g.id] = allBids[i].data?.bids || []);
      setGigBids(bidsMap);
    }).catch(()=>{});
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--color-foreground)] tracking-tight">Your Brand Gigs</h2>
        <Link to="/gigs" className="dc-btn-primary px-5 py-2 text-sm flex items-center gap-2">
          <Briefcase size={16} /> Post New Gig
        </Link>
      </div>

      <div className="flex justify-end mt-2">
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="dc-input text-sm py-2 px-4 rounded-xl w-auto bg-[var(--color-secondary)]">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {gigs.length === 0 ? (
        <div className="dc-card p-16 text-center" style={{ borderRadius: 20 }}>
          <p className="text-4xl opacity-50">📋</p>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-2">No gigs posted yet. Time to hire some creators!</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6 stagger-children">
          {[...gigs].sort((a,b) => sortOrder === 'oldest' ? new Date(a.created_at) - new Date(b.created_at) : new Date(b.created_at) - new Date(a.created_at)).map((gig, i) => (
            <div key={gig.id} className="dc-card p-5 flex flex-col justify-between animate-fade-in" style={{ borderRadius: 20, animationDelay: `${i * 0.05}s` }}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-[var(--color-foreground)]">{gig.title}</h3>
                  <span className={`dc-badge ${gig.status === 'completed' ? 'dc-badge-green' : 'dc-badge-blue'} capitalize`}>
                    {gig.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="line-clamp-2 mb-2 text-sm text-[var(--color-muted-foreground)] leading-relaxed">{gig.description}</p>
                <button onClick={() => setSelectedGig(gig)} className="text-xs text-[var(--color-primary)] font-medium mb-4 flex items-center gap-1 hover:underline">Read full description <ArrowRight size={12} /></button>
              </div>
              
              <div className="flex justify-between items-center mb-4 text-sm">
                <span className="text-emerald-400 font-medium">{formatCurrency(gig.budget_min, gig.budget_max)}</span>
                <Link to="/bids/manage" className="text-xs text-[var(--color-primary)]">Manage All</Link>
              </div>

              <div className="pt-4 mt-auto border-t border-[var(--color-border)]">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-[var(--color-muted-foreground)] mb-2">Recent Bids</p>
                {!gigBids[gig.id] || gigBids[gig.id].length === 0 ? (
                  <p className="text-sm text-[var(--color-muted-foreground)]">No bids received yet.</p>
                ) : (
                  <div className="space-y-2">
                    {gigBids[gig.id].slice(0, 3).map(bid => (
                      <div key={bid.id} className="rounded-xl p-3 bg-[var(--color-secondary)] border border-[var(--color-border)]">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-[var(--color-foreground)]">{bid.bidder?.display_name || 'User'}</p>
                          <span className={`dc-badge ${BID_STATUS_COLORS[bid.status]?.includes('green') ? 'dc-badge-green' : BID_STATUS_COLORS[bid.status]?.includes('yellow') ? 'dc-badge-yellow' : BID_STATUS_COLORS[bid.status]?.includes('red') ? 'dc-badge-red' : 'dc-badge-gray'} capitalize`}>{bid.status}</span>
                        </div>
                        <p className="truncate mb-2 text-xs text-[var(--color-muted-foreground)]">{bid.message}</p>
                        <div className="flex items-center gap-3 text-xs text-[var(--color-muted-foreground)]">
                          <span className="flex items-center gap-1"><IndianRupee size={12} /> {bid.amount}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {bid.turnaround_days}d</span>
                        </div>
                      </div>
                    ))}
                    {gigBids[gig.id].length > 3 && (
                      <Link to="/bids/manage" className="block text-center mt-2 text-xs text-[var(--color-primary)]">View {gigBids[gig.id].length - 3} more bids</Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedGig && (
        <Modal isOpen={!!selectedGig} onClose={() => setSelectedGig(null)} title="Gig Details" maxWidth="max-w-2xl">
          <div className="space-y-4 pt-2">
            <h3 className="text-xl font-bold text-[var(--color-foreground)]">{selectedGig.title}</h3>
            <div className="flex gap-3 text-xs">
              <span className="dc-badge dc-badge-blue capitalize">{selectedGig.category}</span>
              <span className={`dc-badge ${selectedGig.status === 'completed' ? 'dc-badge-green' : 'dc-badge-gray'} capitalize`}>{selectedGig.status.replace('_', ' ')}</span>
            </div>
            <p className="text-sm font-medium text-emerald-400">Budget: {formatCurrency(selectedGig.budget_min, selectedGig.budget_max)}</p>
            <div className="pt-4 border-t border-[var(--color-border)]">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-[var(--color-muted-foreground)] mb-2">Full Description</h4>
              <p className="text-sm text-[var(--color-foreground)] whitespace-pre-wrap leading-relaxed">{selectedGig.description}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
