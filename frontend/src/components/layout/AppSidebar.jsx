import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Briefcase, Gavel, User, Shield, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';
import { useState } from 'react';

const ROLE_ACCENT = {
  brand: '#6366f1', influencer: '#f59e0b', editor: '#10b981', photographer: '#8b5cf6', admin: '#e879f9',
};

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const mainItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    ...(user.role !== 'admin' ? [
      { title: user.role === 'brand' || user.role === 'influencer' ? 'My Gigs' : 'Browse Gigs', url: '/gigs', icon: Briefcase },
      { title: 'Bids', url: '/bids/manage', icon: Gavel },
    ] : []),
    ...(user.role !== 'admin' ? [
      { title: 'My Profile', url: `/profile/${user.id}`, icon: User },
    ] : []),
  ];

  const adminItems = user.role === 'admin' ? [
    { title: 'Admin Panel', url: '/dashboard', icon: Shield },
  ] : [];

  const accent = ROLE_ACCENT[user.role] || '#6366f1';

  const isActive = (url) => location.pathname === url || (url !== '/dashboard' && location.pathname.startsWith(url));

  return (
    <aside
      className="sidebar-root hidden md:flex flex-col shrink-0 border-r transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? 72 : 240 }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--color-border)]">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-1">
            <span className="text-xl font-bold" style={{ fontFamily: 'Inter', fontWeight: 800 }}>
              <span className="text-gradient">Creator</span>
              <span className="text-[var(--color-foreground)]">Link</span>
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-[var(--color-secondary)]"
        >
          {collapsed ? <ChevronRight size={16} className="text-[var(--color-muted-foreground)]" /> : <ChevronLeft size={16} className="text-[var(--color-muted-foreground)]" />}
        </button>
      </div>

      {/* User card */}
      <div className="px-3 pt-4 pb-2">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'var(--color-secondary)' }}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover ring-2" style={{ ringColor: accent }} />
            ) : (
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">{user.display_name?.[0]}</div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--color-foreground)] truncate">{user.display_name}</p>
              <p className="text-xs capitalize" style={{ color: accent }}>{user.role}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">{user.display_name?.[0]}</div>
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest font-semibold text-[var(--color-muted-foreground)]">Menu</p>
        )}
        {mainItems.map((item) => (
          <Link
            key={item.url}
            to={item.url}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              isActive(item.url)
                ? 'bg-[var(--sidebar-accent-bg)] text-[var(--sidebar-accent-fg)] font-semibold'
                : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-foreground)]'
            }`}
            title={collapsed ? item.title : undefined}
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </Link>
        ))}

        {adminItems.length > 0 && (
          <>
            {!collapsed && (
              <p className="px-3 pt-4 pb-1 text-[10px] uppercase tracking-widest font-semibold text-[var(--color-muted-foreground)]">Admin</p>
            )}
            {adminItems.map((item) => (
              <Link
                key={item.url}
                to={item.url}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive(item.url)
                    ? 'bg-[var(--sidebar-accent-bg)] text-[var(--sidebar-accent-fg)] font-semibold'
                    : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-foreground)]'
                }`}
                title={collapsed ? item.title : undefined}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-[var(--color-border)]">
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-muted-foreground)] hover:bg-[var(--color-destructive)]/10 hover:text-[var(--color-destructive)] transition-all"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
