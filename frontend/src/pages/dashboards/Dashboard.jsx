import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import BrandDashboard from './BrandDashboard';
import InfluencerDashboard from './InfluencerDashboard';
import EditorDashboard from './EditorDashboard';
import PhotographerDashboard from './PhotographerDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin': return <AdminDashboard user={user} />;
      case 'brand': return <BrandDashboard user={user} />;
      case 'influencer': return <InfluencerDashboard user={user} />;
      case 'editor': return <EditorDashboard user={user} />;
      case 'photographer': return <PhotographerDashboard user={user} />;
      default: return <div>Unknown role</div>;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground)] tracking-tight">
          Overview
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
          Welcome back, {user.display_name}
        </p>
      </div>
      {renderDashboard()}
    </div>
  );
}
