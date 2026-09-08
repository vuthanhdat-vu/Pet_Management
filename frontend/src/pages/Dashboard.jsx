import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import petApi from '../api/petApi';
import medicalApi from '../api/medicalApi';
import vaccinationApi from '../api/vaccinationApi';
import { useAuth } from '../context/AuthContext';
import { 
  Dog, 
  FileText, 
  Syringe, 
  Plus, 
  Calendar, 
  ArrowUpRight,
  Clock,
  Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    petsCount: 0,
    medicalCount: 0,
    vaccineCount: 0,
  });
  const [recentPets, setRecentPets] = useState([]);
  const [recentVaccinations, setRecentVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [petsRes, medicalRes, vaccineRes] = await Promise.allSettled([
        petApi.getAll({ page: 0, size: 5 }),
        medicalApi.getAll({ page: 0, size: 5 }),
        vaccinationApi.getAll({ page: 0, size: 5 }),
      ]);

      const petsData = petsRes.status === 'fulfilled' ? petsRes.value.data : null;
      const medicalData = medicalRes.status === 'fulfilled' ? medicalRes.value.data : null;
      const vaccineData = vaccineRes.status === 'fulfilled' ? vaccineRes.value.data : null;

      setStats({
        petsCount: petsData?.totalElements || 0,
        medicalCount: medicalData?.totalElements || 0,
        vaccineCount: vaccineData?.totalElements || 0,
      });

      if (petsData?.content) {
        setRecentPets(petsData.content);
      }
      if (vaccineData?.content) {
        setRecentVaccinations(vaccineData.content);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-indigo-100 mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hệ thống Quản lý Thú cưng Chuyên nghiệp</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xin chào, {user?.username}! 🐾
          </h1>
          <p className="mt-2 text-sm sm:text-base text-indigo-100/90 leading-relaxed">
            Dễ dàng theo dõi sức khoẻ, lịch tiêm phòng và lịch sử khám chữa bệnh cho những người bạn bốn chân của bạn.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/pets"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-600 font-semibold text-sm rounded-xl shadow-md hover:bg-indigo-50 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Thú Cưng</span>
            </Link>
            <Link
              to="/vaccinations"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-xl backdrop-blur-md border border-white/10 transition"
            >
              <Calendar className="w-4 h-4" />
              <span>Xem Lịch Tiêm</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Dog className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Tổng Thú Cưng</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{stats.petsCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Hồ Sơ Y Tế</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{stats.medicalCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Syringe className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Lịch Tiêm Chủng</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{stats.vaccineCount}</h3>
          </div>
        </div>
      </div>

      {/* Two columns: Recent Pets & Upcoming Vaccinations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Pets */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Thú cưng gần đây</h2>
              <p className="text-xs text-slate-400">Danh sách các bé mới cập nhật</p>
            </div>
            <Link
              to="/pets"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Đang tải dữ liệu...</div>
          ) : recentPets.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">Chưa có thú cưng nào.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentPets.map((pet) => (
                <div key={pet.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {pet.imageUrl ? (
                        <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        <Dog className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{pet.name}</h4>
                      <p className="text-xs text-slate-400">
                        {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/pets/${pet.id}`}
                    className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                  >
                    Chi tiết
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Vaccinations */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Lịch tiêm phòng mới</h2>
              <p className="text-xs text-slate-400">Theo dõi ngày tiêm và ngày hẹn kế tiếp</p>
            </div>
            <Link
              to="/vaccinations"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Đang tải dữ liệu...</div>
          ) : recentVaccinations.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">Chưa có lịch tiêm nào.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentVaccinations.map((vac) => (
                <div key={vac.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Syringe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{vac.vaccineName}</h4>
                      <p className="text-xs text-slate-400">Ngày tiêm: {vac.vaccinationDate}</p>
                    </div>
                  </div>
                  {vac.nextVaccinationDate && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                      <Clock className="w-3 h-3" /> Hẹn: {vac.nextVaccinationDate}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
