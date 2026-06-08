/**
 * Gera um slug URL-friendly a partir de um texto.
 * Ex: "Placas de Vídeo" → "placas-de-video"
 */
function generateSlug(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Formata um valor decimal como moeda BRL.
 * Ex: 1234.5 → "R$ 1.234,50"
 */
function formatCurrencyBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Remove campos undefined/null de um objeto (útil para updates parciais).
 */
function removeNullish(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
  );
}

module.exports = { generateSlug, formatCurrencyBRL, removeNullish };
