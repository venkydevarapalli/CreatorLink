import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { Bell, Search, MessageCircle, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useState } from 'react';

export default function TopNavbar({ onMobileMenuToggle, mobileMenuOpen }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { totalUnread, setWidgetOpen, widgetOpen } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const isAdmin = user?.role === 'admin';

  return (
    <header className="topnav sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-4 md:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMobileMenuToggle}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-[var(--color-secondary)]"
      >
        {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
        <input
          type="text"
          placeholder="Search gigs, brands, creators..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchQuery.trim()) {
              navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            }
          }}
          className="search-input w-full pl-9 pr-4 py-2 rounded-xl text-sm border-0 transition-all"
        />
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />



        {/* Chat toggle */}
        {user && !isAdmin && (
          <button
            onClick={() => setWidgetOpen(!widgetOpen)}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-[var(--color-secondary)]"
          >
            <MessageCircle size={16} className="text-[var(--color-muted-foreground)]" />
            {totalUnread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </button>
        )}

        {/* Avatar */}
        {user && (
          <Link to={`/profile/${user.id}`} className="flex items-center gap-2">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-[var(--color-primary)]/10 cursor-pointer" />
            ) : (
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold cursor-pointer">
                {user.display_name?.[0] || '?'}
              </div>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
