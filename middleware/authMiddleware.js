const jwt = require('jsonwebtoken');
const User = require('../models/User');

function requireRoles(...roles) {
  return async function authorize(req, res, next) {
    const header = req.get('Authorization') || '';
    const [scheme, token] = header.split(' ');
    const secret = process.env.JWT_SECRET;

    if (!secret) return res.status(503).json({ message: 'La autenticación administrativa no está configurada.' });
    if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Inicia sesión para continuar.' });

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (error) {
      return res.status(401).json({ message: 'La sesión no es válida o ha expirado.' });
    }

    try {
      const user = await User.findOne({ email: payload.sub, isActive: true }).select('_id email name role');
      if (!user) return res.status(401).json({ message: 'La cuenta no está activa.' });
      if (!roles.includes(user.role)) return res.status(403).json({ message: 'Tu rol no permite realizar esta operación.' });
      req.admin = user;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = { requireRoles };
