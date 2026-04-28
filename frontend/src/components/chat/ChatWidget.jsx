import { MessageCircle, X, Trash2 } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { deleteConversation } from '../../api/conversations';
import { timeAgo } from '../../utils/helpers';

export default function ChatWidget() {
  const { user } = useAuth();
  const { conversations, totalUnread, widgetOpen, setWidgetOpen, openChat, loadConversations } = useChat();

  if (!user || user.role === 'admin') return null;

  return (
    <>
      {/* Floating button */}
      <button
        id="chat-widget-fab"
        onClick={() => setWidgetOpen(!widgetOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center text-white transition-transform hover:scale-110"
        style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 32px rgba(99,102,241,0.45)' }}
      >
        {widgetOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {totalUnread > 0 && !widgetOpen && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center" style={{ width: 20, height: 20, borderRadius: 10, background: '#ef4444', fontSize: 10, fontWeight: 700, color: 'var(--color-foreground)' }}>
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {/* Conversations popover */}
      {widgetOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 max-h-[70vh] overflow-hidden animate-slide-up" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.60)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-foreground)' }}>Messages</h3>
          </div>
          <div className="overflow-y-auto max-h-[55vh]">
            {conversations.length === 0 && (
              <div className="px-5 py-12 text-center">
                <p style={{ fontSize: 32, opacity: 0.5 }}>💬</p>
                <p style={{ color: 'var(--color-muted-foreground)', fontFamily: 'Inter', fontSize: 14, marginTop: 8 }}>No conversations yet</p>
              </div>
            )}
            {conversations.map((conv) => {
              const other = conv.participants_info?.find((p) => p.id !== user.id);
              const name = conv.is_group ? conv.group_name : other?.display_name || 'Unknown';
              const avatar = conv.is_group ? null : other?.avatar_url;
              return (
                <button key={conv.id} onClick={() => openChat(conv.id)} className="w-full flex items-center gap-3 px-5 py-3 text-left transition-all hover:bg-white/[0.04]" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {avatar ? (
                    <img src={avatar} alt="" className="w-10 h-10 rounded-full shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">{name?.[0] || '?'}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="truncate" style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-foreground)', fontFamily: 'Inter' }}>{name}</span>
                      <span style={{ fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'Inter' }}>{timeAgo(conv.last_message_at)}</span>
                    </div>
                    <p className="truncate mt-0.5" style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'Inter' }}>{conv.last_message || 'No messages'}</p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="shrink-0 flex items-center justify-center" style={{ width: 20, height: 20, borderRadius: 10, background: '#6366f1', fontSize: 10, fontWeight: 700, color: 'var(--color-foreground)' }}>{conv.unread_count}</span>
                  )}
                  <div className="shrink-0 pl-1 flex items-center">
                    <button onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Permanently delete this chat?')) {
                        deleteConversation(conv.id).then(() => {
                          loadConversations();
                        }).catch(err => alert('Failed to delete chat'));
                      }
                    }} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Chat">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
