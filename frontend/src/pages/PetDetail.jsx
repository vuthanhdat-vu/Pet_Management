import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import petApi from '../api/petApi';
import medicalApi from '../api/medicalApi';
import vaccinationApi from '../api/vaccinationApi';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { 
  Dog, 
  ArrowLeft, 
  FileText, 
  Syringe, 
  Plus, 
  Calendar, 
  Scale, 
  Edit2, 
  Trash2,
  Clock,
  CheckCircle2,
  Stethoscope
} from 'lucide-react';

const initialMedicalForm = {
  visitDate: '',
  symptoms: '',
  diagnosis: '',
  treatment: '',
  prescription: '',
  notes: '',
};

const initialVaccineForm = {
  vaccineName: '',
  vaccinationDate: '',
  nextVaccinationDate: '',
};

const PetDetail = () => {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [activeTab, setActiveTab] = useState('medical'); // 'medical' | 'vaccine'
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Medical Modal State
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [editingMedical, setEditingMedical] = useState(null);
  const [medicalForm, setMedicalForm] = useState(initialMedicalForm);
  const [deleteMedicalId, setDeleteMedicalId] = useState(null);

  // Vaccine Modal State
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState(null);
  const [vaccineForm, setVaccineForm] = useState(initialVaccineForm);
  const [deleteVaccineId, setDeleteVaccineId] = useState(null);

  const { addToast } = useToast();

  useEffect(() => {
    fetchPetDetails();
  }, [id]);

  const fetchPetDetails = async () => {
    try {
      setLoading(true);
      const [petRes, medRes, vacRes] = await Promise.all([
        petApi.getById(id),
        medicalApi.getByPetId(id, { page: 0, size: 50 }),
        vaccinationApi.getByPetId(id, { page: 0, size: 50 }),
      ]);

      setPet(petRes.data);
      setMedicalRecords(medRes.data.content || []);
      setVaccinations(vacRes.data.content || []);
    } catch (err) {
      addToast(err.message || 'Lỗi khi tải thông tin thú cưng', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Medical Record Handlers ---
  const handleOpenAddMedical = () => {
    setEditingMedical(null);
    setMedicalForm(initialMedicalForm);
    setIsMedicalModalOpen(true);
  };

  const handleOpenEditMedical = (med) => {
    setEditingMedical(med);
    setMedicalForm({
      visitDate: med.visitDate || '',
      symptoms: med.symptoms || '',
      diagnosis: med.diagnosis || '',
      treatment: med.treatment || '',
      prescription: med.prescription || '',
      notes: med.notes || '',
    });
    setIsMedicalModalOpen(true);
  };

  const handleSaveMedical = async (e) => {
    e.preventDefault();
    try {
      if (editingMedical) {
        await medicalApi.update(editingMedical.id, medicalForm);
        addToast('Cập nhật hồ sơ y tế thành công!');
      } else {
        await medicalApi.create(id, medicalForm);
        addToast('Thêm hồ sơ y tế mới thành công!');
      }
      setIsMedicalModalOpen(false);
      const res = await medicalApi.getByPetId(id, { page: 0, size: 50 });
      setMedicalRecords(res.data.content || []);
    } catch (err) {
      addToast(err.message || 'Thao tác thất bại', 'error');
    }
  };

  const handleDeleteMedical = async () => {
    if (!deleteMedicalId) return;
    try {
      await medicalApi.delete(deleteMedicalId);
      addToast('Đã xoá hồ sơ y tế');
      setMedicalRecords((prev) => prev.filter((m) => m.id !== deleteMedicalId));
    } catch (err) {
      addToast(err.message || 'Lỗi khi xoá hồ sơ y tế', 'error');
    }
  };

  // --- Vaccination Handlers ---
  const handleOpenAddVaccine = () => {
    setEditingVaccine(null);
    setVaccineForm(initialVaccineForm);
    setIsVaccineModalOpen(true);
  };

  const handleOpenEditVaccine = (vac) => {
    setEditingVaccine(vac);
    setVaccineForm({
      vaccineName: vac.vaccineName || '',
      vaccinationDate: vac.vaccinationDate || '',
      nextVaccinationDate: vac.nextVaccinationDate || '',
    });
    setIsVaccineModalOpen(true);
  };

  const handleSaveVaccine = async (e) => {
    e.preventDefault();
    try {
      if (editingVaccine) {
        await vaccinationApi.update(editingVaccine.id, vaccineForm);
        addToast('Cập nhật lịch tiêm phòng thành công!');
      } else {
        await vaccinationApi.create(id, vaccineForm);
        addToast('Thêm lịch tiêm phòng mới thành công!');
      }
      setIsVaccineModalOpen(false);
      const res = await vaccinationApi.getByPetId(id, { page: 0, size: 50 });
      setVaccinations(res.data.content || []);
    } catch (err) {
      addToast(err.message || 'Thao tác thất bại', 'error');
    }
  };

  const handleDeleteVaccine = async () => {
    if (!deleteVaccineId) return;
    try {
      await vaccinationApi.delete(deleteVaccineId);
      addToast('Đã xoá lịch tiêm phòng');
      setVaccinations((prev) => prev.filter((v) => v.id !== deleteVaccineId));
    } catch (err) {
      addToast(err.message || 'Lỗi khi xoá lịch tiêm phòng', 'error');
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-400">Đang tải hồ sơ thú cưng...</div>;
  }

  if (!pet) {
    return (
      <div className="py-16 text-center">
        <h3 className="text-lg font-bold text-slate-700">Không tìm thấy thú cưng!</h3>
        <Link to="/pets" className="text-indigo-600 font-semibold mt-2 inline-block">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/pets"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </Link>

      {/* Pet Header Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center gap-6">
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-100 shadow-inner">
          {pet.imageUrl ? (
            <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
          ) : (
            <Dog className="w-16 h-16 text-slate-300 stroke-1" />
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{pet.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              pet.gender === 'FEMALE' ? 'bg-pink-100 text-pink-700' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {pet.gender === 'FEMALE' ? 'Giới tính: Cái' : 'Giới tính: Đực'}
            </span>
          </div>

          <p className="text-sm font-medium text-indigo-600">
            {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-500">
            {pet.dateOfBirth && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Ngày sinh: {pet.dateOfBirth}</span>
              </div>
            )}
            {pet.weight && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <Scale className="w-4 h-4 text-slate-400" />
                <span>Cân nặng: {pet.weight} kg</span>
              </div>
            )}
          </div>

          {pet.description && (
            <p className="text-xs text-slate-600 italic pt-1 max-w-2xl">"{pet.description}"</p>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('medical')}
          className={`inline-flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition ${
            activeTab === 'medical'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Hồ sơ y tế ({medicalRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vaccine')}
          className={`inline-flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition ${
            activeTab === 'vaccine'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Syringe className="w-4 h-4" />
          <span>Sổ tiêm phòng ({vaccinations.length})</span>
        </button>
      </div>

      {/* Tab 1: Medical Records */}
      {activeTab === 'medical' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Lịch sử khám chữa bệnh</h3>
            <button
              onClick={handleOpenAddMedical}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm hồ sơ khám
            </button>
          </div>

          {medicalRecords.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-100">
              <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Chưa có hồ sơ khám bệnh nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {medicalRecords.map((med) => (
                <div
                  key={med.id}
                  className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
                        Khám ngày: {med.visitDate || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 self-end sm:self-auto">
                      <button
                        onClick={() => handleOpenEditMedical(med)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteMedicalId(med.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Triệu chứng:</p>
                      <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl">{med.symptoms || 'Không có'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Chẩn đoán:</p>
                      <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl font-medium">{med.diagnosis || 'Không có'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Điều trị:</p>
                      <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl">{med.treatment || 'Không có'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Đơn thuốc:</p>
                      <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl font-mono">{med.prescription || 'Không có'}</p>
                    </div>
                  </div>

                  {med.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <span className="font-semibold text-slate-600">Ghi chú:</span> {med.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Vaccinations */}
      {activeTab === 'vaccine' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Lịch sử và kế hoạch tiêm phòng</h3>
            <button
              onClick={handleOpenAddVaccine}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm lịch tiêm
            </button>
          </div>

          {vaccinations.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-100">
              <Syringe className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Chưa có lịch tiêm phòng nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vaccinations.map((vac) => (
                <div
                  key={vac.id}
                  className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Syringe className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">{vac.vaccineName}</h4>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditVaccine(vac)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteVaccineId(vac.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Ngày tiêm:</span>
                        <span className="font-semibold text-slate-700">{vac.vaccinationDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Hẹn tiêm lần sau:</span>
                        <span className="font-semibold text-amber-600">
                          {vac.nextVaccinationDate || 'Chưa hẹn'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Add/Edit Medical Record */}
      <Modal
        isOpen={isMedicalModalOpen}
        onClose={() => setIsMedicalModalOpen(false)}
        title={editingMedical ? 'Cập nhật hồ sơ khám bệnh' : 'Thêm hồ sơ khám bệnh mới'}
      >
        <form onSubmit={handleSaveMedical} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày khám</label>
            <input
              type="date"
              value={medicalForm.visitDate}
              onChange={(e) => setMedicalForm({ ...medicalForm, visitDate: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Triệu chứng *</label>
            <textarea
              rows="2"
              value={medicalForm.symptoms}
              onChange={(e) => setMedicalForm({ ...medicalForm, symptoms: e.target.value })}
              placeholder="VD: Bỏ ăn, nôn mửa, sốt..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chẩn đoán *</label>
            <textarea
              rows="2"
              value={medicalForm.diagnosis}
              onChange={(e) => setMedicalForm({ ...medicalForm, diagnosis: e.target.value })}
              placeholder="VD: Viêm đường ruột nhẹ..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phương pháp điều trị *</label>
            <textarea
              rows="2"
              value={medicalForm.treatment}
              onChange={(e) => setMedicalForm({ ...medicalForm, treatment: e.target.value })}
              placeholder="VD: Tiêm kháng sinh, truyền dịch..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Đơn thuốc</label>
            <textarea
              rows="2"
              value={medicalForm.prescription}
              onChange={(e) => setMedicalForm({ ...medicalForm, prescription: e.target.value })}
              placeholder="VD: Thuốc A (1 viên/ngày), Men tiêu hoá..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú thêm</label>
            <input
              type="text"
              value={medicalForm.notes}
              onChange={(e) => setMedicalForm({ ...medicalForm, notes: e.target.value })}
              placeholder="Ghi chú dặn dò bác sĩ..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMedicalModalOpen(false)}
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

      {/* Modal Add/Edit Vaccine */}
      <Modal
        isOpen={isVaccineModalOpen}
        onClose={() => setIsVaccineModalOpen(false)}
        title={editingVaccine ? 'Cập nhật lịch tiêm' : 'Thêm lịch tiêm phòng mới'}
      >
        <form onSubmit={handleSaveVaccine} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Vaccine *</label>
            <input
              type="text"
              value={vaccineForm.vaccineName}
              onChange={(e) => setVaccineForm({ ...vaccineForm, vaccineName: e.target.value })}
              placeholder="VD: Vaccine 7 bệnh, Vaccine Dại..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày tiêm *</label>
              <input
                type="date"
                value={vaccineForm.vaccinationDate}
                onChange={(e) => setVaccineForm({ ...vaccineForm, vaccinationDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hẹn tiêm lần sau</label>
              <input
                type="date"
                value={vaccineForm.nextVaccinationDate}
                onChange={(e) => setVaccineForm({ ...vaccineForm, nextVaccinationDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsVaccineModalOpen(false)}
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

      {/* Delete Medical Confirm */}
      <ConfirmModal
        isOpen={!!deleteMedicalId}
        onClose={() => setDeleteMedicalId(null)}
        onConfirm={handleDeleteMedical}
        title="Xoá hồ sơ khám bệnh"
        message="Bạn có chắc chắn muốn xoá hồ sơ khám bệnh này?"
      />

      {/* Delete Vaccine Confirm */}
      <ConfirmModal
        isOpen={!!deleteVaccineId}
        onClose={() => setDeleteVaccineId(null)}
        onConfirm={handleDeleteVaccine}
        title="Xoá lịch tiêm phòng"
        message="Bạn có chắc chắn muốn xoá lịch tiêm phòng này?"
      />
    </div>
  );
};

export default PetDetail;
