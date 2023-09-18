import Fastify from 'fastify';
import Realm from 'realm';

export const chat_datumSchema = {
  name: 'chat_datum',
  properties: {
    _id: 'objectId',
    msg: 'string',
    msgRead: 'bool',
    msgSent: 'bool',
    timeSent: 'date',
    user: 'user_datum',
  },
  primaryKey: '_id',
};

export const user_datumSchema = {
  name: 'user_datum',
  properties: {
    _id: 'objectId',
    lastOnline: 'date',
    online: 'bool',
    username: 'uuid',
  },
  primaryKey: '_id',
};

const fastify = Fastify({
  logger: true,
});

fastify.get('/', async function handler(request, reply) {
  return { hello: 'world' };
});

fastify.get('/hello', async function handler(request, reply) {
  const app = new Realm.App({ id: 'cchat-gqksm' });
  const credentials = Realm.Credentials.anonymous();
  try {
    const user = await app.logIn(credentials);
    // save a chat message
    const chat_datum = {
      _id: new Realm.BSON.ObjectId(),
      msg: 'Hello, world!',
      msgRead: false,
      msgSent: true,
      timeSent: new Date(),
      user: user,
    };
    // use flexible sync log
    const config = {
      schema: [chat_datumSchema, user_datumSchema],
      sync: {
        user: user,
        partitionValue: 'flexible',
      },
    };
    const realm = await Realm.open(config);
    realm.write(() => {
      realm.create('chat_datum', chat_datum);
    });
    await realm.syncSession.uploadAllLocalChanges();
    return { data: user };
  } catch (err) {
    console.error('Failed to log in', err);
  }
});

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
