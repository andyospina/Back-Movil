import { Tweet } from '../models/tweet.js';
import { User } from '../models/user.js';
import { handleError, parseId } from './errors.js';

// Se incluye solo la info del autor que necesita el front, no todo el objeto
const withUser = { model: User, as: 'user', attributes: ['id', 'username', 'name', 'profileImage'] };

const FIELDS = ['content', 'imageUrl', 'likes', 'retweets', 'commentsCount', 'userId', 'parentTweetId'];
const pick = (body, fields) => Object.fromEntries(fields.filter((f) => body?.[f] !== undefined).map((f) => [f, body[f]]));

export const getTweets = async (req, res) => {
  try {
    res.json(await Tweet.findAll({ include: [withUser], order: [['id', 'ASC']] }));
  } catch (error) { handleError(res, error); }
};

export const getTweetById = async (req, res) => {
  try {
    const id = parseId(req, res); if (!id) return;
    const tweet = await Tweet.findByPk(id, { include: [withUser] });
    if (!tweet) return res.status(404).json({ message: 'Tweet no encontrado' });
    res.json(tweet);
  } catch (error) { handleError(res, error); }
};

export const createTweet = async (req, res) => {
  try {
    const data = pick(req.body, FIELDS);
    if (!data.content || data.userId == null) {
      return res.status(400).json({ message: 'content y userId son obligatorios' });
    }
    if (!(await User.findByPk(data.userId))) {
      return res.status(404).json({ message: 'Usuario autor no encontrado' });
    }
    if (data.parentTweetId != null) {
      const parent = await Tweet.findByPk(data.parentTweetId);
      if (!parent) return res.status(404).json({ message: 'Tweet padre (parentTweetId) no encontrado' });
      await parent.increment('commentsCount');
    }
    const tweet = await Tweet.create(data);
    res.status(201).json(await Tweet.findByPk(tweet.id, { include: [withUser] }));
  } catch (error) { handleError(res, error); }
};

export const updateTweet = async (req, res) => {
  try {
    const id = parseId(req, res); if (!id) return;
    const tweet = await Tweet.findByPk(id);
    if (!tweet) return res.status(404).json({ message: 'Tweet no encontrado' });
    // el autor y el padre no se pueden cambiar
    await tweet.update(pick(req.body, ['content', 'imageUrl', 'likes', 'retweets']));
    res.json(await Tweet.findByPk(id, { include: [withUser] }));
  } catch (error) { handleError(res, error); }
};

export const deleteTweet = async (req, res) => {
  try {
    const id = parseId(req, res); if (!id) return;
    const tweet = await Tweet.findByPk(id);
    if (!tweet) return res.status(404).json({ message: 'Tweet no encontrado' });
    await tweet.destroy(); // las respuestas se eliminan en cascada
    res.sendStatus(204);
  } catch (error) { handleError(res, error); }
};

export const getReplies = async (req, res) => {
  try {
    const id = parseId(req, res); if (!id) return;
    if (!(await Tweet.findByPk(id))) return res.status(404).json({ message: 'Tweet no encontrado' });
    res.json(await Tweet.findAll({
      where: { parentTweetId: id }, include: [withUser], order: [['createdAt', 'DESC'], ['id', 'DESC']],
    }));
  } catch (error) { handleError(res, error); }
};

export const getUserTweets = async (req, res) => {
  try {
    const id = parseId(req, res); if (!id) return;
    if (!(await User.findByPk(id))) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(await Tweet.findAll({ where: { userId: id }, include: [withUser], order: [['id', 'ASC']] }));
  } catch (error) { handleError(res, error); }
};
