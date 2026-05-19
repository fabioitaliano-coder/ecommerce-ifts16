// Client es el modelo Sequelize asociado a la tabla clients.
const { Client } = require('../models');

const clientsController = {
  async getAll(req, res) {
    // req es la petición entrante; res es la respuesta saliente.
    const clients = await Client.findAll({ order: [['id', 'ASC']] });
    return res.json(clients);
  },

  async getById(req, res) {
    // req.params.id viene de la ruta GET /api/clientes/:id.
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    return res.json(client);
  },

  async create(req, res) {
    // req.body trae name y email enviados como JSON por el cliente HTTP.
    const { name, email } = req.body;
    const client = await Client.create({ name, email });
    return res.status(201).json(client);
  },

  async update(req, res) {
    // req.params.id identifica el registro.
    // req.body trae los campos a modificar.
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const { name, email } = req.body;
    if (name !== undefined) client.name = name;
    if (email !== undefined) client.email = email;

    await client.save();
    return res.json(client);
  },

  async remove(req, res) {
    // req.params.id indica qué cliente eliminar.
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    await client.destroy();
    return res.status(204).end();
  }
};

// module.exports devuelve el objeto clientsController.
// El router lo importa para registrar sus métodos como handlers.
module.exports = clientsController;
