const jwt = require('jsonwebtoken');

function requireAdmin(req, res, next) {
  const header = req.get('Authorization') || '';
  const [scheme, token] = header.split(' ');
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(503).json({ message: 'La autenticación administrativa no está configurada.' });
  }
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Se requiere autenticación administrativa.' });
  }

  try {
    const payload = jwt.verify(token, secret);
    if (payload.role !== 'ADMIN') {
      return res.status(403).json({ message: 'No tienes permisos para esta operación.' });
    }
    req.admin = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'La sesión administrativa no es válida o ha expirado.' });
  }
}

module.exports = { requireAdmin };
