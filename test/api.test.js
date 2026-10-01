import { test, before, after } from 'node:test';
import assert from 'node:assert';

process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.NODE_ENV = 'test';

let server, base, sequelize;
const call = async (method, path, body) => {
  const r = await fetch(base + path, {
    method, headers: { 'content-type': 'application/json' }, body: body && JSON.stringify(body),
  });
  const text = await r.text();
  return { status: r.status, body: text ? JSON.parse(text) : null };
};

before(async () => {
  ({ sequelize } = await import('../src/database/database.js'));
  await import('../src/models/user.js');
  await import('../src/models/tweet.js');
  await import('../src/models/follower.js');
  await import('../src/models/product.js');
  const { setupRelations } = await import('../src/models/relations.js');
  const { loadInitialData } = await import('../src/database/init-data.js');
  const { default: app } = await import('../src/app.js');
  setupRelations();
  await sequelize.sync({ force: true });
  await loadInitialData();
  server = app.listen(0);
  base = `http://localhost:${server.address().port}`;
});
after(async () => { server.close(); await sequelize.close(); });

const newUser = (n) => ({ username: `u${n}`, email: `u${n}@test.com`, password: '123', name: `User ${n}` });

test('seed con Faker carga usuarios, tweets, seguidores y reseñas', async () => {
  assert.equal((await call('GET', '/users')).body.length, 8);
  assert.ok((await call('GET', '/tweets')).body.length >= 30);
  assert.ok((await call('GET', '/products')).body.length === 10);
  assert.ok((await call('GET', '/reviews')).body.length === 30);
  assert.ok((await call('GET', '/users/1/following')).body.length >= 0);
});

test('CRUD de usuarios (sin exponer password)', async () => {
  const c = await call('POST', '/users', newUser(100));
  assert.equal(c.status, 201);
  assert.equal(c.body.password, undefined);
  assert.equal((await call('GET', `/users/${c.body.id}`)).body.username, 'u100');
  assert.equal((await call('PUT', `/users/${c.body.id}`, { name: 'Nuevo' })).body.name, 'Nuevo');
  assert.equal((await call('POST', '/users', newUser(100))).status, 400); // unique
  assert.equal((await call('DELETE', `/users/${c.body.id}`)).status, 204);
  assert.equal((await call('GET', `/users/${c.body.id}`)).status, 404);
});

test('1-M: tweets con su autor y borrado en cascada de usuario', async () => {
  const u = (await call('POST', '/users', newUser(200))).body;
  const t = await call('POST', '/tweets', { content: 'Hola', userId: u.id });
  assert.equal(t.status, 201);
  assert.equal(t.body.user.id, u.id);
  assert.equal(t.body.likes, 0);
  assert.equal((await call('GET', `/users/${u.id}/tweets`)).body.length, 1);
  await call('DELETE', `/users/${u.id}`);
  assert.equal((await call('GET', `/tweets/${t.body.id}`)).status, 404);
});

test('1-M autoreferencial: respuestas y cascada', async () => {
  const u = (await call('POST', '/users', newUser(300))).body;
  const parent = (await call('POST', '/tweets', { content: 'Padre', userId: u.id })).body;
  const reply = (await call('POST', '/tweets', { content: 'Hija', userId: u.id, parentTweetId: parent.id })).body;
  assert.equal(reply.parentTweetId, parent.id);
  assert.equal((await call('GET', `/tweets/${parent.id}`)).body.commentsCount, 1);
  assert.equal((await call('GET', `/tweets/${parent.id}/replies`)).body.length, 1);
  assert.equal((await call('PUT', `/tweets/${parent.id}`, { content: 'Editado' })).body.content, 'Editado');
  assert.equal((await call('DELETE', `/tweets/${parent.id}`)).status, 204);
  assert.equal((await call('GET', `/tweets/${reply.id}`)).status, 404);
});

test('M-M autoreferencial: seguidores', async () => {
  const a = (await call('POST', '/users', newUser(400))).body;
  const b = (await call('POST', '/users', newUser(401))).body;
  assert.equal((await call('POST', `/users/${a.id}/follow/${b.id}`)).status, 201);
  assert.equal((await call('GET', `/users/${a.id}/following`)).body[0].id, b.id);
  assert.equal((await call('GET', `/users/${b.id}/followers`)).body[0].id, a.id);
  assert.equal((await call('GET', `/users/${b.id}`)).body.followersCount, 1);
  assert.equal((await call('POST', `/users/${a.id}/follow/${a.id}`)).status, 400);
  assert.equal((await call('DELETE', `/users/${a.id}/follow/${b.id}`)).status, 204);
  assert.equal((await call('GET', `/users/${b.id}/followers`)).body.length, 0);
});

test('errores', async () => {
  assert.equal((await call('GET', '/users/9999')).status, 404);
  assert.equal((await call('GET', '/users/abc')).status, 400);
  assert.equal((await call('POST', '/users', { ...newUser(500), email: 'malo' })).status, 400);
  assert.equal((await call('POST', '/tweets', { content: 'x', userId: 9999 })).status, 404);
  assert.equal((await call('POST', '/tweets', { content: 'x', userId: 1, parentTweetId: 9999 })).status, 404);
  assert.equal((await call('POST', '/tweets', { userId: 1 })).status, 400);
  assert.equal((await call('PUT', '/tweets/9999', { content: 'x' })).status, 404);
  assert.equal((await call('DELETE', '/tweets/9999')).status, 404);
  assert.equal((await call('POST', '/reviews', { userId: 9999, productId: 1, rating: 3, title: 't', body: 'b' })).status, 400);
  assert.equal((await call('POST', '/reviews', { userId: 1, productId: 1, rating: 9, title: 't', body: 'b' })).status, 400);
});
