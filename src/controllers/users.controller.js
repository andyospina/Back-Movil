import { User } from '../models/user.js';
import { Follower } from '../models/follower.js';
import { handleError, parseId } from './errors.js';

const PUBLIC = { attributes: { exclude: ['password'] } };
const SUMMARY = ['id', 'username', 'name', 'profileImage'];

const CREATE_FIELDS = ['username', 'email', 'password', 'name', 'profileImage', 'website', 'bio'];
const pick = (body, fields) => Object.fromEntries(fields.filter((f) => body?.[f] !== undefined).map((f) => [f, body[f]]));

export const getUsers = async (req, res) => {
  try {
    res.json(await User.findAll({ ...PUBLIC, order: [['id', 'ASC']] }));
  } catch (error) { handleError(res, error); }
};

export const getUserById = async (req, res) => {
  try {
    const id = parseId(req, res); if (!id) return;
    const user = await User.findByPk(id, PUBLIC);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) { handleError(res, error); }
};

export const createUser = async (req, res) => {
  try {
    const user = await User.create(pick(req.body, CREATE_FIELDS));
    const { password, ...safe } = user.toJSON();
    res.status(201).json(safe);
  } catch (error) { handleError(res, error); }
};

export const updateUser = async (req, res) => {
  try {
    const id = parseId(req, res); if (!id) return;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    await user.update(pick(req.body, CREATE_FIELDS));
    res.json(await User.findByPk(id, PUBLIC));
  } catch (error) { handleError(res, error); }
};

export const deleteUser = async (req, res) => {
  try {
    const id = parseId(req, res); if (!id) return;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    await user.destroy();
    res.sendStatus(204);
  } catch (error) { handleError(res, error); }
};

// M-M autoreferencial
export const getFollowers = async (req, res) => {
  try {
    const id = parseId(req, res); if (!id) return;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(await user.getFollowers({ attributes: SUMMARY, joinTableAttributes: [] }));
  } catch (error) { handleError(res, error); }
};

export const getFollowing = async (req, res) => {
  try {
    const id = parseId(req, res); if (!id) return;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(await user.getFollowing({ attributes: SUMMARY, joinTableAttributes: [] }));
  } catch (error) { handleError(res, error); }
};

export const followUser = async (req, res) => {
  try {
    const id = parseId(req, res); if (!id) return;
    const targetId = parseId(req, res, 'targetId'); if (!targetId) return;
    if (id === targetId) return res.status(400).json({ message: 'Un usuario no puede seguirse a sí mismo' });
    const [user, target] = await Promise.all([User.findByPk(id), User.findByPk(targetId)]);
    if (!user || !target) return res.status(404).json({ message: 'Usuario no encontrado' });
    const [, created] = await Follower.findOrCreate({ where: { followerId: id, followingId: targetId } });
    if (created) await target.increment('followersCount');
    res.status(created ? 201 : 200).json(await user.getFollowing({ attributes: SUMMARY, joinTableAttributes: [] }));
  } catch (error) { handleError(res, error); }
};

export const unfollowUser = async (req, res) => {
  try {
    const id = parseId(req, res); if (!id) return;
    const targetId = parseId(req, res, 'targetId'); if (!targetId) return;
    const removed = await Follower.destroy({ where: { followerId: id, followingId: targetId } });
    if (!removed) return res.status(404).json({ message: 'No seguías a este usuario' });
    await User.decrement('followersCount', { where: { id: targetId } });
    res.sendStatus(204);
  } catch (error) { handleError(res, error); }
};
