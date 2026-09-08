import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import petApi from '../api/petApi';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { 
  Dog, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Camera, 
  Calendar, 
  Scale, 
  Info,
  ChevronRight
} from 'lucide-react';

const initialPetForm = {
  name: '',
  species: '',
  breed: '',
  gender: 'MALE',
  dateOfBirth: '',
  weight: '',
  description: '',
};

const Pets = () => {
  const [pets, setPets] = useState([]);
  const [pageData, setPageData] = useState({
    pageNumber: 0,
    pageSize: 8,
    totalElements: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState(initialPetForm);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingPetId, setDeletingPetId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // File upload state
  const [selectedPetForUpload, setSelectedPetForUpload] = useState(null);
  const fileInputRef = useRef(null);

  const { addToast } = useToast();

  useEffect(() => {
    fetchPets(0);
  }, []);

  const fetchPets = async (page = 0, searchTerm = search) => {
    try {
      setLoading(true);
      const res = await petApi.getAll({
        page,
        size: pageData.pageSize,
        search: searchTerm || undefined,
      });
      setPets(res.data.content || []);
      setPageData({
        pageNumber: res.data.pageNumber,
        pageSize: res.data.pageSize,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
      });
    } catch (err) {
      addToast(err.message || 'Lỗi khi tải danh sách thú cưng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPets(0, search);
  };

  const handleOpenAdd = () => {
    setEditingPet(null);
    setFormData(initialPetForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name || '',
      species: pet.species || '',
      breed: pet.breed || '',
      gender: pet.gender || 'MALE',
      dateOfBirth: pet.dateOfBirth || '',
      weight: pet.weight || '',
      description: pet.description || '',
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.species.trim()) {
      addToast('Vui lòng điền tên và loài thú cưng', 'error');
      return;
    }

    try {
      setFormSubmitting(true);
      const payload = {
        ...formData,
        weight: formData.weight ? parseFloat(formData.weight) : null,
      };

      if (editingPet) {
        await petApi.update(editingPet.id, payload);
        addToast('Cập nhật thông tin thú cưng thành công!');
      } else {
        await petApi.create(payload);
        addToast('Thêm thú cưng mới thành công!');
      }
      setIsFormOpen(false);
      fetchPets(pageData.pageNumber);
    } catch (err) {
      addToast(err.message || 'Thao tác thất bại', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPetId) return;
    try {
      await petApi.delete(deletingPetId);
      addToast('Đã xoá thú cưng thành công!');
      fetchPets(pageData.pageNumber);
    } catch (err) {
      addToast(err.message || 'Lỗi khi xoá thú cưng', 'error');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPetForUpload) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      addToast('Đang tải ảnh lên...', 'info');
      await petApi.uploadImage(selectedPetForUpload.id, uploadFormData);
      addToast('Cập nhật ảnh thú cưng thành công!');
      fetchPets(pageData.pageNumber);
    } catch (err) {
      addToast(err.message || 'Lỗi khi tải ảnh lên', 'error');
    } finally {
      setSelectedPetForUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Thú cưng</h1>
          <p className="text-sm text-slate-500">Danh sách các bé thú cưng trong hệ thống</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm thú cưng</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên hoặc loài thú cưng..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </form>
      </div>

      {/* Pet Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">Đang tải danh sách thú cưng...</div>
      ) : pets.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-100 p-8">
          <Dog className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Chưa có thú cưng nào</h3>
          <p className="text-sm text-slate-400 mt-1">Bấm "Thêm thú cưng" để tạo hồ sơ cho người bạn nhỏ của bạn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition duration-200 overflow-hidden flex flex-col group"
            >
              {/* Pet Image with action overlay */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                {pet.imageUrl ? (
                  <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <Dog className="w-12 h-12 stroke-[1.5]" />
                    <span className="text-xs mt-1">Chưa có ảnh</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedPetForUpload(pet);
                    fileInputRef.current?.click();
                  }}
                  title="Cập nhật ảnh"
                  className="absolute bottom-2.5 right-2.5 p-2 bg-white/90 hover:bg-white text-slate-700 rounded-xl shadow-md backdrop-blur-xs transition"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <div className="absolute top-2.5 left-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-xs ${
                    pet.gender === 'FEMALE' ? 'bg-pink-500 text-white' : 'bg-indigo-600 text-white'
                  }`}>
                    {pet.gender === 'FEMALE' ? 'Cái (Nữ)' : 'Đực (Nam)'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{pet.name}</h3>
                    <p className="text-xs text-indigo-600 font-medium">{pet.species} {pet.breed ? `• ${pet.breed}` : ''}</p>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  {pet.dateOfBirth && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sinh ngày: {pet.dateOfBirth}</span>
                    </div>
                  )}
                  {pet.weight && (
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-slate-400" />
                      <span>Cân nặng: {pet.weight} kg</span>
                    </div>
                  )}
                </div>

                {pet.description && (
                  <p className="mt-3 text-xs text-slate-500 line-clamp-2 italic bg-slate-50 p-2 rounded-lg">
                    "{pet.description}"
                  </p>
                )}

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/pets/${pet.id}`}
                    className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Xem hồ sơ <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(pet)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingPetId(pet.id);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Xoá"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={pageData.pageNumber}
        totalPages={pageData.totalPages}
        totalElements={pageData.totalElements}
        onPageChange={(page) => fetchPets(page)}
      />

      {/* Add / Edit Pet Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingPet ? 'Cập nhật thú cưng' : 'Thêm thú cưng mới'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên thú cưng *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Cún Lu, Miu Miu"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Loài *</label>
              <input
                type="text"
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                placeholder="VD: Chó, Mèo, Hamster"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Giống</label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="VD: Poodle, Corgi, Golden"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Giới tính</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
              >
                <option value="MALE">Đực (Nam)</option>
                <option value="FEMALE">Cái (Nữ)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày sinh</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cân nặng (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="VD: 4.5"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả / Ghi chú</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Đặc điểm nhận dạng, thói quen ăn uống..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
            >
              {formSubmitting ? 'Đang lưu...' : editingPet ? 'Lưu thay đổi' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xoá thú cưng"
        message="Bạn có chắc chắn muốn xoá thú cưng này? Mọi hồ sơ bệnh án và lịch tiêm liên quan sẽ bị xoá vĩnh viễn."
      />
    </div>
  );
};

export default Pets;
