import 'dotenv/config';
import { Sequelize } from 'sequelize';

const dialect = process.env.DB_DIALECT || 'postgres';

export const sequelize = dialect === 'sqlite'
  ? new Sequelize({ dialect, storage: process.env.DB_STORAGE || ':memory:', logging: false })
  : new Sequelize(
      process.env.DB_NAME || 'reviewlab',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'password',
      {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        dialect,
        logging: false,
      }
    );
