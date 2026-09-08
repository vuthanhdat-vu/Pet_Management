import axiosClient from './axiosClient';

const petApi = {
  getAll: (params) => axiosClient.get('/api/pets', { params }),
  getById: (id) => axiosClient.get(`/api/pets/${id}`),
  create: (data) => axiosClient.post('/api/pets', data),
  update: (id, data) => axiosClient.put(`/api/pets/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/pets/${id}`),
  uploadImage: (id, formData) =>
    axiosClient.post(`/api/pets/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default petApi;
