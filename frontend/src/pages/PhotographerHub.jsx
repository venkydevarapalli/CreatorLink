import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { listPackages, createPackage } from '../api/photography';
import Modal from '../components/common/Modal';
import { Plus, Camera, DollarSign, Clock, Star } from 'lucide-react';

export default function PhotographerHub() {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'other', duration: '', deliverables: '' });
  const [filter, setFilter] = useState('');

  const load = async () => {
    try {
      const params = { limit: 50 };
      if (filter) params.category = filter;
      const { data } = await listPackages(params);
      setPackages(data.packages || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createPackage({ ...form, price: parseFloat(form.price) || 0 });
      setCreateModal(false);
      setForm({ title: '', description: '', price: '', category: 'other', duration: '', deliverables: '' });
      load();
    } catch (e) { alert(e.response?.data?.detail || 'Failed'); }
  };

  const categories = ['portrait', 'event', 'product', 'wedding', 'fashion', 'landscape', 'commercial', 'other'];

  return (
    <div className="pt-20 pb-10 px-4 sm:px-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Camera size={24} /> Photography Hub</h1>
          <p className="text-surface-200 text-sm mt-1">Service packages & photography services</p>
        </div>
        <button onClick={() => setCreateModal(true)} className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium flex items-center gap-1.5 hover:opacity-90">
          <Plus size={16} /> New Package
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filter ? 'gradient-primary text-white' : 'bg-white/5 text-surface-200 hover:text-white'}`}>All</button>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === cat ? 'gradient-primary text-white' : 'bg-white/5 text-surface-200 hover:text-white'}`}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-surface-200 py-12">Loading...</div>
      ) : packages.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center text-surface-200">No packages found</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="glass rounded-xl overflow-hidden hover:glow hover:border-primary-500/30 transition-all">
              <div className="h-32 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 flex items-center justify-center">
                <Camera size={32} className="text-emerald-400/40" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white">{pkg.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 capitalize shrink-0">{pkg.category}</span>
                </div>
                <p className="text-xs text-surface-200 line-clamp-2 mb-3">{pkg.description}</p>
                {pkg.photographer && (
                  <div className="flex items-center gap-2 mb-3">
                    <img src={pkg.photographer.avatar_url} alt="" className="w-5 h-5 rounded-full" />
                    <span className="text-xs text-surface-200">{pkg.photographer.display_name}</span>
                    {pkg.photographer.ratings > 0 && <span className="text-xs text-yellow-400 flex items-center gap-0.5"><Star size={10} />{pkg.photographer.ratings}</span>}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-surface-200">
                  <span className="flex items-center gap-1 font-semibold text-white text-sm"><DollarSign size={14} />{pkg.price}</span>
                  {pkg.duration && <span className="flex items-center gap-1"><Clock size={12} />{pkg.duration}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create Service Package" maxWidth="max-w-lg">
        <form onSubmit={handleCreate} className="space-y-3">
          <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary-500/50" placeholder="Package title" />
          <textarea rows={3} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white resize-none focus:ring-2 focus:ring-primary-500/50" placeholder="Description" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary-500/50" placeholder="Price (₹)" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary-500/50 capitalize">
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary-500/50" placeholder="Duration (e.g., 2 hours)" />
          <input type="text" value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary-500/50" placeholder="Deliverables" />
          <button type="submit" className="w-full py-2.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90">Create Package</button>
        </form>
      </Modal>
    </div>
  );
}

