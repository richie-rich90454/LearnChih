import api from './axios';

export const getResourcePosts = (resourceId) =>
  api.get(`/resources/${resourceId}/posts`);

export const createResourcePost = (resourceId, content) =>
  api.post(`/resources/${resourceId}/posts`, { content });
