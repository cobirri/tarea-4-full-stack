const axios = require('axios');

// Almacen inicial de productos con soporte para paginacion y filtros
let memoriaProductos = [
  { _id: 'prod_1', nombre: 'Sensor de Presion Digital', precio: 850, descripcion: 'Sensor de precision para inyeccion', categoria: 'Sensores', stock: 15 },
  { _id: 'prod_2', nombre: 'Valvula de Alivio 1/2 pulg', precio: 420, descripcion: 'Acero inoxidable grado industrial', categoria: 'Valvulas', stock: 30 },
  { _id: 'prod_3', nombre: 'Manometro Hidraulico', precio: 680, descripcion: 'Rango de 0 a 100 PSI', categoria: 'Instrumentacion', stock: 12 },
  { _id: 'prod_4', nombre: 'Termopar Tipo K', precio: 310, descripcion: 'Sensor de temperatura de alta respuesta', categoria: 'Sensores', stock: 25 },
  { _id: 'prod_5', nombre: 'Filtro Regulador de Aire', precio: 950, descripcion: 'Unidad de mantenimiento neumatica', categoria: 'Neumatica', stock: 8 }
];

const obtenerTipoCambio = async () => {
  try {
    const respuesta = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 3000 });
    return (respuesta.data && respuesta.data.rates && respuesta.data.rates.MXN) ? respuesta.data.rates.MXN : 18.50;
  } catch (error) {
    return 18.50;
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    let filtrados = [...memoriaProductos];
    if (req.query.busqueda) {
      const b = req.query.busqueda.toLowerCase();
      filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(b));
    }

    const total = filtrados.length;
    const paginados = filtrados.slice(skip, skip + limit);
    const tipoCambio = await obtenerTipoCambio();

    const data = paginados.map(p => ({
      ...p,
      precioMXN: p.precio,
      precioUSD: Number((p.precio / tipoCambio).toFixed(2))
    }));

    return res.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      },
      tipoCambioUSD_MXN: tipoCambio
    });
  } catch (error) {
    return next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const producto = memoriaProductos.find(p => p._id === req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    return res.json(producto);
  } catch (error) {
    return next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { nombre, precio, descripcion, categoria, stock } = req.body;
    if (!nombre || precio === undefined) {
      return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
    }
    const nuevo = {
      _id: 'prod_' + Date.now(),
      nombre,
      precio: Number(precio),
      descripcion: descripcion || '',
      categoria: categoria || 'General',
      stock: Number(stock) || 0
    };
    memoriaProductos.unshift(nuevo);
    return res.status(201).json({ message: 'Producto creado exitosamente', producto: nuevo });
  } catch (error) {
    return next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const index = memoriaProductos.findIndex(p => p._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    memoriaProductos[index] = { ...memoriaProductos[index], ...req.body };
    return res.json({ message: 'Producto actualizado', producto: memoriaProductos[index] });
  } catch (error) {
    return next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const existe = memoriaProductos.some(p => p._id === req.params.id);
    if (!existe) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    memoriaProductos = memoriaProductos.filter(p => p._id !== req.params.id);
    return res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    return next(error);
  }
};
