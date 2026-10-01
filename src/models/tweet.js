import { DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';
import { User } from './user.js';

export const Tweet = sequelize.define('tweets', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  imageUrl: { type: DataTypes.STRING, allowNull: true },
  content: { type: DataTypes.STRING(280), allowNull: false, validate: { notEmpty: true } },
  likes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  retweets: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  commentsCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  // FK 1-M User -> Tweet
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
  // FK 1-M autoreferencial: null = tweet original, si no, es respuesta de otro tweet
  parentTweetId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'tweets', key: 'id' } },
}, { timestamps: true });
