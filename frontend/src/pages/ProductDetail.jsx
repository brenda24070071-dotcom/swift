// frontend/src/pages/ProductDetail.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService, reviewService } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { formatBRL } from '../utils/formatCurrency';
import StarRating from '../components/ui/StarRating';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [media, setMedia]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Formulário de avaliação
  const [nota, setNota]             = useState(0);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');
  const [formOk, setFormOk]         = useState('');

  const loadReviews = useCallback(async () => {
    const data = await reviewService.listByProduct(id);
    setReviews(data.data);
    setMedia(data.media);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setError('');
    setFormOk('');
    setFormError('');
    Promise.all([productService.get(id), reviewService.listByProduct(id)])
      .then(([prod, revs]) => {
        setProduct(prod);
        setReviews(revs.data);
        setMedia(revs.media);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const minhaAvaliacao = reviews.find((r) => r.usuario?.id === user?.id);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setFormOk('');
    if (nota < 1) { setFormError('Selecione uma nota de 1 a 5 estrelas.'); return; }

    setSubmitting(true);
    try {
      await reviewService.create(id, { nota, comentario });
      setFormOk('Avaliação enviada com sucesso!');
      setNota(0);
      setComentario('');
      await loadReviews();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(reviewId) {
    await reviewService.remove(reviewId);
    await loadReviews();
  }

  async function handleAddToCart() {
    if (!user) { window.location.href = '/login'; return; }
    await addItem(product.id, 1);
  }

  if (loading) return <Loading />;
  if (error) return <p className="text-rose-500 text-center py-10 font-medium">{error}</p>;
  if (!product) return null;

  return (
    <div className="animate-fade-in-up max-w-4xl mx-auto">
      <Link to="/" className="text-xs text-indigo-600 hover:underline">← Voltar ao catálogo</Link>

      {/* ── Cabeçalho do produto ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-6 mt-3 flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-56 h-56 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
          {product.imagemUrl
            ? <img src={product.imagemUrl} alt={product.nome} className="object-contain h-full w-full p-3" />
            : <span className="text-5xl text-slate-300">🖥️</span>}
        </div>

        <div className="flex-1 flex flex-col gap-2">
          {product.categoria && (
            <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-widest">
              {product.categoria.nome}
            </span>
          )}
          <h1 className="text-2xl font-extrabold text-slate-900">{product.nome}</h1>

          <div className="flex items-center gap-2" data-cy="product-rating">
            <StarRating value={Math.round(media)} />
            <span className="text-xs text-slate-500 font-medium">
              {media > 0 ? `${media.toFixed(1)} · ${reviews.length} avaliação(ões)` : 'Sem avaliações'}
            </span>
          </div>

          {product.descricao && <p className="text-sm text-slate-600 leading-relaxed">{product.descricao}</p>}

          <p className="text-2xl font-extrabold text-slate-900 mt-2">{formatBRL(product.preco)}</p>

          {user?.tipoAcesso !== 'ADMIN' && (
            <Button onClick={handleAddToCart} disabled={product.estoque === 0} className="w-fit mt-1">
              {product.estoque === 0 ? 'Esgotado' : 'Adicionar ao carrinho'}
            </Button>
          )}
        </div>
      </div>

      {/* ── Avaliações ── */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Avaliações de clientes</h2>

        {formOk && (
          <p data-cy="review-success" className="text-xs text-emerald-600 font-medium mb-4 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
            {formOk}
          </p>
        )}

        {/* Formulário (apenas logado e que ainda não avaliou) */}
        {user && !minhaAvaliacao && (
          <form
            onSubmit={handleSubmit}
            data-cy="review-form"
            className="bg-white rounded-2xl border border-slate-100 shadow-premium p-5 mb-6 flex flex-col gap-3"
          >
            <p className="font-semibold text-slate-700 text-sm">Deixe sua avaliação</p>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">Sua nota:</span>
              <StarRating value={nota} editable onChange={setNota} size="lg" />
            </div>

            <textarea
              data-cy="review-comment"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Conte como foi sua experiência (opcional)"
              maxLength={1000}
              rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />

            {formError && <p data-cy="review-error" className="text-xs text-rose-500 font-medium">{formError}</p>}

            <Button type="submit" loading={submitting} className="w-fit" data-cy="review-submit">
              Enviar avaliação
            </Button>
          </form>
        )}

        {user && minhaAvaliacao && (
          <p className="text-xs text-slate-500 mb-4 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
            Você já avaliou este produto. Pode excluir sua avaliação abaixo para enviar uma nova.
          </p>
        )}
        {!user && (
          <p className="text-xs text-slate-500 mb-4">
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Entre</Link> para avaliar este produto.
          </p>
        )}

        {/* Lista de avaliações */}
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">Ainda não há avaliações. Seja o primeiro!</p>
        ) : (
          <ul className="flex flex-col gap-3" data-cy="review-list">
            {reviews.map((r) => (
              <li key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-premium p-4" data-cy="review-item">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{r.usuario?.nome || 'Cliente'}</p>
                    <StarRating value={r.nota} size="sm" />
                  </div>
                  {(r.usuario?.id === user?.id || user?.tipoAcesso === 'ADMIN') && (
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
                      data-cy="review-delete"
                      title="Excluir avaliação"
                    >
                      ✕ Excluir
                    </button>
                  )}
                </div>
                {r.comentario && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.comentario}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
