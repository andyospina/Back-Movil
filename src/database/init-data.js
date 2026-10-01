import { faker } from '@faker-js/faker';
import { User } from '../models/user.js';
import { Tweet } from '../models/tweet.js';
import { Follower } from '../models/follower.js';
import { Product, Review } from '../models/product.js';

const CATEGORIES = ['Electrónica', 'Hogar', 'Deportes', 'Libros', 'Moda'];
const pick = (arr) => faker.helpers.arrayElement(arr);
const text = () => faker.lorem.sentence().slice(0, 280);

// Cada loader solo inserta si la tabla está vacía (evita duplicados)
export async function loadInitialUsers() {
  try {
    if ((await User.count()) > 0) return console.log('Ya hay usuarios en la base de datos');
    faker.seed(8);
    await User.bulkCreate(Array.from({ length: 8 }, (_, i) => ({
      username: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      password: faker.internet.password(),
      name: faker.person.fullName(),
      profileImage: faker.image.avatar(),
      website: `https://example.com/user${i + 1}`,
      bio: faker.lorem.sentence().slice(0, 280),
    })));
    console.log('Usuarios iniciales cargados');
  } catch (e) { console.error('Error cargando usuarios:', e.message); }
}

export async function loadInitialTweets() {
  try {
    if ((await Tweet.count()) > 0) return console.log('Ya hay tweets en la base de datos');
    const users = await User.findAll();
    const roots = await Tweet.bulkCreate(Array.from({ length: 12 }, () => ({
      content: text(),
      userId: pick(users).id,
      likes: faker.number.int({ min: 0, max: 100 }),
      retweets: faker.number.int({ min: 0, max: 30 }),
      imageUrl: faker.datatype.boolean() ? faker.image.url() : null,
    })));
    // respuestas de tweets originales y respuestas de respuestas
    const replies = await Tweet.bulkCreate(Array.from({ length: 15 }, () => ({
      content: text(), userId: pick(users).id, parentTweetId: pick(roots).id,
    })));
    await Tweet.bulkCreate(Array.from({ length: 6 }, () => ({
      content: text(), userId: pick(users).id, parentTweetId: pick(replies).id,
    })));
    console.log('Tweets iniciales cargados');
  } catch (e) { console.error('Error cargando tweets:', e.message); }
}

export async function loadInitialFollowers() {
  try {
    if ((await Follower.count()) > 0) return console.log('Ya hay seguidores en la base de datos');
    const users = await User.findAll();
    const pairs = new Set();
    while (pairs.size < 16) {
      const a = pick(users).id; const b = pick(users).id;
      if (a !== b) pairs.add(`${a}-${b}`);
    }
    await Follower.bulkCreate([...pairs].map((p) => {
      const [followerId, followingId] = p.split('-').map(Number);
      return { followerId, followingId };
    }));
    console.log('Seguidores iniciales cargados');
  } catch (e) { console.error('Error cargando seguidores:', e.message); }
}

export async function loadInitialProductsAndReviews() {
  try {
    if ((await Product.count()) > 0) return console.log('Ya hay productos en la base de datos');
    const users = await User.findAll();
    const products = await Product.bulkCreate(Array.from({ length: 10 }, () => ({
      name: faker.commerce.productName(),
      category: pick(CATEGORIES),
      rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
    })));
    await Review.bulkCreate(Array.from({ length: 30 }, () => ({
      userId: pick(users).id,
      productId: pick(products).id,
      rating: faker.number.int({ min: 1, max: 5 }),
      title: faker.lorem.sentence({ min: 3, max: 6 }),
      body: faker.lorem.paragraph(),
      recommended: faker.datatype.boolean(),
    })));
    console.log('Productos y reseñas iniciales cargados');
  } catch (e) { console.error('Error cargando productos/reseñas:', e.message); }
}

// Orden importa: usuarios y productos antes que lo que los referencia
export async function loadInitialData() {
  await loadInitialUsers();
  await loadInitialTweets();
  await loadInitialFollowers();
  await loadInitialProductsAndReviews();
}
