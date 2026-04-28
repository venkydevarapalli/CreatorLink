import { useState, useEffect } from 'react';
import { listMyBids } from '../../api/bids';
import { Link } from 'react-router-dom';

export default function EditorDashboard({ user }) {
  const [bids, setBids] = useState([]);

  useEffect(() => {
    listMyBids({ limit: 10 }).then(r => setBids(r.data.bids || [])).catch(()=>{});
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--color-foreground)] tracking-tight">My Editing Proposals</h2>
        <Link to="/gigs" className="dc-btn-primary px-5 py-2 text-sm">Find Editing Work</Link>
      </div>

      <div className="dc-card p-5 space-y-3" style={{ borderRadius: 20 }}>
        {bids.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-3xl opacity-50">✂️</p>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-2">You haven't bid on any editing gigs yet.</p>
          </div>
        ) : bids.map(bid => (
          <div key={bid.id} className="flex justify-between items-center p-4 rounded-xl bg-[var(--color-secondary)] border border-[var(--color-border)] transition-all">
            <div className="flex-1 truncate pr-4">
              <p className="truncate text-sm font-medium text-[var(--color-foreground)]">{bid.gig?.title}</p>
              <p className="truncate text-xs text-[var(--color-muted-foreground)] mt-1">{bid.message}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-medium text-emerald-400">₹{bid.amount}</p>
              <span className={`dc-badge ${bid.status === 'accepted' ? 'dc-badge-green' : 'dc-badge-gray'} capitalize`}>{bid.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
