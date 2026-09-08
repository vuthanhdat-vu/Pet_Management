import axiosClient from './axiosClient';

const userApi = {
  getAll: (params) => axiosClient.get('/api/users', { params }),
  getById: (id) => axiosClient.get(`/api/users/${id}`),
  update: (id, data) => axiosClient.put(`/api/users/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/users/${id}`),
  changePassword: (data) => axiosClient.post('/api/users/change-password', data),
  uploadAvatar: (id, formData) =>
    axiosClient.post(`/api/users/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default userApi;
