// frontend/src/pages/Checkout.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { cartService } from '../services/cartService';
import { formatBRL } from '../utils/formatCurrency';
import Loading from '../components/ui/Loading';

export default function Checkout() {
  const { cart, loading, fetchCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [placing, setPlacing]   = useState(false);
  const [success, setSuccess]   = useState(null);
  const [error, setError]       = useState('');

  useEffect(() => { fetchCart(); }, []);

  async function handleCheckout() {
    setError('');
    setPlacing(true);
    try {
      const result = await cartService.checkout();
      await clearCart();
      setSuccess(result.pedido);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (loading) return <Loading message="Carregando resumo do pedido..." />;

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 mb-20 text-center animate-fade-in-up">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-premium p-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm border border-emerald-100 animate-pulse-glow">
            ✓
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">Pedido Realizado!</h1>
          <p className="text-slate-400 text-xs mb-1">
            Pedido <span className="font-bold text-slate-700">#{success.id}</span> criado com sucesso.
          </p>
          <p className="text-2xl font-extrabold text-indigo-600 mb-6 mt-2">{formatBRL(success.total)}</p>
          
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left w-full mb-8 text-xs text-slate-500 leading-relaxed">
            📦 <strong>E-mail enviado:</strong> Um e-mail de confirmação fictício foi disparado com o resumo da compra (simulação de projeto acadêmico).
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-100 hover:shadow-indigo-200 active:scale-95 text-sm"
          >
            Continuar Comprando
          </button>
        </div>
      </div>
    );
  }

  const { itens, total } = cart;

  return (
    <div className="max-w-2xl mx-auto mt-4 mb-20 animate-fade-in-up">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-8 tracking-tight">Finalizar Compra</h1>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl px-4 py-3.5 mb-6">
          ⚠️ {error}
        </div>
      )}

      {itens.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100/80 shadow-premium">
          <p className="text-5xl mb-3">🛒</p>
          <p className="font-bold text-slate-700 text-base">Seu carrinho está vazio</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-6 md:p-8">
            <h2 className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest mb-4">Resumo dos Itens</h2>
            
            <div className="flex flex-col gap-4">
              {itens.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-700 truncate">{item.produto.nome}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Qtd: {item.quantidade}</p>
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 shrink-0">
                    {formatBRL(item.produto.preco * item.quantidade)}
                  </span>
                </div>
              ))}
            </div>
            
            <hr className="my-6 border-slate-100" />
            
            <div className="flex justify-between items-baseline font-bold text-lg text-slate-800">
              <span className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Total Geral</span>
              <span className="text-2xl font-extrabold text-indigo-600">{formatBRL(total)}</span>
            </div>
          </div>

          {/* Academic environment warning */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-2.5 leading-relaxed">
            <span className="text-lg">⚠️</span>
            <div>
              <strong>Ambiente de Simulação Acadêmica:</strong> Esta etapa é totalmente simulada. Nenhuma cobrança financeira real ou envio físico será realizado.
            </div>
          </div>

          {/* Confirm Button */}
          <button
            data-cy="btn-checkout"
            onClick={handleCheckout}
            disabled={placing}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-extrabold py-4 rounded-xl transition-all duration-300 hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-100 hover:shadow-indigo-200 active:scale-95 text-base"
          >
            {placing ? 'Finalizando...' : 'Confirmar e Finalizar Pedido'}
          </button>
        </div>
      )}
    </div>
  );
}
