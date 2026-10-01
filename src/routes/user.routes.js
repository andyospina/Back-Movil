import { Router } from 'express';
import {
  getUsers, getUserById, createUser, updateUser, deleteUser,
  getFollowers, getFollowing, followUser, unfollowUser,
} from '../controllers/users.controller.js';
import { getUserTweets } from '../controllers/tweets.controller.js';

const router = Router();

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/users/:id/tweets', getUserTweets);
router.get('/users/:id/followers', getFollowers);
router.get('/users/:id/following', getFollowing);
router.post('/users/:id/follow/:targetId', followUser);
router.delete('/users/:id/follow/:targetId', unfollowUser);

export default router;
