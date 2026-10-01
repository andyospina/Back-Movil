import { User } from './user.js';
import { Tweet } from './tweet.js';
import { Follower } from './follower.js';
import { Product, Review } from './product.js';

export function setupRelations() {
  // 1-M: User -> Tweet
  User.hasMany(Tweet, { foreignKey: 'userId', as: 'tweets', onDelete: 'CASCADE', hooks: true });
  Tweet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // 1-M autoreferencial: Tweet -> respuestas
  Tweet.hasMany(Tweet, { foreignKey: 'parentTweetId', as: 'replies', onDelete: 'CASCADE', hooks: true });
  Tweet.belongsTo(Tweet, { foreignKey: 'parentTweetId', as: 'parentTweet' });

  // M-M autoreferencial: User <-> User mediante Follower
  User.belongsToMany(User, {
    through: Follower, as: 'following', foreignKey: 'followerId', otherKey: 'followingId',
  });
  User.belongsToMany(User, {
    through: Follower, as: 'followers', foreignKey: 'followingId', otherKey: 'followerId',
  });

  // 1-M: User -> Review y Product -> Review
  User.hasMany(Review, { foreignKey: 'userId', as: 'reviews', onDelete: 'CASCADE', hooks: true });
  Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews', onDelete: 'CASCADE', hooks: true });
  Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
}
