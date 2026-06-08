/**
 * Middleware global de tratamento de erros.
 * Compatível com Prisma + SQLite.
 */
function errorMiddleware(err, req, res, _next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Erros de validação Joi
  if (err.isJoi) {
    return res.status(400).json({ error: err.details[0].message });
  }

  // Erros do Prisma — unicidade violada (SQLite: P2002)
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'campo';
    return res.status(409).json({ error: `Já existe um registro com esse ${field}.` });
  }

  // Erros do Prisma — registro não encontrado
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Registro não encontrado.' });
  }

  // Erros do Prisma — chave estrangeira (SQLite: P2003)
  if (err.code === 'P2003') {
    return res.status(409).json({ error: 'Operação viola integridade referencial.' });
  }

  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor.';
  res.status(status).json({ error: message });
}

module.exports = errorMiddleware;
