require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/proyecto_final_db';

// Middlewares base y configuracion CORS
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Enrutamiento modular de la API
app.use('/api/auth', authRoutes);
app.use('/api/productos', productRoutes);

// Manejador catch-all para 404 en API y fallback de SPA (Tarjeta 404 y React Router)
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint no encontrado en la API' });
  }
  return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware global de manejo de errores (4 parametros)
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error('Error capturado por middleware:', err.stack || err.message);
  const statusCode = err.status || 500;
  return res.status(statusCode).json({
    error: err.message || 'Error interno del servidor',
    status: statusCode
  });
});

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  mongoose.connect(MONGO_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.log('Aviso MongoDB: Modo offline (' + err.message + ')'));
}

module.exports = { app, server };
