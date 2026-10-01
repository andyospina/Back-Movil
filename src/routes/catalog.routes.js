import { Router } from 'express';
import { products, reviews } from '../controllers/catalog.controller.js';

const router = Router();

const resource = (path, c) => {
  router.get(path, c.list);
  router.get(`${path}/:id`, c.get);
  router.post(path, c.create);
  router.put(`${path}/:id`, c.update);
  router.delete(`${path}/:id`, c.remove);
};

resource('/products', products);
resource('/reviews', reviews);

export default router;
