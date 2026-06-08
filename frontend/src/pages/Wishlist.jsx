// frontend/src/pages/Wishlist.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistService } from '../services/cartService';
import { useCart } from '../hooks/useCart';
import { formatBRL } from '../utils/formatCurrency';
import Loading from '../components/ui/Loading';

export default function Wishlist() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const { addItem } = useCart();

  async function load() {
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleRemove(id) {
    await wishlistService.remove(id);
    load();
  }

  async function handleAddToCart(idProduto, itemId) {
    await addItem(idProduto, 1);
    await handleRemove(itemId);
  }

  if (loading) return <Loading message="Carregando seus favoritos..." />;

  return (
    <div className="max-w-3xl mx-auto mt-4 mb-20 animate-fade-in-up">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-8 tracking-tight">♡ Meus Favoritos</h1>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl px-4 py-3.5 mb-6">
          ⚠️ {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100/80 shadow-premium">
          <p className="text-6xl mb-5 animate-bounce">♡</p>
          <p className="font-bold text-slate-700 text-base">Você não tem favoritos cadastrados</p>
          <p className="text-xs text-slate-400 mt-1 mb-6">Navegue na loja e adicione produtos aos favoritos clicando no coração!</p>
          <Link 
            to="/" 
            className="inline-flex bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 text-xs active:scale-95 shadow-md shadow-indigo-100 hover:shadow-indigo-200"
          >
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col sm:flex-row items-center gap-4 shadow-premium hover:shadow-md transition-shadow duration-300 animate-fade-in-up"
            >
              {/* Product Thumbnail */}
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                {item.produto.imagemUrl ? (
                  <img 
                    src={item.produto.imagemUrl} 
                    alt={item.produto.nome} 
                    className="object-contain h-full w-full p-2" 
                  />
                ) : (
                  <span className="text-2xl">🖥️</span>
                )}
              </div>
              
              {/* Text Meta info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <p className="font-bold text-slate-800 text-sm truncate">{item.produto.nome}</p>
                  {item.produto.categoria && (
                    <span className="text-[9px] text-indigo-600 font-extrabold uppercase bg-indigo-50/50 px-1.5 py-0.5 rounded w-max mx-auto sm:mx-0">
                      {item.produto.categoria.nome}
                    </span>
                  )}
                </div>
                <p className="text-indigo-600 font-extrabold text-sm mt-1">{formatBRL(item.produto.preco)}</p>
              </div>
              
              {/* Add & Trash Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleAddToCart(item.produto.id, item.id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm shadow-indigo-100 hover:shadow-indigo-200 active:scale-95"
                >
                  Mover para o carrinho
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="w-9 h-9 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center border border-transparent hover:border-rose-100"
                  title="Remover dos favoritos"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
