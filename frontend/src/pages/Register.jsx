// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useCep } from '../hooks/useCep';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: '', email: '', senha: '', cep: '',
    logradouro: '', bairro: '', cidade: '', uf: '', numero: '', complemento: '',
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError]     = useState('');

  const { fetchAddress } = useCep(
    (addr) => {
      setForm((prev) => ({
        ...prev,
        logradouro: addr.logradouro || '',
        bairro:     addr.bairro    || '',
        cidade:     addr.localidade || addr.cidade || '',
        uf:         addr.uf        || '',
      }));
      setCepError('');
    },
    (msg) => setCepError(msg)
  );

  function change(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'cep') {
      const clean = value.replace(/\D/g, '');
      if (clean.length === 8) {
        setCepLoading(true);
        fetchAddress(clean).finally(() => setCepLoading(false));
      }
    }
  }

  async function handleCepBlur(e) {
    const val = e.target.value || '';
    const clean = val.replace(/\D/g, '');
    if (clean.length === 8) {
      setCepLoading(true);
      await fetchAddress(clean);
      setCepLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register({
        nome:  form.nome,
        email: form.email,
        senha: form.senha,
        cep:   form.cep.replace(/\D/g, '') || undefined,
      });
      setSuccess('Conta criada com sucesso! Redirecionando para o login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'border border-slate-200 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 focus:bg-white w-full';
  const readOnlyClass = 'border border-slate-100 rounded-xl px-4 py-2.5 text-sm bg-slate-100/50 text-slate-500 cursor-not-allowed w-full';

  return (
    <div className="max-w-xl mx-auto mt-8 mb-20 animate-fade-in-up">
      <div className="bg-white rounded-3xl shadow-premium border border-slate-100/80 p-8 md:p-10">
        
        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-md shadow-indigo-100">
            🛒
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 mt-4 tracking-tight">Criar Conta</h1>
          <p className="text-slate-400 text-xs mt-1.5">Cadastre-se gratuitamente para começar a comprar</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl px-4 py-3.5 mb-6">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl px-4 py-3.5 mb-6">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Section 1: Personal Data */}
          <div>
            <h2 className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest mb-4">Dados Pessoais</h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome completo *</label>
                <input type="text" name="nome" data-cy="nome" value={form.nome} onChange={change}
                  placeholder="Ex: João da Silva" required className={inputClass} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">E-mail *</label>
                <input type="email" name="email" data-cy="email" value={form.email} onChange={change}
                  placeholder="exemplo@email.com" required className={inputClass} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Senha *</label>
                <input type="password" name="senha" data-cy="senha" value={form.senha} onChange={change}
                  placeholder="Mínimo 8 caracteres" required className={inputClass} />
                <span className="text-[10px] text-slate-400 leading-snug font-medium">
                  Use pelo menos: 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial (@$!%*?&)
                </span>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 my-2" />

          {/* Section 2: Address Data */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest">Endereço</h2>
              <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                Preenchimento via CEP
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {/* CEP field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CEP</label>
                <div className="flex gap-2 relative">
                  <input type="text" name="cep" data-cy="cep" value={form.cep} onChange={change}
                    onBlur={handleCepBlur} placeholder="00000-000" maxLength={9} className={inputClass} />
                  {cepLoading && (
                    <span className="absolute right-3 top-3 text-[10px] text-indigo-600 font-bold animate-pulse">
                      Buscando...
                    </span>
                  )}
                </div>
                {cepError && <span className="text-xs text-rose-500 font-medium">{cepError}</span>}
              </div>

              {/* Street & Number */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logradouro</label>
                  <input type="text" name="logradouro" value={form.logradouro} onChange={change}
                    className={readOnlyClass} readOnly placeholder="Rua / Avenida" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Número</label>
                  <input type="text" name="numero" value={form.numero} onChange={change} className={inputClass} placeholder="123" />
                </div>
              </div>

              {/* Bairro & Complement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bairro</label>
                  <input type="text" name="bairro" value={form.bairro} onChange={change}
                    className={readOnlyClass} readOnly placeholder="Bairro" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Complemento</label>
                  <input type="text" name="complemento" value={form.complemento} onChange={change} className={inputClass} placeholder="Apto, Bloco..." />
                </div>
              </div>

              {/* City & UF */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cidade</label>
                  <input type="text" name="cidade" value={form.cidade} onChange={change}
                    className={readOnlyClass} readOnly placeholder="Cidade" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">UF</label>
                  <input type="text" name="uf" value={form.uf} onChange={change}
                    maxLength={2} className={readOnlyClass} readOnly placeholder="UF" />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            data-cy="btn-register"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:from-indigo-700 hover:to-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-md shadow-indigo-100 hover:shadow-indigo-200"
          >
            {loading ? 'Criando conta...' : 'Criar Conta Grátis'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-8 font-medium">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
