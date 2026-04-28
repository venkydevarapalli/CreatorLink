import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { listConversations } from '../api/conversations';
import { useAuth } from './AuthContext';
import { WS_URL } from '../utils/constants';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [newMessages, setNewMessages] = useState({});
  const wsRefs = useRef({});
  const typingTimeouts = useRef({});

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await listConversations();
      setConversations(data.conversations || []);
    } catch (e) { console.error('Failed to load conversations', e); }
  }, [user]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Total unread
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  // Connect to a conversation's WebSocket
  const connectToConversation = useCallback((conversationId) => {
    if (wsRefs.current[conversationId]) return wsRefs.current[conversationId];
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    const ws = new WebSocket(`${WS_URL}/ws/chat/${conversationId}?token=${token}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'new_message') {
        setNewMessages((prev) => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), data.message],
        }));
        // Update conversations list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, last_message: data.message.content, last_message_at: data.message.created_at }
              : c
          )
        );
      } else if (data.type === 'typing') {
        setTypingUsers((prev) => ({ ...prev, [conversationId]: data.display_name }));
        clearTimeout(typingTimeouts.current[conversationId]);
        typingTimeouts.current[conversationId] = setTimeout(() => {
          setTypingUsers((prev) => { const n = { ...prev }; delete n[conversationId]; return n; });
        }, 3000);
      } else if (data.type === 'stop_typing') {
        setTypingUsers((prev) => { const n = { ...prev }; delete n[conversationId]; return n; });
      }
    };

    ws.onclose = () => { delete wsRefs.current[conversationId]; };
    wsRefs.current[conversationId] = ws;
    return ws;
  }, []);

  // Send a message via WebSocket
  const sendWsMessage = useCallback((conversationId, content, clientId = null, fileUrl = null, messageType = 'text') => {
    const ws = wsRefs.current[conversationId];
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'message', content, client_id: clientId, file_url: fileUrl, message_type: messageType }));
    }
  }, []);

  // Typing indicator
  const sendTyping = useCallback((conversationId) => {
    const ws = wsRefs.current[conversationId];
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'typing' }));
    }
  }, []);

  const sendStopTyping = useCallback((conversationId) => {
    const ws = wsRefs.current[conversationId];
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'stop_typing' }));
    }
  }, []);

  // Open chat drawer for a specific conversation
  const openChat = useCallback((conversationId) => {
    setActiveConversation(conversationId);
    setDrawerOpen(true);
    setWidgetOpen(false);
    connectToConversation(conversationId);
  }, [connectToConversation]);

  const closeChat = useCallback(() => {
    setDrawerOpen(false);
    setActiveConversation(null);
  }, []);

  // Cleanup WebSockets on unmount
  useEffect(() => {
    return () => {
      Object.values(wsRefs.current).forEach((ws) => ws.close());
    };
  }, []);

  const markAsReadLocal = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
    );
  }, []);

  return (
    <ChatContext.Provider
      value={{
        conversations, loadConversations, totalUnread,
        activeConversation, setActiveConversation,
        drawerOpen, setDrawerOpen, openChat, closeChat,
        widgetOpen, setWidgetOpen,
        typingUsers, newMessages, setNewMessages,
        connectToConversation, sendWsMessage, sendTyping, sendStopTyping,
        markAsReadLocal,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
export default ChatContext;
