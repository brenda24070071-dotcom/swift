// frontend/src/pages/ProductForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService, categoryService } from '../services/productService';
import Loading from '../components/ui/Loading';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    nome: '', descricao: '', preco: '', estoque: '', imagemUrl: '', idCategoria: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(isEdit);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
    if (isEdit) {
      productService.get(id)
        .then((p) => setForm({
          nome:        p.nome        || '',
          descricao:   p.descricao   || '',
          preco:       p.preco       || '',
          estoque:     p.estoque     || 0,
          imagemUrl:   p.imagemUrl   || '',
          idCategoria: p.idCategoria || '',
        }))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  function change(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        preco:       parseFloat(form.preco),
        estoque:     parseInt(form.estoque),
        idCategoria: form.idCategoria ? parseInt(form.idCategoria) : null,
        imagemUrl:   form.imagemUrl || null,
      };

      if (isEdit) {
        await productService.update(id, payload);
      } else {
        await productService.create(payload);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Excluir este produto?')) return;
    await productService.remove(id);
    navigate('/');
  }

  if (loading) return <Loading message="Carregando detalhes do produto..." />;

  const inputClass = 'border border-slate-200 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 focus:bg-white w-full';

  return (
    <div className="max-w-2xl mx-auto mt-4 mb-20 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          {isEdit ? '✏️ Editar Produto' : '📦 Novo Produto'}
        </h1>
        {isEdit && (
          <button 
            onClick={handleDelete} 
            className="text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 border border-rose-100 px-3.5 py-2 rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
          >
            Excluir Produto
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl px-4 py-3.5 mb-6">
          ⚠️ {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-premium p-8 md:p-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Product Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome do produto *</label>
            <input type="text" name="nome" value={form.nome} onChange={change} required className={inputClass} placeholder="Ex: Monitor Gamer 24\" />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</label>
            <textarea name="descricao" value={form.descricao} onChange={change} rows={3} className={inputClass} placeholder="Detalhes técnicos, diferenciais..." />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preço (R$) *</label>
              <input type="number" name="preco" value={form.preco} onChange={change}
                step="0.01" min="0.01" required className={inputClass} placeholder="0.00" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estoque *</label>
              <input type="number" name="estoque" value={form.estoque} onChange={change}
                min="0" step="1" required className={inputClass} placeholder="0" />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</label>
            <select name="idCategoria" value={form.idCategoria} onChange={change} className={inputClass}>
              <option value="">— Sem categoria —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">URL da imagem</label>
            <input type="url" name="imagemUrl" value={form.imagemUrl} onChange={change}
              placeholder="https://..." className={inputClass} />
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3.5 rounded-xl hover:bg-slate-50 transition-all duration-200 active:scale-95 text-xs shadow-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:from-indigo-700 hover:to-blue-700 active:scale-95 disabled:opacity-50 shadow-md shadow-indigo-100 hover:shadow-indigo-200 text-xs"
            >
              {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
