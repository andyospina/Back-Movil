import app from './app.js';
import { sequelize } from './database/database.js';
// Importar los modelos es lo que le dice a Sequelize que debe crear sus tablas
import './models/user.js';
import './models/tweet.js';
import './models/follower.js';
import './models/product.js';
import { setupRelations } from './models/relations.js';
import { loadInitialData } from './database/init-data.js';

const PORT = process.env.PORT || 3000;

async function init() {
  try {
    await sequelize.authenticate();
    await sequelize.query('SELECT 1');
    console.log('Conexión a la base de datos establecida');

    // Orden: relaciones -> tablas -> datos
    setupRelations();
    // force: true recrea las tablas en cada arranque (solo desarrollo). DB_FORCE_SYNC=false lo desactiva.
    await sequelize.sync({ force: process.env.DB_FORCE_SYNC !== 'false' });
    await loadInitialData();

    app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

init();
