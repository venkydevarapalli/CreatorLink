import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { createConversation } from '../api/conversations';
import { getUser, updateProfile } from '../api/users';
import api from '../api/axios';
import { MessageCircle, Star, ExternalLink, PenLine, Mail, Phone, Camera, Upload, X, MapPin, Globe, Send } from 'lucide-react';
import Modal from '../components/common/Modal';
import { uploadFile } from '../api/upload';
import { ROLE_COLORS } from '../utils/constants';

const ROLE_ACCENT = {
  brand: '#6366f1', influencer: '#f59e0b', editor: '#10b981', photographer: '#8b5cf6', admin: '#e879f9',
};

export default function PublicProfile() {
  const { userId } = useParams();
  const { user: currentUser, setUser } = useAuth();
  const { openChat, conversations } = useChat();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: '', bio: '', avatar_url: '', contact_email: '', contact_phone: '', portfolio_urls: '', portfolio_images: '', location: '', skills: '', website: '', instagram: '', twitter: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const idToLoad = userId || currentUser?.id;

  useEffect(() => {
    const isDifferentUser = idToLoad && (!profile || String(profile.id) !== String(idToLoad));
    
    if (isDifferentUser) {
      console.log("Fetching profile for:", idToLoad);
      // Only set loading true if we don't have a profile at all or if the user changed
      // This prevents the flicker that resets modal state
      if (!profile || String(profile.id) !== String(idToLoad)) {
        setLoading(true);
      }

      getUser(idToLoad)
        .then(({ data }) => {
          setProfile(data);
          console.log("Profile successfully loaded:", data.id);
        })
        .catch(err => {
          console.error("Profile fetch error:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [idToLoad]); // Only depend on idToLoad to prevent cycles with profile.id

  const accent = ROLE_ACCENT[profile?.role] || '#6366f1';
  const isOwnProfile = currentUser && profile && String(currentUser.id) === String(profile.id);

  console.log("PublicProfile Render - state:", { 
    idToLoad, 
    profileId: profile?.id, 
    editModal, 
    isOwnProfile,
    currentUserId: currentUser?.id 
  });

  const handleEditOpen = () => {
    try {
      console.log("Attempting to open edit modal for profile:", profile?.id);
      if (!profile) return;
      
      setEditForm({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        contact_email: profile.contact_email || '',
        contact_phone: profile.contact_phone || '',
        portfolio_urls: Array.isArray(profile.portfolio_urls) ? profile.portfolio_urls.join('\n') : '',
        portfolio_images: Array.isArray(profile.portfolio_images) ? profile.portfolio_images.join('\n') : '',
        location: profile.location || '',
        skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
        website: profile.website || '',
        instagram: profile.instagram || '',
        twitter: profile.twitter || '',
      });
      console.log("Setting editModal to true");
      setEditModal(true);
    } catch (err) {
      console.error("Error opening edit modal:", err);
      alert("Failed to open edit modal.");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadFile(file);
      setEditForm(prev => ({ ...prev, avatar_url: data.url }));
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        display_name: editForm.display_name,
        bio: editForm.bio,
        avatar_url: editForm.avatar_url,
        contact_email: editForm.contact_email,
        contact_phone: editForm.contact_phone,
        portfolio_urls: editForm.portfolio_urls.split('\n').map(s => s.trim()).filter(Boolean),
        portfolio_images: editForm.portfolio_images.split('\n').map(s => s.trim()).filter(Boolean),
        location: editForm.location,
        skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        website: editForm.website,
        instagram: editForm.instagram,
        twitter: editForm.twitter,
      };
      const { data } = await updateProfile(payload);
      setProfile({ ...profile, ...data });
      if (String(currentUser?.id) === String(profile?.id)) {
        setUser({ ...currentUser, ...data });
      }
      setEditModal(false);
    } catch (err) {
      alert("Failed to update profile: " + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const existingConv = conversations.find((c) => !c.is_group && c.participants_info?.some((p) => p.id === userId));

  if (loading) return <div className="pt-24 text-center flex flex-col items-center gap-3"><div className="dc-spinner"></div><span style={{ color: 'var(--color-muted-foreground)', fontFamily: 'Inter' }}>Loading profile…</span></div>;
  if (!profile) return <div className="pt-24 text-center" style={{ color: 'var(--color-muted-foreground)', fontFamily: 'Inter' }}>User not found</div>;

  // accent and isOwnProfile moved up to top of component for use in logs and early logic


  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="dc-card overflow-hidden" style={{ borderRadius: 24 }}>
        {/* Banner */}
        <div className="h-32 relative" style={{ background: `linear-gradient(135deg, ${accent}40, ${accent}15, rgba(139,92,246,0.10))` }}></div>

        {/* Profile info */}
        <div className="relative z-10 px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-24 h-24 rounded-2xl object-cover" style={{ border: '4px solid #09090b' }} />
            ) : (
              <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center text-white text-3xl" style={{ border: '4px solid #09090b', fontWeight: 800 }}>
                {profile.display_name?.[0]}
              </div>
            )}
            <div className="flex-1 pt-14 sm:pt-2">
              <h1 style={{ fontWeight: 800, fontSize: 24, color: 'var(--color-foreground)', letterSpacing: '-0.8px' }}>{profile.display_name}</h1>
              <p style={{ fontSize: 13, color: accent, fontFamily: 'Inter', fontWeight: 500, textTransform: 'capitalize', marginTop: 2 }}>{profile.role}</p>
              {profile.bio && <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', fontFamily: 'Inter', marginTop: 8, maxWidth: 500, lineHeight: 1.6 }}>{profile.bio}</p>}

              {profile.role !== 'admin' && (profile.contact_email || profile.contact_phone) && (
                <div className="flex flex-wrap gap-4 mt-4">
                  {profile.contact_email && <span className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}><Mail size={14} />{profile.contact_email}</span>}
                  {profile.contact_phone && <span className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}><Phone size={14} />{profile.contact_phone}</span>}
                </div>
              )}
            </div>

            {!isOwnProfile && currentUser && currentUser.role !== 'admin' && existingConv && (
              <button onClick={() => openChat(existingConv.id)} className="dc-btn-primary mt-14 sm:mt-2 px-5 py-2 text-sm flex items-center gap-1.5 shrink-0">
                <MessageCircle size={16} /> Open Chat
              </button>
            )}
            {isOwnProfile && currentUser?.role !== 'admin' && (
              <button onClick={handleEditOpen} className="dc-btn-secondary mt-14 sm:mt-2 px-4 py-2 text-sm flex items-center justify-center gap-1.5 shrink-0">
                <PenLine size={15} /> Edit Profile
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 mt-4 pb-4 border-b border-white/5">
            {profile?.location && <span className="flex items-center gap-1.5 text-xs text-surface-200"><MapPin size={13} className="text-surface-300" /> {profile.location}</span>}
            {profile?.website && <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-white/60 hover:text-indigo-400 transition-colors"><Globe size={13} /> Website</a>}
            {profile?.instagram && <a href={`https://instagram.com/${String(profile.instagram).replace('@','')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-white/60 hover:text-pink-400 transition-colors"><Camera size={13} /> Instagram</a>}
            {profile?.twitter && <a href={`https://twitter.com/${String(profile.twitter).replace('@','')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-white/60 hover:text-sky-400 transition-colors"><Send size={13} /> Twitter</a>}
          </div>

          {profile.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {profile?.skills?.map((s, i) => (
                <span key={i} className="dc-badge dc-badge-blue">{s}</span>
              ))}
            </div>
          )}

          {/* Stats & Portfolio hidden for admin profiles */}
          {profile.role !== 'admin' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 stagger-children">
                <div className="dc-stat animate-fade-in">
                  <p className="dc-stat-number">{profile.completed_projects || 0}</p>
                  <p className="dc-stat-label">Projects</p>
                </div>
                <div className="dc-stat animate-fade-in" style={{ animationDelay: '0.05s' }}>
                  <p className="dc-stat-number flex items-center justify-center gap-1">
                    {profile.ratings > 0 ? <>{profile.ratings.toFixed(1)}</> : '—'}
                  </p>
                  <p className="dc-stat-label">Rating</p>
                </div>
                <div className="dc-stat animate-fade-in" style={{ animationDelay: '0.10s' }}>
                  <p className="dc-stat-number">{profile.total_ratings || 0}</p>
                  <p className="dc-stat-label">Reviews</p>
                </div>
              </div>

              {/* Portfolio */}
              {profile.portfolio_urls?.length > 0 && (
                <div className="mt-6">
                  <h3 style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-foreground)', marginBottom: 8 }}>Portfolio Links</h3>
                  <div className="space-y-2">
                    {profile.portfolio_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: '#a5b4fc', fontFamily: 'Inter' }}>
                        <ExternalLink size={14} /> {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {profile.portfolio_images?.length > 0 && (
                <div className="mt-6">
                  <h3 style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-foreground)', marginBottom: 8 }}>Portfolio</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {profile.portfolio_images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-full h-32 object-cover transition-transform hover:scale-105" style={{ borderRadius: 12 }} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Profile" maxWidth="max-w-xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Header with Avatar Upload */}
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="relative group">
              {editForm.avatar_url ? (
                <img src={editForm.avatar_url} alt="" className="w-24 h-24 rounded-2xl object-cover transition-opacity group-hover:opacity-50" />
              ) : (
                <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center text-white text-3xl font-bold group-hover:opacity-50">
                  {editForm.display_name?.[0] || '?'}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
                  <div className="dc-spinner"></div>
                </div>
              )}
              <label className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white text-[10px] font-bold uppercase tracking-wider gap-1">
                <Camera size={20} />
                <span>Change</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-surface-400 uppercase tracking-[2px]">Basic Info</h3>
              <div>
                <label className="block mb-1.5 text-xs text-surface-300 font-medium ml-1">Display Name</label>
                <input type="text" required value={editForm.display_name} onChange={(e) => setEditForm(p => ({ ...p, display_name: e.target.value }))} className="dc-input w-full px-4 py-2.5 text-sm" placeholder="Your Name" />
              </div>
              <div>
                <label className="block mb-1.5 text-xs text-surface-300 font-medium ml-1">Bio</label>
                <textarea rows={3} value={editForm.bio} onChange={(e) => setEditForm(p => ({ ...p, bio: e.target.value }))} className="dc-input w-full px-4 py-2.5 text-sm resize-none" placeholder="Tell us about yourself..." />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-surface-400 uppercase tracking-[2px]">Contact Details</h3>
              <div>
                <label className="block mb-1.5 text-xs text-surface-300 font-medium ml-1">Contact Email</label>
                <input type="email" value={editForm.contact_email} onChange={(e) => setEditForm(p => ({ ...p, contact_email: e.target.value }))} className="dc-input w-full px-4 py-2.5 text-sm" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block mb-1.5 text-xs text-surface-300 font-medium ml-1">Contact Phone</label>
                <input type="text" value={editForm.contact_phone} onChange={(e) => setEditForm(p => ({ ...p, contact_phone: e.target.value }))} className="dc-input w-full px-4 py-2.5 text-sm" placeholder="+1234567890" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-surface-400 uppercase tracking-[2px]">Portfolio & Experience</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block mb-1.5 text-xs text-surface-300 font-medium ml-1">Skills (Comma separated)</label>
                <input type="text" value={editForm.skills} onChange={(e) => setEditForm(p => ({ ...p, skills: e.target.value }))} className="dc-input w-full px-4 py-2.5 text-sm" placeholder="Editing, Color Grading, 3D..." />
              </div>
              <div>
                <label className="block mb-1.5 text-xs text-surface-300 font-medium ml-1">Portfolio URLs (One per line)</label>
                <textarea rows={3} value={editForm.portfolio_urls} onChange={(e) => setEditForm(p => ({ ...p, portfolio_urls: e.target.value }))} className="dc-input w-full px-4 py-2.5 text-sm resize-none" placeholder="https://dribbble.com/..." />
              </div>
              <div>
                <label className="block mb-1.5 text-xs text-surface-300 font-medium ml-1">Portfolio Images (One per line)</label>
                <textarea rows={3} value={editForm.portfolio_images} onChange={(e) => setEditForm(p => ({ ...p, portfolio_images: e.target.value }))} className="dc-input w-full px-4 py-2.5 text-sm resize-none" placeholder="https://image-url..." />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-surface-400 uppercase tracking-[2px]">Socials & Web</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs text-surface-300 font-medium ml-1">Location</label>
                <input type="text" value={editForm.location} onChange={(e) => setEditForm(p => ({ ...p, location: e.target.value }))} className="dc-input w-full px-4 py-2.5 text-sm" placeholder="City, Country" />
              </div>
              <div>
                <label className="block mb-1.5 text-xs text-surface-300 font-medium ml-1">Website URL</label>
                <input type="text" value={editForm.website} onChange={(e) => setEditForm(p => ({ ...p, website: e.target.value }))} className="dc-input w-full px-4 py-2.5 text-sm" placeholder="https://..." />
              </div>
              <div>
                <label className="block mb-1.5 text-xs text-surface-300 font-medium ml-1">Instagram (@handle)</label>
                <input type="text" value={editForm.instagram} onChange={(e) => setEditForm(p => ({ ...p, instagram: e.target.value }))} className="dc-input w-full px-4 py-2.5 text-sm" placeholder="@username" />
              </div>
              <div>
                <label className="block mb-1.5 text-xs text-surface-300 font-medium ml-1">Twitter (@handle)</label>
                <input type="text" value={editForm.twitter} onChange={(e) => setEditForm(p => ({ ...p, twitter: e.target.value }))} className="dc-input w-full px-4 py-2.5 text-sm" placeholder="@username" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving || uploading} className="dc-btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
            {saving ? <div className="dc-spinner" style={{ width: 14, height: 14 }}></div> : <Upload size={16} />}
            {saving ? 'Saving Changes...' : 'Save Profile Settings'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
