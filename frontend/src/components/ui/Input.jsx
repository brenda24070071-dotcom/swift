// frontend/src/components/ui/Input.jsx
export default function Input({ label, error, id, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full border rounded-xl px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-4
          ${error 
            ? 'border-rose-300 bg-rose-50/30 focus:ring-rose-500/10 focus:border-rose-500' 
            : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-indigo-500/10 focus:border-indigo-500'
          } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-500 font-medium mt-0.5">{error}</span>}
    </div>
  );
}
