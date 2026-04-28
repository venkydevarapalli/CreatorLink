import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { listPlots, createPlot, requestAccess } from '../api/plots';
import Modal from '../components/common/Modal';
import { Plus, Lock, Globe, Eye, MessageCircle, Shield } from 'lucide-react';
import { timeAgo } from '../utils/helpers';

export default function StoryPlots() {
  const { user } = useAuth();
  const { openChat } = useChat();
  const navigate = useNavigate();
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ title: '', synopsis: '', full_content: '', genre: '', is_private: true });

  const loadPlots = async () => {
    try {
      const { data } = await listPlots({ limit: 50 });
      setPlots(data.plots || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadPlots(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createPlot(form);
      setCreateModal(false);
      setForm({ title: '', synopsis: '', full_content: '', genre: '', is_private: true });
      loadPlots();
      navigate(`/plots/${data.id}`);
    } catch (e) { alert(e.response?.data?.detail || 'Failed'); }
  };

  const handleRequestAccess = async (plotId) => {
    try {
      await requestAccess(plotId);
      loadPlots();
    } catch (e) { alert(e.response?.data?.detail || 'Failed'); }
  };

  return (
    <div className="pt-20 pb-10 px-4 sm:px-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Shield size={24} /> Story Plots</h1>
          <p className="text-surface-200 text-sm mt-1">StorySecure – Protected creative content</p>
        </div>
        <button onClick={() => setCreateModal(true)} className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium flex items-center gap-1.5 hover:opacity-90">
          <Plus size={16} /> New Plot
        </button>
      </div>

      {loading ? (
        <div className="text-center text-surface-200 py-12">Loading plots...</div>
      ) : plots.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-surface-200">No plots yet. Create your first story!</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plots.map((plot) => {
            const isOwner = plot.owner_id === user?.id;
            const hasAccess = plot.has_access !== false;
            return (
              <div key={plot.id} className="glass rounded-xl p-5 hover:glow hover:border-primary-500/30 transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link to={`/plots/${plot.id}`} className="text-sm font-semibold text-white hover:text-primary-400 transition-colors line-clamp-1">
                    {plot.title}
                  </Link>
                  <span className="shrink-0">
                    {plot.is_private ? <Lock size={14} className="text-amber-400" /> : <Globe size={14} className="text-green-400" />}
                  </span>
                </div>
                {plot.genre && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 mb-2 inline-block">{plot.genre}</span>}
                <p className="text-xs text-surface-200 line-clamp-2 mb-3">{plot.synopsis}</p>
                {plot.owner && (
                  <div className="flex items-center gap-2 mb-3">
                    <img src={plot.owner.avatar_url} alt="" className="w-5 h-5 rounded-full" />
                    <span className="text-xs text-surface-200">{plot.owner.display_name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-surface-200 mb-3">
                  <span className="flex items-center gap-1"><Eye size={12} />{plot.view_count} views</span>
                  <span>{timeAgo(plot.created_at)}</span>
                </div>
                <div className="flex gap-2">
                  {!isOwner && !hasAccess && !plot.access_requested && (
                    <button onClick={() => handleRequestAccess(plot.id)} className="flex-1 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/30 transition-colors">
                      Request Access
                    </button>
                  )}
                  {!isOwner && !hasAccess && plot.access_requested && (
                    <span className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 text-surface-200 text-xs text-center">Access Requested</span>
                  )}
                  {plot.conversation_id && hasAccess && (
                    <button onClick={() => openChat(plot.conversation_id)} className="px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-medium hover:bg-primary-500/30 flex items-center gap-1">
                      <MessageCircle size={12} /> Discuss
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create New Plot" maxWidth="max-w-xl">
        <form onSubmit={handleCreate} className="space-y-3">
          <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary-500/50" placeholder="Plot title" />
          <input type="text" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary-500/50" placeholder="Genre (e.g., Sci-Fi, Drama)" />
          <textarea rows={2} required value={form.synopsis} onChange={(e) => setForm({ ...form, synopsis: e.target.value })} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white resize-none focus:ring-2 focus:ring-primary-500/50" placeholder="Synopsis (public preview)" />
          <textarea rows={5} required value={form.full_content} onChange={(e) => setForm({ ...form, full_content: e.target.value })} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white resize-none focus:ring-2 focus:ring-primary-500/50" placeholder="Full content (protected)" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_private} onChange={(e) => setForm({ ...form, is_private: e.target.checked })} className="w-4 h-4 rounded bg-surface-800 border-white/20 text-primary-500 focus:ring-primary-500/50" />
            <span className="text-sm text-surface-200">🔒 Private – require access requests</span>
          </label>
          <button type="submit" className="w-full py-2.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90">Create Plot</button>
        </form>
      </Modal>
    </div>
  );
}

