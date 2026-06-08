// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService, categoryService } from '../services/productService';
import ProductCard from '../components/ui/ProductCard';
import Loading from '../components/ui/Loading';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  const search   = searchParams.get('search') || '';
  const categoria = searchParams.get('categoria') || '';
  const page      = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    productService
      .list({ search, categoria, page, limit: 12 })
      .then((data) => { setProducts(data.data); setTotal(data.total); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, categoria, page]);

  function setParam(key, value) {
    const params = Object.fromEntries(searchParams.entries());
    if (value) params[key] = value;
    else delete params[key];
    params.page = '1';
    setSearchParams(params);
  }

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="animate-fade-in-up">
      {/* Banner high-tech */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl text-white p-8 md:p-12 mb-10 shadow-lg border border-indigo-950/20">
        {/* Glow decoration */}
        <div className="absolute right-0 top-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-xl">
          <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-500/15 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-500/20">
            PROJETO ACADÊMICO
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-4 mb-2 tracking-tight">Hardware & Periféricos</h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Os melhores componentes para o seu setup de alta performance. Placas de vídeo, processadores e periféricos gamers de última geração.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar de categorias */}
        <aside className="lg:w-60 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-20 shadow-premium">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 pb-2 border-b border-slate-50">Categorias</h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setParam('categoria', '')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all ${
                    !categoria 
                      ? 'bg-indigo-50 text-indigo-700 font-bold border-l-2 border-indigo-600 pl-3' 
                      : 'hover:bg-slate-50 text-slate-600 font-medium hover:text-slate-800 pl-3'
                  }`}
                >
                  Todos os Produtos
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setParam('categoria', cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between ${
                      categoria === cat.slug 
                        ? 'bg-indigo-50 text-indigo-700 font-bold border-l-2 border-indigo-600 pl-3' 
                        : 'hover:bg-slate-50 text-slate-600 font-medium hover:text-slate-800 pl-3'
                    }`}
                  >
                    <span>{cat.nome}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      categoria === cat.slug ? 'bg-indigo-200/50 text-indigo-800' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {cat._count?.produtos ?? 0}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Grid de produtos */}
        <div className="flex-1">
          {/* Resultados + busca */}
          <div className="flex items-center justify-between mb-6 bg-white rounded-xl border border-slate-100 px-5 py-3 shadow-premium">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {loading ? 'Buscando produtos...' : `${total} produto(s) encontrado(s)`}
            </p>
            {search && (
              <button
                onClick={() => setParam('search', '')}
                className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 transition-colors"
              >
                ✕ Limpar busca: "{search}"
              </button>
            )}
          </div>

          {loading && <Loading />}
          {!loading && error && <p className="text-rose-500 text-center py-8 font-medium">{error}</p>}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-premium">
              <p className="text-5xl mb-4 animate-bounce">🔍</p>
              <p className="font-semibold text-slate-700 text-base">Nenhum produto encontrado</p>
              <p className="text-xs text-slate-400 mt-1">Experimente buscar por outros termos ou limpar os filtros.</p>
            </div>
          )}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setParam('page', String(p))}
                      className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                        p === page 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
