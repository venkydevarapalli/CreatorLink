import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../api/auth';
import { ROLES } from '../utils/constants';
import { UserPlus, Mail, Lock, User, ChevronRight, ChevronLeft } from 'lucide-react';

export default function Signup() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', password: '', display_name: '', role: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1 && !form.role) { setError('Please select a role'); return; }
    if (step === 1) { setStep(2); setError(''); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await registerApi(form);
      loginUser({ access_token: data.access_token, refresh_token: data.refresh_token }, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative bg-[var(--color-background)]">
      <div className="dc-blob" style={{ width: 400, height: 400, bottom: -100, left: -80, background: 'rgba(139,92,246,0.10)' }} />
      <div className="dc-blob" style={{ width: 350, height: 350, top: -80, right: -80, background: 'rgba(99,102,241,0.10)' }} />

      <div className="relative w-full max-w-lg animate-fade-in z-10">
        <div className="dc-card p-8" style={{ borderRadius: 28 }}>
          <div className="text-center mb-6">
            <div className="mb-4">
              <span className="text-3xl font-extrabold text-gradient">Creator</span>
              <span className="text-3xl font-extrabold text-[var(--color-foreground)]">Link</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-foreground)] tracking-tight">Create Account</h1>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1">Step {step} of 2 — {step === 1 ? 'Choose your role' : 'Your details'}</p>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-6">
            <div className={`h-1 rounded-full flex-1 ${step >= 1 ? 'gradient-primary' : 'bg-[var(--color-border)]'}`} />
            <div className={`h-1 rounded-full flex-1 ${step >= 2 ? 'gradient-primary' : 'bg-[var(--color-border)]'}`} />
          </div>

          {error && <div className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-500/10 border border-red-500/20 text-red-400">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {ROLES.filter((r) => ['brand', 'influencer', 'editor', 'photographer'].includes(r.value)).map((role) => (
                  <button
                    key={role.value} type="button"
                    onClick={() => setForm({ ...form, role: role.value })}
                    className={`p-4 rounded-2xl text-center transition-all border ${
                      form.role === role.value
                        ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)]/35 shadow-glow'
                        : 'bg-[var(--color-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]/20'
                    }`}
                  >
                    <div className="text-3xl mb-2">{role.icon}</div>
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">{role.label}</p>
                    <p className="text-[11px] text-[var(--color-muted-foreground)] mt-1">{role.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block mb-1.5 text-[10px] uppercase tracking-widest font-semibold text-[var(--color-muted-foreground)]">Display Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                    <input id="signup-name" type="text" required value={form.display_name}
                      onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                      className="dc-input w-full pl-10 pr-4 py-2.5 text-sm" placeholder="Your display name" />
                  </div>
                </div>
                <div>
                  <label className="block mb-1.5 text-[10px] uppercase tracking-widest font-semibold text-[var(--color-muted-foreground)]">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                    <input id="signup-email" type="email" required value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="dc-input w-full pl-10 pr-4 py-2.5 text-sm" placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block mb-1.5 text-[10px] uppercase tracking-widest font-semibold text-[var(--color-muted-foreground)]">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
                    <input id="signup-password" type="password" required minLength={6} value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="dc-input w-full pl-10 pr-4 py-2.5 text-sm" placeholder="Min 6 characters" />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="dc-btn-secondary flex-1 py-2.5 text-sm flex items-center justify-center gap-1">
                  <ChevronLeft size={16} /> Back
                </button>
              )}
              <button id="signup-submit" type="submit" disabled={loading} className="dc-btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-1">
                {step === 1 ? <>Next <ChevronRight size={16} /></> : loading ? 'Creating…' : <><UserPlus size={16} /> Create Account</>}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
            Already have an account? <Link to="/login" className="text-[var(--color-primary)] font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
