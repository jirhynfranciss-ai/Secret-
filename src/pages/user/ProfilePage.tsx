import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Edit3, Save, X, Camera, Heart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export default function ProfilePage() {
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
      await authService.updateProfile(profile.id, {
        display_name: form.display_name,
        bio: form.bio,
      });
      await refreshProfile();
      setIsEditing(false);
      toast.success('Profile updated 💌');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : profile?.email?.slice(0, 2).toUpperCase() || '??';

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-6 pt-8 md:pt-12 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <span className="text-3xl">✨</span>
          <h1 className="font-serif text-3xl text-white">My Profile</h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          className="glass-card p-8 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full gradient-rose flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-rose-500/20">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || ''}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full glass flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                <Camera size={14} />
              </button>
            </div>

            {!isEditing ? (
              <div className="text-center space-y-2">
                <h2 className="font-serif text-2xl text-white">
                  {profile?.display_name || 'Anonymous'}
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="rose">
                    <Heart size={10} />
                    Admired
                  </Badge>
                  {memberSince && (
                    <span className="text-white/30 text-xs">Since {memberSince}</span>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Edit / View */}
          {isEditing ? (
            <div className="space-y-5">
              <Input
                label="Display Name"
                value={form.display_name}
                onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
                placeholder="How would you like to be called?"
                leftIcon={<User size={16} />}
              />
              <Textarea
                label="About Me"
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Share a little about yourself..."
                rows={4}
              />
              <div className="flex gap-3 justify-end">
                <Button
                  variant="ghost"
                  leftIcon={<X size={14} />}
                  onClick={() => {
                    setIsEditing(false);
                    setForm({
                      display_name: profile?.display_name || '',
                      bio: profile?.bio || '',
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  leftIcon={<Save size={14} />}
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Info rows */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/3">
                  <Mail size={18} className="text-white/40 flex-shrink-0" />
                  <div>
                    <p className="text-white/40 text-xs">Email</p>
                    <p className="text-white/80 text-sm">{profile?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/3">
                  <User size={18} className="text-white/40 flex-shrink-0" />
                  <div>
                    <p className="text-white/40 text-xs">Name</p>
                    <p className="text-white/80 text-sm">
                      {profile?.display_name || 'Not set'}
                    </p>
                  </div>
                </div>

                {profile?.bio && (
                  <div className="p-4 rounded-xl bg-white/3">
                    <p className="text-white/40 text-xs mb-2">About me</p>
                    <p className="text-white/70 text-sm leading-relaxed italic">
                      "{profile.bio}"
                    </p>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                leftIcon={<Edit3 size={14} />}
                onClick={() => setIsEditing(true)}
                className="w-full"
              >
                Edit Profile
              </Button>
            </div>
          )}
        </motion.div>

        {/* Privacy note */}
        <motion.div
          className="text-center py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-white/20 text-xs">
            🔒 Your profile is private and visible only to your admirer
          </p>
        </motion.div>
      </div>
    </div>
  );
}
