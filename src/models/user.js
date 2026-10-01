import { DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';

export const User = sequelize.define('users', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  email: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },
  profileImage: { type: DataTypes.STRING, allowNull: true, validate: { isUrl: true } },
  website: { type: DataTypes.STRING, allowNull: true, validate: { isUrl: true } },
  bio: { type: DataTypes.STRING(280), allowNull: true },
  followersCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, { timestamps: true });
