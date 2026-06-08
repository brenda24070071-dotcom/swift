// frontend/src/services/authService.js
import api from './api';

export const authService = {
  register: (data)          => api.post('/auth/register', data).then(r => r.data),
  login:    (email, senha)  => api.post('/auth/login', { email, senha }).then(r => r.data),
  getMe:    ()              => api.get('/users/me').then(r => r.data),
  updateMe: (data)          => api.put('/users/me', data).then(r => r.data),
  deleteMe: ()              => api.delete('/users/me').then(r => r.data),
};
