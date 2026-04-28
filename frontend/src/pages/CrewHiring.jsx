import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { listCrewPosts, createCrewPost, applyToCrew, hireApplicant } from '../api/crew';
import Modal from '../components/common/Modal';
import { Plus, Users, Check, MessageCircle, Film } from 'lucide-react';
import { timeAgo } from '../utils/helpers';

export default function CrewHiring() {
  const { user } = useAuth();
  const { openChat } = useChat();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [applyModal, setApplyModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [form, setForm] = useState({ title: '', production_name: '', description: '', roles_needed: [{ title: '', description: '' }] });
  const [applyForm, setApplyForm] = useState({ role_title: '', message: '' });

  const load = async () => {
    try {
      const { data } = await listCrewPosts({ limit: 50 });
      setPosts(data.crew_posts || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCrewPost({ ...form, roles_needed: form.roles_needed.filter((r) => r.title) });
      setCreateModal(false);
      setForm({ title: '', production_name: '', description: '', roles_needed: [{ title: '', description: '' }] });
      load();
    } catch (e) { alert(e.response?.data?.detail || 'Failed'); }
  };

  const handleApply = async () => {
    if (!applyModal) return;
    try {
      await applyToCrew(applyModal.id, applyForm);
      setApplyModal(null);
      load();
    } catch (e) { alert(e.response?.data?.detail || 'Failed'); }
  };

  const handleHire = async (postId, userId) => {
    if (!confirm('Hire this applicant?')) return;
    try {
      await hireApplicant(postId, userId);
      load();
    } catch (e) { alert(e.response?.data?.detail || 'Failed'); }
  };

  return (
    <div className="pt-20 pb-10 px-4 sm:px-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Film size={24} /> Crew Hiring</h1>
          <p className="text-surface-200 text-sm mt-1">Build your production team</p>
        </div>
        <button onClick={() => setCreateModal(true)} className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium flex items-center gap-1.5 hover:opacity-90">
          <Plus size={16} /> Post Crew Call
        </button>
      </div>

      {loading ? (
        <div className="text-center text-surface-200 py-12">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-surface-200">No crew posts yet</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => {
            const isOwner = String(post.posted_by) === user?.id;
            const alreadyApplied = post.applicants?.some((a) => String(a.user_id) === user?.id);
            return (
              <div key={post.id} className="glass rounded-xl p-5 hover:glow hover:border-primary-500/30 transition-all">
                <h3 className="text-sm font-semibold text-white mb-1">{post.title}</h3>
                <p className="text-xs text-primary-400 mb-2">{post.production_name}</p>
                <p className="text-xs text-surface-200 line-clamp-2 mb-3">{post.description}</p>
                {post.poster && (
                  <div className="flex items-center gap-2 mb-3">
                    <img src={post.poster.avatar_url} alt="" className="w-5 h-5 rounded-full" />
                    <span className="text-xs text-surface-200">{post.poster.display_name}</span>
                  </div>
                )}
                {/* Roles */}
                <div className="space-y-1 mb-3">
                  {post.roles_needed?.map((role, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={`w-2 h-2 rounded-full ${role.filled ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                      <span className={role.filled ? 'text-surface-200 line-through' : 'text-white'}>{role.title}</span>
                      {role.filled && <span className="text-green-400 text-[10px]">Filled</span>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  {!isOwner && !alreadyApplied && (
                    <button onClick={() => { setApplyModal(post); setApplyForm({ role_title: post.roles_needed?.find((r) => !r.filled)?.title || '', message: '' }); }}
                      className="flex-1 px-3 py-1.5 rounded-lg gradient-primary text-white text-xs font-medium hover:opacity-90 flex items-center justify-center gap-1">
                      Apply
                    </button>
                  )}
                  {isOwner && (
                    <button onClick={() => setDetailModal(post)} className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 text-surface-200 text-xs font-medium hover:bg-white/10 flex items-center justify-center gap-1">
                      <Users size={12} /> View Applicants ({post.applicants?.length || 0})
                    </button>
                  )}
                  {post.conversation_id && (
                    <button onClick={() => openChat(post.conversation_id)} className="px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-medium hover:bg-primary-500/30 flex items-center gap-1">
                      <MessageCircle size={12} /> Team Chat
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      <Modal isOpen={!!applyModal} onClose={() => setApplyModal(null)} title={`Apply to: ${applyModal?.title}`}>
        <div className="space-y-3">
          <select value={applyForm.role_title} onChange={(e) => setApplyForm({ ...applyForm, role_title: e.target.value })} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary-500/50">
            <option value="">Select a role</option>
            {applyModal?.roles_needed?.filter((r) => !r.filled).map((r, i) => (
              <option key={i} value={r.title}>{r.title}</option>
            ))}
          </select>
          <textarea rows={3} value={applyForm.message} onChange={(e) => setApplyForm({ ...applyForm, message: e.target.value })} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white resize-none focus:ring-2 focus:ring-primary-500/50" placeholder="Why are you a great fit?" />
          <button onClick={handleApply} disabled={!applyForm.role_title} className="w-full py-2.5 rounded-xl gradient-primary text-white font-semibold disabled:opacity-50 hover:opacity-90">Submit Application</button>
        </div>
      </Modal>

      {/* Detail / Applicants Modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={`Applicants: ${detailModal?.title}`} maxWidth="max-w-xl">
        <div className="space-y-3">
          {detailModal?.applicants?.length === 0 && <p className="text-surface-200 text-sm">No applicants yet</p>}
          {detailModal?.applicants?.map((app, i) => (
            <div key={i} className="glass rounded-xl p-3 flex items-center gap-3">
              {app.user?.avatar_url && <img src={app.user.avatar_url} alt="" className="w-9 h-9 rounded-full shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{app.user?.display_name || 'User'}</p>
                <p className="text-xs text-primary-400">{app.role_title}</p>
                {app.message && <p className="text-xs text-surface-200 mt-0.5">{app.message}</p>}
              </div>
              {app.status === 'pending' && (
                <button onClick={() => handleHire(detailModal.id, app.user?.id || String(app.user_id))} className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30 flex items-center gap-1">
                  <Check size={14} /> Hire
                </button>
              )}
              {app.status === 'hired' && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Hired</span>}
            </div>
          ))}
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Post Crew Call" maxWidth="max-w-xl">
        <form onSubmit={handleCreate} className="space-y-3">
          <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary-500/50" placeholder="Post title" />
          <input type="text" required value={form.production_name} onChange={(e) => setForm({ ...form, production_name: e.target.value })} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary-500/50" placeholder="Production name" />
          <textarea rows={3} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white resize-none focus:ring-2 focus:ring-primary-500/50" placeholder="Description" />
          <div>
            <label className="text-sm text-surface-200 mb-1 block">Roles Needed</label>
            {form.roles_needed.map((role, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={role.title} onChange={(e) => { const r = [...form.roles_needed]; r[i].title = e.target.value; setForm({ ...form, roles_needed: r }); }} className="flex-1 bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary-500/50" placeholder="Role title" />
                <input type="text" value={role.description} onChange={(e) => { const r = [...form.roles_needed]; r[i].description = e.target.value; setForm({ ...form, roles_needed: r }); }} className="flex-1 bg-surface-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary-500/50" placeholder="Description" />
              </div>
            ))}
            <button type="button" onClick={() => setForm({ ...form, roles_needed: [...form.roles_needed, { title: '', description: '' }] })} className="text-xs text-primary-400 hover:text-primary-300">+ Add role</button>
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90">Post Crew Call</button>
        </form>
      </Modal>
    </div>
  );
}

