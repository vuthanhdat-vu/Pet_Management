import React, { useState, useEffect, useRef } from 'react';
import userApi from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { 
  User, 
  Mail, 
  Shield, 
  Camera, 
  Lock, 
  KeyRound, 
  CheckCircle2 
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Change password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Since user context has username, let's get user list or user details
      const res = await userApi.getAll({ search: user?.username, page: 0, size: 1 });
      const found = res.data?.content?.[0];
      if (found) {
        setProfileData(found);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profileData) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      addToast('Đang tải ảnh đại diện lên...', 'info');
      const res = await userApi.uploadAvatar(profileData.id, formData);
      setProfileData(res.data);
      addToast('Cập nhật ảnh đại diện thành công!');
    } catch (err) {
      addToast(err.message || 'Tải ảnh thất bại', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      addToast('Vui lòng điền đầy đủ thông tin đổi mật khẩu', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      addToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('Mật khẩu xác nhận không khớp', 'error');
      return;
    }

    try {
      setPwdSubmitting(true);
      await userApi.changePassword(passwordForm);
      addToast('Đổi mật khẩu thành công!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      addToast(err.message || 'Đổi mật khẩu thất bại', 'error');
    } finally {
      setPwdSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Hồ sơ cá nhân</h1>
        <p className="text-sm text-slate-500">Quản lý thông tin tài khoản và bảo mật</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-indigo-50 border-4 border-indigo-100 overflow-hidden flex items-center justify-center text-3xl font-bold text-indigo-600 shadow-inner">
              {profileData?.avatarUrl ? (
                <img src={profileData.avatarUrl} alt={user?.username} className="w-full h-full object-cover" />
              ) : (
                user?.username?.charAt(0).toUpperCase()
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md transition"
              title="Đổi ảnh đại diện"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800">{user?.username}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{profileData?.email || 'N/A'}</p>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              user?.isAdmin ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-indigo-50 text-indigo-700'
            }`}>
              <Shield className="w-3.5 h-3.5" />
              {user?.isAdmin ? 'Quản trị viên (ADMIN)' : 'Thành viên (USER)'}
            </span>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <KeyRound className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-800">Đổi mật khẩu tài khoản</h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Mật khẩu hiện tại *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Nhập mật khẩu đang dùng"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Mật khẩu mới *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Xác nhận mật khẩu mới *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={pwdSubmitting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
              >
                {pwdSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
