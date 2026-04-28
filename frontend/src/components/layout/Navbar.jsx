import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { MessageCircle, LogOut, User, Menu, X, Briefcase, LayoutDashboard, Gavel } from 'lucide-react';
import { useState } from 'react';

const roleMenus = {
  brand: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/gigs', label: 'My Gigs', icon: Briefcase },
    { to: '/bids/manage', label: 'Recent Bids', icon: Gavel },
  ],
  influencer: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/gigs', label: 'My Gigs', icon: Briefcase },
    { to: '/bids/manage', label: 'My Bids', icon: Gavel },
  ],
  editor: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/gigs', label: 'Browse Gigs', icon: Briefcase },
    { to: '/bids/manage', label: 'My Bids', icon: Gavel },
  ],
  photographer: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/gigs', label: 'Browse Gigs', icon: Briefcase },
    { to: '/bids/manage', label: 'My Bids', icon: Gavel },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/gigs', label: 'System Gigs', icon: Briefcase },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalUnread, setWidgetOpen, widgetOpen } = useChat();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menus = user ? (roleMenus[user.role] || []) : [];
  const isAdmin = user?.role === 'admin';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ height: 60, background: 'rgba(9,9,11,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 group">
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: '#fff' }}>Creator</span>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: '#6366f1' }}>Link</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {!user && (
              <>
                <Link to="/" className="px-3 py-1.5 rounded-lg text-sm transition-all" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans' }}>Home</Link>
                <Link to="/login" className="dc-btn-primary px-5 py-2 text-sm">Sign In</Link>
              </>
            )}
            {user && menus.map((m) => (
              <Link key={m.to} to={m.to} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-all hover:bg-white/[0.06]" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans' }}>
                <m.icon size={15} />
                {m.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user && (
              <>
                {/* Chat toggle – hidden for admin */}
                {!isAdmin && (
                  <button
                    id="chat-widget-toggle"
                    onClick={() => setWidgetOpen(!widgetOpen)}
                    className="relative flex items-center justify-center transition-all" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)' }}
                  >
                    <MessageCircle size={18} style={{ color: 'rgba(255,255,255,0.5)' }} />
                    {totalUnread > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center" style={{ width: 18, height: 18, borderRadius: 9, background: '#ef4444', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                        {totalUnread > 9 ? '9+' : totalUnread}
                      </span>
                    )}
                  </button>
                )}

                {/* User pill */}
                <Link to={`/profile/${user.id}`} className="flex items-center gap-2 px-2.5 py-1 transition-all" style={{ borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                      {user.display_name?.[0] || '?'}
                    </div>
                  )}
                  <span className="text-xs hidden lg:block" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'DM Sans' }}>{user.display_name}</span>
                </Link>

                <button onClick={() => { logout(); navigate('/'); }} className="dc-btn-ghost p-2 rounded-lg" title="Logout">
                  <LogOut size={16} />
                </button>
              </>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden dc-btn-ghost p-2 rounded-lg">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden animate-fade-in" style={{ background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-4 py-3 space-y-1">
            {!user && (
              <>
                <Link to="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>Home</Link>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg dc-btn-primary text-center">Sign In</Link>
              </>
            )}
            {user && menus.map((m) => (
              <Link key={m.to} to={m.to} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white/[0.06]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <m.icon size={16} />
                {m.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
