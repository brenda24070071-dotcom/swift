import { createContext, useState, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from '../hooks/useAuth';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart]       = useState({ itens: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  async function addItem(idProduto, quantidade = 1) {
    await cartService.addItem(idProduto, quantidade);
    await fetchCart();
  }

  async function removeItem(id) {
    await cartService.removeItem(id);
    await fetchCart();
  }

  async function updateQuantity(id, quantidade) {
    await cartService.updateItem(id, quantidade);
    await fetchCart();
  }

  async function clearCart() {
    setCart({ itens: [], total: 0 });
  }

  const itemCount = cart.itens.reduce((acc, i) => acc + i.quantidade, 0);

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, fetchCart, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
