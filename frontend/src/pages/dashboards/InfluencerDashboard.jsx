import { useState, useEffect } from 'react';
import { listGigs } from '../../api/gigs';
import { listMyBids } from '../../api/bids';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../utils/helpers';

export default function InfluencerDashboard({ user }) {
  const [bids, setBids] = useState([]);
  const [myGigs, setMyGigs] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedGig, setSelectedGig] = useState(null);

  useEffect(() => {
    listMyBids({ limit: 10 }).then(r => setBids(r.data.bids || [])).catch(()=>{});
    listGigs({ limit: 10 }).then(r => setMyGigs((r.data.gigs || []).filter(g => g.poster?.id === user.id))).catch(()=>{});
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--color-foreground)] tracking-tight">Promotion Bids</h2>
            <Link to="/gigs" className="text-sm text-[var(--color-primary)]">Find Brands</Link>
          </div>
          <div className="dc-card p-4 space-y-3" style={{ borderRadius: 16 }}>
            {bids.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-2xl opacity-50">📢</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-2">No promotion bids yet.</p>
              </div>
            ) : bids.map(bid => (
              <div key={bid.id} className="flex justify-between items-center p-3 rounded-xl bg-[var(--color-secondary)] border border-[var(--color-border)]">
                <div className="truncate">
                  <p className="truncate text-sm font-medium text-[var(--color-foreground)]">{bid.gig?.title}</p>
                  <p className="truncate text-xs text-[var(--color-muted-foreground)] mt-0.5">{bid.message}</p>
                </div>
                <span className="dc-badge dc-badge-gray capitalize ml-2">{bid.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--color-foreground)] tracking-tight">My Hiring Gigs</h2>
            <div className="flex items-center gap-3">
              <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="dc-input text-xs py-1 px-2 rounded w-auto bg-[var(--color-secondary)]">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
              <Link to="/gigs" className="text-sm text-[var(--color-primary)]">Hire Editor</Link>
            </div>
          </div>
          <div className="dc-card p-4 space-y-3" style={{ borderRadius: 16 }}>
            {myGigs.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-2xl opacity-50">🎬</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-2">No hiring gigs posted.</p>
              </div>
            ) : [...myGigs].sort((a,b) => sortOrder === 'oldest' ? new Date(a.created_at) - new Date(b.created_at) : new Date(b.created_at) - new Date(a.created_at)).map(gig => (
              <div key={gig.id} className="flex justify-between items-start p-3 rounded-xl bg-[var(--color-secondary)] border border-[var(--color-border)]">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="truncate text-sm font-medium text-[var(--color-foreground)]">{gig.title}</p>
                  <p className="capitalize text-xs text-emerald-400 mb-1">{formatCurrency(gig.budget_min, gig.budget_max)} • {gig.category.replace('_', ' ')}</p>
                  <p className="line-clamp-1 mb-1 text-xs text-[var(--color-muted-foreground)] leading-relaxed">{gig.description}</p>
                  <button onClick={() => setSelectedGig(gig)} className="text-[10px] text-[var(--color-primary)] font-medium flex items-center gap-1 hover:underline">Read full description <ArrowRight size={10} /></button>
                </div>
                <span className={`dc-badge ${gig.status === 'completed' ? 'dc-badge-green' : 'dc-badge-gray'} capitalize ml-2 shrink-0`}>{gig.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
