import axiosClient from './axiosClient';

const vaccinationApi = {
  getAll: (params) => axiosClient.get('/api/vaccinations', { params }),
  getByPetId: (petId, params) =>
    axiosClient.get(`/api/pets/${petId}/vaccinations`, { params }),
  getById: (id) => axiosClient.get(`/api/vaccinations/${id}`),
  create: (petId, data) =>
    axiosClient.post(`/api/pets/${petId}/vaccinations`, data),
  update: (id, data) => axiosClient.put(`/api/vaccinations/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/vaccinations/${id}`),
};

export default vaccinationApi;
