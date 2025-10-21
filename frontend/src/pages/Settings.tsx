import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Camera, Trash2, Save, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../lib/api';

export const Settings = () => {
  const { user, updateProfile, updateProfilePicture, removeProfilePicture } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Picture Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 h-fit">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Picture</h3>
            
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
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
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-4xl">
                      {user?.name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                
                <label className={`absolute bottom-0 right-0 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors cursor-pointer ${
                  avatarLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#FDC726] hover:bg-[#e5b520]'
                }`}>
                  <Camera className="w-6 h-6 text-gray-900" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={avatarLoading}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="text-sm text-gray-600 text-center mb-4">
                Click the camera icon to upload a new profile picture
              </p>

              {user?.avatar && (
                <button
                  onClick={handleRemoveProfilePicture}
                  disabled={avatarLoading}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  {avatarLoading ? 'Removing...' : 'Remove Picture'}
                </button>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setIsEditingName(true);
                    }}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FDC726] transition-colors text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
              </div>

              {(message || error) && !currentPassword && (
                <div className={`border-2 rounded-xl p-4 ${
                  error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    error ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {error || message}
                  </p>
                </div>
              )}

              {isEditingName && (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setName(user?.name || '');
                      setIsEditingName(false);
                    }}
                    className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-[#FDC726] text-gray-900 rounded-xl font-semibold hover:bg-[#e5b520] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Change Password</h3>
          
          <form onSubmit={handleChangePassword} className="grid md:grid-cols-2 gap-6 max-w-4xl">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FDC726] transition-colors text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FDC726] transition-colors text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FDC726] transition-colors text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {(message || error) && currentPassword && (
              <div className={`md:col-span-2 border-2 rounded-xl p-4 ${
                error ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}>
                <p className={`text-sm font-medium ${
                  error ? 'text-red-700' : 'text-green-700'
                }`}>
                  {error || message}
                </p>
              </div>
            )}

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center gap-2 px-6 py-3 bg-[#FDC726] text-gray-900 rounded-xl font-semibold hover:bg-[#e5b520] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="w-5 h-5" />
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 bg-white rounded-2xl p-6 border border-red-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Danger Zone</h3>
              <p className="text-gray-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-sm">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};