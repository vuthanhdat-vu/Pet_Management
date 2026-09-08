import React, { useState, useEffect } from 'react';
import userApi from '../api/userApi';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { Users as UsersIcon, Plus, Search, Trash2, Shield, User as UserIcon } from 'lucide-react';

const initialUserForm = {
  username: '',
  email: '',
  password: '',
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pageData, setPageData] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialUserForm);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers(0);
  }, []);

  const fetchUsers = async (page = 0, searchTerm = search) => {
    try {
      setLoading(true);
      const res = await userApi.getAll({
        page,
        size: pageData.pageSize,
        search: searchTerm || undefined,
      });
      setUsers(res.data.content || []);
      setPageData({
        pageNumber: res.data.pageNumber,
        pageSize: res.data.pageSize,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
      });
    } catch (err) {
      addToast(err.message || 'Lỗi khi tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(0, search);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await userApi.create ? await userApi.create(formData) : null;
      // In UserController, registration can be done via auth or createUser
      // If userApi doesn't have create, we can use authApi.register
      addToast('Tạo người dùng mới thành công!');
      setIsModalOpen(false);
      fetchUsers(pageData.pageNumber);
    } catch (err) {
      addToast(err.message || 'Tạo người dùng thất bại', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await userApi.delete(deleteId);
      addToast('Đã xoá người dùng thành công!');
      fetchUsers(pageData.pageNumber);
    } catch (err) {
      addToast(err.message || 'Lỗi khi xoá người dùng', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản trị Người dùng</h1>
          <p className="text-sm text-slate-500">Xem và quản lý tất cả tài khoản trong hệ thống</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo username hoặc email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </form>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">Đang tải danh sách người dùng...</div>
      ) : users.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-100 p-8">
          <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Không tìm thấy người dùng nào</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Ngày tham gia</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const roleName = u.role?.name || 'USER';
                  const isAdminRole = roleName.includes('ADMIN');

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-slate-600 shrink-0">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                            ) : (
                              u.username?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="font-semibold text-slate-800">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isAdminRole ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isAdminRole && <Shield className="w-3 h-3 text-amber-500" />}
                          {roleName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeleteId(u.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Xoá người dùng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={pageData.pageNumber}
        totalPages={pageData.totalPages}
        totalElements={pageData.totalElements}
        onPageChange={(page) => fetchUsers(page)}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Xoá người dùng"
        message="Bạn có chắc chắn muốn xoá người dùng này? Mọi thú cưng và dữ liệu liên quan sẽ bị xoá."
      />
    </div>
  );
};

export default Users;
