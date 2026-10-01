import { DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';
import { User } from './user.js';

// Entidades existentes de ReviewLab (ver docs/diagrama-entidad-relacion.md)
export const Product = sequelize.define('products', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
  category: { type: DataTypes.STRING, allowNull: false },
  rating: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
}, { timestamps: true });

export const Review = sequelize.define('reviews', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  title: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
  body: { type: DataTypes.TEXT, allowNull: false },
  recommended: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
  productId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Product, key: 'id' } },
}, { timestamps: true });
