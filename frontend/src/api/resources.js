import api from './axios';

export const getResources = (params) =>
  api.get('/resources', { params });

export const getResource = (id) =>
  api.get(`/resources/${id}`);

export const createResource = (data) => {
  // If we have a file, use FormData
  if (data.file) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        formData.append(key, val);
      }
    });
    return api.post('/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.post('/resources', data);
};

export const deleteResource = (id) =>
  api.delete(`/resources/${id}`);

export const toggleUpvote = (id) =>
  api.post(`/resources/${id}/upvote`);

export const getLeaderboard = () =>
  api.get('/resources/leaderboard');

export const reportResource = (id, reason) =>
  api.post(`/resources/${id}/report`, { reason });
