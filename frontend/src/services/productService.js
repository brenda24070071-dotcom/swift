// frontend/src/services/productService.js
import api from './api';

export const productService = {
  list:   (params)     => api.get('/products', { params }).then(r => r.data),
  get:    (id)         => api.get(`/products/${id}`).then(r => r.data),
  create: (data)       => api.post('/products', data).then(r => r.data),
  update: (id, data)   => api.put(`/products/${id}`, data).then(r => r.data),
  remove: (id)         => api.delete(`/products/${id}`).then(r => r.data),
};

export const categoryService = {
  list:   ()           => api.get('/categories').then(r => r.data),
  get:    (id)         => api.get(`/categories/${id}`).then(r => r.data),
  create: (data)       => api.post('/categories', data).then(r => r.data),
  update: (id, data)   => api.put(`/categories/${id}`, data).then(r => r.data),
  remove: (id)         => api.delete(`/categories/${id}`).then(r => r.data),
};
