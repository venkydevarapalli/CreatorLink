import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Paperclip, CheckSquare, Star, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { getMessages, getConversation, markAsRead, deleteConversation } from '../../api/conversations';
import { uploadFile } from '../../api/upload';
import { getGig, requestReview, completeProject } from '../../api/gigs';
import { createReview } from '../../api/reviews';
import { timeAgo } from '../../utils/helpers';
import Modal from '../common/Modal';

export default function ChatDrawer() {
  const { user } = useAuth();
  const {
    activeConversation, drawerOpen, closeChat,
    sendWsMessage, sendTyping, sendStopTyping,
    typingUsers, newMessages, setNewMessages, connectToConversation, loadConversations, markAsReadLocal
  } = useChat();

  const [messages, setMessages] = useState([]);
  const [convInfo, setConvInfo] = useState(null);
  const [gigInfo, setGigInfo] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    if (!activeConversation || !drawerOpen) return;
    setLoading(true);
    Promise.all([getConversation(activeConversation), getMessages(activeConversation)]).then(([convRes, msgRes]) => {
      const conv = convRes.data;
      setConvInfo(conv);
      setMessages(msgRes.data.messages || []);
      markAsRead(activeConversation).catch(() => {});
      markAsReadLocal(activeConversation);
      connectToConversation(activeConversation);
      if (conv.project_type === 'gig' && conv.project_id) { getGig(conv.project_id).then(res => setGigInfo(res.data)).catch(console.error); } else { setGigInfo(null); }
    }).catch(console.error).finally(() => setLoading(false));
  }, [activeConversation, drawerOpen, connectToConversation, markAsReadLocal]);

  useEffect(() => {
    if (!activeConversation || !newMessages[activeConversation]) return;
    const wsMessages = newMessages[activeConversation];
    if (wsMessages.length > 0) {
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const existingClientIds = new Set(prev.map((m) => m.client_id).filter(Boolean));
        let updated = [...prev];
        wsMessages.filter(m => !existingIds.has(m.id) && !(m.client_id && existingClientIds.has(m.client_id))).forEach(msg => {
          if (msg.client_id) { const idx = updated.findIndex(m => m.id === msg.client_id); if (idx !== -1) { updated[idx] = { ...msg }; return; } }
          updated.push(msg);
        });
        return updated;
      });
      setNewMessages((prev) => ({ ...prev, [activeConversation]: [] }));
      markAsRead(activeConversation).catch(() => {});
      markAsReadLocal(activeConversation);
    }
  }, [activeConversation, newMessages, setNewMessages]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const otherUser = convInfo?.participants_info?.find((p) => p.id !== user?.id);
  const chatName = convInfo?.is_group ? convInfo.group_name : otherUser?.display_name || 'Chat';

  const handleSend = () => {
    if (!text.trim()) return;
    const clientId = `client-${Date.now()}`;
    sendWsMessage(activeConversation, text.trim(), clientId);
    setMessages((prev) => [...prev, { id: clientId, client_id: clientId, sender_id: user.id, sender: { id: user.id, display_name: user.display_name, avatar_url: user.avatar_url }, content: text.trim(), message_type: 'text', created_at: new Date().toISOString() }]);
    setText(''); sendStopTyping(activeConversation);
  };

  const handleTyping = () => { sendTyping(activeConversation); clearTimeout(typingTimer.current); typingTimer.current = setTimeout(() => sendStopTyping(activeConversation), 2000); };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try { const { data } = await uploadFile(file); const type = file.type.startsWith('image/') ? 'image' : 'file'; sendWsMessage(activeConversation, file.name, data.url, type);
      setMessages((prev) => [...prev, { id: `temp-${Date.now()}`, sender_id: user.id, sender: { id: user.id, display_name: user.display_name }, content: file.name, file_url: data.url, message_type: type, created_at: new Date().toISOString() }]);
    } catch (err) { console.error('Upload failed', err); }
  };

  const handleMarkComplete = async () => {
    if (!confirm('Mark this project as complete?')) return;
    try { await requestReview(gigInfo.id); sendWsMessage(activeConversation, "🏁 I have completed the work and requested a final review.", null, "text"); setGigInfo({ ...gigInfo, is_review_ready: true }); alert("Project marked as complete."); } catch (err) { alert("Failed to update project status."); }
  };

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    try { 
      await completeProject(gigInfo.id); 
      await createReview({ gig_id: gigInfo.id, reviewee_id: otherUser.id, rating, feedback }); 
      alert("Project completed!"); 
      closeChat(); 
    } catch (err) { 
      alert(err.response?.data?.detail || "Failed"); 
    } finally { 
      setSubmittingReview(false); 
      setReviewModal(false); 
    }
  };

  const handleDeleteChat = async () => {
    if (!confirm('Are you sure you want to permanently delete this chat?')) return;
    try {
      await deleteConversation(activeConversation);
      alert('Chat deleted');
      loadConversations();
      closeChat();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete chat');
    }
  };

  if (!drawerOpen) return null;
  const isFreelancer = gigInfo && String(gigInfo.accepted_user) === user?.id;
  const isClient = gigInfo && String(gigInfo.posted_by) === user?.id;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[360px] z-[60] flex flex-col animate-slide-right" style={{ top: 60 }}>
      <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--color-card)', borderLeft: '1px solid rgba(255,255,255,0.08)', boxShadow: '-8px 0 40px rgba(0,0,0,0.40)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(9,9,11,0.9)' }}>
          <div className="flex items-center gap-3">
            {otherUser?.avatar_url ? <img src={otherUser.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">{chatName?.[0] || '?'}</div>}
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-foreground)' }}>{chatName}</h3>
              {convInfo?.project_type && <span style={{ fontSize: 11, color: '#a5b4fc', fontFamily: 'Inter', textTransform: 'capitalize' }}>{convInfo.project_type.replace('_', ' ')}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isFreelancer && gigInfo.status === 'in_progress' && !gigInfo.is_review_ready && (
              <button onClick={handleMarkComplete} className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1" style={{ background: 'rgba(16,185,129,0.12)', color: '#6ee7b7', fontWeight: 700 }}><CheckSquare size={13} /> Finish</button>
            )}
            {isClient && gigInfo?.is_review_ready && gigInfo.status === 'in_progress' && (
              <button onClick={() => setReviewModal(true)} className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1" style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', fontWeight: 700 }}><Star size={13} /> Review</button>
            )}
            <button onClick={handleDeleteChat} className="dc-btn-ghost p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"><Trash2 size={16} /></button>
            <button onClick={closeChat} className="dc-btn-ghost p-1.5 rounded-lg"><X size={16} /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading && <div className="text-center py-12 flex flex-col items-center gap-3"><div className="dc-spinner"></div><span style={{ color: 'var(--color-muted-foreground)', fontFamily: 'Inter', fontSize: 13 }}>Loading…</span></div>}
          {!loading && messages.length === 0 && (
            <div className="text-center py-16">
              <p style={{ fontSize: 32, opacity: 0.5 }}>💬</p>
              <p style={{ color: 'var(--color-muted-foreground)', fontFamily: 'Inter', fontSize: 14, marginTop: 8 }}>No messages yet. Say hello!</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMine = msg.sender_id === user?.id || msg.sender?.id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%] px-3.5 py-2.5 transition-transform hover:translate-y-[-1px]" style={isMine
                  ? { background: 'linear-gradient(135deg, rgba(99,102,241,0.40), rgba(139,92,246,0.30))', border: '1px solid rgba(99,102,241,0.30)', borderRadius: '16px 16px 4px 16px' }
                  : { background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', borderRadius: '16px 16px 16px 4px' }
                }>
                  {!isMine && convInfo?.is_group && <p style={{ fontSize: 10, fontFamily: 'Inter', fontWeight: 500, color: '#a5b4fc', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{msg.sender?.display_name || msg.sender_name}</p>}
                  {msg.message_type === 'image' && msg.file_url && <img src={msg.file_url} alt="" className="rounded-lg max-h-56 object-cover mb-2" />}
                  {msg.message_type === 'file' && msg.file_url && <a href={msg.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm mb-1 p-2 rounded-lg" style={{ color: '#a5b4fc', background: 'rgba(255,255,255,0.05)' }}><Paperclip size={14} /> {msg.content}</a>}
                  {(msg.message_type === 'text' || !msg.file_url) && <p style={{ fontSize: 13.5, lineHeight: 1.5, color: isMine ? '#fafafa' : 'rgba(255,255,255,0.85)', fontFamily: 'Inter', whiteSpace: 'pre-wrap' }}>{msg.content}</p>}
                  <p style={{ fontSize: 9, marginTop: 4, color: isMine ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.25)', fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{timeAgo(msg.created_at)}</p>
                </div>
              </div>
            );
          })}
          {typingUsers[activeConversation] && (
            <div className="flex items-center gap-2 py-1" style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'Inter' }}>
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'rgba(255,255,255,0.35)' }}></span>
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'rgba(255,255,255,0.35)', animationDelay: '0.1s' }}></span>
                <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'rgba(255,255,255,0.35)', animationDelay: '0.2s' }}></span>
              </span>
              <span style={{ fontStyle: 'italic' }}>{typingUsers[activeConversation]} is typing…</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(9,9,11,0.9)' }}>
          <div className="flex items-end gap-2">
            <label className="dc-btn-ghost p-2 rounded-lg cursor-pointer"><Paperclip size={18} /><input type="file" className="hidden" onChange={handleFileUpload} /></label>
            <div className="flex-1">
              <textarea value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } else handleTyping(); }}
                placeholder="Write a message…" rows={1}
                className="dc-input w-full px-4 py-2.5 text-sm resize-none" />
            </div>
            <button onClick={handleSend} disabled={!text.trim()}
              className="p-2 rounded-lg text-white transition-all"
              style={text.trim() ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' } : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Accept & Review" maxWidth="max-w-md">
        <div className="space-y-5 py-2">
          <div className="text-center">
            <p style={{ color: 'var(--color-muted-foreground)', fontFamily: 'Inter', fontSize: 13, fontStyle: 'italic', marginBottom: 16 }}>"Once submitted, the project will be finalized."</p>
            <div className="flex justify-center gap-2 mb-2">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)} className="p-1 transition-transform hover:scale-125" style={{ color: s <= rating ? '#fcd34d' : 'rgba(255,255,255,0.15)' }}>
                  <Star size={28} fill={s <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: '#fcd34d', fontFamily: 'Inter', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>{rating === 5 ? 'Exceptional' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : 'Needs Improvement'}</p>
          </div>
          <div>
            <label className="block mb-1.5" style={{ fontSize: 12, fontFamily: 'Inter', fontWeight: 500, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '1px' }}>Feedback</label>
            <textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} className="dc-input w-full px-4 py-3 text-sm resize-none" placeholder="Your feedback…" />
          </div>
          <button onClick={handleSubmitReview} disabled={submittingReview || !feedback.trim()} className="dc-btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
            {submittingReview ? 'Processing…' : <><CheckSquare size={16} /> Accept & Finalize</>}
          </button>
        </div>
      </Modal>
    </div>
  );
}
