const store = require('../data/store');
const { Client } = require('../models/Client');

const clientsController = {
  getAll(req, res) {
    res.json(store.clients);
  },

  getById(req, res) {
    const id = Number(req.params.id);
    const client = store.clients.find(item => item.id === id);

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    return res.json(client);
  },

  create(req, res) {
    const { name, email } = req.body;
    const id = store.nextIds.clients++;
    const client = new Client({ id, name, email });

    store.clients.push(client);
    return res.status(201).json(client);
  },

  update(req, res) {
    const id = Number(req.params.id);
    const client = store.clients.find(item => item.id === id);

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const { name, email } = req.body;
    if (name !== undefined) client.name = name;
    if (email !== undefined) client.email = email;

    return res.json(client);
  },

  remove(req, res) {
    const id = Number(req.params.id);
    const index = store.clients.findIndex(item => item.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    store.clients.splice(index, 1);
    return res.status(204).end();
  }
};

module.exports = clientsController;
