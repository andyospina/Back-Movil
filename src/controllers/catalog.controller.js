import { Product, Review } from '../models/product.js';
import { User } from '../models/user.js';
import { handleError, parseId } from './errors.js';

const pick = (body, fields) => Object.fromEntries(fields.filter((f) => body?.[f] !== undefined).map((f) => [f, body[f]]));

// Genera list/get/create/update/remove para Product y Review
function crud(Model, { label, fields, include = [] }) {
  const notFound = (res) => res.status(404).json({ message: `${label} no encontrado` });
  return {
    list: async (req, res) => {
      try { res.json(await Model.findAll({ include, order: [['id', 'ASC']] })); } catch (e) { handleError(res, e); }
    },
    get: async (req, res) => {
      try {
        const id = parseId(req, res); if (!id) return;
        const row = await Model.findByPk(id, { include });
        row ? res.json(row) : notFound(res);
      } catch (e) { handleError(res, e); }
    },
    create: async (req, res) => {
      try {
        const row = await Model.create(pick(req.body, fields));
        res.status(201).json(await Model.findByPk(row.id, { include }));
      } catch (e) { handleError(res, e); }
    },
    update: async (req, res) => {
      try {
        const id = parseId(req, res); if (!id) return;
        const row = await Model.findByPk(id);
        if (!row) return notFound(res);
        await row.update(pick(req.body, fields));
        res.json(await Model.findByPk(id, { include }));
      } catch (e) { handleError(res, e); }
    },
    remove: async (req, res) => {
      try {
        const id = parseId(req, res); if (!id) return;
        const row = await Model.findByPk(id);
        if (!row) return notFound(res);
        await row.destroy();
        res.sendStatus(204);
      } catch (e) { handleError(res, e); }
    },
  };
}

export const products = crud(Product, {
  label: 'Producto',
  fields: ['name', 'category', 'rating'],
  include: [{ model: Review, as: 'reviews' }],
});

export const reviews = crud(Review, {
  label: 'Reseña',
  fields: ['rating', 'title', 'body', 'recommended', 'userId', 'productId'],
  include: [
    { model: User, as: 'user', attributes: ['id', 'username', 'name'] },
    { model: Product, as: 'product', attributes: ['id', 'name'] },
  ],
});
