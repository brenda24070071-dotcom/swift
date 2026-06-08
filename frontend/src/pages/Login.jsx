// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]     = useState({ email: '', senha: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function change(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.senha);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 mb-20 animate-fade-in-up">
      <div className="bg-white rounded-3xl shadow-premium border border-slate-100/80 p-8 md:p-10">
        
        {/* Header Icon & Subtitles */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-md shadow-indigo-100">
            🛒
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 mt-4 tracking-tight">Entrar na SwiftCart</h1>
          <p className="text-slate-400 text-xs mt-1.5">Acesse sua conta para gerenciar seu setup e compras</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl px-4 py-3.5 mb-6">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">E-mail</label>
            <input
              type="email"
              name="email"
              data-cy="email"
              value={form.email}
              onChange={change}
              placeholder="seu@email.com"
              required
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 focus:bg-white"
            />
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Senha</label>
            <input
              type="password"
              name="senha"
              data-cy="senha"
              value={form.senha}
              onChange={change}
              placeholder="••••••••"
              required
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            data-cy="btn-login"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:from-indigo-700 hover:to-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-md shadow-indigo-100 hover:shadow-indigo-200"
          >
            {loading ? 'Entrando...' : 'Entrar na Conta'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-8 font-medium">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline">
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  );
}
