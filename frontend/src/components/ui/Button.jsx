// frontend/src/components/ui/Button.jsx
export default function Button({
  children, onClick, type = 'button', variant = 'primary',
  disabled = false, className = '', loading = false, ...rest
}) {
  const base = 'font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2';
  
  const variants = {
    primary:   'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-100 hover:shadow-indigo-200 hover:shadow-lg',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
    danger:    'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 hover:border-rose-200',
    ghost:     'bg-transparent text-slate-600 hover:bg-slate-100/80',
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center gap-1.5 justify-center">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Carregando...</span>
        </span>
      ) : children}
    </button>
  );
}
