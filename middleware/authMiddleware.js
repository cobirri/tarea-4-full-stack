const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro_proyecto_final', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalido o expirado. Inicia sesion nuevamente.' });
    }
    req.user = decoded;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido. Se requieren permisos de administrador.' });
  }
  next();
};

module.exports = { verifyToken, requireAdmin };
