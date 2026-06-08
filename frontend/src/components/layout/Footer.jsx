// frontend/src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm mt-20 border-t border-slate-900">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-slate-900">
          
          {/* Logo & Description */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="text-2xl">🛒</span> SwiftCart
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Plataforma premium especializada em hardware de alto desempenho e periféricos para o setup dos seus sonhos.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Links Rápidos</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Catálogo de Produtos</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">Carrinho de Compras</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">Meus Favoritos</Link>
              </li>
            </ul>
          </div>

          {/* Academic disclaimer / project info */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Projeto Acadêmico</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Desenvolvimento de Plataforma Web Completa — Sprint 1, Entrega 1.
              Persistência local em banco de dados SQLite com integração à API ViaCEP.
            </p>
          </div>
        </div>

        {/* Bottom copyright section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© 2026 SwiftCart. Licença MIT.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Termos de Uso</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacidade</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
