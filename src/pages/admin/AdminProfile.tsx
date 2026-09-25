import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Edit3, Save, X, User, Mail } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AdminProfile() {
  const { profile } = useAuthStore();
  const { refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
  });

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      await authService.updateProfile(profile.id, form);
      await refreshProfile();
      setIsEditing(false);
      toast.success('Profile updated ✓');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8">
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <User size={24} className="text-purple-400" />
        <h1 className="text-white font-bold text-2xl">My Profile</h1>
      </motion.div>

      <motion.div
        className="glass-card p-8 space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/20">
            {initials}
          </div>
          {!isEditing && (
            <div className="text-center space-y-2">
              <h2 className="text-white font-bold text-xl">
                {profile?.display_name || 'Administrator'}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="admin">
                  <Shield size={10} />
                  Admin
                </Badge>
                {profile?.created_at && (
                  <span className="text-white/30 text-xs">
                    Since {format(new Date(profile.created_at), 'MMMM yyyy')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-5">
            <Input
              label="Display Name"
              value={form.display_name}
              onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
              leftIcon={<User size={16} />}
            />
            <Textarea
              label="Bio"
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              rows={4}
              placeholder="A little about yourself..."
            />
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" leftIcon={<X size={14} />} onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="admin" leftIcon={<Save size={14} />} onClick={handleSave} isLoading={isSaving}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/3">
              <Mail size={16} className="text-white/40" />
              <div>
                <p className="text-white/40 text-xs">Email</p>
                <p className="text-white/80 text-sm">{profile?.email}</p>
              </div>
            </div>
            {profile?.bio && (
              <div className="p-4 rounded-xl bg-white/3">
                <p className="text-white/40 text-xs mb-1">Bio</p>
                <p className="text-white/70 text-sm italic">{profile.bio}</p>
              </div>
            )}
            <Button
              variant="ghost"
              leftIcon={<Edit3 size={14} />}
              onClick={() => setIsEditing(true)}
              className="w-full"
            >
              Edit Profile
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
