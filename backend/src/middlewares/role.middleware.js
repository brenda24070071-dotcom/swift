/**
 * Middleware de controle de acesso por papel (role).
 * Uso: router.delete('/...', authMiddleware, roleMiddleware('ADMIN'), handler)
 */
function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    if (!allowedRoles.includes(req.user.tipoAcesso)) {
      return res.status(403).json({
        error: `Acesso negado. Requer perfil: ${allowedRoles.join(' ou ')}.`,
      });
    }

    next();
  };
}

module.exports = roleMiddleware;
