import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import vaccinationApi from '../api/vaccinationApi';
import petApi from '../api/petApi';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { 
  Syringe, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Clock, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const initialVaccineForm = {
  petId: '',
  vaccineName: '',
  vaccinationDate: '',
  nextVaccinationDate: '',
};

const Vaccinations = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [pets, setPets] = useState([]);
  const [pageData, setPageData] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState(null);
  const [formData, setFormData] = useState(initialVaccineForm);
  const [deleteId, setDeleteId] = useState(null);

  const { addToast } = useToast();

  useEffect(() => {
    fetchVaccinations(0);
    fetchPetList();
  }, []);

  const fetchPetList = async () => {
    try {
      const res = await petApi.getAll({ page: 0, size: 100 });
      setPets(res.data.content || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchVaccinations = async (page = 0) => {
    try {
      setLoading(true);
      const res = await vaccinationApi.getAll({ page, size: pageData.pageSize });
      setVaccinations(res.data.content || []);
      setPageData({
        pageNumber: res.data.pageNumber,
        pageSize: res.data.pageSize,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
      });
    } catch (err) {
      addToast(err.message || 'Lỗi khi tải lịch tiêm phòng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingVaccine(null);
    setFormData({
      ...initialVaccineForm,
      petId: pets[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vac) => {
    setEditingVaccine(vac);
    setFormData({
      petId: vac.petId || '',
      vaccineName: vac.vaccineName || '',
      vaccinationDate: vac.vaccinationDate || '',
      nextVaccinationDate: vac.nextVaccinationDate || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.petId && !editingVaccine) {
      addToast('Vui lòng chọn thú cưng', 'error');
      return;
    }

    try {
      if (editingVaccine) {
        await vaccinationApi.update(editingVaccine.id, formData);
        addToast('Cập nhật lịch tiêm thành công!');
      } else {
        await vaccinationApi.create(formData.petId, formData);
        addToast('Tạo lịch tiêm phòng mới thành công!');
      }
      setIsModalOpen(false);
      fetchVaccinations(pageData.pageNumber);
    } catch (err) {
      addToast(err.message || 'Thao tác thất bại', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await vaccinationApi.delete(deleteId);
      addToast('Đã xoá lịch tiêm phòng thành công!');
      fetchVaccinations(pageData.pageNumber);
    } catch (err) {
      addToast(err.message || 'Lỗi khi xoá lịch tiêm', 'error');
    }
  };

  const getPetName = (petId) => {
    const p = pets.find((item) => item.id === petId);
    return p ? p.name : `Pet #${petId}`;
  };

  const getVaccineStatus = (nextDateStr) => {
    if (!nextDateStr) return { label: 'Đã hoàn thành', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDate = new Date(nextDateStr);

    const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Quá hạn ${Math.abs(diffDays)} ngày`, color: 'bg-rose-50 text-rose-700 border-rose-200' };
    } else if (diffDays <= 7) {
      return { label: `Sắp tới hạn (${diffDays} ngày nữa)`, color: 'bg-amber-50 text-amber-700 border-amber-200' };
    } else {
      return { label: `Đến hạn trong ${diffDays} ngày`, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Lịch Tiêm phòng</h1>
          <p className="text-sm text-slate-500">Theo dõi ngày tiêm, chủng loại vaccine và ngày hẹn tiêm nhắc lại</p>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={pets.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm lịch tiêm</span>
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">Đang tải lịch tiêm phòng...</div>
      ) : vaccinations.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-100 p-8">
          <Syringe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Chưa có lịch tiêm nào</h3>
          <p className="text-sm text-slate-400 mt-1">Bấm "Thêm lịch tiêm" để lên kế hoạch tiêm phòng cho thú cưng.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vaccinations.map((vac) => {
            const status = getVaccineStatus(vac.nextVaccinationDate);
            return (
              <div
                key={vac.id}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                        <Syringe className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">{vac.vaccineName}</h4>
                        <p className="text-xs text-slate-400">
                          Thú cưng:{' '}
                          <Link to={`/pets/${vac.petId}`} className="text-indigo-600 font-semibold hover:underline">
                            {getPetName(vac.petId)}
                          </Link>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(vac)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(vac.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Xoá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Ngày tiêm:
                      </span>
                      <span className="font-semibold text-slate-700">{vac.vaccinationDate}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Ngày hẹn kế tiếp:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {vac.nextVaccinationDate || 'Không có lịch hẹn'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={pageData.pageNumber}
        totalPages={pageData.totalPages}
        totalElements={pageData.totalElements}
        onPageChange={(page) => fetchVaccinations(page)}
      />

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVaccine ? 'Cập nhật lịch tiêm phòng' : 'Thêm lịch tiêm phòng mới'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {!editingVaccine && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chọn thú cưng *</label>
              <select
                value={formData.petId}
                onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
                required
              >
                <option value="" disabled>-- Chọn thú cưng --</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.species})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Vaccine *</label>
            <input
              type="text"
              value={formData.vaccineName}
              onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
              placeholder="VD: Vaccine Dại (Rabies), 7 Bệnh..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày tiêm *</label>
              <input
                type="date"
                value={formData.vaccinationDate}
                onChange={(e) => setFormData({ ...formData, vaccinationDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hẹn tiêm lần sau</label>
              <input
                type="date"
                value={formData.nextVaccinationDate}
                onChange={(e) => setFormData({ ...formData, nextVaccinationDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition"
            >
              Lưu lịch tiêm
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Xoá lịch tiêm phòng"
        message="Bạn có chắc chắn muốn xoá lịch tiêm phòng này?"
      />
    </div>
  );
};

export default Vaccinations;
