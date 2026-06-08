// frontend/src/pages/CategoryForm.jsx
import { useState, useEffect } from 'react';
import { categoryService } from '../services/productService';

export default function CategoryForm() {
  const [categories, setCategories] = useState([]);
  const [form, setForm]     = useState({ nome: '', slug: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await categoryService.list();
    setCategories(data);
  }

  useEffect(() => { load(); }, []);

  function change(e) { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); }

  function startEdit(cat) {
    setEditId(cat.id);
    setForm({ nome: cat.nome, slug: cat.slug });
  }

  function cancelEdit() {
    setEditId(null);
    setForm({ nome: '', slug: '' });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);
    try {
      const payload = {
        nome: form.nome,
        slug: form.slug || undefined,
      };
      if (editId) {
        await categoryService.update(editId, payload);
        setSuccess('Categoria atualizada com sucesso!');
      } else {
        await categoryService.create(payload);
        setSuccess('Categoria criada com sucesso!');
      }
      cancelEdit();
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover esta categoria?')) return;
    try {
      await categoryService.remove(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const inputClass = 'border border-slate-200 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 focus:bg-white w-full';

  return (
    <div className="max-w-2xl mx-auto mt-4 mb-20 animate-fade-in-up">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-8 tracking-tight">⚙️ Gerenciar Categorias</h1>

      {error   && <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl px-4 py-3.5 mb-6">⚠️ {error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl px-4 py-3.5 mb-6">✅ {success}</div>}

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-premium p-6 md:p-8 mb-8">
        <h2 className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest mb-4">
          {editId ? '✏️ Editar Categoria' : '📂 Nova Categoria'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome *</label>
            <input type="text" name="nome" value={form.nome} onChange={change} required className={inputClass} placeholder="Ex: Hardwares" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug</label>
            <input type="text" name="slug" value={form.slug} onChange={change}
              placeholder="gerado automaticamente do nome" className={inputClass} />
          </div>
          
          <div className="flex gap-3 mt-2">
            {editId && (
              <button 
                type="button" 
                onClick={cancelEdit}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 active:scale-95 text-xs shadow-sm"
              >
                Cancelar
              </button>
            )}
            <button 
              type="submit" 
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-2.5 rounded-xl transition-all duration-300 hover:from-indigo-700 hover:to-blue-700 active:scale-95 disabled:opacity-50 text-xs shadow-md shadow-indigo-100 hover:shadow-indigo-200"
            >
              {saving ? 'Salvando...' : editId ? 'Salvar Alterações' : 'Criar Categoria'}
            </button>
          </div>
        </form>
      </div>

      {/* Listing Grid */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4 text-center">Produtos</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{cat.nome}</td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">{cat.slug}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                      {cat._count?.produtos ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex gap-3 justify-end">
                    <button 
                      onClick={() => startEdit(cat)}
                      className="text-indigo-600 hover:text-indigo-700 hover:underline font-bold transition-colors"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="text-rose-500 hover:text-rose-600 hover:underline font-bold transition-colors"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {categories.length === 0 && (
          <p className="text-center text-slate-400 py-10 text-xs font-medium">Nenhuma categoria cadastrada.</p>
        )}
      </div>
    </div>
  );
}
