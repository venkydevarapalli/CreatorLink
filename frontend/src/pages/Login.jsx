import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api/auth';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await loginApi(form);
      loginUser({ access_token: data.access_token, refresh_token: data.refresh_token }, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative bg-[var(--color-background)]">
      {/* Blob */}
      <div className="dc-blob" style={{ width: 500, height: 500, top: -150, right: -100, background: 'rgba(99,102,241,0.12)' }} />
      <div className="dc-blob" style={{ width: 400, height: 400, bottom: -100, left: -100, background: 'rgba(139,92,246,0.08)' }} />

      <div className="relative w-full max-w-md animate-fade-in z-10">
        <div className="dc-card p-8" style={{ borderRadius: 28 }}>
          <div className="text-center mb-8">
            <div className="mb-4">
              <span className="text-3xl font-extrabold text-gradient">Creator</span>
              <span className="text-3xl font-extrabold text-[var(--color-foreground)]">Link</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-foreground)] tracking-tight">Welcome Back</h1>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">Sign in to your account</p>
          </div>

          {error && <div className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-500/10 border border-red-500/20 text-red-400">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1.5 text-[10px] uppercase tracking-widest font-semibold text-[var(--color-muted-foreground)]">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                <input
                  id="login-email" type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="dc-input w-full pl-10 pr-4 py-2.5 text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-[10px] uppercase tracking-widest font-semibold text-[var(--color-muted-foreground)]">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                <input
                  id="login-password" type={showPw ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="dc-input w-full pl-10 pr-10 py-2.5 text-sm"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 dc-btn-ghost p-0">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button id="login-submit" type="submit" disabled={loading} className="dc-btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2">
              {loading ? <><span className="dc-spinner" style={{width:16,height:16,borderWidth:2}} /> Signing in…</> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
            Don't have an account? <Link to="/signup" className="text-[var(--color-primary)] font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
