import axiosClient from './axiosClient';

const medicalApi = {
  getAll: (params) => axiosClient.get('/api/medical-records', { params }),
  getByPetId: (petId, params) =>
    axiosClient.get(`/api/pets/${petId}/medical-records`, { params }),
  getById: (id) => axiosClient.get(`/api/medical-records/${id}`),
  create: (petId, data) =>
    axiosClient.post(`/api/pets/${petId}/medical-records`, data),
  update: (id, data) => axiosClient.put(`/api/medical-records/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/medical-records/${id}`),
};

export default medicalApi;
