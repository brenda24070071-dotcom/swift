// frontend/src/components/ui/ProductCard.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { formatBRL } from '../../utils/formatCurrency';
import { wishlistService } from '../../services/cartService';
import { useState } from 'react';

export default function ProductCard({ product, onWishlistToggle }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [wishlisting, setWishlisting] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function handleAddToCart() {
    if (!user) { window.location.href = '/login'; return; }
    setAdding(true);
    try {
      await addItem(product.id, 1);
      setFeedback('Adicionado!');
      setTimeout(() => setFeedback(''), 2000);
    } catch (err) {
      setFeedback(err.message);
      setTimeout(() => setFeedback(''), 3000);
    } finally {
      setAdding(false);
    }
  }

  async function handleWishlist() {
    if (!user) { window.location.href = '/login'; return; }
    setWishlisting(true);
    try {
      await wishlistService.toggle(product.id);
      onWishlistToggle?.();
    } finally {
      setWishlisting(false);
    }
  }

  const outOfStock = product.estoque === 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100/80 shadow-premium hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group overflow-hidden">
      
      {/* Product Image Container */}
      <div className="h-48 bg-slate-50 overflow-hidden flex items-center justify-center relative border-b border-slate-50">
        {product.imagemUrl ? (
          <img 
            src={product.imagemUrl} 
            alt={product.nome} 
            className="object-contain h-full w-full p-4 transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-300">
            <span className="text-4xl transition-transform duration-300 group-hover:scale-110">🖥️</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Sem imagem</span>
          </div>
        )}
        
        {/* Out of Stock overlay tag */}
        {outOfStock && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Product Contents */}
      <div className="p-5 flex flex-col flex-1 gap-2.5">
        <div className="flex items-center justify-between gap-2">
          {product.categoria && (
            <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-widest bg-indigo-50/50 px-2 py-0.5 rounded">
              {product.categoria.nome}
            </span>
          )}
          
          {/* Stock count indicator for admins */}
          {user?.tipoAcesso === 'ADMIN' && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              outOfStock ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              Estoque: {product.estoque}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors h-10">
          {product.nome}
        </h3>
        
        <div className="flex items-baseline justify-between mt-auto">
          <p className="text-lg font-extrabold text-slate-900">{formatBRL(product.preco)}</p>
        </div>

        {feedback && (
          <span className={`text-xs font-semibold ${feedback.includes('!') ? 'text-emerald-600' : 'text-rose-500'}`}>
            {feedback}
          </span>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-2">
          {user?.tipoAcesso === 'ADMIN' ? (
            <Link
              to={`/admin/products/${product.id}/edit`}
              className="flex-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 text-sm font-semibold py-2 rounded-xl text-center transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>✏️</span>
              <span>Editar</span>
            </Link>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={outOfStock || adding}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm shadow-indigo-100 hover:shadow-indigo-200"
            >
              {adding ? '...' : 'Adicionar'}
            </button>
          )}
          
          <button
            onClick={handleWishlist}
            disabled={wishlisting}
            className="p-2 border border-slate-200 rounded-xl hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 text-slate-400 transition-all duration-200 active:scale-95"
            title="Favoritar"
          >
            ♡
          </button>
        </div>
      </div>
    </div>
  );
}
