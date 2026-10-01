import express from 'express';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';
import tweetRoutes from './routes/tweets.js';
import catalogRoutes from './routes/catalog.routes.js';

const app = express();

if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'API de ReviewLab funcionando' }));
app.use(userRoutes);
app.use(tweetRoutes);
app.use(catalogRoutes);

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'JSON inválido' });
  console.error(err);
  res.status(500).json({ message: 'Error interno' });
});

export default app;
