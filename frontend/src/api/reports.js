import api from './axios';

export const getReports = (params) =>
  api.get('/reports', { params });

export const resolveReport = (id) =>
  api.put(`/reports/${id}/resolve`);

export const deleteResourceAdmin = (id) =>
  api.delete(`/admin/resources/${id}`);

export const deletePostAdmin = (id) =>
  api.delete(`/admin/posts/${id}`);
