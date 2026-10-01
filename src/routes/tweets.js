import { Router } from 'express';
import {
  getTweets, getTweetById, createTweet, updateTweet, deleteTweet, getReplies,
} from '../controllers/tweets.controller.js';

const router = Router();

router.get('/tweets', getTweets);
router.get('/tweets/:id', getTweetById);
router.get('/tweets/:id/replies', getReplies);
router.post('/tweets', createTweet);
router.put('/tweets/:id', updateTweet);
router.delete('/tweets/:id', deleteTweet);

export default router;
