// frontend/src/components/ui/StarRating.jsx
import { useState } from 'react';

/**
 * Componente de avaliação por estrelas.
 *
 * - Modo leitura (padrão): exibe `value` estrelas preenchidas.
 * - Modo interativo (`editable`): permite selecionar de 1 a 5 via clique/teclado,
 *   chamando `onChange(nota)`.
 *
 * @param {number} value     Nota atual (0–5).
 * @param {boolean} editable  Habilita seleção.
 * @param {(n:number)=>void} onChange  Callback ao selecionar.
 * @param {'sm'|'md'|'lg'} size  Tamanho visual.
 */
export default function StarRating({ value = 0, editable = false, onChange, size = 'md' }) {
  const [hover, setHover] = useState(0);

  const sizes = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' };
  const display = hover || value;

  return (
    <div className="flex items-center gap-0.5" role={editable ? 'radiogroup' : 'img'}
         aria-label={`Avaliação: ${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= display;
        const common = `${sizes[size]} leading-none transition-colors ${filled ? 'text-amber-400' : 'text-slate-300'}`;

        if (!editable) {
          return <span key={star} className={common} aria-hidden="true">★</span>;
        }

        return (
          <button
            key={star}
            type="button"
            data-cy={`star-${star}`}
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
            className={`${common} cursor-pointer hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-300 rounded`}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange?.(star)}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
