// frontend/src/components/ui/Loading.jsx
export default function Loading({ message = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
