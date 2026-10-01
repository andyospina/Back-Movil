import { DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';
import { User } from './user.js';

// Tabla intermedia M-M autoreferencial: un usuario sigue y es seguido por muchos
export const Follower = sequelize.define('follower', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  followerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
  followingId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
}, { timestamps: true });
