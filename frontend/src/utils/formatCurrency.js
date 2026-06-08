// frontend/src/utils/formatCurrency.js
export function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatCEP(cep) {
  return cep?.replace(/(\d{5})(\d{3})/, '$1-$2') || '';
}
