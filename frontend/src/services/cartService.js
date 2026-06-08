// frontend/src/services/cartService.js
import api from './api';

export const cartService = {
  getCart:    ()                       => api.get('/cart').then(r => r.data),
  addItem:    (idProduto, quantidade)  => api.post('/cart', { idProduto, quantidade }).then(r => r.data),
  updateItem: (id, quantidade)         => api.put(`/cart/${id}`, { quantidade }).then(r => r.data),
  removeItem: (id)                     => api.delete(`/cart/${id}`).then(r => r.data),
  checkout:   ()                       => api.post('/cart/checkout').then(r => r.data),
};

export const wishlistService = {
  getWishlist: ()           => api.get('/wishlist').then(r => r.data),
  toggle:      (idProduto)  => api.post('/wishlist', { idProduto }).then(r => r.data),
  remove:      (id)         => api.delete(`/wishlist/${id}`).then(r => r.data),
};
