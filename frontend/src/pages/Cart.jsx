// frontend/src/pages/Cart.jsx
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatBRL } from '../utils/formatCurrency';
import Loading from '../components/ui/Loading';

export default function Cart() {
  const { cart, loading, fetchCart, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  if (loading) return <Loading message="Carregando itens..." />;

  const { itens, total } = cart;

  return (
    <div className="max-w-3xl mx-auto mt-4 mb-20 animate-fade-in-up">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-8 tracking-tight">Meu Carrinho</h1>

      {itens.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100/80 shadow-premium">
          <p className="text-6xl mb-5 animate-bounce">🛒</p>
          <p className="font-bold text-slate-700 text-base">Seu carrinho está vazio</p>
          <p className="text-xs text-slate-400 mt-1 mb-6">Adicione alguns componentes de hardware para começar!</p>
          <Link 
            to="/" 
            className="inline-flex bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 text-xs active:scale-95 shadow-md shadow-indigo-100 hover:shadow-indigo-200"
          >
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Cart Items List */}
          <div className="flex flex-col gap-4">
            {itens.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col sm:flex-row items-center gap-4 shadow-premium hover:shadow-md transition-shadow duration-300"
              >
                {/* Product Image */}
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                  {item.produto.imagemUrl ? (
                    <img 
                      src={item.produto.imagemUrl} 
                      alt={item.produto.nome} 
                      className="object-contain h-full w-full p-2" 
                    />
                  ) : (
                    <span className="text-3xl">🖥️</span>
                  )}
                </div>
                
                {/* Title & Price */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <p className="font-bold text-slate-800 text-sm truncate">{item.produto.nome}</p>
                  <p className="text-xs text-indigo-600 font-bold mt-0.5">{formatBRL(item.produto.preco)}</p>
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold text-xs select-none">×</span>
                  <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 px-2 py-1.5 rounded-xl">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                      disabled={item.quantidade <= 1}
                      className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-200/60 disabled:opacity-30 transition-colors flex items-center justify-center font-bold text-sm"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800">{item.quantidade}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                      className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-200/60 transition-colors flex items-center justify-center font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Subtotal */}
                <div className="text-right w-28 shrink-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subtotal</p>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">
                    {formatBRL(item.produto.preco * item.quantidade)}
                  </p>
                </div>
                
                {/* Remove button */}
                <button 
                  onClick={() => removeItem(item.id)} 
                  className="w-8 h-8 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center border border-transparent hover:border-rose-100"
                  title="Remover do carrinho"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Sum Summary Block */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50/70 border border-indigo-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <div className="text-center sm:text-left">
              <p className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-widest">Resumo do Pedido</p>
              <p className="text-2xl font-extrabold text-indigo-950 mt-1">{formatBRL(total)}</p>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-indigo-100 hover:shadow-indigo-200 active:scale-95 text-sm"
            >
              Finalizar Compra
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
