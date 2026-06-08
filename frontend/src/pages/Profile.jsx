// frontend/src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { useCep } from '../hooks/useCep';
import { formatCEP } from '../utils/formatCurrency';
import Loading from '../components/ui/Loading';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError]     = useState('');

  const { fetchAddress } = useCep(
    (addr) => {
      setProfile((prev) => ({
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

  useEffect(() => {
    authService.getMe()
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function change(e) {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
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

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const updated = await authService.updateMe({
        nome:        profile.nome,
        cep:         profile.cep?.replace(/\D/g, '') || undefined,
        numero:      profile.numero,
        complemento: profile.complemento,
      });
      setProfile(updated);
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.')) return;
    try {
      await authService.deleteMe();
      logout();
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <Loading message="Carregando perfil..." />;
  if (!profile) return <div className="max-w-lg mx-auto py-10 text-center text-rose-500 font-bold">{error}</div>;

  const inputClass = 'border border-slate-200 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 focus:bg-white w-full';
  const readOnlyClass = 'border border-slate-100 rounded-xl px-4 py-2.5 text-sm bg-slate-100/50 text-slate-500 cursor-not-allowed w-full';

  return (
    <div className="max-w-xl mx-auto mt-4 mb-20 animate-fade-in-up">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-8 tracking-tight">Meu Perfil</h1>

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

      <div className="bg-white rounded-3xl border border-slate-100 shadow-premium p-8 md:p-10">
        
        {/* User Badge Info */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
          <div>
            <p className="text-lg font-bold text-slate-800">{profile.nome}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{profile.email}</p>
          </div>
          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
            profile.tipoAcesso === 'ADMIN'
              ? 'bg-purple-100 text-purple-700 border border-purple-200/50'
              : 'bg-indigo-100 text-indigo-700 border border-indigo-200/50'
          }`}>
            {profile.tipoAcesso}
          </span>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {/* Section: Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome Completo</label>
            <input type="text" name="nome" value={profile.nome || ''} onChange={change} className={inputClass} placeholder="Seu nome" />
          </div>

          <hr className="border-slate-50 my-2" />

          {/* Section: Address */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest">Endereço</h2>
              <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                Preenchido via CEP
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {/* CEP field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CEP</label>
                <div className="flex gap-2 relative">
                  <input type="text" name="cep" value={formatCEP(profile.cep || '')} onChange={change}
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
                  <input type="text" name="logradouro" value={profile.logradouro || ''} onChange={change}
                    className={readOnlyClass} readOnly placeholder="Logradouro" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Número</label>
                  <input type="text" name="numero" value={profile.numero || ''} onChange={change} className={inputClass} placeholder="Número" />
                </div>
              </div>

              {/* Bairro & Complement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bairro</label>
                  <input type="text" name="bairro" value={profile.bairro || ''} readOnly className={readOnlyClass} placeholder="Bairro" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Complemento</label>
                  <input type="text" name="complemento" value={profile.complemento || ''} onChange={change} className={inputClass} placeholder="Apto, Bloco..." />
                </div>
              </div>

              {/* City & UF */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cidade</label>
                  <input type="text" name="cidade" value={profile.cidade || ''} readOnly className={readOnlyClass} placeholder="Cidade" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">UF</label>
                  <input type="text" name="uf" value={profile.uf || ''} readOnly maxLength={2} className={readOnlyClass} placeholder="UF" />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-extrabold py-3.5 rounded-xl transition-all duration-300 hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-100 hover:shadow-indigo-200 active:scale-95 text-sm mt-4"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>

        <hr className="my-8 border-slate-100" />
        
        <button
          onClick={handleDeleteAccount}
          className="w-full text-xs text-rose-500 hover:text-rose-600 hover:underline transition-colors font-bold text-center"
        >
          Excluir minha conta permanentemente
        </button>
      </div>
    </div>
  );
}
