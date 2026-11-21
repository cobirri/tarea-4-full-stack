const request = require('supertest');
const { app } = require('../server');

describe('Pruebas del Proyecto Final - API y Seguridad', () => {

  test('Debe bloquear peticiones a productos si no se envia token JWT (401)', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('Debe responder con error 400 si faltan credenciales en el login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Debe responder con 404 estructurado al consultar ruta no existente de la API', async () => {
    const res = await request(app).get('/api/ruta-inexistente-segura');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

});
