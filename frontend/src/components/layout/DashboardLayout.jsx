import AppSidebar from './AppSidebar';
import TopNavbar from './TopNavbar';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Briefcase, Gavel, User, Shield, LogOut, X } from 'lucide-react';

const ROLE_ACCENT = {
  brand: '#6366f1', influencer: '#f59e0b', editor: '#10b981', photographer: '#8b5cf6', admin: '#e879f9',
};

export default function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const mainItems = user ? [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    ...(user.role !== 'admin' ? [
      { title: user.role === 'brand' || user.role === 'influencer' ? 'My Gigs' : 'Browse Gigs', url: '/gigs', icon: Briefcase },
      { title: 'Bids', url: '/bids/manage', icon: Gavel },
      { title: 'My Profile', url: `/profile/${user.id}`, icon: User },
    ] : [
      { title: 'Admin Panel', url: '/dashboard', icon: Shield },
    ]),
  ] : [];

  const isActive = (url) => location.pathname === url;

  return (
    <div className="min-h-screen flex w-full bg-[var(--color-background)]">
      {/* Desktop sidebar */}
      <AppSidebar />

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--color-card)] border-r border-[var(--color-border)] animate-slide-in-left overflow-y-auto">
            <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--color-border)]">
              <span className="text-xl font-bold" style={{ fontFamily: 'Inter', fontWeight: 800 }}>
                <span className="text-gradient">Creator</span>
                <span className="text-[var(--color-foreground)]">Link</span>
              </span>
              <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-secondary)]">
                <X size={18} />
              </button>
            </div>
            {user && (
              <div className="px-4 py-4">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[var(--color-secondary)]">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">{user.display_name?.[0]}</div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-foreground)] truncate">{user.display_name}</p>
                    <p className="text-xs capitalize" style={{ color: ROLE_ACCENT[user.role] }}>{user.role}</p>
                  </div>
                </div>
              </div>
            )}
            <nav className="px-3 py-2 space-y-1">
              {mainItems.map((item) => (
                <Link
                  key={item.url}
                  to={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive(item.url)
                      ? 'bg-[var(--sidebar-accent-bg)] text-[var(--sidebar-accent-fg)] font-semibold'
                      : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)]'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
            <div className="px-3 py-3 border-t border-[var(--color-border)] mt-auto">
              <button
                onClick={() => { logout(); navigate('/'); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-muted-foreground)] hover:text-red-400 transition-all"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} mobileMenuOpen={mobileMenuOpen} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 animate-fade-in overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
