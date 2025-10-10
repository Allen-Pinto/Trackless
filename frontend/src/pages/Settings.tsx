import { useState, useEffect } from 'react';
import { User, Mail, Lock, Camera } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../lib/api';

export const Settings = () => {
  const { user, updateProfile, updateProfilePicture, removeProfilePicture } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setProfileLoading(true);
    try {
      const { error } = await updateProfile(name.trim());
      if (error) {
        setError(error.message);
      } else {
        setMessage('Profile updated successfully!');
        setIsEditingName(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await authApi.changePassword(currentPassword, newPassword);
      if (response.success) {
        setMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(response.error || 'Failed to change password');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload the file to server
      setError('');
      setMessage('');
      setAvatarLoading(true);

      try {
        const { error } = await updateProfilePicture(file);
        if (error) {
          setError(error.message);
          setPreviewImage(null);
        } else {
          setMessage('Profile picture updated successfully!');
          setPreviewImage(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to upload profile picture');
        setPreviewImage(null);
      } finally {
        setAvatarLoading(false);
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!user?.avatar) return;

    setError('');
    setMessage('');
    setAvatarLoading(true);

    try {
      const { error } = await removeProfilePicture();
      if (error) {
        setError(error.message);
      } else {
        setMessage('Profile picture removed successfully!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove profile picture');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Profile Picture</h3>
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-[#59A5D8] to-[#3B8CB8] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-4xl">
                    {user?.name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
                <Camera className="w-5 h-5 text-[#59A5D8]" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={avatarLoading}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-600 text-center mb-3">
              Click the camera icon to upload a new profile picture
            </p>
            {user?.avatar && (
              <Button
                variant="secondary"
                onClick={handleRemoveProfilePicture}
                loading={avatarLoading}
              >
                Remove Picture
              </Button>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">User Information</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  label="Full Name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setIsEditingName(true);
                  }}
                  icon={<User className="w-5 h-5" />}
                />
              </div>
              {isEditingName && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setName(user?.name || '');
                    setIsEditingName(false);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>

            <Input
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              disabled
            />

            {(message || error) && !currentPassword && !avatarLoading && (
              <div className={`border-2 rounded-lg p-3 ${
                error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}>
                <p className={`text-sm ${error ? 'text-red-600' : 'text-green-600'}`}>
                  {error || message}
                </p>
              </div>
            )}

            {isEditingName && (
              <div className="flex justify-end gap-2">
                <Button type="submit" loading={profileLoading}>
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-2xl">
          <Input
            type="password"
            label="Current Password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            icon={<Lock className="w-5 h-5" />}
          />

          <Input
            type="password"
            label="New Password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            icon={<Lock className="w-5 h-5" />}
          />

          <Input
            type="password"
            label="Confirm New Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock className="w-5 h-5" />}
          />

          {(message || error) && currentPassword && (
            <div
              className={`border-2 rounded-lg p-3 ${
                error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}
            >
              <p
                className={`text-sm ${error ? 'text-red-600' : 'text-green-600'}`}
              >
                {error || message}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" loading={passwordLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Danger Zone</h3>
        <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h4>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="danger">Delete Account</Button>
        </div>
      </Card>
    </div>
  );
};