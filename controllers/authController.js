const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Almacen en memoria defensivo si la base de datos externa no esta conectada
const memoriaUsuarios = [];

exports.register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contrasena requeridos' });
    }

    const existe = memoriaUsuarios.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existe) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'user';
    const nuevoUsuario = {
      _id: 'usr_' + Date.now(),
      username,
      password: hashedPassword,
      role: userRole
    };

    memoriaUsuarios.push(nuevoUsuario);
    return res.status(201).json({ message: 'Usuario registrado exitosamente', role: userRole });
  } catch (error) {
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contrasena requeridos' });
    }

    const user = memoriaUsuarios.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      return res.status(400).json({ error: 'Credenciales invalidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenciales invalidas' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secreto_super_seguro_proyecto_final',
      { expiresIn: '4h' }
    );

    return res.json({ token, role: user.role, username: user.username, message: 'Autenticacion exitosa' });
  } catch (error) {
    return next(error);
  }
};
