import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import medicalApi from '../api/medicalApi';
import petApi from '../api/petApi';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { FileText, Plus, Edit2, Trash2, Stethoscope, ChevronRight } from 'lucide-react';

const initialMedicalForm = {
  petId: '',
  visitDate: '',
  symptoms: '',
  diagnosis: '',
  treatment: '',
  prescription: '',
  notes: '',
};

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [pets, setPets] = useState([]);
  const [pageData, setPageData] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState(initialMedicalForm);
  const [deleteId, setDeleteId] = useState(null);

  const { addToast } = useToast();

  useEffect(() => {
    fetchRecords(0);
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

  const fetchRecords = async (page = 0) => {
    try {
      setLoading(true);
      const res = await medicalApi.getAll({ page, size: pageData.pageSize });
      setRecords(res.data.content || []);
      setPageData({
        pageNumber: res.data.pageNumber,
        pageSize: res.data.pageSize,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
      });
    } catch (err) {
      addToast(err.message || 'Lỗi khi tải hồ sơ y tế', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      ...initialMedicalForm,
      petId: pets[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setFormData({
      petId: rec.petId || '',
      visitDate: rec.visitDate || '',
      symptoms: rec.symptoms || '',
      diagnosis: rec.diagnosis || '',
      treatment: rec.treatment || '',
      prescription: rec.prescription || '',
      notes: rec.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.petId && !editingRecord) {
      addToast('Vui lòng chọn thú cưng', 'error');
      return;
    }

    try {
      if (editingRecord) {
        await medicalApi.update(editingRecord.id, formData);
        addToast('Cập nhật hồ sơ thành công!');
      } else {
        await medicalApi.create(formData.petId, formData);
        addToast('Tạo hồ sơ khám bệnh mới thành công!');
      }
      setIsModalOpen(false);
      fetchRecords(pageData.pageNumber);
    } catch (err) {
      addToast(err.message || 'Thao tác thất bại', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await medicalApi.delete(deleteId);
      addToast('Đã xoá hồ sơ y tế thành công!');
      fetchRecords(pageData.pageNumber);
    } catch (err) {
      addToast(err.message || 'Lỗi khi xoá hồ sơ y tế', 'error');
    }
  };

  const getPetName = (petId) => {
    const p = pets.find((item) => item.id === petId);
    return p ? p.name : `Pet #${petId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Hồ sơ Y tế</h1>
          <p className="text-sm text-slate-500">Lịch sử khám, chẩn đoán và điều trị bệnh cho thú cưng</p>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={pets.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm hồ sơ khám</span>
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">Đang tải hồ sơ y tế...</div>
      ) : records.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-100 p-8">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Chưa có hồ sơ y tế nào</h3>
          <p className="text-sm text-slate-400 mt-1">Bấm "Thêm hồ sơ khám" để lưu lại lịch sử khám bệnh.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">
                      Thú cưng:{' '}
                      <Link to={`/pets/${rec.petId}`} className="text-indigo-600 hover:underline">
                        {getPetName(rec.petId)}
                      </Link>
                    </h3>
                    <span className="text-xs text-slate-400">Ngày khám: {rec.visitDate || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenEdit(rec)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(rec.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Xoá"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Triệu chứng:</p>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl">{rec.symptoms || 'Không có'}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Chẩn đoán:</p>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl font-medium">{rec.diagnosis || 'Không có'}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Điều trị:</p>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl">{rec.treatment || 'Không có'}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Đơn thuốc:</p>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl font-mono">{rec.prescription || 'Không có'}</p>
                </div>
              </div>

              {rec.notes && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span className="font-semibold text-slate-600">Ghi chú:</span> {rec.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={pageData.pageNumber}
        totalPages={pageData.totalPages}
        totalElements={pageData.totalElements}
        onPageChange={(page) => fetchRecords(page)}
      />

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? 'Cập nhật hồ sơ y tế' : 'Thêm hồ sơ y tế mới'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {!editingRecord && (
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày khám</label>
            <input
              type="date"
              value={formData.visitDate}
              onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Triệu chứng *</label>
            <textarea
              rows="2"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              placeholder="Mô tả các triệu chứng của bé..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chẩn đoán *</label>
            <textarea
              rows="2"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="Chẩn đoán bệnh..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phương pháp điều trị *</label>
            <textarea
              rows="2"
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              placeholder="Phương pháp điều trị..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Đơn thuốc</label>
            <textarea
              rows="2"
              value={formData.prescription}
              onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
              placeholder="Tên thuốc và liều lượng..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú thêm</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ghi chú khác..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
            />
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
              Lưu hồ sơ
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Xoá hồ sơ y tế"
        message="Bạn có chắc chắn muốn xoá hồ sơ y tế này?"
      />
    </div>
  );
};

export default MedicalRecords;
