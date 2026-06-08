// frontend/src/components/layout/Header.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  function handleLogout() {
    setDropdownOpen(false);
    logout();
    navigate('/');
  }

  return (
    <header className="glass-header sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between gap-4">

        {/* Logo with high-tech gradient */}
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl shrink-0 group">
          <span className="text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">🛒</span>
          <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent font-extrabold tracking-tight">
            SwiftCart
          </span>
        </Link>

        {/* Quick search form with smooth focus ring */}
        <form
          onSubmit={(e) => { e.preventDefault(); navigate(`/?search=${e.target.q.value}`); }}
          className="flex-1 max-w-md hidden sm:flex relative"
        >
          <input
            name="q"
            placeholder="Buscar produtos..."
            className="w-full border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 focus:bg-white"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-600 hover:text-white transition-colors"
          >
            🔍
          </button>
        </form>

        {/* Nav list */}
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          {user ? (
            <>
              {/* Wishlist Link */}
              <Link 
                to="/wishlist" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-indigo-600 transition-all duration-200 hidden sm:flex"
              >
                <span className="text-base">♡</span>
                <span>Favoritos</span>
              </Link>
              
              {/* Cart Link with absolute status badge */}
              <Link
                to="/cart"
                className="relative flex items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-indigo-600 transition-all duration-200"
              >
                <span className="text-lg">🛒</span>
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-extrabold border-2 border-white animate-pulse-glow">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
              
              {/* User Dropdown */}
              <div className="relative group">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-50/50 border border-indigo-100/35 text-indigo-700 font-semibold hover:bg-indigo-50 transition-colors"
                >
                  {user.nome.split(' ')[0]} ▾
                </button>
                <div className={`absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 ${dropdownOpen ? 'block' : 'hidden group-hover:block'}`}>
                  <div className="px-4 py-2 border-b border-slate-50">
                    <p className="font-semibold text-slate-800 text-xs truncate">{user.nome}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                  </div>
                  
                  <Link 
                    to="/profile" 
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Meu Perfil
                  </Link>
                  
                  {user.tipoAcesso === 'ADMIN' && (
                    <>
                      <div className="px-4 py-1 text-[10px] font-bold text-indigo-500 uppercase tracking-wider mt-1 border-t border-slate-50 pt-2">
                        Administração
                      </div>
                      <Link 
                        to="/admin/products" 
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        📦 Cadastrar Produto
                      </Link>
                      <Link 
                        to="/admin/categories" 
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        ⚙️ Categorias
                      </Link>
                    </>
                  )}
                  <hr className="my-1.5 border-slate-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-xs text-rose-500 hover:bg-rose-50 font-semibold transition-colors"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100/50 rounded-xl transition-all duration-200"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4.5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all duration-200"
              >
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
