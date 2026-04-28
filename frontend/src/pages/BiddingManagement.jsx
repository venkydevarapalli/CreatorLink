import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { listMyBids, listBidsForGig, acceptBid, rejectBid, counterBid } from '../api/bids';
import { listGigs } from '../api/gigs';
import { formatCurrency, timeAgo } from '../utils/helpers';
import { BID_STATUS_COLORS } from '../utils/constants';
import Modal from '../components/common/Modal';
import { MessageCircle, Check, X, RefreshCw, IndianRupee, Clock } from 'lucide-react';

export default function BiddingManagement() {
  const { user } = useAuth();
  const { openChat } = useChat();
  const [tab, setTab] = useState(user?.role === 'brand' ? 'received' : 'my-bids');
  const [myBids, setMyBids] = useState([]);
  const [myGigs, setMyGigs] = useState([]);
  const [selectedGigBids, setSelectedGigBids] = useState([]);
  const [selectedGig, setSelectedGig] = useState(null);
  const [counterModal, setCounterModal] = useState(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [loading, setLoading] = useState(true);

  const loadMyBids = async () => { try { const { data } = await listMyBids({ limit: 50 }); setMyBids(data.bids || []); } catch (e) { console.error(e); } };
  const loadMyGigs = async () => { try { const { data } = await listGigs({ posted_by: user?.id, limit: 50 }); setMyGigs(data.gigs || []); } catch (e) { console.error(e); } };

  useEffect(() => { setLoading(true); Promise.all([loadMyBids(), loadMyGigs()]).finally(() => setLoading(false)); }, [user]);

  const loadGigBids = async (gigId) => { try { const { data } = await listBidsForGig(gigId); setSelectedGigBids(data.bids || []); } catch (e) { console.error(e); } };

  const handleAccept = async (bidId) => { if (!confirm('Accept this bid?')) return; try { await acceptBid(bidId); if (selectedGig) loadGigBids(selectedGig.id); loadMyGigs(); } catch (e) { alert(e.response?.data?.detail || 'Failed'); } };
  const handleReject = async (bidId) => { if (!confirm('Reject this bid?')) return; try { await rejectBid(bidId); if (selectedGig) loadGigBids(selectedGig.id); } catch (e) { alert(e.response?.data?.detail || 'Failed'); } };
  const handleCounter = async () => { if (!counterModal) return; try { await counterBid(counterModal.id, { counter_amount: parseFloat(counterAmount) }); setCounterModal(null); if (selectedGig) loadGigBids(selectedGig.id); } catch (e) { alert(e.response?.data?.detail || 'Failed'); } };

  const bidStatusBadge = (status) => {
    const map = { pending: 'dc-badge-yellow', accepted: 'dc-badge-green', rejected: 'dc-badge-red', countered: 'dc-badge-blue' };
    return `dc-badge ${map[status] || 'dc-badge-gray'}`;
  };

  return (
    <div className="animate-fade-in">
      <h1 className="mb-6" style={{ fontWeight: 800, fontSize: 28, color: 'var(--color-foreground)', letterSpacing: '-1px' }}>Bidding Management</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 w-fit" style={{ background: 'var(--color-secondary)', borderRadius: 100, border: '1px solid var(--color-border)' }}>
        <button onClick={() => setTab('my-bids')} className={`px-5 py-2 text-sm transition-all ${tab === 'my-bids' ? 'dc-btn-primary' : 'dc-btn-ghost'}`} style={{ borderRadius: 100 }}>My Bids</button>
        <button onClick={() => { setTab('received'); setSelectedGig(null); }} className={`px-5 py-2 text-sm transition-all ${tab === 'received' ? 'dc-btn-primary' : 'dc-btn-ghost'}`} style={{ borderRadius: 100 }}>Bids Received</button>
      </div>

      {/* My Bids */}
      {tab === 'my-bids' && (
        <div className="space-y-3 stagger-children">
          {myBids.length === 0 && (
            <div className="dc-card p-16 text-center" style={{ borderRadius: 20 }}>
              <p style={{ fontSize: 40, opacity: 0.5 }}>📩</p>
              <p style={{ color: 'var(--color-muted-foreground)', fontFamily: 'Inter', fontSize: 14, marginTop: 8 }}>No bids submitted yet</p>
            </div>
          )}
          {myBids.map((bid) => (
            <div key={bid.id} className="dc-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-in" style={{ borderRadius: 16 }}>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)', fontFamily: 'Inter' }} className="truncate">{bid.gig?.title || 'Gig'}</p>
                <div className="flex items-center gap-3 mt-1" style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'Inter' }}>
                  <span className="flex items-center gap-1"><IndianRupee size={12} />₹{bid.amount}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{bid.turnaround_days} days</span>
                  <span>{timeAgo(bid.created_at)}</span>
                </div>
                {bid.counter_amount && <p style={{ fontSize: 12, color: '#fcd34d', marginTop: 4 }}>Counter: ₹{bid.counter_amount}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={bidStatusBadge(bid.status)} style={{ textTransform: 'capitalize' }}>{bid.status}</span>
                {bid.status === 'accepted' && bid.conversation_id && (
                  <button onClick={() => openChat(bid.conversation_id)} className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1 transition-all" style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', fontWeight: 700 }}><MessageCircle size={14} /> Chat</button>
                )}
                {(bid.status === 'pending' || bid.status === 'countered') && bid.conversation_id && (
                  <button onClick={() => openChat(bid.conversation_id)} className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1 dc-btn-ghost"><MessageCircle size={14} /> Negotiate</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Received Bids */}
      {tab === 'received' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p style={{ fontSize: 12, fontFamily: 'Inter', fontWeight: 500, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Your Gigs</p>
            {myGigs.length === 0 && <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'Inter' }}>No gigs posted</p>}
            {myGigs.map((gig) => (
              <button key={gig.id} onClick={() => { setSelectedGig(gig); loadGigBids(gig.id); }}
                className="w-full text-left p-3 transition-all" style={selectedGig?.id === gig.id ? { background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 14 } : { background: 'var(--color-secondary)', border: '1px solid var(--color-border)', borderRadius: 14 }}>
                <p className="truncate" style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)', fontFamily: 'Inter' }}>{gig.title}</p>
                <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'Inter', marginTop: 2 }}>
                  <span className={gig.status === 'completed' ? 'text-emerald-500 font-bold uppercase tracking-widest text-[10px]' : 'capitalize'}>{gig.status.replace('_', ' ')}</span> · {formatCurrency(gig.budget_min, gig.budget_max)}
                </p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {!selectedGig ? (
              <div className="dc-card p-16 text-center" style={{ borderRadius: 20 }}>
                <p style={{ fontSize: 40, opacity: 0.5 }}>👈</p>
                <p style={{ color: 'var(--color-muted-foreground)', fontFamily: 'Inter', fontSize: 14, marginTop: 8 }}>Select a gig to view bids</p>
              </div>
            ) : selectedGigBids.length === 0 ? (
              <div className="dc-card p-16 text-center" style={{ borderRadius: 20 }}>
                <p style={{ fontSize: 40, opacity: 0.5 }}>📭</p>
                <p style={{ color: 'var(--color-muted-foreground)', fontFamily: 'Inter', fontSize: 14, marginTop: 8 }}>No bids for this gig yet</p>
              </div>
            ) : (
              <div className="space-y-3 stagger-children">
                {selectedGig.status === 'completed' && (
                  <div className="p-3 mb-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-bold text-center uppercase tracking-widest">
                    This Gig is Completed
                  </div>
                )}
                {selectedGigBids.map((bid) => (
                  <div key={bid.id} className="dc-card p-4 animate-fade-in" style={{ borderRadius: 16 }}>
                    <div className="flex items-start gap-3">
                      {bid.bidder?.avatar_url && <img src={bid.bidder.avatar_url} alt="" className="w-9 h-9 rounded-full shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)', fontFamily: 'Inter' }}>{bid.bidder?.display_name || 'User'}</p>
                          <span className="dc-badge dc-badge-gray capitalize">{bid.bidder?.role}</span>
                          {bid.bidder?.ratings > 0 && <span style={{ fontSize: 12, color: '#fcd34d' }}>★ {bid.bidder.ratings}</span>}
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'Inter', marginTop: 4 }}>{bid.message}</p>
                        <div className="flex items-center gap-3 mt-2" style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'Inter' }}>
                          <span className="flex items-center gap-1" style={{ color: '#6ee7b7', fontWeight: 500 }}><IndianRupee size={12} />₹{bid.amount}</span>
                          <span className="flex items-center gap-1"><Clock size={12} />{bid.turnaround_days} days</span>
                        </div>
                      </div>
                      <span className={`${bidStatusBadge(bid.status)} shrink-0 capitalize`}>{bid.status}</span>
                    </div>
                    {bid.status === 'pending' && (
                      <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <button onClick={() => handleAccept(bid.id)} className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1 transition-all" style={{ background: 'rgba(16,185,129,0.12)', color: '#6ee7b7', fontWeight: 700 }}><Check size={14} /> Accept</button>
                        <button onClick={() => handleReject(bid.id)} className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1 transition-all" style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', fontWeight: 700 }}><X size={14} /> Reject</button>
                        <button onClick={() => { setCounterModal(bid); setCounterAmount(''); }} className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1 transition-all" style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', fontWeight: 700 }}><RefreshCw size={14} /> Counter</button>
                        {bid.conversation_id && <button onClick={() => openChat(bid.conversation_id)} className="dc-btn-ghost px-3 py-1.5 rounded-full text-xs flex items-center gap-1"><MessageCircle size={14} /> Negotiate</button>}
                      </div>
                    )}
                    {bid.status === 'accepted' && bid.conversation_id && (
                      <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <button onClick={() => openChat(bid.conversation_id)} className="dc-btn-primary px-4 py-1.5 text-xs flex items-center gap-1"><MessageCircle size={14} /> Chat with {bid.bidder?.display_name}</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={!!counterModal} onClose={() => setCounterModal(null)} title="Counter Offer">
        <div className="space-y-4">
          <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', fontFamily: 'Inter' }}>Original bid: <span style={{ color: 'var(--color-foreground)', fontWeight: 500 }}>₹{counterModal?.amount}</span></p>
          <div>
            <label className="block mb-1.5" style={{ fontSize: 12, fontFamily: 'Inter', fontWeight: 500, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '1px' }}>Your counter amount</label>
            <input type="number" value={counterAmount} onChange={(e) => setCounterAmount(e.target.value)} className="dc-input w-full px-4 py-2.5 text-sm" placeholder="Enter amount" />
          </div>
          <button onClick={handleCounter} disabled={!counterAmount} className="dc-btn-primary w-full py-2.5 text-sm">Send Counter</button>
        </div>
      </Modal>
    </div>
  );
}
